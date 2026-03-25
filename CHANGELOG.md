# 📜 CHANGELOG: Narratívgenerátor – Kódkirályság

Minden jelentős változtatás rögzítésre kerül ebben a dokumentumban a **szemantikus verziózás (SemVer)** elvei szerint.

---

## [1.8.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Dinamikus narratív motor (QQ)**: a szekciók (onboarding, intro, finálé) és az állomások száma mostantól teljes mértékben konfigurálható a `store.js` és a `blueprint.json` fájlokon keresztül.
- **Rugalmas szekcionálás**: eltávolítottuk a beégetett (3-4-3) konstansokat a `narrative-engine.js`-ből, helyettük a projektszintű konfiguráció érvényesül.
- **Kiterjesztett színskála**: tíz egyedi neonszín támogatása az állomásokhoz a dinamikus megjelenítés érdekében.
- **Konfigurációperzisztencia**: a narratív felosztás beállításai elmentődnek a `blueprint.json` fájlba, így projektenként testre szabhatók.

### 🎨 Megváltoztatva
- **Motorrefaktor**: a `getSections` metódus mostantól a `store.narrativeConfig` adatait használja a beégetett számok helyett a szekcióelosztás kiszámításához.

---

## [1.7.0] – 2026-03-25
### 🛠️ Hozzáadva
- **MTA 12. kiadás protokoll**: szigorú helyesírási és egybeírási szabályok bevezetése a narratív generálásban (Adatpohár, Zajentitás, Puffer, Avatár).
- **Narratív Blueprint V3**: a teljes, részletes Mesterleíró tartalom visszaállítása és kibővítése a 30 diás struktúra (3-4-20-3) rögzítésével.
- **Intelligens rács-elrendezés**: a kártyák elhelyezése páratlan szekciók esetén (az első onboarding- vagy az utolsó finálékártya) automatikusan két oszlopos „Hero” stílusra vált a vizuális egyensúly érdekében.

### 🎨 Megváltoztatva
- **UX-finomítás**: eltávolítottuk a hover effektust a nem kattintható szekciófejlécekről (`.dkv-zone-card`).
- **Workflow frissítés**: a generálási útmutató (`generate-narrative.md`) mostantól a pontos 30 diás darabszámot tükrözi.

### 🐛 Javítva
- **Szekcióeltolódás javítása**: a `narrative-engine.js` mostantól helyesen, az onboardingot három, az intrót pedig négy diásnak tekinti, megszüntetve a kártyák közötti csúszást.

---

## [1.6.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Robusztus mentési folyamat:** bevezetve az `AbortController` (10 mp-es időtúllépés) és a `response.ok` ellenőrzése a hálózati hibák és a szerverleállások kezelésére.
- **Többformátumú exportálás:** különálló gombok a narratíva .md (Markdown) és .txt (egyszerű szöveg) formátumban történő letöltéséhez.
- **Projektperzisztencia:** az alkalmazás indításkor automatikusan beolvassa a `blueprint.json` fájlt, így a projekt címe és a prompt megmarad a munkamenetek között.
- **Hordozhatóság:** az alkalmazás leválasztása a `Source` mappáról. A generálási szabályok (Mesterleíró v2) mostantól beépítve találhatók a `store.js` fájlban, így a mappa nélkül is működőképes a rendszer.
- **Vizuális hibajelzés:** vörös neon glitch effektus a háttérben kritikus mentési hiba esetén.

### 🎨 Megváltoztatva
- **Exportálási logika:** teljesen natív, `Blob` alapú megoldás külső függőségek nélkül.
- **Dinamikus címkezelés:** a `slides-title` mostantól valós időben követi a projekt címének változásait az előnézeti területen.

### 🐛 Javítva
- **Címfrissítési hiba:** megszűnt a `main.js` fájlban lévő korai return, amely megakadályozta a fő tartalom címének frissülését.
- **Karakterkódolási hiba:** kiküszöböltük a PowerShell-alapú fájlmódosítások okozta UTF-8 kódolási rendellenességeket.

---

## [1.5.0] – 2026-03-25
### 🛠️ Hozzáadva
- **AI Sync Bridge integráció:** teljes körű mentési folyamat (`server.js`) a blueprint és az iterációk fájlszintű rögzítéséhez.
- **Vizuális visszajelzés (toasts):** valós idejű értesítések a mentési és a generálási folyamatok állapotáról.
- **Eseménydelegáció:** robusztus kattintáskezelés, amely kiküszöböli az eseménykezelők elvesztését a UI újrarenderelésekor.

### 🎨 Megváltoztatva
- **Dinamikus NarrativeEngine:** a szekcióelosztás (onboarding, intro, állomások) mostantól automatikusan igazodik a diák számához.
- **Vizuális ragyogás:** erősebb neoncián hover effektus és 3D-s emelkedés a narratív kártyákon.
- **Gombfeliratok:** egyértelműbb „AI GENERÁLÁS INDÍTÁSA” és „ADATOK KÜLDÉSE” üzenetek.

### 🐛 Javítva
- **Generálási szinkron:** megszűnt a beragadó generálás gomb és a frissítetlen tartalom problémája.
- **Input Binding:** a projekt címe és a prompt mostantól konzisztensen megmarad a UI frissítésekor.

---

## [1.4.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Logger.js:** a tiltott `console.log` hívások kiváltására létrehozott egységes naplózó rendszer.
- **Generálás stabilizálása:** az UI-animáció függetlenítése és a tartalom automatikus újrarajzolásának javítása.
- **Exportálás (.txt):** strukturált szövegfájl letöltése a teljes narratívával és a mesterleíróval.
- **Erőforrás-felszabadítás:** alkalmazásszintű tisztítási logika a memóriaszivárgások ellen.

### 🎨 Megváltoztatva
- **Gombok újratervezése:** közérthetőbb feliratok: „TÖRTÉNET GENERÁLÁSA” és „EXPORTÁLÁS”.
- **Projekt címe:** visszaállítottuk az egyedi beviteli mezőt a történet címének megadásához.
- **Kódminőségi felülvizsgálat:** teljes refaktorálás a `.dkv-` prefix és a magyar JSDoc használatával.

---

## [1.3.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Blueprint-szerkesztő:** új modális ablak a rendszerszintű AI utasítások (Mesterleíró v2) közvetlen módosításához.
- **Kezdeti állapot betöltése:** a blueprint tartalma mostantól alapértelmezetten a `store.js` fájlból töltődik be.

### 🎨 Megváltoztatva
- **Modal UI újratervezése:** a lila és rózsaszín színeket professzionális neoncián váltotta fel a blueprint ablakban.
- **Geometria:** 20 px-es lekerekített sarkok és tágas térközök a modális ablakokon.
- **Mentési funkció:** a „MENTÉS ÉS BEÉPÍTÉS” funkció bekötve a store rendszerbe.

---

## [1.2.0] – 2026-03-24
### 🎨 Megváltoztatva
- **Prémium gombok:** minden oldalsávgomb magassága egységesen 56 px a szimmetrikus megjelenésért.
- **Vágólapfunkció:** az „ÖSSZES MÁSOLÁSA” gomb mostantól a teljes narratíva szövegét másolja.
- **UX-finomhangolás:** a zavaró pipajel eltávolítása a „MÁSOLVA!” felirat elől.

---

## [1.1.0] – 2026-03-24
### 🛠️ Hozzáadva
- **Összecsukható oldalsáv:** integrált 70 px / 440 px szélességváltás szinkronizált animációval.
- **Sync Bridge kapcsolat:** felkészülés a `server.js` alapú mentési folyamatokra.

### 🐛 Javítva
- **Rétegrend javítása:** a modális ablakok és az oldalsáv z-index értékeinek korrekciója.
- **Vizuális szinkron:** a sidebar váltógombjának pozíciója mostantól tökéletesen együtt mozog a panel szélével.

---

## [1.0.0] – 2026-03-24
### 🛠️ Hozzáadva
- **TRON UI rendszer:** teljes körű, neoncián alapú cyber-fantasy esztétika bevezetése.
- **Dinamikus diakezelő:** proxyalapú állapotkezelés a diák valós idejű szerkesztéséhez.
- **Projektkontextus:** a `project-context.md` létrehozása az irányelvek rögzítéséhez.

---

> [!NOTE]
> A verziószámok a funkcionális mérföldköveket és a technikai stabilitást tükrözik.
