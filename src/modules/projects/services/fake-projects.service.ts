// src/modules/projects/services/fake-projects.service.ts
import { ProjectsService } from "./projects.service";
import {
  ProjectItem,
  VdisDocumentItem,
  TransmittalLetter,
  ProjectRiskItem,
  ProjectPhase,
  ProjectTeamMember,
  ProjectTaskItem,
} from "../types/projects.types";

const STORAGE_KEY = "esp_projects_data_v3";

export const DEFAULT_PROJECT_PHASES: ProjectPhase[] = [
  {
    id: "ph-1",
    name: "مهندسی و طراحی تفصیلی (Engineering)",
    description: "محاسبات هیدرولیک، طراحی مکانیک، نقشه‌های P&ID و تایید دیتاشیت‌ها",
    order: 1,
    progressPercent: 90,
    startDate: "1403/05/01",
    endDate: "1403/06/30",
    status: "completed",
    leadName: "سعید جلیلی",
  },
  {
    id: "ph-2",
    name: "خرید و تدارکات متریال (Procurement)",
    description: "سفارش‌گذاری ورق‌های HIC، فلنج‌ها، پیچ و مهره و الکترودهای خاص",
    order: 2,
    progressPercent: 75,
    startDate: "1403/06/15",
    endDate: "1403/08/10",
    status: "in_progress",
    leadName: "مهندس ناصری",
  },
  {
    id: "ph-3",
    name: "ساخت و مونتاژ تجهیز (Fabrication)",
    description: "رولینگ ورق‌ها، جوشکاری طولی و محیطی، مونتاژ عدسی‌ها و نازل‌ها",
    order: 3,
    progressPercent: 45,
    startDate: "1403/07/20",
    endDate: "1403/09/30",
    status: "in_progress",
    leadName: "مهندس خسروی",
  },
  {
    id: "ph-4",
    name: "کنترل کیفیت و آزمون‌های NDT (QC & Testing)",
    description: "رادیوگرافی جوش، تست آلتراسونیک، آزمون هیدرواستاتیک و PMI",
    order: 4,
    progressPercent: 20,
    startDate: "1403/09/15",
    endDate: "1403/10/20",
    status: "pending",
    leadName: "سارا محمدی",
  },
  {
    id: "ph-5",
    name: "رنگ‌آمیزی و حفاظت سطح (Coating)",
    description: "سندبلاست SA 2.5 و اعمال سیستم رنگ اپوکسی سه لایه",
    order: 5,
    progressPercent: 0,
    startDate: "1403/10/20",
    endDate: "1403/11/05",
    status: "pending",
    leadName: "مهندس امیری",
  },
  {
    id: "ph-6",
    name: "بسته‌بندی، ترخیص و حمل (Logistics)",
    description: "بسته‌بندی سدل‌ها، مهاربندی تریلر بوژی و حمل فوق‌سنگین به سایت",
    order: 6,
    progressPercent: 0,
    startDate: "1403/11/05",
    endDate: "1403/11/20",
    status: "pending",
    leadName: "محسن مرادی",
  },
  {
    id: "ph-7",
    name: "نصب و راه‌اندازی (Commissioning)",
    description: "ترازسازی در سایت، آزمون نشتی اتصالات و تحویل موقت به کارفرما",
    order: 7,
    progressPercent: 0,
    startDate: "1403/11/25",
    endDate: "1403/12/15",
    status: "pending",
    leadName: "مهندس علیرضا رضایی",
  },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "prj-tk-101",
    code: "PRJ-ESP-2024-TK101",
    title: "طراحی و ساخت پکیج مخازن تحت فشار آمونیاک واحد پتروشیمی (TK-101)",
    clientName: "شرکت پتروشیمی بوعلی سینا",
    organization: "یورو اسلات پارس",
    quotationNumber: "QT-2024-884-R2",
    contractNumber: "CNT-1403-EURO-091",
    projectType: "internal",
    status: "fabrication",
    progressPercent: 62,
    plannedProgressPercent: 68,
    startDate: "1403/05/01",
    targetEndDate: "1403/12/15",
    budgetAmount: "۴۸,۵۰۰,۰۰۰,۰۰۰",
    currency: "IRR",
    dmsNetworkPath: "\\\\DMS\\EuroslotPars\\Projects\\TK101-Ammonia-Vessel\\",
    description:
      "پروژه جامع طراحی مکانیکی طبق استاندارد ASME Section VIII Div 1، خرید ورق‌های فولادی مقاوم به ترک هیدروژنی SA-516 Gr 70 HIC، ضخامت دیواره ۳۸ میلی‌متر، ساخت دو دستگاه مخزن افقی ذخیره آمونیاک و آزمون هیدرواستاتیک ۲۸ بار.",
    subPackages: [
      {
        id: "sp-1",
        name: "پکیج مخزن اصلی TK-101A (پوسته و عدسی‌ها)",
        code: "PKG-01",
        equipmentType: "Pressure Vessel (ASME Div 1)",
        weightTon: 34.5,
        budgetCurrency: "۲۴ میلیارد ریال",
        leadName: "سعید جلیلی",
        progressPercent: 68,
        modulesCount: 5,
      },
      {
        id: "sp-2",
        name: "پکیج مخزن دوم TK-101B و نازل‌های ورودی/خروجی",
        code: "PKG-02",
        equipmentType: "Pressure Vessel (ASME Div 1)",
        weightTon: 34.5,
        budgetCurrency: "۱۹ میلیارد ریال",
        leadName: "مهندس خسروی",
        progressPercent: 55,
        modulesCount: 4,
      },
      {
        id: "sp-3",
        name: "پکیج استراکچر ساپورت، سدل‌ها و نردبان ایمنی",
        code: "PKG-03",
        equipmentType: "Structural & Ladders",
        weightTon: 8.2,
        budgetCurrency: "۵.۵ میلیارد ریال",
        leadName: "مهندس کاظمی",
        progressPercent: 70,
        modulesCount: 3,
      },
    ],
    phases: DEFAULT_PROJECT_PHASES,
    team: [
      {
        id: "tm-1",
        name: "مهندس علیرضا رضایی",
        role: "مدیر ارشد پروژه (Project Director)",
        department: "مدیریت مهندسی",
        email: "rezaei@petroespadana.com",
        phone: "0912-3456789",
        isManager: true,
        raci: "Accountable",
      },
      {
        id: "tm-2",
        name: "سعید جلیلی",
        role: "سرپرست طراحی مکانیک و فرآیند",
        department: "دپارتمان مهندسی",
        email: "s.jalili@petroespadana.com",
        phone: "0913-1112233",
        isManager: false,
        raci: "Responsible",
      },
      {
        id: "tm-3",
        name: "سارا محمدی",
        role: "سرپرست کنترل کیفیت و بازرسی فنی",
        department: "دپارتمان QC/QA",
        email: "mohammadi@petroespadana.com",
        phone: "0912-8889900",
        isManager: false,
        raci: "Consulted",
      },
      {
        id: "tm-4",
        name: "مهندس خسروی",
        role: "سرپرست کارگاه ساخت و مونتاژ",
        department: "کارخانه و تولید",
        email: "khosravi@petroespadana.com",
        phone: "0913-4445566",
        isManager: false,
        raci: "Responsible",
      },
      {
        id: "tm-5",
        name: "مهندس ناصری",
        role: "مدیر تدارکات و بازرگانی متریال",
        department: "بازرگانی و تامین",
        email: "naseri@petroespadana.com",
        phone: "0912-5556677",
        isManager: false,
        raci: "Consulted",
      },
    ],
    tasks: [
      {
        id: "pt-1",
        title: "بررسی و تایید نقشه‌های شاپ عدسی توریسفریکال مخزن",
        phaseId: "ph-1",
        sprint: "اسپرینت ۱",
        storyPoints: 8,
        status: "done",
        priority: "high",
        assignedToName: "سعید جلیلی",
        assignedToRole: "سرپرست طراحی",
        dueDate: "1403/06/10",
        progressPercent: 100,
        commentsCount: 3,
        attachmentsCount: 2,
      },
      {
        id: "pt-2",
        title: "برش و رولینگ ورق‌های شل اصلی ضخامت ۳۸ میلی‌متر",
        phaseId: "ph-3",
        sprint: "اسپرینت ۲",
        storyPoints: 13,
        status: "in_progress",
        priority: "urgent",
        assignedToName: "مهندس خسروی",
        assignedToRole: "سرپرست ساخت",
        dueDate: "1403/08/20",
        progressPercent: 65,
        commentsCount: 5,
        attachmentsCount: 1,
      },
      {
        id: "pt-3",
        title: "تست PMI و رادیوگرافی جوش طولی شل شماره ۱",
        phaseId: "ph-4",
        sprint: "اسپرینت ۲",
        storyPoints: 5,
        status: "todo",
        priority: "high",
        assignedToName: "سارا محمدی",
        assignedToRole: "کنترل کیفیت",
        dueDate: "1403/08/28",
        progressPercent: 0,
        commentsCount: 1,
        attachmentsCount: 0,
      },
    ],
    vdisDocuments: [
      {
        id: "vdis-1",
        docNumber: "ESP-TK101-01-PID-001",
        title: "P&ID Diagram - Ammonia Feed & Emergency Venting",
        phase: "Engineering",
        revision: "Rev 0",
        category: "P&ID",
        status: "code_1_approved",
        fileFormat: "PDF",
        fileSize: "4.8 MB",
        filePathUrl: "\\\\DMS\\TK101\\PID-001-Rev0.pdf",
        preparedBy: "سعید جلیلی",
        preparedDate: "1403/05/20",
        reviewedBy: "علیرضا رضایی",
        reviewDate: "1403/05/25",
        transmittedDate: "1403/06/01",
        transmittalNumber: "TR-ESP-2024-008",
        clientReturnDate: "1403/06/15",
        clientComments: "مدرک بدون نظر و با کد ۱ مورد تایید قرار گرفت.",
      },
      {
        id: "vdis-2",
        docNumber: "ESP-TK101-02-CALC-002",
        title: "ASME Sec VIII Div 1 Shell & Head Thickness Calculations",
        phase: "Engineering",
        revision: "Rev 1",
        category: "Stress Calc",
        status: "code_2_approved_comm",
        fileFormat: "PDF",
        fileSize: "12.4 MB",
        filePathUrl: "\\\\DMS\\TK101\\Calc-002-Rev1.pdf",
        preparedBy: "سعید جلیلی",
        preparedDate: "1403/06/10",
        reviewedBy: "علیرضا رضایی",
        reviewDate: "1403/06/14",
        transmittedDate: "1403/06/18",
        transmittalNumber: "TR-ESP-2024-012",
        clientReturnDate: "1403/07/02",
        clientComments: "تایید با کد ۲: محاسبات بازشو نازل N3 طبق UG-37 با ضریب خوردگی اصلاح شود.",
      },
      {
        id: "vdis-3",
        docNumber: "ESP-TK101-03-DWG-003",
        title: "General Arrangement & Nozzle Orientation Drawing",
        phase: "Engineering",
        revision: "Rev 2",
        category: "GA Drawing",
        status: "pending_approval",
        fileFormat: "DWG",
        fileSize: "8.6 MB",
        filePathUrl: "\\\\DMS\\TK101\\GA-003-Rev2.dwg",
        preparedBy: "سعید جلیلی",
        preparedDate: "1403/08/02",
        reviewNotes: "در انتظار بررسی و تایید مدیر ارشد پروژه جهت ارسال ترنسمیتال به پتروشیمی بوعلی.",
      },
      {
        id: "vdis-4",
        docNumber: "ESP-TK101-04-WPS-001",
        title: "Welding Procedure Specification (WPS) for SA-516 Gr 70 HIC",
        phase: "Fabrication",
        revision: "Rev 0",
        category: "WPS/PQR",
        status: "approved_by_manager",
        fileFormat: "PDF",
        fileSize: "3.2 MB",
        filePathUrl: "\\\\DMS\\TK101\\WPS-001-Rev0.pdf",
        preparedBy: "سارا محمدی",
        preparedDate: "1403/08/04",
        reviewedBy: "علیرضا رضایی",
        reviewDate: "1403/08/06",
        reviewNotes: "تایید شد؛ آماده ارسال ترنسمیتال رسمی به بازرس شخص ثالث.",
      },
    ],
    transmittals: [
      {
        id: "tr-1",
        transmittalNo: "TR-ESP-2024-019",
        subject: "ارسال مدارک نقشه جانمایی GA و دستورالعمل جوشکاری مخازن TK-101",
        recipientCompany: "پتروشیمی بوعلی سینا - دستگاه نظارت مهندسی",
        recipientEmail: "buali.pmt@bualipc.ir",
        ccEmails: ["rezaei@petroespadana.com", "dms@petroespadana.com"],
        senderName: "سعید جلیلی",
        senderRole: "سرپرست مهندسی فرآیند",
        coverLetterText:
          "احتراماً پیرو قرارداد شماره CNT-1403-PETRO-091، بدینوسیله نگارش دوم نقشه جانمایی عمومی (GA) به همراه دستورالعمل جوشکاری تایید شده (WPS) جهت بررسی و ابلاغ نظر به پیوست ارسال می‌گردد. خواهشمند است مطابق مهلت قراردادی نسبت به بررسی و عودت فرم VDIS اقدام فرمایید.",
        status: "pending_manager",
        documents: [],
        activities: [
          {
            id: "act-tr-1",
            timestamp: "1403/08/05 11:30",
            author: "سعید جلیلی",
            action: "پیش‌نویس ترنسمیتال تنظیم و جهت تصویب به کارتابل مدیر مهندسی ارسال شد.",
          },
        ],
      },
      {
        id: "tr-2",
        transmittalNo: "TR-ESP-2024-012",
        subject: "ارسال دفترچه محاسبات مکانیکی مخزن و ضخامت‌سنجی ASME",
        recipientCompany: "پتروشیمی بوعلی سینا",
        recipientEmail: "buali.pmt@bualipc.ir",
        ccEmails: ["rezaei@petroespadana.com"],
        senderName: "مهندس علیرضا رضایی",
        senderRole: "مدیر مهندسی",
        coverLetterText: "دفترچه محاسبات نهایی طبق اصلاحات جلسه کمیته فنی به پیوست ارسال شد.",
        status: "approved_sent",
        approverManagerName: "مهندس علیرضا رضایی",
        approvalDate: "1403/06/17",
        sentDate: "1403/06/18",
        documents: [],
        activities: [
          {
            id: "act-tr-2",
            timestamp: "1403/06/18 10:00",
            author: "علیرضا رضایی",
            action: "تایید نهایی مدیر صادر شد و ترنسمیتال به ایمیل کارفرما ارسال گردید.",
          },
        ],
      },
    ],
    risks: [
      {
        id: "risk-1",
        category: "material",
        title: "حساسیت آزمون HIC و تاخیر در دریافت گواهی تست آزمایشگاهی ورق SA-516",
        description: "الزام تست شکست ناشی از هیدروژن در محیط گاز ترش نیازمند تایید آزمایشگاه متالورژی مرجع است.",
        severity: "high",
        probability: "likely",
        riskScore: 16,
        mitigationPlan: "رزرو نوبت موازی در دو آزمایشگاه معتمد پژوهشگاه صنعت نفت و اعزام بازرس مقیم QC.",
        responsiblePerson: "سارا محمدی",
        status: "controlled",
      },
      {
        id: "risk-2",
        category: "thickness",
        title: "ضخامت بالای پوسته (۳۸ میلی‌متر) و اعوجاج در عملیات رولینگ سرد",
        description: "ضخامت بالا نیازمند ظرفیت تناژ بالا در رولینگ است و احتمال ایجاد تنش پسماند وجود دارد.",
        severity: "high",
        probability: "possible",
        riskScore: 12,
        mitigationPlan: "انجام عملیات پیش‌گرمایش موضعی و برنامه‌ریزی کوره تنش‌زدایی PWHT مطابق کد UW-40.",
        responsiblePerson: "مهندس خسروی",
        status: "mitigating",
      },
      {
        id: "risk-3",
        category: "special_equipment",
        title: "تامین فلنج‌های کلاس ۶۰۰ سایز ۲۴ اینچ لارج دیامتر با فورج یکپارچه",
        description: "تعداد سازندگان داخلی دارای گواهی فورج یکپارچه برای این سایز محدود است.",
        severity: "critical",
        probability: "possible",
        riskScore: 15,
        mitigationPlan: "عقد قرارداد پیش‌خرید با تامین‌کننده انحصاری اصفهان و پیگیری تحویل حداکثر ظرف ۳۰ روز.",
        responsiblePerson: "مهندس ناصری",
        status: "controlled",
      },
    ],
    strategicGoals: [
      {
        id: "sg-1",
        objectiveTitle: "دستیابی به رتبه ۱ وندورلیست تجهیزات سنگین فرآیندی پتروشیمی",
        corporateCategory: "بومی‌سازی و ارتقای رتبه سازمانی",
        impactLevel: "strategic",
        contributionDescription: "اجرای موفق این مخازن آمونیاک ظرفیت شرکت را به عنوان مرجع ساخت تجهیزات کلاس ۶۰۰ ارتقا می‌دهد.",
      },
      {
        id: "sg-2",
        objectiveTitle: "کاهش ۲۰ درصدی زمان تحویل پروژه‌های تحت فشار با استقرار یکپارچه فرآیند VDIS",
        corporateCategory: "بهینه‌سازی عملیات و مهندسی",
        impactLevel: "high",
        contributionDescription: "کاهش دوره‌های رفت‌وبرگشت مدارک با مهندسی مشاور از طریق سامانه تایید آنلاین ترنسمیتال.",
      },
    ],
    roadmapNodes: [
      {
        id: "node-1",
        title: "جلسه کیک‌آف و ابلاغ قرارداد",
        phaseId: "ph-1",
        date: "1403/05/01",
        status: "done",
        x: 100,
        y: 180,
        dependencies: [],
        assigneeName: "علیرضا رضایی",
        progressPercent: 100,
      },
      {
        id: "node-2",
        title: "تایید P&ID و فریز اطلاعات فرآیندی",
        phaseId: "ph-1",
        date: "1403/06/01",
        status: "done",
        x: 280,
        y: 120,
        dependencies: ["node-1"],
        assigneeName: "سعید جلیلی",
        progressPercent: 100,
      },
      {
        id: "node-3",
        title: "تامین ورق‌های فولادی SA-516 HIC",
        phaseId: "ph-2",
        date: "1403/07/10",
        status: "done",
        x: 460,
        y: 120,
        dependencies: ["node-2"],
        assigneeName: "مهندس ناصری",
        progressPercent: 100,
      },
      {
        id: "node-4",
        title: "رولینگ شل و جوشکاری اتصالات طولی",
        phaseId: "ph-3",
        date: "1403/08/20",
        status: "active",
        x: 640,
        y: 180,
        dependencies: ["node-3"],
        assigneeName: "مهندس خسروی",
        progressPercent: 65,
      },
      {
        id: "node-5",
        title: "مونتاژ عدسی‌ها و کوره تنش‌زدایی PWHT",
        phaseId: "ph-3",
        date: "1403/09/25",
        status: "upcoming",
        x: 820,
        y: 180,
        dependencies: ["node-4"],
        assigneeName: "مهندس خسروی",
        progressPercent: 0,
      },
      {
        id: "node-6",
        title: "تست هیدرواستاتیک در حضور بازرس کارفرما",
        phaseId: "ph-4",
        date: "1403/10/15",
        status: "upcoming",
        x: 1000,
        y: 140,
        dependencies: ["node-5"],
        assigneeName: "سارا محمدی",
        progressPercent: 0,
      },
      {
        id: "node-7",
        title: "سندبلاست و رنگ‌آمیزی اپوکسی",
        phaseId: "ph-5",
        date: "1403/11/01",
        status: "upcoming",
        x: 1180,
        y: 200,
        dependencies: ["node-6"],
        assigneeName: "مهندس امیری",
        progressPercent: 0,
      },
      {
        id: "node-8",
        title: "حمل، تحویل موقت در سایت بوعلی و صدور PAC",
        phaseId: "ph-6",
        date: "1403/12/15",
        status: "upcoming",
        x: 1360,
        y: 180,
        dependencies: ["node-7"],
        assigneeName: "علیرضا رضایی",
        progressPercent: 0,
      },
    ],
  },
  {
    id: "prj-euro-wws",
    code: "PRJ-ESP-2024-EURO-WWS",
    title: "ساخت اسکرین‌های توری وندور راکتور پتروشیمی (Wedge Wire Screen Internals)",
    clientName: "پتروشیمی آریا ساسول / فاز پارس جنوبی",
    organization: "یورو اسلات پارس",
    quotationNumber: "QT-2024-912-EXPORT",
    contractNumber: "CNT-1403-EURO-440",
    projectType: "export",
    status: "detailed_engineering",
    progressPercent: 40,
    plannedProgressPercent: 45,
    startDate: "1403/06/10",
    targetEndDate: "1403/11/30",
    budgetAmount: "۲۲,۰۰۰,۰۰۰,۰۰۰",
    currency: "IRR",
    dmsNetworkPath: "\\\\DMS\\Euroslot\\Projects\\Reactor-Screens-Tabriz\\",
    description:
      "تولید سبدهای اسکرین از جنس اینکونل ۶۲۵ با دقت شیار (Slot Opening) معادل ۰.۲۵ میلی‌متر با جوش مقاومتی پیشرفته طبق استاندارد بین‌المللی تجهیزات فرآیندی.",
    subPackages: [
      {
        id: "sp-21",
        name: "پکیج توری‌های استوانه‌ای مرکزی راکتور",
        code: "EURO-PKG-01",
        equipmentType: "Wedge Wire Center Pipe",
        weightTon: 4.8,
        budgetCurrency: "۱۴ میلیارد ریال",
        leadName: "مهندس کاظمی",
        progressPercent: 45,
        modulesCount: 3,
      },
      {
        id: "sp-22",
        name: "پکیج بسکت‌های خروجی و ریتینر کاتالیست",
        code: "EURO-PKG-02",
        equipmentType: "Catalyst Support Basket",
        weightTon: 3.1,
        budgetCurrency: "۸ میلیارد ریال",
        leadName: "مهندس سهرابی",
        progressPercent: 35,
        modulesCount: 2,
      },
    ],
    phases: DEFAULT_PROJECT_PHASES,
    team: [
      {
        id: "tm-21",
        name: "دکتر کمالی",
        role: "مدیر بازرگانی و فروش خارجی",
        department: "توسعه بین‌الملل",
        email: "kamali@euroslotpars.com",
        isManager: true,
        raci: "Accountable",
      },
      {
        id: "tm-22",
        name: "مهندس کاظمی",
        role: "سرپرست طراحی توری‌های صنعتی",
        department: "طراحی اسکرین",
        email: "kazemi@euroslotpars.com",
        isManager: false,
        raci: "Responsible",
      },
    ],
    tasks: [],
    vdisDocuments: [
      {
        id: "vdis-21",
        docNumber: "EUR-SASOL-WWS-01",
        title: "Manufacturing Quality Plan (MQP) & Slot Tolerance Spec",
        phase: "Engineering",
        revision: "Rev 0",
        category: "Quality Plan",
        status: "code_1_approved",
        fileFormat: "PDF",
        fileSize: "2.1 MB",
        preparedBy: "مهندس کاظمی",
        preparedDate: "1403/06/25",
        transmittedDate: "1403/07/05",
      },
    ],
    transmittals: [],
    risks: [
      {
        id: "risk-21",
        category: "material",
        title: "نوسان قیمت جهانی سیم‌های پروفیلی Inconel 625",
        description: "وابستگی به تامین خارجی متریال مقاوم در برابر خوردگی گوگردی راکتور.",
        severity: "high",
        probability: "likely",
        riskScore: 16,
        mitigationPlan: "خرید نقدی کل کویل‌های وایر در شروع قرارداد و نگهداری در انبار اختصاصی.",
        responsiblePerson: "دکتر کمالی",
        status: "controlled",
      },
    ],
    strategicGoals: [
      {
        id: "sg-21",
        objectiveTitle: "توسعه بازارهای صادراتی کشورهای حوزه خلیج فارس در حوزه قطعات اینترنال",
        corporateCategory: "توسعه صادرات و ارزآوری",
        impactLevel: "strategic",
        contributionDescription: "ورود مستقیم به زنجیره تامین پتروشیمی‌های بزرگ منطقه.",
      },
    ],
    roadmapNodes: [],
  },
  {
    id: "prj-ceram-nf",
    code: "PRJ-ESP-2024-CERAM-NF",
    title: "سامانه پیشرفته تصفیه پساب صنعتی با ماژول‌های نانوسرامیک تیتانیوم",
    clientName: "شرکت ملی صنایع مس ایران (مجتمع مس سرچشمه)",
    organization: "نانو پالایش سرام",
    quotationNumber: "QT-2024-955-RD",
    contractNumber: "CNT-1403-NICICO-018",
    projectType: "rd",
    status: "basic_engineering",
    progressPercent: 28,
    plannedProgressPercent: 30,
    startDate: "1403/07/01",
    targetEndDate: "1404/02/30",
    budgetAmount: "۱۵,۰۰۰,۰۰۰,۰۰۰",
    currency: "IRR",
    dmsNetworkPath: "\\\\DMS\\NanoCeram\\Projects\\Industrial-Wastewater-Pilot\\",
    description:
      "طراحی پایلوت اولترافیلتراسیون سرامیکی چندکاناله جهت بازچرخانی ۹۵ درصدی پساب اسیدی مجتمع مس با ماندگاری حرارتی و اسیدی فوق‌العاده.",
    subPackages: [],
    phases: DEFAULT_PROJECT_PHASES,
    team: [
      {
        id: "tm-31",
        name: "دکتر مسعودی",
        role: "مدیر تحقیق و توسعه و فناوری سرامیک",
        department: "R&D",
        email: "masoudi@nanopalayesh.com",
        isManager: true,
        raci: "Accountable",
      },
      {
        id: "tm-32",
        name: "مهندس فرهمند",
        role: "متخصص فرمولاسیون نانوپوشش",
        department: "تحقیقات مواد",
        email: "farahmand@nanopalayesh.com",
        isManager: false,
        raci: "Responsible",
      },
      {
        id: "tm-guest",
        name: "کاربر مهمان",
        role: "کارشناس ناظر مهمان",
        department: "R&D و ارزیابی",
        email: "guest@demo.com",
        isManager: false,
        raci: "Consulted",
      },
    ],
    tasks: [],
    vdisDocuments: [],
    transmittals: [],
    risks: [
      {
        id: "risk-31",
        category: "fabrication",
        title: "افت مقاومت خمشی ماژول‌ها حین فرآیند پخت با دمای ۱۴۵۰ درجه",
        description: "ایجاد تنش حرارتی در هندسه‌های چندکاناله حین سرد شدن کوره.",
        severity: "critical",
        probability: "possible",
        riskScore: 15,
        mitigationPlan: "بهینه‌سازی رمپ حرارتی کوره با کنترلر PID هوشمند و افزودن ۲ درصد اکسید زیرکونیا.",
        responsiblePerson: "دکتر مسعودی",
        status: "mitigating",
      },
    ],
    strategicGoals: [
      {
        id: "sg-31",
        objectiveTitle: "بومی‌سازی دانش فنی غشاهای سرامیکی تصفیه پساب معدنی",
        corporateCategory: "فناوری‌های نوین و دانش‌بنیان",
        impactLevel: "strategic",
        contributionDescription: "جایگزینی نمونه‌های آلمانی و فرانسوی با هزینه یک‌سوم.",
      },
    ],
    roadmapNodes: [],
  },
];

export class FakeProjectsService implements ProjectsService {
  private projects: ProjectItem[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
          return;
        }
      } catch {}
    }
    this.projects = [...INITIAL_PROJECTS];
    this.persist();
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
        window.dispatchEvent(
          new CustomEvent("esp_projects_change", { detail: this.projects })
        );
      } catch {}
    }
  }

  async getProjects(): Promise<ProjectItem[]> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.projects]), 80);
    });
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.projects.find((p) => p.id === id || p.code === id);
        resolve(found ? { ...found } : null);
      }, 70);
    });
  }

  async createProject(projectData: Omit<ProjectItem, "id">): Promise<ProjectItem> {
    return new Promise((resolve) => {
      const newProj: ProjectItem = {
        ...projectData,
        id: `prj-${Date.now()}`,
        phases: projectData.phases?.length ? projectData.phases : DEFAULT_PROJECT_PHASES,
        vdisDocuments: projectData.vdisDocuments || [],
        transmittals: projectData.transmittals || [],
        risks: projectData.risks || [],
        tasks: projectData.tasks || [],
        strategicGoals: projectData.strategicGoals || [],
        roadmapNodes: projectData.roadmapNodes || [],
      };
      this.projects.unshift(newProj);
      this.persist();
      setTimeout(() => resolve(newProj), 120);
    });
  }

  async updateProject(project: ProjectItem): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const idx = this.projects.findIndex((p) => p.id === project.id);
      if (idx === -1) return reject(new Error("Project not found"));
      this.projects[idx] = { ...project };
      this.persist();
      setTimeout(() => resolve(this.projects[idx]), 100);
    });
  }

  async deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const idx = this.projects.findIndex((p) => p.id === id);
      if (idx === -1) return reject(new Error("Project not found"));
      this.projects.splice(idx, 1);
      this.persist();
      setTimeout(() => resolve(), 100);
    });
  }

  async addPhase(projectId: string, phaseData: Omit<ProjectPhase, "id">): Promise<ProjectPhase> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newPhase: ProjectPhase = {
        ...phaseData,
        id: `ph-${Date.now()}`,
        isCustom: true,
      };
      proj.phases = proj.phases || [];
      proj.phases.push(newPhase);
      this.persist();
      setTimeout(() => resolve(newPhase), 100);
    });
  }

  async updatePhase(projectId: string, phase: ProjectPhase): Promise<ProjectPhase> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const idx = (proj.phases || []).findIndex((p) => p.id === phase.id);
      if (idx === -1) return reject(new Error("Phase not found"));
      proj.phases[idx] = { ...phase };
      this.persist();
      setTimeout(() => resolve(proj.phases[idx]), 100);
    });
  }

  async addTeamMember(projectId: string, member: ProjectTeamMember): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      proj.team = proj.team || [];
      proj.team.push(member);
      this.persist();
      setTimeout(() => resolve({ ...proj }), 100);
    });
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      proj.team = (proj.team || []).filter((m) => m.id !== memberId);
      this.persist();
      setTimeout(() => resolve({ ...proj }), 100);
    });
  }

  async uploadVdisDocument(projectId: string, doc: Omit<VdisDocumentItem, "id">): Promise<VdisDocumentItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newDoc: VdisDocumentItem = {
        ...doc,
        id: `vdis-${Date.now()}`,
      };
      proj.vdisDocuments = proj.vdisDocuments || [];
      proj.vdisDocuments.unshift(newDoc);
      this.persist();
      setTimeout(() => resolve(newDoc), 120);
    });
  }

  async createTransmittal(
    projectId: string,
    transmittal: Omit<TransmittalLetter, "id" | "activities">
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));

      const newTr: TransmittalLetter = {
        ...transmittal,
        id: `tr-${Date.now()}`,
        status: "pending_manager",
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date()),
            author: transmittal.senderName,
            action: "ترنسمیتال جدید تنظیم و جهت بررسی و تایید به کارتابل مدیر بالادستی ارسال شد.",
          },
        ],
      };

      proj.transmittals = proj.transmittals || [];
      proj.transmittals.unshift(newTr);
      this.persist();
      setTimeout(() => resolve(newTr), 150);
    });
  }

  async managerApproveTransmittal(
    projectId: string,
    transmittalId: string,
    managerName: string,
    comment?: string
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const tr = (proj.transmittals || []).find((t) => t.id === transmittalId);
      if (!tr) return reject(new Error("Transmittal not found"));

      tr.status = "approved_sent";
      tr.approverManagerName = managerName;
      tr.approvalDate = new Intl.DateTimeFormat("fa-IR").format(new Date());
      tr.sentDate = tr.approvalDate;

      tr.activities = tr.activities || [];
      tr.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        author: managerName,
        action: "ترنسمیتال توسط مدیر بالادستی تایید و با موفقیت به کارفرما ارسال گردید.",
        comment,
      });

      // Update associated documents status to transmitted
      if (tr.documents && tr.documents.length > 0) {
        tr.documents.forEach((d) => {
          const docInProj = proj.vdisDocuments?.find((vd) => vd.id === d.id);
          if (docInProj) {
            docInProj.status = "transmitted";
            docInProj.transmittedDate = tr.sentDate;
            docInProj.transmittalNumber = tr.transmittalNo;
          }
        });
      }

      this.persist();
      setTimeout(() => resolve(tr), 150);
    });
  }

  async managerRejectTransmittal(
    projectId: string,
    transmittalId: string,
    managerName: string,
    reason: string
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const tr = (proj.transmittals || []).find((t) => t.id === transmittalId);
      if (!tr) return reject(new Error("Transmittal not found"));

      tr.status = "rejected";
      tr.activities = tr.activities || [];
      tr.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        author: managerName,
        action: "ترنسمیتال توسط مدیر رد شد و جهت اصلاح عودت یافت.",
        comment: reason,
      });

      this.persist();
      setTimeout(() => resolve(tr), 150);
    });
  }

  async addRisk(projectId: string, risk: Omit<ProjectRiskItem, "id">): Promise<ProjectRiskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newRisk: ProjectRiskItem = {
        ...risk,
        id: `risk-${Date.now()}`,
      };
      proj.risks = proj.risks || [];
      proj.risks.unshift(newRisk);
      this.persist();
      setTimeout(() => resolve(newRisk), 100);
    });
  }

  async updateRiskStatus(
    projectId: string,
    riskId: string,
    status: ProjectRiskItem['status']
  ): Promise<ProjectRiskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const r = (proj.risks || []).find((x) => x.id === riskId);
      if (!r) return reject(new Error("Risk not found"));
      r.status = status;
      this.persist();
      setTimeout(() => resolve(r), 100);
    });
  }

  async addTask(projectId: string, task: Omit<ProjectTaskItem, "id">): Promise<ProjectTaskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newTask: ProjectTaskItem = {
        ...task,
        id: `pt-${Date.now()}`,
      };
      proj.tasks = proj.tasks || [];
      proj.tasks.unshift(newTask);
      this.persist();
      setTimeout(() => resolve(newTask), 100);
    });
  }

  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: ProjectTaskItem['status']
  ): Promise<ProjectTaskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const t = (proj.tasks || []).find((x) => x.id === taskId);
      if (!t) return reject(new Error("Task not found"));
      t.status = status;
      if (status === "done") t.progressPercent = 100;
      this.persist();
      setTimeout(() => resolve(t), 100);
    });
  }
}

export const fakeProjectsService = new FakeProjectsService();
