import type { ReactElement } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.tsx";

/**
 * App shell: sidebar navigation plus the routed page.
 *
 * @returns The layout with the route matching the current URL.
 */
export default function App(): ReactElement {
  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Main">
        {/* NavLink sets aria-current="page" on the active link automatically. */}
        <NavLink to="/" end>
          Dashboard
        </NavLink>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* One page: every scenario is an option on it. Unknown paths (e.g. an old /demo link) go home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
