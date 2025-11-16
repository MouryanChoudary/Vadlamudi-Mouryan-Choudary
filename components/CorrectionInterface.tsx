import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { AnalysisData, Pipe, PipeSize, BoundingBox } from '../types';

interface CorrectionInterfaceProps {
    analysisData: AnalysisData;
    onSave: (updatedData: AnalysisData) => void;
    onCancel: () => void;
}

const sizeOptions: PipeSize[] = ['Small', 'Medium', 'Large', 'Unknown'];
const DEFAULT_BOX_SIZE = 8; // Default size for a new box in percent

export const CorrectionInterface: React.FC<CorrectionInterfaceProps> = ({ analysisData, onSave, onCancel }) => {
    const [editableData, setEditableData] = useState<AnalysisData>(() => JSON.parse(JSON.stringify(analysisData)));
    const [selectedPipeId, setSelectedPipeId] = useState<string | null>(null);
    const imageWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedPipeId) {
                    handleDeletePipe(selectedPipeId);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPipeId, editableData.pipes]);


    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageWrapperRef.current) return;
        const rect = imageWrapperRef.current.getBoundingClientRect();
        
        // Calculate click position as a percentage of the image dimensions
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Ensure the new box doesn't go off the edges
        const clampedX = Math.max(0, Math.min(x - DEFAULT_BOX_SIZE / 2, 100 - DEFAULT_BOX_SIZE));
        const clampedY = Math.max(0, Math.min(y - DEFAULT_BOX_SIZE / 2, 100 - DEFAULT_BOX_SIZE));

        const newPipe: Pipe = {
            id: `manual_${Date.now()}`,
            size: 'Unknown',
            confidence: 1.0, // Manual additions are 100% confident
            boundingBox: {
                x: clampedX,
                y: clampedY,
                width: DEFAULT_BOX_SIZE,
                height: DEFAULT_BOX_SIZE,
            },
        };
        
        updatePipes([...editableData.pipes, newPipe]);
        setSelectedPipeId(newPipe.id);
    };

    const updatePipes = (newPipes: Pipe[]) => {
        const newCountBySize: Record<PipeSize, number> = { Small: 0, Medium: 0, Large: 0, Unknown: 0 };
        newPipes.forEach(p => newCountBySize[p.size]++);

        setEditableData(prev => ({
            ...prev,
            pipes: newPipes,
            countBySize: newCountBySize,
            totalCount: newPipes.length,
        }));
    };

    const handleDeletePipe = (pipeId: string) => {
        const newPipes = editableData.pipes.filter(p => p.id !== pipeId);
        updatePipes(newPipes);
        setSelectedPipeId(null);
    };

    const handleChangePipeSize = (pipeId: string, newSize: PipeSize) => {
        const newPipes = editableData.pipes.map(p => p.id === pipeId ? { ...p, size: newSize } : p);
        updatePipes(newPipes);
    };
    
    const selectedPipe = useMemo(() => editableData.pipes.find(p => p.id === selectedPipeId), [selectedPipeId, editableData.pipes]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    Edit Analysis
                </h2>
            </div>
            <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 h-full flex flex-col">
                    <div ref={imageWrapperRef} onClick={handleImageClick} className="relative w-full overflow-hidden rounded-xl shadow-lg bg-slate-900 flex-grow cursor-crosshair">
                        <img src={editableData.imageDataUrl} alt="Analyzed pipes" className="w-full h-full object-contain" />
                        {editableData.pipes.map(pipe => (
                            <div key={pipe.id}
                                 onClick={(e) => { e.stopPropagation(); setSelectedPipeId(pipe.id); }}
                                 className={`absolute rounded-sm cursor-pointer transition-all
                                    ${selectedPipeId === pipe.id ? 'border-4 border-fuchsia-500' : (pipe.confidence < 0.8 ? 'border-2 border-dashed border-yellow-400' : 'border-2 border-cyan-400')}
                                 `}
                                 style={{ left: `${pipe.boundingBox.x}%`, top: `${pipe.boundingBox.y}%`, width: `${pipe.boundingBox.width}%`, height: `${pipe.boundingBox.height}%`}}
                                 title={`${pipe.size} (Confidence: ${pipe.confidence.toFixed(2)})`}
                            />
                        ))}
                    </div>
                     <div className="text-xs text-slate-500 mt-2 text-center p-1 bg-slate-800/50 rounded">
                        Click on the image to add a pipe. Click on a pipe to select it.
                     </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Pipes</p>
                        <p className="text-5xl font-bold text-white">{editableData.totalCount}</p>
                    </div>
                    {selectedPipe && (
                         <div className="bg-slate-800/50 rounded-lg p-4 border border-fuchsia-500/50">
                             <h3 className="text-slate-300 font-semibold mb-3">Selected Pipe</h3>
                             <div className="flex flex-wrap gap-2">
                                 {sizeOptions.map(size => (
                                     <button key={size}
                                             onClick={() => handleChangePipeSize(selectedPipe.id, size)}
                                             className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedPipe.size === size ? 'bg-fuchsia-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                     >{size}</button>
                                 ))}
                             </div>
                             <button onClick={() => handleDeletePipe(selectedPipe.id)} className="w-full mt-4 bg-red-600/80 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm">Delete Pipe</button>
                         </div>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end space-x-3">
                <button onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                <button onClick={() => onSave(editableData)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Changes</button>
            </div>
        </div>
    );
};
