/**
 * Shared helper to populate Chrome's tenant-switcher props.
 *
 * For operators, fetches the full company list from companies-be.
 * For non-operators, returns an empty options array — the switcher
 * renders disabled and shows the user's own company.
 *
 * The active tenant override comes from the sp_active_tenant cookie
 * (set by /api/admin/active-tenant on the users-fe). If a non-operator
 * has a cookie set (which shouldn't happen — the endpoint rejects them),
 * we still ignore it here as a defensive measure.
 */
import { readSessionToken, readActiveTenant } from "./session";
import { decodeJwt } from "./jwt";
const COMPANIES_URL = process.env.COMPANIES_SERVICE_URL ||
    "https://freshify-companies-sbzaekoo4q-uc.a.run.app";
export async function loadChromeContext() {
    const token = readSessionToken();
    if (!token)
        return null;
    const claims = decodeJwt(token);
    if (!claims)
        return null;
    const isOperator = Boolean(claims.operator);
    const activeTenantId = readActiveTenant();
    let activeCompany = null;
    let tenantOptions = [];
    let effectiveCompanyId = null;
    if (isOperator) {
        // Try to load the full company list. Fail-soft: if BE is down, render
        // with no options and let the user retry.
        try {
            const res = await fetch(`${COMPANIES_URL}/v1/companies`, {
                headers: { authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            if (res.ok) {
                const body = (await res.json());
                tenantOptions = (body.companies ?? []).map((c) => ({
                    companyId: c.companyId,
                    name: c.name,
                }));
            }
        }
        catch {
            tenantOptions = [];
        }
        if (activeTenantId) {
            const match = tenantOptions.find((c) => c.companyId === activeTenantId);
            activeCompany = match ? { companyId: match.companyId, name: match.name } : null;
            effectiveCompanyId = activeTenantId;
        }
        else {
            activeCompany = null; // "All Companies"
            effectiveCompanyId = null;
        }
    }
    else {
        // Non-operator: locked to own company
        if (claims.companyId && claims.companyName) {
            activeCompany = { companyId: claims.companyId, name: claims.companyName };
            effectiveCompanyId = claims.companyId;
        }
        tenantOptions = [];
    }
    const displayName = claims.displayName || claims.email || "there";
    const handle = (() => {
        const e = claims.email;
        if (!e)
            return "user";
        // Synthetic phone-only users: `phone+<E164>@users.freshify.io` → render E.164.
        const phoneMatch = e.match(/^phone\+?(\+?\d+)/);
        if (phoneMatch)
            return `+${phoneMatch[1].replace(/[^0-9]/g, "")}`;
        if (e.startsWith("+"))
            return e;
        return e.split("@")[0] || e;
    })();
    return {
        token,
        user: {
            userId: claims.userId,
            displayName,
            handle,
            isOperator,
        },
        activeCompany,
        tenantOptions,
        effectiveCompanyId,
    };
}
