const STRINGS = {
  en: {
    loading: "LOADING…",
    error: "CONNECTION ERROR",
    search: "TYPE NAME OR NUMBER...",
  },
};

/**
 * Selects the content based on the current language.
 * @param {string} key the key to select the content.
 * @returns the content to render in the correct language.
 */
function t(key) {
  return STRINGS[language]?.[key] ?? STRINGS.en[key] ?? key;
}
