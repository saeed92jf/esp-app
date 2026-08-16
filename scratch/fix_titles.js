const fs = require('fs');
const file = '../src/modules/dashboard/services/dashboard.service.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace title: "" with title: "جمعه" for official holidays
code = code.replace(/title:\s*['"]['"]/g, 'title: "جمعه"');

fs.writeFileSync(file, code);
console.log('Fixed Friday titles!');
