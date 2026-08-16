const fs = require('fs');
const cheerio = require('cheerio');

function persianToEnglishDigits(str) {
  return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[\u06F0-\u06F9]/g, d => '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'.indexOf(d));
}

async function scrapeHolidays() {
  let events = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');
    const url = `https://www.bahesab.ir/time/1405${monthStr}/`;
    try {
      const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const holidaysList = $('#holidays li');
      holidaysList.each((i, el) => {
        // e.g., <span class="M2">۱ فروردین</span>
        const dateFa = $(el).find('.M2').text().trim();
        const dayMatch = dateFa.match(/^([۰-۹\u06F0-\u06F90-9]+)/);
        if (dayMatch) {
            const dayEn = parseInt(persianToEnglishDigits(dayMatch[1]));
            
            // Collect all titles from M6 spans
            let titles = [];
            $(el).find('.M6').each((j, span) => {
                const text = $(span).text().trim();
                if (text) titles.push(text);
            });
            
            const title = titles.join(' - ');
            
            if (!isNaN(dayEn) && title) {
                events.push({
                    id: `bahesab-1405-${month}-${dayEn}`,
                    title: title,
                    date: `1405-${monthStr}-${String(dayEn).padStart(2, '0')}`,
                    type: "official"
                });
            }
        }
      });
    } catch (err) {
      console.error(`Error fetching month ${month}:`, err);
    }
  }
  
  console.log(`Parsed ${events.length} official holidays from Bahesab`);
  
  const tsFile = '../src/modules/dashboard/services/dashboard.service.ts';
  let code = fs.readFileSync(tsFile, 'utf8');
  
  const matchTs = code.match(/const REAL_EVENTS: CalendarEvent\[\] = (\[[\s\S]*?\]);/);
  if (matchTs) {
    let currentEvents = eval(matchTs[1]); 
    // Remove all previous "official" holidays
    currentEvents = currentEvents.filter(e => e.type !== "official");
    
    // Push new ones
    currentEvents.push(...events);
    
    const newEventsStr = `const REAL_EVENTS: CalendarEvent[] = ${JSON.stringify(currentEvents, null, 2)};`;
    code = code.replace(/const REAL_EVENTS: CalendarEvent\[\] = \[[\s\S]*?\];/, newEventsStr);
    fs.writeFileSync(tsFile, code);
    console.log("dashboard.service.ts updated with Bahesab holidays!");
  } else {
    console.log("Could not find REAL_EVENTS");
  }
}

scrapeHolidays();
