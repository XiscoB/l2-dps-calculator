import React, { useState, useEffect, useCallback } from "react";
import "./LogProcessor.css";
import ComparisonDisplay from "./ComparisonDisplay";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

function LogProcessor() {
  const [logs, setLogs] = useState("");
  const [dps, setDPS] = useState(0);
  const [skillInfo, setSkillInfo] = useState({});
  const [visibleSkills, setVisibleSkills] = useState({});
  const [saveName, setSaveName] = useState("");
  const [savedDPSResults, setSavedDPSResults] = useState([]);
  const [selectedDPSName, setSelectedDPSName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [fightDuration, setFightDuration] = useState(60);
  const [dragActive, setDragActive] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
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
        let dataUpdated = false;

        Object.keys(dpsData.skillInfo).forEach((skill) => {
          const details = dpsData.skillInfo[skill];
          if (
            details.validDamages &&
            details.validDamages.length > 0 &&
            details.average === undefined
          ) {
            details.average =
              details.validDamages.reduce((acc, val) => acc + val, 0) /
              details.validDamages.length;
            dataUpdated = true;
          }
        });

        if (dataUpdated) {
          localStorage.setItem(key, JSON.stringify(dpsData));
        }

        results.push({ key, ...dpsData });
      } catch (e) {
        console.error("Error parsing DPS data from localStorage", e);
      }
    }

    results.sort((a, b) => b.dps - a.dps);
    setSavedDPSResults(results);
  };

  useEffect(() => {
    fetchSavedDPSResults();
  }, []);

  const clearCalculatedDPS = () => {
    setDPS(0);
    setSkillInfo({});
    setSelectedDPSName("");
    setVisibleSkills({});
  };

  const handleCalculateDPS = () => {
    console.log("Calculating DPS...");
    let { dpsToShow, skillDamageInfo } = calculateDPS(logs);
    console.log(dpsToShow);
    setDPS(dpsToShow);
    setSkillInfo(skillDamageInfo);
  };

  const handleSaveDPSResult = () => {
    const dpsData = {
      dps,
      skillInfo,
      saveName,
      fightDuration,
    };

    localStorage.setItem(saveName, JSON.stringify(dpsData));
    showToast("DPS Result Saved!");
    setSaveName("");
    fetchSavedDPSResults();
  };

  function calculateDPS(logs) {
    const lines = logs.split("\n");
    let totalDamage = 0;
    let fightDurationSeconds = fightDuration;
    let lastSkillUsed = "Unknown";
    let nextHitIsCritical = false;
    let skillDamageInfo = {
      Unknown: {
        min: Infinity,
        max: 0,
        average: 0,
        criticalHits: 0,
        hits: 0,
        damageLines: [],
        validDamages: [],
      },
    };

    lines.forEach((line) => {
      const skillUsedMatch = line.match(/You have used (.+?)[.]/);

      if (skillUsedMatch && skillUsedMatch[1]) {
        lastSkillUsed = skillUsedMatch[1].trim();
        if (!skillDamageInfo[lastSkillUsed]) {
          skillDamageInfo[lastSkillUsed] = {
            min: Infinity,
            max: 0,
            average: 0,
            criticalHits: 0,
            hits: 0,
            damageLines: [],
            validDamages: [],
          };
        }
      }

      if (
        line.includes("landed a critical hit") ||
        line.includes("M. Critical!")
      ) {
        nextHitIsCritical = true;
      }

      const damageInfo = line.match(/has dealt ([\d,]+) damage/i);
      if (damageInfo) {
        const damage = parseInt(damageInfo[1].replace(/,/g, ""), 10);

        if (damage > 1) {
          totalDamage += damage;
          skillDamageInfo[lastSkillUsed].damageLines.push(line);
          skillDamageInfo[lastSkillUsed].hits += 1;
          let skillData = skillDamageInfo[lastSkillUsed];
          skillData.validDamages.push(damage);
          skillData.min = Math.min(skillData.min, damage);
          skillData.max = Math.max(skillData.max, damage);
        }
        if (nextHitIsCritical) {
          skillDamageInfo[lastSkillUsed].criticalHits += 1;
          nextHitIsCritical = false;
        }
      }
    });

    Object.keys(skillDamageInfo).forEach((skill) => {
      const data = skillDamageInfo[skill];
      if (data.validDamages.length > 0) {
        data.average =
          data.validDamages.reduce((acc, val) => acc + val, 0) /
          data.validDamages.length;
      } else {
        data.average = 0;
        data.min = 0;
      }
    });

    const dps = totalDamage / (fightDurationSeconds || 1);
    return { dpsToShow: dps, skillDamageInfo };
  }

  const toggleSkillDetails = (skill) => {
    setVisibleSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  const removeDPSResult = (key) => {
    localStorage.removeItem(key);
    fetchSavedDPSResults();
  };

  const handleRowClick = (dpsData) => {
    setDPS(dpsData.dps);
    setSkillInfo(dpsData.skillInfo);
    setSelectedDPSName(dpsData.saveName);
    setFightDuration(dpsData.fightDuration || 60);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".log")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setLogs(content);
        clearCalculatedDPS();
        showToast("Log loaded! Click Calculate DPS to analyze.");
      };
      reader.readAsText(file);
    } else {
      showToast("Please upload a valid .log file");
    }
    setDragActive(false);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".log")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setLogs(content);
        clearCalculatedDPS();
        showToast("Log loaded! Click Calculate DPS to analyze.");
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

  const exportResultsAsImage = useCallback(async () => {
    const element = document.getElementById("saved-results-container");
    if (!element) return;

    try {
      // Hide export buttons and delete buttons temporarily
      const actionButtons = element.querySelectorAll(".savedResultsActions");
      const deleteButtons = element.querySelectorAll(".deleteResultButton");
      actionButtons.forEach((btn) => (btn.style.display = "none"));
      deleteButtons.forEach((btn) => (btn.style.display = "none"));
      
      // Wait a bit for the UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0c10",
        scale: 3,
        useCORS: true,
        logging: false,
        removeContainer: false,
        allowTaint: true,
        foreignObjectRendering: false,
      });
      
      // Restore buttons
      actionButtons.forEach((btn) => (btn.style.display = ""));
      deleteButtons.forEach((btn) => (btn.style.display = ""));

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(
            () => {
              showToast("Image copied to clipboard!");
            },
            (err) => {
              showToast("Failed to copy image.");
              console.error("Could not copy image: ", err);
            }
          );
        }
      }, "image/png", 1.0);
    } catch (err) {
      showToast("Failed to generate image.");
      console.error("Could not generate image: ", err);
    }
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return { label: "TOP 1", class: "rank-gold" };
    if (index === 1) return { label: "TOP 2", class: "rank-silver" };
    if (index === 2) return { label: "TOP 3", class: "rank-bronze" };
    return null;
  };

  const toggleComparison = (skill, resultKey) => {
    console.log("Toggling comparison for", skill, resultKey);
    setComparisonData((prev) => {
      const existingSkillIndex = prev.findIndex(
        (data) => data.skill === skill && data.key === resultKey
      );
      if (existingSkillIndex >= 0) {
        return prev.filter((_, index) => index !== existingSkillIndex);
      } else {
        const result = savedDPSResults.find((res) => res.key === resultKey);
        if (!result) return prev;
        return [
          ...prev,
          { key: resultKey, skill, data: result.skillInfo[skill] },
        ];
      }
    });
  };

  const removeFromComparison = (index) => {
    setComparisonData((prev) => prev.filter((_, i) => i !== index));
  };

  const clearComparisonData = () => {
    setComparisonData([]);
  };

  return (
    <div className="logProcessorContainer">
      {/* Toast Notification */}
      <div className={`toast ${toastVisible ? "show" : ""}`}>
        {toastMessage}
      </div>

      {/* Help Overlay */}
      <div 
        className={`helpOverlay ${showHelp ? "visible" : ""}`}
        onClick={toggleHelp}
      />

      {/* Header with Help */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div></div>
        <div className="helpIcon" onClick={toggleHelp}>?</div>
      </div>

      {/* Help Modal */}
      <div className={`helpTooltip ${showHelp ? "visible" : ""}`}>
        <button className="closeHelp" onClick={toggleHelp}>×</button>
        <p>
          <strong>Getting Started</strong>
        </p>
        <p>
          Use the command <code>{'///textcapture on'}</code> to start recording combat logs.
        </p>
        <p>
          When finished, use <code>{'///textcapture off'}</code> to stop recording.
        </p>
        <p>
          Log files are saved in your Lineage2/system folder with names like:<br />
          <code>CharacterName_L2_04_09_23_36.log</code>
        </p>
        <p>
          Upload the file or paste the content directly into the calculator.
        </p>
        <p style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <strong>Note:</strong> Your DPS varies based on gear, build, skill rotation, and execution.
        </p>
      </div>

      {/* Comparison Display - Full Width */}
      {comparisonData.length > 0 && (
        <ComparisonDisplay
          comparisonData={comparisonData}
          removeFromComparison={removeFromComparison}
          clearComparisonData={clearComparisonData}
          showToast={showToast}
        />
      )}

      {/* Two Column Layout */}
      <div className="logProcessorLayout">
        {/* Left Column - Input */}
        <div className="inputSection">
          {/* Upload Section */}
          <div
            className={`uploadArea ${dragActive ? "dragActive" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <div className="dragDropIcon">📁</div>
            <label className="logProcessorButtonv2">
              Upload Log File
              <input
                type="file"
                accept=".log"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
            <div className="dragDropText">
              {dragActive ? "Drop the file here" : "or drag and drop your .log file here"}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="logProcessorTextarea"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Or paste your combat logs here..."
          />

          {/* Fight Duration */}
          <div className="fightDurationSection">
            <label>Fight Duration:</label>
            <input
              type="number"
              className="fightDurationInput"
              value={fightDuration}
              onChange={(e) => setFightDuration(Number(e.target.value))}
              placeholder="Seconds"
              min="1"
              required
            />
            <span style={{ color: "#94a3b8" }}>seconds</span>
          </div>

          {/* Calculate Button */}
          <button className="logProcessorButton" onClick={handleCalculateDPS}>
            <span>⚡</span> Calculate DPS
          </button>

          {/* Saved Results - Moved below input on left column */}
          <div className="savedResultsContainer" id="saved-results-container">
            <div className="savedResultsHeader">
              <h2>📂 Saved DPS Results</h2>
              {savedDPSResults.length > 0 && (
                <div className="savedResultsActions">
                  <button
                    className="logProcessorButton exportImageButton"
                    onClick={exportResultsAsImage}
                  >
                    📷 Image
                  </button>
                  <button
                    className="logProcessorButton"
                    style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                    onClick={exportResultsToClipboard}
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>

            {savedDPSResults.length > 0 ? (
              <div className="savedResultsGrid">
                {savedDPSResults.map((result, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={index} className="savedResultCard" onClick={() => handleRowClick(result)}>
                      {rank && (
                        <div className={`rankBadge ${rank.class}`}>
                          {rank.label}
                        </div>
                      )}
                      <div className="savedResultInfo">
                        <div className="savedResultName">{result.saveName}</div>
                        <div className="savedResultDuration">
                          Duration: {result.fightDuration || "60"} seconds
                        </div>
                      </div>
                      <div className="savedResultDps">
                        {result.dps.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </div>
                      <button
                        className="deleteResultButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDPSResult(result.key);
                        }}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="emptyState" style={{ padding: "2rem" }}>
                <div className="emptyStateIcon">📝</div>
                <p>No saved DPS results yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="resultsSection">
          {dps > 0 ? (
            <div className="animate-fade-in">
              <div className="dpsResultContainer">
                {selectedDPSName && (
                  <>
                    <h2>{selectedDPSName}</h2>
                    <div className="fightDurationDisplay">
                      Duration: {fightDuration} seconds
                    </div>
                  </>
                )}
                <div className="dpsOutput">
                  <span className="dpsLabel">DPS</span>
                  <span className="dpsValue">
                    {dps.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </div>

              {/* Save Section - Only show if not viewing a saved result */}
              {!selectedDPSName && (
                <div className="saveSection">
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
                    💾 Save
                  </button>
                </div>
              )}

              {/* Skill Details */}
              <div className="skillDetails">
                <h3 style={{ color: "#f8fafc", marginBottom: "1rem", fontSize: "1.1rem" }}>Skill Breakdown</h3>
                {Object.keys(skillInfo).length > 0 ? (
                  <div className="skillDetailsGrid">
                    {Object.entries(skillInfo)
                      .filter(
                        ([skill, details]) =>
                          skill !== "Unknown" && details.hits > 0
                      )
                      .map(
                        ([
                          skill,
                          { min, max, criticalHits, hits, damageLines, average },
                        ]) => (
                          <div key={skill} className="skillEntry">
                            <div className="skillHeader">
                              <div
                                onClick={() => toggleSkillDetails(skill)}
                                className="skillName"
                                title={skill}
                              >
                                <span className="skillToggleIcon">
                                  {visibleSkills[skill] ? "−" : "+"}
                                </span>
                                <span className="skillNameText">{skill}</span>
                              </div>
                              <button
                                onClick={() =>
                                  toggleComparison(skill, selectedDPSName)
                                }
                                className={`logProcessorButtonv2 ${
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
                                  ? "Remove"
                                  : "Compare"}
                              </button>
                            </div>

                            <div className="skillStats">
                              <div className="statItem">
                                <span className="statLabel">Min</span>
                                <span className="statValue">
                                  {min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">Max</span>
                                <span className="statValue">
                                  {max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">Avg</span>
                                <span className="statValue">
                                  {average
                                    ? average.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">Hits</span>
                                <span className="statValue">{hits}</span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">Crits</span>
                                <span className="statValue">{criticalHits}</span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">Crit %</span>
                                <span className="statValue critRate">
                                  {hits > 0
                                    ? ((criticalHits / hits) * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                            </div>

                            {visibleSkills[skill] && (
                              <ul className="damageLinesList">
                                {damageLines.map((line, index) => (
                                  <li key={index}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      )}
                  </div>
                ) : (
                  <div className="emptyState">
                    <div className="emptyStateIcon">📊</div>
                    <p>No skill damage information available.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="emptyState" style={{ marginTop: "3rem" }}>
              <div className="emptyStateIcon" style={{ fontSize: "4rem" }}>⚡</div>
              <p style={{ fontSize: "1.1rem" }}>Enter your combat logs and click Calculate DPS to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogProcessor;

