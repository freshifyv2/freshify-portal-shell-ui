/**
 * Shared helper to populate Chrome's tenant-switcher props.
 *
 * For operators, fetches the full company list from companies-be so they
 * can switch into any tenant. For non-operators, returns an empty options
 * array — the switcher renders disabled and shows the user's own company.
 *
 * Active tenant is derived from the JWT (`claims.companyId`), which is the
 * sovereign source of truth. The switcher swaps the JWT via
 * /api/admin/active-tenant → users-be /v1/session/select. There is no
 * client-only cookie; scope must be in the token so every BE call filters
 * correctly.
 */
import { readSessionToken } from "./session";
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
    // Scope is the JWT's companyId. For operators, null = "All Companies"
    // (aggregate view). For non-operators, it's their permanent tenant.
    const scopedCompanyId = claims.companyId ?? null;
    const scopedCompanyName = claims.companyName ?? null;
    let activeCompany = null;
    let tenantOptions = [];
    let effectiveCompanyId = scopedCompanyId;
    if (isOperator) {
        // Load the full company list so the switcher can offer any tenant.
        // Fail-soft: if BE is down, render with no options and let the user retry.
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
        if (scopedCompanyId) {
            // Resolve name from the freshly-loaded list first (authoritative),
            // fall back to the claim value.
            const match = tenantOptions.find((c) => c.companyId === scopedCompanyId);
            activeCompany = {
                companyId: scopedCompanyId,
                name: match?.name ?? scopedCompanyName ?? scopedCompanyId,
            };
        }
        else {
            activeCompany = null; // "All Companies"
        }
    }
    else {
        // Non-operator: locked to own company (set on login).
        if (scopedCompanyId && scopedCompanyName) {
            activeCompany = { companyId: scopedCompanyId, name: scopedCompanyName };
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
