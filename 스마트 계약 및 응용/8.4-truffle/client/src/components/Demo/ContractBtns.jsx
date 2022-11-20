import { useEffect } from "react";
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns() {
  const { state: { contract, accounts, web3 } } = useEth();
  const [inputValue, setInputValue] = useState("");
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  const refresh = () => {
    console.log(contract.methods);
    contract.methods.getStudent().call((error, result) => {
      console.log(result)
      if (!error) {
        setInputValue(`${result[0]}, ${result[1]}, ${result[2]}`)
      } else {
        console.log(error);
      }
    });
  }

  const update = () => {
    contract.methods
      .setStudent(input1, input2, input3)
      .send({ from: accounts[0] }, (error, transactionHash) => {
        if (!error) {
          console.log(transactionHash);
        } else {
          console.log(error);
        }
      });
  }

  useEffect(() => {
    if (contract) {
      refresh();

      contract.events.Added({}, function (error, event) {
        if (!error) {
          refresh();
        } else {
          console.log(error);
        }
      });
    }
  }, [contract])

  return (
    <div>
      {inputValue}

<form onSubmit={(e) => { e.preventDefault(); update()}}>
      <input value={input1} onChange={(e) => setInput1(e.target.value)} />
      <input value={input2} onChange={(e) => setInput2(e.target.value)}  />
      <input value={input3} onChange={(e) => setInput3(e.target.value)} />
      <button type="submit">update</button>
      </form>
    </div>
  );
}

export default ContractBtns;
