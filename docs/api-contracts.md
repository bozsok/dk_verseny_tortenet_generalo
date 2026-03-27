# 🔌 API Szerződések (AI Sync Bridge)

Ebba a dokumentumban a frontend és a helyi Bridge szerver közötti kommunikáció van leírva a forráskód mélyelemzése alapján.

## Áttekintés
- **Bázis URL**: `http://localhost:3001` (Alapértelmezett a `server.js`-ben)
- **Típus**: RESTful API (JSON)
- **Biztonság**: `x-sync-token` validáció.

## Végpontok

### 1. Egészségügyi ellenőrzés
- **Útvonal**: `GET /health`
- **Leírás**: Ellenőrzi, hogy a Bridge szerver fut-e.
- **Válasz**: 
  ```json
  { "success": true, "version": "1.11.0" }
  ```

### 2. Blueprint mentése
- **Útvonal**: `POST /save-blueprint`
- **Leírás**: Menti a mesterleírót (`blueprint.json`) a fájlrendszerbe.
- **Törzs**:
  ```json
  {
    "title": "A projekt neve",
    "prompt": "Globális narratív kérés",
    "blueprint": "Markdown tartalom",
    "narrativeConfig": {
      "onboardingCount": 3,
      "introCount": 4,
      "finaleCount": 3,
      "stationCount": 5
    }
  }
  ```

### 3. Iteráció mentése
- **Útvonal**: `POST /save-iteration`
- **Leírás**: Rögzíti egy adott dia javítási utasításait az `iteration.json` fájlba.
- **Törzs**:
  ```json
  {
    "slideId": "string-uuid",
    "note": "A javítás szöveges leírása"
  }
  ```

### 4. Teljes projekt szinkronizáció
- **Útvonal**: `POST /sync-full-project`
- **Leírás**: A memóriában lévő narratívát véglegesíti az `src/data/narrative.js` fájlba.
- **Fejlécek**: 
  - `Content-Type: application/json`
  - `x-sync-token: dk-story-sync-2026`
- **Törzs**:
  ```json
  {
    "title": "A projekt neve",
    "narrative": [
      {
        "id": "uuid",
        "title": "Cím",
        "content": "Narratív szöveg",
        "notes": "Esetleges javítási jegyzet"
      }
    ]
  }
  ```
