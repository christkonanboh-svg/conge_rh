import { Injectable } from '@angular/core';

export interface HashedPassword {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: 'PBKDF2';
}

@Injectable({ providedIn: 'root' })
export class PasswordHasher {
  private readonly iterations = 100000;
  private readonly keyLength = 256;

  async hash(password: string, salt?: Uint8Array): Promise<HashedPassword> {
    const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(16));
    const passwordBuffer = new TextEncoder().encode(password);

    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes as BufferSource,
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      key,
      this.keyLength
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    const saltBase64 = btoa(String.fromCharCode(...saltBytes));

    return {
      hash: hashBase64,
      salt: saltBase64,
      iterations: this.iterations,
      algorithm: 'PBKDF2',
    };
  }

  async verify(password: string, stored: HashedPassword): Promise<boolean> {
    if (stored.algorithm !== 'PBKDF2') {
      return false;
    }
    try {
      const saltBytes = this.base64ToUint8(stored.salt);
      const newHash = await this.hash(password, saltBytes);
      return newHash.hash === stored.hash;
    } catch {
      return false;
    }
  }

  private base64ToUint8(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
