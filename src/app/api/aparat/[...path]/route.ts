// src/app/api/aparat/[...path]/route.ts
//
// مزیت‌های این route نسبت به rewrite ساده در next.config.ts:
//
//  1. Server-side Data Cache — Next.js پاسخ را به‌اشتراک بین همه کاربران cache
//     می‌کند. اگر ۱۰۰۰ کاربر همزمان کانال را باز کنند، فقط یک بار به Aparat
//     درخواست می‌رود.
//
//  2. TTL هوشمند — profile/categories مدت بیشتری valid هستند تا لیست ویدئو.
//
//  3. Timeout — rewrite ساده timeout ندارد؛ اینجا بعد از REQUEST_TIMEOUT
//     به‌صورت خودکار لغو می‌شود.
//
//  4. پاسخ‌های خطا — rewrite هر پاسخ را بدون بررسی forward می‌کند؛ اینجا
//     status های ۵xx را به کاربر با پیام واضح برمی‌گردانیم.

import { type NextRequest, NextResponse } from "next/server";

const APARAT_API_BASE = "https://www.aparat.com/etc/api";
const REQUEST_TIMEOUT_MS = 10_000; // 10 ثانیه

/**
 * مدت cache بر حسب نوع endpoint (ثانیه).
 * profile و video metadata به‌ندرت عوض می‌شوند؛ لیست ویدئو بیشتر.
 */
function revalidateSeconds(apiPath: string): number {
  if (apiPath.startsWith("profile/")) return 3_600; // ۱ ساعت
  if (apiPath.startsWith("profilecategories/")) return 1_800; // ۳۰ دقیقه
  if (apiPath.startsWith("video/videohash/")) return 3_600; // ۱ ساعت
  return 300; // ۵ دقیقه (لیست ویدئو)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const upstreamUrl = `${APARAT_API_BASE}/${apiPath}`;
  const ttl = revalidateSeconds(apiPath);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      // Next.js Data Cache: اشتراک نتیجه بین همه request‌ها تا مدت ttl
      next: { revalidate: ttl },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const isTimeout =
      err instanceof DOMException &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      {
        error: isTimeout
          ? "درخواست به Aparat timeout شد"
          : "خطا در اتصال به Aparat",
      },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Aparat پاسخ ${upstream.status} برگرداند` },
      { status: upstream.status >= 500 ? 502 : upstream.status },
    );
  }

  const data: unknown = await upstream.json();

  return NextResponse.json(data, {
    headers: {
      // مرورگر هم به‌مدت ttl کش می‌کند، بعد stale-while-revalidate دوبرابر
      "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
    },
  });
}
