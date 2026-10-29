/**
 * Formats the pokemon name by replacing slashes with spaces and transforming to uppercase.
 * @param {string} slug the unformatted pokemon name.
 * @returns {string} the formatted pokemon name.
 */
function pretty(slug) {
  return slug.replace(/-/g, " ").toUpperCase();
}

/**
 * Puts a PokeAPI flavor text on a single line, removing its line breaks, form feeds and soft hyphens.
 * @param {string} text the raw flavor text.
 * @returns {string} the cleaned text.
 */
function cleanText(text) {
  return text.replace(/[\s­]+/g, " ").trim();
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
 * Selects the scroll behavior, respecting the user's reduced motion preference.
 * @returns {"auto" | "smooth"} the behavior to pass to the scroll functions.
 */
function scrollBehavior() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * Scrolls a container by one page, rounded down to whole lines and landing on a line,
 * so no line is cut in half. Lines start below the top padding.
 * @param {HTMLElement} container the scrollable element.
 * @param {-1 | 1} direction `-1` to page up or `1` to page down.
 */
function page(container, direction) {
  const style = getComputedStyle(container);
  const line =
    parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 16;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const padding = paddingTop + (parseFloat(style.paddingBottom) || 0);
  const lines = Math.max(1, Math.floor((container.clientHeight - padding) / line));
  const first = Math.max(0, Math.round((container.scrollTop - paddingTop) / line));
  const next = first + direction * lines;
  const top = next > 0 ? paddingTop + next * line : 0;

  container.scrollTo({ top, behavior: scrollBehavior() });
}
