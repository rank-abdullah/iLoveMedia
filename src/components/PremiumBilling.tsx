/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Users, 
  Clock, 
  Award,
  CreditCard,
  Loader2,
  HardDrive
} from 'lucide-react';
import { User } from '../types';

interface PremiumBillingProps {
  user: User | null;
  onOpenAuth: () => void;
  onUpgradeSuccess: (updatedUser: User) => void;
}

export default function PremiumBilling({
  user,
  onOpenAuth,
  onUpgradeSuccess,
}: PremiumBillingProps) {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade.");
      }

      onUpgradeSuccess(data.user);
      setShowCheckout(false);
      alert("Success! You are now an iLovePDF Premium member! Your storage quota is upgraded to 20 GB.");
    } catch (err: any) {
      alert("Checkout error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPremium = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel your Premium plan? Your storage limit will return to 100 MB.")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/cancel-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel.");
      }

      onUpgradeSuccess(data.user);
      alert("Your Premium subscription has been cancelled.");
    } catch (err: any) {
      alert("Error cancelling subscription: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    { title: 'Unlimited File Processes', desc: 'No daily or hourly document conversion boundaries.' },
    { title: 'Large Batch Files (Up to 50 files)', desc: 'Process multiple large volumes concurrently in a single task.' },
    { title: 'High-speed Queue Priority', desc: 'Accelerate file packaging on dedicated cloud CPU cores.' },
    { title: '20 GB Cloud Storage Vault', desc: 'Store high density PDFs and logs in your private cloud locker.' },
    { title: 'Advanced Custom Controls', desc: 'Tailored Watermark opacities, rotations, and margin configurations.' },
    { title: 'Customer Priority Support', desc: 'Dedicated 24/7 technical assistance for file restorations.' },
  ];

  const freeFeatures = [
    { title: 'Standard Queues', desc: 'Regular upload queues with common delays.' },
    { title: 'Limited Batch (Up to 3 files)', desc: 'Merge or convert up to 3 files simultaneously.' },
    { title: '100 MB Cloud Storage Vault', desc: 'Free secure repository space for vital documents.' },
    { title: 'Basic Custom Settings', desc: 'Standard rotates, split margins, and page numbering patterns.' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* SaaS Pricing Header */}
      <div className="text-center mb-14">
        <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-100 uppercase mb-3">
          Subscription Center
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Simple Plans, <span className="text-amber-500">Infinite Productivity</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Unlock high-speed batch operations, expand your cloud locker storage, and keep your business moving securely.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Yearly Billing <span className="text-emerald-500 ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* Free Plan */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-left">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Standard Plan</h3>
            <p className="mt-2 text-xs text-gray-500">Perfect for quick single file utilities and personal usages.</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">$0</span>
              <span className="ml-1 text-xs font-semibold text-gray-500">/ forever</span>
            </div>

            {/* Feature List */}
            <div className="mt-8 space-y-4">
              {freeFeatures.map((f, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5 rounded-full bg-gray-100 p-0.5 text-gray-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-bold text-gray-800">{f.title}</p>
                    <p className="text-[10px] text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              disabled={!user || !user.isPremium}
              className={`w-full rounded-2xl py-3 text-xs font-bold transition-all text-center ${
                user && !user.isPremium
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:scale-95 cursor-pointer'
              }`}
            >
              {user && !user.isPremium ? 'Currently Active' : 'Sign in for free'}
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-500 bg-white p-8 shadow-md text-left">
          
          {/* Popular Tag */}
          <div className="absolute top-0 right-6 -translate-y-1/2 inline-flex items-center space-x-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 px-3.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow shadow-amber-500/15">
            <Sparkles className="h-3 w-3" />
            <span>Premium Tier</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">Enterprise Premium</h3>
            <p className="mt-2 text-xs text-gray-500">Engineered for businesses, power users, and volume processing.</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                {billingCycle === 'monthly' ? '$4.99' : '$3.99'}
              </span>
              <span className="ml-1 text-xs font-semibold text-gray-500">
                / month {billingCycle === 'yearly' && '(billed annually)'}
              </span>
            </div>

            {/* Feature List */}
            <div className="mt-8 space-y-4">
              {premiumFeatures.map((f, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5 rounded-full bg-amber-50 p-0.5 text-amber-500 border border-amber-150">
                    <Check className="h-3 w-3" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-bold text-gray-800">{f.title}</p>
                    <p className="text-[10px] text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {user?.isPremium ? (
              <button
                onClick={handleCancelPremium}
                disabled={loading}
                className="w-full rounded-2xl bg-red-50 py-3 text-xs font-bold text-red-600 border border-red-150 hover:bg-red-100/40 active:scale-95 transition-all text-center cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Cancel Subscription'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                  } else {
                    setShowCheckout(true);
                  }
                }}
                className="w-full rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/15 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all text-center cursor-pointer"
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust badging grid */}
      <div className="mt-20 border-t border-gray-150 pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 mb-3.5 border border-gray-150">
              <Zap className="h-5 w-5 text-gray-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-900">Instant Processing</h4>
            <p className="mt-1 text-[10px] text-gray-500 leading-normal">Dedicated processing thread queues.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 mb-3.5 border border-gray-150">
              <ShieldCheck className="h-5 w-5 text-gray-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-900">E2E Cryptography</h4>
            <p className="mt-1 text-[10px] text-gray-500 leading-normal">Secure in-memory processing guarantees.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 mb-3.5 border border-gray-150">
              <HardDrive className="h-5 w-5 text-gray-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-900">20 GB Cloud locker</h4>
            <p className="mt-1 text-[10px] text-gray-500 leading-normal">Massive resilient secure files quota.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 mb-3.5 border border-gray-150">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-900">Zero file logs storage</h4>
            <p className="mt-1 text-[10px] text-gray-500 leading-normal">Unsaved documents deleted after 2 hours.</p>
          </div>
        </div>
      </div>

      {/* Simulated Premium Stripe/Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 text-left relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 mb-5">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <span className="text-base font-bold text-gray-900">Secure Billing Terminal</span>
              </div>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Card Holder Name</label>
                <input
                  type="text"
                  required
                  defaultValue={user?.name}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm font-semibold outline-none focus:border-amber-500 transition-all bg-gray-50/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Credit Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm font-mono font-bold outline-none focus:border-amber-500 transition-all bg-gray-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Expiration</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm font-semibold outline-none focus:border-amber-500 transition-all bg-gray-50/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">CVC Code</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm font-mono outline-none focus:border-amber-500 transition-all bg-gray-50/30"
                  />
                </div>
              </div>

              {/* Price outline */}
              <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/60 text-xs text-amber-900 mt-2">
                <div className="flex justify-between font-bold mb-1">
                  <span>Premium Plan Upgrade</span>
                  <span>{billingCycle === 'monthly' ? '$4.99' : '$47.88'}</span>
                </div>
                <p className="text-[10px] text-amber-700">Instant access. Upgrades your cloud storage quota limit to 20 GB.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/15 hover:shadow-xl active:scale-95 transition-all cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <Award className="h-4.5 w-4.5" />
                    <span>Confirm Upgrade Payment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
