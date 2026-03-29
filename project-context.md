---
project_name: 'dk_verseny_stories'
user_name: 'Krisztián'
date: '2026-03-27'
version: '1.16.0'
sections_completed: ['technology_stack', 'critical_rules']
existing_patterns_found: 5
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Build Tool:** Vite 8.0 (Rolldown-based)
- **Language:** Vanilla JavaScript (ES2024+)
- **Styling:** CSS3 (Custom Properties, Glassmorphism, Neon Glow)
- **State Management:** Reactive Proxy-based Store (Custom)
- **Environment:** Local-First (No API Keys used in client)

## Critical Implementation Rules

1.  **AI-Injected Data Flow:** A tartalom (narratív adatok) a `src/data/narrative.js` fájlból érkezik, amelyet az AI-asszisztens generál. A webapp SOHA nem hív közvetlenül AI API-t.
2.  **Naming Strategy:**
    - **Komponensek:** PascalCase (pl. `NarrativeCard.js`).
    - **Logika/Fájlok:** kebab-case (pl. `blueprint-manager.js`).
    - **CSS osztályok:** kebab-case (pl. `.neon-button`).
3.  **Visual Language:** Szigorú "Cyber-Fantasy / TRON Legacy" esztétika. Sötét háttér, neon cián/lila fények, 15px körüli blur effektek a paneleken.
4.  **Naming Convention (Narrative Slides):** A diák (slides) címei NE tartalmazzák a szekció vagy állomás nevét (pl. KERÜLD: "1. állomás - [Cím]", "Intró - [Cím]"). Csak az egyedi, leíró címet használd (pl. "Az Algoritmusok Erdeje"). A kontextust a rendszer szekciófejlécei (Zone Cards) automatikusan biztosítják.
5.  **Blueprint Editor:** Biztosítani kell a Blueprint (prompt) szerkesztését egy modális ablakban (`BlueprintModal`), majd az "Export" funkciót a vágólapra másoláshoz.
6.  **State Purity:** Minden globális állapot (diák, megjegyzések) a `store.js` Proxy objektumában lakik. Nincs közvetlen DOM módosítás a Store frissítése nélkül.
7.  **Testing & Fidelity (V1.19.0):** MINDEN új funkcióhoz kötelező a Vitest unit teszt. A legfontosabb kritérium: az `update()` során az `activeElement` fókusz nem mozdulhat el.
8.  **Disposal Management:** Minden aszinkron folyamatot (polling, timer) a `DisposalService`-nél kell regisztrálni, és a komponens `destroy()` metódusa köteles leállítani őket.
9. TILOS !important használni a CSS-ben. Ha valami nem működik, akkor a CSS hierarchiát kell javítani. BEM nevezéktan kell!
10. **Kutatási Kötelezettség**: Tilos a tapasztalatok alapján vagy találgatással gyors választ adni a felhasználónak. Minden technikai következtetést körültekintő utánajárással, az idevonatkozó fájltartalmak (kód, CSS, konfigurációk) beolvasásával és szükség esetén a felhasználó megkérdezésével kell alátámasztani.

### Code Quality & Style Rules

- **Coding Standard:** Follow strict ESLint and Prettier configurations. Avoid `var`; use `const` for immutables and `let` for variables.
- **CSS Naming:** Classes must use **kebab-case** with the `.dkv-` prefix (**BEM style**).
- **Prohibited Patterns:** `console.log` is forbidden in production; use the built-in `GameLogger`.
- **MTA 12. kiadás szigorú betartása**: Kötelező a magyar helyesírási szabályzat legújabb kiadásának követése minden felhasználói feliratnál, kommentnél és dokumentációnál.
    - **Idegen és mozaikszós összetételek**: Kötőjellel kapcsoljuk az idegen szavakat és mozaikszókat (pl. `AI-generálás`, `UI-skálázás`, `Google Fonts-link`, `flexbox-hierarchia`).
    - **Gyakori szakkifejezések**: `ergonomikus` (rövid 'o', NEM ergonómikus), `interakció`, `szinkronizáció`, `iteráció`.
    - **Címek és feliratok**: Magyarul a címekben és fejlécekben csak a legelső szót és a tulajdonneveket kezdjük nagybetűvel (pl. `Navigációs térkép`, `Prémium tipográfia`, `A dia finomhangolása`).
    - **Ragozás**: A mozaikszók utáni ragokat kötőjellel kapcsoljuk (pl. `AI-nak`, `AI-val`, `UI-hoz`).
    - **Központozás**: Mindig ügyelj a tagmondatok közötti vesszőkre (pl. `Kérjük, várjon!`).
    - **Idézőjelek**: Magyar szövegben a „alsó nyitó” és „felső záró” idézőjeleket használjuk.
- **Documentation:** Hungarian JSDoc comments are mandatory for all public methods and modules.
- **Changelog:** Maintain the `CHANGELOG.md` file in Hungarian, following Semantic Versioning (SemVer) principles and MTA 12. spelling.

### Framework-Specific Rules (Vanilla JS & SEL)

- **SEL Architecture:** All state changes must go through the **custom `StateManager`**, triggering events on the `EventBus`. Components must NEVER modify each other's style or state directly; always communicate via the Bus.
- **Vanilla Component Class Pattern:** Components MUST be Classes inheriting from `BaseComponent`.
    - **Lifecycle Hooks**: `render()` (build structure), `mount(container)` (events & insertion), `destroy()` (cleanup).
    - **Targeted Updates**: Use `update(property, value)` for incremental DOM changes. NEVER use full `innerHTML` re-renders in persistent components.
    - **Fidality Policy**: If an input is focused, `update()` must NOT replace its DOM node, only its value.
- **Lifecycle Management:** Every custom component MUST call its `destroy()` method to clean up DOM elements, event listeners, and timeouts via `registerCleanup(fn)`.

### Critical Don't-Miss Rules

- **Memory Leaks & Disposal:**
    - NEVER use `setInterval`, `setTimeout`, or `addEventListener` on `window/document` without explicit cleanup in the `destroy()` method.
    - **GPU Disposal:** Every Three.js resource (`geometries`, `materials`, `textures`) MUST be explicitly `.dispose()`-ed in the `destroy()` method to prevent GPU memory bloat.
- **State & Timer Integrity:**
    - **Persistence Policy:** Use the **StateManager** for all game-related and user-progress data.
    - **LocalStorage Bypasses:** Direct `localStorage` access is permitted **ONLY** for system-level flags (e.g., GDPR consent, Master/Debug mode) where the StateManager is not yet initialized or contextually inappropriate.
    - **No direct write:** Never write directly to `localStorage` for game progress; use `SecureStorage` (via StateManager).
    - **Timer Policy:** Only the `TimeManager` is allowed to modify the global competition clock. Components should only read the time via the `EventBus` or `StateManager`.
- **Portal & Navigation Safety:**
    - **Navigation Lock:** All navigation buttons MUST be disabled and `EventBus` navigation events ignored while a `PortalTransition` or Slide transition is in progress.
- **Audio Policies:** Respect browser autoplay policies; initialize Web Audio context only after the first user interaction.
- **Asset Loading:** Use asynchronous loading for all large assets (videos, 3D models) with appropriate UI feedback (**Loader/Progress UI**).
- **Security:** Use `SecureStorage` for all sensitive user data.
- **Performance:** Optimize rendering loop; avoid constant 60 FPS updates for static scenes.

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.
