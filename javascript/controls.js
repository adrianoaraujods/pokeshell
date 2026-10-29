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
  back: showNextGen,
  up: stepCursor,
  down: stepCursor,
  left: stepCursor,
  right: stepCursor,
  "flip-left": () => flipReadout("description"),
  "flip-right": () => flipReadout("effectiveness"),
  "page-up": () => page(secondaryScreen, -1),
  "page-down": () => page(secondaryScreen, 1),
};

const ERROR_ACTIONS = {
  confirm: () => main(),
};

const SCREEN_ACTIONS = new Map([
  [discoverScreen, DISCOVER_ACTIONS],
  [errorScreen, ERROR_ACTIONS],
]);

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
  SCREEN_ACTIONS.get(currentScreen)?.[input.type]?.(input);
}

/**
 * Handles clicks on the pokedex buttons.
 * @param {MouseEvent} event the click event.
 */
function onButtonClick(event) {
  const button = event.target.closest("button[id]");
  const input = button && buttonInput(button.id);
  if (input) handle(input);
}

/**
 * Handles the keyboard, leaving shortcuts and typing in text fields alone.
 * @param {KeyboardEvent} event the keydown event.
 */
function onKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest?.("input, textarea")) return;

  const input = keyInput(event.key);
  if (!input) return;

  event.preventDefault();
  handle(input);
}
