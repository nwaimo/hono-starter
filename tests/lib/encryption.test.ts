import { describe, expect, test } from 'bun:test';
import { hash, verify } from '../../src/lib/encryption';

describe('encryption', () => {
  test('hash returns an argon2 hash', async () => {
    const hashed = await hash('password123');
    expect(hashed).toStartWith('$argon2');
  });

  test('verify returns true for correct password', async () => {
    const hashed = await hash('password123');
    const result = await verify('password123', hashed);
    expect(result).toBe(true);
  });

  test('verify returns false for incorrect password', async () => {
    const hashed = await hash('password123');
    const result = await verify('wrongpassword', hashed);
    expect(result).toBe(false);
  });

  test('hash produces different outputs for same input', async () => {
    const hash1 = await hash('password123');
    const hash2 = await hash('password123');
    expect(hash1).not.toBe(hash2);
  });
});
