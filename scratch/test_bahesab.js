const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeHolidays() {
  let events = [];
  
  // Actually, we can just read the markdown file we already downloaded to test
  const content = fs.readFileSync('C:/Users/S.Jalili/.gemini/antigravity-ide/brain/a868db98-1125-49dc-ba43-166d2c038b41/.system_generated/steps/3717/content.md', 'utf8');
  const $ = cheerio.load(content);
  
  const holidayP = $('.monasebat-holiday');
  console.log("Holiday P length:", holidayP.length);
  
  if (holidayP.length > 0) {
    const html = holidayP.html();
    console.log("HTML:", html);
    const regex = /<span class="M1">([^<]+)<\/span>\s*-\s*([^<]+)/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      console.log("Match:", match[1], match[2].trim());
    }
  }
}
scrapeHolidays();
