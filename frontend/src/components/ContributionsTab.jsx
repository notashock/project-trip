import React, { useState } from 'react';
import { tripService } from '../services/tripService';

export const ContributionsTab = ({
  contributions,
  members,
  trip,
  fetchData,
  canManageData,
  totalPooled,
  totalPending,
  totalTripTarget,
  setShowContributionModal,
  setContributionForm,
  user,
  redistributeExtra,
  handleToggleAdjustExtra,
  handleFixAdjustedTarget,
  role,
  pooledByUser,
  adjustedTarget,
  onContributionClick,
  searchQuery,
  setSearchQuery
}) => {
  const [methodFilter, setMethodFilter] = useState('All'); // 'All', 'UPI', 'Cash', 'Card'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Verified', 'Pending'
  const [showFilters, setShowFilters] = useState(false);

  // Next Milestone calculation: next non-zero owes value from members
  const nextMilestone = members.filter(m => (m.owes || 0) > 0).sort((a,b) => a.owes - b.owes)[0]?.owes || 5000;
  
  // Format milestone date (default to trip start date minus 3 days, or May 10th default)
  const formattedMilestoneDate = (() => {
    if (trip?.startDate) {
      const d = new Date(trip.startDate);
      d.setDate(d.getDate() - 3);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return 'May 10th';
  })();

  // Filter contributions
  const filteredContributions = contributions
    .filter(c => {
      const memberName = members.find(m => m.userId === c.userId)?.userName || 'Unknown Member';
      const q = searchQuery.toLowerCase();
      const matchesSearch = memberName.toLowerCase().includes(q) || 
                            (c.note || '').toLowerCase().includes(q) ||
                            (c.method || '').toLowerCase().includes(q) ||
                            (c.status || '').toLowerCase().includes(q) ||
                            String(c.amount || '').includes(q);
      const matchesMethod = methodFilter === 'All' || c.method === methodFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesMethod && matchesStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (cId) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    try {
      await tripService.deleteContribution(trip.id, cId);
      fetchData();
    } catch (err) {
      alert('Failed to delete contribution: ' + err.message);
    }
  };

  const handleEdit = (c) => {
    setContributionForm({
      id: c.id,
      userId: c.userId.toString(),
      amount: c.amount.toString(),
      note: c.note || '',
      method: c.method || 'UPI',
      status: c.status || 'Verified'
    });
    setShowContributionModal(true);
  };

  return (
    <div className="space-y-8">

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* TOTAL COLLECTED */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider block mb-1.5 sm:mb-4">Collected</span>
            <h2 className="text-xl sm:text-3xl font-black text-[#056449]">₹{totalPooled.toLocaleString()}</h2>
          </div>
          <div className="mt-4 sm:mt-6">
            <div className="w-full bg-slate-100 h-1.5 sm:h-2.5 rounded-full overflow-hidden border border-slate-200/30">
              <div className="bg-[#056449] h-full rounded-full" style={{ width: `${Math.min((totalPooled / (totalTripTarget || 1)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* REMAINING TARGET */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider block mb-1.5 sm:mb-4">Pending</span>
            <h2 className="text-xl sm:text-3xl font-black text-amber-600">₹{totalPending.toLocaleString()}</h2>
          </div>
          <div className="mt-4 sm:mt-6">
            <span className="text-[9px] sm:text-xs text-slate-455 font-semibold truncate block">
              Budget: ₹{totalTripTarget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* NEXT MILESTONE */}
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-slate-455 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider block mb-1.5 sm:mb-4">Milestone</span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">₹{nextMilestone.toLocaleString()}</h2>
          </div>
          <div className="mt-4 sm:mt-6 flex">
            <span className="text-[8px] sm:text-[10px] bg-slate-50 border border-slate-200/60 text-slate-600 font-extrabold px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-sm truncate">
              Due {formattedMilestoneDate}
            </span>
          </div>
        </div>
      </div>

      {/* Contribution Table Block */}
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Contribution History</h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer select-none ${
                  showFilters || methodFilter !== 'All' || statusFilter !== 'All'
                    ? 'border-[#056449] bg-emerald-50/40 text-[#056449]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              
              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-3xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] z-50 space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Payment Method</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'UPI', 'Cash', 'Card'].map(m => (
                        <button
                          key={m}
                          onClick={() => setMethodFilter(m)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                            methodFilter === m ? 'bg-[#056449] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Status</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'Verified', 'Pending'].map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                            statusFilter === s ? 'bg-[#056449] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Button */}
            {canManageData && (
              <button
                onClick={() => {
                  setContributionForm({ id: null, userId: '', amount: '', note: '', method: 'UPI', status: 'Verified' });
                  setShowContributionModal(true);
                }}
                className="bg-[#056449] hover:bg-[#04523b] text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Contribution
              </button>
            )}
          </div>
        </div>

        {/* Table Render */}
        <div className="overflow-auto max-h-[300px] pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 sm:px-6 sm:py-4">Member</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Date</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Amount</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Method</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Status</th>
                {canManageData && <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
              {filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No contributions matched the active filters.
                  </td>
                </tr>
              ) : (
                filteredContributions.map((c) => {
                  const member = members.find(m => m.userId === c.userId);
                  const name = member?.userName || 'Unknown Member';
                  const initials = name.substring(0, 2).toUpperCase();
                  
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onContributionClick && onContributionClick(c)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      {/* Member */}
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#056449] border border-emerald-100 flex items-center justify-center font-bold text-sm">
                            {initials}
                          </div>
                          <span className="font-extrabold text-slate-900">{name}</span>
                        </div>
                      </td>
                      
                      {/* Date */}
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-500 font-medium">
                        {c.date ? new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unset'}
                      </td>
                      
                      {/* Amount */}
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-extrabold text-slate-900">
                        ₹{c.amount.toLocaleString()}
                      </td>
                      
                      {/* Method */}
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          {c.method === 'Cash' ? (
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                          )}
                          {c.method || 'UPI'}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        {c.status === 'Pending' ? (
                          <span className="text-[11.5px] sm:text-xs bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                            Pending
                          </span>
                        ) : (
                          <span className="text-[11.5px] sm:text-xs bg-emerald-50 border border-emerald-100 text-[#056449] px-2 py-0.5 rounded-full font-bold">
                            Verified
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      {canManageData && (
                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEdit(c);
                              }}
                              className="text-slate-400 hover:text-[#056449] p-1.5 hover:bg-slate-100 rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(c.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Showing {filteredContributions.length} of {contributions.length} contributions
        </div>
      </div>

      {/* Settlements & Target Lock */}
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl  shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 p-4 gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Settlements & Target Lock</h3>
            <p className="text-[10px] text-slate-455 mt-0.5">Locks adjustment modes and balances the cash ledger</p>
          </div>
          
          {(redistributeExtra || (() => {
            const target = trip?.targetPerPerson || 0;
            return members.some(m => (pooledByUser[m.userId] || 0) > target);
          })()) && (
            <div className="flex bg-slate-100 border border-slate-200/60 rounded-full p-0.5 items-center gap-0.5 shadow-sm">
              <button
                type="button"
                disabled={role !== 'ADMIN'}
                onClick={() => handleToggleAdjustExtra(false)}
                className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide transition cursor-pointer select-none ${
                  !redistributeExtra 
                    ? 'bg-[#056449] text-white shadow-sm' 
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                disabled={role !== 'ADMIN'}
                onClick={() => handleToggleAdjustExtra(true)}
                className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide transition cursor-pointer select-none ${
                  redistributeExtra 
                    ? 'bg-[#056449] text-white shadow-sm' 
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                Adjust
              </button>
              {redistributeExtra && (
                <button
                  type="button"
                  disabled={role !== 'ADMIN'}
                  onClick={handleFixAdjustedTarget}
                  className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide text-rose-600 hover:bg-rose-50/80 transition cursor-pointer select-none"
                >
                  Lock Target
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Contributor</th>
                <th className="px-6 py-3">Total Pooled</th>
                <th className="px-6 py-3">Balance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
              {members.map(m => {
                const userPooled = m.totalContributed !== undefined ? m.totalContributed : (pooledByUser[m.userId] || 0);
                const owes = m.owes !== undefined ? m.owes : 0;
                const owed = m.owed !== undefined ? m.owed : 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-extrabold text-slate-900">{m.userName}</td>
                    <td className="px-6 py-3.5 text-[#056449] font-black">₹{userPooled.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {owes > 0 ? (
                        <span className="text-indigo-600 font-bold">Owes: ₹{owes.toLocaleString()}</span>
                      ) : owed > 0 ? (
                        <span className="text-[#056449] font-bold">Owed: ₹{owed.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
