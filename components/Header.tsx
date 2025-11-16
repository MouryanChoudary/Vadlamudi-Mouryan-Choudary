import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onShowHistory: () => void;
  onClearHistory: () => void;
  historyCount: number;
  onManageUsers: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowHistory, onClearHistory, historyCount, onManageUsers }) => (
  <header className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b border-slate-700/50">
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-white">
        Pipe Counter
      </h1>
      <p className="mt-1 text-slate-400">
        Capture. Count. Confirm inventory before the shipment leaves the yard.
      </p>
    </div>
    <div className="flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex items-center space-x-2">
            {user.role === 'Admin' && (
              <button 
                  onClick={onManageUsers}
                  className="flex items-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                  Manage Users
              </button>
            )}
            <button 
                onClick={onShowHistory}
                className="flex items-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                History
                {historyCount > 0 && <span className="ml-2 bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">{historyCount}</span>}
            </button>
            <button 
                onClick={onClearHistory}
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium p-2 rounded-lg transition-colors"
                aria-label="Clear history"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
                onClick={onLogout}
                className="bg-red-600/80 hover:bg-red-600 text-white font-medium p-2 rounded-lg transition-colors"
                aria-label="Logout"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
            </button>
        </div>
        {user && (
            <p className="text-xs text-slate-500 mt-2 text-right">
                Signed in as {user.email} <span className="font-semibold">({user.role})</span>
            </p>
        )}
    </div>
  </header>
);