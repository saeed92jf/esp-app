const fs = require('fs');

async function fetchHolidays(year) {
  let events = [];
  try {
    const tsFile = 'src/modules/dashboard/services/dashboard.service.ts';
    let code = fs.readFileSync(tsFile, 'utf8');

    // First preserve any existing events that are NOT holidays
    // Wait, the API pnldev.com/api/calender?year=1405&month=1 has holidays.
    // Let's just create the script.
    
    for (let month = 1; month <= 12; month++) {
      console.log(`Fetching ${year}-${month}...`);
      const url = `https://pnldev.com/api/calender?year=${year}&month=${month}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.status && data.result) {
        for (const [dayStr, info] of Object.entries(data.result)) {
          if (info.holiday && info.event) {
            events.push({
              id: `hol-${year}-${month}-${dayStr}`,
              title: info.event.join(" - "),
              date: `${year}-${String(month).padStart(2, "0")}-${String(dayStr).padStart(2, "0")}`,
              type: "official"
            });
          }
        }
      }
    }
    
    console.log(`Found ${events.length} official holidays for ${year}.`);
    
    // Read the current json events and add them
    // Actually, I can just write them to a JSON file for the user to review,
    // or I can inject them into dashboard.service.ts.
    // Since REAL_EVENTS in dashboard.service.ts has some fairs and holidays,
    // let's extract it.
    let match = code.match(/const REAL_EVENTS: CalendarEvent\[\] = (\[[\s\S]*?\]);/);
    if(match) {
        let currentEvents = eval(match[1]); // Evaluate the array
        // Remove existing official holidays
        currentEvents = currentEvents.filter(e => e.type !== "official" && e.type !== "deadline");
        
        // Push new ones
        currentEvents.push(...events);
        
        // Write back
        const newEventsStr = `const REAL_EVENTS: CalendarEvent[] = ${JSON.stringify(currentEvents, null, 2)};`;
        code = code.replace(/const REAL_EVENTS: CalendarEvent\[\] = \[[\s\S]*?\];/, newEventsStr);
        fs.writeFileSync(tsFile, code);
        console.log("dashboard.service.ts updated!");
    }

  } catch(e) {
    console.error(e);
  }
}

fetchHolidays(1405);
