import React from 'react';

export const SummaryTab = ({
  members,
  expenses,
  pooledByUser,
  adjustedTarget,
  canManageData,
  role,
  trip,
  redistributeExtra,
  handleToggleAdjustExtra,
  handleFixAdjustedTarget,
  setShowContributionModal,
  setContributionForm,
  setShowExpenseModal,
  setExpenseForm,
  totalTripTarget,
  totalPending,
  totalPooled,
  availableBalance,
  totalExpenses,
  user,
  searchQuery
}) => {
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m => {
      const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
      const owes = m.owes !== undefined ? m.owes : 0;
      return (m.userName || '').toLowerCase().includes(q) ||
             (m.userEmail || '').toLowerCase().includes(q) ||
             (m.customTag || '').toLowerCase().includes(q) ||
             String(userPooled).includes(q) ||
             String(owes).includes(q);
    });
  }, [members, searchQuery, pooledByUser]);

  const filteredExpensesForSummary = React.useMemo(() => {
    if (!searchQuery) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(e => {
      const payer = members.find(m => m.userId === (e.memberId || e.addedByUserId));
      return (e.title || '').toLowerCase().includes(q) ||
             (e.place || '').toLowerCase().includes(q) ||
             (e.note || '').toLowerCase().includes(q) ||
             (payer?.userName || '').toLowerCase().includes(q) ||
             String(e.amount).includes(q);
    });
  }, [expenses, searchQuery, members]);

  const myMember = members.find(m => 
    (m.userId && user?.id && m.userId === user.id) || 
    (m.userEmail && user?.email && m.userEmail.toLowerCase() === user.email.toLowerCase())
  );
  const myOwes = myMember?.owes || 0;

  return (
    <div className="space-y-8">
      
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* CARD 1: TOTAL TRIP TARGET */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex justify-between items-start relative group hover:border-[#056449]/15 transition-all duration-200">
          <div>
            <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">Total Target</h3>
            <p className="text-xl sm:text-3xl font-black text-slate-900">₹{totalTripTarget.toLocaleString()}</p>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium block mt-1.5">{members.length} members @ ₹{Math.round(adjustedTarget).toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
        </div>

        {/* CARD 2: PENDING / OWED */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex justify-between items-start relative group hover:border-amber-500/15 transition-all duration-200">
          <div>
            <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">Pending / Owed</h3>
            <p className="text-xl sm:text-3xl font-black text-amber-600">₹{(myOwes > 0 ? myOwes : totalPending).toLocaleString()}</p>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium block mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate max-w-[80px] sm:max-w-none">
                {myOwes > 0 ? `Your share` : `Total`}
              </span>
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100/50 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        {/* CARD 3: AVAILABLE BALANCE */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex justify-between items-start relative group hover:border-[#056449]/15 transition-all duration-200">
          <div>
            <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">Available</h3>
            <p className="text-xl sm:text-3xl font-black text-[#056449]">₹{availableBalance.toLocaleString()}</p>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium block mt-1.5">Ready to spend</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#056449] border border-emerald-100/50 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* CARD 4: TOTAL EXPENSES */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex justify-between items-start relative group hover:border-rose-500/15 transition-all duration-200">
          <div>
            <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">Total Spent</h3>
            <p className="text-xl sm:text-3xl font-black text-rose-550">₹{totalExpenses.toLocaleString()}</p>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium block mt-1.5">From collected</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center text-rose-550 border border-rose-100/50 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Recent Expenses */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-rose-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-sm sm:text-lg font-extrabold text-slate-900">Recent Expenses</h2>
              </div>
            </div>

            <div className="space-y-4">
              {filteredExpensesForSummary.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <p>No older expenses yet.</p>
                </div>
              ) : (
                [...filteredExpensesForSummary]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 6)
                  .map(e => {
                    const payer = members.find(m => m.userId === (e.memberId || e.addedByUserId));
                  let categoryIcon = (
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/50">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                  );
                  if (e.category === 'ACCOMMODATION') {
                    categoryIcon = (
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      </div>
                    );
                  } else if (e.category === 'FOOD_AND_BEVERAGES') {
                    categoryIcon = (
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-555 border border-amber-100/50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    );
                  } else if (e.category === 'TRAVEL') {
                    categoryIcon = (
                      <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-555 border border-sky-100/50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    );
                  }

                  return (
                    <div key={e.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {categoryIcon}
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{e.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Paid by {payer?.userName || 'Member'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-rose-500 text-sm">-₹{e.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {canManageData && (
            <button
              onClick={() => {
                setExpenseForm({
                  id: null,
                  title: '',
                  amount: '',
                  note: '',
                  date: new Date().toISOString().substring(0, 16),
                  place: '',
                  category: 'OTHERS',
                  foodType: 'OTHERS',
                  travelFrom: '',
                  travelTo: '',
                  travelStartDate: '',
                  travelEndDate: '',
                  roomsCount: '',
                  peopleCount: '',
                  checkInDate: '',
                  checkOutDate: ''
                });
                setShowExpenseModal(true);
              }}
              className="w-full bg-[#056449] hover:bg-[#04523b] text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              + Add New Expense
            </button>
          )}
        </div>

        {/* Right Column: Member Progress */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-900">Member Progress</h2>
            </div>
            {canManageData && (
              <button
                onClick={() => { setContributionForm({ id: null, userId: '', amount: '', note: '' }); setShowContributionModal(true); }}
                className="bg-[#056449] hover:bg-[#04523b] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                + Add Contribution
              </button>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {filteredMembers.map(m => {
              const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
              const owes = m.owes !== undefined ? m.owes : 0;
              const owed = m.owed !== undefined ? m.owed : 0;
              
              const isPaid = owes <= 0;
              const isUnpaid = userPooled === 0;
              const percent = Math.min((userPooled / adjustedTarget) * 100, 100);
              const clampedHue = Math.max(10, Math.min(90, percent));
              const hue = ((clampedHue - 10) / 80) * 120;
              const barColor = `hsl(${hue}, 85%, 42%)`;

              return (
                <div key={m.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shadow-sm">
                        {m.userName ? m.userName.substring(0, 2) : 'M'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-800">{m.userName}</span>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] bg-emerald-50 border border-emerald-100 text-[#056449] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              ✓ Paid
                            </span>
                          ) : isUnpaid ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] bg-slate-50 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Unpaid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[8px] bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-extrabold text-slate-800">₹{userPooled.toLocaleString()}</span>
                      <span className="text-slate-400"> / ₹{Math.round(adjustedTarget).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/30">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
