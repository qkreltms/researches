pragma solidity ^0.8.13;

contract Lottery {
    address public manager;
    address[] public players;
    address payable public winner;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 0.1 ether);
        players.push(msg.sender);
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

    function pickWinnder() public {
        require(msg.sender == manager); // 매너지만 당첨자 선정가능하도록
        // 위너선정, 랜덤으로
        winner = payable(players[random() % players.length]);
        // 돈 보내기
        winner.transfer(address(this).balance);
        // 초기화
        players = new address[](0);
    }
}
