import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { StoredUser } from '../auth/auth.models';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly usersKey = 'users';

  constructor(private readonly storage: StorageService) {}

  list(): StoredUser[] {
    const users = this.storage.get<StoredUser[]>(this.usersKey);
    return Array.isArray(users) ? users : [];
  }

  findById(id: string): StoredUser | null {
    return this.list().find((user) => user.id === id) ?? null;
  }

  findByEmail(email: string): StoredUser | null {
    const normalized = email.trim().toLowerCase();
    return this.list().find((user) => user.email === normalized) ?? null;
  }

  add(user: StoredUser): StoredUser {
    this.storage.set(this.usersKey, [...this.list(), user]);
    return user;
  }

  update(user: StoredUser): boolean {
    const users = this.list();
    const index = users.findIndex((existing) => existing.id === user.id);
    if (index === -1) {
      return false;
    }
    const next = [...users];
    next[index] = user;
    this.storage.set(this.usersKey, next);
    return true;
  }

  remove(id: string): boolean {
    const users = this.list();
    const next = users.filter((user) => user.id !== id);
    if (next.length === users.length) {
      return false;
    }
    this.storage.set(this.usersKey, next);
    return true;
  }

  replaceAll(users: StoredUser[]): void {
    this.storage.set(this.usersKey, users);
  }
}
