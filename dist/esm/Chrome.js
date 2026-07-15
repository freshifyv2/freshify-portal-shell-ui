import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
        return (_jsxs("div", { className: "tenant-switcher", "aria-disabled": "true", title: "Locked to your company", children: [_jsxs("div", { className: "label", children: [_jsx("span", { className: "hint", children: hintLabel }), _jsx("span", { children: summaryLabel })] }), _jsx("span", { className: "chev", children: "\u25BE" })] }));
    }
    // Operator: pure-CSS <details> dropdown
    return (_jsxs("details", { className: "tenant-switcher-details", children: [_jsxs("summary", { className: "tenant-switcher", children: [_jsxs("div", { className: "label", children: [_jsx("span", { className: "hint", children: hintLabel }), _jsx("span", { children: summaryLabel })] }), _jsx("span", { className: "chev", children: "\u25BE" })] }), _jsxs("div", { className: "overlay", role: "menu", style: { marginTop: 6 }, children: [_jsx("div", { className: "section-label", children: "Operator scope" }), _jsx("form", { action: "/api/admin/active-tenant", method: "post", style: { margin: 0 }, children: _jsxs("button", { type: "submit", name: "companyId", value: "", className: `row ${!activeCompany?.companyId ? "active" : ""}`, style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("span", { className: "dot", "aria-hidden": true }), _jsx("div", { className: "body", children: _jsx("div", { className: "title", children: "All Companies" }) }), _jsx("span", { className: "right", children: "Aggregate" })] }) }), _jsx("div", { className: "sep-line" }), _jsx("div", { className: "section-label", children: "Impersonate" }), tenantOptions.length === 0 ? (_jsx("div", { className: "row", style: { color: "var(--fg-subtle)" }, children: "No tenants available" })) : (tenantOptions.map((t) => (_jsx("form", { action: "/api/admin/active-tenant", method: "post", style: { margin: 0 }, children: _jsxs("button", { type: "submit", name: "companyId", value: t.companyId, className: `row ${activeCompany?.companyId === t.companyId ? "active" : ""}`, style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("span", { className: "dot", "aria-hidden": true }), _jsx("div", { className: "body", children: _jsx("div", { className: "title", children: t.name }) })] }) }, t.companyId))))] })] }));
}
export function Chrome({ active, pageTitle, user, activeCompany, tenantOptions = [], portalWide = false, visibleModuleKeys, children, }) {
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
    return (_jsxs("div", { className: "app", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "brand", children: [_jsx("div", { className: "mark", children: "S" }), _jsx("div", { children: "Sovereign Portal" })] }), portalWide ? (_jsx("div", { className: "tenant-switcher", "aria-disabled": "true", title: "This module is portal-wide and not scoped to a tenant", children: _jsxs("div", { className: "label", children: [_jsx("span", { className: "hint", children: "Scope" }), _jsx("span", { children: "Portal-wide" })] }) })) : (_jsx(TenantSwitcher, { isOperator: isOperator, activeCompany: activeCompany, tenantOptions: tenantOptions })), groups.map((grp, gi) => (_jsxs("span", { style: { display: "contents" }, children: [_jsx("div", { className: "section-label", children: grp.label }), _jsx("nav", { "aria-label": grp.label, children: grp.items.map((it) => (_jsxs("a", { href: it.href, className: (active === it.key || (active === "account" && it.key === "users")) ? "active" : "", children: [_jsx("span", { className: "icon", "aria-hidden": true, children: it.icon }), it.label, it.guideOnly && _jsx("span", { className: "badge", children: "Guide" })] }, it.key))) })] }, `${grp.label}-${gi}`))), _jsxs("div", { className: "foot", children: [_jsx("div", { className: "avatar", children: initials(displayName) }), _jsxs("div", { className: "who", children: [_jsx("span", { className: "name", children: displayName }), roleLabel && _jsx("span", { className: "role", children: roleLabel })] })] })] }), _jsxs("div", { className: "main", children: [_jsxs("div", { className: "topbar", children: [_jsxs("div", { className: "crumbs", children: [activeCompany?.name && (_jsxs(_Fragment, { children: [_jsx("span", { children: activeCompany.name }), _jsx("span", { className: "sep", children: "/" })] })), _jsx("span", { className: "current", children: pageTitle }), isImpersonating && (_jsx("span", { className: "tag", style: { marginLeft: 8 }, title: "Operator impersonating", children: "OPERATOR MODE" }))] }), _jsxs("div", { className: "right", children: [_jsx("button", { type: "button", className: "icon-btn has-dot", title: "Notifications", "aria-label": "Notifications", children: "\u25D4" }), _jsxs("details", { className: "topbar-user-menu", children: [_jsxs("summary", { className: "icon-btn", "aria-label": "Account menu", style: { display: "inline-flex", alignItems: "center", gap: 8, paddingLeft: 8, paddingRight: 8, width: "auto" }, children: [_jsx("span", { "aria-hidden": true, style: {
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
                                                        }, children: initials(user.displayName) }), _jsx("span", { style: { fontSize: 12.5, color: "var(--fg-muted)" }, children: user.displayName ?? "Signed in" })] }), _jsxs("div", { className: "overlay", role: "menu", style: { position: "absolute", right: 24, top: 56, minWidth: 200 }, children: [_jsx("a", { href: "/dashboard/users/account", className: "row", role: "menuitem", style: { textDecoration: "none", color: "inherit" }, children: _jsx("div", { className: "body", children: _jsx("div", { className: "title", children: "Account" }) }) }), _jsx("div", { className: "sep-line" }), _jsx("form", { action: "/api/logout", method: "post", style: { margin: 0 }, children: _jsx("button", { type: "submit", className: "row", role: "menuitem", style: { width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", cursor: "pointer", color: "var(--danger)" }, children: _jsx("div", { className: "body", children: _jsx("div", { className: "title", children: "Log out" }) }) }) })] })] })] })] }), _jsx("div", { className: "content", children: children })] })] }));
}
