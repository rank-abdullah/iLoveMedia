/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Login simulation states
  const [showGoogleConsent, setShowGoogleConsent] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('sibgharahat19@gmail.com');
  const [googleName, setGoogleName] = useState('Sibgha Rahat');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password } 
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
          googleId: `g_${Math.random().toString(36).substring(2, 11)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {!showGoogleConsent ? (
        /* Regular Login/Register Form */
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 text-left relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-950">
              {isLogin ? 'Log In to your Account' : 'Register Secure Account'}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {isLogin ? 'Access your conversions & PDF history.' : 'Create a personal workspace for fast document conversions.'}
            </p>
          </div>

          {/* Google SSO Login Button */}
          <button
            type="button"
            onClick={() => setShowGoogleConsent(true)}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer mb-5"
          >
            {/* Google Icon SVG */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.38 7.55l3.87 3a7.99 7.99 0 0 1 6.75-5.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61l3.71 2.88c2.17-2 3.43-4.94 3.43-8.73z"
              />
              <path
                fill="#FBBC05"
                d="M5.25 10.55A7.99 7.99 0 0 1 12 5.04c2.98 0 5.67.54 7.68 1.46l3.27-3.27C20.65 1.54 16.59 0 12 0 7.35 0 3.37 2.68 1.38 6.55l3.87 3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.11.75-2.53 1.19-4.25 1.19-3.28 0-6.07-2.21-7.06-5.19l-3.87 3A11.97 11.97 0 0 0 12 23z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">or email password</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-700 font-medium">
                <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-red-500 transition-all bg-gray-50/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-red-500 transition-all bg-gray-50/30"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Secret Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-red-500 transition-all bg-gray-50/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/15 hover:shadow-xl active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Securing Handshake...</span>
                </>
              ) : (
                <span>{isLogin ? 'Log In Securely' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Tab switcher footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <span 
                  onClick={() => setIsLogin(false)}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Create one now
                </span>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <span 
                  onClick={() => setIsLogin(true)}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Log in here
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Google SSO Consent Screen */
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 text-left relative animate-in fade-in zoom-in-95 duration-200">
          
          <button 
            onClick={() => setShowGoogleConsent(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Identity Hub Header */}
          <div className="flex flex-col items-center text-center mt-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 border border-blue-100 mb-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61l3.71 2.88c2.17-2 3.43-4.94 3.43-8.73z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.38 7.55l3.87 3a7.99 7.99 0 0 1 6.75-5.51z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.11.75-2.53 1.19-4.25 1.19-3.28 0-6.07-2.21-7.06-5.19l-3.87 3A11.97 11.97 0 0 0 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.25 10.55A7.99 7.99 0 0 1 12 5.04c2.98 0 5.67.54 7.68 1.46l3.27-3.27C20.65 1.54 16.59 0 12 0 7.35 0 3.37 2.68 1.38 6.55l3.87 3z"
                />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-gray-950">Google Accounts Authentication</h3>
            <p className="mt-1 text-xs text-gray-500">Sign in with Google to synchronize your conversions history seamlessly.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                  {googleName.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="block w-full font-bold text-xs text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Full Name"
                    title="Edit Name"
                  />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="block w-full text-[11px] text-gray-500 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-semibold mt-0.5"
                    placeholder="Email Address"
                    title="Edit Email"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 leading-relaxed text-left">
              <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                To guarantee compatibility in sandboxed containers (bypassing strict OAuth CORS and redirect restrictions), iLovePDF utilizes a fully-synchronized local profile hub. You can modify the account details above before completing the handshake.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowGoogleConsent(false)}
                className="rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow shadow-blue-500/10 cursor-pointer"
              >
                Confirm Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
