const DETAIL_TABS = ["info", "evolutions", "stats", "moves"];

let detailTab = 0;
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
  detailTab = 0;
  infoFailed = false;
  display(detailsScreen);
}

/**
 * Returns to the grid, with the cursor on the same card and the grid where it was.
 */
function closeDetails() {
  infoRequest++;
  display(discoverScreen);
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
  detailTab = (detailTab + 1) % DETAIL_TABS.length;
  renderDetails();
}
