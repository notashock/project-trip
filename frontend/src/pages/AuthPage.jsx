import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { api } from '../services/api';

const AuthPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [isPinging, setIsPinging] = useState(false);

  const checkServerHealth = async () => {
    setIsPinging(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/health`);
      if (res.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(() => {
      checkServerHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  const switchTab = (tab) => {
    resetForm();
    setActiveTab(tab);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, passwordHash: password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, passwordHash: password });
      setSuccess('Account created successfully! Signing you in...');
      // Auto-login after registration
      setTimeout(async () => {
        try {
          const data = await api.post('/auth/login', { email, passwordHash: password });
          login(data.token, data.user);
          navigate('/');
        } catch {
          setSuccess('');
          switchTab('login');
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Soft gradient orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#056449]/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-400/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-300/[0.02] rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #056449 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#056449] shadow-lg shadow-[#056449]/15 mb-4 sm:mb-5 flex-shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SplitWise Travel</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
            Split trip costs effortlessly with your crew
          </p>
        </div>

        {/* Server Status Indicator */}
        <div className="flex justify-center mb-6 min-h-[48px]">
          {serverStatus === 'checking' && (
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/50 px-3.5 py-1.5 rounded-full shadow-xs text-[10px] font-bold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span>Checking backend connection...</span>
            </div>
          )}
          {serverStatus === 'online' && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-[#056449] px-3.5 py-1.5 rounded-full shadow-xs text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#056449]" />
              <span>Server Online</span>
            </div>
          )}
          {serverStatus === 'offline' && (
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-3.5 py-1.5 rounded-full shadow-xs text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Server Offline</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold italic text-center max-w-[280px]">
                It takes 40s sometimes, enjoy the trip meanwhile...
              </p>
              <button
                type="button"
                disabled={isPinging}
                onClick={checkServerHealth}
                className="text-[9px] text-[#056449] hover:underline font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50 mt-0.5"
              >
                {isPinging ? (
                  <>
                    <svg className="animate-spin h-2.5 w-2.5 text-[#056449]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Pinging...
                  </>
                ) : (
                  <>
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                    </svg>
                    Trigger Health Ping
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.04)] overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3.5 sm:py-4 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                activeTab === 'login'
                  ? 'text-[#056449]'
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              Sign In
              {activeTab === 'login' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2.5px] bg-[#056449] rounded-full" />
              )}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-3.5 sm:py-4 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                activeTab === 'register'
                  ? 'text-[#056449]'
                  : 'text-slate-400 hover:text-slate-655'
              }`}
            >
              Create Account
              {activeTab === 'register' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2.5px] bg-[#056449] rounded-full" />
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-8">
            {/* Theme Toggle */}
            <div className="mb-6 flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pl-1.5">Theme Preferences</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/20 dark:border-slate-800">
                {[
                  { id: 'light', label: 'Light' },
                  { id: 'system', label: 'System' },
                  { id: 'dark', label: 'Dark' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                      theme === t.id
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-4 rounded-2xl mb-5 flex items-center gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-[#056449] text-xs font-bold p-4 rounded-2xl mb-5 flex items-center gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] focus:bg-white transition-all duration-200 text-sm font-semibold"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] focus:bg-white transition-all duration-200 text-sm font-semibold"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#056449] hover:bg-[#04523b] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm shadow-[#056449]/10 active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-slate-400 text-xs font-semibold mt-4">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-[#056449] hover:text-[#04523b] font-bold transition cursor-pointer"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] focus:bg-white transition-all duration-200 text-sm font-semibold"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] focus:bg-white transition-all duration-200 text-sm font-semibold"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] focus:bg-white transition-all duration-200 text-sm font-semibold"
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading || !!success}
                  className="w-full bg-[#056449] hover:bg-[#04523b] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm shadow-[#056449]/10 active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : success ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-slate-400 text-xs font-semibold mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-[#056449] hover:text-[#04523b] font-bold transition cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Decorative Info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Group Splits
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Real-time
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
