// src/modules/customers/data/holdings.data.ts
import type { Holding } from "../types/holdings.types";

export const IRANIAN_HOLDINGS: Holding[] = [
  {
    "id": "pgpic",
    "excelId": 208,
    "nameFa": "شرکت صنایع پتروشیمی خلیج فارس",
    "nameEn": "Persian Gulf Petrochemical Industries Co.",
    "companyAbbrv": "PGPIC",
    "tseSymbol": "فارس",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=فارس",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=65883838195688438",
    "logoUrl": "/customers/logos/208.png",
    "establishedYear": 1389,
    "headquartersFa": "تهران- خیابان کریم‌خان زند، پلاک ۳۸",
    "officeAddressFa": "تهران- خیابان کریم‌خان زند، پلاک ۳۸",
    "officePhone": "+98-21-88309060-74",
    "website": "https://pgpic.ir",
    "descriptionFa": "شرکت صنایع پتروشیمی خلیج فارس (PGPIC) بزرگ‌ترین هلدینگ پتروشیمی ایران است که مدیریت مجتمع‌های الفین، آروماتیک، اوره، پلیمر و یوتیلیتی متمرکز در مناطق ویژه اقتصادی عسلویه و ماهشهر را بر عهده دارد.",
    "descriptionEn": "Persian Gulf Petrochemical Industries Co. (PGPIC) is the premier petrochemical conglomerate in Iran, managing key olefin, aromatic, polymer, and utility complexes in Assaluyeh and Mahshahr.",
    "subsidiaries": [
      {
        "id": "bipc",
        "nameFa": "پتروشیمی بندر امام",
        "nameEn": "Bandar Imam Petrochemical Co. (BIPC)",
        "companyAbbrv": "BIPC",
        "tseSymbol": "بندر امام",
        "industry": "پتروشیمی جامع (الفین، آروماتیک، کلرآلکالی، لاستیک)",
        "role": "قطب الفین و پلیمر ماهشهر",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "اتیلن (الفین ۱)",
          "پروپیلن",
          "پلی‌اتیلن سبک و سنگین",
          "بنزن",
          "پلی‌بوتادین"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-bipc"
      },
      {
        "id": "nouri",
        "nameFa": "پتروشیمی نوری (برزویه)",
        "nameEn": "Nouri Petrochemical Co.",
        "companyAbbrv": "Nouri",
        "tseSymbol": "نوری",
        "industry": "مجتمع آروماتیک",
        "role": "بزرگترین مجتمع آروماتیک",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "پارا زایلین",
          "بنزن",
          "ارتو زایلین",
          "رافینیت",
          "آروماتیک سنگین"
        ],
        "isCustomerOfEsp": true,
        "plantId": "aromatic-nouri"
      },
      {
        "id": "bouali",
        "nameFa": "پتروشیمی بوعلی سینا",
        "nameEn": "Bouali Sina Petrochemical Co.",
        "companyAbbrv": "BSPC",
        "tseSymbol": "بوعلی",
        "industry": "مجتمع آروماتیک",
        "role": "تامین‌کننده آروماتیک سوم ماهشهر",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "بنزن",
          "پارا زایلین",
          "رافینیت",
          "برش‌های سنگین"
        ],
        "isCustomerOfEsp": true,
        "plantId": "aromatic-bouali"
      },
      {
        "id": "pars",
        "nameFa": "پتروشیمی پارس",
        "nameEn": "Pars Petrochemical Co.",
        "companyAbbrv": "Pars",
        "tseSymbol": "پارس",
        "industry": "استایرن منومر و اتیل بنزن",
        "role": "تولیدکننده استایرن منومر و اتیل بنزن",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه",
        "products": [
          "استایرن منومر",
          "اتیل بنزن",
          "پروپان",
          "بوتان"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "shgoya",
        "nameFa": "پتروشیمی شهید تندگویان",
        "nameEn": "Shahid Tondgooyan Petrochemical Co.",
        "companyAbbrv": "STPC",
        "tseSymbol": "شگویا",
        "industry": "پلی‌اتیلن ترفتالات (PET) و اسید ترفتالیک",
        "role": "تولیدکننده انحصاری PET در کشور",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "PET گرید بطری و نساجی",
          "اسید ترفتالیک خالص (PTA)"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pet-tondgooyan"
      },
      {
        "id": "arvand",
        "nameFa": "پتروشیمی اروند",
        "nameEn": "Arvand Petrochemical Co.",
        "companyAbbrv": "Arvand",
        "tseSymbol": "اروند",
        "industry": "کلرآلکالی و پلی وینیل کلراید (PVC)",
        "role": "بزرگترین زنجیره کلر و PVC کشور",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "سوسپانسیون PVC",
          "امولسیون PVC",
          "سود پرک و کلر مایع",
          "اتیلن دی‌کلراید"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pvc-arvand"
      },
      {
        "id": "mobin",
        "nameFa": "مبین انرژی خلیج فارس",
        "nameEn": "Mobin Energy Persian Gulf Co.",
        "companyAbbrv": "Mobin",
        "tseSymbol": "مبین",
        "industry": "یوتیلیتی متمرکز فرآیندی",
        "role": "تامین‌کننده سرویس‌های جانبی فاز ۱ عسلویه",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "برق",
          "بخار صنعتی",
          "آب خنک‌کننده دریا",
          "هوای فشرده ابزار دقیق",
          "نیتروژن و اکسیژن"
        ],
        "isCustomerOfEsp": true,
        "plantId": "utility-mobin"
      },
      {
        "id": "fajr",
        "nameFa": "فجر انرژی خلیج فارس",
        "nameEn": "Fajr Energy Persian Gulf Co.",
        "companyAbbrv": "Fajr",
        "tseSymbol": "بفجر",
        "industry": "یوتیلیتی متمرکز فرآیندی",
        "role": "تامین‌کننده مرکزی سرویس‌های جانبی ماهشهر",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "برق نیروگاهی",
          "بخار پرفشار",
          "آب RO و DM",
          "هوای فرآیندی",
          "گازهای صنعتی"
        ],
        "isCustomerOfEsp": true,
        "plantId": "utility-fajr"
      },
      {
        "id": "gachsaran",
        "nameFa": "پتروشیمی گچساران",
        "nameEn": "Gachsaran Petrochemical Co.",
        "companyAbbrv": "GPC",
        "industry": "واحد الفین اتان کراکر",
        "role": "تامین اتیلن خط لوله دنا",
        "plantLocation": "استان کهگیلویه و بویراحمد - گچساران",
        "products": [
          "اتیلن (۱ میلیون تن)",
          "برش C3+"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "karun",
        "nameFa": "پتروشیمی کارون",
        "nameEn": "Karun Petrochemical Co.",
        "companyAbbrv": "KPC",
        "industry": "ایزوسیانات‌ها و پلی‌یورتان",
        "role": "نخستین تولیدکننده TDI و MDI در خاورمیانه",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "تولوئن دی‌ایزوسیانات (TDI)",
          "متیلن دی‌فنیل دی‌ایزوسیانات (MDI)",
          "آنیلین"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "bidboland",
        "nameFa": "پالایش گاز بیدبلند خلیج فارس",
        "nameEn": "Bidboland Persian Gulf Gas Refining Co.",
        "companyAbbrv": "Bidboland",
        "industry": "پالایش و تفکیک گازهای همراه و فلر",
        "role": "تامین‌کننده خوراک غنی متان، اتان و میعانات مجتمع‌ها",
        "plantLocation": "بهبهان، خوزستان",
        "products": [
          "اتان (خوراک الفین‌ها)",
          "پروپان",
          "بوتان",
          "میعانات گازی C5+"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "پتروشیمی",
      "خلیج فارس",
      "الفین",
      "آروماتیک",
      "بورس تهران",
      "فارس"
    ]
  },
  {
    "id": "tappico",
    "excelId": 207,
    "nameFa": "شرکت سرمایه‌گذاری نفت، گاز و پتروشیمی تامین (تاپیکو)",
    "nameEn": "Tappico (Tamin Petroleum & Petrochemical Investment Co.)",
    "companyAbbrv": "TAPPICO",
    "tseSymbol": "تاپیکو",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=تاپیکو",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=25482312678125432",
    "logoUrl": "/customers/logos/207.png",
    "establishedYear": 1381,
    "headquartersFa": "تهران، خیابان پاسداران، ابتدای خیابان اختیاریه جنوبی، نبش خیابان ارم چهارم",
    "officeAddressFa": "تهران، خیابان پاسداران، ابتدای خیابان اختیاریه جنوبی، نبش خیابان ارم چهارم، شرکت سرمایه‌گذاری نفت و گاز و پتروشیمی تأمین (تاپیکو)",
    "officePhone": "+98-21-42575000",
    "website": "https://www.tappico.com",
    "descriptionFa": "شرکت سرمایه‌گذاری نفت و گاز و پتروشیمی تامین (تاپیکو) از بزرگ‌ترین هلدینگ‌های چندرشته‌ای صنعت نفت و گاز و پتروشیمی کشور و بازوی اصلی شرکت سرمایه‌گذاری تامین اجتماعی (شستا) در حوزه انرژی است.",
    "descriptionEn": "Tappico is the primary energy, oil, gas, and petrochemical investment arm of SHASTA, holding major stakes in refineries, chemical complexes, and downstream producers.",
    "subsidiaries": [
      {
        "id": "sharak",
        "nameFa": "پتروشیمی شازند (اراک)",
        "nameEn": "Shazand Petrochemical Co. (ARPC)",
        "companyAbbrv": "ARPC",
        "tseSymbol": "شاراک",
        "industry": "الفین پایه نفتا و پلیمر",
        "role": "بزرگترین مجتمع پایه مایع کشور",
        "plantLocation": "اراک، کیلومتر ۲۲ جاده بروجرد",
        "products": [
          "پلی‌اتیلن سنگین و سبک خطی",
          "پلی‌پروپیلن",
          "اکسید اتیلن",
          "وینیل استات",
          "اتانول آمین‌ها"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-sharak"
      },
      {
        "id": "fanavaran",
        "nameFa": "پتروشیمی فن‌آوران",
        "nameEn": "Fanavaran Petrochemical Co.",
        "companyAbbrv": "FPC",
        "tseSymbol": "شفن",
        "industry": "متانول و اسید استیک",
        "role": "تامین‌کننده متانول و اسید استیک",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "متانول",
          "اسید استیک",
          "مونواکسید کربن"
        ],
        "isCustomerOfEsp": true,
        "plantId": "methanol-fanavaran"
      },
      {
        "id": "ghadir",
        "nameFa": "پتروشیمی غدیر",
        "nameEn": "Ghadir Petrochemical Co.",
        "companyAbbrv": "GPC",
        "tseSymbol": "شغدیر",
        "industry": "تولید رزین PVC و وینیل کلراید",
        "role": "تولیدکننده PVC گرید S65",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "پلی وینیل کلراید (PVC)",
          "وینیل کلراید منومر (VCM)"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pvc-ghadir"
      },
      {
        "id": "khorasan",
        "nameFa": "پتروشیمی خراسان",
        "nameEn": "Khorasan Petrochemical Co.",
        "companyAbbrv": "KHPC",
        "tseSymbol": "خراسان",
        "industry": "اوره، آمونیاک و ملامین",
        "role": "بزرگترین قطب کود شیمیایی شمال شرق کشور",
        "plantLocation": "بجنورد، کیلومتر ۱۷ جاده بجنورد - شیروان",
        "products": [
          "اوره گرانول",
          "آمونیاک",
          "کریستال ملامین"
        ],
        "isCustomerOfEsp": true,
        "plantId": "urea-khorasan"
      },
      {
        "id": "abadan",
        "nameFa": "پتروشیمی آبادان",
        "nameEn": "Abadan Petrochemical Co.",
        "companyAbbrv": "Abadan",
        "tseSymbol": "شپترو",
        "industry": "PVC و DDB",
        "role": "نخستین پتروشیمی کشور (تاسیس ۱۳۴۷)",
        "plantLocation": "آبادان، خوزستان",
        "products": [
          "PVC گرید S و E",
          "دودسیل بنزن (DDB)",
          "سود سوزآور"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pvc-abadan"
      },
      {
        "id": "pgr-star",
        "nameFa": "پالایش نفت ستاره خلیج فارس",
        "nameEn": "Persian Gulf Star Oil Co.",
        "companyAbbrv": "PGSOC",
        "industry": "مگا پالایشگاه میعانات گازی",
        "role": "بزرگترین پالایشگاه میعانات گازی جهان",
        "plantLocation": "بندرعباس، هرمزگان",
        "products": [
          "بنزین یورو ۵",
          "گازوئیل یورو ۵",
          "سوخت جت",
          "گاز مایع LPG"
        ],
        "isCustomerOfEsp": true,
        "plantId": "refinery-star"
      },
      {
        "id": "pasargad-oil",
        "nameFa": "نفت پاسارگاد",
        "nameEn": "Pasargad Oil Co.",
        "companyAbbrv": "Pasargad",
        "tseSymbol": "شپاس",
        "industry": "تولید قیر صنعتی و جاده‌ای",
        "role": "بزرگترین تولیدکننده و صادرکننده قیر خاورمیانه",
        "plantLocation": "تهران، آبادان، بندرعباس، تبریز، اراک و شیراز",
        "products": [
          "قیر نفوذی",
          "قیر عملکردی PG",
          "قیر امولسیون و محلول"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "iranol",
        "nameFa": "نفت ایرانول",
        "nameEn": "Iranol Oil Co.",
        "companyAbbrv": "Iranol",
        "tseSymbol": "شرانل",
        "industry": "روغن پایه و روانکارهای فوق‌پیشرفته",
        "role": "تولیدکننده برتر روغن موتور و روانکار صنعتی",
        "plantLocation": "پالایشگاه روغن‌سازی تهران و آبادان",
        "products": [
          "روغن پایه پارافینیک SN",
          "روغن‌های موتوری بنزینی و دیزلی",
          "روانکار صنعتی",
          "اسلاک واکس"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "تاپیکو",
      "شستا",
      "نفت و گاز",
      "پتروشیمی",
      "روانکار",
      "بورس تهران"
    ]
  },
  {
    "id": "parsan",
    "excelId": 210,
    "nameFa": "گروه گسترش نفت و گاز پارسیان (پارسان)",
    "nameEn": "Parsian Oil & Gas Dev. Group",
    "companyAbbrv": "POGDC",
    "tseSymbol": "پارسان",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=پارسان",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=33994783789012456",
    "logoUrl": "/customers/logos/210.png",
    "establishedYear": 1386,
    "headquartersFa": "تهران، خیابان شریعتی، پل رومی ورودی الهیه، مقابل کوچه مبشر، پلاک ۴۱",
    "officeAddressFa": "تهران، خیابان شریعتی، پل رومی ورودی الهیه، مقابل کوچه مبشر، پلاک ۴۱",
    "officePhone": "+98-21-78329000",
    "website": "https://www.pogdc.com",
    "descriptionFa": "گروه گسترش نفت و گاز پارسیان (پارسان) هلدینگ تخصصی صنعت نفت، گاز، پتروشیمی و پالایش شرکت سرمایه‌گذاری غدیر است که زنجیره ارزش تولید اوره، آمونیاک، متانول و پالایش نفت را در اختیار دارد.",
    "descriptionEn": "Parsian Oil & Gas Development Group (POGDC) is the specialized energy conglomerate of Ghadir Investment, managing major urea, ammonia, methanol, and refinery complexes.",
    "subsidiaries": [
      {
        "id": "pardis",
        "nameFa": "پتروشیمی پردیس",
        "nameEn": "Pardis Petrochemical Co.",
        "companyAbbrv": "Pardis",
        "tseSymbol": "شپدیس",
        "industry": "اوره و آمونیاک (فاز ۱ و ۲ و ۳)",
        "role": "بزرگترین مجتمع تولیدکننده اوره و آمونیاک خاورمیانه",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "اوره گرانول کشاورزی",
          "آمونیاک مایع صنعتی"
        ],
        "isCustomerOfEsp": true,
        "plantId": "urea-pardis"
      },
      {
        "id": "zagros",
        "nameFa": "پتروشیمی زاگرس",
        "nameEn": "Zagros Petrochemical Co.",
        "companyAbbrv": "Zagros",
        "tseSymbol": "زاگرس",
        "industry": "متانول مقیاس جهانی",
        "role": "بزرگترین تولیدکننده متانول در جهان در یک سایت",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "متانول گرید AA صنعتی"
        ],
        "isCustomerOfEsp": true,
        "plantId": "methanol-zagros"
      },
      {
        "id": "shiraz-petro",
        "nameFa": "پتروشیمی شیراز",
        "nameEn": "Shiraz Petrochemical Co.",
        "companyAbbrv": "SPC",
        "tseSymbol": "شیراز",
        "industry": "کودهای شیمیایی و نیتروژن",
        "role": "کهن‌ترین پتروشیمی ایران (تاسیس ۱۳۳۸)",
        "plantLocation": "مرودشت، کیلومتر ۵ جاده سد درودزن",
        "products": [
          "اوره گرانول و پریل",
          "نیترات آمونیوم",
          "اسید نیتریک",
          "متانول"
        ],
        "isCustomerOfEsp": true,
        "plantId": "urea-shiraz"
      },
      {
        "id": "kermanshah-petro",
        "nameFa": "صنایع پتروشیمی کرمانشاه",
        "nameEn": "Kermanshah Petrochemical Industries Co.",
        "companyAbbrv": "KPIC",
        "tseSymbol": "کرماشا",
        "industry": "اوره و آمونیاک غرب کشور",
        "role": "تامین‌کننده کود شیمیایی غرب و شمال غرب",
        "plantLocation": "کرمانشاه، کیلومتر ۴ جاده هرسین",
        "products": [
          "اوره گرانول",
          "آمونیاک"
        ],
        "isCustomerOfEsp": true,
        "plantId": "urea-kermanshah"
      },
      {
        "id": "tabriz-petro",
        "nameFa": "پتروشیمی تبریز",
        "nameEn": "Tabriz Petrochemical Co.",
        "companyAbbrv": "TPC",
        "industry": "الفین، پلیمرهای استایرنی و لاستیک",
        "role": "تولیدکننده پلیمرهای مهندسی استایرنی",
        "plantLocation": "تبریز، مجاورت پالایشگاه تبریز",
        "products": [
          "پلی‌استایرن معمولی GPPS",
          "پلی‌استایرن مقاوم HIPS",
          "پلی‌استایرن انبساطی EPS",
          "ABS"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-tabriz"
      },
      {
        "id": "tabriz-refinery",
        "nameFa": "پالایش نفت تبریز",
        "nameEn": "Tabriz Oil Refining Co.",
        "companyAbbrv": "TORC",
        "tseSymbol": "شبریز",
        "industry": "پالایش نفت خام و تولید سوخت",
        "role": "تامین‌کننده سوخت استاندارد شمال غرب کشور",
        "plantLocation": "تبریز، کیلومتر ۱۵ جاده آذرشهر",
        "products": [
          "بنزین یورو ۵",
          "گازوئیل یورو ۵",
          "نفت سفید",
          "سوخت هوایی ATK",
          "گوگرد"
        ],
        "isCustomerOfEsp": true,
        "plantId": "refinery-tabriz"
      },
      {
        "id": "shiraz-refinery",
        "nameFa": "پالایش نفت شیراز",
        "nameEn": "Shiraz Oil Refining Co.",
        "companyAbbrv": "SORC",
        "tseSymbol": "شراز",
        "industry": "پالایش نفت خام",
        "role": "تامین فرآورده‌های نفتی جنوب کشور",
        "plantLocation": "شیراز، کیلومتر ۲۰ جاده اصفهان",
        "products": [
          "بنزین موتور",
          "نفت گاز",
          "قیر پالایشگاهی",
          "حلال‌های صنعتی"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "پارسان",
      "غدیر",
      "اوره",
      "آمونیاک",
      "متانول",
      "پالایشگاه",
      "بورس"
    ]
  },
  {
    "id": "bakhtar",
    "excelId": 209,
    "nameFa": "شرکت گروه پتروشیمی باختر",
    "nameEn": "Bakhtar Group Co.",
    "companyAbbrv": "BGPC",
    "tseSymbol": "باختر",
    "logoUrl": "/customers/logos/209.png",
    "establishedYear": 1383,
    "headquartersFa": "تهران - بزرگراه اشرفی اصفهانی - چهار راه پونک - بلوار فلاح زاده پلاک 40 طبقه 5",
    "officeAddressFa": "تهران - بزرگراه اشرفی اصفهانی - چهار راه پونک - بلوار فلاح زاده پلاک 40 طبقه 5 ، کدپستی 1469643841",
    "officePhone": "+98-21-49239000",
    "postalCode": "1469643841",
    "website": "https://bakhtargroup.com",
    "descriptionFa": "شرکت گروه پتروشیمی باختر بزرگ‌ترین هلدینگ پتروشیمی خصوصی ایران و متولی خط لوله اتیلن غرب است که مجتمع‌های تولید الفین و پلی‌الفین غرب کشور را مدیریت می‌نماید.",
    "descriptionEn": "Bakhtar Petrochemical Group (BGPC) is Iran's premier private petrochemical holding and the operator of the Western Ethylene Pipeline, overseeing integrated polyolefin plants across western provinces.",
    "subsidiaries": [
      {
        "id": "kavian",
        "nameFa": "پتروشیمی کاویان (الفین ۱۱)",
        "nameEn": "Kavian Petrochemical Co.",
        "companyAbbrv": "Kavian",
        "industry": "مگا الفین اتان کراکر (فاز ۱ و ۲)",
        "role": "مادر و تغذیه‌کننده خط لوله اتیلن غرب",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۲",
        "products": [
          "اتیلن پلیمری گرید خلوص بالا"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-kavian"
      },
      {
        "id": "lorestan",
        "nameFa": "پتروشیمی لرستان",
        "nameEn": "Lorestan Petrochemical Co.",
        "companyAbbrv": "LPC",
        "industry": "پلی‌اتیلن سنگین و سبک خطی",
        "role": "تولیدکننده پلی‌اتیلن مسیر غرب",
        "plantLocation": "خرم‌آباد، کیلومتر ۱۲ جاده کوهدشت",
        "products": [
          "LLDPE",
          "HDPE",
          "پروپیلن و ۱-بوتن"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pe-lorestan"
      },
      {
        "id": "mahabad",
        "nameFa": "پتروشیمی مهاباد",
        "nameEn": "Mahabad Petrochemical Co.",
        "companyAbbrv": "MPC",
        "industry": "پلی‌اتیلن سنگین و خطی (LLDPE/HDPE)",
        "role": "قطب پلیمر شمال غرب",
        "plantLocation": "مهاباد، کیلومتر ۱۵ جاده ارومیه",
        "products": [
          "پلی‌اتیلن سنگین لوله و فیلم",
          "LLDPE",
          "بوتن-۱"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pe-mahabad"
      },
      {
        "id": "kordestan",
        "nameFa": "پتروشیمی کردستان",
        "nameEn": "Kordestan Petrochemical Co.",
        "companyAbbrv": "KPC",
        "industry": "پلی‌اتیلن سبک (LDPE)",
        "role": "تولیدکننده پلی‌اتیلن سبک گرید لوله‌ای با فناوری فشار بالا",
        "plantLocation": "سنندج، کیلومتر ۵ جاده دیواندره",
        "products": [
          "LDPE گرید فیلم سنگین و سبک"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pe-kordestan"
      },
      {
        "id": "polymer-kermanshah",
        "nameFa": "پلیمر کرمانشاه",
        "nameEn": "Kermanshah Polymer Co.",
        "companyAbbrv": "KPC",
        "industry": "پلی‌اتیلن سنگین سبک‌ساز",
        "role": "تولیدکننده گرید‌های بادی و فیلم",
        "plantLocation": "کرمانشاه، شهرک صنعتی فرامان",
        "products": [
          "HDPE پایپ و تزریقی"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pe-kermanshah"
      },
      {
        "id": "miandoab",
        "nameFa": "پتروشیمی میاندوآب",
        "nameEn": "Miandoab Petrochemical Co.",
        "companyAbbrv": "MPC",
        "industry": "پلی‌اتیلن سنگین (HDPE)",
        "role": "آخرین حلقه الفین خط غرب",
        "plantLocation": "میاندوآب، آذربایجان غربی",
        "products": [
          "HDPE گرید بادی و لوله"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pe-miandoab"
      }
    ],
    "tags": [
      "باختر",
      "اتیلن غرب",
      "الفین",
      "پلی‌اتیلن",
      "کاویان",
      "خصوصی"
    ]
  },
  {
    "id": "saba-energy",
    "nameFa": "شرکت سرمایه‌گذاری صندوق بازنشستگی کشوری (صبا انرژی)",
    "nameEn": "Civil Servants Pension Fund Energy Holding (Saba Energy)",
    "companyAbbrv": "SABA",
    "tseSymbol": "وصبا",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=وصبا",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=56983212879541235",
    "logoUrl": "/customers/logos/saba.png",
    "establishedYear": 1367,
    "headquartersFa": "تهران، میدان ونک، خیابان گاندی جنوبی، پلاک ۷۲",
    "officeAddressFa": "تهران، میدان ونک، خیابان گاندی جنوبی، پلاک ۷۲",
    "officePhone": "+98-21-88775533",
    "website": "https://saba-energy.ir",
    "descriptionFa": "هلدینگ صبا انرژی بازوی تخصصی سرمایه‌گذاری صندوق بازنشستگی کشوری در حوزه انرژی، پتروشیمی، پالایش و فولاد است و مالکیت سهام عمده پتروشیمی جم و فولاد اکسین را داراست.",
    "descriptionEn": "Saba Energy is the specialized energy and industrial holding of the Civil Servants Pension Fund, with strategic controlling assets in Jam Petrochemical, JPPC, and heavy industry.",
    "subsidiaries": [
      {
        "id": "jam-petro",
        "nameFa": "پتروشیمی جم (الفین ۱۰)",
        "nameEn": "Jam Petrochemical Co.",
        "companyAbbrv": "JPC",
        "tseSymbol": "جم",
        "industry": "مگا الفین گازی و مایع و پلیمرها",
        "role": "بزرگترین واحد الفین الفین‌های گازی و مایع",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "اتیلن (الفین ۱۰)",
          "پروپیلن",
          "HDPE",
          "LLDPE",
          "بوتادین",
          "۱-بوتن"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-jam"
      },
      {
        "id": "jppc",
        "nameFa": "پلی‌پروپیلن جم (JPPC)",
        "nameEn": "Jam Polypropylene Co.",
        "companyAbbrv": "JPPC",
        "tseSymbol": "جم پیلن",
        "industry": "پلی‌پروپیلن و هموپلیمر/کوپلیمر",
        "role": "تولیدکننده پیشتاز انواع گریدهای پلی‌پروپیلن",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۱",
        "products": [
          "پلی‌پروپیلن هموپلیمر",
          "پلی‌پروپیلن کوپلیمر ضربه‌پذیر",
          "کوپلیمر رندوم"
        ],
        "isCustomerOfEsp": true,
        "plantId": "pp-jppc"
      },
      {
        "id": "mis-petro",
        "nameFa": "صنایع پتروشیمی مسجد سلیمان",
        "nameEn": "Masjed Soleyman Petrochemical Co.",
        "companyAbbrv": "MISPC",
        "industry": "اوره و آمونیاک",
        "role": "تولیدکننده اوره و آمونیاک شمال خوزستان",
        "plantLocation": "مسجد سلیمان، منطقه زیلایی",
        "products": [
          "اوره گرانول کشاورزی",
          "آمونیاک بدون آب"
        ],
        "isCustomerOfEsp": true,
        "plantId": "urea-mis"
      },
      {
        "id": "oxin-steel",
        "nameFa": "فولاد اکسین خوزستان",
        "nameEn": "Oxin Steel Khuzestan Co.",
        "companyAbbrv": "Oxin",
        "industry": "فولادهای آلیاژی عریض",
        "role": "تولیدکننده ورق‌های عریض لوله‌های انتقال گاز ترش نفت و گاز",
        "plantLocation": "اهواز، خوزستان",
        "products": [
          "ورق‌های آلیاژی API",
          "ورق‌های مخازن تحت فشار"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "صبا انرژی",
      "صندوق بازنشستگی",
      "جم",
      "پلی‌پروپیلن",
      "بورس"
    ]
  },
  {
    "id": "mapna",
    "nameFa": "گروه مپنا (مدیریت پروژه‌های نیروگاهی ایران)",
    "nameEn": "MAPNA Group",
    "companyAbbrv": "MAPNA",
    "tseSymbol": "رمپنا",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=رمپنا",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=65883838195688499",
    "logoUrl": "/customers/logos/mapna.png",
    "establishedYear": 1372,
    "headquartersFa": "تهران، بلوار میرداماد، پلاک ۲۳۱",
    "officeAddressFa": "تهران، بلوار میرداماد، پلاک ۲۳۱",
    "officePhone": "+98-21-22908580-99",
    "website": "https://mapnagroup.com",
    "descriptionFa": "گروه مپنا بنگاه بزرگ صنعتی و مهندسی ایران در حوزه احداث نیروگاه‌های حرارتی و تجدیدپذیر، پروژه‌های نفت و گاز، پالایشگاه، خطوط لوله و ساخت تجهیزات سنگین صنعتی (توربین، بویلر و کمپرسور) است.",
    "descriptionEn": "MAPNA Group is Iran's leading industrial and engineering enterprise executing utility power plants, oil and gas EPC projects, and manufacturing process turbines, boilers, and compressors.",
    "subsidiaries": [
      {
        "id": "tuga",
        "nameFa": "شرکت مهندسی و ساخت توربین مپنا (توگا)",
        "nameEn": "MAPNA Turbine Engineering & Manufacturing (TUGA)",
        "companyAbbrv": "TUGA",
        "industry": "توربین‌های گاز و بخار و کمپرسورهای فرآیندی",
        "role": "طراح و سازنده توربین‌های سنگین و توربوکمپرسورهای صنایع نفت و گاز",
        "plantLocation": "فردیس کرج، البرز",
        "products": [
          "توربین گاز صنعتی",
          "توربین بخار نیروگاهی",
          "کمپرسورهای سانتریفیوژ نفت و گاز"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "mapna-oil-gas",
        "nameFa": "توسعه نفت و گاز مپنا (OGDC)",
        "nameEn": "MAPNA Oil & Gas Development Co.",
        "companyAbbrv": "MAPNA OG",
        "industry": "پیمانکاری عمومی EPC مگاپروژه‌های نفت، گاز و پتروشیمی",
        "role": "بازوی توسعه نفت، پالایش و پتروشیمی مپنا",
        "plantLocation": "تهران / عسلویه / خوزستان",
        "products": [
          "احداث پالایشگاه",
          "توسعه میادین گازی",
          "واحدهای یوتیلیتی"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "mapna-boiler",
        "nameFa": "مهندسی و ساخت بویلر و تجهیزات مپنا",
        "nameEn": "MAPNA Boiler and Equipment Engineering & Manufacturing",
        "companyAbbrv": "MAPNA Boiler",
        "industry": "بویلرهای بازیاب حرارتی HRSG و صنعتی",
        "role": "سازنده بویلرهای فوق‌پیشرفته نیروگاهی و پالایشگاهی",
        "plantLocation": "کرج، البرز",
        "products": [
          "بویلر بازیاب حرارتی HRSG",
          "بویلر فایرتیوب و واترتیوب فرآیندی"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "مپنا",
      "توربین",
      "نیروگاه",
      "نفت و گاز",
      "EPC",
      "بورس"
    ]
  },
  {
    "id": "ahdaf",
    "excelId": 211,
    "nameFa": "شرکت سرمایه‌گذاری اهداف",
    "nameEn": "Ahdaf Investment Co.",
    "companyAbbrv": "AHDAF",
    "logoUrl": "/customers/logos/211.png",
    "establishedYear": 1386,
    "headquartersFa": "تهران- میدان ونک- خیابان ملاصدرا- خیابان شیراز شمالی- خیابان دانشور شرقی – پلاک 51",
    "officeAddressFa": "تهران- میدان ونک- خیابان ملاصدرا- خیابان شیراز شمالی- خیابان دانشور شرقی – پلاک 51",
    "officePhone": "+98-21-88614324",
    "website": "https://www.ahdafinco.com",
    "descriptionFa": "شرکت سرمایه‌گذاری اهداف بازوی اقتصادی و سرمایه‌گذاری صندوق‌های بازنشستگی، پس‌انداز و رفاه کارکنان صنعت نفت در پروژه‌های بالادستی، پتروپالایشگاهی و روانکارهای کشور است.",
    "descriptionEn": "Ahdaf Investment Co. operates as the primary strategic investment vehicle of the Oil Personnel Pension Fund, backing key petrochemical, refining, and EPC infrastructure.",
    "subsidiaries": [
      {
        "id": "sepahan-oil",
        "nameFa": "نفت سپاهان",
        "nameEn": "Sepahan Oil Co.",
        "companyAbbrv": "SOC",
        "tseSymbol": "شسپا",
        "industry": "روانکارها و روغن موتور",
        "role": "بزرگترین تولیدکننده روغن پایه خاورمیانه",
        "plantLocation": "اصفهان، مجاورت پالایشگاه اصفهان",
        "products": [
          "روغن پایه SN",
          "روغن موتور اسپیدی",
          "اکستراکت",
          "پارافین و واکس"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "kangan-petro",
        "nameFa": "پتروپالایش کنگان",
        "nameEn": "Kangan Petrorefining Co.",
        "companyAbbrv": "KPRC",
        "industry": "جداسازی اتان و الفین اتان کراکر (الفین ۱۴)",
        "role": "تامین‌کننده الفین و خوراک فازهای جنوبی",
        "plantLocation": "کنگان، بوشهر",
        "products": [
          "اتان بازیافتی",
          "اتیلن پلیمری",
          "پروپان و بوتان"
        ],
        "isCustomerOfEsp": true,
        "plantId": "olefin-kangan"
      },
      {
        "id": "oiec-corp",
        "nameFa": "شرکت مهندسی و ساختمان صنایع نفت (اویک)",
        "nameEn": "Oil Industries Engineering & Construction (OIEC)",
        "companyAbbrv": "OIEC",
        "industry": "پیمانکاری عمومی EPC مگاپروژه‌های نفت و گاز",
        "role": "پیمانکار عمومی توسعه مگاپروژه‌های پارس جنوبی",
        "plantLocation": "تهران و مناطق عملیاتی جنوب",
        "products": [
          "طراحی و احداث پالایشگاه‌های گاز",
          "توسعه میادین نفتی"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "soroush-mehran-petro",
        "nameFa": "صنایع پتروشیمی سروش مههران",
        "nameEn": "Soroush Mehran Petrochemical",
        "companyAbbrv": "SMPC",
        "industry": "توسعه صنایع پایین‌دستی پتروشیمی",
        "role": "تولید رزین‌ها و مواد شیمیایی تکمیلی",
        "plantLocation": "ماهشهر و عسلویه",
        "products": [
          "رزین‌های مهندسی",
          "کاتالیست‌های مصرفی"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "اهداف",
      "صندوق نفت",
      "سپاهان",
      "اویک",
      "کنگان",
      "سرمایه‌گذاری"
    ]
  },
  {
    "id": "shasta",
    "excelId": 960,
    "nameFa": "شرکت سرمایه‌گذاری تامین اجتماعی (شستا)",
    "nameEn": "Social Security Investment Co. (SSIC)",
    "companyAbbrv": "SSIC",
    "tseSymbol": "شستا",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=شستا",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=45678912345678901",
    "logoUrl": "/customers/logos/960.png",
    "establishedYear": 1365,
    "headquartersFa": "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۲۴۸۴",
    "officeAddressFa": "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۲۴۸۴",
    "officePhone": "+98-21-88880000",
    "website": "https://shasta.ir",
    "descriptionFa": "شرکت سرمایه‌گذاری تامین اجتماعی (شستا) بزرگ‌ترین هلدینگ چندرشته‌ای سرمایه‌گذاری در ایران است که هلدینگ‌های تخصصی تاپیکو (نفت و گاز)، تیپیکو (دارویی)، تاسیکو (صدر تامین - معدن)، سیتا (سیمان) و صبا تامین را تحت مدیریت دارد.",
    "descriptionEn": "Social Security Investment Company (SHASTA) is the largest multi-sector investment conglomerate in Iran, overseeing specialized holdings across energy (TAPPICO), mining, pharma, and cement.",
    "subsidiaries": [
      {
        "id": "tappico-ssic",
        "nameFa": "سرمایه‌گذاری نفت و گاز و پتروشیمی تامین (تاپیکو)",
        "nameEn": "TAPPICO Holding",
        "companyAbbrv": "TAPPICO",
        "tseSymbol": "تاپیکو",
        "industry": "نفت، گاز، پتروشیمی و پالایشگاه",
        "role": "هلدینگ ارشد انرژی شستا",
        "plantLocation": "سراسر کشور",
        "isCustomerOfEsp": true
      },
      {
        "id": "tipico-ssic",
        "nameFa": "سرمایه‌گذاری دارویی تامین (تیپیکو)",
        "nameEn": "TPICO Pharma Holding",
        "companyAbbrv": "TPICO",
        "tseSymbol": "تیپیکو",
        "industry": "داروسازی و مواد اولیه دارویی",
        "role": "بزرگترین هلدینگ دارویی کشور",
        "plantLocation": "تهران، البرز، تبریز و اصفهان"
      },
      {
        "id": "tasico-ssic",
        "nameFa": "سرمایه‌گذاری صدر تامین (تاصیکو)",
        "nameEn": "Sadr Tamin Mining Holding",
        "companyAbbrv": "TASICO",
        "tseSymbol": "تاصیکو",
        "industry": "معادن، طلا، فولاد و فلزات اساسی",
        "role": "هلدینگ معدنی شستا",
        "plantLocation": "معادن و صنایع معدنی کشور"
      },
      {
        "id": "sita-ssic",
        "nameFa": "سرمایه‌گذاری سیمان تامین (سیتا)",
        "nameEn": "Cement Tamin Holding",
        "companyAbbrv": "SITA",
        "tseSymbol": "سیتا",
        "industry": "سیمان، کلینکر و مصالح ساختمانی",
        "role": "بزرگترین تولیدکننده سیمان کشور",
        "plantLocation": "کارخانجات سیمان سراسر ایران"
      },
      {
        "id": "saba-tamin-ssic",
        "nameFa": "سرمایه‌گذاری صبا تامین",
        "nameEn": "Saba Tamin Investment",
        "companyAbbrv": "SABA TAMIN",
        "tseSymbol": "صبا",
        "industry": "بانکداری، بیمه، تامین سرمایه و کارگزاری",
        "role": "بازوی مالی و خدمات بازار سرمایه شستا",
        "plantLocation": "تهران"
      }
    ],
    "tags": [
      "شستا",
      "تامین اجتماعی",
      "تاپیکو",
      "چندرشته‌ای",
      "بورس"
    ]
  },
  {
    "id": "shiran",
    "excelId": 959,
    "nameFa": "شرکت سرمایه‌گذاری صنایع شیمیایی ایران (شیران)",
    "nameEn": "Iran Chemical Industries Investment Co.",
    "companyAbbrv": "MSC / ICIIC",
    "tseSymbol": "شِران",
    "codalUrl": "https://codal.ir/CompanyReports.aspx?symbol=شیران",
    "tsetmcUrl": "http://tsetmc.com/Loader.aspx?ParTree=151311&i=56891234567890123",
    "logoUrl": "/customers/logos/959.png",
    "establishedYear": 1363,
    "headquartersFa": "تهران، میدان آرژانتین، خیابان شهید احمد قصیر (بخارست)، خیابان دوازدهم، پلاک ۱۲",
    "officeAddressFa": "تهران، میدان آرژانتین، خیابان شهید احمد قصیر (بخارست)، خیابان دوازدهم، پلاک ۱۲",
    "officePhone": "+98-21-88730055",
    "website": "https://iciiclab.com",
    "descriptionFa": "شرکت سرمایه‌گذاری صنایع شیمیایی ایران (شیران) بزرگ‌ترین تولیدکننده آلکیل بنزن خطی (LAB) و نرمال پارافین در منطقه است که مواد اولیه صنایع بهداشتی و شوینده کشور را تامین می‌کند.",
    "descriptionEn": "Iran Chemical Industries Investment Co. (ICIIC / Shiran) is the principal producer of Linear Alkyl Benzene (LAB) and normal paraffin, providing vital feedstock for detergents and consumer chemicals.",
    "subsidiaries": [
      {
        "id": "shiran-isfahan-plant",
        "nameFa": "مجتمع شیمیایی اصفهان (واحد LAB)",
        "nameEn": "ICIIC Isfahan LAB Chemical Complex",
        "companyAbbrv": "Shiran Plant",
        "industry": "آلکیلاسیون و تفکیک پارافین",
        "role": "مرکز تولید آلکیل بنزن خطی و نرمال پارافین",
        "plantLocation": "اصفهان، کیلومتر ۱۰ جاده علویجه",
        "products": [
          "آلکیل بنزن خطی (LAB)",
          "نرمال پارافین",
          "آلکیلات سنگین (HAB)"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "shiran-bushehr-terminal",
        "nameFa": "پایانه و مخازن صادراتی بوشهر شیران",
        "nameEn": "Shiran Bushehr Maritime Export Terminal",
        "companyAbbrv": "Shiran Terminal",
        "industry": "انبارش مواد شیمیایی و پایانه صادرات دریایی",
        "role": "هاب صادرات فله LAB و محصولات به بازارهای هدف",
        "plantLocation": "بندر بوشهر، منطقه ویژه اقتصادی بندری",
        "products": [
          "صادرات دریایی LAB و مشتقات هیدروکربوری"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "شیران",
      "صنایع شیمیایی",
      "LAB",
      "نرمال پارافین",
      "بورس"
    ]
  },
  {
    "id": "sepehr-energy",
    "excelId": 987,
    "nameFa": "شرکت هلدینگ انرژی سپهر",
    "nameEn": "Sepehr Energy Co.",
    "companyAbbrv": "SEC",
    "logoUrl": "/customers/logos/987.png",
    "establishedYear": 1389,
    "headquartersFa": "سعادت آباد،خیابان دوم شهید عبقری،خیابان دوم شمالی،پلاک ۱۵",
    "officeAddressFa": "سعادت آباد،خیابان دوم شهید عبقری،خیابان دوم شمالی،پلاک ۱۵",
    "officePhone": "+98-21-72871000",
    "postalCode": "1998665855",
    "nationalIdNumber": "10320227890",
    "registrationNumber": "373450",
    "economicCode": "411369456593",
    "website": "https://sepehroil.com",
    "descriptionFa": "شرکت هلدینگ انرژی سپهر وابسته به گروه مالی سپهر صادرات (بانک صادرات ایران) مجری مگاپروژه‌های متانول و پتروشیمی از جمله پتروشیمی سبلان، دنا و سیراف انرژی در عسلویه است.",
    "descriptionEn": "Sepehr Energy Holding, backed by Bank Saderat's Sepehr Financial Group, executes mega-scale petrochemical and methanol developments including Sabalan, Dena, and Siraf Energy complexes in Assaluyeh.",
    "subsidiaries": [
      {
        "id": "sabalan-petro",
        "nameFa": "پتروشیمی سبلان",
        "nameEn": "Sabalan Petrochemical Co.",
        "companyAbbrv": "Sabalan",
        "industry": "متانول گرید پتروشیمی",
        "role": "مگاپروژه متانول فاز ۲ عسلویه",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۲",
        "products": [
          "متانول گرید AA (۱.۶۵ میلیون تن)"
        ],
        "isCustomerOfEsp": true,
        "plantId": "methanol-sabalan"
      },
      {
        "id": "dena-petro",
        "nameFa": "پتروشیمی دنا",
        "nameEn": "Dena Petrochemical Co.",
        "companyAbbrv": "Dena",
        "industry": "متانول گرید AA (فاز ۱ و ۲)",
        "role": "طرح متانول عسلویه فاز ۲",
        "plantLocation": "منطقه ویژه اقتصادی انرژی پارس - عسلویه فاز ۲",
        "products": [
          "متانول گرید AA"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "siraf-energy",
        "nameFa": "پتروشیمی سیراف انرژی",
        "nameEn": "Siraf Energy Petrochemical Co.",
        "companyAbbrv": "Siraf",
        "industry": "متانول و اسکله اختصاصی صادرات",
        "role": "طرح مگا متانول منطقه دیر",
        "plantLocation": "بندر دیر، بوشهر",
        "products": [
          "متانول گرید صادراتی"
        ],
        "isCustomerOfEsp": true
      },
      {
        "id": "lavan-petro",
        "nameFa": "پتروشیمی لاوان",
        "nameEn": "Lavan Chemical & Petrochemical Co.",
        "companyAbbrv": "Lavan",
        "industry": "اوره و آمونیاک جزیره لاوان",
        "role": "طرح تولید کود شیمیایی جزیره لاوان",
        "plantLocation": "جزیره لاوان، خلیج فارس",
        "products": [
          "اوره و آمونیاک"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "انرژی سپهر",
      "بانک صادرات",
      "متانول",
      "سبلان",
      "دنا",
      "سیراف"
    ]
  },
  {
    "id": "gubretas",
    "excelId": 212,
    "nameFa": "شرکت گوبره فابریکالاری ترک (گوبرتاش)",
    "nameEn": "GÜBRETAŞ (Gübre Fabrikaları T.A.Ş.)",
    "companyAbbrv": "GUBRETAS",
    "tseSymbol": "GUBRF",
    "logoUrl": "/customers/logos/212.png",
    "headquartersFa": "استانبول، ترکیه / مجتمع پتروشیمی رازی ماهشهر",
    "website": "https://www.gubretas.com.tr",
    "descriptionFa": "شرکت گوبرتاش ترکیه بزرگ‌ترین تولیدکننده کود شیمیایی در ترکیه و مالک سهام مدیریتی پتروشیمی رازی ماهشهر است.",
    "descriptionEn": "GÜBRETAŞ is Turkey's leading chemical fertilizer corporation and the primary shareholder of Razi Petrochemical Complex in Mahshahr.",
    "subsidiaries": [
      {
        "id": "razi-petro",
        "nameFa": "پتروشیمی رازی",
        "nameEn": "Razi Petrochemical Co.",
        "companyAbbrv": "RPC",
        "tseSymbol": "رازی",
        "industry": "کودهای شیمیایی، آمونیاک، اوره و اسید فسفریک",
        "role": "بزرگترین مجتمع تولید کودهای ازته و فسفاته خاورمیانه",
        "plantLocation": "منطقه ویژه اقتصادی پتروشیمی ماهشهر",
        "products": [
          "آمونیاک",
          "اوره گرانول",
          "اسید فسفریک",
          "اسید سولفوریک",
          "کود دی‌آمونیوم فسفات (DAP)",
          "گوگرد گرانول"
        ],
        "isCustomerOfEsp": true,
        "plantId": "fertilizer-razi"
      },
      {
        "id": "gubretas-logistics",
        "nameFa": "پایانه دریایی و لجستیک صادراتی رازی",
        "nameEn": "Razi Maritime Terminal & Logistics",
        "companyAbbrv": "Razi Terminal",
        "industry": "حمل و نقل دریایی محصولات شیمیایی و گاز آمونیاک",
        "role": "اسکله اختصاصی و ناوگان حمل آمونیاک به ترکیه",
        "plantLocation": "بندر امام خمینی، ماهشهر",
        "products": [
          "انبارش گوگرد",
          "بارگیری کشتی‌های مخزن‌دار آمونیاک"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "گوبرتاش",
      "ترکیه",
      "رازی",
      "کود شیمیایی",
      "آمونیاک"
    ]
  },
  {
    "id": "petro-techna",
    "excelId": 787,
    "nameFa": "شرکت پترو تکنا",
    "nameEn": "Petro Techna Co.",
    "companyAbbrv": "PTC",
    "logoUrl": "/customers/logos/787.png",
    "postalCode": "1937743911",
    "nationalIdNumber": "10861205693",
    "registrationNumber": "2814",
    "economicCode": "0",
    "descriptionFa": "شرکت پترو تکنا در زمینه مهندسی، مشاوره، تدارکات و احداث تجهیزات فرآیندی سطح‌الارضی نفت و گاز و تفکیک‌کننده‌ها فعالیت می‌نماید.",
    "descriptionEn": "Petro Techna provides specialized engineering, procurement, and process package solutions for surface oil, gas, and separation systems.",
    "subsidiaries": [
      {
        "id": "petro-techna-eng",
        "nameFa": "مهندسی فرآیند پترو تکنا",
        "nameEn": "Petro Techna Process Engineering",
        "companyAbbrv": "PTC Eng",
        "industry": "مهندسی بسته‌های فرآیندی و مخازن نفت و گاز",
        "role": "طراحی و ساخت پکیج‌های فرآیندی اسکیدماونت",
        "plantLocation": "تهران و کارگاه‌های ساخت تجهیزات فرآیندی",
        "products": [
          "تفکیک‌کننده‌های دوفازی و سه‌فازی نفت و گاز",
          "سیستم‌های فیلتراسیون",
          "اسکیدهای تزریق مواد شیمیایی"
        ],
        "isCustomerOfEsp": true
      }
    ],
    "tags": [
      "پترو تکنا",
      "مهندسی نفت",
      "تجهیزات فرآیندی"
    ]
  }
];
