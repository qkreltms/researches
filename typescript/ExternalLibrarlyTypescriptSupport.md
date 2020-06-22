# 외부 패키지 타입스크립트 지원하기

현재 타입스크립트 + 리엑트 환경에서 우아한 레이아웃 구조를 고민하다가 ```simple-flexbox``` 이라는 라이브러리를 발견했다. 
몇 줄안되는 코드가 마음에 들었고 MIT 라이센스이기 때문에 현재 개발중인 상업용 프로젝트에 사용해도 문제없어 보였다. 
하지만 한 가지 단점이 있었으니... 바로 타입스크립트 지원이 안되서 ```@types/simple-flexbox```가 안된다는 것이다!

이 문제를 해결하기 위해 찾아보다가 tsconfig에서 ```noImplicitAny: false``` 를 하면 일단은 작동은 되지만 
타입 문제 때문에 타입스크립트를 사용하는데, Any 타입이 암시적으로 허용 된다는 것이 마음에 들지 않았다.

그 다음으로 찾은 해결책은 ```.d.ts``` 파일을 만들면 순수 자바스크립트로 적혀진 코드도 타입스크립트 지원이 된다는 것이었다!
기쁨도 잠시 곧 머리속에 떠오른 질문은 "어떻게 해야되지?" 였다. 한 참을 구글링 후 해답을 찾긴 했지만 리엑트에 맞는 해답이 아니었다.
생각끝에 예전에 ```material-ui``` 라이브러리를 사용할 때 ```@types/material-ui``` 가 생각났다!
곧, 해당 라이브러리를 찾기 시작했고 참고하며 문제를 해결할 수 있었다.
 
 ```ts
 // react의 여러 타입을 가져다 쓸 수 있다.
 /// <reference types="react" />

declare module 'simple-flexbox' {
    // component를 상속받은 class를 사용해야 jsx로 사용할 수 있다.
    declare class Column extends React.Component<ColumnProps> {}
    declare class Row extends React.Component<RowProps> {}

    declare interface ColumnProps {
        className?: string
        style?: React.CSSProperties
        flexGrow?: number
        wrap?: boolean
        flex?: string,
        flexShrink?: number
        flexBasis?: string
        breakpoints?: object
        reverse?: boolean
        children: any
        vertical?: 'start' | 'center' | 'end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'space-evenly'
        horizontal?: 'start' | 'center' | 'end' | 'stretch'
        justifyContent?: 'start' | 'flex-start' | 'center' | 'end' | 'flex-end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'space-evenly'
        alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
        alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
        alignContent?: 'start' | 'flex-start' | 'center' | 'end' | 'flex-end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'stretch'
    }

    declare interface RowProps {
        className?: string
        style?: React.CSSProperties
        wrap?: boolean
        reverse?: boolean
        flex?: string
        flexGrow?: number
        flexShrink?: number
        flexBasis?: string
        breakpoints?: object
        children: any
        vertical?: 'start' | 'center' | 'end' | 'spaced' | 'baseline'
        horizontal?: 'start' | 'center' | 'end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'space-evenly'
        justifyContent?: 'start' | 'flex-start' | 'center' | 'end' | 'flex-end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'space-evenly'
        alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline' 
        alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline' 
        alignContent?: 'start' | 'flex-start' | 'center' | 'end' | 'flex-end' | 'spaced' | 'space-between' | 'around' | 'space-around' | 'stretch' 
    }
}
 ```
1. root 폴더 아래에 index.d.ts 파일을 만든다.
example:
```
typescript-playground
 |
 | ├── src
 | ├── public
 | ├── node_modules
 | ├── @types
 |         ├── simple-flexbox
 |                ├── index.d.ts
 ```
 2. tsconfig.json에 "typeRoots": ["./@types"] 를 추가한다.
example:
```
{
  "compilerOptions": {
    "target": "es5",ue,
    "skipLibCheck": true,
    "..."
    "typeRoots": ["./@types"]
  },
}
```
3. 위에 적은 코드를 index.d.ts 폴더에 복붙한다.

simple-flexbox 라이브러리가 코드가 간단해서 내 손으로 해결할 수 있었지만 거대한 라이브러리가 타입스크립트 지원을 안한다면?...
이제는 전부는 아니더라도 사용하는 일부 코드라도 type declaration 을 만들어서 해결할 수 있을 것이다...


여기서 더 나아간다면 ```@types/...``` 으로 설치할 수 있게하는 것이지만 test case 작성이 필요하다고 해서 여기까지는 차차 생각해봐야 할 것 같다...
