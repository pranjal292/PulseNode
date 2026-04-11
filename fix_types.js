const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace emoji: string with icon: any
  // Or more specifically: icon: React.ElementType;
  content = content.replace(/emoji:\s*string;/g, `icon: any;`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed types in ${filePath}`);
}

processFile(path.join(__dirname, 'client/src/pages/PlanEventPage.tsx'));
processFile(path.join(__dirname, 'client/src/pages/ResourcesPage.tsx'));
