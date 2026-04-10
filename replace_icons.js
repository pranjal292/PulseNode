const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  Megaphone: 'Megaphone',
  SendHorizonal: 'PaperPlaneRight',
  Pin: 'PushPin',
  CheckCircle2: 'CheckCircle',
  CalendarPlus: 'CalendarPlus',
  MapPin: 'MapPin',
  Clock: 'Clock',
  Package: 'Package',
  AlertTriangle: 'Warning',
  Mail: 'Envelope',
  User: 'User',
  Building2: 'Buildings',
  Copy: 'Copy',
  Users: 'Users',
  ArrowRight: 'ArrowRight',
  UserCog: 'UserGear',
  ChevronDown: 'CaretDown',
  ShieldAlert: 'ShieldWarning',
  LogIn: 'SignIn',
  UserPlus: 'UserPlus',
  Lock: 'LockKey',
  Loader2: 'SpinnerGap',
  Eye: 'Eye',
  EyeOff: 'EyeClosed',
  Home: 'House',
  Calendar: 'CalendarBlank',
  ShieldCheck: 'ShieldCheck',
  CalendarDays: 'Calendar',
  X: 'X',
  Plus: 'Plus',
  Globe: 'Globe',
  Star: 'Star',
  Bell: 'Bell'
};

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
  if (!content.includes('lucide-react')) return;

  // 1. Extract the Lucide imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    const icons = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newIcons = icons.map(icon => ICON_MAP[icon] || icon);
    
    // Replace icon usages in the JSX
    icons.forEach((oldIcon, idx) => {
      const newIcon = newIcons[idx];
      // Regex to find `<OldIcon ` or `<OldIcon/>` or `<OldIcon>`
      const jsxRegex = new RegExp(`<${oldIcon}(\\s+|>)`, 'g');
      content = content.replace(jsxRegex, `<${newIcon} weight="duotone"$1`);
      
      const jsxSelfCloseRegex = new RegExp(`<${oldIcon}\\s*/>`, 'g');
      content = content.replace(jsxSelfCloseRegex, `<${newIcon} weight="duotone" />`);
      
      // Also handle `<OldIcon className="..." />` without weight duplicated
      // If we blindly added weight="duotone", we might have added it to `<OldIcon weight="duotone" ... />`
      // It's handled by the $1 replacement, but let's ensure we don't duplicate. We can clean up later if needed.
    });

    return `import { ${newIcons.join(', ')} } from "@phosphor-icons/react";`;
  });

  // some loaders use animate-spin, so if SpinnerGap is used, make sure it spins
  // (Phosphor provides weight="duotone" but no built-in spin prop, we use standard className)

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${filePath}`);
}

processDirectory(path.join(__dirname, 'client/src'));
