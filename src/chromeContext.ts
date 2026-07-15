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
import type { TenantOption } from "./Chrome";

export type { TenantOption };

const COMPANIES_URL =
  process.env.COMPANIES_SERVICE_URL ||
  "https://freshify-companies-sbzaekoo4q-uc.a.run.app";

const USERS_URL =
  process.env.USERS_SERVICE_URL ||
  "https://freshify-users-sbzaekoo4q-uc.a.run.app";

export interface ChromeContext {
  token: string | null;
  user: {
    userId: string;
    displayName?: string;
    handle?: string;
    isOperator?: boolean;
  };
  activeCompany: { companyId?: string; name: string } | null;
  tenantOptions: TenantOption[];
  /** Effective scope to filter list/detail queries by. null = all (operator mode). */
  effectiveCompanyId: string | null;
  /**
   * Deploy 5.20 — the moduleIds the caller can see in the nav given their
   * current scope. Pass as `visibleModuleKeys` to Chrome to filter the
   * sidebar. Empty array is treated as "no modules assigned" (dashboard
   * still renders via the Chrome floor).
   */
  visibleModuleKeys: string[];
}

export async function loadChromeContext(): Promise<ChromeContext | null> {
  const token = readSessionToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims) return null;

  const isOperator = Boolean(claims.operator);
  // Scope is the JWT's companyId. For operators, null = "All Companies"
  // (aggregate view). For non-operators, it's their permanent tenant.
  const scopedCompanyId = claims.companyId ?? null;
  const scopedCompanyName = claims.companyName ?? null;

  let activeCompany: { companyId?: string; name: string } | null = null;
  let tenantOptions: TenantOption[] = [];
  let effectiveCompanyId: string | null = scopedCompanyId;

  if (isOperator) {
    // Load the full company list so the switcher can offer any tenant.
    // Fail-soft: if BE is down, render with no options and let the user retry.
    try {
      const res = await fetch(`${COMPANIES_URL}/v1/companies`, {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const body = (await res.json()) as { companies?: Array<{ companyId: string; name: string }> };
        tenantOptions = (body.companies ?? []).map((c) => ({
          companyId: c.companyId,
          name: c.name,
        }));
      }
    } catch {
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
    } else {
      activeCompany = null; // "All Companies"
    }
  } else {
    // Non-operator: locked to own company (set on login).
    if (scopedCompanyId && scopedCompanyName) {
      activeCompany = { companyId: scopedCompanyId, name: scopedCompanyName };
    }
    tenantOptions = [];
  }

  // Deploy 5.20 — fetch visible modules for the current scope. Fail-soft: on
  // error we return an empty list; Chrome falls back to the legacy filter
  // (operatorOnly only) when visibleModuleKeys is undefined, so we intentionally
  // pass through empty array only when we got a real response.
  let visibleModuleKeys: string[] = [];
  try {
    const scopeParam = scopedCompanyId ? encodeURIComponent(scopedCompanyId) : "all";
    const res = await fetch(`${USERS_URL}/v1/portal-modules?scope=${scopeParam}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const body = (await res.json()) as { modules?: Array<{ moduleId: string }> };
      visibleModuleKeys = (body.modules ?? []).map((m) => m.moduleId);
    }
  } catch {
    visibleModuleKeys = [];
  }

  const displayName = claims.displayName || claims.email || "there";
  const handle = ((): string => {
    const e = claims.email;
    if (!e) return "user";
    // Synthetic phone-only users: `phone+<E164>@users.freshify.io` → render E.164.
    const phoneMatch = e.match(/^phone\+?(\+?\d+)/);
    if (phoneMatch) return `+${phoneMatch[1].replace(/[^0-9]/g, "")}`;
    if (e.startsWith("+")) return e;
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
    visibleModuleKeys,
  };
}
