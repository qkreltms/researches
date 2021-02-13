# axios와 nock을 같이 사용할 때 발생할 수 있는 에러
전송하는 데이터가 FormData일 때 발생하는 에러 `Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream`를 다뤄보겠습니다.
## 문제 인식🤥
아래의 코드를 테스트 하고 있을 때였습니다.
```ts
function App() {
  const [message, setMessage] = useState('')
  const getSomething = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    const data = new FormData()
    data.append('test', files[0])
    const res = await axios.post('http://localhost:3333', data).then(({data}) => data)
    setMessage(res.message)
    
  }
  return (
    <div className="App">
      <header className="App-header">
      <input
        type="file"
        onChange={getSomething}
        data-testid="uploadButton"
      />
      <p>{message}</p>
      </header>
    </div>
  );
}
```
단순히 input에서 받을 값을 FormData에 데이터를 넣어서 body에 넣어주는 코드입니다.

그리고 아래와 같이 테스트 코드를 작성했습니다.
```ts
test('should shows text', async () => {
  nock(`http://localhost:3333`)
  .post('/')
  .reply(200, { message: 'test', status: 200 })
  
  render(<App />);
  
  // input에 값을 넣어준다.
  fireEvent.change(screen.getByTestId('uploadButton'), {
    target: { files: [{ name: 'test.nii' }] },
  })

  await waitFor(() => expect(screen.getByText('test')).toBeDefined()) 
});
```
테스트를 실행시켰더니 에러가 발생했습니다.

`'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream'`

## 문제 도출👀

`nock`이 `http.createServer()`을 통해 mocking 합니다. 

그러므로 `nock`에서 `axios`를 mocking 하기위해 아래의 라인을 추가해주었습니다.
```js
axios.defaults.adapter = require('axios/lib/adapters/http')
```


그 결과 `axios`에서 http adpater를 쓰기를 강제되고 그 안의 코드에서 에러가 발생한 것입니다.

```js
 if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    //...
    req.end(data);
```

## 원인🎯
http adapter의 마지막 줄의 `req.end(data);`를 보니 node의 http 라이브러리를 사용중입니다.

왜 위와 같이 예외처리를 했는지 찾아보니 `end(data)` 함수가 data 타입으로 `string | Buffer`만 지원합니다. [참고](https://nodejs.org/api/http.html#http_request_end_data_encoding_callback)


## 해결✔
`nock`이 http를 mocking하므로 이 경우에는 사용할 수 없다는 판단이 들었습니다.

그러므로 xhr을 mocking할 수 있는 `axios-mock-dapter`를 사용했습니다.
```ts
axios.defaults.adapter = require('axios/lib/adapters/xhr')

mock.onPost("http://localhost:3333/").reply(function (config) {
  return { message: 'test' }
});

```
추가적으로 이 문제를 격는 사람들의 시간 소비를 줄이고자 `axios` PR을 올렸습니다. 

병합이 됐으면 좋겠네요~😊 [링크](https://github.com/axios/axios/pull/3619)

## 참고💎
위 이슈의 구현물은 [여기](https://github.com/qkreltms/axios-with-http-adapter)에서 보실 수 있습니다.
