const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faProfile = {
  "nav": {
    "home": "خانه",
    "personal": "شخصی",
    "organizational": "سازمانی",
    "skills": "مهارت‌ها",
    "insurance": "بیمه",
    "education": "تحصیلات",
    "settings": "تنظیمات شخصی"
  },
  "settings": {
    "desc": "شخصی‌سازی زبان و ظاهر پنل کاربری",
    "language": "زبان سیستم",
    "languageDesc": "زبان پیش‌فرض داشبورد را انتخاب کنید",
    "appearance": "تنظیمات ظاهری",
    "appearanceDesc": "تم و رنگ سازمانی را تغییر دهید"
  },
  "tabs": {
    "insurance": "جزئیات بیمه",
    "education": "سوابق تحصیلی"
  },
  "fields": {
    "provider": "سازمان بیمه‌گر",
    "type": "نوع بیمه",
    "insuranceCode": "شماره بیمه",
    "validUntil": "تاریخ اعتبار",
    "degree": "مدرک تحصیلی",
    "fieldOfStudy": "رشته تحصیلی",
    "university": "دانشگاه",
    "graduationYear": "سال فارغ‌التحصیلی"
  },
  "actions": {
    "save": "ذخیره اطلاعات"
  },
  "notSet": "ثبت نشده",
  "errorLoading": "خطا در دریافت اطلاعات کاربری"
};

const enProfile = {
  "nav": {
    "home": "Home",
    "personal": "Personal",
    "organizational": "Organizational",
    "skills": "Skills",
    "insurance": "Insurance",
    "education": "Education",
    "settings": "Personal Settings"
  },
  "settings": {
    "desc": "Customize your language and panel appearance",
    "language": "System Language",
    "languageDesc": "Select your preferred dashboard language",
    "appearance": "Appearance Settings",
    "appearanceDesc": "Change the theme and primary color"
  },
  "tabs": {
    "insurance": "Insurance Details",
    "education": "Educational Background"
  },
  "fields": {
    "provider": "Insurance Provider",
    "type": "Insurance Type",
    "insuranceCode": "Insurance Code",
    "validUntil": "Valid Until",
    "degree": "Degree",
    "fieldOfStudy": "Field of Study",
    "university": "University",
    "graduationYear": "Graduation Year"
  },
  "actions": {
    "save": "Save Changes"
  },
  "notSet": "Not Set",
  "errorLoading": "Error loading user profile"
};

function addProfile(path, profileData) {
  const content = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(content);
  if (!json.Profile) {
    json.Profile = profileData;
  } else {
    json.Profile = { ...json.Profile, ...profileData };
  }
  fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
}

addProfile(faPath, faProfile);
addProfile(enPath, enProfile);

console.log('Translations added successfully.');
