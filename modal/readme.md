# 나의 Modal 컴포넌트 진화과정

## 목차
1. Bootstrap에서 쓰는 방식
2. Hackatalk에서 배운 방식 - contextAPI와 ref를 이용해서 global하게 쓰기.
3. Ant-design에서 배운 방식 - 함수형으로 만들어 재활용하기

## 내 첫 Modal 컴포넌트
대학교 3학년 때 js에 첫 발을 내딛고 데이트 어플을 만들때였죠.
이 때는 React 없이 바닐라 js를 사용했고, 그 때는 Bootstrap이 대세였습니다.
이 때는 Modal을 어떻게 썼는지 볼까요?
공식홈페이지에서 가져온 예제 코드입니다.

```
<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#staticBackdrop">
  Launch static backdrop modal
</button>

<!-- Modal -->
<div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Understood</button>
      </div>
    </div>
  </div>
</div>
```
Modal을 쓰려는 페이지에 두고 버튼을 누르면 display 속성을 'none', 'block'으로 바꿔, 키고 끄는 형식입니다.
한 동안 이 방식을 애용했었죠. React로 넘어오면서는 중복을 줄이기 위해 컴포넌트화를 진행하고 ```props.isShow```로 키고 끄는 형태로 사용하게 됩니다.
거기에 더해서 Modal을 최상단에 DOM 두기 위해 Portal을 사용하기도 했습니다.

쓰려는 페이지마다 컴포넌트를 불러와서 props를 넘겨줘야 하고 그에 따른 state를 만들어줘야 됐지만, 크게 불편함을 느끼지 않고 사용해왔습니다.

그러다가 Dooboolab이라는 곳에서 오픈소스 기여를하다가 한번의 전환점을 맞이하게 됩니다.

Portal을 사용할 필요가 없고
함수형으로 호출이 가능하며 
컴포넌트를 불러올 필요가 없습니다.
그 방법은 바로....
Context API를 사용해 ref를 주입하는 방식입니다.

// 출처: https://github.com/dooboolab/hackatalk/blob/master/client/src/providers/ProfileModalProvider.tsx
```
import React, { MutableRefObject, useReducer } from 'react';

import { Ref as ProfileModalRef } from '../components/shared/ProfileModal';
import { User } from '../types/graphql';
import createCtx from '../utils/createCtx';

interface ShowModalParams {
  user: User;
  deleteMode: boolean;
  onDeleteFriend?: () => void;
  onAddFriend?: () => void;
}

export interface State {
  user: User;
  deleteMode: boolean;
  modal?: React.MutableRefObject<ProfileModalRef | null>;
}

interface Context {
  state: State;
  showModal: (showModalParams: ShowModalParams) => void;
}

const [useCtx, Provider] = createCtx<Context>();

export enum ActionType {
  ShowModal = 'show-modal',
}

export interface Payload extends State {
  onDeleteFriend?: () => void;
  onAddFriend?: () => void;
}

const initialState: State = {
  user: {
    id: '',
    nickname: '',
    photoURL: '',
    statusMessage: '',
  },
  deleteMode: false,
  modal: undefined,
};

type Action = { type: ActionType.ShowModal; payload: Payload };

interface Props {
  children?: React.ReactElement;
}

type Reducer = (state: State, action: Action) => State;

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

function ProfileModalProvider(props: Props): React.ReactElement {
  const [state, dispatch] = useReducer<Reducer>(reducer, initialState);

  const actions = {
    showModal: showModal(dispatch),
  };

  return <Provider value={{ state, ...actions }}>{props.children}</Provider>;
}

const ProfileContext = {
  useProfileContext: useCtx,
  ProfileModalProvider,
};

export { useCtx as useProfileContext, ProfileModalProvider };
export default ProfileContext;
```

```

// https://github.com/dooboolab/hackatalk/blob/master/client/src/components/navigation/MainStackNavigator.tsx
function RootNavigator(): ReactElement {
  const navigation = useNavigation();
  const { state } = useProfileContext();
  const modalEl = useRef(null);
  state.modal = modalEl;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
      }}
    >
      <StatusBar />
      <MainStackNavigator />
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


    <ProfileModalProvider>
      // 주입할 컴포넌트
      <RootComponent />
    </ProfileModalProvider>
```


핵심은 위와 같이 Context API를 만들고 showModal를 dispatch해주면 주입한 state.modal이 열리는 형식입니다.


이 코드를 이해하는데 시간이 좀 걸렸지만, 상당히 혁신적인 방법이라고 느꼈습니다. 특히, 함수형으로 호출이 가능하다는게 크게 다가왔죠. 

이 방식을 배운다음에 바로 제가 참여중인 프로젝트에 이 방식을 적용했습니다. 덕분에 한동안은 잘 쓸수 있었죠.

그러다가 어느날... 우연히 여러 오픈소스를 뜯어보다가 오늘 얘기하고 싶은, 더 혁신적인 방법을 찾게됩니다.

## Ant-design

핵심:   const div = document.createElement('div');
  document.body.appendChild(div);
   ReactDOM.render(...)
   
```
export default function confirm(config: ModalFuncProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  // eslint-disable-next-line no-use-before-define
  let currentConfig = { ...config, close, visible: true } as any;

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    const triggerCancel = args.some(param => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args);
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      // eslint-disable-next-line no-use-before-define
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  }

  function render({ okText, cancelText, prefixCls, ...props }: any) {
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     * Sync render blocks React event. Let's make this async.
     */
    setTimeout(() => {
      const runtimeLocale = getConfirmLocale();
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

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterClose: destroy.bind(this, ...args),
    };
    render(currentConfig);
  }

  function update(newConfig: ModalFuncProps) {
    currentConfig = {
      ...currentConfig,
      ...newConfig,
    };
    render(currentConfig);
  }

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}
```

장점: 함수로 호출가능
단점:
afterClose 일 때 컴포넌트를 삭제한다.
=> dom 재활용? => DOM 재활용시 고려할 이슈가 많다 하나? 여러개 허용?, 하나만 혀용하고 에니메이션이 있는 modal이 있을 때 그 것을 종료하고 삭제, 여러개 일 때 각 DOM에 유니크 id를 부여하고 식별 가능해야 됨 등등 난이도 상승, 이것에 투자할 가치가 있는가??(DOM 하나 삭제, 생성 성능상 이슈는 적음)


한번에 여러 모달 띄우기
하나 모달 띄울 때 나머지 모달 닫기
https://codesandbox.io/s/mymodal-kw19e?file=/src/myModal.tsx




