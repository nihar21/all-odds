import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class CacheService {
    private cache: Map<string, any> = new Map();
  
    set(key: string, data: any): void {
      this.cache.set(key, data);
    }
  
    get(key: string): any | null {
      return this.cache.get(key) || null;
    }

    cacheRequest<T>(key: string, observable: Observable<T>): Observable<T> {
      const cachedData = this.get(key);
      if (cachedData) {
        return of(cachedData);
      }
      return observable.pipe(
        tap(data => this.set(key, data))
      );
    }
  
    has(key: string): boolean {
      return this.cache.has(key);
    }
  
    clear(key: string): void {
      this.cache.delete(key);
    }
  
    removeKey(key: string): void {
      this.cache.delete(key);
    }

    clearAll(): void {
      this.cache.clear();
    }
  }
  