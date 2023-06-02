import React from "react";
import logo from "./gitlab.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://gitlab.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn GitLab CI
        </a>
      </header>
    </div>
  );
}

export default App;
