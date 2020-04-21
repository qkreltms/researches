# Redux Persist를 소개합니다.
## Redux Persist란 무엇인가?
흔히 여러 컴포넌트를 거치지 않고 손쉽게 state를 전달하기 위해 혹은 분리해서 중앙화 하기 위해 Redux를 사용합니다.
하지만 이 state는 인터넷창의 새로고침 버튼을 누르거나 종료하는 순간 초기화 되고 맙니다. 
초기화를 방지하기 위해서 흔히 Web storage(이하 storage라 지칭)에 저장하는데요. 이 것과 삭제 기능을 포함해서 Redux안에서 간편하게 하게 할 수 있는 라이브러리가 
바로 Redux Persist입니다. 실제로 코드를 살펴보면 Redux store을 하나 더 만들어서 여기에 특정 state를 저장하고 특정 액션이 발동되면
직렬화(serialize)해서 storage에 저장, storage에서 역직렬화(deserialize)후 불러와 사용합니다.

## 사용법:
1.먼저 기존의 Reducer에 [persistConfig](https://github.com/rt2zz/redux-persist/blob/master/src/types.js#L13-L30)를 만들고 persistReducer함수로 감싼다.

src/stores/rootReducer.ts

```ts
import { persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface CombineReducers {
  authReducer: AuthState;
  appCoreReducer: IAppCoreState;
  selectedDataReducer:  SelectedDataState;
  workListPageReducer: WorkListPageState;
  PatientDataReducer: PatientDataStoreState;
  StudyDataReducer: StudyDataStoreState;
  AssessmentDataReducer: AssessmentDataStoreState;
  AnalysisDataReducer: PersistPartial & AnalysisDataStoreState;
}

const analysisDataPersistConfig: PersistConfig<AnalysisDataStoreState> = {
  key: "analysisData",
  storage
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

2.persistStore함수의 반환값(persistor)을 

src/stores/Index.ts
```ts
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
export default store;
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

Redux dev tool 을 확인해보면 "PERSIST" 액션이 먼저 호출된 후 각 persisReducer에 연결된 reducer 마다 "REHYDRATE" 액션이 호출되면서 storage에 저장된 것을 확인할 수 있다.

저장이 발생하는 로직을 간단히 보면 단순히 먼저 store에서 getItem을 통해 값을 가져오고 "REHYDRATE" 액션이 호출될 때 setItem을 통해 저장하는 것 뿐이다.

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
