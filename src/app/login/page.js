'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/navigation';
import { Globe, Mail, Lock, User, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { API_BASE } from '../../hooks/useApi';
import useSEO from '../../hooks/useSEO';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user } = useStore();

  useSEO({
    title: 'লগইন / রেজিস্টার',
    description: 'MCES International Overseas Travel Agency - আপনার অ্যাকাউন্ট লগইন অথবা নতুন রেজিস্টার করুন।',
    canonicalPath: '/login',
  });

  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user-dashboard');
      }
    }
  }, [user, router]);

  // Handle Login/Register Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const isLogin = activeTab === 'login';
    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'আবেদনটি সম্পন্ন করা যায়নি।');
      }

      // For register, show verification message
      if (!isLogin && data.message) {
        setSuccessMsg(data.message);
        setActiveTab('login');
        return;
      }

      setAuth(data.user, data.token);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'নেটওয়ার্ক কানেকশন চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'অনুরোধ সম্পন্ন করা যায়নি।');
      }

      setSuccessMsg(data.message || 'Reset link your email e pathano hoyeche. Check koro.');
      setForgotEmail('');
    } catch (err) {
      setErrorMsg(err.message || 'নেটওয়ার্ক কানেকশন চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e) => {
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
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'পাসওয়ার্ড রিসেট করা যায়নি।');
      }

      setSuccessMsg('পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।');
      setActiveTab('login');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'নেটওয়ার্ক কানেকশন চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-10 rounded-2xl curvy-card border border-teal-50 shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-teal-50 text-teal-700 rounded-tr-2xl rounded-bl-2xl shadow-sm mb-4">
            <Globe className="w-8 h-8 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">MCES গ্লোবাল প্যানেল</h2>
          <p className="text-xs text-slate-400 mt-1">আপনার অ্যাকাউন্ট লগইন অথবা নতুন রেজিস্টার করুন।</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            রেজিস্টার
          </button>
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

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ইমেইল এড্রেস *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">পাসওয়ার্ড *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forgot');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md flex items-center justify-center space-x-1 transition-colors"
            >
              <span>{isLoading ? 'প্রসেসিং হচ্ছে...' : 'লগইন করুন'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ইমেইল এড্রেস *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">পাসওয়ার্ড *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md flex items-center justify-center space-x-1 transition-colors"
            >
              <span>{isLoading ? 'প্রসেসিং হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-4">
              <KeyRound className="w-10 h-10 text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">আপনার ইমেইল দিন, আমরা আপনাকে পাসওয়ার্ড রিসেট লিংক পাঠাবো।</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ইমেইল এড্রেস *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="example@mail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md flex items-center justify-center space-x-1 transition-colors"
            >
              <span>{isLoading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full py-2 text-xs text-slate-500 hover:text-teal-700 font-semibold"
            >
              ← লগইনে ফিরে যান
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {activeTab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <KeyRound className="w-10 h-10 text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">নতুন পাসওয়ার্ড সেট করুন।</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">রিসেট টোকেন *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="ইমেইলে পাওয়া টোকেন পেস্ট করুন"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 curvy-input focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

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

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full py-2 text-xs text-slate-500 hover:text-teal-700 font-semibold"
            >
              ← লগইনে ফিরে যান
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="text-sm font-semibold text-teal-800">লোডিং হচ্ছে...</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
