import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// Adds DOM matchers such as toBeInTheDocument() and toHaveAttribute() to Vitest's expect.
import "@testing-library/jest-dom/vitest";

// Testing Library only auto-unmounts when Vitest globals are enabled. They're off (explicit imports),
// so without this each test's DOM leaks into the next one.
afterEach(cleanup);
