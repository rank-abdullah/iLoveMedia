/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
  createdAt: string;
  authProvider: 'local' | 'google';
}

export type PDFToolCategory = 'organize' | 'optimize' | 'convert' | 'security' | 'premium';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  category: PDFToolCategory;
  toolSuite?: 'pdf' | 'image';
  iconName: string;
  path: string;
  inputType: string; // e.g., '.pdf', 'image/*'
  outputType: string;
  isPremiumOnly: boolean;
  isNew?: boolean;
}

export interface PDFTask {
  id: string;
  userId?: string;
  toolId: string;
  toolName: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  speed?: string; // e.g. "2.4 MB/s"
  timeRemaining?: string; // e.g. "3s"
  originalName: string;
  originalSize: number;
  processedName?: string;
  processedSize?: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  isEncrypted: boolean;
}

export interface VaultFile {
  id: string;
  userId: string;
  originalName: string;
  encryptedName: string;
  mimeType: string;
  size: number;
  isEncrypted: boolean;
  createdAt: string;
  keyHint?: string; // user-friendly hint to decrypt
}

export interface ConversionHistoryItem {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  originalName: string;
  processedName: string;
  size: number;
  createdAt: string;
  isEncrypted: boolean;
  downloadUrl: string;
}

export interface PremiumSubscription {
  active: boolean;
  plan: 'monthly' | 'yearly' | 'none';
  expiryDate?: string;
}
