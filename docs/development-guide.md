# 🛠️ Fejlesztői Útmutató

Ez a dokumentum segít a fejlesztői környezet kialakításában és a projekt futtatásában.

## Előfeltételek
- **Node.js**: v18 vagy újabb ajánlott.
- **npm**: v9 vagy újabb.

## Telepítés
1. Klónozd a tárolót.
2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

## Futtatás
A projekt két különálló folyamat együttes futtatását igényli a teljes funkcionalitáshoz:

### 1. Frontend (Vite)
Indítsd el a fejlesztői szervert:
```bash
npm run dev
```
Alapértelmezett port: `http://localhost:3000` (vagy ahogy a Vite jelzi).

### 2. AI Sync Bridge (Local Server)
A mentési és generálási funkciókhoz külön terminálban indítsd el a hidat:
```bash
npm run bridge
```
Ez a szerver a `http://localhost:3001` porton figyel.

## Fejlesztési Irányelvek
- **Nyelv**: Javascript (ES Modules).
- **Stílus**: Vanilla CSS, sorszámozott és BEM alapú osztálynevezés (`dkv-` prefix).
- **Állapotkezelés**: Ne módosítsd közvetlenül a DOM-ot, ha lehetséges; használd a `store.js` állapotváltozásait és az `EventBus.js` eseményeket.
- **Helyesírás**: Szigorú MTA 12. kiadás szerinti magyar helyesírás a felhasználói felületen.

## Építés és Exportálás
A produkciós csomag előállítása:
```bash
npm run build
```
A kimenet a `dist/` mappába kerül.
