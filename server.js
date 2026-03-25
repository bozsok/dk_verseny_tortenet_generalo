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

app.post('/save-blueprint', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'src', 'data', 'blueprint.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('📝 Új Blueprint mentve:', data.title);
    res.json({ success: true, message: 'Blueprint saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/save-iteration', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'src', 'data', 'iteration.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('📝 Iterációs kérelem érkezett:', data.slideId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Sync Bridge fut a http://localhost:${PORT} címen`);
});
