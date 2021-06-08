---

Map과 object 둘 중 어느게 더 빠를까?
오픈소스 기여 과정에서 알아본 Map과 object의 성능비교
개요
이 글을 보고 Map이 object보다 원소를 추가, 찾기에 더 빠르다는 것을 알게 됐다. 또한, 이 소스 코드를 사용한 검증 과정에서 Map을 쓰더라도 forEach로 iterate를 수행하면 object와 비슷한 속도를 낸다는 것을 깨달았다.
for of Map: 0.1200000406242907ms
forEach obj: 0.06499997107312083ms
forEach Map: 0.07000000914558768ms
map obj: 0.08999998681247234ms
for of obj: 0.13000000035390258ms
마침 기회가 닿아 내가 배운 것을 오픈소스에 적용하기로 했다.
오픈소스를 잠깐 설명하자면 Redux, React ContextAPI, 바닐라 JS에 적용할 수 있는 라이브러리이다.
이름이 HELLO인 action과 이 것을 엿듣는 listener가 있을 때 이 액션이 실행(dispatch)될 때마다 등록된 모든 listener들을 순회하며 HELLO를 엿듣는 listener들에게 알려준다.
+, -가 눌릴 때마다 해당 action을 엿듣는 listener들에게 알려준다.목차
테스트 시작
테스트 결론
결론

---

테스트 시작
listener을 저장하는 listeners와 관련 코드를 object에서 Map으로 진행되도록 변경했다.
this.listeners = new Map();
실제 적용해서도 속도가 얼마나 향상됐는지 모르기 때문에 object일 때와 Map일 때를 성능 비교해봤다.
아래의 PC 사양에서 performance.now()를 사용해 Map, object 각각 100, 1000, 100000개의 데이터를 넣고 총 5번씩 set, read일 때를 테스트했다.
OS: Windows 10 Home 64bit
RAM: 16384MB
CPU: i7-7700HQ, 2.80GHz (8 CPUs)
Storage: SAMSUNG MZNLN256HMHQ-00000
테스트에 사용한 코드는 아래와 같다.
// object
test('performance', () =>{
    const listenMiddleware = createMiddleware();
  
    let cnt = 0;
    let t0 = performance.now()
    for (let i=0;i<100;i++) {
      listenMiddleware.addListener('TEST', () => {
        cnt += 1;
      });
    }
    let t1 = performance.now()
    console.log(t1-t0)
    t0 = performance.now()
    const middleware = listenMiddleware(mockStore)(mockNext);
    middleware({ type: 'TEST' });
    console.log(t1-t0)
    expect(Object.keys(listenMiddleware.listeners).length).toBe(100);
    expect(cnt).toBe(100);
})
// Map
test('performance', () => {
  const listenMiddleware = createMiddleware();
let cnt = 0;
  let t0 = performance.now()
  for (let i=0;i<100;i++) {
    listenMiddleware.addListener('TEST', () => {
      cnt += 1;
    });
  }
  let t1 = performance.now()
  console.log(t1-t0)
  t0 = performance.now()
  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });
  t1 = performance.now()
  console.log(t1-t0)
  expect(listenMiddleware.listeners.size).toBe(100);
  expect(cnt).toBe(100);
});
테스트 결과
평균은 다음의 계산 식을 사용해 평균값을 얻었다.
avg=(n1+…+n5)/5
퍼센트 계산은 각각의 평균값을 사용해 다음과 같은 식으로 얻었다.
percentage=(x-y)/x*100(x>y)
결론
위 표에서 알 수 있듯이 현재 상황에서 데이터가 적을 때는 Map과 object는 별 차이가 안 나지만 많을수록 Map이 더 빨라지는, 유의미한 차이가 난다.
하지만 ms단위로 차이가 난다는 점, 100개 이상의 listener를 등록할지가 미지수지만, object에서 Map으로 바꾸는 데는 그렇게 어렵지 않았으므로 이 결론을 토대로 이슈를 만들고 오픈소스에 기여했다.