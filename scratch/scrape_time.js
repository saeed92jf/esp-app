const fs = require('fs');

async function scrapeTimeIr(year) {
  let holidays = [];
  for (let month = 1; month <= 12; month++) {
    try {
      // In 2026, time.ir is a Next.js app or similar, let's fetch the html and find elements.
      const url = `https://www.time.ir/fa/event/year/${year}/month/${month}`;
      const res = await fetch(url);
      const html = await res.text();
      
      // We can use a simple regex to extract official holidays.
      // Usually time.ir lists them with some class like `eventHoliday` or similar.
      // Let's just output the HTML to see its structure first.
      if(month === 1) {
         fs.writeFileSync(`scratch/time_month_${month}.html`, html);
      }
    } catch(e) {}
  }
}

scrapeTimeIr(1405);
