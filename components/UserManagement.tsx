import React, { useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import type { User, UserRole, Toast } from '../types';
import { Spinner } from './Spinner';

interface UserManagementProps {
  onClose: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onClose, addToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('User');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setUsers(authService.getUsers());
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.addUser(newEmail, newRole);
      addToast(`User ${newEmail} added successfully.`, 'success');
      setNewEmail('');
      setNewRole('User');
      fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add user.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (window.confirm(`Are you sure you want to remove user ${email}?`)) {
      try {
        await authService.removeUser(email);
        addToast(`User ${email} removed successfully.`, 'success');
        fetchUsers();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to remove user.';
        addToast(msg, 'error');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#10172A] w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Manage Users</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="bg-slate-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Add New User</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new.user@example.com"
                className="flex-grow bg-slate-900/70 text-slate-300 border border-slate-700 rounded-md p-2"
                required
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="bg-slate-900/70 text-slate-300 border border-slate-700 rounded-md p-2"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
              >
                {isLoading ? <Spinner /> : 'Add User'}
              </button>
            </div>
          </form>

          {/* User List */}
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.email} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{user.email}</p>
                  <p className={`text-sm ${user.role === 'Admin' ? 'text-cyan-400' : 'text-slate-400'}`}>{user.role}</p>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.email)}
                  disabled={user.email === 'vvadlamudimouryan@gmail.com'}
                  className="bg-red-600/80 hover:bg-red-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2 rounded-lg"
                  aria-label={`Remove ${user.email}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
