import { useEffect } from "react";
import { useState } from "react";
import { useEth } from "./contexts/EthContext";

const Main = () => {
  const { state: eth } = useEth();
  const [state, setState] = useState({
    storageValue: "0xbd0cbb7db6dba0efb86c5fa5a1401fbd2177bfea",
  });

  useEffect(() => {
    console.log(eth);

    const runExample = async () => {
      if (!(eth.contract && eth.web3)) {
        return;
      }
      
      const { contract, web3 } = eth;
      console.log(contract.methods);
      const manager = await contract.methods.manager.call();
      const players = await contract.methods.getPlayers.call();
      const winner = await contract.methods.winner().call();
      const prize = await web3.eth.getBalance(contract.options.address);

      setState({ manager, players, winner, prize });
    };

    runExample();
  }, [eth]);

  const handleEnter = async () => {
    const { contract, accounts } = eth;
    const enter = await contract.methods
      .enter()
      .send({ from: accounts[1], value: "1000000000000000000" });
    setState({ transactionHash: enter.transactionHash });
  };

  return (
    <main>
      <p>
        This contract is manged by {state.storageValue}
        There are currently {state.players?.length || 0} people entered,
        competing to win {state.prize || 0} ether!
        {state.winner || "no one"} has won the last lottery.
      </p>

      <h2>Want to try your odd?</h2>
      <button onClick={() => handleEnter()}>Buy one ticket</button>
      <br />
      {state.transactionHash}
    </main>
  );
};

export default Main;
