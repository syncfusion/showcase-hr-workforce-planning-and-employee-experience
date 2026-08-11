import React from 'react';
import { PageHeader } from '../../components/Layout';
import { CandidatesView } from './CandidatesView';
import { CandidatesMindMap } from './CandidatesMindMap';
import { useHiringPipelineData } from './hooks/useHiringPipelineData';

export const HiringPipeline: React.FC = () => {
  // Share the same candidate list the list/grid is showing, so the mind map
  // reflects exactly what the recruiter is looking at.
  const { candidates, isLoading } = useHiringPipelineData();

  return (
    <div className="hiring-pipeline-screen">
      <PageHeader
        title="Hiring Pipeline"
        subtitle="Visualize requisition flow and identify bottlenecks"
      />
      <CandidatesView />
      <CandidatesMindMap candidates={candidates} isLoading={isLoading} />

      <style>{`
        .hiring-pipeline-screen {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hiring-pipeline-screen { animation: none; }
        }
      `}</style>
    </div>
  );
};
