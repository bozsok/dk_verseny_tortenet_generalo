# 🌐 Projekt Áttekintés: dk_verseny_stories

Ez a projekt egy interaktív, 30 diás narratív generáló alkalmazás, amely kifejezetten informatika versenyek kerettörténeteinek létrehozására és kezelésére szolgál.

## Célkitűzés
Az alkalmazás célja, hogy egy strukturált (V3-as blueprint alapú) történetet generáljon AI segítségével, amelyet a felhasználó finomhangolhat, kiexportálhat vagy helyi környezetben (Sync Bridge) tárolhat.

## Főbb Jellemzők
- **Dinamikus Narratív Motor**: 30 diás fix struktúra (Onboarding, Intro, Stations, Finale).
- **AI Sync Bridge**: Valós idejű szinkronizáció a helyi fájlrendszerrel.
- **Kettős Vizuális Téma**: 
  - `Cyber-Fantasy`: Neon-türkiz, sötét, futurisztikus megjelenés.
  - `Literary`: Krém-barna, papírhatású, elegáns tipográfia (Lora font).
- **Interaktív Olvasó Mód**: Teljes képernyős dia-nézet és mini-térkép alapú navigáció.

## Technológiai Összegzés
| Kategória | Technológia |
| :--- | :--- |
| **Frontend** | Vanilla Javascript (ES Modules) |
| **Build Tool** | Vite ^8.0.2 |
| **Backend** | Express ^4.21.2 (Sync Bridge) |
| **Stílus** | CSS3 (BEM, CSS Variables) |
| **Állapot** | Reaktív Proxy Store |

## Kapcsolódó Dokumentációk
- [Fejlesztői Útmutató](./development-guide.md)
- [Forrásfa Elemzés](./source-tree-analysis.md)
- [API Szerződések](./api-contracts.md)
- [Adatmodellek](./data-models.md)
- [Komponens Leltár](./component-inventory.md)
