import { TableCellsIcon } from "@heroicons/react/20/solid";
import type { ReactElement } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.tsx";

// Active link gets a filled background; NavLink passes isActive and sets aria-current="page" itself.
function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  return isActive
    ? `${base} bg-zinc-100 text-zinc-900`
    : `${base} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`;
}

/**
 * App shell: a top bar with the product name and navigation, then the routed page.
 * A top bar instead of a sidebar: with one page a sidebar only takes width from the table, and a
 * top bar needs no separate mobile layout.
 *
 * @returns The layout with the route matching the current URL.
 */
export default function App(): ReactElement {
  return (
    <div className="min-h-dvh">
      {/* First focusable element: keyboard users can jump straight past the navigation. */}
      <a
        href="#main"
        className="sr-only rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-white">
              <TableCellsIcon className="size-4" aria-hidden="true" />
            </span>
            Studio
          </span>
          <nav aria-label="Main">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* One page: every scenario is an option on it. Unknown paths (e.g. an old /demo link) go home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
