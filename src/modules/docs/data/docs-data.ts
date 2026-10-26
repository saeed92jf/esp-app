// src/modules/docs/data/docs-data.ts
import { DocCategory } from "../types/docs.types";

export const DOCS_CATEGORIES: DocCategory[] = [
  {
    id: "getting-started",
    titleFa: "آشنایی و درگاه اصلی",
    titleEn: "Getting Started & Portal",
    descriptionFa: "راهنمای آشنایی با معماری کلی سامانه و نحوه کار با درگاه اصلی و ابزارهای جستجو",
    descriptionEn: "Platform architecture overview, home portal guide, and unified search tools",
    iconName: "Rocket",
    articles: [
      {
        id: "platform-overview",
        slug: "platform-overview",
        categoryId: "getting-started",
        titleFa: "معرفی کلی سامانه و معماری جامع",
        titleEn: "Platform Overview & Core Architecture",
        subtitleFa: "آشنایی با ساختار یکپارچه، ماژول‌های عملیاتی و جریان‌های کاری سامانه ESP",
        subtitleEn: "Comprehensive overview of the unified engineering platform, operational modules, and workflows",
        readingTimeMinutes: 4,
        standardRef: "ESP Enterprise Standard",
        lastUpdated: "1405/02/10",
        tags: ["معماری", "پلتفرم", "شروع کار", "Overview", "Architecture"],
        sections: [
          {
            id: "platform-mission",
            titleFa: "سامانه مهندسی یورواسلات پارس (ESP) چیست؟",
            titleEn: "What is ESP Engineering Platform?",
            contentFa:
              "سامانه یکپارچه ESP بستر جامع مدیریت پروژه‌های صنعتی، ردیابی اسناد فنی و بازنگری‌های VDIS، مدیریت گردش کارهای تیمی با کانبان، دیکشنری اصطلاحات مهندسی نفت و گاز، و احراز هویت پرسنلی در صنایع انرژی، پتروشیمی و تجهیزات فرآیندی است.",
            contentEn:
              "ESP is an integrated engineering software platform designed for industrial project tracking, VDIS technical document transmittals, Kanban team workflows, specialized oil & gas lexicons, and personnel onboarding in energy, petrochemical, and process equipment sectors.",
            callout: {
              type: "tip",
              titleFa: "معماری ماژولار با دو لایه دیتای واقعی و شبیه‌سازی‌شده",
              titleEn: "Modular Architecture with Dual Mock/Real API",
              contentFa:
                "تمامی ماژول‌های سیستم بر پایه ساختار ایزوله و مستقل توسعه یافته‌اند. سیستم مجهز به سرویس‌های دوقلوی RealService و FakeService است تا بدون قطعی در هر دو محیط توسعه آفلاین و سرورهای ابری آنلاین کار کند.",
              contentEn:
                "All modules are decoupled and built upon dual RealService and FakeService layers, enabling continuous operations both offline in local dev and online against live enterprise servers.",
            },
          },
          {
            id: "platform-spaces",
            titleFa: "ساختار کلی ماژول‌ها و نحوه گردش اطلاعات",
            titleEn: "Core Modules & Information Architecture",
            contentFa:
              "پلتفرم ESP از پنج حوزه عملیاتی اصلی تشکیل شده است که هر یک پاسخگوی نیازهای مدیران پروژه، سرپرستان کارگاه و مهندسان طراح است:",
            contentEn:
              "The ESP platform comprises five core operational domains designed for project managers, field supervisors, and design engineers:",
            steps: [
              {
                number: 1,
                titleFa: "درگاه اصلی و هاب ناوبری (Home Portal)",
                titleEn: "Home Portal & Navigation Hub",
                descriptionFa:
                  "نقطه ورود مرکزی سامانه با موتور جستجوی هوشمند، برچسب‌های ناوبری سریع، و کارت‌های دسترسی سریع با چیدمان دلخواه کاربر.",
                descriptionEn:
                  "Central entrance hub featuring intelligent search, quick navigation tags, and customizable quick access shortcut docks.",
                tipFa: "امکان پین کردن تا ۱۲ ماژول پرکاربرد به انتخاب کاربر",
                tipEn: "Pin up to 12 high-priority modules with drag & drop",
              },
              {
                number: 2,
                titleFa: "داشبورد اجرایی و ویجت‌های تعاملی (Executive Dashboard)",
                titleEn: "Executive Dashboard & Interactive Widgets",
                descriptionFa:
                  "دیده‌بانی و مانیتورینگ بلادرنگ شاخص‌های کلیدی پروژه، ساعت جهانی چندمنطقه‌ای، مدیریت لینک‌های پرکاربرد، یادداشت‌های کارگاهی و اعلان‌ها.",
                descriptionEn:
                  "Real-time monitoring of project KPIs, multi-zone world clock, useful links combobox, quick scratchpad notes, and alerts.",
                tipFa: "امکان فیلتر لینک‌ها بر اساس دسته‌بندی با ComboBox پیشرفته",
                tipEn: "Filter useful links by discipline using smart ComboBox",
              },
              {
                number: 3,
                titleFa: "مدیریت پروژه‌ها، شناسنامه آکاردئونی و VDIS",
                titleEn: "Projects, Accordion Overview & VDIS",
                descriptionFa:
                  "فرم ویزارد ۵ مرحله‌ای ثبت پروژه، شناسنامه آکاردئونی ۸ گانه، فازهای WBS، ماتریس ریسک و فرآیند صحه‌گذاری ترنسمیتال‌های اسناد فروشنده با کدهای ۱، ۲ و ۳.",
                descriptionEn:
                  "5-step creation wizard, 8-segment accordion overview, WBS phases, risk matrix, and VDIS transmittal code 1/2/3 approvals.",
                tipFa: "شناسنامه آکاردئونی تمام اطلاعات فنی، مالی و تیمی را یکپارچه می‌کند",
                tipEn: "Accordion overview unifies technical, contract, and team data",
              },
              {
                number: 4,
                titleFa: "مدیریت تسک‌ها و تخته‌های کانبان (Tasks & Kanban)",
                titleEn: "Tasks Management & Kanban Workflows",
                descriptionFa:
                  "گردش کار بصری وظایف در نماهای ستونی کانبان و جدول، چک‌لیست زیرتسک‌ها با بازتولید خودکار درصد پیشرفت، پیوست نقشه‌های DWG/PDF و تایید تسک‌های مدیر.",
                descriptionEn:
                  "Visual task tracking in Kanban columns and data tables, subtask checklists with auto-calculated progress, DWG/PDF attachments, and manager clearance.",
                tipFa: "تیک خوردن هر زیرتسک بلافاصله درصد کل تسک را مجدداً محاسبه می‌کند",
                tipEn: "Checking subtasks instantly recalculates overall completion %",
              },
              {
                number: 5,
                titleFa: "بانک دانش، دیکشنری مهندسی و پنل مدیریت",
                titleEn: "Engineering Knowledge, Dictionary & Admin",
                descriptionFa:
                  "دیکشنری دوزبانه استاندارد نفت و گاز، فلش‌کارت‌های صنعتی متالورژی و بازرسی NDT، کارتابل احراز هویت پرسنلی دو مرحله‌ای و نقشه سایت تعاملی با قراردادهای API.",
                descriptionEn:
                  "Bilingual oil & gas technical dictionary, metallurgy insights, two-tier personnel verification cartable, and interactive sitemap with API contracts.",
                tipFa: "سازگاری کامل با استانداردهای بین‌المللی ASME, API و ASTM",
                tipEn: "Fully aligned with ASME, API, and ASTM international standards",
              },
            ],
          },
          {
            id: "bilingual-and-experience",
            titleFa: "استانداردهای دوزبانه، پوسته‌های بصری و دسترسی‌پذیری",
            titleEn: "Bilingual Standards, Visual Themes & Accessibility",
            contentFa:
              "سامانه ESP به صورت بومی دوزبانه (فارسی و انگلیسی) بوده و برای حفظ راحتی چشمان مهندسان، از پالت‌های بصری استاندارد تیره و روشن تلطیف‌شده (بدون استفاده از رنگ مشکی مطلق #000) و انیمیشن‌های روان بدون جابجایی ترنزلیشن بهره می‌برد.",
            contentEn:
              "The ESP platform is natively bilingual (Persian & English) and applies softened high-contrast dark and light palettes (strictly avoiding harsh absolute black #000) with fluid hover states.",
            callout: {
              type: "note",
              titleFa: "سوئیچ آنی زبان و جهت صفحه",
              titleEn: "Instant Locale & Direction Switching",
              contentFa:
                "تغییر زبان بین فارسی (RTL) و انگلیسی (LTR) بدون نیاز به ریفرش کل صفحه اعمال شده و تمامی اعداد در زبان فارسی به ارقام استاندارد فارسی تبدیل می‌شوند.",
              contentEn:
                "Switching between Persian (RTL) and English (LTR) takes effect instantly without full page reloads, converting numerals to Persian digits in Persian mode.",
            },
          },
        ],
      },
      {
        id: "home-portal-guide",
        slug: "home-portal-guide",
        categoryId: "getting-started",
        titleFa: "درگاه اصلی، جستجوی جامع و کارت‌های دسترسی سریع",
        titleEn: "Home Portal, Unified Search & Quick Access Dock",
        subtitleFa: "شیوه کار با هیروی صفحه اصلی، موتور جستجوی هوشمند، برچسب‌های سریع و چیدمان کارت‌ها",
        subtitleEn: "Step-by-step guide to the home hero portal, unified search, quick filter tags, and customizable shortcut dock",
        readingTimeMinutes: 4,
        standardRef: "UX-DOCK-01",
        lastUpdated: "1405/02/10",
        tags: ["صفحه اصلی", "جستجو", "شورت‌کات", "Home", "Quick Access"],
        sections: [
          {
            id: "hero-and-auth-states",
            titleFa: "ساختار هیروی صفحه اصلی در وضعیت مهمان و کاربر لاگین‌شده",
            titleEn: "Home Hero Structure: Guest vs Authenticated State",
            contentFa:
              "بخش هیرو (Hero) در صفحه اصلی دروازه ورود شما به امکانات سیستم است. این بخش بر اساس وضعیت احراز هویت به صورت هوشمند تغییر می‌کند:",
            contentEn:
              "The hero section on the home page serves as your operational gateway, intelligently adapting based on user authentication status:",
            steps: [
              {
                number: 1,
                titleFa: "وضعیت مهمان (Guest Mode)",
                titleEn: "Guest / Preview Mode",
                descriptionFa:
                  "نمایش خوش‌آمدگویی، معرفی قابلیت‌های پلتفرم و دکمه «ورود سریع دمو» جهت ورود بدون معطلی و تست امکانات.",
                descriptionEn:
                  "Displays welcome message, platform highlights, and a 'Quick Demo Login' button for instant guest exploration.",
              },
              {
                number: 2,
                titleFa: "وضعیت کاربر احراز هویت شده (Authenticated Mode)",
                titleEn: "Authenticated User Mode",
                descriptionFa:
                  "نمایش نام کاربر، نقش سازمانی، وضعیت امنیتی اکانت و نشانگر فعال بودن پلتفرم به همراه دسترسی مستقیم به داشبورد.",
                descriptionEn:
                  "Displays user greeting, assigned role, account security status, and direct jump to executive dashboard.",
              },
            ],
          },
          {
            id: "unified-search-guide",
            titleFa: "شیوه کار با موتور جستجوی هوشمند و برچسب‌های ناوبری",
            titleEn: "Unified Search Engine & Quick Navigation Tags",
            contentFa:
              "در کادر جستجوی هیرو، شما می‌توانید همزمان به جستجوی نام ماژول‌ها، کدهای پروژه، عنوان تسک‌ها و اصطلاحات دیکشنری بپردازید. در زیر کادر جستجو، برچسب‌های فیلتر سریع تعبیه شده‌اند:",
            contentEn:
              "The hero search bar allows querying modules, project codes, task titles, and dictionary terms. Quick filter tags below the search bar offer instant navigational routing:",
            steps: [
              {
                number: 1,
                titleFa: "تایپ عبارت کلیدی در نوار جستجو",
                titleEn: "Keyword Entry in Search Bar",
                descriptionFa:
                  "با شروع تایپ، نتایج منطبق به صورت زنده‌نمایش داده شده و امکان فشردن کلید اینتر برای باز کردن آیتم وجود دارد.",
                descriptionEn:
                  "As you type, matching results are filtered in real-time, allowing Enter key execution to open matching items.",
              },
              {
                number: 2,
                titleFa: "استفاده از برچسب‌های ناوبری زیر جستجو (Quick Filter Tags)",
                titleEn: "Using Quick Navigation Tags",
                descriptionFa:
                  "برچسب‌های زیر سرچ (پروژه‌ها، تسک‌ها، داشبورد) به شما اجازه می‌دهند بدون اتلاف وقت و با یک کلیک مستقیماً به محیط کاری مربوطه هدایت شوید.",
                descriptionEn:
                  "Filter tags beneath search (Projects, Tasks, Dashboard) redirect you directly to the respective workspace with a single click.",
                tipFa: "ترتیب تگ‌ها در زبان انگلیسی از چپ به راست تنظیم شده است",
                tipEn: "Tags flow intuitively from left to right in English mode",
              },
            ],
          },
          {
            id: "quick-access-customization",
            titleFa: "راهنمای گام به گام تنظیم و سفارشی‌سازی کارت‌های دسترسی سریع",
            titleEn: "Customizing the Quick Access Shortcut Dock",
            contentFa:
              "ردیف کارت‌های دسترسی سریع (Quick Access Dock) در زیر بخش هیرو به شما اجازه می‌دهد ابزارهای پرکاربرد خود را پین کنید تا همیشه در دسترس باشند:",
            contentEn:
              "The Quick Access Dock below the hero lets you pin your most-used modules for one-click access across daily operations:",
            steps: [
              {
                number: 1,
                titleFa: "ورود به حالت ویرایش کارت‌ها",
                titleEn: "Enter Dock Edit Mode",
                descriptionFa:
                  "روی کارت گسترش (Expand Tile) یا آیکون ویرایش در منوی سه‌نقطه هر کارت کلیک کنید تا پنل انتخاب ماژول‌ها با انیمیشن باز شود.",
                descriptionEn:
                  "Click the Expand Tile or the 3-dots edit menu on any card to smoothly open the selection and reordering tray.",
              },
              {
                number: 2,
                titleFa: "انتخاب و پین کردن کارت‌های مورد نظر",
                titleEn: "Select & Pin Target Cards",
                descriptionFa:
                  "از میان ماژول‌های فعال سامانه (پروژه‌ها، تسک‌ها، دیکشنری، ساعت، یادداشت‌ها و غیره) تا سقف ۱۲ ابزار را با کلیک روی آنها علامت بزنید.",
                descriptionEn:
                  "From all active modules (Projects, Tasks, Dictionary, Clock, Notes, etc.), select up to 12 tools by clicking their cards.",
              },
              {
                number: 3,
                titleFa: "ذخیره‌سازی و ماندگاری تنظیمات در مرورگر",
                titleEn: "Automated Persistence",
                descriptionFa:
                  "پس از بستن پنل ویرایش، چینش دلخواه شما به صورت خودکار در حافظه محلی (Local Storage) ذخیره شده و در مراجعات بعدی حفظ می‌گردد.",
                descriptionEn:
                  "Upon closing edit mode, your customized dock configuration is automatically persisted in browser Local Storage.",
                tipFa: "در صورت تغییر مرورگر، تنظیمات پیش‌فرض بهینه سیستم فعال می‌شود",
                tipEn: "Resetting browser cache reverts gracefully to optimal default layout",
              },
            ],
            callout: {
              type: "tip",
              titleFa: "عملکرد بهینه انیمیشن‌ها",
              titleEn: "Smooth Interactions Guarantee",
              contentFa:
                "کارت‌ها از افکت‌های تعاملی ملایم با تغییر پس‌زمینه و حاشیه بدون هیچ حرکت ناگهانی صفحه استفاده می‌کنند.",
              contentEn:
                "Cards utilize subtle background and border transitions without jarring layout shifts or unwanted translations.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "workspaces",
    titleFa: "داشبورد و فضاهای کاری",
    titleEn: "Dashboard & Workspaces",
    descriptionFa: "راهنمای کار با ویجت‌های داشبورد، مدیریت پروژه‌ها، شناسنامه آکاردئونی و بورد کانبان",
    descriptionEn: "Step-by-step guides for executive widgets, project portfolios, accordion specs, and Kanban",
    iconName: "FolderKanban",
    articles: [
      {
        id: "dashboard-widgets-guide",
        slug: "dashboard-widgets-guide",
        categoryId: "workspaces",
        titleFa: "داشبورد مدیریتی و ویجت‌های تعاملی",
        titleEn: "Executive Dashboard & Interactive Widgets",
        subtitleFa: "نحوه استفاده از ویجت ساعت جهانی، پیوندهای پرکاربرد با کمبوباکس، یادداشت‌های سریع کارگاهی و مرکز اعلان‌ها",
        subtitleEn: "How-to guide for World Clock, Useful Links combobox, Quick Notes with colored tags, and notifications",
        readingTimeMinutes: 5,
        standardRef: "EXEC-DASH-02",
        lastUpdated: "1405/02/10",
        tags: ["داشبورد", "ساعت جهانی", "لینک‌ها", "یادداشت‌ها", "Dashboard"],
        sections: [
          {
            id: "dashboard-overview",
            titleFa: "دیده‌بانی شاخص‌های کلیدی پروژه در داشبورد",
            titleEn: "Project KPIs & Executive Overview",
            contentFa:
              "داشبورد اصلی سامانه (`/dashboard`) خلاصه وضعیت پیشرفت پروژه‌ها، تعداد تسک‌های باز، نرخ انطباق با زمان‌بندی (SPI) و نرخ عملکرد هزینه (CPI) را در قالب کارت‌های آماری نمایش می‌دهد.",
            contentEn:
              "The executive dashboard (`/dashboard`) consolidates project progress, active tasks count, Schedule Performance Index (SPI), and Cost Performance Index (CPI) into concise metric summary cards.",
          },
          {
            id: "world-clock-guide",
            titleFa: "شیوه کار با ویجت ساعت جهانی (World Clock)",
            titleEn: "Using the Multi-Zone World Clock Widget",
            contentFa:
              "در پروژه‌های بین‌المللی نفت و گاز، هماهنگی جلسات فنی و استعلام اقلام از سازندگان خارجی نیازمند اطلاع از ساعت کاری پایتخت‌های صنعتی است. ویجت ساعت جهانی این نیاز را برطرف می‌کند:",
            contentEn:
              "For multi-national industrial projects, coordinating engineering calls and supplier transmittals requires tracking international working hours. The World Clock widget provides real-time timekeeping:",
            steps: [
              {
                number: 1,
                titleFa: "مشاهده مناطق زمانی ۴ گانه اصلی",
                titleEn: "Monitor 4 Primary Time Zones",
                descriptionFa:
                  "ساعت دقیق شهرهای تهران (Iran Standard Time)، لندن (GMT/BST)، دبی (GST) و نیویورک (EST/EDT) به صورت دیجیتال و آنالوگ نمایش داده می‌شود.",
                descriptionEn:
                  "Displays exact local times for Tehran (IRST), London (GMT/BST), Dubai (GST), and New York (EST/EDT) in both digital and analog modes.",
              },
              {
                number: 2,
                titleFa: "نشانگر وضعیت شیفت کاری (Office Shift Indicator)",
                titleEn: "Working Shift Status Indicator",
                descriptionFa:
                  "برچسب‌های سبز یا خاکستری کنار هر شهر نشان می‌دهد که آیا دفاتر فنی آن منطقه در حال حاضر در ساعات اداری فعال هستند یا خیر.",
                descriptionEn:
                  "Color-coded badges indicate whether technical engineering offices in that region are currently in active business hours.",
                tipFa: "اعداد و زمان در زبان فارسی با ارقام فارسی (fa-num) نمایش داده می‌شوند",
                tipEn: "Digits automatically format with Persian numerals in Persian mode",
              },
            ],
          },
          {
            id: "useful-links-guide",
            titleFa: "شیوه مدیریت و دسته‌بندی پیوندهای پرکاربرد (Useful Links)",
            titleEn: "Managing Useful Links with Categories ComboBox",
            contentFa:
              "ویجت لینک‌های مفید به کارشناسان و مدیران اجازه می‌دهد دسترسی سریع به پورتال‌های سازمانی، وب‌سایت‌های کارفرما، استانداردهای آنلاین و پوشه‌های اشتراکی شبکه ایجاد کنند:",
            contentEn:
              "The Useful Links widget enables engineers and managers to organize shortcuts to corporate intranets, client portals, online standards, and shared network drives:",
            steps: [
              {
                number: 1,
                titleFa: "افزودن لینک جدید",
                titleEn: "Add New Link Entry",
                descriptionFa:
                  "روی دکمه «افزودن لینک» در بالای ویجت کلیک کنید تا فرم مودال ثبت پیوند باز شود.",
                descriptionEn:
                  "Click the 'Add Link' button at the widget header to open the link creation modal dialog.",
              },
              {
                number: 2,
                titleFa: "ورود عنوان و آدرس معتبر (URL)",
                titleEn: "Enter Title & Valid URL",
                descriptionFa:
                  "عنوان توصیفی و آدرس مقصد (مانند https://standards.asme.org یا مسیر داخلی شبکه) را وارد نمایید.",
                descriptionEn:
                  "Input a clear descriptive label and the target URL (e.g., https://standards.asme.org or network path).",
              },
              {
                number: 3,
                titleFa: "انتخاب دسته‌بندی با کامپوننت هوشمند ComboBox",
                titleEn: "Assign Category via ComboBox",
                descriptionFa:
                  "به جای فیلدهای ساده متنی، از کمبوباکس دسته‌بندی‌ها (فنی، مهندسی، اسناد کارفرما، استانداردها) با پشتیبانی کامل از چینش راست‌به‌چپ (RTL) استفاده کنید.",
                descriptionEn:
                  "Select an appropriate discipline category (Technical, Engineering, Client Portal, Standards) using the searchable RTL-compliant ComboBox.",
              },
              {
                number: 4,
                titleFa: "پین‌کردن پیوندهای اولویت‌دار",
                titleEn: "Pin High-Priority Links",
                descriptionFa:
                  "با کلیک روی آیکون پین، پیوندهای حیاتی به بالای فهرست منتقل شده و در مراجعات بعدی سریع‌تر در دسترس خواهند بود.",
                descriptionEn:
                  "Click the pin icon to float essential URLs to the top of the list for instant access.",
              },
            ],
          },
          {
            id: "quick-notes-guide",
            titleFa: "شیوه ثبت یادداشت‌های سریع با برچسب‌های رنگی (Quick Notes)",
            titleEn: "Quick Scratchpad Notes with Topic Tags",
            contentFa:
              "ویجت یادداشت‌های سریع یک دفترچه یادداشت کارگاهی هوشمند برای ثبت تذکرات تلفنی، اقدامات فوری، صورت‌جلسات کارگاهی و چک‌لیست‌های شخصی مهندسان است:",
            contentEn:
              "The Quick Notes widget provides a responsive scratchpad for jotting down workshop memos, phone instructions, minutes of meeting, and personal checklists:",
            steps: [
              {
                number: 1,
                titleFa: "ایجاد یادداشت جدید",
                titleEn: "Create New Note",
                descriptionFa:
                  "روی دکمه یادداشت جدید کلیک کرده و متن مورد نظر خود را در فیلد ورودی تایپ کنید.",
                descriptionEn:
                  "Click the new note button and enter your observations or actionable engineering items.",
              },
              {
                number: 2,
                titleFa: "تخصیص برچسب‌های رنگی موضوعی",
                titleEn: "Assign Discipline Color Tags",
                descriptionFa:
                  "یادداشت را با برچسب‌های تفکیک‌شده (مکانیک، فرآیند، فوری، پایپینگ، اداری) علامت‌گذاری کنید تا تفکیک بصری آنها آسان شود.",
                descriptionEn:
                  "Tag your note with distinct categories (Mechanical, Process, Urgent, Piping, Admin) for clear visual segregation.",
              },
              {
                number: 3,
                titleFa: "پین‌کردن و علامت‌گذاری انجام‌شده",
                titleEn: "Pinning & Done Checklist Status",
                descriptionFa:
                  "یادداشت‌های مهم را پین کنید تا همواره در بالای کادر بمانند. پس از تکمیل کار، می‌توانید چک‌باکس انجام‌شده را بزنید یا یادداشت را حذف کنید.",
                descriptionEn:
                  "Pin critical memos to the top. When finished, mark the completed checkbox or discard the note cleanly.",
              },
            ],
          },
        ],
      },
      {
        id: "projects-management-guide",
        slug: "projects-management-guide",
        categoryId: "workspaces",
        titleFa: "مدیریت پروژه‌ها، فرم ۵ مرحله‌ای، شناسنامه آکاردئونی و VDIS",
        titleEn: "Projects Management, 5-Step Wizard & VDIS",
        subtitleFa: "راهنمای کامل گرید پروژه‌ها، ثبت پروژه جدید، مشاهده شناسنامه آکاردئونی، فازهای WBS و تایید اسناد فنی",
        subtitleEn: "Comprehensive guide for project portfolio, 5-step creation wizard, 8-segment accordion overview, and VDIS transmittals",
        readingTimeMinutes: 8,
        standardRef: "VDIS-EPC-05",
        lastUpdated: "1405/02/10",
        tags: ["پروژه‌ها", "WBS", "VDIS", "ترنسمیتال", "Projects", "Overview"],
        sections: [
          {
            id: "projects-portfolio",
            titleFa: "نمای گرید، جدول و فیلترهای هوشمند سبد پروژه‌ها",
            titleEn: "Project Portfolio Views & Smart Filters",
            contentFa:
              "در صفحه پروژه‌ها (`/dashboard/projects`)، تمام پروژه‌های جاری و تکمیل‌شده شرکت لیست شده‌اند. با دکمه تغییر نما در نوار ابزار بالا، می‌توانید بین کارت‌های بصری (Grid View) و جدول فشرده مشخصات (Table View) سوئیچ کنید. فیلترها امکان جستجو بر اساس کارفرما، نوع قرارداد (EPC, EP, Engineering) و وضعیت پروژه را فراهم می‌آورند.",
            contentEn:
              "On the projects screen (`/dashboard/projects`), active and archived company contracts are listed. You can toggle between rich visual cards (Grid View) and compact data rows (Table View). Filters support searching by client, contract type, and delivery status.",
          },
          {
            id: "new-project-wizard",
            titleFa: "راهنمای گام به گام تعریف پروژه جدید در فرم ۵ مرحله‌ای",
            titleEn: "5-Step New Project Creation Wizard",
            contentFa:
              "تعریف یک پروژه استاندارد صنعتی نیازمند تکمیل اطلاعات دقیق در قالب ۵ گام ساختاریافته است:",
            contentEn:
              "Registering a standard industrial project follows a structured 5-step wizard to guarantee complete contractual and engineering baselines:",
            steps: [
              {
                number: 1,
                titleFa: "گام اول: اطلاعات پایه و شناسنامه قرارداد",
                titleEn: "Step 1: Basic Information & Contract Identity",
                descriptionFa:
                  "ثبت عنوان پروژه، کد رهگیری قرارداد، کارفرمای اصلی، نوع قرارداد (EPC، خرید، طراحی) و موقعیت جغرافیایی سایت.",
                descriptionEn:
                  "Enter official project title, contract tracking code, primary client, contracting model, and geographical site location.",
              },
              {
                number: 2,
                titleFa: "گام دوم: ساختار تیم و تخصیص پیمانکاران",
                titleEn: "Step 2: Team Structure & Subcontractors",
                descriptionFa:
                  "تعیین مدیر پروژه (Project Manager)، مهندسان ارشد دپارتمان‌های فرآیند، مکانیک و پایپینگ، و ثبت اطلاعات پیمانکاران جزء.",
                descriptionEn:
                  "Assign the project manager, lead discipline engineers (Process, Mechanical, Piping), and specify verified subcontractors.",
              },
              {
                number: 3,
                titleFa: "گام سوم: برآورد بودجه و فازهای ساختار شکست کار (WBS)",
                titleEn: "Step 3: Budget Breakdown & WBS Phases",
                descriptionFa:
                  "ورود ارزش ریالی و ارزی پروژه و تفکیک اوزان فازهای مهندسی پایه، تفصیلی، خرید تجهیزات و ساخت کارگاهی.",
                descriptionEn:
                  "Define total budget and currency breakdown, assigning percentage weightings to Engineering, Procurement, and Fabrication phases.",
              },
              {
                number: 4,
                titleFa: "گام چهارم: جدول زمان‌بندی و مایلستون‌های کلیدی",
                titleEn: "Step 4: Milestones & Schedule Baseline",
                descriptionFa:
                  "تعیین تاریخ ابلاغ قرارداد، تاریخ تحویل اسناد مهندسی، موعد بازرسی FAT و زمان ارسال تجهیزات به کارگاه نصب.",
                descriptionEn:
                  "Establish kick-off date, VDIS document delivery milestones, shop FAT inspection dates, and site delivery deadlines.",
              },
              {
                number: 5,
                titleFa: "گام پنجم: پیوست مستندات اولیه و ثبت قطعی",
                titleEn: "Step 5: Document Attachments & Final Review",
                descriptionFa:
                  "بارگذاری فایل PDF شرح خدمات (TOR) یا قرارداد اولیه، بازبینی نهایی چکیده اطلاعات و فشردن دکمه ثبت قطعی پروژه.",
                descriptionEn:
                  "Upload initial Scope of Work (SOW) or contract PDF, conduct a final parameter review, and submit the project.",
                tipFa: "امکان ذخیره پیش‌نویس در هر مرحله از فرم ویزارد وجود دارد",
                tipEn: "Draft progress can be saved at any stage before final confirmation",
              },
            ],
          },
          {
            id: "accordion-overview-guide",
            titleFa: "شیوه کار با شناسنامه آکاردئونی ۸ گانه پروژه (Overview)",
            titleEn: "8-Segment Accordion Project Overview",
            contentFa:
              "در برگه نمای کلی هر پروژه (`Overview`)، به جای تب‌های مجزا و پراکنده، تمامی اطلاعات حیاتی پروژه در ۸ بخش آکاردئونی تاشو با قابلیت باز و بسته شدن هوشمند دسته‌بندی شده‌اند:",
            contentEn:
              "Inside each project's Overview tab, all vital parameters are organized into 8 collapsible accordion segments for unified, high-density monitoring:",
            steps: [
              {
                number: 1,
                titleFa: "بخش ۱: شناسنامه و اطلاعات کلی (Project Identity)",
                titleEn: "Segment 1: Project Identity & Specs",
                descriptionFa:
                  "عنوان، کارفرما، موقعیت جغرافیایی، تاریخ شروع و پایان، و وضعیت جاری عملیات.",
                descriptionEn:
                  "Project title, client name, site location, start/end dates, and operational status.",
              },
              {
                number: 2,
                titleFa: "بخش ۲: مشخصات مالی و شرایط قرارداد (Contract & Commercial)",
                titleEn: "Segment 2: Contract & Commercial Terms",
                descriptionFa:
                  "ارزش قرارداد به تفکیک ریالی و ارزی، نحوه پرداخت، وضعیت تضامین بانکی و شرایط تعدیل.",
                descriptionEn:
                  "Contract value breakdown, billing terms, bank guarantees status, and price adjustments.",
              },
              {
                number: 3,
                titleFa: "بخش ۳: شاخص‌های کلیدی عملکرد (Key Metrics & EVM)",
                titleEn: "Segment 3: Earned Value Metrics (EVM)",
                descriptionFa:
                  "محاسبه شاخص‌های استاندارد مدیریت ارزش کسب‌شده شامل SPI (راندمان زمان)، CPI (راندمان هزینه) و انحراف از برنامه.",
                descriptionEn:
                  "Earned Value Management KPIs including Schedule Performance Index (SPI), Cost Index (CPI), and variances.",
              },
              {
                number: 4,
                titleFa: "بخش ۴: تیم پروژه و ماتریس مسئولیت‌ها (Team & RACI)",
                titleEn: "Segment 4: Team RACI Responsibility Matrix",
                descriptionFa:
                  "اعضای کلیدی تیم فنی، مدیر پروژه، دپارتمان‌ها و ماتریس مشخص‌کننده مسئول، پاسخگو، مشاور و مطلع (RACI).",
                descriptionEn:
                  "Project staff directory, discipline leads, and RACI matrix (Responsible, Accountable, Consulted, Informed).",
              },
              {
                number: 5,
                titleFa: "بخش ۵: وضعیت پیشرفت فیزیکی فازها (Physical Progress)",
                titleEn: "Segment 5: WBS Physical Progress Bars",
                descriptionFa:
                  "نوارهای پیشرفت فیزیکی واقعی در مقایسه با پیشرفت برنامه‌ای در هر یک از بسته‌های کاری WBS.",
                descriptionEn:
                  "Actual vs planned progress bars across all individual Work Breakdown Structure packages.",
              },
              {
                number: 6,
                titleFa: "بخش ۶: گزارش پیشرفت و منحنی S-Curve",
                titleEn: "Segment 6: Progress Reports & S-Curve Curves",
                descriptionFa:
                  "نمودار انطباق پیشرفت تجمعی پروژه در طول زمان به همراه پیش‌بینی تاریخ تکمیل نهایی کار.",
                descriptionEn:
                  "Cumulative planned vs actual progress tracking curve with automated completion forecasting.",
              },
              {
                number: 7,
                titleFa: "بخش ۷: ماتریس و تحلیل ریسک‌های پروژه (Risk Matrix)",
                titleEn: "Segment 7: Project Risk Assessment Matrix",
                descriptionFa:
                  "شناسایی ریسک‌های فنی، قراردادی و تدارکاتی به همراه ارزیابی احتمال وقوع، شدت اثر و اقدامات کاهش ریسک.",
                descriptionEn:
                  "Technical, procurement, and site risks mapped against probability and severity with mitigation plans.",
              },
              {
                number: 8,
                titleFa: "بخش ۸: اسناد مرجع و مسیر ذخیره‌سازی DMS",
                titleEn: "Segment 8: Reference Documents & Storage Path",
                descriptionFa:
                  "فهرست مدارک مصوب، مسیر دسترسی به پوشه آرشیو در سرور شبکه (DMS Path) با قابلیت کپی مستقیم مسیر با یک کلیک.",
                descriptionEn:
                  "Approved drawing register and direct network DMS file storage path with one-click clipboard copying.",
              },
            ],
          },
          {
            id: "vdis-transmittals-guide",
            titleFa: "گردش کار ترنسمیتال و بازنگری اسناد VDIS",
            titleEn: "VDIS Document Transmittal & Code Approvals",
            contentFa:
              "سیستم اسناد فروشنده (VDIS) چرخه عمر نقشه‌ها و مدارک مهندسی را از ویرایش اولیه (Rev A) تا تایید نهایی کارفرما (Code 1 / Approved) کنترل و ثبت وقایع می‌کند:",
            contentEn:
              "The Vendor Document Index Schedule (VDIS) oversees drawing and document lifecycles from preliminary Rev A to final client approval (Code 1 / Approved):",
            steps: [
              {
                number: 1,
                titleFa: "ثبت مدرک در جدول VDIS",
                titleEn: "Register Document in VDIS Table",
                descriptionFa:
                  "ورود شماره مدرک طبق استاندارد کدگذاری پروژه، عنوان دوزبانه، دپارتمان تهیه‌کننده و شماره بازنگری.",
                descriptionEn:
                  "Enter document number per numbering procedure, bilingual title, responsible discipline, and revision code.",
              },
              {
                number: 2,
                titleFa: "بارگذاری نسخه الکترونیکی مدرک",
                titleEn: "Upload Document Payload",
                descriptionFa:
                  "الصاق فایل نهایی PDF و فایل سورس قابل ویرایش (مانند نقشه‌های اتوکد DWG یا اکسل محاسبات).",
                descriptionEn:
                  "Attach finalized PDF and editable source files (AutoCAD DWG drawings, Excel calculation sheets).",
              },
              {
                number: 3,
                titleFa: "ارسال ترنسمیتال و دریافت کد تاییدیه",
                titleEn: "Submit Transmittal & Approval Code",
                descriptionFa:
                  "صدور ترنسمیتال رسمی و ثبت کدهای تایید سه گانه: کد ۱ (تایید کامل بدون شرط)، کد ۲ (تایید مشروط به اعمال اصلاحات)، کد ۳ (رد مدرک و نیاز به ارسال مجدد).",
                descriptionEn:
                  "Issue official transmittal and record approval status: Code 1 (Approved), Code 2 (Approved as Noted), Code 3 (Rejected, Revise & Resubmit).",
              },
            ],
            callout: {
              type: "important",
              titleFa: "قانون بسته‌شدن اسناد مهندسی",
              titleEn: "Engineering Document Sign-off Rule",
              contentFa:
                "تنها مدارکی که کد ۱ دریافت کنند به عنوان نسخه نهایی ساخت (IFC - Issued For Construction) معتبر شناخته می‌شوند.",
              contentEn:
                "Only documents granted Code 1 approval are recognized as valid Issued For Construction (IFC) deliverables.",
            },
          },
        ],
      },
      {
        id: "tasks-workflow-guide",
        slug: "tasks-workflow-guide",
        categoryId: "workspaces",
        titleFa: "مدیریت وظایف، بورد کانبان و چک‌لیست زیرتسک‌ها",
        titleEn: "Tasks Management, Kanban & Checklist Workflows",
        subtitleFa: "نحوه ایجاد وظایف، جابجایی در ستون‌های کانبان، محاسبه درصد پیشرفت و تایید تسک‌های مدیر",
        subtitleEn: "Managing tasks, Kanban drag & drop, checklist progress recalculation, and manager-assigned approvals",
        readingTimeMinutes: 6,
        standardRef: "AGILE-TASK-03",
        lastUpdated: "1405/02/10",
        tags: ["تسک‌ها", "کانبان", "چک‌لیست", "وظایف", "Tasks"],
        sections: [
          {
            id: "kanban-vs-table",
            titleFa: "نماهای دوگانه کانبان و جدول تحلیلی",
            titleEn: "Dual Kanban Board & Analytical Table Views",
            contentFa:
              "در ماژول تسک‌ها (`/dashboard/tasks`)، شما می‌توانید با استفاده از کلید سوئیچ بالای صفحه بین نمای ستون‌های بصری کانبان (برای دیدن جریان پیوسته کار) و نمای جدول فشرده (برای مشاهده جزییات و ددلاین‌ها) جابجا شوید:",
            contentEn:
              "In the tasks module (`/dashboard/tasks`), the top view switch enables toggling between visual Kanban workflow columns and an analytical tabular grid for deadline reviews:",
            steps: [
              {
                number: 1,
                titleFa: "نمای کانبان (Kanban Board)",
                titleEn: "Kanban Board Mode",
                descriptionFa:
                  "ستون‌های تفکیک‌شده (انجام‌نشده، در حال انجام، در انتظار بررسی، تکمیل‌شده) با امکان کشیدن و رها کردن کارت‌ها بین ستون‌ها.",
                descriptionEn:
                  "Organized columns (To Do, In Progress, In Review, Done) with seamless drag & drop movement.",
              },
              {
                number: 2,
                titleFa: "نمای جدول داده‌ها (Table View)",
                titleEn: "Table Grid Mode",
                descriptionFa:
                  "جدول مرتب‌سازی‌شده شامل نام تسک، پروژه، مسئول، درصد پیشرفت، سطح اولویت و تاریخ سررسید با فیلترهای بلادرنگ.",
                descriptionEn:
                  "Sortable tabular view displaying task titles, project, assignee, progress %, priority badge, and due date.",
              },
            ],
          },
          {
            id: "create-and-assign-task",
            titleFa: "شیوه ایجاد وظیفه و تخصیص به کارشناسان",
            titleEn: "Task Creation & Assignment Workflow",
            contentFa:
              "برای ایجاد یک تسک مهندسی دقیق مراحل زیر را دنبال کنید:",
            contentEn:
              "Follow these steps to define an engineering task with clear operational boundaries:",
            steps: [
              {
                number: 1,
                titleFa: "کلیک روی دکمه «تسک جدید»",
                titleEn: "Click 'New Task' Button",
                descriptionFa:
                  "دکمه افزودن تسک را از نوار بالای صفحه فشرده تا فرم پنجره‌ای تعریف تسک باز شود.",
                descriptionEn:
                  "Click the new task trigger button in the upper toolbar to launch the task creation drawer.",
              },
              {
                number: 2,
                titleFa: "تعیین عنوان، پروژه و اولویت",
                titleEn: "Specify Title, Project & Priority",
                descriptionFa:
                  "عنوان خلاصه و صریح وارد کنید، پروژه مربوطه را انتخاب نموده و اولویت را از میان گزینه‌های ضروری (Urgent)، بالا، متوسط یا پایین برگزینید.",
                descriptionEn:
                  "Input a concise actionable title, link to the parent project, and select priority tier (Urgent, High, Medium, Low).",
              },
              {
                number: 3,
                titleFa: "تخصیص فرد مسئول و مهلت انجام (ددلاین)",
                titleEn: "Assignee & Deadline Scheduling",
                descriptionFa:
                  "کارشناس مسئول تسک را انتخاب کرده و تاریخ سررسید دقیق را بر اساس تقویم سیستم تنظیم نمایید.",
                descriptionEn:
                  "Select the designated responsible engineer and establish an exact deadline using the system date picker.",
              },
            ],
          },
          {
            id: "checklist-subtasks-progress",
            titleFa: "کار با چک‌لیست زیرتسک‌ها و محاسبه اتوماتیک درصد پیشرفت",
            titleEn: "Subtask Checklists & Auto-Recalculated Progress",
            contentFa:
              "در برگه جزییات هر تسک، امکان تعریف چک‌لیست اقلام کاری وجود دارد. سامانه مجهز به موتور محاسبه خودکار درصد پیشرفت است:",
            contentEn:
              "Inside task details, you can add granular work items. The system features an automated progress recalculation engine:",
            steps: [
              {
                number: 1,
                titleFa: "افزودن زیرتسک‌ها",
                titleEn: "Add Granular Subtasks",
                descriptionFa:
                  "مراحل اجرایی کار را به آیتم‌های چک‌لیست تفکیک کنید (مثال: تهیه مدل سه‌بعدی، اعمال بارهای استاتیکی، استخراج نتایج).",
                descriptionEn:
                  "Break down the assignment into distinct checklist items (e.g., 3D model preparation, static load application, stress analysis).",
              },
              {
                number: 2,
                titleFa: "محاسبه خودکار درصد پیشرفت با تیک‌زدن هر آیتم",
                titleEn: "Instant Mathematical Recalculation",
                descriptionFa:
                  "با تیک زدن هر آیتم، درصد پیشرفت تسک بلافاصله مجدداً محاسبه و به‌روزرسانی می‌شود (مثال: انجام ۲ زیرتسک از ۴ زیرتسک معادل ۵۰٪ پیشرفت خواهد بود).",
                descriptionEn:
                  "Checking any subtask immediately recalculates the overall task percentage (e.g. 2 of 4 items completed automatically yields 50%).",
                tipFa: "تکمیل ۱۰۰٪ زیرتسک‌ها کارت را آماده تایید و بسته شدن می‌نماید",
                tipEn: "Reaching 100% checklist completion prepares the task for completion sign-off",
              },
            ],
          },
          {
            id: "attachments-and-manager-clearance",
            titleFa: "پیوست مدارک مهندسی و فرآیند تایید تسک‌های مدیر",
            titleEn: "Engineering Attachments & Manager Sign-off",
            contentFa:
              "مهندسان می‌توانند فایل‌های پیوست (نقشه‌های اتوکد DWG، فایل‌های محاسباتی اکسل و مستندات PDF) را به تسک الصاق کنند:",
            contentEn:
              "Engineers can attach technical payloads directly to task items (AutoCAD DWG drawings, Excel sheets, calculation PDFs):",
            callout: {
              type: "important",
              titleFa: "قانون تایید تسک‌های محوله مدیر (Manager-Assigned)",
              titleEn: "Manager-Assigned Task Verification Rule",
              contentFa:
                "تسک‌هایی که توسط مدیر فنی به کارشناس واگذار شده‌اند، پس از تکمیل ۱۰۰٪ توسط کارشناس، مستقیماً بسته نمی‌شوند؛ بلکه به وضعیت «در انتظار تایید مدیر» منتقل شده و نیازمند تایید نهایی مدیر فنی پروژه هستند.",
              contentEn:
                "Tasks assigned directly by technical management do not close immediately upon 100% engineer completion; they transition to 'In Review' requiring final managerial sign-off.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "engineering",
    titleFa: "بانک دانش و دیکشنری مهندسی",
    titleEn: "Engineering Knowledge & Lexicon",
    descriptionFa: "راهنمای استفاده از دیکشنری تخصصی صنایع نفت و گاز و پایگاه دانش کاربردی متالورژی",
    descriptionEn: "Guides for specialized oil & gas dictionary, technical standards, and industrial metallurgy tips",
    iconName: "BookOpen",
    articles: [
      {
        id: "engineering-dictionary-guide",
        slug: "engineering-dictionary-guide",
        categoryId: "engineering",
        titleFa: "دیکشنری مهندسی نفت، گاز و پتروشیمی",
        titleEn: "Specialized Engineering Dictionary Guide",
        subtitleFa: "راهنمای جستجوی بلادرنگ، فیلترهای الفبایی، گرایش‌های مهندسی و استانداردهای بین‌المللی",
        subtitleEn: "Guide for instant search, alphabetical indexing, discipline filters, and international engineering standards",
        readingTimeMinutes: 5,
        standardRef: "ASME / API / ASTM Index",
        lastUpdated: "1405/02/10",
        tags: ["دیکشنری", "اصطلاحات", "استانداردها", "Dictionary", "Standards"],
        sections: [
          {
            id: "dictionary-capabilities",
            titleFa: "اهداف و جامعیت اصطلاحات دیکشنری فنی",
            titleEn: "Dictionary Scope & Lexicon Coverage",
            contentFa:
              "دیکشنری تخصصی مهندسی سامانه (`/dashboard/dictionary`) یک مرجع جامع از اصطلاحات، اختصارات فنی، استانداردهای بین‌المللی و تعاریف مهندسی در زمینه‌های مکانیک، فرآیند، متالورژی، پایپینگ، برق و ابزاردقیق است.",
            contentEn:
              "The specialized engineering dictionary (`/dashboard/dictionary`) is an authoritative repository of technical terms, acronyms, international standards, and formulas across Mechanical, Process, Metallurgy, Piping, Electrical, and Instrumentation disciplines.",
          },
          {
            id: "search-and-filtering-guide",
            titleFa: "شیوه جستجو، فیلتر الفبایی و دسته‌بندی گرایش‌ها",
            titleEn: "Real-time Search, Alphabetical Filters & Disciplines",
            contentFa:
              "یافتن اصطلاحات در دیکشنری به سه روش سریع و منعطف صورت می‌پذیرد:",
            contentEn:
              "Locating terminology in the dictionary is supported via three high-speed lookup mechanisms:",
            steps: [
              {
                number: 1,
                titleFa: "جستجوی زنده در نوار جستجو (Live Instant Search)",
                titleEn: "Instant Real-time Search",
                descriptionFa:
                  "واژه انگلیسی، معادل فارسی یا مخفف صنعتی (مانند HAZ, PWHT, NPSHA, ASME) را در کادر جستجو تایپ کنید تا نتایج بلافاصله فیلتر شوند.",
                descriptionEn:
                  "Type English words, Persian translations, or industry acronyms (e.g. HAZ, PWHT, NPSHA, ASME) for immediate filtering.",
              },
              {
                number: 2,
                titleFa: "فیلتر بر اساس گرایش تخصصی مهندسی",
                titleEn: "Filter by Engineering Discipline",
                descriptionFa:
                  "با کلیک روی دکمه‌های فیلتر گرایش (فرآیند، مکانیک، متالورژی، ابزاردقیق، پایپینگ)، دایره اصطلاحات را به رشته تخصصی خود محدود کنید.",
                descriptionEn:
                  "Click discipline toggle badges (Process, Mechanical, Metallurgy, Instrumentation, Piping) to narrow the glossary.",
              },
              {
                number: 3,
                titleFa: "مرور الفبایی انگلیسی (A-Z) و فارسی (الف-ی)",
                titleEn: "Alphabetical Index Browsing",
                descriptionFa:
                  "نوار الفبایی به شما امکان می‌دهد با کلیک روی هر حرف، تمامی واژگان آغاز شونده با آن حرف را به ترتیب الفبا مشاهده نمایید.",
                descriptionEn:
                  "The alphabetical indexing bar allows jumping directly to terms starting with any specific letter in both English and Persian.",
              },
            ],
          },
          {
            id: "term-anatomy-and-standards",
            titleFa: "ساختار کارت اصطلاح و ارجاعات استاندارد",
            titleEn: "Term Card Anatomy & Standards Cross-referencing",
            contentFa:
              "هر کارت اصطلاح در دیکشنری شامل موارد زیر است: عنوان رسمی انگلیسی، ترجمه دقیق فنی به فارسی، تعریف جامع علمی، استانداردهای مرجع مرتبط (ASME BPVC, API 650, ASTM A516, ISO 13709)، و در صورت نیاز فرمول‌های محاسباتی حاکم بر آن.",
            contentEn:
              "Each term card details: official English designation, standardized Persian terminology, in-depth definition, applicable international standards (ASME BPVC, API 650, ASTM A516, ISO 13709), and governing physical equations.",
            callout: {
              type: "tip",
              titleFa: "کپی سریع معادل‌های استاندارد",
              titleEn: "One-Click Translation Copying",
              contentFa:
                "با کلیک روی آیکون کپی در کنار هر اصطلاح، نام و تعریف استاندارد آن در کلیپ‌بورد کپی شده تا در نگارش گزارش‌ها و مدارک مهندسی به کار گرفته شود.",
              contentEn:
                "Clicking the copy icon next to any entry copies the standardized term for rapid insertion into technical transmittals and reports.",
            },
          },
        ],
      },
      {
        id: "industrial-insights-guide",
        slug: "industrial-insights-guide",
        categoryId: "engineering",
        titleFa: "بانک دانش کاربردی، متالورژی و نکات کارگاهی",
        titleEn: "Industrial Insights & Metallurgy Knowledge",
        subtitleFa: "راهنمای بهره‌برداری از ماژول «آیا می‌دانید؟»، آلیاژهای پیشرفته، تنش‌زدایی و بازرسی NDT",
        subtitleEn: "Practical guide to industrial flashcards, high-temperature superalloys, PWHT guidelines, and NDT inspection",
        readingTimeMinutes: 5,
        standardRef: "API 510 / NACE MR0175",
        lastUpdated: "1405/02/10",
        tags: ["دانستنی‌ها", "متالورژی", "آلیاژها", "بازرسی", "Did You Know", "NDIS"],
        sections: [
          {
            id: "insights-overview",
            titleFa: "هدف از بخش «آیا می‌دانید؟» در مهندسی کاربردی",
            titleEn: "Purpose of Industrial Engineering Insights",
            contentFa:
              "ماژول «آیا می‌دانید؟» (`/dashboard/did-you-know`) مجموعه‌ای از گزیده‌های کلیدی و نکات طلایی کارگاهی در خصوص متالورژی فلزات، عملیات حرارتی پس از جوشکاری، خوردگی در محیط‌های ترش نفت و گاز، و بازرسی‌های کنترل کیفی است که مهندسان طراح و ناظران کارگاه در تصمیم‌گیری‌های روزمره به آن نیاز دارند.",
            contentEn:
              "The 'Did You Know' module (`/dashboard/did-you-know`) compiles essential shop-floor insights, metallurgy facts, post-weld heat treatment rules, sour-service corrosion mechanisms, and QC inspection criteria for everyday design and fabrication decisions.",
          },
          {
            id: "metallurgy-and-superalloys",
            titleFa: "نکات کلیدی متالورژی، سوپرآلیاژها و عملیات حرارتی (PWHT)",
            titleEn: "Metallurgy Superalloys & PWHT Guidelines",
            contentFa:
              "این بخش شامل فکت‌های مهندسی زیر است که منطبق بر استانداردهای بین‌المللی تدوین شده‌اند:",
            contentEn:
              "The curated knowledge base highlights verified industrial principles aligned with international engineering codes:",
            steps: [
              {
                number: 1,
                titleFa: "سوپرآلیاژهای پایه نیکل و فولادهای زنگ‌نزن دابلکس",
                titleEn: "Nickel Superalloys & Duplex Stainless Steels",
                descriptionFa:
                  "رفتار مکانیکی و مقاومت خوردگی آلیاژهای Inconel 625، Hastelloy C-276 و Super Duplex 2507 در برابر خوردگی شیاری و حفره‌ای بر اساس شاخص PREN.",
                descriptionEn:
                  "Mechanical and corrosion behavior of Inconel 625, Hastelloy C-276, and Super Duplex 2507 against pitting and crevice corrosion governed by PREN index.",
              },
              {
                number: 2,
                titleFa: "عملیات حرارتی پس از جوشکاری (PWHT)",
                titleEn: "Post Weld Heat Treatment (PWHT)",
                descriptionFa:
                  "دمای نگهداری (Soak Temperature)، نرخ گرمایش و سرمایش کنترل‌شده جهت تنش‌زدایی و جلوگیری از ترک هیدروژنی در فولادهای کربنی و آلیاژی مطابق ASME Sec VIII و B31.3.",
                descriptionEn:
                  "Soak temperatures, controlled heating/cooling gradients to relieve residual weld stresses and prevent hydrogen cracking per ASME Sec VIII and B31.3.",
              },
              {
                number: 3,
                titleFa: "آزمون‌های غیرمخرب (NDT) و معیارهای پذیرش",
                titleEn: "Non-Destructive Testing (NDT) Acceptance",
                descriptionFa:
                  "مقایسه کاربردی تست‌های رادیوگرافی (RT)، اولتراسونیک (UT)، ذرات مغناطیسی (MPI) و مایع نافذ (PT) بر اساس ASME Sec V و استانداردهای بازرسی کارگاهی.",
                descriptionEn:
                  "Comparative criteria for Radiographic (RT), Ultrasonic (UT), Magnetic Particle (MPI), and Dye Penetrant (PT) testing per ASME Sec V.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "admin-security",
    titleFa: "مدیریت کاربران، پروفایل و امنیت",
    titleEn: "Personnel, Admin & Security",
    descriptionFa: "راهنمای ثبت پروفایل پرسنلی، احراز هویت، کارتابل مدیریت و کنترل دسترسی RBAC",
    descriptionEn: "Personnel profile onboarding, credential verification cartable, and RBAC matrix",
    iconName: "Shield",
    articles: [
      {
        id: "profile-onboarding-guide",
        slug: "profile-onboarding-guide",
        categoryId: "admin-security",
        titleFa: "پروفایل پرسنلی، مدارک هویتی و تایید دو مرحله‌ای",
        titleEn: "Personnel Profile, Onboarding & Two-Tier Approval",
        subtitleFa: "نحوه ثبت اطلاعات پرسنلی با ایزولاسیون کاراکتر دوزبانه، بارگذاری مدارک و فرآیند تایید HR و مدیر",
        subtitleEn: "Step-by-step personnel profile setup, bilingual character isolation, credentials upload, and two-tier HR/Manager approval pipeline",
        readingTimeMinutes: 6,
        standardRef: "HR-SEC-04",
        lastUpdated: "1405/02/10",
        tags: ["پروفایل", "احراز هویت", "منابع انسانی", "مدیر", "Profile", "Onboarding"],
        sections: [
          {
            id: "bilingual-script-isolation",
            titleFa: "قانون ایزولاسیون کاراکتری فیلدهای نام و مشخصات",
            titleEn: "Strict Bilingual Character Script Isolation",
            contentFa:
              "در فرم ثبت اطلاعات پرسنلی (`/dashboard/profile`)، به منظور جلوگیری از اختلاط زبان‌ها و حفظ یکپارچگی پایگاه داده، فیلدهای نام دارای محدودیت دقیق تایپی هستند:",
            contentEn:
              "In the profile registration form (`/dashboard/profile`), strict script isolation rules are enforced to preserve clean multilingual database integrity:",
            steps: [
              {
                number: 1,
                titleFa: "فیلدهای نام و نام‌خانوادگی فارسی (firstNameFa / lastNameFa)",
                titleEn: "Persian Name Fields",
                descriptionFa:
                  "این فیلدها منحصراً حروف فارسی، فاصله و نیم‌فاصله (ZWNJ) را می‌پذیرند. هرگونه حروف انگلیسی، اعداد یا کاراکترهای نامعتبر به صورت خودکار حذف می‌شوند.",
                descriptionEn:
                  "These fields strictly accept Persian characters, spaces, and half-space (ZWNJ). English letters, numbers, and special symbols are stripped immediately.",
              },
              {
                number: 2,
                titleFa: "فیلدهای نام و نام‌خانوادگی انگلیسی (firstName / lastName)",
                titleEn: "English Name Fields",
                descriptionFa:
                  "این فیلدها منحصراً حروف لاتین (a-z, A-Z)، فاصله، خط فاصله و آپاستروف را می‌پذیرند و حروف فارسی یا اعداد در آنها غیرمجاز است.",
                descriptionEn:
                  "These fields strictly accept Latin alphabet characters, spaces, hyphens, and apostrophes. Persian letters and digits are blocked.",
              },
            ],
            callout: {
              type: "important",
              titleFa: "عدم تداخل برچسب‌های دوزبانه",
              titleEn: "Pure Localization of Field Labels",
              contentFa:
                "در حالت نمایش انگلیسی، برچسب‌ها ۱۰۰٪ انگلیسی بوده و در حالت نمایش فارسی، برچسب‌ها ۱۰۰٪ فارسی بدون ترکیب واژگان خارجی نمایش داده می‌شوند.",
              contentEn:
                "Labels in English mode are 100% English, and labels in Persian mode are 100% Persian without mixing foreign words.",
            },
          },
          {
            id: "profile-completion-steps",
            titleFa: "شیوه تکمیل گام به گام پروفایل و بارگذاری مدارک",
            titleEn: "Profile Completion & Document Upload Steps",
            contentFa:
              "برای ارسال درخواست احراز هویت سازمانی مراحل زیر را طی نمایید:",
            contentEn:
              "Complete the following procedure to submit your identity credentials for corporate verification:",
            steps: [
              {
                number: 1,
                titleFa: "تکمیل مشخصات فردی و سازمانی",
                titleEn: "Complete Personal & Corporate Info",
                descriptionFa:
                  "ورود نام به دو زبان، کد ملی معتبر، شماره پرسنلی، دپارتمان مهندسی و سمت سازمانی.",
                descriptionEn:
                  "Enter bilingual names, national ID number, employee badge code, department, and job title.",
              },
              {
                number: 2,
                titleFa: "بارگذاری تصویر کارت شناسایی و مدارک صلاحیت",
                titleEn: "Upload ID Card & Qualifications",
                descriptionFa:
                  "بارگذاری فایل تصویر واضح از کارت شناسایی ملی و گواهینامه‌های تخصصی مرتبط در بخش بارگذاری اسناد.",
                descriptionEn:
                  "Upload clear scans of your national identification card and technical qualification credentials.",
              },
              {
                number: 3,
                titleFa: "ثبت و ارسال به صف تاییدات",
                titleEn: "Submit to Approval Queue",
                descriptionFa:
                  "فشردن دکمه ثبت درخواست. پرونده شما وارد وضعیت «در انتظار بررسی» شده و به کارتابل اداری ارسال می‌گردد.",
                descriptionEn:
                  "Click submit. Your dossier transitions to 'Pending Verification' and routes into the administrative cartable.",
              },
            ],
          },
          {
            id: "two-tier-approval-pipeline",
            titleFa: "فرآیند تایید دو مرحله‌ای (منابع انسانی و مدیر فنی)",
            titleEn: "Two-Tier Verification Pipeline (HR & Manager)",
            contentFa:
              "به جهت حفظ امنیت اطلاعات پروژه‌های حساس، تایید اکانت‌ها در دو لایه متوالی صورت می‌پذیرد:",
            contentEn:
              "To protect proprietary project data, account onboarding undergoes two sequential approval tiers:",
            steps: [
              {
                number: 1,
                titleFa: "مرحله اول: بررسی منابع انسانی (HR Verification)",
                titleEn: "Tier 1: Human Resources Clearance",
                descriptionFa:
                  "کارشناس اداری منابع انسانی صحت کد ملی، شماره پرسنلی و اطلاعات هویتی را در سیستم تطبیق داده و تایید اداری را صادر می‌کند.",
                descriptionEn:
                  "HR specialists verify national ID authenticity, employee status, and validate employment records.",
              },
              {
                number: 2,
                titleFa: "مرحله دوم: تعیین سطح دسترسی مدیر (Manager Approval)",
                titleEn: "Tier 2: Technical Manager Clearance",
                descriptionFa:
                  "مدیر دپارتمان فنی پروژه‌های مجاز، سطح محرمانگی اسناد VDIS و دسترسی‌های اجرایی کاربر را تایید و ابلاغ می‌نماید.",
                descriptionEn:
                  "The technical director designates authorized project workspaces, confidentiality tiers, and role permissions.",
              },
            ],
          },
        ],
      },
      {
        id: "admin-cartable-rbac-guide",
        slug: "admin-cartable-rbac-guide",
        categoryId: "admin-security",
        titleFa: "پنل مدیریت، کارتابل متقاضیان و کنترل دسترسی RBAC",
        titleEn: "Admin Panel, Verification Cartable & RBAC Matrix",
        subtitleFa: "راهنمای سرپرستان سیستم برای تایید پرسنل، تخصیص نقش‌های سازمانی و سوئیچ پرسپکتیو کاربری",
        subtitleEn: "Guide for administrators to approve applicants, assign RBAC permissions, and switch user perspective personas",
        readingTimeMinutes: 6,
        standardRef: "RBAC-SEC-01",
        lastUpdated: "1405/02/10",
        tags: ["پنل مدیریت", "کارتابل", "RBAC", "نقش‌ها", "Admin", "Security"],
        sections: [
          {
            id: "cartable-verification-flow",
            titleFa: "شیوه بررسی و تایید متقاضیان در کارتابل مدیریت",
            titleEn: "Reviewing Applicants in Admin Cartable",
            contentFa:
              "سرپرستان سیستم در پنل مدیریت (`/dashboard/admin`) کارتابل متمرکزی از کلیه پرسنل متقاضی دسترسی در اختیار دارند:",
            contentEn:
              "System administrators access a centralized cartable of all pending user dossiers inside (`/dashboard/admin`):",
            steps: [
              {
                number: 1,
                titleFa: "مشاهده کارتابل تایید پرسنل",
                titleEn: "Inspect Applicant Cartable",
                descriptionFa:
                  "در زبانه کارتابل، پرونده‌های در انتظار بررسی با برچسب زرد رنگ «Pending» نمایش داده می‌شوند.",
                descriptionEn:
                  "In the verification tab, dossiers pending action are listed with high-visibility 'Pending' badges.",
              },
              {
                number: 2,
                titleFa: "بررسی مدارک و پیش‌نمایش کارت شناسایی",
                titleEn: "Credential & ID Preview",
                descriptionFa:
                  "روی هر متقاضی کلیک کرده تا مشخصات هویتی، کد پرسنلی و تصویر مدارک بارگذاری شده را بازبینی کنید.",
                descriptionEn:
                  "Click any applicant to inspect bilingual names, employee badge number, and preview uploaded credentials.",
              },
              {
                number: 3,
                titleFa: "صدور تاییدیه یا رد درخواست با ثبت توضیحات",
                titleEn: "Approve or Reject with Rationale",
                descriptionFa:
                  "در صورت صحت اطلاعات روی «تایید پرونده» کلیک کنید. در صورت وجود نقص، گزینه «رد درخواست» را به همراه درج دلیل مستند انتخاب نمایید.",
                descriptionEn:
                  "Click 'Approve Dossier' if verified, or select 'Reject' providing required explanatory notes for the applicant.",
              },
            ],
          },
          {
            id: "rbac-role-provisioning",
            titleFa: "تخصیص سطوح دسترسی مبتنی بر نقش (RBAC)",
            titleEn: "Role-Based Access Control (RBAC) Provisioning",
            contentFa:
              "سامانه از یک ساختار استاندارد ۵ لایه‌ای برای کنترل دسترسی‌ها استفاده می‌کند:",
            contentEn:
              "The platform implements a standardized 5-tier access control structure:",
            steps: [
              {
                number: 1,
                titleFa: "مدیر ارشد سامانه (Super Admin)",
                titleEn: "Super Administrator",
                descriptionFa:
                  "دسترسی کامل به تنظیمات زیرساختی، کارتابل تایید، تغییر پرسپکتیو و لاگ‌های امنیتی سیستم.",
                descriptionEn:
                  "Unrestricted access to core infrastructure, verification cartables, persona switching, and audit logs.",
              },
              {
                number: 2,
                titleFa: "مدیر پروژه (Project Manager)",
                titleEn: "Project Manager",
                descriptionFa:
                  "مدیریت پروژه‌های تحت سرپرستی، تخصیص بودجه و WBS، تعیین تسک‌ها و صدور تاییدیه ترنسمیتال‌ها.",
                descriptionEn:
                  "Supervises designated projects, allocates budgets and WBS phases, assigns tasks, and grants transmittal codes.",
              },
              {
                number: 3,
                titleFa: "سرپرست دپارتمان / مهندس طراح (Discipline Lead / Engineer)",
                titleEn: "Discipline Lead / Design Engineer",
                descriptionFa:
                  "تکمیل تسک‌های مهندسی، بارگذاری مستندات محاسباتی VDIS و ثبت چک‌لیست زیرتسک‌ها.",
                descriptionEn:
                  "Completes assigned engineering tasks, uploads VDIS calculation notes, and updates subtask checklists.",
              },
              {
                number: 4,
                titleFa: "بازرس کنترل کیفی (QC Inspector)",
                titleEn: "QC Inspector",
                descriptionFa:
                  "مشاهده و صحه‌گذاری تست‌شیت‌ها، کنترل گزارش‌های NDT و ممیزی مدارک ساخت کارگاهی.",
                descriptionEn:
                  "Reviews inspection test sheets, verifies NDT shop reports, and audits fabrication records.",
              },
            ],
          },
          {
            id: "perspective-switching",
            titleFa: "شیوه استفاده از قابلیت سوئیچ پرسپکتیو کاربری (Persona Switcher)",
            titleEn: "Using Perspective Persona Switching",
            contentFa:
              "به منظور ممیزی و نظارت بر نحوه نمایش اطلاعات برای کاربران با سطوح دسترسی مختلف، مدیران ارشد سیستم می‌توانند بدون نیاز به لاگ‌اوت یا تغییر رمز عبور، محیط برنامه را از نگاه کارشناسان دیگر مشاهده نمایند:",
            contentEn:
              "To audit UI visibility and access controls across different organizational tiers, administrators can evaluate workspaces from various persona perspectives without signing out:",
            callout: {
              type: "tip",
              titleFa: "تسهیل تست و نظارت سازمانی",
              titleEn: "Streamlined Audit & Testing",
              contentFa:
                "سوئیچ پرسپکتیو به مدیر اجازه می‌دهد قبل از واگذاری دسترسی به کاربران واقعی، صحت فیلترها و عدم نمایش اطلاعات محرمانه سایر پروژه‌ها را شخصاً تست و تایید کند.",
              contentEn:
                "Persona switching allows leads to preview UI boundaries and ensure confidential parameters remain isolated before granting live access.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "developer-api",
    titleFa: "نقشه سایت و قراردادهای API",
    titleEn: "Sitemap & Backend API Integration",
    descriptionFa: "راهنمای استفاده از نقشه بصری سامانه و قراردادهای فنی هماهنگی با تیم بک‌اند",
    descriptionEn: "Interactive visual sitemap and technical API contracts for backend engineering team",
    iconName: "Cpu",
    articles: [
      {
        id: "sitemap-api-guide",
        slug: "sitemap-api-guide",
        categoryId: "developer-api",
        titleFa: "نقشه سایت تعاملی و قراردادهای تعامل با بک‌اند",
        titleEn: "Interactive Sitemap & Backend API Contracts",
        subtitleFa: "شیوه استفاده از نقشه بصری سیستم در هر دو تم و راهنمای کامل یکپارچه‌سازی API برای تیم بک‌اند",
        subtitleEn: "How to navigate the visual site map in light/dark themes and integrate backend services using unified API contracts",
        readingTimeMinutes: 7,
        standardRef: "API-REST-SPEC-01",
        lastUpdated: "1405/02/10",
        tags: ["نقشه سایت", "API", "بک‌اند", "cURL", "Sitemap", "Contracts"],
        sections: [
          {
            id: "sitemap-navigation-guide",
            titleFa: "شیوه کار با نقشه تعاملی سایت (Visual Sitemap)",
            titleEn: "Using the Interactive Visual Sitemap",
            contentFa:
              "صفحه نقشه سایت (`/sitemap`) یک نمای درختی جامع و تعاملی از تمام بخش‌های سیستم (صفحات عمومی، احراز هویت، داشبورد، پروژه‌ها، تسک‌ها، دیکشنری، پروفایل و پنل مدیریت) ارائه می‌دهد:",
            contentEn:
              "The sitemap page (`/sitemap`) delivers an interactive visual tree representing every public, authenticated, and dashboard module across the platform:",
            steps: [
              {
                number: 1,
                titleFa: "دسته‌بندی شفاف مسیرها و صفحات",
                titleEn: "Categorized Route Trees",
                descriptionFa:
                  "تمامی مسیرها در ۴ شاخه اصلی (صفحات اصلی و عمومی، احراز هویت، فضاهای کاری داشبورد، مدیریت و سیستم) سازمان‌دهی شده‌اند.",
                descriptionEn:
                  "All URLs are structured under 4 primary domains: Public Entrance, Authentication, Executive Dashboard, and Management/Core.",
              },
              {
                number: 2,
                titleFa: "سازگاری کامل با تم تاریک و روشن",
                titleEn: "Harmonized Dark & Light Themes",
                descriptionFa:
                  "در حالت تم روشن (Light Mode)، نقشه سایت از پس‌زمینه‌ها و حاشیه‌های لایت ملایم استفاده می‌کند و هیچ‌گونه کادر مشکی تیره نامطلوب در آن وجود ندارد.",
                descriptionEn:
                  "In Light Mode, cards and trees apply soft slate and zinc hues without jarring pitch-black containers, ensuring eye comfort.",
              },
              {
                number: 3,
                titleFa: "پرش سریع با یک کلیک به مقصد",
                titleEn: "One-Click Instant Routing",
                descriptionFa:
                  "با کلیک روی دکمه مشاهده در هر کارت، مستقیماً به آن صفحه در زبان جاری هدایت می‌شوید.",
                descriptionEn:
                  "Clicking the navigation badge on any card immediately routes you to that page in your active locale.",
              },
            ],
          },
          {
            id: "api-contracts-architecture",
            titleFa: "ساختار قراردادهای API و هماهنگی فرانت‌اند و بک‌اند",
            titleEn: "Backend API Contracts Architecture",
            contentFa:
              "در زبانه «قراردادهای API» در صفحه نقشه سایت (`/sitemap?tab=api`)، مشخصات فنی تمام اندپوینت‌های سرور مستند شده است تا مهندس بک‌اند دقیقاً بداند چه ساختاری برای درخواست‌ها، پاسخ‌های موفق و کدهای خطا مورد انتظار است:",
            contentEn:
              "Inside the 'API Contracts' tab on the sitemap page (`/sitemap?tab=api`), comprehensive endpoint specifications are documented so backend developers know the exact payload, status codes, and response structures expected:",
          },
          {
            id: "unified-response-envelope",
            titleFa: "پاکت استاندارد پاسخ‌ها (Unified Response Envelope)",
            titleEn: "Unified Response Envelope Format",
            contentFa:
              "کلیه خروجی‌های وب‌سرویس باید داخل ساختار استاندارد زیر ارسال شوند تا فرانت‌اند بتواند وضعیت موفقیت و خطاها را به صورت یکپارچه مدیریت کند:",
            contentEn:
              "All REST endpoints must adhere to this unified JSON response envelope to enable unified frontend state and error handling:",
            codeSnippet: {
              language: "json",
              code: `{\n  "success": true,\n  "data": {\n    "id": "prj-1",\n    "title": "واحد نمک‌زدایی و جداسازی چندفازی عسلویه",\n    "progress": 68,\n    "status": "active"\n  },\n  "error": null,\n  "timestamp": "2026-10-26T18:00:00.000Z",\n  "meta": {\n    "page": 1,\n    "total": 12,\n    "limit": 10\n  }\n}`,
              captionFa: "فرمت استاندارد پاسخ‌های موفق سامانه به همراه متادیتا",
              captionEn: "Standard successful API response envelope with pagination metadata",
            },
            callout: {
              type: "warning",
              titleFa: "فرمت استاندارد خطاها (Error Payload)",
              titleEn: "Standardized Error Payload",
              contentFa:
                "در صورت بروز خطا، فیلد success باید false بوده و آبجکت error حاوی code استاندارد (مانند NOT_FOUND یا UNPROCESSABLE_ENTITY) و message شفاف به کاربر برگردانده شود.",
              contentEn:
                "Upon failure, success must be false, accompanied by an error object specifying the exact error code, localized message, and validation details.",
            },
          },
          {
            id: "curl-testing-workflows",
            titleFa: "دستورات آماده cURL برای صحه‌گذاری و تست اندپوینت‌ها",
            titleEn: "Ready-to-Use cURL Commands for Backend Validation",
            contentFa:
              "مهندسان بک‌اند می‌توانند با اجرای دستورات نمونه cURL در محیط ترمینال، از انطباق خروجی سرویس با نیازمندی‌های فرانت‌اند اطمینان حاصل نمایند:",
            contentEn:
              "Backend engineers can copy and run pre-formatted cURL snippets in their terminal to validate API parity against frontend expectations:",
            codeSnippet: {
              language: "bash",
              code: `# 1. تست لاگین و احراز هویت دمو\ncurl -X POST "http://localhost:4000/api/auth/login" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"demo@esp-app.com","password":"demo"}'\n\n# 2. دریافت فهرست پروژه‌ها همراه با فیلتر\ncurl -X GET "http://localhost:4000/api/projects?status=active" \\\n  -H "Authorization: Bearer <TOKEN>"\n\n# 3. ایجاد تسک جدید با زیرتسک‌ها\ncurl -X POST "http://localhost:4000/api/tasks" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"بررسی نقشه پایپینگ","priority":"urgent","projectId":"prj-1"}'`,
              captionFa: "نمونه دستورات کاربردی cURL برای تست سریع API",
              captionEn: "Actionable cURL command examples for rapid backend endpoint testing",
            },
          },
          {
            id: "api-real-vs-fake-architecture",
            titleFa: "تفکیک API واقعی، معماری دوگانه و شبیه‌سازها در نقشه سایت",
            titleEn: "Real vs. Dual vs. Fake API Architecture in Sitemap",
            contentFa:
              "نقشه سایت در بخش قراردادهای API (/sitemap?tab=api) به صورت بلادرنگ و دائمی، وضعیت دقیق پیاده‌سازی هر اندپوینت را شفاف می‌کند تا هیچ‌گونه ابهامی میان سرویس‌های آنلاین سرور، سرویس‌های دوگانه آفلاین-آنلاین و شبیه‌سازها باقی نماند:",
            contentEn:
              "The Sitemap API Contracts view (/sitemap?tab=api) transparently and continuously distinguishes between live server routes, dual-architecture services, and client-side mocks, ensuring complete architectural clarity for developers and testers:",
            steps: [
              {
                number: 1,
                titleFa: "اندپوینت‌های واقعی سرور (Real Server API)",
                titleEn: "Real Server API Endpoints",
                descriptionFa:
                  "مسیرهای سروری فعال در Next.js App Router (مانند نرخ ارز، قیمت کامودیتی‌ها، داده‌های بورس و دیاگرام‌های صنعتی) که درخواست‌ها را مستقیماً از منابع زنده سرور پاسخ می‌دهند. این مسیرها با نشانگر زمردی Real API در نقشه مشخص شده‌اند.",
                descriptionEn:
                  "Active Route Handlers within Next.js App Router (e.g. currency rates, commodity prices, stock charts, and telemetry diagrams) executing live queries on the server. Tagged with emerald Real API badges.",
                tipFa: "مسیر فایل فیزیکی هندلر در کادر جزئیات هر اندپوینت درج شده است",
                tipEn: "Physical Server Route Handler file path is displayed in each card's architecture box",
              },
              {
                number: 2,
                titleFa: "معماری دوگانه پروژه‌ها و تسک‌ها (Dual Real + Fake)",
                titleEn: "Dual Architecture (Projects & Tasks)",
                descriptionFa:
                  "ماژول‌های پروژه‌ها و تسک‌ها دارای Route Handler کامل سرور در مسیرهای src/app/api/projects و src/app/api/tasks بوده و هم‌زمان در کلاینت مجهز به سرویس‌های FakeProjectsService و FakeTasksService بر پایه حافظه محلی و رویدادهای سیستمی هستند تا سیستم هم در حالت سرور و هم بدون نیاز به سرور به صورت آفلاین بدون قطعی کار کند.",
                descriptionEn:
                  "Core domain modules feature full server Route Handlers while simultaneously maintaining offline-first client fake services with identical TypeScript contracts for maximum resilience.",
                tipFa: "تغییر داده‌ها بین کلاینت و سرور به صورت هماهنگ قابل هدایت است",
                tipEn: "Seamless fallback between client mock and server persistence",
              },
              {
                number: 3,
                titleFa: "شبیه‌ساز کلاینت و قرارداد فنی (Client Mock / Technical Contract)",
                titleEn: "Client Mocks & Future Technical Contracts",
                descriptionFa:
                  "جریان‌های کاری مانند تایید ترنسمیتال اسناد VDIS، ثبت ماتریس ریسک و کارتابل پرسنل فعلاً در کلاینت شبیه‌سازی می‌شوند؛ اما قرارداد فنی، اسکیماهای درخواست/پاسخ و کدهای خطای آن‌ها در نقشه سایت با برچسب کهربایی مستند شده تا تیم بک‌اند بلافاصله آن را پیاده‌سازی کند.",
                descriptionEn:
                  "Workflows like VDIS transmittal code 1/2/3 approval and personnel cartable are simulated on the client, with full schemas ready for backend engineering.",
                tipFa: "فیلتر تفکیک سریع بر اساس وضعیت در بالای نقشه سایت تعبیه شده است",
                tipEn: "Interactive filter chips at the top allow quick isolation of Real, Dual, and Fake endpoints",
              },
            ],
            callout: {
              type: "tip",
              titleFa: "همیشه بروز بودن نقشه سایت (Single Source of Truth)",
              titleEn: "Permanent Synchronization via Dynamic Computation",
              contentFa:
                "آمار و کارت‌های نقشه سایت به صورت دستی وارد نشده‌اند؛ بلکه متد getApiArchitectureStats به طور خودکار تمام اندپوینت‌های ثبت‌شده در رجیستری مرکزی را محاسبه می‌کند. هر زمان اندپوینت جدیدی اضافه یا ویرایش شود، شمارنده‌ها، فیلترها و راهنماها در هر دو زبان بدون نیاز به هیچ دستکاری فوراً بروز می‌شوند.",
              contentEn:
                "Sitemap metrics are dynamically derived from getApiArchitectureStats(SYSTEM_API_CONTRACTS). Any updated or newly registered endpoint immediately updates all dashboard counters, filter views, and schema inspections across both languages.",
            },
          },
        ],
      },
    ],
  },
];
