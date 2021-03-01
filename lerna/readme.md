# 공통 컴포넌트를 위한 분리

우리가 만든 여러 프로젝트에서 공통으로 사용되는 컴포넌트들이 생겼다.

그러므로 우리는 다른 ⛑엔지니어들에게 공통 컴포넌트를 분리하도록 지시했다.

그 결과로 엔지니어들이 공통 컴포넌트를 따로 분리한 외부 패키지를 만들었다.

우리의 엔지니어들이 만든 파일구조는 아래와 비슷하다.

```
src/
    componenets/
    utils/
webpack.config.json
babel.config.json
.prettierrc
package.json
.eslintrc.json
tsconfig.json
```

공통 컴포넌트를 components/ 폴더에 하위에 넣어서 쓴다.

```js
// ant-design이 아래와 같은 구조로 되어있다.
src/
    componenets/
        form/
        button/
        ...
    utils/
webpack.config.json
babel.config.json
...
```

# MultiRepo의 필요성
위 구조에서 만약 button만 쓰고 싶다면
별다른 방법이 없이 불필요한 나머지 컴포넌트 또한 다운받아 사용해야한다.

만약 버튼의 용량이 커져서 또는 최소의 용량만으로 사용자에게 서비스를 제공하기위해서
분리의 필요성이 생긴다면 button을 분리해야한다.

button만 쓰기 위해 각 컴포넌트들을 다시 분리했다면 아래와 같이 된다.

```
MyButton/
    src/
        button/
    utils/
    webpack.config.json
    babel.config.json
...

MyForm/
    src/
        form/
    utils/
    webpack.config.json
    babel.config.json
...
```

이제 button만 다운로드하여 쓸수 있다.🎉

# Monorepo의 필요성
이것이 끝이면 좋겠지만 우리의 엔지니어들은 중복을 최소화하기 위해 항상 노력한다.

패키지를 새로 만들때마다 lint, babel, webpack 등 설정 파일, utils가 중복된다.

위의 중복을 처리하기 위해서는 다시 처음의 구조로 돌아가자.

```
src/
    components/
        button/
        form/
    utils/
webpack.config.json
babel.config.json
.prettierrc
package.json
.eslintrc.json
tsconfig.json
```

설정파일을 수정하여 각 components 별로 변경이 가능하다. 여러 방식이 있지만 아래와 같은 
방식으로 구현했다.

```
src/
    packages/
        button/
            webpack.config.json
            tsconfig.json
            package.json
            __node_modules__
        form/
            webpack.config.json
            tsconfig.json
            package.json
            __node_modules__
    utils/
__node_modules__
webpack.config.json
babel.config.json
.prettierrc
package.json
.eslintrc.json
tsconfig.json
```

각 패키지의 __node_modules__에 위치한 중복된 패키지는 npm link 또는 yarn workspace에서 제공하는 symlinks 기능을 사용하면 된다. 이 기능은 바탕화면의 바로가기 아이콘 같이 설치 폴더가 실제로
그곳에 위치하지 않지만 바로가기 링크를 제공해줌으로써 실행해 주는것과 동일하다.

이 구조로 잘 사용이 가능하지만 불편한 점이 있다.

1. 패키지 하나 또는 모두를 배포하기 위해서는 해당 패키지의 경로로 접근해서 `npm publish`를 입력해야한다.

2. 공통 라이브러리를 설치하기 위해 추가적으로 각 패키지 경로를 이동해 `npm link`와 같은 명령어를 입력해야한다.(link를 통해 라이브러리 중복을 해결할 수 있다.)

3. 모든 외부 패키지(__node_modules__)를 설치하고 싶다면 먼저 루트 폴더에서 `npm install`을 입력후 각 패키지 경로로 이동해 `npm install`과 `npm link`를 입력해야 한다.

참고로 yarn workspace기능을 사용하면 2,3 번이 상당히 간단해 질수 있다.(단, [버그](https://github.com/yarnpkg/yarn/issues/7807)가 있는 것으로 보임)

# Lerna의 필요성
Leran는 git, npm과 같은 패키지 매니저를 사용하기 편리하도록 도와준다.

원리는 간단하다. 만약에 모든 packages를 배포하고 싶다면 `npx lerna publish`를 루트 폴더 경로의 cmd에 입력한다.   

그러면 각 packages/를 순회하며 명령어를 실행한다.

공통 라이브러리를 설치하고 싶다면 `npx lerna add <package>`

모든 외부 패키지를 설치하고 싶다면 `npx lerna bootstrap`을 입력하면 된다.

# MonoRepo 프로젝트 구축하기

# MonoRepo 사용하기

# 다른 곳에서는 MonoRepo 어떻게 쓰나?

[참고](https://github.com/mui-org/material-ui/tree/next/packages)

