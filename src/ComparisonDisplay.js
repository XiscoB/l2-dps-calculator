import React, { useState } from "react";
import "./ComparisonDisplay.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlusSquare,
  faMinusSquare,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";

function ComparisonDisplay({
  comparisonData,
  removeFromComparison,
  clearComparisonData,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState("min"); // Default to sorting by min damage
  const [sortDirection, setSortDirection] = useState("asc"); // Default to ascending sort

  if (!comparisonData.length) return <div>No data to display</div>;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc"); // Default to ascending when field changes
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
            <th onClick={() => toggleSort("min")}>
              Min Damage{" "}
              {sortField === "min" ? (
                sortDirection === "asc" ? (
                  <FontAwesomeIcon icon={faSortUp} />
                ) : (
                  <FontAwesomeIcon icon={faSortDown} />
                )
              ) : null}
            </th>
            <th onClick={() => toggleSort("max")}>
              Max Damage{" "}
              {sortField === "max" ? (
                sortDirection === "asc" ? (
                  <FontAwesomeIcon icon={faSortUp} />
                ) : (
                  <FontAwesomeIcon icon={faSortDown} />
                )
              ) : null}
            </th>
            <th onClick={() => toggleSort("average")}>
              Average Damage{" "}
              {sortField === "average" ? (
                sortDirection === "asc" ? (
                  <FontAwesomeIcon icon={faSortUp} />
                ) : (
                  <FontAwesomeIcon icon={faSortDown} />
                )
              ) : null}
            </th>{" "}
            {/* Added sortable average damage */}
            <th>Hits</th>
            <th>Critical Hits</th>
            <th>Critical Hit Rate</th>
            <th>Details</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
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
                <td>
                  {item.data.average
                    ? item.data.average
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "N/A"}
                </td>{" "}
                {/* Displaying average damage */}
                <td>{item.data.hits}</td>
                <td>{item.data.criticalHits}</td>
                <td>{`${
                  item.data.hits > 0
                    ? ((item.data.criticalHits / item.data.hits) * 100).toFixed(
                        2
                      )
                    : "0"
                }%`}</td>
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
  );
}

export default ComparisonDisplay;
