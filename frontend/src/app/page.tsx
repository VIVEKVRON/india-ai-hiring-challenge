'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/Dropzone';
import { ResultsTable, CandidateResult } from '@/components/ResultsTable';
import { ExplainabilityPanel } from '@/components/ExplainabilityPanel';
import { Activity, Play, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type PipelineStatus = 'idle' | 'uploading' | 'stage1' | 'stage2' | 'complete' | 'error';

export default function Home() {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [poolFile, setPoolFile] = useState<File | null>(null);
  const [signalsFile, setSignalsFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<CandidateResult[]>([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  const handleRunPipeline = async () => {
    if (!jdFile || !poolFile || !signalsFile) {
      setErrorMsg('Please upload all required files before running the pipeline.');
      return;
    }

    setErrorMsg(null);
    setStatus('uploading');
    
    // Create FormData
    const formData = new FormData();
    formData.append('job_description', jdFile);
    formData.append('candidate_pool', poolFile);
    formData.append('redrob_signals', signalsFile);

    try {
      // Fake staging steps for UI
      setTimeout(() => setStatus('stage1'), 1500);
      
      const response = await fetch('http://127.0.0.1:5000/api/run-pipeline', {
        method: 'POST',
        body: formData,
      });

      // Show stage 2 before resolving completely if it returns very fast
      setStatus('stage2');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run pipeline');
      }

      setResults(data.results);
      setStatus('complete');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const isReady = jdFile && poolFile && signalsFile && status === 'idle';
  const isRunning = ['uploading', 'stage1', 'stage2'].includes(status);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Semantic Syntax ATS</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 space-y-12 py-10">
        
        {/* Data Ingestion Zone */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium tracking-tight">Data Ingestion</h2>
            <p className="text-sm text-zinc-500 mt-1">Upload the required context files to begin the ranking process.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Dropzone 
              label="Job Description (.docx)" 
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              file={jdFile} 
              onFileSelect={setJdFile} 
            />
            <Dropzone 
              label="Candidate Pool (.jsonl)" 
              accept=".jsonl,application/json,text/plain"
              file={poolFile} 
              onFileSelect={setPoolFile} 
            />
            <Dropzone 
              label="Redrob Signals (.docx)" 
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              file={signalsFile} 
              onFileSelect={setSignalsFile} 
            />
          </div>
          
          {errorMsg && (
            <div className="flex items-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </section>

        {/* Execution Controls */}
        <section className="flex flex-col items-center justify-center py-6">
          <button
            onClick={handleRunPipeline}
            disabled={!isReady && !isRunning}
            className={cn(
              "relative group overflow-hidden rounded-full px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 flex items-center justify-center min-w-[240px]",
              isReady 
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-95 cursor-pointer" 
                : isRunning
                  ? "bg-zinc-800 cursor-default"
                  : "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
            )}
          >
            {isRunning ? (
              <div className="flex flex-col items-center">
                <span className="text-sm">
                  {status === 'uploading' && 'Uploading Data...'}
                  {status === 'stage1' && 'Stage 1: Bi-Encoder Dense Retrieval (Processing...)'}
                  {status === 'stage2' && 'Stage 2: Cross-Encoder Contextual Reranking (Pending...)'}
                </span>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full animate-pulse" />
              </div>
            ) : (
              <span className="flex items-center text-lg">
                Run AI Ranking
                <Play className="ml-2 w-5 h-5 fill-current" />
              </span>
            )}
          </button>
        </section>

        {/* Results Dashboard */}
        {status === 'complete' && results.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Ranking Results</h2>
              <p className="text-sm text-zinc-500 mt-1">Context-aware candidate matches sorted by AI fit score.</p>
            </div>
            
            <ResultsTable 
              results={results} 
              onViewDetails={(candidate) => setSelectedCandidate(candidate)} 
            />
          </section>
        )}
      </main>

      <ExplainabilityPanel 
        isOpen={!!selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        candidate={selectedCandidate}
      />
    </div>
  );
}
