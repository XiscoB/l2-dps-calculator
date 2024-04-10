import React from "react";
import "./App.css"; // Make sure your main styles are imported
import LogProcessor from "./LogProcessor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>L2 DPS Calculator</h1>
      </header>
      <LogProcessor />
      <footer className="App-footer">Made by @Xiscoteon</footer>
    </div>
  );
}

export default App;
