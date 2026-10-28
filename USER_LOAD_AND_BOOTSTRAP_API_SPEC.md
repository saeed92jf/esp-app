# مستند فنی نیازمندی‌های بارگذاری داده‌های کاربر و معماری Bootstrap API
### پورتال سازمانی یورو اسلات پارس و نانو پالایش (Euroslot Pars & NPCeram)

این گزارش فنی شامل تمامی داده‌ها، تنظیمات، وضعیت‌ها و ویجت‌های شخصی‌سازی‌شده کاربر است که در **لحظه باز شدن برنامه (Initial App Load)** باید توسط فرانت‌اند خوانده شوند. همچنین معماری بهینه اندپوینت تک‌مرحله‌ای (`Bootstrap Endpoint`) به همراه قراردادهای REST API مربوطه به صورت کامل مدلسازی شده است.

---

## ۱. چرایی و ضرورت معماری لود یکپارچه (Bootstrap API Pattern)

در حال حاضر بخش‌هایی از داده‌های شخصی و وضعیت‌های کلاینت به دلیل نبود اندپوینت متمرکز، در `localStorage` یا ماک‌سرویس‌ها نگهداری می‌شوند. 
فراخوانی این موارد به شکل مجزا منجر به ارسال ۷ الی ۱۰ درخواست HTTP زنجیره‌ای و همزمان (Waterfall) در شروع لود برنامه می‌شود که باعث کندی، پرش بصری UI (Layout Shift) و هدررفت پهنای باند می‌گردد.

**راهکار استاندارد:** پیاده‌سازی اندپوینت جامع:
```http
GET /api/v1/users/me/bootstrap
```
این اندپوینت در شروع کار تمام داده‌های ضروری لایه نشست (Session)، تنظیمات ظاهری، وضعیت اعلانات، کارت‌های سریع و چیدمان داشبورد را در یک رفت و برگشت شبکه (Single Round-Trip) تحویل فرانت‌اند می‌دهد.

---

## ۲. فهرست کامل اقلام داده‌ای کاربر در لود اولیه (User Load Inventory)

### ۲.۱. هویت، سشن و سطوح دسترسی (Identity & Access Control)
* **سرویس فرانت:** `src/modules/auth/services/auth.service.ts` و `src/hooks/use-auth.ts`
* **اقلام داده:**
  1. `id`: شناسه یکتای کاربر در دیتابیس (UUID یا رشته)
  2. `fullName` و `fullNameFa`: نام و نام خانوادگی به انگلیسی و فارسی
  3. `email`: آدرس ایمیل سازمانی (یورواسلات یا نانوپالایش)
  4. `mobile`: شماره تماس همراه احراز هویت شده
  5. `avatar`: لینک فایل تصویر پروفایل کاربر
  6. `avatarColor`: پالت رنگی آواتار متنی در صورت نداشتن عکس
  7. `role`: نقش سیستمی کاربر (`admin` | `engineer` | `staff` | `customer`)
  8. `companyId`: شرکت منتسب (`euroslot` | `npceram`)
  9. `department`: نام دپارتمان سازمانی (مثلاً مهندسی، تحقیق و توسعه، کنترل پروژه)
  10. `jobTitle`: عنوان سمت سازمانی دقیق
  11. `manager`: عنوان و نام مدیر مستقیم کاربر
  12. `accountStatus`: وضعیت حساب (`active` | `pending_profile` | `pending_approval` | `rejected`)
  13. `isProfileCompleted`: پرچم تکمیل پرونده پرسنلی اولیه
  14. `hrApproved` و `managerApproved`: وضعیت تاییدیه‌های منابع انسانی و مدیر مستقیم
  15. `permissions` / `modulesAccess`: فهرست ماژول‌های مجاز و سطح دسترسی (`read` | `write` | `admin`)

---

### ۲.۲. تنظیمات ظاهری و شخصی‌سازی (Preferences & Themes)
* **سرویس و هوک فرانت:** `src/services/preferences.service.ts` و `src/hooks/use-quick-access.ts`
* **اقلام داده:**
  1. **کارت‌های دسترسی سریع (`quickAccessHrefs`):** آرایه‌ای از آدرس صفحات منتخَب کاربر در صفحه نخست (حداکثر ۷ کارت).
     * *پیش‌فرض سیستم:* `["/ESP-Flow", "/dashboard/tasks", "/dashboard/projects", "/dictionary", "/did-you-know"]`
  2. **تم دیداری (`theme`):** انتخاب بین `'light'` | `'dark'` | `'system'`
  3. **رنگ اصلی سامانه (`primaryColor`):** پالت رنگ تم سازمانی انتخابی کاربر (`'blue'`, `'emerald'`, `'violet'`, `'amber'`, `'rose'`, `'cyan'`)
  4. **نوع تقویم پیش‌فرض (`calendarType`):** `'jalali'` (شمسی) یا `'gregorian'` (میلادی)
  5. **پرسپکتیو نقشی کاربر (`rolePerspective`):** ذخیره وضعیت نمای کاری انتخابی کاربر بین `'admin'` و `'user'` در کارتابل تسک‌ها و پروژه‌ها

---

### ۲.۳. اعلانات و وضعیت خوانده‌شده‌ها (Notifications & Read States)
* **کامپوننت و سرویس فرانت:** `src/modules/dashboard/components/notifications/notifications-popover.tsx` و `src/modules/dashboard/services/dashboard.service.ts`
* **اقلام داده:**
  1. `unreadCount`: عدد نوتیفیکیشن‌های خوانده‌نشده برای نمایش روی بج زنگوله
  2. `recent`: لیست نوتیفیکیشن‌های اخیر کاربر با فیلدهای زیر:
     * `id`: شناسه اعلان
     * `title`: عنوان اعلان
     * `description`: شرح مختصر پیام
     * `createdAt`: زمان صدور پیام
     * `type`: نوع پیام (`'task'` | `'meeting'` | `'system'` | `'alert'`)
     * `read`: بولین نشان‌دهنده خوانده شدن یا نشدن توسط کاربر
     * `readAt`: تاریخ دقیق خوانده شدن
     * `taskId`: شناسه تسک پیوست‌شده (جهت هدایت کاربر به کارتابل)
     * `emailPreview`: جزییات پیش‌نمایش ایمیل سازمانی ارسالی از سوی مدیر (`from`, `subject`, `date`, `body`)

---

### ۲.۴. چیدمان تب‌های داشبورد (Dashboard Layouts & Grid Coordinates)
* **هوک فرانت:** `src/modules/dashboard/hooks/use-dashboard-layout.ts`
* **اقلام داده:**
  1. **ویجت‌های فعال هر تب (`tabWidgets`):** مشخص می‌کند در هر تب کدام ویجت‌ها نمایش داده شوند:
     * تب کارها (`tasks`): مثل `["dailyRoutines", "periodicChecklist", "tasksWorkspace"]`
     * تب سفارشی (`custom`): مثل `["notes", "customLinks", "worldClock"]`
     * تب اداری (`administrative`)
     * تب بازار (`market`)
  2. **مختصات گرید هر تب (`tabLayouts`):**
     * آرایه‌ای به تفکیک سایز صفحه (`lg`, `md`, `sm`) شامل آبجکت‌های `{ i: widgetId, x, y, w, h, minW, minH }`

---

### ۲.۵. داده‌های اختصاصی ویجت‌های شخصی کاربر (Personal Widgets Data)
ویجت‌هایی که اطلاعات آن‌ها مستقیماً توسط خود کاربر ویرایش و تولید می‌شود:
1. **یادداشت‌های کاربر (Notes Widget):**
   * کلید ذخیره‌سازی فعلی: `dashboard_user_notes_v1`
   * ساختار: آرایه‌ای از `{ id, title, content, tags: string[], color: "yellow"|"blue"|"emerald"|"rose"|"purple"|"slate", updatedAt }`
2. **لینک‌های اختصاصی من (Custom Links Widget):**
   * کلید ذخیره‌سازی فعلی: `dashboard_user_custom_links_v1`
   * ساختار: آرایه‌ای از `{ id, title, url, category, color, isPinned: boolean, order: number }`
3. **ساعت‌های جهانی پین‌شده (World Clocks Widget):**
   * کلید ذخیره‌سازی فعلی: `dashboard_world_clocks_v2`
   * ساختار: آرایه‌ای از شناسه‌های شهرهای انتخابی (حداکثر ۲ شهر، مانند `["thr", "lon"]`)
4. **روتین‌های روزانه شخصی (Daily Routines):**
   * کلید ذخیره‌سازی فعلی: `dashboard_user_daily_routines_v3`
   * ساختار: `{ id, title, time, category, color, daysOfWeek: number[], completedDays: string[], priority }`
5. **چک‌لیست‌های دوره‌ای من (Periodic Checklist):**
   * کلید ذخیره‌سازی فعلی: `dashboard_user_periodic_checklist_v1`
   * ساختار: `{ id, title, category, period: "daily"|"weekly"|"monthly", priority, lastCompletedDate, completed: boolean }`

---

### ۲.۶. بوکمارک‌ها و موارد نشان‌شده (Bookmarks & Saved Entities)
* **سرویس‌های فرانت:** `src/modules/did-you-know/hooks/use-did-you-know.ts` و `src/modules/dictionary/hooks/use-dictionary.ts`
* **اقلام داده:**
  1. **آیا می‌دانید (Did You Know):**
     * `bookmarkedFactIds`: آرایه شناسه‌های کارت‌های نشان‌شده توسط کاربر
     * `customFacts`: فکت‌های علمی/فنی که خود کاربر ثبت کرده است
  2. **دیکشنری تخصصی مهندسی (Dictionary):**
     * `bookmarkedTermIds`: آرایه شناسه‌های واژگان نشان‌شده
     * `customTerms`: لغات و اصطلاحات تخصصی اضافه شده توسط کاربر

---

### ۲.۷. مشخصات کامل پرونده پرسنلی (Full Employee Profile)
* **سرویس و تایپ‌های فرانت:** `src/modules/profile/types/profile.ts`
* این مشخصات موقع باز شدن ماژول پروفایل یا صفحه ویرایش کاربری خوانده می‌شوند:
  1. **اطلاعات فردی:** کد ملی، تاریخ تولد، وضعیت تأهل (`single`|`married`)، تعداد فرزندان، آدرس پستی، وضعیت تأیید موبایل و ایمیل
  2. **اطلاعات سازمانی تکمیلی:** شماره داخلی تلفن، محل کار (`office`|`factory`|`remote`|`hybrid`)، نوع قرارداد استخدامی (`full_time`|`part_time`|`contractual`|...)، تاریخ پیوستن، کد پرسنلی، لیست پرسنل زیرمجموعه
  3. **بیمه و بانکی:** شماره بیمه تامین اجتماعی، تاریخ اعتبار، شرکت بیمه تکمیلی (`SOS`، دانا و...)، طرح بیمه تکمیلی (`golden`|`silver`|`special`|`none`)، شماره شبا بانکی، مشخصات افراد تحت تکفل (`dependents`: نام کامل، نسبت، کد ملی، تاریخ تولد)
  4. **سوابق تحصیلی و مهارت‌ها:** مقطع، رشته تحصیلی، دانشگاه، سال فراغت از تحصیل، و لیست مهارت‌ها به همراه رتبه تسلط (۱ تا ۵).

---

## ۳. ساختار بدنه پاسخ برای `GET /api/v1/users/me/bootstrap`

```json
{
  "user": {
    "id": "usr_98124",
    "fullName": "سعید جلیلی",
    "fullNameFa": "سعید جلیلی",
    "email": "s.jalili@euroslotpars.com",
    "mobile": "09123456789",
    "avatar": "https://portal.euroslotpars.com/media/avatars/usr_98124.jpg",
    "avatarColor": "blue",
    "role": "engineer",
    "companyId": "euroslot",
    "department": "مهندسی مکانیک",
    "jobTitle": "کارشناس مهندسی مکانیک پکیج",
    "manager": "مهندس کاظمی (مدیر مهندسی)",
    "accountStatus": "active",
    "isProfileCompleted": true,
    "hrApproved": true,
    "managerApproved": true,
    "permissions": [
      "projects:read",
      "projects:write",
      "tasks:manage",
      "flow:read"
    ]
  },
  "preferences": {
    "quickAccessHrefs": [
      "/ESP-Flow",
      "/dashboard/tasks",
      "/dashboard/projects",
      "/dictionary",
      "/did-you-know"
    ],
    "theme": "system",
    "primaryColor": "blue",
    "calendarType": "jalali",
    "rolePerspective": "user"
  },
  "notifications": {
    "unreadCount": 2,
    "recent": [
      {
        "id": "notif_401",
        "title": "درخواست بازبینی نقشه شاپ دراوینگ",
        "description": "نقشه کارگاهی پکیج فیلتراسیون فاز ۱ جهت تایید بارگذاری شد.",
        "createdAt": "2026-10-27T12:45:00Z",
        "type": "task",
        "read": false,
        "taskId": "task_108",
        "emailPreview": {
          "from": "مهندس کاظمی (مدیر دپارتمان مهندسی)",
          "subject": "بازبینی نهایی نقشه‌های ساخت پکیج",
          "date": "1405/02/10",
          "body": "لطفاً پیش از تحویل به خط برش، پارت لیست متریال را بررسی و تایید فرمایید."
        }
      }
    ]
  },
  "dashboard": {
    "tabWidgets": {
      "tasks": ["dailyRoutines", "periodicChecklist", "tasksWorkspace"],
      "custom": ["notes", "customLinks", "worldClock"],
      "administrative": [],
      "market": []
    },
    "tabLayouts": {
      "tasks": {
        "lg": [{ "i": "dailyRoutines", "x": 0, "y": 0, "w": 6, "h": 4 }]
      },
      "custom": {
        "lg": [{ "i": "notes", "x": 0, "y": 0, "w": 6, "h": 5 }]
      }
    }
  },
  "bookmarks": {
    "didYouKnow": ["fact_01", "fact_18"],
    "dictionary": ["term_reactors", "term_demister"]
  }
}
```

---

## ۴. جدول اندپوینت‌های عملیاتی تفکیک‌شده (Incremental REST Endpoints)

هنگامی که کاربر تغییری در کارت‌ها، یادداشت‌ها یا نوتیفیکیشن‌ها اعمال می‌کند، به جای ارسال مجدد کل داده‌ها، از اندپوینت‌های تخصصی زیر استفاده می‌شود:

| ردیف | متد | اندپوینت (Endpoint) | کاربرد | نمونه بدنه درخواست (Request Body) |
| :---: | :---: | :--- | :--- | :--- |
| **۱** | `GET` | `/api/v1/users/me/bootstrap` | دریافت تمام داده‌های لود اولیه برنامه | — |
| **۲** | `PATCH` | `/api/v1/users/me/preferences` | به‌روزرسانی کارت‌های سریع، رنگ، تم یا تقویم | `{ "quickAccessHrefs": ["/ESP-Flow", ...], "primaryColor": "emerald" }` |
| **۳** | `PATCH` | `/api/v1/notifications/{id}/read` | علامت‌گذاری یک نوتیفیکیشن خاص به عنوان خوانده‌شده | — |
| **۴** | `POST` | `/api/v1/notifications/mark-all-read` | علامت‌گذاری همگانی اعلانات به عنوان خوانده‌شده | — |
| **۵** | `PUT` | `/api/v1/users/me/dashboard-layout` | ذخیره چیدمان و گرید ویجت‌های تب‌های داشبورد | `{ "tabWidgets": {...}, "tabLayouts": {...} }` |
| **۶** | `GET/POST` | `/api/v1/users/me/notes` | لیست‌گیری و ثبت یادداشت جدید کاربر | `{ "title": "...", "content": "...", "color": "blue", "tags": [] }` |
| **۷** | `PUT/DEL` | `/api/v1/users/me/notes/{id}` | ویرایش یا حذف یادداشت کاربر | `{ "title": "...", "content": "..." }` |
| **۸** | `GET/POST` | `/api/v1/users/me/custom-links` | دریافت و ثبت لینک‌های اختصاصی من | `{ "title": "...", "url": "...", "category": "..." }` |
| **۹** | `PUT/DEL` | `/api/v1/users/me/custom-links/{id}`| ویرایش و حذف لینک اختصاصی | — |
| **۱۰**| `GET/PUT` | `/api/v1/users/me/routines` | وضعیت روتین‌های روزانه و روزهای تکمیل‌شده | `[{ "id": "rt_1", "completedDays": ["1405-02-10"] }]` |
| **۱۱**| `GET/PUT` | `/api/v1/users/me/checklists` | آیتم‌های چک‌لیست دوره‌ای کاربر | `[{ "id": "chk_1", "completed": true }]` |
| **۱۲**| `POST/DEL`| `/api/v1/users/me/bookmarks` | نشان‌گذاری یا لغو نشان یک فکت یا واژه | `{ "entityType": "dictionary", "entityId": "term_12" }` |
| **۱۳**| `GET` | `/api/v1/users/me/profile` | دریافت کل پرونده پرسنلی، بیمه، شبا و سوابق | — |
| **۱۴**| `PUT` | `/api/v1/users/me/profile` | ذخیره مشخصات پرونده پرسنلی و افراد تحت تکفل | `{ "personal": {...}, "insurance": {...}, ... }` |
