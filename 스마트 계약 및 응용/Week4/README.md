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

- 이더리움 가상머신은 .NET이나 JVM과 유사하게 이더리움 바이트코드가 deploy되고 실행되는 computation 엔진이다.
- 이더리움 가상머신은 Turing complete하다 즉, 계산 가능한 모든 문제를 풀 수 있다. 어떤 프로그램도 실행할 수 있다.
- 하지만 실제로 이더리움 가상머신은 무한히 실행되지는 않고 주어진 gas의 한도 안에서만 실행되는 제약이 있기 때문에 유사-Turing complete하다고 말하기도 한다. 이런 제약성 때문에 멈추지 않고 무한히 동작하는 프로그램을 방지할 수 있다.
- ![1](./3.PNG)
- 이더리움 가상머신은 stack-based architecture이다. 스택 기반 머신에서는 메모리상의 값들이 stack에 저장된다.
- 메모리에는 영구적이지 않은 값들이 바이트 어레이로 이루어져있다.
- Storage는 비휘발성이어서 word array 형태로 이더리움의 상태를 저장하는데 사용된다.
- Program code영역에는 contract code가 저장된다.
- Ethereum virtual machine이 이해하는 명령어들이 정의되어 있는데 이들을 EVM instruction set이라고 한다.
- 일반적으로 개발자들은 solidity 같은 언어 보다 상위 수준의 언어로 개발을 하고 이를 EVM이 이해할 수 있는
  bytecode instruction set으로 compile하게 된다.
- ![1](./4.PNG)
- 이더리움 virtual machine은 주어진 명세에 따라서 contract code를 실행하면서 전체 이더리움의 state를 변경해 나가는 거대한 state-machine으로 이해할 수 있다.
- ![1](./5.PNG)
- 예를 들어서 smart contract가 실행되게 되면, 제일 먼저 EVM이 현재의 블록 정보 등 필요한 데이터를 갖고 만들어진다.
- ![1](./6.PNG)
- 또한 환경 변수로 gas supply가 설정된다.
- stack과 메모리를 이용해서 코드가 실행되면서 계속해서 gas가 부족한지 여부를 확인한다.
- gas가 충분하고 transaction이 성공적으로 끝나면 현재까지의 결과를 Ethereum state로 저장하게 된다.
- 즉, 새로 만들어진 account가 있다면 world state의 mapping에 추가되고, 개별 account의 balance, storage등이 update된다.
- ![1](./7.PNG)
- 지난번에 remix로 구했던 값의 opcodes항목을 통해서 어떻게 compile 되었는지 본다.
- ![1](./8.PNG)
- 제일 먼저, PUSH1뒤에 오는 1byte를 stack에 넣으라는 명령이다.
- 따라서 뒤에 오는 0x80이 stack에 넣어진다.
- 마찬가지로 다음 번 0x40도 stack에 넣어져서 stack에는 두 값이 들어가게 된다.
- ![1](./9.PNG)
- 다음 번 명령은 memory store로 스택으로부터 두 값을 읽어서 EVM의 메모리에 저장하는 명령이다.
- 스택 맨 위에 있는 값은 메모리의 주소로 사용되고, 두 번째 값이 메모리에 저장된다.
- 이미의 예에서는 0x40번지에 0x80이 저장된다.
- 그리고 stack은 다시 비게 된다.
- ![1](./10.PNG)
- 다음 명령 CALLVALUE는 현재 메시지를 통해서 전달받은 이더를 스택에 올려놓는 명령이다.
- 여기서 주의할 점은 Externally owned account가 transaction을 통해서 smart contract와 interaction 하는 두 가지 경우가 있는데, 하나는 *contract를 생성*하는 경우이고 다른 하나는 *이미 생생성된 contract에 메시지를 보내는 경우*이다.
- 첫 번째 contract를 생성하는 경우에 보내는 코드는 deployment bytecode로 나중에 이 코드의 실행 결과가 새롭게 생성된 contract의 code가 된다.
- 우리가 앞에서 살펴본 opcode는 deployment bytecode이다.
- ![1](./11.PNG)
- 컴파일된 bytecode를 다시 보면 앞부분이 새로운 contract를 만드는 초기화 부분이고 뒷부분이 실제 contract code로 저장되어 contract가 불렸을 경우 실행되는 코드이다.
- ![1](./12.PNG)
- Runtime bytecode의 첫 부분은 dispatcher라고 불리며
- 앞부분은 앞에서 본 것과 유사하게 메모리의 40번지에 0x80을 적고 스택에 0x4를 적은후에 calldatasize 명령어를 실행해서 현재 transaction의 data크기를 구하고 이를 stack에 넣는다.
- 그 결과 스택에는 두 값이 들어있게 된다.
- 다음의 Less-than 명령은 맨 위의 값이 다음 값보다 작은지를 확인해서 그 결과를 stack에 넣어준다.
- 이 경우 transaction의 data size가 4보다 작은 지를 확인하는 것인데 앞에서 우리가 배웠듯이 contract의 메소드를 호출할 때 메소드 signature hash 값의 앞 4바이트를 사용하기 때문에 이 크기가 4보다 다면 메소드를 호출한 것이 아니게 된다.
- 그 결과에 따라서 0 혹은 1이 stack에 넣어진다.
- 계속해서 43을 stack에 넣고 jump if 명령, condition에 따라서 주어진 주소로 이동
- 이 케이스에서는 사이즈가 작으면 43번지로 이동하게 된다.
- 계속해서 stack에 0을 넣고 calldataload 명령으로 transaction의 data를 읽습니다.
- 그리고, 계속해서 29byte의 값을 stack에 넣게 됩니다.
- 다음 swap 명령으로 stack의 두 값의 위치를 바꿉니다.
- Div 명령은 두 값을 나눕니다.
- 그 결과 transaction의 데이터 값 중에서 앞의 4바이트를 구하게 됩니다.
- 이제 다음 명령은 stack의 값을 복사해서 넣은 후에, stack에 0x60FE47b1값을 넣어 줍니다.
- 이 값은 우리가 앞에서 봤던 set 메소드의 hash 값 앞 4바이트입니다.
- 계속해서 Equal 명령을 통해서 stack의 상위 두 값이 같은지를 확인 후에 jump if 명령을 통해서 같으면 48번지로 이동을 합니다.
- 이런 식의 dispatch 과정을 통해서 EVM은 어떤 메소드가 호출되었는지를 확인하고 해당 메소드의 바이트코드를 실행하게 됩니다.
- ![1](./13.PNG)
- 모든 이더리움 노드는 그 내부에 Ethereum virtual machine를 실행하고 있고 peer-to-peer 방식으로 연결되어있다. 각자가 Ethereum virtual machine을 독립적으로 실행하게 된다.
- 이렇게 서로가 독립적으로 실행되는 이유는 탈 중앙화된 방식으로 한 시스템에 오류가 생겨도 전체 시스템에는 영향을 주지 않으면서 서로 간의 합의를 통해서 위조, 변조를 막기 위해서이다.
- 이런 이유로 전통적인 컴퓨터에서의 실행보다 느리고 더 많은 비용이 들 수 있는 단점이있다.

## 4.5. Gas

- Gas란 이더리움 블록체인에서 transaction이나 스마트 컨트랙트를 실행하는데 필요한 계산 작업을 측정하는 단위이다.
- 비트코인에서는 transaction fee가 transaction의 크기에 비례했던 것에 반해서 이더리움에서는 코드의 **실행**에 필요한 연산 작업에 비례하다.
- 이더리움에서 이런 방식을 이용하는 이유는 이더의 가격 변동은 심한 데 비해서 연산에 필요한 비용 즉, 비유를 하자면 차에 크기에 따라서 들어가는 기름의 양은 변하지 않음(또는 쉽게 변하지 않음)이기 때문에 이 둘을 분리해서 연산에 필요한 비용을 가스로 표현하는 것이다.
- **GAS Price**란 Gas당 얼마의 이더를 지불할 것인지를 말한다.
- 이더리움에서는 transaction을 만드는 sender 측에서 Gas당 얼마를 지불할 것인지를 정한다. 그러면 새로운 블록을 만드는 채굴업자들이 이들 중에서 높은 가격을 우선적으로 블록에 포함시키게 된다. 따라서 더 높은 가격일 수록 더 빨리 transaction이 승인받게 된다.
- **GAS Cost**란 연산 작업에 드는 비용을 계산한 것이다.
- 예를 들면 두 숫자를 더하는 transaction GAS cost가 3 gas이지만 transaction을 보내는 데는(transaction fee = GAS cost \* GAS Price) 21,000 gas가 소요된다.
- **GAS Limit**란 사용 가능한 gas cost의 총량으로 스마트 컨트랙트의 버그로 인해서 많은 비용을 지불하게 되는 경우를 방지하고 정해진 한도 안에서만 실행되도록 하기 위해서 존재한다.
