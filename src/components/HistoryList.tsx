/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Clock, 
  FileText, 
  Loader2, 
  Lock, 
  Unlock,
  Sparkles
} from 'lucide-react';
import { User, ConversionHistoryItem } from '../types';

interface HistoryListProps {
  user: User | null;
  onOpenAuth: () => void;
  localHistory: any[];
  onClearLocalHistory: () => void;
}

export default function HistoryList({
  user,
  onOpenAuth,
  localHistory,
  onClearLocalHistory,
}: HistoryListProps) {
  const [historyItems, setHistoryItems] = useState<ConversionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to completely clear your task conversion history? This will remove all local history entries.")) return;

    if (user) {
      try {
        const res = await fetch(`/api/history/clear/${user.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setHistoryItems([]);
          alert("All conversion logs deleted successfully.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to clear cloud history.");
      }
    } else {
      onClearLocalHistory();
      alert("Local session task history cleared.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Decide source
  const activeItems = user 
    ? historyItems 
    : localHistory.map((item, idx) => ({
        id: `local_${idx}`,
        userId: 'guest',
        toolId: item.toolId,
        toolName: item.toolName,
        originalName: item.originalName,
        processedName: item.processedName,
        size: item.size,
        createdAt: item.createdAt || new Date().toISOString(),
        isEncrypted: item.isEncrypted,
        downloadUrl: '#',
      }));

  const filteredItems = activeItems.filter(
    (item) => 
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.toolName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2.5">
          <History className="h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-base font-bold text-gray-900">Task Conversion History</h2>
            <p className="text-xs text-gray-500 text-left">
              {user ? 'Logs are securely synchronized across devices.' : 'Logs stored locally in your current browser session.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* Clear history */}
          {activeItems.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Warning */}
      {!user && (
        <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100 text-left">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Incognito Mode Warning:</span> You are currently using iLovePDF as a guest. Your conversion history is stored temporarily in memory and will clear on page refreshes. <span onClick={onOpenAuth} className="font-bold underline cursor-pointer text-amber-900 hover:text-red-700">Sign in</span> to sync history logs securely to your profile!
          </p>
        </div>
      )}

      {/* List content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-150 rounded-2xl">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          <p className="mt-2 text-xs text-gray-400 font-mono">Loading telemetry logs...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <History className="mx-auto h-12 w-12 text-gray-300" />
          <h4 className="mt-4 text-sm font-bold text-gray-800">No operations logged</h4>
          <p className="mt-1 text-xs text-gray-500 leading-normal">
            {searchQuery ? 'Adjust search criteria or terms.' : 'Documents processed using any tool will be logged here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Tool Action</th>
                  <th className="px-6 py-3.5">Original File Name</th>
                  <th className="px-6 py-3.5">Output File Name</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* Tool Action Badge */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600 border border-red-100">
                        <Sparkles className="h-3 w-3" />
                        <span>{item.toolName}</span>
                      </span>
                    </td>

                    {/* Original Name */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700 max-w-[180px] sm:max-w-xs truncate" title={item.originalName}>
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{item.originalName}</span>
                      </div>
                    </td>

                    {/* Processed Name */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-800 max-w-[180px] sm:max-w-xs truncate" title={item.processedName}>
                        <span className="truncate">{item.processedName}</span>
                        {item.isEncrypted && (
                          <Lock className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-xs font-semibold text-gray-700 font-mono">
                      {formatSize(item.size)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
