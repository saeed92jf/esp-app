const fs = require('fs');

const path = 'src/modules/dashboard/components/calendar-widget.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add AnimatePresence import
if (!content.includes('AnimatePresence')) {
  content = content.replace(
    'import { motion } from "motion/react";',
    'import { motion, AnimatePresence } from "motion/react";'
  );
}

// 2. Fix Accordion Lag
// Replace the CSS grid accordion with a Framer Motion AnimatePresence accordion
const accordionRegex = /\{\/\* Add Event Form Panel \*\/\}\s*<div className=\{cn\(\s*"grid transition-all duration-300 ease-in-out",\s*isFormVisible \? "grid-rows-\[1fr\] opacity-100 border-t border-border\/30" : "grid-rows-\[0fr\] opacity-0"\s*\)\}>\s*<div className="overflow-hidden bg-muted\/10">([\s\S]*?)<\/div>\s*<\/div>/m;

const newAccordion = `{/* Add Event Form Panel */}
        <AnimatePresence initial={false}>
          {isFormVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border/30 bg-muted/10"
            >
              $1
            </motion.div>
          )}
        </AnimatePresence>`;

content = content.replace(accordionRegex, newAccordion);

// 3. To completely eliminate layoutId lag when siblings change height, 
// we should wrap the whole calendar widget content in a motion.div layout? 
// No, framer-motion height:auto handles it, but layoutId elements might still measure viewport.
// Let's add 'layout' to the tab containers to make them react natively to the layout shifts.
content = content.replace(
  '<div className="flex gap-1.5 pb-2 px-1 w-full bg-muted/20 p-1.5 rounded-xl border border-border/40">',
  '<motion.div layout className="flex gap-1.5 pb-2 px-1 w-full bg-muted/20 p-1.5 rounded-xl border border-border/40">'
);
content = content.replace(
  '{(["year", "month", "week", "day"] as const).map(mode => (',
  '{(["year", "month", "week", "day"] as const).map(mode => ('
);
// Replace closing div of view toggle
content = content.replace(
  /<\/button>\s*\)\)\}\s*<\/div>/m,
  '</button>\n        ))}\n      </motion.div>'
);

// Do the same for timeFilter tabs
content = content.replace(
  '<div className="flex gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-border/40">',
  '<motion.div layout className="flex gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-border/40">'
);
// Also change the active color to primary
content = content.replace(
  'timeFilter === filter ? "text-foreground" : "text-muted-foreground hover:text-foreground"',
  'timeFilter === filter ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"'
);
content = content.replace(
  'className="absolute inset-0 bg-background shadow-sm rounded-lg"',
  'className="absolute inset-0 bg-primary shadow-sm rounded-lg"'
);
// Replace closing div of time filters
content = content.replace(
  /<\/button>\s*\)\)\}\s*<\/div>/g,
  '</button>\n          ))}\n        </motion.div>'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Calendar UI bugs fixed!");
