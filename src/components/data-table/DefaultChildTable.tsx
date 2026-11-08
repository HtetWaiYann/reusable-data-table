import type { ReactElement } from "react";
import {
  formatChildValue,
  getChildColumnKeys,
  humanizeKey,
  isRecord,
} from "./utils/childTable.ts";
import styles from "./data-table.module.css";

const EMPTY_MESSAGE = "No items.";
// Header for children that aren't objects (e.g. a list of strings): one column of values.
const VALUE_HEADER = "Value";

/** Props of {@link DefaultChildTable}. */
export interface DefaultChildTableProps<TChild> {
  items: TChild[];
  childIdKey: (keyof TChild & string) | undefined;
  hideChildKeys: readonly (keyof TChild & string)[] | undefined;
}

/**
 * The built-in content of an expanded row when no `renderChildren` is given: the children as a
 * nested table, columns taken from their keys. Fixed design; for anything else use `renderChildren`.
 * Internal: not exported from the package.
 */
export function DefaultChildTable<TChild>({
  items,
  childIdKey,
  hideChildKeys = [],
}: DefaultChildTableProps<TChild>): ReactElement {
  if (items.length === 0) {
    return <p className={styles.childEmpty}>{EMPTY_MESSAGE}</p>;
  }

  const keys = getChildColumnKeys(items, hideChildKeys);
  // No object children (e.g. string[]): a single column with each value.
  const hasKeys = keys.length > 0;

  return (
    <div className={styles.childCard}>
      {/* A real nested table, so screen readers can move through it by row and column. */}
      <table className={styles.childTable} aria-label="Details">
        <thead>
          <tr>
            {hasKeys ? (
              keys.map((key) => (
                <th key={key} scope="col">
                  {humanizeKey(key)}
                </th>
              ))
            ) : (
              <th scope="col">{VALUE_HEADER}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((child, index) => (
            // The index is a safe key here: the child list is never sorted or filtered, so a row's
            // index never changes while it's on screen. childIdKey gives a real id when there is one.
            <tr key={childIdKey ? String(child[childIdKey]) : index}>
              {hasKeys ? (
                keys.map((key) => (
                  <td key={key}>
                    {formatChildValue(isRecord(child) ? child[key] : undefined)}
                  </td>
                ))
              ) : (
                <td>{formatChildValue(child)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
