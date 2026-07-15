/**
 * Sovereign Portal shell chrome — Portal v3 (Slice 5.18c — mockup-aligned)
 *
 * Rewritten to emit class names from the canonical mockup CSS
 * (portal-renders/pages/_shell.css → app/globals.css).
 *
 * Root container is .app, with .sidebar + .main inside.
 * Sidebar uses .brand, .tenant-switcher, .section-label, plain <nav><a> children,
 * and .foot. Topbar uses .crumbs / .right / .icon-btn.
 *
 * Public release styling = black/white/grey only. No ThemeToggle, no dark mode.
 * Drawer + logout modal are deferred to a later slice — the public release will
 * use the standard /api/logout form posted directly from the topbar pulldown.
 *
 * The ChromeProps interface and TenantOption/ActiveSection exports are kept
 * stable so existing dashboard pages compile unchanged.
 */
import type { ReactNode } from "react";
export type ActiveSection = "dashboard" | "companies" | "workspaces" | "users" | "account" | "portal-settings" | "audit" | "invites" | "projects" | "tasks" | "reports" | null;
export interface TenantOption {
    companyId: string;
    name: string;
}
export interface ChromeProps {
    active: ActiveSection;
    pageTitle: string;
    user: {
        userId: string;
        displayName?: string;
        handle?: string;
        isOperator?: boolean;
    };
    /** Active tenant scoped view. For non-operators this is fixed to their own company. */
    activeCompany?: {
        companyId?: string;
        name: string;
    } | null;
    /** Operator-only: list of all customer companies they can switch into. Non-operators receive [] and the switcher renders disabled. */
    tenantOptions?: TenantOption[];
    /**
     * When true, replaces the tenant switcher with a static "Portal-wide" chip.
     * Set on pages that are not scoped to a tenant — e.g. Portal Settings,
     * Audit feed, Invites, cross-tenant Users directory.
     */
    portalWide?: boolean;
    children: ReactNode;
}
export declare function Chrome({ active, pageTitle, user, activeCompany, tenantOptions, portalWide, children, }: ChromeProps): import("react").JSX.Element;
