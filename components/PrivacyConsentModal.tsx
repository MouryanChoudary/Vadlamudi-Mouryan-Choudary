import React from 'react';

interface PrivacyConsentModalProps {
  onConsent: (consentGiven: boolean) => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ onConsent }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="consent-title"
    >
      <div
        className="bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-slate-700"
      >
        <div className="p-6">
          <h2 id="consent-title" className="text-xl font-bold text-white">Data Processing Consent</h2>
          <div className="mt-4 space-y-3 text-slate-300 text-sm">
            <p>
              To provide pipe counting analysis, this application sends captured images to Google's Gemini AI for processing.
            </p>
            <p>
              By continuing, you agree that:
            </p>
            <ul className="list-disc list-inside pl-4 text-slate-400 space-y-1">
                <li>Images you capture will be sent to Google for analysis.</li>
                <li>Google's privacy policy and terms of service apply to this processing.</li>
                <li>Do not upload sensitive or personal images.</li>
            </ul>
             <p>
              This consent is required to use the AI analysis feature.
            </p>
          </div>
        </div>
        <div className="bg-slate-800/50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-2xl">
          <button
            onClick={() => onConsent(false)}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onConsent(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Agree and Continue
          </button>
        </div>
      </div>
    </div>
  );
};
