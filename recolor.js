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

  // Replace indigo with sky
  content = content.replace(/indigo-600/g, 'sky-600');
  content = content.replace(/indigo-500/g, 'sky-500');
  content = content.replace(/indigo-400/g, 'sky-400');
  content = content.replace(/indigo-300/g, 'sky-300');

  // Replace purple/fuchsia with blue
  content = content.replace(/purple-600/g, 'blue-600');
  content = content.replace(/purple-500/g, 'blue-500');
  content = content.replace(/purple-400/g, 'blue-400');
  content = content.replace(/purple-300/g, 'blue-300');
  content = content.replace(/fuchsia-500/g, 'blue-500');

  fs.writeFileSync(filePath, content, 'utf-8');
}

processDirectory(path.join(__dirname, 'client/src'));
console.log("Colors updated.");
