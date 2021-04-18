# Currying 이란?

## 개요
> 수학과 컴퓨터 과학에서 커링이란 다중 인수를 갖는 함수를 단일 인수를 갖는 함수들의 함수열로 바꾸는 것을 말한다. [참고](https://ko.wikipedia.org/wiki/%EC%BB%A4%EB%A7%81)

```js
// 다중 인수를 갖는 함수
const sum = (a, b) => {
  return a+b
}
sum(10,20) // 30

// 커링, 다중 인수를 갖는 함수를 단일 인수를 갖는 함수들의 함수열로 바꿈
const sum = (a) => (b) => { 
  return a+b
}
sum(10)(20) // 30
```

**예제**

```js
//Currying 적용되지 않음
const sum = (a, b) => {
  return a + b
}

const A = [1, 1, 1, 1]
const result = []

result = A.map((n)=>sum(n, 5)) //A를 순회하며 전달된 인자(n)에 5를 더한다.
console.log(result) //[6, 6, 6, 6]
//Currying 적용 됨, sum을 호출하면 b의 인자를 취하는 함수를 반환한다.
const sum = (a) => (b) => { 
  return a+b
}
/*
function sum(a) {
  return function(b) {
    return a+b
  }
}
*/
const A = [1, 1, 1, 1]
const result = []

result = A.map(sum(5))//A를 순회하면 map에서 sum의 반환 함수에 1를 넣어 호출 한다.
console.log(result) //[6, 6, 6, 6]
```
