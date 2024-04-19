import React, { useState, useEffect, useCallback } from "react";
import "./LogProcessor.css"; // Import the stylesheet
import ComparisonDisplay from "./ComparisonDisplay";

function LogProcessor() {
  const [logs, setLogs] = useState("");
  const [dps, setDPS] = useState(0);
  //const [damageLines, setDamageLines] = useState([]);
  const [skillInfo, setSkillInfo] = useState({});
  const [visibleSkills, setVisibleSkills] = useState({});
  const [saveName, setSaveName] = useState("");
  const [savedDPSResults, setSavedDPSResults] = useState([]);
  const [selectedDPSName, setSelectedDPSName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [fightDuration, setFightDuration] = useState(60); // Default to 60 seconds
  const [dragActive, setDragActive] = useState(false);
  const [comparisonSkills, setComparisonSkills] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // The toast message will hide after 3 seconds
  };

  const toggleHelp = () => {
    setShowHelp((prev) => !prev);
  };

  const fetchSavedDPSResults = () => {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      try {
        const dpsData = JSON.parse(value);
        results.push({ key, ...dpsData });
      } catch (e) {
        console.error("Error parsing DPS data from localStorage", e);
      }
    }

    // Sort results by DPS in descending order
    results.sort((a, b) => b.dps - a.dps);

    setSavedDPSResults(results);
  };

  useEffect(() => {
    fetchSavedDPSResults();
  }, []);

  const handleCalculateDPS = () => {
    console.log("Calculating DPS...");
    let { dpsToShow, skillDamageInfo } = calculateDPS(logs);
    console.log(dpsToShow);
    setDPS(dpsToShow);
    setSkillInfo(skillDamageInfo); // Update state with new skill damage info
  };

  const handleSaveDPSResult = () => {
    const dpsData = {
      dps,
      skillInfo,
      saveName, // The custom name given by the user
      fightDuration,
    };

    // Save the DPS data to local storage
    localStorage.setItem(saveName, JSON.stringify(dpsData));
    // alert("DPS Result Saved!");
    showToast("DPS Result Saved!");
    setSaveName(""); // Clear the save name field
    fetchSavedDPSResults(); // Refresh the list of saved results
  };

  function calculateDPS(logs) {
    const lines = logs.split("\n");
    let totalDamage = 0;
    let fightDurationSeconds = fightDuration; // Assuming a fixed duration for simplicity
    let lastSkillUsed = "Unknown"; // Default skill name
    let nextHitIsCritical = false;
    let skillDamageInfo = {
      Unknown: {
        min: Infinity,
        max: 0,
        criticalHits: 0,
        hits: 0,
        damageLines: [],
      },
    };

    lines.forEach((line) => {
      // Skill usage detection
      //const skillUsedMatch = line.match(/You have used (\w+)/);
      const skillUsedMatch = line.match(/You have used (.+?)[.]/);

      if (skillUsedMatch && skillUsedMatch[1]) {
        lastSkillUsed = skillUsedMatch[1].trim();

        // if (!skillDamageInfo[lastSkillUsed]) {
        //   skillDamageInfo[lastSkillUsed] = {
        //     min: Infinity,
        //     max: 0,
        //     criticalHits: 0,
        //     hits: 0,
        //     damageLines: [],
        //   };
        // }
        if (lastSkillUsed && !skillDamageInfo[lastSkillUsed]) {
          // Initialize the skill in the skillDamageInfo object if it doesn't exist
          skillDamageInfo[lastSkillUsed] = {
            min: Infinity,
            max: 0,
            criticalHits: 0,
            hits: 0,
            damageLines: [],
          };
        }
      }

      // Critical hit detection
      if (line.includes("landed a critical hit")) {
        nextHitIsCritical = true;
      } else if (line.includes("M. Critical!")) {
        nextHitIsCritical = true;
      }

      // Damage line processing
      const damageInfo = line.match(/has dealt ([\d,]+) damage/i);
      if (damageInfo) {
        const damage = parseInt(damageInfo[1].replace(/,/g, ""), 10);
        totalDamage += damage;
        skillDamageInfo[lastSkillUsed].damageLines.push(line);
        skillDamageInfo[lastSkillUsed].hits += 1; // Increment hits

        let skillData = skillDamageInfo[lastSkillUsed];
        skillData.min = Math.min(skillData.min, damage);
        skillData.max = Math.max(skillData.max, damage);
        if (nextHitIsCritical) {
          skillData.criticalHits += 1;
          nextHitIsCritical = false;
        }
      }
    });

    const dps = totalDamage / (fightDurationSeconds || 1);
    return { dpsToShow: dps, skillDamageInfo };
  }

  // Toggle the visibility of skill details
  const toggleSkillDetails = (skill) => {
    setVisibleSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill], // Toggle the boolean value
    }));
  };

  const removeDPSResult = (key) => {
    localStorage.removeItem(key);
    fetchSavedDPSResults(); // Refresh the list
  };

  const handleRowClick = (dpsData) => {
    setLogs(dpsData.logs); // Assuming `logs` is part of the saved data structure
    setDPS(dpsData.dps);
    setSkillInfo(dpsData.skillInfo);
    setSelectedDPSName(dpsData.saveName);
    // Add other state settings as needed
  };

  //   const handleFileUpload = (event) => {
  //     const file = event.target.files[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onload = (e) => {
  //         const content = e.target.result;
  //         // Assuming the content of the .log file is suitable for your `logs` state
  //         setLogs(content);
  //       };
  //       reader.readAsText(file);
  //     }
  //   };

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow the drop
    // Set state to indicate the drag is occurring, if you want to change styles or effects
    setDragActive(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0]; // Assuming single file drop, adjust as necessary
    if (file && file.name.endsWith(".log")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setLogs(content);
      };
      reader.readAsText(file);
    } else {
      showToast("Please upload a valid .log file");
    }
    setDragActive(false);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    // Optional: Adjust state to show visual feedback
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
    // Optional: Revert visual feedback state
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".log")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setLogs(content);
      };
      reader.readAsText(file);
    } else {
      showToast("Please upload a valid .log file");
    }
  };

  const exportResultsToClipboard = useCallback(() => {
    let resultsText = "**Saved DPS Results**\n\n";
    resultsText += savedDPSResults
      .map(
        (result, index) =>
          `- ${index + 1}: ${result.saveName}, Duration: ${
            result.fightDuration || "60"
          } seconds, DPS: ${result.dps
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      )
      .join("\n");

    navigator.clipboard.writeText(resultsText).then(
      () => {
        showToast("Results copied to clipboard!");
      },
      (err) => {
        showToast("Failed to copy results.");
        console.error("Could not copy text: ", err);
      }
    );
  }, [savedDPSResults]);

  const toggleComparison = (skill, resultKey) => {
    console.log("Toggling comparison for", skill, resultKey);
    setComparisonData((prev) => {
      const existingSkillIndex = prev.findIndex(
        (data) => data.skill === skill && data.key === resultKey
      );
      if (existingSkillIndex >= 0) {
        // Skill is already in the comparison data, remove it
        return prev.filter((_, index) => index !== existingSkillIndex);
      } else {
        // Add new skill data
        const result = savedDPSResults.find((res) => res.key === resultKey);
        if (!result) return prev;
        return [
          ...prev,
          { key: resultKey, skill, data: result.skillInfo[skill] },
        ];
      }
    });
  };

  const performComparison = () => {
    const comparisonData = savedDPSResults.map((result) => ({
      saveName: result.saveName,
      skills: comparisonSkills.map((skill) => ({
        skill,
        data: result.skillInfo[skill],
      })),
    }));
    console.log(comparisonData); // Or display this data in a suitable UI element
  };

  const displayComparison = () => {
    // Logic to display or process the comparison data
    console.log("Comparison Data:", comparisonData);
    // Further UI rendering logic here
  };

  const removeFromComparison = (index) => {
    setComparisonData((prev) => prev.filter((_, i) => i !== index));
  };

  const clearComparisonData = () => {
    setComparisonData([]);
  };

  return (
    <div className="logProcessorContainer">
      <div className={`toast ${toastVisible ? "show" : ""}`}>
        {toastMessage}
      </div>
      <div className="helpIcon" onClick={toggleHelp}>
        Help
        {showHelp && (
          <div className="helpTooltip">
            <p>
              <strong>Keep this in mind:</strong>
            </p>
            <p>
              Command <strong>///textcapture on</strong> will start recording
              the chat/systemchat
            </p>
            <p>
              Once you're done with it, use{" "}
              <p>
                <strong>///textcapture off</strong>
              </p>
            </p>
            <p>
              You will be able to find the log file in: Lineage2/system folder,
              under a name like this:{" "}
              <strong>CharacterName_L2_04_09_23_36.log</strong>
              <p>You can upload it directly to the L2 DPS Calculator.</p>
            </p>
            <p>
              <strong>
                Your DPS might vary from gear, build, skill rotation and how
                good you are.
              </strong>
            </p>
            <p>
              <strong>You could be doing less DPS than you should.</strong>
            </p>
          </div>
        )}
      </div>
      <div
        className="uploadLogDiv"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <label className="logProcessorButtonv2">
          Upload Log File
          <input
            type="file"
            accept=".log"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
        {/* Optional: Add the class for the div for drag and drop depending on dragActive  */}
        <div className={`dragDropText ${dragActive ? "dragDropOverlay" : ""}`}>
          {dragActive ? "Drop the file here" : "or drag and drop the file here"}

          <textarea
            className="logProcessorTextarea"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste your combat logs here..."
          ></textarea>
        </div>
      </div>
      <p>Enter the fight duration in seconds</p>
      <input
        type="number"
        className="fightDurationInput"
        value={fightDuration}
        onChange={(e) => setFightDuration(Number(e.target.value))}
        placeholder="Secs"
        min="1"
        required
      />
      <br></br>
      <button className="logProcessorButton" onClick={handleCalculateDPS}>
        Calculate DPS
      </button>

      {/* {comparisonData.length > 0 && (
        <button onClick={displayComparison} className="logProcessorButtonv3">
          Show Comparison Results
        </button>
      )} */}

      <div>
        {comparisonData.length > 0 && (
          <ComparisonDisplay
            comparisonData={comparisonData}
            removeFromComparison={removeFromComparison}
            clearComparisonData={clearComparisonData}
          />
        )}
      </div>

      {dps > 0 && (
        <div>
          <div className="dpsResultContainer">
            {selectedDPSName && (
              <>
                <h2>{selectedDPSName}</h2>
                <div>Duration: {fightDuration} seconds</div>
              </>
            )}
            <div className="dpsOutput">
              <span className="dpsLabel">DPS:</span>
              <span className="dpsValue">
                {dps.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>
          <input
            type="text"
            className="logProcessorInput"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Enter a name for your DPS result..."
          />
          <button
            className="logProcessorButtonv3"
            onClick={handleSaveDPSResult}
          >
            Save DPS Result locally
          </button>

          <div className="scrollableContent">
            <div className="skillDetails">
              {/* Render skill details with conditional className for showing/hiding */}
              {Object.keys(skillInfo).length > 0 ? (
                <div>
                  {Object.entries(skillInfo)
                    .filter(
                      ([skill, details]) =>
                        skill !== "Unknown" && details.hits > 0
                    ) // Exclude "Unknown" and skills with no hits
                    .map(
                      ([
                        skill,
                        { min, max, criticalHits, hits, damageLines },
                      ]) => (
                        <div key={skill} className="skillEntry">
                          {/* Make the skill name and toggle icon clickable */}
                          <div
                            onClick={() => toggleSkillDetails(skill)}
                            className="skillName"
                          >
                            {visibleSkills[skill] ? "-" : "+"} {skill}
                          </div>
                          <br></br>
                          <button
                            onClick={() =>
                              toggleComparison(skill, selectedDPSName)
                            }
                            className={`logProcessorButtonv2 compareButton ${
                              comparisonData.some(
                                (data) =>
                                  data.skill === skill &&
                                  data.key === selectedDPSName
                              )
                                ? "selected"
                                : ""
                            }`}
                          >
                            {comparisonData.some(
                              (data) =>
                                data.skill === skill &&
                                data.key === selectedDPSName
                            )
                              ? "Remove from Compare"
                              : "Add to Compare"}
                          </button>

                          <div className="skillDetails">
                            Min:{" "}
                            {min
                              .toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            | Max:{" "}
                            {max
                              .toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            | Hits: {hits}, Critical Hits: {criticalHits},
                            Critical Hit Rate:{" "}
                            {hits > 0
                              ? ((criticalHits / hits) * 100).toFixed(2)
                              : 0}
                            %
                          </div>
                          {visibleSkills[skill] && (
                            <div className="scrollableContent">
                              <ul>
                                {damageLines.map((line, index) => (
                                  <li key={index}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    )}
                </div>
              ) : (
                <p>No skill damage information available.</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="savedResultsContainer">
        <div className="scrollableContent">
          <h2>Saved DPS Results</h2>

          {savedDPSResults.length > 0 ? (
            <div>
              <button
                className="logProcessorButton"
                onClick={exportResultsToClipboard}
              >
                Copy DPS Results Table to clipboard
              </button>
              <table className="savedResultsTable">
                <tbody>
                  {savedDPSResults.map((result, index) => (
                    <tr key={index} onClick={() => handleRowClick(result)}>
                      <td className="dpsNameColumn">
                        {result.saveName}
                        <div className="fightDurationDisplay">
                          Duration: {result.fightDuration || "60"} seconds
                        </div>
                      </td>
                      <td className="dpsValueColumn">
                        {result.dps
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        DPS
                      </td>
                      <td className="dpsDeleteColumn">
                        <button
                          className="deleteResultButton"
                          onClick={() => removeDPSResult(result.key)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No saved DPS results.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogProcessor;
