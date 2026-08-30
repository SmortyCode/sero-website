# SERO Website — Regeln für KI-Assistenten

**Antworte auf Deutsch.** Statische Seiten für Anmeldung, Onboarding und
Rechtstexte. Backend und vollständige Regeln: `~/ebay-bot/AGENTS.md`.

## Betrieb: dieses Verzeichnis ist LIVE

`~/ebay-bot/web/server.py` mountet diesen Ordner als `SITE_DIR` unter `/` des
Dauerdienstes `com.listo.web` (Port 3000). **Speichern = live**, kein Build,
kein Neustart nötig. Ansehen unter `http://192.168.2.39:3000/onboarding.html`.

**Niemals einen eigenen Server auf Port 3000 starten** und den Dienst nicht
stoppen — daran ist schon eine Vorführung geplatzt. Hinweis: Das
Offline-Banner in `onboarding.html` nennt in allen Sprachen noch den alten
Port 8484. Vor einer Korrektur bei Sven nachfragen.

## Der Onboarding-Assistent (`onboarding.html`)

Fünf Schritte: Konto → eBay verbinden → **Versandadresse (Pflicht)** →
Probelauf mit optionalem Telegram-Kasten → Plan wählen.

Schritt 3 ruft `POST /api/ebay-setup` auf; das legt eBay-Verkaufsrichtlinien
und den Versandstandort an. Seit 07.08.2026 ist **Telegram optional** — vorher
kam ein Nutzer ohne Telegram nie zum Listen. Diesen Zwang nicht wieder
einbauen.

## Übersetzungen

Fünf Sprachen. Deutsch steht direkt im HTML und wird beim Laden automatisch
als Wörterbuch `T.de` eingesammelt — dort ist nichts von Hand zu pflegen.
Die vier anderen (en, es, it, fr) stehen im `T`-Objekt.

**Jeder neue `data-i18n`- oder `data-i18n-ph`-Schlüssel muss in ALLEN VIER
Wörterbüchern stehen** — fehlende Schlüssel fallen still auf den deutschen
Text zurück und ergeben halb übersetzte Seiten.

Zwei Fallen beim Prüfen:
- Die Seite **startet auf Englisch** (`<html lang="en">`, `setLang(… || "en")`)
  und merkt sich die Wahl in localStorage. Zum Prüfen einer deutschen
  Textänderung oben im Auswahlfeld auf DE stellen. Den Start-Default nicht
  ohne Rücksprache ändern.
- **Texte im HTML sind nicht immer das, was der Besucher sieht.** Seiten mit
  `i18n-admin.js` (index, login, guide, app, onboarding) laden beim Aufruf
  `/api/i18n?page=…` und überschreiben `data-i18n`-Texte aus der Tabelle
  `i18n_overrides` — dort landet, was Sven über den „Texte bearbeiten"-Knopf
  im Browser ändert. Für `/index.html` gibt es solche Überschreibungen.
  Vor einer Textänderung prüfen:
  `sqlite3 -readonly ~/ebay-bot/data.db "SELECT page,key,lang FROM i18n_overrides"`
  Gibt es einen Treffer, ist die HTML-Änderung wirkungslos und der Text muss
  im Browser geändert werden.

## Ton

Duzen, keine Ausrufezeichen im Fließtext, kein Marketing-Superlativ.
Nichts versprechen, was die App nicht hält.

## Domain-Hinweis (15.08.2026)

**seromunich.com (Apex)** ist die SERO-Landingpage auf Contabo (Repo
`~/ebay-bot/landing/`), nicht mehr Shopify. Onboarding/Legal unter diesem
Ordner laufen weiter über die App-Domain (`app.seromunich.com`), solange
`LISTO_SITE_DIR` darauf zeigt.
