export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  } else {
    // Fallback for development/testing
    console.debug(`[Analytics Event] ${eventName}`, params);
  }
};

export const trackError = (error: Error, errorInfo?: any) => {
  trackEvent('fatal_client_error', {
    error_message: error.message,
    error_stack: error.stack,
    error_info: errorInfo,
  });
};
