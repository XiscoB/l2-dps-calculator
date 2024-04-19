import React, { useState } from "react";

import "./ComparisonDisplay.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlusSquare,
  faMinusSquare,
} from "@fortawesome/free-solid-svg-icons";

function ComparisonDisplay({
  comparisonData,
  removeFromComparison,
  clearComparisonData,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  if (!comparisonData.length) return <div>No data to display</div>;

  return (
    <div className="comparisonContainer">
      <h3>Comparison Results</h3>
      <button onClick={clearComparisonData} className="clearAllButton">
        Clear All Comparisons <FontAwesomeIcon icon={faTrashAlt} />
      </button>
      <table className="comparisonTable">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Save Name</th>
            <th>Min Damage</th>
            <th>Max Damage</th>
            <th>Hits</th>
            <th>Critical Hits</th>
            <th>Critical Hit Rate</th>
            <th>Details</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((item, index) => (
            <React.Fragment key={index}>
              <tr key={index}>
                <td>{item.skill}</td>
                <td>{item.key}</td>
                <td>
                  {item.data.min
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
                <td>
                  {item.data.max
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
                <td>{item.data.hits}</td>
                <td>{item.data.criticalHits}</td>
                <td>
                  {item.data.hits > 0
                    ? ((item.data.criticalHits / item.data.hits) * 100).toFixed(
                        2
                      ) + "%"
                    : "0%"}
                </td>
                <td>
                  <button
                    onClick={() =>
                      setExpandedRow(expandedRow === index ? null : index)
                    }
                    className="detailsButton"
                  >
                    {expandedRow === index ? (
                      <FontAwesomeIcon icon={faMinusSquare} />
                    ) : (
                      <FontAwesomeIcon icon={faPlusSquare} />
                    )}
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
                  <td colSpan="7">
                    {" "}
                    {/* Span across the number of columns in your table */}
                    <div className="logDetails">
                      {/* Render the details here */}
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
  );
}

export default ComparisonDisplay;
