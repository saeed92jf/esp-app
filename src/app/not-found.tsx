// src/app/not-found.tsx
// Root-level 404. This file is OUTSIDE the [locale] layout, so next-intl's
// IntlProvider is NOT available here. We use plain static text.
// Locale-aware 404s are handled by src/app/[locale]/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            display: "grid",
            minHeight: "100dvh",
            placeItems: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404</h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              The page you are looking for could not be found.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "1rem",
                color: "#3b82f6",
                textDecoration: "none",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
