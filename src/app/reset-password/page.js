'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, KeyRound, ArrowRight } from 'lucide-react';
import { API_BASE } from '../../hooks/useApi';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // Token exists, user came from email link
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড মিলছে না!');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৪ অক্ষর হতে হবে!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'পাসওয়ার্ড রিসেট করা যায়নি।');
      }

      setSuccessMsg('পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'নেটওয়ার্ক কানেকশন চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-2xl curvy-card border border-teal-50 shadow-2xl w-full max-w-md text-center">
          <KeyRound className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">ইনভ্যালিড লিংক!</h2>
          <p className="text-xs text-slate-500 mb-6">এই পাসওয়ার্ড রিসেট লিংকটি বৈধ নয়।</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            লগইন পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-10 rounded-2xl curvy-card border border-teal-50 shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-teal-50 text-teal-700 rounded-tr-2xl rounded-bl-2xl shadow-sm mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">পাসওয়ার্ড রিসেট</h2>
          <p className="text-xs text-slate-400 mt-1">নতুন পাসওয়ার্ড সেট করুন।</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-xl font-medium flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">নতুন পাসওয়ার্ড *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">পাসওয়ার্ড কনফার্ম *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md flex items-center justify-center space-x-1 transition-colors"
          >
            <span>{isLoading ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড রিসেট করুন'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {successMsg && (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              লগইন করুন
            </button>
          )}
        </form>

      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="text-sm font-semibold text-teal-800">লোডিং হচ্ছে...</span>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
