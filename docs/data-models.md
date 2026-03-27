# 📊 Adatmodellek és Állapotkezelés

A projekt reaktív állapotkezelést és fájl alapú perzisztenciát használ.

## 1. Store Állapot (Reactive State)
A `src/services/store.js` fájlban definiált globális állapot a következő kulcsfontosságú mezőket tartalmazza:

| Mező | Típus | Leírás |
| :--- | :--- | :--- |
| `projectTitle` | string | A történet neve. |
| `narrative` | Array | A diák listája (Slide objektumok). |
| `isLoading` | boolean | Adatbetöltés folyamatban. |
| `isGenerating` | boolean | AI generálás folyamatban (UI zárolást vált ki). |
| `isBridgeOnline` | boolean | A Bridge szerver kapcsolat állapota. |
| `needsSync` | boolean | Van-e mentetlen változás a fájlrendszerhez képest. |
| `theme` | string | Aktuális téma: `cyber-fantasy` vagy `literary`. |
| `narrativeConfig` | Object | Darabszámok: `onboardingCount`, `introCount`, stb. |

## 2. Diatömb Struktúra (Narrative)
A `narrative` tömb elemei a következő szerkezetűek:
- `id`: Egyedi azonosító (generált vagy betöltött).
- `title`: A dia címe.
- `content`: A dia narratív szövege.
- `notes`: (Opcionális) Javítási megjegyzés az AI-nak.
- `type`: (Inferred) `hero` vagy `station`.

## 3. Blueprint (Mesterleíró)
Az `src/data/blueprint.json` fájl tartalmazza a generálási szabályrendszert:
- `blueprint`: A 30 diás struktúra Markdown formátumú leírása.
- `prompt`: A felhasználó által megadott alaphelyzet.

## 4. Konfigurációs Szabályok
A `NarrativeEngine` a következő dinamikus eloszlást alkalmazza 30 dia esetén:
- **Onboarding**: Fix 3 dia.
- **Intro**: Fix 4 dia.
- **Állomások**: 5-10 állomás, szekvenciális színekkel a `stationColors` tömbből.
- **Finálé**: Fix 3 dia.
