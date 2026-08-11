import { useEffect, useState } from 'react';
import { fetchApplicants } from '../../../services/hiringPipelineService';
import type { Applicant } from '../../../types';

interface UseHiringPipelineDataResult {
  candidates: Applicant[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches the full active candidate set used by the hiring-pipeline screen
 * for analytical views (mind map, summary widgets).
 *
 * This intentionally does NOT mirror the list/grid's filtered view — the
 * mind map needs the unfiltered cohort to compute meaningful "where are
 * candidates concentrated" insights. We ask the API for a large page so
 * almost every candidate is included in a single round-trip.
 */
export const useHiringPipelineData = (): UseHiringPipelineDataResult => {
  const [candidates, setCandidates] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchApplicants({
          status: 'all',
          page: 1,
          pageSize: 500,
          sort: 'appliedAt:desc',
        });
        if (!cancelled) setCandidates(result.items);
      } catch {
        if (!cancelled) {
          setError('Failed to load pipeline distribution.');
          setCandidates([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { candidates, isLoading, error };
};
