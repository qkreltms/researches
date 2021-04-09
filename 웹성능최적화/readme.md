# 웹 성능 최적화

# **CRP (Critical Rendering Path)란?**

**Parse HTML - DOM(Document Object Model)이 생성되는 과정**

```jsx
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
  </body>
</html
```

![%E1%84%8B%E1%85%B0%E1%86%B8%20%E1%84%89%E1%85%A5%E1%86%BC%E1%84%82%E1%85%B3%E1%86%BC%20%E1%84%8E%E1%85%AC%E1%84%8C%E1%85%A5%E1%86%A8%E1%84%92%E1%85%AA%207bc7bd94ec7c4b31a9d72a5c02f1533f/full-process.png](./full-process.png)

1. 변환 - 네트워크나 디스크에서 바이트를 불러와 문자로 변환
2. 토큰화 - 문자열을 특정 규칙에 따라 토큰으로 만듦 
3. 렉싱(lexing) - 토큰을 분석해 어떤 의미(객채)로 만든다.
4. DOM 생성 - 객채를 트리 데이터 구조로 연결 

**CSS가 생성되는 과정 (Recalculate Style)**

```jsx
body { font-size: 16px }
p { font-weight: bold }
span { color: red }
p span { display: none }
img { float: right }
```

위와 같은 과정, but DOM 대신 CSSOM 만듦

(*CSSOM은 DOM과 다르게 부모로 부터 상속받는다.)

**CSS는 render bloking이다.** 작업이 완료될 때까지 다음 작업을 막음

css selector가 성능이 더 느리다 왜냐면 재귀적으로 타고 내려갔다가 위로 올라와서 확인해야됨.

div { } < div p {}(더 느림)

dev tool의 recalculate style로 시간 소요 알 수있음.

시간 측정을 먼저하고 최적화는 그 다음.

visibility에 비해 display: none은 dom을 그릴때 아예 무시해 성능 최적화가 된다.

body의 width: n%는 viewport를 따라간다. <meta/>

**정리: 브라우저에 화면이 그려지는 원리**

1. html파일을 가져온다.
2. HTML을 분석해 DOM을 구축한다.
3. CSS 마크업을 처리하고 CSSOM을 만든다. 
4. DOM과 CSSOM을 병합한다.
5. layout을 진행한다.(width: 50%, 등)
6. paint를 진행한다.(background-color: red 등)
7. DOM또는 CSSOM이 수정도리 경우 반복한다.

**JavaScript**

```jsx
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path: Script</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <script>
      var span = document.getElementsByTagName('span')[0];
      span.textContent = 'interactive'; // change DOM text content
      span.style.display = 'inline';  // change CSSOM property
      // create a new element, style it, and append it to the DOM
      var loadTime = document.createElement('div');
      loadTime.textContent = 'You loaded this page on: ' + new Date();
      loadTime.style.color = 'blue';
      document.body.appendChild(loadTime);
    </script>
  </body>
</html>
```

인라인 스크립트 태그는 Parser Blocking을 발생시킨다.

HTML 파일을 가져온다.(GET) ⇒ DOM을 구축한다 ⇒ script 태그를 발견하면 여기서 스타일, DOM을 생성할 수 도있으므로 **DOM 생성 중지!** ⇒ CSS & JS를 가져온다. ⇒ JS를 실행한다.  ⇒ CSSOM을 만든다⇒ DOM 구축을 계속한다(루프).

```jsx
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path: Script External</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <script src="app.js"></script>
  </body>
</html>
```

외부 자바스크립트 파일은 스크립트 파일을 캐시, 원격 서버 등에서 가져올 때까지 기다려야 한다.

**JS로 DOM, CSSOM을 수정, 추가하면 어떤 일이 발생할까?** 

**Reflow, Repaint**

**Virtual DOM**

**최종 정리**

[참고 1](https://jess2.xyz/web/browser-rendering/)

# 어떻게 최적화를 할까?

1. minify
2. compress
3. cache

미디아 쿼리를 사용한다면

예를 들어 @media print라면 이것에 해당되는 스타일은 아예 분리해서 따로 불러온다.

```jsx
<link rel="stylesheet" href="style-print.css" media="print"> // 더 자세한것 => [참고](https://stackoverflow.com/questions/32759272/how-to-load-css-asynchronously)
<link ... media="orientation:landscape >
```

**Parser blocking 주의! - inline js가 존재할 때**

```jsx
<html>
 <head></head>
 <body>
   <p>
   <span>Hello</span>
   <script>
     // 여기서 Hello span을 가져와서 어떤 작업을 수행이 가능하다...
     // 하지만 World div를 가져와서 어떤 작업을 수행할 수 없다. null이 오기 때문
   </script>
   <div>World</div>
   </p>
 </body>
</html>
```

HTML 파일을 가져온다.(GET) ⇒ DOM을 구축한다 ⇒ script 태그를 발견하면 여기서 스타일, DOM을 생성할 수 도있으므로 **DOM 생성 중지!** ⇒ CSS & JS를 가져온다. ⇒ JS를 실행한다.  ⇒ CSSOM을 만든다⇒ DOM 구축을 계속한다(루프).

**해결방법**

[defer](https://hacks.mozilla.org/2009/06/defer/) 속성을 사용한다.

window.onload를 사용한다.

external script에 async 속성을 사용한다.

**Dynamic loading**

그 외 참고 블로그

[https://junwoo45.github.io/2020-01-29-javascript_performance/](https://junwoo45.github.io/2020-01-29-javascript_performance/)

[https://meetup.toast.com/search?page=3&searchText=dom](https://meetup.toast.com/search?page=3&searchText=dom)

측정도구

[Field](https://web.dev/user-centric-performance-metrics/#in-the-field) tools(interaction test, 환경에 따른 차이)

web-vitals (js library)

Lab tools(성능 측정(로딩 시간 등))

lighthouse

용어정리

1. FCP

페이지가 로딩을 시작해서 어떤 콘텐츠(텍스트, 이미지, svg, canvas 등)가 화면에 보이기 시작할 때

2. LCP [링크](https://web.dev/lcp/)

가장 사이즈가 큰 컨텐츠가 렌더링 되는 시간(이미지, 텍스트 등)

사이즈는 용량이 아닌 viewport에 보여지는 고유 너비, 높이(maring, padding은 포함되지 않음)

측정시기 로딩이 다 끝나고, 만약 LCP가 사라지면 다른 LCP를 찾는다.

3. LCP가 가장 중요한 컨텐츠는 아니다.

주의깊게 보아야할 것

img, svg, video, url(). text nodes

4. [FID](https://web.dev/fid/)(First Input Delay)

user first interacts with a page (i.e. when they click a link, 단 줌인아웃, 스크롤링은 판별대상이아님)

이벤트 리스너가 붙지 않아도 측정된다.

<input>, <textarea>, <select>, <a>, etc

왜 신경써야 하는가? ⇒ 유저의 첫인상을 결정짓는다.

5. [TTI](https://web.dev/tti/)(Time to Interactive)

TTI가 낮으면 유저들은 웹이 고장났다고 생각할 수 있다 왜냐면 페이지가 렌더링 됐다고 작동되는게 아니기 때문에

6. [critical rendering path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path)

HTML, CSS, JS를 픽셀로 그려주는 중간 과정

---

영향을 주는 것들

1. 느린 네트워크
2. Render-blocking JavaScript and CSS  [참고](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css?hl=ko)
3. Resource load times
4. Client-side rendering
5. Establish third-party connections early
6. Render blocking JavaScript and CSS

최적화하기 [참고](https://web.dev/optimize-lcp/)

서버 최적화

가까운 CDN 사용하기

Service worker 사용

cache assets

Establish third-party connections early

Minify CSS

Defer non-critical CSS [참고](https://web.dev/defer-non-critical-css/)

chrome dev tools에서 coverage 사용

초기 렌더링에 필요하지 않다면 css 비동기 호출

For a deep dive on how to improve LCP, see [Optimize LCP](https://web.dev/optimize-lcp/). For additional guidance on individual performance techniques that can also improve LCP, see:

- [Apply instant loading with the PRPL pattern](https://web.dev/apply-instant-loading-with-prpl)
- [Optimizing the Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/)
- [Optimize your CSS](https://web.dev/fast#optimize-your-css)
- [Optimize your Images](https://web.dev/fast#optimize-your-images)
- [Optimize web Fonts](https://web.dev/fast#optimize-web-fonts)
- [Optimize your JavaScript](https://web.dev/fast#optimize-your-javascript) (for client-rendered sites)

---

성능을 올리는 방법

#0 효율적인 캐시 정책 사용하기

#1 이미지, 텍스트를 압축한다. [참고](https://web.dev/fast/#optimize-your-images)

png to jpg or jpeg 등...

대략 1~2KB정도 감소하는데 작은 컴포넌트 몇 개를 절약하는 사이즈이다. 

but, 투명 배경을 하지 못 한다.(다크, 화이트 모드 지원?)

#2 다이나믹 임포트를 사용한다

```jsx
// 스크립트
const dispatch = (await import('react-redux')).default.useDispatch()
// 컴포넌트
const DynamicComponent = dynamic(() => import('../components/hello'))
```

```jsx
const LoginForm = dynamic(
  () =>
    import(
      /* webpackPreload: true */
      /* webpackChunkName: "[request]" */
      /* webpackMode: "lazy" */
      '@/components/blocks/Form/LoginForm'
    ),
)
```

스크립트를 분리하고, 필요할 때만 불러올 수 있게 되어 불필요하게 모든 것을 다 불러오지 않는다. 

!주의: 전체적인 용량이 약간 증가한다.

#3 이미지 스프라이트 기법을 사용한다. [참고](http://www.tcpschool.com/examples/tryit/tryhtml.php?filename=css_basic_imageSprites_01)

#4 중복코드 제거

#5 필요한 함수만 가져온다.

#6 마크업 최적화

#7 css 선택자 간결하게

#8 visibility: hidden보다 display: none 애용

#9 애니메이션 ⇒  [참고](https://ui.toast.com/fe-guide/ko_PERFORMANCE)

#10 webpack Prefetch, preload 사용 [참고](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

다이나믹임포트만 사용하면 webpack에서 chunk로 분리해주고 다 같이 한꺼번에 가져오고 필요할 때쓴다.

이 것을 비동기적으로 가져올 수 있게해준다.

#11 사용자 환경에 따라 다른 콘텐츠를 불러온다.

```jsx
if (navigator.connection && navigator.connection.effectiveType) {
  if (navigator.connection.effectiveType === '4g') {
    // Load video
  } else {
    // Load image
  }
}
```

#12 SSR이라면 pre-rendering 을 사용한다.

#13 라우트를 prefetching한다.

#14 wildcard import를 사용하지 않는다.

import * as foo from './foo';

tree shaking이 힘들어짐

[참고](https://web.dev/optimize-lcp/)

중복되는 이미지제거 필수!!

중간정리 = dynamic import사용, but 어떤 경우에 사용하면 좋지 않은지 파악 필요 ⇒ 추후 블로그로 정리하면 좋음+ webpack

 불필요한 라이브러리 제거 및 dynamic import 중요성, provider로 적용할 경우 app에 적용하는게 무조건 좋은가?

이미지 크기 줄이는것의 중요성

로컬 테스트시에는 점수가 올라갔지만 개발 서버 적재후 테스트시 점수가 오히려 내려감 이유가??