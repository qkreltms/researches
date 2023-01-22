const Lottery = artifacts.require("./Lottery.sol");

contract("Lottery", (accounts) => {
  it("Should have address", async () => {
    const lottery = await Lottery.deployed();
    assert.ok(lottery.address);
  });

  it("Should have a manager address which equals to my account", async () => {
    const lottery = await Lottery.deployed();
    const manager = await lottery.manager.call();
    const mine = accounts[0];
    assert.equal(mine, manager);
  });

  it("Should allow an account to enter", async () => {
    const lottery = await Lottery.deployed();
    const willEnterPlayer = accounts[1];
    // NOTE: 수수료는 별도 부과
    await lottery.enter({
      from: willEnterPlayer,
      value: web3.utils.toWei("0.1", "ether"),
    });
    const player = await lottery.players.call(0);
    assert.equal(willEnterPlayer, player);
  });

  it("Requires a minimum amount of ether to enter", async () => {
    const lottery = await Lottery.deployed();
    try {
      await lottery.enter({ from: accounts[1], value: 0 });
      // 위에서 throw 안되고 여기까지 왔으면 테스트 실패
      assert.fail();
    } catch (error) {
      // revert... 에러 메시지가 있어야한다.
      assert.include(error.message, "revert");
    }
  });

  it("Should send money to the winner", async () => {
    /**
     * 참여자가 한명이므로 그 한명이 당첨금을 받았는지 체크한다.
     * NOTE: 각 테스트가 독립적이지 않음 컨트렉트 초기화하는 로직이 있는지 확인 필요
     * => contract함수를 새롭게 만들어서 테스트 진행하면된다.
     */
    const lottery = await Lottery.deployed();
    const player = accounts[1];

    const initialBalance = await web3.eth.getBalance(player);
    await lottery.pickWinner({ from: accounts[0] });
    const winner = await lottery.winner.call();
    assert.equal(player, winner);
    const finalBalance = await web3.eth.getBalance(player);

    // 상금수여가 잘 됐는지 체크
    assert.ok(
      finalBalance - initialBalance >= web3.utils.toWei("0.1", "ether")
    );
    // 이제 복권 금고에는 돈이 없어야함
    const lotteryVault = await web3.eth.getBalance(lottery.address);
    assert.ok("0" === lotteryVault);
  });

  it("Should allow a user enter multiple times", async () => {
    const lottery = await Lottery.deployed();
    const player = await accounts[0];
    await lottery.enter({
      from: player,
      value: web3.utils.toWei("0.1", "ether"),
    });
    await lottery.enter({
      from: player,
      value: web3.utils.toWei("0.2", "ether"),
    });

    const player1 = await lottery.players.call(0);
    const player2 = await lottery.players.call(1);
    // 플레이어 배열 길이 체크는 solidity에서 getter함수를 만들어줘야함
    // assert.ok(players.length === 2);
    assert.ok(player === player1);
    assert.ok(player === player2);

    const lotteryVault = await web3.eth.getBalance(lottery.address);
    assert.ok(web3.utils.toWei("0.3", "ether") === lotteryVault);
  });
});

contract("Lottery", (accounts) => {
  it("should allow multiple accounts to enter", async () => {
    const lottery = await Lottery.deployed();
    await lottery.enter({
      from: accounts[1],
      value: web3.utils.toWei("0.1", "ether"),
    });
    await lottery.enter({
      from: accounts[2],
      value: web3.utils.toWei("0.1", "ether"),
    });

    const player1 = await lottery.players.call(0);
    const player2 = await lottery.players.call(1);

    assert.equal(accounts[1], player1);
    assert.equal(accounts[2], player2);
  });
});
