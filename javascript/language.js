let languageCursor = 0;
let languageReturn = null;

/**
 * The language menu, drawn over the main screen only: the other screens stay as they are.
 * @returns {object} the screen content.
 */
function languageScreen() {
  const options = LANGUAGES.map(
    ({ name }, i) =>
      `<li${i === languageCursor ? ' aria-selected="true"' : ""}>${i === languageCursor ? "&gt;" : "&nbsp;"} ${name}</li>`,
  ).join("");

  return {
    main: `
<article id="language-menu">
  <p class="menu-title">${t("language")}</p>
  <ul>${options}</ul>
</article>`,
  };
}

/**
 * Opens the language menu over the screen on display, with the marker on the current language.
 */
function openLanguageMenu() {
  languageReturn = { screen: currentScreen, scroll: mainScreen.scrollTop };
  languageCursor = Math.max(
    0,
    LANGUAGES.findIndex(({ code }) => code === language),
  );
  currentScreen = languageScreen;
  mainScreen.innerHTML = languageScreen().main;
}

/**
 * Moves the marker, wrapping at both ends.
 * @param {{type: "up" | "down"}} input the D-pad input.
 */
function stepLanguage(input) {
  const step = input.type === "up" ? -1 : 1;
  languageCursor = (languageCursor + step + LANGUAGES.length) % LANGUAGES.length;
  mainScreen.innerHTML = languageScreen().main;
}

/**
 * Closes the menu and shows the screen it was opened over again.
 * @param {boolean} changed whether the language changed, so the shown content must load again.
 */
function closeLanguageMenu(changed = false) {
  const { screen, scroll } = languageReturn;
  if (changed) relocalizeDetails();

  display(screen);
  if (screen !== detailsScreen) return;

  mainScreen.scrollTop = scroll;
  if (changed) resumeDetails();
}

/**
 * Applies the language under the marker and returns to the previous screen.
 */
function applyLanguage() {
  const { code } = LANGUAGES[languageCursor];
  const changed = code !== language;
  if (changed) setLanguage(code);
  closeLanguageMenu(changed);
}
