const fs = require('fs');

const faPath = 'src/modules/dashboard/messages/fa.json';
const enPath = 'src/modules/dashboard/messages/en.json';

let faObj = JSON.parse(fs.readFileSync(faPath, 'utf8'));
let enObj = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// fa updates
if (faObj.Dashboard.calendar) {
  faObj.Dashboard.calendar.filters.past = "گذشته";
  faObj.Dashboard.calendar.filters.upcoming = "پیش‌رو";
  faObj.Dashboard.calendar.filters.all = "همه";
  faObj.Dashboard.calendar.addPlaceholder = "رویداد جدید";
  faObj.Dashboard.calendar.types.official = "رسمی";
  faObj.Dashboard.calendar.types.company_event = "شرکتی";
  faObj.Dashboard.calendar.types.fair = "نمایشگاه";
}

if (faObj.Dashboard.checklist) {
  faObj.Dashboard.checklist.addPlaceholder = "تسک جدید";
}

if (faObj.Dashboard.avatar) {
  faObj.Dashboard.avatar.selectImage = "تصویر پروفایل";
  faObj.Dashboard.avatar.uploadNew = "آپلود";
  faObj.Dashboard.avatar.noImage = "بدون تصویر";
  faObj.Dashboard.avatar.selectThis = "انتخاب";
  faObj.Dashboard.avatar.userProfile = "پروفایل";
}

// en updates
if (enObj.Dashboard.calendar) {
  enObj.Dashboard.calendar.filters.past = "Past";
  enObj.Dashboard.calendar.filters.upcoming = "Upcoming";
  enObj.Dashboard.calendar.filters.all = "All";
  enObj.Dashboard.calendar.addPlaceholder = "New event";
  enObj.Dashboard.calendar.types.official = "Official";
  enObj.Dashboard.calendar.types.company_event = "Company";
  enObj.Dashboard.calendar.types.fair = "Exhibition";
}

if (enObj.Dashboard.checklist) {
  enObj.Dashboard.checklist.addPlaceholder = "New task";
}

if (enObj.Dashboard.avatar) {
  enObj.Dashboard.avatar.selectImage = "Profile Image";
  enObj.Dashboard.avatar.uploadNew = "Upload";
  enObj.Dashboard.avatar.noImage = "No Image";
  enObj.Dashboard.avatar.selectThis = "Select";
  enObj.Dashboard.avatar.userProfile = "Profile";
}

fs.writeFileSync(faPath, JSON.stringify(faObj, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enObj, null, 2), 'utf8');
console.log("Translations updated");
