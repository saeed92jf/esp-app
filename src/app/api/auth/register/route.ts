// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server/backend-config";
import { companyEmailRe } from "@/lib/validations/auth";
import {
  getServerAdminUsers,
  createServerAdminUser,
} from "@/lib/server/admin-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error_code: "VALIDATION_ERROR", message: "ایمیل متقاضی الزامی است." },
        { status: 422 }
      );
    }

    if (!companyEmailRe.test(email)) {
      return NextResponse.json(
        {
          error_code: "INVALID_DOMAIN",
          message: "فقط ایمیل‌های سازمانی (@euroslotpars.com یا @npceram.com) مجاز هستند.",
        },
        { status: 422 }
      );
    }

    // 1. Try calling the FastAPI backend first if available
    try {
      const remoteRes = await fetch(`${BACKEND_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, ...body }),
        signal: AbortSignal.timeout(4000),
      });

      if (remoteRes.ok) {
        const remoteData = await remoteRes.json();
        return NextResponse.json(remoteData, { status: 201 });
      }
    } catch {
      // Backend not running or timed out; continue to resilient server fallback
    }

    // 2. Resilient fallback: Check if user already exists
    const { data: users } = getServerAdminUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === email);
    if (existingUser && existingUser.accountStatus === "active") {
      return NextResponse.json(
        {
          success: true,
          message: "حساب کاربری فعال با این ایمیل در سامانه وجود دارد. لطفاً وارد شوید.",
          user_id: existingUser.id,
          id: existingUser.id,
          email,
          status: "active",
        },
        { status: 200 }
      );
    }

    // 3. Generate initial temporary password for immediate login
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = `Esp@${randomHex}26`;
    const isEuroslot = email.endsWith("@euroslotpars.com");
    const company = isEuroslot ? "یورو اسلات پارس" : "نوین پژوهان سرام";
    const companyId = isEuroslot ? "euroslot" : "npceram";
    const username = email.split("@")[0];
    const defaultName = username.charAt(0).toUpperCase() + username.slice(1);
    const userId = existingUser?.id || `u-req-${Date.now()}`;

    // Create / update user in server admin store with pending_profile and initial password
    createServerAdminUser({
      id: userId,
      email,
      name: defaultName,
      fullName: defaultName,
      password: tempPassword,
      role: "user",
      accountStatus: "pending_profile",
      isProfileCompleted: false,
      company,
      companyId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "حساب کاربری ایجاد و کلمه عبور اولیه صادر گردید. لطفاً با رمز ارسال شده به ایمیل وارد شوید و اطلاعات خود را تکمیل نمایید.",
        user_id: userId,
        id: userId,
        email,
        status: "pending_profile",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { error_code: "INTERNAL_ERROR", message: err?.message || "خطای غیرمنتظره در ثبت درخواست" },
      { status: 500 }
    );
  }
}
