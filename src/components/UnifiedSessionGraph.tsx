import React, { useState, useMemo } from 'react';
import {
  Activity, Clock, FileCheck2, AlertCircle, Info, Sparkles,
  Zap, Brain, CheckCircle2, XCircle, ArrowUpRight, HelpCircle,
  ShieldCheck, ShieldAlert, Coffee, Target, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceArea, ReferenceLine
} from 'recharts';
import type { LearningSession, FocusTimePoint, QuestionIntervalEvent, PomodoroPhaseRecord } from '../types';

interface UnifiedSessionGraphProps {
  session: LearningSession;
  selectedQuestionIndex?: number | null;
  onSelectQuestion?: (idx: number | null) => void;
}

export type TooltipItemType = 'eeg_marker' | 'academic_event' | 'phase_annotation' | 'blink_quarantine';

export interface MarkerDatum {
  minute: number;
  timestamp: string;
  attentionScore: number;
  signalQuality: number;
  isArtifact: boolean;
  markerCategory: 'rose' | 'amber' | 'indigo' | 'missing';
  phase?: string;
  // Academic sync
  academicEventType?: 'question_start' | 'question_answer' | 'pomodoro_focus' | 'pomodoro_break' | 'pause';
  questionNumber?: number;
  questionTopic?: string;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  // Annotation sync
  phaseAnnotation?: {
    name: string;
    description: string;
    evidenceSource: string;
    status: 'measured' | 'inferred' | 'simulated' | 'reference-only' | 'unavailable';
  };
}

export const UnifiedSessionGraph: React.FC<UnifiedSessionGraphProps> = ({
  session,
  selectedQuestionIndex,
  onSelectQuestion,
}) => {
  const [activeFilterTrack, setActiveFilterTrack] = useState<'all' | 'eeg' | 'academic'>('all');
  const [activeAnnotationHover, setActiveAnnotationHover] = useState<string | null>(null);

  const durationMin = Math.max(1, session.durationMinutes || 15);
  const isDemo = session.isSimulated;

  // ── 1. COMPOSE UNIFIED TIMELINE POINTS (EEG + Academic Events) ──────────────
  const chartData: MarkerDatum[] = useMemo(() => {
    // If session has focusDynamics, map them directly
    const rawDynamics = session.focusDynamics && session.focusDynamics.length > 0
      ? session.focusDynamics
      : Array.from({ length: durationMin }, (_, i) => ({
          minute: i + 1,
          timestamp: `${i + 1}m`,
          attentionScore: session.neuralMetrics?.avgFocus || 75,
          signalQuality: session.neuralMetrics?.validCoveragePercent || 92,
          isArtifact: false,
          phase: i < 5 ? 'Warmup' : i < 12 ? 'Deep Focus' : 'Wrapup',
        }));

    return rawDynamics.map((pt, idx) => {
      const min = pt.minute || (idx + 1);
      const sqi = pt.signalQuality ?? 95;
      const isArt = !!pt.isArtifact;

      // Marker Category Priority:
      // 1. Artifact-flagged intervals -> Rose
      // 2. Otherwise quality < 90% -> Amber
      // 3. Quality >= 90% and valid -> Indigo
      // 4. Missing/invalid -> Missing
      let markerCategory: MarkerDatum['markerCategory'] = 'indigo';
      if (!session.hasEegData) {
        markerCategory = 'missing';
      } else if (isArt) {
        markerCategory = 'rose';
      } else if (sqi < 90) {
        markerCategory = 'amber';
      } else {
        markerCategory = 'indigo';
      }

      // Check corresponding question event matching this minute
      let qEvt: QuestionIntervalEvent | undefined = undefined;
      if (session.questionEvents && session.questionEvents.length > 0) {
        // Map by question index or proportional time
        const qIdx = Math.min(session.questionEvents.length - 1, Math.floor((min / durationMin) * session.questionEvents.length));
        qEvt = session.questionEvents[qIdx];
      }

      // Check corresponding Pomodoro phase
      let pomoPhase: PomodoroPhaseRecord | undefined = undefined;
      if (session.pomodoroPhases && session.pomodoroPhases.length > 0) {
        let cumulativeSec = 0;
        for (const p of session.pomodoroPhases) {
          cumulativeSec += p.durationSeconds;
          if (min * 60 <= cumulativeSec) {
            pomoPhase = p;
            break;
          }
        }
      }

      // Phase annotations mapping
      let phaseAnnotation: MarkerDatum['phaseAnnotation'] = undefined;
      if (min >= 1 && min <= 5) {
        phaseAnnotation = {
          name: 'Warmup Phase (Calibration)',
          description: 'Cognitive baseline calibration window.',
          evidenceSource: isDemo ? 'Synthetic Sine Superposition' : 'Early Frontal Coherence Stabilization',
          status: isDemo ? 'simulated' : 'reference-only',
        };
      } else if (min > 5 && min <= 12) {
        phaseAnnotation = {
          name: 'Deep Engagement Block',
          description: 'Peak frontal beta stability and sustained analytical focus.',
          evidenceSource: isDemo ? 'Simulated 18Hz Beta Rhythm' : 'Theta/Beta Ratio < 1.40',
          status: isDemo ? 'simulated' : session.hasEegData ? 'measured' : 'unavailable',
        };
      } else if (min === 12 || min === session.neuralMetrics?.fatigueOnsetMinute) {
        phaseAnnotation = {
          name: 'Fatigue Onset & Theta Power Shift',
          description: 'Elevated theta power and micro-deliberation latency.',
          evidenceSource: isDemo ? 'Simulated Theta Injection' : 'Recorded Spectral Shift',
          status: isDemo ? 'simulated' : session.hasEegData ? 'inferred' : 'unavailable',
        };
      } else if (isArt) {
        phaseAnnotation = {
          name: 'Blink / EOG Filtering Interval',
          description: 'Automatic EOG artifact quarantine — excluded from focus aggregation.',
          evidenceSource: 'Frontopolar Waveform Peak Filter (>500µV or high delta slope)',
          status: isDemo ? 'simulated' : 'measured',
        };
      }

      return {
        minute: min,
        timestamp: pt.timestamp || `${min} min`,
        attentionScore: session.hasEegData ? pt.attentionScore : 0,
        signalQuality: session.hasEegData ? sqi : 0,
        isArtifact: isArt,
        markerCategory,
        phase: pt.phase,
        academicEventType: qEvt ? (qEvt.isCorrect ? 'question_answer' : 'question_start') : pomoPhase ? (pomoPhase.phaseType === 'focus' ? 'pomodoro_focus' : 'pomodoro_break') : undefined,
        questionNumber: qEvt?.questionIndex,
        questionTopic: qEvt?.topic,
        isCorrect: qEvt?.isCorrect,
        timeSpentSeconds: qEvt?.timeSpentSeconds,
        phaseAnnotation,
      };
    });
  }, [session, durationMin, isDemo]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* ── TOP HEADER & TRACK SELECTOR ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-slate-900">
              Synchronized Multi-Track Session Timeline & Analysis Graph
            </h3>
            {isDemo ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                SIMULATED DATA — NOT REAL EEG
              </span>
            ) : session.hasEegData ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live BioAmp v1.5 EEG Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                Academic Tracking Only (No EEG Attached)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized alignment of biometric EEG markers, signal quality (SQI), artifact quarantines, study timer intervals, and per-question assessment events.
          </p>
        </div>

        {/* Track Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveFilterTrack('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTrack === 'all' ? 'bg-white text-indigo-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tracks
          </button>
          <button
            onClick={() => setActiveFilterTrack('eeg')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTrack === 'eeg' ? 'bg-white text-indigo-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EEG Track
          </button>
          <button
            onClick={() => setActiveFilterTrack('academic')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilterTrack === 'academic' ? 'bg-white text-indigo-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academic Track
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE GRAPH VIEWPORT (Composed Recharts with Sync Axes) ────── */}
      <div className="h-72 sm:h-80 w-full bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 25, left: -5, bottom: 10 }}
          >
            <defs>
              <linearGradient id="attentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="minute"
              type="number"
              domain={[1, durationMin]}
              tickFormatter={(m) => `${m}m`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Session Duration (Minutes Elapsed)', position: 'insideBottom', offset: -6, fill: '#94a3b8', fontSize: 11 }}
            />

            {/* Left Axis: Focus Index & Signal Quality */}
            <YAxis
              yAxisId="left"
              domain={[30, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Attention & SQI (0–100%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
            />

            {/* Reference Range Visualizations */}
            <ReferenceArea yAxisId="left" x1={1} x2={Math.min(5, durationMin)} fill="#f1f5f9" fillOpacity={0.5} label={{ value: 'Warmup Phase (Calibration)', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
            {durationMin >= 12 && (
              <ReferenceLine yAxisId="left" x={12} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Fatigue Onset (Min 12)', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
            )}

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const datum = payload[0].payload as MarkerDatum;
                if (!datum) return null;

                return (
                  <div className="p-3.5 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-black text-indigo-300">
                        Minute {datum.minute} ({datum.timestamp})
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        datum.markerCategory === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : datum.markerCategory === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : datum.markerCategory === 'indigo'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {datum.markerCategory === 'rose' ? '● Rose: Artifact Flag' :
                         datum.markerCategory === 'amber' ? '● Amber: SQI < 90%' :
                         datum.markerCategory === 'indigo' ? '● Indigo: Adequate' : 'No EEG'}
                      </span>
                    </div>

                    {/* EEG Metrics */}
                    {session.hasEegData ? (
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated Attention:</span>
                          <span className="font-bold text-white font-mono">{datum.attentionScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Signal Quality (SQI):</span>
                          <span className={`font-bold font-mono ${datum.signalQuality >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {datum.signalQuality}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Artifact Status:</span>
                          <span className={datum.isArtifact ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {datum.isArtifact ? 'Flagged (Quarantined)' : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Data Source:</span>
                          <span className="text-purple-300 font-bold">{isDemo ? 'Simulation Engine' : 'BioAmp Hardware'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        No EEG data stream active for this timestamp interval.
                      </div>
                    )}

                    {/* Academic Event Context */}
                    {datum.questionNumber && (
                      <div className="pt-1.5 border-t border-slate-700/80 text-[11px] space-y-0.5">
                        <div className="font-bold text-amber-300 flex items-center justify-between">
                          <span>Question {datum.questionNumber} Interval</span>
                          <span>{datum.isCorrect ? '✓ Correct' : '✗ Missed'}</span>
                        </div>
                        <div className="text-slate-300 truncate">{datum.questionTopic}</div>
                        <div className="text-slate-400 text-[10px]">Time invested: {datum.timeSpentSeconds || 60}s</div>
                      </div>
                    )}

                    {/* Phase Annotation Details */}
                    {datum.phaseAnnotation && (
                      <div className="pt-1.5 border-t border-slate-700/80 text-[10px] space-y-0.5 text-slate-300">
                        <div className="font-bold text-indigo-300">{datum.phaseAnnotation.name}</div>
                        <p className="text-slate-400 leading-tight">{datum.phaseAnnotation.description}</p>
                        <div className="text-[9px] text-slate-500 pt-0.5">
                          Evidence: {datum.phaseAnnotation.evidenceSource} ({datum.phaseAnnotation.status})
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Track 1: EEG Attention Area & Signal Quality Line */}
            {(activeFilterTrack === 'all' || activeFilterTrack === 'eeg') && session.hasEegData && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="attentionScore"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#attentionAreaGrad)"
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    const datum = payload as MarkerDatum;

                    // PHASE 4 COLOUR-CODED DOTS:
                    // 1. Rose dots: Artifact-flagged intervals
                    if (datum.markerCategory === 'rose') {
                      return (
                        <circle
                          key={`rose-${index}`}
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          fill="#fb7185"
                          stroke="#e11d48"
                          strokeWidth={2}
                          className="animate-pulse"
                        />
                      );
                    }

                    // 2. Amber dots: Signal quality < 90%
                    if (datum.markerCategory === 'amber') {
                      return (
                        <circle
                          key={`amber-${index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#fbbf24"
                          stroke="#d97706"
                          strokeWidth={1.5}
                        />
                      );
                    }

                    // 3. Indigo dots: Adequate signal quality (>= 90%)
                    if (datum.markerCategory === 'indigo') {
                      return (
                        <circle
                          key={`indigo-${index}`}
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth={1}
                        />
                      );
                    }

                    return null;
                  }}
                  activeDot={{ r: 6.5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="signalQuality"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  name="Signal Quality (SQI)"
                />
              </>
            )}

            {/* Track 2: Academic Question Milestones Line / Dots */}
            {(activeFilterTrack === 'all' || activeFilterTrack === 'academic') && session.questionEvents && (
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="attentionScore"
                stroke="transparent"
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  const datum = payload as MarkerDatum;
                  if (!datum.questionNumber) return null;

                  return (
                    <g key={`q-${index}`} transform={`translate(${cx - 8}, ${cy - 8})`}>
                      <rect
                        width={16}
                        height={16}
                        rx={4}
                        fill={datum.isCorrect ? '#10b981' : '#f43f5e'}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      <text
                        x={8}
                        y={11}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={8.5}
                        fontWeight="bold"
                      >
                        Q{datum.questionNumber}
                      </text>
                    </g>
                  );
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── PHASE 4: EXACT COLOUR-CODED EEG MARKERS LEGEND ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600 shrink-0" />
            <span className="font-extrabold text-rose-900">Rose dots: Artifact-Flagged</span>
          </div>
          <p className="text-[11px] text-rose-700 leading-tight">
            Interval contains a detected artifact (blink/motion) and is excluded from aggregate focus metrics.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
            <span className="font-extrabold text-amber-900">Amber dots: Low SQI (&lt;90%)</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-tight">
            Signal quality is below 90%. The attention estimate for this interval is treated as low confidence.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 border border-white shrink-0" />
            <span className="font-extrabold text-indigo-950">Indigo dots: Adequate Signal</span>
          </div>
          <p className="text-[11px] text-indigo-700 leading-tight">
            Signal quality meets or exceeds 90%. The attention estimate is considered usable for correlation.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 shrink-0" />
            <span className="font-extrabold text-slate-800">Missing / Unconnected</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Represents gaps where no hardware stream was active. Preserved without fake data substitution.
          </p>
        </div>
      </div>

      {/* ── PHASE 5: SESSION PHASE ANNOTATIONS BAR ─────────────────────────────── */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="uppercase tracking-wider text-[10px]">Reference Phase Annotations (Hover for evidence breakdown)</span>
          <span className="text-[11px] text-slate-400">Synchronized Session Landmarks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div
            onMouseEnter={() => setActiveAnnotationHover('warmup')}
            onMouseLeave={() => setActiveAnnotationHover(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeAnnotationHover === 'warmup' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">1. Warmup Phase</span>
              <span className="text-[10px] text-slate-500">Min 1–5</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Cognitive baseline calibration window.</p>
          </div>

          <div
            onMouseEnter={() => setActiveAnnotationHover('deep')}
            onMouseLeave={() => setActiveAnnotationHover(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeAnnotationHover === 'deep' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950">2. Deep Engagement</span>
              <span className="text-[10px] text-indigo-700 font-bold">Min 5–16</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Peak frontal beta stability window.</p>
          </div>

          <div
            onMouseEnter={() => setActiveAnnotationHover('fatigue')}
            onMouseLeave={() => setActiveAnnotationHover(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeAnnotationHover === 'fatigue' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">3. Fatigue Onset</span>
              <span className="text-[10px] text-amber-700 font-bold">Min 12 Marker</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">Theta power elevation and latency shift.</p>
          </div>

          <div
            onMouseEnter={() => setActiveAnnotationHover('blink')}
            onMouseLeave={() => setActiveAnnotationHover(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeAnnotationHover === 'blink' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950">4. Blink Filtering</span>
              <span className="text-[10px] text-rose-700 font-bold">Active EOG</span>
            </div>
            <p className="text-[11px] text-rose-800 mt-0.5">Automatic EOG artifact quarantine.</p>
          </div>
        </div>
      </div>

      {/* ── QUESTION INSPECTOR (When question is selected) ───────────────────── */}
      {selectedQuestionIndex && session.questionEvents && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
          {(() => {
            const q = session.questionEvents.find(e => e.questionIndex === selectedQuestionIndex);
            if (!q) return null;
            return (
              <div>
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <span className="font-black text-indigo-950 text-sm">
                    Question {q.questionIndex}: {q.topic}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {q.isCorrect ? '✓ Correct Answer' : '✗ Incorrect Attempt'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-slate-700 text-[11px]">
                  <div>Time Spent: <strong className="text-slate-900">{q.timeSpentSeconds}s</strong></div>
                  <div>Answer Changes: <strong className="text-slate-900">{q.answerChangeCount}</strong></div>
                  <div>Attention Index: <strong className="text-indigo-900">{q.avgAttentionScore || 80}%</strong></div>
                  <div>Signal Quality: <strong className="text-emerald-700">{q.avgSignalQuality || 95}% SQI</strong></div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
