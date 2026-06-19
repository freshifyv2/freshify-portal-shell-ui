# @freshifyv2/portal-shell-ui

Sovereign Portal shell chrome — sidebar, topbar, footer, tenant switcher, and the shared CSS that powers them. Consumed by `freshify-portal-shell`, `freshify-users-fe`, `freshify-companies-fe`, and `freshify-workspaces-fe`.

## Why this package exists

Before Sprint 6, the four shell-bearing FE repos each carried their own copy of `Chrome.tsx`, `chromeContext.ts`, and `globals.css`. Drift accumulated:

- `portal-shell` and `users-fe` were on the Sprint 4.5 mockup-aligned Chrome (328 lines).
- `companies-fe` and `workspaces-fe` still carried the Stage 6 Deploy 2 Chrome (466 lines) with inline SVGs and a 3138-line v3 globals.css.

Navigating from `/dashboard` to `/dashboard/companies` rendered a visibly different sidebar. This package is the fix — single source of truth, lifted from `portal-shell` verbatim.

## What's in the package

- `Chrome` — the shell component (sidebar + topbar + footer)
- `loadChromeContext` — server helper that loads the user, active tenant, and tenant-switcher options from cookies + companies-be
- `globals.css` — the shell stylesheet (1069 lines, mockup-aligned)
- Cookie helpers: `readSessionToken`, `readActiveTenant`, `decodeClaims`, `decodeJwt`

## Usage

```tsx
// app/layout.tsx
import "@freshifyv2/portal-shell-ui/globals.css";
```

```tsx
// app/dashboard/page.tsx
import { Chrome, loadChromeContext } from "@freshifyv2/portal-shell-ui";

export default async function Page() {
  const ctx = await loadChromeContext();
  if (!ctx) return null;

  return (
    <Chrome
      pageTitle="Dashboard"
      activeSection="dashboard"
      user={ctx.user}
      tenantOptions={ctx.tenantOptions}
      activeTenant={ctx.activeCompany}
    >
      {/* page content */}
    </Chrome>
  );
}
```

## CSS load order

`@freshifyv2/portal-shell-ui/globals.css` must be imported **before** any module-local stylesheet in `app/layout.tsx`. Module-local styles cascade on top.

## License

Apache-2.0 © Freshify, Inc.
