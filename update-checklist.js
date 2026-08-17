const fs = require('fs');
const p = 'src/modules/dashboard/components/checklist-widget.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from "@\/components\/ui\/select";\r?\n/g, '');
fs.writeFileSync(p, c);
console.log("Done");
