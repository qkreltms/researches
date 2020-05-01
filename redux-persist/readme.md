# Redux Persist를 소개합니다.
**Reducer의 State값을 Web storage(이하 Storage라 지칭)에 저장/관리합니다.**

흔히 여러 컴포넌트를 거치지 않고 손쉽게 State를 전달하기 위해 혹은 분리해서 중앙화 하기 위해 Redux를 사용합니다.

하지만 Redux에 저장된 데이터는 새로고침 버튼을 누르거나 종료하는 순간 날아가 버리고 맙니다. 
날아가는 것을 방지하기 위해서 흔히 데이터를 Storage에 저장하는데요. 

Redux Persist의 ```persistReducer```를 Reducer를 특정 Reducer와 결합해주기만 하면 rehydrate(재수화)라는 과정을 거친후 이 Reducer에 액션이 Dispatch 때마다 적절히 Stroage에 데이터를 저장/관리해줍니다. 여기서 말하는 재수화는 storage에 저장된 데이터를 가져오는 과정을 말합니다.

Redux Persist는 어떤 면에서는 미들웨어와 비슷한 역할을 합니다. Reducer의 State값을 Javascript Web Storage API를 통해 get/set을 하기 전 Reducer의 특정 State만 저장을 하게 할 수도 있고 암호/복호화를 할 수 도있으니까요. 참고로 Storage에서 delete를 하지 않습니다. 그 대신 State Reconsiler라는 기능을 제공해 오브젝트 병합을 어떻게 할지 결정할 수 있죠. 

---
## 목차
아래의 3가지로 항목을 나눠 진행하겠습니다.
1. Counter 예제에 Redux Persist 입히기 
       
   (독자분들은 어느정도 React.js를 안다고 가정하고 예제는 따로 설명치 않겠습니다.)

2. 마법같은 Redux Persist를 Deep하게 알아보기
 
   Redux Persist의 코드를 살펴보며 작동원리를 알아보겠습니다.

3. 여러 기능
   
   Redux Persist에서 제공하는 여러 기능에 대해서 알아보겠습니다.
---
## 1. Counter 예제에 Redux Persist 입히기
Counter 예제:

[![Edit counter](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/counter-mdlqq?fontsize=14&hidenavigation=1&theme=dark)


[```counterPersistConfig```](https://github.com/rt2zz/redux-persist/blob/master/src/types.js#L13-L30)를 만들어서 ```persistReducer```의 첫 번째 인자로 넣어줍니다.


그리고 Counter 예제에 이미 구현된 ```counterReducer```를 ```persistReducer```의 두 번째 인자로 넣어줍니다.


index.js
---
```js
const counterPersistConfig = {
  key: "counter",
  storage: storage
};

const rootReducer = combineReducers({
  counterReducer: persistReducer(counterPersistConfig, counterReducer)
});
```

Persist Store을 생성해줍니다.
```js
const store = createStore(rootReducer);
const persistor = persistStore(store);
```

Provider를 연결해줍니다.
```js
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
```
완료했습니다! 간단하죠?

이제 새로고침해도 초기화 되지 않는것을 확인할 수 있습니다. 

![vv](./1.gif);

완성본: 

[![Edit redux-persist-counter](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/redux-persist-counter-wdqle?fontsize=14&hidenavigation=1&theme=dark)

우리가 해야할 것을 정리하면 이렇습니다.
1. 원하는 Reducer에 ```persistReducer``` 감싸주기
2. Persist Store 만들기
3. Persist Provider 연결하기

---
## 2. 마법같은 Redux Persist를 Deep하게 알아보기

연결만 해주면 알아서 state 값을 저장하는게 저에게는 마치 마법과 같았습니다. 실제 코드를 뜯어보며 마법이 이뤄지는 원리를 알아보겠습니다.

</br>

다시한번 위의 Counter 예제 완성본을 보고 어떤 일이 일어나는지 보겠습니다.


1. 콘솔 창에 ```loading...```이 나타납니다.
2. Redux dev console 창을 확인하면 ```persistReducer```가 감싸진 각각의 Reducer들은 REHYDRATE 액션이 호출됩니다.
3. F12를 눌러 DevTools 창에서 Application > Storage > Local Storage 항목을 확인하면 각 Reducer의 State 값이 저장된 것을 확인할 수 있습니다. 

위의 결과를 토대로 질문하고 답하는 Q/A 형식으로 진행하겠습니다.

### Q) 1. ```<PersistGate/>```의 역할은 무엇인가요?
 
먼저 ```<PersistGate/>```의 bootstraped 라는 state 변수의 초기값이 false 이므로 props로 전달받은 Loading 컴포넌트를 보여줍니다. 

[react.js](https://github.com/rt2zz/redux-persist/blob/d7efde9115a0bd2d6a0309ac6fb1c018bf06dc30/src/integration/react.js#L64)
---
```js
  render() {
    //...
    return this.state.bootstrapped ? this.props.children : this.props.loading
  }
```

이전에 ```persistConfig``` 오브젝트에 넣은 key값이 기억나시나요? 

먼저 기록(Register) 과정을 거칩니다. 

Redux Persist에서 이 값 별로 Reducer를 구분하며 다른 Store의 ```registry: []```라는 State에 저장해 기억합니다. 

그 후에 이미 Storage에 저장된 Reducer의 State값이 있다면 그 값을 가져옵니다. 

</br>


없다면 Storage에 State 값을 저장하는 재수화 과정을 거칩니다. 


모든 Reducer의 재수화가 완료되면 다른 Store에 저장된 또다른 state인 ```bootstrapped: boolean```의 값이 ```true```가 되면 ```<PersistGate/>```의 state 값을 바꿔 로딩을 해제합니다.

</br>

### Q) 2. REHYDRATE 액션은 어디서 호출되나요? 
이전에 Counter 예제에서 ```persistReducer()```가 호출되는 것을 볼 수 있습니다. 
```js
const rootReducer = combineReducers({
  counterReducer: persistReducer(counterPersistConfig, counterReducer)
});
```

```persistReducer```에 첫번째 인자로 config값을 넣어주고 두 번째로 Reducer를 넣어줍니다. 코드를 한번 뜯어볼까요?

persisReducer.js
---

```ts
// 아래는 persistReducer 코드의 일부분입니다.
export default function persistReducer<State: Object, Action: Object>(
  config: PersistConfig, // 첫 번째 인자는 config
  baseReducer: (State, Action) => State // 두 번째인자는 Reducer입니다.
): (State, Action) => State & PersistPartial {
//...
  return (state: State, action: Action) => {
    //...
    
    // 여기서 어떤 액션이 오면 PERSIST 액션을 탐지 후 기능을 수행하고 두 번째 인자로 들어온 Reducer를 반환합니다.
    // 나머지 액션도 비슷합니다.
    if (action.type === PERSIST) {
      return {
        ...baseReducer(restState, action),
        _persist: { version, rehydrated: false },
      }
    } else if (action.type === PURGE) {
      //...
      return {
        ...baseReducer(restState, action),
        _persist,
      }
    } else if (action.type === FLUSH) {
      //...
      return {
        ...baseReducer(restState, action),
        _persist,
      }
    } else if (action.type === PAUSE) {
      //...
    } else if (action.type === REHYDRATE) {
    //...
    }
```

아하! ```persistReducer```는 Reducer에 이미 존재하는 액션 외에 다른 액션: PERSIST, PURGE, FLUSH, PAUSE, REHYDRATE을 추가적으로 탐지해 특정 기능을 수행하는 기능을 붙여주는군요.

그 다음으로 ```persistStore()```를 알아보겠습니다.

Counter 예제에서 아래의 방법으로 호출되었죠?
```js
const store = createStore(rootReducer);
const persistor = persistStore(store);
```

```persistStore()```의 코드를 뜯어보면 아래의 명령문을 발견할 수 있습니다.

persistStore.js
---
```js
  if (!(options && options.manualPersist)){
    persistor.persist()
  }
```



 ```persistStore.persist()``` 함수를 뜯어보면 아래와 같은 명령문으로 이뤄졌네요.


```js
    persist: () => {
      store.dispatch({ type: PERSIST, register, rehydrate })
    },
```

아하! 여기서 ```PERSIST``` 액션을 호출해주고 호출되면 각각의 ```persistReducer```에서 일련의 과정을 거칩니다.

주제와 별개로 구조를 알아보자면 이 과정을 따라가다 보면 기록과정도 있고

persistReducer.js
---
```js
action.register(config.key)
```

이미 저장된 데이터를 Storage에서 가져오는 과정도 있고

```js
 getStoredState(config).then(...)
```

저장된 데이터가  없을 때는 재수화해주는 과정도 있습니다.
```js
    } else if (action.type === REHYDRATE) {
      // noop on restState if purging
      if (_purge)
        return {
          ...restState,
          _persist: { ..._persist, rehydrated: true },
        }

      // @NOTE if key does not match, will continue to default else below
      if (action.key === config.key) {
        let reducedState = baseReducer(restState, action)
        let inboundState = action.payload
        // only reconcile state if stateReconciler and inboundState are both defined
        let reconciledRest: State =
          stateReconciler !== false && inboundState !== undefined
            ? stateReconciler(inboundState, state, reducedState, config)
            : reducedState

        let newState = {
          ...reconciledRest,
          _persist: { ..._persist, rehydrated: true },
        }
        return conditionalUpdate(newState)
      }
```

이외에도  Transforms, ```conditionalUpdate```(blacklist, whitelist), State Reconciler의 과정도 중간에 있지만 이것들이 어떤 기능인지 뒤에가서 설명하겠습니다.

## 3. 여러 기능

### Workflow
beforeLift()-- ![ggg](https://user-images.githubusercontent.com/25196026/73251174-57203700-41b0-11ea-93d9-c1abb900aabc.png)

                                      
### ```persistor.purge()```를 사용해 Local storage에 저장된State 초기화하기

1.원하는 부분에 purge()함수를 호출한다.

src\pages\loginPage\loginPage.tsx
```ts
import { persistor } from "../../stores";

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // on login success callback function
  async onLoginSuccess(auth: AuthState) {
    auth.isAuthenticated = true;
    this.props.setAuth(auth);
    // redux-persist에 의해 local storage에 저장된 모든 데이터 초기화
    await persistor.purge();

    this.moveNextPage();
  }
```

2.초기화를 원하는 reducer에 PURGE 액션을 구현한다.

src\stores\dataStore\analysisDataStore-reducer.ts
```ts
import { PURGE } from "redux-persist";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// analysis data reducer
export const AnalysisDataReducer = (state: AnalysisDataStoreState = initState(), action: AnalysisDataStoreAction) => {
  switch (action.type) {
    case PURGE: {
      return initState();
    }

    case SET_ANALYSISES: {
      return {
        ...state,
        analysises: action.data as Analysis[]
      };
    }

    case SET_SELECTED_ANALYSIS: {
      return {
        ...state,
        selectedAnalysis: action.data as Analysis
      };
    }

    default: {
      return state;
    }
  }
};
```

이제 onLoginSuccess 함수의 ```persistor.purge()```가 호출될 때마다 기본적으로 storage에 저장된 config.key에 따라 데이터가 삭제되고 리듀서에 PURGE 액션이 구현된 곳은 state가 초기화된다. 

간혹, PURGE action이 호출 됐음에도 불구하고 storage가 비워지지 않는 경우가 있다. 예를 들어 componentDidMount()에서 액션을 호출 할 경우 여러번의 REHYDRATE 액션이 호출되어 Race conditoin이 발생할 수 있다. 이와 같은 때에 Race condition을 의심하라.

## Blacklist, whitelist를 사용해 특정 state 또는 reducer storage에 저장되지 않게 하기
간단히 배열에 key(persistConfig.key)를 입력하면 해당 key를 제외한다.
```js
  // https://github.com/rt2zz/redux-persist/blob/master/src/createPersistoid.js#L110-L115 
  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.indexOf(key) === -1 && key !== '_persist')
      return false
    if (blacklist && blacklist.indexOf(key) !== -1) return false
    return true
  }
```
Blacklist를 사용하면 특정 key만 제외할 수 있고
Whitelist를 사용하면 특정 key만 허용한다.


특정 reducer의 특정 state 저장되지 않게하기:
1.config에 blacklist를 추가한다.

src\stores\rootReducer.ts
```ts
const analysisDataPersistConfig: PersistConfig<AnalysisDataStoreState> = {
  key: "analysisData",
  torage,
  blacklist: ["selectedAnalysis"]
}

export const rootReducer: Reducer<CombineReducers, AnyAction> = combineReducers<CombineReducers>({
  authReducer,
  appCoreReducer,
  selectedDataReducer,
  workListPageReducer,
  PatientDataReducer,
  StudyDataReducer,
  AssessmentDataReducer,
  AnalysisDataReducer: persistReducer(analysisDataPersistConfig, AnalysisDataReducer)
});
```

이제 AnalysisDataReducer의 selectedAnalysis는 local storage에 저장되지 않는다.

특정 reducer 저장되지 않게하기
src\stores\rootReducer.ts
```ts
const analysisDataPersistConfig: PersistConfig<AnalysisDataStoreState> = {
  key: "analysisData",
  storage,
  whitelist: []
}

export const rootReducer: Reducer<CombineReducers, AnyAction> = combineReducers<CombineReducers>({
  authReducer,
  appCoreReducer,
  selectedDataReducer,
  workListPageReducer,
  PatientDataReducer,
  StudyDataReducer,
  AssessmentDataReducer,
  AnalysisDataReducer: persistReducer(analysisDataPersistConfig, AnalysisDataReducer)
});
```

이제 AnalysisDataReducer의 모든 state는 local storage에 저장되지 않는다.

### State Reconciler
*(특별한 이유가 없다면 사용할 필요 없음. default 값 사용(전달된 state 그대로 저장))*

state가 어떤식으로 새로오는 state와 합쳐질지 정의한다.

1. **hardSet** (`import hardSet from 'redux-persist/lib/stateReconciler/hardSet'`)
This will hard set incoming state. This can be desirable in some cases where persistReducer is nested deeper in your reducer tree, or if you do not rely on initialState in your reducer.
   - **incoming state**: `{ foo: incomingFoo }`
   - **initial state**: `{ foo: initialFoo, bar: initialBar }`
   - **reconciled state**: `{ foo: incomingFoo }` // note bar has been dropped
2. **autoMergeLevel1** (default)
This will auto merge one level deep. Auto merge means if the some piece of substate was modified by your reducer during the REHYDRATE action, it will skip this piece of state. Level 1 means it will shallow merge 1 level deep.
   - **incoming state**: `{ foo: incomingFoo }`
   - **initial state**: `{ foo: initialFoo, bar: initialBar }`
   - **reconciled state**: `{ foo: incomingFoo, bar: initialBar }` // note incomingFoo overwrites initialFoo
3. **autoMergeLevel2** (`import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'`)
This acts just like autoMergeLevel1, except it shallow merges two levels
   - **incoming state**: `{ foo: incomingFoo }`
   - **initial state**: `{ foo: initialFoo, bar: initialBar }`
   - **reconciled state**: `{ foo: mergedFoo, bar: initialBar }` // note: initialFoo and incomingFoo are shallow merged


import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
```ts
src\stores\rootReducer.ts
const analysisDataPersistConfig: PersistConfig<AnalysisDataStoreState> = {
  key: "analysisData",
  storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["selectedAnalysis"]
}
```

autoMergeLevel2를 써야하는 이유: initial state가 업데이트되어 key가 하나 늘어났을 때 autoMergeLeve1, hardSet사용시 기존에 local storage에 저장된 값으로 덮어 씀으로 initial state의 새로운 key가 제거된다. [참조](https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975)

### Transforms(local storage에 저장되기 바로전, 저장소에서 가져올때 수행할 작업)
https://github.com/rt2zz/redux-persist/blob/master/README.md#transforms

### Storage Engines
https://github.com/rt2zz/redux-persist/blob/master/README.md#storage-engines

## 참조
https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975

https://github.com/rt2zz/redux-persist
