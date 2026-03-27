# 🏛️ Architektúra és Design Döntések

Ez a dokumentum a **dk_verseny_stories** projekt szoftverarchitektúráját és a mögötte húzódó tervezési elveket mutatja be a forráskód mélyelemzése alapján.

## 1. Architektúra Minták
A projekt három fő pillérre épül:

### A) Reaktív Állapotkezelés (Proxy Pattern)
A `src/services/store.js` egy ES6 Proxy-t használ a globális állapot (`initialState`) figyelésére. 
- **Működés**: Bármely tulajdonság módosítása automatikusan értesíti a feliratkozott figyelőket (`listeners`).
- **Előny**: Nincs szükség nehéz keretrendszerekre (mint a Redux vagy Vuex), mégis reaktív marad a UI.

### B) Eseményvezérelt Kommunikáció (EventBus / Pub-Sub)
A `src/services/EventBus.js` biztosítja a komponensek közötti laza csatolást.
- **Speciális funkció**: `LockProvider`. Lehetővé teszi az események (például navigáció) ideiglenes tiltását, amíg egy aszinkron folyamat (pl. AI generálás) fut.

### C) Komponens-alapú UI (Functional Templates)
A frontend tiszta függvényekből áll, amelyek HTML stringeket adnak vissza.
- **Delegált eseménykezelés**: A `main.js`-ben egyetlen központi `onclick` figyelő kezeli a `data-action` attribútummal rendelkező elemeket, ami javítja a teljesítményt és kezeli a dinamikusan létrejövő elemeket.

## 2. Narratív Engine Logika
A `NarrativeEngine` felelős a történet dramaturgiai ívéért:
- **Szekcionálás**: A 30 diát Onboarding (3), Intro (4), Állomások (20) és Finálé (3) csoportokba rendezi.
- **Smart Distribution**: Ha a diák száma nem osztható pontosan az állomásokkal, a maradékot az első állomások között osztja el egyenletesen.
- **Vizuális kódolás**: Minden állomás egyedi színt kap a mini-térképen és az előnézetben.

## 3. Adatfolyam és Perzisztencia
1. **Input**: A felhasználó megadja a paramétereket a `SetupPanel`-en.
2. **Generálás**: A frontend elküldi a Blueprintet a Bridge szervernek (`POST /save-blueprint`).
3. **Szinkron**: A Bridge szerver fizikailag módosítja az `src/data/narrative.js` fájlt.
4. **Visszacsatolás**: A Vite HMR vagy a manuális újra-importálás frissíti a `store.narrative` állapotot, ami kiváltja a UI újrarajzolását.

## 4. Téma Kezelés
A `ThemeManager` a `body` elem `data-theme` attribútumát manipulálja. A stílusok kizárólag CSS változókon (`--bg-primary`, `--text-main`, stb.) keresztül változnak, biztosítva a zökkenőmentes átmenetet és a központi karbantarthatóságot.
