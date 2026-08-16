const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('../public/Personnel - Birthday.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

let events = [];

// Columns are known to be: [ 'Name', 'Family', 'Birth_Date' ]
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length < 3) continue;
  
  const firstName = row[0] ? String(row[0]).trim() : '';
  const lastName = row[1] ? String(row[1]).trim() : '';
  const dateStr = row[2] ? String(row[2]).trim() : '';
  
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (fullName && dateStr.match(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/)) {
    // Replace slashes with dashes and change year to 1405
    let parts = dateStr.replace(/\//g, '-').split('-');
    if (parts.length === 3) {
      let em = parts[1].padStart(2, '0');
      let ed = parts[2].padStart(2, '0');
      events.push({
        id: `birth-${i}`,
        title: `تولد ${fullName}`,
        date: `1405-${em}-${ed}`,
        type: "birthday"
      });
    }
  }
}

console.log(`Parsed ${events.length} birthdays with full names!`);

if (events.length > 0) {
    const tsFile = '../src/modules/dashboard/services/dashboard.service.ts';
    let code = fs.readFileSync(tsFile, 'utf8');
    
    let match = code.match(/const REAL_EVENTS: CalendarEvent\[\] = (\[[\s\S]*?\]);/);
    if(match) {
        let currentEvents = eval(match[1]); 
        
        // Remove old birthdays
        currentEvents = currentEvents.filter(e => e.type !== "birthday");
        
        // Push new ones
        currentEvents.push(...events);
        
        // Write back
        const newEventsStr = `const REAL_EVENTS: CalendarEvent[] = ${JSON.stringify(currentEvents, null, 2)};`;
        code = code.replace(/const REAL_EVENTS: CalendarEvent\[\] = \[[\s\S]*?\];/, newEventsStr);
        fs.writeFileSync(tsFile, code);
        console.log("dashboard.service.ts updated with full names!");
    }
}
