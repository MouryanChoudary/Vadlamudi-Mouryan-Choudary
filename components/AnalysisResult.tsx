import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import type { AnalysisData, Pipe, PipeSize, InventorySyncStatus } from '../types';
import { Spinner } from './Spinner';
import { AnalysisResultSkeleton } from './AnalysisResultSkeleton';
import { CorrectionInterface } from './CorrectionInterface';

interface AnalysisResultProps {
  analysisData: AnalysisData | null;
  isAnalyzing: boolean;
  onExportPDF: () => void;
  onNotesChange: (newNotes: string) => void;
  inventorySyncStatus: InventorySyncStatus;
  onSyncInventory: () => void;
  onUpdateAnalysis: (updatedData: AnalysisData) => void;
  onFeedbackSubmit: () => void;
}

const BoundingBox: React.FC<{ pipe: Pipe; isLowConfidence: boolean }> = ({ pipe, isLowConfidence }) => {
  const { x, y, width, height } = pipe.boundingBox;
  
  const borderStyle = isLowConfidence
    ? 'border-yellow-400 border-2 border-dashed'
    : 'border-cyan-400 border-2';

  return (
    <div
      className={`absolute rounded-sm ${borderStyle}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      title={`${pipe.size} (Confidence: ${pipe.confidence.toFixed(2)})`}
    ></div>
  );
};

const InventorySync: React.FC<{ status: InventorySyncStatus; onSync: () => void; disabled: boolean; }> = ({ status, onSync, disabled }) => {
  let content;
  const buttonClasses = "text-sm bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed";

  switch (status) {
    case 'syncing':
      content = <div className="flex items-center text-yellow-300"><Spinner /> <span className="ml-2">Syncing...</span></div>;
      break;
    case 'success':
      content = <p className="text-green-400">Inventory updated successfully.</p>;
      break;
    case 'error':
      content = (
        <div>
          <p className="text-red-400 mb-2">Inventory system temporarily unavailable. Try again.</p>
          <button onClick={onSync} className={buttonClasses} disabled={disabled}>Retry Sync</button>
        </div>
      );
      break;
    case 'idle':
    default:
      content = <button onClick={onSync} className={buttonClasses} disabled={disabled}>Sync Inventory</button>;
      break;
  }
  
  return (
    <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
      <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-semibold">Inventory Sync</h3>
      {content}
    </div>
  );
};

const AnalysisDetails: React.FC<{ analysisData: AnalysisData }> = ({ analysisData }) => {
  const { timestamp, location, overallConfidence, modelVersion } = analysisData;
  const { latitude, longitude } = location;

  const confidenceColor = overallConfidence > 0.85 ? 'text-green-400' : overallConfidence > 0.6 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
      <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3 font-semibold">Details</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className="text-slate-400 w-28">Timestamp:</span>
          <span className="text-slate-300 font-mono">{new Date(timestamp).toLocaleString()}</span>
        </div>
        <div className="flex items-center">
           <span className="text-slate-400 w-28">Location:</span>
           {latitude && longitude ? (
              <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:underline">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </a>
            ) : (<span className="text-slate-300 font-mono">Not available</span>)}
        </div>
        <div className="flex items-center">
          <span className="text-slate-400 w-28">AI Confidence:</span>
          <span className={`font-mono font-bold ${confidenceColor}`}>{`${(overallConfidence * 100).toFixed(1)}%`}</span>
        </div>
         <div className="flex items-center">
          <span className="text-slate-400 w-28">AI Model:</span>
          <span className="text-slate-300 font-mono">{modelVersion}</span>
        </div>
      </div>
    </div>
  );
};


export const AnalysisResult = forwardRef<HTMLDivElement, AnalysisResultProps>(({ analysisData, isAnalyzing, onExportPDF, onNotesChange, inventorySyncStatus, onSyncInventory, onUpdateAnalysis, onFeedbackSubmit }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasCorrections, setHasCorrections] = useState(false);

  useEffect(() => {
    // If a new analysis comes in, exit edit mode
    setIsEditing(false);
    setHasCorrections(false);
  }, [analysisData?.id]);

  useEffect(() => {
    // Automatically enter edit mode for manual entries
    if (analysisData?.modelVersion === 'Manual Entry') {
        setIsEditing(true);
    }
  }, [analysisData]);


  const handleSaveCorrections = (correctedData: AnalysisData) => {
    onUpdateAnalysis(correctedData);
    setIsEditing(false);
    setHasCorrections(true);
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
  }
  
  const renderContent = () => {
    if (isAnalyzing) {
      return <AnalysisResultSkeleton />;
    }

    if (!analysisData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h3 className="text-xl font-semibold mt-4 text-white">Latest Analysis</h3>
          <p className="text-slate-400 mt-1">Capture and analyze an image to see the results here.</p>
        </div>
      );
    }
    
    const { totalCount, countBySize, pipes, notes, imageDataUrl, isQueued, feedbackSubmitted } = analysisData;
    const isManual = analysisData.modelVersion === 'Manual Entry';
    const reportTitle = hasCorrections ? "Verified Report" : "AI Draft";

    if(isEditing) {
        return <CorrectionInterface 
            analysisData={analysisData} 
            onSave={handleSaveCorrections} 
            onCancel={handleCancelEdit} 
        />
    }

    return (
       <>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center">
              {isQueued ? 'Analysis Queued' : reportTitle}
            </h2>
            <div className="flex items-center space-x-2">
                {!isQueued && !isManual && (
                    <button onClick={() => setIsEditing(true)} className="text-sm bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        Edit Analysis
                    </button>
                )}
                <button onClick={onExportPDF} disabled={isQueued} className="text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export PDF
                </button>
            </div>
        </div>

        <div className="overflow-y-auto pr-2" ref={ref}>
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-slate-900 mb-6">
              <img src={imageDataUrl} alt="Analyzed pipes" className="w-full h-auto object-contain" />
              {pipes.map((pipe) => (
                <BoundingBox key={pipe.id} pipe={pipe} isLowConfidence={pipe.confidence < 0.8} />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Pipes</p>
                    <p className="text-5xl font-bold text-white">{isQueued ? '-' : totalCount}</p>
                </div>
                 <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Count by Size</p>
                    <div className="flex justify-around items-baseline mt-2">
                        {Object.entries(countBySize).map(([size, count]) => (
                            <div key={size} className="text-center">
                                <p className="text-3xl font-bold text-white">{isQueued ? '-' : count}</p>
                                <p className="text-xs text-slate-400">{size}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {!isQueued && <AnalysisDetails analysisData={analysisData} />}

            <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-semibold">Notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  className="w-full bg-slate-900/70 text-slate-300 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm resize-none"
                  rows={4}
                  placeholder="Add custom notes here..."
                  aria-label="Analysis Notes"
                  disabled={isQueued}
                />
            </div>
            
            {hasCorrections && !isManual && (
              <div className="mt-4 bg-blue-900/50 rounded-lg p-4">
                <h3 className="text-blue-300 text-sm uppercase tracking-wider mb-2 font-semibold">Active Learning</h3>
                {feedbackSubmitted ? (
                  <p className="text-blue-300">Thank you! Your corrections will improve the AI.</p>
                ) : (
                  <>
                  <p className="text-sm text-slate-300 mb-3">Help improve the AI by submitting your verified corrections for future model training.</p>
                  <button onClick={onFeedbackSubmit} className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-3 rounded-lg transition-colors">
                    Improve AI
                  </button>
                  </>
                )}
              </div>
            )}
            <InventorySync status={inventorySyncStatus} onSync={onSyncInventory} disabled={isQueued || inventorySyncStatus === 'syncing' || !hasCorrections} />
        </div>
       </>
    );
  };

  return <div className="flex flex-col h-full">{renderContent()}</div>;
});