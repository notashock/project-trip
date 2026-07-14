import React, { useState, useEffect, useRef } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CustomDateTimePicker = ({ value, onChange, placeholder = "Select Date & Time" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date'); // 'date' or 'time'
  const [clockMode, setClockMode] = useState('hour'); // 'hour' or 'minute'
  const containerRef = useRef(null);

  // Initialize view state based on current value
  const parseValue = (val) => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [currentDate, setCurrentDate] = useState(() => parseValue(value));
  const [viewYear, setViewYear] = useState(() => currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => currentDate.getMonth());

  useEffect(() => {
    if (value) {
      const parsed = parseValue(value);
      setCurrentDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(viewYear);
    newDate.setMonth(viewMonth);
    newDate.setDate(day);
    setCurrentDate(newDate);
    triggerChange(newDate);
  };

  const handleClockSelect = (val) => {
    const newDate = new Date(currentDate);
    if (clockMode === 'hour') {
      let hours = val;
      const isPM = currentDate.getHours() >= 12;
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      newDate.setHours(hours);
      setCurrentDate(newDate);
      triggerChange(newDate);
      // Auto switch to minute selection for better Android feel
      setClockMode('minute');
    } else {
      newDate.setMinutes(val);
      setCurrentDate(newDate);
      triggerChange(newDate);
    }
  };

  const handleAmPmToggle = (val) => {
    const newDate = new Date(currentDate);
    let hours = currentDate.getHours();
    if (val === 'PM' && hours < 12) hours += 12;
    if (val === 'AM' && hours >= 12) hours -= 12;
    newDate.setHours(hours);
    setCurrentDate(newDate);
    triggerChange(newDate);
  };

  const triggerChange = (dateObj) => {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const MM = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    const hh = pad(dateObj.getHours());
    const mm = pad(dateObj.getMinutes());
    onChange(`${yyyy}-${MM}-${dd}T${hh}:${mm}`);
  };

  const formatDisplay = (val) => {
    if (!val) return placeholder;
    const d = new Date(val);
    if (isNaN(d.getTime())) return placeholder;

    const pad = (n) => String(n).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()].substring(0, 3);
    const date = d.getDate();
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = pad(d.getMinutes());

    return `${month} ${date}, ${year} - ${hours}:${minutes} ${ampm}`;
  };

  // Prepare calendar elements
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);
  const dayCells = [];

  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = currentDate.getDate() === d &&
      currentDate.getMonth() === viewMonth &&
      currentDate.getFullYear() === viewYear;
    dayCells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleDateSelect(d)}
        className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
          isSelected
            ? 'bg-[#056449] text-white shadow-sm font-bold'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        {d}
      </button>
    );
  }

  const rawHours = currentDate.getHours();
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const displayHour = rawHours % 12 || 12;
  const displayMinute = currentDate.getMinutes();

  // Android Clock face math & variables
  const radius = 38; // Radius percent from center
  const getCoordinates = (value, totalUnits) => {
    const step = 360 / totalUnits;
    const angle = (value * step - 90) * Math.PI / 180;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  // Calculate Clock Hand targets
  const handCoords = clockMode === 'hour'
    ? getCoordinates(displayHour, 12)
    : getCoordinates(displayMinute, 60);

  // Generate numbers for Clock Face
  const renderClockNumbers = () => {
    if (clockMode === 'hour') {
      return Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
        const coords = getCoordinates(h, 12);
        const isSelected = displayHour === h;
        return (
          <button
            key={`hour-num-${h}`}
            type="button"
            onClick={() => handleClockSelect(h)}
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition z-10 cursor-pointer ${
              isSelected ? 'text-white' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            {h}
          </button>
        );
      });
    } else {
      // Show minutes by steps of 5
      return Array.from({ length: 12 }, (_, i) => i * 5).map(m => {
        const coords = getCoordinates(m, 60);
        const isSelected = Math.floor(displayMinute / 5) * 5 === m;
        return (
          <button
            key={`minute-num-${m}`}
            type="button"
            onClick={() => handleClockSelect(m)}
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition z-10 cursor-pointer ${
              isSelected ? 'text-white' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            {String(m).padStart(2, '0')}
          </button>
        );
      });
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-left focus:outline-none focus:border-[#056449] focus:bg-white transition text-xs font-semibold flex justify-between items-center cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDisplay(value)}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#056449]' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="relative z-50 w-full mt-2 bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-4">
          
          {/* Tab Selector */}
          <div className="flex bg-slate-200/40 p-0.5 rounded-xl border border-slate-200/20">
            <button
              type="button"
              onClick={() => setActiveTab('date')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition cursor-pointer ${
                activeTab === 'date' ? 'bg-[#056449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Date
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('time');
                setClockMode('hour'); // Default back to hours when clicking time tab
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition cursor-pointer ${
                activeTab === 'time' ? 'bg-[#056449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Time
            </button>
          </div>

          {activeTab === 'date' ? (
            <>
              {/* Calendar Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-600 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs font-bold text-slate-800">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-600 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 justify-items-center">
                {dayCells}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              {/* Time Display Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-2 font-bold text-lg text-slate-800">
                  <button
                    type="button"
                    onClick={() => setClockMode('hour')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      clockMode === 'hour' ? 'text-[#056449] bg-emerald-50/60' : 'text-slate-400'
                    }`}
                  >
                    {String(displayHour).padStart(2, '0')}
                  </button>
                  <span className="px-1 text-slate-400">:</span>
                  <button
                    type="button"
                    onClick={() => setClockMode('minute')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      clockMode === 'minute' ? 'text-[#056449] bg-emerald-50/60' : 'text-slate-400'
                    }`}
                  >
                    {String(displayMinute).padStart(2, '0')}
                  </button>
                </div>

                {/* AM/PM toggle */}
                <div className="flex flex-col bg-slate-200/60 p-0.5 rounded-xl border border-slate-200/20">
                  {['AM', 'PM'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAmPmToggle(val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        ampm === val ? 'bg-[#056449] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Android Circular Clock Face */}
              <div className="relative w-44 h-44 rounded-full bg-slate-100/80 border border-slate-200/50 shadow-inner flex items-center justify-center select-none">
                
                {/* SVG Pointer Hand */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${handCoords.x}%`}
                    y2={`${handCoords.y}%`}
                    stroke="#056449"
                    strokeWidth="2.5"
                  />
                  <circle cx="50%" cy="50%" r="4.5" fill="#056449" />
                  <circle cx={`${handCoords.x}%`} cy={`${handCoords.y}%`} r="14" fill="#056449" className="opacity-80" />
                </svg>

                {/* Render the clock face numbers */}
                {renderClockNumbers()}
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Select {clockMode === 'hour' ? 'Hour' : 'Minute'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
