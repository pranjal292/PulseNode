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

  // App.tsx blobls specific
  content = content.replace(/bg-slate-50/g, 'bg-[#050505]');
  content = content.replace(/bg-slate-300\/10/g, 'bg-red-500/10');
  content = content.replace(/bg-blue-300\/10/g, 'bg-amber-600/15');
  content = content.replace(/bg-sky-500\/15/g, 'bg-orange-500/20');
  content = content.replace(/rgba\(255,255,255,0\.15\)/g, 'rgba(249,115,22,0.05)'); // subtle grid

  // Surface texts
  content = content.replace(/text-slate-800/g, 'text-white');
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-600/g, 'text-surface-200/80');
  content = content.replace(/text-slate-500/g, 'text-surface-200/50');
  content = content.replace(/text-slate-400/g, 'text-surface-200/30');
  content = content.replace(/text-slate-300/g, 'text-surface-200/20');

  // Surface Backgrounds (Inputs, Badges)
  content = content.replace(/bg-white\/60/g, 'bg-surface-900/50');
  content = content.replace(/bg-slate-100\/80/g, 'bg-surface-900/60');
  content = content.replace(/bg-slate-200\/50/g, 'bg-surface-200/10');
  content = content.replace(/bg-slate-200\/70/g, 'bg-surface-200/15');

  // Surface Borders
  content = content.replace(/border-slate-300\/50/g, 'border-surface-200/20');
  content = content.replace(/border-slate-200\/50/g, 'border-surface-200/10');

  // Colors: Replace sky and blue accents with orange and amber
  content = content.replace(/sky-600/g, 'orange-600');
  content = content.replace(/sky-500/g, 'orange-500');
  content = content.replace(/sky-400/g, 'orange-400');
  content = content.replace(/sky-300/g, 'orange-300');
  
  content = content.replace(/blue-600/g, 'red-600');
  content = content.replace(/blue-500/g, 'red-500');
  content = content.replace(/blue-400/g, 'orange-500');
  content = content.replace(/blue-300/g, 'amber-400');
  
  // Minor fix for button texts if they somehow became something else
  // Not needed since we revert slate-800 back to white universally

  fs.writeFileSync(filePath, content, 'utf-8');
}

processDirectory(path.join(__dirname, 'client/src'));
console.log("Dark Orange Glassmorphism Theme applied.");
