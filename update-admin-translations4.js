const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const adminFa = {
  "department": "بخش (دپارتمان)",
  "manager": "مدیر بالادستی",
  "education": "مدرک تحصیلی",
  "jobTitle": "سمت شغلی",
  "recentActivities": "فعالیت‌های اخیر",
  "checklists": "چک‌لیست‌ها",
  "approve": "تایید",
  "reject": "رد",
  "grade": "نمره",
  "addChecklist": "افزودن چک‌لیست"
};

const adminEn = {
  "department": "Department",
  "manager": "Direct Manager",
  "education": "Education",
  "jobTitle": "Job Title",
  "recentActivities": "Recent Activities",
  "checklists": "Checklists",
  "approve": "Approve",
  "reject": "Reject",
  "grade": "Grade",
  "addChecklist": "Add Checklist"
};

faData.Admin = { ...faData.Admin, ...adminFa };
enData.Admin = { ...enData.Admin, ...adminEn };

fs.writeFileSync(faPath, JSON.stringify(faData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');

console.log('Translations for profiles and checklists added successfully.');
