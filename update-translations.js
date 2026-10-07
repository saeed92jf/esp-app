const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const adminFa = {
  "tasksOverview": "مرور وظایف",
  "checklists": "چک لیست امروز",
  "activities": "فعالیت‌های انجام شده",
  "todayDate": "امروز",
  "rateTask": "ارزیابی مدیر:",
  "newTaskPlaceholder": "افزودن تسک جدید...",
  "noTasks": "هیچ تسکی برای امروز یافت نشد.",
  "noActivity": "هیچ فعالیت اخیری یافت نشد.",
  "manager": "مدیر",
  "user": "کاربر",
  "timeTracking": "پیگیری زمان",
  "workingFormat": "فرمت کاری",
  "daysLabel": "روز",
  "office": "دفتر",
  "factory": "کارخانه",
  "site": "سایت",
  "bankingApp": "اپلیکیشن بانکی",
  "buildResponsiveLayout": "طراحی چیدمان واکنش‌گرا",
  "debugApiIntegration": "دیباگ ارتباط با API",
  "sat": "ش",
  "sun": "ی",
  "mon": "د",
  "tue": "س",
  "wed": "چ",
  "thu": "پ",
  "fri": "ج"
};

const adminEn = {
  "tasksOverview": "Tasks Overview",
  "checklists": "Today's Checklist",
  "activities": "Completed Activities",
  "todayDate": "Today",
  "rateTask": "Manager Rating:",
  "newTaskPlaceholder": "Add new task...",
  "noTasks": "No tasks found for today.",
  "noActivity": "No recent activities found.",
  "manager": "Manager",
  "user": "User",
  "timeTracking": "Time Tracking",
  "workingFormat": "Working Format",
  "daysLabel": "Days",
  "office": "Office",
  "factory": "Factory",
  "site": "Site",
  "bankingApp": "Banking App",
  "buildResponsiveLayout": "Build Responsive Layout",
  "debugApiIntegration": "Debug API Integration",
  "sat": "Sa",
  "sun": "Su",
  "mon": "Mo",
  "tue": "Tu",
  "wed": "We",
  "thu": "Th",
  "fri": "Fr"
};

let fa = JSON.parse(fs.readFileSync(faPath, 'utf8'));
fa.Admin = { ...(fa.Admin || {}), ...adminFa };
fs.writeFileSync(faPath, JSON.stringify(fa, null, 2));

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.Admin = { ...(en.Admin || {}), ...adminEn };
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

console.log("Translations added successfully!");
