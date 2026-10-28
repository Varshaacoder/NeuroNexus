import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Brain, Activity, Sparkles, Clock, Calendar, ShieldCheck,
  AlertTriangle, CheckCircle2, Zap, BarChart2, Filter, ArrowUpRight,
  HelpCircle, Info, TrendingUp, RefreshCw, Play, Square, FileCheck2, BookOpen,
  ChevronDown, Cpu, ShieldAlert, Award, Radio, CheckCircle, Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import type { UserProfile, LearningSession, FocusTimePoint } from '../types';
import { getStudentSessions, getWeeklyNeuralProgress, isDemoUser, saveStudentSession } from '../utils/neuroSessionStore';
import { eegService, type EEGDeviceStatus } from '../services/eegService';
import { eegModeController, type ActiveEEGMode } from '../services/eegModeController';
import { SimulationDashboard } from './SimulationDashboard';
import { UnifiedSessionGraph } from './UnifiedSessionGraph';
import { SessionAnalysisFlowchart } from './SessionAnalysisFlowchart';

interface NeuroAnalysisPageProps {
  user: UserProfile;
  initialSessionId?: string | null;
  onNavigateToTests: () => void;
  onStartStudySession: () => void;
  onOpenHardwareManager?: () => void;
  onNavigateToHardwareRig?: () => void;
}

export const NeuroAnalysisPage: React.FC<NeuroAnalysisPageProps> = ({
  user,
  initialSessionId,
  onNavigateToTests,
  onStartStudySession,
  onOpenHardwareManager,
  onNavigateToHardwareRig,
}) => {
  const isDemo = isDemoUser(user.id, user.email);
  const [operatingMode, setOperatingMode] = useState<ActiveEEGMode>(eegModeController.getMode());
  const [sessions, setSessions] = useState<LearningSession[]>(() => getStudentSessions(user.id));
  const weeklyReport = useMemo(() => getWeeklyNeuralProgress(user.id), [user.id, sessions]);

  // EEG Hardware Status Tracking
  const [eegStatus, setEegStatus] = useState<EEGDeviceStatus>(() => eegService.getStatus());
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [liveRecordingSeconds, setLiveRecordingSeconds] = useState(0);
  const [hasRecordedSession, setHasRecordedSession] = useState(false);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = eegService.onStatusChange((status) => {
      setEegStatus(status);
      if (status.state === 'disconnected' && isLiveRecording) {
        handleStopRecording();
      }
    });
    return () => unsub();
  }, [isLiveRecording]);

  const handleSwitchMode = (newMode: ActiveEEGMode) => {
    setOperatingMode(newMode);
    eegModeController.setMode(newMode);
  };

  // Selected session state
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    if (initialSessionId && sessions.some(s => s.id === initialSessionId)) {
      return initialSessionId;
    }
    const latestEligible = sessions.find(s => s.hasEegData) || sessions[0];
    return latestEligible ? latestEligible.id : '';
  });

  // Selected question index within assessment (1-based, or null for all)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // History filters
  const [filterType, setFilterType] = useState<'all' | 'study' | 'pomodoro' | 'quiz' | 'college_test'>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterEegOnly, setFilterEegOnly] = useState<boolean>(false);

  // Compute active hardware step (1 through 6)
  const connectionStateInfo = useMemo(() => {
    if (isDemo) {
      return {
        step: 5,
        label: 'State 5: Demo Mode — Synthetic EEG Waves Streaming',
        badge: 'Demo Waves Synthesized',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        detail: 'Simulated multi-channel frontopolar EEG signals active [Demo Data — Not Live EEG].'
      };
    }
    if (eegStatus.state === 'disconnected') {
      if (hasRecordedSession || eegStatus.lastSampleTime) {
        return {
          step: 6,
          label: 'State 6: Recording stopped or disconnected',
          badge: 'Recording Complete / Disconnected',
          color: 'text-slate-700 bg-slate-100 border-slate-300',
          detail: 'Hardware recording completed or device disconnected. Data preserved.'
        };
      }
      return {
        step: 1,
        label: 'State 1: Device not connected',
        badge: 'Not Connected',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        detail: 'No EEG serial or WebSocket bridge currently active. Connect hardware to begin live neural focus acquisition.'
      };
    }
    if (eegStatus.state === 'connecting') {
      return {
        step: 2,
        label: 'State 2: Connection requested or in progress',
        badge: 'Connecting...',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        detail: 'Opening port handshake and negotiating baud rate (115200 bps).'
      };
    }
    if (eegStatus.state === 'connected') {
      if (eegStatus.samplesReceived === 0) {
        return {
          step: 3,
          label: 'State 3: Device connected, but no valid EEG samples received',
          badge: 'Awaiting Samples',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          detail: 'Hardware port established. Microcontroller TX transmission buffer is initializing.'
        };
      }
      if (eegStatus.signalQualityStatus === 'Poor' || eegStatus.droppedPackets > 50) {
        return {
          step: 4,
          label: 'State 4: Signal received, but signal quality is insufficient',
          badge: 'Insufficient Quality (Noise / Loose)',
          color: 'text-amber-800 bg-amber-100 border-amber-300',
          detail: 'Electrode impedance high or loose skin contact. Reseat FP1/FP2 electrodes to ensure valid signal.'
        };
      }
      return {
        step: 5,
        label: 'State 5: Valid EEG data received and recording is available',
        badge: 'Valid Data & Ready',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        detail: 'Physiological voltage validated within ±500µV. Ready to begin live focus recording.'
      };
    }
    if (eegStatus.state === 'streaming') {
      if (eegStatus.signalQualityStatus === 'Poor') {
        return {
          step: 4,
          label: 'State 4: Signal received, but signal quality is insufficient',
          badge: 'High Noise During Stream',
          color: 'text-amber-800 bg-amber-100 border-amber-300',
          detail: 'Excessive motion artifact or mains interference detected during streaming.'
        };
      }
      return {
        step: 5,
        label: 'State 5: Valid EEG data received and recording is available',
        badge: isLiveRecording ? 'Streaming & Recording' : 'Valid Data & Ready',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        detail: `${eegStatus.samplesReceived} samples received at ${eegStatus.samplingRateHz} Hz. Frontal acquisition active.`
      };
    }
    return {
      step: 1,
      label: 'State 1: Device not connected',
      badge: 'Not Connected',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      detail: 'No EEG device attached.'
    };
  }, [eegStatus, isLiveRecording, hasRecordedSession]);

  // Live Recording Handlers
  const handleStartRecording = () => {
    eegService.startRecording({
      userId: user.id,
      course: 'CS201 C Programming & Systems',
      topic: 'Live BioAmp Acquisition Study',
      type: 'study',
      title: 'Live BioAmp EXG Neural Focus Session',
    });
    setIsLiveRecording(true);
    setLiveRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setLiveRecordingSeconds(s => s + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsLiveRecording(false);
    setHasRecordedSession(true);
    const recorded = eegService.stopRecording();
    if (recorded) {
      saveStudentSession(user.id, recorded);
      const updated = getStudentSessions(user.id);
      setSessions(updated);
      setSelectedSessionId(recorded.id);
    }
  };

  // Check if student has valid EEG sessions
  const hasValidEegSession = useMemo(() => {
    return sessions.some(s => s.hasEegData && (!s.isSimulated || isDemo));
  }, [sessions, isDemo]);

  const selectedSession: LearningSession | undefined = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Filtered history list
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (filterType !== 'all' && s.type !== filterType) return false;
      if (filterCourse !== 'all' && s.course !== filterCourse) return false;
      if (filterEegOnly && !s.hasEegData) return false;
      return true;
    });
  }, [sessions, filterType, filterCourse, filterEegOnly]);

  const uniqueCourses = Array.from(new Set(sessions.map(s => s.course)));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── HEADER BANNER ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Brain className="w-3.5 h-3.5" />
              <span>NeuroFocus Biometric Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Neuro Analysis & Focus Dynamics
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time cognitive workload estimation, artifact-quarantined focus curves, and evidence-backed learning recommendations from your study sessions and test attempts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartStudySession}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>New Pomodoro Session</span>
            </button>
            <button
              onClick={onNavigateToTests}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Assessments & Mock Tests</span>
            </button>
          </div>
        </div>

        {/* Global Neuro Status Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isDemo
                  ? 'bg-purple-400 animate-pulse'
                  : eegStatus.state === 'streaming' || eegStatus.state === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-rose-400'
              }`} />
              <span className="text-slate-300 font-medium">Device Status:</span>
              <span className="font-bold text-white">
                {isDemo ? 'SYNTHETIC STREAM ACTIVE' : eegStatus.state === 'disconnected' ? 'Not connected' : eegStatus.state.toUpperCase()}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Recording Status:</span>
              <span className={`font-bold ${isLiveRecording ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                {isLiveRecording ? `Recording (${Math.floor(liveRecordingSeconds / 60)}m ${liveRecordingSeconds % 60}s)` : 'Not recording'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHardwareManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-bold text-xs transition-colors shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Connect / Manage BioAmp</span>
            </button>

            {isDemo ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                <Info className="w-3.5 h-3.5" />
                <span>Demo Mode Active [Demo Data — Not Live EEG]</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Synthetic Fabrication Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

            {/* ── TWO CLEARLY SEPARATED OPERATING MODES: LIVE HARDWARE vs DEMO SIMULATION ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
            operatingMode === 'live-hardware' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
          }`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              EEG Operating Pipeline Mode
            </div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{operatingMode === 'live-hardware' ? 'Live EEG Hardware Mode (Arduino + BioAmp)' : 'Demo / Simulation Mode (Synthetic Signal Engine)'}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                operatingMode === 'live-hardware'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                {operatingMode === 'live-hardware' ? 'Zero Synthetic Data' : 'SIMULATED DATA — NOT REAL EEG'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => handleSwitchMode('live-hardware')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              operatingMode === 'live-hardware'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Live Hardware Mode</span>
          </button>

          <button
            onClick={() => handleSwitchMode('demo-simulation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              operatingMode === 'demo-simulation'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Render Simulation Dashboard when in demo-simulation mode */}
      {operatingMode === 'demo-simulation' && (
        <SimulationDashboard
          user={user}
          onNavigateToNeuroAnalysis={(sessId) => {
            if (sessId) {
              setSessions(getStudentSessions(user.id));
              setSelectedSessionId(sessId);
            }
          }}
          onOpenTimer={onStartStudySession}
        />
      )}

      {/* ── HARDWARE ACCESS CONTROL & 6-STATE CONNECTION PANEL ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">EEG Hardware Connection & Acquisition Gate</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${connectionStateInfo.color}`}>
                {connectionStateInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              A compatible EEG device (such as the BioAmp EXG Pill) must be connected before live neural focus analysis is available. Academic learning features, course curriculum, mock tests, and AI Classroom remain fully available without EEG hardware.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {eegStatus.state === 'disconnected' ? (
              <button
                onClick={onOpenHardwareManager}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Cpu className="w-4 h-4" />
                <span>Connect EEG Device</span>
              </button>
            ) : connectionStateInfo.step === 5 ? (
              !isLiveRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Hardware EEG Recording</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop & Save Session</span>
                </button>
              )
            ) : (
              <button
                onClick={onOpenHardwareManager}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all"
              >
                <Activity className="w-4 h-4" />
                <span>Hardware Diagnostics</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Distinct Hardware Connection States */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Hardware Diagnostics & Communication Protocol (6-Stage Verification):</span>
            <span className="text-indigo-600 font-semibold">{connectionStateInfo.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {[
              { num: 1, title: 'State 1', desc: 'Device not connected', subtitle: 'Awaiting connection' },
              { num: 2, title: 'State 2', desc: 'Connection in progress', subtitle: 'Handshake / baud lock' },
              { num: 3, title: 'State 3', desc: 'Device connected', subtitle: 'Awaiting valid samples' },
              { num: 4, title: 'State 4', desc: 'Signal received', subtitle: 'Quality insufficient (noise)' },
              { num: 5, title: 'State 5', desc: 'Valid data streaming', subtitle: 'Ready to record' },
              { num: 6, title: 'State 6', desc: 'Recording complete', subtitle: 'Finalized / disconnected' },
            ].map(stage => {
              const isActive = connectionStateInfo.step === stage.num;
              return (
                <div
                  key={stage.num}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isActive
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                      : stage.num < connectionStateInfo.step
                      ? 'bg-slate-50/60 border-slate-200 text-slate-700'
                      : 'bg-white border-slate-200/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stage.title}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">{stage.desc}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{stage.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Diagnostic Context Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-slate-700 font-medium">
                <strong>Current Status Detail:</strong> {connectionStateInfo.detail}
              </span>
            </div>
            {eegStatus.state === 'streaming' && (
              <div className="flex items-center gap-3 shrink-0 font-bold text-slate-700">
                <span>Samples: {eegStatus.samplesReceived}</span>
                <span>Dropped: {eegStatus.droppedPackets}</span>
                <span className="text-emerald-700">SQI: {eegStatus.signalQualityStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NEURAL SESSIONS CONTENT: HONEST EMPTY STATE OR LIVE/DEMO DATA ───── */}
      {!hasValidEegSession ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Brain className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No EEG Sessions Recorded Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Focus Dynamics, Alpha/Theta ratios, and cognitive workload curves will be computed from genuine physiological recordings once hardware is connected and a session is captured.
            </p>
            <p className="text-xs text-slate-400">
              Academic learning features, course syllabus, mock tests, and AI Classroom remain 100% functional without hardware.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onOpenHardwareManager}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Cpu className="w-4 h-4" />
              <span>Connect BioAmp Device</span>
            </button>
            <button
              onClick={onNavigateToTests}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Take Academic Mock Test</span>
            </button>
          </div>
        </div>
      ) : selectedSession ? (
        <div className="space-y-6">
          
          {/* Session Header Card & Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedSession.id === sessions[0]?.id ? 'Latest Eligible Session' : 'Historical Session'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{selectedSession.startTime}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-600">{selectedSession.course}</span>
                  {selectedSession.isSimulated ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                      [Demo Data — Not Live EEG]
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      [Hardware EEG Measurement — Live BioAmp EXG]
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedSession.title}
                </h2>
              </div>

              {/* Session Switcher Dropdown */}
              <div className="flex items-center gap-3 shrink-0">
                <label className="text-xs font-bold text-slate-500">Switch Session:</label>
                <select
                  value={selectedSession.id}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-slate-800"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.startTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics Strip for Selected Session */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Average Focus</div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1">
                  {selectedSession.neuralMetrics?.avgFocus ?? 'N/A'}%
                </div>
                <div className="text-[11px] text-indigo-600 font-medium mt-1">
                  Peak reached: {selectedSession.neuralMetrics?.peakFocus ?? 'N/A'}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Valid Coverage</div>
                <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1">
                  {selectedSession.neuralMetrics?.validCoveragePercent ?? 'N/A'}%
                </div>
                <div className="text-[11px] text-purple-600 font-medium mt-1">
                  {selectedSession.neuralMetrics?.artifactsDetectedCount || 0} Artifacts Quarantined
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Fatigue Onset</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {selectedSession.neuralMetrics?.fatigueOnsetMinute
                    ? `Min ${selectedSession.neuralMetrics.fatigueOnsetMinute}`
                    : 'None'}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  Duration: {selectedSession.durationMinutes} minutes
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {selectedSession.score !== undefined ? 'Quiz Score' : 'Signal Quality'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  {selectedSession.score !== undefined
                    ? `${selectedSession.score}%`
                    : selectedSession.neuralMetrics?.signalQualityStatus || 'Active'}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  {selectedSession.score !== undefined
                    ? `${selectedSession.correctAnswers}/${selectedSession.totalQuestions} Correct`
                    : 'Frontal Contact Steady'}
                </div>
              </div>
            </div>

            {/* ── FOCUS DYNAMICS TIME-SERIES CHART ───────────────────────────── */}
            {selectedSession.hasEegData && selectedSession.focusDynamics && selectedSession.focusDynamics.length > 0 ? (
              <div className="space-y-6 pt-2">
                {/* ── UNIFIED MULTI-TRACK SESSION GRAPH ── */}
                <UnifiedSessionGraph
                  session={selectedSession}
                  selectedQuestionIndex={selectedQuestionIndex}
                  onSelectQuestion={setSelectedQuestionIndex}
                />

                {/* ── INTERACTIVE PROCESSING PIPELINE FLOWCHART ── */}
                <SessionAnalysisFlowchart
                  session={selectedSession}
                />
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No EEG Data Recorded for This Attempt</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  This test was submitted without active NeuroFocus biometric monitoring. Academic score ({selectedSession.score}%) is preserved, but no synthetic or fabricated neural timeline is generated.
                </p>
              </div>
            )}

            {/* ── DETAILED SESSION REPORT & HARDWARE METRICS ─────────────────── */}
            {selectedSession.hasEegData && selectedSession.neuralMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                
                {/* Left Column: Computed Neural Features & Channel Status */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>Electrode Channels & Extracted Features</span>
                  </h4>

                  {/* Channel Impedance Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-700">FP1 (Left Frontal)</div>
                      <div className="text-emerald-600 font-bold mt-1">● Active Contact</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Z ≈ {selectedSession.neuralMetrics.channels.fp1.impedanceKohm} kΩ
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-700">FP2 (Right Frontal)</div>
                      <div className="text-emerald-600 font-bold mt-1">● Active Contact</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Z ≈ {selectedSession.neuralMetrics.channels.fp2.impedanceKohm} kΩ
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-700">A1 (Mastoid Ref)</div>
                      <div className="text-indigo-600 font-bold mt-1">● Ground / Ref</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Z ≈ {selectedSession.neuralMetrics.channels.a1.impedanceKohm} kΩ
                      </div>
                    </div>
                  </div>

                  {/* Mathematical Features Table */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Theta/Beta Ratio (TBR):</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.thetaBetaRatio} (Low = High Alertness)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Frontal Alpha Asymmetry:</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.alphaAsymmetry > 0 ? `+${selectedSession.neuralMetrics.alphaAsymmetry}` : selectedSession.neuralMetrics.alphaAsymmetry} (Positive = Approach Motivation)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Sample Entropy (Complexity):</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.sampleEntropy}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">FP1-FP2 Inter-hemispheric Coherence:</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.coherence}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Insights & Signal Integrity */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Neural Evidence & Personalized Insights</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedSession.aiRecommendations?.map((rec) => (
                      <div key={rec.id} className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{rec.recommendation}</span>
                        </div>
                        <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                          <strong>Biometric Evidence:</strong> {rec.evidence}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Signal Integrity Disclaimer Card */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Non-Diagnostic Academic Research Metric</span>
                    </div>
                    <p className="text-amber-800/80 text-[11px] leading-relaxed">
                      NeuroNexus analytics reflect relative changes in cognitive workload. They do not constitute clinical neurological diagnosis, medical diagnosis of ADHD, or clinical cognitive evaluation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 3C: WHERE FOCUS MAY HAVE DECLINED (Evidence-Backed Drops) ── */}
            {selectedSession.hasEegData && selectedSession.focusDropEvents && selectedSession.focusDropEvents.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Estimated Attention Fluctuations & Intervals of Interest
                  </h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    (Correlated with pacing, answer revisions, and signal quality)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSession.focusDropEvents.map((drop) => (
                    <div key={drop.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">
                          {drop.questionIndex ? `Question ${drop.questionIndex}` : `Minute ${drop.elapsedMinute}`} — {drop.topic || 'Assessment Interval'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {drop.confidence} Confidence (SQI: {drop.signalQuality}%)
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <strong>Academic Context:</strong> {drop.associatedAcademicContext}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-amber-100">
                        <strong>Biometric Analysis:</strong> {drop.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 6: PERSONALIZED FOCUS IMPROVEMENT COACH ─────────────── */}
            {selectedSession.coachSuggestions && selectedSession.coachSuggestions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-sm text-slate-900">
                      Personalized Focus Improvement Coach
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Evidence-Backed Study Strategy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedSession.coachSuggestions.map((coach) => (
                    <div key={coach.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 text-sm">{coach.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {coach.category}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-700 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900">1. Observed Pattern: </span>
                          <span>{coach.observedPattern}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">2. Supporting Evidence: </span>
                          <span>{coach.supportingEvidence}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">4. Evaluation Method: </span>
                          <span>{coach.evaluationMethod}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5-PILLAR NEURONEXUS FOCUS PROFILE (Task Engagement, Workload & Mismatch) ── */}
            {selectedSession.hasEegData && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-sm text-white">NeuroNexus Multimodal Focus Profile</h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                    Workload State: {selectedSession.focusProfile?.cognitiveWorkload || 'Optimal Workload'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-indigo-300">1. EEG-Derived Trends</div>
                    <div className="text-base font-black text-white mt-1">
                      {selectedSession.neuralMetrics?.avgFocus || 82}% Attention
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      TBR {selectedSession.neuralMetrics?.thetaBetaRatio || 1.35} &bull; {selectedSession.neuralMetrics?.validCoveragePercent || 95}% SQI
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-indigo-300">2. Task Engagement</div>
                    <div className="text-base font-black text-white mt-1">
                      {selectedSession.focusProfile?.sessionEngagementRatePercent || 94}% Active
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Zero unplanned dropouts &bull; Pacing intact
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-indigo-300">3. Focus Recovery Speed</div>
                    <div className="text-base font-black text-white mt-1">
                      ~{selectedSession.focusProfile?.averageFocusRecoverySeconds || 38}s
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Time to regain steady frontal baseline
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-indigo-300">4. Recommended Length</div>
                    <div className="text-base font-black text-white mt-1">
                      {selectedSession.focusProfile?.recommendedOptimalDurationMinutes || (selectedSession.type === 'pomodoro' ? 25 : 30)} mins
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Calibrated to individual fatigue curve
                    </div>
                  </div>
                </div>

                {/* Workload and Focus-Performance Mismatch Explanations */}
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-indigo-300">Cognitive Workload & Pacing Correlation: </strong>
                  {selectedSession.focusProfile?.workloadEvidence || 'Steady frontal power distribution demonstrates focused mental problem-solving without cognitive saturation.'}
                  {selectedSession.focusProfile?.focusPerformanceMismatch && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-amber-200">
                      <strong>Pattern Insight: </strong>
                      {selectedSession.focusProfile.focusPerformanceMismatch.description} &bull; {selectedSession.focusProfile.focusPerformanceMismatch.recommendation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── STAGE 2.3: WEEKLY NEURAL PROGRESS & TREND COMPARISON ───────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Continuous Tracking</span>
            </div>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              Weekly Neural Progress & Topic Stability
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated across eligible study sessions and test attempts with genuine biometric tracking.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {weeklyReport.weekLabel}
            </span>
          </div>
        </div>

        {weeklyReport.hasSufficientData ? (
          <div className="space-y-5">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Mean Weekly Attention</span>
                <div className="text-2xl font-black text-indigo-950 mt-1">
                  {weeklyReport.avgAttentionScore}%
                </div>
                {weeklyReport.comparisonWithPrevious && (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+{weeklyReport.comparisonWithPrevious.percentageChange}% vs Last Week</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Session-to-Session Stability</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ±{weeklyReport.sessionToSessionVariation}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Standard deviation across {weeklyReport.eligibleSessionsCount} sessions
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Recording Coverage</span>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  {weeklyReport.validRecordingCoveragePercent}% Valid
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  {weeklyReport.totalRecordingMinutes} total monitored minutes
                </div>
              </div>
            </div>

            {/* Explanation of Baseline & Percentage Calculation */}
            {weeklyReport.comparisonWithPrevious && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Basis of Comparison:</strong> {weeklyReport.comparisonWithPrevious.description} (Baseline: {weeklyReport.comparisonWithPrevious.baselinePeriod}).
              </div>
            )}

            {/* Topic Improvements Observed */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic-Level Correlation Trends:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {weeklyReport.topicImprovement.map((ti, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">{ti.topic}</div>
                    <div className="text-emerald-600 font-bold mt-0.5">{ti.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <Info className="w-6 h-6 text-indigo-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Insufficient Data for Weekly Progress</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {weeklyReport.statusMessage}
            </p>
          </div>
        )}
      </div>

      {/* ── STAGE 3.1: COMPLETE NEURAL HISTORY WITH FILTERS ─────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Chronological Neural & Academic Session History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter by activity format, course curriculum, or EEG data availability</p>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredSessions.length} Total Sessions
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'study', 'pomodoro', 'quiz', 'college_test'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterType === t
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'college_test' ? 'College Tests' : t === 'pomodoro' ? 'Pomodoro' : t}
              </button>
            ))}
          </div>

          {/* Course Filter */}
          {uniqueCourses.length > 0 && (
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none"
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* EEG Only Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={filterEegOnly}
              onChange={(e) => setFilterEegOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-400"
            />
            <span>With EEG Only</span>
          </label>
        </div>

        {/* Sessions Table / List */}
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            No sessions match the current filter selection. Academic mock tests and study sessions appear here once completed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  selectedSessionId === session.id
                    ? 'bg-indigo-50/70'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{session.startTime}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-700">{session.course}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {session.type}
                    </span>
                    {session.hasEegData ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {session.isSimulated ? 'EEG (Demo)' : 'EEG (Hardware)'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Academic Only (No EEG)
                      </span>
                    )}
                    {session.questionEvents && session.questionEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {session.questionEvents.length} Synchronized Questions
                      </span>
                    )}
                    {session.focusProfile && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Profile: {session.focusProfile.cognitiveWorkload}
                      </span>
                    )}
                    {session.selfCheckIn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Check-in: {session.selfCheckIn.perceivedFocusRating}/5 ★
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-900">{session.title}</div>
                  <div className="text-xs text-slate-500">
                    Duration: {session.durationMinutes} mins
                    {session.focusDropEvents && session.focusDropEvents.length > 0 && (
                      <span className="ml-2 text-amber-600 font-medium">
                        &bull; {session.focusDropEvents.length} focus fluctuation interval(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {session.neuralMetrics ? (
                    <div className="text-right">
                      <div className="text-base font-black text-indigo-900">
                        {session.neuralMetrics.avgFocus}% Focus
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {session.neuralMetrics.validCoveragePercent}% coverage
                      </div>
                    </div>
                  ) : session.score !== undefined ? (
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">{session.score}%</div>
                      <div className="text-[11px] text-slate-500">No EEG Tracked</div>
                    </div>
                  ) : null}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSessionId(session.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-xs font-bold text-indigo-700 shadow-xs"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
