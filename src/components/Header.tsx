/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Shield, History, Award, LogOut, User as UserIcon, LogIn, HardDrive } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  currentTab: 'tools' | 'history' | 'premium';
  setTab: (tab: 'tools' | 'history' | 'premium') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  selectedToolId: string | null;
  setSelectedToolId: (id: string | null) => void;
}

export default function Header({
  user,
  currentTab,
  setTab,
  onOpenAuth,
  onLogout,
  selectedToolId,
  setSelectedToolId,
}: HeaderProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogoClick = () => {
    setSelectedToolId(null);
    setTab('tools');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center space-x-2.5 active:scale-95 transition-transform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-md shadow-red-500/20">
            <FileText className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              iLove<span className="text-red-600">Media</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => { setSelectedToolId(null); setTab('tools'); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              currentTab === 'tools' && !selectedToolId
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Suite Tools</span>
          </button>

          <button
            onClick={() => { setSelectedToolId(null); setTab('history'); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              currentTab === 'history'
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Task History</span>
          </button>

          <button
            onClick={() => { setSelectedToolId(null); setTab('premium'); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              currentTab === 'premium'
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'text-gray-600 hover:bg-amber-50/30 hover:text-amber-600'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Pricing</span>
          </button>
        </nav>

        {/* User Account Controls */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3.5">
              {/* Storage Quota Indicator */}
              <div className="hidden lg:flex flex-col items-end justify-center text-xs">
                <div className="flex items-center text-gray-500 gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>Vault Quota</span>
                </div>
                <div className="font-semibold text-gray-700">
                  {formatSize(user.storageUsed)} / {formatSize(user.storageLimit)}
                </div>
              </div>

              {/* User Avatar Card */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-1.5 pr-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-sm ${
                  user.isPremium 
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="max-w-[100px] truncate text-xs font-semibold text-gray-800">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {user.isPremium ? 'Premium User' : 'Free Account'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                title="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 active:scale-95 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subheader menu for responsive screens */}
      <div className="md:hidden flex border-t border-gray-100 bg-gray-50/80 px-2 py-1 justify-around">
        <button
          onClick={() => { setSelectedToolId(null); setTab('tools'); }}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold rounded ${
            currentTab === 'tools' && !selectedToolId ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          <FileText className="h-4 w-4 mb-0.5" />
          Tools
        </button>
        <button
          onClick={() => { setSelectedToolId(null); setTab('history'); }}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold rounded ${
            currentTab === 'history' ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          <History className="h-4 w-4 mb-0.5" />
          History
        </button>
        <button
          onClick={() => { setSelectedToolId(null); setTab('premium'); }}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold rounded ${
            currentTab === 'premium' ? 'text-amber-600' : 'text-gray-500'
          }`}
        >
          <Award className="h-4 w-4 mb-0.5" />
          Pricing
        </button>
      </div>
    </header>
  );
}
