/**
 * PWA & Push Notification Utilities for Screened.
 * Handles Progressive Web App standalone detection, browser push permissions,
 * and reliable cross-platform alert triggers via Service Worker (mobile PWA) and Notification API.
 */

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  const isAndroidApp = document.referrer?.includes('android-app://') || false;
  return isStandalone || isIosStandalone || isAndroidApp;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'default';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'default';
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'default';
  }
}

export async function triggerAppNotification(
  title: string,
  options?: NotificationOptions,
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icon.svg',
    badge: '/icon.svg',
    ...options,
  };

  // 1. In PWA & mobile Chrome/Safari, use service worker showNotification
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (err) {
      console.warn('ServiceWorker showNotification failed, attempting window fallback:', err);
    }
  }

  // 2. Standard window Notification fallback (desktop browsers)
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.warn('Window Notification constructor failed:', err);
    return false;
  }
}
