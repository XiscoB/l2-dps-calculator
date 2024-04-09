import React, { useState } from "react";
import "./LogProcessor.css"; // Import the stylesheet

function LogProcessor() {
  const [logs, setLogs] = useState("");
  const [dps, setDPS] = useState(0);
  //const [damageLines, setDamageLines] = useState([]);
  const [skillInfo, setSkillInfo] = useState({});
  const [visibleSkills, setVisibleSkills] = useState({});

  const handleCalculateDPS = () => {
    console.log("Calculating DPS...");
    let { dpsToShow, skillDamageInfo } = calculateDPS(logs);
    console.log(dpsToShow);
    setDPS(dpsToShow);
    setSkillInfo(skillDamageInfo); // Update state with new skill damage info
  };

  function calculateDPS(logs) {
    const lines = logs.split("\n");
    let totalDamage = 0;
    let fightDurationSeconds = 60; // Assuming a fixed duration for simplicity
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

  return (
    <div className="logProcessorContainer">
      <textarea
        className="logProcessorTextarea"
        value={logs}
        onChange={(e) => setLogs(e.target.value)}
        placeholder="Paste your combat logs here..."
      ></textarea>
      <button className="logProcessorButton" onClick={handleCalculateDPS}>
        Calculate DPS
      </button>
      {dps > 0 && (
        <div>
          <div className="dpsOutput">
            <span className="dpsLabel">DPS:</span>
            {/* <span className="dpsValue">{dps.toFixed(2)}</span> */}
            <span className="dpsValue">
              {dps.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
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
                        <div className="skillDetails">
                          Min:{" "}
                          {min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          | Max:{" "}
                          {max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
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
      )}
    </div>
  );
}

export default LogProcessor;
