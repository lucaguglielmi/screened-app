import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchitecturePage } from '../ArchitecturePage';

describe('ArchitecturePage Component', () => {
  it('renders title, live badges, and D2 canvas', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText(/Screened System Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/8 ADK Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/WebMCP \+ Server MCP/i)).toBeInTheDocument();
    expect(screen.getByText(/Parallel 6-Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/D2 Architecture Schema/i)).toBeInTheDocument();
  });

  it('renders both Vector Diagram and D2 Source tabs and toggles between them', () => {
    render(<ArchitecturePage />);

    // Diagram tab should be active by default
    const img = screen.getByAltText(/Screened Architecture Schema/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/architecture-d2.svg');

    // Switch to D2 Source code tab
    const codeTabBtn = screen.getByRole('button', { name: /D2 Source/i });
    fireEvent.click(codeTabBtn);

    expect(screen.getByText(/direction: down/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ParallelAgent/i).length).toBeGreaterThan(0);

    // Switch back to Diagram tab
    const diagramTabBtn = screen.getByRole('button', { name: /Vector Diagram/i });
    fireEvent.click(diagramTabBtn);
    expect(screen.getByAltText(/Screened Architecture Schema/i)).toBeInTheDocument();
  });

  it('renders Dual-Protocol WebMCP vs Server MCP breakdown', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText(/Dual-Protocol Architecture: WebMCP vs Server MCP/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Browser WebMCP \(DOM Event Bus\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Headless Server MCP \(JSON-RPC 2.0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/screened_ask_dossier/i)).toBeInTheDocument();
    expect(screen.getByText(/webmcp:call/i)).toBeInTheDocument();
  });

  it('renders Google ADK agent roster and Parallel ground truth matrix', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText(/Google Agent Development Kit \(ADK\) Roster/i)).toBeInTheDocument();
    expect(screen.getByText(/ProducerDeskAgent/i)).toBeInTheDocument();
    expect(screen.getByText(/DisambiguatorAgent/i)).toBeInTheDocument();
    expect(screen.getByText(/DeepVettingCluster/i)).toBeInTheDocument();
    expect(screen.getByText(/Parallel Ground-Truth Evidence Engine/i)).toBeInTheDocument();
  });

  it('supports zoom controls', () => {
    render(<ArchitecturePage />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    const zoomInBtn = screen.getByTitle(/Zoom In/i);
    fireEvent.click(zoomInBtn);
    expect(screen.getByText('115%')).toBeInTheDocument();

    const resetBtn = screen.getByTitle(/Reset Zoom/i);
    fireEvent.click(resetBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
