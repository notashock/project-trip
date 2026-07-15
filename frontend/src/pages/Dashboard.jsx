import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import Navbar from '../components/Navbar';

const getDestinationImage = (destination) => {
  const dest = (destination || '').toLowerCase();
  if (dest.includes('goa')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60';
  }
  if (dest.includes('japan') || dest.includes('tokyo') || dest.includes('kyoto') || dest.includes('winter') || dest.includes('snow')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=60';
  }
  if (dest.includes('europe') || dest.includes('paris') || dest.includes('london') || dest.includes('italy') || dest.includes('rome') || dest.includes('backpack')) {
    return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=60';
};

const getCurrencySymbol = (destination) => {
  const dest = (destination || '').toLowerCase();
  if (dest.includes('europe') || dest.includes('paris') || dest.includes('london') || dest.includes('italy') || dest.includes('rome')) {
    return '€';
  }
  if (dest.includes('japan') || dest.includes('usa') || dest.includes('escape') || dest.includes('winter')) {
    return '$';
  }
  return '₹';
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('My Trips');

  // Create Trip Modal states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetPerPerson, setTargetPerPerson] = useState('');

  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.fetchTripDetails(''); // returns list of users trips
      setTrips(data);
    } catch (err) {
      setError('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        destination: destination || 'Goa, India',
        startDate: startDate ? startDate + 'T00:00:00' : null,
        endDate: endDate ? endDate + 'T00:00:00' : null,
        targetPerPerson: parseFloat(targetPerPerson || '8000'),
        targetBudget: parseFloat(targetPerPerson || '8000')
      };

      const newTrip = await tripService.createTrip(payload);
      setTrips([...trips, newTrip]);
      
      // Clear inputs
      setName('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setTargetPerPerson('');
      setShowModal(false);
      fetchTrips();
    } catch (err) {
      alert('Error creating trip: ' + err.message);
    }
  };

  // Filter logic:
  // "My Trips" shows Active and Upcoming.
  // "Archive" shows Completed.
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isCompleted = trip.status === 'Completed';
    if (activeSubTab === 'My Trips') {
      return !isCompleted;
    } else {
      return isCompleted;
    }
  }).sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 font-sans pb-16">
      
      {/* Shared Navbar with page-specific tabs and actions */}
      <Navbar
        brandOverride={
          <span
            className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <svg className="w-5 h-5 text-[#056449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>My Trips</span>
          </span>
        }
        rightActions={
          /* Search Pill */
          <div className="relative max-w-64 hidden sm:block">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#056449] focus:bg-white focus:outline-none rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all duration-200"
            />
          </div>
        }
      >
        {/* Center: Sub-tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold h-18">
          <button
            onClick={() => setActiveSubTab('My Trips')}
            className={`h-full border-b-2 px-1 transition relative flex items-center cursor-pointer ${
              activeSubTab === 'My Trips' ? 'border-[#056449] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveSubTab('Archive')}
            className={`h-full border-b-2 px-1 transition relative flex items-center cursor-pointer ${
              activeSubTab === 'Archive' ? 'border-[#056449] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Archive
          </button>
        </nav>
      </Navbar>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12">

        {/* Mobile Search Bar */}
        <div className="relative w-full mb-6 sm:hidden">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#056449] focus:outline-none rounded-full pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <div className="w-8 h-8 border-2 border-[#056449] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading adventures...</span>
          </div>
        ) : error ? (
          <div className="text-center text-rose-500 py-12 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* CARD 1: Create New Trip (Dashed Placeholder) */}
            <div
              onClick={() => setShowModal(true)}
              className="bg-transparent border-2 border-dashed border-slate-200 hover:border-[#056449]/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] sm:min-h-[360px] group transition-all duration-200"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-[#056449] flex items-center justify-center border border-emerald-100/50 mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-250">
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1 sm:mb-1.5">Create New Trip</h3>
              <p className="text-[11px] sm:text-xs text-slate-455 font-semibold max-w-[210px] leading-relaxed">
                Start planning your next group adventure and split costs easily.
              </p>
            </div>

            {/* Dynamic Trip Cards */}
            {filteredTrips.map((trip) => {
              const formattedDate = trip.startDate && trip.endDate
                ? `${new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}–${new Date(trip.endDate).toLocaleDateString(undefined, { day: 'numeric' })}`
                : 'Dates unset';

              const symbol = getCurrencySymbol(trip.destination);
              const budgetAmount = trip.targetBudget || (trip.targetPerPerson * (trip.memberCount ?? 1));
              const displayBudget = trip.status === 'Completed' ? (trip.totalSpent || 0) : budgetAmount;

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] hover:border-[#056449]/15 cursor-pointer group transition-all duration-255 flex flex-col min-h-[280px] sm:min-h-[360px]"
                >
                  {/* Card Banner Image */}
                  <div className="h-32 sm:h-44 relative overflow-hidden bg-slate-100">
                    <img
                      src={getDestinationImage(trip.destination)}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      {trip.status === 'Active' && (
                        <span className="text-[9px] sm:text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm flex items-center gap-1">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                          Active
                        </span>
                      )}
                      {trip.status === 'Upcoming' && (
                        <span className="text-[9px] sm:text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
                          Upcoming
                        </span>
                      )}
                      {trip.status === 'Completed' && (
                        <span className="text-[9px] sm:text-[10px] bg-slate-600 text-white font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-base mb-3 group-hover:text-[#056449] transition-colors">
                        {trip.name}
                      </h3>
                      
                      {/* Trip Meta details */}
                      <div className="space-y-2 text-xs text-slate-455 font-semibold">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{trip.memberCount ?? 1} {(trip.memberCount ?? 1) === 1 ? 'Member' : 'Members'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Budget & Avatars */}
                    <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                          {trip.status === 'Completed' ? 'Total Spent' : 'Total Budget'}
                        </span>
                        <span className="text-base font-black text-slate-900">
                          {symbol}{displayBudget.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Avatar stack overlapping */}
                      <div className="flex items-center -space-x-1.5">
                        {trip.memberInitials?.map((init, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase"
                          >
                            {init}
                          </div>
                        ))}
                        {trip.memberCount > 3 && (
                          <div className="w-6 h-6 rounded-full bg-[#056449]/5 border-2 border-white flex items-center justify-center text-[8px] font-bold text-[#056449] uppercase">
                            +{trip.memberCount - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-black text-slate-900 mb-1 flex-shrink-0">Create Trip</h3>
            <p className="text-xs text-slate-455 font-semibold mb-6 flex-shrink-0">Start a new group pool budget for your next adventure</p>
            
            <form onSubmit={handleCreateTrip} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Trip Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="E.g., Goa Summer Trip 2026"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="E.g., Goa, India"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Target Per Person Budget (₹)</label>
                  <input
                    type="number"
                    value={targetPerPerson}
                    onChange={(e) => setTargetPerPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#056449] transition text-sm font-semibold"
                    placeholder="E.g., 9000"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#056449] hover:bg-[#04523b] text-white font-extrabold rounded-xl transition text-xs cursor-pointer"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
