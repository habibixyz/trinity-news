import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5500;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const ROOT_DIR = __dirname;
const META_FILE = path.join(ROOT_DIR, 'data', 'daily-edition-meta.json');
const GENERATOR_SCRIPT = path.join(ROOT_DIR, 'scripts', 'generate-daily-edition.js');

let isGenerating = false;

function triggerAutonomousGeneration(reason = 'Autonomous Background Trigger') {
  if (isGenerating) {
    console.log(`[TRINITY SERVER] ⚠️ Generation already active. Skipping ${reason}.`);
    return Promise.resolve(false);
  }

  isGenerating = true;
  console.log(`[TRINITY SERVER] 🚀 Launching autonomous news synthesizer (${reason})...`);

  return new Promise((resolve) => {
    const child = spawn('node', [GENERATOR_SCRIPT], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      isGenerating = false;
      if (code === 0) {
        console.log(`[TRINITY SERVER] ✅ Autonomous daily news generation complete!`);
        resolve(true);
      } else {
        console.log(`[TRINITY SERVER] ❌ Generation exited with code ${code}`);
        resolve(false);
      }
    });

    child.on('error', (err) => {
      isGenerating = false;
      console.error(`[TRINITY SERVER] ❌ Failed to start generator:`, err.message);
      resolve(false);
    });
  });
}

function checkAutonomousRefresh() {
  try {
    if (!fs.existsSync(META_FILE)) {
      console.log('[TRINITY SERVER] 📡 No daily edition found. Starting initial generation...');
      triggerAutonomousGeneration('Initial boot missing edition');
      return;
    }
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    if (!meta.generatedAt) return;
    const ageHours = (Date.now() - new Date(meta.generatedAt).getTime()) / (1000 * 60 * 60);
    const maxAge = parseFloat(process.env.ARTICLE_REFRESH_HOURS) || 6;
    if (ageHours >= maxAge) {
      console.log(`[TRINITY SERVER] ⏰ Current edition is ${ageHours.toFixed(1)}h old (> ${maxAge}h). Triggering autonomous refresh...`);
      triggerAutonomousGeneration(`Edition age: ${ageHours.toFixed(1)}h`);
    } else {
      console.log(`[TRINITY SERVER] ✨ Current edition is fresh (${ageHours.toFixed(1)}h old). Total articles: ${meta.articleCount || 'N/A'}, Trending: ${meta.trendingCount || 'N/A'}`);
    }
  } catch (err) {
    console.warn('[TRINITY SERVER] Autonomous check warning:', err.message);
  }
}

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const urlPath = urlParts[0];

  // API Route: Trigger refresh
  if (urlPath === '/api/refresh-edition') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    if (isGenerating) {
      res.end(JSON.stringify({ status: 'in-progress', message: 'Generation already running' }));
    } else {
      triggerAutonomousGeneration('User/API request');
      res.end(JSON.stringify({ status: 'started', message: 'Autonomous generation started' }));
    }
    return;
  }

  // API Route: Edition status
  if (urlPath === '/api/edition-status') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    try {
      const meta = fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, 'utf8')) : null;
      res.end(JSON.stringify({
        isGenerating,
        metadata: meta
      }));
    } catch {
      res.end(JSON.stringify({ isGenerating, metadata: null }));
    }
    return;
  }

  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🏛️  TRINITY MARKETS running at http://localhost:${PORT}`);
  // Check edition status on boot
  checkAutonomousRefresh();
  // Check every 30 minutes for autonomous daily/6-hour schedule
  setInterval(checkAutonomousRefresh, 30 * 60 * 1000);
});
