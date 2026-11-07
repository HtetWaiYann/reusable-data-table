# Reusable Data Table

A reusable, fully typed `DataTable<TRow>` built from scratch (no table libraries), used on a fitness-studio class timetable (`/`) and a server-mode demo (`/demo`).

**Live URL:** _not deployed yet_

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + behaviour tests
npm run lint
npm run build
```

## Component API

_TODO: props table and minimal usage example._

## Client-side vs server-side strategy

_TODO_

## Expandable rows (inline and lazy)

_TODO_

## Sticky column

_TODO_

## Loading, empty and error states

_TODO_

## State management

Local React state inside custom hooks, no global store.

## Performance

_TODO: dataset sizes tested and how measured._

## Accessibility

_TODO_

## Tradeoffs and assumptions

- Vite SPA instead of Next.js: no backend or SEO needs.

## With more time

- **Custom sort comparator per column** (`compare?: (a, b) => number` on `ColumnDef`), for two-level sorts or orders that aren't based on a value. Today, custom orders work by having `getValue` return a rank (e.g. `STATUS_RANK[row.status]`), and server-defined orders use `manualSorting`.
