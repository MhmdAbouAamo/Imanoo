/* Imanooo turns 28 — story logic. Personalize in js/config.js. */
(() => {
  "use strict";
  const CONFIG = window.CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STORE = "imanooo28-story-v1";
  const her = (CONFIG.herName || "").trim();
  const me = (CONFIG.myName || "").trim();
  let rsvp = "";

  /* personalize */
  if (her) {
    $("#coverName").textContent = her;
    $("#rsvpTitle").textContent = `So, ${her}, are you in?`;
    $("#letterName").textContent = her;
  } else {
    $("#coverName").textContent = "The birthday girl";
    $("#rsvpTitle").textContent = "So, are you in?";
    $("#letterName").textContent = "birthday girl";
  }
  if (me) $("#letterSig").textContent = "See you on the road, " + me;

  /* render chips */
  const chip = (type, group, o) =>
    `<label class="chip"><input type="${type}" name="${group}" value="${esc(o.id)}" id="${group}-${esc(o.id)}">` +
    `<span>${esc(o.title)}${o.desc ? `<small>${esc(o.desc)}</small>` : ""}</span></label>`;
  $("#breakfastOpts").innerHTML = CONFIG.breakfast.map(o => chip("checkbox", "breakfast", o)).join("");
  $("#drinkOpts").innerHTML = CONFIG.drinks.map(o => chip("radio", "drink", o)).join("");
  $("#lunchOpts").innerHTML = CONFIG.lunch.map(o => chip("checkbox", "lunch", o)).join("");

  /* steps */
  const steps = $$(".step");
  const total = steps.length;
  let cur = 0;
  $("#progress").innerHTML = steps.map(() => "<span><i></i></span>").join("");
  const segs = $$("#progress span");
  const nextLabels = { 0: "Let’s go", [total - 2]: "One more thing", [total - 1]: "Start over" };

  function go(i, focus) {
    i = Math.max(0, Math.min(total - 1, i));
    steps.forEach((s, k) => {
      s.classList.toggle("active", k === i);
      s.classList.toggle("past", k < i);
      s.setAttribute("aria-hidden", String(k !== i));
      if ("inert" in s) s.inert = k !== i;
    });
    segs.forEach((g, k) => g.classList.toggle("done", k <= i));
    cur = i;
    const bg = steps[i].dataset.bg;
    $("#stage").classList.toggle("on-dark", bg === "forest" || bg === "tomato");
    $("#backBtn").disabled = i === 0;
    $("#count").textContent = `${i + 1} / ${total}`;
    $("#nextBtn").textContent = nextLabels[i] || "Next";
    $("#stepAnnounce").textContent = `Step ${i + 1} of ${total}: ${steps[i].getAttribute("aria-label")}`;
    steps[i].scrollTop = 0;
    if (steps[i].querySelector("canvas[data-scratch]")) initScratch();
    if (focus) { const h = steps[i].querySelector("h1,h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    save({ step: i });
  }

  function next() {
    const check = steps[cur].dataset.check;
    if (check && !validateStep(check, true)) return;
    if (cur === total - 1) { go(0, true); return; }
    go(cur + 1, true);
  }
  $("#nextBtn").addEventListener("click", next);
  $("#backBtn").addEventListener("click", () => go(cur - 1, true));
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea")) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") go(cur - 1, true);
  });

  /* countdown */
  const target = new Date(CONFIG.eventStart).getTime();
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    let d = target - Date.now();
    if (isNaN(target)) return;
    if (d <= 0) {
      ["#cdD", "#cdH", "#cdM", "#cdS"].forEach(s => $(s).textContent = "00");
      $("#cdNote").textContent = -d < 86400000 ? "It’s today! Sneakers on." : "Hope it was the best day.";
      return;
    }
    const D = Math.floor(d / 864e5); d -= D * 864e5;
    const H = Math.floor(d / 36e5); d -= H * 36e5;
    const M = Math.floor(d / 6e4); d -= M * 6e4;
    $("#cdD").textContent = pad(D); $("#cdH").textContent = pad(H);
    $("#cdM").textContent = pad(M); $("#cdS").textContent = pad(Math.floor(d / 1000));
  }
  tick(); setInterval(tick, 1000);

  /* scratch cards */
  let scratchReady = false;
  function initScratch() {
    if (scratchReady) return;
    scratchReady = true;
    $$("canvas[data-scratch]").forEach(cv => {
      const r = cv.getBoundingClientRect();
      if (!r.width) { scratchReady = false; return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const ctx = cv.getContext("2d");
      ctx.scale(dpr, dpr);
      // foil: sunset stripes
      const bands = ["#F2B33D", "#E9762B", "#C23B22", "#1F3B2D"];
      const bh = r.height / bands.length;
      bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bh, r.width, bh + 1); });
      ctx.fillStyle = "#FFF4E2";
      ctx.textAlign = "center";
      ctx.font = "800 13px 'Bricolage Grotesque', system-ui, sans-serif";
      ctx.fillText(cv.dataset.scratch.toUpperCase(), r.width / 2, r.height / 2 - 12);
      ctx.font = "26px 'Shrikhand', Georgia, serif";
      ctx.fillText("Scratch me", r.width / 2, r.height / 2 + 22);
      ctx.globalCompositeOperation = "destination-out";
      let down = false, last = null, moves = 0;
      const pt = e => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
      const scratch = p => {
        ctx.lineWidth = 44; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo((last || p).x, (last || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
        last = p;
        if (++moves % 12 === 0) checkCleared();
      };
      const checkCleared = () => {
        const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let clear = 0, n = 0;
        for (let i = 3; i < data.length; i += 4 * 40) { n++; if (data[i] === 0) clear++; }
        if (clear / n > .45) cv.classList.add("gone");
      };
      cv.addEventListener("pointerdown", e => { down = true; last = null; cv.setPointerCapture(e.pointerId); scratch(pt(e)); });
      cv.addEventListener("pointermove", e => { if (down) scratch(pt(e)); });
      const up = () => { down = false; last = null; checkCleared(); };
      cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    });
  }
  $("#revealAll").addEventListener("click", () => $$("canvas[data-scratch]").forEach(c => c.classList.add("gone")));
  window.addEventListener("resize", () => { if (!$$("canvas.gone").length) { scratchReady = false; if (steps[cur].querySelector("canvas[data-scratch]")) initScratch(); } });

  /* "Other" fields */
  function syncOthers() {
    [["breakfast-other", "tf-breakfastOther"], ["drink-other", "tf-drinkOther"], ["lunch-other", "tf-lunchOther"]]
      .forEach(([a, b]) => { const i = document.getElementById(a); $("#" + b).hidden = !(i && i.checked); });
    $("#tf-question").hidden = rsvp !== "info";
  }

  /* RSVP */
  const rsvpLabels = { yes: "Yes! Let’s go", obviously: "Obviously. I’m turning 28!", info: "I have a question first" };
  function setRsvp(v, user) {
    rsvp = v;
    $$("#rsvpGroup .rbtn").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.rsvp === v)));
    $("#yay").hidden = !(v === "yes" || v === "obviously");
    $("#err-rsvp").hidden = true;
    syncOthers();
    if (user && (v === "yes" || v === "obviously")) confetti();
    if (user && v === "info") setTimeout(() => $("#question").focus(), 60);
    update();
  }
  $$("#rsvpGroup .rbtn").forEach(b => b.addEventListener("click", () => setRsvp(b.dataset.rsvp, true)));

  /* data */
  const checked = n => $$(`input[name="${n}"]:checked`).map(i => i.value);
  const val = id => (document.getElementById(id).value || "").trim();
  const titleOf = (list, id) => (list.find(o => o.id === id) || {}).title || id;
  function collect() {
    return {
      breakfast: checked("breakfast"), breakfastOther: val("breakfastOther"), breakfastNotes: val("breakfastNotes"),
      drink: checked("drink")[0] || "", drinkOther: val("drinkOther"),
      lunch: checked("lunch"), lunchOther: val("lunchOther"), lunchCraving: val("lunchCraving"),
      lunchAvoid: val("lunchAvoid"), dietary: val("dietary"), question: val("question"), rsvp
    };
  }
  const names = (list, ids, other) => ids.map(id => id === "other" ? `Other: ${other || "(not specified)"}` : titleOf(list, id)).join(", ");
  function summary(d) {
    const L = [`*${her ? her + " turns 28" : "Birthday road trip"} — my answers*`, `Date: ${CONFIG.eventDateLabel}`, ""];
    L.push(`*Am I in?* ${d.rsvp ? rsvpLabels[d.rsvp] : "(not answered yet)"}`);
    if (d.question) L.push(`*My question:* ${d.question}`);
    L.push("", "*Breakfast:* " + (d.breakfast.length ? names(CONFIG.breakfast, d.breakfast, d.breakfastOther) : "(not chosen yet)"));
    if (d.breakfastNotes) L.push(`Specifically: ${d.breakfastNotes}`);
    L.push("*Drink:* " + (d.drink ? (d.drink === "other" ? `Something else: ${d.drinkOther || "(not specified)"}` : titleOf(CONFIG.drinks, d.drink)) : "(not chosen yet)"));
    L.push("", "*Lunch:* " + (d.lunch.length ? names(CONFIG.lunch, d.lunch, d.lunchOther) : "(not chosen yet)"));
    if (d.lunchCraving) L.push(`Craving: ${d.lunchCraving}`);
    if (d.lunchAvoid) L.push(`Rather avoid: ${d.lunchAvoid}`);
    L.push(`Allergies / dietary: ${d.dietary || "None mentioned"}`);
    L.push("", "Dress code: sport casual, noted ✔");
    return L.join("\n");
  }

  /* validation */
  const rules = {
    breakfast: d => !d.breakfast.length ? "Pick at least one breakfast option, or “Surprise me!”."
      : d.breakfast.includes("other") && !d.breakfastOther ? "You picked “Other”. Tell me what you’d like." : "",
    drink: d => !d.drink ? "Pick one drink." : d.drink === "other" && !d.drinkOther ? "Tell me what “something else” is." : "",
    lunch: d => !d.lunch.length ? "Pick at least one lunch option, or “Surprise me!”."
      : d.lunch.includes("other") && !d.lunchOther ? "You picked “Other”. Tell me what you’d like." : "",
    rsvp: d => !d.rsvp ? "Pick one of the answers above." : ""
  };
  function validateStep(key, show) {
    const msg = rules[key](collect());
    const el = $("#err-" + key);
    if (show || !msg) { el.textContent = msg; el.hidden = !msg; }
    return !msg;
  }
  const stepOf = key => steps.findIndex(s => s.dataset.check === key);
  function validateAll() {
    for (const k of ["breakfast", "drink", "lunch", "rsvp"]) {
      if (!validateStep(k, false)) {
        const e = $("#err-send");
        e.innerHTML = `${esc(rules[k](collect()))} <button class="linkbtn" type="button" data-goto="${stepOf(k)}" style="color:inherit">Go fix it</button>`;
        e.hidden = false;
        return false;
      }
    }
    $("#err-send").hidden = true;
    return true;
  }
  $("#err-send").addEventListener("click", e => {
    const b = e.target.closest("[data-goto]");
    if (b) { const k = +b.dataset.goto; go(k, true); validateStep(steps[k].dataset.check, true); }
  });

  /* send */
  const waHref = t => {
    const n = (CONFIG.whatsappNumber || "").replace(/\D/g, "");
    return (n ? "https://wa.me/" + n : "https://wa.me/") + "?text=" + encodeURIComponent(t);
  };
  $("#waBtn").addEventListener("click", e => {
    if (!validateAll()) { e.preventDefault(); return; }
    $("#waBtn").href = waHref(summary(collect()));
    $("#toast").textContent = "Opening WhatsApp with your answers typed in. Tap send there.";
  });
  $("#copyBtn").addEventListener("click", () => {
    if (!validateAll()) return;
    const t = summary(collect()), fb = $("#copyFallback");
    const fallback = () => { fb.value = t; fb.hidden = false; fb.focus(); fb.select(); $("#toast").textContent = "Copy it from the box below and send it to me."; };
    try { navigator.clipboard.writeText(t).then(() => { fb.hidden = true; $("#toast").textContent = "Copied. Paste it in a message to me. It hasn’t been sent yet."; }, fallback); }
    catch (err) { fallback(); }
  });

  function update() {
    const t = summary(collect());
    $("#preview").textContent = t;
    $("#waBtn").href = waHref(t);
    syncOthers();
    save();
  }

  /* confetti */
  function confetti() {
    if (reduce) return;
    const c = $("#confetti"); c.hidden = false;
    const ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ["#F2B33D", "#E9762B", "#FFF4E2", "#1F3B2D", "#C23B22"];
    const P = Array.from({ length: 140 }, () => ({ x: W / 2, y: H * .45, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4,
      s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[(Math.random() * cols.length) | 0], round: Math.random() < .4 }));
    const t0 = performance.now();
    (function f(t) {
      const el = t - t0; ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.vy += .36; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - el / 3400); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s * .7, p.s, p.s * 1.4);
        ctx.restore();
      });
      if (el < 3400) requestAnimationFrame(f); else { ctx.clearRect(0, 0, W, H); c.hidden = true; }
    })(t0);
  }

  /* draft (this phone only) */
  function save(extra) {
    try { const p = JSON.parse(localStorage.getItem(STORE) || "{}"); localStorage.setItem(STORE, JSON.stringify(Object.assign(p, collect(), extra || {}))); } catch (e) {}
  }
  function restore() {
    let d; try { d = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { d = null; }
    if (!d) return 0;
    (d.breakfast || []).forEach(v => { const i = document.getElementById("breakfast-" + v); if (i) i.checked = true; });
    (d.lunch || []).forEach(v => { const i = document.getElementById("lunch-" + v); if (i) i.checked = true; });
    if (d.drink) { const i = document.getElementById("drink-" + d.drink); if (i) i.checked = true; }
    ["breakfastOther", "breakfastNotes", "drinkOther", "lunchOther", "lunchCraving", "lunchAvoid", "dietary", "question"]
      .forEach(k => { if (typeof d[k] === "string") document.getElementById(k).value = d[k]; });
    if (d.rsvp && rsvpLabels[d.rsvp]) setRsvp(d.rsvp, false);
    return typeof d.step === "number" ? d.step : 0;
  }

  const onEdit = e => {
    if (!e.target.closest(".step")) return;
    update();
    const k = e.target.closest(".step").dataset.check;
    if (k && !$("#err-" + k).hidden) validateStep(k, true);
    if (!$("#err-send").hidden) validateAll();
  };
  document.addEventListener("input", onEdit);
  document.addEventListener("change", onEdit);

  const start = restore();
  update();
  go(start, false);
})();
