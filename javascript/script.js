const mainScreen = document.querySelector("#main-screen");
const infoScreen = document.querySelector("#info-screen");
const secondaryScreen = document.querySelector("#secondary-screen");
const typeScreen1 = document.querySelector("#type-screen-1");
const typeScreen2 = document.querySelector("#type-screen-2");

const API = "https://pokeapi.co/api/v2/";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const MAX_DEX = 1025;

// Data
let language = "en";
let dex = [];

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/**
 * Fetches all pokemons.
 * @returns
 */
async function fetchAll() {
  return await getJSON(API + "pokemon-species/?limit=" + MAX_DEX);
}

/**
 * Extracts the pokemon id from the url.
 * @param {string} url the fetch query.
 * @returns {number} the pokemon id or `0` if fails.
 */
function urlToId(url) {
  const match = url.match(/\/(\d+)\/$/);
  return match ? Number(match[1]) : 0;
}

/**
 * Pick an entry of a PokeAPI localized list, falling back to English.
 * @param {string} list the full pokemon list.
 * @param {"en"} lang the desired language.
 * @returns
 */
function pickByLang(list, lang = "en") {
  let fallback = null;

  for (const entry of list) {
    if (entry.language.name === lang) return entry;
    if (entry.language.name === "en") fallback = entry;
  }

  return fallback;
}

/**
 * Builds the animated sprite (GIF) url based on the pokemon Id.
 * @param {number} id the pokemon id.
 * @returns the url of the image in GIF format.
 */
function spriteUrl(id) {
  return SPRITES + "other/showdown/" + String(id) + ".gif";
}

/**
 * Builds the static sprite (PNG) url based on the pokemon Id.
 * @param {number} id the pokemon id.
 * @returns the url of the image in PNG format.
 */
function staticSpriteUrl(id) {
  return SPRITES + String(id) + ".png";
}

/**
 * Renders html content string on every screen on the pokedex.
 * @param screen the screen to render.
 */
function display(screen) {
  const view = screen();
  mainScreen.innerHTML = view.main ?? "";
  infoScreen.innerHTML = view.info ?? "";
  secondaryScreen.innerHTML = view.secondary ?? "";
  typeScreen1.innerHTML = view.type1 ?? "";
  typeScreen2.innerHTML = view.type2 ?? "";
}

async function main() {
  display(loadingScreen);

  try {
    const list = await fetchAll();

    dex = list.results
      .map((result) => ({ id: urlToId(result.url), name: result.name }))
      .sort((a, b) => a.id - b.id);
    console.log(list);

    display(() => discoverScreen(dex));
  } catch {
    display(errorScreen);
  }
}

main();
