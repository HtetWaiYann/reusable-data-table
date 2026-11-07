import type { ReactElement } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import DemoPage from "./pages/DemoPage.tsx";
import TimetablePage from "./pages/TimetablePage.tsx";

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
          Timetable
        </NavLink>
        <NavLink to="/demo">Demo</NavLink>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TimetablePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>
      </main>
    </div>
  );
}
