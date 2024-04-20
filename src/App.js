import React, { useState, useEffect } from "react";
import "./App.css"; // Make sure your main styles are imported
import LogProcessor from "./LogProcessor";
import BuffDebuffChecker from "./BuffDebuffChecker";
import logo from "./logo.png"; // Import the logo

function App() {
  const currentVersion = "1.1.0";

  const [activeComponent, setActiveComponent] = useState("logProcessor"); // This state controls which component is displayed
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const storedVersion = localStorage.getItem("appVersion");
  useEffect(() => {
    const storedVersion = localStorage.getItem("appVersion");

    if (!storedVersion) {
      //alert("No version data found. It's recommended to update your data.");
      setShowUpdateButton(true);
      return;
    }

    const [majorNew, minorNew] = currentVersion
      .split(".")
      .map((num) => parseInt(num, 10));
    const [majorOld, minorOld] = storedVersion
      .split(".")
      .map((num) => parseInt(num, 10));

    // Check if major version has increased, or if the same major version but minor version has increased
    if (majorNew > majorOld || (majorNew === majorOld && minorNew > minorOld)) {
      alert(
        `New version detected: ${currentVersion} vs ${storedVersion}. Please update your data to ensure compatibility.`
      );
      setShowUpdateButton(true);
    } else if (currentVersion !== storedVersion) {
      // Update to the current version without forcing data refresh
      localStorage.setItem("appVersion", currentVersion);
      console.log(
        "Minor update within the same subversion, version updated in storage."
      );
    }
  }, []); // This ensures the code runs only once when the component mounts

  const handleClearData = () => {
    localStorage.clear();
    localStorage.setItem("appVersion", currentVersion);
    window.location.reload();
  };

  // Call this function early in the app's initialization phase
  //checkDataVersion();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" width={"100px"} height={"100px"} />
        <h1>L2 DPS Calculator</h1>
      </header>
      <div>
        {showUpdateButton && (
          <div>
            <p className="warning">
              New features have been added that may not be compatible with your
              saved data. If you encounter issues or want to use new features,
              please update your data.
            </p>
            <button onClick={handleClearData}>Update and Delete Data</button>
          </div>
        )}
        {/* Your regular app components go here */}
      </div>
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
        <p>Version {currentVersion}</p>
        <p>Stored Version {storedVersion}</p>
        <p>Made by @Xiscoteon</p>
      </footer>
    </div>
  );
}

export default App;
