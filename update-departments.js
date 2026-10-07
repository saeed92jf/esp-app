const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

let fa = JSON.parse(fs.readFileSync(faPath, 'utf8'));
fa.Admin = fa.Admin || {};
fa.Admin.departments = {
  "engineering": "مهندسی",
  "marketDevelopment": "توسعه بازار",
  "projectControl": "کنترل پروژه",
  "administrative": "اداری",
  "rAndD": "توسعه و تحقیق"
};
fs.writeFileSync(faPath, JSON.stringify(fa, null, 2));

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.Admin = en.Admin || {};
en.Admin.departments = {
  "engineering": "Engineering",
  "marketDevelopment": "Market Development",
  "projectControl": "Project Control",
  "administrative": "Administrative",
  "rAndD": "R&D"
};
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

console.log("Departments translated!");
