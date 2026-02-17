import React, { useState, useEffect } from "react";
import "./App.css";
import LogProcessor from "./LogProcessor";
import BuffDebuffChecker from "./BuffDebuffChecker";
import logo from "./logo.png";

function App() {
  const currentVersion = "1.1.0";

  // eslint-disable-next-line no-unused-vars
const [activeComponent, setActiveComponent] = useState("logProcessor");
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const storedVersion = localStorage.getItem("appVersion");

  useEffect(() => {
    const storedVersion = localStorage.getItem("appVersion");

    if (!storedVersion) {
      setShowUpdateButton(true);
      return;
    }

    const [majorNew, minorNew] = currentVersion
      .split(".")
      .map((num) => parseInt(num, 10));
    const [majorOld, minorOld] = storedVersion
      .split(".")
      .map((num) => parseInt(num, 10));

    if (majorNew > majorOld || (majorNew === majorOld && minorNew > minorOld)) {
      alert(
        `New version detected: ${currentVersion} vs ${storedVersion}. Please update your data to ensure compatibility.`
      );
      setShowUpdateButton(true);
    } else if (currentVersion !== storedVersion) {
      localStorage.setItem("appVersion", currentVersion);
      console.log(
        "Minor update within the same subversion, version updated in storage."
      );
    }
  }, []);

  const handleClearData = () => {
    localStorage.clear();
    localStorage.setItem("appVersion", currentVersion);
    window.location.reload();
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="L2 DPS Calculator Logo" />
        <h1>Lineage II DPS Calculator</h1>
        <p className="subtitle">"For Glory and Honor"</p>
      </header>
      
      <div>
        {showUpdateButton && (
          <div className="warning-banner">
            <p>
              New features have been added that may not be compatible with your
              saved data. If you encounter issues or want to use new features,
              please update your data.
            </p>
            <button onClick={handleClearData}>Update and Delete Data</button>
          </div>
        )}
        
        {activeComponent === "logProcessor" && <LogProcessor />}
        {activeComponent === "buffDebuffChecker" && <BuffDebuffChecker />}
      </div>
      
      <footer className="App-footer">
        <p>Version {currentVersion}</p>
        <p>Stored Version {storedVersion || "None"}</p>
        <p>Made by @Xiscoteon</p>
      </footer>
    </div>
  );
}

export default App;
