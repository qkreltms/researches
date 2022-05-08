## 6.1 Programming with Solidity

```
pragma solidity ^0.4.24;


// Inheritance 적용전 contract
// contract Faucet {
//     address owner;

//     constructor() public {
//         owner = mag.sender
//     }

//     // 조건 검사 함수
//     modifier onlyOwner {
//         require(msg.sender == owner);
//         _; // 함수가 위치할 자리
//     }
//     // modifer 적용전
//     // function destroy() pbulic {
//     //     require(msg.sender == owner);
//     //     selfdestruct(owner)
//     // }
//     // modifer 적용후
//     function destroy() pbulic onlyOwner {
//         selfdestruct(owner)
//     }

//     // function <name> ([parameters])
//     // {public|private|internal|external}, 함수 공개 여부 default => public
//     // [pure|view|payable], 내부변수 쓰지도 읽지도 않음, 컨트렉의 내부 변수를 변경하거나 부르지 않음, 이더를 받을 수 있음
//     // [modifiers], 함수 기능 변화
//     // [returns (types)]
//     function withdraw(uint withdraw_amount) public {
//         // 인출 제한, 0.1 이더보다 작아야한다., false값일 때 에러 반환
//         require(withdraw_amount <= 0.1 ether); // 0.1 ether == 1*10^12, (wei, szabo, ether)
//         // 요청한 곳에 이더 전송
//         msg.sender.transfer(withdraw_amount);
//     }


//     // 이 contract를 호출한 transaction이 아무런 함수를 지정하지 않았을 경우 실행
//     // 0.5에서는 function() external payable {} 내부에서 안부르고 외부에서 부르므로
//     // 0.6에서는 fallback() external payable{}
//     // receive() external payable {} //함수 이름 지정 없이 이더를 받을 경우 receive 호출
//     function () public payable {}
// }


import "./Mortal.sol";
contract Faucet is Mortal {
    // function <name> ([parameters])
    // {public|private|internal|external}, 함수 공개 여부 default => public
    // [pure|view|payable], 내부변수 쓰지도 읽지도 않음, 컨트렉의 내부 변수를 변경하거나 부르지 않음, 이더를 받을 수 있음
    // [modifiers], 함수 기능 변화
    // [returns (types)]
    function withdraw(uint withdraw_amount) public {
        // 인출 제한, 0.1 이더보다 작아야한다., false값일 때 에러 반환
        require(withdraw_amount <= 0.1 ether); // 0.1 ether == 1*10^12, (wei, szabo, ether)
        // 요청한 곳에 이더 전송
        msg.sender.transfer(withdraw_amount);
        emit Withdrawal(msg.sender, withdraw_amount);
    }


    // 이 contract를 호출한 transaction이 아무런 함수를 지정하지 않았을 경우 실행
    // 0.5에서는 function() external payable {} 내부에서 안부르고 외부에서 부르므로
    // 0.6에서는 fallback() external payable{}
    // receive() external payable {} //함수 이름 지정 없이 이더를 받을 경우 receive 호출
    function() public payable {
        emit Deposit(msg.sender, msg.value);
    }

    // 로그 기록
    event Withdrawal(address indexed to, uint amount);
    event Deposit(address indexed from, uint amount);
}
```

```
pragma solidity ^0.4.24;

contract Owned {
    address owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}
```

```
pragma solidity ^0.4.24;

import "./Owned.sol";

contract Mortal is Owned {
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}
```
