const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function generateScreenshot(width, height, name) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#020817';
  ctx.fillRect(0, 0, width, height);

  // App mock UI (Sidebar)
  ctx.fillStyle = '#0f172a'; // slate-900
  if (width > height) {
    // Desktop: sidebar on left
    ctx.fillRect(0, 0, width * 0.2, height);
  } else {
    // Mobile: header on top
    ctx.fillRect(0, 0, width, height * 0.1);
  }

  // Draw Logo in the center
  const size = Math.min(width, height);
  const fontSize = size * 0.1;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const text = 'Fintriq Dashboard Placeholder';
  ctx.fillText(text, width / 2, height / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, name), buffer);
  console.log(`Generated ${name}`);
}

generateScreenshot(1280, 720, 'desktop.png');
generateScreenshot(720, 1280, 'mobile.png');
