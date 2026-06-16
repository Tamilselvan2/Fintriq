const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const ICONS_DIR = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

function generateIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#020817';
  ctx.fillRect(0, 0, size, size);

  // For maskable icons, the safe zone is an inner circle (radius = 0.4 * size)
  // Our content is easily within the safe zone anyway

  // Draw the "F" and dot
  const fontSize = size * 0.5;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#f8fafc'; // slate-50
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Center of the text + dot
  const dotSize = size * 0.08;
  const gap = size * 0.05;
  
  // Measure text
  const textWidth = ctx.measureText('F').width;
  
  // Start drawing dot
  const startX = (size - textWidth - gap - dotSize) / 2;
  
  // Dot
  ctx.fillStyle = '#3b82f6'; // blue-500
  ctx.beginPath();
  ctx.arc(startX + dotSize/2, size/2, dotSize/2, 0, Math.PI * 2);
  ctx.fill();
  
  // F
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText('F', startX + dotSize + gap, size/2 + size*0.04); // adjust slightly down for baseline

  // Save
  const suffix = isMaskable ? '-maskable' : '';
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}${suffix}.png`), buffer);
  console.log(`Generated icon-${size}x${size}${suffix}.png`);
}

generateIcon(192);
generateIcon(512);
generateIcon(512, true);
generateIcon(180); // apple-touch-icon
