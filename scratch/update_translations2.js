const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const faPath = path.join(__dirname, '../messages/fa.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fa = JSON.parse(fs.readFileSync(faPath, 'utf8'));

en.Flow.nodes.projectDataNode.placeholders.browse = "Browse";
fa.Flow.nodes.projectDataNode.placeholders.browse = "انتخاب فایل";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(faPath, JSON.stringify(fa, null, 2) + '\n');

console.log("Translations updated");
