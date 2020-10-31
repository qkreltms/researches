# 나의 Modal 컴포넌트 진화과정

## 목차
1. Bootstrap에서 쓰는 방식
2. Hackatalk에서 배운 방식 - context를 이용해서 global하게 쓰기
3. Ant-design에서 배운 방식 - 함수형으로 만들어 재활용하기
---

## Bootstrap에서 쓰는 방식
대학교 3학년 때 js에 첫 발을 내딛고 데이트 어플을 만들때였습니다.
이 때는 React 없이 바닐라 js를 사용했고, 그 때는 Bootstrap이 대세였습니다. 
이 때는 Modal을 어떻게 썼는지 볼까요?
Bootstrap 공식홈페이지에서 가져온 예제 코드입니다.

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


한 동안 이 방식을 애용했었죠. React로 넘어오면서는 중복을 줄이기 위해 컴포넌트화를 진행하고 ```props.isShow```로 키고 끄는 형태로 사용하게 됩니다.
거기에 더해서 Modal을 최상단에 DOM 두기 위해 Portal을 사용하기도 했습니다.

쓰려는 페이지마다 컴포넌트를 불러와서 props를 넘겨줘야 하고 그에 따른 state를 만들어줘서 계속해서 중복이 발생했지만, 크게 불편함을 느끼지 않고 사용해왔습니다.

그러다가 Dooboolab이라는 곳에서 오픈소스 기여를하다가 한번의 전환점을 맞이하게 됩니다.

---
## Hackatalk에서 배운 방식 - context를 이용해서 global하게 쓰기

Portal을 사용할 필요가 없고
중복코드를 상당히 줄여주고
함수형으로 호출이 가능하고 
컴포넌트를 불러올 필요가 없습니다.


그 방법은 바로...

Context API를 사용해 Modal ref를 주입하는 방식입니다. 

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

이 방식을 배운다음에 바로 제가 참여중인 프로젝트에 이 방식을 적용했습니다. 덕분에 한동안은 잘 쓸수 있었죠.

하지만 단점이 있습니다. 
1. Context API또는 Redux/MobX를 사용해야하기 때문에 Modal을 사용하려면 Provider로 주입해 줘야한다는 점
2. Modal 컴포넌트의 ref를 Store에 주입해줘야 한다는 점
3. 하나의 Context API에서 사용된 Modal은 한번에 여러번 띄울수 없다는 점입니다. 

그러다가 어느날... 우연히 여러 오픈소스를 뜯어보다가 오늘 얘기하고 싶은, 더 혁신적인 방법을 찾게됩니다.

---
## Ant-design에서 배운 방식 - 함수로 만들어 재활용하기

핵심은 ```ReactDOM.render``` 입니다.

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
Ant-design 에서 Modal 코드만 빼오면서 여러 기능을 살펴보겠습니다.

이제 예제를 시작하겠습니다. 먼저,

Codesandbox에서 React 세팅을 하고 Modal 컴포넌트는 간단히 Reactstrap에서 쓰는 걸로 대체하겠습니다.

1. Codesandbox.io에 접속해 React + Typescript를 선택합니다.

1. reactstrap, @types/reactstrap을 설치합니다.

1. index.tsx 파일에서 코드 한줄 추가합니다.

```js
import "bootstrap/dist/css/bootstrap.min.css";
```

1. src/myModal.tsx 파일을 생성합니다.

1. confirm 함수 코드를 작성합니다. 이 함수의 컨트롤러의 역할을 합니다.
```js
export const confirm = (config: ConfirmDialogProps = {}) => {
  // div를 생성합니다.
  const div = document.createElement("div");
  document.body.appendChild(div);
  let currentConfig: ConfirmDialogProps = { ...config, isVisible: true };

  const destroy = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }

    for (let i = 0; i < destroyFns.length; i += 1) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  };

  // 이 함수에서 Modal 컴포넌트를 렌더링 합니다.
  const render = ({ ...props }: ConfirmDialogProps) => {
    setTimeout(() => {
      // 위에서 미리 만든 div에 Modal 컴포넌트를 달아줍니다.
      ReactDOM.render(<ConfirmDialog {...props} />, div);
    });
  };

  const update = (newConfig: ConfirmDialogProps) => {
    currentConfig = {
      ...currentConfig,
      ...newConfig
    };
    render(currentConfig);
  };

  const close = () => {
    currentConfig = {
      ...currentConfig,
      isVisible: false,
      afterClose: destroy
    };
    render(currentConfig);
  };

  // render 함수를 실행합니다.
  render(currentConfig);

  destroyFns.push(close);

  return {
    close: destroy,
    update
  };
};

export default confirm;
```

1. Modal에 사용되는 state의 재활용을 위해서 hook을 하나 만들어줍니다.
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

1. 이제 Modal 컴포넌트를 만듭니다.
```js

export interface ConfirmDialogProps {
  onClickOk?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
  isVisible?: boolean;
  isCloseOnClick?: boolean;
  message?: string;
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
      /* 받은 props를 그대로 contents에 넣어줍니다. */
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

1. 모든 Modal을 닫을 수 있는 코드를 추가해줍니다.
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

1. 마지막으로 App.tsx에서 우리가 만든 Modal을 호출해보겠습니다.
```js
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
          confirm({ message: "3" }).close();
        }}
      >
        confirm
      </button>
    </div>
  );
}
```

위에 사용된 코드는 [여기](https://codesandbox.io/s/mymodal-kw19e?file=/src/App.tsx)서 볼 수 있습니다.

1. 코드 재활용하기
```contents```를 분리했으니 ```confirm()```에 값을 넣어 원하는 contents로 바꿀 수 있습니다. 예를 들어 버튼이 하나만 있는 warn 등이 있습니다.
```js
export function withWarn(props: ConfirmDialogProps): ConfirmDialogProps {
  return {
    contents: ...
  };
}

export warn = confirm(withWarn)
```

1. 하나의 모달 재활용하기 - update 활용
```confirm().update()```를 활용하면 업데이트된 props를 보냄으로써 재활용이 가능합니다. 
