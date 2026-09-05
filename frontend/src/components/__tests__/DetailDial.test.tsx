import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailDial } from '../DetailDial';

describe('DetailDial Component', () => {
  it('renders all three viewing density modes', () => {
    const onChange = vi.fn();
    render(<DetailDial density="FULL_EVIDENCE" onChange={onChange} />);

    expect(screen.getByRole('button', { name: /Short/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Full/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agent/i })).toBeInTheDocument();
  });

  it('triggers onChange with SIMPLIFIED when clicking Short button', () => {
    const onChange = vi.fn();
    render(<DetailDial density="FULL_EVIDENCE" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Short/i }));
    expect(onChange).toHaveBeenCalledWith('SIMPLIFIED');
  });

  it('triggers onChange with MACHINE_AI_INGESTION when clicking Agent button', () => {
    const onChange = vi.fn();
    render(<DetailDial density="FULL_EVIDENCE" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Agent/i }));
    expect(onChange).toHaveBeenCalledWith('MACHINE_AI_INGESTION');
  });

  it('triggers onChange with FULL_EVIDENCE when clicking Full button from Short mode', () => {
    const onChange = vi.fn();
    render(<DetailDial density="SIMPLIFIED" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Full/i }));
    expect(onChange).toHaveBeenCalledWith('FULL_EVIDENCE');
  });
});
