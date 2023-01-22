import { EthProvider } from "./contexts/EthContext";
import "./App.css";
import Main from "./Main";

function App() {
  return (
    <div id="App">
      <EthProvider>
        <Main />
      </EthProvider>
    </div>
  );
}

export default App;
