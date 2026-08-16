const https = require('https');

function get(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const data = await get('https://holidayapi.ir/jalali/1403/5/1');
    console.log('holidayapi.ir:', data.substring(0, 500));
  } catch(e) {
    console.log('Error holidayapi.ir:', e.message);
  }
}
run();
