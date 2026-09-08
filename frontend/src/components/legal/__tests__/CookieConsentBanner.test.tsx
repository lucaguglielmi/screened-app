import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieConsentBanner } from '../CookieConsentBanner';

describe('CookieConsentBanner Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly when forceOpen is true', () => {
    render(<CookieConsentBanner forceOpen={true} />);

    expect(screen.getByText(/COOKIE & PRIVACY CHOICE/i)).toBeInTheDocument();
    expect(screen.getByText(/Accept Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Decline Non-Essential/i)).toBeInTheDocument();
  });

  it('saves "accepted" to localStorage when clicking Accept Analytics', () => {
    const handleClose = vi.fn();
    render(<CookieConsentBanner forceOpen={true} onClose={handleClose} />);

    const acceptBtn = screen.getByText(/Accept Analytics/i);
    fireEvent.click(acceptBtn);

    expect(localStorage.getItem('screened_cookie_consent')).toBe('accepted');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('saves "declined" to localStorage when clicking Decline Non-Essential', () => {
    const handleClose = vi.fn();
    render(<CookieConsentBanner forceOpen={true} onClose={handleClose} />);

    const declineBtn = screen.getByText(/Decline Non-Essential/i);
    fireEvent.click(declineBtn);

    expect(localStorage.getItem('screened_cookie_consent')).toBe('declined');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenPrivacy when clicking Privacy Policy link', () => {
    const handleOpenPrivacy = vi.fn();
    render(<CookieConsentBanner forceOpen={true} onOpenPrivacy={handleOpenPrivacy} />);

    const privacyLink = screen.getByText(/Privacy Policy →/i);
    fireEvent.click(privacyLink);

    expect(handleOpenPrivacy).toHaveBeenCalledTimes(1);
  });
});
