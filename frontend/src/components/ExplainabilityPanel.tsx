'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2 } from 'lucide-react';

interface ExplainabilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any | null;
}

export function ExplainabilityPanel({ isOpen, onClose, candidate }: ExplainabilityPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Explainability Report
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {candidate ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500">Candidate ID</p>
                    <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {candidate.candidate_id ?? candidate['Candidate ID'] ?? candidate.CandidateID ?? candidate.id ?? 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Rank</p>
                      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        #{candidate.Rank ?? candidate.rank ?? 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Fit Score</p>
                      <p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                        {typeof candidate.Score === 'number' ? candidate.Score.toFixed(4) : 
                         typeof candidate['Fit Score'] === 'number' ? candidate['Fit Score'].toFixed(4) : 
                         typeof candidate.score === 'number' ? candidate.score.toFixed(4) : 
                         candidate.score ?? 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                      Semantic Match Evidence
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">AI Analysis</p>
                        <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 leading-relaxed">
                          {(candidate.Rank ?? candidate.rank) === 1 ? (
                            "This candidate is ranked highest because their semantic vector representation has the strongest mathematical alignment with the combined Job Description and Redrob Signals. The cross-encoder contextually mapped their experience to the core requirements better than any other profile in the pool."
                          ) : (candidate.Rank ?? candidate.rank) <= 5 ? (
                            `This candidate is ranked #${candidate.Rank ?? candidate.rank} due to a very high contextual overlap score. While not the absolute top match, their profile strongly aligns with the key technical requirements and soft-skill signals identified by the AI.`
                          ) : (
                            `This candidate is ranked #${candidate.Rank ?? candidate.rank}. The cross-encoder identified partial semantic alignments with the job requirements, resulting in a moderate fit score compared to the rest of the candidate pool.`
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Job Description Context</p>
                        <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                          {candidate.jd_text || 'No job description context provided.'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Candidate Profile Extract</p>
                        <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed max-h-64 overflow-y-auto">
                          {candidate.raw_profile ? (
                            <pre className="font-mono text-xs whitespace-pre-wrap">
                              {JSON.stringify(candidate.raw_profile, null, 2)}
                            </pre>
                          ) : (
                            'No profile data available.'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No candidate selected.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
