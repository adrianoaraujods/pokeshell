/**
 * Flattens an evolution chain into the family members, base first and each branch
 * depth-first, so the switcher walks forwards and backwards over one list.
 * @param {object} chain the PokeAPI chain link.
 * @returns {{id: number, name: string, details: object[], from: object | null, to: object[]}[]} the family; `details` is how the member evolves from `from`.
 */
function evolutionMembers(chain) {
  const members = [];

  (function walk(node, from) {
    const member = {
      id: urlToId(node.species.url),
      name: node.species.name,
      details: node.evolution_details,
      from,
      to: [],
    };
    members.push(member);
    from?.to.push(member);
    node.evolves_to.forEach((child) => walk(child, member));
  })(chain, null);

  return members;
}

/**
 * Describes one way of evolving, e.g. `LEVEL 16`, `THUNDER STONE` or `HAPPINESS 220 · DAY`.
 * @param {object} details a PokeAPI evolution detail.
 * @returns {string} the condition text.
 */
function evolutionCondition(details) {
  const parts = [];
  const trigger = details.trigger?.name;

  if (trigger === "use-item" && details.item) parts.push(pretty(details.item.name));
  else if (trigger === "trade") parts.push(t("trade"));
  if (details.min_level) parts.push(`${t("level")} ${details.min_level}`);
  if (details.held_item) parts.push(`${t("hold")} ${pretty(details.held_item.name)}`);
  if (details.min_happiness) parts.push(`${t("happiness")} ${details.min_happiness}`);
  if (details.time_of_day) parts.push(details.time_of_day.toUpperCase());
  if (details.known_move) parts.push(pretty(details.known_move.name));
  if (details.known_move_type) parts.push(pretty(details.known_move_type.name));
  if (!parts.length && trigger) parts.push(pretty(trigger));

  return parts.join(" · ");
}

/**
 * Describes how a member evolves, joining alternative ways with `/`. Repeated ways, e.g.
 * from regional variants, show once, and a bare `LEVEL UP` (a location-bound level up) only
 * shows when nothing more specific exists.
 * @param {object[]} details the PokeAPI evolution details.
 * @returns {string} the condition text, or empty for the base member.
 */
function evolutionText(details) {
  const ways = [...new Set(details.map(evolutionCondition).filter(Boolean))];
  const specific = ways.filter((way) => way !== pretty("level-up"));
  return (specific.length ? specific : ways).join(" / ");
}
