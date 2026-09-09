export type AnalyticsEvent =
  | {
      event: 'playground_password_entered';
      params: {
        timestamp: string;
        status: 'success' | 'failed';
        page: string;
        attempt_count: number;
        user_timezone: string;
      };
    }
  | {
      event: 'page_view';
      params: {
        page_path: string;
        page_title: string;
        page_location?: string;
      };
    }
  | {
      event: 'user_click';
      params: {
        element_text: string;
        element_role: string;
        element_id?: string;
        link_target?: string;
        page_path: string;
      };
    }
  | {
      event: 'investigation_started';
      params: {
        entry_point: 'search_form' | 'starter_chip' | 'command_palette' | 'chat_prompt';
        query_length: number;
        has_optional_url: boolean;
      };
    }
  | {
      event: 'deep_screen_launched';
      params: {
        source_tool: 'chat' | 'scout' | 'command_palette' | 'grant_scout';
        query_length: number;
        target_provided: boolean;
      };
    }
  | {
      event: 'dossier_exported';
      params: {
        investigation_id: string;
        export_format: 'markdown' | 'pdf';
        claim_count: number;
      };
    }
  | {
      event: 'tool_selected';
      params: {
        tool_name: string;
        source: string;
      };
    }
  | {
      event: 'quick_action_clicked';
      params: {
        action_name: string;
      };
    }
  | {
      event: 'feedback_submitted';
      params: {
        rating: number;
        has_comment: boolean;
      };
    }
  | {
      event: 'cookie_consent_decided';
      params: {
        decision: 'accepted' | 'rejected';
      };
    };

interface GtagWindow extends Window {
  gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
  dataLayer?: unknown[];
}

export const track = <T extends AnalyticsEvent['event']>(
  eventName: T,
  params: Extract<AnalyticsEvent, { event: T }>['params']
) => {
  if (typeof window === 'undefined') return;
  const win = window as unknown as GtagWindow;

  const payload: Record<string, unknown> = {
    ...(params as Record<string, unknown>),
    page_path: window.location.pathname,
    client_timestamp: new Date().toISOString(),
  };

  if (typeof win.gtag === 'function') {
    win.gtag('event', eventName, payload);
  } else if (Array.isArray(win.dataLayer)) {
    win.dataLayer.push(['event', eventName, payload]);
  } else {
    // Fallback for development/testing
    console.debug(`[Analytics Event: ${eventName}]`, payload);
  }
};

export const trackCustom = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  const win = window as unknown as GtagWindow;
  const payload = {
    ...params,
    page_path: window.location.pathname,
    client_timestamp: new Date().toISOString(),
  };

  if (typeof win.gtag === 'function') {
    win.gtag('event', eventName, payload);
  } else if (Array.isArray(win.dataLayer)) {
    win.dataLayer.push(['event', eventName, payload]);
  } else {
    console.debug(`[Analytics Custom Event: ${eventName}]`, payload);
  }
};

/**
 * Automatically tracks SPA virtual pageviews when browser history or custom router emits changes.
 */
export const initAutoPageviewTracking = () => {
  if (typeof window === 'undefined') return;
  let lastPath = '';

  const sendPageView = () => {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath === lastPath) return;
    lastPath = currentPath;

    track('page_view', {
      page_path: currentPath,
      page_title: document.title || 'Screened',
      page_location: window.location.href,
    });
  };

  // Immediate send on load
  sendPageView();

  // Listen to popstate and screened:navigate
  window.addEventListener('popstate', sendPageView);
  window.addEventListener('screened:navigate', sendPageView);
};

/**
 * Global click interceptor to track user engagement across all buttons, tabs, and links.
 */
export const initAutoClickTracking = () => {
  if (typeof window === 'undefined') return;

  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive element
      const interactiveEl = target.closest('button, a, [role="button"], input[type="submit"]');
      if (!interactiveEl) return;

      // Strictly ignore password inputs for user privacy
      if (
        interactiveEl.tagName === 'INPUT' &&
        (interactiveEl as HTMLInputElement).type === 'password'
      ) {
        return;
      }

      const text = (
        interactiveEl.textContent ||
        (interactiveEl as HTMLInputElement).value ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50);

      const ariaLabel = interactiveEl.getAttribute('aria-label') || '';
      const elementId = interactiveEl.id || '';
      const elementRole =
        interactiveEl.getAttribute('role') || interactiveEl.tagName.toLowerCase();
      const href = interactiveEl.getAttribute('href') || undefined;

      // Avoid noise on unlabeled empty elements
      if (!text && !ariaLabel && !elementId) return;

      track('user_click', {
        element_text: text || ariaLabel || elementId || 'interactive_element',
        element_role: elementRole,
        element_id: elementId || undefined,
        link_target: href,
        page_path: window.location.pathname,
      });
    },
    { passive: true }
  );
};
