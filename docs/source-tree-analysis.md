# 🌳 Forrásfa Elemzés

A projekt egy tiszta, Monolith felépítést követ, ahol a funkcionális logika és a UI komponensek élesen elválnak egymástól.

## Könyvtárszerkezet

```text
dk_verseny_stories/
├── _bmad/               # BMAD módszertan konfigurációi és memóriája
├── docs/                # [ÚJ] Projekt dokumentáció (ez a mappa)
├── public/              # Statikus assetek, képek, favicon
├── src/                 # Alkalmazás forráskódja
│   ├── components/      # UI Komponensek (Template string alapúak)
│   │   ├── BlueprintModal.js
│   │   ├── IterationModal.js
│   │   └── ...
│   ├── data/            # Adatfájlok (JSON/JS)
│   │   ├── blueprint.json    # Mesterleíró
│   │   └── narrative.js      # Aktuális történet
│   ├── services/        # Üzleti logika és állapotkezelés
│   │   ├── store.js          # Reaktív globális állapot
│   │   ├── EventBus.js       # Eseményvezérelt kommunikáció
│   │   ├── narrative-engine.js # Történet generálási logika
│   │   └── ThemeManager.js   # Téma kezelés (Cyber/Literary)
│   ├── styles/          # CSS stíluslapok (Vanilla BEM)
│   │   ├── variables.css     # Téma-specifikus változók
│   │   └── components.css    # Komponens stílusok
│   └── main.js          # Alkalmazás belépési pont és UI Controller
├── index.html           # HTML váz és anti-flicker szkript
├── server.js            # AI Sync Bridge (Express szerver)
├── vite.config.js       # Vite konfiguráció
└── package.json         # Függőségek és szkriptek
```

## Kritikus Útvonalak
- **Belépési pont**: `src/main.js` - Itt történik az eseménydelegálás és a Store feliratkozások kezelése.
- **Állapotkezelés**: `src/services/store.js` - Minden reaktív UI változás innen indul ki.
- **Perzisztencia**: `server.js` → `src/data/` - A Bridge szerver ezen az útvonalon keresztül írja a fájlrendszert.
