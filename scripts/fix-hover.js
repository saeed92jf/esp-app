const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: profile-page.tsx specific list items
  // <div ... className="... hover:bg-muted/40 transition-colors cursor-pointer group ..." ... >
  // Note: we're using a very specific regex that matches the profile-page layout.
  
  // Actually, let's look for:
  // className="bg-background [^"]*hover:bg-muted/40 transition-colors cursor-pointer group h-\[72px\]"
  const profileRegex = /className="(bg-background[^"]*?)hover:bg-muted\/40 transition-colors([^"]*?group[^"]*?)"\s*>(\s*)/g;
  
  content = content.replace(profileRegex, (match, before, after, space) => {
    // Make sure we have 'relative' if it doesn't exist (it doesn't in those divs)
    let newClass = `className="relative outline-none ${before}${after}"`.replace(/\s+/g, ' ');
    // GPU Span
    let span = `<span className="absolute inset-0 bg-muted/40 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:duration-[50ms] pointer-events-none" aria-hidden="true" />`;
    return `${newClass}>${space}${span}\n${space}`;
  });

  // Pattern 2: QuickAccessSection toggle button
  // className="text-muted-foreground/40 hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted/50 flex items-center justify-center"
  const toggleRegex = /className="text-muted-foreground\/40 hover:text-foreground transition-colors p-1\.5 rounded-full hover:bg-muted\/50 flex items-center justify-center"/g;
  content = content.replace(toggleRegex, `className="group relative outline-none text-muted-foreground/40 p-1.5 rounded-full flex items-center justify-center"`);
  
  // We'd have to insert the span manually there, which is harder with regex because we need to put it inside the button.
  // Actually, we can just replace the whole button in QuickAccessSection if needed.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const srcDir = path.join(__dirname, '..', 'src');
console.log('Scanning source directory for hover patterns...');
walk(srcDir, processFile);
console.log('Done.');
