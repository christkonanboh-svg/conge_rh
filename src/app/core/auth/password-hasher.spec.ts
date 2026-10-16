import { describe, it, expect } from 'vitest';
import { PasswordHasher } from './password-hasher';

describe('PasswordHasher', () => {
  it('should hash and verify password', async () => {
    const hasher = new PasswordHasher();
    const password = 'secret1234';
    const hashed = await hasher.hash(password);
    expect(hashed.hash).not.toBe(password);
    const isValid = await hasher.verify(password, hashed);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hasher = new PasswordHasher();
    const password = 'secret1234';
    const hashed = await hasher.hash(password);
    const isValid = await hasher.verify('wrong', hashed);
    expect(isValid).toBe(false);
  });

  it('should produce unique salts', async () => {
    const hasher = new PasswordHasher();
    const h1 = await hasher.hash('pass1');
    const h2 = await hasher.hash('pass1');
    expect(h1.salt).not.toBe(h2.salt);
  });
});
