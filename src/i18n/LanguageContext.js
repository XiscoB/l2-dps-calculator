import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  languages, 
  defaultLanguage, 
  getTranslation, 
  interpolate,
  getLanguageByCode,
  getAvailableLanguages
} from './index';

// Create context
const LanguageContext = createContext();

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'l2dps_language';

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && languages[stored]) {
      return stored;
    }
    return defaultLanguage;
  });

  // Get current language data
  const currentLanguageData = getLanguageByCode(currentLanguage);
  
  // Get translations for current language
  const translations = currentLanguageData.translation;

  // Change language function
  const changeLanguage = useCallback((languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    }
  }, []);

  // Translation function
  const t = useCallback((key, variables = {}) => {
    const value = getTranslation(translations, key);
    
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    if (typeof value === 'string') {
      return interpolate(value, variables);
    }
    
    return value;
  }, [translations]);

  // Get all available languages
  const availableLanguages = getAvailableLanguages();

  // Context value
  const value = {
    currentLanguage,
    currentLanguageData,
    changeLanguage,
    t,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
