/**
 * Session cookie helpers (read-only) used by the shell.
 *
 * Each consuming repo keeps its own `lib/session.ts` for write helpers
 * (login set, logout clear) and any repo-specific helpers like requireToken.
 * Only the read paths needed by Chrome / chromeContext live here.
 */
import { cookies } from "next/headers";
export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sp_session";
export const ACTIVE_TENANT_COOKIE = "sp_active_tenant";
export function readSessionToken() {
    return cookies().get(SESSION_COOKIE)?.value ?? null;
}
export function readActiveTenant() {
    return cookies().get(ACTIVE_TENANT_COOKIE)?.value ?? null;
}
export function decodeClaims(token) {
    try {
        const [, payload] = token.split(".");
        if (!payload)
            return null;
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    }
    catch {
        return null;
    }
}
