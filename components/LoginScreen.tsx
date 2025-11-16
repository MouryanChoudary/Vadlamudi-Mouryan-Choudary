import React, { useState } from 'react';
import { login } from '../services/authService';
import type { User } from '../types';
import { Spinner } from './Spinner';
import { Footer } from './Footer';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email);
      onLoginSuccess(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Pipe Counter</h1>
          <p className="mt-2 text-slate-400">Please sign in to access the application.</p>
        </div>
        <div className="bg-[#10172A] p-8 rounded-2xl shadow-lg border border-slate-700/50">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-900/70 text-slate-300 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base"
              />
            </div>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center text-base"
            >
              {isLoading ? <Spinner /> : 'Sign In'}
            </button>
          </form>
        </div>
        <Footer isLoginScreen={true} />
      </div>
    </div>
  );
};
