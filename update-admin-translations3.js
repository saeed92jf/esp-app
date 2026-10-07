const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const adminFa = {
  "remote": "دورکاری / مرخصی",
  "salary": "حقوق",
  "avg": "میانگین",
  "0h": "۰ ساعت",
  "moreThan2h": "> ۲س",
  "moreThan4h": "> ۴س",
  "moreThan8h": "> ۸س",
  "15members": "{count} عضو"
};

const adminEn = {
  "remote": "Hybrid / Leave",
  "salary": "Salary",
  "avg": "Avg",
  "0h": "0h",
  "moreThan2h": ">2h",
  "moreThan4h": ">4h",
  "moreThan8h": ">8h",
  "15members": "{count} members"
};

faData.Admin = { ...faData.Admin, ...adminFa };
enData.Admin = { ...enData.Admin, ...adminEn };

fs.writeFileSync(faPath, JSON.stringify(faData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');

console.log('Translations for new fields added successfully.');
