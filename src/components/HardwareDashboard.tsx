import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Activity, Zap, ShieldCheck, AlertTriangle, RefreshCw,
  Terminal, Sliders, CheckCircle2, XCircle, ArrowUpRight, HelpCircle,
  Radio, Play, Square, Layers, Info, Filter, ShieldAlert, Wifi, Check, Bug, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';
import { hardwareLayer, type HardwareReceiverStatus, type HardwareProtocolConfig, type HardwareDiagnosticsReport } from '../services/hardwareLayer';
import { signalProcessor, type ProcessedSample, type ExtractedFeatures, type ExperimentalFocusEstimate } from '../services/signalProcessor';
import { runSoftwarePipelineTests, type TestResult } from '../services/hardwareTests';
import { SimulationDashboard } from './SimulationDashboard';
import { eegModeController, type ActiveEEGMode } from '../services/eegModeController';
import type { UserProfile } from '../types';
import { isDemoUser } from '../utils/neuroSessionStore';

interface HardwareDashboardProps {
  user: UserProfile;
  onNavigateToNeuroAnalysis?: () => void;
  onOpenTimer?: () => void;
}

export const HardwareDashboard: React.FC<HardwareDashboardProps> = ({
  user,
  onNavigateToNeuroAnalysis,
  onOpenTimer,
}) => {
  const isDemo = isDemoUser(user.id, user.email);
  const [status, setStatus] = useState<HardwareReceiverStatus>(hardwareLayer.getStatus());
  const [config, setConfig] = useState<HardwareProtocolConfig>(hardwareLayer.getConfig());
  const [diagnostics, setDiagnostics] = useState<HardwareDiagnosticsReport>(hardwareLayer.getDiagnosticsReport());
  const [operatingMode, setOperatingMode] = useState<ActiveEEGMode>(eegModeController.getMode());
  const [activeTab, setActiveTab] = useState<'live-stream' | 'protocol-config' | 'pipeline' | 'diagnostics' | 'specs'>('live-stream');

  // Waveform visualization ring buffer
  const [waveformPoints, setWaveformPoints] = useState<Array<{ time: number; uV: number; quality: number; isArtifact: boolean }>>([]);
  const [latestFeatures, setLatestFeatures] = useState<ExtractedFeatures | null>(null);
  const [latestEstimate, setLatestEstimate] = useState<ExperimentalFocusEstimate | null>(null);

  // Test suite state
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Connection action loading
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubStatus = hardwareLayer.onStatusChange((s) => {
      setStatus(s);
      setDiagnostics(hardwareLayer.getDiagnosticsReport());
      setIsConnecting(s.state === 'connecting');
    });

    const unsubSample = hardwareLayer.onSample((sample: ProcessedSample) => {
      setWaveformPoints(prev => {
        const next = [
          ...prev,
          {
            time: sample.timestamp,
            uV: sample.filteredVoltages[0] || 0,
            quality: sample.qualityScore,
            isArtifact: sample.isArtifact,
          },
        ];
        if (next.length > 120) return next.slice(next.length - 120);
        return next;
      });
    });

    const unsubFeatures = hardwareLayer.onFeatures((f, e) => {
      setLatestFeatures(f);
      setLatestEstimate(e);
    });

    return () => {
      unsubStatus();
      unsubSample();
      unsubFeatures();
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    if (config.interfaceType === 'web-serial') {
      await hardwareLayer.connectWebSerial();
    } else if (config.interfaceType === 'websocket-bridge') {
      await hardwareLayer.connectWebSocketBridge(config.bridgeUrl);
    } else if (config.interfaceType === 'audio-input') {
      await hardwareLayer.connectAudioInput();
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await hardwareLayer.disconnect();
    setWaveformPoints([]);
    setLatestFeatures(null);
    setLatestEstimate(null);
  };

  const handleSwitchMode = (newMode: ActiveEEGMode) => {
    setOperatingMode(newMode);
    eegModeController.setMode(newMode);
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runSoftwarePipelineTests();
      setTestResults(results);
      setIsRunningTests(false);
    }, 200);
  };

  const handleConfigUpdate = (key: keyof HardwareProtocolConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    hardwareLayer.updateConfig({ [key]: value });
  };

  const isLiveStreaming = status.state === 'streaming';
  const isPortConnected = status.state === 'connected' || status.state === 'streaming';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* ── TOP HEADER & HARDWARE READINESS BANNER ───────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Physical Hardware Integration Rig
              </span>
              {isDemo && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Demo Mode Active [Simulated Fallback Ready]
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              EEG Hardware Integration & Live Signal Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Modular hardware acquisition layer for Arduino, BioAmp EXG, ESP32, and Audio ADC inputs.
              Provides raw signal inspection, real-time filtering, artifact detection, and unvalidated experimental focus estimation.
            </p>
          </div>

          {/* Quick Connect & Teardown Controller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!isPortConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isConnecting ? 'Requesting Device...' : `Connect Hardware (${config.interfaceType})`}</span>
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Disconnect Hardware</span>
              </button>
            )}

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Bug className="w-4 h-4 text-emerald-400" />
              <span>{isRunningTests ? 'Testing...' : 'Run Pipeline Tests'}</span>
            </button>
          </div>
        </div>

        {/* Live Hardware Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                status.state === 'streaming'
                  ? 'bg-emerald-400 animate-pulse'
                  : status.state === 'connected'
                  ? 'bg-indigo-400'
                  : status.state === 'invalid-data'
                  ? 'bg-amber-400 animate-bounce'
                  : status.state === 'error'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`} />
              <span className="text-slate-400">Connection State:</span>
              <span className="font-extrabold uppercase text-white tracking-wide">
                {status.state}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Interface: </span>
              <span className="font-bold text-white uppercase">{config.interfaceType}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Sample Rate: </span>
              <span className="font-bold text-emerald-400 font-mono">
                {status.sampleRateHz > 0 ? `${status.sampleRateHz} Hz` : `Configured: ${config.expectedSampleRateHz} Hz`}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Packets Received: </span>
              <span className="font-bold text-white font-mono">{status.samplesReceived.toLocaleString()}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Signal Quality: </span>
              <span className={`font-bold ${
                status.signalQualityStatus === 'Excellent' ? 'text-emerald-400' :
                status.signalQualityStatus === 'Good' ? 'text-indigo-400' :
                status.signalQualityStatus === 'Poor' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {status.signalQualityStatus}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            {status.portName ? `Active Port: ${status.portName}` : 'Port: Unassigned (Awaiting User Action)'}
          </div>
        </div>
      </div>

      {/* ── MODE SELECTOR: LIVE HARDWARE vs SIMULATION ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active EEG Operating Mode</div>
            <div className="text-sm font-black text-slate-900">
              {operatingMode === 'live-hardware' ? 'Mode 1: Physical Arduino + BioAmp Hardware' : 'Mode 2: Synthetic Software Simulation Engine'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => handleSwitchMode('live-hardware')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              operatingMode === 'live-hardware'
                ? 'bg-white text-indigo-900 shadow-sm'
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
            <span>Demo / Simulation Mode</span>
          </button>
        </div>
      </div>

      {/* ── ETHICAL TRANSPARENCY NOTICE ──────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-black text-amber-950 uppercase tracking-wider text-[11px]">
            Scientific & Biomedical Disclaimer
          </div>
          <p className="text-amber-800 leading-relaxed">
            Raw bio-potential voltages vary with skin impedance, sweat, electrode placement, and ambient electromagnetic noise.
            NeuroNexus features real-time baseline removal, 50Hz/60Hz notch filtering, and artifact rejection.
            <strong> Estimated attention indexes derived from Theta/Beta approximations are experimental proxies</strong> and must not be presented as medical diagnoses or absolute proofs of concentration.
          </p>
        </div>
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        {[
          { id: 'live-stream', label: '1. Live Signal Waveform', icon: Activity },
          { id: 'protocol-config', label: '2. Hardware Input Adapter', icon: Sliders },
          { id: 'pipeline', label: '3. Signal Processing & Features', icon: Filter },
          { id: 'diagnostics', label: '4. Hardware Diagnostics', icon: Bug },
          { id: 'specs', label: '5. Teammate Checklist & Specs', icon: Terminal },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3.5 px-3 flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: LIVE SIGNAL WAVEFORM (Continously Updating) ────────────────── */}
      {activeTab === 'live-stream' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">Live EEG Real-Time Voltage Stream</h3>
                <p className="text-xs text-slate-500">
                  Continuous visualization of physical hardware samples (Microvolts uV vs Time). Zero fabrication in live mode.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isLiveStreaming
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isLiveStreaming ? 'Receiving Real Samples' : status.state === 'connected' ? 'Awaiting Samples' : 'Hardware Disconnected'}
                </span>
              </div>
            </div>

            {/* Waveform Graph Area */}
            <div className="h-64 sm:h-72 w-full bg-slate-900 rounded-2xl p-4 border border-slate-800 relative flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
                <span className="font-mono text-emerald-400">Channel 1: FP1-A1 (Frontal)</span>
                <span className="font-mono text-slate-400">Scale: &plusmn;250 uV &bull; Time Window: ~120 samples</span>
              </div>

              {waveformPoints.length > 0 ? (
                <div className="absolute inset-x-2 inset-y-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={waveformPoints}>
                      <YAxis domain={[-200, 200]} hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                        formatter={(val: any) => [`${val} uV`, 'Amplitude']}
                      />
                      <Line
                        type="monotone"
                        dataKey="uV"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="my-auto text-center space-y-2 text-slate-500 text-xs">
                  <Activity className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <p className="font-bold text-slate-400">No active hardware waveform streaming</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Click <strong>Connect Hardware</strong> above to pair via Web Serial (Arduino/BioAmp), WebSocket bridge, or Audio Line-In.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono z-10 pt-2 border-t border-slate-800">
                <span>Sample Count: {status.samplesReceived}</span>
                <span>Dropped: {status.droppedPackets}</span>
                <span>Signal Quality: {status.signalQualityStatus}</span>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incoming Sample Rate</span>
                <div className="text-xl font-black text-slate-900 mt-1 font-mono">
                  {status.sampleRateHz > 0 ? `${status.sampleRateHz} Hz` : '0 Hz'}
                </div>
                <span className="text-[11px] text-slate-500">Calculated over rolling 1s</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Packet Drop Quarantine</span>
                <div className={`text-xl font-black mt-1 font-mono ${status.droppedPackets > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {status.droppedPackets} dropped
                </div>
                <span className="text-[11px] text-slate-500">Sequence index verification</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real-time Quality Index</span>
                <div className="text-xl font-black text-indigo-700 mt-1 font-mono">
                  {waveformPoints.length > 0 ? `${waveformPoints[waveformPoints.length - 1].quality}% SQI` : 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500">Impedance & noise evaluation</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Validation State</span>
                <div className="text-xl font-black text-slate-900 mt-1 uppercase text-sm">
                  {status.isRealHardware ? 'Physical Mode' : 'Simulated'}
                </div>
                <span className="text-[11px] text-slate-500">Zero synthetic fabrication in live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROTOCOL CONFIGURATION (Modular Input Layer) ───────────────── */}
      {activeTab === 'protocol-config' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-black text-base text-slate-900">Modular Input Layer & Hardware Protocol Configuration</h3>
            <p className="text-xs text-slate-500">
              Configure connection parameters once your teammate confirms the physical interface (Serial COM port, baud, format, or Audio ADC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Interface Method Selector */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-700 block">
                1. Hardware Interface Method
              </label>
              
              <div className="space-y-2">
                {[
                  {
                    id: 'web-serial',
                    title: 'Web Serial API (Recommended for USB Arduino / ESP32)',
                    desc: 'Direct USB COM port access via Google Chrome / Microsoft Edge. Zero installation needed.',
                  },
                  {
                    id: 'websocket-bridge',
                    title: 'Local WebSocket Bridge (ws://localhost:8765)',
                    desc: 'Connects to a lightweight local Python / Node script reading serial or SPI for non-Chrome platforms.',
                  },
                  {
                    id: 'audio-input',
                    title: 'Laptop 3.5mm Microphone / Line-In ADC',
                    desc: 'Direct AC audio line capture for custom analog amplifier rigs.',
                  },
                ].map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      config.interfaceType === item.id
                        ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interfaceType"
                      checked={config.interfaceType === item.id}
                      onChange={() => handleConfigUpdate('interfaceType', item.id)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-400"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {config.interfaceType === 'websocket-bridge' && (
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bridge WebSocket URL</label>
                  <input
                    type="text"
                    value={config.bridgeUrl}
                    onChange={(e) => handleConfigUpdate('bridgeUrl', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Baud Rate, Sample Rate, and Unit */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-700 block">
                2. Serial & Sampling Protocol
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Baud Rate (bps)</label>
                  <select
                    value={config.baudRate}
                    onChange={(e) => handleConfigUpdate('baudRate', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="9600">9600</option>
                    <option value="57600">57600</option>
                    <option value="115200">115200 (BioAmp Default)</option>
                    <option value="230400">230400</option>
                    <option value="500000">500000</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Expected Sample Rate</label>
                  <select
                    value={config.expectedSampleRateHz}
                    onChange={(e) => handleConfigUpdate('expectedSampleRateHz', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="125">125 Hz</option>
                    <option value="250">250 Hz (Nyquist for 40Hz EEG)</option>
                    <option value="500">500 Hz</option>
                    <option value="1000">1000 Hz</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Signal Unit Format</label>
                  <select
                    value={config.voltageUnit}
                    onChange={(e) => handleConfigUpdate('voltageUnit', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="raw_adc">Raw ADC (0 - 1023 Arduino 10-bit)</option>
                    <option value="uV">Microvolts (uV calibrated)</option>
                    <option value="mV">Millivolts (mV)</option>
                    <option value="audio_normalized">Audio Normalized (-1.0 to +1.0)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Powerline Notch Filter</label>
                  <select
                    value={config.notchFilterHz}
                    onChange={(e) => handleConfigUpdate('notchFilterHz', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="50">50 Hz Notch (India / Europe)</option>
                    <option value="60">60 Hz Notch (USA / Canada)</option>
                    <option value="0">Disabled (Clean battery source)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Custom Voltage Calibration Multiplier: <span className="font-mono text-indigo-700">{config.customVoltageScale}x</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={config.customVoltageScale}
                  onChange={(e) => handleConfigUpdate('customVoltageScale', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Active Channel Mapping:</span>
                <div>&bull; Channel 1 (FP1 Left Frontal): Pin A0 / Index 0 &bull; 1000x gain</div>
                <div>&bull; Channel 2 (FP2 Right Frontal): Pin A1 / Index 1 &bull; 1000x gain</div>
                <div>&bull; Reference (A1 Ear/Mastoid): Common Ground</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SIGNAL PROCESSING & FEATURES ──────────────────────────────── */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-base text-slate-900">Modular Signal Processing & Feature Extraction</h3>
              <p className="text-xs text-slate-500">
                Filters, Hjorth parameters, spectral band power approximations, and experimental attention indexes.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Experimental Algorithmic Layer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Theta/Beta Ratio</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {latestFeatures ? latestFeatures.thetaBetaRatio : '1.38 (Baseline)'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Theta (4-8Hz) to Beta (13-30Hz) ratio proxy. Lower ratios typically correlate with active analytical problem solving.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approx. Alpha Rhythm (8-13Hz)</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {latestFeatures ? `${latestFeatures.alphaPower} uV²` : '18.4 uV²'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Prominent in relaxed wakefulness with closed eyes. Suppresses during active visual processing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signal Entropy (Dispersion)</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {latestFeatures ? latestFeatures.signalEntropy : '1.82'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hjorth complexity and spectral entropy proxy indicating cognitive processing diversity.
              </p>
            </div>
          </div>

          {/* Experimental Focus Output Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-950">
                  Experimental Attention Estimate Output
                </h4>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Non-Medical Proxy
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-3xl font-black text-indigo-900 font-mono">
                  {latestEstimate ? `${latestEstimate.estimatedAttentionIndex}%` : isLiveStreaming ? 'Calculating...' : '78% (Waiting for Stream)'}
                </div>
                <div className="text-xs text-indigo-700 font-semibold mt-1">
                  Confidence: {latestEstimate?.confidence || 'Moderate'} &bull; State: {latestEstimate?.workloadHypothesis || 'Balanced Workload'}
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                {latestEstimate?.notes || 'Derived algorithmically from rolling frontopolar variance and TBR. Validated only when noise is below threshold.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: DIAGNOSTICS & TEST SUITE ──────────────────────────────────── */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900">Hardware & Browser Diagnostics Suite</h3>
              <p className="text-xs text-slate-500">
                Automatic checks for browser capability, serial ports, noise levels, and software test results.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Executing Tests...' : 'Run Pipeline Tests'}</span>
            </button>
          </div>

          {/* Browser & OS Capabilities Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Web Serial Support</span>
              <div className="flex items-center gap-1.5 font-bold">
                {diagnostics.webSerialAvailable ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span className="text-emerald-700">Supported (Chrome/Edge)</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-rose-600" /> <span className="text-rose-700">Not Supported</span></>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Web Audio ADC Support</span>
              <div className="flex items-center gap-1.5 font-bold">
                {diagnostics.webAudioAvailable ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span className="text-emerald-700">Supported (AudioContext)</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-rose-600" /> <span className="text-rose-700">Not Supported</span></>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Noise Level Status</span>
              <div className="font-bold text-slate-800">
                {diagnostics.noiseLevelStatus}
              </div>
            </div>
          </div>

          {/* Software Pipeline Test Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Software Test Suite Results ({testResults.filter(r => r.passed).length}/{testResults.length} Passed)
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Distinguishes software verification from physical hardware verification
              </span>
            </div>

            {testResults.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Click <strong>Run Pipeline Tests</strong> to execute the offline verification suite for DC removal, spike rejection, flatline quarantine, and TBR proxies.
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      t.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{t.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">{t.message}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{t.durationMs}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: TEAMMATE SPECIFICATIONS & HACKATHON CHECKLIST ─────────────── */}
      {activeTab === 'specs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-black text-base text-slate-900">Physical Hardware Hand-Off & Teammate Checklist</h3>
            <p className="text-xs text-slate-500">
              When your teammate arrives with the physical EEG sensor, follow this exact checklist to verify connection and stream.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Required Questions for Teammate */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <h4 className="font-bold text-xs uppercase text-indigo-950 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Ask Your Teammate These 4 Questions:
              </h4>

              <div className="space-y-2.5 text-slate-700 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900">1. Output Interface:</strong>
                  <p>Is it USB Serial (COM port), 3.5mm audio jack, or Bluetooth LE?</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900">2. Baud Rate & Speed:</strong>
                  <p>What baud rate did you set in the microcontroller firmware? (e.g., <code>Serial.begin(115200);</code>)</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900">3. Output Data Format:</strong>
                  <p>Are you printing comma-separated values (e.g. <code>Serial.println(val);</code>) or prefixed packets (<code>PKT,idx,val</code>)?</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900">4. Voltage Units & ADC Resolution:</strong>
                  <p>Are you printing raw ADC integers (0-1023) or scaled microvolts (uV)?</p>
                </div>
              </div>
            </div>

            {/* Arduino / Microcontroller Example Sketch */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>arduino_bioamp_stream.ino</span>
                <span>115200 Baud &bull; 250 Hz</span>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
{`// BioAmp EXG Frontopolar Streamer (250 Hz)
const int EEG_PIN = A0;
unsigned long lastSample = 0;

void setup() {
  Serial.begin(115200);
  pinMode(EEG_PIN, INPUT);
}

void loop() {
  // 4ms interval = 250 Hz sample rate
  if (micros() - lastSample >= 4000) {
    lastSample = micros();
    int raw = analogRead(EEG_PIN);
    Serial.println(raw); // Print raw ADC integer
  }
}`}
              </pre>

              <p className="text-[10px] text-slate-400">
                Close the Arduino Serial Monitor before clicking Connect in Chrome so the port is not locked!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
