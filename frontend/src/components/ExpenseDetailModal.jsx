import React from 'react';

const CATEGORY_NAMES = {
  TRAVEL: 'Travel',
  ACCOMMODATION: 'Accommodation',
  FOOD_AND_BEVERAGES: 'Food & Beverages',
  OTHERS: 'Others'
};

export const ExpenseDetailModal = ({ isOpen, onClose, expense, members }) => {
  if (!isOpen || !expense) return null;

  const payer = members.find(m => m.userId === expense.userId);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {CATEGORY_NAMES[expense.category] || expense.category}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{expense.title}</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 min-h-0">
          {/* Amount Badge */}
          <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-center">
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block mb-1">Expense Amount</span>
            <span className="text-2xl font-black text-rose-600">-₹{Number(expense.amount).toLocaleString()}</span>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold">
            <div>
              <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Paid By</span>
              <span className="text-slate-800">{payer?.userName || 'Member'}</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Date & Time</span>
              <span className="text-slate-800">{formatDate(expense.date)}</span>
            </div>
          </div>

          {/* Category-Specific Fields */}
          {expense.category === 'TRAVEL' && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Travel Details</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">From</span>
                  <span className="text-slate-800">{expense.travelFrom || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">To</span>
                  <span className="text-slate-800">{expense.travelTo || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Departure</span>
                  <span className="text-slate-800">{formatDate(expense.travelStartDate)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Arrival</span>
                  <span className="text-slate-800">{formatDate(expense.travelEndDate)}</span>
                </div>
              </div>
            </div>
          )}

          {expense.category === 'ACCOMMODATION' && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Accommodation Details</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="col-span-2">
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Hotel / Place</span>
                  <span className="text-slate-800">{expense.place || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Rooms Booked</span>
                  <span className="text-slate-800">{expense.roomsCount || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Guests Count</span>
                  <span className="text-slate-800">{expense.peopleCount || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Check-in</span>
                  <span className="text-slate-800">{formatDate(expense.checkInDate)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Check-out</span>
                  <span className="text-slate-800">{formatDate(expense.checkOutDate)}</span>
                </div>
              </div>
            </div>
          )}

          {expense.category === 'FOOD_AND_BEVERAGES' && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Food & Beverage Details</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Restaurant / Place</span>
                  <span className="text-slate-800">{expense.place || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">Meal Type</span>
                  <span className="text-slate-800 uppercase tracking-wide text-[10px]">
                    {expense.foodType || 'Others'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(expense.category === 'OTHERS' && expense.place) && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Location</h4>
              <div className="text-xs font-semibold text-slate-800">{expense.place}</div>
            </div>
          )}

          {/* Note Section */}
          {expense.note && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notes & Descriptions</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                {expense.note}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
