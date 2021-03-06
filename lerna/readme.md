# 공통 컴포넌트를 위한 분리

여러 프로젝트가 진행됐고 중복되는 컴포넌트가 생겼습니다.

그러므로 공통 컴포넌트만을 따로 모아놓은 패키지를 만들고 그 곳에서 관리하고 이것들이 필요한
다른 프로젝트에서는 여기서 가져다 쓰는 형식으로 만들고 싶었습니다.

# 일반적인 폴더 구조
아래와 같은 폴더 구조로 진행했습니다.

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

공통 컴포넌트를 components/ 폴더에 하위에 넣어서 씁니다.

```js
// ant-design이 위와 같은 구조로 되어있습니다.
src/
    componenets/
        form/
        mega-size-chart/
        ...
    utils/
webpack.config.json
babel.config.json
...
```

# MultiRepo의 필요성
위 구조에서 만약 form만 쓰고 싶어도 불필요한 나머지 컴포넌트(mega-size-chart) 또한 다운받아 사용해야합니다.

그렇게 되면 script를 불러오는 시간이 증가하게 되고 [FCP](https://developers.google.com/web/updates/2019/02/rendering-on-the-web?hl=ko)까지 악영향을 끼칠 수 있습니다. 

그렇기 때문에 아래와 같이 다시 구조를 설계했습니다.

```
MyMegaSizecChart/
    src/
        mega-size-chart/
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

이제 form만 다운로드하여 쓸수 있습니다🎉 

하지만 패키지를 새로 만들때마다 lint, babel, webpack 등 설정 파일, utils와 같은 몇몇 중복이 눈에 띄는군요.

# Monorepo의 필요성
위의 중복을 처리하기 위해서는 다시 처음의 구조로 돌아가 보겠습니다.

빌드와 배포만 각 컴포넌트별로 진행할 수 있으면 됩니다.

```
src/
    components/
        mega-size-chart/
        form/
    utils/
webpack.config.json
babel.config.json
.prettierrc
package.json
.eslintrc.json
tsconfig.json
```
위의 구조에서 webpack, tsconfig와 같은 파일을 빌드 수행시 각 컴포넌트 별로 진행되도록 값을 수정했으며 아래와 같습니다.

```
src/
    packages/
        mega-size-chart/
            webpack.config.json
            tsconfig.json
        form/
            webpack.config.json
            tsconfig.json
    utils/
webpack.config.json
babel.config.json
.prettierrc
package.json
.eslintrc.json
tsconfig.json
```
여기서 각 패키지에서 공통으로 사용하는 라이브러리는 루트 폴더에 다운 받고 각 패키지 별로 필요한 것은 그 아래에 두면 아래와 같은 구조가 됩니다. 

```
src/
    packages/
        mega-size-chart/
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

각 패키지의 __node_modules__에 위치한 중복된 외부 라이브러리는 npm link 에서 제공하는 symlinks 기능을 사용하면 됩니다. symlinks를 설명하자면 이바탕화면의 바로가기 아이콘과 같이 설치 폴더가 실제로 그곳에 위치하지 않지만 어디에 있다고 알려주는 링크를 제공해줍니다.

---

이 구조로 잘 사용이 가능하지만 몇몇 불편한 점이 있습니다.

1. 패키지 하나 또는 모두를 배포하기 위해서는 해당 패키지의 경로로 접근해서 `npm publish`를 입력해야한다.

2. 공통 라이브러리를 설치하기 위해 추가적으로 각 패키지 경로를 이동해 `npm link`와 같은 명령어를 입력해야한다.

3. 각 패키지의 모든 외부 패키지를 설치하고 싶다면 먼저 루트 폴더에서 `npm install`을 입력후 각 패키지 경로로 이동해 `npm install`과 `npm link`를 입력해야 한다.

참고로 yarn workspace기능을 사용하면 2,3 번이 상당히 간단해 질수 있습니다.(단, [버그](https://github.com/yarnpkg/yarn/issues/7807)가 있는 것으로 보임)

# Lerna의 필요성
Leran는 git, npm과 같은 패키지 매니저를 사용하기 편리하도록 도와줍니다.

원리는 간단합니다. 

만약에 모든 패키지를 배포하고 싶다면 `npx lerna publish`를 루트 폴더 경로의 cmd에 입력합니다.   

그러면 아래와 같은 일이 벌어집니다.
```
1. 각 패키지를 순회합니다.
2. 마지막 릴리스 이후 업데이트 된 패키지를 배포합니다.

```

공통 라이브러리를 설치하고 싶다면 `npx lerna add <package>`

모든 외부 패키지를 설치하고 싶다면 `npx lerna bootstrap`을 입력하면 됩니다.

# Lerna 더 잘사용하기
## `lerna create <name>`
package 생성
## `lerna version`
package.json의 버전을 올려주고 change log를 만들어준다. [change-log 참고](https://github.com/lerna/lerna/blob/main/CHANGELOG.md)

## `lerna import`
lerna 이전에 이미 존재했던 패키지의 커밋 히스토리를 그대로 lerna 프로젝트에 가져올 때 사용합니다.  

## `lerna run`
각 package의 script를 실행시킵니다.

ex: `lerna run test`

# Private registry 만들기
## Verdaccio
verdaccio에서 다운로드 받기
`npm install <package> --registry 192.xxx.xxx.xxx:4873`

주의!
`npm set registry 192.xxx.xxx.xxx:4873`
사용시 설치하는 모든 패키지 해당 ip 통해서 설치되고 만약 만든 프로젝트를 외부에 

올려서 사용시 해당 주소를 찾을 수 없음
# 다른 곳에서는 MonoRepo 어떻게 쓰고있을까?

위의 중복된 webpack, tsconfig 설정 script/ 하위에서 관리

[참고](https://github.com/mui-org/material-ui/tree/next/packages)

# 최신 근황
`nx`를 사용하면 monorepo 구축이 쉬워질 것으로 생각됨
[참고](https://github.com/nrwl/nx)
# Special thanks to


