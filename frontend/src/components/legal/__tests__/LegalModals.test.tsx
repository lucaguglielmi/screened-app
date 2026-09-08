import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TermsModal } from '../TermsModal';
import { PrivacyModal } from '../PrivacyModal';

describe('TermsModal Component', () => {
  it('renders terms content when open', () => {
    const handleClose = vi.fn();
    render(<TermsModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Screened Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Nature of the Service & Investigative Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Filmmaker Intellectual Property & Creative Asset Guarantee/i)).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<TermsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Screened Terms of Service/i)).not.toBeInTheDocument();
  });
});

describe('PrivacyModal Component', () => {
  it('renders privacy policy by default when open', () => {
    const handleClose = vi.fn();
    render(<PrivacyModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Screened Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Strict Data Minimization Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Data Controller & Contact Information/i)).toBeInTheDocument();
  });

  it('switches to cookies tab when clicked', () => {
    render(<PrivacyModal isOpen={true} onClose={vi.fn()} />);

    const cookieTab = screen.getByText(/Cookies & Local Storage/i);
    fireEvent.click(cookieTab);

    expect(screen.getByText(/Strictly Necessary Storage/i)).toBeInTheDocument();
    expect(screen.getByText(/screened_theme/i)).toBeInTheDocument();
  });
});
