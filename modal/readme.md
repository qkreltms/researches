# 나의 Modal 컴포넌트 진화과정

## 목차
1. Bootstrap에서 배우다. - CSS 활용하기
2. Hackatalk에서 배우다. - Context API를 이용해서 global하게 쓰기
3. Ant-design에서 배우다. - ReactDOM.render()
3.1. 예제
---

## 1. Bootstrap에서 배우다. - CSS 활용하기
대학교 3학년 때 js에 첫 발을 내딛고 데이트 어플을 만들때였습니다.

이 때는 React 없이 바닐라 js를 사용했고, 그 때는 Bootstrap이 대세였습니다. 

Modal 코드를 보겠습니다. Bootstrap 공식홈페이지에서 가져온 예제 코드입니다.

```html
<!-- 트리거 버튼을 누르면 아래의 모달 컴포넌트가 디스플레이됩니다. -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#staticBackdrop">
  Launch static backdrop modal
</button>

<!-- Modal -->
<div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  // ...
</div>
```

Modal을 쓰려는 페이지에 두고 버튼을 누르면 display 속성을 'none', 'block'으로 바꿔, 키고 끄는 형식입니다.


한 동안 이 방식을 애용했습니다. 

React를 쓰기 시작하면서 중복을 줄이기 위해 컴포넌트화를 진행하고 `props.isShow`로 키고 끄는 형태로 사용했습니다.

거기에 더해서 Modal을 최상단에 DOM 두기 위해 Portal을 사용하기도 했습니다.

여러 개선을 거쳤지만 단점이 있었습니다.
`
쓸 때 마다 컴포넌트를 불러와서 props를 넘겨줘야 하고 그에 따른 state를 만들어줘서 계속해서 중복이 발생했습니다.
`

그러다가 Dooboolab이라는 곳에서 오픈소스 기여를하다가 한번의 전환점을 맞이하게 됩니다.

---
## 2. Hackatalk에서 배우다. - Context API를 이용해서 global하게 쓰기

```
1. Portal을 사용할 필요가 없고
2. 함수로 호출이 가능하고 
3. 쓸 때마다 컴포넌트를 불러올 필요가 없어 중복코드를 상당히 줄였습니다.
```

그 방법은 바로...

Context API를 사용하고 Modal의 ref를 global state에 주입하는 방식입니다. 

핵심은 Modal 용 Context API를 만들고 모달을 여는 액션을 dispatch해주면 주입한 state.modal이 열리는 형식입니다.


```js
const initialState: State = {
  user: {
    id: '',
    nickname: '',
    photoURL: '',
    statusMessage: '',
  },
  deleteMode: false,
  // ref를 주입받을 modal state입니다.
  modal: undefined,
};

// showModal action입니다.
const showModal = (dispatch: React.Dispatch<Action>) => ({
  user,
  deleteMode,
  onDeleteFriend,
  onAddFriend,
}: ShowModalParams): void => {
  dispatch({
    type: ActionType.ShowModal,
    payload: {
      user,
      deleteMode,
      onDeleteFriend,
      onAddFriend,
    },
  });
};

// 액션을 처리할 Reducer입니다.
const reducer: Reducer = (state = initialState, action) => {
  const { type, payload } = action;
  const { modal } = state;
  switch (type) {
    case ActionType.ShowModal:
      if (modal && modal.current) {
        modal.current.setUser(payload.user);
        modal.current.showAddBtn(!payload.deleteMode);
        modal.current.open();
      }
      return {
        ...state,
        user: payload.user,
        deleteMode: !payload.deleteMode,
      };
    default:
      return state;
  }
};

// provider로 하위 컴포넌트에 showModal 액션을 전달해 줍니다.
function ProfileModalProvider(props: Props): React.ReactElement {
  const [state, dispatch] = useReducer<Reducer>(reducer, initialState);

  const actions = {
    showModal: showModal(dispatch),
  };

  return <Provider value={{ state, ...actions }}>{props.children}</Provider>;
}
```
```js
// 모바일 앱이지만, 웹과 비슷합니다.
//우리의 modal 컴포넌트가 있는 곳입니다. 웹에 비유하면 App.jsx 위치쯤이라 보면 됩니다.

function RootNavigator(): ReactElement {
  const navigation = useNavigation();
  const { state } = useProfileContext();
  const modalEl = useRef(null);
  // 컨텍스트에 modal ref를 주입해줍니다.
  state.modal = modalEl;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
      }}
    >
      // ...
      // 우리의 Modal 컴포넌트!
      <ProfileModal
        testID="modal"
        ref={state.modal}
        onChatPressed={(): void => {
          if (state.modal && state.modal.current) {
            state.modal.current.close();
          }
          navigation.navigate('Message');
        }}
      />
    </View>
  );
}
```
```js
// 이제 원하는 컴포넌트에 Provider로 액션을 전달하고 원하는 때에 액션을 dispatch 하면 됩니다. 
    <ProfileModalProvider>
      <RootComponent />
    </ProfileModalProvider>
```

이 코드를 이해하는데 시간이 좀 걸렸지만, 상당히 혁신적인 방법이라고 느꼈습니다. 특히, 함수로 호출이 가능하다는게 크게 다가왔죠. 

이 방식을 배운다음에 바로 제가 참여중인 실무 프로젝트에 이 방식을 적용했습니다. 덕분에 한동안은 잘 쓸수 있었죠.

하지만 여기에도 단점이 있습니다. 
1. Context API 또는 Redux/MobX를 사용해야하기 때문에 Modal을 사용할 때마다 Provider로 주입해 줘야한다는 점
2. 하나의 Context API에서 사용된 Modal은 한번에 여러번 띄울수 없다는 점입니다. 

그러다가 어느날... 우연히 여러 오픈소스 코드를 살펴보다가 오늘 얘기하고 싶은, 더 혁신적인 방법을 찾게됩니다.

---
## 3. Ant-design에서 배우다. - ReactDOM.render()

핵심은 ```ReactDOM.render()```을 사용해  생성한 div를 React Element로 만드는 부분 입니다.

```js
export default function confirm(config: ModalFuncProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  // eslint-disable-next-line no-use-before-define
  let currentConfig = { ...config, close, visible: true } as any;

  function render({ okText, cancelText, prefixCls, ...props }: any) {
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     * Sync render blocks React event. Let's make this async.
     */
    setTimeout(() => {
      // js 코드로 Modal 컴포넌트를 렌더링합니다.
      ReactDOM.render(
        <ConfirmDialog
          {...props}
          prefixCls={prefixCls || `${getRootPrefixCls()}-modal`}
          rootPrefixCls={getRootPrefixCls()}
          okText={okText || (props.okCancel ? runtimeLocale.okText : runtimeLocale.justOkText)}
          cancelText={cancelText || runtimeLocale.cancelText}
        />,
        div,
      );
    });
  }

// render 함수를 호출합니다.
  render(currentConfig);

  return {
    destroy: close,
    update,
  };
}
```

간단히 ```confirm()```을 호출하는 형식으로 켤 수 있습니다.


Ant-design 에서 Modal 코드만 빼온 예제를 구현하며 이와 관련된 여러 기능을 살펴보겠습니다.

---
## 3.1. 예제

Codesandbox라는 Web IDE를 사용하겠습니다.
예제에 사용된 모든 코드는 [여기](https://codesandbox.io/s/mymodal2-forked-iquih?file=/src/App.tsx)서 볼 수 있습니다.

Modal 컴포넌트와 스타일은 간단히 Reactstrap에서 쓰는 걸로 대체하고 컨트롤하는 부분만 작성하겠습니다.

1. Codesandbox.io에 접속해 React + Typescript를 선택합니다.

2. reactstrap, @types/reactstrap을 설치합니다.

3. index.tsx 파일에서 코드 한줄 추가합니다.

```js
import "bootstrap/dist/css/bootstrap.min.css";
```

4. src/myModal.tsx 파일을 생성합니다.

5. factory 함수 코드를 작성합니다. 이 함수의 컨트롤러 입니다.

    Modal 컴포넌트가 주어지면 삭제, 생성, 업데이트 등의 역할을 수행합니다. 
```js
interface Factory {
  Component?: any;
  onClosed?: () => void;
  onAfterClosed?: () => void;
  [x: string]: any;
}

export const factory = ({ Component, ...config }: Factory) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  let currentConfig: Factory = {
    ...config,
    isVisible: true,
    // modal이 닫히면 afterClose()가 실행됩니다. 
    afterClose: () => {
      if (typeof currentConfig.onAfterClose === "function") {
        currentConfig.onAfterClose();
      }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      destroy(config);
    }
  };

  const destroy = ({ ...config }: Factory) => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    // div가 unmounted 됐는지 확인합니다.
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }

    if (typeof config.onClosed === "function") {
      config.onClosed();
    }

    for (let i = 0; i < destroyFns.length; i += 1) {
      const fn = destroyFns[i];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  };

  const render = ({ ...config }: Factory) => {
    setTimeout(() => {
      return Component
        ? ReactDOM.render(<Component {...config} />, div)
        : new Error("컴포넌트가 없습니다.");
    });
  };

  const update = (newConfig: Factory) => {
    config = {
      ...currentConfig,
      ...newConfig
    };
    render(config);
  };

  const close = () => {
    const config = {
      ...currentConfig,
      isVisible: false,
      afterClose: () => {
        if (typeof currentConfig.onAfterClose === "function") {
          currentConfig.onAfterClose();
        }
        // 모달이 닫히면 제거됩니다.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        destroy(config);
      }
    };
    render(config);
  };

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update
  };
};
```

6. 공통적으로 모든 Modal에 사용되는 state의 재활용을 위해서 hook을 하나 만들어줍니다.
```js
export const useModal = (
  isVisible = true
): [boolean, () => void, () => void] => {
  const [isOpen, setIsOpen] = useState<boolean>(isVisible);

  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);
  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return [isOpen, open, close];
};
```

7. 이제 Modal 컴포넌트를 만듭니다.
```js
export interface ConfirmDialogProps {
  onClickOk?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
  isVisible?: boolean;
  isCloseOnClick?: boolean;
  message?: string;
  title?: string;
  okText?: string;
  closeText?: string;
  contents?: (
    isOpen: boolean,
    onClickOk?: ConfirmDialogProps["onClickOk"],
    onClickClose?: ConfirmDialogProps["onClickClose"],
    message?: string,
    okText?: string,
    closeText?: string
  ) => any;
}

export interface ContentProps {
  isOpen: boolean;
  onClickOk?: ConfirmDialogProps["onClickOk"];
  onClickClose?: ConfirmDialogProps["onClickClose"];
  message?: string;
  okText?: string;
  closeText?: string;
}
export const ConfirmDialog = ({
  isVisible = true,
  isCloseOnOk = true,
  okText = "OK",
  closeText = "Close",
  message = "",
  title = "",
  afterClose = () => {},
  onClickOk = (event: React.MouseEvent<HTMLButtonElement>) => {},
  onClickClose = (event: React.MouseEvent<HTMLButtonElement>) => {},
  contents = ({
    isOpen = true,
    onClickOk = (event: React.MouseEvent<HTMLButtonElement>) => {},
    onClickClose = (event: React.MouseEvent<HTMLButtonElement>) => {},
    message = "",
    okText = "OK",
    closeText = "Close"
  }: ContentProps) => (
    <Modal isOpen={isOpen} onClosed={() => afterClose()}>
      {title && <ModalHeader>{title}</ModalHeader>}
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <button type="button" onClick={onClickOk}>
          {okText}
        </button>
        <button type="button" onClick={onClickClose}>
          {closeText}
        </button>
      </ModalFooter>
    </Modal>
  )
}) => {
  const [isOpen, , close] = useModal(isVisible);

  const onClickOkHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClickOk(event);
    if (isCloseOnOk) {
      close();
    }
  };
  const onClickCloseHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClickClose(event);
    close();
  };
  return (
    <div>
      {contents({
        isOpen,
        onClickOk: onClickOkHandler,
        onClickClose: onClickCloseHandler,
        message,
        okText,
        closeText
      })}
    </div>
  );
};

```

8. 모든 Modal을 닫을 수 있는 코드를 추가해줍니다.
```js

export const destroyFns: Array<() => void> = [];

export const destroyAll = () => {
  while (destroyFns.length) {
    const close = destroyFns.pop();
    if (close) {
      close();
    }
  }
};
```

9. 이제 factory에 컴포넌트를 넣어 export 해줍니다.
```js
export const confirm = (config: ConfirmDialogProps) =>
  factory({ ...config, Component: ConfirmDialog });
```

10. 마지막으로 App.tsx에서 우리가 만든 Modal을 호출해보겠습니다.
```js
import { confirm, destroyAll } from "./myModal";
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <button
        type="button"
        onClick={() => {
          confirm({ message: "1" });
          confirm({ message: "2" });
          destroyAll();
          confirm({ message: "3" }).destroy();
          confirm({ message: "4" });
          // 위 결과가 어떻게 될지 코드실행전 한번 예상해보세요.
        }}
      >
        confirm
      </button>
    </div>
  );
}
```

11. warn 모달 만들기

간결해 질 수 있던 코드였지만 재활용을 위해서 여기까지 왔습니다.
지금까지 재활용 가능한 코드는 useModal, factory, 등 입니다.

위에 있던 코드를 재활용 관점에서 다시 보겠습니다.
```js
export const confirm = (config: ConfirmDialogProps) =>
  factory({ ...config, Component: ConfirmDialog });
```
factory에 파라메터 값을 넣어주면 변경이 가능하군요! 

여기서 config는 Modal Component에 props로 들어가는 값이라고 보시면 됩니다.
확인/취소 버튼이 있는 ConfirmDialog를 변형해서

 확인 버튼만 있는 warn을 만들어보겠습니다.
```js
export interface WithWarnConfig
  extends Factory,
    Pick<ConfirmDialogProps, "title" | "message"> {}

export const withWarn = (config: WithWarnConfig): ConfirmDialogProps => {
  return {
    ...config,
    contents: (onClickClose, onClickOk, contentMessage) => (
      <>
        <ModalBody>{contentMessage}</ModalBody>
        <ModalFooter style={{ justifyContent: "flex-end" }}>
          <Button
            style={{ width: "100px" }}
            autoFocus
            onClick={onClickOk}
            onKeyDown={(e: any) =>
              e.key === "enter" && onClickOk && onClickOk(e)
            }
            color="primary"
          >
            Confirm
          </Button>
        </ModalFooter>
      </>
    )
  };
};
```
