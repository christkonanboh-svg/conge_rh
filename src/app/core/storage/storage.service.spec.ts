import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
    // clear all prefixed keys
    localStorage.clear();
  });

  it('should write and read values', () => {
    const result = storage.set('foo', { a: 1 });
    expect(result).toBe(true);
    expect(storage.get('foo')).toEqual({ a: 1 });
  });

  it('should return null for missing key', () => {
    expect(storage.get('missing')).toBeNull();
  });

  it('should remove key', () => {
    storage.set('foo', { a: 1 });
    storage.remove('foo');
    expect(storage.get('foo')).toBeNull();
  });

  it('should detect corrupt data as null', () => {
    localStorage.setItem('conge_rh.foo', '{ invalid json');
    expect(storage.get('foo')).toBeNull();
  });

  it('should check existence', () => {
    expect(storage.has('foo')).toBe(false);
    storage.set('foo', 1);
    expect(storage.has('foo')).toBe(true);
  });
});
