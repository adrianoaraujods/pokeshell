const GENS = [
  [1, 151],
  [152, 251],
  [252, 386],
  [387, 493],
  [494, 649],
  [650, 721],
  [722, 809],
  [810, 905],
  [906, 1025],
];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

let gen = 0;

/**
 * Finds the generation a pokemon was introduced in.
 * @param {number} id the pokemon id.
 * @returns {number} the generation, from `1` to `9`.
 */
function genOf(id) {
  return GENS.findIndex(([first, last]) => id >= first && id <= last) + 1;
}

/**
 * Checks if a pokemon passes the generation filter, where generation `0` means all of them.
 * @param {{id: number}} entry the dex entry.
 * @returns {boolean} `true` when the pokemon is shown.
 */
function inGen(entry) {
  return !gen || genOf(entry.id) === gen;
}

/**
 * Moves the generation filter to the next one: ALL, I, II … IX, then back to ALL.
 */
function nextGen() {
  gen = (gen + 1) % (GENS.length + 1);
}

/**
 * Builds the label of the generation filter, e.g. `GEN III` or `GEN ALL`.
 * @returns {string} the label.
 */
function genLabel() {
  return t("gen") + " " + (gen ? ROMAN[gen - 1] : t("all"));
}
