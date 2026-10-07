const fs = require('fs');
const path = require('path');

const parsed = JSON.parse(fs.readFileSync('parsed-events.json', 'utf8'));
const faPath = 'src/modules/dashboard/messages/fa.json';
const enPath = 'src/modules/dashboard/messages/en.json';
const servicePath = 'src/modules/dashboard/services/dashboard.service.ts';

let faObj = JSON.parse(fs.readFileSync(faPath, 'utf8'));
let enObj = JSON.parse(fs.readFileSync(enPath, 'utf8'));

faObj.Dashboard.calendar = faObj.Dashboard.calendar || {};
faObj.Dashboard.calendar.fairs = {};
enObj.Dashboard.calendar = enObj.Dashboard.calendar || {};
enObj.Dashboard.calendar.fairs = {};

// Insert into translations
const newEvents = [];
parsed.forEach(ev => {
  const key = ev.id;
  faObj.Dashboard.calendar.fairs[key] = ev.title;
  // Just a basic English stub for now
  enObj.Dashboard.calendar.fairs[key] = "Exhibition: " + ev.title.replace('نمایشگاه:', '').replace('(به تعویق افتاد)', '(Postponed)').trim();
  
  newEvents.push({
    id: ev.id,
    titleKey: `fairs.${key}`,
    date: ev.date,
    type: ev.type
  });
});

fs.writeFileSync(faPath, JSON.stringify(faObj, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enObj, null, 2), 'utf8');

// Now let's update dashboard.service.ts
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Update CalendarEvent interface
serviceContent = serviceContent.replace(
  /export interface CalendarEvent {\s+id: string;\s+title: string;\s+date: string;\s+type:/g,
  "export interface CalendarEvent {\n  id: string;\n  titleKey: string;\n  date: string;\n  type:"
);

// We need to replace the FAKE_EVENTS array. 
// It's assigned to const FAKE_EVENTS: CalendarEvent[] = [ ... ];
// We can use a regex to replace the whole block or just rewrite it cleanly.
const arrayStart = serviceContent.indexOf('const FAKE_EVENTS: CalendarEvent[] = [');
if (arrayStart !== -1) {
  let arrayEnd = serviceContent.indexOf('];', arrayStart);
  if (arrayEnd !== -1) {
    const replacement = `const FAKE_EVENTS: CalendarEvent[] = ${JSON.stringify(newEvents, null, 2)}`;
    serviceContent = serviceContent.slice(0, arrayStart) + replacement + serviceContent.slice(arrayEnd + 1);
  }
}

fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('Successfully injected fairs into translations and service!');
