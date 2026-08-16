const fs = require('fs');

const enPath = 'src/modules/dashboard/messages/en.json';
const faPath = 'src/modules/dashboard/messages/fa.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));

// Sync missing keys from fa structure
const calendarFa = faData.Dashboard.calendar;
const calendarEn = enData.Dashboard.calendar;

calendarEn.addPlaceholder = "New event...";
calendarEn.add = "Add";
calendarEn.eventsCount = "{count} events found";

calendarEn.types = {
  meeting: "Meeting",
  deadline: "Deadline",
  review: "Review",
  event: "Event",
  official: "Official Holiday",
  fair: "Exhibition",
  company_event: "Company Event",
  birthday: "Employee Birthday"
};

calendarEn.views = {
  all: "All",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year"
};

const checklistEn = enData.Dashboard.checklist;
checklistEn.addPlaceholder = "Add new task...";
checklistEn.categoryPlaceholder = "Category";
checklistEn.all = "All";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("en.json fixed");
