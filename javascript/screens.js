function loadingScreen() {
  return {
    main: `<article id="loading-screen">${t("loading")}</article>`,
  };
}

function errorScreen() {
  return {
    main: `<article id="error-screen">${t("error")}</article>`,
  };
}

/**
 * @param dex the pokemon list
 */
function discoverScreen(dex) {
  const cards = dex
    .map(
      (entry) => `
<li class="card">
  <img
    src="${spriteUrl(entry.id)}"
    data-fallback="${staticSpriteUrl(entry.id)}"
    alt="${entry.name} sprite"
    loading="lazy"
  />
  <p>${entry.id}-${pretty(entry.name)}</p>
</li>`,
    )
    .join("");

  return {
    main: `
<article id="discover-screen">
  <input id="search-bar" type="search" placeholder="${t("search")}" />
  <ul class="list">${cards}</ul>
</article>`,
  };
}
