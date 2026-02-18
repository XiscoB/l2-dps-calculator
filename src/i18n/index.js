import en from './en.json';
import es from './es.json';
import el from './el.json';
import ptBR from './pt-BR.json';
import zh from './zh.json';
import ko from './ko.json';
import vi from './vi.json';
import ja from './ja.json';
import pl from './pl.json';
import ru from './ru.json';

// Available languages configuration
// Add new languages here to make them available in the app
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    translation: en
  },
  es: {
    code: 'es',
    name: 'Español',
    translation: es
  },
  el: {
    code: 'el',
    name: 'Ελληνικά',
    translation: el
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português',
    translation: ptBR
  },
  zh: {
    code: 'zh',
    name: '简体中文',
    translation: zh
  },
  ko: {
    code: 'ko',
    name: '한국어',
    translation: ko
  },
  vi: {
    code: 'vi',
    name: 'Tiếng Việt',
    translation: vi
  },
  ja: {
    code: 'ja',
    name: '日本語',
    translation: ja
  },
  pl: {
    code: 'pl',
    name: 'Polski',
    translation: pl
  },
  ru: {
    code: 'ru',
    name: 'Русский',
    translation: ru
  }
};

// Default language
export const defaultLanguage = 'en';

// Helper function to get nested translation values
export const getTranslation = (obj, path) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  
  return result;
};

// Helper function to replace template variables like {{variable}}
export const interpolate = (text, variables = {}) => {
  if (typeof text !== 'string') return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

// Get all available languages as array for selectors
export const getAvailableLanguages = () => {
  return Object.values(languages);
};

// Get language display name (just returns the name, no flag)
export const getLanguageDisplay = (languageCode) => {
  const lang = languages[languageCode];
  return lang ? lang.name : languageCode;
};

// Get language by code
export const getLanguageByCode = (code) => {
  return languages[code] || languages[defaultLanguage];
};
