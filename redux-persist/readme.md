# Redux Persist를 소개합니다.
**Reducer의 State값을 Web storage(이하 Storage라 지칭)에 저장/관리합니다.**

흔히 여러 컴포넌트를 거치지 않고 손쉽게 State를 전달하기 위해 혹은 분리해서 중앙화 하기 위해 Redux를 사용합니다.

하지만 Redux에 저장된 데이터는 새로고침 버튼을 누르거나 종료하는 순간 날아가 버리고 맙니다. 
날아가는 것을 방지하기 위해서 흔히 데이터를 Storage에 저장하는데요. 

Redux Persist의 ```persistReducer```를 Reducer를 특정 Reducer와 결합해주기만 하면 이 Reducer에 액션이 Dispatch 때마다 적절히 Stroage에 데이터를 저장/관리해줍니다.

---
## 목차
아래의 3가지로 항목을 나눠 진행하겠습니다.
1. Counter 예제에 Redux Persist 입히기 
       
   (독자분들은 어느정도 React.js를 안다고 가정하고 예제는 따로 설명치 않겠습니다.)

2. Deep 하게 알아보기
 
   Redux Persist의 코드를 살펴보며 작동원리를 deep 하게 알아보겠습니다.

3. 여러 기능
   
   Redux Persist에서 제공하는 여러 기능에 대해서 알아보겠습니다.
---
## 1. Counter 예제에 Redux Persist 입히기
Counter 예제:

[![Edit counter](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/counter-mdlqq?fontsize=14&hidenavigation=1&theme=dark)


counterPersistConfig를 만들어서 persistReducer의 첫 번째 인자로 넣어줍니다.

이미 구현된 counterReducer를 persistReducer의 두 번째 인자로 넣어줍니다.


index.js
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
## 2. Deep 하게 알아보기

어떻게 Redux Persist를 사용하는지 대략 알았으니 이제는 코드를 살펴보면서 Deep 하게 알아보겠습니다.

다시한번 Counter 예제를 보고 어떤 일이 일어나는지 보겠습니다.


1. 콘솔 창에 ```loading...```이 나타납니다.
2. Redux dev console 창을 확인하면 ```persistReducer```가 감싸진 각각의 Reducer들은 REHYDRATE 액션이 호출됩니다.
3. console 창에서 Application > Storage > Local Storage 항목을 확인하면 각 Reducer의 State 값이 저장된 것을 확인할 수 있습니다. 

위의 결과를 토대로 궁금한 사항을 나눠봤습니다.

### Q) 1. 로딩을 왜/어떻게 구현했나요?

### Q) 2. REHYDRATE 액션을 호출한 적이 없는데 어디서 호출하나요? 
### Q) 3. ```persisReducer```는 어떻게 다른 액션을 탐지해서 기능을 수행하나요?
### Q) 4. 어떻게 저장이 되나요?

```persistReducer```에 config값을 넣어주고 두 번째 인자로 Reducer를 넣어줍니다.
이 Reducer에는 이미 존재하는 액션 외에 다른 액션: PERSIST, PURGE, FLUSH, PAUSE, REHYDRATE을 추가적으로 탐지해 특정 기능을 수행 후 저장하는 기능을 붙여줍니다.


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
이제 
2. store 객체 값을 persistStore의 인자로 넘겨줍니다.

src/stores/Index.ts
```ts
export const persistor = persistStore(store);
```



3.```<PersistGate/>```에 인자로 넘겨준다.

index.tsx
```ts
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
```

Redux dev tool 을 확인해보면 "PERSIST" 액션이 먼저 호출된 후 각 persisReducer에 연결된 reducer 마다 "REHYDRATE" 액션이 호출되면서 storage에 저장된 것을 확인할 수 있는데요. 여기서 PERSIST액션을 호출한 적이 없는데 도대체 어디서 해주는 걸까요? 바로 persistStore입니다. 코드를 보면 여기서 action을 호출해 주는것을 확인할 수 있습니다.
https://github.com/rt2zz/redux-persist/blob/master/src/persistStore.js#L126
```ts
  if (!(options && options.manualPersist)){
    persistor.persist()
  }
```

그럼이제 persist 액션이 호출되면 어떤 일이 일어나는지 살펴볼까요?
먼저 persistor오브젝트를 보겠습니다.
```
 let persistor: Persistor = {
    ..._pStore,
    purge: () => {
      let results = []
      store.dispatch({
        type: PURGE,
        result: purgeResult => {
          results.push(purgeResult)
        },
      })
      return Promise.all(results)
    },
    flush: () => {
      let results = []
      store.dispatch({
        type: FLUSH,
        result: flushResult => {
          results.push(flushResult)
        },
      })
      return Promise.all(results)
    },
    pause: () => {
      store.dispatch({
        type: PAUSE,
      })
    },
    persist: () => {
      store.dispatch({ type: PERSIST, register, rehydrate })
    },
  }

```
persist액션이 호출되면 먼저 register 함수가 호출되면서 REGISTER 액션이 호출됩니다. 
```
https://github.com/rt2zz/redux-persist/blob/master/src/persistReducer.js#L126
      action.register(config.key)
```
그 다음 실제로 storage에 저장하는 과정이 이뤄집니다.
https://github.com/rt2zz/redux-persist/blob/master/src/persistReducer.js#L126
```
 getStoredState(config).then(
        restoredState => {
          const migrate = config.migrate || ((s, v) => Promise.resolve(s))
          migrate(restoredState, version).then(
            migratedState => {
              _rehydrate(migratedState)
            },
            migrateErr => {
              if (process.env.NODE_ENV !== 'production' && migrateErr)
                console.error('redux-persist: migration error', migrateErr)
              _rehydrate(undefined, migrateErr)
            }
          )
        },
        err => {
          _rehydrate(undefined, err)
        }
      )
      
      ```
```
  let register = (key: string) => {
    _pStore.dispatch({
      type: REGISTER,
      key,
    })
  }
  ```
  
  _pStpre은 persistStore()함수를 호출할때 createStore()함수 호출로 같이 생성된 별도의 store입니다. 이 store의 역할은 persistReducer가 래핑된 모든 reducer가 REHYDRATE 액션이 호출됐는지 확인 후 PersistGate에 loading이 완료(bootstrapped)됐다는 것을 알려줍니다.
  
  
 https://github.com/rt2zz/redux-persist/blob/master/src/integration/react.js#L64
 ```
   // 
    let { bootstrapped } = persistor.getState()
    //...
    
   return this.state.bootstrapped ? this.props.children : this.props.loading
  ```

저장이 발생하는 로직을 간단히 보면 단순히 먼저 store에서 getItem을 통해 값을 가져오고 "REHYDRATE" 액션이 호출될 때 setItem을 통해 저장하는 것 뿐입니다.

```js
   //redux-persist/src/createPersistoid.js
   const storage = config.storage
   //...
   
    // line: 105
    writePromise = storage
      .setItem(storageKey, serialize(stagedState))
      .catch(onWriteFail)
```
```js
    //redux-persist/src/getStoredState.js
    // line: 24
    //...
    storage.getItem(storageKey).then(serialized => {
    //...
```

![vv](https://user-images.githubusercontent.com/25196026/73244197-474d2680-41a1-11ea-9037-4ba51dd760e2.png)

## Workflow
beforeLift()-- ![ggg](https://user-images.githubusercontent.com/25196026/73251174-57203700-41b0-11ea-93d9-c1abb900aabc.png)

                                      
## ```persistor.purge()```를 사용해 Local storage에 저장된State 초기화하기

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

## State Reconciler
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

## Transforms(local storage에 저장되기 바로전, 저장소에서 가져올때 수행할 작업)
https://github.com/rt2zz/redux-persist/blob/master/README.md#transforms

## Storage Engines
https://github.com/rt2zz/redux-persist/blob/master/README.md#storage-engines


## playground: 
https://codesandbox.io/s/redux-persist-test-cdytq

### 참조
https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975

https://github.com/rt2zz/redux-persist
