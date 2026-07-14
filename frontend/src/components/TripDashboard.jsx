import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { SummaryTab } from './SummaryTab';
import { ExpensesTab } from './ExpensesTab';
import { MembersTab } from './MembersTab';
import { SettingsTab } from './SettingsTab';
import { ContributionsTab } from './ContributionsTab';
import Navbar from './Navbar';

const TripDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Lists
  const [expenses, setExpenses] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [redistributeExtra, setRedistributeExtra] = useState(false);

  // Modals / Forms state
  const [expenseForm, setExpenseForm] = useState({
    id: null,
    title: '',
    amount: '',
    note: '',
    date: '',
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
  const [contributionForm, setContributionForm] = useState({ id: null, userId: '', amount: '', note: '', method: 'UPI', status: 'Verified' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'CONTRIBUTOR', customTag: '', name: '' });
  const [editMemberForm, setEditMemberForm] = useState({ id: null, role: 'CONTRIBUTOR', customTag: '' });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [tempPasswordTitle, setTempPasswordTitle] = useState('Account Created Successfully!');

  const fetchData = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.fetchTripDetails(tripId);
      setTrip(tripData.trip);
      setRole(tripData.role);
      setRedistributeExtra(!!tripData.trip.adjustForExtra);

      const expData = await tripService.fetchTripExpenses(tripId);
      setExpenses(expData);

      const contData = await tripService.fetchTripContributions(tripId);
      setContributions(contData);

      const memData = await tripService.fetchTripMembers(tripId);
      setMembers(memData);
    } catch (err) {
      setError(err.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-[#056449] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading Goa Trip...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6 text-slate-600 text-center">
        <div className="max-w-md bg-white border border-slate-200/80 p-8 rounded-3xl shadow-lg flex flex-col items-center">
          <svg className="w-12 h-12 text-rose-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold text-slate-800 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#056449] hover:bg-[#04523b] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Permissions helper
  const canManageData = role === 'ADMIN' || role === 'MANAGER';
  const isAdmin = role === 'ADMIN';

  // Math calculations
  const totalPooled = members.reduce((acc, m) => acc + (m.totalContributed || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableBalance = totalPooled - totalExpenses;
  const adjustedTarget = trip?.adjustedTarget || trip?.targetPerPerson || 0;
  const totalTripTarget = adjustedTarget * members.length;
  const totalPending = members.reduce((acc, m) => acc + (m.owes || 0), 0);

  const pooledByUser = {};
  members.forEach(m => {
    pooledByUser[m.userId] = m.totalContributed || 0;
  });

  // Handlers
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        note: expenseForm.note,
        place: expenseForm.place,
        date: expenseForm.date ? expenseForm.date : null,
        category: expenseForm.category,
        foodType: expenseForm.category === 'FOOD_AND_BEVERAGES' ? expenseForm.foodType : null,
        travelFrom: expenseForm.category === 'TRAVEL' ? expenseForm.travelFrom : null,
        travelTo: expenseForm.category === 'TRAVEL' ? expenseForm.travelTo : null,
        travelStartDate: expenseForm.category === 'TRAVEL' && expenseForm.travelStartDate ? expenseForm.travelStartDate : null,
        travelEndDate: expenseForm.category === 'TRAVEL' && expenseForm.travelEndDate ? expenseForm.travelEndDate : null,
        roomsCount: expenseForm.category === 'ACCOMMODATION' && expenseForm.roomsCount ? parseInt(expenseForm.roomsCount) : null,
        peopleCount: expenseForm.category === 'ACCOMMODATION' && expenseForm.peopleCount ? parseInt(expenseForm.peopleCount) : null,
        checkInDate: expenseForm.category === 'ACCOMMODATION' && expenseForm.checkInDate ? expenseForm.checkInDate : null,
        checkOutDate: expenseForm.category === 'ACCOMMODATION' && expenseForm.checkOutDate ? expenseForm.checkOutDate : null
      };

      if (expenseForm.id) {
        const updated = await tripService.updateExpense(tripId, expenseForm.id, payload);
        setExpenses(expenses.map(exp => exp.id === expenseForm.id ? updated : exp));
      } else {
        const added = await tripService.addExpense(tripId, payload);
        setExpenses([...expenses, added]);
      }
      setShowExpenseModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExpenseDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await tripService.deleteExpense(tripId, id);
      setExpenses(expenses.filter(e => e.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: parseInt(contributionForm.userId),
        amount: parseFloat(contributionForm.amount),
        note: contributionForm.note,
        date: new Date().toISOString(),
        method: contributionForm.method || 'UPI',
        status: contributionForm.status || 'Verified'
      };

      if (contributionForm.id) {
        const updated = await tripService.updateContribution(tripId, contributionForm.id, payload);
        setContributions(contributions.map(c => c.id === contributionForm.id ? updated : c));
      } else {
        const added = await tripService.addContribution(tripId, payload);
        setContributions([...contributions, added]);
      }
      setShowContributionModal(false);
      setContributionForm({ id: null, userId: '', amount: '', note: '', method: 'UPI', status: 'Verified' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await tripService.inviteMember(tripId, memberForm);
      setShowMemberModal(false);
      setMemberForm({ email: '', role: 'CONTRIBUTOR', customTag: '', name: '' });
      fetchData();

      if (res.temporaryPassword) {
        setTempPasswordTitle('Account Created Successfully!');
        setTempPassword(res.temporaryPassword);
      } else {
        alert('Member added successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      await tripService.updateMember(tripId, editMemberForm.id, {
        role: editMemberForm.role,
        customTag: editMemberForm.customTag
      });
      setShowEditMemberModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMemberRemove = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await tripService.removeMember(tripId, memberId);
      setMembers(members.filter(m => m.id !== memberId));
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchMemberPassword = async (memberId, userName) => {
    try {
      const res = await tripService.fetchMemberTemporaryPassword(tripId, memberId);
      if (res.temporaryPassword) {
        setTempPasswordTitle(`Password for ${userName}`);
        setTempPassword(res.temporaryPassword);
      } else {
        alert('Temporary password is no longer available.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAdjustExtra = async (val) => {
    try {
      const updated = await tripService.updateTripSettings(tripId, {
        name: trip.name,
        targetPerPerson: trip.targetPerPerson,
        adjustForExtra: val
      });
      setTrip(updated.trip || updated);
      setRedistributeExtra(val);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFixAdjustedTarget = async () => {
    if (role !== 'ADMIN') {
      alert('Only ADMIN can fix the target');
      return;
    }
    if (!window.confirm(`Fix the adjusted target ₹${Math.round(adjustedTarget)}?`)) {
      return;
    }
    try {
      const updated = await tripService.updateTripSettings(tripId, {
        name: trip.name,
        targetPerPerson: trip.targetPerPerson,
        fixAdjustedTarget: true
      });
      setTrip(updated.trip || updated);
      setRedistributeExtra(false);
      alert(`Target successfully fixed at ₹${Math.round(updated.targetPerPerson || adjustedTarget)}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 font-sans pb-16">
      
      {/* Shared Navbar with trip-specific content */}
      <Navbar
        brandOverride={
          <Link to="/" className="flex items-center gap-2.5 text-xl font-black text-[#056449] tracking-tight flex-shrink-0 group">
            <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#056449] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-slate-900 truncate max-w-[200px]">{trip?.name || 'Trip'}</span>
            <span className="text-[10px] bg-emerald-50 text-[#056449] border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden lg:inline">
              {role === 'ADMIN' ? 'Admin' : role === 'MANAGER' ? 'Manager' : 'Viewer'}
            </span>
          </Link>
        }
        rightActions={
          <button
            onClick={() => setActiveTab('settings')}
            className={`transition cursor-pointer ${
              activeTab === 'settings' ? 'text-[#056449]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        }
      >
        {/* Center Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold h-18">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'members', label: 'Members' },
            { id: 'contributions', label: 'Contributions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full border-b-2 px-1 transition relative flex items-center cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#056449] text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Navbar>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12">

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <SummaryTab
            members={members}
            expenses={expenses}
            pooledByUser={pooledByUser}
            adjustedTarget={adjustedTarget}
            canManageData={canManageData}
            role={role}
            trip={trip}
            redistributeExtra={redistributeExtra}
            handleToggleAdjustExtra={handleToggleAdjustExtra}
            handleFixAdjustedTarget={handleFixAdjustedTarget}
            setShowContributionModal={setShowContributionModal}
            setContributionForm={setContributionForm}
            setShowExpenseModal={setShowExpenseModal}
            setExpenseForm={setExpenseForm}
            totalTripTarget={totalTripTarget}
            totalPending={totalPending}
            totalPooled={totalPooled}
            availableBalance={availableBalance}
            totalExpenses={totalExpenses}
            user={user}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            canManageData={canManageData}
            members={members}
            totalExpenses={totalExpenses}
            totalPooled={totalPooled}
            user={user}
            setExpenseForm={setExpenseForm}
            setShowExpenseModal={setShowExpenseModal}
            handleExpenseDelete={handleExpenseDelete}
            trip={trip}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            members={members}
            isAdmin={isAdmin}
            totalPooled={totalPooled}
            totalPending={totalPending}
            adjustedTarget={adjustedTarget}
            pooledByUser={pooledByUser}
            setEditMemberForm={setEditMemberForm}
            setShowEditMemberModal={setShowEditMemberModal}
            setShowMemberModal={setShowMemberModal}
            fetchMemberPassword={fetchMemberPassword}
            handleMemberRemove={handleMemberRemove}
          />
        )}

        {activeTab === 'contributions' && (
          <ContributionsTab
            contributions={contributions}
            members={members}
            trip={trip}
            fetchData={fetchData}
            canManageData={canManageData}
            totalPooled={totalPooled}
            totalPending={totalPending}
            totalTripTarget={totalTripTarget}
            setShowContributionModal={setShowContributionModal}
            setContributionForm={setContributionForm}
            user={user}
            redistributeExtra={redistributeExtra}
            handleToggleAdjustExtra={handleToggleAdjustExtra}
            handleFixAdjustedTarget={handleFixAdjustedTarget}
            role={role}
            pooledByUser={pooledByUser}
            adjustedTarget={adjustedTarget}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            tripId={tripId}
            trip={trip}
            setTrip={setTrip}
            members={members}
            fetchData={fetchData}
            setActiveTab={setActiveTab}
          />
        )}

      </div>

      {/* MODALS */}

      {/* Temporary Password Alert Modal */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{tempPasswordTitle}</h3>
            <p className="text-xs text-slate-500 mb-6">
              {tempPasswordTitle.startsWith('Password') 
                ? 'Please share this temporary password with the user.' 
                : 'A new account has been created for this user. Copy the password below to share with them:'}
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 font-mono text-center text-lg font-bold text-[#056449] tracking-wider select-all mb-6">
              {tempPassword}
            </div>
            <button
              onClick={() => setTempPassword('')}
              className="w-full py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Add Member</h3>
            <p className="text-slate-400 text-xs mb-6">Invite someone to join this trip dashboard</p>
            
            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="name@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="User's name"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                  required
                >
                  <option value="CONTRIBUTOR">Viewer (Contributor)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Custom Tag / Description</label>
                <input
                  type="text"
                  value={memberForm.customTag}
                  onChange={(e) => setMemberForm({ ...memberForm, customTag: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="e.g. Organizer, Driver, Chef"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Edit Member</h3>
            <p className="text-slate-400 text-xs mb-6">Modify details for this trip member</p>
            
            <form onSubmit={handleEditMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Role</label>
                <select
                  value={editMemberForm.role}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                  required
                >
                  <option value="CONTRIBUTOR">Viewer (Contributor)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Custom Tag / Description</label>
                <input
                  type="text"
                  value={editMemberForm.customTag}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, customTag: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="e.g. Organizer, Driver, Chef"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEditMemberModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-255 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 my-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{contributionForm.id ? 'Edit Record' : 'Add Record'}</h3>
            <p className="text-slate-400 text-xs mb-6">Select member and enter details to record deposit</p>
            
            <form onSubmit={handleContributionSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Member</label>
                <select
                  value={contributionForm.userId}
                  onChange={(e) => setContributionForm({ ...contributionForm, userId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                  required
                  disabled={!!contributionForm.id}
                >
                  <option value="">Select a member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.userId}>{m.userName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={contributionForm.amount}
                  onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="5000"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={contributionForm.note}
                  onChange={(e) => setContributionForm({ ...contributionForm, note: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                  placeholder="Payment reference / Note"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Method</label>
                  <select
                    value={contributionForm.method}
                    onChange={(e) => setContributionForm({ ...contributionForm, method: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                    required
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={contributionForm.status}
                    onChange={(e) => setContributionForm({ ...contributionForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                    required
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowContributionModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-255 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-lg shadow-2xl my-8 text-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{expenseForm.id ? 'Edit Expense' : 'Add Expense'}</h3>
            <p className="text-slate-400 text-xs mb-6">Select a category and fill out details to log the expense</p>
            
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="e.g., Airbnb, Flight ticket"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                    required
                  >
                    <option value="TRAVEL">Travel</option>
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="FOOD_AND_BEVERAGES">Food & Beverages</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields: TRAVEL */}
              {expenseForm.category === 'TRAVEL' && (
                <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">From</label>
                      <input
                        type="text"
                        value={expenseForm.travelFrom}
                        onChange={(e) => setExpenseForm({ ...expenseForm, travelFrom: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="Departure City"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">To</label>
                      <input
                        type="text"
                        value={expenseForm.travelTo}
                        onChange={(e) => setExpenseForm({ ...expenseForm, travelTo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="Destination City"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Departure Date & Time</label>
                      <input
                        type="datetime-local"
                        value={expenseForm.travelStartDate}
                        onChange={(e) => setExpenseForm({ ...expenseForm, travelStartDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Arrival Date & Time</label>
                      <input
                        type="datetime-local"
                        value={expenseForm.travelEndDate}
                        onChange={(e) => setExpenseForm({ ...expenseForm, travelEndDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields: ACCOMMODATION */}
              {expenseForm.category === 'ACCOMMODATION' && (
                <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place</label>
                      <input
                        type="text"
                        value={expenseForm.place}
                        onChange={(e) => setExpenseForm({ ...expenseForm, place: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="Hotel Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Rooms</label>
                      <input
                        type="number"
                        value={expenseForm.roomsCount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, roomsCount: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="No. of rooms"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Guests</label>
                      <input
                        type="number"
                        value={expenseForm.peopleCount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, peopleCount: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="No. of people"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Check-in Date & Time</label>
                      <input
                        type="datetime-local"
                        value={expenseForm.checkInDate}
                        onChange={(e) => setExpenseForm({ ...expenseForm, checkInDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Check-out Date & Time</label>
                      <input
                        type="datetime-local"
                        value={expenseForm.checkOutDate}
                        onChange={(e) => setExpenseForm({ ...expenseForm, checkOutDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields: FOOD_AND_BEVERAGES */}
              {expenseForm.category === 'FOOD_AND_BEVERAGES' && (
                <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place</label>
                      <input
                        type="text"
                        value={expenseForm.place}
                        onChange={(e) => setExpenseForm({ ...expenseForm, place: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                        placeholder="Restaurant, Cafe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Type</label>
                      <select
                        value={expenseForm.foodType}
                        onChange={(e) => setExpenseForm({ ...expenseForm, foodType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-xs font-semibold"
                        required
                      >
                        <option value="BREAKFAST">Breakfast</option>
                        <option value="LUNCH">Lunch</option>
                        <option value="DINNER">Dinner</option>
                        <option value="FASTFOOD">Fast Food</option>
                        <option value="SNACKS">Snacks</option>
                        <option value="WATERBOTTLES">Water Bottles</option>
                        <option value="DRINKS">Drinks</option>
                        <option value="OTHERS">Others</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Place input for OTHERS and TRAVEL categories */}
              {(expenseForm.category === 'OTHERS' || expenseForm.category === 'TRAVEL') && (
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Place / Location</label>
                  <input
                    type="text"
                    value={expenseForm.place}
                    onChange={(e) => setExpenseForm({ ...expenseForm, place: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="e.g. airport, shop"
                  />
                </div>
              )}

              {/* Note Field (Optional / Free note space) */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Note {expenseForm.category === 'OTHERS' ? '(Required details)' : '(Optional)'}
                </label>
                <textarea
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition h-20 resize-none text-xs font-medium"
                  placeholder="Log extra details here..."
                  required={expenseForm.category === 'OTHERS'}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-255 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TripDashboard;
