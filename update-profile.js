const fs = require('fs');
const path = 'src/modules/profile/components/profile-page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update TabsList grid columns
content = content.replace('lg:grid-cols-4', 'lg:grid-cols-5');

// 2. Add education tab trigger
content = content.replace(
  '<TabsTrigger value="insurance">{t("tabs.insurance", { defaultValue: "اطلاعات بیمه" })}</TabsTrigger>',
  '<TabsTrigger value="insurance">{t("tabs.insurance", { defaultValue: "اطلاعات بیمه" })}</TabsTrigger>\n          <TabsTrigger value="education">{t("tabs.education", { defaultValue: "اطلاعات تحصیلی" })}</TabsTrigger>'
);

// 3. Add education tab content right before </Tabs>
const educationTabContent = `
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.education", { defaultValue: "اطلاعات تحصیلی" })}</CardTitle>
              <CardDescription>
                {t("descriptions.education", { defaultValue: "سوابق تحصیلی و دانشگاهی خود را در این بخش مدیریت کنید." })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree" className="rtl:text-right block">{t("fields.degree", { defaultValue: "مدرک تحصیلی" })}</Label>
                  <Input 
                    id="degree" 
                    value={formData.education.degree} 
                    onChange={(e) => handleChange("education", "degree", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy" className="rtl:text-right block">{t("fields.fieldOfStudy", { defaultValue: "رشته تحصیلی" })}</Label>
                  <Input 
                    id="fieldOfStudy" 
                    value={formData.education.fieldOfStudy} 
                    onChange={(e) => handleChange("education", "fieldOfStudy", e.target.value)} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="university" className="rtl:text-right block">{t("fields.university", { defaultValue: "دانشگاه / موسسه آموزشی" })}</Label>
                  <Input 
                    id="university" 
                    value={formData.education.university} 
                    onChange={(e) => handleChange("education", "university", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="rtl:text-right block">{t("fields.graduationYear", { defaultValue: "سال فارغ‌التحصیلی" })}</Label>
                  <Input 
                    id="graduationYear" 
                    value={formData.education.graduationYear} 
                    onChange={(e) => handleChange("education", "graduationYear", e.target.value)} 
                    className="ltr text-left font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>`;

content = content.replace('      </Tabs>', educationTabContent);

// 4. Add RTL class to all labels
content = content.replace(/<Label htmlFor="([^"]+)">/g, '<Label htmlFor="$1" className="rtl:text-right block">');

fs.writeFileSync(path, content, 'utf8');
console.log('Modified profile-page.tsx');
