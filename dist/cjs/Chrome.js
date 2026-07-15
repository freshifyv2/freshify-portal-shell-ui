"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chrome = Chrome;
const jsx_runtime_1 = require("react/jsx-runtime");
/* ------------------------------------------------------------------ */
/* Nav definition — glyphs match the mockup HTML samples.             */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "⌂", groupStart: "Modules" },
    { key: "companies", label: "Customers", href: "/dashboard/companies", icon: "◉" },
    { key: "workspaces", label: "Workspaces", href: "/dashboard/workspaces", icon: "◧" },
    { key: "users", label: "Users", href: "/dashboard/users/list", icon: "◐", operatorOnly: true },
    { key: "portal-settings", label: "Portal Settings", href: "/dashboard/portal-settings", icon: "⚙", operatorOnly: true, groupStart: "System" },
    { key: "module-settings", label: "Module Settings", href: "/dashboard/module-settings", icon: "▤", operatorOnly: true },
    { key: "audit", label: "Audit feed", href: "/dashboard/audit", icon: "≡", operatorOnly: true },
    { key: "invites", label: "Invites", href: "/dashboard/invites", icon: "✉", operatorOnly: true },
    // Service modules — guide-only
    { key: "projects", label: "Projects", href: "/dashboard/projects", icon: "▤", guideOnly: true, groupStart: "Service" },
    { key: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: "▣", guideOnly: true },
    { key: "reports", label: "Reports", href: "/dashboard/reports", icon: "▦", guideOnly: true },
];
function initials(name, fallback = "?") {
    if (!name)
        return fallback;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return fallback;
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function TenantSwitcher({ isOperator, activeCompany, tenantOptions, }) {
    const aggregateLabel = "All Companies";
    const summaryLabel = activeCompany?.name ?? (isOperator ? aggregateLabel : "Sovereign Portal");
    const hintLabel = isOperator ? (activeCompany?.companyId ? "Impersonating" : "Operator scope") : "Tenant";
    if (!isOperator) {
        // Non-operator: visible but inert chip
        return ((0, jsx_runtime_1.jsxs)("div", { className: "tenant-switcher", "aria-disabled": "true", title: "Locked to your company", children: [(0, jsx_runtime_1.jsxs)("div", { className: "label", children: [(0, jsx_runtime_1.jsx)("span", { className: "hint", children: hintLabel }), (0, jsx_runtime_1.jsx)("span", { children: summaryLabel })] }), (0, jsx_runtime_1.jsx)("span", { className: "chev", children: "\u25BE" })] }));
    }
    // Operator: pure-CSS <details> dropdown
    return ((0, jsx_runtime_1.jsxs)("details", { className: "tenant-switcher-details", children: [(0, jsx_runtime_1.jsxs)("summary", { className: "tenant-switcher", children: [(0, jsx_runtime_1.jsxs)("div", { className: "label", children: [(0, jsx_runtime_1.jsx)("span", { className: "hint", children: hintLabel }), (0, jsx_runtime_1.jsx)("span", { children: summaryLabel })] }), (0, jsx_runtime_1.jsx)("span", { className: "chev", children: "\u25BE" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "overlay", role: "menu", style: { marginTop: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "section-label", children: "Operator scope" }), (0, jsx_runtime_1.jsx)("form", { action: "/api/admin/active-tenant", method: "post", style: { margin: 0 }, children: (0, jsx_runtime_1.jsxs)("button", { type: "submit", name: "companyId", value: "", className: `row ${!activeCompany?.companyId ? "active" : ""}`, style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }, children: [(0, jsx_runtime_1.jsx)("span", { className: "dot", "aria-hidden": true }), (0, jsx_runtime_1.jsx)("div", { className: "body", children: (0, jsx_runtime_1.jsx)("div", { className: "title", children: "All Companies" }) }), (0, jsx_runtime_1.jsx)("span", { className: "right", children: "Aggregate" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "sep-line" }), (0, jsx_runtime_1.jsx)("div", { className: "section-label", children: "Impersonate" }), tenantOptions.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "row", style: { color: "var(--fg-subtle)" }, children: "No tenants available" })) : (tenantOptions.map((t) => ((0, jsx_runtime_1.jsx)("form", { action: "/api/admin/active-tenant", method: "post", style: { margin: 0 }, children: (0, jsx_runtime_1.jsxs)("button", { type: "submit", name: "companyId", value: t.companyId, className: `row ${activeCompany?.companyId === t.companyId ? "active" : ""}`, style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }, children: [(0, jsx_runtime_1.jsx)("span", { className: "dot", "aria-hidden": true }), (0, jsx_runtime_1.jsx)("div", { className: "body", children: (0, jsx_runtime_1.jsx)("div", { className: "title", children: t.name }) })] }) }, t.companyId))))] })] }));
}
function Chrome({ active, pageTitle, user, activeCompany, tenantOptions = [], portalWide = false, visibleModuleKeys, children, }) {
    const isOperator = Boolean(user.isOperator);
    const isImpersonating = isOperator && Boolean(activeCompany?.companyId);
    const allowedSet = visibleModuleKeys ? new Set(visibleModuleKeys) : null;
    const visibleNav = NAV_ITEMS.filter((it) => {
        if (it.operatorOnly && !isOperator)
            return false;
        if (allowedSet && it.key !== null && !allowedSet.has(it.key))
            return false;
        return true;
    });
    const displayName = user.displayName ?? "Signed in";
    const roleLabel = isImpersonating
        ? `Operator · ${activeCompany?.name ?? ""}`
        : isOperator
            ? "Operator"
            : activeCompany?.name ?? "";
    // Group nav items by groupStart so we can interleave <div class="section-label">
    // + <nav> blocks the way the mockup does.
    const groups = [];
    for (const it of visibleNav) {
        if (it.groupStart || groups.length === 0) {
            groups.push({ label: it.groupStart ?? "Modules", items: [it] });
        }
        else {
            groups[groups.length - 1].items.push(it);
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "sidebar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "brand", children: [(0, jsx_runtime_1.jsx)("div", { className: "mark", children: "S" }), (0, jsx_runtime_1.jsx)("div", { children: "Sovereign Portal" })] }), portalWide ? ((0, jsx_runtime_1.jsx)("div", { className: "tenant-switcher", "aria-disabled": "true", title: "This module is portal-wide and not scoped to a tenant", children: (0, jsx_runtime_1.jsxs)("div", { className: "label", children: [(0, jsx_runtime_1.jsx)("span", { className: "hint", children: "Scope" }), (0, jsx_runtime_1.jsx)("span", { children: "Portal-wide" })] }) })) : ((0, jsx_runtime_1.jsx)(TenantSwitcher, { isOperator: isOperator, activeCompany: activeCompany, tenantOptions: tenantOptions })), groups.map((grp, gi) => ((0, jsx_runtime_1.jsxs)("span", { style: { display: "contents" }, children: [(0, jsx_runtime_1.jsx)("div", { className: "section-label", children: grp.label }), (0, jsx_runtime_1.jsx)("nav", { "aria-label": grp.label, children: grp.items.map((it) => ((0, jsx_runtime_1.jsxs)("a", { href: it.href, className: (active === it.key || (active === "account" && it.key === "users")) ? "active" : "", children: [(0, jsx_runtime_1.jsx)("span", { className: "icon", "aria-hidden": true, children: it.icon }), it.label, it.guideOnly && (0, jsx_runtime_1.jsx)("span", { className: "badge", children: "Guide" })] }, it.key))) })] }, `${grp.label}-${gi}`))), (0, jsx_runtime_1.jsxs)("div", { className: "foot", children: [(0, jsx_runtime_1.jsx)("div", { className: "avatar", children: initials(displayName) }), (0, jsx_runtime_1.jsxs)("div", { className: "who", children: [(0, jsx_runtime_1.jsx)("span", { className: "name", children: displayName }), roleLabel && (0, jsx_runtime_1.jsx)("span", { className: "role", children: roleLabel })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "main", children: [(0, jsx_runtime_1.jsxs)("div", { className: "topbar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "crumbs", children: [activeCompany?.name && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { children: activeCompany.name }), (0, jsx_runtime_1.jsx)("span", { className: "sep", children: "/" })] })), (0, jsx_runtime_1.jsx)("span", { className: "current", children: pageTitle }), isImpersonating && ((0, jsx_runtime_1.jsx)("span", { className: "tag", style: { marginLeft: 8 }, title: "Operator impersonating", children: "OPERATOR MODE" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "right", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "icon-btn has-dot", title: "Notifications", "aria-label": "Notifications", children: "\u25D4" }), (0, jsx_runtime_1.jsxs)("details", { className: "topbar-user-menu", children: [(0, jsx_runtime_1.jsxs)("summary", { className: "icon-btn", "aria-label": "Account menu", style: { display: "inline-flex", alignItems: "center", gap: 8, paddingLeft: 8, paddingRight: 8, width: "auto" }, children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": true, style: {
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: "50%",
                                                            background: "#0f0f0f",
                                                            color: "#fff",
                                                            fontSize: 10,
                                                            fontWeight: 600,
                                                        }, children: initials(user.displayName) }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 12.5, color: "var(--fg-muted)" }, children: user.displayName ?? "Signed in" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "overlay", role: "menu", style: { position: "absolute", right: 24, top: 56, minWidth: 200 }, children: [(0, jsx_runtime_1.jsx)("a", { href: "/dashboard/users/account", className: "row", role: "menuitem", style: { textDecoration: "none", color: "inherit" }, children: (0, jsx_runtime_1.jsx)("div", { className: "body", children: (0, jsx_runtime_1.jsx)("div", { className: "title", children: "Account" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sep-line" }), (0, jsx_runtime_1.jsx)("form", { action: "/api/logout", method: "post", style: { margin: 0 }, children: (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "row", role: "menuitem", style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", color: "var(--danger)" }, children: (0, jsx_runtime_1.jsx)("div", { className: "body", children: (0, jsx_runtime_1.jsx)("div", { className: "title", children: "Log out" }) }) }) })] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "content", children: children })] })] }));
}
