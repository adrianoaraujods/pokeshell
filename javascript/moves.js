const VERSION_GROUPS = [
  ["red-blue", "yellow"],
  ["gold-silver", "crystal"],
  ["ruby-sapphire", "emerald", "firered-leafgreen", "colosseum", "xd"],
  ["diamond-pearl", "platinum", "heartgold-soulsilver"],
  ["black-white", "black-2-white-2"],
  ["x-y", "omega-ruby-alpha-sapphire"],
  ["sun-moon", "ultra-sun-ultra-moon", "lets-go-pikachu-lets-go-eevee"],
  ["sword-shield", "brilliant-diamond-and-shining-pearl", "legends-arceus"],
  ["scarlet-violet", "the-teal-mask", "the-indigo-disk"],
];

/**
 * Finds the generation a game version group belongs to.
 * @param {string} name the version group name.
 * @returns {number} the generation, or `0` for a group missing from `VERSION_GROUPS`.
 */
function versionGeneration(name) {
  return VERSION_GROUPS.findIndex((groups) => groups.includes(name)) + 1;
}

/**
 * Picks the level-up moves of the latest generation the pokemon appears in.
 * @param {{move: {name: string}, version_group_details: object[]}[]} moves the PokeAPI pokemon moves.
 * @returns {{name: string, level: number}[]} the moves sorted by level, each at the lowest level it is learned.
 */
function levelUpMoves(moves) {
  const learned = moves.flatMap(({ move, version_group_details: details }) =>
    details
      .filter((detail) => detail.move_learn_method.name === "level-up")
      .map((detail) => ({
        name: move.name,
        level: detail.level_learned_at,
        generation: versionGeneration(detail.version_group.name),
      })),
  );
  const latest = Math.max(0, ...learned.map(({ generation }) => generation));
  const byName = new Map();

  for (const { name, level, generation } of learned) {
    if (generation !== latest) continue;
    if (!byName.has(name) || level < byName.get(name).level) {
      byName.set(name, { name, level });
    }
  }

  return [...byName.values()].sort((a, b) => a.level - b.level);
}
