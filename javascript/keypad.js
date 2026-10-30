const KEYPAD_MAX_DIGITS = 4;

let keypad = "";
let keypadRejected = false;

/**
 * Adds a typed digit to the dex number being entered. A number that is already past the
 * dex can never become valid again, so it is rejected on the spot.
 * @param {{value: number}} input the digit input.
 */
function typeDigit(input) {
  if (keypad.length >= KEYPAD_MAX_DIGITS) return;

  const typed = keypad + input.value;
  keypadRejected = Number(typed) > MAX_DEX;
  if (keypadRejected) beep("error");
  keypad = keypadRejected ? "" : typed;
  renderReadout();
}

/**
 * Drops the number being entered and the rejection message, bringing the readout back.
 * @returns {boolean} `true` when there was something to drop.
 */
function clearKeypad() {
  if (!keypad && !keypadRejected) return false;
  keypad = "";
  keypadRejected = false;
  renderReadout();
  return true;
}

/**
 * Opens the details of the typed dex number, or rejects it when it is 0.
 */
function lookupKeypad() {
  const id = Number(keypad);
  const entry = dex.find((candidate) => candidate.id === id);
  keypad = "";
  keypadRejected = !entry;

  if (!entry) {
    beep("error");
    renderReadout();
    return;
  }
  openDetails(entry);
}

/**
 * Confirms on the discover screen: looks up the typed number, or opens the details of the
 * pokemon under the cursor when no number is pending.
 */
function confirmDiscover() {
  if (keypad) lookupKeypad();
  else openDetails();
}

/**
 * Goes back on the discover screen: first drops the number or rejection on the secondary
 * screen, and only then cycles the generation.
 */
function backDiscover() {
  if (!clearKeypad()) showNextGen();
}

/**
 * Confirms on the details screen: looks up the typed number, or jumps to the family member
 * on show when no number is pending.
 */
function confirmDetails() {
  if (keypad) lookupKeypad();
  else confirmMember();
}

/**
 * Goes back on the details screen: first drops the number or rejection on the secondary
 * screen, and only then returns to the grid.
 */
function backDetails() {
  if (!clearKeypad()) closeDetails();
}
