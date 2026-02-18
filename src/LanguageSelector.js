import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import './LanguageSelector.css';

function LanguageSelector() {
  const { currentLanguageData, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="languageSelector" ref={dropdownRef}>
      <button 
        className="languageSelectorButton"
        onClick={toggleDropdown}
        title="Select Language"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <span className="languageName">{currentLanguageData.name}</span>
        <span className={`languageArrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="languageDropdown">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`languageOption ${language.code === currentLanguageData.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="languageOptionName">{language.name}</span>
              {language.code === currentLanguageData.code && (
                <span className="languageOptionCheck">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
