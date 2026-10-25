import React, { useState } from 'react';
import {
  Brain, Cpu, ShieldCheck, Filter, Activity, BarChart2,
  FileCheck2, CheckCircle2, AlertTriangle, ArrowRight, Sparkles,
  ChevronRight, Layers, EyeOff, Zap, RefreshCw, Info
} from 'lucide-react';
import type { LearningSession } from '../types';

interface SessionAnalysisFlowchartProps {
  session: LearningSession;
}

export type FlowchartStageId = 'acquisition' | 'conditioning' | 'spectral' | 'cognitive' | 'academic';

interface FlowchartStage {
  id: FlowchartStageId;
  stepNumber: number;
  title: string;
  shortDesc: string;
  hardwareDetail: string;
  simulationDetail: string;
  metrics: { label: string; value: string; status: 'ok' | 'warning' | 'info' }[];
  icon: React.ElementType;
}

export const SessionAnalysisFlowchart: React.FC<SessionAnalysisFlowchartProps> = ({ session }) => {
  const [selectedStage, setSelectedStage] = useState<FlowchartStageId>('acquisition');
  const isDemo = session.isSimulated;

  const stages: FlowchartStage[] = [
    {
      id: 'acquisition',
      stepNumber: 1,
      title: 'Signal Acquisition',
      shortDesc: isDemo ? 'Multi-band synthetic EEG stream' : 'BioAmp v1.5 + Arduino UNO ADC',
      hardwareDetail: 'Real physical analog front-end connected to Arduino UNO pin A0. Samples captured at 250 Hz with 10-bit resolution (0–5V scale, converted to microvolts). Zero synthetic data injected.',
      simulationDetail: 'Synthetic biological signal engine generating multi-harmonic waves (Delta, Theta, Alpha, Beta, Gamma) with randomized eye-blink transients and 4 cognitive state transitions.',
      metrics: [
        { label: 'Sample Rate', value: '250 Hz', status: 'ok' },
        { label: 'Input Mode', value: isDemo ? 'Demo Simulation' : 'Live Hardware (BioAmp)', status: isDemo ? 'warning' : 'ok' },
        { label: 'Electrode Config', value: 'Fp1–Fp2 Frontopolar', status: 'info' }
      ],
      icon: isDemo ? Sparkles : Cpu
    },
    {
      id: 'conditioning',
      stepNumber: 2,
      title: 'Conditioning & Quarantine',
      shortDesc: 'DC baseline subtraction & 50Hz notch',
      hardwareDetail: 'Removes DC baseline offset via 1-second running average. Applies digital biquad notch filter at 50Hz/60Hz to eliminate mains hum. Flags and quarantines high-amplitude eye-blink artifacts (>500µV).',
      simulationDetail: 'Simulated mains line noise rejection and simulated periodic EOG ocular spike quarantine. Quarantined intervals are flagged with Rose markers.',
      metrics: [
        { label: 'Notch Filter', value: '50 Hz / 60 Hz Active', status: 'ok' },
        { label: 'DC Baseline', value: 'Zero-Centered', status: 'ok' },
        { label: 'Artifact Quarantine', value: `${session.neuralMetrics?.artifactsDetectedCount ?? 2} spikes isolated`, status: 'warning' }
      ],
      icon: Filter
    },
    {
      id: 'spectral',
      stepNumber: 3,
      title: 'Spectral Extraction',
      shortDesc: 'Bandpower & Theta/Beta decomposition',
      hardwareDetail: 'Fast Fourier Transform (FFT) windowing across 4-second sliding epochs. Separates raw signals into Theta (4–8 Hz), Alpha (8–13 Hz), and Beta (13–30 Hz) power spectra.',
      simulationDetail: 'Mathematical synthesis of frequency power distributions adjusted per cognitive state (calm study, analytical problem solving, fatigue).',
      metrics: [
        { label: 'Alpha Rhythm (8–13Hz)', value: `${Math.round((session.neuralMetrics?.avgFocus || 75) * 0.45)} µV²`, status: 'info' },
        { label: 'Beta Rhythm (13–30Hz)', value: `${Math.round((session.neuralMetrics?.avgFocus || 75) * 0.55)} µV²`, status: 'ok' },
        { label: 'Signal Quality (SQI)', value: `${session.neuralMetrics?.validCoveragePercent || 94}%`, status: 'ok' }
      ],
      icon: Activity
    },
    {
      id: 'cognitive',
      stepNumber: 4,
      title: 'Cognitive Workload Index',
      shortDesc: 'Attention curve & fatigue detection',
      hardwareDetail: 'Computes continuous attention indices via Beta / (Alpha + Theta) power ratio. Identifies sustained theta increases to calculate fatigue onset milestone (Minute 12 landmark).',
      simulationDetail: 'Calculated attention trajectory modeled with warmup period (min 1–5), deep engagement peak (min 5–12), and gradual fatigue ramp down.',
      metrics: [
        { label: 'Avg Attention', value: `${session.neuralMetrics?.avgFocus ?? 78}%`, status: 'ok' },
        { label: 'Fatigue Onset', value: `Min ${session.neuralMetrics?.fatigueOnsetMinute ?? 12}`, status: 'warning' },
        { label: 'Peak Focus Score', value: `${session.neuralMetrics?.peakFocus ?? 91}%`, status: 'ok' }
      ],
      icon: Brain
    },
    {
      id: 'academic',
      stepNumber: 5,
      title: 'Academic & Timer Sync',
      shortDesc: 'Question pacing & Pomodoro alignment',
      hardwareDetail: 'Timestamp-synchronized correlation mapping cognitive attention scores directly to study timer intervals, Pomodoro focus/break phases, and individual question answer timelines.',
      simulationDetail: 'Biometric alignment with question responses: tracks whether missed questions occurred during high cognitive strain (concept gap) or low focus (fatigue/distraction).',
      metrics: [
        { label: 'Activity Type', value: session.type.toUpperCase(), status: 'info' },
        { label: 'Duration Tracked', value: `${session.durationMinutes} min`, status: 'ok' },
        { label: 'Academic Events', value: `${session.questionEvents?.length ?? (session.pomodoroPhases?.length ?? 1)} synchronized`, status: 'ok' }
      ],
      icon: FileCheck2
    }
  ];

  const currentStage = stages.find(s => s.id === selectedStage) || stages[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Interactive Session Analysis & Processing Pipeline Flowchart</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
              isDemo
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {isDemo ? 'SIMULATED DATA FLOW' : 'HARDWARE PIPELINE ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end processing path showing how {isDemo ? 'simulated signals' : 'real BioAmp v1.5 EEG voltage inputs'} transition from analog ingestion to cognitive indicators and academic correlations.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Session Reference</span>
          <span className="text-xs font-black text-slate-700">{session.course || session.title} • {session.durationMinutes}m</span>
        </div>
      </div>

      {/* ── FLOWCHART PIPELINE DIAGRAM (Interactive Stage Steps) ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === selectedStage;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-full ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/90 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stage.stepNumber}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>

                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {stage.title}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {stage.shortDesc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                <span className={isSelected ? 'text-indigo-700' : 'text-slate-400'}>
                  {isSelected ? 'Inspecting' : 'Click to inspect'}
                </span>
                <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
              </div>

              {/* Connecting arrow for larger screens */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── STAGE DEEP-DIVE INSPECTION CARD ──────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs font-black text-sm">
              0{currentStage.stepNumber}
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">
                Stage {currentStage.stepNumber}: {currentStage.title}
              </h4>
              <p className="text-xs text-slate-500">
                Detailed architecture specifications and diagnostic telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Active Architecture:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
              isDemo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isDemo ? 'Simulation Pipeline' : 'BioAmp v1.5 Hardware'}
            </span>
          </div>
        </div>

        {/* Technical Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real Hardware Execution Specification</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {currentStage.hardwareDetail}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulation / Demo Mode Fallback</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {currentStage.simulationDetail}
            </p>
          </div>
        </div>

        {/* Diagnostic Metrics Row */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Stage Diagnostic Telemetry
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentStage.metrics.map((m, mIdx) => (
              <div key={mIdx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{m.label}</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  m.status === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : m.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
