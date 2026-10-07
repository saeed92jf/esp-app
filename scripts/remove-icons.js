const fs = require('fs');
const file = 'd:/esp-app/src/modules/profile/components/profile-page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// The icons block starts around line 255 and ends at 439 (the `</div>` before `{/* The Ring */}`)
// We'll search for ` {/* Popping Icons */}` and remove up to `{/* The Ring */}`.

const startIdx = lines.findIndex(l => l.includes('{/* Popping Icons */}'));
const endIdx = lines.findIndex(l => l.includes('{/* The Ring */}'));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`Removed lines from ${startIdx + 1} to ${endIdx}`);
} else {
  console.log('Could not find the start or end index.');
}
