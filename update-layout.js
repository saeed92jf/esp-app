const fs = require('fs');
const path = 'src/modules/dashboard/components/calendar-widget.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Re-layout the events list header: Time filters above the count.
const eventsListHeaderRegex = /<div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-2 mb-2 gap-2">[\s\S]*?<\/div>\s*<\/div>/m;
const newEventsListHeader = `{/* Events list header */}
      <div className="flex flex-col gap-2 px-2 mb-2">
        {/* Time filters in one row */}
        <div className="flex items-center justify-between gap-1 bg-muted/30 p-1 rounded-lg">
          <button 
            onClick={() => setTimeFilter("all")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.all")}
          </button>
          <button 
            onClick={() => setTimeFilter("past")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "past" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.past")}
          </button>
          <button 
            onClick={() => setTimeFilter("upcoming")}
            className={cn("flex-1 text-[10px] sm:text-xs py-1 rounded-md transition-colors font-medium text-center", timeFilter === "upcoming" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t("filters.upcoming")}
          </button>
        </div>
        {/* Count */}
        <span className="text-[11px] font-semibold text-muted-foreground rtl:text-right">
          {t("eventsCount", { count: filteredEvents.length })}
        </span>
      </div>`;

content = content.replace(eventsListHeaderRegex, newEventsListHeader);

// 2. Right align Select triggers and items
// We use simple replaces for each line
content = content.replace(/<SelectTrigger className="([^"]+)">/g, '<SelectTrigger className="$1 rtl:text-right" dir="rtl">');
content = content.replace(/<SelectContent className="([^"]+)">/g, '<SelectContent className="$1" dir="rtl">');
content = content.replace(/<SelectItem value="([^"]+)">/g, '<SelectItem value="$1" className="rtl:text-right rtl:justify-end">');

fs.writeFileSync(path, content, 'utf8');
console.log('Update completed.');
