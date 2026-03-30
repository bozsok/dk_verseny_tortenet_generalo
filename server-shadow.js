import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003; // ELKÜLÖNÍTETT PORT

app.use(cors());
app.use(bodyParser.json());

// SHADOW DATA PATH - OUTSIDE SRC TO AVOID VITE REFRESH
const SHADOW_DIR = path.join(__dirname, 'shadow_data');
const OLD_SHADOW_DIR = path.join(__dirname, 'src', 'shadow', 'data');

if (!fs.existsSync(SHADOW_DIR)) {
  fs.mkdirSync(SHADOW_DIR, { recursive: true });
  console.info(`[SHADOW-BRIDGE] 🌑 Shadow Data mappa létrehozva: ${SHADOW_DIR}`);
  
  // Automatikus migráció a régi helyről, ha létezik
  if (fs.existsSync(OLD_SHADOW_DIR)) {
    const files = fs.readdirSync(OLD_SHADOW_DIR);
    files.forEach(file => {
      const oldPath = path.join(OLD_SHADOW_DIR, file);
      const newPath = path.join(SHADOW_DIR, file);
      if (fs.lstatSync(oldPath).isFile()) {
        fs.copyFileSync(oldPath, newPath);
        console.info(`[SHADOW-BRIDGE] 📦 Migrálva: ${file}`);
        
        // SPECIÁLIS: Ha .js narratívát találunk, csináljunk belőle .json-t is a kliensnek
        if (file === 'narrative.js') {
          try {
            const content = fs.readFileSync(oldPath, 'utf8');
            // Robusztusabb regex: keresünk mindent az 'export const narrative =' és a ';' vagy fájlvége között
            const match = content.match(/(?:export\s+)?const\s+narrative\s*=\s*(\[[\s\S]*?\])\s*;/);
            if (match) {
              const jsonContent = match[1];
              fs.writeFileSync(path.join(SHADOW_DIR, 'narrative.json'), jsonContent);
              console.info(`[SHADOW-BRIDGE] ✨ Narratíva sikeresen konvertálva JSON formátumba.`);
            } else {
              // Ha nem sikerült a regex, próbáljunk egy egyszerűbb, de veszélyesebb vágást
              const startIdx = content.indexOf('[');
              const endIdx = content.lastIndexOf(']');
              if (startIdx !== -1 && endIdx !== -1) {
                const rawJson = content.substring(startIdx, endIdx + 1);
                fs.writeFileSync(path.join(SHADOW_DIR, 'narrative.json'), rawJson);
                console.info(`[SHADOW-BRIDGE] ✨ Narratíva konvertálva kényszerített vágással.`);
              }
            }
          } catch (e) {
            console.warn(`[SHADOW-BRIDGE] ⚠️ Nem sikerült a narratíva konverzió: ${e.message}`);
          }
        }
      }
    });
  }
}

app.get('/health', (req, res) => {
  res.json({ success: true, version: '1.0.0-shadow', system: 'SHADOW-UNIVERSE' });
});

app.get('/get-project-data', (req, res) => {
  try {
    const filePath = path.join(SHADOW_DIR, 'blueprint.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ success: false, error: 'Shadow blueprint not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-blueprint', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(SHADOW_DIR, 'blueprint.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info(`[SHADOW-BRIDGE] 🌑 Shadow Blueprint mentve: ${data.title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/get-master-blueprint', (req, res) => {
  try {
    const filePath = path.join(SHADOW_DIR, 'blueprint-master.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ success: false, error: 'Shadow master blueprint not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-master-blueprint', (req, res) => {
  try {
    const { version, blueprint } = req.body;
    const filePath = path.join(SHADOW_DIR, 'blueprint-master.json');
    const data = { version: version || 'V4', blueprint, lastModified: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info(`[SHADOW-BRIDGE] 📜 Shadow Mesterleíró mentve (${version || 'V4'})`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/get-narrative', (req, res) => {
  try {
    const filePath = path.join(SHADOW_DIR, 'narrative.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json({ success: true, narrative: data });
    } else {
      res.json({ success: true, narrative: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/sync-full-project', (req, res) => {
  try {
    const { title, narrative } = req.body;
    const blueprintPath = path.join(SHADOW_DIR, 'blueprint.json');
    const narrativePath = path.join(SHADOW_DIR, 'narrative.js');

    // 1. Blueprint frissítése
    let blueprintData = {};
    if (fs.existsSync(blueprintPath)) {
      blueprintData = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    }
    blueprintData.title = title || blueprintData.title;
    fs.writeFileSync(blueprintPath, JSON.stringify(blueprintData, null, 2));

    // 2. Narratíva mentése (JSON és JS)
    const jsonPath = path.join(SHADOW_DIR, 'narrative.json');
    const jsPath = path.join(SHADOW_DIR, 'narrative.js');
    
    fs.writeFileSync(jsonPath, JSON.stringify(narrative, null, 2));
    fs.writeFileSync(jsPath, `export const narrative = ${JSON.stringify(narrative, null, 2)};\n`);

    console.info(`[SHADOW-BRIDGE] 🔄 Shadow Projekt szinkronizálva: ${title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-iteration', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(SHADOW_DIR, 'iteration.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info(`[SHADOW-BRIDGE] 📝 Shadow Iterációs kérelem mentve: ${data.slideId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SPECIÁLIS: Véglegesített Iteráció Mentése az Árnyék-narratívába
app.post('/save-shadow-narrative', (req, res) => {
    try {
      const { narrative } = req.body;
      const jsonPath = path.join(SHADOW_DIR, 'narrative.json');
      const jsPath = path.join(SHADOW_DIR, 'narrative.js');
      
      fs.writeFileSync(jsonPath, JSON.stringify(narrative, null, 2));
      fs.writeFileSync(jsPath, `export const narrative = ${JSON.stringify(narrative, null, 2)};\n`);
      
      console.info(`[SHADOW-BRIDGE] ✨ Shadow Narratíva frissítve`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
  console.info(`[SHADOW-BRIDGE] 🚀 Árnyék Sync Bridge fut a http://localhost:${PORT} címen`);
});
