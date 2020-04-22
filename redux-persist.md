# Redux Persist를 소개합니다.
## Redux Persist란 무엇인가?
흔히 여러 컴포넌트를 거치지 않고 손쉽게 state를 전달하기 위해 혹은 분리해서 중앙화 하기 위해 Redux를 사용합니다.
하지만 이 state는 인터넷창의 새로고침 버튼을 누르거나 종료하는 순간 초기화 되고 맙니다. 
초기화를 방지하기 위해서 흔히 Web storage(이하 storage라 지칭)에 저장하는데요. 간편하게 redux-persist reducer과 특정 reducer를 결합해주면 특정 reducer에서 액션이 발동되면 stroage에 저장해주는 라이브러리가 바로 Redux-persist 입니다.

## 사용법:
1.먼저 persistReducer에 config값을 넣어주고 두 번째 인자로 Reducer를 넣어줍니다.
그렇게 하면 이미 존재하는 액션 외에 다른 액션 PERSIST, PURGE, FLUSH, PAUSE, REHYDRATE 을 추가적으로 탐지해서 기능을 수행이 가능합니다.

src/stores/rootReducer.ts

```ts
  AnalysisDataReducer: persistReducer(analysisDataPersistConfig, AnalysisDataReducer)
```
실제 코드를 보면 어떤 기능을 수행 후 return 값으로 인자로 전달 받은 reducer을 그대로 반환하는것을 볼 수 있습니다.
```ts
export default function persistReducer<State: Object, Action: Object>(
  config: PersistConfig,
  baseReducer: (State, Action) => State
): (State, Action) => State & PersistPartial {
//...
  return (state: State, action: Action) => {
    //...
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
  
  _pStpre은 persistStore()함수를 호출할때 같이 생성된 별도의 store입니다. 이 store의 역할은 persistReducer가 래핑된 모든 reducer가 REHYDRATE 액션이 호출됐는지 확인 후 PersistGate에 loading이 완료(bootstrapped)됐다는 것을 알려줍니다.
  
 https://github.com/rt2zz/redux-persist/blob/master/src/integration/react.js#L64
 ```
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
