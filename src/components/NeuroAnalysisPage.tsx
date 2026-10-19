import React, { useState, useMemo } from 'react';
import {
  Brain, Activity, Sparkles, Clock, Calendar, ShieldCheck,
  AlertTriangle, CheckCircle2, Zap, BarChart2, Filter, ArrowUpRight,
  HelpCircle, Info, TrendingUp, RefreshCw, Play, FileCheck2, BookOpen,
  ChevronDown, Cpu, ShieldAlert, Award
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import type { UserProfile, LearningSession, FocusTimePoint } from '../types';
import { getStudentSessions, getWeeklyNeuralProgress } from '../utils/neuroSessionStore';

interface NeuroAnalysisPageProps {
  user: UserProfile;
  initialSessionId?: string | null;
  onNavigateToTests: () => void;
  onStartStudySession: () => void;
  onOpenHardwareManager?: () => void;
}

export const NeuroAnalysisPage: React.FC<NeuroAnalysisPageProps> = ({
  user,
  initialSessionId,
  onNavigateToTests,
  onStartStudySession,
  onOpenHardwareManager,
}) => {
  const sessions = useMemo(() => getStudentSessions(user.id), [user.id]);
  const weeklyReport = useMemo(() => getWeeklyNeuralProgress(user.id), [user.id]);

  // Selected session state
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    if (initialSessionId && sessions.some(s => s.id === initialSessionId)) {
      return initialSessionId;
    }
    const latestEligible = sessions.find(s => s.hasEegData) || sessions[0];
    return latestEligible ? latestEligible.id : '';
  });

  // History filters
  const [filterType, setFilterType] = useState<'all' | 'study' | 'quiz' | 'college_test'>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterEegOnly, setFilterEegOnly] = useState<boolean>(false);

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
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Acquisition Target:</span>
            <span className="font-bold text-white">BioAmp EXG Pill (Frontal Montage: FP1, FP2, A1 Ref)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHardwareManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-bold text-xs transition-colors shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>BioAmp Hardware Manager</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Demo Mode Active: Synthetic Waveforms Clearly Labeled (Not Live EEG)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAGE 2.1: LATEST / SELECTED LEARNING SESSION (PROMINENT HERO) ──── */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Brain className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Neural Sessions Recorded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            As you begin Pomodoro study sessions or complete mock tests, your Focus Dynamics timeline, signal quality metrics, and AI recommendations will populate here automatically.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onStartStudySession}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              Start First Study Session
            </button>
            <button
              onClick={onNavigateToTests}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              Take a Mock Test
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
                  {selectedSession.isSimulated && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                      Demo Data — Not Live EEG
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

            {/* ── STAGE 2.2: FOCUS DYNAMICS TIME-SERIES CHART ───────────────────── */}
            {selectedSession.hasEegData && selectedSession.focusDynamics && selectedSession.focusDynamics.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>Focus Dynamics — Session Attention Timeline</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estimated attention index over elapsed session time. The estimate is inferred from
                      EEG spectral features (Beta/(Theta+Alpha) ratio) — it does not directly measure
                      concentration, understanding, or intelligence.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <span className="w-3 h-1 bg-indigo-600 rounded-full" />
                      Estimated Attention
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-3 h-1 bg-slate-300 rounded-full border-t border-dashed border-slate-400" />
                      Signal Quality (SQI)
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70 border border-rose-500" />
                      Artifact / Low-Confidence
                    </span>
                  </div>
                </div>

                {/* Data-source provenance label */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${
                    selectedSession.isSimulated
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${selectedSession.isSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {selectedSession.isSimulated ? 'Simulated Demo Data — Not Live EEG' : 'Recorded Hardware Session'}
                  </span>
                  <span className="text-slate-400">
                    {selectedSession.focusDynamics.length} sampled intervals • {selectedSession.durationMinutes} min total
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full bg-slate-50/60 rounded-2xl border border-slate-200/90 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedSession.focusDynamics}
                      margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="minute"
                        type="number"
                        domain={[1, selectedSession.durationMinutes]}
                        tickFormatter={(m: number) => `${m}m`}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        label={{ value: 'Elapsed Time (min)', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                      />
                      <YAxis
                        domain={[40, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        label={{ value: 'Index (0–100)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(val: any, name: any, props: any) => {
                          const point = props?.payload as FocusTimePoint | undefined;
                          if (name === 'attentionScore') {
                            const conf = point && point.signalQuality < 90 ? 'Low confidence' : 'Adequate confidence';
                            const art = point?.isArtifact ? ' • Artifact flagged' : '';
                            return [`${val}% (estimate)`, `Estimated Attention — ${conf}${art}`];
                          }
                          if (name === 'signalQuality') {
                            return [`${val}%`, 'Signal Quality (SQI)'];
                          }
                          return [`${val}`, name];
                        }}
                        labelFormatter={(label: any) => {
                          const point = selectedSession.focusDynamics?.find(p => p.minute === label);
                          const ts = point?.timestamp ? ` • Clock: ${point.timestamp}` : '';
                          const phase = point?.phase ? ` • Phase: ${point.phase}` : '';
                          return `Elapsed: ${label} min${ts}${phase}`;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="attentionScore"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fill="url(#focusGradient)"
                        dot={(props: any) => {
                          const { cx, cy, payload, index } = props;
                          const isArtifact = (payload as FocusTimePoint)?.isArtifact;
                          const lowConf = (payload as FocusTimePoint)?.signalQuality < 90;
                          if (isArtifact) {
                            return <circle key={`a-${index}`} cx={cx} cy={cy} r={4} fill="#fb7185" stroke="#e11d48" strokeWidth={1.5} />;
                          }
                          if (lowConf) {
                            return <circle key={`l-${index}`} cx={cx} cy={cy} r={3.5} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                          }
                          return <circle key={`n-${index}`} cx={cx} cy={cy} r={3} fill="#4f46e5" strokeWidth={0} />;
                        }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="signalQuality"
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Confidence / data-quality legend explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                    <span className="font-bold text-rose-700">Rose dots:</span>
                    <span className="text-rose-600/80 block mt-0.5">Artifact-flagged intervals — excluded from aggregate focus calculations.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="font-bold text-amber-700">Amber dots:</span>
                    <span className="text-amber-700/80 block mt-0.5">Signal quality below 90% — attention estimate treated as low confidence.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">Indigo dots:</span>
                    <span className="text-slate-500 block mt-0.5">Adequate signal — attention estimate considered usable.</span>
                  </div>
                </div>

                {/* Focus Phase Annotations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">Warmup Phase:</span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">Min 1-5 (Cognitive baseline calibration)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="font-bold text-indigo-900">Deep Engagement:</span>
                    <span className="text-indigo-700 block text-[11px] mt-0.5">Min 5-16 (Peak frontal beta stability)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-900">Fatigue Onset:</span>
                    <span className="text-amber-800 block text-[11px] mt-0.5">
                      {selectedSession.neuralMetrics?.fatigueOnsetMinute
                        ? `Min ${selectedSession.neuralMetrics.fatigueOnsetMinute} (Theta power elevation)`
                        : 'No sustained drop'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">Blink Filtering:</span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">Automatic EOG artifact quarantine</span>
                  </div>
                </div>
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

            {/* ── STAGE 2.4: DETAILED SESSION REPORT & HARDWARE METRICS ────────── */}
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
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.alphaAsymmetry} (Positive = Approach Motivation)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Sample Entropy (SampEn):</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.sampleEntropy} (Band-limited Complexity)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Imaginary Frontal Coherence:</span>
                      <span className="font-black text-slate-900">{selectedSession.neuralMetrics.coherence} (Interhemispheric Coupling)</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Evidence-Based Study Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Evidence-Based AI Study Recommendations</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedSession.aiRecommendations?.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-100 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-purple-900">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{rec.recommendation}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                          <strong>Scientific Evidence:</strong> {rec.evidence}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedSession.topicPerformance && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800">Topic-Level Assessment Breakdown:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSession.topicPerformance.map((tp, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                              tp.correct
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {tp.topic}: {tp.correct ? '100%' : '0%'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      ) : null}

      {/* ── STAGE 3.2: WEEKLY NEURAL PROGRESS ANALYSIS ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Weekly Neural Progress & Trend Analysis</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated attention stability and academic correlation across verified comparable sessions
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {weeklyReport.weekLabel}
          </span>
        </div>

        {weeklyReport.hasSufficientData ? (
          <div className="space-y-5">
            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Weekly Focus Average</span>
                <div className="text-2xl font-black text-indigo-950 mt-1">
                  {weeklyReport.avgAttentionScore}%
                </div>
                {weeklyReport.comparisonWithPrevious && (
                  <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
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
            {(['all', 'study', 'quiz', 'college_test'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterType === t
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'college_test' ? 'College Tests' : t}
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
            No sessions match the current filter selection.
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
                    {session.hasEegData && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        EEG
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-900">{session.title}</div>
                  <div className="text-xs text-slate-500">Duration: {session.durationMinutes} mins</div>
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
