const fs = require('fs');
const path = require('path');

// 1. Remove birthday from mock data
const servicePath = 'src/modules/dashboard/services/dashboard.service.ts';
let serviceContent = fs.readFileSync(servicePath, 'utf8');
serviceContent = serviceContent.replace(/ \| 'birthday'/g, '');
serviceContent = serviceContent.replace(/,\s*\{\s*"id": "[^"]+",\s*"title": "[^"]+",\s*"date": "[^"]+",\s*"type": "birthday"\s*\}/g, '');
// Handle case where birthday might be the first item
serviceContent = serviceContent.replace(/\{\s*"id": "[^"]+",\s*"title": "[^"]+",\s*"date": "[^"]+",\s*"type": "birthday"\s*\},\s*/g, '');
fs.writeFileSync(servicePath, serviceContent, 'utf8');

// 2. Remove birthday from translations
const faPath = 'src/modules/dashboard/messages/fa.json';
let faContent = fs.readFileSync(faPath, 'utf8');
faContent = faContent.replace(/,\s*"birthday":\s*"[^"]+"/g, '');
fs.writeFileSync(faPath, faContent, 'utf8');

const enPath = 'src/modules/dashboard/messages/en.json';
let enContent = fs.readFileSync(enPath, 'utf8');
enContent = enContent.replace(/,\s*"birthday":\s*"[^"]+"/g, '');
fs.writeFileSync(enPath, enContent, 'utf8');

// 3. Update calendar-widget.tsx
const widgetPath = 'src/modules/dashboard/components/calendar-widget.tsx';
let widgetContent = fs.readFileSync(widgetPath, 'utf8');

// Replace imports
widgetContent = widgetContent.replace(
  'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";',
  'import { Combobox } from "@/components/ui/combobox";'
);

// Remove birthday from constants
widgetContent = widgetContent.replace(/\s*birthday:\s*Cake,/g, '');
widgetContent = widgetContent.replace(/\s*birthday:\s*"[^"]+",/g, '');
widgetContent = widgetContent.replace(/Cake,\s*/g, '');

// Remove birthday specific logic in getEventColors
widgetContent = widgetContent.replace(
  /\s*\/\/ Do not show badges for birthdays\s*if \(e\.type === "birthday"\) return;/g,
  ''
);

// Add options definition before return statement
const returnRegex = /return \(/;
const optionsCode = `
  const eventTypeOptions = React.useMemo(() => [
    { value: "event", label: t("types.event") },
    { value: "official", label: t("types.official") },
    { value: "fair", label: t("types.fair") },
    { value: "meeting", label: t("types.meeting") },
    { value: "company_event", label: t("types.company_event") },
  ], [t]);

  const filterTypeOptions = React.useMemo(() => [
    { value: "all", label: t("views.all") },
    ...eventTypeOptions
  ], [t, eventTypeOptions]);

  return (`;
widgetContent = widgetContent.replace(returnRegex, optionsCode);

// Replace Select with Combobox in form
const formSelectRegex = /<Select value=\{newEventType\} onValueChange=\{setNewEventType\}>[\s\S]*?<\/Select>/;
const formCombobox = `<Combobox 
                  options={eventTypeOptions}
                  value={newEventType}
                  onChange={(val) => setNewEventType(val || "event")}
                  className="h-9 flex-1 text-xs rtl:text-right"
                  showSearch={false}
                />`;
widgetContent = widgetContent.replace(formSelectRegex, formCombobox);

// Replace Select with Combobox in type filter
const filterSelectRegex = /<div className="px-1 pb-1 pt-1">\s*<Select value=\{typeFilter\} onValueChange=\{setTypeFilter\}>[\s\S]*?<\/Select>\s*<\/div>/;
const filterCombobox = `<div className="px-1 pb-1 pt-1">
        <Combobox 
          options={filterTypeOptions}
          value={typeFilter}
          onChange={(val) => setTypeFilter(val || "all")}
          className="h-8 text-xs font-semibold w-full bg-background border-border shadow-sm rtl:text-right"
          showSearch={false}
        />
      </div>`;
widgetContent = widgetContent.replace(filterSelectRegex, filterCombobox);

fs.writeFileSync(widgetPath, widgetContent, 'utf8');
console.log('Update completed.');
