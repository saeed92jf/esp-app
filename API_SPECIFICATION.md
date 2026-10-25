# مشخصات و مستندات API سرور (Backend API Specification)
### سامانه جامع پورتال سازمانی یورو اسلات پارس (Euroslot Pars)

این مستند شامل مشخصات کامل تمام **API Endpoint**ها، مدل‌های داده (Data Contracts)، هدرهای احراز هویت و نمونه پاسخ‌های مورد نیاز فرانت‌اند است که جهت پیاده‌سازی و یکپارچه‌سازی سرویس‌های بک‌اند آماده شده است.

---

## ۱. اصول عمومی و استانداردهای ارتباطی (General Conventions)

### ۱.۱. آدرس‌پایه (Base URL)
- محیط توسعه (Development): `http://localhost:8000/api`
- محیط عملیاتی (Production): `https://portal.euroslotpars.com/api`

### ۱.۲. احراز هویت (Authentication Header)
کلیه درخواست‌های نیازمند احراز هویت باید توکن دسترسی JWT را در هدر زیر ارسال نمایند:
```http
Authorization: Bearer <ACCESS_TOKEN>
```

### ۱.۳. فرمت استاندارد پاسخ خطاها (Error Response Schema)
پاسخ‌های خطا باید دارای کدهای وضعیت استاندارد HTTP (مانند `400`, `401`, `403`, `404`, `422`, `500`) و بدنه JSON با ساختار زیر باشند:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "پیام فارسی یا انگلیسی خوانا برای نمایش به کاربر",
  "details": {
    "nationalId": "کد ملی وارد شده نامعتبر است",
    "phone": "فرمت شماره تلفن صحیح نمی‌باشد"
  }
}
```

### ۱.۴. فرمت تاریخ‌ها و ارقام
- **تاریخ:** ارسال و دریافت تمام تاریخ‌ها به فرمت استاندارد ISO 8601 (`YYYY-MM-DD` یا `YYYY-MM-DDTHH:mm:ssZ`) یا رشته شمسی استاندارد (`1403/05/12`).
- **اعداد:** کلیه ارقام و اعداد در ارتباطات API به صورت استاندارد عددی انگلیسی (`0-9`) ارسال و دریافت می‌شوند (تبدیل به فارسی در لایه نمایش UI انجام می‌شود).

---

## ۲. ماژول احراز هویت و نشست کاربری (Authentication & Accounts)

| متد | مسیر (Endpoint) | شرح عملیات | بدنه درخواست (Request Body) | پاسخ مورد انتظار (Response) | احراز هویت |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | ورود به سامانه با ایمیل یا شماره موبایل | `{ "email": "saeed@euroslotpars.com", "password": "..." }` | `{ "user": User, "token": "JWT_TOKEN" }` | عمومی |
| **POST** | `/api/auth/register` | ثبت‌نام اولیه کاربر جدید | `{ "full_name": "...", "email": "...", "password": "..." }` | `{ "user": User, "token": "JWT_TOKEN" }` | عمومی |
| **POST** | `/api/auth/account-request` | ارسال درخواست ایجاد حساب پرسنلی | `{ "email": "employee@euroslotpars.com" }` | `{ "success": true, "requestId": "req_123" }` | عمومی |
| **GET** | `/api/auth/account-status` | بررسی وضعیت فعال‌سازی حساب پرسنلی | — | `{ "status": "active"\|"pending", "isProfileCompleted": true, "hrApproved": true, "managerApproved": true }` | Bearer Token |
| **GET** | `/api/auth/me` | دریافت اطلاعات نشست جاری کاربر | — | اطلاعات کامل مدل `User` | Bearer Token |
| **POST** | `/api/auth/refresh` | تمدید توکن دسترسی منقضی شده | — | `{ "token": "NEW_JWT_TOKEN" }` | Refresh Token |
| **POST** | `/api/auth/logout` | خروج از سیستم و ابطال توکن | — | `{ "success": true }` | Bearer Token |
| **POST** | `/api/auth/forgot-password` | درخواست لینک/کد بازیابی رمز | `{ "email": "user@euroslotpars.com" }` | `{ "message": "ایمیل بازیابی با موفقیت ارسال شد" }` | عمومی |
| **POST** | `/api/auth/reset-password` | تعیین رمز عبور جدید | `{ "token": "...", "new_password": "..." }` | `{ "success": true }` | عمومی |
| **POST** | `/api/auth/verify-email` | اعتبارسنجی آدرس ایمیل | `{ "token": "..." }` | `{ "success": true }` | عمومی |

---

## ۳. ماژول پرونده پرسنلی و اطلاعات کاربری (User Profile)

این سرویس پرونده اطلاعات فردی، سازمانی، سوابق تحصیلی، بیمه تکمیلی و مهارت‌های همکاران را مدیریت می‌کند.

| متد | مسیر (Endpoint) | شرح عملیات | بدنه درخواست (Request Body) | پاسخ مورد انتظار (Response) | احراز هویت |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/users/me/profile` | دریافت کامل پرونده پرسنلی کاربر لاگین‌شده | — | ساختار کامل مدل `UserProfile` | Bearer Token |
| **PATCH** | `/api/users/me/profile` | ویرایش و ذخیره تغییرات پرونده پرسنلی | بخش‌های تغییر یافته از مدل `UserProfile` | `{ "success": true, "profile": UserProfile }` | Bearer Token |
| **GET** | `/api/users/me` | دریافت مشخصات هویتی پایه کاربر | — | مدل پایه `User` | Bearer Token |
| **PATCH** | `/api/users/me` | به‌روزرسانی فیلدهای پایه حساب | `{ "fullNameFa"?: "...", "fullName"?: "...", "avatarColor"?: "...", "primaryColor"?: "..." }` | مدل پایه `User` به‌روز شده | Bearer Token |
| **POST** | `/api/users/me/change-password` | تغییر رمز عبور از داخل حساب کاربری | `{ "currentPassword": "...", "newPassword": "..." }` | `{ "success": true }` | Bearer Token |
| **POST** | `/api/users/me/avatar` | آپلود و جایگزینی تصویر آواتار | `multipart/form-data` با فیلد `avatar` | `{ "url": "/uploads/avatars/u-saeed.webp" }` | Bearer Token |
| **GET** | `/api/users/me/preferences` | دریافت تنظیمات تم، دسترسی سریع و رنگ | — | `{ "primaryColor": "red", "theme": "system", "quickAccessHrefs": [...] }` | Bearer Token |
| **PATCH** | `/api/users/me/preferences` | ذخیره تنظیمات شخصی‌سازی در سرور | `{ "primaryColor"?: "red", "theme"?: "dark", "quickAccessHrefs"?: [...] }` | تنظیمات ذخیره شده | Bearer Token |

### ساختار مدل داده پرونده پرسنلی (UserProfile Data Model):
```typescript
interface UserProfile {
  personal: {
    firstName: string;          // نام به انگلیسی
    lastName: string;           // نام خانوادگی به انگلیسی
    firstNameFa?: string;       // نام به فارسی
    lastNameFa?: string;        // نام خانوادگی به فارسی
    avatarColor?: string;       // کد رنگ آواتار (مثال: #0284c7)
    primaryColor?: string;      // تم رنگی اختصاصی کاربر (مثال: red, blue, emerald)
    nationalId: string;         // کد ملی (۱۰ رقم)
    phone: string;              // تلفن همراه (مثال: 09120000000)
    email: string;              // ایمیل شرکتی
    address: string;            // آدرس سکونت
    birthDate: string;          // تاریخ تولد (مثال: 1370/05/12 یا 1991-08-03)
    phoneVerified?: boolean;    // وضعیت اعتبارسنجی پیامکی
    emailVerified?: boolean;    // وضعیت اعتبارسنجی ایمیل
    maritalStatus?: "single" | "married"; // وضعیت تاهل
    childrenCount?: number;     // تعداد فرزندان
  };
  organizational: {
    department: string;         // دپارتمان / واحد سازمانی
    role: string;               // عنوان شغلی
    employeeId: string;         // کد پرسنلی (مثال: ESP-9801)
    joinDate: string;           // تاریخ استخدام (مثال: 1398/02/01)
    manager: string;            // مدیر مافوق
    extensionNumber?: string;   // شماره داخلی
    workLocation?: "office" | "factory" | "remote" | "hybrid"; // محل خدمت
    contractType?: "full_time" | "part_time" | "hourly" | "contractual" | "internship"; // نوع قرارداد
    subordinates?: string[];    // پرسنل تحت سرپرستی
    subordinatesCount?: number; // تعداد زیردستان
  };
  skills: Array<{
    id: string;
    name: string;               // نام تخصص یا مهارت
    level: number;              // سطح مهارت ۱ تا ۵
  }>;
  insurance: {
    insuranceCode: string;      // شماره بیمه تامین اجتماعی
    provider: string;           // بیمه‌گر پایه (پیش‌فرض: تامین اجتماعی)
    validUntil: string;         // تاریخ اعتبار بیمه
    type: string;               // نوع بیمه (اجباری / اختیاری)
    supplementaryPlan?: "golden" | "silver" | "special" | "none"; // طرح بیمه تکمیلی
    supplementaryProvider?: string; // بیمه‌گر تکمیلی (پیش‌فرض: SOS کمک‌رسان ایران)
    shebaNumber?: string;       // شماره شبای بانکی جهت واریز خسارت (IR...)
    dependentsCount?: number;   // تعداد افراد تحت تکفل
    dependents?: Array<{        // لیست افراد تحت تکفل برای بیمه درمان
      id: string;
      fullName: string;
      relationship: string;     // نسبت (همسر، فرزند، پدر، مادر)
      nationalId: string;
      birthDate?: string;
    }>;
  };
  education: {
    degree: string;             // آخرین مقطع تحصیلی (associate, bachelor, master, doctorate)
    fieldOfStudy: string;       // رشته تحصیلی
    university: string;         // دانشگاه یا موسسه آموزشی
    graduationYear: string;     // تاریخ فارغ‌التحصیلی (انتخاب‌شده با DatePicker)
    records?: Array<{           // سوابق کلیه مقاطع تحصیلی
      id: string;
      degree: string;
      fieldOfStudy: string;
      university: string;
      graduationYear: string;
    }>;
  };
}
```

---

## ۴. ماژول مدیریت وظایف و تسک‌ها (Tasks Management)

| متد | مسیر (Endpoint) | شرح عملیات | بدنه درخواست (Request Body) | پاسخ مورد انتظار (Response) | احراز هویت |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | لیست تسک‌های سیستم همراه با فیلترها | Query Params: `?status=...&priority=...&projectId=...` | `TaskItem[]` | Bearer Token |
| **GET** | `/api/tasks/:id` | دریافت جزئیات یک تسک با دیدگاه‌ها و ضمیمه‌ها | — | `TaskItem` کامل | Bearer Token |
| **POST** | `/api/tasks` | ایجاد تسک جدید | داده‌های ایجاد تسک (عنوان، توضیحات، اولویت، ددلاین، مسئول) | `TaskItem` ایجادشده | Bearer Token |
| **PUT** | `/api/tasks/:id` | ویرایش مشخصات تسک | داده‌های کامل تسک | `TaskItem` به‌روز شده | Bearer Token |
| **DELETE** | `/api/tasks/:id` | حذف تسک | — | `{ "success": true }` | Bearer Token |
| **PATCH** | `/api/tasks/:id/progress` | تغییر درصد پیشرفت تسک | `{ "progressPercent": 80 }` | `TaskItem` به‌روز شده | Bearer Token |
| **PATCH** | `/api/tasks/:id/subtasks/:subtaskId` | تغییر وضعیت تکمیل چک‌لیست زیرتسک | `{ "completed": true }` | `TaskItem` به‌روز شده | Bearer Token |
| **POST** | `/api/tasks/:id/collaborators` | افزودن همکار / عضو مرتبط به تسک | `{ "userId": "...", "name": "...", "role": "..." }` | `TaskItem` به‌روز شده | Bearer Token |
| **DELETE** | `/api/tasks/:id/collaborators/:collabId` | حذف همکار از تسک | — | `TaskItem` به‌روز شده | Bearer Token |
| **POST** | `/api/tasks/:id/comments` | افزودن دیدگاه جدید روی تسک | `{ "content": "توضیحات...", "authorName": "..." }` | `TaskComment` ایجادشده | Bearer Token |
| **POST** | `/api/tasks/:id/comments/:commentId/replies` | پاسخ به دیدگاه موجود | `{ "content": "پاسخ...", "authorName": "..." }` | `TaskCommentReply` | Bearer Token |
| **POST** | `/api/tasks/:id/attachments` | آپلود یا افزودن فایل ضمیمه تسک | `multipart/form-data` یا اطلاعات فایل | `TaskAttachment` | Bearer Token |
| **DELETE** | `/api/tasks/:id/attachments/:attachmentId` | حذف فایل ضمیمه از تسک | — | `{ "success": true }` | Bearer Token |

---

## ۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)

| متد | مسیر (Endpoint) | شرح عملیات | بدنه درخواست (Request Body) | پاسخ مورد انتظار (Response) | احراز هویت |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/projects` | دریافت لیست پروژه‌های جاری شرکت | — | `ProjectItem[]` | Bearer Token |
| **GET** | `/api/projects/:id` | دریافت کامل جزئیات پروژه | — | `ProjectItem` همراه فازها، تیم، مدارک و ریسک‌ها | Bearer Token |
| **POST** | `/api/projects` | تعریف پروژه جدید | مشخصات پروژه (نام، کد پروژه، کارفرما، تاریخ شروع و پایان) | `ProjectItem` ایجادشده | Bearer Token |
| **PUT** | `/api/projects/:id` | ویرایش اطلاعات پروژه | داده‌های کامل پروژه | `ProjectItem` ویرایش‌شده | Bearer Token |
| **DELETE** | `/api/projects/:id` | حذف پروژه | — | `{ "success": true }` | Bearer Token |
| **POST** | `/api/projects/:id/phases` | افزودن فاز جدید به ساختار WBS پروژه | `{ "title": "مهندسی پایه", "weight": 25, "startDate": "...", "endDate": "..." }` | `ProjectPhase` | Bearer Token |
| **PUT** | `/api/projects/:id/phases/:phaseId` | ویرایش اطلاعات فاز WBS | اطلاعات فاز | `ProjectPhase` | Bearer Token |
| **POST** | `/api/projects/:id/team` | تخصیص پرسنل به تیم پروژه | `{ "userId": "...", "name": "...", "role": "کارشناس پایپینگ" }` | `ProjectItem` به‌روز شده | Bearer Token |
| **DELETE** | `/api/projects/:id/team/:memberId` | حذف عضو از تیم پروژه | — | `ProjectItem` به‌روز شده | Bearer Token |
| **POST** | `/api/projects/:id/vdis` | بارگذاری و ثبت سند مهندسی در لیست VDIS | `{ "docCode": "ESP-DWG-001", "title": "نقشه P&ID", "revision": "A", "fileUrl": "..." }` | `VdisDocumentItem` | Bearer Token |
| **POST** | `/api/projects/:id/transmittals` | ایجاد نامه ترانسمیتال برای اسناد مهندسی | `{ "transmittalNumber": "TR-001", "subject": "...", "docIds": [...] }` | `TransmittalLetter` | Bearer Token |
| **POST** | `/api/projects/:id/transmittals/:transId/approve` | تایید ترانسمیتال توسط مدیر مربوطه | `{ "managerName": "...", "comment": "تایید شد" }` | `TransmittalLetter` تاییدشده | Bearer Token |
| **POST** | `/api/projects/:id/transmittals/:transId/reject` | رد ترانسمیتال توسط مدیر مربوطه | `{ "managerName": "...", "reason": "علت رد سند..." }` | `TransmittalLetter` ردشده | Bearer Token |
| **POST** | `/api/projects/:id/risks` | ثبت ریسک پروژه | `{ "title": "تاخیر در تامین کالا", "severity": "high", "impact": "schedule" }` | `ProjectRiskItem` | Bearer Token |
| **PATCH** | `/api/projects/:id/risks/:riskId/status` | تغییر وضعیت ریسک پروژه | `{ "status": "mitigated"\|"closed"\|"active" }` | `ProjectRiskItem` | Bearer Token |

---

## ۶. ماژول مدیریت و تاییدات منابع انسانی / مدیر (Admin Panel)

| متد | مسیر (Endpoint) | شرح عملیات | بدنه درخواست / Query | پاسخ مورد انتظار (Response) | سطح دسترسی |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/admin/users` | لیست پرسنل و کاربران سیستم | `?role=...&status=...&page=1&limit=20` | `{ "data": User[], "total": 120 }` | Admin |
| **GET** | `/api/admin/users/:id` | مشاهده پرونده کامل کاربر توسط ادمین | — | `{ "data": User }` | Admin |
| **PATCH** | `/api/admin/users/:id` | تغییر نقش یا مسدودسازی کاربر | `{ "role": "admin"\|"staff", "accountStatus": "active"\|"blocked" }` | `{ "data": User }` | Admin |
| **PUT** | `/api/admin/users/:id/modules` | تنظیم سطوح دسترسی ماژول‌ها برای کاربر | `{ "modules": [{ "moduleId": "projects", "hasAccess": true, "permission": "write" }] }` | `{ "data": User }` | Admin |
| **DELETE** | `/api/admin/users/:id` | حذف حساب کاربری | — | `{ "success": true }` | Admin |
| **GET** | `/api/admin/requests` | دریافت لیست درخواست‌های معلق حساب پرسنل | `?status=pending` | `{ "data": PendingRequest[] }` | Admin / HR |
| **POST** | `/api/admin/requests/:id/approve-hr` | تایید پرونده پرسنلی توسط منابع انسانی (HR) | `{ "notes": "مدارک پرسنلی احراز هویت شد" }` | `{ "data": PendingRequest }` | Admin / HR |
| **POST** | `/api/admin/requests/:id/approve-manager` | تایید نهایی توسط مدیر و فعال‌سازی قطعی حساب | `{ "tempPassword": "...", "role": "staff" }` | `{ "request": PendingRequest, "tempPassword": "...", "user": User }` | Admin / Manager |
| **POST** | `/api/admin/requests/:id/reject` | رد درخواست حساب پرسنلی با ذکر دلیل | `{ "reason": "علت رد..." }` | `{ "data": PendingRequest }` | Admin / HR |
| **POST** | `/api/admin/requests/:id/resend-credentials` | ارسال مجدد ایمیل رمز موقت و نام کاربری | — | `{ "success": true }` | Admin |

---

## ۷. ماژول داشبورد و آمار عمومی (Dashboard & Stats)

| متد | مسیر (Endpoint) | شرح عملیات | پارامترها (Query Params) | پاسخ مورد انتظار (Response) | احراز هویت |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/dashboard` | دریافت ویجت‌ها، کارت‌های آماری، نمودار و رویدادهای داشبورد | `?role=staff&statCards=...&chartSource=...` | `{ "statCards": [...], "chart": [...], "activities": [...], "events": [...] }` | Bearer Token |
| **GET** | `/api/search` | جستجوی فراگیر در اسناد، تسک‌ها، پروژه‌ها و پرسنل | `?query=متن_جستجو&types=project,document&limit=20` | `{ "results": [...], "total": 12, "query": "..." }` | Bearer Token |
| **GET** | `/api/stats/home` | آمار صفحه اصلی (پروژه‌ها، جوایز، تعداد مشتریان) | — | `[ { "id": "clients", "value": 1200, "suffix": "+" }, ... ]` | عمومی |

---

## ۸. نمونه فراخوانی کلاینت (cURL Examples)

### ۱. ورود به سامانه (Login):
```bash
curl -X POST "https://portal.euroslotpars.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "saeed@euroslotpars.com",
    "password": "mySecurePassword123"
  }'
```

### ۲. دریافت پرونده پرسنلی (Get User Profile):
```bash
curl -X GET "https://portal.euroslotpars.com/api/users/me/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: application/json"
```

### ۳. ویرایش اطلاعات پرونده پرسنلی (Update Profile):
```bash
curl -X PATCH "https://portal.euroslotpars.com/api/users/me/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "personal": {
      "address": "تهران، خیابان ولیعصر، برج سپهر",
      "childrenCount": 2,
      "primaryColor": "emerald"
    },
    "education": {
      "degree": "master",
      "fieldOfStudy": "مهندسی متالورژی و سرامیک",
      "university": "دانشگاه صنعتی شریف",
      "graduationYear": "1395/04/15"
    }
  }'
```
