import { useEffect } from "react";
import { useState } from "react";
import { useEth } from "./contexts/EthContext";

const Main = () => {
  const { state: eth } = useEth();
  const [state, setState] = useState({});

  const handleEnter = async () => {
    const { contract, accounts } = eth;
    // accounts[0] = 현재 메타마스크 접속 계정
    // 0.1내고 참여가능
    const enter = await contract.methods
      .enter()
      .send({ from: accounts[0], value: eth.web3.utils.toWei("0.1", "ether") });
    setState((state) => ({ ...state, transactionHash: enter.transactionHash }));
  };

  const handlePick = async () => {
    const { contract, accounts } = eth;
    const pick = await contract.methods
      .pickWinner()
      .send({ from: accounts[0] });
    setState((state) => ({
      ...state,
      pickTransactionHash: pick.transactionHash,
    }));
  };

  useEffect(() => {
    const runExample = async () => {
      if (!(eth.contract && eth.web3)) {
        return;
      }

      const { contract, web3, accounts } = eth;
      // 솔리디티 값, 함수 methods로 호출가능
      const manager = await contract.methods.manager().call();
      const players = await contract.methods.getPlayers().call();
      const winner = await contract.methods.winner().call();
      const myAccount = accounts[0];
      const vault = await web3.eth.getBalance(contract.options.address);
      const prize = web3.utils.fromWei(vault, "ether");

      setState({ manager, players, winner, prize, myAccount });
    };

    runExample();
  }, [eth]);

  const isManager = state.manager === state.myAccount;

  return (
    <main>
      <p>
        This contract is manged by {state.manager || ""}
        There are currently {state.players || 0} people entered, competing to
        win {state.prize || 0} ether!
        {state.winner || "no one"} has won the last lottery.
      </p>

      <h2>Want to try your odd?</h2>
      <button onClick={handleEnter}>Buy one ticket</button>
      <br />
      {state.transactionHash}
      <br />

      {isManager && (
        <>
          <h2>
            Time to pick a winner <i>Manager Only</i>
          </h2>
          <p>
            <button onClick={handlePick}>Pick a winner</button>
            <br />
            {state.pickTransactionHash}
          </p>
        </>
      )}
    </main>
  );
};

export default Main;
