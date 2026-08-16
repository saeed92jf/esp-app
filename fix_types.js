const fs = require('fs');
let code = fs.readFileSync('src/modules/dashboard/services/dashboard.service.ts', 'utf8');

// Replace type for fair events
let parsedCode = code;
let matchFair = parsedCode.match(/id:\s*"fair-[\s\S]*?type:\s*"event"/g);
if (matchFair) {
    matchFair.forEach(match => {
        parsedCode = parsedCode.replace(match, match.replace(/"event"$/, '"fair"'));
    });
}

// Replace type for hol events
let matchHol = parsedCode.match(/id:\s*"hol-[\s\S]*?type:\s*"deadline"/g);
if (matchHol) {
    matchHol.forEach(match => {
        parsedCode = parsedCode.replace(match, match.replace(/"deadline"$/, '"official"'));
    });
}

fs.writeFileSync('src/modules/dashboard/services/dashboard.service.ts', parsedCode);
console.log("Replaced types");
