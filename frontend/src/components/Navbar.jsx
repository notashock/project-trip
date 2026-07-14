import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ children, rightActions, brandOverride }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change password');
      
      setPasswordSuccess(data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand (logo or override) + page-specific center content */}
          <div className="flex items-center gap-8 min-w-0">
            {brandOverride ? (
              /* Custom brand area — e.g. back arrow + trip name */
              brandOverride
            ) : (
              /* Default logo */
              <span
                className="text-xl font-black text-[#056449] tracking-tight flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                onClick={() => navigate('/')}
              >
                <svg className="w-5 h-5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="hidden sm:inline">SplitWise Travel</span>
              </span>
            )}

            {/* Center content slot (tabs, breadcrumbs, etc.) */}
            {children}
          </div>

          {/* Right: Page-specific actions + Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Page-specific right actions (search, buttons, etc.) */}
            {rightActions}

            {/* Profile Avatar + Dropdown — CONSISTENT across all pages */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#056449] font-black text-xs hover:border-[#056449]/35 transition shadow-sm cursor-pointer"
              >
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl p-2 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] z-50">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs font-extrabold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/'); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition font-bold mt-1.5 cursor-pointer flex items-center gap-2.5"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    My Trips
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); setShowPasswordModal(true); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition font-bold cursor-pointer flex items-center gap-2.5"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </button>
                  <div className="border-t border-slate-50 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-2xl transition font-bold cursor-pointer flex items-center gap-2.5"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal — always available from any page */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Change Password</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Update your account credentials to keep your data secure</p>
            
            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-[#056449] text-xs p-4 rounded-xl mb-4 text-center font-bold flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-4 rounded-xl mb-4 text-center font-bold flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordError(''); }}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-extrabold rounded-xl transition text-xs cursor-pointer flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
