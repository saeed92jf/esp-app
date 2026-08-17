const fs = require('fs');

// 1. calendar-widget.tsx
const calPath = 'src/modules/dashboard/components/calendar-widget.tsx';
let calContent = fs.readFileSync(calPath, 'utf8');

// Add motion import if not present
if (!calContent.includes('import { motion } from "motion/react"')) {
  calContent = calContent.replace(
    'import { useTranslations } from "next-intl";',
    'import { useTranslations } from "next-intl";\nimport { motion } from "motion/react";'
  );
}

// Replace View Toggle
const calToggleRegex = /\{\/\* View Toggle \*\/\}\s*<div className="grid grid-cols-4 gap-1\.5 pb-2 px-1 w-full">\s*\{\(\["year", "month", "week", "day"\] as const\)\.map\(mode => \(\s*<button\s*key=\{mode\}\s*onClick=\{\(\) => setViewMode\(mode\)\}\s*className=\{cn\(\s*"w-full py-1\.5 rounded-lg text-\[11px\] @sm:text-xs font-semibold transition-colors",\s*viewMode === mode\s*\?\s*"bg-primary text-primary-foreground shadow-sm"\s*:\s*"bg-muted text-muted-foreground hover:bg-muted\/80"\s*\)\}\s*>\s*\{t\(`views\.\$\{mode\}`\)\}\s*<\/button>\s*\)\)\}\s*<\/div>/m;

const calNewToggle = `{/* View Toggle */}
      <div className="flex gap-1.5 pb-2 px-1 w-full bg-muted/20 p-1.5 rounded-xl border border-border/40">
        {(["year", "month", "week", "day"] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "relative flex-1 py-1.5 rounded-lg text-[11px] @sm:text-xs font-semibold transition-colors outline-none",
              viewMode === mode 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {viewMode === mode && (
              <motion.div
                layoutId="calendar-view-tab"
                className="absolute inset-0 bg-primary shadow-sm rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t(\`views.\${mode}\`)}</span>
          </button>
        ))}
      </div>`;

calContent = calContent.replace(calToggleRegex, calNewToggle);
fs.writeFileSync(calPath, calContent, 'utf8');


// 2. checklist-widget.tsx
const checkPath = 'src/modules/dashboard/components/checklist-widget.tsx';
let checkContent = fs.readFileSync(checkPath, 'utf8');

// Add motion import if not present
if (!checkContent.includes('import { motion } from "motion/react"')) {
  checkContent = checkContent.replace(
    'import { useTranslations } from "next-intl";',
    'import { useTranslations } from "next-intl";\nimport { motion } from "motion/react";'
  );
}

// Replace Category Tabs
const checkTabsRegex = /\{\/\* Category Tabs \*\/\}\s*<div className="flex items-center gap-1\.5 mb-3 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">\s*<button\s*onClick=\{\(\) => setActiveTab\("all"\)\}\s*className=\{cn\(\s*"px-3 py-1 rounded-full text-\[11px\] @sm:text-xs font-semibold whitespace-nowrap transition-colors",\s*activeTab === "all"\s*\?\s*"bg-primary text-primary-foreground shadow-sm"\s*:\s*"bg-muted text-muted-foreground hover:bg-muted\/80"\s*\)\}\s*>\s*\{t\('all'\)\}\s*<\/button>\s*\{categories\.map\(\(cat\) => \(\s*<button\s*key=\{cat\}\s*onClick=\{\(\) => setActiveTab\(cat\)\}\s*className=\{cn\(\s*"group relative px-3 py-1 pe-7 rounded-full text-\[11px\] @sm:text-xs font-semibold whitespace-nowrap transition-colors flex items-center",\s*activeTab === cat\s*\?\s*"bg-primary text-primary-foreground shadow-sm"\s*:\s*"bg-muted text-muted-foreground hover:bg-muted\/80"\s*\)\}\s*>\s*\{cat\}\s*<span\s*onClick=\{\(e\) => deleteCategory\(e, cat\)\}\s*className="absolute end-1\.5 p-0\.5 rounded-full hover:bg-black\/20 opacity-0 group-hover:opacity-100 transition-opacity"\s*>\s*<X className="size-3" \/>\s*<\/span>\s*<\/button>\s*\)\)\}\s*<\/div>/m;

const checkNewTabs = `{/* Category Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1 relative">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "relative px-3 py-1 text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors rounded-full outline-none",
            activeTab === "all" 
              ? "text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeTab === "all" && (
            <motion.div
              layoutId="checklist-category-tab"
              className="absolute inset-0 bg-primary shadow-sm rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t('all')}</span>
        </button>
        
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "group relative px-3 py-1 pe-7 text-[11px] @sm:text-xs font-semibold whitespace-nowrap transition-colors flex items-center rounded-full outline-none",
              activeTab === cat 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === cat && (
              <motion.div
                layoutId="checklist-category-tab"
                className="absolute inset-0 bg-primary shadow-sm rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
            <span 
              onClick={(e) => deleteCategory(e, cat)}
              className="absolute end-1.5 p-0.5 rounded-full hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="size-3" />
            </span>
          </button>
        ))}
      </div>`;

checkContent = checkContent.replace(checkTabsRegex, checkNewTabs);
fs.writeFileSync(checkPath, checkContent, 'utf8');

console.log("Tabs updated with framer-motion sliding animations");
