import { NotFoundPage } from '@/components/layout/not-found-page';

// Locale-aware 404. Rendered inside [locale]/layout, so no <html>/<body> here.
export default function LocaleNotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer { display: none !important; }
      `}} />
      <NotFoundPage />
    </>
  );
}
