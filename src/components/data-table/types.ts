import type { ReactNode } from "react";

// --- Sorting ---

/**
 * Direction of an active sort.
 * A string union instead of an `enum`: `erasableSyntaxOnly` forbids enums because they emit runtime code.
 */
export type SortDirection = "asc" | "desc";

/**
 * Values the table knows how to compare when sorting client-side.
 * Strings compare with `Intl.Collator`, numbers numerically, dates by timestamp, booleans false-before-true.
 * `null` and `undefined` always sort last, in either direction.
 */
export type SortValue = string | number | Date | boolean | null | undefined;

/**
 * The active sort, or `null` when no column is sorted.
 * `null` ("no sort") is deliberately different from `undefined`, which on a prop means "uncontrolled".
 * Single-column only: multi-column sort isn't in the brief.
 */
export type SortState = {
  /** `id` of the sorted column. An id that matches no column is ignored (rendered unsorted) with a dev warning. */
  columnId: string;
  /** Sort direction. A header click cycles asc → desc → no sort. */
  direction: SortDirection;
} | null;

// --- Pagination ---

/** The current page and page size. */
export interface PaginationState {
  /** Zero-based page index (0 = first page). Out-of-range values are clamped to the last valid page. */
  pageIndex: number;
  /** Rows per page. Must be a positive integer. Changing it resets `pageIndex` to 0. */
  pageSize: number;
}

// --- Columns ---

/**
 * Describes one column. The table renders its header and every cell from these objects; it has no hard-coded columns.
 *
 * @example
 * const columns: ColumnDef<ClassSession>[] = [
 *   {
 *     id: "time",
 *     header: "Time",
 *     getValue: (row) => row.startsAt, // sort by the real Date…
 *     renderCell: (row) => formatTime(row.startsAt), // …but display "7:00 AM"
 *     sortable: true,
 *     width: 120,
 *   },
 * ];
 */
export interface ColumnDef<TRow> {
  /** Stable unique id. Used as the React key, as `SortState.columnId`, and in URLs. Unlike `header`, it never changes with wording. */
  id: string;
  /** Header label. Plain text (not ReactNode) because it's also read out by the live region, e.g. "Sorted by Time, ascending". */
  header: string;
  /**
   * Returns the column's raw value for a row. Used for client-side sorting, and shown as text when `renderCell` is absent.
   * Optional: display-only columns (e.g. actions) don't need it, and in server mode the server sorts.
   */
  getValue?: (row: TRow) => SortValue;
  /**
   * Custom cell content. Receives the whole row, not the value, so one `ColumnDef<TRow>[]` can hold columns
   * with different value types without a second generic (which would force `any`). Defaults to `getValue` as text.
   */
  renderCell?: (row: TRow) => ReactNode;
  /**
   * Whether clicking the header sorts by this column. Default `false` (opt-in).
   * In client mode, a sortable column without `getValue` can't be sorted and logs a dev warning.
   */
  sortable?: boolean;
  /** Fixed width in px. A number, not a CSS string, because pinned `left` offsets and skeleton widths are computed from it. Default: browser auto-sizing. */
  width?: number;
  /** Pins the column to the left edge while the table scrolls horizontally. Default `false`. Requires `width` to compute its sticky offset. */
  pinned?: boolean;
}

// --- Expansion ---

/** Fields shared by both expansion modes. */
interface ExpansionBase<TRow, TChild> {
  /**
   * Renders the expanded content, inside a full-width cell under the row.
   * The table supplies the container, the animation and (in lazy mode) loading and error states;
   * the consumer decides the content, including what an empty `children` array looks like.
   */
  renderChildren: (children: TChild[], row: TRow) => ReactNode;
  /** Whether a row gets an expand toggle, e.g. `false` for a row with nothing to show. Default: every row can expand. */
  canExpand?: (row: TRow) => boolean;
}

/** Inline mode: children arrive with the row data, so expanding is instant. */
export interface InlineExpansionConfig<TRow, TChild> extends ExpansionBase<
  TRow,
  TChild
> {
  mode: "inline";
  /** Reads the row's children. Called on expand; must be synchronous. */
  getChildren: (row: TRow) => TChild[];
}

/** Lazy mode: children are fetched the first time a row expands, then cached per row id. */
export interface LazyExpansionConfig<TRow, TChild> extends ExpansionBase<
  TRow,
  TChild
> {
  mode: "lazy";
  /**
   * Fetches the row's children. `signal` is aborted when the request is no longer wanted (e.g. the table unmounts);
   * pass it to `fetch` so the browser cancels the request. Rejecting shows an error state with a retry button.
   */
  loadChildren: (row: TRow, signal: AbortSignal) => Promise<TChild[]>;
}

/**
 * How rows expand. A discriminated union on `mode`, so TypeScript rejects invalid combinations
 * such as `loadChildren` in inline mode, or both loaders at once.
 * See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
 */
export type ExpansionConfig<TRow, TChild> =
  InlineExpansionConfig<TRow, TChild> | LazyExpansionConfig<TRow, TChild>;

// --- Props ---

/**
 * Pagination mode. A union so `rowCount` is required exactly when it's needed:
 * in server mode the table only receives one page, so it can't count the total itself.
 */
type PaginationModeProps =
  | {
      /** Server mode: the table doesn't slice `data`; it emits `onPaginationChange` and shows `data` as the current page. */
      manualPagination: true;
      /** Total rows on the server. Used to compute the page count ("Page 2 of 7") and disable Next on the last page. */
      rowCount: number;
    }
  | {
      /** Client mode (default): the table slices `data` into pages itself. */
      manualPagination?: false;
      /** Not allowed in client mode: the table uses `data.length`. */
      rowCount?: never;
    };

/** Props shared by both pagination modes. Grouped by feature, in the order the table uses them. */
interface DataTableBaseProps<TRow, TChild> {
  // Data
  /** All rows (client mode) or the current page of rows (server mode). Never mutated; the table sorts a copy. */
  data: TRow[];
  /** Returns a stable unique id per row. Used for React keys and to keep expansion and cached children attached to the right row after sorting. Never the array index. */
  getRowId: (row: TRow) => string;
  /** Accessible name of the table, rendered as `<caption>`. Required for screen readers; can be visually hidden with CSS. */
  caption: string;

  // Columns
  /** Column definitions, in display order. Pinned columns should come first, since they stick to the left edge. */
  columns: ColumnDef<TRow>[];

  // Sorting
  /** Controlled sort. Passing it (even `null`) makes the parent own the sort; omit it for uncontrolled. */
  sort?: SortState;
  /** Initial sort when uncontrolled. Ignored when `sort` is passed. Default `null` (unsorted). */
  defaultSort?: SortState;
  /** Called with the next sort on every header click, in both controlled and uncontrolled mode. */
  onSortChange?: (sort: SortState) => void;
  /** Server mode: the table doesn't sort `data`; it emits `onSortChange` and expects `data` already sorted. Default `false`. */
  manualSorting?: boolean;

  // Pagination
  /** Controlled pagination. Passing it makes the parent own the page; omit it for uncontrolled. */
  pagination?: PaginationState;
  /** Initial pagination when uncontrolled. Ignored when `pagination` is passed. Default: first page, first `pageSizeOptions` entry. */
  defaultPagination?: PaginationState;
  /** Called with the next pagination on page or page-size change, in both controlled and uncontrolled mode. */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Choices in the page-size selector. Default `[10, 20, 50]`. */
  pageSizeOptions?: number[];

  // Expansion
  /** Enables expandable rows. Omit for a table without expansion. */
  expansion?: ExpansionConfig<TRow, TChild>;

  // States
  /** Shows skeleton rows matching the column layout instead of data rows. Default `false`. */
  isLoading?: boolean;
  /** User-facing error message. When set, replaces the rows with an error state. The parent controls the wording, so raw technical errors never reach users. */
  error?: string | null;
  /** Shows a Retry button in the error state that calls this. */
  onRetry?: () => void;
  /**
   * Shown when there are no rows and no error or loading: plain text or custom UI (icon, call to action).
   * ReactNode accepts both, so one prop covers both cases. Rendered inside a full-width cell with a minimum
   * height, so the table doesn't collapse to a thin strip. Default "No results."
   */
  emptyState?: ReactNode;
}

/**
 * Props of `DataTable`. `TChild` is the type of expanded children; it defaults to `never` for tables without expansion.
 * An intersection (`&`) because an interface can't contain the pagination-mode union.
 */
export type DataTableProps<TRow, TChild = never> = DataTableBaseProps<
  TRow,
  TChild
> &
  PaginationModeProps;
