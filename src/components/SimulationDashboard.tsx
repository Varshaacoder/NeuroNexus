import React, { useState, useEffect } from 'react';
import {
  Activity, Play, Pause, Square, RotateCcw, Sliders, ShieldAlert,
  Sparkles, CheckCircle2, AlertTriangle, Eye, Zap, Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';
import { simulationEngine, type SimulationParams, type SimulationMetrics, type SimulatedEEGSample, type SimulationCognitiveState } from '../services/simulationEngine';
import { saveStudentSession } from '../utils/neuroSessionStore';
import type { UserProfile, LearningSession } from '../types';

interface SimulationDashboardProps {
  user: UserProfile;
  onNavigateToNeuroAnalysis?: (sessionId?: string) => void;
  onOpenTimer?: () => void;
}

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({
  user,
  onNavigateToNeuroAnalysis,
  onOpenTimer,
}) => {
  const [params, setParams] = useState<SimulationParams>(simulationEngine.getParams());
  const [isRunning, setIsRunning] = useState<boolean>(simulationEngine.isActive());
  const [isPaused, setIsPaused] = useState<boolean>(simulationEngine.isSuspended());
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    elapsedSeconds: 0,
    sampleCount: 0,
    estimatedAttention: 84,
    simulatedThetaBetaRatio: 1.32,
    dominantBand: 'Beta (18Hz)',
  });

  const [waveform, setWaveform] = useState<Array<{ index: number; uV: number; quality: number; isArtifact: boolean }>>([]);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Automatically start simulation when entering Demo Mode
    simulationEngine.start();
    setIsRunning(true);
    setIsPaused(false);

    const unsubSample = simulationEngine.onSample((sample: SimulatedEEGSample) => {
      setWaveform(prev => {
        const next = [
          ...prev,
          {
            index: sample.sampleIndex,
            uV: sample.voltages[0],
            quality: sample.qualityScore,
            isArtifact: sample.isArtifact,
          },
        ];
        if (next.length > 120) return next.slice(next.length - 120);
        return next;
      });
    });

    const unsubMetrics = simulationEngine.onMetrics((m: SimulationMetrics) => {
      setMetrics(m);
    });

    return () => {
      unsubSample();
      unsubMetrics();
    };
  }, []);

  const handleStart = () => {
    simulationEngine.start();
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    simulationEngine.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    simulationEngine.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    simulationEngine.stop();
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    simulationEngine.reset();
    setWaveform([]);
    setIsRunning(false);
    setIsPaused(false);
    setSavedSessionId(null);
  };

  const handleUpdateParam = (key: keyof SimulationParams, val: any) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    simulationEngine.updateParams({ [key]: val });
  };

  const handleSaveDemoSession = () => {
    handleStop();
    const durMin = Math.max(1, Math.round(metrics.elapsedSeconds / 60));
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const session: LearningSession = {
      id: `demo_synth_${Date.now()}`,
      userId: user.id,
      title: `Demonstration Study Session [${params.dominantState.toUpperCase()}]`,
      type: 'study',
      course: 'CS201 C Programming & Systems',
      topic: 'Pointer Arithmetic & Systems',
      startTime: `Today, ${nowStr}`,
      startEpochMs: Date.now() - metrics.elapsedSeconds * 1000,
      endEpochMs: Date.now(),
      durationMinutes: durMin,
      focusMinutes: durMin,
      breakMinutes: 0,
      hasEegData: true,
      isSimulated: true, // EXPLICIT SIMULATION FLAG
      neuralMetrics: {
        avgFocus: metrics.estimatedAttention,
        peakFocus: Math.min(96, metrics.estimatedAttention + 10),
        thetaBetaRatio: metrics.simulatedThetaBetaRatio,
        alphaAsymmetry: 0.16,
        sampleEntropy: 1.82,
        coherence: 0.65,
        validCoveragePercent: 98,
        signalQualityStatus: 'Excellent',
        artifactsDetectedCount: 3,
        channels: {
          fp1: { label: 'FP1 (Frontal Left)', status: 'Active', impedanceKohm: 4.2 },
          fp2: { label: 'FP2 (Frontal Right)', status: 'Active', impedanceKohm: 4.5 },
          a1: { label: 'A1 (Reference)', status: 'Active', impedanceKohm: 3.8 },
        },
        isSimulated: true,
      },
      focusDynamics: [
        { minute: 1, timestamp: 'Start', attentionScore: metrics.estimatedAttention - 6, signalQuality: 98, phase: 'Warmup Phase [Demo]' },
        { minute: Math.max(2, Math.round(durMin / 2)), timestamp: 'Mid', attentionScore: metrics.estimatedAttention, signalQuality: 97, phase: `${params.dominantState.toUpperCase()} Interval [Demo]` },
        { minute: durMin, timestamp: 'End', attentionScore: metrics.estimatedAttention - 2, signalQuality: 96, phase: 'Session Wrapup [Demo]' },
      ],
      aiRecommendations: [
        {
          id: `rec_demo_${Date.now()}`,
          recommendation: `Demonstration Session: Illustrative cognitive pattern evaluated across ${durMin} simulated minutes.`,
          evidence: `Simulated Theta/Beta ratio averaged ${metrics.simulatedThetaBetaRatio}. Not a real EEG medical measurement.`,
          actionType: 'revision',
          actionTopic: 'Pointer Arithmetic',
        },
      ],
    };

    saveStudentSession(user.id, session);
    setSavedSessionId(session.id);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider shrink-0">
            SIMULATED DATA &mdash; NOT REAL EEG
          </div>
          <span className="font-medium text-amber-800 text-[11px] leading-relaxed">
            Multi-frequency software engine generating synthetic Frontopolar EEG signals for presentation and system verification without physical hardware.
          </span>
        </div>

        {savedSessionId && onNavigateToNeuroAnalysis && (
          <button
            onClick={() => onNavigateToNeuroAnalysis(savedSessionId)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span>View Generated Neuro Report</span>
          </button>
        )}
      </div>

      {/* Waveform Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-slate-900">Synthetic Waveform Generator</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                SIMULATED DATA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Superposition of Delta, Theta, Alpha, Beta, Gamma waveforms with controlled eye blink artifacts.
            </p>
          </div>

          {/* Controls: Start / Pause / Resume / Stop / Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Demo</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!isRunning}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 transition-colors"
              title="Stop Simulation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              title="Reset Demo Generator"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveDemoSession}
              disabled={metrics.sampleCount < 100}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save Demo Session</span>
            </button>
          </div>
        </div>

        {/* Live Synthetic Graph */}
        <div className="h-64 sm:h-72 w-full bg-slate-900 rounded-2xl p-4 border border-slate-800 relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
            <span className="font-mono text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Simulated FP1 Channel &bull; Superimposed Rhythms
            </span>
            <span className="font-mono text-amber-300 font-bold bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
              SIMULATED DATA &mdash; NOT REAL EEG
            </span>
          </div>

          {waveform.length > 0 ? (
            <div className="absolute inset-x-2 inset-y-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waveform}>
                  <YAxis domain={[-120, 160]} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [`${val} uV`, 'Synthetic Amplitude']}
                  />
                  <Line
                    type="monotone"
                    dataKey="uV"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="my-auto text-center space-y-2 text-slate-500 text-xs">
              <Activity className="w-8 h-8 mx-auto text-purple-500 animate-pulse" />
              <p className="font-bold text-slate-400">Simulation Engine Ready</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Click <strong>Start Demo</strong> to begin generating synthetic continuous brainwave signals.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono z-10 pt-2 border-t border-slate-800">
            <span>Generated Samples: {metrics.sampleCount.toLocaleString()}</span>
            <span>Elapsed: {Math.floor(metrics.elapsedSeconds / 60)}m {metrics.elapsedSeconds % 60}s</span>
            <span>Simulated State: {params.dominantState.toUpperCase()}</span>
          </div>
        </div>

        {/* Dynamic Parameter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-xs">
          {/* 1. Dominant Cognitive State */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Simulated Brainwave State</label>
            <select
              value={params.dominantState}
              onChange={(e) => handleUpdateParam('dominantState', e.target.value as SimulationCognitiveState)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value="focus">Deep Analytical Focus (High Beta 18Hz)</option>
              <option value="relaxation">Relaxed Wakefulness (Alpha 10Hz)</option>
              <option value="fatigue">Cognitive Fatigue (Theta 6Hz)</option>
              <option value="overload">High Cognitive Load (Beta+Gamma)</option>
            </select>
            <span className="text-[10px] text-slate-400 block">Alters relative power weights</span>
          </div>

          {/* 2. Base Amplitude */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Base Amplitude</label>
              <span className="font-mono font-bold text-indigo-700">{params.baseAmplitudeUv} uV</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={params.baseAmplitudeUv}
              onChange={(e) => handleUpdateParam('baseAmplitudeUv', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 block">Scalp bio-potential range: 10 - 80 uV</span>
          </div>

          {/* 3. Noise Level */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Noise Level</label>
              <span className="font-mono font-bold text-indigo-700">{params.noiseLevelPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={params.noiseLevelPercent}
              onChange={(e) => handleUpdateParam('noiseLevelPercent', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 block">Simulates ambient EM & thermal jitter</span>
          </div>

          {/* 4. Eye Blink Artifacts */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Physiological Artifacts</label>
            <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={params.generateBlinks}
                onChange={(e) => handleUpdateParam('generateBlinks', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-400"
              />
              <span>Generate Eye Blinks (~120uV)</span>
            </label>
            <span className="text-[10px] text-slate-400 block">Adds periodic frontal EOG deflections</span>
          </div>
        </div>
      </div>
    </div>
  );
};
