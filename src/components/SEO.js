import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * SEO Component - Dynamic Meta Tag Management
 * 
 * Updates document meta tags dynamically based on:
 * - Current language selection
 * - Page state
 * - Content changes
 * 
 * This ensures proper SEO for SPAs where the content changes
 * without page reloads.
 */

// Base URL for the application
const BASE_URL = 'https://xiscob.github.io/l2-dps-calculator';

// Language to locale mapping for OG tags
const LANGUAGE_LOCALES = {
  en: 'en_US',
  es: 'es_ES',
  el: 'el_GR',
  'pt-BR': 'pt_BR',
  zh: 'zh_CN',
  ko: 'ko_KR',
  vi: 'vi_VN',
  ja: 'ja_JP',
  pl: 'pl_PL',
  ru: 'ru_RU'
};

// Language to HTML lang attribute mapping
const HTML_LANGS = {
  en: 'en',
  es: 'es',
  el: 'el',
  'pt-BR': 'pt-BR',
  zh: 'zh',
  ko: 'ko',
  vi: 'vi',
  ja: 'ja',
  pl: 'pl',
  ru: 'ru'
};

/**
 * SEO Component
 * @param {Object} props
 * @param {string} props.title - Page title (optional, uses translation if not provided)
 * @param {string} props.description - Page description (optional, uses translation if not provided)
 * @param {string} props.image - OG image URL (optional)
 * @param {string} props.type - OG type (default: website)
 * @param {Object} props.additionalMeta - Additional meta tags to set
 */
function SEO({ 
  title, 
  description, 
  image = `${BASE_URL}/og-image.png`,
  type = 'website',
  additionalMeta = {}
}) {
  const { currentLanguage, t } = useLanguage();

  useEffect(() => {
    // Get translated content if not provided
    const pageTitle = title || t('seo.title') || 'L2 DPS Calculator';
    const pageDescription = description || t('seo.description') || 
      'Free Lineage 2 DPS Calculator - Parse combat logs and analyze damage statistics.';
    
    // Update document title
    document.title = `${pageTitle} | Lineage 2 Combat Log Analyzer`;

    // Update HTML lang attribute
    document.documentElement.lang = HTML_LANGS[currentLanguage] || 'en';

    // Update or create meta tags
    updateMetaTag('name', 'description', pageDescription);
    updateMetaTag('name', 'title', pageTitle);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', pageDescription);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:locale', LANGUAGE_LOCALES[currentLanguage] || 'en_US');
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', pageDescription);
    updateMetaTag('name', 'twitter:image', image);
    
    // Update canonical URL
    updateCanonicalLink();
    
    // Update any additional meta tags
    Object.entries(additionalMeta).forEach(([key, value]) => {
      if (key.startsWith('og:')) {
        updateMetaTag('property', key, value);
      } else {
        updateMetaTag('name', key, value);
      }
    });

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[SEO] Updated meta tags:', {
        language: currentLanguage,
        title: document.title,
        description: pageDescription
      });
    }

  }, [currentLanguage, title, description, image, type, additionalMeta, t]);

  return null; // This component doesn't render anything
}

/**
 * Helper function to update or create a meta tag
 * @param {string} attribute - 'name' or 'property'
 * @param {string} key - The attribute value
 * @param {string} content - The content to set
 */
function updateMetaTag(attribute, key, content) {
  let meta = document.querySelector(`meta[${attribute}="${key}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

/**
 * Helper function to update canonical link
 */
function updateCanonicalLink() {
  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = BASE_URL + window.location.pathname + window.location.search;
}

/**
 * Hook for programmatically updating page metadata
 * Can be used in components that need to update SEO dynamically
 */
export function useSEO() {
  const { currentLanguage, t } = useLanguage();

  const setSEO = (options = {}) => {
    const {
      title,
      description,
      image,
      type = 'website'
    } = options;

    const pageTitle = title || t('seo.title');
    const pageDescription = description || t('seo.description');

    document.title = pageTitle ? `${pageTitle} | Lineage 2 Combat Log Analyzer` : 'L2 DPS Calculator';
    
    updateMetaTag('name', 'description', pageDescription);
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', pageDescription);
    updateMetaTag('property', 'og:type', type);
    
    if (image) {
      updateMetaTag('property', 'og:image', image);
    }
    
    updateMetaTag('property', 'og:locale', LANGUAGE_LOCALES[currentLanguage] || 'en_US');
  };

  return { setSEO };
}

/**
 * Utility to generate structured data for specific pages
 * @param {Object} data - Structured data object
 */
export function injectStructuredData(data) {
  const scriptId = 'dynamic-structured-data';
  let script = document.getElementById(scriptId);
  
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    ...data
  });
}

/**
 * Remove dynamically injected structured data
 */
export function removeStructuredData() {
  const script = document.getElementById('dynamic-structured-data');
  if (script) {
    script.remove();
  }
}

export default SEO;
