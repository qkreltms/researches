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

## 6.2 Ponzi Contract

폰지 스킴은 투자 사기 수법중 하나, 실제 아무런 이윤 창출 없이 투자자들이 투자한 돈을 이용해 투자자들에게 수익을 지급하는 방식.

블록체인과 스마트 컨트랙트의 특성이 폰지 스킴을 작성하기에 유리한 환경

1. 익명성

- 폰지 스킴 컨트랙트를 배포한 사람이 누구인지 알기 어렵다.

2. 스마트 컨트랙트는 한번 배포되면 일반적으로 멈추거나 피해자를 위해서 transaction을 되돌리기가 매우 어렵다.

3. 블록체인의 모든 transaction이 공개되있어 한번 기록되면 변경 불가하기 때문에 사람들이 공정한 거래를 한다는 잘못된 믿을을 갇게되는 심리 역이용

간단하게 받은 코인을 지급하는 컨트랙트 구현 예제

1. 첫 번째 투자자가 와서 10이더를 스마트 컨트랙트에 보내면
2. 스마트 컨트랙트는 받은 이더가 현재 자신이 기록한 숫자보다 10%가 더 많으면, 받은 이더를 자신이 기억하고 있는 주소로 보낸다.
3. 그리고 주소를 새로운 투자자의 주소로 변경하고, 받은 금액을 investment에 기록한다.

- ![1](./6.2.1.png)

```
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract SimplePonzi {
    address payable public currentInvestor;
    // 전 금액
    uint public currentInvestment = 0;

    // 화폐접근 가능, 외부 컨트랙트에 공개 함수
    // 컨트랙트가 아무런 함수 지정없이 호출되면 이 함수 실행
    // receive:  순수하게 이더만  받을때 작동 합니다.
    // fallback: 함수를 실행하면서 이더를 보낼때, 불려진 함수가 없을 때 작동합니다.
    fallback() external payable {
        // 투자금에 1.1 곱하기
        uint minimumInvestment = currentInvestment * 11/10;
        require(msg.value > minimumInvestment);

        address payable previouseInvestor = currentInvestor;
        currentInvestor = payable(msg.sender);
        currentInvestment = msg.value;

        // 이전 투자자에게 현재 투자자에게 받은 이더를 보낸댜.
        previouseInvestor.send(msg.value);
    }
}
```
