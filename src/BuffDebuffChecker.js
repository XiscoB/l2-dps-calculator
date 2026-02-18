import React from "react";
import "./BuffDebuffChecker.css";
import { useLanguage } from "./i18n/LanguageContext";

function BuffDebuffChecker() {
  const { t } = useLanguage();
  // Component logic...

  return (
    <div className="BuffDebuffCheckerContainer">
      {/* Your component's JSX */}
      <h2>{t('buffDebuffChecker.title')}</h2>
      {/* Other UI elements */}
    </div>
  );
}

export default BuffDebuffChecker;
