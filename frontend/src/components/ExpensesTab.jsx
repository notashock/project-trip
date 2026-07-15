import React, { useState, useMemo } from 'react';

export const ExpensesTab = ({
  expenses,
  canManageData,
  members,
  totalExpenses,
  totalPooled,
  user,
  setExpenseForm,
  setShowExpenseModal,
  handleExpenseDelete,
  trip,
  onExpenseClick,
  searchQuery,
  setSearchQuery
}) => {
  const targetBudget = trip?.targetBudget || (trip?.targetPerPerson * members.length) || 150000;
  const remainingBudget = (totalPooled || 0) - totalExpenses;

  // Filter & Search state
  const [activeFilter, setActiveFilter] = useState('all');

  // Category filter mapping
  const filterCategories = [
    { id: 'all', label: 'All Expenses' },
    { id: 'FOOD_AND_BEVERAGES', label: 'Food & Drink' },
    { id: 'TRAVEL', label: 'Transport' },
    { id: 'ACCOMMODATION', label: 'Accommodation' },
    { id: 'OTHERS', label: 'Others' }
  ];
  console.log(trip)

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter(e => {
      // Category filter
      if (activeFilter !== 'all' && e.category !== activeFilter) return false;

      // Search filter — match title, place, note, or payer name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const payer = members.find(m => m.userId === (e.memberId || e.addedByUserId));
        const matchesTitle = e.title?.toLowerCase().includes(q);
        const matchesPlace = e.place?.toLowerCase().includes(q);
        const matchesNote = e.note?.toLowerCase().includes(q);
        const matchesPayer = payer?.userName?.toLowerCase().includes(q);
        const matchesAmount = String(e.amount || '').includes(q);
        if (!matchesTitle && !matchesPlace && !matchesNote && !matchesPayer && !matchesAmount) return false;
      }

      return true;
    });
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, activeFilter, searchQuery, members]);

  // Filtered total for the current view
  const filteredTotal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Count per category for pill badges
  const categoryCounts = useMemo(() => {
    const counts = { all: expenses.length };
    expenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [expenses]);

  return (
    <div className="space-y-8">
      {/* Screen 2 Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* TOTAL GROUP SPEND */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <span className="text-slate-455 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Group Spend</span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-50 border border-emerald-100 text-[#056449] px-2 py-0.5 rounded-full font-bold">✓ Active</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">₹{totalExpenses.toLocaleString()}</h2>
          </div>
          <div className="mt-4 sm:mt-6">
            {(() => {
              const actualTarget = targetBudget;
              const percent = actualTarget > 0 ? (totalPooled / actualTarget) * 100 : 0;
              const clampedPercent = Math.min(percent, 100);

              // Color interpolation from 10% (Red, hue 0) to 90% (Green, hue 120)
              const clampedHue = Math.max(10, Math.min(90, percent));
              const hue = ((clampedHue - 10) / 80) * 120;
              const barColor = `hsl(${hue}, 85%, 42%)`;

              return (
                <>
                  <div className="flex justify-between text-[11px] sm:text-xs text-slate-455 mb-1.5 sm:mb-2 font-semibold flex-wrap gap-2">
                    <span>Budget Progress (Collected: ₹{totalPooled.toLocaleString()})</span>
                    <span>Target: ₹{actualTarget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden border border-slate-200/30">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${clampedPercent}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* RIGHT SUB CARDS */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* REMAINING BUDGET */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
            <h3 className="text-slate-450 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">Remaining Balance</h3>
            <p className={`text-lg sm:text-2xl font-black ${remainingBudget >= 0 ? 'text-[#056449]' : 'text-rose-500'}`}>₹{remainingBudget.toLocaleString()}</p>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium block mt-1">
              ₹{(totalPooled || 0).toLocaleString()} collected − ₹{totalExpenses.toLocaleString()} spent
            </span>
          </div>
          {/* YOUR BALANCE */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex justify-between items-center group hover:border-[#056449]/15 transition-all">
            <div>
              <h3 className="text-slate-450 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1">Your Balance</h3>
              {(() => {
                const myMember = members.find(m => 
                  (m.userId && user?.id && m.userId === user.id) || 
                  (m.userEmail && user?.email && m.userEmail.toLowerCase() === user.email.toLowerCase())
                );
                const myOwes = myMember?.owes || 0;
                const myOwed = myMember?.owed || 0;
                if (myOwes > 0) {
                  return <p className="text-lg sm:text-xl font-black text-rose-500">Owe ₹{myOwes.toLocaleString()}</p>;
                } else if (myOwed > 0) {
                  return <p className="text-lg sm:text-xl font-black text-[#056449]">Owed ₹{myOwed.toLocaleString()}</p>;
                } else {
                  return <p className="text-lg sm:text-xl font-black text-slate-700">Settled</p>;
                }
              })()}
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Filter pills and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap gap-1.5">
          {filterCategories.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition cursor-pointer select-none flex items-center gap-1 sm:gap-1.5 ${
                activeFilter === filter.id
                  ? 'bg-[#056449] text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40'
              }`}
            >
              {filter.label}
              {(categoryCounts[filter.id] || 0) > 0 && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  activeFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/60 text-slate-500'
                }`}>
                  {categoryCounts[filter.id] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered results indicator */}
      {(activeFilter !== 'all' || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>
            Showing <span className="text-slate-900 font-bold">{filteredExpenses.length}</span> of {expenses.length} expenses
            {activeFilter !== 'all' && <span> in <span className="text-[#056449] font-bold">{filterCategories.find(f => f.id === activeFilter)?.label}</span></span>}
            {searchQuery && <span> matching "<span className="text-slate-900 font-bold">{searchQuery}</span>"</span>}
            {' '}— ₹{filteredTotal.toLocaleString()}
          </span>
          <button
            onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
            className="text-[#056449] hover:text-[#04523b] font-bold cursor-pointer transition"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* List of Expenses */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-slate-900">Expenses Log</h3>
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
                  checkOutDate: '',
                  memberId: user?.id || '',
                  addAsContribution: false
                });
                setShowExpenseModal(true);
              }}
              className="bg-[#056449] hover:bg-[#04523b] text-white px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              + Add Expense
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            {expenses.length === 0 ? (
              <p className="text-slate-400 text-xs">No expenses logged yet.</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-slate-400 text-xs font-semibold">No expenses match your filters.</p>
                <button
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                  className="text-[#056449] text-xs font-bold cursor-pointer hover:text-[#04523b] transition mt-1"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map(e => {
              const payer = members.find(m => m.userId === (e.memberId || e.addedByUserId));
              let categoryIcon = (
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
              );
              if (e.category === 'ACCOMMODATION') {
                categoryIcon = (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                );
              } else if (e.category === 'FOOD_AND_BEVERAGES') {
                categoryIcon = (
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-555 border border-amber-100/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                );
              } else if (e.category === 'TRAVEL') {
                categoryIcon = (
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-555 border border-sky-100/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                );
              }

              return (
                <div
                  key={e.id}
                  onClick={() => onExpenseClick && onExpenseClick(e)}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0 hover:bg-slate-50/50 p-3 sm:p-2 rounded-2xl transition duration-150 cursor-pointer gap-2.5 sm:gap-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="flex-shrink-0">
                      {categoryIcon}
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{e.title}</span>
                        <span className="text-[8px] sm:text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {e.category}
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 sm:mt-1">
                        Paid by <span className="font-semibold text-slate-700">{payer?.userName || 'Member'}</span> • {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t border-slate-100/50 sm:border-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="font-black text-rose-500 text-xs sm:text-sm">-₹{e.amount.toLocaleString()}</div>
                      <div className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Split Equally</div>
                    </div>
                    {canManageData && (
                      <div className="flex gap-1.5 sm:gap-2 mt-0 sm:mt-1.5">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpenseForm({ id: e.id, title: e.title, amount: e.amount, note: e.note || '', date: e.date ? e.date.substring(0, 16) : '', place: e.place || '', category: e.category || 'OTHERS', foodType: e.foodType || 'OTHERS', travelFrom: e.travelFrom || '', travelTo: e.travelTo || '', travelStartDate: e.travelStartDate ? e.travelStartDate.substring(0, 16) : '', travelEndDate: e.travelEndDate ? e.travelEndDate.substring(0, 16) : '', roomsCount: e.roomsCount || '', peopleCount: e.peopleCount || '', checkInDate: e.checkInDate ? e.checkInDate.substring(0, 16) : '', checkOutDate: e.checkOutDate ? e.checkOutDate.substring(0, 16) : '', memberId: e.memberId || e.addedByUserId || '', addAsContribution: !!e.addAsContribution });
                            setShowExpenseModal(true);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#056449] hover:bg-emerald-50 transition cursor-pointer"
                          title="Edit Expense"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleExpenseDelete(e.id);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Expense"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
