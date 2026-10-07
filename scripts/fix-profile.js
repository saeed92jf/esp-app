const fs = require('fs');

const file = 'd:/esp-app/src/modules/profile/components/profile-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The pattern to find the exact className line and replace it
// It could span multiple lines in formatting, but we see it in the grep output as one line for the string.
const regex = /className="(bg-background[^"]*?)hover:bg-muted\/40 transition-colors([^"]*?group[^"]*?)"\s*>/g;
const regex2 = /className="([^"]*?)hover:bg-muted\/40 transition-colors([^"]*?group[^"]*?h-\[72px\])"/g;

// Instead of being clever, let's just replace the exact string "hover:bg-muted/40 transition-colors"
// But we need to insert the span. To do that, we find the whole div tag.

// A safe way: replace:
// hover:bg-muted/40 transition-colors cursor-pointer group h-[72px]"
// >
// with
// cursor-pointer group relative outline-none h-[72px]"
// >
// <span className="absolute inset-0 bg-muted/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:duration-[50ms] pointer-events-none" aria-hidden="true" />

let count = 0;

content = content.replace(
  /hover:bg-muted\/40 transition-colors (cursor-pointer group h-\[72px\])"\s*(onClick=\{[^}]+\})?\s*>\s*/g, 
  (match, p1, p2) => {
    count++;
    const clickAttr = p2 ? `\n            ${p2}` : '';
    return `relative outline-none ${p1}"${clickAttr}\n          >\n             <span className="absolute inset-0 bg-muted/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:duration-[50ms] pointer-events-none" aria-hidden="true" />\n             `;
  }
);

content = content.replace(
  /hover:bg-muted\/40 transition-colors cursor-pointer group h-\[72px\]",/g,
  `relative outline-none cursor-pointer group h-[72px]",\n                    /* NOTE: manual span needed if cn() is used */`
);

// One case has:
// isAdmin ? "cursor-pointer hover:bg-muted/40 group" : "opacity-60 cursor-not-allowed"
content = content.replace(
  /isAdmin \? "cursor-pointer hover:bg-muted\/40 group" : "opacity-60 cursor-not-allowed"/g,
  `isAdmin ? "cursor-pointer group relative outline-none" : "opacity-60 cursor-not-allowed"`
);
// And insert span manually where this is used (line 1513)

fs.writeFileSync(file, content, 'utf8');
console.log(`Replaced ${count} occurrences.`);
