const fs = require('fs');
const path = 'src/modules/dashboard/components/calendar-widget.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ChevronDown to imports
content = content.replace(
  'import { Users, Clock, Eye, Calendar as CalendarIcon, X, Flag, Store, PartyPopper, Cake, Plus } from "lucide-react";',
  'import { Users, Clock, Eye, Calendar as CalendarIcon, X, Flag, Store, PartyPopper, Cake, Plus, ChevronDown } from "lucide-react";'
);

// 2. We need to find and remove the toggle button from inside the DatePicker div.
const toggleButtonRegex = /\s*\{\/\* Toggle Form Button \*\/\}\s*<div\s*className="flex justify-center mt-3 pt-3 border-t border-border\/30 cursor-pointer text-muted-foreground hover:text-primary transition-colors text-xs font-medium"\s*onClick=\{\(\) => setIsFormVisible\(!isFormVisible\)\}\s*>\s*<div className="flex items-center gap-1">\s*\{t\("addPlaceholder"\)\}\s*<Plus className=\{cn\("size-3\.5 transition-transform duration-300", isFormVisible && "rotate-45"\)\} \/>\s*<\/div>\s*<\/div>/m;
content = content.replace(toggleButtonRegex, '');

// 3. We need to replace the old Add Event Form structure
const oldFormRegex = /\s*\{\/\* Add Event Form \*\/\}\s*<div className=\{cn\(\s*"grid transition-all duration-300 ease-in-out",\s*isFormVisible \? "grid-rows-\[1fr\] opacity-100" : "grid-rows-\[0fr\] opacity-0"\s*\)\}>\s*<div className="overflow-hidden">\s*<form onSubmit=\{addEvent\} className="flex flex-col gap-2 px-1 pb-3">\s*<Input\s*type="text"\s*value=\{newEventTitle\}\s*onChange=\{\(e\) => setNewEventTitle\(e\.target\.value\)\}\s*placeholder=\{t\("addPlaceholder"\)\}\s*className="h-9 text-sm"\s*\/>\s*<div className="flex gap-2">\s*<Select value=\{newEventType\} onValueChange=\{setNewEventType\}>\s*<SelectTrigger className="h-9 flex-1 text-xs rtl:text-right" dir="rtl">\s*<SelectValue \/>\s*<\/SelectTrigger>\s*<SelectContent className="z-\[9999\]" dir="rtl">\s*<SelectItem value="event" className="rtl:text-right rtl:justify-end">\{t\("types\.event"\)\}<\/SelectItem>\s*<SelectItem value="official" className="rtl:text-right rtl:justify-end">\{t\("types\.official"\)\}<\/SelectItem>\s*<SelectItem value="fair" className="rtl:text-right rtl:justify-end">\{t\("types\.fair"\)\}<\/SelectItem>\s*<SelectItem value="meeting" className="rtl:text-right rtl:justify-end">\{t\("types\.meeting"\)\}<\/SelectItem>\s*<SelectItem value="company_event" className="rtl:text-right rtl:justify-end">\{t\("types\.company_event"\)\}<\/SelectItem>\s*<SelectItem value="birthday" className="rtl:text-right rtl:justify-end">\{t\("types\.birthday"\)\}<\/SelectItem>\s*<\/SelectContent>\s*<\/Select>\s*<Button type="submit" variant="default" className="h-9">\s*\{t\("add"\)\}\s*<\/Button>\s*<\/div>\s*<\/form>\s*<\/div>\s*<\/div>/m;

const newFormSection = `
      {/* Add Event Standalone Section */}
      <div className="bg-background/40 rounded-xl border border-border/40 overflow-hidden">
        {/* Toggle Button */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer text-muted-foreground hover:text-primary hover:bg-muted/20 transition-colors"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <span className="text-xs font-semibold rtl:text-right w-full">{t("addPlaceholder")}</span>
          <ChevronDown className={cn("size-4 transition-transform duration-300", isFormVisible && "rotate-180")} />
        </div>

        {/* Add Event Form Panel */}
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          isFormVisible ? "grid-rows-[1fr] opacity-100 border-t border-border/30" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden bg-muted/10">
            <form onSubmit={addEvent} className="flex flex-col gap-2 p-3">
              <Input 
                type="text" 
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder={t("addPlaceholder")}
                className="h-9 text-xs border-transparent bg-background shadow-sm hover:border-border focus-visible:ring-1 focus-visible:ring-primary rtl:text-right"
              />
              <div className="flex gap-2">
                <Select value={newEventType} onValueChange={setNewEventType}>
                  <SelectTrigger className="h-9 flex-1 text-xs border-transparent bg-background shadow-sm hover:border-border rtl:text-right" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" dir="rtl">
                    <SelectItem value="event" className="rtl:text-right rtl:justify-end">{t("types.event")}</SelectItem>
                    <SelectItem value="official" className="rtl:text-right rtl:justify-end">{t("types.official")}</SelectItem>
                    <SelectItem value="fair" className="rtl:text-right rtl:justify-end">{t("types.fair")}</SelectItem>
                    <SelectItem value="meeting" className="rtl:text-right rtl:justify-end">{t("types.meeting")}</SelectItem>
                    <SelectItem value="company_event" className="rtl:text-right rtl:justify-end">{t("types.company_event")}</SelectItem>
                    <SelectItem value="birthday" className="rtl:text-right rtl:justify-end">{t("types.birthday")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="default" className="h-9 text-xs px-4 shadow-sm">
                  {t("add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

content = content.replace(oldFormRegex, newFormSection);

fs.writeFileSync(path, content, 'utf8');
console.log('Update completed.');
