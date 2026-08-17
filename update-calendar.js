const fs = require('fs');
const path = 'src/modules/dashboard/components/calendar-widget.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add timeFilter state
content = content.replace(
  'const [typeFilter, setTypeFilter] = React.useState<string>("all");',
  'const [typeFilter, setTypeFilter] = React.useState<string>("all");\n  const [timeFilter, setTimeFilter] = React.useState<"all"|"past"|"upcoming">("all");'
);

// 2. Add time filter to filteredEvents
const timeFilterLogic = `
    // Apply timeFilter (past/upcoming)
    if (timeFilter !== "all") {
      const todayJalali = getJalaliDate(new Date());
      const todayStr = \`\${todayJalali.year}-\${String(todayJalali.month).padStart(2, "0")}-\${String(todayJalali.day).padStart(2, "0")}\`;
      result = result.filter(e => {
        if (timeFilter === "past") return e.date < todayStr;
        if (timeFilter === "upcoming") return e.date >= todayStr;
        return true;
      });
    }

    // Apply Type Filter`;

content = content.replace('    // Apply Type Filter', timeFilterLogic);

// Add dependencies to useMemo
content = content.replace(
  '[localEvents, selectedDate, viewMode, typeFilter]',
  '[localEvents, selectedDate, viewMode, typeFilter, timeFilter]'
);

// 3. Replace Type Filter buttons with Select
const typeFilterButtonsRegex = /\{\/\* Type Filter \(Secondary Tabs\) \*\/\}[\s\S]*?\<\/div\>/m;
const typeFilterSelect = `{/* Type Filter (Secondary Tabs) */}
      <div className="px-1 pb-1 pt-1">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 text-xs font-semibold w-full bg-background border-border shadow-sm">
            <SelectValue placeholder={t("views.all")} />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">{t("views.all")}</SelectItem>
            <SelectItem value="official">{t("types.official")}</SelectItem>
            <SelectItem value="fair">{t("types.fair")}</SelectItem>
            <SelectItem value="company_event">{t("types.company_event")}</SelectItem>
            <SelectItem value="birthday">{t("types.birthday")}</SelectItem>
            <SelectItem value="meeting">{t("types.meeting")}</SelectItem>
            <SelectItem value="event">{t("types.event")}</SelectItem>
          </SelectContent>
        </Select>
      </div>`;

content = content.replace(typeFilterButtonsRegex, typeFilterSelect);

// 4. Update events list header to include time filters
const eventsListHeaderRegex = /<div className="flex justify-between items-center px-2 mb-1">\s*<span className="text-\[11px\] font-semibold text-muted-foreground">\s*\{t\("eventsCount", \{ count: filteredEvents\.length \}\)\}\s*<\/span>\s*<\/div>/m;
const newEventsListHeader = `<div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-2 mb-2 gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
          {t("eventsCount", { count: filteredEvents.length })}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <button 
            onClick={() => setTimeFilter("all")}
            className={cn("text-[10px] px-2 py-0.5 rounded-full transition-colors font-medium", timeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >
            {t("filters.all")}
          </button>
          <button 
            onClick={() => setTimeFilter("past")}
            className={cn("text-[10px] px-2 py-0.5 rounded-full transition-colors font-medium", timeFilter === "past" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >
            {t("filters.past")}
          </button>
          <button 
            onClick={() => setTimeFilter("upcoming")}
            className={cn("text-[10px] px-2 py-0.5 rounded-full transition-colors font-medium", timeFilter === "upcoming" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >
            {t("filters.upcoming")}
          </button>
        </div>
      </div>`;

content = content.replace(eventsListHeaderRegex, newEventsListHeader);

fs.writeFileSync(path, content, 'utf8');
console.log('Update completed successfully.');
