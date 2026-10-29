/**
 * Formats the pokemon name by replacing slashes with spaces and transforming to uppercase.
 * @param {string} slug the unformatted pokemon name.
 * @returns {string} the formatted pokemon name.
 */
function pretty(slug) {
  return slug.replace(/-/g, " ").toUpperCase();
}
