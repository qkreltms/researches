---

내 웹페이지 성능을 어떻게 올릴까? - 예제
예제로 성능을 최적화해보자.
개요
전 글에서 기초를 알았으니 이번편에는 이 예제를 성능 최적화해 100 점짜리 예제를 만든다. 완성본의 링크는 여기이다.
목차
media="print" 추가하기
Script 파일을 body 아래로 옮기기
Minify
Layout shift 해결하기
Font
Inline

---

HTML 파일을 Ctrl+Shift+N 버튼을 눌러 chrome secret 모드에서 띄운 후 F12를 눌러 나타나는 chrome dev tools의 performance 탭에서 Ctrl+E를 누른 후 HTML을 새로 고침 한다.
화면 로딩이 완료될 때 다시 Ctrl+E를 누르면 아래와 같이 보인다.
처음 모습이제 차근차근히 최적화해보자.
1. media="print" 추가하기
print.cssprint.css 파일을 확인해보니 인쇄할 때에만 적용되는 style이다. media="print"를 추가하니 네트워크 우선순위가 낮아져 다른 데이터를 더 빨리 불러올 수 있다.
다운로드 우선순위가 낮아진 print.css2. Script 파일을 body 아래로 옮기기
perfmatters.js를 열어보면 load 이벤트 발동 시 CSSOM을 변경해 주는 일을 하고 있다.
// index.html
<head>
    <script async src="js/perfmatters.js"></script>
</head>
// perfmatters.js
function logCRP() {
var t = window.performance.timing,
dcl = t.domContentLoadedEventStart - t.domLoading,
complete = t.domComplete - t.domLoading;
var stats = document.getElementById("crp-stats");
stats.textContent = 'DCL: ' + dcl + 'ms, onload: ' + complete + 'ms';
}
window.addEventListener("load", function(event) {
    logCRP();
});
performance에서도 load 시간에 함수 호출이 이뤄지는 것을 볼 수 있다.
load 이벤트에 호출되는 scriptscript가 parser blocking을 발생시킨다.또한, script가 head 태그 안에서 호출되어 parser blocking을 발생시킨다. 그러므로 script를 body아래로 옮겨준다.
body아래로 script를 이동 후 더 이상 parser blocking을 일으키지 않아 화면이 전보다 좀 더 빨리 보인다.
parser blocking을 제거

---

parser blocking을 일으키는 사진을 다시 보면 evaluate script가 HTML parsing 중간에 막고 있다. 여기서 한 가지 이상한 점은 우리가 배운 것은 CSSOM이 생성될 때까지 script는 실행되지 않는다는 것이었는데 반해 CSSOM 생성 시 표시되는 recalculate style 이전에 script가 실행되고 있다는 점이다.
브라우저의 동작 원리는 정확히 모르겠지만, 이 글을 참고로 추측하자면 브라우저 내에서 script를 읽으면 먼저 실행 후, CSSOM이 생성되면 다시 한 번 필요 한때에 CSSOM 수정을 하는 것으로 보인다.
3. Minify
간단하게 style.css파일을 minify 전, 후를 확인만 하고 넘어가겠다.
minify 전minify 후파일 크기가 줄어들면 그만큼 성능상의 이점을 가져갈 수 있다.
4. Layout shift 해결하기
layout shift다시 performance를 확인하니 이제 빨간색 막대의 layout shift가 보인다. 이 작업은 하드웨어 자원 비용이 비싸므로 최소화하는 것이 좋다.
무엇이 문제인지 찾기 위해 node에 적재하고 Lighthouse로 찾아봤더니 이미지가 문제였다.
layout shift의 원인이미지를 전부 제거해보니 증상이 사라졌다.
Layout shift가 사라졌다!다시 되돌린 후 이미지를 확인해 보니 보여주는 사이즈에 비해 pizzeria.png가 쓸데없이 크다.
그림판으로 이미지 사이즈를 줄인 후 다시 확인해 보니 layout shift의 크기는 작아졌지만, 아래 사진에서 볼 수 있듯이, 아직도 나타난다.
작은 layout shift들…다시 한 번 lighthouse 돌려보니 특정 이미지가 height, width가 주어지지 않아 증상을 일으키는 것을 발견했다.
이미지 크기가 고정되지 않아 layout shift 발생이미지 height, width 고정해 layout shift 줄여준다.
li img { 
    float:left; padding-right: 1em; width: 100px; height: 60px;
}
그 후 다시 확인해보니 이제는 이미지로 인한 layout shift가 발견되지 않았다.
아래 사진에 조그맣게 보이는 layout shift는 text로 인한 것이다.
이미지로 인한 layout shift는 없다.5. Font
performance를 확인해보면 font가 네트워크 통신이 길다는 것, font가 render blocking을 긴 시간 동안 하는 것, font가 다운로드 될 때까지 텍스트가 보이지 않는다는 것이다.
font 최적화 전chrome dev tools의 network 탭에서 font를 받아오는 링크를 들어가니 CSS파일을 다운받고 그 안에 @font-face의 url을 사용해 다시 font를 받아온다.
1. CSS, 2. font 다운로드로 라운드 트립 횟수가 최소 2회가 되므로 1회로 줄여주기 위해 CSS를 그대로 복사해 style.css로 붙여넣거나 CSS파일을 하나 더 만들어 그 곳에 위치해 놓는다. font를 PC에 다운로드 받아 처리하는 방법도 있지만, 이 글에서는 쓰지 않겠다.
font 다운로드 시간과 render blocking 시간이 줄어듦이제 남은 것은 font가 다운로드 될 때까지 텍스트가 보이지 않는다는 것이다.
font 설치전까지 빈 텍스트다른 블로그에서 더 자세히 다뤘으므로 여기서는 링크1, 링크2, 링크3만 남기고 간단한 부분만 설명하겠다.
FOIT, FOUT
font가 다운로드 되기 전에 어떻게 보여줄 것인지 처리하는 방법은 브라우저마다 다르다. FOIT는 font가 로딩될 때까지 빈 상자를 보여주고, FOUT는 기본 font를 보여주다 다운로드된 font를 보여준다.
FOUT방식의 단점은 layout shift가 발생한다는 것이다. 참고
https://d2.naver.com/helloworld/4969726chrome에서는 FOIT방식을 사용한다. 그렇다면 FOUT 방식을 사용해야 텍스트가 보일 수 있다. 또한, chrome에서도 font-display: swap을 사용하면 FOUT방식을 사용할 수 있다.
@font-face {
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src:     url(https://fonts.gstatic.com/s/opensans/v20/mem8YaGs126MiZpBA-UFUZ0bbck.woff2) format('woff2');
    unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
font-display: swap;6. Inline
이제 마지막이다. 여기에서는 performatters.js, style.css를 inline, external로 했을 때 어떤 차이가 있는지 알아본다.
제한 사항먼저 style.css를 external, inline으로 했을 때이다. 제한을 두고 각각 3번씩 해봤을 때 DCL은 별 차이가 없지만, load는 항상 inline이 더 빨랐다.
DCL(DOMContentLoaded Event): DOM이 준비되고 그 시점에 자바스크립트 실행을 차단하는 스타일시트가 없는 시점을 표시. 즉, 이제 (잠재적으로) 렌더링 트리를 생성 가능하다. DCL이 빠를수록 다음 로직이 더 빠르게 실행된다.
external cssinline css그럴수 밖에 없는 것이 CSS는 render blocking이므로 더 빠르게 다운받고 빠르게 실행되면 다음 작업이 빨라질 수밖에 없다.

---

이제 performatters.js를 보겠다. 둘 다 async 속성을 붙이고 body 태그 아래에 놓았다. external, inline 각각 3번씩 수행했을 때 load는 별 차이 없었지만 DCL은 오히려 external이 빨랐다.
// external js
<script async src="js/perfmatters.js"></script>
// inline js
<script async>
function logCRP() {
var t = window.performance.timing,
dcl = t.domContentLoadedEventStart - t.domLoading,
complete = t.domComplete - t.domLoading;
var stats = document.getElementById("crp-stats");
stats.textContent = 'DCL: ' + dcl + 'ms, onload: ' + complete + 'ms';
}
window.addEventListener("load", function(event) {
    logCRP();
});
</script>
external scriptinline script이유가 무엇인지 performance로 확인해보자.
먼저 external script를 확인해보면 async가 잘 작동했다. HTML parsing => DCL => CSSOM => script 순이다.
external scriptCSS와 JS가 외부 파일이므로 HTML을 parsing하는 시점에서는 존재하지 않고 다운로드가 완료되면 실행된다. 그러므로 DCL이 시점이 앞당겨질 수 있는 것이다.
반면, inline script는 asnyc 속성이 적용되지 않았다. HTML parsing => CSSOM => script => DCL 순으로 script가 parser blocking을 일으켰다.
inline script즉, script는 external+async로 써야 parser blocking을 일으키지 않아 DCL이 빨라지고, CSS는 inline으로 써야 다운로드 속도가 빨라져 render blocking시간이 짧아진다.

---

이번 글에서는 주어진 예제로 CRP를 최적화했다. 다음 글에서는 React앱을 실전에서 쓰이는 여러 기법으로 최적화한다.
다음화 -> 내 웹페이지 성능을 어떻게 올릴까? - 실전