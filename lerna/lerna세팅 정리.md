0. repo
1. multirepo
2. monorepo
3. lerna의 역할
4. 설치할 것들

1. leran 설치 및 세팅
npx lerna init --independent

1. yarn workspace 정리
https://musma.github.io/2019/04/02/yarn-workspaces.html
https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/
lerna add는  yarn install package를 각 package마다 하는 것과 같음
 
그러므로 예를 들어 어떤 package에서 package다운로드가 필요하다
기존의 해당 패키지가서 설치가 아닌 yarn workspace 명령어 사용해야됨 (해당 패키지 아래의 node_modules에 설치됨)
전체 설치는 lerna bootstarp이 아닌 yarn install로 해결가능함

전역 모듈 설치시 yarn add -DW package

package.json, lerna.json가서 workspace 셋팅

yarn add -DW rimraf @babel/cli @babel/core @babel/preset-typescript @babel/preset-env @babel/preset-react @babel/plugin-proposal-class-properties @babel/plugin-transform-runtime

.gitignore 추가


2. babel & typescript 설치
바벨 셋팅 및 바벨 컴파일 실험용 button, button2 package추가
dev로 react 설치하는 이유는 무엇인가??
yarn add -DW react @types/react react-dom @types/react-dom typescript

tsconfig.json 세팅 및 글로벌 타입 설정
package의 package.json 설정
{
  "name": "@my/button",
  "version": "1.0.0",
  "description": "",
  "main": "lib",
  "scripts": {
    "type": "tsc --noEmit",
    "clean": "rimraf lib coverage",
    "build:ts": "tsc --declarationDir lib --emitDeclarationOnly",
    "build:js": "babel --root-mode upward src --out-dir lib --extensions .ts,.tsx,.js,.jsx",
    "build": "yarn clean && yarn build:js && yarn build:ts"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {}
}
root의 package.json 설정
{
  "name": "root",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "lerna run --parallel build"
  },
}

yarn build 입력해서 각 패키지 build 되는지 확인

5. storybook 설치
npx sb init (만약 자동으로 React설정 안되면 React로 입력)입력 후 yarn storybook 

storybook 세팅
module.exports = {
  "stories": [
    "../**/stories/**/*.stories.mdx",
    "../**/stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}

각 패키지 아래에 stories폴더 생성
7. verdaccio 설치
8. 1차 배포
각 패키지의 package.json에 아래 추가
  "publishConfig": {
    "registry": "http://localhost:4873/"
  }
git commit 
npm adduser --registry http://localhost:4873/
 npm login --registry http://localhost:4873/
yarn lerna publish from-package(각 package의 package.json에 따라 publish 됨)
package.name에 적힌 것으로 모듈이름 정해짐
http://localhost:4873/ 가서 확인

패키지 잘 다운 & 실행되는지 확인
button2르 button에 설치
yarn workspace @my/button add @my/button2 --registry http://localhost:4873/

button/src/index.tsx 코드 변경

import Button2 from "@my/button2"
export default Button2

storybook 실행

버튼에 scss 입히기
yarn add -DW babel-plugin-transform-scss
babel.config.js
module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime',
      'babel-plugin-transform-scss'
    ],
  };

global.d.ts 설정 만약 그래도 에러면 vs 코드 껐다켜기

storybook에 sass지원 코드추가
const path = require('path');

module.exports = {
  "stories": [
    "../**/stories/**/*.stories.mdx",
    "../**/stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@stotybook/scss",
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
}
yarn add -DW @storybook/preset-scss css-loader sass sass-loader style-loader yarn add -D @storybook/preset-scss css-loader sass sass-loader style-loader(바벨 빌드 지원)
yarn storybook

각 패키지의 version을 0.0.1 올려준후
git commit
yarn build
yarn lerna publish from-package
yarn workspace @my/button add @my/button2 --registry http://localhost:4873/

styled component 설치

3. webpack 설치
yarn add -DW webpack webpack-cli webpack-node-externals
스토리북 설정 변경
yarn remove -W @storybook/preset-scss

package.json 변경(babel 대체)
// lerna 명령어 실행여부 확인
button2 의 test2 택스트릴 test3로 변경
yarn build
verdaccio 켜져있는지 확인
패키지 버전업 후 커밋 후 배포(yarn lerna publish from-package)
배포 잘 됐는지 확인

yarn workspace 버그있는 것 같음
yarn policies set-version 1.18.0
https://github.com/yarnpkg/yarn/issues/7807

yarn workspace @my/button add @my/button2 --registry http://localhost:4873/
yarn storybook

4. jest
package json 에
scripts: {
    "test": "jest"
},
  "jest": {
    "moduleNameMapper": {
      "\\.(css|scss|less)$": "identity-obj-proxy"
    }
  },
추가
yarn add -DW identity-obj-proxy jest @types/jest

button아래에 __tests__ 폴더 생성 후
// Button.test.tsx
import Button from '../src';

describe('Button', () => {
  test('should match snapshot and styles for default props', () => {
    expect(Button).toMatchSnapshot();
  });
});

입력 yarn test

6. prettier, eslint
 yarn add -DW eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jest eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
.eslintignore
.eslintrc.json
.prettierignore
.prettierrc
package.json의 scripts 설정
yarn lint
yarn lint:p
7. husky
yarn add -DW husky lint-staged

  "lint-staged": {
    "packages/**/*.{js,jsx,ts,tsx}": [
      "yarn lint",
      "yarn lint:p"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
8. npm lifcycle에 따라 script 설정하기
배포할 때마다 빌드했던것 자동화하기
    "prerelease": "yarn build",
    "release": "yarn lerna publish from-package"

8. 배포
button2 text 변경
각 패키지 버전업
커밋
yarn release

9. 패키지 내에서 사용가능 여부 확인
10. moldules 다 지우고 yarn install

https://registry.npmjs.org 