import React, { useState, useRef, useCallback } from 'react';
import type { AnalysisData } from '../types';

interface HistoryViewProps {
  history: AnalysisData[];
  onClose: () => void;
  onSelect: (item: AnalysisData) => void;
}

const ITEM_HEIGHT = 100; // 96px for item + 4px for margin
const OVERSCAN = 5; // Render 5 items above and below the visible area

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onClose, onSelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const renderContent = () => {
    if (history.length === 0) {
      return <p className="text-slate-400 text-center p-6">No history yet. Analyze an image to begin.</p>;
    }

    const containerHeight = scrollContainerRef.current?.clientHeight || 0;
    const totalHeight = history.length * ITEM_HEIGHT;

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(history.length - 1, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN);
    
    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
        visibleItems.push(history[i]);
    }

    return (
      <div
        className="overflow-y-auto p-6"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleItems.map((item, index) => {
             const actualIndex = startIndex + index;
             return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: `${actualIndex * ITEM_HEIGHT}px`,
                  left: 0,
                  right: 0,
                  height: `${ITEM_HEIGHT - 4}px` // Account for margin
                }}
              >
                <button
                  onClick={() => onSelect(item)}
                  className="w-full h-full text-left p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-4"
                >
                  <img src={item.imageDataUrl} alt="Analysis thumbnail" className="w-20 h-16 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-semibold text-white flex items-center">
                      {item.isQueued ? 'Analysis Queued' : `Total Pipes: ${item.totalCount}`}
                      {item.isQueued && (
                        <span className="ml-2 text-xs font-medium bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Queued</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </button>
              </div>
            )
           })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#10172A] w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Analysis History</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};