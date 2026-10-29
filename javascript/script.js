const mainScreen = document.querySelector("#main-screen");
const infoScreen = document.querySelector("#info-screen");
const secondaryScreen = document.querySelector("#secondary-screen");
const typeScreen1 = document.querySelector("#type-screen-1");
const typeScreen2 = document.querySelector("#type-screen-2");

mainScreen.innerHTML = `
<article id="discover-screen">
  <input
    id="search-bar"
    type="search"
    placeholder="TYPE NAME OR NUMBER..."
  />
  <ul class="list">
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
    <li class="card">
      <img src="assets/pikachu.gif" />
      <p>25-Pikachu</p>
    </li>
  </ul>
</article>`;

infoScreen.innerHTML = `
<p>SELECTED:</p>
<p>
  N° <span class="pokemon-number">25</span> -
  <span class="pokemon-name">Pikachu</span>
</p>
<p>GENERATION: <span class="pokemon-generation">I</span></p>
<p>LANGUAGE: <span class="selected-language">EN</span></p>
`;
