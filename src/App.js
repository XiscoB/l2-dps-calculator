import React, { useState, useEffect } from "react";
import "./App.css";
import LogProcessor from "./LogProcessor";
import BuffDebuffChecker from "./BuffDebuffChecker";
import LanguageSelector from "./LanguageSelector";
import SEO from "./components/SEO";
import { useLanguage } from "./i18n/LanguageContext";
import logo from "./logo.png";

function App() {
  const { t } = useLanguage();
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
        t('alert.newVersion', { currentVersion, storedVersion })
      );
      setShowUpdateButton(true);
    } else if (currentVersion !== storedVersion) {
      localStorage.setItem("appVersion", currentVersion);
      console.log(
        "Minor update within the same subversion, version updated in storage.",
      );
    }
  }, [t, currentVersion]);

  const handleClearData = () => {
    localStorage.clear();
    localStorage.setItem("appVersion", currentVersion);
    window.location.reload();
  };

  return (
    <div className="App">
      <SEO />
      <header className="App-header">
        <img src={logo} alt="L2 DPS Calculator Logo" />
        <h1>{t('app.title')}</h1>
        <p className="subtitle">
          "{t('app.subtitle')}"
        </p>
      </header>

      <div>
        {showUpdateButton && (
          <div className="warning-banner">
            <p>{t('updateBanner.message')}</p>
            <button onClick={handleClearData}>{t('updateBanner.button')}</button>
          </div>
        )}

        {activeComponent === "logProcessor" && <LogProcessor />}
        {activeComponent === "buffDebuffChecker" && <BuffDebuffChecker />}
      </div>

      <footer className="App-footer">
        <div className="footerRow">
          <LanguageSelector />
        </div>
        <p>{t('app.version')} {currentVersion}</p>
        <p>{t('app.storedVersion')} {storedVersion || "None"}</p>
        <p>{t('app.madeBy')}</p>
        <a
          href="https://github.com/Xiscob/l2-dps-calculator"
          target="_blank"
          rel="noopener noreferrer"
          className="collaborateLink"
        >
          {t('app.contribute')}
        </a>
        <a
          href="https://github.com/Xiscob/l2-dps-calculator/issues/new?title=%5BBug%5D+&body=%23%23+Description%0ADescribe+the+bug+here...%0A%0A%23%23+Steps+to+Reproduce%0A1.+Go+to+...%0A2.+Click+on+...%0A3.+See+error%0A%0A%23%23+Expected+Behavior%0AWhat+did+you+expect+to+happen%3F%0A%0A%23%23+Actual+Behavior%0AWhat+actually+happened%3F%0A%0A%23%23+Environment%0A-+App+Version%3A+{currentVersion}%0A-+Browser%3A+...%0A-+OS%3A+...%0A%0A%23%23+Additional+Context%0AAdd+any+other+context+or+screenshots+here.%0A"
          target="_blank"
          rel="noopener noreferrer"
          className="bugReportLink"
        >
          {t('app.reportBug')}
        </a>
      </footer>
    </div>
  );
}

export default App;
