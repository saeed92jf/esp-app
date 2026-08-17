const fs = require('fs');

const path = 'src/modules/dashboard/components/calendar-widget.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const eventTypeOptions = React\.useMemo\(\(\) => \[\s*\{ value: "event", label: t\("types\.event"\) \},\s*\{ value: "official", label: t\("types\.official"\) \},\s*\{ value: "fair", label: t\("types\.fair"\) \},\s*\{ value: "meeting", label: t\("types\.meeting"\) \},\s*\{ value: "company_event", label: t\("types\.company_event"\) \},\s*\], \[t\]\);/m;

const replacement = `const eventTypeOptions = React.useMemo(() => [
    { value: "event", label: t("types.event"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.event)} /> },
    { value: "official", label: t("types.official"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.official)} /> },
    { value: "fair", label: t("types.fair"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.fair)} /> },
    { value: "meeting", label: t("types.meeting"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.meeting)} /> },
    { value: "company_event", label: t("types.company_event"), icon: <span className={cn("size-2.5 rounded-full shrink-0 shadow-sm", TYPE_DOT_COLORS.company_event)} /> },
  ], [t]);`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log("calendar-widget updated with icons");
