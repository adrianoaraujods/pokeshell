const BEEPS = {
  up: [440, 0.05],
  down: [440, 0.05],
  left: [392, 0.05],
  right: [392, 0.05],
  confirm: [880, 0.12],
  back: [330, 0.08],
  tab: [523, 0.06],
  digit: [660, 0.05],
  language: [587, 0.08],
  "flip-left": [698, 0.05],
  "flip-right": [698, 0.05],
  "page-up": [494, 0.05],
  "page-down": [494, 0.05],
};
const ERROR_BEEP = [147, 0.18, "sawtooth"];
const BEEP_VOLUME = 0.08;
const CRY_VOLUME = 0.4;

let audioContext = null;
let cry = null;
let cryRequest = 0;

/**
 * Finds the audio context, created on the first button press as browsers only allow
 * sound after a gesture. Without Web Audio the device just stays silent.
 * @returns {AudioContext | null} the context, or `null` when unavailable.
 */
function audioCtx() {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Plays a short synthesized beep for a button.
 * @param {string} type the input type, or `"error"` for the rejection blip.
 */
function beep(type) {
  const [frequency, seconds, wave = "square"] =
    type === "error" ? ERROR_BEEP : (BEEPS[type] ?? []);
  const ctx = frequency && audioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = wave;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(BEEP_VOLUME, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + seconds);
}

/**
 * Plays the cry of a pokemon, cutting off the previous one. Failures stay silent, and
 * only the latest request plays.
 * @param {number} id the pokemon id.
 */
async function playCry(id) {
  const request = ++cryRequest;
  cry?.pause();

  try {
    const pokemon = await getJSON(API + "pokemon/" + id + "/");
    const url = pokemon.cries?.latest ?? pokemon.cries?.legacy;
    if (!url || request !== cryRequest) return;

    cry = new Audio(url);
    cry.volume = CRY_VOLUME;
    await cry.play();
  } catch {
    // no cry for this pokemon, or the browser blocked playback
  }
}
