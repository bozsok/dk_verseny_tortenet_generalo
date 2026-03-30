# 🌌 Digital Kingdom (DK) – versenynarratíva-generátor

> **STATUS**: STABLE / CORRUPTION LEVEL: 12%
> **PROTOCOL**: CYBER-FANTASY v1.19.0

Üdvözöllek, Programozó! Beléptél a **Digital Kingdom** szívébe, ahol a kódsorok és a narratívák határai elmosódnak. Ez az alkalmazás nem csupán egy generátor; ez egy interfész a digitális univerzum töredékeihez.

## 🔮 A narratíva

A rendszer célja, hogy segítse a versenyzőket a történetalkotásban és a prezentációban. Világa egy sötét, neonfényekkel átitatott digitális birodalom, ahol a technológia és a mágia (vagy valami ahhoz hasonló) kéz a kézben jár. Ha a rendszer hibát észlel, a **CorruptionUI** (glitch-hatások és vörös neon) emlékeztet a digitális világ törékenységére.

## 🛠️ Technikai architektúra

Az interfész modern, letisztult és a végletekig optimalizált:
- **Core**: Vanilla JavaScript (ES2024+), proxyalapú reaktív storerendszerrel.
- **Tooling**: Vite 8 (ultragyors fejlesztési környezet).
- **Design**: Szigorú BEM-módszertan, glassmorphism (üveghatású megjelenés) és GPU-gyorsított animációk.
- **Sync**: AI Bridge-szerverek a blueprint-adatok és a narratívák perzisztens tárolásához.

## 🚀 Telepítés és indítás

Készítsd fel a munkaállomásodat az alábbi parancsokkal:

1.  **A függőségek letöltése**:
    ```bash
    npm install
    ```

2.  **A fejlesztői szinkronhíd indítása** (külön terminálokban - Main és Shadow):
    ```bash
    npm run bridge
    npm run bridge:shadow
    ```

3.  **A tartalommegjelenítő aktiválása**:
    ```bash
    npm run dev
    ```

## 📜 Főbb funkciók

- **Árnyékrendszer (Shadow System)**: Teljesen izolált, párhuzamos narratíva-univerzum a biztonságos teszteléshez és az okos iterációs promptok generálásához (mély háttérszinkronizációval).
- **Mesterleíró-kezelés**: Komplex történeti alapok (blueprint) szerkesztése valós idejű szerveroldali mentéssel.
- **Szekvenciális kártyamegjelenítés**: Fluid, animált kártyarendszer esztétikus, témaváltós (Cyber-Fantasy / Literary) felülettel.
- **Többformátumú export**: Történetek kinyerése és visszatöltése pontos `.md`- és `.txt`-fájlok formájában.

## 📖 Dokumentáció

A projekt részletes technikai dokumentációja elérhető a `docs/` mappában:
- **[Kezdőoldal (index)](./docs/index.md)**: A dokumentációs bázis központja.
- **[Architektúra](./docs/architecture.md)**: Tervezési minták és belső működés.
- **[Fejlesztői útmutató](./docs/development-guide.md)**: Környezet beállítása és üzemeltetés.

## 🖋️ Szerzők és verzió

- **Fejlesztő**: Antigravity AI és a Felhasználó
- **Évad**: 2026 tavasza

---
*„A kód az út, a történet a cél.”*
