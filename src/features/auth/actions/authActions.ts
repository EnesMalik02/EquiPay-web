"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api`;

/* ── Helper: parse and forward Set-Cookie from backend ──────── */
async function forwardCookies(res: Response) {
    const cookieStore = await cookies();
    res.headers.getSetCookie().forEach((raw) => {
        const parts = raw.split(";").map((s) => s.trim());
        const [nameVal, ...attrs] = parts;
        const eqIdx = nameVal.indexOf("=");
        const name  = nameVal.slice(0, eqIdx);
        const value = nameVal.slice(eqIdx + 1);

        const options: Parameters<typeof cookieStore.set>[2] = { path: "/" };
        attrs.forEach((attr) => {
            const lower = attr.toLowerCase();
            if (lower === "httponly")          options.httpOnly = true;
            else if (lower === "secure")       options.secure   = true;
            else if (lower.startsWith("max-age="))
                options.maxAge = parseInt(attr.split("=")[1], 10);
            else if (lower.startsWith("path="))
                options.path = attr.split("=")[1];
            else if (lower.startsWith("samesite="))
                options.sameSite = attr.split("=")[1].toLowerCase() as "lax" | "strict" | "none";
        });

        cookieStore.set(name, value, options);
    });
}

/* ── Login ──────────────────────────────────────────────────── */
export async function loginAction(
    phone: string,
): Promise<{ error: string } | void> {
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-platform": "web" },
            body: JSON.stringify({ phone }),
            cache: "no-store",
        });
    } catch {
        return { error: "Sunucuya bağlanılamadı." };
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body?.detail;
        if (Array.isArray(detail)) {
            return { error: detail.map((d: unknown) => (typeof d === "object" && d !== null && "msg" in d ? (d as { msg: string }).msg : String(d))).join(", ") };
        }
        return { error: (detail as string | undefined) ?? "Giriş yapılırken bir hata oluştu." };
    }

    await forwardCookies(res);
    redirect("/home");
}

/* ── Register ───────────────────────────────────────────────── */
export async function registerAction(
    username: string,
    phone: string,
): Promise<{ error: string } | void> {
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-platform": "web" },
            body: JSON.stringify({ username, phone }),
            cache: "no-store",
        });
    } catch {
        return { error: "Sunucuya bağlanılamadı." };
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body?.detail;
        if (Array.isArray(detail)) {
            return { error: detail.map((d: unknown) => (typeof d === "object" && d !== null && "msg" in d ? (d as { msg: string }).msg : String(d))).join(", ") };
        }
        return { error: (detail as string | undefined) ?? "Kayıt olurken bir hata oluştu." };
    }

    await forwardCookies(res);
    redirect("/home");
}

/* ── Logout ─────────────────────────────────────────────────── */
export async function logoutAction(): Promise<void> {
    const cookieStore = await cookies();

    // Best-effort: tell backend to invalidate tokens
    try {
        const accessToken  = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;
        const cookieParts  = [
            accessToken  ? `access_token=${accessToken}`   : null,
            refreshToken ? `refresh_token=${refreshToken}` : null,
        ].filter(Boolean).join("; ");

        await fetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-platform": "web",
                ...(cookieParts ? { Cookie: cookieParts } : {}),
            },
            cache: "no-store",
        });
    } catch {
        /* ignore */
    }

    cookieStore.set("access_token",  "", { maxAge: 0, path: "/" });
    cookieStore.set("refresh_token", "", { maxAge: 0, path: "/" });

    redirect("/auth/login");
}
