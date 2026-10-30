let language = "en";

const STRINGS = {
  en: {
    loading: "LOADING…",
    error: "CONNECTION ERROR",
    retry: "PRESS CONFIRM TO RETRY",
    search: "TYPE NAME OR NUMBER...",
    noResults: "NO RESULTS",
    gen: "GEN",
    all: "ALL",
    selected: "SELECTED",
    generation: "GENERATION",
    language: "LANGUAGE",
    description: "DESCRIPTION",
    effectiveness: "TYPE EFFECTIVENESS",
    info: "INFO",
    evolutions: "EVOL.",
    stats: "STATS",
    moves: "MOVES",
    height: "HEIGHT",
    weight: "WEIGHT",
    abilities: "ABILITIES",
    habitat: "HABITAT",
    eggGroups: "EGG GROUPS",
    captureRate: "CAPTURE RATE",
    gender: "GENDER",
    genderless: "GENDERLESS",
    male: "M",
    female: "F",
    normal: "NORMAL",
    from: "FROM",
    to: "TO",
    level: "LEVEL",
    trade: "TRADE",
    hold: "HOLD",
    happiness: "HAPPINESS",
    noEvolutions: "NO EVOLUTIONS",
    lv: "LV",
    noMoves: "NO LEVEL-UP MOVES",
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
