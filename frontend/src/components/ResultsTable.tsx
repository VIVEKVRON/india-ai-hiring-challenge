'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface CandidateResult {
  'Candidate ID'?: string;
  CandidateID?: string;
  id?: string;
  Rank?: number;
  rank?: number;
  'Fit Score'?: number;
  Score?: number;
  score?: number;
  [key: string]: any;
}

interface ResultsTableProps {
  results: CandidateResult[];
  onViewDetails: (candidate: CandidateResult) => void;
}

export function ResultsTable({ results, onViewDetails }: ResultsTableProps) {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 uppercase border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Rank</th>
              <th scope="col" className="px-6 py-4 font-medium">Candidate ID</th>
              <th scope="col" className="px-6 py-4 font-medium">AI Fit Score</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((candidate, index) => {
              const rank = candidate.Rank ?? candidate.rank ?? index + 1;
              const id = candidate['Candidate ID'] ?? candidate.CandidateID ?? candidate.id ?? `CAND-${index}`;
              const score = candidate['Fit Score'] ?? candidate.Score ?? candidate.score ?? 'N/A';
              
              // Formatting score if it's a number
              const displayScore = typeof score === 'number' ? score.toFixed(4) : score;

              return (
                <tr 
                  key={index} 
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(candidate)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100">
                    {id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {displayScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(candidate);
                      }}
                      className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Details
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
