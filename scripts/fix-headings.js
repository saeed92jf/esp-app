const fs = require('fs');
const file = 'd:/esp-app/src/modules/profile/components/profile-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace font-normal in h2 with font-semibold
content = content.replace(/<h2 className="text-2xl sm:text-3xl font-normal/g, '<h2 className="text-2xl sm:text-3xl font-semibold');
content = content.replace(/<h2 className="text-3xl sm:text-4xl font-normal/g, '<h2 className="text-3xl sm:text-4xl font-semibold');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed headings in profile-page.tsx');
