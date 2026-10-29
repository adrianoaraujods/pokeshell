let query = "";
let searchFrom = null;

/**
 * Checks a pokemon against the search query: an exact dex number, or any part of the name,
 * as a slug or as displayed.
 * @param {{id: number, name: string}} entry the dex entry.
 * @returns {boolean} `true` when it matches, or when the query is empty.
 */
function matchesQuery(entry) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (/^\d+$/.test(q) && Number(q) === entry.id) return true;
  return entry.name.includes(q) || entry.name.replace(/-/g, " ").includes(q);
}

/**
 * Finds the search bar on the main screen.
 * @returns {HTMLInputElement | null} the search bar, or `null` off the discover screen.
 */
function searchBar() {
  return mainScreen.querySelector("#search-bar");
}

/**
 * Checks whether the user is typing in the search bar.
 * @returns {boolean} `true` while the search bar has focus.
 */
function searching() {
  const bar = searchBar();
  return !!bar && document.activeElement === bar;
}

/**
 * Wires the search bar, which keeps its query applied after leaving it.
 */
function mountSearch() {
  const bar = searchBar();
  bar.value = query;
  bar.addEventListener("input", () => {
    query = bar.value;
    refilter();
  });
  bar.addEventListener("focus", enterSearch);
  bar.addEventListener("blur", leaveSearch);
}

/**
 * Re-filters the grid in place while typing, leaving the search bar and its caret alone.
 * The cursor moves to the first result; leaving the bar settles where it lands.
 */
function refilter() {
  cursor = 0;
  filterGrid();
  gridList().innerHTML = "";
  mainScreen
    .querySelector("#discover-screen .no-results")
    .classList.toggle("hidden", filteredDex.length > 0);
  mainScreen.scrollTop = 0;
  fillScreen();
}

/**
 * Focuses the search bar.
 */
function focusSearch() {
  searchBar().focus();
}

/**
 * Remembers the pokemon selected when the search bar takes focus.
 */
function enterSearch() {
  searchFrom = selected()?.id ?? null;
}

/**
 * Puts the cursor back on the grid: on the pokemon selected before searching if it is
 * still in the results, otherwise on the first result.
 */
function leaveSearch() {
  if (currentScreen !== discoverScreen || !searchBar()?.isConnected) return;
  const index = filteredDex.findIndex((entry) => entry.id === searchFrom);
  moveCursor(Math.max(index, 0), "auto");
}
