# 🧩 UI Komponens Leltár és Események

A projekt Vanilla JS komponens-mintát követ, központi eseménydelegálással.

## 📐 Komponens Felépítés
Minden komponens (pl. `SetupPanel`, `NarrativeCard`) egy tiszta függvény, amely a `store` állapotából generál HTML stringet.

## 🖼️ Főbb Komponensek

### 1. SetupPanel
- **Hely**: `src/components/SetupPanel.js`
- **Funkció**: Fő vezérlőpult.
- **Interakciók**:
  - `data-action="generate"`: AI generálás indítása.
  - `data-action="load-story"`: MD/TXT betöltése.
  - `data-action="sync-project"`: Szinkronizáció a Bridge-el.
  - `data-action="edit-blueprint"`: Blueprint szerkesztő megnyitása.

### 2. IterationModal
- **Hely**: `src/components/IterationModal.js`
- **Logika**: 
  - `isHero`: Az első és utolsó dia speciális (`hero`) vizuális stílust kap.
  - Mentéskor a `POST /save-iteration` hívást indítja.

### 3. NarrativeCard
- **Hely**: `src/components/NarrativeCard.js`
- **Jellemzők**: Animált beúszás (`dkv-card--animated`), téma-érzékeny színek.

## 📡 Eseményvezérlés (EventBus)
A komponensek közötti kommunikáció a `src/services/EventBus.js`-en keresztül zajlik:
- `NAVIGATE_TO`: Görgetés egy adott szekcióhoz.
- `SCROLL_TOP`: Visszatérés az oldal tetejére.
- `UI_REJECTED_ACTION`: Visszajelzés, ha a UI zárolva van (Toast értesítés).

## 🎨 Stíluskezelés
- **Prefixed CSS**: Minden osztály `dkv-` előtaggal rendelkezik.
- **Dinamikus Témák**: A `body[data-theme]` váltásával a CSS változók értékei globalizáltan frissülnek.
