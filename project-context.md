---
project_name: 'dk_verseny_stories'
user_name: 'Krisztián'
date: '2026-03-24'
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
4.  **Blueprint Editor:** Biztosítani kell a Blueprint (prompt) szerkesztését egy modális ablakban (`BlueprintModal`), majd az "Export" funkciót a vágólapra másoláshoz.
5.  **State Purity:** Minden globális állapot (diák, megjegyzések) a `store.js` Proxy objektumában lakik. Nincs közvetlen DOM módosítás a Store frissítése nélkül.
6. TILOS !important használni a CSS-ben. Ha valami nem működik, akkor a CSS hierarchiát kell javítani. A CSS-ben a !important használata tilos. BEM nevezéktan kell!

### Code Quality & Style Rules

- **Coding Standard:** Follow strict ESLint and Prettier configurations. Avoid `var`; use `const` for immutables and `let` for variables.
- **CSS Naming:** Classes must use **kebab-case** with the `.dkv-` prefix (**BEM style**).
- **Prohibited Patterns:** `console.log` is forbidden in production; use the built-in `GameLogger`.
- **Documentation:** Hungarian JSDoc comments are mandatory for all public methods and modules.
- **Changelog:** Maintain the `CHANGELOG.md` file in Hungarian, following Semantic Versioning (SemVer) principles.

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
