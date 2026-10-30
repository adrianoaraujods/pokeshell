const DETAIL_TABS = ["info", "evolutions", "stats", "moves"];

let detailEntry = null;
let detailTab = 0;
let formIndex = 0;
let evolution = null;
let evoIndex = 0;
let evoFailed = false;
let evoRequest = 0;
let abilityEffects = new Map();
let info = null;
let infoFailed = false;
let infoRequest = 0;

/**
 * Opens the details of the pokemon under the cursor, remembering where the grid was
 * scrolled so BACK can return to it.
 */
function openDetails() {
  const entry = selected();
  if (!entry) return;

  gridScroll = mainScreen.scrollTop;
  showDetails(entry);
}

/**
 * Shows the INFO tab of a pokemon, forgetting the form and family of the previous one.
 * @param {{id: number, name: string}} entry the dex entry to show.
 */
function showDetails(entry) {
  detailEntry = entry;
  detailTab = 0;
  formIndex = 0;
  evolution = null;
  evoIndex = 0;
  evoFailed = false;
  infoFailed = false;
  display(detailsScreen);
}

/**
 * Jumps from the EVOL. tab to the INFO tab of the family member on show.
 */
function confirmMember() {
  const member = viewed();
  if (DETAIL_TABS[detailTab] !== "evolutions" || member.id === detailEntry.id) return;

  evoRequest++;
  showDetails(member);
  mainScreen.scrollTop = 0;
}

/**
 * Returns to the grid, with the cursor on the same card and the grid where it was.
 */
function closeDetails() {
  infoRequest++;
  evoRequest++;
  const previewing = viewed()?.id !== selected()?.id;
  if (formIndex) {
    formIndex = 0;
    applyFormReadout();
  }
  if (previewing) readout = null;
  display(discoverScreen);
  if (previewing) scheduleReadout();
  mainScreen.scrollTop = gridScroll;
}

/**
 * Fetches the INFO facts of the viewed pokemon and renders the tab once they arrive. Only
 * the latest request renders.
 * @param {{id: number, name: string}} entry the viewed dex entry.
 */
async function loadInfo(entry) {
  if (info?.id === entry.id) return;
  const request = ++infoRequest;

  try {
    const next = await fetchInfo(entry.id);
    if (request !== infoRequest) return;
    info = { id: entry.id, ...next };
    infoFailed = false;
  } catch {
    if (request !== infoRequest) return;
    infoFailed = true;
  }
  const top = mainScreen.scrollTop;
  renderDetails();
  mainScreen.scrollTop = top;
  loadAbilityEffects();
}

/**
 * Fetches the effects of the viewed form's abilities that aren't known yet and renders
 * them on the MOVES tab. An ability that fails to load keeps showing by name only.
 */
async function loadAbilityEffects() {
  const form = info?.id === detailEntry.id && info.forms[formIndex];
  if (DETAIL_TABS[detailTab] !== "moves" || !form) return;

  const missing = form.abilities.filter((name) => !abilityEffects.has(name));
  if (!missing.length) return;

  await Promise.all(
    missing.map(async (name) => {
      try {
        abilityEffects.set(name, await fetchAbilityEffect(name));
      } catch {}
    }),
  );
  if (DETAIL_TABS[detailTab] !== "moves" || info?.id !== detailEntry.id) return;

  const top = mainScreen.scrollTop;
  renderDetails();
  mainScreen.scrollTop = top;
}

/**
 * Renders the tab bar and the active tab on the main screen, keeping the tab body at the top.
 */
function renderDetails() {
  mainScreen.innerHTML = detailsScreen().main;
  mainScreen.scrollTop = 0;
}

/**
 * Moves to the next tab: INFO, EVOL., STATS, MOVES, then back to INFO.
 */
function nextTab() {
  const previewing = viewed()?.id !== detailEntry.id;
  evoRequest++;
  detailTab = (detailTab + 1) % DETAIL_TABS.length;
  renderDetails();
  if (previewing) renderViewed();
  if (DETAIL_TABS[detailTab] === "evolutions") openEvolutions(detailEntry);
  if (DETAIL_TABS[detailTab] === "moves") loadAbilityEffects();
}

/**
 * Finds the pokemon the details are showing: the selected family member on the EVOL. tab,
 * the one under the cursor otherwise.
 * @returns {{id: number, name: string} | null} the viewed dex entry.
 */
function viewed() {
  const member = DETAIL_TABS[detailTab] === "evolutions" && evolution?.[evoIndex];
  return member ? { id: member.id, name: member.name } : detailEntry;
}

/**
 * Renders the info, secondary and type screens for the viewed pokemon.
 */
function renderViewed() {
  const entry = viewed();
  infoScreen.innerHTML = infoReadout(entry);
  scheduleReadout(entry);
}

/**
 * Opens the EVOL. tab on the pokemon under the cursor, fetching its family if needed.
 * @param {{id: number, name: string}} entry the viewed dex entry.
 */
function openEvolutions(entry) {
  if (!evolution) {
    loadEvolution(entry);
    return;
  }
  evoIndex = Math.max(0, evolution.findIndex((member) => member.id === entry.id));
  renderDetails();
}

/**
 * Fetches the evolution family and renders the EVOL. tab once it arrives. Only the latest
 * request renders.
 * @param {{id: number, name: string}} entry the viewed dex entry.
 */
async function loadEvolution(entry) {
  const request = ++evoRequest;

  try {
    const members = await fetchEvolutions(entry.id);
    if (request !== evoRequest) return;
    evolution = members;
    evoIndex = Math.max(0, members.findIndex((member) => member.id === entry.id));
    evoFailed = false;
  } catch {
    if (request !== evoRequest) return;
    evoFailed = true;
  }
  renderDetails();
}

/**
 * Cycles the viewed family member on the EVOL. tab, wrapping at both ends.
 * @param {-1 | 1} direction `-1` for the previous member or `1` for the next.
 */
function stepMember(direction) {
  const count = evolution?.length ?? 0;
  if (DETAIL_TABS[detailTab] !== "evolutions" || count < 2) return;

  evoIndex = (evoIndex + direction + count) % count;
  renderDetails();
  renderViewed();
}

/**
 * Cycles the switcher of the active tab: forms on INFO, family members on EVOL.
 * @param {-1 | 1} direction `-1` for the previous choice or `1` for the next.
 */
function stepSwitcher(direction) {
  stepForm(direction);
  stepMember(direction);
}

/**
 * Gives the readout the types and effectiveness of the viewed form, if both are loaded.
 */
function applyFormReadout() {
  const form = info?.id === viewed()?.id ? info.forms[formIndex] : null;
  if (!readout || !form) return;
  readout = {
    ...readout,
    types: form.types,
    effectiveness: form.effectiveness,
  };
}

/**
 * Cycles the INFO form, wrapping at both ends, and everything that follows the form.
 * @param {-1 | 1} direction `-1` for the previous form or `1` for the next.
 */
function stepForm(direction) {
  const count = info?.id === detailEntry.id ? info.forms.length : 0;
  if (DETAIL_TABS[detailTab] !== "info" || count < 2) return;

  formIndex = (formIndex + direction + count) % count;
  applyFormReadout();
  const top = mainScreen.scrollTop;
  renderDetails();
  mainScreen.scrollTop = top;
  renderReadout();
}
