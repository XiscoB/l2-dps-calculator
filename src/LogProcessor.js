import React, { useState, useEffect, useCallback } from "react";
import "./LogProcessor.css";
import ComparisonDisplay from "./ComparisonDisplay";
import Onboarding from "./Onboarding";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "./i18n/LanguageContext";

function LogProcessor() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState("");
  const [dps, setDPS] = useState(0);
  const [skillInfo, setSkillInfo] = useState({});
  const [visibleSkills, setVisibleSkills] = useState({});
  const [saveName, setSaveName] = useState("");
  const [savedDPSResults, setSavedDPSResults] = useState([]);
  const [selectedDPSName, setSelectedDPSName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
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
    setShowOnboarding((prev) => !prev);
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
    showToast(t('logProcessor.toast.saved'));
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
        showToast(t('logProcessor.toast.logLoaded'));
      };
      reader.readAsText(file);
    } else {
      showToast(t('logProcessor.toast.invalidFile'));
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
        showToast(t('logProcessor.toast.logLoaded'));
      };
      reader.readAsText(file);
    } else {
      showToast(t('logProcessor.toast.invalidFile'));
    }
  };

  const exportResultsToClipboard = useCallback(() => {
    let resultsText = "**" + t('logProcessor.savedResults.title').replace('📂 ', '') + "**\n\n";
    resultsText += savedDPSResults
      .map(
        (result, index) =>
          `- ${index + 1}: ${result.saveName}, ${t('logProcessor.savedResults.duration').replace(':', '')}: ${
            result.fightDuration || "60"
          } ${t('logProcessor.savedResults.seconds')}, DPS: ${result.dps
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      )
      .join("\n");

    navigator.clipboard.writeText(resultsText).then(
      () => {
        showToast(t('logProcessor.toast.copied'));
      },
      (err) => {
        showToast(t('logProcessor.toast.copyFailed'));
        console.error("Could not copy text: ", err);
      }
    );
  }, [savedDPSResults, t]);

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
              showToast(t('logProcessor.toast.imageCopied'));
            },
            (err) => {
              showToast(t('logProcessor.toast.imageCopyFailed'));
              console.error("Could not copy image: ", err);
            }
          );
        }
      }, "image/png", 1.0);
    } catch (err) {
      showToast(t('logProcessor.toast.imageGenerateFailed'));
      console.error("Could not generate image: ", err);
    }
  }, [t]);

  const getRankBadge = (index) => {
    if (index === 0) return { label: t('logProcessor.ranks.top1'), class: "rank-gold" };
    if (index === 1) return { label: t('logProcessor.ranks.top2'), class: "rank-silver" };
    if (index === 2) return { label: t('logProcessor.ranks.top3'), class: "rank-bronze" };
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

      {/* Onboarding Modal */}
      <Onboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      {/* Header with Help */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div></div>
        <div className="helpIcon" onClick={toggleHelp} title={t('logProcessor.helpTooltip')}>?</div>
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
            <div className="dragDropIcon">{t('logProcessor.upload.icon')}</div>
            <label className="logProcessorButtonv2">
              {t('logProcessor.upload.button')}
              <input
                type="file"
                accept=".log"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
            <div className="dragDropText">
              {dragActive ? t('logProcessor.upload.dropHere') : t('logProcessor.upload.dragDrop')}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="logProcessorTextarea"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder={t('logProcessor.textarea.placeholder')}
          />

          {/* Fight Duration */}
          <div className="fightDurationSection">
            <label>{t('logProcessor.fightDuration.label')}</label>
            <input
              type="number"
              className="fightDurationInput"
              value={fightDuration}
              onChange={(e) => setFightDuration(Number(e.target.value))}
              placeholder={t('logProcessor.fightDuration.placeholder')}
              min="1"
              required
            />
            <span style={{ color: "#94a3b8" }}>{t('logProcessor.fightDuration.unit')}</span>
          </div>

          {/* Calculate Button */}
          <button className="logProcessorButton" onClick={handleCalculateDPS}>
            <span>⚡</span> {t('logProcessor.calculateButton')}
          </button>

          {/* Saved Results - Moved below input on left column */}
          <div className="savedResultsContainer" id="saved-results-container">
            <div className="savedResultsHeader">
              <h2>{t('logProcessor.savedResults.title')}</h2>
              {savedDPSResults.length > 0 && (
                <div className="savedResultsActions">
                  <button
                    className="logProcessorButton exportImageButton"
                    onClick={exportResultsAsImage}
                  >
                    {t('logProcessor.savedResults.imageButton')}
                  </button>
                  <button
                    className="logProcessorButton"
                    style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                    onClick={exportResultsToClipboard}
                  >
                    {t('logProcessor.savedResults.copyButton')}
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
                          {t('logProcessor.savedResults.duration')} {result.fightDuration || "60"} {t('logProcessor.savedResults.seconds')}
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
                        title={t('logProcessor.savedResults.deleteTooltip')}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="emptyState" style={{ padding: "2rem" }}>
                <div className="emptyStateIcon">{t('logProcessor.savedResults.emptyState.icon')}</div>
                <p>{t('logProcessor.savedResults.emptyState.message')}</p>
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
                      {t('logProcessor.results.duration')} {fightDuration} {t('logProcessor.savedResults.seconds')}
                    </div>
                  </>
                )}
                <div className="dpsOutput">
                  <span className="dpsLabel">{t('logProcessor.results.dpsLabel')}</span>
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
                    placeholder={t('logProcessor.results.saveNamePlaceholder')}
                  />
                  <button
                    className="logProcessorButtonv3"
                    onClick={handleSaveDPSResult}
                  >
                    {t('logProcessor.results.saveButton')}
                  </button>
                </div>
              )}

              {/* Skill Details */}
              <div className="skillDetails">
                <h3 style={{ color: "#f8fafc", marginBottom: "1rem", fontSize: "1.1rem" }}>{t('logProcessor.results.skillBreakdown')}</h3>
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
                                  ? t('logProcessor.skillStats.removeButton')
                                  : t('logProcessor.skillStats.compareButton')}
                              </button>
                            </div>

                            <div className="skillStats">
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.min')}</span>
                                <span className="statValue">
                                  {min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.max')}</span>
                                <span className="statValue">
                                  {max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.avg')}</span>
                                <span className="statValue">
                                  {average
                                    ? average.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.hits')}</span>
                                <span className="statValue">{hits}</span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.crits')}</span>
                                <span className="statValue">{criticalHits}</span>
                              </div>
                              <div className="statItem">
                                <span className="statLabel">{t('logProcessor.skillStats.critPercent')}</span>
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
                    <div className="emptyStateIcon">{t('logProcessor.skillStats.noDataIcon')}</div>
                    <p>{t('logProcessor.skillStats.noData')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="emptyState" style={{ marginTop: "3rem" }}>
              <div className="emptyStateIcon" style={{ fontSize: "4rem" }}>⚡</div>
              <p style={{ fontSize: "1.1rem" }}>{t('logProcessor.results.emptyState.message')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogProcessor;
