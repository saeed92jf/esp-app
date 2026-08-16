const fs = require('fs');
const https = require('https');

function postRequest(urlStr, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    const data = await postRequest('https://calendar.iranfair.com/fa/home/index/search', 'drpyear=1403&vtype=1&txtsearch=');
    fs.writeFileSync('scratch/iranfair.html', data);
    console.log('Iranfair fetched, length:', data.length);
  } catch (e) {
    console.error(e);
  }
}
run();
