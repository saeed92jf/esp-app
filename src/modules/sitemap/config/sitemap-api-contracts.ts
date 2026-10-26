// src/modules/sitemap/config/sitemap-api-contracts.ts

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiDomain =
  | "projects"
  | "tasks"
  | "vdis"
  | "risks"
  | "auth"
  | "dashboard"
  | "dictionary"
  | "admin"
  | "telemetry";

export type ApiImplementationType = "real" | "dual" | "fake";

export interface ApiErrorScenario {
  status: number;
  code: string;
  descriptionEn: string;
  descriptionFa: string;
  samplePayload: Record<string, any>;
}

export interface ApiEndpointContract {
  id: string;
  method: ApiMethod;
  path: string;
  domain: ApiDomain;
  stageEn: string;
  stageFa: string;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  requiredRole: "Public" | "User" | "Project Manager" | "System Admin";
  /**
   * Defines whether this endpoint is backed by an active Next.js Server Route Handler ('real'),
   * has both Real and Client Fake implementations ('dual'),
   * or is currently simulated via Client-side Mock/LocalStorage ('fake').
   */
  implementationType: ApiImplementationType;
  implementationDetailsFa: string;
  implementationDetailsEn: string;
  serverHandlerPath?: string;
  clientServicePath?: string;
  headers?: Record<string, string>;
  requestBody?: {
    contentType: string;
    schemaDescriptionEn: string;
    schemaDescriptionFa: string;
    samplePayload: Record<string, any>;
  };
  successResponse: {
    status: number;
    descriptionEn: string;
    descriptionFa: string;
    samplePayload: Record<string, any>;
  };
  errorScenarios: ApiErrorScenario[];
  notesEn?: string;
  notesFa?: string;
}

/**
 * Standard Envelope Contract expected by Frontend Services
 */
export const STANDARD_RESPONSE_ENVELOPE = {
  successSchema: {
    success: true,
    data: "{ ... requested payload or created entity ... }",
    message: "Operation completed successfully",
    meta: {
      timestamp: "2026-10-26T17:15:00Z",
      apiVersion: "v1",
      requestId: "req_8f93a1c2",
    },
  },
  errorSchema: {
    success: false,
    error: {
      code: "VALIDATION_FAILED | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | SERVER_ERROR",
      message: "Human-readable error description for end user",
      details: [
        {
          field: "code",
          issue: "Project code PRJ-ESP-2024 already exists in system.",
        },
      ],
    },
    timestamp: "2026-10-26T17:15:00Z",
  },
};

/**
 * Complete Architectural Overview of Fake vs Real APIs in ESP Platform
 */
export const API_ARCHITECTURE_OVERVIEW = {
  titleFa: "معماری یکپارچه API و الگوی سرویس‌های دوگانه (Dual Service Pattern)",
  titleEn: "Unified API Architecture & Dual Service Pattern",
  principles: [
    {
      id: "real",
      badgeFa: "روت سرور واقعی (Real API)",
      badgeEn: "Active Server Route (Real API)",
      color: "emerald",
      descriptionFa:
        "روت‌هندلرهای استاندارد Next.js App Router در مسیر `src/app/api/...` با اعتبارسنجی کامل داده‌ها، کدهای وضعیت HTTP استاندارد، اتصال به استور پایدار سرور (`projects-tasks-store.ts`) و تغذیه از وب‌سرویس‌های آنلاین.",
      descriptionEn:
        "Production Next.js App Router Route Handlers under `src/app/api/...` featuring strict payload validation, standard HTTP status codes, server persistence, and upstream telemetry.",
    },
    {
      id: "dual",
      badgeFa: "معماری دوگانه (Dual: Real + Fake)",
      badgeEn: "Dual Architecture (Real + Fake)",
      color: "violet",
      descriptionFa:
        "ماژول‌های کلیدی (مانند پروژه‌ها و تسک‌ها) که به دو سرویس متناظر `RealService` (اتصال به روت سرور) و `FakeService` (ذخیره‌سازی LocalStorage با رویدادهای زنده کلاینت) مجهزند و بدون تغییر در کامپوننت‌ها قابل جابجایی هستند.",
      descriptionEn:
        "Core modules (Projects & Tasks) equipped with both `RealService` (server fetcher) and `FakeService` (LocalStorage + window events) implementations obeying identical TypeScript contracts.",
    },
    {
      id: "fake",
      badgeFa: "شبیه‌ساز کلاینت (Mock / Client Fake)",
      badgeEn: "Client Mock / Contract Specification",
      color: "amber",
      descriptionFa:
        "قراردادها و شبیه‌سازهای داخلی فرانت‌اند برای بخش‌هایی مانند تاییدیه ترنسمیتال، بارگذاری VDIS و ورود موقت که منطق آن‌ها تا اتصال کامل به پایگاه‌داده بالادستی در مرورگر اجرا می‌شود.",
      descriptionEn:
        "Client-side simulated workflows and contractual specifications (VDIS sign-offs, OTP simulation) ready for upstream backend plug-and-play.",
    },
  ],
};

/**
 * Complete Registry of System API Contracts
 */
export const SYSTEM_API_CONTRACTS: ApiEndpointContract[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 1. Projects & Engineering Workspaces (Real Route + Fake Service Dual)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "projects-get-all",
    method: "GET",
    path: "/api/projects",
    domain: "projects",
    stageEn: "Listing & Query Telemetry",
    stageFa: "استعلام و دریافت لیست پروژه‌ها",
    titleEn: "Query Engineering Projects",
    titleFa: "دریافت لیست و فیلتر پروژه‌های صنعتی",
    descriptionEn: "Returns full list of engineering projects with query filtering (search, organization, status, client).",
    descriptionFa: "دریافت فهرست پروژه‌ها همراه با فیلتر جستجو، شرکت هلدینگ، وضعیت و نام کارفرما.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/projects/route.ts",
    clientServicePath: "src/modules/projects/services/projects.service.ts",
    implementationDetailsFa: "پیاده‌سازی دوگانه: روت سرور واقعی Next.js در /api/projects متصل به استور سرور + پیاده‌سازی FakeProjectsService با حافظه پایدار LocalStorage.",
    implementationDetailsEn: "Dual implementation: Active Next.js route handler connected to server store + FakeProjectsService backed by localStorage.",
    headers: {
      Accept: "application/json",
    },
    successResponse: {
      status: 200,
      descriptionEn: "Array of project items matching query filters.",
      descriptionFa: "آرایه پروژه‌های مطابق با پارامترهای ارسالی.",
      samplePayload: [
        {
          id: "prj-1",
          title: "طراحی و ساخت مخازن کروی تحت فشار LPG",
          code: "PRJ-ESP-2024-001",
          organization: "یورو اسلات پارس",
          clientName: "پتروشیمی خلیج فارس",
          status: "in-progress",
          progress: 42,
          tasks: [],
        },
      ],
    },
    errorScenarios: [
      {
        status: 500,
        code: "SERVER_ERROR",
        descriptionEn: "Server internal error reading project repository.",
        descriptionFa: "خطای داخلی سرور در بازیابی اطلاعات پروژه‌ها.",
        samplePayload: {
          error: "Internal server error fetching projects",
        },
      },
    ],
  },
  {
    id: "projects-create",
    method: "POST",
    path: "/api/projects",
    domain: "projects",
    stageEn: "Multi-Tier Project Registration",
    stageFa: "ثبت و راه‌اندازی پروژه جدید صنعتی",
    titleEn: "Create New Engineering Project",
    titleFa: "تعریف پروژه جدید صنعتی",
    descriptionEn: "Validates fields, creates project entity with code verification, and notifies platform via window events.",
    descriptionFa: "اعتبارسنجی کامل داده‌ها، ایجاد پروژه جدید در استور سرور و ذخیره‌سازی محلی کلاینت با انتشار رویداد esp_projects_change.",
    requiredRole: "Project Manager",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/projects/route.ts",
    clientServicePath: "src/modules/projects/services/projects.service.ts",
    implementationDetailsFa: "پیاده‌سازی دوگانه: پردازش و اعتبارسنجی در Next.js Route Handler + ذخیره در FakeProjectsService و انتشار CustomEvent سراسری.",
    implementationDetailsEn: "Dual implementation: Validated in Next.js Route Handler (POST 201) + persisted in FakeProjectsService with real-time event dispatch.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Project definition payload with title, code, and organization",
      schemaDescriptionFa: "مشخصات پروژه شامل عنوان، کد پروژه و شرکت تابعه",
      samplePayload: {
        title: "ساخت مبدل‌های حرارتی صفحه‌ای تیتانیومی",
        code: "PRJ-ESP-2024-184",
        organization: "یورو اسلات پارس",
        clientName: "شرکت مهندسی و توسعه گاز",
        budgetAmount: "۴,۸۰۰,۰۰۰,۰۰۰",
        currency: "IRR",
        description: "طراحی، محاسبات تنش مکانیکی و ساخت صفحات بر اساس ASME Sec VIII Div 1",
      },
    },
    successResponse: {
      status: 201,
      descriptionEn: "Project registered successfully and returned with generated ID.",
      descriptionFa: "پروژه با موفقیت ایجاد شد و همراه با شناسه اختصاصی برگردانده شد.",
      samplePayload: {
        id: "proj-1730000000000",
        title: "ساخت مبدل‌های حرارتی صفحه‌ای تیتانیومی",
        code: "PRJ-ESP-2024-184",
        organization: "یورو اسلات پارس",
        status: "planning",
        progress: 0,
        createdAt: "2026-10-26T17:30:00Z",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "VALIDATION_FAILED",
        descriptionEn: "Missing required fields (title, code, or organization).",
        descriptionFa: "فیلدهای الزامی شامل عنوان، کد و شرکت تابعه وارد نشده‌اند.",
        samplePayload: {
          error: "Missing required fields: title, code, organization are mandatory.",
        },
      },
    ],
  },
  {
    id: "projects-get-id",
    method: "GET",
    path: "/api/projects/{id}",
    domain: "projects",
    stageEn: "Workspace Entity Retrieval",
    stageFa: "دریافت اطلاعات و فضای کاری تفصیلی پروژه",
    titleEn: "Get Project Details by ID",
    titleFa: "دریافت مشخصات کامل پروژه بر اساس شناسه",
    descriptionEn: "Returns full project object including WBS phases, assigned members, VDIS docs, and tasks.",
    descriptionFa: "بازیابی شیء کامل پروژه شامل فازهای WBS، اعضای تیم، مدارک مهندسی و تسک‌های مرتبط.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/projects/[id]/route.ts",
    clientServicePath: "src/modules/projects/services/projects.service.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js در /api/projects/[id] + بازیابی سریع در FakeProjectsService.",
    implementationDetailsEn: "Active Next.js Route Handler at /api/projects/[id] + fast client fallback in FakeProjectsService.",
    successResponse: {
      status: 200,
      descriptionEn: "Complete project entity.",
      descriptionFa: "مشخصات کامل پروژه مهندسی.",
      samplePayload: {
        id: "prj-1",
        title: "طراحی و ساخت مخازن کروی تحت فشار LPG",
        code: "PRJ-ESP-2024-001",
        organization: "یورو اسلات پارس",
        tasks: [],
      },
    },
    errorScenarios: [
      {
        status: 404,
        code: "PROJECT_NOT_FOUND",
        descriptionEn: "Project ID does not exist.",
        descriptionFa: "پروژه با شناسه ارسالی یافت نشد.",
        samplePayload: {
          error: "Project not found",
        },
      },
    ],
  },
  {
    id: "projects-update-id",
    method: "PUT",
    path: "/api/projects/{id}",
    domain: "projects",
    stageEn: "Project Modification & Task Sync",
    stageFa: "ویرایش پروژه و همگام‌سازی",
    titleEn: "Update Project Details",
    titleFa: "به‌روزرسانی مشخصات و وضعیت پروژه",
    descriptionEn: "Updates project attributes and persists updates into server repository and local client cache.",
    descriptionFa: "اعمال تغییرات روی پروژه، بازنویسی در استور سرور و به‌روزرسانی کش محلی کلاینت.",
    requiredRole: "Project Manager",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/projects/[id]/route.ts",
    clientServicePath: "src/modules/projects/services/projects.service.ts",
    implementationDetailsFa: "روت سرور PUT /api/projects/[id] + همگام‌سازی بلادرنگ رویداد esp_projects_change.",
    implementationDetailsEn: "Server PUT route handler + broadcast update via esp_projects_change event.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Partial or full project updates",
      schemaDescriptionFa: "مشخصات به‌روزرسانی‌شده پروژه",
      samplePayload: {
        progress: 55,
        status: "in-progress",
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "Project updated successfully.",
      descriptionFa: "پروژه با موفقیت به‌روزرسانی گردید.",
      samplePayload: {
        id: "prj-1",
        title: "طراحی و ساخت مخازن کروی تحت فشار LPG",
        progress: 55,
        status: "in-progress",
      },
    },
    errorScenarios: [
      {
        status: 404,
        code: "PROJECT_NOT_FOUND",
        descriptionEn: "Project ID not found.",
        descriptionFa: "پروژه مورد نظر جهت ویرایش وجود ندارد.",
        samplePayload: { error: "Project not found" },
      },
    ],
  },
  {
    id: "projects-delete-id",
    method: "DELETE",
    path: "/api/projects/{id}",
    domain: "projects",
    stageEn: "Project Decommissioning",
    stageFa: "حذف و بایگانی پروژه",
    titleEn: "Delete Engineering Project",
    titleFa: "حذف پروژه از سامانه",
    descriptionEn: "Deletes project from server store and dispatches removal event to client components.",
    descriptionFa: "حذف پروژه از استور سرور و اعمال در کش کلاینت همراه با اطلاع‌رسانی به هوک‌های سیستم.",
    requiredRole: "System Admin",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/projects/[id]/route.ts",
    clientServicePath: "src/modules/projects/services/projects.service.ts",
    implementationDetailsFa: "حذف استاندارد HTTP 200 با روت سرور Next.js و پاک‌سازی هماهنگ در FakeProjectsService.",
    implementationDetailsEn: "Standard HTTP 200 deletion with Next.js route handler and synced FakeProjectsService cleanup.",
    successResponse: {
      status: 200,
      descriptionEn: "Project deleted successfully.",
      descriptionFa: "پروژه با موفقیت حذف گردید.",
      samplePayload: { success: true },
    },
    errorScenarios: [
      {
        status: 404,
        code: "PROJECT_NOT_FOUND",
        descriptionEn: "Project ID does not exist.",
        descriptionFa: "پروژه مورد نظر جهت حذف یافت نشد.",
        samplePayload: { error: "Project not found" },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Tasks & Workflow Management (Real Route + Fake Service Dual)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "tasks-get-all",
    method: "GET",
    path: "/api/tasks",
    domain: "tasks",
    stageEn: "Task Query & Filter Pipeline",
    stageFa: "استعلام و فیلتر تسک‌های کاری",
    titleEn: "Query Organizational & Personal Tasks",
    titleFa: "دریافت و فیلتر تسک‌های سازمانی و شخصی",
    descriptionEn: "Returns tasks filtered by projectId, status, priority, scope (team/personal), and search query.",
    descriptionFa: "دریافت لیست تسک‌ها با پشتیبانی از فیلتر بر اساس شناسه پروژه مرتبط، وضعیت، اولویت، دامنه و کلمه کلیدی.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/tasks/route.ts",
    clientServicePath: "src/modules/tasks/services/tasks.service.ts",
    implementationDetailsFa: "پیاده‌سازی دوگانه: روت سرور واقعی Next.js در /api/tasks + سرویس کلاینت FakeTasksService با همگام‌سازی بلادرنگ.",
    implementationDetailsEn: "Dual implementation: Active Next.js route handler with query filtering + FakeTasksService client sync.",
    successResponse: {
      status: 200,
      descriptionEn: "Filtered array of task entities.",
      descriptionFa: "فهرست تسک‌های فیلترشده.",
      samplePayload: [
        {
          id: "task-01",
          title: "محاسبات تنش پوسته و نازل‌های فیلتراسیون",
          status: "in_progress",
          priority: "high",
          scope: "team",
          relatedProjectId: "prj-1",
          relatedProjectTitle: "طراحی و ساخت مخازن کروی تحت فشار LPG",
          company: "یورو اسلات پارس",
          assignedToName: "سعید جلیلی",
        },
      ],
    },
    errorScenarios: [
      {
        status: 500,
        code: "SERVER_ERROR",
        descriptionEn: "Error reading task registry.",
        descriptionFa: "خطای سرور در بازخوانی مخزن تسک‌ها.",
        samplePayload: { error: "Internal server error fetching tasks" },
      },
    ],
  },
  {
    id: "tasks-create",
    method: "POST",
    path: "/api/tasks",
    domain: "tasks",
    stageEn: "Task Definition & Cross-Project Synchronization",
    stageFa: "تعریف تسک و اتصال خودکار به پروژه",
    titleEn: "Create Task with Project Linkage",
    titleFa: "ثبت تسک جدید با پیوند به پروژه انتخابی",
    descriptionEn: "Creates a new task and automatically synchronizes it into the target project's internal task list if relatedProjectId is set.",
    descriptionFa: "ثبت تسک جدید و اتصال خودکار آن به ساختار تسک‌های پروژه هدف در صورت مشخص بودن relatedProjectId.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/tasks/route.ts",
    clientServicePath: "src/modules/tasks/services/tasks.service.ts",
    implementationDetailsFa: "روت سرور واقعی POST 201 به همراه هماهنگ‌سازی دوطرفه پروژه-تسک + ثبت در FakeTasksService با رویداد esp_tasks_change.",
    implementationDetailsEn: "Active POST 201 Next.js route with bi-directional project sync + FakeTasksService client storage.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Task payload including relatedProjectId and project title",
      schemaDescriptionFa: "داده‌های تسک شامل عنوان، شناسه پروژه، اولویت و شرکت تابعه",
      samplePayload: {
        title: "بررسی نقشه‌های تفصیلی P&ID فاز ۲",
        category: "P&ID FLOW",
        company: "یورو اسلات پارس",
        priority: "high",
        status: "pending",
        scope: "team",
        relatedProjectId: "prj-1",
        relatedProjectTitle: "طراحی و ساخت مخازن کروی تحت فشار LPG",
        assignedToName: "سعید جلیلی",
      },
    },
    successResponse: {
      status: 201,
      descriptionEn: "Task created and linked to project.",
      descriptionFa: "تسک با موفقیت ایجاد و به پروژه متصل گردید.",
      samplePayload: {
        id: "task-1730000000000",
        title: "بررسی نقشه‌های تفصیلی P&ID فاز ۲",
        status: "pending",
        relatedProjectId: "prj-1",
        createdAt: "2026-10-26T17:30:00Z",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "TITLE_REQUIRED",
        descriptionEn: "Task title cannot be empty.",
        descriptionFa: "عنوان تسک الزامی است.",
        samplePayload: { error: "Task title is required" },
      },
    ],
  },
  {
    id: "tasks-get-id",
    method: "GET",
    path: "/api/tasks/{id}",
    domain: "tasks",
    stageEn: "Task Detailed View",
    stageFa: "دریافت جزئیات تسک",
    titleEn: "Get Task Details by ID",
    titleFa: "دریافت مشخصات کامل تسک بر اساس شناسه",
    descriptionEn: "Returns full task item including subtasks, assignees, comments, and activities.",
    descriptionFa: "مشخصات کامل تسک شامل چک‌لیست زیرتسک‌ها، همکاران، کامنت‌ها و تاریخچه تغییرات.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/tasks/[id]/route.ts",
    clientServicePath: "src/modules/tasks/services/tasks.service.ts",
    implementationDetailsFa: "روت سرور واقعی /api/tasks/[id] + پشتیبانی در سرویس کلاینت.",
    implementationDetailsEn: "Active Next.js route at /api/tasks/[id] + client service support.",
    successResponse: {
      status: 200,
      descriptionEn: "Full task object.",
      descriptionFa: "شیء کامل تسک کاری.",
      samplePayload: {
        id: "task-01",
        title: "محاسبات تنش پوسته",
        status: "in_progress",
        subtasks: [],
      },
    },
    errorScenarios: [
      {
        status: 404,
        code: "TASK_NOT_FOUND",
        descriptionEn: "Task ID not found.",
        descriptionFa: "تسک با شناسه ارسالی یافت نشد.",
        samplePayload: { error: "Task not found" },
      },
    ],
  },
  {
    id: "tasks-update-id",
    method: "PUT",
    path: "/api/tasks/{id}",
    domain: "tasks",
    stageEn: "Task Modification & Status Update",
    stageFa: "به‌روزرسانی مشخصات و وضعیت تسک",
    titleEn: "Update Task Attributes",
    titleFa: "به‌روزرسانی تسک و وضعیت کانبان",
    descriptionEn: "Updates task properties and synchronizes corresponding task in target project.",
    descriptionFa: "اعمال تغییرات روی تسک و به‌روزرسانی متناظر آن در پروژه متصل.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/tasks/[id]/route.ts",
    clientServicePath: "src/modules/tasks/services/tasks.service.ts",
    implementationDetailsFa: "روت سرور PUT /api/tasks/[id] + انتشار رویداد esp_tasks_change برای بازتاب آنی در بردهای کانبان.",
    implementationDetailsEn: "Server PUT route + client-side live reflection via esp_tasks_change event.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Updated task properties",
      schemaDescriptionFa: "فیلدهای ویرایش‌شده تسک",
      samplePayload: {
        status: "completed",
        progressPercent: 100,
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "Task updated successfully.",
      descriptionFa: "تسک با موفقیت به‌روزرسانی شد.",
      samplePayload: {
        id: "task-01",
        status: "completed",
        progressPercent: 100,
      },
    },
    errorScenarios: [
      {
        status: 404,
        code: "TASK_NOT_FOUND",
        descriptionEn: "Task ID does not exist.",
        descriptionFa: "تسک مورد نظر یافت نشد.",
        samplePayload: { error: "Task not found" },
      },
    ],
  },
  {
    id: "tasks-delete-id",
    method: "DELETE",
    path: "/api/tasks/{id}",
    domain: "tasks",
    stageEn: "Task Disposal",
    stageFa: "حذف تسک از سیستم",
    titleEn: "Delete Task",
    titleFa: "حذف تسک",
    descriptionEn: "Deletes task from repository and broadcasts deletion event to client.",
    descriptionFa: "حذف تسک از استور سرور و اعمال حذف در دیتابیس محلی کلاینت.",
    requiredRole: "User",
    implementationType: "dual",
    serverHandlerPath: "src/app/api/tasks/[id]/route.ts",
    clientServicePath: "src/modules/tasks/services/tasks.service.ts",
    implementationDetailsFa: "روت سرور DELETE /api/tasks/[id] + انتشار esp_tasks_change.",
    implementationDetailsEn: "Server DELETE route + client event notification.",
    successResponse: {
      status: 200,
      descriptionEn: "Task deleted successfully.",
      descriptionFa: "تسک با موفقیت حذف گردید.",
      samplePayload: { success: true },
    },
    errorScenarios: [
      {
        status: 404,
        code: "TASK_NOT_FOUND",
        descriptionEn: "Task ID not found.",
        descriptionFa: "تسک مورد نظر جهت حذف وجود ندارد.",
        samplePayload: { error: "Task not found" },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. Live Telemetry & Market Data Feeds (Active Real Next.js Routes)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "telemetry-exchange-rates",
    method: "GET",
    path: "/api/exchange-rates",
    domain: "telemetry",
    stageEn: "Real-Time Currency Telemetry",
    stageFa: "استعلام زنده نرخ‌های ارز و تتر",
    titleEn: "Live Currency Exchange Rates",
    titleFa: "دریافت بلادرنگ نرخ ارز، تتر و سامانه سنا",
    descriptionEn: "Fetches live USDT prices from Tetherland API and calculates official CBI and Sana parity rates with force-dynamic caching.",
    descriptionFa: "دریافت زنده قیمت تتر از سرویس تترلند و محاسبه خودکار برابری نرخ رسمی بانک مرکزی و سامانه سنا بدون کش شدن در سرور.",
    requiredRole: "Public",
    implementationType: "real",
    serverHandlerPath: "src/app/api/exchange-rates/route.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js: اتصال زنده به وب‌سرویس تترلند، تبدیل قیمت به ریال و ارائه خروجی با کش صفر.",
    implementationDetailsEn: "Active Next.js Route Handler: Live connection to Tetherland API, Rial conversion with force-dynamic cache.",
    successResponse: {
      status: 200,
      descriptionEn: "Live currency object in Rial.",
      descriptionFa: "شیء قیمت‌های زنده ارز به ریال.",
      samplePayload: {
        cbi: 420000,
        sana: 598000,
        free: 6850000,
        source: "tetherland",
        updatedAt: "2026-10-26T17:30:00Z",
      },
    },
    errorScenarios: [
      {
        status: 500,
        code: "UPSTREAM_FETCH_FAILED",
        descriptionEn: "Failed to fetch from upstream currency provider.",
        descriptionFa: "خطا در برقراری ارتباط با وب‌سرویس دهنده ارز.",
        samplePayload: { error: "Failed to fetch exchange rates" },
      },
    ],
  },
  {
    id: "telemetry-commodities",
    method: "GET",
    path: "/api/commodities",
    domain: "telemetry",
    stageEn: "Global Commodity Pricing Feed",
    stageFa: "استعلام قیمت جهانی کالاها و فلزات",
    titleEn: "Global Commodity & Metal Prices",
    titleFa: "شاخص‌های جهانی نفت، گاز، طلا و فلزات صنعتی",
    descriptionEn: "Delivers live pricing data for energy and industrial commodities handled by MarketController.",
    descriptionFa: "دریافت نرخ‌های زنده بازار جهانی برای نفت خام، گاز طبیعی، طلا و فلزات صنعتی پایه از طریق کنترلر بازار.",
    requiredRole: "Public",
    implementationType: "real",
    serverHandlerPath: "src/app/api/commodities/route.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js متصل به کنترلر MarketController با سیاست force-no-store.",
    implementationDetailsEn: "Active Next.js Route Handler delegated to MarketController with force-no-store fetch cache.",
    successResponse: {
      status: 200,
      descriptionEn: "Array of commodity price tickers.",
      descriptionFa: "فهرست تیکرهای قیمت کالاها و نوسانات.",
      samplePayload: [
        { symbol: "WTI", price: 71.4, change: 0.85, unit: "USD/bbl" },
        { symbol: "BRENT", price: 75.2, change: -0.32, unit: "USD/bbl" },
      ],
    },
    errorScenarios: [
      {
        status: 500,
        code: "COMMODITY_FETCH_ERROR",
        descriptionEn: "Upstream commodity feed unreachable.",
        descriptionFa: "خطا در دریافت نرخ‌های زنده کالاها.",
        samplePayload: { error: "Failed to fetch commodities" },
      },
    ],
  },
  {
    id: "telemetry-chart",
    method: "GET",
    path: "/api/chart",
    domain: "telemetry",
    stageEn: "Historical 30-Day Financial Charts",
    stageFa: "نمودار سری زمانی ۳۰ روزه شاخص‌های انرژی",
    titleEn: "Financial Energy Charts Data",
    titleFa: "داده‌های نموداری تاریخی ۳۰ روزه انرژی و فلزات",
    descriptionEn: "Fetches 3-month daily candlesticks from Yahoo Finance, forward-fills gaps, and provides 30-day normalized time series.",
    descriptionFa: "دریافت داده‌های روزانه یاهو فایننس برای نفت، طلا و گاز با پر کردن روزهای تعطیل و ارائه سری زمانی پیوسته ۳۰ روزه.",
    requiredRole: "Public",
    implementationType: "real",
    serverHandlerPath: "src/app/api/chart/route.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js: اتصال مستقیم به API یاهو فایننس با User-Agent اختصاصی و اصلاح خودکار شکاف‌های زمانی.",
    implementationDetailsEn: "Active Next.js Route Handler: Yahoo Finance fetcher with normalization and forward-filling algorithms.",
    successResponse: {
      status: 200,
      descriptionEn: "30-day array of time-value points.",
      descriptionFa: "آرایه ۳۰ روزه از نقاط تاریخ و قیمت.",
      samplePayload: [
        { labelKey: "2026-10-01T00:00:00.000Z", value: 72.1 },
        { labelKey: "2026-10-02T00:00:00.000Z", value: 71.8 },
      ],
    },
    errorScenarios: [
      {
        status: 400,
        code: "INVALID_SOURCE",
        descriptionEn: "Requested commodity chart source is unknown.",
        descriptionFa: "شاخص نموداری درخواست‌شده نامعتبر است.",
        samplePayload: { error: "Invalid source" },
      },
    ],
  },
  {
    id: "telemetry-bourse",
    method: "GET",
    path: "/api/bourse",
    domain: "telemetry",
    stageEn: "Tehran Stock Exchange Telemetry",
    stageFa: "پایش نمادهای پالایشی و پتروشیمی بورس تهران",
    titleEn: "TSETMC Bourse Market Feed",
    titleFa: "قیمت سهام پالایشگاه‌ها و پتروشیمی‌های بورس",
    descriptionEn: "Queries live bourse prices from TSETMC with automatic fallback mock data during market close or network latency.",
    descriptionFa: "استعلام زنده سهام پالایشی (شتران، شپنا، شبندر) از TSETMC با مکانیزم فالبک هوشمند در ساعات تعطیلی بازار.",
    requiredRole: "Public",
    implementationType: "real",
    serverHandlerPath: "src/app/api/bourse/route.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js: استعلام با کش ۶۰ ثانیه‌ای سرور و فالبک به داده‌های پالایشی در صورت قطعی وب‌سرویس بورس.",
    implementationDetailsEn: "Active Next.js Route Handler: 60s ISR cache query to TSETMC with petrochemical fallback resilience.",
    successResponse: {
      status: 200,
      descriptionEn: "Array of stock symbols with prices and percentage changes.",
      descriptionFa: "فهرست نمادها، قیمت پایانی و درصد نوسان روزانه.",
      samplePayload: [
        { id: "1", l18: "شتران", l30: "پالايش نفت تهران", price: 3450, change: 120, percentChange: 3.6, trend: "up" },
      ],
    },
    errorScenarios: [],
  },
  {
    id: "diagrams-list",
    method: "GET",
    path: "/api/diagrams",
    domain: "telemetry",
    stageEn: "Local Diagram Template Discovery",
    stageFa: "فهرست‌برداری بازگشتی تمپلیت‌های P&ID و PFD",
    titleEn: "List Engineering Diagram Templates",
    titleFa: "لیست الگوها و نمودارهای P&ID موجود در سرور",
    descriptionEn: "Recursively scans public/diagrams folder for .json diagram files to feed into the esp-flow interactive canvas.",
    descriptionFa: "پویش بازگشتی دایرکتوری public/diagrams و ارائه فهرست فایل‌های json برای لود در بوم تعاملی دیاگرام‌های مهندسی.",
    requiredRole: "User",
    implementationType: "real",
    serverHandlerPath: "src/app/api/diagrams/route.ts",
    implementationDetailsFa: "روت سرور واقعی Next.js: خواندن فایل‌سیستم سرور با ماژول fs نودجی‌اس و مرتب‌سازی حروف‌الفبایی مسیرها.",
    implementationDetailsEn: "Active Next.js Route Handler: Node.js fs module scanning public/diagrams recursively.",
    successResponse: {
      status: 200,
      descriptionEn: "List of relative template paths.",
      descriptionFa: "فهرست مسیرهای نسبی الگوهای نموداری.",
      samplePayload: {
        files: ["pfd/sample-pfd.json", "pid/filtration-nozzle.json"],
      },
    },
    errorScenarios: [
      {
        status: 500,
        code: "FS_READ_ERROR",
        descriptionEn: "Error reading public/diagrams directory.",
        descriptionFa: "خطا در خواندن فایل‌های تمپلیت از دیسک.",
        samplePayload: { files: [], error: "Failed to read public/diagrams" },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. VDIS Documents & Transmittal Workflow (Client Fake / Contract Spec)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "vdis-upload",
    method: "POST",
    path: "/api/projects/{projectId}/vdis-docs",
    domain: "vdis",
    stageEn: "Engineering Document Revision Entry",
    stageFa: "مرحله بارگذاری و ثبت نگارش مدرک مهندسی VDIS",
    titleEn: "Register New VDIS Document Rev",
    titleFa: "بارگذاری و ثبت ویرایش سند VDIS",
    descriptionEn: "Registers a vendor document revision (MDR/VDIS) with document code, rev number, and file metadata.",
    descriptionFa: "ثبت نگارش جدید از اسناد مهندسی همراه با کد مدرک، کلاس، نگارش و متادیتای فایل ضمیمه.",
    requiredRole: "User",
    implementationType: "fake",
    clientServicePath: "src/modules/projects/services/fake-projects.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): ذخیره در پروژه انتخابی روی LocalStorage توسط متد uploadVdisDocument در FakeProjectsService.",
    implementationDetailsEn: "Client Fake (Mock): Stored in selected project via uploadVdisDocument inside FakeProjectsService.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Document details, file URL, revision and category",
      schemaDescriptionFa: "اطلاعات مدرک، لینک فایل، شماره بازنگری و رده مهندسی",
      samplePayload: {
        docNumber: "ESP-TK101-01-PID-002",
        title: "P&ID Process and Instrumentation Diagram",
        phase: "Engineering",
        revision: "Rev 0",
        category: "P&ID",
        fileFormat: "PDF",
        fileSize: "4.8 MB",
        filePathUrl: "/storage/vdis/ESP-TK101-01-PID-002-Rev0.pdf",
      },
    },
    successResponse: {
      status: 201,
      descriptionEn: "Document revision saved and queued for transmittal drafting.",
      descriptionFa: "نگارش سند ثبت گردید و آماده الحاق به ترنسمیتال است.",
      samplePayload: {
        success: true,
        data: {
          id: "doc-981",
          status: "draft",
        },
        message: "سند مهندسی با موفقیت ذخیره گردید.",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "INVALID_DOC_FORMAT",
        descriptionEn: "Document code format does not match VDIS naming conventions.",
        descriptionFa: "کد مدرک با الگوی نام‌گذاری استاندارد VDIS مطابقت ندارد.",
        samplePayload: {
          success: false,
          error: {
            code: "INVALID_DOC_FORMAT",
            message: "کد مدرک نامعتبر است (الگوی صحیح: ESP-XX-XX-XXX-XXX)",
          },
        },
      },
    ],
  },
  {
    id: "transmittal-approve",
    method: "POST",
    path: "/api/transmittals/{id}/approve",
    domain: "vdis",
    stageEn: "Upstream Manager Formal Sign-off Stage",
    stageFa: "مرحله تصویب و امضای رسمی مدیر مهندسی بالادستی",
    titleEn: "Manager Approve & Sign-Off Transmittal",
    titleFa: "تایید نهایی ترنسمیتال توسط مدیر جهت ارسال",
    descriptionEn: "Formal sign-off by Project Manager allowing client dispatch. Changes status to 'approved_sent'.",
    descriptionFa: "تایید و امضای رسمی مدیر پروژه که مجوز ارسال رسمی به کارفرما را صادر و وضعیت را به approved_sent تغییر می‌دهد.",
    requiredRole: "Project Manager",
    implementationType: "fake",
    clientServicePath: "src/modules/projects/services/fake-projects.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): متد managerApproveTransmittal در FakeProjectsService وضعیت را به approved_sent ارتقا داده و تاریخ را ثبت می‌کند.",
    implementationDetailsEn: "Client Fake (Mock): managerApproveTransmittal in FakeProjectsService transitions status to approved_sent.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Manager name and optional sign-off comment",
      schemaDescriptionFa: "نام مدیر تاییدکننده و توضیحات یا کامنت فنی اختیاری",
      samplePayload: {
        managerName: "سعید جلیلی",
        comment: "بررسی شد. مدارک با الزامات فنی قرارداد مطابقت دارد و ارسال بلامانع است.",
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "Transmittal approved and officially queued for SMTP/Client dispatch.",
      descriptionFa: "ترنسمیتال تصویب شد و در صف ارسال رسمی ایمیل کارفرما قرار گرفت.",
      samplePayload: {
        success: true,
        data: {
          id: "tr-01",
          status: "approved_sent",
          approvedBy: "سعید جلیلی",
          transmittedDate: "1403/08/20",
        },
        message: "ترنسمیتال با موفقیت تایید و آماده ارسال گردید.",
      },
    },
    errorScenarios: [
      {
        status: 403,
        code: "MANAGER_ROLE_REQUIRED",
        descriptionEn: "Authenticated user lacks Project Manager authorization.",
        descriptionFa: "کاربر جاری دسترسی مدیر پروژه جهت تایید و تصویب این ترنسمیتال را ندارد.",
        samplePayload: {
          success: false,
          error: {
            code: "MANAGER_ROLE_REQUIRED",
            message: "عملیات تصویب ترنسمیتال منحصراً در اختیارات مدیر پروژه می‌باشد.",
          },
        },
      },
    ],
  },
  {
    id: "transmittal-reject",
    method: "POST",
    path: "/api/transmittals/{id}/reject",
    domain: "vdis",
    stageEn: "Upstream Manager Rejection & Revision Stage",
    stageFa: "مرحله عدم تایید و عودت ترنسمیتال جهت بازنگری",
    titleEn: "Manager Reject & Return Transmittal",
    titleFa: "عودت ترنسمیتال توسط مدیر جهت اصلاح",
    descriptionEn: "Manager returns transmittal to drafting engineer with mandatory revision reason.",
    descriptionFa: "مدیر ترنسمیتال را به کارشناس عودت داده و دلایل رد و اصلاحات لازم را ثبت می‌نماید.",
    requiredRole: "Project Manager",
    implementationType: "fake",
    clientServicePath: "src/modules/projects/services/fake-projects.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): متد managerRejectTransmittal در FakeProjectsService وضعیت را به rejected تغییر داده و کامنت دلایل را ذخیره می‌کند.",
    implementationDetailsEn: "Client Fake (Mock): managerRejectTransmittal in FakeProjectsService transitions status to rejected with comments.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Manager name and mandatory rejection reason",
      schemaDescriptionFa: "نام مدیر و شرح الزامی دلایل عدم تایید",
      samplePayload: {
        managerName: "سعید جلیلی",
        reason: "محاسبات تست هیدرواستاتیک در پیوست ۲ ناقص است. اصلاح و مجدداً ارسال شود.",
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "Transmittal returned to draft state with revision notes recorded.",
      descriptionFa: "ترنسمیتال به وضعیت پیش‌نویس بازگشت و کامنت اصلاحی ثبت شد.",
      samplePayload: {
        success: true,
        data: {
          id: "tr-01",
          status: "rejected",
          rejectionReason: "محاسبات تست هیدرواستاتیک در پیوست ۲ ناقص است...",
        },
        message: "ترنسمیتال با موفقیت جهت اصلاح عودت داده شد.",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "REJECTION_REASON_MANDATORY",
        descriptionEn: "Rejection reason cannot be blank.",
        descriptionFa: "درج دلیل عدم تایید الزامی است.",
        samplePayload: {
          success: false,
          error: {
            code: "REJECTION_REASON_MANDATORY",
            message: "ثبت دلیل و نکات اصلاحی جهت عودت ترنسمیتال الزامی است.",
          },
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. Project Risks Matrix (Client Fake / Contract Spec)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "risks-register",
    method: "POST",
    path: "/api/projects/{projectId}/risks",
    domain: "risks",
    stageEn: "Risk Identification & Mitigation Matrix",
    stageFa: "مرحله شناسایی و ثبت ریسک‌های پروژه",
    titleEn: "Register Engineering Risk Item",
    titleFa: "ثبت ریسک جدید در ماتریس ارزیابی",
    descriptionEn: "Registers technical, material, or schedule risk with score calculation (1-25) and mitigation plan.",
    descriptionFa: "ثبت ریسک‌های متریال خاص، ساخت، ضخامت بالا همراه با محاسبه نمره ریسک و اقدامات پیشگیرانه.",
    requiredRole: "User",
    implementationType: "fake",
    clientServicePath: "src/modules/projects/services/fake-projects.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): متد addRisk در FakeProjectsService نمره ریسک را محاسبه کرده و در شیء پروژه ثبت می‌کند.",
    implementationDetailsEn: "Client Fake (Mock): Handled by addRisk inside FakeProjectsService with risk score calculation.",
    headers: {
      "Content-Type": "application/json",
    },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Category, severity, probability, mitigation plan and owner",
      schemaDescriptionFa: "دسته‌بندی، شدت اثر، احتمال وقوع، اقدام کنترلی و مسئول پایش",
      samplePayload: {
        category: "material",
        title: "تاخیر در تامین ورق‌های تیتانیوم گرید ۲",
        description: "محدودیت تامین‌کننده خارجی و نیاز به بازرسی مبدا TPI",
        severity: "high",
        probability: "likely",
        mitigationPlan: "مذاکره همزمان با وندور جایگزین در حوزه خلیج فارس",
        responsiblePerson: "مهندس تدارکات",
      },
    },
    successResponse: {
      status: 201,
      descriptionEn: "Risk registered with calculated risk score.",
      descriptionFa: "ریسک با نمره محاسبه‌شده ثبت گردید.",
      samplePayload: {
        success: true,
        data: {
          id: "rsk-08",
          riskScore: 16,
          status: "identified",
        },
        message: "ریسک با موفقیت در ماتریس ثبت شد.",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "INVALID_SEVERITY_LEVEL",
        descriptionEn: "Severity level must be low, medium, high, or critical.",
        descriptionFa: "شدت اثر باید یکی از مقادیر کم، متوسط، زیاد یا بحرانی باشد.",
        samplePayload: {
          success: false,
          error: {
            code: "INVALID_SEVERITY_LEVEL",
            message: "شدت اثر ریسک نامعتبر است.",
          },
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. Authentication & Session Handshake (Client Mock / Simulated Handshake)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "auth-send-otp",
    method: "POST",
    path: "/api/auth/send-otp",
    domain: "auth",
    stageEn: "Step 1: Identity Handshake",
    stageFa: "مرحله ۱: ارسال کد تایید احراز هویت",
    titleEn: "Request Verification OTP",
    titleFa: "درخواست کد یکبار مصرف (OTP)",
    descriptionEn: "Dispatches 5-digit verification code to user email or SMS gateway.",
    descriptionFa: "ارسال کد تایید ۵ رقمی به شماره موبایل یا ایمیل کاربر جهت ورود امن.",
    requiredRole: "Public",
    implementationType: "fake",
    clientServicePath: "src/modules/auth/services/auth.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): شبیه‌سازی ارسال پیامک با تولید توکن موقت و شروع تایمر ۱۲۰ ثانیه‌ای.",
    implementationDetailsEn: "Client Fake (Mock): Simulated SMS dispatch with temporary session hash and 120s timer.",
    headers: { "Content-Type": "application/json" },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Phone number or corporate email address",
      schemaDescriptionFa: "شماره موبایل یا آدرس ایمیل پرسنلی کاربر",
      samplePayload: {
        identifier: "09123456789",
        channel: "sms",
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "OTP dispatched successfully, client initiates countdown timer.",
      descriptionFa: "کد تایید ارسال شد و تایمر شمارش معکوس فعال گردید.",
      samplePayload: {
        success: true,
        data: {
          expiresInSeconds: 120,
          hashToken: "otp_token_a9f83c1",
        },
        message: "کد تایید با موفقیت ارسال شد.",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "INVALID_IDENTIFIER",
        descriptionEn: "Malformed phone number or email format.",
        descriptionFa: "فرمت شماره تلفن یا ایمیل وارد شده نامعتبر است.",
        samplePayload: {
          success: false,
          error: {
            code: "INVALID_IDENTIFIER",
            message: "فرمت شماره موبایل نامعتبر است (مثال: 09123456789)",
          },
        },
      },
    ],
  },
  {
    id: "auth-verify-otp",
    method: "POST",
    path: "/api/auth/verify-otp",
    domain: "auth",
    stageEn: "Step 2: Credential Verification & Session Generation",
    stageFa: "مرحله ۲: بررسی کد و صدور نشست کاربری (JWT)",
    titleEn: "Verify OTP & Issue JWT",
    titleFa: "تایید کد OTP و ایجاد سشن کاربری",
    descriptionEn: "Validates code and returns AccessToken, RefreshToken, and user profile with RBAC roles.",
    descriptionFa: "بررسی کد ۵ رقمی و صدور توکن‌های دسترسی همراه با اطلاعات نقش‌های کاربری.",
    requiredRole: "Public",
    implementationType: "fake",
    clientServicePath: "src/modules/auth/services/auth.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): بررسی کد آزمایشی و ذخیره کوکی سشن در مرورگر با ساختار RBAC.",
    implementationDetailsEn: "Client Fake (Mock): Local verification and session cookie persistence with RBAC roles.",
    headers: { "Content-Type": "application/json" },
    requestBody: {
      contentType: "application/json",
      schemaDescriptionEn: "Identifier, 5-digit code, and session hash token",
      schemaDescriptionFa: "شناسه کاربر، کد ۵ رقمی و توکن امنیتی هش مرحله اول",
      samplePayload: {
        identifier: "09123456789",
        code: "48291",
        hashToken: "otp_token_a9f83c1",
      },
    },
    successResponse: {
      status: 200,
      descriptionEn: "Authentication approved. Tokens and profile returned.",
      descriptionFa: "هویت تایید شد. توکن‌های ورود و مشخصات پروفایل برگشت داده شدند.",
      samplePayload: {
        success: true,
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsIn...",
          refreshToken: "d9a8f1b2c3e4...",
          user: {
            id: "usr-01",
            name: "مهندس سعید جلیلی",
            role: "admin",
            organization: "یورو اسلات پارس",
          },
        },
        message: "ورود با موفقیت انجام شد.",
      },
    },
    errorScenarios: [
      {
        status: 400,
        code: "OTP_MISMATCH",
        descriptionEn: "Entered code is incorrect.",
        descriptionFa: "کد وارد شده اشتباه است.",
        samplePayload: {
          success: false,
          error: { code: "OTP_MISMATCH", message: "کد وارد شده صحیح نمی‌باشد." },
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. System Administration & Personnel (Client Mock / Curated Data)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "admin-personnel-query",
    method: "GET",
    path: "/api/admin/personnel",
    domain: "admin",
    stageEn: "Two-Tier Personnel Verification Cartable",
    stageFa: "کارتابل دوسطحی تایید هویت و مدارک پرسنل",
    titleEn: "Query Personnel Verification Cartable",
    titleFa: "دریافت پرونده‌های منتظر تایید پرسنلی",
    descriptionEn: "Returns personnel verification requests requiring two-tier senior manager sign-off.",
    descriptionFa: "بازیابی لیست درخواست‌های تایید مدارک هویتی پرسنل جهت تایید دوسطحی مدیریت ارشد.",
    requiredRole: "System Admin",
    implementationType: "fake",
    clientServicePath: "src/modules/admin/services/admin-personnel.service.ts",
    implementationDetailsFa: "شبیه‌ساز کلاینت (Mock): مدیریت کارتابل تایید دوسطحی با وضعیت‌های pending, approved, rejected در استور محلی.",
    implementationDetailsEn: "Client Fake (Mock): Two-tier personnel review cartable with pending, approved, and rejected states.",
    successResponse: {
      status: 200,
      descriptionEn: "List of personnel verification records.",
      descriptionFa: "فهرست رکوردهای تایید پرسنلی.",
      samplePayload: {
        items: [
          {
            id: "per-01",
            fullNameFa: "مهندس علیرضا رضایی",
            nationalId: "0012345678",
            status: "pending_review",
            stage: "tier_1",
          },
        ],
      },
    },
    errorScenarios: [
      {
        status: 403,
        code: "ADMIN_REQUIRED",
        descriptionEn: "Only system admins can view the verification cartable.",
        descriptionFa: "دسترسی به کارتابل پرسنلی منحصراً ویژه مدیران سیستم است.",
        samplePayload: { error: "Admin role required" },
      },
    ],
  },
];

/**
 * Dynamic calculation helper that guarantees stats are ALWAYS in sync
 * with the SYSTEM_API_CONTRACTS array.
 */
export function getApiArchitectureStats(
  contracts: ApiEndpointContract[] = SYSTEM_API_CONTRACTS
) {
  const total = contracts.length;
  const real = contracts.filter((c) => c.implementationType === "real").length;
  const dual = contracts.filter((c) => c.implementationType === "dual").length;
  const fake = contracts.filter((c) => c.implementationType === "fake").length;

  const byDomain = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.domain] = (acc[c.domain] || 0) + 1;
    return acc;
  }, {});

  const byMethod = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.method] = (acc[c.method] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    real,
    dual,
    fake,
    activeServerEndpoints: real + dual,
    realPercentage: Math.round(((real + dual) / (total || 1)) * 100),
    byDomain,
    byMethod,
  };
}
