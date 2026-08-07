// Lädt Text-Überschreibungen aus der DB und bietet dem Admin einen Inline-Editor.
// Muss NACH dem Haupt-Skript der Seite eingebunden werden (braucht T, L, setLang).
(async function () {
  const PAGE = location.pathname === "/" ? "/index.html" : location.pathname;
  const curLang = () => localStorage.getItem("listo-lang") || "en";

  function applyOverrides(ov) {
    if (typeof T === "undefined") return;
    for (const [key, langs] of Object.entries(ov)) {
      for (const [lg, txt] of Object.entries(langs)) {
        if (T[lg]) T[lg][key] = txt;
      }
    }
    if (typeof setLang === "function") setLang(curLang());
  }

  try {
    const resp = await fetch("/api/i18n?page=" + encodeURIComponent(PAGE));
    if (resp.ok) applyOverrides(await resp.json());
  } catch (e) { /* Server offline */ }

  // ---- Ab hier nur für den eingeloggten Admin ----
  let me = null;
  try {
    const resp = await fetch("/api/me", { credentials: "same-origin" });
    if (resp.ok) me = await resp.json();
  } catch (e) { return; }
  if (!me || !me.is_admin) return;

  const fab = document.createElement("button");
  fab.id = "adminEditFab";
  fab.textContent = "✏️ Texte bearbeiten";
  fab.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 18px;" +
    "border:none;border-radius:980px;background:#75aae7;color:#fff;font-weight:600;" +
    "font-size:14px;font-family:inherit;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.25);";
  document.body.appendChild(fab);

  const note = document.createElement("div");
  note.style.cssText =
    "position:fixed;bottom:80px;right:24px;z-index:9999;max-width:260px;display:none;" +
    "background:#1d1d1f;color:#f5f5f7;border-radius:14px;padding:12px 16px;font-size:13px;line-height:1.5;";
  document.body.appendChild(note);

  let editing = false;
  let originals = {};

  function editable(on) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.contentEditable = on ? "true" : "false";
      el.style.outline = on ? "2px dashed #75aae7" : "";
      el.style.outlineOffset = on ? "3px" : "";
    });
  }

  fab.onclick = async () => {
    if (!editing) {
      editing = true;
      originals = {};
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        originals[el.dataset.i18n] = el.innerHTML;
      });
      editable(true);
      fab.textContent = "💾 Speichern";
      note.style.display = "block";
      note.textContent = "Klick in einen Text und ändere ihn. Beim Speichern wird automatisch in alle Sprachen übersetzt (Sprache oben rechts = Sprache, in der du gerade schreibst).";
      return;
    }
    // Speichern
    editable(false);
    const changed = [];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (originals[key] !== undefined && el.innerHTML !== originals[key]) {
        changed.push({ key, text: el.innerHTML });
      }
    });
    if (!changed.length) {
      editing = false;
      fab.textContent = "✏️ Texte bearbeiten";
      note.style.display = "none";
      return;
    }
    fab.textContent = "🌍 Übersetze…";
    fab.disabled = true;
    let ok = 0, fail = 0;
    for (const ch of changed) {
      try {
        const resp = await fetch("/api/i18n", {
          method: "POST", credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: PAGE, key: ch.key, text: ch.text, source_lang: curLang() }),
        });
        const data = await resp.json();
        if (resp.ok) { ok++; applyOverrides({ [ch.key]: data.translations }); }
        else fail++;
      } catch (e) { fail++; }
      fab.textContent = `🌍 Übersetze… ${ok + fail}/${changed.length}`;
    }
    editing = false;
    fab.disabled = false;
    fab.textContent = "✏️ Texte bearbeiten";
    note.textContent = fail
      ? `⚠️ ${ok} gespeichert, ${fail} fehlgeschlagen — nochmal versuchen.`
      : `✓ ${ok} Text${ok === 1 ? "" : "e"} gespeichert und in alle Sprachen übersetzt.`;
    setTimeout(() => { note.style.display = "none"; }, 5000);
  };
})();
