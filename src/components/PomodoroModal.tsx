import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, SkipForward, Timer, Clock, Zap } from 'lucide-react';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoSessionCount, setPomoSessionCount] = useState(0);

  // Countdown State
  const [cdInputMin, setCdInputMin] = useState('5');
  const [cdInputSec, setCdInputSec] = useState('0');
  const [cdTimeLeft, setCdTimeLeft] = useState(5 * 60);
  const [cdIsActive, setCdIsActive] = useState(false);
  const [cdDone, setCdDone] = useState(false);

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swIsActive, setSwIsActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Refs for intervals
  const pomoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pomodoro Effect
  useEffect(() => {
    if (pomoIsActive && pomoTimeLeft > 0) {
      pomoIntervalRef.current = setInterval(() => {
        setPomoTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (pomoIsActive && pomoTimeLeft === 0) {
      handlePomoSkip();
    }
    return () => {
      if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    };
  }, [pomoIsActive, pomoTimeLeft]);

  // Countdown Effect
  useEffect(() => {
    if (cdIsActive && cdTimeLeft > 0) {
      cdIntervalRef.current = setInterval(() => {
        setCdTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (cdIsActive && cdTimeLeft === 0) {
      setCdIsActive(false);
      setCdDone(true);
    }
    return () => {
      if (cdIntervalRef.current) clearInterval(cdIntervalRef.current);
    };
  }, [cdIsActive, cdTimeLeft]);

  // Stopwatch Effect
  useEffect(() => {
    if (swIsActive) {
      swIntervalRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swIsActive]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSwTime = (ms: number) => {
    const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
    const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const millis = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${mins}:${secs}.${millis}`;
  };

  // Pomodoro Handlers
  const togglePomo = () => setPomoIsActive(!pomoIsActive);
  const resetPomo = () => {
    setPomoIsActive(false);
    setPomoMode('work');
    setPomoTimeLeft(25 * 60);
    setPomoSessionCount(0);
  };
  const handlePomoSkip = () => {
    if (pomoMode === 'work') {
      setPomoSessionCount(prev => prev + 1);
      setPomoMode('break');
      setPomoTimeLeft(5 * 60);
    } else {
      setPomoMode('work');
      setPomoTimeLeft(25 * 60);
    }
    setPomoIsActive(false);
  };

  const pomoTotal = pomoMode === 'work' ? 25 * 60 : 5 * 60;
  const pomoProgress = 1 - pomoTimeLeft / pomoTotal;
  const pomoRadius = 110;
  const pomoCircumference = 2 * Math.PI * pomoRadius;
  const pomoStrokeDashoffset = pomoCircumference - pomoProgress * pomoCircumference;
  const pomoColor = pomoMode === 'work' ? 'text-indigo-500' : 'text-emerald-500';

  // Countdown Handlers
  const handleCdSet = () => {
    const m = parseInt(cdInputMin) || 0;
    const s = parseInt(cdInputSec) || 0;
    setCdTimeLeft(m * 60 + s);
    setCdIsActive(false);
    setCdDone(false);
  };
  const toggleCd = () => setCdIsActive(!cdIsActive);
  const resetCd = () => {
    setCdIsActive(false);
    setCdDone(false);
    handleCdSet();
  };

  // Stopwatch Handlers
  const toggleSw = () => setSwIsActive(!swIsActive);
  const resetSw = () => {
    setSwIsActive(false);
    setSwTime(0);
    setLaps([]);
  };
  const addLap = () => {
    setLaps(prev => [...prev, swTime]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Focus Tools</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {[
            { id: 'pomodoro', icon: Zap, label: 'Pomodoro' },
            { id: 'countdown', icon: Timer, label: 'Countdown' },
            { id: 'stopwatch', icon: Clock, label: 'Stopwatch' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          
          {/* Pomodoro Tab */}
          {activeTab === 'pomodoro' && (
            <div className="w-full flex flex-col items-center h-full justify-between pb-4">
              <div className="text-center mt-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider ${
                  pomoMode === 'work' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {pomoMode === 'work' ? 'Work Session' : 'Break Time'}
                </span>
                <p className="text-gray-400 text-sm mt-2">Completed Sessions: {pomoSessionCount}</p>
              </div>

              <div className="relative flex items-center justify-center my-8">
                <svg width="260" height="260" className="transform -rotate-90">
                  <circle cx="130" cy="130" r={pomoRadius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="130" cy="130" r={pomoRadius} 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-linear ${pomoColor}`}
                    strokeDasharray={pomoCircumference}
                    strokeDashoffset={pomoStrokeDashoffset}
                  />
                </svg>
                <div className="absolute text-5xl font-bold text-gray-800 font-mono tracking-tighter">
                  {formatTime(pomoTimeLeft)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full justify-center">
                <button onClick={resetPomo} className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Reset">
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button 
                  onClick={togglePomo} 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${
                    pomoMode === 'work' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {pomoIsActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button onClick={handlePomoSkip} className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Skip">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Countdown Tab */}
          {activeTab === 'countdown' && (
            <div className="w-full flex flex-col items-center h-full justify-start pt-4">
              {!cdIsActive && cdTimeLeft === parseInt(cdInputMin || '0') * 60 + parseInt(cdInputSec || '0') && !cdDone ? (
                <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-[200px]">
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1 font-semibold uppercase">Min</label>
                      <input 
                        type="number" min="0" max="99" 
                        value={cdInputMin} 
                        onChange={e => setCdInputMin(e.target.value)}
                        onBlur={handleCdSet}
                        className="w-20 text-center text-3xl font-bold p-2 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0"
                      />
                    </div>
                    <span className="text-4xl text-gray-300 font-light mt-4">:</span>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1 font-semibold uppercase">Sec</label>
                      <input 
                        type="number" min="0" max="59" 
                        value={cdInputSec} 
                        onChange={e => setCdInputSec(e.target.value)}
                        onBlur={handleCdSet}
                        className="w-20 text-center text-3xl font-bold p-2 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-12">
                  <div className={`text-7xl font-bold font-mono tracking-tighter ${cdDone ? 'text-amber-500' : 'text-gray-800'}`}>
                    {formatTime(cdTimeLeft)}
                  </div>
                  {cdDone && <p className="text-amber-600 font-medium text-center mt-4">Time is up!</p>}
                </div>
              )}

              <div className="flex items-center gap-4 mt-auto mb-4">
                <button onClick={resetCd} className="p-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button 
                  onClick={toggleCd} 
                  disabled={cdDone && cdTimeLeft === 0}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-amber-500 hover:bg-amber-600 shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {cdIsActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
              </div>
            </div>
          )}

          {/* Stopwatch Tab */}
          {activeTab === 'stopwatch' && (
            <div className="w-full flex flex-col h-full">
              <div className="text-center my-8">
                <div className="text-6xl font-bold text-gray-800 font-mono tracking-tighter">
                  {formatSwTime(swTime)}
                </div>
              </div>

              <div className="flex justify-center items-center gap-4 mb-8">
                <button onClick={resetSw} className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  Reset
                </button>
                <button 
                  onClick={toggleSw} 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-violet-600 hover:bg-violet-700 shadow-lg transition-transform hover:scale-105"
                >
                  {swIsActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button onClick={addLap} disabled={!swIsActive} className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Lap
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full border-t border-gray-100 pt-4 px-2">
                {laps.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm mt-4">No laps recorded</p>
                ) : (
                  <div className="space-y-2">
                    {[...laps].reverse().map((lapTime, i) => (
                      <div key={i} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium text-gray-500">Lap {laps.length - i}</span>
                        <span className="font-mono font-bold text-gray-700">{formatSwTime(lapTime)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export { PomodoroModal };
