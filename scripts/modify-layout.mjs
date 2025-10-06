import fs from 'fs';

const targets = ['app/layout.tsx','app/(app)/layout.tsx'];

for (const p of targets) {
  if (!fs.existsSync(p)) continue;
  const backup = p + '.bak_' + Date.now();
  fs.copyFileSync(p, backup);
  let src = fs.readFileSync(p, 'utf8');

  if (!src.includes('SwAutoUpdateClient')) {
    const importStmt = 'import SwAutoUpdateClient from "@/components/SwAutoUpdateClient";\n';
    const firstImport = src.match(/^import[^\n]*\n/m);
    if (firstImport) {
      const idx = firstImport.index + firstImport[0].length;
      src = src.slice(0, idx) + importStmt + src.slice(idx);
    } else {
      src = importStmt + src;
    }
  }

  if (!src.includes('<SwAutoUpdateClient')) {
    src = src.replace('{children}', '<SwAutoUpdateClient />\n      {children}');
  }

  fs.writeFileSync(p, src, 'utf8');
  console.log('Updated', p, 'backup at', backup);
}
