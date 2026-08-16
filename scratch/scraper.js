const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const monthMap = {
  'فروردین': 1, 'اردیبهشت': 2, 'خرداد': 3, 'تیر': 4, 'مرداد': 5, 'شهریور': 6,
  'مهر': 7, 'آبان': 8, 'آذر': 9, 'دی': 10, 'بهمن': 11, 'اسفند': 12
};

async function parseIranfair() {
  const html = fs.readFileSync('iranfair.html', 'utf8');
  const $ = cheerio.load(html);
  const events = [];
  $('a[title]').each((i, el) => {
    const title = $(el).attr('title');
    const href = $(el).attr('href');
    if(title && href && href.includes('/companies/index')) {
      const parent = $(el).parent().parent();
      const dateEl = parent.find('.date');
      let dateStr = '';
      if(dateEl.length) {
        const days = dateEl.find('.day').map((i, e) => $(e).text().trim()).get();
        const months = dateEl.find('.month').map((i, e) => $(e).text().trim()).get();
        if(days.length > 0 && months.length > 0) {
           const d = days[0].padStart(2, '0');
           const m = String(monthMap[months[0]] || 1).padStart(2, '0');
           dateStr = `1403-${m}-${d}`;
        }
      }
      events.push({
        id: `fair-${i}`,
        title: 'نمایشگاه: ' + title,
        date: dateStr,
        type: 'event'
      });
    }
  });
  return events.filter(e => e.date);
}

function getHolidays() {
  const hols = [
    { title: 'عید نوروز', date: '01-01' },
    { title: 'عید نوروز', date: '01-02' },
    { title: 'عید نوروز', date: '01-03' },
    { title: 'عید نوروز', date: '01-04' },
    { title: 'روز جمهوری اسلامی', date: '01-12' },
    { title: 'روز طبیعت', date: '01-13' },
    { title: 'عید سعید فطر', date: '01-22' },
    { title: 'تعطیل به مناسبت عید فطر', date: '01-23' },
    { title: 'شهادت امام جعفر صادق (ع)', date: '02-15' },
    { title: 'رحلت امام خمینی (ره)', date: '03-14' },
    { title: 'قیام ۱۵ خرداد', date: '03-15' },
    { title: 'عید سعید قربان', date: '03-28' },
    { title: 'عید سعید غدیر خم', date: '04-05' },
    { title: 'تاسوعای حسینی', date: '04-25' },
    { title: 'عاشورای حسینی', date: '04-26' },
    { title: 'اربعین حسینی', date: '06-04' },
    { title: 'رحلت پیامبر اکرم (ص) و شهادت امام حسن مجتبی (ع)', date: '06-12' },
    { title: 'شهادت امام رضا (ع)', date: '06-14' },
    { title: 'شهادت امام حسن عسکری (ع)', date: '06-22' },
    { title: 'میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)', date: '06-31' },
    { title: 'شهادت حضرت فاطمه زهرا (س)', date: '09-15' },
    { title: 'ولادت امام علی (ع) و روز پدر', date: '10-25' },
    { title: 'مبعث پیامبر اکرم (ص)', date: '11-09' },
    { title: 'ولادت حضرت مهدی (عج) و نیمه شعبان', date: '11-26' },
    { title: 'روز ملی شدن صنعت نفت', date: '12-29' }
  ];
  const results = [];
  hols.forEach((h, i) => {
    results.push({ id: `hol-1403-${i}`, title: h.title, date: `1403-${h.date}`, type: 'deadline' });
    results.push({ id: `hol-1404-${i}`, title: h.title, date: `1404-${h.date}`, type: 'deadline' });
  });
  return results;
}

async function run() {
  const fairs = await parseIranfair();
  const holidays = getHolidays();
  const all = [...fairs, ...holidays];
  fs.writeFileSync('events.json', JSON.stringify(all, null, 2));
  console.log('Done, total events:', all.length);
}
run();
