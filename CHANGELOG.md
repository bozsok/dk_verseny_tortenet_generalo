# 📜 CHANGELOG: Narratív Generátor - Kód Királyság

Minden jelentős változtatás rögzítésre kerül ebben a dokumentumban a **Semantic Versioning (SemVer)** elvei szerint.

---

## [1.5.0] - 2026-03-25
### 🛠️ Hozzáadva (Added)
- **AI Sync Bridge Integráció:** Teljeskörű mentési folyamat (`server.js`) a Blueprint és az Iterációk fájlszintű rögzítéséhez.
- **UI Visszajelzés (Toasts):** Valós idejű értesítések a mentési és generálási folyamatok állapotáról.
- **Esemény-delegáció:** Robusztus kattintáskezelés, amely kiküszöböli az eseménykezelők elvesztését a UI újrarenderelésekor.

### 🎨 Megváltoztatva (Changed)
- **Dinamikus NarrativeEngine:** A szekcióelosztás (Onboarding, Intro, Állomások) mostantól automatikusan igazodik a diák számához.
- **Visual Glow:** Erősebb neon-cián hover effektus és 3D-s emelkedés a narratív kártyákon.
- **Gomb Feliratok:** Egyértelműbb **'AI GENERÁLÁS INDÍTÁSA'** és **'ADATOK KÜLDÉSE'** üzenetek.

### 🐛 Javítva (Fixed)
- **Generálás Szinkron:** Megszűnt a "beragadó" generálás gomb és a frissítetlen tartalom problémája.
- **Input Binding:** A projekt címe és a prompt mostantól konzisztensen megmarad a UI frissítésekor.

---

## [1.4.0] - 2026-03-25
### 🛠️ Hozzáadva (Added)
- **Logger.js:** A tiltott `console.log` hívások kiváltására létrehozott egységes naplózó rendszer.
- **Generálás Stabilizálása:** Az UI animáció függetlenítése és a tartalom automatikus újrarajzolásának javítása.
- **Exportálás (.txt):** Strukturált szövegfájl letöltése a teljes narratívával és a Mesterleíróval.
- **Destroy Logika:** Alkalmazás szintű erőforrás-felszabadítás a memóriaszivárgások ellen.

### 🎨 Megváltoztatva (Changed)
- **Gombok Újratervezése:** Közérthetőbb feliratok: **'TÖRTÉNET GENERÁLÁSA'** és **'EXPORTÁLÁS'**.
- **Projekt Címe:** Visszaállítottuk az egyedi beviteli mezőt a történet címének megadásához.
- **Kódminőségi Audit:** Teljes refaktorálás a `.dkv-` prefix és a magyar JSDoc használatával.
- **Névfinomítás:** A `GameLogger` egyszerűsítve lett `Logger`-re.

---

## [1.3.0] - 2026-03-25
### 🛠️ Hozzáadva (Added)
- **Blueprint Szerkesztő (Mesterleíró):** Új modális ablak a rendszerszintű AI utasítások (Mesterleíró-V2) közvetlen módosításához.
- **Kezdeti Állapot Betöltése:** A Blueprint tartalom mostantól alapértelmezetten a `store.js`-ből töltődik be, elkerülve az üres szerkesztőablakot.

### 🎨 Megváltoztatva (Changed)
- **Modal UI Újratervezés:** A lila/rózsaszín színeket professzionális **neon-cián** váltotta fel a Blueprint ablakban.
- **Geometria:** 20px-es lekerekített sarkok és tágas (kezdetben 50px, majd 25px) padding a modális ablakokon.
- **Módosítások mentése:** A "MENTÉS ÉS BEÉPÍTÉS" funkció bekötve a Store-ba a rugalmasabb generálás érdekében.

---

## [1.2.0] - 2026-03-24
### 🎨 Megváltoztatva (Changed)
- **Prémium Gombok:** Minden oldalsáv-gomb magassága egységesen **56px**, biztosítva a szimmetrikus, vaskos megjelenést.
- **Vágólap Funkció:** Az "ÖSSZES MÁSOLÁSA" gomb mostantól a teljes narratíva szövegét másolja (31 dia), nemcsak a jegyzeteket.
- **UX Finomhangolás:** Eltávolítottuk a zavaró pipát a "MÁSOLVA!" felirat elől a letisztultabb stílus érdekében.

---

## [1.1.0] - 2026-03-24
### 🛠️ Hozzáadva (Added)
- **Kollapszibilis Oldalsáv (Sidebar):** Integrált 70px/440px szélességváltás, szinkronizált animációval.
- **Sync Bridge Kapcsolat:** Felkészülés a `server.js` (`npm run bridge`) alapú mentési folyamatokra.

### 🐛 Javítva (Fixed)
- **Z-Index és Rétegek:** A modális ablakok és az oldalsáv rétegrendjének javítása (z-index: 2005+).
- **Vizuális Szinkron:** A sidebar váltógombjának pozíciója mostantól tökéletesen együtt mozog a panel szélével, "pattogás" (bounce) nélkül.

---

## [1.0.0] - 2026-03-24
### 🛠️ Hozzáadva (Added)
- **TRON UI Rendszer:** Teljesen új, neon-cián alapú cyber-fantasy esztétika bevezetése.
- **Dinamikus Diakezelő:** Proxy-alapú állapotkezelés (`store.js`) a diák valós idejű szerkesztéséhez és megjelenítéséhez.
- **Projekt Kontextus:** Létrehozva a `project-context.md` a szigorú kódolási és fejlesztési irányelvek rögzítéséhez.

---

> [!NOTE]
> A verziószámok a funkcionális mérföldköveket és a technikai stabilitást tükrözik.
