/**
 * TRINITY MARKETS — Autonomous Daily Edition Daemon & Background News Synthesizer
 * 
 * Functions:
 * 1. Runs as a background service (24/7 autonomous daemon).
 * 2. Checks data/daily-edition-meta.json to verify the publication age.
 * 3. Ingests fresh trending market stories and executes generation on schedule.
 * 4. Runs every 6 hours (or custom ARTICLE_REFRESH_HOURS) autonomously without human intervention.
 * 
 * Usage:
 *   node scripts/autonomous-daemon.js
 *   npm run daemon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const META_FILE = path.join(ROOT_DIR, 'data', 'daily-edition-meta.json');
const GENERATOR_SCRIPT = path.join(ROOT_DIR, 'scripts', 'generate-daily-edition.js');

// Default refresh cadence: 6 hours (configurable via env)
const REFRESH_INTERVAL_HOURS = parseFloat(process.env.ARTICLE_REFRESH_HOURS) || 6;
const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_HOURS * 60 * 60 * 1000;

function log(msg) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${timestamp}] ${msg}`);
}

function getEditionAgeHours() {
  try {
    if (!fs.existsSync(META_FILE)) return Infinity;
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    if (!meta.generatedAt) return Infinity;
    const genTime = new Date(meta.generatedAt).getTime();
    return (Date.now() - genTime) / (1000 * 60 * 60);
  } catch (err) {
    return Infinity;
  }
}

function getEditionStats() {
  try {
    if (!fs.existsSync(META_FILE)) return null;
    return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  } catch {
    return null;
  }
}

let isGenerating = false;

function runGenerator(reason = 'Scheduled Autonomous Trigger') {
  if (isGenerating) {
    log(`⚠️  Generation already in progress. Skipping ${reason}.`);
    return Promise.resolve(false);
  }

  isGenerating = true;
  log(`🚀 Starting Autonomous News Generation pipeline (${reason})...`);

  return new Promise((resolve) => {
    const child = spawn('node', [GENERATOR_SCRIPT], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      isGenerating = false;
      if (code === 0) {
        const stats = getEditionStats();
        log(`✅ Autonomous generation completed successfully! Total Articles: ${stats?.articleCount || 'N/A'}, Trending: ${stats?.trendingCount || 'N/A'}`);
        resolve(true);
      } else {
        log(`❌ Autonomous generation finished with exit code: ${code}`);
        resolve(false);
      }
    });

    child.on('error', (err) => {
      isGenerating = false;
      log(`❌ Failed to spawn generation process: ${err.message}`);
      resolve(false);
    });
  });
}

async function checkAndRun() {
  const age = getEditionAgeHours();
  log(`📡 Checking edition status... Current edition age: ${age === Infinity ? 'NO EDITION FOUND' : age.toFixed(2) + ' hours'}`);

  if (age >= REFRESH_INTERVAL_HOURS) {
    log(`⏰ Edition is older than ${REFRESH_INTERVAL_HOURS} hours (or missing). Triggering autonomous generation now...`);
    await runGenerator(`Edition age: ${age === Infinity ? 'Missing' : age.toFixed(2) + 'h'}`);
  } else {
    const hoursLeft = (REFRESH_INTERVAL_HOURS - age).toFixed(2);
    log(`✨ Current edition is fresh (${age.toFixed(2)}h old). Next scheduled autonomous run in ~${hoursLeft} hours.`);
  }
}

async function startDaemon() {
  console.log('\n======================================================================');
  console.log('🏛️  TRINITY MARKETS — 24/7 Autonomous News & Trending Daemon');
  console.log(`⏱️  Refresh Interval: Every ${REFRESH_INTERVAL_HOURS} Hours`);
  console.log(`📂 Target Data: ${path.join(ROOT_DIR, 'data', 'daily-edition.json')}`);
  console.log('======================================================================\n');

  // Initial check on boot
  await checkAndRun();

  // Set recurring interval
  setInterval(async () => {
    await checkAndRun();
  }, Math.min(REFRESH_INTERVAL_MS, 30 * 60 * 1000)); // Checks at least every 30 mins to ensure precision

  log(`🟢 Autonomous daemon is active and monitoring market wire.`);
}

// Graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Daemon received SIGINT. Shutting down gracefully.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Daemon received SIGTERM. Shutting down gracefully.');
  process.exit(0);
});

startDaemon();
