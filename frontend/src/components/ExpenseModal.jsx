import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import { CustomDateTimePicker } from './CustomDateTimePicker';

export const ExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  members = [],
  onQuickAddMember
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  if (!isOpen) return null;

  const handleQuickAddSubmit = async () => {
    if (!quickEmail) {
      alert('Email is required');
      return;
    }
    setQuickAdding(true);
    try {
      const addedUserId = await onQuickAddMember({ email: quickEmail, name: quickName });
      setFormData({ ...formData, memberId: addedUserId });
      setShowQuickAdd(false);
      setQuickName('');
      setQuickEmail('');
    } catch (err) {
      // error is already alerted in parent
    } finally {
      setQuickAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {formData.id ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <p className="text-slate-400 text-xs mb-6">Select a category and fill out details to log the expense</p>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="e.g., Airbnb, Flight ticket"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Category</label>
                <CustomSelect
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={[
                    { value: 'TRAVEL', label: 'Travel' },
                    { value: 'ACCOMMODATION', label: 'Accommodation' },
                    { value: 'FOOD_AND_BEVERAGES', label: 'Food & Beverages' },
                    { value: 'OTHERS', label: 'Others' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="1500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Date & Time</label>
                <CustomDateTimePicker
                  value={formData.date ? formData.date.substring(0, 16) : ''}
                  onChange={(val) => setFormData({ ...formData, date: val })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Paid By</label>
                {!formData.id && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="text-xs font-bold text-[#056449] hover:underline cursor-pointer focus:outline-none"
                  >
                    {showQuickAdd ? '✕ Cancel' : '+ Quick Add'}
                  </button>
                )}
              </div>

              {showQuickAdd ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 mb-2">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">Quick Add Member</div>
                  <div>
                    <input
                      type="text"
                      placeholder="Name (Optional)"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddSubmit}
                    disabled={quickAdding}
                    className="w-full py-2 bg-[#056449] hover:bg-[#04523b] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {quickAdding ? 'Adding...' : 'Add & Select'}
                  </button>
                </div>
              ) : (
                <CustomSelect
                  value={formData.memberId || ''}
                  onChange={(val) => setFormData({ ...formData, memberId: val })}
                  options={members.map((m) => ({ value: m.userId, label: m.userName }))}
                  placeholder="Select Member"
                  required
                />
              )}
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="addAsContribution"
                checked={!!formData.addAsContribution}
                onChange={(e) => setFormData({ ...formData, addAsContribution: e.target.checked })}
                className="w-4 h-4 text-[#056449] border-slate-300 rounded focus:ring-[#056449] cursor-pointer"
              />
              <label htmlFor="addAsContribution" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Add as contribution for this member
              </label>
            </div>

            {/* Conditional Fields: TRAVEL */}
            {formData.category === 'TRAVEL' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">From</label>
                    <input
                      type="text"
                      value={formData.travelFrom || ''}
                      onChange={(e) => setFormData({ ...formData, travelFrom: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="Departure City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">To</label>
                    <input
                      type="text"
                      value={formData.travelTo || ''}
                      onChange={(e) => setFormData({ ...formData, travelTo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="Destination City"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Departure Date & Time</label>
                    <CustomDateTimePicker
                      value={formData.travelStartDate ? formData.travelStartDate.substring(0, 16) : ''}
                      onChange={(val) => setFormData({ ...formData, travelStartDate: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Arrival Date & Time</label>
                    <CustomDateTimePicker
                      value={formData.travelEndDate ? formData.travelEndDate.substring(0, 16) : ''}
                      onChange={(val) => setFormData({ ...formData, travelEndDate: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Fields: ACCOMMODATION */}
            {formData.category === 'ACCOMMODATION' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place</label>
                    <input
                      type="text"
                      value={formData.place || ''}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="Hotel Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Rooms</label>
                    <input
                      type="number"
                      value={formData.roomsCount || ''}
                      onChange={(e) => setFormData({ ...formData, roomsCount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="No. of rooms"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Guests</label>
                    <input
                      type="number"
                      value={formData.peopleCount || ''}
                      onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="No. of people"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Check-in Date & Time</label>
                    <CustomDateTimePicker
                      value={formData.checkInDate ? formData.checkInDate.substring(0, 16) : ''}
                      onChange={(val) => setFormData({ ...formData, checkInDate: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Check-out Date & Time</label>
                    <CustomDateTimePicker
                      value={formData.checkOutDate ? formData.checkOutDate.substring(0, 16) : ''}
                      onChange={(val) => setFormData({ ...formData, checkOutDate: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Fields: FOOD_AND_BEVERAGES */}
            {formData.category === 'FOOD_AND_BEVERAGES' && (
              <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place</label>
                    <input
                      type="text"
                      value={formData.place || ''}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      placeholder="Restaurant, Cafe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Type</label>
                    <CustomSelect
                      value={formData.foodType || 'OTHERS'}
                      onChange={(val) => setFormData({ ...formData, foodType: val })}
                      options={[
                        { value: 'BREAKFAST', label: 'Breakfast' },
                        { value: 'LUNCH', label: 'Lunch' },
                        { value: 'DINNER', label: 'Dinner' },
                        { value: 'FASTFOOD', label: 'Fast Food' },
                        { value: 'SNACKS', label: 'Snacks' },
                        { value: 'WATERBOTTLES', label: 'Water Bottles' },
                        { value: 'DRINKS', label: 'Drinks' },
                        { value: 'OTHERS', label: 'Others' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Place input for OTHERS and TRAVEL categories */}
            {(formData.category === 'OTHERS' || formData.category === 'TRAVEL') && (
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place / Location</label>
                <input
                  type="text"
                  value={formData.place || ''}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="e.g. airport, shop"
                />
              </div>
            )}

            {/* Note Field */}
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                Note {formData.category === 'OTHERS' ? '(Required details)' : '(Optional)'}
              </label>
              <textarea
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition h-20 resize-none text-xs font-medium"
                placeholder="Log extra details here..."
                required={formData.category === 'OTHERS'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
