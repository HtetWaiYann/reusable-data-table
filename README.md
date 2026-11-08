# Reusable Data Table

A typed React table component built from scratch, with no table library.

**Live URL:** https://reusable-data-table.htetwaiyan.com

## Setup

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev     # http://localhost:5173
npm test
npm run build
```

On `/demo`, the **Table setup** panel changes the dataset, how child rows load, client or server mode, the data size (50 or 50,000 rows) and the fake API response (normal, slow, error, empty). The choices are saved in the URL, for example `/demo?mode=server&children=lazy`.

## Component API

```tsx
const columns: ColumnDef<Person>[] = [
  {
    id: "name",
    header: "Name",
    getValue: (row) => row.name,
    sortable: true,
    pinned: true,
    width: 200,
  },
  {
    id: "joined",
    header: "Joined",
    getValue: (row) => row.joinedAt, // used for sorting
    renderCell: (row) => row.joinedAt.toLocaleDateString(), // used for display
    sortable: true,
  },
];

<DataTable
  caption="People"
  data={people}
  getRowId={(row) => row.id}
  columns={columns}
/>;
```

**Columns.** Each column has:

| Field        | What it does                                           |
| ------------ | ------------------------------------------------------ |
| `id`         | Unique key. Also the key used in the sort state.       |
| `header`     | The header text.                                       |
| `getValue`   | Returns the raw value. Used for sorting.               |
| `renderCell` | Optional custom cell content.                          |
| `sortable`   | Clicking the header sorts: ascending, descending, off. |
| `width`      | Fixed width in px.                                     |
| `pinned`     | Keeps the column on the left while scrolling sideways. |

**Main props.**

| Props                                                     | What they do                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data`, `getRowId`, `caption`                             | The rows, a stable id for each row, and the table name.                          |
| `sort` or `defaultSort`, `onSortChange`                   | Sorting. Pass `sort` to control it, or `defaultSort` to let the table manage it. |
| `pagination` or `defaultPagination`, `onPaginationChange` | Paging, with the same two options.                                               |
| `manualSorting`, `manualPagination`, `rowCount`           | Server mode (see below).                                                         |
| `expansion`                                               | Expandable rows (see below).                                                     |
| `isLoading`, `error`, `onRetry`, `emptyState`             | Loading, error and empty states.                                                 |

## Client-side vs server-side

- **Client side (default):** the table gets all rows, sorts them and shows one page.
- **Server side:** with `manualSorting` and `manualPagination`, the table does not sort or slice. It tells the parent when the sort or page changes, and the parent loads that page and passes it in with the total `rowCount`. While the next page loads, the current data stay on screen instead of showing a loading screen for better UX.

## Expandable rows

Two modes:

```tsx
// Inline: the children come with the row.
expansion={{ mode: "inline", getChildren: (row) => row.attendees }}

// Lazy: the children are loaded the first time the row is opened.
expansion={{ mode: "lazy", loadChildren: (row, signal) => api.getAttendees(row.id, signal) }}
```

- **Lazy mode** shows a loading state, then the children. If loading fails, it shows an error with a Retry button. Results are cached per row, so opening a row again does not reload it.
- **Content:** pass `renderChildren` to draw the children your own way (the timetable uses a small table, members use cards). Leave it out and the table shows a simple built-in table made from the data.
- The open row spans the full width and opens and closes with a short animation.

## Sticky column

The pinned column uses CSS `position: sticky`, so it stays on the left while the table scrolls sideways. A shadow appears only when other columns are passing under it.

## State management

All state is local React state inside small custom hooks (`useSorting`, `usePagination`, `useExpansion`, `useLazyChildren`). There is no global store, because the state belongs to one table and is not needed anywhere else.

Sort and pagination can be **controlled** (the parent passes the value and handles changes) or **uncontrolled** (the table keeps it). One shared hook, `useControllableState`, handles both.

## Trade-offs and assumptions

- **No backend.** Data is generated and a fake API adds delay, errors and empty results.
- **Pagination instead of virtualization.** Only one page is in the DOM. Tested with 50,000 rows: sorting takes about 15–70 ms and changing the page about 16 ms.
- **Pagination Reset** Both modes go back to page 1 when the sort or page size changes.
- **Single-column sort**, as mentioned in the instructions.
- **The table uses plain CSS** so it works in any app. The pages use Tailwind.
- **Vite instead of Next.js.** There is no server or SEO need.

## With more time

- Sticky headers for vertical scroll both inside the table itself and the outside of the table (when scrolling out of the window)
- Numbered page buttons (like ‹  1  …  2  3  4  …  20  ›)
- Faster sorting for very large data (for example, sorting in a Web Worker).
- Sorting by more than one column (composite sorting like Class + Instructor)
- Pinning more than one column.
- A different design for Mobile view (currently, just a sticky pinned column)
- Row selection with checkboxes.
- End-to-end tests with Playwright (because I only have experience in Express and not in Cypress)
