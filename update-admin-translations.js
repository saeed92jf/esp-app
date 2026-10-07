const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const adminFa = {
  "userAccessManagement": "مدیریت دسترسی کاربران",
  "searchUser": "جستجوی کاربر...",
  "systemAdmin": "مدیر سیستم",
  "normalUser": "کاربر عادی",
  "online": "آنلاین",
  "offline": "آفلاین",
  "activeModules": "ماژول‌های فعال",
  "todayOperations": "عملیات امروز",
  "securityStatus": "وضعیت امنیت",
  "twoFactorEnabled": "تایید دو مرحله‌ای فعال است",
  "usersList": "لیست کاربران",
  "viewAll": "مشاهده همه",
  "adminRole": "مدیر",
  "userRole": "کاربر",
  "moduleAccess": "دسترسی به ماژول‌ها",
  "manageAccessDesc": "مدیریت سطح دسترسی {name} به بخش‌های مختلف سیستم",
  "saveChanges": "ذخیره تغییرات",
  "subsections": "زیربخش",
  "readAccess": "مشاهده (Read)",
  "writeAccess": "ویرایش (Write)",
  "adminAccess": "مدیریت (Admin)",
  "active": "فعال",
  "inactive": "غیرفعال",
  "userActivityLevel": "میزان فعالیت کاربر",
  "lastLogins": "آخرین ورودها",
  "all": "همه",
  "accessUpdated": "دسترسی بروزرسانی شد",
  "accessLevelChanged": "سطح دسترسی تغییر کرد",
  "systemLogin": "ورود به سیستم",
  "time1042": "10:42 AM",
  "yesterday": "دیروز",
  "financeModuleLogin": "ورود به ماژول مالی",
  "twoDaysAgo": "۲ روز پیش",
  "downloadReport": "دانلود گزارش جامع"
};

const adminEn = {
  "userAccessManagement": "User Access Management",
  "searchUser": "Search user...",
  "systemAdmin": "System Admin",
  "normalUser": "Normal User",
  "online": "Online",
  "offline": "Offline",
  "activeModules": "Active Modules",
  "todayOperations": "Today's Operations",
  "securityStatus": "Security Status",
  "twoFactorEnabled": "Two-factor authentication is enabled",
  "usersList": "Users List",
  "viewAll": "View all",
  "adminRole": "Admin",
  "userRole": "User",
  "moduleAccess": "Module Access",
  "manageAccessDesc": "Manage {name}'s access level to different parts of the system",
  "saveChanges": "Save Changes",
  "subsections": "subsections",
  "readAccess": "Read",
  "writeAccess": "Write",
  "adminAccess": "Admin",
  "active": "Active",
  "inactive": "Inactive",
  "userActivityLevel": "User Activity Level",
  "lastLogins": "Recent Logins",
  "all": "All",
  "accessUpdated": "Access updated successfully",
  "accessLevelChanged": "Access level changed successfully",
  "systemLogin": "System Login",
  "time1042": "10:42 AM",
  "yesterday": "Yesterday",
  "financeModuleLogin": "Finance Module Login",
  "twoDaysAgo": "2 days ago",
  "downloadReport": "Comprehensive Report Download"
};

faData.Admin = { ...faData.Admin, ...adminFa };
enData.Admin = { ...enData.Admin, ...adminEn };

fs.writeFileSync(faPath, JSON.stringify(faData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');

console.log('Translations updated successfully.');
