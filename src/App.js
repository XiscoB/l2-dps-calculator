import React from "react";
import "./App.css"; // Make sure your main styles are imported
import LogProcessor from "./LogProcessor";
import logo from "./logo.png"; // Import the logo

function App() {
  const version = "1.0.1";
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" width={"100px"} height={"100px"} />
        <h1>L2 DPS Calculator</h1>
      </header>
      <LogProcessor />
      <footer className="App-footer">
        <p>Made by @Xiscoteon</p>
        <p>Version {version}</p>
      </footer>
    </div>
  );
}

export default App;
