const BUTTONS = {
  "D-UP": "up",
  "D-DOWN": "down",
  "D-LEFT": "left",
  "D-RIGHT": "right",
  CONFIRM: "confirm",
  BACK: "back",
  TAB: "tab",
  LANG: "language",
  LEFT: "page-up",
  RIGHT: "page-down",
  L: "flip-left",
  R: "flip-right",
};

const KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "confirm",
  Backspace: "back",
  Escape: "back",
  Tab: "tab",
  l: "language",
  q: "panel-left",
  e: "panel-right",
  "-": "page-up",
  "+": "page-down",
  "=": "page-down",
};

const DISCOVER_ACTIONS = {
  confirm: confirmDiscover,
  digit: typeDigit,
  tab: focusSearch,
  back: backDiscover,
  up: stepCursor,
  down: stepCursor,
  left: stepCursor,
  right: stepCursor,
  "flip-left": () => flipReadout("description"),
  "flip-right": () => flipReadout("effectiveness"),
  "page-up": () => page(secondaryScreen, -1),
  "page-down": () => page(secondaryScreen, 1),
};

const DETAILS_ACTIONS = {
  confirm: confirmDetails,
  digit: typeDigit,
  tab: nextTab,
  back: backDetails,
  up: () => page(mainScreen, -1),
  down: () => page(mainScreen, 1),
  left: () => stepSwitcher(-1),
  right: () => stepSwitcher(1),
  "flip-left": () => flipReadout("description"),
  "flip-right": () => flipReadout("effectiveness"),
  "page-up": () => page(secondaryScreen, -1),
  "page-down": () => page(secondaryScreen, 1),
};

const ERROR_ACTIONS = {
  confirm: () => main(),
};

const LANGUAGE_ACTIONS = {
  up: stepLanguage,
  down: stepLanguage,
  confirm: applyLanguage,
  back: () => closeLanguageMenu(),
  language: () => closeLanguageMenu(),
};

const SCREEN_ACTIONS = new Map([
  [languageScreen, LANGUAGE_ACTIONS],
  [discoverScreen, DISCOVER_ACTIONS],
  [detailsScreen, DETAILS_ACTIONS],
  [errorScreen, ERROR_ACTIONS],
]);

let searchingAtPress = false;

document.addEventListener("pointerdown", onPointerDown, true);
document.addEventListener("click", onButtonClick);
document.addEventListener("keydown", onKeyDown);

/**
 * Translates a pokedex button into an input.
 * @param {string} id the button id.
 * @returns {{type: string, value?: number} | null} the input, or `null` for unmapped buttons.
 */
function buttonInput(id) {
  const digit = id.match(/^KEY-(\d)$/);
  if (digit) return { type: "digit", value: Number(digit[1]) };
  return BUTTONS[id] ? { type: BUTTONS[id] } : null;
}

/**
 * Translates a keyboard key into an input.
 * @param {string} key the pressed key.
 * @returns {{type: string, value?: number} | null} the input, or `null` for unmapped keys.
 */
function keyInput(key) {
  if (/^\d$/.test(key)) return { type: "digit", value: Number(key) };
  const type = KEYS[key.length === 1 ? key.toLowerCase() : key];
  return type ? { type } : null;
}

/**
 * Sends an input to the screen on display, which ignores the inputs it doesn't use.
 * @param {{type: string, value?: number}} input the input.
 */
function handle(input) {
  if (input.type === "language" && currentScreen !== languageScreen) {
    openLanguageMenu();
    return;
  }
  SCREEN_ACTIONS.get(currentScreen)?.[input.type]?.(input);
}

/**
 * Remembers whether the search bar was open, since pressing a pokedex button blurs it
 * before the click lands and TAB must still toggle it closed.
 */
function onPointerDown() {
  searchingAtPress = searching();
}

/**
 * Handles clicks on the pokedex buttons. Any button leaves the search bar, as some
 * browsers don't move focus to buttons, and TAB pressed while searching only closes it.
 * @param {MouseEvent} event the click event.
 */
function onButtonClick(event) {
  const button = event.target.closest("button[id]");
  const input = button && buttonInput(button.id);
  const wasSearching = searchingAtPress || searching();
  searchingAtPress = false;
  if (!input) return;

  if (searching()) searchBar().blur();
  if (input.type === "tab" && wasSearching) return;
  handle(input);
}

/**
 * Handles the keyboard, leaving shortcuts and typing in text fields alone. In the search
 * bar only Tab and Esc are taken, and both return to the grid.
 * @param {KeyboardEvent} event the keydown event.
 */
function onKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.id === "search-bar") {
    if (event.key !== "Tab" && event.key !== "Escape") return;
    event.preventDefault(); // Esc would also clear a type="search" field
    event.target.blur();
    return;
  }
  if (event.target.closest?.("input, textarea")) return;

  const input = keyInput(event.key);
  if (!input) return;

  event.preventDefault();
  handle(input);
}
