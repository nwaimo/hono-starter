import { describe, expect, test } from 'bun:test';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT, getOffset, paginate } from '../../src/lib/pagination';

describe('pagination', () => {
  test('getOffset calculates correctly', () => {
    expect(getOffset(1, 20)).toBe(0);
    expect(getOffset(2, 20)).toBe(20);
    expect(getOffset(3, 10)).toBe(20);
    expect(getOffset(1, 10)).toBe(0);
  });

  test('paginate builds correct response', () => {
    const result = paginate(['a', 'b', 'c'], 10, { page: 1, limit: 3 });
    expect(result.data).toEqual(['a', 'b', 'c']);
    expect(result.pagination.total).toBe(10);
    expect(result.pagination.totalPages).toBe(4);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(3);
  });

  test('paginate handles single page', () => {
    const result = paginate([1, 2], 2, { page: 1, limit: 10 });
    expect(result.pagination.totalPages).toBe(1);
  });

  test('paginate handles empty results', () => {
    const result = paginate([], 0, { page: 1, limit: 20 });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  test('defaults are set', () => {
    expect(DEFAULT_PAGE).toBe(1);
    expect(DEFAULT_LIMIT).toBe(20);
    expect(MAX_LIMIT).toBe(100);
  });
});
