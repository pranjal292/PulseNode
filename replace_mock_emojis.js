const fs = require('fs');
const path = require('path');

const EMOJI_MAP = {
  "📐": "Ruler",
  "📽️": "ProjectorScreen",
  "🔊": "SpeakerHifi",
  "🎤": "MicrophoneStage",
  "🖥️": "Desktop",
  "🏛️": "Bank",
  "🏫": "Student",
  "🪑": "Armchair",
  "🌳": "Tree",
  "💻": "Laptop",
  "🪵": "Desk",
  "💺": "Armchair",
  "🎭": "MaskHappy",
  "📋": "ClipboardText",
  "🔌": "Plug"
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  let iconsToImport = new Set();
  
  // Replace `emoji: "..."` with `icon: IconName`
  content = content.replace(/emoji:\s*"([^"]+)"/g, (match, emoji) => {
    let icon = EMOJI_MAP[emoji] || "Package"; 
    iconsToImport.add(icon);
    return `icon: ${icon}`;
  });

  if (iconsToImport.size > 0) {
    let importStr = `import { ${Array.from(iconsToImport).join(', ')}, Package } from "@phosphor-icons/react";\n`;
    // Ensure we don't duplicate import if it already exists
    if (!content.includes(importStr)) {
       // Just put it at the top ideally below existing phosphor imports or just below standard imports
       content = content.replace(/import {.*?} from "@phosphor-icons\/react";/, (match) => {
         // Merge them. For simplicity, just append to the existing import.
         let existing = match.replace('import { ', '').replace(' } from "@phosphor-icons/react";', '');
         let merged = new Set([ ...existing.split(',').map(s=>s.trim()), ...Array.from(iconsToImport), 'Package']);
         return `import { ${Array.from(merged).filter(Boolean).join(', ')} } from "@phosphor-icons/react";`;
       });
    }

    // Now fix where it's rendered. It used to be rendered as:
    // `{item.emoji}` 
    // We replace it with `<item.icon size={20} weight="duotone" />`
    content = content.replace(/{item\.emoji}/g, `<item.icon size={20} weight="duotone" />`);
    content = content.replace(/{resource\.emoji}/g, `<resource.icon size={24} weight="duotone" />`);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Process PlanEventPage
processFile(path.join(__dirname, 'client/src/pages/PlanEventPage.tsx'));

// 2. Process ResourcesPage
processFile(path.join(__dirname, 'client/src/pages/ResourcesPage.tsx'));

