/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ToolGrid from './components/ToolGrid';
import ToolProcessor from './components/ToolProcessor';
import HistoryList from './components/HistoryList';
import PremiumBilling from './components/PremiumBilling';
import AuthModal from './components/AuthModal';
import { User } from './types';
import { FileText, Shield, Award, Users, HardDrive } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setTab] = useState<'tools' | 'history' | 'premium'>('tools');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Local guest history logs
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  // Public statistics
  const [stats, setStats] = useState({
    totalUsers: 15420,
    totalFilesProcessed: 849202,
    activeServers: '5/5 clusters online'
  });

  // Check storage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('ilovepdf_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        localStorage.removeItem('ilovepdf_user');
      }
    }

    const cachedLocalHistory = localStorage.getItem('ilovepdf_local_history');
    if (cachedLocalHistory) {
      try {
        setLocalHistory(JSON.parse(cachedLocalHistory));
      } catch (err) {}
    }

    // Fetch live statistics
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.totalUsers) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('ilovepdf_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ilovepdf_user');
    setTab('tools');
    setSelectedToolId(null);
  };

  const handleAddHistory = (item: any) => {
    if (user) {
      // History is retrieved from the DB, so we don't need to append local history.
      // But we can trigger a re-fetch in HistoryList by shifting state.
    } else {
      const updated = [item, ...localHistory];
      setLocalHistory(updated);
      localStorage.setItem('ilovepdf_local_history', JSON.stringify(updated));
    }
  };

  const handleClearLocalHistory = () => {
    setLocalHistory([]);
    localStorage.removeItem('ilovepdf_local_history');
  };

  const handleUpdateStorage = (storageUsed: number) => {
    if (user) {
      const updatedUser = { ...user, storageUsed };
      setUser(updatedUser);
      localStorage.setItem('ilovepdf_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-800 antialiased">
      {/* Top Header Navigation */}
      <Header
        user={user}
        currentTab={currentTab}
        setTab={setTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        selectedToolId={selectedToolId}
        setSelectedToolId={setSelectedToolId}
      />

      {/* Main Workspace Frame */}
      <main className="flex-grow">
        {selectedToolId ? (
          <ToolProcessor
            toolId={selectedToolId}
            user={user}
            onBack={() => setSelectedToolId(null)}
            onAddHistory={handleAddHistory}
            onUpgradePrompt={() => {
              setSelectedToolId(null);
              setTab('premium');
            }}
          />
        ) : currentTab === 'tools' ? (
          <ToolGrid onSelectTool={(toolId) => setSelectedToolId(toolId)} />
        ) : currentTab === 'history' ? (
          <HistoryList
            user={user}
            onOpenAuth={() => setShowAuthModal(true)}
            localHistory={localHistory}
            onClearLocalHistory={handleClearLocalHistory}
          />
        ) : (
          <PremiumBilling
            user={user}
            onOpenAuth={() => setShowAuthModal(true)}
            onUpgradeSuccess={(updated) => handleLoginSuccess(updated)}
          />
        )}
      </main>

      {/* Global Dashboard Footer */}
      <footer className="bg-white border-t border-gray-150 py-12 mt-16 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Public counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-b border-gray-100 pb-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gray-900">
                {stats.totalFilesProcessed.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">Documents Processed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">Registered Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wide">
                ● {stats.activeServers}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1.5 tracking-wider">Infrastructure Status</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-gray-700">iLovePDF</span>
              <span>Clone — Build Platform Applet</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hover:text-gray-600 cursor-pointer">Security Protocol</span>
              <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
              <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sign-in / Sign-up overlays */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
