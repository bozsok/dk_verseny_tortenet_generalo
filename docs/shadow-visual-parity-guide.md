# Árnyékrendszer vizuális paritás – Végrehajtási útmutató

> **Verzió:** 1.4 (Bővített változat - TILOS TÖRÖLNI BELŐLE)  
> **Dátum:** 2026-03-29  
> **Cél:** Az árnyékrendszer (`src/shadow/`) vizuális kinézetének azonossá tétele a rendes rendszerrel (`src/`), miközben az árnyékrendszer moduláris architektúrája érintetlen marad.

---

## 1. Ipari javaslatok és stratégiák

### 1.1. Hogyan csinálják a nagyok?

A nagy szoftvercsapatok (Google, Stripe, Vercel, Airbnb) a következő bevált módszereket alkalmazzák, amikor egy meglévő felületet kell vizuálisan egy referencia-rendszerhez igazítani:

#### A) Dizzájn-token kivonat (Design Token Extraction)
**Mi ez?** A referencia-rendszer (fő rendszer) összes vizuális értékét (színek, méretek, betűtípusok, árnyékok, animációk) egy „dizzájn-token" dokumentumba gyűjtik ki. Ez lesz a „forrás az igazsághoz" (Single Source of Truth).

**Előny:** Nem kell újra és újra a kódot vizsgálni – van egy referenciadokumentum, amiből bármikor dolgozhatunk.

**Javaslat a mi projektünkhöz:**  
A fő rendszer CSS-éből (`variables.css`, `components.css`) kivonatoljuk az összes releváns értéket egy dedikált referencia-fájlba. Ezt a fázisok vizsgálati lépésénél (Lépés 1–2) készítjük.

#### B) Vizuális regressziós teszt (Visual Regression Testing)
**Mi ez?** Automatizált eszközök (BackstopJS, Percy, Chromatic) képernyőképeket készítenek a referencia-rendszerről és az átalakítandó rendszerről, majd pixel-szinten összehasonlítják őket.

**Előny:** Objektív, nem szubjektív az összehasonlítás.

**Javaslat a mi projektünkhöz:**  
Mivel ez egy kisebb projekt, kézi képernyőkép-összehasonlítást alkalmazunk minden fázis végén (Lépés 6). Ha szükséges, BackstopJS-t is bevezethetnénk.

#### C) Komponent-szintű migráció (Component-Level Migration)
**Mi ez?** Nem az egész rendszert egyszerre változtatjuk meg, hanem **egyetlen komponenst** választunk ki, azt tökéletessé tesszük, majd továbblépünk a következőre.

**Előny:** Minden változtatás kicsi, ellenőrizhető, visszavonható.

**Javaslat a mi projektünkhöz:**  
Pontosan ezt csináljuk az 5 fázissal. Minden fázisnál egy-egy területet viselünk pontossá.

#### D) Feature Flag / A-B összehasonlítás
**Mi ez?** A két verziót egymás mellett futtatják, azonos adatokkal, és összehasonlítják.

**Előny:** Valós időben láthatjuk a különbségeket.

**Javaslat a mi projektünkhöz:**  
**Ez már meg van!** Az „Árnyék-rendszer aktiválása" checkbox pontosan ezt teszi. Böngészőben egyetlen kattintással válthatunk a két rendszer között.

#### E) Több beszélgetéses munkafolyamat
**Mi ez?** A nagy átalakításokat nem egyetlen ülésben végzik el, hanem sprint-ekben, minden sprint végén stabilizálva az eredményt.

**Javaslat a mi projektünkhöz:**  
Ez az útmutató úgy van felépítve, hogy **bármelyik fázisnál meg lehet állni**, és egy új beszélgetésben folytatni. A státusz-táblázat és a checklisták mindig mutatják, hol tartunk.

### 1.2. Kiegészítő Stratégia: B opció (Teljes Függetlenség)
**Kritikus technikai irányelv:** Mivel az Árnyék-rendszer célja a régi monolit rendszer későbbi teljes leváltása, biztosítani kell, hogy a shadow kód ne függjön semmilyen régi stílustól.
- Minden vizuális elemet (modálisok, gombok, scrollbar) újraalkotunk a shadow rendszerben.
- A régi rendszer megszűnése után az Árnyék-rendszernek önállóan, 100%-ban működőképesnek kell maradnia.

---

## 2. Globális szabályok

1. **A fő rendszer CSS-értékeit NEM hivatkozzuk** – ehelyett **lemásoljuk** az árnyékrendszer saját CSS-ébe
2. **Tilos `!important`** használata (project-context.md, 9. szabály)
3. **BEM nevezéktan** a `.dkv-shadow-` prefixszel
4. **Minden fázis végén** vizuális ellenőrzés a böngészőben
5. **Ha bármelyik fázisnál megállunk**, frissítjük a státusz-táblázatot ebben a dokumentumban
6. **Specificitási szabály (Reset Guard)**: A globális stílusok (pl. body, h1, *) felülírásához minden shadow szabályt a `.dkv-shadow-universe` szelekton alá kell rendelni (pl. `.dkv-shadow-universe .dkv-shadow-layout { ... }`).
7. **Nincs Öröklődés**: Még a globális elemek (pl. egyedi scrollbar) is saját shadow-szabályokat kapnak, nem örökölhetik a fő rendszerből.
8. **Rollback stratégia**: Minden fázis végrehajtása (Lépés 5) előtt kötelező egy git commit a biztonság kedvéért.
9. **TILOS AZ ÖNKÉNYES TOVÁBBLÉPÉS**: Minden fázis vizuális ellenőrzése és lezárása (Lépés 6) után meg kell állni. **SZIGORÚAN TILOS** a következő fázisba kezdeni a felhasználó kifejezett, egyeztetést követő jóváhagyása nélkül.
10. **A STÁTUSZ-TÁBLÁZATOT AZ AI NEM ZÁRHATJA LE**: Az AI számára szigorúan **TILOS** bármely fázis állapotát „✅ Kész”-re állítani. Ezt a módosítást kizárólag a **FELHASZNÁLÓ** végezheti el a vizuális ellenőrzést követően.

---

## 3. Változó-leképezési táblázat (Design Tokens)

| Fő rendszer változó (Referencia) | → | Árnyékrendszer változó (Új) | Megjegyzés |
| :--- | :---: | :--- | :--- |
| `--bg-deep` | → | `--shadow-bg-deep` | Alap háttérszín |
| `--bg-card` | → | `--shadow-bg-panel` | Panel és kártya háttér |
| `--neon-cyan` | → | `--shadow-neon-cyan` | Elsődleges neon szín |
| `--text-white` | → | `--shadow-text-main` | Fő szövegszín |
| `--font-main` | → | `--shadow-font-main` | Szöveg betűtípus |
| `--glass-border` | → | `--shadow-border-alpha` | Keretek átlátszósága |

---

## 4. Státusz-táblázat

> **Utasítás az AI-nek:** Minden fázis befejezésekor frissítsd ezt a táblázatot!

| # | Fázis | Terület | Státusz | Utolsó módosítás |
|---|---|---|---|---|
| 1 | Csontváz | Layout grid, padding, gap, scrollbar | ✅ Kész | 2026-03-29 |
| 2 | Sidebar | Fejléc, inputok, gombok, navigáció | ✅ Kész | 2026-03-29 |
| 3 | Preview | Kártyák, zóna-kártyák, animációk | ✅ Kész | 2026-03-30 |
| 4 | Globális | Témaváltó, bridge jelző, fejléc | ✅ Kész | 2026.03.30 |
| 5 | Funkciók | Ceruza, olvasó mód, sidebar toggle, bridge jelző, AI-generálás indítása gomb, Történet betöltése gomb, Blueprint gomb, .md és .txt gombok | ✅ Kész | 2026.03.30 |

**Jelölések:**  
⬜ Nem kezdődött | 🔍 Vizsgálat alatt | 📊 Összevetés kész | 📝 Terv kész | 🔧 Végrehajtás alatt | ✅ Kész

---

## 5. Egységes módszertan – A 6 lépés

> **Minden fázisra (1–5) ugyanez a módszer érvényes.**

### Lépés 1 – Vizsgálat: Fő rendszer

**Tevékenységek:**
- [ ] A fő rendszer releváns CSS-fájljainak beolvasása (`variables.css`, `components.css`)
- [ ] Az érintett komponens(ek) HTML-struktúrájának feltérképezése (`main.js`, `SetupPanel.js`, `NarrativeCard.js`, stb.)
- [ ] Böngészős vizsgálat: DevTools-ban az érintett elemek stílusainak ellenőrzése
- [ ] **Referencia-dokumentum készítése:** Az összes releváns CSS-tulajdonság kivonatolt listája (kulcs-érték párok)

**Eredmény:** Referencia-lista az adott terület CSS-beállításairól és HTML-struktúrájáról.

### Lépés 2 – Vizsgálat: Árnyékrendszer

**Tevékenységek:**
- [ ] Az árnyékrendszer releváns CSS-fájljainak beolvasása (`shadow.css`)
- [ ] Az érintett komponens(ek) HTML-struktúrájának feltérképezése (`SetupShadow.js`, `NarrativeCardShadow.js`, stb.)
- [ ] Böngészős vizsgálat: DevTools-ban az érintett elemek stílusainak ellenőrzése
- [ ] **Jelenlegi-állapot dokumentálása:** Az összes releváns CSS-tulajdonság kivonatolt listája

**Eredmény:** Jelenlegi-állapot lista az adott terület CSS-beállításairól és HTML-struktúrájáról.

### Lépés 3 – Összevetés

**Tevékenységek:**
- [ ] A két lista (Lépés 1 + Lépés 2) egymás mellé helyezése
- [ ] **Különbségi lista készítése:** Melyik tulajdonság tér el, hogyan
- [ ] Kategorizálás:
  - 🔴 **Kritikus** – vizuálisan azonnal szembetűnő különbség
  - 🟡 **Közepes** – finomabb eltérés (spacing, shadow, transition)
  - 🟢 **Alacsony** – kosmetikai, nem zavaró
- [ ] **HTML-struktúra különbségek** dokumentálása (ha a CSS-en kívül a HTML is eltér)

**Eredmény:** Összehasonlító táblázat vagy lista a különbségekről, priorizálva.

### Lépés 4 – Megbeszélés és terv

**Tevékenységek:**
- [ ] A különbségi lista bemutatása a felhasználónak
- [ ] Felhasználói döntés: melyik különbségeket kezeljük, melyeket hagyjuk (ha van ilyen)
- [ ] **Részletes végrehajtási terv** készítése:
  - Melyik fájlt módosítjuk
  - Milyen CSS-osztályokat adunk hozzá/módosítunk
  - Milyen HTML-változtatások kellenek
  - Milyen sorrendben (függőségek figyelembevétele)
- [ ] Felhasználói jóváhagyás

**Eredmény:** Jóváhagyott végrehajtási terv.

### Lépés 5 – Végrehajtás

**Tevékenységek:**
- [ ] CSS-módosítások végrehajtása (`shadow.css`)
- [ ] Komponens HTML-módosítások végrehajtása (`.js` fájlok)
- [ ] Szintaktikai ellenőrzés (a Vite dev server nem dob-e hibát)
- [ ] Minden módosítás utáni gyors mentés

**Eredmény:** Módosított fájlok.

### Lépés 6 – Ellenőrzés (Definition of Done)

**Tevékenységek:**
- [ ] Böngészős vizuális ellenőrzés:
  - (a) Rendes rendszer megnyitása → képernyőkép
  - (b) Árnyékrendszer megnyitása → képernyőkép
  - (c) Összehasonlítás: az adott terület vizuálisan egyezik-e
- [ ] **DOD Ellenőrzés**:
  - [ ] Zéró függőség a régi dkv- osztályokra
  - [ ] Minden animáció és scrollbar saját shadow-implementációban működik
- [ ] Mindkét témában tesztelés (cyber-fantasy + literary)
- [ ] A státusz-táblázat frissítése ebben a dokumentumban
- [ ] Ha szükséges: visszalépés és javítás

**Eredmény:** Vizuálisan ellenőrzött, stabil állapot.

---

## 5. Fázisok részletes tartalma

### 1. fázis – Csontváz (Layout skeleton)

**Vizsgálandó terület a fő rendszerben:**
- `.dkv-main-layout` – grid, padding, gap, max-width
- `.dkv-main-layout--collapsed` – szűkített sidebar
- `.dkv-sidebar` – border-radius, border, box-shadow, width
- `.dkv-preview-container` – padding, overflow
- **Kiegészítés:** Egyedi neon scrollbar stílusok átvétele.

**Vizsgálandó terület az árnyékrendszerben:**
- `.dkv-shadow-layout` – grid, méretezés
- `.dkv-shadow-layout--collapsed` – szűkített sidebar
- `.dkv-shadow-sidebar` – border, szélesség
- `.dkv-shadow-preview-wrapper` – padding, overflow

**Érintett fájlok:**
- CSS: `src/shadow/css/shadow.css`
- JS: `src/shadow/components/RootShadow.js`

---

### 2. fázis – Sidebar kinézete

**Vizsgálandó terület a fő rendszerben:**
- `.dkv-sidebar__header` – gradient, magasság, szín, tipográfia
- `.dkv-sidebar__toggle` – pozíció, méret, hover
- `.dkv-sidebar__body` – padding, flex, min-width
- `.dkv-sidebar__actions` – gap, elrendezés
- `.dkv-sidebar__secondary-actions` – grid, gap
- `.dkv-sidebar__nav` – padding, gap, minimap
- `.dkv-btn` variánsok – primary, secondary, accent
- `.dkv-input-block`, `.dkv-input`, `.dkv-textarea` – stílusok
- Összecsukott állapot összessége

**Vizsgálandó terület az árnyékrendszerben:**
- `.dkv-shadow-sidebar__header` és belső elemek
- `.dkv-shadow-sidebar__toggle`, `.dkv-shadow-sidebar__body`
- `.dkv-shadow-btn` variánsok
- `.dkv-shadow-input`, `.dkv-shadow-textarea`
- `.dkv-shadow-sidebar__icons` – összecsukott ikonsor

**Érintett fájlok:**
- CSS: `src/shadow/css/shadow.css`
- JS: `src/shadow/components/SetupShadow.js`, `ExportActions.js`, `ShadowSidebar.js`

---

### 3. fázis – Preview rész kinézete

**Vizsgálandó terület a fő rendszerben:**
- `.dkv-preview-container`, `.dkv-preview-header`
- `.dkv-hero-card` – teljes stíluskészlet (border-radius, shadow, padding, hover)
- `.dkv-small-card` – teljes stíluskészlet
- `.dkv-zone-card` – border-left, ikon, info, gradient háttér
- `.dkv-zone-icon`, `.dkv-zone-tag`, `.dkv-zone-title`
- `.dkv-cards-grid` – grid beállítások
- `.dkv-card-number` – számozás badge
- `.dkv-edit-icon-btn` – ceruza ikon gomb
- `.dkv-card--animated` – slide-in animáció, hover
- `#slides-title` – projekt cím stílus
- `.dkv-section-block` – szekció konténer
- Literary téma felülírások
- **Kiegészítés:** Animációk (`dkv-slide-in-up`, `dkvPulseRing`, `dkv-pulse-cyan`).

**Vizsgálandó terület az árnyékrendszerben:**
- `.dkv-shadow-card`, `.dkv-shadow-card--hero`, `.dkv-shadow-card--small`
- `.dkv-shadow-zone-card`, `.dkv-shadow-zone-icon`
- `.dkv-shadow-cards-grid`
- `.dkv-shadow-card-number`
- `.dkv-shadow-edit-btn`
- `.dkv-shadow-card--animated`
- `.dkv-shadow-neon-text`

**Érintett fájlok:**
- CSS: `src/shadow/css/shadow.css`
- JS: `NarrativeCardShadow.js`, `NarrativeGridShadow.js`, `PreviewShadow.js`

---

### 4. fázis – Globális elemek

**Vizsgálandó terület a fő rendszerben:**
- `.dkv-global-status-container` – fixed jobb felső sarok
- `.dkv-theme-toggle` – kör alakú gomb, Material Symbols ikon
- `.dkv-bridge-status` – színes kör (online/offline/unknown)
- `.dkv-bridge-status__tooltip` – tooltip pozíció, stílus
- `ThemeToggle()` – HTML struktúra
- Bridge polling és állapotkezelés

**Vizsgálandó terület az árnyékrendszerben:**
- `.dkv-shadow-header` – jelenlegi header implementáció
- `.dkv-shadow-bridge-indicator` – pont stílus
- `ShadowHeader.js` – HTML struktúra
- Bridge állapotkezelés

**Érintett fájlok:**
- CSS: `src/shadow/css/shadow.css`
- JS: `ShadowHeader.js`, `RootShadow.js`

---

### 5. fázis – Funkciók bekötése

**Vizsgálandó terület a fő rendszerben:**
- Ceruza ikon kattintás → `store.editingSlideId` → `IterationModal`
- Kártya kattintás → `store.viewingSlideId` → `SlideDetailModal` (olvasó mód)
- Sidebar toggle → 3 fázisú szekvenciális animáció transzlációval.  
  *Megjegyzés: Ez a komplex animáció az 5. fázisban kerül finomhangolásra, addig sima CSS transition biztosítja a működést.*
- Bridge frissítés kattintás → `refreshBridgeStatus()`
- Téma váltás → `themeManager.toggleTheme()`
- Modal bezárás → fade-out animáció (600ms delay)
- Scroll-top gomb
- Generálás gomb → Bridge API hívás
- Blueprint gomb → Blueprint modális
- Export gombok → fájl letöltés
- Szinkronizáció gomb → Bridge API
- Történet betöltése gomb → fájl importálás

**Vizsgálandó terület az árnyékrendszerben:**
- Kártya kattintás (van, de `.dkv-shadow-card` alapú)
- Ceruza → nem működik (edit gomb, de nem `.dkv-edit-icon-btn`)
- Sidebar toggle → van, de nem 3 fázisú
- Modal bezárás logika → van, de `dkv-shadow-hidden` alapú
- Többi gomb → EventBus-on keresztül

**Érintett fájlok:**
- JS: `RootShadow.js`, modális komponensek

---

## 6. Több beszélgetéses munkafolyamat

### Ha új beszélgetésben folytatjuk:

1. **Mondd az AI-nek:** „Vizsgáld meg a `docs/shadow-visual-parity-guide.md` fájlt és folytasd a munkát a következő fázisnál."
2. Az AI elolvassa ezt a dokumentumot, megnézi a státusz-táblázatot, és a megfelelő fázisnál folytatja.

### Ajánlott tempó:
- **1 beszélgetés = 1–2 fázis** (a komplexitástól függően)
- A 3. fázis (Preview/kártyák) a legösszetettebb, az önmagában 1 teljes beszélgetést igényelhet
- Az 5. fázis (Funkciók) szintén nagyobb, de sok már működik

---

## 7. Kockázatok és tippek

| Kockázat | Kezelés |
|---|---|
| A CSS-másolás során ütközés a fő rendszer stílusaival | A `.dkv-shadow-` prefix biztosítja az izolációt |
| Egy módosítás elrontja a másik fázis eredményét | Fázisonként vizuális ellenőrzés |
| A literary téma eltérően viselkedik | Mindkét témában tesztelünk |
| Túl sok módosítás egyszerre | Inkrementális megközelítés |
| Több beszélgetés közötti információvesztés | Ez a dokumentum tartja a státuszt |

---

## 8. Fájl-referencia

| Fájl | Rendszer | Típus |
|---|---|---|
| `src/styles/variables.css` | Fő | CSS (változók + layout + kártyák + modálisok) |
| `src/styles/components.css` | Fő | CSS (animációk + bridge + sync + olvasó mód) |
| `src/shadow/css/shadow.css` | Árnyék | CSS (összes árnyék stílus) |
| `src/main.js` | Fő | Layout HTML + eseménykezelés |
| `src/shadow/main.js` | Árnyék | Belépési pont |
| `src/shadow/components/RootShadow.js` | Árnyék | Gyökér komponens |
| `src/shadow/components/ShadowSidebar.js` | Árnyék | Oldalsáv konténer |
| `src/shadow/components/ShadowHeader.js` | Árnyék | Fejléc |
| `src/shadow/components/SetupShadow.js` | Árnyék | Setup panel |
| `src/shadow/components/ExportActions.js` | Árnyék | Export gombok |
| `src/shadow/components/PreviewShadow.js` | Árnyék | Preview konténer |
| `src/shadow/components/NarrativeCardShadow.js` | Árnyék | Kártya |
| `src/shadow/components/NarrativeGridShadow.js` | Árnyék | Kártya-rács + zóna-kártyák |
| `src/components/SetupPanel.js` | Fő | Setup panel (referencia) |
| `src/components/NarrativeCard.js` | Fő | Kártya (referencia) |
| `src/components/ThemeToggle.js` | Fő | Témaváltó (referencia) |
| `src/components/SlideDetailModal.js` | Fő | Olvasó mód modális (referencia) |
