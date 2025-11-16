import React from 'react';

export const AnalysisResultSkeleton: React.FC = () => (
  <>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Latest Analysis
      </h2>
      <div className="h-8 w-28 bg-slate-700/50 rounded-lg animate-pulse"></div>
    </div>

    <div className="overflow-y-auto pr-2">
      <div className="relative w-full aspect-video bg-slate-800 rounded-xl shadow-lg animate-pulse mb-6"></div>

      <div className="bg-slate-800/50 rounded-lg p-4 mb-4 animate-pulse">
        <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
        <div className="h-12 w-1/2 bg-slate-700 rounded mt-2"></div>
      </div>
      
      <div className="space-y-3">
        <div className="h-4 w-1/4 bg-slate-700 rounded animate-pulse mb-2"></div>
        <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      <div className="mt-4 bg-slate-800/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 w-1/4 bg-slate-700 rounded mb-3"></div>
        <div className="h-6 w-3/4 bg-slate-700 rounded mb-2"></div>
        <div className="h-6 w-2/3 bg-slate-700 rounded"></div>
      </div>

      <div className="mt-4 bg-slate-800/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 w-1/4 bg-slate-700 rounded mb-3"></div>
        <div className="h-20 w-full bg-slate-900/70 rounded-md"></div>
      </div>
    </div>
  </>
);
