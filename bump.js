const fs = require('fs');
let code = fs.readFileSync('src/modules/dashboard/services/dashboard.service.ts', 'utf8');
code = code.replace(/"1403-/g, '"1405-').replace(/"1404-/g, '"1406-');
fs.writeFileSync('src/modules/dashboard/services/dashboard.service.ts', code);
console.log("Bumped years");
