const fs = require('fs');
const file = 'd:/esp-app/src/modules/profile/components/profile-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Revert font-semibold back to font-normal for h2
content = content.replace(/<h2 className="text-2xl sm:text-3xl font-semibold/g, '<h2 className="text-2xl sm:text-3xl font-normal');
content = content.replace(/<h2 className="text-3xl sm:text-4xl font-semibold/g, '<h2 className="text-3xl sm:text-4xl font-normal');

fs.writeFileSync(file, content, 'utf8');
console.log('Reverted headings in profile-page.tsx');
