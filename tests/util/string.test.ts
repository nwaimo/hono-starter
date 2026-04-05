import { describe, expect, test } from 'bun:test';
import { randomString } from '../../src/util/string';

describe('randomString', () => {
  test('generates string of correct length', () => {
    expect(randomString(10)).toHaveLength(10);
    expect(randomString(5)).toHaveLength(5);
    expect(randomString(1)).toHaveLength(1);
  });

  test('starts with a letter', () => {
    for (let i = 0; i < 100; i++) {
      expect(randomString(10)).toMatch(/^[a-zA-Z]/);
    }
  });

  test('contains only alphanumeric characters', () => {
    for (let i = 0; i < 100; i++) {
      expect(randomString(20)).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    }
  });
});
