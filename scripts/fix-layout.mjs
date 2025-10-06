import fs from 'fs';
const targets = ['app/layout.tsx','app/(app)/layout.tsx'];
for (const p of targets) {
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p,'utf8');
  if (!s.includes('import ApiQueueBoot')) {
    const m = s.match(/^import[^\n]*\n/);
    if (m) {
      const idx = m.index + m[0].length;
      s = s.slice(0, idx) + 'import ApiQueueBoot from "@/components/ApiQueueBoot";\n' + s.slice(idx);
    } else {
      s = 'import ApiQueueBoot from "@/components/ApiQueueBoot";\n' + s;
    }
  }
  if (!s.includes('<ApiQueueBoot')) {
    s = s.replace('{children}', '<ApiQueueBoot />\n      {children}');
  }
  fs.writeFileSync(p, s, 'utf8');
  console.log('updated', p);
}
