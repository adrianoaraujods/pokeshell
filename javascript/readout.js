const READOUT_DELAY_MS = 150;

let readout = null;
let readoutPage = "description";
let readoutTimer = 0;
let readoutRequest = 0;

/**
 * Renders the readout on the secondary and type screens.
 */
function renderReadout() {
  secondaryScreen.innerHTML = secondaryReadout();
  secondaryScreen.scrollTop = 0;
  typeScreen1.innerHTML = typeReadout(0);
  typeScreen2.innerHTML = typeReadout(1);
}

/**
 * Fetches the readout of the selected pokemon once the cursor rests. Only the latest
 * request renders, and a failed one clears the readout so it never sits next to
 * another pokemon's info.
 */
function scheduleReadout() {
  clearTimeout(readoutTimer);
  const request = ++readoutRequest;
  const entry = selected();

  if (!entry) {
    readout = null;
    renderReadout();
    return;
  }

  readoutTimer = setTimeout(async () => {
    try {
      const next = await fetchReadout(entry.id);
      if (request !== readoutRequest) return;
      readout = next;
      applyFormReadout();
      renderReadout();
    } catch {
      if (request !== readoutRequest) return;
      readout = null;
      renderReadout();
    }
  }, READOUT_DELAY_MS);
}

/**
 * Shows a page of the readout on the secondary screen.
 * @param {"description" | "effectiveness"} page the readout page.
 */
function flipReadout(page) {
  if (readoutPage === page) return;
  readoutPage = page;
  renderReadout();
}
