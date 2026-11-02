/* Background music: plays when the page is opened, stops when it is closed.

   - Browsers block sound until the visitor interacts with the page, so if
     autoplay is refused, the music starts on the first tap, click or key press.
   - It pauses when the tab is hidden (switching apps, locking the phone) and
     resumes when she comes back. It stops completely when the page is closed.
   - A small sound button lets her mute it (remembered on her device).

   Settings go on the <script> tag in index.html:
     data-src="music.mp3"   the music file (replace the file to change the song)
     data-pos="bottom-right"       button position: top-right | bottom-right | top-left | bottom-left
     data-volume="0.5"             0 to 1
     data-loop="true"              false = play once instead of looping
*/
(() => {
  "use strict";
  const tag = document.currentScript;
  const SRC = (tag && tag.dataset.src) || "music.mp3";
  const POS = (tag && tag.dataset.pos) || "bottom-right";
  const parsedVol = parseFloat(tag && tag.dataset.volume);
  const VOL = Math.min(1, Math.max(0, isNaN(parsedVol) ? 0.5 : parsedVol));
  const LOOP = !(tag && tag.dataset.loop === "false");
  const KEY = "bgmusic-muted";

  const audio = new Audio(SRC);
  audio.loop = LOOP;
  audio.volume = VOL;
  audio.preload = "auto";

  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) { /* storage can be blocked */ }
  let started = false;      // has playback actually begun at least once
  let wantPlaying = true;   // false after the music ends (loop off)

  const GESTURES = ["pointerup", "click", "touchend", "keydown"];
  const disarm = () => GESTURES.forEach(g => document.removeEventListener(g, onGesture, true));
  const arm = () => GESTURES.forEach(g => document.addEventListener(g, onGesture, true));

  function play() {
    if (muted || !wantPlaying) return;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { started = true; disarm(); })
       .catch(() => { /* blocked until the visitor interacts; the gesture listeners stay armed */ });
    }
  }
  function onGesture() { play(); }

  function stop() { audio.pause(); try { audio.currentTime = 0; } catch (e) { /* not seekable yet */ } }

  /* ---- start: try right away, otherwise on the first interaction ---- */
  arm();
  play();

  /* ---- stop when the page is closed or left ---- */
  window.addEventListener("pagehide", stop);
  /* ---- pause when hidden, resume when she is back ---- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (started) play();
  });
  /* page restored from the back/forward cache */
  window.addEventListener("pageshow", e => { if (e.persisted) { arm(); play(); } });
  audio.addEventListener("ended", () => { wantPlaying = false; });

  /* ---- sound button ---- */
  const ICON_ON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>';

  const css = document.createElement("style");
  css.textContent =
    "#soundToggle{position:fixed;z-index:55;width:44px;height:44px;padding:0;display:grid;place-items:center;" +
    "border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(20,20,18,.82);color:#fff;cursor:pointer;" +
    "box-shadow:0 4px 14px rgba(0,0,0,.25);-webkit-tap-highlight-color:transparent}" +
    "#soundToggle:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px rgba(20,20,18,.9)}" +
    "#soundToggle[data-pos~=top]{top:calc(env(safe-area-inset-top,0px) + 18px)}" +
    "#soundToggle[data-pos~=bottom]{bottom:calc(env(safe-area-inset-bottom,0px) + 16px)}" +
    "#soundToggle[data-pos~=right]{right:max(14px,env(safe-area-inset-right,0px))}" +
    "#soundToggle[data-pos~=left]{left:max(14px,env(safe-area-inset-left,0px))}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.id = "soundToggle";
  btn.type = "button";
  btn.setAttribute("data-pos", POS.replace("-", " "));
  function syncBtn() {
    btn.innerHTML = muted ? ICON_OFF : ICON_ON;
    btn.setAttribute("aria-pressed", String(muted));
    btn.setAttribute("aria-label", muted ? "Turn music on" : "Turn music off");
    btn.title = muted ? "Music off" : "Music on";
  }
  btn.addEventListener("click", () => {
    muted = !muted;
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) { /* ignore */ }
    if (muted) audio.pause();
    else { wantPlaying = true; play(); }
    syncBtn();
  });
  syncBtn();
  document.body.appendChild(btn);
})();
