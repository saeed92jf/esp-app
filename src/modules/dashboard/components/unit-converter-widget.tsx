'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRightLeft, Scale, Ruler, Thermometer, Gauge, Activity, ChevronLeft, ChevronRight, Grid, Box, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox } from "@/components/ui/combobox";
import { motion, AnimatePresence } from 'framer-motion';

const CONVERTER_CATEGORIES = [
  { id: 'length', icon: Ruler, labelEn: 'Length', labelFa: 'طول' },
  { id: 'mass', icon: Scale, labelEn: 'Mass/Weight', labelFa: 'وزن/جرم' },
  { id: 'temperature', icon: Thermometer, labelEn: 'Temperature', labelFa: 'دما' },
  { id: 'pressure', icon: Gauge, labelEn: 'Pressure', labelFa: 'فشار' },
  { id: 'force', icon: Activity, labelEn: 'Force', labelFa: 'نیرو' },
  { id: 'area', icon: Grid, labelEn: 'Area', labelFa: 'مساحت' },
  { id: 'volume', icon: Box, labelEn: 'Volume', labelFa: 'حجم' },
  { id: 'speed', icon: Zap, labelEn: 'Speed', labelFa: 'سرعت' },
];

const UNITS: Record<string, { id: string; labelEn: string; labelFa: string; toBase: (val: number) => number; fromBase: (val: number) => number }[]> = {
  length: [ // base: meter
    { id: 'm', labelEn: 'Meter (m)', labelFa: 'متر (m)', toBase: v => v, fromBase: v => v },
    { id: 'cm', labelEn: 'Centimeter (cm)', labelFa: 'سانتی‌متر (cm)', toBase: v => v / 100, fromBase: v => v * 100 },
    { id: 'mm', labelEn: 'Millimeter (mm)', labelFa: 'میلی‌متر (mm)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { id: 'km', labelEn: 'Kilometer (km)', labelFa: 'کیلومتر (km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'in', labelEn: 'Inch (in)', labelFa: 'اینچ (in)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { id: 'ft', labelEn: 'Foot (ft)', labelFa: 'فوت (ft)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { id: 'yd', labelEn: 'Yard (yd)', labelFa: 'یارد (yd)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { id: 'mi', labelEn: 'Mile (mi)', labelFa: 'مایل (mi)', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
  ],
  mass: [ // base: kg
    { id: 'kg', labelEn: 'Kilogram (kg)', labelFa: 'کیلوگرم (kg)', toBase: v => v, fromBase: v => v },
    { id: 'g', labelEn: 'Gram (g)', labelFa: 'گرم (g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { id: 'mg', labelEn: 'Milligram (mg)', labelFa: 'میلی‌گرم (mg)', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
    { id: 'ton', labelEn: 'Ton (t)', labelFa: 'تن (t)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'lb', labelEn: 'Pound (lb)', labelFa: 'پوند (lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    { id: 'oz', labelEn: 'Ounce (oz)', labelFa: 'اونس (oz)', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
  ],
  temperature: [ // base: Celsius
    { id: 'c', labelEn: 'Celsius (°C)', labelFa: 'سلسیوس (°C)', toBase: v => v, fromBase: v => v },
    { id: 'f', labelEn: 'Fahrenheit (°F)', labelFa: 'فارنهایت (°F)', toBase: v => (v - 32) * 5/9, fromBase: v => (v * 9/5) + 32 },
    { id: 'k', labelEn: 'Kelvin (K)', labelFa: 'کلوین (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    { id: 'r', labelEn: 'Rankine (°R)', labelFa: 'رانکین (°R)', toBase: v => (v - 491.67) * 5/9, fromBase: v => (v * 9/5) + 491.67 },
  ],
  pressure: [ // base: Pascal
    { id: 'pa', labelEn: 'Pascal (Pa)', labelFa: 'پاسکال (Pa)', toBase: v => v, fromBase: v => v },
    { id: 'bar', labelEn: 'Bar (bar)', labelFa: 'بار (bar)', toBase: v => v * 100000, fromBase: v => v / 100000 },
    { id: 'atm', labelEn: 'Atmosphere (atm)', labelFa: 'اتمسفر (atm)', toBase: v => v * 101325, fromBase: v => v / 101325 },
    { id: 'psi', labelEn: 'PSI (psi)', labelFa: 'پوند بر اینچ مربع (psi)', toBase: v => v * 6894.76, fromBase: v => v / 6894.76 },
    { id: 'mmhg', labelEn: 'mmHg', labelFa: 'میلی‌متر جیوه (mmHg)', toBase: v => v * 133.322, fromBase: v => v / 133.322 },
  ],
  force: [ // base: Newton
    { id: 'n', labelEn: 'Newton (N)', labelFa: 'نیوتن (N)', toBase: v => v, fromBase: v => v },
    { id: 'kn', labelEn: 'Kilonewton (kN)', labelFa: 'کیلونوتن (kN)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'kgf', labelEn: 'Kilogram-force (kgf)', labelFa: 'کیلوگرم‌نیرو (kgf)', toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
    { id: 'lbf', labelEn: 'Pound-force (lbf)', labelFa: 'پوندنیرو (lbf)', toBase: v => v * 4.44822, fromBase: v => v / 4.44822 },
  ],
  area: [ // base: m2
    { id: 'm2', labelEn: 'Square Meter (m²)', labelFa: 'مترمربع (m²)', toBase: v => v, fromBase: v => v },
    { id: 'ha', labelEn: 'Hectare (ha)', labelFa: 'هکتار (ha)', toBase: v => v * 10000, fromBase: v => v / 10000 },
    { id: 'km2', labelEn: 'Sq Kilometer (km²)', labelFa: 'کیلومترمربع (km²)', toBase: v => v * 1000000, fromBase: v => v / 1000000 },
    { id: 'sqft', labelEn: 'Square Foot (ft²)', labelFa: 'فوت‌مربع (ft²)', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    { id: 'acre', labelEn: 'Acre (ac)', labelFa: 'ایکر (ac)', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
  ],
  volume: [ // base: L
    { id: 'l', labelEn: 'Liter (L)', labelFa: 'لیتر (L)', toBase: v => v, fromBase: v => v },
    { id: 'ml', labelEn: 'Milliliter (mL)', labelFa: 'میلی‌لیتر (mL)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { id: 'm3', labelEn: 'Cubic Meter (m³)', labelFa: 'مترمکعب (m³)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'gal', labelEn: 'Gallon (gal)', labelFa: 'گالن (gal)', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    { id: 'bbl', labelEn: 'Barrel (bbl)', labelFa: 'بشکه (bbl)', toBase: v => v * 158.987, fromBase: v => v / 158.987 },
  ],
  speed: [ // base: m/s
    { id: 'ms', labelEn: 'Meter/Second (m/s)', labelFa: 'متر بر ثانیه (m/s)', toBase: v => v, fromBase: v => v },
    { id: 'kmh', labelEn: 'Km/Hour (km/h)', labelFa: 'کیلومتر بر ساعت (km/h)', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { id: 'mph', labelEn: 'Miles/Hour (mph)', labelFa: 'مایل بر ساعت (mph)', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { id: 'knot', labelEn: 'Knot (kn)', labelFa: 'نات (kn)', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
  ],
};

export function UnitConverterWidget() {
  const locale = useLocale();
  const isFa = locale === 'fa';
  
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [unitFrom, setUnitFrom] = React.useState('m');
  const [valueFrom, setValueFrom] = React.useState('150');

  // When category changes, reset units
  React.useEffect(() => {
    if (!activeCategory) return;
    const cats = UNITS[activeCategory];
    if (cats && cats.length > 0) {
      setUnitFrom(cats[0].id);
      setValueFrom('150');
    }
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-full bg-panel dark:bg-card/40 rounded-2xl rounded-br-none border border-border/50 overflow-hidden relative transition-all duration-300 p-3 sm:p-4 @container">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-4 shrink-0 border-b border-border/40 pb-3">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <ArrowRightLeft className="size-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground/80 shrink-0">
          {isFa ? "مبدل واحد" : "Unit Converter"}
        </h3>
      </div>

      <div className="flex flex-col flex-1 gap-4 overflow-hidden relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {!activeCategory ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 @[380px]:grid-cols-3 @[600px]:grid-cols-4 gap-2 h-full overflow-y-auto custom-scrollbar pe-1 pb-2 content-start"
            >
              {CONVERTER_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-card border border-border/40 hover:border-primary/40 transition-colors shadow-xs group"
                  >
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-foreground/80 group-hover:text-primary transition-colors text-center line-clamp-1">
                      {isFa ? cat.labelFa : cat.labelEn}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="converter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col @[540px]:flex-row gap-3 flex-1 overflow-hidden relative h-full"
            >
              {/* Top Bar with Back Button */}
              <div className="flex items-center gap-2 shrink-0 px-1 @[540px]:hidden">
                <button 
                  onClick={() => setActiveCategory(null)} 
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-transparent hover:border-border/40"
                >
                  {isFa ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </button>
                <span className="font-semibold text-sm text-foreground/90">
                  {isFa ? CONVERTER_CATEGORIES.find(c => c.id === activeCategory)?.labelFa : CONVERTER_CATEGORIES.find(c => c.id === activeCategory)?.labelEn}
                </span>
              </div>
          
              {/* Primary Input Card */}
              <div className="flex flex-col p-3.5 bg-primary text-primary-foreground rounded-xl relative shadow-sm shrink-0 border border-transparent @[540px]:w-[240px]" dir="ltr">
                <div className="flex items-center justify-between mb-3">
                  {/* Icon of the category */}
                  {(() => {
                    const CatIcon = CONVERTER_CATEGORIES.find(c => c.id === activeCategory)?.icon || ArrowRightLeft;
                    return <CatIcon className="size-5 text-white/90" />;
                  })()}
                  <div dir={isFa ? 'rtl' : 'ltr'}>
                    <Combobox
                      options={UNITS[activeCategory]?.map(u => ({ value: u.id, label: isFa ? u.labelFa : u.labelEn })) || []}
                      value={unitFrom}
                      onChange={(val) => setUnitFrom(val)}
                      className="h-8 bg-white/10 border-transparent shadow-none text-xs font-medium text-white hover:bg-white/20 hover:text-white w-[130px] rounded-lg"
                      showSearch={false}
                    />
                  </div>
                </div>
                
                {(() => {
                  const activeUnitDef = UNITS[activeCategory]?.find(u => u.id === unitFrom);
                  const activeSymbol = activeUnitDef?.labelEn.match(/\(([^)]+)\)/)?.[1] || '';
                  return (
                    <div className="relative w-full flex items-baseline border-b border-white/20 focus-within:border-white transition-colors pb-1.5">
                      <input 
                        type="number"
                        value={valueFrom}
                        onChange={(e) => setValueFrom(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent outline-none text-[30px] font-bold fa-num text-white p-0 m-0 placeholder:text-white/30 text-left tracking-tight"
                        placeholder="0"
                        dir="ltr"
                      />
                      <span className="text-lg font-semibold text-white/80 ms-2 select-none" dir="ltr">
                        {activeSymbol}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* List of converted units */}
              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pe-1 pb-2 flex-1 mt-1">
                {(() => {
                  const val = parseFloat(valueFrom);
                  const activeUnitDef = UNITS[activeCategory]?.find(u => u.id === unitFrom);
                  const isValValid = !isNaN(val) && activeUnitDef;
                  const baseVal = isValValid ? activeUnitDef.toBase(val) : 0;

                  return UNITS[activeCategory]?.filter(u => u.id !== unitFrom).map(u => {
                    const converted = isValValid ? u.fromBase(baseVal) : 0;
                    const displayVal = valueFrom === '' ? '' : (Number.isInteger(converted) ? converted.toString() : converted.toFixed(2).replace(/\.?0+$/, ''));
                    
                    return (
                      <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white dark:bg-card border border-border/40 shadow-xs hover:border-primary/30 transition-colors" dir="ltr">
                        <span className="text-sm font-bold fa-num text-foreground/90 tracking-tight text-left">
                          {displayVal || '-'}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground/90 text-right" dir={isFa ? 'rtl' : 'ltr'}>
                          {isFa ? u.labelFa : u.labelEn}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
