const fs = require('fs');

// calendar-widget.tsx
const calPath = 'src/modules/dashboard/components/calendar-widget.tsx';
let calContent = fs.readFileSync(calPath, 'utf8');

const timeFilterRegex = /\{\/\* Time filters in one row \*\/\}\s*<div className="flex items-center justify-between gap-1 bg-muted\/30 p-1 rounded-lg">\s*<button\s*onClick=\{\(\) => setTimeFilter\("all"\)\}\s*className=\{cn\("flex-1 text-\[10px\] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "all" \? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"\)\}\s*>\s*\{t\("filters\.all"\)\}\s*<\/button>\s*<button\s*onClick=\{\(\) => setTimeFilter\("past"\)\}\s*className=\{cn\("flex-1 text-\[10px\] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "past" \? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"\)\}\s*>\s*\{t\("filters\.past"\)\}\s*<\/button>\s*<button\s*onClick=\{\(\) => setTimeFilter\("upcoming"\)\}\s*className=\{cn\("flex-1 text-\[10px\] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "upcoming" \? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"\)\}\s*>\s*\{t\("filters\.upcoming"\)\}\s*<\/button>\s*<\/div>/m;

const newTimeFilter = `{/* Time filters in one row */}
        <div className="flex gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-border/40">
          {(["all", "past", "upcoming"] as const).map(filter => (
            <button 
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                "relative flex-1 text-[10px] sm:text-xs py-1.5 rounded-lg transition-colors font-medium text-center outline-none",
                timeFilter === filter ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {timeFilter === filter && (
                <motion.div
                  layoutId="calendar-time-tab"
                  className="absolute inset-0 bg-background shadow-sm rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t(\`filters.\${filter}\`)}</span>
            </button>
          ))}
        </div>`;

calContent = calContent.replace(timeFilterRegex, newTimeFilter);
fs.writeFileSync(calPath, calContent, 'utf8');

console.log("Time filters updated with framer-motion");
