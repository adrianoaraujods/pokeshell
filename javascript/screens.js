const mainScreen = document.querySelector("#main-screen");
const infoScreen = document.querySelector("#info-screen");
const secondaryScreen = document.querySelector("#secondary-screen");
const typeScreen1 = document.querySelector("#type-screen-1");
const typeScreen2 = document.querySelector("#type-screen-2");

let currentScreen = null;

/**
 * Renders html content string on every screen on the pokedex.
 * @param screen the screen to render.
 */
function display(screen) {
  currentScreen = screen;
  const view = screen();
  mainScreen.innerHTML = view.main ?? "";
  infoScreen.innerHTML = view.info ?? "";
  secondaryScreen.innerHTML = view.secondary ?? "";
  typeScreen1.innerHTML = view.type1 ?? "";
  typeScreen2.innerHTML = view.type2 ?? "";
  view.mount?.();
}

/**
 * The boot screen, shown while the dex loads.
 * @returns the screen content.
 */
function loadingScreen() {
  return {
    main: `<article id="loading-screen">${t("loading")}</article>`,
  };
}

/**
 * The screen shown when the dex fails to load.
 * @returns the screen content.
 */
function errorScreen() {
  return {
    main: `
<article id="error-screen">
  <p>${t("error")}</p>
  <p class="hint">${t("retry")}</p>
</article>`,
  };
}

/**
 * The grid of pokemons of the current generation, filled and highlighted once mounted.
 * @returns the screen content.
 */
function discoverScreen() {
  filterGrid();

  return {
    main: `
<article id="discover-screen">
  <input id="search-bar" type="search" placeholder="${genLabel()} · ${t("search")}" />
  <ul class="list"></ul>
</article>`,
    mount: mountGrid,
  };
}

/**
 * A grid card, whose sprite loads once the card gets near the screen.
 * @param {{id: number, name: string}} entry the dex entry.
 * @returns {string} the card html.
 */
function card(entry) {
  return `
<li class="card">
  <img
    class="skeleton"
    src="${spriteUrl(entry.id)}"
    data-fallback="${staticSpriteUrl(entry.id)}"
    alt="${entry.name} sprite"
    loading="lazy"
  />
  <p>${entry.id}-${pretty(entry.name)}</p>
</li>`;
}

/**
 * The info screen content for the selected pokemon.
 * @param {{id: number, name: string} | null} entry the selected dex entry.
 * @returns {string} the info html, or empty when nothing is selected.
 */
function infoReadout(entry) {
  if (!entry) return "";
  return `
<article class="info-readout">
  <p>${t("selected")}:</p>
  <p>N° <span class="pokemon-number">${entry.id}</span> - <span class="pokemon-name">${pretty(entry.name)}</span></p>
  <p>${t("generation")}: <span class="pokemon-generation">${ROMAN[genOf(entry.id) - 1]}</span></p>
  <p>${t("language")}: <span class="selected-language">${language.toUpperCase()}</span></p>
</article>`;
}

/**
 * The secondary screen content: the description, or the type effectiveness after a flip.
 * @returns {string} the readout html, or empty when there is no readout.
 */
function secondaryReadout() {
  if (!readout) return "";
  if (readoutPage === "description") {
    return `
<article class="readout">
  <p>${t("description")}:</p>
  <p>${readout.description}</p>
</article>`;
  }

  const rows = readout.effectiveness
    .map(([label, names]) => `<dt>${label}</dt><dd>${names.map(pretty).join(", ")}</dd>`)
    .join("");

  return `
<article class="readout">
  <p>${t("effectiveness")}:</p>
  <dl class="effectiveness">${rows}</dl>
</article>`;
}

/**
 * A type screen content, with `-` when the pokemon has no type in that slot.
 * @param {0 | 1} slot the type slot.
 * @returns {string} the type html, or empty when there is no readout.
 */
function typeReadout(slot) {
  if (!readout) return "";
  const type = readout.types[slot];
  return `<p class="type-readout">${type ? pretty(type) : "-"}</p>`;
}
