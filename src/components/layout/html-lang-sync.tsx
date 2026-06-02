// src/components/layout/html-lang-sync.tsx
'use client';

import { useEffect } from 'react';

// Because <html> now lives in the stable root layout, a soft locale switch
// won't re-run the root JSX. This effect keeps lang/dir in sync on the client.
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  return null;
}
