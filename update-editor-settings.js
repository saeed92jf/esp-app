const fs = require('fs');
const path = 'src/modules/claude-flow/components/EditorSettingsDialog.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Select imports
const selectImportsRegex = /import \{\s*Select,\s*SelectContent,\s*SelectItem,\s*SelectTrigger,\s*SelectValue,\s*\} from "@\/components\/ui\/select";/m;
content = content.replace(selectImportsRegex, 'import { Combobox } from "@/components/ui/combobox";');

// Grid Size Select -> Combobox
// From: <Select value={String(settings.snapGrid[0])} onValueChange={(v: string) => set("snapGrid", [Number(v), Number(v)])}> ... </Select>
const gridSelectRegex = /<Select\s*value=\{String\(settings\.snapGrid\[0\]\)\}\s*onValueChange=\{\(v: string\) => set\("snapGrid", \[Number\(v\), Number\(v\)\]\)\}\s*>[\s\S]*?<\/Select>/;
const gridCombobox = `<Combobox
                  value={String(settings.snapGrid[0])}
                  onChange={(v) => { if(v) set("snapGrid", [Number(v), Number(v)]); }}
                  options={[5, 10, 15, 20, 25, 50].map(g => ({ value: String(g), label: \`\${g}px\` }))}
                  className="w-24"
                  showSearch={false}
                />`;
content = content.replace(gridSelectRegex, gridCombobox);

// Background Variant Select -> Combobox
const bgSelectRegex = /<Select value=\{settings\.backgroundVariant\} onValueChange=\{\(v: any\) => set\("backgroundVariant", v\)\}>\s*<SelectTrigger className="w-40"><SelectValue \/><\/SelectTrigger>\s*<SelectContent>\s*<SelectItem value="dots">\{t\("editorSettings\.bg_dots"\)\}<\/SelectItem>\s*<SelectItem value="lines">\{t\("editorSettings\.bg_lines"\)\}<\/SelectItem>\s*<SelectItem value="cross">\{t\("editorSettings\.bg_cross"\)\}<\/SelectItem>\s*<SelectItem value="none">\{t\("editorSettings\.bg_none"\)\}<\/SelectItem>\s*<\/SelectContent>\s*<\/Select>/m;
const bgCombobox = `<Combobox
                value={settings.backgroundVariant}
                onChange={(v) => { if(v) set("backgroundVariant", v); }}
                options={[
                  { value: "dots", label: t("editorSettings.bg_dots") },
                  { value: "lines", label: t("editorSettings.bg_lines") },
                  { value: "cross", label: t("editorSettings.bg_cross") },
                  { value: "none", label: t("editorSettings.bg_none") }
                ]}
                className="w-40"
                showSearch={false}
              />`;
content = content.replace(bgSelectRegex, bgCombobox);

// Edge Type Select -> Combobox
const edgeSelectRegex = /<Select value=\{settings\.defaultEdgeType\} onValueChange=\{\(v: DiagramEdgeType\) => set\("defaultEdgeType", v\)\}>\s*<SelectTrigger className="w-56"><SelectValue \/><\/SelectTrigger>\s*<SelectContent>\s*\{edgeTypeOptions\.map\(\(o\) => \(\s*<SelectItem key=\{o\.value\} value=\{o\.value\}>\{o\.label\}<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/m;
const edgeCombobox = `<Combobox
                value={settings.defaultEdgeType}
                onChange={(v) => { if(v) set("defaultEdgeType", v as DiagramEdgeType); }}
                options={edgeTypeOptions}
                className="w-56"
                showSearch={false}
              />`;
content = content.replace(edgeSelectRegex, edgeCombobox);

fs.writeFileSync(path, content, 'utf8');
console.log('Update completed.');
