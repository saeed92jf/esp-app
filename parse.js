const fs = require('fs');
const html = fs.readFileSync('zoomit-shorts.html', 'utf8');
const urls = html.match(/https:\/\/www\.aparat\.com\/api\/fa\/v1\/[a-zA-Z0-9\/\-\_]+/g);
if (urls) {
  const unique = [...new Set(urls)];
  console.log('Found APIs:', unique.join('\n'));
} else {
  console.log('No APIs found');
}
