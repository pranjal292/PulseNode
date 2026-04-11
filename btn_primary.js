const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find standard gradient buttons and replace them with just 'btn-primary'
  content = content.replace(/bg-gradient-to-r from-orange-\d+ to-red-\d+\s+hover:from-orange-\d+ hover:to-red-\d+\s+text-white/gs, 'btn-primary');
  // Specifically in LoginPage.tsx
  content = content.replace(/shadow-\[0_4px_24px_rgba\(99,102,241,0\.35\)\]\s*hover:shadow-\[0_8px_32px_rgba\(99,102,241,0\.5\)\]/gs, '');

  fs.writeFileSync(filePath, content, 'utf-8');
}

processDirectory(path.join(__dirname, 'client/src'));
console.log("Button themes replaced with btn-primary.");
