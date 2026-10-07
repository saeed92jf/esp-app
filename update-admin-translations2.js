const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const adminFa = {
  "addEmployee": "تعریف کاربر",
  "daysInCompany": "روزهای حضور در شرکت",
  "doneProjects": "پروژه‌های انجام شده",
  "workingFormat": "محل کار (فرمت کاری)",
  "office": "شرکت",
  "factory": "کارخانه",
  "site": "سایت / ماموریت",
  "workActivity": "ساعات کاری در هفته",
  "appsAndModules": "ماژول‌های در دسترس",
  "sun": "یک",
  "mon": "دو",
  "tue": "سه",
  "wed": "چهار",
  "thu": "پنج",
  "fri": "جمعه",
  "sat": "شنبه",
  "requestsTab": "درخواست‌های عضویت",
  "settingsTab": "تنظیمات ادمین"
};

const adminEn = {
  "addEmployee": "Add Employee",
  "daysInCompany": "Days in company",
  "doneProjects": "Done Projects",
  "workingFormat": "Working format",
  "office": "Office",
  "factory": "Factory",
  "site": "Site / Mission",
  "workActivity": "Work activity",
  "appsAndModules": "Apps & Modules",
  "sun": "Sun",
  "mon": "Mon",
  "tue": "Tue",
  "wed": "Wed",
  "thu": "Thu",
  "fri": "Fri",
  "sat": "Sat",
  "requestsTab": "Membership Requests",
  "settingsTab": "Admin Settings"
};

faData.Admin = { ...faData.Admin, ...adminFa };
enData.Admin = { ...enData.Admin, ...adminEn };

fs.writeFileSync(faPath, JSON.stringify(faData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');

console.log('Translations for new dashboard added successfully.');
