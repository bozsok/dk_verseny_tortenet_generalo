# 📜 CHANGELOG: Narratívgenerátor – Kódkirályság

Minden jelentős változtatás rögzítésre kerül ebben a dokumentumban a **szemantikus verziózás (SemVer)** elvei szerint.

---

## [1.15.0] – 2026-03-27
### 🎨 Megváltoztatva
- **Letisztult diacímek**: Eltávolítottuk a redundáns szekció-előtagokat (pl. "1. állomás - ", "Intró - ") a narratív kártyák címeiből. A címek mostantól csak a dia egyedi, leíró nevét tartalmazzák, mivel a kontextust a zóna-fejlécek (Zone Cards) biztosítják.
- **Narratív Blueprint V4**: Frissítve az AI-nak szóló generálási útmutató a letisztult címek és a magyar elnevezési konvenciók kényszerítésére.

### 🐛 Javítva
- **Bridge Tooltip olvashatóság**: Javítva a Bridge állapotjelző tooltip betűszíne a világos (Literary) témában. A fehér-a-fehéren hiba megszűnt, a szöveg mostantól sötét színnel jelenik meg a jobb olvashatóság érdekében, !important szabály használata nélkül.

---

## [1.14.0] – 2026-03-27
### 🛠️ Hozzáadva
- **Mélyreható projekt dokumentáció (Deep Scan)**: Létrehozva egy teljes körű technikai tudás bázis a `docs/` mappában, amely tartalmazza az API szerződéseket, adatmodelleket, komponens leltárt és a forrásfa elemzést.
- **Architektúra specifikáció**: Részletes dokumentáció a projekt tervezési mintáiról (reaktív Store, EventBus locking, eseménydelegáció).
- **Master Index**: Központi navigációs pont (`docs/index.md`) a dokumentumok könnyű eléréséhez.

### 🎨 Megváltoztatva
- **README frissítés**: A fő dokumentáció kiegészítve a technikai bázisra mutató hivatkozásokkal és a protokoll verziószám frissítésével.

---
## [1.13.0] – 2026-03-27
### 🛠️ Hozzáadva
- **Új "Literary" téma**: Bevezetve egy elegáns, világos téma (krém és barna színekkel), Lora és Inter betűtípusokkal a fókuszált olvasás és írás támogatására.
- **Témaváltó (Theme Toggle)**: A fejlécbe integrált nap/hold ikon, amellyel valós időben lehet váltani a Cyber-Fantasy és a Literary témák között (a böngésző localStorage automatikusan menti az állapotot).
- **Konzisztens színkódolás**: A felugró ablakok (modálok) címei is megkapták a kártyáknál megismert hero-státusz (első és utolsó dia türkiz/barna) és normál (sötét/fehér) színezést mindkét témában a diák pontos indexe alapján.

### 🎨 Megváltoztatva
- **CSS CSS-tisztítás (!important mentesítés)**: A vizuális problémák orvoslására az összes `!important` szabály el lett távolítva a kódból. A stílusok mostantól kizárólag BEM-alapú szelektorokat és helyes CSS specificitást használnak a `project-context.md` szigorú szabályainak megfelelve.
- **Kártyaszámozás harmóniája**: A sorszámok formázása a Literary témában elegáns, barna keretet kapott az oda nem illő sötétszürke háttér helyett.
- **Olvasó mód tipográfiája**: Az olvasó mód betűmérete megnövelve 2.4rem-re, stabilan biztosítva az elhatárolódást a többi bekezdéstől, egy specifikus szelektorral felülírva a globális modal beállításokat.

## [1.12.0] – 2026-03-26
### 🛠️ Hozzáadva
- **Kártya részletező modal**: Az előnézeti kártyák mostantól kattinthatók, és olvasásra optimalizált, nagybetűs modal ablakban jelenítik meg a teljes szöveget és címet.
- **Konzisztens Modal Bezárás**: Mostantól a Blueprint szerkesztő és a részletező modal is bezárható az ablak mellé (overlay-re) kattintva.
- **Intelligens Bridge Status UX**: Az állapotjelző a sidebar fejlécébe került. A frissítés most már célzottan csak az indikátort érinti, így gépelés közben nem veszik el a fókusz.
- **Javított "Történet betöltése"**: A gomb most már a teljes narratívát (`narrative.js`) is frissíti a fájlrendszerből, nem csak a címet/promptot.

### 🎨 Megváltoztatva
- **Szekvenciális Sidebar-animáció**: Tiszta JavaScript-alapú, 3-fázisú animáció bevezetése a kinyitáshoz és az összecsukáshoz. Ezzel megakadályozható a beviteli mezők és az ikonok torzulása, nyúlása a flexbox-elrendezésben.
- **Dinamikus ikonláthatóság**: Az oldalsáv navigációs ikonjai mostantól kifejezetten csak összecsukott állapotban kapnak tökéletes középre igazítást, elkerülve a „fentről lefelé hulló” vizuális hibát a kinyitás fázisában.

### 🐛 Javítva
- **Kiszorított ikonok (overflow-hiba)**: A `#setup-panel-root` elem rugalmas (`flex: 1`) magassága miatt kiszoruló ikonok hibája megszüntetve; a navigációs sáv zárt állapotban már mindig felúszik a fejléc alatti látható térbe.
- **Hiányzó reaktivitás pótlása**: Felvettük a `sidebarIconsVisible` állapotot a DOM-frissítő, `updateDynamicContent` függvény figyelőjébe, megszüntetve az aszinkron DOM-renderelési elcsúszásokat.

## [1.11.0] – 2026-03-26
### 🛠️ Hozzáadva
- **Bridge állapotjelző**: Interaktív ikon (piros/zöld) a sidebarban, amely 5 másodpercenként ellenőrzi az AI Sync Bridge elérhetőségét.
- **Manuális Projektszinkronizáció**: Új munkafolyamat a betöltött történetek fájlrendszerbe (blueprint.json, narrative.js) történő mentéséhez.
- **Biztonsági protokoll**: Client-Token alapú hitelesítés a Bridge végpontokon az illetéktelen fájlmódosítások ellen.

### 🎨 Megváltoztatva
- **Okos Blueprint Összefésülés**: A szinkronizáció mostantól megőrzi az eredeti AI Promptokat és beállításokat, csak a nevet és a narratívát frissíti.
- **UX Optimalizáció**: A sidebar mostantól nyitva marad a történet betöltése után, biztosítva a szinkronizációs gomb láthatóságát.

### 🐛 Javítva
- **Névmegőrzési hiba**: A betöltött projekt címe mostantól konzisztensen megmarad a betöltés és a szinkronizáció során is.
- **Csendes Polling**: A státuszellenőrzés többé nem szemeteli tele hibaüzenetekkel a böngésző konzolját offline állapotban.
- **Vite import figyelmeztetés**: Elnyomva a dinamikus importálással kapcsolatos elemzési hiba a src/main.js fájlban.
- **Zárolási visszajelzés**: Mostantól toast üzenet jelzi, ha a felhasználó tiltott műveletet próbál végezni generálás közben.

## [1.10.0] – 2026-03-26
### 🛠️ Hozzáadva
- **Google Fonts infrastruktúra**: Az `index.html` mostantól hatékonyan tölti be az új betűtípusokat preconnect támogatással.
- **Fira Code integráció**: A kártyaszámok és technikai adatok mostantól stílusos monospaced betűtípussal jelennek meg.

### 🎨 Megváltoztatva
- **Prémium tipográfia**: Az elavult 'Inter' lecserélése az **Outfit** (szöveg) és **Rajdhani** (címsorok) párosra a modernebb „cyber-fantasy” hatás érdekében.
- **Ergonomikus sidebar**: A másodlagos akciógombok (Blueprint, Export) a panel aljára kerültek, tisztább és rendezettebb felületet biztosítva.
- **UI-skálázás**: Megnövelt betűméretek (1 rem alapméret, nagyobb gombok és fejlécek) a jobb olvashatóságért.
- **Stíluskód-tisztítás**: Felesleges CSS-kommentek és nem használt `base.css` hivatkozás eltávolítása.


## [1.9.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Beágyazott AI munkafolyamat**: A modális ablak kiváltása az előnézeti területbe integrált, háromfázisú állapotjelzővel (Szinkronizáció → Várakozás → Automatikus frissítés).
- **Megújult sidebar**: Dinamikus navigációs ikonok összecsukott állapotban, Simon-színkódolt szakaszokkal és smooth scroll-lal.
- **UX optimalizáció**: Valós idejű, 5 másodperces beágyazott szinkronizációs visszaszámlálás és félrevezető toast üzenetek eltávolítása.
- **Konvenciók**: MTA 12. kiadás szerinti helyesírás és minden `!important` CSS szabály kivezetése.
- **Dinamikus sidebar navigáció**: a sidebar összecsukott állapotában színes ikonok teszik lehetővé a szekciók (Onboarding, Bevezetés, Állomások, Finálé) közötti gyors navigációt.
- **Auto-collapse funkcionalitás**: az alkalmazás mostantól alapértelmezés szerint összecsukott sidebar-ral indul a fókuszáltabb munkavégzés érdekében.
- **Konzisztens indulási állapot**: a `main.js` inicializációs folyamatának javítása, amely biztosítja, hogy a sidebar és a navigáció már az első betöltéskor a helyes pozícióban jelenjen meg.
- **Dinamikus központosítás**: a státusz-kártya mostantól minden AI fázisban mértani középpontban (függőlegesen is) jelenik meg, a felesleges háttér-stílusok eltávolításával.
- **UI finomhangolás**: a normál diák függőleges elhelyezkedésének korrekciója és a Preview terület dinamikus layout-kezelése.

### 🎨 Megváltoztatva
- **Tipográfiai javítás**: a kártyák leírásának betűméretét 16px-re (1rem) növeltük a jobb olvashatóság érdekében.
- **Konvenciók szigorítása**: a teljes CSS kód alapos tisztítása, az összes `!important` jelző eltávolítása és a specifikusság alapú prioritáskezelés bevezetése a `project-context.md` irányelvei szerint.

### 🐛 Javítva
- **Navigation Overflow**: megszüntettük a vízszintes görgetősáv megjelenését az ikonok hover állapotánál.
- **Zónahiba**: javítottuk a hiányzó szakaszokat (pl. Finálé), így minden rész elérhetővé vált az oldalsávból.

---

## [1.8.0] – 2026-03-25
### 🛠️ Hozzáadva
- **Dinamikus narratív motor (QQ)**: a szekciók (onboarding, intro, finálé) és az állomások száma mostantól teljes mértékben konfigurálható a `store.js` és a `blueprint.json` fájlokon keresztül.
- **Rugalmas szekcionálás**: eltávolítottuk a beégetett (3-4-3) konstansokat a `narrative-engine.js`-ből, helyettük a projektszintű konfiguráció érvényesül.
- **Kiterjesztett színskála**: tíz egyedi neonszín támogatása az állomásokhoz a dinamikus megjelenítés érdekében.
- **Konfigurációperzisztencia**: a narratív felosztás beállításai elmentődnek a `blueprint.json` fájlba, így project_name: 'dk_verseny_stories'
user_name: 'Krisztián'
date: '2026-03-27'
version: '1.15.0'
sections_completed: ['technology_stack', 'critical_rules']
a projektenként testre szabhatók.

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
