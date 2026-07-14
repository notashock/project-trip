import React, { useState } from 'react';
import { tripService } from '../services/tripService';

export const SettingsTab = ({ tripId, trip, setTrip, members, fetchData, setActiveTab, role }) => {
  const [settingsForm, setSettingsForm] = useState({
    name: trip?.name || '',
    destination: trip?.destination || 'Goa, India',
    startDate: trip?.startDate ? trip.startDate.substring(0, 10) : '2026-05-15',
    endDate: trip?.endDate ? trip.endDate.substring(0, 10) : '2026-05-22',
    targetPerPerson: trip?.targetPerPerson ? trip.targetPerPerson.toString() : '8000',
    strictBudgetMode: trip?.strictBudgetMode !== undefined ? trip.strictBudgetMode : true,
    whoCanAddExpenses: trip?.whoCanAddExpenses || 'All Members',
    whoCanAddMembers: trip?.whoCanAddMembers || 'Admins Only',
    pushNotifications: trip?.pushNotifications !== undefined ? trip.pushNotifications : true,
    privateTrip: trip?.privateTrip !== undefined ? trip.privateTrip : true
  });

  const handleSaveSettings = async () => {
    try {
      const payload = {
        name: settingsForm.name,
        destination: settingsForm.destination,
        startDate: settingsForm.startDate ? settingsForm.startDate + 'T00:00:00' : null,
        endDate: settingsForm.endDate ? settingsForm.endDate + 'T00:00:00' : null,
        targetPerPerson: parseFloat(settingsForm.targetPerPerson),
        targetBudget: parseFloat(settingsForm.targetPerPerson) * (members.length || 1),
        strictBudgetMode: settingsForm.strictBudgetMode,
        whoCanAddExpenses: settingsForm.whoCanAddExpenses,
        whoCanAddMembers: settingsForm.whoCanAddMembers,
        pushNotifications: settingsForm.pushNotifications,
        privateTrip: settingsForm.privateTrip
      };

      const updated = await tripService.updateTripSettings(tripId, payload);
      setTrip(updated.trip || updated);
      alert('Trip settings updated successfully!');
      fetchData();
      setActiveTab('overview');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 text-slate-700">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Details */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#056449] flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Trip Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Trip Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 font-medium focus:outline-none focus:border-[#056449] transition text-xs sm:text-sm"
                    placeholder="e.g. Goa Summer Trip"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Destination</label>
                  <input
                    type="text"
                    value={settingsForm.destination}
                    onChange={(e) => setSettingsForm({ ...settingsForm, destination: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 font-medium focus:outline-none focus:border-[#056449] transition text-xs sm:text-sm"
                    placeholder="e.g. Goa, India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Dates</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <input
                    type="date"
                    value={settingsForm.startDate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs sm:text-sm font-medium"
                  />
                  <span className="text-slate-400 text-center hidden sm:inline">→</span>
                  <input
                    type="date"
                    value={settingsForm.endDate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Budget Settings */}
          {role === 'ADMIN' && (
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-550 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Budget Settings</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                INR (₹)
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Target Per Person Budget</label>
                <input
                  type="number"
                  value={settingsForm.targetPerPerson}
                  onChange={(e) => setSettingsForm({ ...settingsForm, targetPerPerson: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-extrabold focus:outline-none focus:border-[#056449] transition text-sm"
                  placeholder="e.g. 8000"
                />
                <span className="text-[10px] text-slate-455 block mt-2 font-semibold">
                  Total Group Budget: ₹{(parseFloat(settingsForm.targetPerPerson || 0) * members.length).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <div>
                  <div className="text-xs font-bold text-slate-800">Strict Budget Mode</div>
                  <p className="text-[10px] text-slate-450 mt-0.5">Alert group members when expenses approach 90% of total target.</p>
                </div>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, strictBudgetMode: !settingsForm.strictBudgetMode })}
                  className={`w-10 h-6 rounded-full p-0.5 transition duration-250 focus:outline-none ${
                    settingsForm.strictBudgetMode ? 'bg-[#056449]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-200 ${
                    settingsForm.strictBudgetMode ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Right Column Settings */}
        <div className="space-y-6">
          {/* Permissions */}
          {role === 'ADMIN' && (
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Permissions</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Who can add expenses?</label>
                <select
                  value={settingsForm.whoCanAddExpenses}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whoCanAddExpenses: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                >
                  <option value="All Members">All Members</option>
                  <option value="Admins Only">Admins Only</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Who can add new members?</label>
                <select
                  value={settingsForm.whoCanAddMembers}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whoCanAddMembers: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                >
                  <option value="All Members">All Members</option>
                  <option value="Admins Only">Admins & Managers Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

          {/* Preferences */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-800">Push Notifications</div>
                  <p className="text-[9px] text-slate-450 mt-0.5">Get alerted for new expenses.</p>
                </div>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, pushNotifications: !settingsForm.pushNotifications })}
                  className={`w-10 h-6 rounded-full p-0.5 transition duration-250 focus:outline-none ${
                    settingsForm.pushNotifications ? 'bg-[#056449]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-200 ${
                    settingsForm.pushNotifications ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-800">Private Trip</div>
                  <p className="text-[9px] text-slate-450 mt-0.5">Hide this trip from public feeds.</p>
                </div>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, privateTrip: !settingsForm.privateTrip })}
                  className={`w-10 h-6 rounded-full p-0.5 transition duration-250 focus:outline-none ${
                    settingsForm.privateTrip ? 'bg-[#056449]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-200 ${
                    settingsForm.privateTrip ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                <div>
                  <div className="text-xs font-bold text-slate-800">Danger Zone</div>
                  <p className="text-[9px] text-slate-450 mt-0.5">Archive or delete this trip.</p>
                </div>
                <button className="px-3.5 py-1.5 border border-rose-200 text-rose-500 rounded-lg text-xs font-extrabold hover:bg-rose-50 transition cursor-pointer">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Submit Buttons */}
      <div className="flex justify-end gap-3 mt-6 sm:mt-8">
        <button onClick={() => setActiveTab('overview')} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-full text-[10px] sm:text-xs font-bold transition cursor-pointer">
          Cancel
        </button>
        <button onClick={handleSaveSettings} className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#056449] hover:bg-[#04523b] text-white rounded-full text-[10px] sm:text-xs font-bold transition cursor-pointer shadow-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
};
