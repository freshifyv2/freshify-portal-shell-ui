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

export interface SessionClaims {
  userId: string;
  email: string;
  displayName: string;
  companyId: string | null;
  companyName: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  roles: Array<{ layer: string; scopeId: string | null; role: string }>;
  operator?: { operatorId: string; reason: string } | null;
  exp?: number;
  iat?: number;
}

export function readSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export function readActiveTenant(): string | null {
  return cookies().get(ACTIVE_TENANT_COOKIE)?.value ?? null;
}

export function decodeClaims(token: string): SessionClaims | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionClaims;
  } catch {
    return null;
  }
}
