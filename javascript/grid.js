const CARDS_PER_CHUNK = 30;
const NEAR_END_PX = 300;

let filteredDex = [];
let cursor = 0;
let gridScroll = 0;

mainScreen.addEventListener("scroll", onGridScroll, { passive: true });
mainScreen.addEventListener("load", onSpriteLoad, true);
mainScreen.addEventListener("error", onSpriteError, true);

/**
 * Removes the skeleton of a sprite once it loads.
 * @param {Event} event the load event.
 */
function onSpriteLoad(event) {
  event.target.classList?.remove("skeleton");
}

/**
 * Swaps a sprite that failed to load for its static version, or gives up on it.
 * @param {Event} event the error event.
 */
function onSpriteError(event) {
  const img = event.target;
  if (img.tagName !== "IMG") return;

  if (img.dataset.fallback) {
    img.src = img.dataset.fallback;
    delete img.dataset.fallback;
  } else {
    img.classList.remove("skeleton");
  }
}

/**
 * Adds more cards while the user scrolls the grid near its end.
 */
function onGridScroll() {
  if (currentScreen === discoverScreen) fillScreen();
}

/**
 * Selects the pokemons of the current generation that match the search, keeping the cursor
 * inside the new list.
 */
function filterGrid() {
  filteredDex = dex.filter((entry) => inGen(entry) && matchesQuery(entry));
  cursor = Math.max(0, Math.min(cursor, filteredDex.length - 1));
}

/**
 * Renders enough cards to fill the screen and highlights the cursor card. Cards scrolled
 * into view stop below the sticky search bar.
 */
function mountGrid() {
  const searchBar = mainScreen.querySelector("#search-bar");
  mainScreen.style.scrollPaddingTop = searchBar.offsetHeight + "px";
  mountSearch();
  fillScreen();
  moveCursor(cursor, "auto");
}

/**
 * Finds the grid list on the main screen.
 * @returns {HTMLUListElement} the list.
 */
function gridList() {
  return mainScreen.querySelector("#discover-screen .list");
}

/**
 * Adds the next chunk of cards to the grid.
 * @returns {boolean} `false` once every card is rendered.
 */
function appendChunk() {
  const list = gridList();
  const rendered = list.children.length;
  if (rendered >= filteredDex.length) return false;

  const chunk = filteredDex.slice(rendered, rendered + CARDS_PER_CHUNK);
  list.insertAdjacentHTML("beforeend", chunk.map(card).join(""));
  return true;
}

/**
 * Adds cards until the grid reaches past the end of the screen.
 */
function fillScreen() {
  const { scrollTop, clientHeight, scrollHeight } = mainScreen;
  if (scrollHeight - scrollTop - clientHeight < NEAR_END_PX && appendChunk()) {
    fillScreen();
  }
}

/**
 * Adds cards until a card is in the grid.
 * @param {number} index the card position in the filtered list.
 * @returns {HTMLLIElement | undefined} the card, or `undefined` when it doesn't exist.
 */
function renderUntil(index) {
  while (gridList().children.length <= index && appendChunk());
  return gridList().children[index];
}

/**
 * Finds the pokemon under the cursor.
 * @returns {{id: number, name: string} | null} the dex entry, or `null` when the grid is empty.
 */
function selected() {
  return filteredDex[cursor] ?? null;
}

/**
 * Finds where the cursor goes for a D-pad direction. Left and right wrap across rows and
 * around the list, while up and down stop at the first and last rows.
 * @param {"up" | "down" | "left" | "right"} direction the D-pad direction.
 * @param {number} cols the number of columns.
 * @returns {number | null} the next card position, or `null` to stay put.
 */
function gridStep(direction, cols) {
  const total = filteredDex.length;
  const last = total - 1;

  if (direction === "left") return (cursor - 1 + total) % total;
  if (direction === "right") return (cursor + 1) % total;
  if (direction === "up") return cursor >= cols ? cursor - cols : null;
  if (Math.floor(cursor / cols) === Math.floor(last / cols)) return null;
  return Math.min(cursor + cols, last);
}

/**
 * Moves the cursor one step in a D-pad direction.
 * @param {{type: "up" | "down" | "left" | "right"}} input the D-pad input.
 */
function stepCursor(input) {
  if (!filteredDex.length) return;
  const cols = getComputedStyle(gridList()).gridTemplateColumns.split(" ").length;
  const next = gridStep(input.type, cols);
  if (next !== null && next !== cursor) moveCursor(next);
}

/**
 * Puts the cursor on a card, scrolls the grid just enough to show it, and shows the
 * selected pokemon on the other screens.
 * @param {number} index the card position in the filtered list.
 * @param {ScrollBehavior} behavior the scroll behavior.
 */
function moveCursor(index, behavior = scrollBehavior()) {
  mainScreen.querySelector(".card.cursor")?.classList.remove("cursor");
  cursor = index;

  const card = renderUntil(index);
  card?.classList.add("cursor");
  card?.scrollIntoView({ block: "nearest", behavior });

  infoScreen.innerHTML = infoReadout(selected());
  scheduleReadout();
}

/**
 * Shows the next generation on the grid, from its first card.
 */
function showNextGen() {
  nextGen();
  cursor = 0;
  display(discoverScreen);
  mainScreen.scrollTop = 0;
}
