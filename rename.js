const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = [
  path.join(__dirname, 'client/src'),
  path.join(__dirname, 'client'), // for index.html
  path.join(__dirname, 'src'), // for server.ts
  __dirname // for README.md, package.json
];

const IGNORE_FILES = ['node_modules', 'dist', 'package-lock.json', '.git', 'prisma'];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORE_FILES.includes(file)) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (dir !== __dirname) {
        processDirectory(fullPath); // Recurse only deep in client/src and src
      } else if (file === 'client' || file === 'src') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md') || fullPath.endsWith('.json') || fullPath.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replacements
    content = content.replace(/HTC Community Platform/g, 'PulseNode Platform');
    content = content.replace(/HTC Community/g, 'PulseNode');
    content = content.replace(/htc_token/g, 'pulsenode_token');
    content = content.replace(/@htc\.edu/g, '@pulsenode.edu');
    content = content.replace(/"name": "htc-community-platform"/g, '"name": "pulsenode"');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated: ${filePath.replace(__dirname, '')}`);
    }
  } catch (e) {}
}

DIRS_TO_SCAN.forEach(dir => processDirectory(dir));
console.log("Renamed HTC to PulseNode globally.");
