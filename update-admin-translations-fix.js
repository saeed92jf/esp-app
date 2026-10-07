const fs = require('fs');

const faPath = 'd:/esp-app/messages/fa.json';
const enPath = 'd:/esp-app/messages/en.json';

const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

faData.Admin.passwordChange = "تغییر رمز عبور";
enData.Admin.passwordChange = "Password Change";

fs.writeFileSync(faPath, JSON.stringify(faData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');

console.log('Translations fixed successfully.');
