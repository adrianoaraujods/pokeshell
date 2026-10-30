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
  const flavor = pickByLang(species.flavor_text_entries, language);

  return {
    description: flavor ? cleanText(flavor.flavor_text) : "",
    ...(await fetchTyping(pokemon)),
  };
}

/**
 * Fetches the types of a pokemon and how effective each battle type is against it.
 * @param {{types: {slot: number, type: {url: string}}[]}} pokemon the PokeAPI pokemon resource.
 * @returns {Promise<{types: string[], effectiveness: [string, string[]][]}>} the typing.
 */
async function fetchTyping(pokemon) {
  const slots = [...pokemon.types].sort((a, b) => a.slot - b.slot);
  const types = await Promise.all(slots.map((slot) => getJSON(slot.type.url)));

  return {
    types: types.map((type) => type.name),
    effectiveness: typeEffectiveness(types),
  };
}

/**
 * Fetches one form (PokeAPI variety) of a species, with everything a form changes.
 * @param {{name: string, url: string}} variety the species variety.
 * @param {string} species the species name.
 * @param {boolean} isDefault whether it is the default form.
 * @returns {Promise<{id: number, name: string, isDefault: boolean, height: string, weight: string, abilities: string[], stats: {name: string, value: number}[], types: string[], effectiveness: [string, string[]][]}>} the form.
 */
async function fetchForm(variety, species, isDefault) {
  const pokemon = await getJSON(variety.url);
  const abilities = [...pokemon.abilities].sort((a, b) => a.slot - b.slot);

  return {
    id: pokemon.id,
    name: isDefault ? "" : variety.name.slice(species.length + 1),
    isDefault,
    height: fromTenths(pokemon.height),
    weight: fromTenths(pokemon.weight),
    abilities: abilities.map(({ ability }) => ability.name),
    stats: pokemon.stats.map((stat) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    })),
    ...(await fetchTyping(pokemon)),
  };
}

/**
 * Fetches the species facts the INFO tab shows about a pokemon.
 * @param {number} id the pokemon id.
 * @returns {Promise<{genus: string, forms: object[], habitat: string, eggGroups: string[], captureRate: number, gender: {male: number, female: number} | null}>} the pokemon info.
 */
async function fetchInfo(id) {
  const species = await getJSON(API + "pokemon-species/" + id + "/");
  const genus = pickByLang(species.genera, language);
  const forms = await Promise.all(
    species.varieties.map(({ is_default, pokemon }) =>
      fetchForm(pokemon, species.name, is_default),
    ),
  );
  forms.sort((a, b) => b.isDefault - a.isDefault);

  return {
    genus: genus ? genus.genus : "",
    forms,
    habitat: species.habitat?.name ?? "",
    eggGroups: species.egg_groups.map((group) => group.name),
    captureRate: species.capture_rate,
    gender: genderRatio(species.gender_rate),
  };
}
