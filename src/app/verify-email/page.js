'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../../hooks/useApi';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-10 rounded-2xl curvy-card border border-teal-50 shadow-2xl w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-teal-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">ভেরিফিকেশন হচ্ছে...</h2>
            <p className="text-xs text-slate-500">আপনার ইমেইল ভেরিফাই করা হচ্ছে।</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">ভেরিফিকেশন সফল!</h2>
            <p className="text-xs text-slate-500 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              লগইন করুন
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">ভেরিফিকেশন ব্যর্থ!</h2>
            <p className="text-xs text-slate-500 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              লগইন পেজে ফিরে যান
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
