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
import type { TenantOption } from "./Chrome";
export type { TenantOption };
export interface ChromeContext {
    token: string | null;
    user: {
        userId: string;
        displayName?: string;
        handle?: string;
        isOperator?: boolean;
    };
    activeCompany: {
        companyId?: string;
        name: string;
    } | null;
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
export declare function loadChromeContext(): Promise<ChromeContext | null>;
