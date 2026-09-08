import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchitecturePage } from '../ArchitecturePage';

describe('ArchitecturePage Component', () => {
  it('renders title and live badges', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText(/Screened System Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/8 ADK Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/WebMCP \+ Server MCP/i)).toBeInTheDocument();
    expect(screen.getByText(/Parallel Engine/i)).toBeInTheDocument();
  });

  it('renders ReactFlow interactive canvas', () => {
    const { container } = render(<ArchitecturePage />);
    expect(container.querySelector('.react-flow')).toBeInTheDocument();
  });

  it('renders security guardrails and infrastructure cards', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText(/Cryptographic Integrity & Security Guardrails/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Cloud Production Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Cloud Run/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Cloud Firestore/i)).toBeInTheDocument();
  });
});
