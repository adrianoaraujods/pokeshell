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
  <p class="no-results${filteredDex.length ? " hidden" : ""}">${t("noResults")}</p>
</article>`,
    info: infoReadout(selected()),
    secondary: secondaryReadout(),
    type1: typeReadout(0),
    type2: typeReadout(1),
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
    .map(
      ([label, names]) =>
        `<dt>${label}</dt><dd>${names.map(pretty).join(", ")}</dd>`,
    )
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

/**
 * The tab bar of the details screen, pinned to the top with the active tab highlighted.
 * @param {string[]} keys the locale keys of the tabs.
 * @param {number} active the position of the active tab.
 * @returns {string} the tab bar html.
 */
function tabBar(keys, active) {
  const tabs = keys
    .map(
      (key, i) =>
        `<li class="tab-bar__tab"${i === active ? ' aria-current="true"' : ""}>${t(key)}</li>`,
    )
    .join("");
  return `<ul class="tab-bar">${tabs}</ul>`;
}

/**
 * A `< X >` switcher line, which D-pad left and right cycle.
 * @param {string} label the current choice.
 * @param {boolean} cycles whether there is anything to cycle to; arrows are hidden otherwise.
 * @returns {string} the switcher html.
 */
function switcher(label, cycles = true) {
  const arrow = (glyph) =>
    `<span${cycles ? "" : " hidden"}>${glyph}</span>`;
  return `<p class="switcher">${arrow("&lt;")} ${label} ${arrow("&gt;")}</p>`;
}

/**
 * The details of the selected pokemon: a pinned tab bar over the active tab.
 * @returns {object} the screen content.
 */
function detailsScreen() {
  const entry = detailEntry;

  return {
    main: `
<article id="details-screen">
  ${tabBar(DETAIL_TABS, detailTab)}
  <div class="tab-body">${detailBody(entry)}</div>
</article>`,
    info: infoReadout(entry),
    secondary: secondaryReadout(),
    type1: typeReadout(0),
    type2: typeReadout(1),
    mount: () => loadInfo(entry),
  };
}

/**
 * The body of the active tab, with a placeholder for tabs that don't exist yet.
 * @param {{id: number, name: string}} entry the viewed dex entry.
 * @returns {string} the tab body html.
 */
function detailBody(entry) {
  const tab = DETAIL_TABS[detailTab];
  if (tab === "evolutions") return evolutionsTab();
  if (!["info", "stats", "moves"].includes(tab)) return "";
  if (infoFailed) return `<p class="placeholder">${t("error")}</p>`;
  if (!info || info.id !== entry.id)
    return `<p class="placeholder">${t("loading")}</p>`;
  if (tab === "stats") return statsTab();
  return tab === "moves" ? movesTab() : infoTab(entry, info);
}

/**
 * The INFO tab: identity and size, the form line, and the species facts.
 * @param {{id: number, name: string}} entry the viewed dex entry.
 * @param {object} data the species facts.
 * @returns {string} the tab html.
 */
function infoTab(entry, data) {
  const form = data.forms[formIndex] ?? data.forms[0];
  const gender = data.gender
    ? `(${t("male")}) ${data.gender.male}% / (${t("female")}) ${data.gender.female}%`
    : t("genderless");
  const facts = [
    [
      t("abilities"),
      form.abilities.map((name) => name.toUpperCase()).join(", "),
    ],
    [t("habitat"), data.habitat ? pretty(data.habitat) : "-"],
    [t("eggGroups"), data.eggGroups.map(pretty).join(", ") || "-"],
    [t("captureRate"), data.captureRate],
    [t("gender"), gender],
  ]
    .map(([label, value]) => `<li>${label}: ${value}</li>`)
    .join("");

  return `
<div class="identity">
  <img
    class="skeleton"
    src="${spriteUrl(form.id)}"
    data-fallback="${staticSpriteUrl(form.id)}"
    alt="${entry.name} sprite"
  />
  <div>
    <p>N° ${entry.id}</p>
    <p>${pretty(entry.name)}</p>
    <p class="genus">${data.genus}</p>
    <p class="size">${t("height")} ${form.height} M</p>
    <p class="size">${t("weight")} ${form.weight} KG</p>
  </div>
</div>
${switcher(form.isDefault ? t("normal") : pretty(form.name), data.forms.length > 1)}
<ul class="facts">${facts}</ul>`;
}

/**
 * The EVOL. tab: the viewed family member and how it evolves from and into the others.
 * @returns {string} the tab html.
 */
function evolutionsTab() {
  if (evoFailed) return `<p class="placeholder">${t("error")}</p>`;
  if (!evolution) return `<p class="placeholder">${t("loading")}</p>`;

  const member = evolution[evoIndex];
  const line = (key, other, details) => {
    const how = evolutionText(details);
    return `<li>${t(key)}: ${pretty(other.name)}${how ? " - " + how : ""}</li>`;
  };
  const lines = [
    ...(member.from ? [line("from", member.from, member.details)] : []),
    ...member.to.map((next) => line("to", next, next.details)),
  ].join("");

  return `
<div class="identity">
  <img
    class="skeleton"
    src="${spriteUrl(member.id)}"
    data-fallback="${staticSpriteUrl(member.id)}"
    alt="${member.name} sprite"
  />
  <div>
    <p>N° ${member.id}</p>
    <p>${pretty(member.name)}</p>
  </div>
</div>
${switcher(pretty(member.name), evolution.length > 1)}
${lines ? `<ul class="facts">${lines}</ul>` : `<p class="placeholder">${t("noEvolutions")}</p>`}`;
}

/**
 * The STATS tab: the base stats of the selected form, each with a segmented bar.
 * @returns {string} the tab html.
 */
function statsTab() {
  const form = info.forms[formIndex] ?? info.forms[0];
  const rows = form.stats
    .map(
      ({ name, value }) => `
<li class="stat">
  <span class="stat__name">${pretty(name)}</span>
  <span class="stat__value">${value}</span>
  <span class="stat__bar" style="--value: ${value}"></span>
</li>`,
    )
    .join("");

  return `<ul class="stats">${rows}</ul>`;
}

/**
 * The MOVES tab: the abilities of the selected form with their effects, then the
 * level-up moves of the latest generation. Moves come from the default form, as the
 * API lists none for alternate forms such as megas.
 * @returns {string} the tab html.
 */
function movesTab() {
  const form = info.forms[formIndex] ?? info.forms[0];
  const abilities = form.abilities
    .map((name) => {
      const effect = abilityEffects.get(name);
      return `<li>${pretty(name)}${effect ? " – " + effect : ""}</li>`;
    })
    .join("");
  const moves = info.forms[0].moves
    .map(({ name, level }) => `<li>${t("lv")} ${level || "–"} ${pretty(name)}</li>`)
    .join("");

  return `
<section>
  <p>${t("abilities")}</p>
  <ul class="facts">${abilities}</ul>
</section>
<section>
  <p>${t("moves")}</p>
  ${moves ? `<ul class="moves">${moves}</ul>` : `<p class="placeholder">${t("noMoves")}</p>`}
</section>`;
}
