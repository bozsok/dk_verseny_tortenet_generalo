# Shadow System: Architektúrális Refaktorálási Terv (V1)

Ez a dokumentum rögzíti a Shadow narratíva-generáló rendszer professzionális újraépítésének lépéseit. A cél a jelenlegi monolitikus struktúra felszámolása és egy Senior szintű, komponens-alapú architektúra bevezetése.

## 1. Alapelvek (Core Principles)
- **Separation of Concerns (SoC)**: A UI komponensek nem végeznek I/O műveletet.
- **Single Responsibility Principle (SRP)**: Minden fájlnak pontosan egy feladata van.
- **Event-Driven Architecture**: Buborékoltatás helyett központi eseménybusz (EventBus).
- **Single Source of Truth**: Az állapot kizárólag a Store-ban élhet.
- **Lifecycle & Disposal (PC 8, 36)**: Kötelező a `destroy()` metódus és a `DisposalService` használata.
- **Focus Preservation (PC 35, 61)**: Az `update()` során az `activeElement` fókuszát meg kell őrizni.

## 2. Új Szerviz Réteg (Services Layer)
A logikai elágazásokat és I/O műveleteket kiemeljük a komponensekből:
- `ShadowBridgeService.js`: Minden hálózati kommunikáció (fetch) a 3003-as port felé.
- `ShadowExportService.js`: Fájl generálás (Blob, Download) logikája (.md, .txt).
- `ShadowEventBus.js`: Könnyű Pub/Sub rendszer az akciók (pl. export indítása) koordinálására.

## 3. Komponens Dekompozíció (UI Layer)
A `RootShadow` és `SetupShadow` monolitokat kisebb egységekre bontjuk:
- `ShadowLayout.js`: A grid váz és az alapelrendezés.
- `ShadowHeader.js`: Kizárólagos gazdája a címnek, a Témaváltónak és a Bridge Status ikonnak.
- `ShadowSidebar.js`: A navigációs panel tárolója.
- `BlueprintControl.js`: Mesterleíró mezők és blueprint gomb.
- `ExportActions.js`: Csak az export gombok megjelenítése és az EventBus hívása.

## 4. Izolációs Stratégia (Rule 61+)
- **Névtér kényszerítés**: Minden stílus a `.dkv-shadow-active` és `.dkv-shadow-` (BEM) szelekto alatt (PC 43).
- **Reset Guard**: Globális CSS reset, ami kényszerített `display: none !important`-al elrejti a fő alkalmazás összes maradványát.
- **MTA 12. Helyesírás Check (PC 45)**: Minden felirat (pl. `AI-generálás`) kötelező felülvizsgálata.

## 5. Implementációs Ütemterv

### I. Fázis: Infrastruktúra (Infrastructure)
1. `ShadowBridgeService.js` létrehozása.
2. `ShadowEventBus.js` bevezetése.
3. `ShadowExportService.js` kiépítése.

### II. Fázis: UI Dekompozíció (Decomposition)
1. `ShadowHeader.js` leválasztása a Root-ról.
2. Gombok (Blueprint, Export) kiszervezése atomi komponensekbe.
3. `RootShadow.js` és `SetupShadow.js` átalakítása tiszta, eseményvezérelt vázakká.

### III. Fázis: Validáció és Tesztelés (PC 35)
1. **Vitest Unit Tesztek**: Kötelező tesztek a `BridgeService`, `EventBus` és `ExportService` modulokhoz.
2. Dupla letöltés ellenőrzése (EventBus-on keresztül csak 1 trigger).
3. Témaváltó (1 példány, 1 listener).
4. Bridge port (3003) kényszerítés ellenőrzése.
5. Fókusz-teszt: `update()` hívás közbeni input fókusz megőrzése.

## 6. Senior Biztonsági és Stabilitási Rétegek (Audit Findings)
Az átvilágítás során az alábbi kritikus védelmi vonalakat azonosítottuk, amelyeket kötelező implementálni:

### A. Esemény-védelem (Event Throttling)
- **Problem**: Race conditions és dupla triggerek (pl. export gomb többszöri lenyomása).
- **Solution**: A `ShadowEventBus` vagy a `ExportService` szintjén kötelező **Debounce** (250ms) és **Throttle** (1s) logikát bevezetni minden I/O akcióhoz.

### B. Bridge Stabilitás (Network Resilience)
- **Problem**: Lassú vagy válasz nélküli Bridge szerver (port 3003) miatti UI blokkolás.
- **Solution**: Minden hálózati kéréshez kötelező `AbortController`-t és egy fix (pl. 5s) **Timeout** limitet rendelni. Hiba esetén a UI-nak explicit hibaüzenetet kell adnia, nem maradhat "töltés" állapotban.

### C. Adat-integritás (Schema Validation)
- **Problem**: Sérült JSON narratíva vagy blueprint betöltése.
- **Solution**: A `ShadowBridgeService` köteles séma-validációt (JSON schema check) végezni minden beérkező adaton, mielőtt a Store-ba írná azokat.

### D. CSS Izoláció (Strict BEM)
- **Problem**: Stílus-beszivárgás a fő alkalmazásból (not() szelekto elhagyása után).
- **Solution**: Szigorú **BEM** (Block-Element-Modifier) névkonvenció alkalmazása `.dk-shadow-` előtaggal minden Shadow elemhez. Globális Shadow-Reset CSS, ami lenullázza a környezeti stílusokat a tárolón belül.

### E. Teljesítmény Optimalizáció (Partial Rendering)
- **Problem**: Sok komponens feliratkozása miatti lassulás nagy narratívánál.
- **Solution**: A kártya-komponensek csak akkor renderelnek újra, ha a konkrét hozzájuk tartozó ID vagy tartalom megváltozik (`Object.is` check a subscription-ben).

---
**Senior Fejlesztői Megjegyzés**: Ezzel a szerkezettel megszűnik a "tűzoltás" jellegű fejlesztés, és egy karbantartható, stabil rendszert kapunk.
