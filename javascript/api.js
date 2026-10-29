const API = "https://pokeapi.co/api/v2/";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const MAX_DEX = 1025;

/**
 * Fetches a PokeAPI resource.
 * @param {string} url the resource url.
 * @returns {Promise<any>} the parsed JSON body.
 * @throws {Error} when the response is not successful.
 */
async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/**
 * Fetches all pokemons.
 * @returns {Promise<{results: {name: string, url: string}[]}>} the species list of the national dex.
 */
async function fetchAll() {
  return await getJSON(API + "pokemon-species/?limit=" + MAX_DEX);
}

/**
 * Pick an entry of a PokeAPI localized list, falling back to English.
 * @param {object[]} list the localized entries.
 * @param {string} lang the desired language.
 * @returns {object | null} the entry in the desired language, in English or `null`.
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
 * Fetches what the right panel shows about a pokemon: its description and its types.
 * @param {number} id the pokemon id.
 * @returns {Promise<{description: string, types: string[], effectiveness: [string, string[]][]}>} the pokemon readout.
 */
async function fetchReadout(id) {
  const [species, pokemon] = await Promise.all([
    getJSON(API + "pokemon-species/" + id + "/"),
    getJSON(API + "pokemon/" + id + "/"),
  ]);
  const slots = [...pokemon.types].sort((a, b) => a.slot - b.slot);
  const types = await Promise.all(slots.map((slot) => getJSON(slot.type.url)));
  const flavor = pickByLang(species.flavor_text_entries, language);

  return {
    description: flavor ? cleanText(flavor.flavor_text) : "",
    types: types.map((type) => type.name),
    effectiveness: typeEffectiveness(types),
  };
}
