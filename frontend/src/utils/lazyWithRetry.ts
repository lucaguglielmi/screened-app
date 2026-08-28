/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced React.lazy wrapper that automatically catches chunk load errors (e.g. from new deployments)
 * and safely force-refreshes the page once to retrieve the new bundle assets.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: any }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasBeenRefreshed = sessionStorage.getItem('chunk_retry_refreshed') === 'true';

    try {
      const module = await factory();
      sessionStorage.setItem('chunk_retry_refreshed', 'false');
      if ('default' in module && module.default) {
        return { default: module.default as T };
      }
      return module as { default: T };
    } catch (error: unknown) {
      console.warn('Lazy chunk load failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      const isChunkError =
        message.includes('dynamically imported module') ||
        message.includes('Loading chunk') ||
        message.includes('Importing a module script failed') ||
        message.includes('error loading dynamically imported module');

      if (isChunkError && !pageHasBeenRefreshed) {
        sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        // Return a promise that never resolves while the page is reloading
        return new Promise<{ default: T }>(() => {});
      }

      throw error;
    }
  });
}
