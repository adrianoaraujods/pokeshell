const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];
const EFFECTIVENESS = ["2×", "1×", "1/2×", "0×"];

/**
 * Computes how much damage an attacking type deals to a pokemon.
 * @param {string} attacker the attacking type name.
 * @param {object[]} types the PokeAPI type resources of the pokemon.
 * @returns {number} the combined multiplier, e.g. `4`, `1`, `0.25` or `0`.
 */
function damageMultiplier(attacker, types) {
  return types.reduce((multiplier, { damage_relations: relations }) => {
    const hits = (list) => list.some(({ name }) => name === attacker);
    if (hits(relations.no_damage_from)) return 0;
    if (hits(relations.double_damage_from)) return multiplier * 2;
    if (hits(relations.half_damage_from)) return multiplier / 2;
    return multiplier;
  }, 1);
}

/**
 * Names the effectiveness group of a multiplier, where 4× joins 2× and 1/4× joins 1/2×.
 * @param {number} multiplier the damage multiplier.
 * @returns {string} one of the `EFFECTIVENESS` labels.
 */
function effectivenessLabel(multiplier) {
  if (multiplier > 1) return "2×";
  if (multiplier === 1) return "1×";
  if (multiplier > 0) return "1/2×";
  return "0×";
}

/**
 * Groups the battle types by how effective they are against a pokemon.
 * @param {object[]} types the PokeAPI type resources of the pokemon.
 * @returns {[string, string[]][]} the non-empty groups, from 2× down to 0×.
 */
function typeEffectiveness(types) {
  const groups = Object.fromEntries(EFFECTIVENESS.map((label) => [label, []]));

  for (const attacker of TYPES) {
    groups[effectivenessLabel(damageMultiplier(attacker, types))].push(attacker);
  }

  return Object.entries(groups).filter(([, names]) => names.length);
}
