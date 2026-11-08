import { useCallback, useState } from "react";
import type {
  ColumnDef,
  PaginationState,
  SortState,
} from "../../components/data-table/index.ts";
import {
  fetchRows,
  fetchRowsPage,
  type MockScenario,
  type PageResponse,
} from "../../mocks/api.ts";
import type { DataMode } from "./options.ts";
import { useRequest } from "./useRequest.ts";

const FIRST_PAGE: PaginationState = { pageIndex: 0, pageSize: 10 };

/** Props shared by both modes. */
interface BaseDataProps<TRow> {
  data: TRow[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Client mode: the table sorts and pages by itself (uncontrolled). */
interface ClientDataProps {
  manualSorting?: false;
  manualPagination?: false;
  defaultSort: SortState;
}

/** Server mode: the page owns sort and pagination (controlled) and fetches each page. */
interface ServerDataProps {
  manualSorting: true;
  manualPagination: true;
  rowCount: number;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
}

/** Spread onto `<DataTable>`: data, states, and the props for the chosen mode. */
export type TableDataProps<TRow> = BaseDataProps<TRow> &
  (ClientDataProps | ServerDataProps);

/** Options for {@link useTableData}. */
export interface UseTableDataOptions<TRow> {
  /** The dataset the fake server holds. Must be a stable array. */
  rows: TRow[];
  /** Stable columns; the fake server uses them to find the sorted value. */
  columns: readonly ColumnDef<TRow>[];
  dataMode: DataMode;
  scenario: MockScenario;
  defaultSort: SortState;
  /** User-facing text when loading fails. */
  errorMessage: string;
}

/**
 * Loads a dataset from the fake API in client or server mode and returns ready-to-spread table props.
 * Client mode fetches everything once; server mode is the table's controlled mode: sort and page
 * live here, every change refetches one page, and the table only shows it.
 *
 * @param options - See {@link UseTableDataOptions}.
 * @returns Props for `<DataTable>`.
 */
export function useTableData<TRow>({
  rows,
  columns,
  dataMode,
  scenario,
  defaultSort,
  errorMessage,
}: UseTableDataOptions<TRow>): TableDataProps<TRow> {
  const isServer = dataMode === "server";
  // Only used in server mode. In client mode the table owns them and never calls these setters,
  // so they stay the same and don't trigger refetches.
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [pagination, setPagination] = useState<PaginationState>(FIRST_PAGE);

  const request = useCallback(
    (signal: AbortSignal): Promise<PageResponse<TRow>> =>
      isServer
        ? fetchRowsPage(rows, columns, { sort, pagination }, scenario, signal)
        : fetchRows(rows, scenario, signal).then((all) => ({
            rows: all,
            rowCount: all.length,
          })),
    [isServer, rows, columns, sort, pagination, scenario],
  );
  const { value, isLoading, isError, retry } = useRequest(request);

  const base: BaseDataProps<TRow> = {
    data: value?.rows ?? [],
    isLoading,
    error: isError ? errorMessage : null,
    onRetry: retry,
  };

  if (!isServer) {
    return { ...base, defaultSort };
  }
  return {
    ...base,
    manualSorting: true,
    manualPagination: true,
    rowCount: value?.rowCount ?? 0,
    sort,
    onSortChange: setSort,
    pagination,
    onPaginationChange: setPagination,
  };
}
