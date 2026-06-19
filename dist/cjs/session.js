"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_TENANT_COOKIE = exports.SESSION_COOKIE = void 0;
exports.readSessionToken = readSessionToken;
exports.readActiveTenant = readActiveTenant;
exports.decodeClaims = decodeClaims;
/**
 * Session cookie helpers (read-only) used by the shell.
 *
 * Each consuming repo keeps its own `lib/session.ts` for write helpers
 * (login set, logout clear) and any repo-specific helpers like requireToken.
 * Only the read paths needed by Chrome / chromeContext live here.
 */
const headers_1 = require("next/headers");
exports.SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sp_session";
exports.ACTIVE_TENANT_COOKIE = "sp_active_tenant";
function readSessionToken() {
    return (0, headers_1.cookies)().get(exports.SESSION_COOKIE)?.value ?? null;
}
function readActiveTenant() {
    return (0, headers_1.cookies)().get(exports.ACTIVE_TENANT_COOKIE)?.value ?? null;
}
function decodeClaims(token) {
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
