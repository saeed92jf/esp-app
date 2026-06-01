import '@/app/globals.css'; // adjust to your global CSS path

// Global fallback for requests that don't match any locale segment.
// It has no parent layout, so it must render <html>/<body> itself.
export default function GlobalNotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body className="grid min-h-dvh place-items-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">صفحه پیدا نشد</p>
          <a
            href="/"
            className="text-primary mt-4 inline-block hover:underline"
          >
            بازگشت به خانه
          </a>
        </div>
      </body>
    </html>
  );
}
