const fs = require('fs');

const ocr = fs.readFileSync('pdf-ocr.txt', 'utf-8');
const lines = ocr.split('\n').map(l => l.trim()).filter(Boolean);

const monthMap = {
  'فروردین': '01',
  'اردیبهشت': '02',
  'خرداد': '03',
  'تیر': '04',
  'مرداد': '05',
  'شهریور': '06',
  'مهر': '07',
  'آبان': '08',
  'آذر': '09',
  'دی': '10',
  'بهمن': '11',
  'اسفند': '12'
};

const events = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find date
  const dateMatch = line.match(/(?:(\d+)\s+تا\s+)?(\d+)\s+([آ-ی]+)/);
  if (dateMatch) {
    const startDay = dateMatch[1] || dateMatch[2];
    const monthStr = dateMatch[3];
    const month = monthMap[monthStr];
    
    if (month) {
      let title = "";
      
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.startsWith('مجری:') || nextLine.match(/(?:(\d+)\s+تا\s+)?(\d+)\s+([آ-ی]+)/)) {
          break;
        }
        
        let cleaned = nextLine;
        if (cleaned === 'برگزار شده') continue;
        if (cleaned.match(/^\d+\s+روز دیگر$/)) continue;
        
        cleaned = cleaned.replace(/^برگزار شده\s+/, '');
        cleaned = cleaned.replace(/^\d+\s+روز دیگر\s+/, '');
        
        title += (title ? " " : "") + cleaned;
      }
      
      if (line.includes('برگزار شده')) {
         const m = line.match(/برگزار شده\s+(.+)/);
         if (m) title = m[1];
      }
      
      const formattedDay = startDay.padStart(2, '0');
      events.push({
        id: `fair-1405-${month}-${formattedDay}`,
        title: title.trim(),
        date: `1405-${month}-${formattedDay}`,
        type: 'fair'
      });
    }
  }
}

fs.writeFileSync('parsed-events.json', JSON.stringify(events, null, 2), 'utf-8');
console.log('Parsed', events.length, 'events');
