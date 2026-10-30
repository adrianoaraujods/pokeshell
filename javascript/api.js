const API = "https://pokeapi.co/api/v2/";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const MAX_DEX = 1025;
const DEX_URL = API + "pokemon-species/?limit=" + MAX_DEX;

const CACHE_KEY = "pokedex-cache";
const CACHE_SAVE_DELAY_MS = 500;

const cache = loadCache();
const pending = new Map();
let cacheTimer = 0;

/**
 * Reads the cache saved by earlier visits, which is empty when storage is unavailable or
 * holds something else.
 * @returns {Map<string, any>} the response bodies by url.
 */
function loadCache() {
  try {
    return new Map(Object.entries(JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}")));
  } catch {
    return new Map();
  }
}

/**
 * Saves the cache shortly after the last new response, so a burst of lookups writes once.
 */
function scheduleCacheSave() {
  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(saveCache, CACHE_SAVE_DELAY_MS);
}

/**
 * Writes the cache to storage. When it doesn't fit, the oldest half of the lookups is
 * dropped until it does, always keeping the dex list every visit starts with. When
 * storage is unavailable the device just goes on without it.
 */
function saveCache() {
  const pinned = [...cache].filter(([url]) => url === DEX_URL);
  let rest = [...cache].filter(([url]) => url !== DEX_URL);

  for (;;) {
    try {
      const entries = [...pinned, ...rest];
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
      return;
    } catch {
      if (!rest.length) return;
      rest = rest.slice(Math.ceil(rest.length / 2));
    }
  }
}

/**
 * Fetches a PokeAPI resource, from the local cache when it was fetched before. Requests
 * for a url already on its way share that request.
 * @param {string} url the resource url.
 * @returns {Promise<any>} the parsed JSON body.
 * @throws {Error} when the response is not successful.
 */
function getJSON(url) {
  if (cache.has(url)) return Promise.resolve(cache.get(url));
  if (!pending.has(url)) {
    pending.set(url, requestJSON(url).finally(() => pending.delete(url)));
  }
  return pending.get(url);
}

/**
 * Fetches a PokeAPI resource from the network and caches it.
 * @param {string} url the resource url.
 * @returns {Promise<any>} the parsed JSON body.
 * @throws {Error} when the response is not successful.
 */
async function requestJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);

  const body = await res.json();
  cache.set(url, body);
  scheduleCacheSave();
  return body;
}

/**
 * Fetches all pokemons.
 * @returns {Promise<{results: {name: string, url: string}[]}>} the species list of the national dex.
 */
async function fetchAll() {
  return await getJSON(DEX_URL);
}

const API_LANGUAGES = {
  en: ["en"],
  es: ["es"],
  "pt-BR": ["pt-br"],
  ja: ["ja", "ja-hrkt"],
};
const localNames = {};

/**
 * Pick an entry of a PokeAPI localized list, falling back to English.
 * @param {object[]} list the localized entries.
 * @param {string} lang the desired language, as an app language code.
 * @returns {object | null} the entry in the desired language, in English or `null`.
 */
function pickByLang(list, lang = "en") {
  const wanted = API_LANGUAGES[lang] ?? [lang];
  let best = null;
  let rank = wanted.length;
  let fallback = null;

  for (const entry of list) {
    const place = wanted.indexOf(entry.language.name);
    if (place !== -1 && place < rank) {
      best = entry;
      rank = place;
    }
    if (entry.language.name === "en" && !fallback) fallback = entry;
  }

  return best ?? fallback;
}

/**
 * Remembers the name of a species in the current language, so it shows wherever the
 * pokemon does. English keeps the names derived from the dex slugs.
 * @param {{id: number, names: object[]}} species the PokeAPI species.
 */
function rememberName(species) {
  const name = pickByLang(species.names, language);
  if (!name || name.language.name === "en") return;
  (localNames[language] ??= new Map()).set(species.id, pretty(name.name));
}

/**
 * Names a pokemon in the current language, as far as its species has been loaded.
 * @param {{id: number, name: string}} entry the dex entry.
 * @returns {string} the display name.
 */
function displayName(entry) {
  return localNames[language]?.get(entry.id) ?? pretty(entry.name);
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
  rememberName(species);

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
 * @returns {Promise<{id: number, name: string, isDefault: boolean, height: string, weight: string, abilities: string[], moves: {name: string, level: number}[], stats: {name: string, value: number}[], types: string[], effectiveness: [string, string[]][]}>} the form.
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
    moves: levelUpMoves(pokemon.moves),
    stats: pokemon.stats.map((stat) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    })),
    ...(await fetchTyping(pokemon)),
  };
}

/**
 * Fetches the evolution family a pokemon belongs to.
 * @param {number} id the pokemon id.
 * @returns {Promise<ReturnType<typeof evolutionMembers>>} the family members, or the pokemon alone when it has no chain.
 */
async function fetchEvolutions(id) {
  const species = await getJSON(API + "pokemon-species/" + id + "/");
  if (!species.evolution_chain) {
    return [{ id, name: species.name, details: [], from: null, to: [] }];
  }

  const { chain } = await getJSON(species.evolution_chain.url);
  const members = evolutionMembers(chain);
  if (language !== "en") await rememberNames(members);
  return members;
}

/**
 * Looks up the names of family members in the current language, skipping any that fail.
 * @param {{id: number}[]} members the family members.
 */
async function rememberNames(members) {
  await Promise.all(
    members.map(({ id }) =>
      getJSON(API + "pokemon-species/" + id + "/").then(rememberName, () => {}),
    ),
  );
}

/**
 * Fetches the one-line effect of an ability, falling back to its flavor text.
 * @param {string} name the ability name.
 * @returns {Promise<string>} the effect, or empty when the ability has none.
 */
async function fetchAbilityEffect(name) {
  const ability = await getJSON(API + "ability/" + name + "/");
  const effect = pickByLang(ability.effect_entries, language);
  if (effect?.short_effect) return cleanText(effect.short_effect);

  const flavor = pickByLang(ability.flavor_text_entries, language);
  return flavor ? cleanText(flavor.flavor_text) : "";
}

/**
 * Fetches the species facts the INFO tab shows about a pokemon.
 * @param {number} id the pokemon id.
 * @returns {Promise<{genus: string, forms: object[], habitat: string, eggGroups: string[], captureRate: number, gender: {male: number, female: number} | null}>} the pokemon info.
 */
async function fetchInfo(id) {
  const species = await getJSON(API + "pokemon-species/" + id + "/");
  const genus = pickByLang(species.genera, language);
  rememberName(species);
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
