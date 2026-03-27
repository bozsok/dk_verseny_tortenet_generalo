import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const CLIENT_TOKEN = 'dk-story-sync-2026';

app.get('/health', (req, res) => {
  res.json({ success: true, version: '1.11.0' });
});

app.post('/save-blueprint', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'src', 'data', 'blueprint.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info(`[DKV-BRIDGE] 📝 Projekt Blueprint mentve: ${data.title}`);
    res.json({ success: true, message: 'Blueprint saved successfully' });
  } catch (error) {
    console.error(`[DKV-BRIDGE] ❌ Hiba a blueprint mentésekor: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-master-blueprint', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'src', 'data', 'blueprint-master.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info('[DKV-BRIDGE] 👑 Mesterleíró (Master) frissítve!');
    res.json({ success: true, message: 'Master blueprint saved successfully' });
  } catch (error) {
    console.error(`[DKV-BRIDGE] ❌ Hiba a master blueprint mentésekor: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-iteration', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'src', 'data', 'iteration.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.info(`[DKV-BRIDGE] 📝 Iterációs kérelem érkezett: ${data.slideId}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[DKV-BRIDGE] ❌ Hiba az iteráció mentésekor: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/sync-full-project', (req, res) => {
  const token = req.headers['x-sync-token'];
  if (token !== CLIENT_TOKEN) {
    return res.status(403).json({ success: false, error: 'Érvénytelen biztonsági kulcs!' });
  }

  try {
    const { title, narrative } = req.body;
    if (!narrative || !Array.isArray(narrative) || narrative.length === 0) {
      throw new Error('Érvénytelen vagy üres narratíva adat!');
    }

    const blueprintPath = path.join(__dirname, 'src', 'data', 'blueprint.json');
    const narrativePath = path.join(__dirname, 'src', 'data', 'narrative.js');

    // 1. SMART MERGE: Blueprint beolvasása és összefésülése
    let blueprintData = {};
    if (fs.existsSync(blueprintPath)) {
      blueprintData = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    }

    blueprintData.title = title || blueprintData.title || 'Betöltött Történet';
    blueprintData.narrativeConfig = {
      ...(blueprintData.narrativeConfig || {}),
      totalSlides: narrative.length
    };

    fs.writeFileSync(blueprintPath, JSON.stringify(blueprintData, null, 2));

    const narrativeContent = `export const narrative = ${JSON.stringify(narrative, null, 2)};\n`;
    fs.writeFileSync(narrativePath, narrativeContent);

    console.info(`[DKV-BRIDGE] 🔄 Projekt szinkronizálva: ${title}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[DKV-BRIDGE] ❌ Szinkronizációs hiba: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.info(`[DKV-BRIDGE] 🚀 AI Sync Bridge fut a http://localhost:${PORT} címen`);
});
