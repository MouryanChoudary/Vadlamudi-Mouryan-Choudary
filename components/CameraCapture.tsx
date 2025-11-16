import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Spinner } from './Spinner';

interface CameraCaptureProps {
  onAnalyze: (imageDataUrl: string) => void;
  onManualEntry: (imageDataUrl: string) => void;
  isAnalyzing: boolean;
  isOnline: boolean;
  onCameraError: (message: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onAnalyze, onManualEntry, isAnalyzing, isOnline, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [streamFailed, setStreamFailed] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsTorchSupported(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setStreamFailed(false);
    setIsStreaming(false);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      const videoTrack = newStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      setIsTorchSupported('torch' in capabilities);
      setIsTorchOn(false);

      setIsStreaming(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access camera. Please try again.";
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = "Camera permission denied. Please enable it in your browser settings.";
        } else if (err.name === 'NotFoundError') {
          message = "No camera found. Please ensure a camera is connected and enabled.";
        } else if (err.name === 'NotReadableError') {
            message = "Camera is already in use by another application.";
        }
      }
      onCameraError(message);
      setIsStreaming(false);
      setStreamFailed(true);
    }
  }, [stopStream, onCameraError]);

  useEffect(() => {
    startCamera();
    return stopStream;
  }, [startCamera, stopStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopStream();
        setIsStreaming(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  const handleAnalyze = () => {
    if(capturedImage) {
      onAnalyze(capturedImage);
      setCapturedImage(null);
    }
  };
  
  const handleManualEntry = () => {
    if(capturedImage) {
      onManualEntry(capturedImage);
      setCapturedImage(null);
    }
  }

  const handleToggleTorch = useCallback(async () => {
    if (streamRef.current && isTorchSupported) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const nextTorchState = !isTorchOn;
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextTorchState } as any],
        });
        setIsTorchOn(nextTorchState);
      } catch (err) {
        console.error('Failed to toggle torch:', err);
      }
    }
  }, [isTorchOn, isTorchSupported]);


  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Real-time pipe counting assistant</p>
        <h2 className="text-2xl font-bold text-white mt-1">Capture pipes and get instant counts</h2>
        <p className="text-slate-400 mt-2">Position the container, tap capture, and let the AI assistant do the heavy lifting.</p>
      </div>

      <div className="relative flex-grow w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
        
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${capturedImage || streamFailed || !isStreaming ? 'hidden' : ''}`}></video>

        {capturedImage && (
            <img src={capturedImage} alt="Captured pipe stack" className="w-full h-full object-cover"/>
        )}

        {!isStreaming && !capturedImage && !streamFailed && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
             </div>
        )}
        
        {streamFailed && (
             <div className="text-center p-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="mt-2 font-semibold">Camera Error</p>
                <p className="text-sm">Could not start the camera stream.</p>
             </div>
        )}

        {isStreaming && isTorchSupported && (
          <button 
            onClick={handleToggleTorch}
            aria-pressed={isTorchOn}
            className={`absolute bottom-4 right-4 z-10 p-3 rounded-full transition-colors ${isTorchOn ? 'bg-yellow-400 text-slate-900' : 'bg-black/50 text-white hover:bg-black/70'}`}
          >
            {isTorchOn ? 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM9.293 8.293a1 1 0 011.414 0L12 9.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" /></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5.121l2.67-1.78a1 1 0 011.26.07l.004.004a1 1 0 01.07 1.262l-2.25 3.375a1 1 0 01-1.42.38l-3.375-2.25a1 1 0 01-.07-1.262l.004-.004a1 1 0 011.26-.07L10 7.12V2a1 1 0 011.3-.954zM4.75 16.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            }
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        {!capturedImage ? (
            <button
                onClick={handleCapture}
                disabled={!isStreaming || isAnalyzing}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Capture Image
            </button>
        ) : (
            <div className="flex flex-col gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <button onClick={handleRetake} disabled={isAnalyzing} className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Retake</button>
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                        {isAnalyzing ? <Spinner /> : (isOnline ? 'Run AI Analysis' : 'Queue for Analysis')}
                    </button>
                </div>
                 <button onClick={handleManualEntry} disabled={isAnalyzing} className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    Enter Manual Count
                </button>
            </div>
        )}
      </div>
    </div>
  );
};