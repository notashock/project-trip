import React, { useState, useEffect } from 'react';

export const OfflineOverlay = ({ onOnline }) => {
  const [isPinging, setIsPinging] = useState(false);
  const [failed, setFailed] = useState(false);

  const triggerPing = async () => {
    setIsPinging(true);
    setFailed(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/health`);
      if (res.ok) {
        onOnline();
      } else {
        setFailed(true);
      }
    } catch (err) {
      setFailed(true);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    // Initial ping
    triggerPing();

    // Auto check every 5 seconds
    const interval = setInterval(() => {
      triggerPing();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] text-center flex flex-col items-center">
        
        {/* Pulsing Red Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-550/10 border border-rose-100 flex items-center justify-center text-rose-500 mb-5 relative">
          <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-75" />
          <svg className="w-8 h-8 relative z-10 text-rose-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 4.978 4.978 0 011.414-3.536m0 0L5.636 5.636m3.536 9.9a5 5 0 010-7.072m3.536 3.536L12 12" />
          </svg>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-2">Connection Lost</h3>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-4">
          Unable to establish a connection with the server. Please verify if the backend is running.
        </p>

        {/* User note */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center mb-4 w-full">
          <span className="text-[9px] text-[#056449] font-bold uppercase tracking-wider block mb-1">Note</span>
          <p className="text-[11px] text-slate-600 font-semibold italic">
            "It takes 40s sometimes, enjoy the trip meanwhile..."
          </p>
        </div>

        {/* Status indicator */}
        <div className="w-full mb-6 min-h-[40px] flex items-center justify-center">
          {isPinging ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#056449]">
              <svg className="animate-spin h-4 w-4 text-[#056449]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Attempting reconnection...</span>
            </div>
          ) : failed ? (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[10px] text-rose-600 font-bold w-full">
              Health ping failed. Connection could not be verified.
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 font-bold">
              Checking status...
            </div>
          )}
        </div>

        {/* Retry button */}
        <button
          type="button"
          disabled={isPinging}
          onClick={triggerPing}
          className="w-full py-3 bg-[#056449] hover:bg-[#04523b] disabled:opacity-55 text-white font-extrabold rounded-xl transition text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {!isPinging ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
              </svg>
              Retry Connection
            </>
          ) : (
            <span>Testing Connection...</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default OfflineOverlay;
