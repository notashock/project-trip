import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { SummaryTab } from '../components/SummaryTab';
import { ExpensesTab } from '../components/ExpensesTab';
import { MembersTab } from '../components/MembersTab';
import { SettingsTab } from '../components/SettingsTab';
import { ContributionsTab } from '../components/ContributionsTab';
import Navbar from '../components/Navbar';
import { CustomSelect } from '../components/CustomSelect';
import { ContributionModal } from '../components/ContributionModal';
import { ExpenseModal } from '../components/ExpenseModal';
import { ExpenseDetailModal } from '../components/ExpenseDetailModal';
import { ContributionDetailModal } from '../components/ContributionDetailModal';
import { MemberDetailModal } from '../components/MemberDetailModal';
import { Footer } from '../components/Footer';

const TripDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    checkOutDate: '',
    memberId: '',
    addAsContribution: false
  });
  const [contributionForm, setContributionForm] = useState({ id: null, userId: '', amount: '', note: '', method: 'UPI', status: 'Verified' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'CONTRIBUTOR', customTag: '', name: '' });
  const [editMemberForm, setEditMemberForm] = useState({ id: null, role: 'CONTRIBUTOR', customTag: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [tempPasswordTitle, setTempPasswordTitle] = useState('Account Created Successfully!');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showContributionDetailModal, setShowContributionDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);

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
        checkOutDate: expenseForm.category === 'ACCOMMODATION' && expenseForm.checkOutDate ? expenseForm.checkOutDate : null,
        memberId: expenseForm.memberId ? parseInt(expenseForm.memberId) : null,
        addAsContribution: !!expenseForm.addAsContribution
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
    if (!contributionForm.userId) {
      alert('Please select a member');
      return;
    }
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
    if (isSaving) return;
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAddMember = async ({ email, name }) => {
    try {
      const added = await tripService.inviteMember(tripId, {
        email,
        name,
        role: 'CONTRIBUTOR',
        customTag: 'Added via Quick Add'
      });
      setMembers(prev => [...prev, added]);
      fetchData();

      if (added.temporaryPassword) {
        setTempPasswordTitle('Account Created Successfully!');
        setTempPassword(added.temporaryPassword);
      }
      return added.userId;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const currentMember = members.find(m => m.id === editMemberForm.id);
      if (currentMember && currentMember.role === 'ADMIN' && editMemberForm.role !== 'ADMIN') {
        const adminCount = members.filter(m => m.role === 'ADMIN').length;
        if (adminCount <= 1) {
          alert('Cannot change role: A trip must have at least one Admin.');
          setIsSaving(false);
          return;
        }
      }
      await tripService.updateMember(tripId, editMemberForm.id, {
        role: editMemberForm.role,
        customTag: editMemberForm.customTag
      });
      setShowEditMemberModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberRemove = async (memberId) => {
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember && targetMember.role === 'ADMIN') {
      const adminCount = members.filter(m => m.role === 'ADMIN').length;
      if (adminCount <= 1) {
        alert('Cannot remove member: A trip must have at least one Admin.');
        return;
      }
    }
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
          <div className="flex items-center gap-2.5 flex-shrink-0 group">
            <Link to="/" className="text-slate-400 hover:text-[#056449] transition flex-shrink-0">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                {trip?.name || 'Trip'}
              </span>
              <span className="text-[9px] text-[#056449] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                {role === 'ADMIN' ? 'Admin' : role === 'MANAGER' ? 'Manager' : 'Viewer'}
              </span>
            </div>
          </div>
        }
        rightActions={
          <div className="flex items-center gap-3">
            {/* Desktop Navbar Search Bar */}
            <div className="relative max-w-xs hidden sm:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search trip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-[#056449] focus:bg-white focus:outline-none rounded-full pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-805 placeholder-slate-400 transition-all duration-200 w-32 md:w-44 lg:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-450 hover:text-slate-650 focus:outline-none text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

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
          </div>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12 pb-24 md:pb-12">

        {/* Mobile Search Bar */}
        {activeTab !== 'settings' && (
          <div className="relative w-full mb-6 sm:hidden">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search trip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-205 focus:border-[#056449] focus:outline-none rounded-full pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-805 placeholder-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3.5 flex items-center text-slate-450 hover:text-slate-650 focus:outline-none text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}

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
            searchQuery={searchQuery}
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
            onExpenseClick={(e) => {
              setSelectedExpense(e);
              setShowExpenseDetailModal(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
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
            onMemberClick={(m) => {
              setSelectedMember(m);
              setShowMemberDetailModal(true);
            }}
            searchQuery={searchQuery}
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
            onContributionClick={(c) => {
              setSelectedContribution(c);
              setShowContributionDetailModal(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
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
            role={role}
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Add Member</h3>
            <p className="text-slate-400 text-xs mb-6">Invite someone to join this trip dashboard</p>
            
            <form onSubmit={handleMemberSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
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
                  <CustomSelect
                    value={memberForm.role}
                    onChange={(val) => setMemberForm({ ...memberForm, role: val })}
                    options={[
                      { value: 'CONTRIBUTOR', label: 'Viewer (Contributor)' },
                      { value: 'MANAGER', label: 'Manager' },
                      { value: 'ADMIN', label: 'Admin' }
                    ]}
                  />
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
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl text-slate-700 flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Edit Member</h3>
            <p className="text-slate-400 text-xs mb-6">Modify details for this trip member</p>
            
            <form onSubmit={handleEditMemberSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Role</label>
                  <CustomSelect
                    value={editMemberForm.role}
                    onChange={(val) => setEditMemberForm({ ...editMemberForm, role: val })}
                    options={[
                      { value: 'CONTRIBUTOR', label: 'Viewer (Contributor)' },
                      { value: 'MANAGER', label: 'Manager' },
                      { value: 'ADMIN', label: 'Admin' }
                    ]}
                  />
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
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
                <button type="button" onClick={() => setShowEditMemberModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-255 text-slate-600 rounded-xl transition text-sm font-semibold cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-semibold rounded-xl transition text-sm cursor-pointer shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSubmit={handleContributionSubmit}
        formData={contributionForm}
        setFormData={setContributionForm}
        members={members}
        onQuickAddMember={handleQuickAddMember}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
        formData={expenseForm}
        setFormData={setExpenseForm}
        members={members}
        onQuickAddMember={handleQuickAddMember}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={showExpenseDetailModal}
        onClose={() => setShowExpenseDetailModal(false)}
        expense={selectedExpense}
        members={members}
      />

      {/* Contribution Detail Modal */}
      <ContributionDetailModal
        isOpen={showContributionDetailModal}
        onClose={() => setShowContributionDetailModal(false)}
        contribution={selectedContribution}
        members={members}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={showMemberDetailModal}
        onClose={() => setShowMemberDetailModal(false)}
        member={selectedMember}
        pooledByUser={pooledByUser}
        adjustedTarget={adjustedTarget}
      />

      {/* Footer component */}
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default TripDashboard;
