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
}
export declare function loadChromeContext(): Promise<ChromeContext | null>;
