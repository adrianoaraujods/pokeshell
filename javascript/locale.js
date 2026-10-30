const LANGUAGE_KEY = "pokedex-language";
const LANGUAGES = [
  { code: "en", name: "ENGLISH" },
  { code: "es", name: "ESPAÑOL" },
  { code: "pt-BR", name: "PORTUGUÊS" },
  { code: "ja", name: "日本語" },
];

let language = savedLanguage();

/**
 * Reads the language chosen in an earlier visit.
 * @returns {string} the saved language code, or English when none is saved or storage is unavailable.
 */
function savedLanguage() {
  try {
    const code = localStorage.getItem(LANGUAGE_KEY);
    return LANGUAGES.some((entry) => entry.code === code) ? code : "en";
  } catch {
    return "en";
  }
}

/**
 * Switches the language and remembers it, or goes on with it for the session only when
 * storage is unavailable.
 * @param {string} code the language code.
 */
function setLanguage(code) {
  language = code;
  try {
    localStorage.setItem(LANGUAGE_KEY, code);
  } catch {}
}

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
    number: "NUMBER",
    invalidNumber: "INVALID NUMBER",
    noEvolutions: "NO EVOLUTIONS",
    lv: "LV",
    noMoves: "NO LEVEL-UP MOVES",
    hp: "HP",
    attack: "ATTACK",
    defense: "DEFENSE",
    "special-attack": "SPECIAL ATTACK",
    "special-defense": "SPECIAL DEFENSE",
    speed: "SPEED",
  },
  es: {
    loading: "CARGANDO…",
    error: "ERROR DE CONEXIÓN",
    retry: "PULSA CONFIRM PARA REINTENTAR",
    search: "ESCRIBE NOMBRE O NÚMERO...",
    noResults: "SIN RESULTADOS",
    gen: "GEN",
    all: "TODAS",
    selected: "SELECCIONADO",
    generation: "GENERACIÓN",
    language: "IDIOMA",
    description: "DESCRIPCIÓN",
    effectiveness: "EFECTIVIDAD DE TIPO",
    info: "INFO",
    evolutions: "EVOL.",
    stats: "STATS",
    moves: "MOVS.",
    height: "ALTURA",
    weight: "PESO",
    abilities: "HABILIDADES",
    habitat: "HÁBITAT",
    eggGroups: "GRUPOS HUEVO",
    captureRate: "RATIO CAPTURA",
    gender: "GÉNERO",
    genderless: "SIN GÉNERO",
    male: "M",
    female: "H",
    normal: "NORMAL",
    from: "DE",
    to: "A",
    level: "NIVEL",
    trade: "INTERCAMBIO",
    hold: "LLEVA",
    happiness: "FELICIDAD",
    number: "NÚMERO",
    invalidNumber: "NÚMERO INVÁLIDO",
    noEvolutions: "SIN EVOLUCIONES",
    lv: "NV",
    noMoves: "SIN MOVS. POR NIVEL",
    hp: "PS",
    attack: "ATAQUE",
    defense: "DEFENSA",
    "special-attack": "AT. ESPECIAL",
    "special-defense": "DEF. ESPECIAL",
    speed: "VELOCIDAD",
  },
  "pt-BR": {
    loading: "CARREGANDO…",
    error: "ERRO DE CONEXÃO",
    retry: "PRESSIONE CONFIRM PARA TENTAR",
    search: "DIGITE NOME OU NÚMERO...",
    noResults: "SEM RESULTADOS",
    gen: "GER",
    all: "TODAS",
    selected: "SELECIONADO",
    generation: "GERAÇÃO",
    language: "IDIOMA",
    description: "DESCRIÇÃO",
    effectiveness: "EFETIVIDADE DE TIPO",
    info: "INFO",
    evolutions: "EVOL.",
    stats: "STATS",
    moves: "GOLPES",
    height: "ALTURA",
    weight: "PESO",
    abilities: "HABILIDADES",
    habitat: "HABITAT",
    eggGroups: "GRUPOS DE OVO",
    captureRate: "TAXA DE CAPTURA",
    gender: "GÊNERO",
    genderless: "SEM GÊNERO",
    male: "M",
    female: "F",
    normal: "NORMAL",
    from: "DE",
    to: "PARA",
    level: "NÍVEL",
    trade: "TROCA",
    hold: "SEGURA",
    happiness: "FELICIDADE",
    number: "NÚMERO",
    invalidNumber: "NÚMERO INVÁLIDO",
    noEvolutions: "SEM EVOLUÇÕES",
    lv: "NV",
    noMoves: "SEM GOLPES POR NÍVEL",
    hp: "HP",
    attack: "ATAQUE",
    defense: "DEFESA",
    "special-attack": "ATQ. ESPECIAL",
    "special-defense": "DEF. ESPECIAL",
    speed: "VELOCIDADE",
  },
  ja: {
    loading: "よみこみちゅう…",
    error: "つうしんエラー",
    retry: "CONFIRMでさいしこう",
    search: "なまえかばんごう...",
    noResults: "みつかりません",
    gen: "せだい",
    all: "ぜんぶ",
    selected: "せんたくちゅう",
    generation: "せだい",
    language: "げんご",
    description: "せつめい",
    effectiveness: "タイプそうせい",
    info: "じょうほう",
    evolutions: "しんか",
    stats: "のうりょく",
    moves: "わざ",
    height: "たかさ",
    weight: "おもさ",
    abilities: "とくせい",
    habitat: "せいそくち",
    eggGroups: "タマゴグループ",
    captureRate: "ほかくりつ",
    gender: "せいべつ",
    genderless: "せいべつなし",
    male: "♂",
    female: "♀",
    normal: "ノーマル",
    from: "まえ",
    to: "つぎ",
    level: "レベル",
    trade: "つうしん",
    hold: "もちもの",
    happiness: "なつき",
    number: "ばんごう",
    invalidNumber: "ばんごうがむこう",
    noEvolutions: "しんかなし",
    lv: "Lv",
    noMoves: "レベルわざなし",
    hp: "HP",
    attack: "こうげき",
    defense: "ぼうぎょ",
    "special-attack": "とくこう",
    "special-defense": "とくぼう",
    speed: "すばやさ",
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
