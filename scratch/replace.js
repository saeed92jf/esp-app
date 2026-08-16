const fs = require('fs');

const events = require('./events.json');
const tsFile = '../src/modules/dashboard/services/dashboard.service.ts';
let code = fs.readFileSync(tsFile, 'utf8');

const eventsStr = `const REAL_EVENTS: CalendarEvent[] = ${JSON.stringify(events, null, 2).replace(/"([^"]+)":/g, '$1:')};`;

code = code.replace(/const OIL_GAS_EVENTS[\s\S]*?\];/, eventsStr);
code = code.replace(/calendarEvents:\s*\[[\s\S]*?\],/g, 'calendarEvents: [...REAL_EVENTS],');

fs.writeFileSync(tsFile, code);
console.log('Done replacing events');
