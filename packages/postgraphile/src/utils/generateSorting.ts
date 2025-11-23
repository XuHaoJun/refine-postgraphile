import type { CrudSort } from "@refinedev/core";

/**
 * Generates PostGraphile sorting syntax from Refine sorter data
 *
 * @param sorters - Array of Refine sorter data
 * @returns PostGraphile sorting strings in FIELD_ORDER format
 */
export function generateSorting(sorters: CrudSort[] | undefined | null): string[] {
  if (!sorters || sorters.length === 0) {
    return [];
  }

  return sorters.map(sorter => `${sorter.field}_${sorter.order.toUpperCase()}`);
}
