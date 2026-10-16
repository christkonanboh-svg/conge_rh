import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'conge_rh';

  private fullKey(key: string): string {
    return `${this.prefix}.${key}`;
  }

  private get storage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }

  get<T>(key: string): T | null {
    const storage = this.storage;
    if (!storage) {
      return null;
    }
    try {
      const raw = storage.getItem(this.fullKey(key));
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    const storage = this.storage;
    if (!storage) {
      return false;
    }
    try {
      storage.setItem(this.fullKey(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(this.fullKey(key));
    } catch {
      // ignore
    }
  }

  has(key: string): boolean {
    const storage = this.storage;
    if (!storage) {
      return false;
    }
    try {
      return storage.getItem(this.fullKey(key)) !== null;
    } catch {
      return false;
    }
  }

  clear(): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }
    try {
      const keysToRemove: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && key.startsWith(`${this.prefix}.`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch {
      // ignore
    }
  }
}
