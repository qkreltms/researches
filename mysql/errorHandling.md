# mysqljs 에러 핸들링하기 (부제: async function에서 throw 사용하기)

이전 프로젝트에서는 에러를 다룰 때 이런식으로 다뤘었다.
```js
if (err1) return res.status(500).json({ status: 'error1', messgae: err1))
if (err2) return res.status(500).json({ status: 'error2', messgae: err2))
//...
```
     
이번 프로젝트에서는 에러를 throw해서 에러처리를 한 곳에서 처리하고 싶다는 생각이 들었다.
```js
function test() {
    if (err) throw
}
try {
    test()
} catch (err) {
    console.log(err)
}
```
위의 방식을 사용해 처음에 작성한 코드는 아래의 코드였다.
문제는 아래의 코드가 문제없이 작동할 것이라 예상했지만...
```js
api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file
    const type = req.body.type

    const hasherCallback = (err, pass, salt, hash) => {
      if (err) throw err

      const sql = `INSERT INTO users SET ?`
      const fields = { nickname, email, 'password': hash, salt, thumbnail, type }
      const queryCallback = (err) => {
        if (err) throw err

        return res.json(messages.SUCCESS_MSG)
      }

      conn.query(sql, fields, queryCallback)
    }
    try {
        return hasher({ password }, hasherCallback)
    } catch (err) {
      //handle errors here
      console.log(err)
    }
  })

  return api
}
```
내가 예상한대로 콘솔창에 뜨지 않아서 당황스러웠다.
처음에는 callback 함수 안에서는 ```throw err``` 가 작동하지 않나? 라는 생각으로 테스트를 해봤다.
```js
function test(callback) {
    callback()
}
  
try {
  test(() => {
      throw "error"
    });
}
catch(e) {
  console.log(e);
  // expected output: "error"
}
```
throw 한 값이 콘솔에 출력된다.<br/> 도대체 뭐가 문제일까?<br/><br/>
한참을 찾아보다가 결국 다음 날에 찾아보기로 결심했는데,<br/>
집에서 휴식을 취하다가 갑자기 끝내지 못한 코드가 너무 신경쓰여서 노트북을 다시 켰다.<br/>
관련 주제를 구글링 해보다가 결국 해결방법을 찾아냈다!

원인은 async 함수 때문이었다. node용 mysql은 비동기로 작동한다고 한다!

```js
api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file
    const type = req.body.type

    const runQuery = (handleErrCallback) => {
      const hasherCallback = (err, pass, salt, hash) => {
        if (err) return handleErrCallback(err)

        const sql = `INSERT INTO users SET ?`
        const fields = { nickname, email, 'password': hash, salt, thumbnail, type }
        const queryCallback = (err) => {
          if (err) return handleErrCallback(err)

          return res.json(messages.SUCCESS_MSG)
        }
        conn.query(sql, fields, queryCallback)
      }

      return hasher({ password }, hasherCallback)
    }

    return runQuery((err) => {
      if (err.code === 'ER_DUP_ENTRY') {
        //This one equals console.log({ status: 'error' message: err })
        return res.status(409).json(messages.ERROR(err))
      }
      //This one equals console.log({ status: 'error' message: err })
      return res.status(500).json(messages.ERROR(err))
    })
  })
```
원하는 목표는 달생했지만, 보다시피 코드가 callback으로 뒤덮혀있어 이해하기 힘들다는 단점이 있다.<br/>
promise도 만만치 않게 지저분하다고 생각해서 async/await을 사용하고 싶은데,<br/>
찾아본 결과 mysql2 라이브러리를 활용하면 된다고 한다.

이해하기 쉬운 코드를 작성하기 위해서 오히려 더 배우고 이해해야 하는게 파라독스인것 같다.

최종적으로 mysql2까지 적용한 코드는 이렇다.
```js
const errHandler = require('../errorHandler')

api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file
    const type = req.body.type

    const runQuery = (errHandlerCallback) => {
      const hasherCallback = async (err, pass, salt, hash) => {
        if (err) return errHandlerCallback(err)

        const sql = `INSERT INTO users SET ?`
        const fields = { nickname, email, 'password': hash, salt, thumbnail, type }

        try {
          await conn.query(sql, fields)
          return res.json(messages.SUCCESS_MSG)
        } catch (err) {
          return errHandlerCallback(err)
        }
      }

      return hasher({ password }, hasherCallback)
    }

    return runQuery(errHandler(res, messages))
  })
  
  //errorHandler.js
  module.exports = (res, messages) => {
  return (err) => {
    console.info('@@ERROR CODE@@:', err.code)
    switch (err.code) {
      case 'ER_DUP_ENTRY': {
        return res.status(409).json(messages.ERROR(err))
      }
      default: {
        return res.status(500).json(messages.ERROR(err))
      }
    }
  }
}

  ```
  아직도 예외를 처리하려고 감싸고있는 코드가 마음에 안들지만 이제는 빨리 플젝 완성시키고 싶다는 마음이 앞선다...

