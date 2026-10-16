export interface PersianDictionaryTerm {
  id: string;
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience";
  categoryName: string;
  term: string;
  secondaryTerm?: string;
  abbreviation?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

export const DICTIONARY_CATEGORIES_FA = [
  { id: "all", label: "همه واژگان", count: 34 },
  { id: "materials", label: "متریال و آلیاژها", count: 8 },
  { id: "equipment", label: "تجهیزات و لوله‌کشی", count: 8 },
  { id: "jargon", label: "اصطلاحات کارگاهی و سایت", count: 8 },
  { id: "inspection", label: "تست و بازرسی فنی", count: 6 },
  { id: "experience", label: "تجارب و فوت‌وفن مهندسی", count: 4 },
] as const;

export const ENGINEERING_TERMS_FA: PersianDictionaryTerm[] = [
  // ─── 1. متریال و آلیاژها ───────────────────────────────────────────────
  {
    id: "sa516-gr70",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "ورق فولاد کربنی مخازن تحت فشار",
    secondaryTerm: "ASME SA-516 Gr. 70",
    abbreviation: "SA-516-70",
    shortDesc: "محبوب‌ترین ورق فولاد کربنی آرام‌شده (Killed Steel) جهت ساخت مخازن تحت فشار با چقرمگی عالی در دماهای متوسط و پایین.",
    keyTip: "در سرویس‌های گاز ترش حتماً تست مقاومت به هیدروژن (HIC Tested) طبق ضمیمه S83 سفارش داده شود تا از لایه‌ای شدن ورق جلوگیری شود.",
    standards: ["ASME BPVC Sec II Part A", "ASTM A516"],
    tags: ["steel", "carbon steel", "plate", "pressure vessel", "killed steel", "A516", "مخزن", "ورق", "کربن استیل"]
  },
  {
    id: "duplex-2205",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "فولاد زنگ‌نزن دوپلکس ۲۲۰۵",
    secondaryTerm: "Duplex 2205 (UNS S31803 / S32205)",
    abbreviation: "DSS 2205",
    shortDesc: "فولاد ضدزنگ با ریزساختار دوگانه (۵۰٪ آستنیت و ۵۰٪ فریت) دارای استحکام تسلیم دوبرابر استیل ۳۱۶ و مقاومت فوق‌العاده در برابر ترک‌خوردگی ناشی از کلرید (SCC).",
    keyTip: "دمای بین‌پاس جوشکاری نباید از ۱۵۰ درجه سانتی‌گراد فراتر رود؛ در غیر این صورت فاز شکننده سیگما (Sigma Phase) شکل می‌گیرد.",
    standards: ["ASTM A240", "NACE MR0175", "ASME B31.3"],
    tags: ["duplex", "stainless steel", "corrosion", "chloride", "2205", "استیل", "دوپلکس"]
  },
  {
    id: "inconel-625",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "سوپرآلیاژ اینکونل ۶۲۵",
    secondaryTerm: "Inconel 625 (UNS N06625)",
    abbreviation: "Alloy 625",
    shortDesc: "سوپرآلیاژ پایه نیکل-کروم-مولیبدن با مقاومت استثنایی در برابر اسیدهای اکسیدکننده، خوردگی حفره‌ای و اکسیداسیون در دماهای بالا تا ۹۸۰ درجه سانتی‌گراد.",
    keyTip: "در فلنج‌ها و خطوط گاز ترش با غلظت بالای H2S، به جای ساخت کل قطعه از اینکونل از جوش روکشی (Weld Overlay Cladding) استفاده می‌شود تا هزینه به شدت کاهش یابد.",
    standards: ["ASTM B443", "ASME Sec VIII Div 1", "API 6A"],
    tags: ["nickel", "superalloy", "inconel", "sour gas", "cladding", "اینکونل", "سوپرآلیاژ"]
  },
  {
    id: "nace-mr0175",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "استاندارد متریال محیط ترش NACE MR0175",
    secondaryTerm: "NACE MR0175 / ISO 15156",
    abbreviation: "NACE",
    shortDesc: "دستورالعمل جامع بین‌المللی انتخاب و ارزیابی متریال‌های فلزی در صنایع بالادستی نفت و گاز برای پیشگیری از ترک‌خوردگی ناشی از گاز سولفید هیدروژن (H2S).",
    keyTip: "سختی فولاد کربنی و خط جوش در این استاندارد نباید از ۲۲ راکول سی (22 HRC یا 248 HV) تجاوز کند تا ریسک شکست ترد مهار شود.",
    standards: ["NACE MR0175", "ISO 15156", "EEMUA 158"],
    tags: ["nace", "sour", "h2s", "hardness", "cracking", "گاز ترش", "سختی"]
  },
  {
    id: "hic-cracking",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "ترک‌خوردگی هیدروژنی HIC",
    secondaryTerm: "Hydrogen-Induced Cracking (HIC)",
    abbreviation: "HIC",
    shortDesc: "تشکیل تاول و ترک‌های پلکانی در لایه‌های میانی فولاد کربنی بر اثر نفوذ اتم‌های هیدروژن ناشی از خوردگی در محیط مرطوب سولفید هیدروژن.",
    keyTip: "افزودن کلسیم در زمان فولادسازی پاتیلی (Calcium Treatment) شکل ناخالصی‌های منگنز سولفید را کروی کرده و حساسیت ورق به ترک هیدروژنی را از بین می‌برد.",
    standards: ["NACE TM0284", "API Spec 5L"],
    tags: ["hic", "hydrogen", "sour service", "cracking", "هیدروژن", "ترک"]
  },
  {
    id: "corrosion-allowance",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "ضخامت مجاز خوردگی (CA)",
    secondaryTerm: "Corrosion Allowance (CA)",
    abbreviation: "CA",
    shortDesc: "ضخامت اضافه‌ای که بر پایه طول عمر پیش‌بینی‌شده و نرخ خوردگی سالانه، به ضخامت اسمی بدنه مخزن یا لوله در محاسبات مکانیکی افزوده می‌شود.",
    keyTip: "در فولاد زنگ‌نزن و آلیاژهای دوپلکس ضخامت خوردگی معمولاً صفر میلی‌متر در نظر گرفته می‌شود، در حالی که برای فولاد کربنی نفت خام معمولاً ۳ یا ۶ میلی‌متر است.",
    standards: ["ASME B31.3", "ASME Sec VIII Div 1", "API 570"],
    tags: ["corrosion", "thickness", "design", "piping", "خوردگی", "ضخامت"]
  },
  {
    id: "galvanic-corrosion",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "خوردگی گالوانیک (دو فلز غیرهمجنس)",
    secondaryTerm: "Galvanic & Bimetallic Corrosion",
    abbreviation: "Galvanic",
    shortDesc: "تخریب الکتروشیمیایی سریع‌تر فلز آند (فعال‌تر) هنگام تماس فیزیکی و الکتریکی با فلز کاتد (نجیب‌تر) در حضور سیال هادی الکترولیت.",
    keyTip: "برای اتصال فلنج استیل به فلنج کربن‌استیل همیشه از کیت عایق فلنج (Insulating Gasket Kit) شامل واشر عایق و بوش‌های پیچ استفاده نمایید.",
    standards: ["ASTM G71", "NACE SP0286"],
    tags: ["galvanic", "flange", "insulation", "bimetallic", "خوردگی", "گالوانیک"]
  },
  {
    id: "ss316l",
    category: "materials",
    categoryName: "متریال و آلیاژها",
    term: "استیل ۳۱۶ کم‌کربن (316L)",
    secondaryTerm: "Stainless Steel 316L (UNS S31603)",
    abbreviation: "AISI 316L",
    shortDesc: "فولاد زنگ‌نزن آستنیتی حاوی ۲ تا ۳ درصد مولیبدن با کربن کمتر از ۰.۰۳٪ جهت جلوگیری از رسوب کاربید کروم حین جوشکاری و حفظ مقاومت به خوردگی مرزدانه‌ای.",
    keyTip: "پسوند L نشان‌دهنده Low Carbon است؛ این متریال بدون نیاز به عملیات حرارتی پس از جوشکاری، مقاومت ضدخوردگی خود را در خط جوش حفظ می‌کند.",
    standards: ["ASTM A312", "ASME SA-240", "EN 10088-3"],
    tags: ["316l", "stainless", "molybdenum", "austenite", "استیل"]
  },

  // ─── 2. تجهیزات و لوله‌کشی ─────────────────────────────────────────────
  {
    id: "npsh-pump",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "هد خالص مکش مثبت پمپ (NPSH)",
    secondaryTerm: "Net Positive Suction Head (NPSH)",
    abbreviation: "NPSH",
    shortDesc: "فشار مطلق موجود در دهانه مکش پمپ بالاتر از فشار بخار سیال؛ اگر NPSH موجود کمتر از مقدار الزامی سازنده شود، کاویتاسیون رخ می‌دهد.",
    keyTip: "همواره حاشیه ایمنی حداقل ۰.۶ متر یا ۱۰٪ (NPSHa ≥ NPSHr + 0.6m) را رعایت کنید، به خصوص هنگام پمپاژ مایعات فرار و داغ.",
    standards: ["API 610", "HI 9.6.1"],
    tags: ["pump", "npsh", "cavitation", "hydraulics", "suction", "پمپ", "کاویتاسیون"]
  },
  {
    id: "psv-valve",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "شیر اطمینان و ایمنی فشار (PSV)",
    secondaryTerm: "Pressure Safety Valve (PSV)",
    abbreviation: "PSV / PRV",
    shortDesc: "تجهیز حفاظتی حیاتی که با رسیدن فشار سیستم به حد تنظیمی (Set Pressure)، به صورت آنی باز شده و سیال مازاد را به فلر یا اتمسفر هدایت می‌کند.",
    keyTip: "افت فشار در لوله ورودی به PSV در زمان تخلیه نباید از ۳٪ فشار تنظیمی (Rule of 3% Inlet Loss) تجاوز کند تا از لرزش شدید چترینگ ممانعت گردد.",
    standards: ["API 520", "API 526", "ASME Sec VIII Div 1"],
    tags: ["psv", "safety", "valve", "relief", "overpressure", "شیر اطمینان", "ایمنی"]
  },
  {
    id: "shell-tube-hex",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "مبدل حرارتی پوسته و لوله (STHE)",
    secondaryTerm: "Shell & Tube Heat Exchanger",
    abbreviation: "STHE",
    shortDesc: "متداول‌ترین تجهیز انتقال حرارت فرآیندی متشکل از دسته‌لوله درون پوسته فلزی تحت فشار، طراحی‌شده طبق استانداردهای TEMA و ASME.",
    keyTip: "سیال خورنده‌تر، رسوب‌زاتر یا با فشار بالاتر معمولاً داخل لوله‌ها هدایت می‌شود چون تمیزکاری مکانیکی و تعویض لوله‌ها کم‌هزینه‌تر از پوسته است.",
    standards: ["TEMA Standards", "ASME Sec VIII", "API 660"],
    tags: ["heat exchanger", "tema", "shell", "tube", "مبدل", "حرارت"]
  },
  {
    id: "ko-drum",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "مخزن مایع‌گیر گاز (K.O. Drum)",
    secondaryTerm: "Knock-Out Drum (K.O. Drum)",
    abbreviation: "K.O. Drum",
    shortDesc: "مخزن تفکیک ثقلی که با کاهش سرعت جریان و تغییر جهت، قطرات مایع هیدروکربوری یا آب را پیش از ورود به فلر یا کمپرسور جدا می‌کند.",
    keyTip: "طراحی قطر مخزن بر پایه سرعت حد نشست قطرات با رابطه سودرز-براون (Souders-Brown) با فاکتور K معمولاً بین ۰.۰۵ تا ۰.۱۰ تعیین می‌گردد.",
    standards: ["API 521", "GPSA Engineering Data Book"],
    tags: ["drum", "flare", "separator", "vapor", "مخزن", "فلر", "جداساز"]
  },
  {
    id: "spectacle-blind",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "فلنج کور عینکی (Figure-8)",
    secondaryTerm: "Spectacle Blind / Figure-8",
    abbreviation: "Figure-8",
    shortDesc: "صفحه فولادی متشکل از یک دیسک مسدودکننده (کور) و یک رینگ باز متصل به هم که وضعیت باز یا بسته بودن مسیر ایزولاسیون خط لوله را به وضوح نشان می‌دهد.",
    keyTip: "در فشارهای کاری بالا یا سایزهای بزرگ به دلیل وزن سنگین، به جای عینک کور از جفت مجزای اسپید و اسپیسر (Paddle Blank & Spacer) استفاده می‌شود.",
    standards: ["ASME B16.48", "ASME B16.5"],
    tags: ["blind", "figure-8", "isolation", "flange", "فلنج", "کورکن"]
  },
  {
    id: "pig-launcher",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "تله ارسال و دریافت پیگ خط لوله",
    secondaryTerm: "Pipeline Pig Launcher & Receiver",
    abbreviation: "Pig Trap",
    shortDesc: "محفظه تحت فشار در دو انتهای خط لوله جهت فرستادن و تحویل گرفتن پیگ‌های تمیزکننده، جداکننده مایعات یا پیگ‌های هوشمند التراسونیک بدون قطع جریان سیال.",
    keyTip: "همیشه مطمئن شوید درپوش سریع‌بازشو به اینترلاک مکانیکی هشدار فشار مجهز است تا از باز شدن درب در حالت تحت فشار جلوگیری شود.",
    standards: ["ASME B31.4", "ASME B31.8", "NACE SP0102"],
    tags: ["pig", "pipeline", "launcher", "inspection", "پیگ", "خط لوله"]
  },
  {
    id: "orifice-plate",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "صفحه اوریفیس اندازه‌گیری دبی",
    secondaryTerm: "Concentric Orifice Flow Plate",
    abbreviation: "FE / Orifice",
    shortDesc: "صفحه فلزی سوراخ‌دار دقیق با لبه تیز مربعی که با ایجاد اختلاف فشار موضعی (ΔP)، دبی جرمی و حجمی سیال را طبق اصل برنولی اندازه‌گیری می‌کند.",
    keyTip: "لبه تیز سوراخ باید دقیقاً رو به جهت بالادست جریان قرار گیرد؛ نصب برعکس آن خطای اندازه‌گیری تا ۲۰٪ در قرائت دبی به وجود می‌آورد.",
    standards: ["ISO 5167", "AGA Report No. 3", "ASME MFC-3M"],
    tags: ["orifice", "flow", "instrumentation", "dp", "اوریفیس", "دبی"]
  },
  {
    id: "steam-trap",
    category: "equipment",
    categoryName: "تجهیزات و لوله‌کشی",
    term: "تله بخار و تخلیه کندانس",
    secondaryTerm: "Thermodynamic Steam Trap",
    abbreviation: "Steam Trap",
    shortDesc: "شیر خودکار حساس به فاز که آب میعان‌شده و گازهای هوا را از خطوط بخار خارج کرده و از فرار بخار داغ زنده جلوگیری می‌کند.",
    keyTip: "خرابی در وضعیت باز ماندن تله بخار باعث هدررفت سوخت بویلر می‌شود؛ بازرسی فصلی با سنسورهای صوتی التراسونیک الزامی است.",
    standards: ["ISO 6552", "FCI 69-1"],
    tags: ["steam", "trap", "energy", "condensate", "بخار", "تله بخار"]
  },

  // ─── 3. اصطلاحات کارگاهی و سایت ─────────────────────────────────────────
  {
    id: "hot-tapping",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "انشعاب‌گیری گرم تحت فشار (هات‌تپ)",
    secondaryTerm: "Pressurized Live Hot Tapping",
    abbreviation: "Hot Tap",
    shortDesc: "عملیات سوراخ‌کاری و ایجاد انشعاب لوله‌کشی روی خط یا مخزن در حال سرویس و حاوی سیال پرفشار، بدون خاموشی واحد و بدون نشت سیال.",
    keyTip: "جوشکاری اسپلیت‌تی روی خطوط با سرعت جریان کم نیازمند پایش ریسک سوراخ‌شدن بدنه لوله (Burn-through) و کاربرد الکترودهای کم‌هیدروژن است.",
    standards: ["API RP 2201", "ASME B31.3", "ASME B31.8"],
    tags: ["hot tap", "pipeline", "welding", "branch", "هات تپ", "انشعاب"]
  },
  {
    id: "tie-in",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "نقطه اتصال خطوط جدید به قدیم (تای‌این)",
    secondaryTerm: "Piping Tie-In Boundary Point",
    abbreviation: "TIE-IN",
    shortDesc: "محل مشخص‌شده در نقشه‌ها که در آن خط لوله یا تجهیزات تازه ساخته‌شده به سامانه لوله‌کشی موجود مجتمع متصل می‌گردند.",
    keyTip: "در برنامه‌ریزی شات‌دان باید ماتریس اولویت‌بندی نقاط تای‌این تهیه شود تا اسپول‌ها از قبل پیش‌ساخته شده و زمان توقف به حداقل برسد.",
    standards: ["ASME B31.3", "P&ID Standards"],
    tags: ["tie-in", "piping", "shutdown", "spool", "تای این", "اتصال"]
  },
  {
    id: "pipe-spool",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "اسپول پایپینگ پیش‌ساخته",
    secondaryTerm: "Prefabricated Pipe Spool",
    abbreviation: "Spool",
    shortDesc: "مجموعه مونتاژ و جوشکاری‌شده لوله‌ها، فلنج‌ها و اتصالات که در کارگاه ساخته شده و پس از تست‌های NDT برای نصب سریع به سایت حمل می‌شود.",
    keyTip: "همیشه یک لبه آزاد تنظیم میدانی (Field Fit Weld / FFW) به میزان ۱۰۰ میلی‌متر روی اسپول انتهایی در نظر بگیرید تا خطاهای اجرایی بتن فونداسیون جذب شود.",
    standards: ["ASME B31.3", "PFI Standards"],
    tags: ["spool", "piping", "prefabrication", "erection", "اسپول", "لوله‌کشی"]
  },
  {
    id: "punch-list",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "فهرست نواقص تحویل پروژه (پانچ‌لیست)",
    secondaryTerm: "Mechanical Completion Punch List",
    abbreviation: "Punch",
    shortDesc: "لیست رسمی ایرادات، کارهای ناقص و عدم‌انطباق‌هایی که در بازرسی پایانی پیش از راه‌اندازی مکانیکی ثبت شده و پیمانکار ملزم به رفع آن‌ها است.",
    keyTip: "آیتم‌های رده A موارد بحرانی ایمنی هستند و سیستم تا رفع ۱۰۰ درصدی آن‌ها به هیچ عنوان مجاز به ورود سیال و راه‌اندازی نیست.",
    standards: ["Project Quality Plan", "ISO 9001"],
    tags: ["punch", "commissioning", "handover", "inspection", "پانچ لیست", "تحویل"]
  },
  {
    id: "turnaround",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "تعمیرات اساسی دوره‌ای (اورهال / TA)",
    secondaryTerm: "Refinery Turnaround & Overhaul (TA)",
    abbreviation: "TA",
    shortDesc: "توقف کامل و برنامه‌ریزی‌شده واحد فرآیندی جهت بازرسی داخلی مخازن و برج‌ها، شستشوی مبدل‌ها، تعویض کاتالیست و سرویس ماشین‌آلات سنگین.",
    keyTip: "بیشترین خطر آتش‌سوزی در اولین ساعات گشودن تجهیزات گاز ترش به دلیل حضور رسوبات خودسوزان آهن سولفید (Pyrophoric) است؛ پاشش مداوم آب الزامی است.",
    standards: ["API 510", "API 570", "OSHA 1910.119"],
    tags: ["turnaround", "overhaul", "shutdown", "refinery", "اورهال", "تعمیرات"]
  },
  {
    id: "walkthrough",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "پیمایش میدانی خطوط (واک‌ترو)",
    secondaryTerm: "P&ID Field Walkthrough",
    abbreviation: "Walkdown",
    shortDesc: "بازدید حضوری بازرسان در سایت همراه با نقشه‌های P&ID جهت تطبیق چیدمان واقعی لوله‌ها، جهت فلش شیرآلات و دسترسی ارگونومیک اپراتور.",
    keyTip: "در پیمایش میدانی به جهت نصب شیرهای یکطرفه و شیب‌بندی بدون افتادگی خطوط جهت تخلیه خودبه‌خودی مایعات (Free Draining) دقت فرمایید.",
    standards: ["P&ID Specifications", "ISA 5.1"],
    tags: ["walkthrough", "p&id", "field", "audit", "واک ترو", "نقشه"]
  },
  {
    id: "hazop",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "مطالعه شناسایی خطرات فرآیندی (هازوپ)",
    secondaryTerm: "Hazard and Operability Study (HAZOP)",
    abbreviation: "HAZOP",
    shortDesc: "رویکرد ساختاریافته جلسات تیمی با استفاده از کلمات راهنما برای پیش‌بینی انحرافات فشار، دما و دبی و ارزیابی لایه‌های ایمنی قبل از بروز فاجعه.",
    keyTip: "هر گره فرآیندی باید به طور مستقل از منظر سناریوی فشار بالا همزمان با بسته بودن خروجی تحلیل شود تا کفایت ظرفیت تخلیه PSV تایید گردد.",
    standards: ["IEC 61882", "API RP 754"],
    tags: ["hazop", "safety", "process", "risk", "هازوپ", "ایمنی"]
  },
  {
    id: "moc",
    category: "jargon",
    categoryName: "اصطلاحات کارگاهی و سایت",
    term: "فرآیند رسمی مدیریت تغییرات (MOC)",
    secondaryTerm: "Management of Change (MOC)",
    abbreviation: "MOC",
    shortDesc: "سیستم انضباطی اجباری جهت ارزیابی مهندسی و ایمنی پیش از اعمال هرگونه دستکاری در متریال، تنظیمات کنترل، خطوط لوله یا فرآیند کارخانه.",
    keyTip: "تعویض جنس یک واشر ساده یا بای‌پس موقت یک آلارم نیز نیازمند مستندسازی MOC است، زیرا ریشه عمده حوادث تغییرات به ظاهر کوچک ثبت‌نشده بوده است.",
    standards: ["OSHA PSM 1910.119", "CCPS Guidelines"],
    tags: ["moc", "safety", "change", "procedure", "مدیریت تغییر"]
  },

  // ─── 4. تست و بازرسی فنی ───────────────────────────────────────────────
  {
    id: "hydrotest",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "آزمون فشار هیدرواستاتیک",
    secondaryTerm: "Hydrostatic Proof Pressure Test",
    abbreviation: "Hydrotest",
    shortDesc: "تست اثبات استحکام مکانیکی با پر کردن کامل سیستم با آب و بالا بردن فشار تا ۱.۳ الی ۱.۵ برابر فشار طراحی جهت راستی‌آزمایی خطوط جوش و فلنج‌ها.",
    keyTip: "در خطوط استنلس استیل، غلظت کلرید آب تست باید حتماً کمتر از ۵۰ پی‌پی‌ام باشد تا از خوردگی حفره‌ای و ترک زودرس تنشی ممانعت به عمل آید.",
    standards: ["ASME B31.3 Para 345.4", "ASME Sec VIII Div 1 UG-99"],
    tags: ["hydrotest", "pressure test", "inspection", "piping", "هیدرواستاتیک", "تست فشار"]
  },
  {
    id: "rt-inspection",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "آزمون پرتونگاری و رادیوگرافی جوش (RT)",
    secondaryTerm: "Volumetric Radiographic Testing (RT)",
    abbreviation: "RT",
    shortDesc: "روش آزمون غیرمخرب حجمی با تابش پرتوهای ایکس یا گاما جهت ثبت تصویر فیلم از عیوب داخلی اتصال جوش شامل حفرات گازی، نفوذ ناقص و ترک‌ها.",
    keyTip: "تصویر سیم‌های نشانگر کیفیت عکس (IQI Wire) باید روی فیلم رادیوگرافی واضح باشد؛ بدون سیم IQI فیلم رادیوگرافی فاقد اعتبار بازرسی است.",
    standards: ["ASME Sec V Article 2", "API 1104", "ISO 17636"],
    tags: ["rt", "radiography", "weld", "ndt", "رادیوگرافی", "جوش"]
  },
  {
    id: "ut-thickness",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "آزمون التراسونیک و ضخامت‌سنجی (UT)",
    secondaryTerm: "Ultrasonic & Phased Array Testing (UT)",
    abbreviation: "UT / PAUT",
    shortDesc: "تست غیرمخرب با گسیل امواج صوتی با بسامد بالا به داخل فلز جهت اندازه‌گیری دقیق ضخامت باقی‌مانده دیواره و موقعیت‌یابی سه بعدی عیوب جوشکاری.",
    keyTip: "روش پیشرفته التراسونیک فازبندی‌شده (PAUT) جایگزینی ایمن و بدون تشعشع رادیواکتیو برای رادیوگرافی سنتی با سرعت بازرسی چندبرابری است.",
    standards: ["ASME Sec V Article 4", "ASTM E164"],
    tags: ["ut", "ultrasonic", "ndt", "paut", "thickness", "التراسونیک", "ضخامت"]
  },
  {
    id: "pmi-testing",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "تست صحه‌گذاری ماهیت آلیاژ (PMI)",
    secondaryTerm: "Positive Material Identification (PMI)",
    abbreviation: "PMI",
    shortDesc: "آزمون سریع غیرمخرب میدانی با دستگاه طیف‌سنج فلورسانس پرتو ایکس (XRF) جهت راستی‌آزمایی درصد عناصر آلیاژی و جلوگیری از تداخل متریال اشتباه.",
    keyTip: "۱۰۰٪ پایپینگ‌های استیل و فیلرمتال‌های آلیاژی قبل از عملیات نصب باید برچسب بازرسی PMI دریافت کنند تا خطای مرگبار نصب فولاد کربنی به جای استیل رخ ندهد.",
    standards: ["API RP 578", "PFI ES-42"],
    tags: ["pmi", "alloy", "xrf", "metallurgy", "پی ام آی", "آلیاژ"]
  },
  {
    id: "pwht",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "عملیات حرارتی پس از جوشکاری (PWHT)",
    secondaryTerm: "Post-Weld Heat Treatment (PWHT)",
    abbreviation: "PWHT",
    shortDesc: "گرمایش کنترل‌شده و یکنواخت اتصال جوشکاری‌شده زیر دمای بحرانی جهت آزادسازی تنش‌های پسماند انقباضی و کاهش سختی ناحیه متأثر از حرارت (HAZ).",
    keyTip: "نرخ گرمایش و سرمایش باید بر اساس ضخامت قطعه دقیقاً طبق کد ASME کنترل شود تا تنش‌های ثانویه شوک حرارتی رخ ندهد.",
    standards: ["ASME Sec VIII Div 1 UCS-56", "ASME B31.3 Table 331.1.1"],
    tags: ["pwht", "heat treatment", "welding", "stress relief", "عملیات حرارتی"]
  },
  {
    id: "holiday-test",
    category: "inspection",
    categoryName: "تست و بازرسی فنی",
    term: "آزمون جرقه و یکپارچگی پوشش (هالیدی)",
    secondaryTerm: "Holiday Detector Spark Test",
    abbreviation: "Holiday",
    shortDesc: "تست ولتاژ بالای پیوستگی عایق لوله با گذراندن برس حسگر روی پوشش جهت کشف ریزمنافذ میکروسکوپی (Holiday) پیش از خاکریزی خط لوله مدفون.",
    keyTip: "ولتاژ جرقه باید بر مبنای ضخامت پوشش تنظیم شود؛ ولتاژ بسیار بالا موجب سوختن و سوراخ شدن پوشش سالم خواهد شد.",
    standards: ["NACE SP0188", "ASTM G62"],
    tags: ["holiday", "coating", "corrosion", "pipeline", "هالیدی", "پوشش"]
  },

  // ─── 5. تجارب و فوت‌وفن مهندسی ──────────────────────────────────────────
  {
    id: "cui-corrosion",
    category: "experience",
    categoryName: "تجارب و فوت‌وفن مهندسی",
    term: "خوردگی موضعی زیر عایق حرارتی (CUI)",
    secondaryTerm: "Corrosion Under Insulation (CUI)",
    abbreviation: "CUI",
    shortDesc: "از پنهان‌ترین و خطرناک‌ترین سازوکارهای تخریب لوله‌ها ناشی از نفوذ آب باران و رطوبت به فضای زیرین عایق در محدوده دمایی منفی ۴ تا ۱۷۵ درجه سانتی‌گراد.",
    keyTip: "محدوده خطر حاد CUI دمای ۵۰ تا ۱۲۰ درجه سانتی‌گراد است؛ در این بازه اعمال پوشش مقاوم اپوکسی فنولیک یا آلومینیوم متالایز (TSA) بر بدنه لوله ضروری است.",
    standards: ["API 583", "NACE SP0198"],
    tags: ["cui", "insulation", "corrosion", "hidden", "خوردگی زیر عایق", "عایق"]
  },
  {
    id: "star-torquing",
    category: "experience",
    categoryName: "تجارب و فوت‌وفن مهندسی",
    term: "سفت‌کردن ستاره‌ای و متقاطع پیچ‌های فلنج",
    secondaryTerm: "Incremental Star-Pattern Flange Torquing",
    abbreviation: "Torquing",
    shortDesc: "توالی استاندارد بستن مهره‌های فلنج در مراحل افزایشی گشتاور (۳۰٪، ۶۰٪ و ۱۰۰٪) برای ایجاد فشار متقارن روی گسکت و آب‌بندی مطمئن بدون گازبندی ناقص.",
    keyTip: "پس از پایان مرحله ۱۰۰٪ گشتاور، یک دور حرکت دورانی نهایی در جهت عقربه‌های ساعت اجرا کنید تا از عدم شل‌شدگی مهره‌های مقابل اطمینان حاصل شود.",
    standards: ["ASME PCC-1", "EN 1591-4"],
    tags: ["torque", "flange", "bolt", "gasket", "تورک", "فلنج", "گسکت"]
  },
  {
    id: "water-hammer",
    category: "experience",
    categoryName: "تجارب و فوت‌وفن مهندسی",
    term: "مهار ضربه قوچ در خطوط انتقال مایع",
    secondaryTerm: "Water Hammer & Surge Mitigation",
    abbreviation: "Surge",
    shortDesc: "کنترل موج شوک فشار دینامیکی شدید ناشی از توقف یا تغییر جهت ناگهانی سیال (قطع برق پمپ یا بسته شدن سریع شیر) که می‌تواند منجر به پارگی خط شود.",
    keyTip: "زمان بسته شدن شیرهای قطع اضطراری نباید از زمان بحرانی ژوکوفسکی سریع‌تر باشد؛ تعبیه مخازن ضربه‌گیر هیدروپنوماتیک شوک را مستهلک می‌کند.",
    standards: ["AWWA M51", "ASME B31.3"],
    tags: ["water hammer", "surge", "hydraulics", "piping", "ضربه قوچ", "هیدرولیک"]
  },
  {
    id: "deadlegs",
    category: "experience",
    categoryName: "تجارب و فوت‌وفن مهندسی",
    term: "مدیریت پایه‌های مرده و بن‌بست‌های پایپینگ",
    secondaryTerm: "Piping Deadleg Management",
    abbreviation: "Deadleg",
    shortDesc: "بخش‌هایی از لوله‌کشی با جریان راکد یا صفر که محل تجمع آب، لجن و باکتری‌های بی‌هوازی مولد خوردگی‌های موضعی عمیق هستند.",
    keyTip: "هر شاخه با طول بیش از ۳ برابر قطر اسمی لوله (L > 3D) فاقد جریان مستمر باید شناسایی شده و در برنامه اولویت‌دار ضخامت‌سنجی دوره‌ای قرار گیرد.",
    standards: ["API 570", "API 574"],
    tags: ["deadleg", "corrosion", "stagnant", "piping", "پایپینگ", "خوردگی"]
  }
];
