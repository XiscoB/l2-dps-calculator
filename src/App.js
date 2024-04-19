import React, { useState } from "react";
import "./App.css"; // Make sure your main styles are imported
import LogProcessor from "./LogProcessor";
import BuffDebuffChecker from "./BuffDebuffChecker";
import logo from "./logo.png"; // Import the logo

function App() {
  const version = "1.0.4";
  const [activeComponent, setActiveComponent] = useState("logProcessor"); // This state controls which component is displayed
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" width={"100px"} height={"100px"} />
        <h1>L2 DPS Calculator</h1>
      </header>
      {/* <nav className="ComponentSwitch">
        <button onClick={() => setActiveComponent("logProcessor")}>
          DPS Calculator
        </button>
        <button onClick={() => setActiveComponent("buffDebuffChecker")}>
          Buff/Debuff Checker
        </button>
      </nav> */}
      {activeComponent === "logProcessor" && <LogProcessor />}
      {activeComponent === "buffDebuffChecker" && <BuffDebuffChecker />}
      <footer className="App-footer">
        <p>Version {version}</p>
        <p>Made by @Xiscoteon</p>
      </footer>
    </div>
  );
}

export default App;
