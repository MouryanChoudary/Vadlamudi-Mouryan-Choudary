import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CameraCapture } from './components/CameraCapture';
import { AnalysisResult } from './components/AnalysisResult';
import { HistoryView } from './components/HistoryView';
import { ToastContainer } from './components/Toast';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LoginScreen } from './components/LoginScreen';
import { UserManagement } from './components/UserManagement';
import { Footer } from './components/Footer';
import { PrivacyConsentModal } from './components/PrivacyConsentModal';
import * as authService from './services/authService';
import { analyzeImage, syncToInventory, submitFeedbackForTraining } from './services/pipeCounterService';
import * as db from './services/db';
import { useGeolocation } from './hooks/useGeolocation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { AnalysisData, Toast, InventorySyncStatus, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisData | null>(null);
  const [history, setHistory] = useState<AnalysisData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [inventorySyncStatus, setInventorySyncStatus] = useState<InventorySyncStatus>('idle');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const location = useGeolocation();
  const isOnline = useOnlineStatus();
  const analysisReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsInitializing(false);
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const saveHistory = useCallback((newHistory: AnalysisData[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('pipe-counter-history', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, []);
  
  const syncQueuedAnalyses = useCallback(async () => {
    const itemsToSync = await db.getQueuedAnalyses();
    if (itemsToSync.length === 0) return;

    addToast(`Back online! Syncing ${itemsToSync.length} items...`, 'info');

    const results = await Promise.all(itemsToSync.map(async (item) => {
      try {
        const analysisResult = await analyzeImage(item.imageDataUrl, item.location);
        await db.deleteQueuedAnalysis(item.id);
        return { status: 'success', data: analysisResult, originalId: item.id };
      } catch (error) {
        return { status: 'error', originalId: item.id, error };
      }
    }));

    const successfulAnalyses = results
      .filter(r => r.status === 'success')
      .map(r => r.data as AnalysisData);

    if (successfulAnalyses.length > 0) {
      const currentHistoryWithoutPlaceholders = history.filter(h => !itemsToSync.some(item => item.id === h.id));
      const newHistory = [...successfulAnalyses, ...currentHistoryWithoutPlaceholders].slice(0, 50);
      saveHistory(newHistory);
      setLatestAnalysis(newHistory[0]);
    }
    
    const failedCount = results.length - successfulAnalyses.length;
    if (failedCount > 0) {
      addToast(`${failedCount} items failed to sync and will be retried.`, 'error');
    }
    if (successfulAnalyses.length > 0) {
      addToast(`${successfulAnalyses.length} queued analyses synced successfully.`, 'success');
    }
  }, [history, saveHistory, addToast]);

  useEffect(() => {
    if (isOnline) {
      syncQueuedAnalyses();
    }
  }, [isOnline, syncQueuedAnalyses]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('pipe-counter-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
        if (parsedHistory.length > 0) {
          setLatestAnalysis(parsedHistory[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const handleConsent = (consentGiven: boolean) => {
    if(consentGiven) {
        localStorage.setItem('pipe-counter-consent', 'true');
        setShowConsentModal(false);
    } else {
        addToast('You must consent to the data policy to use the AI analysis feature.', 'error');
    }
  };


  const analyzeWithConsentCheck = async (imageDataUrl: string) => {
    const hasConsented = localStorage.getItem('pipe-counter-consent') === 'true';
    if (!hasConsented) {
        setShowConsentModal(true);
        return;
    }
    
    if (!isOnline) {
      const queuedItem: AnalysisData = {
        id: `queued_${Date.now()}`,
        timestamp: Date.now(),
        imageDataUrl,
        location,
        totalCount: 0,
        countBySize: { Small: 0, Medium: 0, Large: 0, Unknown: 0 },
        pipes: [],
        notes: "This analysis is queued and will be processed when you are back online.",
        isQueued: true,
        overallConfidence: 0,
        modelVersion: 'N/A',
      };
      await db.addQueuedAnalysis({ id: queuedItem.id, imageDataUrl, location, timestamp: queuedItem.timestamp });
      setLatestAnalysis(queuedItem);
      const newHistory = [queuedItem, ...history.slice(0, 49)];
      saveHistory(newHistory);
      addToast('You are offline. Analysis queued.', 'info');
      return;
    }

    setIsAnalyzing(true);
    setInventorySyncStatus('idle');
    try {
      const result = await analyzeImage(imageDataUrl, location);
      setLatestAnalysis(result);
      const newHistory = [result, ...history.slice(0, 49)];
      saveHistory(newHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addToast(`Analysis failed: ${errorMessage}`, 'error');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }


  const handleAnalyze = useCallback(analyzeWithConsentCheck, [isOnline, location, history, saveHistory, addToast]);
  
  const handleManualEntry = useCallback((imageDataUrl: string) => {
    const manualEntry: AnalysisData = {
      id: `manual_${Date.now()}`,
      timestamp: Date.now(),
      imageDataUrl,
      location,
      totalCount: 0,
      countBySize: { Small: 0, Medium: 0, Large: 0, Unknown: 0 },
      pipes: [],
      notes: "This report was created manually.",
      isQueued: false,
      overallConfidence: 1, // Human entry is 100% confident
      modelVersion: 'Manual Entry',
    };
    setLatestAnalysis(manualEntry);
    // Don't save to history until the user saves their corrections
  }, [location]);

  const handleUpdateAnalysis = useCallback((updatedAnalysis: AnalysisData) => {
    const finalAnalysis = { ...updatedAnalysis, feedbackSubmitted: false }; // Reset feedback flag on new edits
    setLatestAnalysis(finalAnalysis);

    const historyExists = history.some(item => item.id === finalAnalysis.id);
    let newHistory;
    if (historyExists) {
        newHistory = history.map(item => item.id === finalAnalysis.id ? finalAnalysis : item);
    } else {
        newHistory = [finalAnalysis, ...history.slice(0, 49)];
    }
    
    saveHistory(newHistory);
    addToast('Corrections have been saved.', 'success');
  }, [history, saveHistory, addToast]);

  const handleFeedbackSubmit = useCallback(async () => {
    if (!latestAnalysis) return;

    try {
      const result = await submitFeedbackForTraining(latestAnalysis);
      const updatedAnalysis = { ...latestAnalysis, feedbackSubmitted: true };
      setLatestAnalysis(updatedAnalysis);
      const newHistory = history.map(item => item.id === latestAnalysis.id ? updatedAnalysis : item);
      saveHistory(newHistory);
      addToast(result.message, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback.';
      addToast(msg, 'error');
    }
  }, [latestAnalysis, history, saveHistory, addToast]);

  const handleCameraError = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const handleClearHistory = useCallback(() => {
    setIsConfirmingClear(true);
  }, []);

  const handleConfirmClearHistory = useCallback(async () => {
    saveHistory([]);
    const queued = await db.getQueuedAnalyses();
    for(const item of queued) {
      await db.deleteQueuedAnalysis(item.id);
    }
    setLatestAnalysis(null);
    setShowHistory(false);
    setIsConfirmingClear(false);
    addToast('History cleared successfully.', 'success');
  }, [saveHistory, addToast]);

  const handleSelectHistoryItem = (item: AnalysisData) => {
    setLatestAnalysis(item);
    setShowHistory(false);
    setInventorySyncStatus('idle');
  };

  const handleExportPDF = useCallback(() => {
    const { jsPDF } = (window as any).jspdf;
    const reportElement = analysisReportRef.current;
    if (reportElement && latestAnalysis) {
      (window as any).html2canvas(reportElement, { backgroundColor: '#1E293B' }).then((canvas: { toDataURL: (type: string) => string; height: number; width: number; }) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`PipeAnalysis_${latestAnalysis.id}.pdf`);
        addToast('PDF exported successfully!', 'success');
      });
    }
  }, [latestAnalysis, addToast]);
  
  const handleNotesChange = useCallback((newNotes: string) => {
    if (!latestAnalysis) return;
    const updatedAnalysis = { ...latestAnalysis, notes: newNotes };
    setLatestAnalysis(updatedAnalysis);
    const newHistory = history.map(item =>
      item.id === latestAnalysis.id ? updatedAnalysis : item
    );
    saveHistory(newHistory);
  }, [latestAnalysis, history, saveHistory]);

  const handleSyncInventory = useCallback(async () => {
    if (!latestAnalysis) return;
    setInventorySyncStatus('syncing');
    const result = await syncToInventory(latestAnalysis);
    if (result.status === 'success') {
      setInventorySyncStatus('success');
      addToast(result.message, 'success');
    } else {
      setInventorySyncStatus('error');
      addToast(result.message, 'error');
    }
  }, [latestAnalysis, addToast]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (isInitializing) {
    return null; // Or a loading spinner
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(toast => toast.id !== id))} />
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onShowHistory={() => setShowHistory(true)} 
        onClearHistory={handleClearHistory} 
        historyCount={history.length}
        onManageUsers={() => setShowUserManagement(true)}
      />
      <main className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        <div className="bg-[#10172A] p-6 rounded-2xl shadow-lg flex flex-col">
          <CameraCapture onAnalyze={handleAnalyze} onManualEntry={handleManualEntry} isAnalyzing={isAnalyzing} isOnline={isOnline} onCameraError={handleCameraError} />
        </div>
        <div className="bg-[#10172A] p-6 rounded-2xl shadow-lg flex flex-col">
          <AnalysisResult
            ref={analysisReportRef}
            analysisData={latestAnalysis}
            isAnalyzing={isAnalyzing}
            onExportPDF={handleExportPDF}
            onUpdateAnalysis={handleUpdateAnalysis}
            onNotesChange={handleNotesChange}
            inventorySyncStatus={inventorySyncStatus}
            onSyncInventory={handleSyncInventory}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        </div>
      </main>
      {showHistory && <HistoryView history={history} onClose={() => setShowHistory(false)} onSelect={handleSelectHistoryItem} />}
      {showUserManagement && currentUser?.role === 'Admin' && (
        <UserManagement 
          onClose={() => setShowUserManagement(false)} 
          addToast={addToast}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        onConfirm={handleConfirmClearHistory}
        title="Clear Analysis History"
        message={`Are you sure you want to permanently delete all ${history.length} analysis records? This action cannot be undone.`}
      />
      {showConsentModal && <PrivacyConsentModal onConsent={handleConsent} />}
      <Footer />
    </div>
  );
};

export default App;