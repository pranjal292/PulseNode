const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client/src');
const filesToUpdate = [
  'pages/UpdatesPage.tsx',
  'pages/ResourcesPage.tsx',
  'pages/PlanEventPage.tsx',
  'pages/EditTagsPage.tsx',
  'pages/ClubsPage.tsx',
  'pages/AnnouncementPage.tsx',
  'context/AuthContext.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace http://localhost:4000/api with the new constant if it's the context file
  if (file === 'context/AuthContext.tsx') {
    content = content.replace('const API_URL = "http://localhost:4000/api";', 'import { API_URL } from "../config";');
  } else {
    // For other files, replace the fetch calls
    // First, add the import if not present
    if (!content.includes('import { API_URL } from "../config";') && !content.includes('import { API_URL } from "../context/AuthContext";')) {
      // Need to find a good place for import. 
      // Actually, it might be easier to just import from config in all of them.
      content = 'import { API_URL } from "../config";\n' + content;
    }
    
    // Replace hardcoded URLs. 
    // Example: fetch("http://localhost:4000/api/announcements" -> fetch(`${API_URL}/announcements`
    content = content.replace(/"http:\/\/localhost:4000\/api\/([^"]+)"/g, '`${API_URL}/$1`');
    content = content.replace(/"http:\/\/localhost:4000\/api"/g, 'API_URL');
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
