## 4.1 이더리움

## 4.2 MetaMask

    - 웹 기반 이더리움 지갑
    - 화폐단위 비트코인에서는 사토시, 이더리움에서는 wei
    - 거래 수수료를 가스라고 함

## 4.3 Ethereum Smart Contracts

- 메타마스크를 통해서 만들어진 어카운트를 externally owned account, EOA 혹은 회부 소유 계정이라고 부른다.
- 이더리움에는 이 외부 소유 계정 외에도 계약 계정이라고 불리는 contract account가 있다.
- 기존 계약서는 서면으로 되어있어 계약 조건을 이행하려면 실제 사람이 계약서 대로 수행을 해야 하지만
- 디지털 프로그램으로 계약을 작성하면 조건에 따라 계약 내용을 자동으로 실행할 수 있어 부정이나 속임수를 없애고 분쟁 해결에 들어가는 비용을 낮출 수 있다.
- 단 비탈릭이 스마트 컨트렉트라는 이름 때문에 선입견이 생겼다고 후회함
- 법적 효력을 갖지도 않고, 스마트 하지도 않기 때문에
- 스마트 컨트렉은 한번 배포되면 코드르 변경할 수 없기 때문에 업그레이드하거나 버그 잡기 쉽지 않음
- immutable하다
- deterministic하다. 즉, 동일한 상태에서 시작을 했다면 누가 시작했던 실행 결과는 동일하다.
- 이런 모습이 마치 하나의 컴퓨터가 동작하는 것처럼 보여서 world computer라고 부른다.
- 이더리움에서는 smart contract를 world computer 상에서 실행되는 불변의 프로그램으로 보고 있다.
- ![1](./1.PNG)
- 스마트 컨트랙트의 life cycle
  - 스마트 컨트랙트는 solidity 같은 high-level 언어로 작성된 후 bytecode로 컴파일 된다.
  - 이 bytecode가 이더리움 가상 머신에서 실행되고 이더리움으로 deploy하게 되는데 이 과정이 contract creation transaction이다.
  - 이렇게 만들어진 contract에는 Ethereum address가 주어지는데 이 어드레스는 이 contract creation transaction을 만든 externally owned account와 transaction의 순서를 표시하는 nonce 값을 통해서 만들어진다.
  - 따라서 동일한 코드로 컨트랙트를 생성하더라고 account와 nonce 값이 달라지면 다른 주소를 갖는 컨트랙트가 생성되게 된다.
  - 이렇게 얻어진 컨트랙트의 address를 통해서 컨트랙트에 ether를 보낼 수도 있고 contract의 메소드를 호출 할 수 있게 된다.
  - 이렇게 외부 계정으로부터 호출된 contract는 다른 contract를 부를 수도 있지만, contract 스스로 실행된다거나 백그라운드에서 실행되지는 않는다. 다만 지울수는 있다. 이 경우 이 어드레스로 transaction을 보내도 실행할 프로그램이 더이상 없게 된다. 물론 블록체인 자체가 immutable이기 때문에 이 계정에 관련된 모든 기록은 지워지지 않고 남게 된다.

```sol
pragma solidity >=0.4.0 < 0.7.0;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}


// BYTE CODE
{
	"linkReferences": {},
	"object": "608060405234801561001057600080fd5b5060c78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea264697066735822122013f214aa56d6fd14bd5e71aaa57c958f29f049499de156177675a3f28fc600e264736f6c634300060c0033",
	"opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0xC7 DUP1 PUSH2 0x1F PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH1 0xF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH1 0x32 JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0x60FE47B1 EQ PUSH1 0x37 JUMPI DUP1 PUSH4 0x6D4CE63C EQ PUSH1 0x62 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x60 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH1 0x4B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH1 0x7E JUMP JUMPDEST STOP JUMPDEST PUSH1 0x68 PUSH1 0x88 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST DUP1 PUSH1 0x0 DUP2 SWAP1 SSTORE POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 SLOAD SWAP1 POP SWAP1 JUMP INVALID LOG2 PUSH5 0x6970667358 0x22 SLT KECCAK256 SGT CALLCODE EQ 0xAA JUMP 0xD6 REVERT EQ 0xBD 0x5E PUSH18 0xAAA57C958F29F049499DE156177675A3F28F 0xC6 STOP 0xE2 PUSH5 0x736F6C6343 STOP MOD 0xC STOP CALLER ",
	"sourceMap": "36:204:0:-:0;;;;;;;;;;;;;;;;;;;"
}

// ABI(Application binary interface)
// contract의 각 메소드가 어떤 argument를 받고, 어떤 값을 반환하는지를 정의해 이를 통해서
// contract call을 encode 하거나 데이터를 decode 하는데 사용된다.
[
	{
		"inputs": [],
		"name": "get",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "x",
				"type": "uint256"
			}
		],
		"name": "set",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
```

- ![1](./2.PNG)
- 사진에서 왼쪽 동그란 상자는 externally owned account
- 네모난 상자는 contract account
- EOA에 의해서 거래가 생성되고 EOA에 의해서 다른 contract account 끼리 메시지를 보낼 수 있는데 이는 컨트랙트의 코드를 실행하게 한다.
- 단 contract account는 스스로 거래를 생성하지 못 한다.

## 4.4. Ethereum Virtual Machine
