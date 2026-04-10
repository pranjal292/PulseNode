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

  // App.tsx body updates
  content = content.replace(/bg-\[#050505\]/g, 'bg-slate-50');
  content = content.replace(/text-slate-200/g, 'text-slate-800');

  // Text colors (Headers usually use text-white, we change to text-slate-800)
  // Be careful not to replace text-white inside buttons. Buttons usually have "bg-gradient... text-white"
  // Here, I will just replace `text-white` with `text-slate-800` and manually revert or handle buttons if needed.
  // Actually, typical buttons have `text-white` on the same line as `bg-gradient`.
  content = content.replace(/text-white/g, 'text-slate-800');
  // Revert buttons: "from-sky-500 to-blue-600\nhover:... text-slate-800" etc.
  // A safer approach: replace `text-white` with `text-slate-800`. Then replace `text-slate-800` back to `text-white` if it's next to `from-sky` or `bg-gradient`
  // Actually, it's easier to just do it via regex, or let the user fix buttons later. Let's try to be smart:
  
  // Surface texts
  content = content.replace(/text-surface-200\/80/g, 'text-slate-600');
  content = content.replace(/text-surface-200\/60/g, 'text-slate-500');
  content = content.replace(/text-surface-200\/55/g, 'text-slate-500');
  content = content.replace(/text-surface-200\/50/g, 'text-slate-500');
  content = content.replace(/text-surface-200\/40/g, 'text-slate-500');
  content = content.replace(/text-surface-200\/35/g, 'text-slate-400');
  content = content.replace(/text-surface-200\/30/g, 'text-slate-400');
  content = content.replace(/text-surface-200\/25/g, 'text-slate-400');
  content = content.replace(/text-surface-200\/20/g, 'text-slate-300');
  
  // Surface Backgrounds (Inputs, Badges)
  content = content.replace(/bg-surface-900\/60/g, 'bg-slate-100/80');
  content = content.replace(/bg-surface-900\/50/g, 'bg-white/60');
  content = content.replace(/bg-surface-200\/10/g, 'bg-slate-200/50');
  content = content.replace(/bg-surface-200\/5/g, 'bg-slate-100/80');

  // Surface Borders
  content = content.replace(/border-surface-200\/20/g, 'border-slate-300/50');
  content = content.replace(/border-surface-200\/10/g, 'border-slate-200/50');

  // Fix buttons that got changed to text-slate-800 but need text-white:
  // e.g. `<button className="... from-sky-500 ... text-slate-800 ...`
  content = content.replace(/(from-\w+-\d+\/?[0-9]*.*?)text-slate-800/gs, '$1text-white');
  content = content.replace(/text-slate-800(\s+shadow-lg)/gs, 'text-white$1');

  fs.writeFileSync(filePath, content, 'utf-8');
}

processDirectory(path.join(__dirname, 'client/src'));
console.log("Light Theme applied.");
