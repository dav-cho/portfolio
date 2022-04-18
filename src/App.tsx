import { Terminal } from './components/Terminal/Terminal.component';
import { logo } from './assets/logo';
import './App.scss';

function App() {
  return (
    <div className="App">
      <div className="logo">
        {logo.map((line, idx) => (
          <pre key={`logo-${idx}`}>{line}</pre>
        ))}
      </div>
      <Terminal />
    </div>
  );
}

export default App;
