// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Lottery {
    address public manager;
    address[] public players;
    address payable public winner;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        // 얼마내고 참여가능한가?
        require(msg.value >= 0.1 ether);
        players.push(msg.sender);
    }

    function getPlayers() public view returns (uint256) {
        return players.length;
    }

    // 주의: 예측할 수 있는 랜덤값
    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function pickWinner() public {
        require(msg.sender == manager); // 매니저만 당첨자 선정가능하도록
        // 위너선정, 랜덤으로
        winner = payable(players[random() % players.length]);
        // 돈 보내기
        // HACK: 돈 보내는 거는 블록으로 생성이 되지 않아 트래킹 힘든데
        // 일반적으로 돈 보내는 것도 아래함수 쓰기보다 블록 만들어서 보낼까?
        // => 추적가능, ganache의 contracts에 추가해야 보임
        winner.transfer(address(this).balance);
        // 초기화
        players = new address[](0);
    }
}
