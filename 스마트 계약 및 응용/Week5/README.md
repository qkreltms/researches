## 5.1 Introduction to Solidity

[링크](https://docs.soliditylang.org/en/v0.8.12/)
Solidity is an object-oriented, high-level language for implementing smart contracts. Smart contracts are programs which govern the behaviour of accounts within the Ethereum state.

Solidity is a curly-bracket language. It is influenced by C++, Python and JavaScript, and is designed to target the Ethereum Virtual Machine (EVM)

Solidity is statically typed, supports inheritance, libraries and complex user-defined types among other features.

```sol
pragma solidity >=0.4.0 <0.6.0;

import filename;
import * as name from filename;
import filename from name;
import { name } from filename;
import github.com/ethereum/sample.sol as sample // remix의 경우 github.com를 자동으로 mapping해주기 때문에 github 접근 가능

/// @title 문서화를 도와주는 NatSpec 기능
/** @title 멀티라인은 \/**로 시작하면 된다. **/
// contract는 storage영역에 저장되고
// 함수의 파라메터는 memory영역에 저장된다.
contract SimpleStorage {
    /** @dev ...
    *   @param w width of the rectangle
    *   @param h height of the rectangle
    *   @return a ...
    *   @return b ...
    */
    // Single-line
    /* Multi-line*/
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```

- pragma는 solidity 0.4.0 버전을 기반으로 작성되었다는 것을 뜻하면 이후 버전 0.0.6 버전 직전까지에서도 정상 동작할 수 있게 한다. 이 줄을 통해 컨트랙트의 동작이 다를수 있는 환경에서 컴파일이 되지 않도록 보장한다. [^]0.[major].[minor]과 같은 형태가 되며 caret(^)은 해당 메이저 버전의 최신 버전까지 지원한다는 의미이다.

- pragma의 두번째 용도는 programming language의 특정 기능을 사용할 때이다. `pragma experimental ABIEncoderV2` <= 새로운 ABI encode를 활성화

- 다음의 storedData는 데이터베이스에서 함수를 호출함으로써 값을조회하거나 변경할 수 있는 하나의 영역이다. `this.` 키워드를 사용하지 않는다., state variable이라고 부른다.

- set함수를 호출하여 기존 값을 다른 값으로 덮어쓰는 것이 가능하지만 이전 숫자는 블록체인 히스토리 안에 여전히 저장된다. 참고로 블록체인은 블록을 삭제하더라도 블록체인에 계속 남아있다.

- State Variables
  - Values are permanently stored in contract storage
  - Visible
  - internal(by default): variable을 선언한 contract와 이 contract로부터 상속받은 contract에서만 접근 가능하다.
  - private: 오직 이 variable이 속한 contract만 접근, 단 접근 권한의 차이일뿐 블록체인에 공개됨
  - public: 어떤 외부에서도 접근가능, 특별히 solidity에서는 getter 메소드도 함께 생성됨
  - constant: js와 같음
