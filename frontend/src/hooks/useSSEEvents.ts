import { useState, useEffect } from 'react';
import { ActivityEvent, CandidateEntity, Investigation } from '../types/investigation';

export interface UseSSEEventsOptions {
  investigation: Investigation | null;
  onCandidatesFound?: (candidates: CandidateEntity[]) => void;
  onDossierReady?: (invId: string, invQuery: string) => void;
  onStatusChange?: (status: Investigation['status']) => void;
  onError?: (errorMessage: string) => void;
  onReconnectRequired?: (invId: string) => void;
}

export function useSSEEvents({
  investigation,
  onCandidatesFound,
  onDossierReady,
  onStatusChange,
  onError,
  onReconnectRequired,
}: UseSSEEventsOptions) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!investigation?.id) return;
    if (investigation.status === 'READY') return;

    const invId = investigation.id;
    const invQuery = investigation.query;

    const eventSource = new EventSource(`/api/investigations/${invId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const activityEvent: ActivityEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, activityEvent]);

        if (activityEvent.eventType === 'CANDIDATES_FOUND' && activityEvent.details?.candidates) {
          onCandidatesFound?.(activityEvent.details.candidates);
        } else if (activityEvent.eventType === 'DOSSIER_READY') {
          eventSource.close();
          onDossierReady?.(invId, invQuery);
        } else if (activityEvent.eventType === 'PLANNING_STARTED') {
          onStatusChange?.('PLANNING');
        } else if (activityEvent.eventType === 'DOMAIN_SEARCH_STARTED') {
          onStatusChange?.('RESEARCHING');
        } else if (activityEvent.eventType === 'CONTRADICTIONS_ANALYZING') {
          onStatusChange?.('ANALYZING_CONTRADICTIONS');
        } else if (activityEvent.eventType === 'DOSSIER_SYNTHESIZING') {
          onStatusChange?.('ASSEMBLING_DOSSIER');
        } else if (activityEvent.eventType === 'ERROR') {
          console.error('Investigation Error Event Received:', activityEvent);
          onStatusChange?.('FAILED');
          onError?.(activityEvent.message || 'An error occurred during the investigation.');
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = () => {
      // Re-fetch current investigation status on connection glitch
      onReconnectRequired?.(invId);
    };

    return () => {
      eventSource.close();
    };
  }, [
    investigation?.id,
    investigation?.query,
    investigation?.status,
    onCandidatesFound,
    onDossierReady,
    onStatusChange,
    onError,
    onReconnectRequired,
  ]);

  return {
    events,
    setEvents,
  };
}
