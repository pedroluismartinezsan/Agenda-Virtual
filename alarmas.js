/* Alarmas de cortesía mientras la agenda está abierta.
   NO reemplaza las alarmas nativas con pantalla bloqueada. */
(() => {
  const KEY = "agendaAlarmasAtendidasV1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  let done = read(), audio = null, oscillator = null, gain = null, pulse = null, stopTimer = null, current = null;
  let unlocked = false;
  const panel = document.createElement("section");
  panel.id = "alarmOverlay";
  panel.setAttribute("role", "alertdialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Alarma de compromiso");
  panel.hidden = true;
  panel.innerHTML = '<div class="alarm-box"><div class="alarm-bell">🔔</div><h2>¡ES HORA DE TU REUNIÓN!</h2><p id="alarmDescription"></p><div class="alarm-actions"><button type="button" id="alarmStop">APAGAR ALARMA</button><button type="button" id="alarmSnooze">POSPONER 5 MIN</button></div></div>';
  document.body.appendChild(panel);
  const style = document.createElement("style");
  style.textContent = '#alarmOverlay:not([hidden]){position:fixed;inset:0;z-index:99999;background:rgba(5,20,45,.92);display:grid;place-items:center;padding:20px}.alarm-box{width:min(100%,430px);padding:30px 22px;border-radius:24px;background:white;text-align:center;color:#14253d;box-shadow:0 15px 60px #0005}.alarm-bell{font-size:60px;animation:alarmShake .4s infinite alternate}.alarm-box h2{font-size:23px;color:#b91c1c}.alarm-box p{font-size:17px;line-height:1.5}.alarm-actions{display:grid;gap:12px}.alarm-actions button{border:0;border-radius:12px;padding:16px;font-size:16px;font-weight:800;background:#d92832;color:white}.alarm-actions button+button{background:#0756a8}@keyframes alarmShake{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}';
  document.head.appendChild(style);
  function stopSound() {
    clearInterval(pulse); clearTimeout(stopTimer); pulse = stopTimer = null;
    try { oscillator?.stop(); } catch {}
    oscillator = null;
    if (audio) { audio.close().catch(() => {}); audio = null; }
  }
  function dismiss(snooze) {
    stopSound(); panel.hidden = true;
    if (!current) return;
    const key = current.key;
    if (snooze) {
      done[key] = Date.now() + 5 * 60 * 1000;
    } else {
      done[key] = -1;
    }
    localStorage.setItem(KEY, JSON.stringify(done));
    current = null;
  }
  panel.querySelector("#alarmStop").addEventListener("click", () => dismiss(false));
  panel.querySelector("#alarmSnooze").addEventListener("click", () => dismiss(true));
  async function sound() {
    if (!unlocked) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      await audio.resume();
      oscillator = audio.createOscillator(); gain = audio.createGain();
      oscillator.type = "square"; gain.gain.value = 0;
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      let on = false;
      pulse = setInterval(() => {
        on = !on;
        oscillator.frequency.setValueAtTime(on ? 880 : 660, audio.currentTime);
        gain.gain.setValueAtTime(on ? 0.35 : 0, audio.currentTime);
      }, 280);
      stopTimer = setTimeout(stopSound, 30000);
    } catch (error) { console.warn("Audio no disponible:", error); }
  }
  function ring(event, key) {
    current = { event, key };
    panel.querySelector("#alarmDescription").textContent =
      event.title + " · " + event.time + (event.location ? " · " + event.location : "");
    panel.hidden = false;
    sound();
    if (navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 400]);
  }
  function check() {
    if (current || typeof events === "undefined" || !Array.isArray(events)) return;
    const now = Date.now();
    for (const event of events) {
      if (!event.date || !event.time) continue;
      const start = new Date(event.date + "T" + event.time + ":00").getTime();
      if (!Number.isFinite(start)) continue;
      const key = String(event.id) + "-" + event.date + "-" + event.time;
      const state = done[key];
      if (state === -1) continue;
      if (typeof state === "number" && state > 0) {
        if (now >= state && now - state < 60000) { ring(event, key); return; }
        if (now - state >= 60000) { done[key] = -1; localStorage.setItem(KEY, JSON.stringify(done)); }
        continue;
      }
      if (now >= start && now - start < 60000) { ring(event, key); return; }
    }
  }
  const activate = document.createElement("button");
  activate.type = "button"; activate.textContent = "🔊 Activar sonido de alarmas";
  activate.style.cssText = "display:block;margin:12px auto;padding:12px 18px;background:#0756a8;color:white;border:0;border-radius:12px;font-weight:bold;cursor:pointer";
  activate.addEventListener("click", async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      await ctx.resume(); await ctx.close(); unlocked = true;
      activate.textContent = "✓ Sonido habilitado en esta sesión";
      activate.disabled = true;
    } catch { activate.textContent = "No se pudo activar el sonido"; }
  });
  (document.querySelector(".main-content") || document.body).prepend(activate);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  window.addEventListener("focus", check);
  setInterval(check, 1000);
  check();
})();
