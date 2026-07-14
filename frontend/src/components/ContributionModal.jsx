import React from 'react';
import { CustomSelect } from './CustomSelect';

export const ContributionModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  members
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {formData.id ? 'Edit Record' : 'Add Record'}
        </h3>
        <p className="text-slate-400 text-xs mb-6">Select member and enter details to record deposit</p>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Member</label>
              <CustomSelect
                value={formData.userId}
                onChange={(val) => setFormData({ ...formData, userId: val })}
                options={members.map((m) => ({ value: m.userId, label: m.userName }))}
                disabled={!!formData.id}
                placeholder="Select a member"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Note (Optional)</label>
              <input
                type="text"
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                placeholder="Payment reference / Note"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Method</label>
                <CustomSelect
                  value={formData.method}
                  onChange={(val) => setFormData({ ...formData, method: val })}
                  options={[
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Card', label: 'Card' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Status</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: 'Verified', label: 'Verified' },
                    { value: 'Pending', label: 'Pending' }
                  ]}
                />
              </div>
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
