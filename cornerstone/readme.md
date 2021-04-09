# Cornerstone 분석Cornerstone 분석

Conerstone Core: 이미지의 밝기, 이미지의 크기, 컬러맵 등을 다룸

Cornerstone tools: interaction을 다룬다 (zoom, panning, 그림 그리기), 단 없어도 event로 조작이 가능하다.

Cornerstone Image Loader: png, dicom image 등을 불러올 수 있다.

Cornerstone math - 수학

기본적으로 이벤트 기반 라이브러리 [cornerstone core](https://github.com/cornerstonejs/cornerstone/blob/master/src/events.js), [tools](https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/events.js)

예: canvas위에서 마우스 이동, zoom, 등 커스텀 이벤트를 dispatch 한다.

```jsx
const EVENTS = {
  NEW_IMAGE: 'cornerstonenewimage',
  INVALIDATED: 'cornerstoneinvalidated',
  PRE_RENDER: 'cornerstoneprerender',
  IMAGE_CACHE_MAXIMUM_SIZE_CHANGED: 'cornerstoneimagecachemaximumsizechanged',
  IMAGE_CACHE_PROMISE_REMOVED: 'cornerstoneimagecachepromiseremoved',
  IMAGE_CACHE_FULL: 'cornerstoneimagecachefull',
  IMAGE_CACHE_CHANGED: 'cornerstoneimagecachechanged',
  WEBGL_TEXTURE_REMOVED: 'cornerstonewebgltextureremoved',
  WEBGL_TEXTURE_CACHE_FULL: 'cornerstonewebgltexturecachefull',
  IMAGE_LOADED: 'cornerstoneimageloaded',
  IMAGE_LOAD_FAILED: 'cornerstoneimageloadfailed',
  ELEMENT_RESIZED: 'cornerstoneelementresized',
  IMAGE_RENDERED: 'cornerstoneimagerendered',
  LAYER_ADDED: 'cornerstonelayeradded',
  LAYER_REMOVED: 'cornerstonelayerremoved',
  ACTIVE_LAYER_CHANGED: 'cornerstoneactivelayerchanged',
  ELEMENT_DISABLED: 'cornerstoneelementdisabled',
  ELEMENT_ENABLED: 'cornerstoneelementenabled'
};
```

element를 넣어주면 그 아래에 canvas를 생성한다.

```jsx
const element = document.getElementById('dicomImage');
cornerstone.enable(element);
```

그 이후 cornerstone에서 element의 ref값을 가지게 된다.

tool을 부착할 수 있다.

사용하고자 하는 image마다 붙여줘야 한다.

부착하면 지정된 마우스 이벤트에 따라 해당 tool이 작동된다.

```jsx
cornerstone.loadImage(images[0]).then((image) => {
      // Display the first image
      cornerstone.displayImage(viewer, image);
      const zoomTool = cornerstoneTools.ZoomTool

      cornerstoneTools.addTool(zoomTool, {
        configuration: {
          invert: false,
          preventZoomOutsideImage: false,
          minScale: .1,
          maxScale: 20.0,
        }
      })
      cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 })
      // 만약 어떤 이벤트에 따라 함수를 호출하고 싶다면 [참고](https://github.com/cornerstonejs/cornerstoneTools/blob/3925399f72e69f69a4b108be10bfce115eda3247/src/events.js)
      viewerRef.current.addEventListener("cornerstonetoolsmousedrag", (e) => console.log(e.detail));
    });
```

stack manager는 어떤 것인가?

cornerston보다 사용하기 쉽게 여러 이미지를 한 canvas에 쓸 수 있도록 도와줌, [Reference Lines tool](https://tools.cornerstonejs.org/examples/tools/reference-lines.html) 같은 기능도 사용 가능

layer란?

이미지위에 이미지가 올라간 것이라고 생각하면 된다.

예를 들어 뇌 MRI 이미지가 있고 그 위에 각 부위별로 구분한 세그멘테이션을 보여주고 싶다면 레이어를 사용한다.

tool 모드에 따른 기능(active, passvie, enabled, disabled)

[참고](https://tools.cornerstonejs.org/anatomy-of-a-tool/#modes)

이미지 캐시이미지 캐시 최대 1GB저장

```jsx
cornerstone.loadImage // ⇒ cornerstone.loadAndCacheImage 사용
```

예제

layer활용 [https://rawgit.com/cornerstonejs/cornerstone/master/example/layers/index.html](https://rawgit.com/cornerstonejs/cornerstone/master/example/layers/index.html)

기본적인 viewer [https://rawgit.com/cornerstonejs/cornerstone/master/example/scrollzoompanwl/index.html](https://rawgit.com/cornerstonejs/cornerstone/master/example/scrollzoompanwl/index.html)

react(layer)

[https://codesandbox.io/s/cornerstone-react-component-example-forked-tnfvb?file=/src/index.js:2168-2193](https://codesandbox.io/s/cornerstone-react-component-example-forked-tnfvb?file=/src/index.js:2168-2193)