// src/modules/tasks/services/fake-tasks.service.ts
import { TasksService } from "./tasks.service";
import {
  TaskItem,
  TaskComment,
  TaskCommentReply,
  TaskAttachment,
  TaskAssignee,
} from "../types/tasks.types";

const STORAGE_KEY = "esp_tasks_data_v8";

const INITIAL_MOCK_TASKS: TaskItem[] = [
  {
    id: "task-mgr-101",
    title: "بازبینی و اعتبارسنجی نقشه‌های P&ID خط تغذیه واحد ۴۰۰",
    description:
      "بررسی هماهنگی خطوط ورودی و خروجی با الزامات فرآیندی پتروشیمی و تایید کلاس کاری شیرآلات ابزار دقیق بر اساس استاندارد شرکت ملی صنایع پتروشیمی.",
    status: "in_progress",
    priority: "high",
    category: "P&ID FLOW",
    company: "یورو اسلات پارس",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-tk-101",
    relatedProjectTitle: "طراحی و ساخت پکیج مخازن تحت فشار آمونیاک (TK-101)",
    tags: ["P&ID", "مهندسی فرآیند", "استاندارد", "یورو اسلات"],
    createdBy: "manager",
    creatorName: "مهندس علیرضا رضایی (مدیر مهندسی)",
    assignedToName: "سعید جلیلی",
    assignedToRole: "سرپرست مهندسی فرآیند",
    assignees: [
      { id: "usr-1", name: "سعید جلیلی", role: "سرپرست مهندسی فرآیند", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-2", name: "مهندس علیرضا رضایی", role: "مدیر فنی و مهندسی", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-3", name: "مهندس کاظمی", role: "طراح ارشد P&ID", company: "یورو اسلات پارس" },
      { id: "usr-4", name: "سارا محمدی", role: "ناظر کنترل کیفیت و اسناد", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 60,
    timelineDate: "18 اسفند",
    milestoneLabel: "تایید نهایی نقشه خط ۴۰۰",
    dueDate: "1403/08/18",
    startDate: "1403/08/01",
    isManagerDefined: true,
    estimatedHours: 24,
    loggedHours: 14,
    subtasks: [
      { id: "sub-1", title: "بررسی قطر اسمی و ضخامت دیواره لوله‌ها", completed: true },
      { id: "sub-2", title: "تطبیق موقعیت سنسورهای دما و فشار با دیتاشیت", completed: true },
      { id: "sub-3", title: "بررسی مسیر تخلیه اضطراری و ونت‌ها", completed: true },
      { id: "sub-4", title: "تطبیق متریال فلنج‌ها با پکینگ ونت", completed: false },
    ],
    comments: [
      {
        id: "comm-1",
        authorName: "مهندس علیرضا رضایی",
        authorRole: "مدیر مهندسی",
        content: "نقشه بازبینی شده مسیر ورودی به پیوست ارسال شد. لطفاً موقعیت فلنج شماره ۳ و تطابق آن با کاتالوگ یورو اسلات بررسی شود.",
        createdAt: "1403/08/03 - 10:15",
        likes: 3,
        attachments: [
          {
            id: "att-comm-101",
            name: "PID-Unit400-Rev04-Marked.dwg",
            size: "3.4 MB",
            type: "dwg",
            isDrawing: true,
            uploadedAt: "1403/08/03",
            uploaderName: "علیرضا رضایی",
          },
          {
            id: "att-comm-102",
            name: "Flange-Specification-Sheet.pdf",
            size: "1.2 MB",
            type: "pdf",
            uploadedAt: "1403/08/03",
            uploaderName: "علیرضا رضایی",
          },
        ],
        replies: [
          {
            id: "rep-1",
            commentId: "comm-1",
            authorName: "سعید جلیلی",
            authorRole: "سرپرست مهندسی فرآیند",
            content: "نقشه ضمیمه به دقت بررسی شد. زاویه نازل شماره ۲ اصلاح و الحاقیه متریال به همراه اسکچ جدید ضمیمه گردید.",
            createdAt: "1403/08/03 - 11:40",
            likes: 2,
            attachments: [
              {
                id: "att-comm-103",
                name: "Nozzle2-Correction-Sketch.pdf",
                size: "950 KB",
                type: "pdf",
                isDrawing: true,
                uploadedAt: "1403/08/03",
                uploaderName: "سعید جلیلی",
              },
            ],
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-1",
        name: "PID-Unit400-Rev03.pdf",
        size: "4.8 MB",
        type: "pdf",
        uploadedAt: "1403/08/01",
        uploaderName: "علیرضا رضایی",
      },
      {
        id: "att-2",
        name: "Euroslot-Screen-Details.dwg",
        size: "5.1 MB",
        type: "dwg",
        isDrawing: true,
        uploadedAt: "1403/08/02",
        uploaderName: "سعید جلیلی",
      },
    ],
    activities: [
      {
        id: "act-1",
        type: "created",
        authorName: "علیرضا رضایی",
        timestamp: "1403/08/01 09:30",
        details: "تسک سازمانی توسط مدیر تعریف شد.",
      },
      {
        id: "act-2",
        type: "status_change",
        authorName: "سعید جلیلی",
        timestamp: "1403/08/02 10:00",
        details: "وضعیت تسک به در حال انجام تغییر یافت.",
      },
    ],
  },
  {
    id: "task-mgr-102",
    title: "محاسبات هیدرولیک و مدلسازی غشای سرامیکی نانو پالایش سرام",
    description:
      "طراحی سیستم اولترافیلتراسیون سرامیکی تیتانیومی جهت تصفیه پساب صنعتی با راندمان ۹۹.۴ درصد و تعیین دبی برگشتی مدار شستشوی معکوس (Backwash).",
    status: "in_progress",
    priority: "urgent",
    category: "NANOFILTRATION",
    company: "نانو پالایش سرام",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-ceram-nf-303",
    relatedProjectTitle: "پایلوت سیستم نانوفیلتراسیون غشایی پساب صنعتی",
    tags: ["نانو فیلتراسیون", "غشا سرامیکی", "محاسبات", "نانو پالایش"],
    createdBy: "manager",
    creatorName: "دکتر مسعودی (مدیر فنی نانو پالایش)",
    assignedToName: "مهندس فرهمند",
    assignedToRole: "متخصص غشاهای پیشرفته",
    assignees: [
      { id: "usr-5", name: "مهندس فرهمند", role: "متخصص نانو غشا", isLead: true, company: "نانو پالایش سرام" },
      { id: "usr-6", name: "دکتر مسعودی", role: "مدیر فنی و تحقیق و توسعه", company: "نانو پالایش سرام" },
      { id: "usr-1", name: "سعید جلیلی", role: "مشاور هیدرولیک و فرآیند", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 50,
    timelineDate: "15 اسفند",
    milestoneLabel: "تحویل پکیج ممبران سرامیکی",
    dueDate: "1403/08/15",
    startDate: "1403/08/04",
    isManagerDefined: true,
    estimatedHours: 32,
    loggedHours: 16,
    subtasks: [
      { id: "sub-10", title: "تعیین شار حجمی و فشار اسمزی اولیه", completed: true },
      { id: "sub-11", title: "شبیه‌سازی افت فشار در ماژول‌های چندکاناله", completed: true },
      { id: "sub-12", title: "طراحی نقشه چیدمان المان‌های سرامیکی در پوسته", completed: false },
      { id: "sub-13", title: "تست آزمایشی مقاومت اسیدی در pH=1", completed: false },
    ],
    comments: [
      {
        id: "comm-10",
        authorName: "دکتر مسعودی",
        authorRole: "مدیر فنی نانو پالایش",
        content: "نقشه کارتریج المان‌های ۱۹ کاناله با دیاگرام جریان پیوست شد. لطفاً محل خروجی پرمیت چک شود.",
        createdAt: "1403/08/04 - 14:20",
        likes: 1,
        attachments: [
          {
            id: "att-comm-104",
            name: "Ceramic-19Ch-Module-Blueprint.dwg",
            size: "4.6 MB",
            type: "dwg",
            isDrawing: true,
            uploadedAt: "1403/08/04",
            uploaderName: "دکتر مسعودی",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-10",
        name: "Ceramic-Membrane-SpecSheet.pdf",
        size: "2.8 MB",
        type: "pdf",
        uploadedAt: "1403/08/04",
        uploaderName: "دکتر مسعودی",
      },
    ],
    activities: [
      {
        id: "act-10",
        type: "created",
        authorName: "دکتر مسعودی",
        timestamp: "1403/08/04 08:30",
        details: "تسک مهندسی نانو پالایش سرام ثبت شد.",
      },
    ],
  },
  {
    id: "task-mgr-103",
    title: "تطبیق و محاسبه مشخصات فنی استرینر مخزن با استاندارد ASME",
    description:
      "محاسبه افت فشار مجاز روی توری استرینر نوع Y با مش ۴۰ در شرایط دبی حداکثری ۲۰۰ مترمکعب بر ساعت برای پروژه یورو اسلات پارس.",
    status: "pending",
    priority: "high",
    category: "ASME DESIGN",
    company: "یورو اسلات پارس",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-tk-101",
    relatedProjectTitle: "طراحی و ساخت پکیج مخازن تحت فشار آمونیاک (TK-101)",
    tags: ["ASME", "استرینر", "تجهیزات ثابت", "یورو اسلات"],
    createdBy: "manager",
    creatorName: "مهندس علیرضا رضایی (مدیر مهندسی)",
    assignedToName: "سعید جلیلی",
    assignedToRole: "کارشناس ارشد مهندسی",
    assignees: [
      { id: "usr-1", name: "سعید جلیلی", role: "کارشناس ارشد مهندسی", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-2", name: "مهندس علیرضا رضایی", role: "مدیر مهندسی", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-7", name: "محمد حسینی", role: "مهندس محاسب ASME", company: "یورو اسلات پارس" },
    ],
    progressPercent: 0,
    timelineDate: "11 اسفند",
    milestoneLabel: "آغاز محاسبات استرینر",
    dueDate: "1403/08/11",
    startDate: "1403/08/06",
    isManagerDefined: true,
    estimatedHours: 16,
    loggedHours: 0,
    subtasks: [
      { id: "sub-20", title: "استخراج ویسکوزیته و چگالی سیال در دمای کاری", completed: false },
      { id: "sub-21", title: "محاسبه ضریب افت فشار در بار کامل", completed: false },
      { id: "sub-22", title: "تنظیم گزارش فنی به همراه منحنی هدلاگ", completed: false },
    ],
    comments: [],
    attachments: [
      {
        id: "att-20",
        name: "Vessel-Inlet-DataSheet.pdf",
        size: "2.1 MB",
        type: "pdf",
        uploadedAt: "1403/08/05",
        uploaderName: "علیرضا رضایی",
      },
    ],
    activities: [
      {
        id: "act-20",
        type: "created",
        authorName: "علیرضا رضایی",
        timestamp: "1403/08/05 08:45",
        details: "تسک سازمانی جدید ثبت شد.",
      },
    ],
  },
  {
    id: "task-usr-201",
    title: "تست هیدرواستاتیک و بازرسی NDT پکیج راکتور نانو پالایش سرام",
    titleEn: "Hydrostatic Testing and NDT Inspection of Nano Palayesh Ceram Reactor Package",
    description: "انجام تست هیدرواستاتیک در فشار ۱.۵ برابر فشار طراحی، بازرسی آلتراسونیک و رادیوگرافی خطوط جوش راکتور نانو سرامیک.",
    status: "completed",
    priority: "urgent",
    category: "QC & INSPECTION",
    company: "نانو پالایش سرام",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-ceram-nf-303",
    relatedProjectTitle: "پایلوت سیستم نانوفیلتراسیون غشایی پساب صنعتی",
    tags: ["QC", "هیدروتست", "ASME UG-99", "نانو پالایش"],
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "سارا محمدی",
    assignedToRole: "سرپرست کنترل کیفیت",
    assignees: [
      { id: "usr-4", name: "سارا محمدی", role: "سرپرست کنترل کیفیت", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-1", name: "سعید جلیلی", role: "ناظر مهندسی فرآیند", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-8", name: "مهندس ناصری", role: "تکنیسین تست NDT Level II", company: "نانو پالایش سرام" },
      { id: "usr-2", name: "مهندس علیرضا رضایی", role: "مدیر تایید نهایی", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 100,
    timelineDate: "4 اسفند",
    milestoneLabel: "تایید نهایی گواهی تست هیدرواستاتیک",
    dueDate: "1403/08/04",
    startDate: "1403/07/20",
    completedAt: "1403/08/04",
    completionExplanation: "تست هیدرواستاتیک با موفقیت کامل و بدون نشتی انجام شد. گزارش رادیوگرافی و تاییدیه بازرس سوم شخص الصاق گردید.",
    isManagerDefined: false,
    estimatedHours: 12,
    loggedHours: 12,
    subtasks: [
      { id: "sub-30", title: "کالیبراسیون گیج‌های فشار با تاییدیه معتبر", completed: true },
      { id: "sub-31", title: "آبگیری مخزن و هواگیری کامل محفظه", completed: true },
      { id: "sub-32", title: "نگهداری فشار به مدت ۴۵ دقیقه طبق ASME UG-99", completed: true },
      { id: "sub-33", title: "امضای گواهینامه بازرسی MTC تایپ 3.1", completed: true },
    ],
    comments: [
      {
        id: "comm-30",
        authorName: "سارا محمدی",
        authorRole: "سرپرست کنترل کیفیت",
        content: "اسکن گواهینامه هیدروتست به همراه نقشه ثبت ضخامت آلتراسونیک پیوست شد.",
        createdAt: "1403/08/04 - 16:15",
        likes: 4,
        attachments: [
          {
            id: "att-comm-105",
            name: "Hydrotest-Cert-TK101.pdf",
            size: "3.1 MB",
            type: "pdf",
            uploadedAt: "1403/08/04",
            uploaderName: "سارا محمدی",
          },
          {
            id: "att-comm-106",
            name: "NDT-Thickness-Grid-Map.dwg",
            size: "2.7 MB",
            type: "dwg",
            isDrawing: true,
            uploadedAt: "1403/08/04",
            uploaderName: "سارا محمدی",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-30",
        name: "Hydrotest-Inspection-Report.pdf",
        size: "3.4 MB",
        type: "pdf",
        uploadedAt: "1403/08/04",
        uploaderName: "سارا محمدی",
      },
    ],
    activities: [
      {
        id: "act-30",
        type: "status_change",
        authorName: "سارا محمدی",
        timestamp: "1403/08/04 16:30",
        details: "تسک با موفقیت تکمیل و بسته شد.",
      },
    ],
  },
  {
    id: "task-usr-202",
    title: "بررسی تداخل مدل سه‌بعدی پایپینگ با سازه فلزی یورو اسلات",
    titleEn: "Review 3D Piping Clashes with Euroslot Structural Frame",
    description: "بررسی مدل PDMS و Navisworks جهت اطمینان از دسترسی اپراتور و عدم برخورد مسیر لوله‌کشی با المان‌های فیلتر اسکرین.",
    status: "review",
    priority: "medium",
    category: "3D MODELING",
    company: "یورو اسلات پارس",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-euro-wws-202",
    relatedProjectTitle: "سبدهای غربال اسلات‌دار (Wedge Wire Screen)",
    tags: ["PDMS", "مدل سه‌بعدی", "کلش‌گیری", "یورو اسلات"],
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "مهندس کاظمی",
    assignedToRole: "کارشناس ارشد پایپینگ",
    assignees: [
      { id: "usr-3", name: "مهندس کاظمی", role: "کارشناس ارشد پایپینگ", isLead: true, company: "یورو اسلات پارس" },
      { id: "usr-9", name: "آرش یوسفی", role: "مدل‌ساز 3D و کلش آنالیزور", company: "یورو اسلات پارس" },
      { id: "usr-1", name: "سعید جلیلی", role: "سرپرست مهندسی", companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 80,
    timelineDate: "21 اسفند",
    milestoneLabel: "بررسی گزارش کلش آنالیز",
    dueDate: "1403/08/21",
    startDate: "1403/08/08",
    isManagerDefined: false,
    estimatedHours: 8,
    loggedHours: 6,
    subtasks: [
      { id: "sub-40", title: "اجرای کلش چکینگ در نویزوورکس", completed: true },
      { id: "sub-41", title: "اصلاح موقعیت براکت سنسور در صورت تداخل", completed: true },
      { id: "sub-42", title: "تایید نهایی لایه‌بندی تجهیزات ثابت", completed: false },
    ],
    comments: [
      {
        id: "comm-40",
        authorName: "مهندس کاظمی",
        authorRole: "کارشناس پایپینگ",
        content: "نقشه بازنگری شده پلنت با علامت‌گذاری محل کلش ضمیمه شد؛ تداخل با براکت ساپورت رفع گردید.",
        createdAt: "1403/08/06 - 15:00",
        likes: 2,
        attachments: [
          {
            id: "att-comm-107",
            name: "Clash-Free-Layout-Rev2.dwg",
            size: "6.2 MB",
            type: "dwg",
            isDrawing: true,
            uploadedAt: "1403/08/06",
            uploaderName: "مهندس کاظمی",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-40",
        name: "Clash-Report-Area3.pdf",
        size: "1.8 MB",
        type: "pdf",
        uploadedAt: "1403/08/06",
        uploaderName: "سعید جلیلی",
      },
    ],
    activities: [
      {
        id: "act-40",
        type: "created",
        authorName: "سعید جلیلی",
        timestamp: "1403/08/06 11:20",
        details: "تسک جهت بازبینی تعریف شد.",
      },
    ],
  },
  {
    id: "task-usr-203",
    title: "تدوین شناسنامه فنی و فرم تحویل اسکرین‌های نانو پالایش سرام به انبار",
    titleEn: "Prepare Technical Datasheet & Warehouse Delivery Form for Ceramic Screens",
    description: "تنظیم فرم‌های استاندارد ورود کالا به همراه شماره هیت، پوشش نانو و بازرسی ابعادی طبق استاندارد کارخانه.",
    status: "pending",
    priority: "low",
    category: "QC & WAREHOUSE",
    company: "نانو پالایش سرام",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-ceram-nf-303",
    relatedProjectTitle: "پایلوت سیستم نانوفیلتراسیون غشایی پساب صنعتی",
    tags: ["انبارداری", "متریال", "نانو پالایش"],
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "سعید جلیلی",
    assignedToRole: "کارشناس ارشد مهندسی",
    assignees: [
      { id: "usr-1", name: "سعید جلیلی", role: "کارشناس ارشد مهندسی", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
      { id: "usr-10", name: "محسن مرادی", role: "مسئول انبار و تدارکات", company: "نانو پالایش سرام" },
    ],
    progressPercent: 0,
    timelineDate: "28 اسفند",
    milestoneLabel: "تحویل اسناد انبارداری نانو سرام",
    dueDate: "1403/08/28",
    startDate: "1403/08/12",
    isManagerDefined: false,
    estimatedHours: 4,
    loggedHours: 0,
    subtasks: [],
    comments: [],
    attachments: [],
    activities: [],
  },
  {
    id: "task-personal-301",
    title: "یادداشت محاسبات سرانگشتی دبی اسلات‌های واحد ۴۰۰",
    titleEn: "Rough Calculation Notes for Unit 400 Slot Flow Capacities",
    description: "بررسی مجدد مقاومت کششی وایرهای وِج وایر و چک کردن افت فشار قبل از جلسه با کارگاه ساخت یورو اسلات پارس.",
    status: "in_progress",
    priority: "high",
    category: "یادداشت محاسباتی",
    company: "یورو اسلات پارس",
    scope: "personal",
    isPersonal: true,
    relatedProjectId: "prj-tk-101",
    relatedProjectTitle: "طراحی و ساخت پکیج مخازن تحت فشار آمونیاک (TK-101)",
    tags: ["محاسبات شخصی", "اسلات", "واحد ۴۰۰"],
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "سعید جلیلی",
    assignedToRole: "سرپرست مهندسی فرآیند",
    assignees: [
      { id: "usr-1", name: "سعید جلیلی", role: "شخصی", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 35,
    dueDate: "1403/08/20",
    startDate: "1403/08/05",
    isManagerDefined: false,
    estimatedHours: 6,
    loggedHours: 2,
    subtasks: [
      { id: "sub-p1", title: "استخراج کاتالوگ وایر شماره ۱۲ و ۲۰", completed: true },
      { id: "sub-p2", title: "محاسبه سرعت خطی جریان در ورودی اسلات", completed: false },
      { id: "sub-p3", title: "یادداشت ابهامات برای جلسه با مهندس رضایی", completed: false },
    ],
    comments: [],
    attachments: [],
    activities: [
      {
        id: "act-p1",
        type: "created",
        authorName: "سعید جلیلی",
        timestamp: "1403/08/05 14:00",
        details: "تسک شخصی متصل به پروژه واحد ۴۰۰ ایجاد شد.",
      },
    ],
  },
  {
    id: "task-personal-302",
    title: "مطالعه استاندارد جدید ISO 10438 برای سیستم‌های روانکاری",
    titleEn: "Study Newly Released ISO 10438 Standard for Lubrication Systems",
    description: "تسک کاملاً مستقل و فردی بدون وابستگی به پروژه خاص، جهت افزایش تسلط فنی و آمادگی برای آزمون دوره‌ای ارزیابی مهندسی.",
    status: "pending",
    priority: "medium",
    category: "توسعه فردی",
    company: "یورو اسلات پارس",
    scope: "personal",
    isPersonal: true,
    tags: ["مطالعه فردی", "استاندارد", "توسعه مهارت"],
    createdBy: "user",
    creatorName: "سعید جلیلی",
    assignedToName: "سعید جلیلی",
    assignedToRole: "کارشناس ارشد مهندسی",
    assignees: [
      { id: "usr-1", name: "سعید جلیلی", role: "شخصی", isLead: true, companies: ["یورو اسلات پارس", "نانو پالایش سرام"] },
    ],
    progressPercent: 0,
    dueDate: "1403/08/25",
    startDate: "1403/08/09",
    isManagerDefined: false,
    estimatedHours: 10,
    loggedHours: 0,
    subtasks: [
      { id: "sub-p4", title: "مرور سرفصل‌های بازنگری شده در استاندارد 2024", completed: false },
      { id: "sub-p5", title: "تنظیم فایل خلاصه نکات کلیدی", completed: false },
    ],
    comments: [],
    attachments: [],
    activities: [
      {
        id: "act-p2",
        type: "created",
        authorName: "سعید جلیلی",
        timestamp: "1403/08/09 09:30",
        details: "تسک شخصی و مستقل ثبت شد.",
      },
    ],
  },
  {
    id: "task-guest-self-1",
    title: "بررسی و تطبیق مشخصات ماژول فیلتراسیون سرامیکی",
    titleEn: "Review Specification of Ceramic Filtration Module",
    description: "بررسی اولیه مدار هیدرولیک و تطابق افت فشار با معیارهای طراحی پایلوت مس.",
    status: "in_progress",
    priority: "high",
    category: "R&D TESTING",
    company: "نانو پالایش سرام",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-ceram-nf-303",
    relatedProjectTitle: "پایلوت سیستم نانوفیلتراسیون غشایی پساب صنعتی",
    tags: ["R&D", "ماژول سرامیکی", "نانو پالایش"],
    createdBy: "user",
    creatorName: "کاربر مهمان (Gust)",
    assignedToName: "کاربر مهمان (Gust)",
    assignedToRole: "کارشناس ناظر مهمان",
    assignees: [
      { id: "u-guest", name: "کاربر مهمان (Gust)", role: "کارشناس ناظر مهمان", company: "نانو پالایش سرام", isLead: true },
    ],
    progressPercent: 40,
    timelineDate: "22 اسفند",
    milestoneLabel: "تطبیق هیدرولیک ماژول فیلتر",
    dueDate: "1403/08/22",
    startDate: "1403/08/07",
    isManagerDefined: false,
    estimatedHours: 8,
    loggedHours: 3,
    subtasks: [
      { id: "sub-g1", title: "بررسی دیتاشیت المان‌های نانوسرامیک", completed: true },
      { id: "sub-g2", title: "ثبت گزارش اولیه بررسی آزمایشگاهی", completed: false },
    ],
    comments: [],
    attachments: [],
    activities: [
      {
        id: "act-g1",
        type: "created",
        authorName: "کاربر مهمان (Gust)",
        timestamp: "1403/08/07 10:15",
        details: "تسک فردی توسط کاربر مهمان ثبت شد.",
      },
    ],
  },
  {
    id: "task-guest-mgr-2",
    title: "تکمیل و بازخورد چک‌لیست بازرسی عملکرد پایلوت نانوسرامیک",
    titleEn: "Complete and Submit Pilot Performance Checklist",
    description: "چک‌لیست ابلاغی مدیر مهندسی جهت بازرسی نهایی شرایط پایلوت و تست‌های عدم نشت.",
    status: "pending",
    priority: "urgent",
    category: "INSPECTION",
    company: "نانو پالایش سرام",
    scope: "team",
    isPersonal: false,
    relatedProjectId: "prj-ceram-nf-303",
    relatedProjectTitle: "پایلوت سیستم نانوفیلتراسیون غشایی پساب صنعتی",
    tags: ["بازرسی", "چک‌لیست", "نانو پالایش"],
    createdBy: "manager",
    creatorName: "دکتر مسعودی (مدیر فنی نانو پالایش)",
    assignedToName: "کاربر مهمان (Gust)",
    assignedToRole: "کارشناس ناظر مهمان",
    assignees: [
      { id: "u-guest", name: "کاربر مهمان (Gust)", role: "کارشناس ناظر مهمان", company: "نانو پالایش سرام", isLead: true },
    ],
    progressPercent: 0,
    timelineDate: "19 اسفند",
    milestoneLabel: "تکمیل چک‌لیست بازرسی پایلوت",
    dueDate: "1403/08/19",
    startDate: "1403/08/06",
    isManagerDefined: true,
    estimatedHours: 10,
    loggedHours: 0,
    subtasks: [
      { id: "sub-gm1", title: "بازبینی گیج‌های فشار ورودی و خروجی", completed: false },
      { id: "sub-gm2", title: "ثبت قرائت دبی پرمیت در ساعت کاری", completed: false },
    ],
    comments: [],
    attachments: [],
    activities: [
      {
        id: "act-gm1",
        type: "created",
        authorName: "دکتر مسعودی",
        timestamp: "1403/08/06 14:00",
        details: "تسک ابلاغی مدیر برای کاربر مهمان صادر شد.",
      },
    ],
  },
];

export class FakeTasksService implements TasksService {
  private tasks: TaskItem[] = [];

  constructor() {
    this.initTasks();
  }

  private initTasks() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.tasks = JSON.parse(stored);
          return;
        }
      } catch {}
    }
    this.tasks = [...INITIAL_MOCK_TASKS];
    this.persist();
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      } catch {}
    }
  }

  async getTasks(): Promise<TaskItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.tasks]), 120);
    });
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.tasks.find((t) => t.id === id);
        resolve(found ? { ...found } : null);
      }, 80);
    });
  }

  async createTask(
    taskData: Omit<TaskItem, "id" | "comments" | "attachments" | "activities">
  ): Promise<TaskItem> {
    return new Promise((resolve) => {
      const newTask: TaskItem = {
        ...taskData,
        id: `task-${Date.now()}`,
        comments: [],
        attachments: [],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "created",
            authorName: taskData.creatorName || "کاربر",
            timestamp: new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date()),
            details: taskData.isManagerDefined
              ? "تسک سازمانی توسط مدیر تعریف شد."
              : "تسک جدید ثبت شد.",
          },
        ],
      };

      this.tasks.unshift(newTask);
      this.persist();
      setTimeout(() => resolve(newTask), 150);
    });
  }

  async updateTask(task: TaskItem): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index === -1) {
        return reject(new Error("Task not found"));
      }

      this.tasks[index] = { ...task };
      this.persist();
      setTimeout(() => resolve(this.tasks[index]), 150);
    });
  }

  async deleteTask(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index === -1) {
        return reject(new Error("Task not found"));
      }

      if (this.tasks[index].isManagerDefined) {
        return reject(new Error("تسک‌های ابلاغی مدیر قابل حذف نیستند."));
      }

      this.tasks.splice(index, 1);
      this.persist();
      setTimeout(() => resolve(), 150);
    });
  }

  async addComment(
    taskId: string,
    commentData: Omit<TaskComment, "id" | "createdAt" | "replies">
  ): Promise<TaskComment> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const newComment: TaskComment = {
        ...commentData,
        id: `comm-${Date.now()}`,
        createdAt: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        likes: 0,
        replies: [],
      };

      task.comments = task.comments || [];
      task.comments.push(newComment);

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "comment_added",
        authorName: commentData.authorName,
        timestamp: newComment.createdAt,
        details: commentData.attachments?.length
          ? `نظر جدید به همراه الحاقیه نقشه/فایل ثبت شد.`
          : `نظر جدید ثبت شد: "${commentData.content.slice(0, 35)}..."`,
      });

      this.persist();
      setTimeout(() => resolve(newComment), 150);
    });
  }

  async addReply(
    taskId: string,
    commentId: string,
    replyData: Omit<TaskCommentReply, "id" | "createdAt">
  ): Promise<TaskCommentReply> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const comment = task.comments.find((c) => c.id === commentId);
      if (!comment) return reject(new Error("Comment not found"));

      const newReply: TaskCommentReply = {
        ...replyData,
        id: `rep-${Date.now()}`,
        createdAt: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        likes: 0,
      };

      comment.replies = comment.replies || [];
      comment.replies.push(newReply);

      this.persist();
      setTimeout(() => resolve(newReply), 150);
    });
  }

  async uploadAttachment(
    taskId: string,
    file: {
      name: string;
      size: string;
      type: string;
      url?: string;
      uploaderName?: string;
      isDrawing?: boolean;
    }
  ): Promise<TaskAttachment> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        isDrawing: file.isDrawing,
        uploaderName: file.uploaderName || "سعید جلیلی",
        uploadedAt: new Intl.DateTimeFormat("fa-IR").format(new Date()),
      };

      task.attachments = task.attachments || [];
      task.attachments.unshift(newAttachment);

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "attachment_added",
        authorName: newAttachment.uploaderName || "کاربر",
        timestamp: newAttachment.uploadedAt,
        details: `پیوست ${newAttachment.name} بارگذاری شد.`,
      });

      this.persist();
      setTimeout(() => resolve(newAttachment), 150);
    });
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.attachments = (task.attachments || []).filter((a) => a.id !== attachmentId);
      this.persist();
      setTimeout(() => resolve(), 150);
    });
  }

  async toggleSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const sub = task.subtasks.find((s) => s.id === subtaskId);
      if (sub) {
        sub.completed = completed;
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async assignCollaborator(taskId: string, collaborator: TaskAssignee): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.assignees = task.assignees || [];
      if (!task.assignees.some((a) => a.id === collaborator.id || a.name === collaborator.name)) {
        task.assignees.push(collaborator);
        task.activities = task.activities || [];
        task.activities.unshift({
          id: `act-${Date.now()}`,
          type: "collaborator_added",
          authorName: "مدیر سیستم",
          timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
          details: `همکار جدید (${collaborator.name} - ${collaborator.role}) به تسک اضافه شد.`,
        });
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async removeCollaborator(taskId: string, collaboratorId: string): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      const removed = task.assignees?.find((a) => a.id === collaboratorId);
      task.assignees = (task.assignees || []).filter((a) => a.id !== collaboratorId);

      if (removed) {
        task.activities = task.activities || [];
        task.activities.unshift({
          id: `act-${Date.now()}`,
          type: "collaborator_removed",
          authorName: "مدیر سیستم",
          timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
          details: `همکار (${removed.name}) از تسک برداشته شد.`,
        });
      }

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }

  async updateProgress(taskId: string, progressPercent: number): Promise<TaskItem> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return reject(new Error("Task not found"));

      task.progressPercent = Math.max(0, Math.min(100, progressPercent));
      if (task.progressPercent === 100 && task.status !== "completed") {
        task.status = "completed";
      }

      task.activities = task.activities || [];
      task.activities.unshift({
        id: `act-${Date.now()}`,
        type: "progress_updated",
        authorName: "مدیر",
        timestamp: new Intl.DateTimeFormat("fa-IR").format(new Date()),
        details: `درصد پیشرفت تسک به ${task.progressPercent}٪ به‌روزرسانی شد.`,
      });

      this.persist();
      setTimeout(() => resolve({ ...task }), 150);
    });
  }
}

export const fakeTasksService = new FakeTasksService();
