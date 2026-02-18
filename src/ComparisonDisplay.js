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
import html2canvas from "html2canvas";
import { useLanguage } from "./i18n/LanguageContext";

function ComparisonDisplay({
  comparisonData,
  removeFromComparison,
  clearComparisonData,
  showToast,
}) {
  const { t } = useLanguage();
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

  const copyComparisonAsText = () => {
    let text = t('comparison.title') + "\n\n";
    text += `${t('comparison.table.skill')} | ${t('comparison.table.saveName')} | ${t('comparison.table.minDamage')} | ${t('comparison.table.maxDamage')} | ${t('comparison.table.average')} | ${t('comparison.table.hits')} | ${t('comparison.table.crits')} | ${t('comparison.table.critRate')}\n`;
    text += "-".repeat(80) + "\n";
    
    sortedData.forEach((item) => {
      const critRate = item.data.hits > 0 
        ? ((item.data.criticalHits / item.data.hits) * 100).toFixed(2) + "%"
        : "0%";
      
      text += `${item.skill} | ${item.key} | `;
      text += `${item.data.min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} | `;
      text += `${item.data.max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} | `;
      text += `${item.data.average ? item.data.average.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A"} | `;
      text += `${item.data.hits} | ${item.data.criticalHits} | ${critRate}\n`;
    });
    
    navigator.clipboard.writeText(text).then(
      () => {
        if (showToast) showToast(t('comparison.toast.copied'));
      },
      (err) => {
        if (showToast) showToast(t('comparison.toast.copyFailed'));
        console.error("Could not copy text: ", err);
      }
    );
  };

  const exportComparisonAsImage = async () => {
    // Create a temporary element for capture with bright styling
    const tempDiv = document.createElement("div");
    tempDiv.id = "comparison-capture-temp";
    tempDiv.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      background: #1a1f2e;
      padding: 20px;
      font-family: 'Cinzel', 'Georgia', serif;
    `;

    // Build the table HTML manually with bright colors
    let tableHTML = `
      <div style="
        color: #e8d5a3;
        font-size: 1.1rem;
        margin-bottom: 15px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: bold;
      ">${t('comparison.title')}</div>
      <div style="
        background: #0a0c10;
        border-radius: 8px;
        border: 1px solid rgba(201, 169, 97, 0.3);
        overflow: hidden;
      ">
      <table style="
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      ">
        <thead>
          <tr style="background: #2a3040;">
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.skill')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.saveName')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.minDamage')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.maxDamage')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.average')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.hits')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.crits')}</th>
            <th style="padding: 12px; text-align: left; color: #e8d5a3; font-weight: bold;">${t('comparison.table.critRate')}</th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedData.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? "#151922" : "#1a1f2e";
      const critRate = item.data.hits > 0 
        ? ((item.data.criticalHits / item.data.hits) * 100).toFixed(2) 
        : "0";
      
      tableHTML += `
        <tr style="background: ${bgColor};">
          <td style="padding: 12px; color: #4a90d9; font-weight: bold;">${item.skill}</td>
          <td style="padding: 12px; color: #a89b7c;">${item.key}</td>
          <td style="padding: 12px; color: #e8d5a3; font-weight: bold;">${item.data.min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
          <td style="padding: 12px; color: #e8d5a3; font-weight: bold;">${item.data.max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
          <td style="padding: 12px; color: #e8d5a3; font-weight: bold;">${item.data.average ? item.data.average.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A"}</td>
          <td style="padding: 12px; color: #b8b0a0;">${item.data.hits}</td>
          <td style="padding: 12px; color: #b8b0a0;">${item.data.criticalHits}</td>
          <td style="padding: 12px; color: #e25822; font-weight: bold;">${critRate}%</td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
      </div>
    `;

    tempDiv.innerHTML = tableHTML;
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: "#0a0c10",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(
            () => {
              if (showToast) showToast(t('comparison.toast.imageCopied'));
              // Clean up
              document.body.removeChild(tempDiv);
            },
            (err) => {
              if (showToast) showToast(t('comparison.toast.copyFailed'));
              console.error("Could not copy image: ", err);
              document.body.removeChild(tempDiv);
            }
          );
        }
      }, "image/png", 1.0);
    } catch (err) {
      console.error("Could not generate image: ", err);
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div className="comparisonContainer" id="comparison-results-container">
      <div className="comparisonHeader">
        <h3>{t('comparison.title')}</h3>
        <div className="comparisonExportButtons">
          <button onClick={copyComparisonAsText} className="copyTextButton">
            {t('comparison.copyButton')}
          </button>
          <button onClick={exportComparisonAsImage} className="exportImageButton">
            {t('comparison.imageButton')}
          </button>
          <button onClick={clearComparisonData} className="clearAllButton">
            {t('comparison.clearButton')}
          </button>
        </div>
      </div>

      <div className="comparisonTableWrapper">
        <table className="comparisonTable">
          <thead>
            <tr>
              <th>{t('comparison.table.skill')}</th>
              <th>{t('comparison.table.saveName')}</th>
              <th onClick={() => toggleSort("min")}>
                {t('comparison.table.minDamage')}
                {sortField === "min" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th onClick={() => toggleSort("max")}>
                {t('comparison.table.maxDamage')}
                {sortField === "max" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th onClick={() => toggleSort("average")}>
                {t('comparison.table.average')}
                {sortField === "average" && (
                  <FontAwesomeIcon icon={sortDirection === "asc" ? faSortUp : faSortDown} />
                )}
              </th>
              <th>{t('comparison.table.hits')}</th>
              <th>{t('comparison.table.crits')}</th>
              <th>{t('comparison.table.critRate')}</th>
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
