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
  Building2: 'Buildings',
  Copy: 'Copy',
  Users: 'Users',
  ArrowRight: 'ArrowRight',
  UserCog: 'UserGear',
  ChevronDown: 'CaretDown',
  ShieldAlert: 'ShieldWarning',
  LogIn: 'SignIn',
  LogOut: 'SignOut',
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

  // Fix LogOut import issue if it is there
  content = content.replace(/LogOut/g, 'SignOut');
  
  // Apply mapping to tags
  Object.entries(ICON_MAP).forEach(([oldIcon, newIcon]) => {
     // replace <OldIcon
     content = content.replace(new RegExp(`<${oldIcon}(?![a-zA-Z])`, 'g'), `<${newIcon}`);
     // replace </OldIcon>
     content = content.replace(new RegExp(`</${oldIcon}>`, 'g'), `</${newIcon}>`);
  });

  // some phosphor icons might not have weight applied yet if my previous script missed them
  // this is a bit tricky, but I can assume all Phosphor icons should have weight="duotone". 
  // Let's just fix the compilation errors first.

  fs.writeFileSync(filePath, content, 'utf-8');
}

processDirectory(path.join(__dirname, 'client/src'));
console.log("Cleanup script completed.");
