import type { CrudSort } from "@refinedev/core";

/**
 * Generates PostGraphile sorting syntax from Refine sorter data
 *
 * @param sorters - Array of Refine sorter data
 * @returns PostGraphile sorting strings in FIELD_ORDER format (uppercase field names)
 */
export function generateSorting(sorters: CrudSort[] | undefined | null): string[] {
  if (!sorters || sorters.length === 0) {
    return [];
  }

  return sorters.map(sorter => {
    // PostGraphile orderBy enum values use uppercase field names with underscores
    // e.g., PRIMARY_KEY_ASC (for primary key), TITLE_DESC, CREATED_AT_ASC, CATEGORY_ID_ASC
    // For the primary key field (typically 'id'), use PRIMARY_KEY instead of ID
    if (sorter.field.toLowerCase() === 'id') {
      return `PRIMARY_KEY_${sorter.order.toUpperCase()}`;
    }
    
    // Convert camelCase to SCREAMING_SNAKE_CASE
    const fieldName = sorter.field
      .replace(/([a-z])([A-Z])/g, '$1_$2') // Insert underscore before capital letters
      .toUpperCase(); // Convert to uppercase
    return `${fieldName}_${sorter.order.toUpperCase()}`;
  });
}
