import React, { useState } from "react";
import "./ComparisonDisplay.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlusSquare,
  faMinusSquare,
  faSortDown,
  faSortUp,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";

function ComparisonDisplay({
  comparisonData,
  removeFromComparison,
  clearComparisonData,
  showToast,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState("min");
  const [sortDirection, setSortDirection] = useState("asc");

  if (!comparisonData.length) return null;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...comparisonData].sort((a, b) => {
    const valueA = a.data[sortField];
    const valueB = b.data[sortField];
    if (sortDirection === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  const exportComparisonAsImage = async () => {
    const element = document.getElementById("comparison-results-container");
    if (!element) return;

    try {
      // Temporarily hide export buttons and action buttons
      const exportButtons = element.querySelectorAll(".comparisonExportButtons");
      const actionButtons = element.querySelectorAll(".detailsButton, .removeRowButton");
      exportButtons.forEach((btn) => (btn.style.display = "none"));
      actionButtons.forEach((btn) => (btn.style.display = "none"));

      // Store original classes and add bright capture class
      const originalContainerClass = element.className;
      element.classList.add("capture-bright");
      
      // Brighten the table wrapper
      const tableWrapper = element.querySelector(".comparisonTableWrapper");
      const originalWrapperClass = tableWrapper ? tableWrapper.className : "";
      if (tableWrapper) {
        tableWrapper.classList.add("capture-bright-wrapper");
      }
      
      // Wait a bit for the UI to update
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        backgroundColor: "#1a1f2e",
        scale: 3,
        useCORS: true,
        logging: false,
        removeContainer: false,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      // Restore original classes
      exportButtons.forEach((btn) => (btn.style.display = ""));
      actionButtons.forEach((btn) => (btn.style.display = ""));
      element.className = originalContainerClass;
      if (tableWrapper) {
        tableWrapper.className = originalWrapperClass;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(
            () => {
              if (showToast) showToast("Image copied to clipboard!");
            },
            (err) => {
              if (showToast) showToast("Failed to copy image.");
              console.error("Could not copy image: ", err);
            }
          );
        }
      }, "image/png", 1.0);
    } catch (err) {
      console.error("Could not generate image: ", err);
    }
  };

  return (
    <div className="comparisonContainer" id="comparison-results-container">
      <div className="comparisonHeader">
        <h3>⚔️ Comparison Results</h3>
        <div className="comparisonExportButtons">
          <button onClick={exportComparisonAsImage} className="exportImageButton">
            <FontAwesomeIcon icon={faCamera} /> Image
          </button>
          <button onClick={clearComparisonData} className="clearAllButton">
            <FontAwesomeIcon icon={faTrashAlt} /> Clear All
          </button>
        </div>
      </div>

      <div className="comparisonTableWrapper">
        <table className="comparisonTable">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Save Name</th>
              <th onClick={() => toggleSort("min")}>
                Min Damage
                {sortField === "min" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th onClick={() => toggleSort("max")}>
                Max Damage
                {sortField === "max" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th onClick={() => toggleSort("average")}>
                Average
                {sortField === "average" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th>Hits</th>
              <th>Crits</th>
              <th>Crit Rate</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className="skillName" title={item.skill}>{item.skill}</td>
                  <td className="saveName">{item.key}</td>
                  <td className="damageValue">
                    {item.data.min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                  <td className="damageValue">
                    {item.data.max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                  <td className="damageValue">
                    {item.data.average
                      ? item.data.average.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : "N/A"}
                  </td>
                  <td>{item.data.hits}</td>
                  <td>{item.data.criticalHits}</td>
                  <td className="critRate">
                    {item.data.hits > 0
                      ? ((item.data.criticalHits / item.data.hits) * 100).toFixed(2)
                      : "0"}%
                  </td>
                  <td>
                    <button
                      onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      className="detailsButton"
                    >
                      <FontAwesomeIcon icon={expandedRow === index ? faMinusSquare : faPlusSquare} />
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => removeFromComparison(index)}
                      className="removeRowButton"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr>
                    <td colSpan="10">
                      <div className="logDetails">
                        {item.data.damageLines.map((line, lineIndex) => (
                          <div key={lineIndex}>{line}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonDisplay;
