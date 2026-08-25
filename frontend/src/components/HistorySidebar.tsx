import React, { useState, useEffect } from 'react';
import { History, X, Search, Clock, ChevronRight } from 'lucide-react';
import { Investigation } from '../types/investigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectInvestigation: (id: string) => void;
}

export const HistorySidebar: React.FC<Props> = ({ isOpen, onClose, onSelectInvestigation }) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadHistory = async () => {
      try {
        const saved = localStorage.getItem('screened_investigation_ids');
        if (!saved) return;

        const ids: string[] = JSON.parse(saved);
        if (ids.length === 0) return;

        setLoading(true);
        const res = await fetch('/api/investigations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ids),
        });

        if (res.ok) {
          const data: Investigation[] = await res.json();
          // Sort descending by createdAt assuming ID is a timestamp or we have createdAt
          setInvestigations(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 w-full sm:w-96 bg-darkroom-surface border-l border-darkroom-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-darkroom-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-5 text-indigo-500" />
            <h2 className="font-semibold text-darkroom-text">Past Searches</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-paper-bg hover:bg-darkroom-bg text-paper-muted hover:text-paper-text transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-darkroom-muted">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : investigations.length === 0 ? (
            <div className="text-center py-10 text-darkroom-muted space-y-2">
              <Search className="size-8 mx-auto opacity-50" />
              <p>No past searches found.</p>
            </div>
          ) : (
            investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => {
                  onSelectInvestigation(inv.id);
                  onClose();
                }}
                className="w-full p-4 rounded-xl border border-darkroom-border hover:border-indigo-500/50 bg-darkroom-bg text-left transition-all group flex flex-col gap-2 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-darkroom-text group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {inv.confirmedEntity?.name || inv.query}
                  </h3>
                  <ChevronRight className="size-4 text-darkroom-muted group-hover:translate-x-1 transition-transform shrink-0" />
                </div>

                <div className="flex items-center gap-3 text-xs text-darkroom-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono font-medium ${
                      inv.status === 'READY'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : inv.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
