# Currying and ES6 Arrow Functions

참고: http://codekirei.com/posts/currying-with-arrow-functions/

## 형태

    const sum = (a:number) => (b:number) => { 
      return a+b
    }
## 개요

Currying 이란 여러 인자를 일련의 하나의 인자를 갖은 함수들을 통하여 거치게하는 함수를 말한다. [출처: 위키백과] 
이전에 오픈소스코드를 살펴보다가 발견했을 때 뭔지 모르고 넘어갔는데 정리해본다. 

## 예제

    //Currying 적용되지 않음
    const sum = (a: number, b: number) => {
      return a + b
    }
    
    const a:number[] = [1, 1, 1, 1]
    const result: number[]
    const by:number == 5
    
    result = a.map((number)=>sum(number, 5))
    console.log(result) // 결과 = [6, 6, 6, 6]

**설명**
1. a 배열을 map을 통해 도는데, 전달된 각 인자(number)에 5를 더하고 그 결과를 출력한다.

이제 Currying을 적용해보자.

    //Currying 적용 됨
    const sum = (a:number) => (b:number) => { 
      return a+b
    }
    
    const a:number[] = [1, 1, 1, 1]
    const result: number[]
    const by:number == 5
    
    result = a.map(sum(by))
    console.log(result) // 결과 = [6, 6, 6, 6]
**설명**

  1. a 배열을 map을 통해 도는데, 각각의 요소를 전달받을 때 sum함수를 호출한다.
  2. sum함수를 호출하면 먼저 by를 전달 받는다. 왜냐면 `sum = (a:number) => ...` 에서 a를 먼저 인자로 받고, ```(b: number) => {return a+b}```을 반환한다. 그러므로 이전과 다르게 a,b 서로 값이 바뀐다. 
  3. 그 다음으로 sum함수에서 콜백함수`(b:number) => {...}`를 반환한다.   이 때에 a 배열의 요소 값(1)이 함수의 인자로 전달된다.

이것이 전부입니다. 해피코딩!
