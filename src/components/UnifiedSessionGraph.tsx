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

export type DotCategory = 'rose' | 'amber' | 'indigo' | 'mint' | 'skyblue' | 'lavender' | 'missing';

export interface MarkerDatum {
  minute: number;
  timestamp: string;
  attentionScore: number;
  signalQuality: number;
  isArtifact: boolean;
  dotCategory: DotCategory;
  categoryLabel: string;
  title: string;
  description: string;
  phase?: string;
  // Academic context
  questionNumber?: number;
  questionTopic?: string;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  answerChangeCount?: number;
  // Pomodoro / Study context
  pomodoroEventTitle?: string;
  pomodoroEventDetail?: string;
  // Phase annotation context
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
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const durationMin = Math.max(1, session.durationMinutes || 15);
  const isDemo = session.isSimulated;

  // ── 1. COMPOSE DATA-DRIVEN TIMELINE WITH CUTE MULTICOLOURED DOTS ──────────
  const chartData: MarkerDatum[] = useMemo(() => {
    // Collect all event timestamps
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

    // Map base timeline
    const basePoints: MarkerDatum[] = rawDynamics.map((pt, idx) => {
      const min = pt.minute || (idx + 1);
      const sqi = pt.signalQuality ?? 95;
      const isArt = !!pt.isArtifact;
      const score = pt.attentionScore ?? 75;

      // Check if this minute aligns with a cognitive phase landmark
      let phaseAnnotation: MarkerDatum['phaseAnnotation'] = undefined;
      let isLandmark = false;
      let landmarkTitle = '';
      let landmarkDesc = '';

      if (min === 1) {
        isLandmark = true;
        landmarkTitle = 'Warmup Phase Calibration';
        landmarkDesc = 'Initial cognitive baseline calibration and contact stabilization.';
        phaseAnnotation = {
          name: landmarkTitle,
          description: landmarkDesc,
          evidenceSource: isDemo ? 'Multi-band Baseline Synthesis' : 'Frontal Coherence Baseline',
          status: isDemo ? 'simulated' : 'reference-only',
        };
      } else if (min === 5) {
        isLandmark = true;
        landmarkTitle = 'Deep Engagement Transition';
        landmarkDesc = 'Frontal Beta rhythm stabilization and sustained task focus.';
        phaseAnnotation = {
          name: landmarkTitle,
          description: landmarkDesc,
          evidenceSource: isDemo ? 'Beta 18Hz Frequency Injection' : 'Theta/Beta Ratio < 1.40',
          status: isDemo ? 'simulated' : session.hasEegData ? 'measured' : 'unavailable',
        };
      } else if (min === 12 || min === session.neuralMetrics?.fatigueOnsetMinute) {
        isLandmark = true;
        landmarkTitle = 'Fatigue Onset Landmark';
        landmarkDesc = 'Frontal Theta elevation and response deliberation latency.';
        phaseAnnotation = {
          name: landmarkTitle,
          description: landmarkDesc,
          evidenceSource: isDemo ? 'Elevated Theta Power Curve' : 'Spectral Shift (Theta/Alpha Rise)',
          status: isDemo ? 'simulated' : session.hasEegData ? 'inferred' : 'unavailable',
        };
      }

      // Check if this minute matches a Pomodoro event
      let isPomoEvent = false;
      let pomoTitle = '';
      let pomoDesc = '';
      if (session.type === 'pomodoro' && session.pomodoroPhases && session.pomodoroPhases.length > 0) {
        if (min === 1) {
          isPomoEvent = true;
          pomoTitle = 'Pomodoro Focus Block Started';
          pomoDesc = 'Active 25-minute deep study interval commenced.';
        } else if (min === session.focusMinutes || min === 25) {
          isPomoEvent = true;
          pomoTitle = 'Pomodoro Break Relaxation Transition';
          pomoDesc = 'Focus interval completed. Restorative relaxation break active.';
        } else if (min === durationMin) {
          isPomoEvent = true;
          pomoTitle = 'Pomodoro Cycle Complete';
          pomoDesc = 'Full study cycle and relaxation break completed successfully.';
        }
      } else if (session.type === 'study' && min === durationMin) {
        isPomoEvent = true;
        pomoTitle = 'Study Target Achieved';
        pomoDesc = `Completed ${durationMin} minutes of dedicated study time.`;
      }

      // STRICT PRIORITY FOR COLOUR-CODED DOTS:
      let dotCategory: DotCategory = 'indigo';
      let categoryLabel = 'Indigo: Usable Attention';
      let title = 'Usable Neural Reading';
      let description = `Adequate signal quality (SQI ${sqi}%); attention estimate considered usable.`;

      if (!session.hasEegData) {
        dotCategory = 'missing';
        categoryLabel = 'Missing / Gap (No EEG)';
        title = 'Academic Tracking Interval';
        description = 'No EEG hardware stream was connected. Academic data preserved without fake readings.';
      } else if (isArt) {
        dotCategory = 'rose';
        categoryLabel = 'Rose: Artifact Flagged';
        title = 'EOG Blink / Motion Artifact';
        description = 'Detected high-amplitude ocular or motion transient (>500µV); quarantined from focus calculation.';
      } else if (sqi < 90) {
        dotCategory = 'amber';
        categoryLabel = 'Amber: Low SQI (<90%)';
        title = 'Low Signal Quality';
        description = `Signal quality is ${sqi}%; attention estimate has low confidence due to electrode impedance.`;
      } else if (isPomoEvent) {
        dotCategory = 'mint';
        categoryLabel = 'Mint: Study / Pomodoro Event';
        title = pomoTitle;
        description = pomoDesc;
      } else if (isLandmark) {
        dotCategory = 'lavender';
        categoryLabel = 'Lavender: Phase Landmark';
        title = landmarkTitle;
        description = landmarkDesc;
      }

      return {
        minute: min,
        timestamp: pt.timestamp || `${min}m`,
        attentionScore: session.hasEegData ? score : 0,
        signalQuality: session.hasEegData ? sqi : 0,
        isArtifact: isArt,
        dotCategory,
        categoryLabel,
        title,
        description,
        phase: pt.phase,
        phaseAnnotation,
        pomodoroEventTitle: isPomoEvent ? pomoTitle : undefined,
        pomodoroEventDetail: isPomoEvent ? pomoDesc : undefined,
      };
    });

    // If assessment has question events, integrate exact question milestone points!
    if (session.questionEvents && session.questionEvents.length > 0) {
      const questionPoints: MarkerDatum[] = session.questionEvents.map((q, qIdx) => {
        // Compute exact fractional minute along the duration
        const step = durationMin / (session.questionEvents!.length + 1);
        const qMin = Math.round(((qIdx + 1) * step) * 10) / 10;
        const qScore = q.avgAttentionScore ?? (session.neuralMetrics?.avgFocus || 78);
        const qSqi = q.avgSignalQuality ?? 94;

        return {
          minute: qMin,
          timestamp: `${qMin}m`,
          attentionScore: session.hasEegData ? qScore : 0,
          signalQuality: session.hasEegData ? qSqi : 0,
          isArtifact: !!q.isArtifactFlagged,
          dotCategory: 'skyblue',
          categoryLabel: 'Sky Blue: Test / Assessment',
          title: `Question ${q.questionIndex}: ${q.topic}`,
          description: `${q.isCorrect ? '✓ Correctly answered' : '✗ Incorrect response'} in ${q.timeSpentSeconds}s with ${q.answerChangeCount} revision(s).`,
          questionNumber: q.questionIndex,
          questionTopic: q.topic,
          isCorrect: q.isCorrect,
          timeSpentSeconds: q.timeSpentSeconds,
          answerChangeCount: q.answerChangeCount,
        };
      });

      // Merge and sort chronologically by minute
      const merged = [...basePoints, ...questionPoints].sort((a, b) => a.minute - b.minute);
      return merged;
    }

    return basePoints;
  }, [session, durationMin, isDemo]);

  // Color mapping configuration
  const colorStyles: Record<DotCategory, { fill: string; stroke: string; glow: string; text: string; bg: string }> = {
    rose: { fill: '#fb7185', stroke: '#ffffff', glow: 'rgba(251, 113, 133, 0.45)', text: 'text-rose-600', bg: 'bg-[#fb7185]' },
    amber: { fill: '#fbbf24', stroke: '#ffffff', glow: 'rgba(251, 191, 36, 0.45)', text: 'text-amber-600', bg: 'bg-[#fbbf24]' },
    indigo: { fill: '#6366f1', stroke: '#ffffff', glow: 'rgba(99, 102, 241, 0.45)', text: 'text-indigo-600', bg: 'bg-[#6366f1]' },
    mint: { fill: '#34d399', stroke: '#ffffff', glow: 'rgba(52, 211, 153, 0.45)', text: 'text-emerald-600', bg: 'bg-[#34d399]' },
    skyblue: { fill: '#38bdf8', stroke: '#ffffff', glow: 'rgba(56, 189, 248, 0.45)', text: 'text-sky-600', bg: 'bg-[#38bdf8]' },
    lavender: { fill: '#c084fc', stroke: '#ffffff', glow: 'rgba(192, 132, 252, 0.45)', text: 'text-purple-600', bg: 'bg-[#c084fc]' },
    missing: { fill: '#cbd5e1', stroke: '#94a3b8', glow: 'transparent', text: 'text-slate-500', bg: 'bg-slate-300' },
  };

  const hasPomodoroEvents = session.type === 'pomodoro' || session.type === 'study';
  const hasAcademicEvents = !!(session.questionEvents && session.questionEvents.length > 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      
      {/* ── TOP HEADER & TRACK SELECTOR ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-slate-900">
              Session Focus Dynamics & Timeline
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
            Continuous waveform with timestamp-synchronized markers for signal quality, artifact quarantines, study timers, and test questions.
          </p>
        </div>

        {/* Track Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold shrink-0">
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

      {/* ── INTERACTIVE GRAPH VIEWPORT WITH SMALL, CUTE MULTICOLOURED DOTS ──── */}
      <div className="h-72 sm:h-80 w-full bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 25, left: -5, bottom: 10 }}
          >
            <defs>
              <linearGradient id="attentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, durationMin]}
              tickFormatter={(m) => `${m}m`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Session Duration (Minutes Elapsed)', position: 'insideBottom', offset: -6, fill: '#94a3b8', fontSize: 11 }}
            />

            <YAxis
              yAxisId="left"
              domain={[30, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Attention & SQI (0–100%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
            />

            {/* Subtle Reference Calibration Windows */}
            <ReferenceArea yAxisId="left" x1={0} x2={Math.min(5, durationMin)} fill="#f1f5f9" fillOpacity={0.5} />
            {durationMin >= 12 && (
              <ReferenceLine yAxisId="left" x={12} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.7} />
            )}

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const datum = payload[0].payload as MarkerDatum;
                if (!datum) return null;

                const style = colorStyles[datum.dotCategory] || colorStyles.indigo;

                return (
                  <div className="p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2 max-w-xs z-50 pointer-events-none transition-all">
                    {/* Category header with matching cute dot */}
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${style.bg} shadow-xs ring-1 ring-white/40`} />
                        <span className={`font-black text-[11px] ${style.text}`}>
                          {datum.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Min {datum.minute} ({datum.timestamp})
                      </span>
                    </div>

                    {/* Event Title & Description */}
                    <div>
                      <div className="font-bold text-white text-[12px] leading-snug">
                        {datum.title}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                        {datum.description}
                      </p>
                    </div>

                    {/* Relevant Measurements */}
                    {session.hasEegData ? (
                      <div className="pt-1.5 border-t border-slate-700/60 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
                        <div>
                          <span className="text-slate-400 block">Attention Index:</span>
                          <span className="font-bold text-white font-mono">{datum.attentionScore}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Signal Quality:</span>
                          <span className={`font-bold font-mono ${datum.signalQuality >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {datum.signalQuality}% SQI
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 text-[10px] text-slate-400 italic">
                        Hardware recording inactive for this interval.
                      </div>
                    )}

                    {/* Specific Question / Academic Context */}
                    {datum.questionNumber && (
                      <div className="pt-1 border-t border-slate-700/60 text-[10px] text-slate-300 flex items-center justify-between">
                        <span>Q{datum.questionNumber}: {datum.questionTopic}</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          datum.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {datum.isCorrect ? '✓ Correct' : '✗ Missed'}
                        </span>
                      </div>
                    )}

                    {/* Provenance note */}
                    <div className="text-[9px] text-slate-400 pt-0.5 border-t border-slate-700/40 flex justify-between items-center">
                      <span>Provenance:</span>
                      <span className={isDemo ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
                        {isDemo ? 'Demo Mode (Simulated)' : 'BioAmp v1.5 Hardware'}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Continuous EEG Waveform Area with Cute Multicoloured Dots */}
            {(activeFilterTrack === 'all' || activeFilterTrack === 'eeg') && session.hasEegData && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="attentionScore"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#attentionAreaGrad)"
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    if (!cx || !cy || !payload) return null;
                    const datum = payload as MarkerDatum;

                    // Filter based on active track
                    if (activeFilterTrack === 'eeg' && datum.dotCategory === 'skyblue') {
                      return null;
                    }

                    const theme = colorStyles[datum.dotCategory] || colorStyles.indigo;
                    const isHovered = activePointIndex === index;
                    const isSelected = selectedQuestionIndex && datum.questionNumber === selectedQuestionIndex;

                    return (
                      <g
                        key={`cute-dot-${index}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setActivePointIndex(index)}
                        onMouseLeave={() => setActivePointIndex(null)}
                        onClick={() => {
                          if (datum.questionNumber && onSelectQuestion) {
                            onSelectQuestion(datum.questionNumber);
                          }
                        }}
                      >
                        {/* Subtle hover glow halo */}
                        {(isHovered || isSelected) && (
                          <>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={7.5}
                              fill={theme.glow}
                              className="animate-pulse"
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={5.5}
                              fill="none"
                              stroke={theme.fill}
                              strokeWidth={1}
                              strokeOpacity={0.6}
                            />
                          </>
                        )}

                        {/* Small, cute circular marker (approx 6.5px diameter) */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered || isSelected ? 4.2 : 3.3}
                          fill={theme.fill}
                          stroke="#ffffff"
                          strokeWidth={1.2}
                          style={{
                            filter: isHovered
                              ? `drop-shadow(0 0 4px ${theme.glow})`
                              : 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.12))',
                            transition: 'r 0.15s ease, filter 0.15s ease',
                          }}
                        />
                      </g>
                    );
                  }}
                  activeDot={false}
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

            {/* Academic Track: Discrete Question Dots when viewing Academic Track Only */}
            {activeFilterTrack === 'academic' && session.questionEvents && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="attentionScore"
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (!cx || !cy || !payload) return null;
                  const datum = payload as MarkerDatum;
                  if (datum.dotCategory !== 'skyblue') return null;

                  const isHovered = activePointIndex === index;
                  const isSelected = selectedQuestionIndex && datum.questionNumber === selectedQuestionIndex;

                  return (
                    <g
                      key={`acad-dot-${index}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setActivePointIndex(index)}
                      onMouseLeave={() => setActivePointIndex(null)}
                      onClick={() => {
                        if (datum.questionNumber && onSelectQuestion) {
                          onSelectQuestion(datum.questionNumber);
                        }
                      }}
                    >
                      {(isHovered || isSelected) && (
                        <circle cx={cx} cy={cy} r={7.5} fill="rgba(56, 189, 248, 0.45)" className="animate-pulse" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered || isSelected ? 4.2 : 3.3}
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth={1.2}
                      />
                    </g>
                  );
                }}
                activeDot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── 5. COMPACT, CLEAN LEGEND (Tiny Coloured Dots beside Labels) ──────── */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2.5 pb-1 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fb7185] ring-2 ring-[#fb7185]/30 shadow-2xs" />
          <span>Rose: Artifact-Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fbbf24] ring-2 ring-[#fbbf24]/30 shadow-2xs" />
          <span>Amber: Low SQI (&lt;90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6366f1] ring-2 ring-[#6366f1]/30 shadow-2xs" />
          <span>Indigo: Usable Attention</span>
        </div>
        {hasPomodoroEvents && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34d399] ring-2 ring-[#34d399]/30 shadow-2xs" />
            <span>Mint: Study / Pomodoro Event</span>
          </div>
        )}
        {hasAcademicEvents && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] ring-2 ring-[#38bdf8]/30 shadow-2xs" />
            <span>Sky Blue: Test / Assessment</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c084fc] ring-2 ring-[#c084fc]/30 shadow-2xs" />
          <span>Lavender: Phase Landmark</span>
        </div>
        {!session.hasEegData && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 ring-1 ring-slate-400 shadow-2xs" />
            <span>Slate: Missing / Gap (No EEG)</span>
          </div>
        )}
      </div>

      {/* ── QUESTION INSPECTOR (Only shown when a question is clicked) ───────── */}
      {selectedQuestionIndex && session.questionEvents && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
          {(() => {
            const q = session.questionEvents.find(e => e.questionIndex === selectedQuestionIndex);
            if (!q) return null;
            return (
              <div>
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-black text-indigo-950 text-xs">
                    Question {q.questionIndex}: {q.topic}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {q.isCorrect ? '✓ Correct Answer' : '✗ Incorrect Attempt'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 text-slate-700 text-[11px]">
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
