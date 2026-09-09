import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  PlaygroundPasswordGate,
  PLAYGROUND_AUTH_STORAGE_KEY,
  PLAYGROUND_SESSION_STORAGE_KEY,
  HONEYPOT_PASSWORD,
} from '../PlaygroundPasswordGate';
import * as analytics from '../../../utils/analytics';

describe('PlaygroundPasswordGate Component', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders password prompt when not authorized', () => {
    render(
      <PlaygroundPasswordGate>
        <div data-testid="protected-content">Secret Workbench</div>
      </PlaygroundPasswordGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/Design Playground Access/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password.../i)).toBeInTheDocument();
  });

  it('rejects incorrect password and logs failed attempt to GA', () => {
    const trackSpy = vi.spyOn(analytics, 'track');

    render(
      <PlaygroundPasswordGate>
        <div data-testid="protected-content">Secret Workbench</div>
      </PlaygroundPasswordGate>
    );

    const input = screen.getByPlaceholderText(/Enter password.../i);
    const submitBtn = screen.getByRole('button', { name: /Unlock Sandbox/i });

    fireEvent.change(input, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitBtn);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/Access Denied: Incorrect authorization key/i)).toBeInTheDocument();
    expect(trackSpy).toHaveBeenCalledWith(
      'playground_password_entered',
      expect.objectContaining({
        status: 'failed',
        attempt_count: 1,
      })
    );
  });

  it('accepts correct honeypotpassword, stores authorization, logs to GA, and displays content', () => {
    const trackSpy = vi.spyOn(analytics, 'track');

    render(
      <PlaygroundPasswordGate>
        <div data-testid="protected-content">Secret Workbench</div>
      </PlaygroundPasswordGate>
    );

    const input = screen.getByPlaceholderText(/Enter password.../i);
    const submitBtn = screen.getByRole('button', { name: /Unlock Sandbox/i });

    fireEvent.change(input, { target: { value: HONEYPOT_PASSWORD } });
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(sessionStorage.getItem(PLAYGROUND_SESSION_STORAGE_KEY)).toBe(HONEYPOT_PASSWORD);
    
    const expiry = Number(localStorage.getItem(PLAYGROUND_AUTH_STORAGE_KEY));
    expect(expiry).toBeGreaterThan(Date.now() + 360 * 24 * 60 * 60 * 1000);

    expect(trackSpy).toHaveBeenCalledWith(
      'playground_password_entered',
      expect.objectContaining({
        status: 'success',
      })
    );
  });

  it('immediately unlocks content if valid 1-year token exists in localStorage', () => {
    localStorage.setItem(
      PLAYGROUND_AUTH_STORAGE_KEY,
      String(Date.now() + 300 * 24 * 60 * 60 * 1000)
    );

    render(
      <PlaygroundPasswordGate>
        <div data-testid="protected-content">Secret Workbench</div>
      </PlaygroundPasswordGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
