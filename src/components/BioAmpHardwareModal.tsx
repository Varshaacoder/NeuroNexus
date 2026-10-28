import React, { useState, useEffect, useRef } from 'react';
import {
  X, Cpu, Activity, AlertTriangle, ShieldCheck, Zap,
  CheckCircle2, RefreshCw, Terminal, Layers, Wifi, Power
} from 'lucide-react';
import { eegService, type EEGDeviceStatus, type EEGSample } from '../services/eegService';

interface BioAmpHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BioAmpHardwareModal: React.FC<BioAmpHardwareModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<EEGDeviceStatus>(eegService.getStatus());
  const [config, setConfig] = useState(eegService.getConfig());
  const [activeTab, setActiveTab] = useState<'connection' | 'oscilloscope' | 'bridge' | 'safety'>('connection');
  const [isConnecting, setIsConnecting] = useState(false);
  const [samplesHistory, setSamplesHistory] = useState<number[]>([]);
  const isWebSerialSupported = eegService.isWebSerialSupported();

  useEffect(() => {
    if (!isOpen) return;

    const unsubStatus = eegService.onStatusChange((s) => {
      setStatus(s);
      setIsConnecting(s.state === 'connecting');
    });

    const unsubSample = eegService.onSample((sample: EEGSample) => {
      if (sample.values && sample.values.length > 0) {
        setSamplesHistory(prev => {
          const next = [...prev, sample.values[0]];
          if (next.length > 80) return next.slice(next.length - 80);
          return next;
        });
      }
    });

    return () => {
      unsubStatus();
      unsubSample();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectSerial = async () => {
    setIsConnecting(true);
    await eegService.connectWebSerial();
    setIsConnecting(false);
  };

  const handleConnectBridge = async () => {
    setIsConnecting(true);
    await eegService.connectWebSocketBridge(config.bridgeUrl);
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await eegService.disconnect();
    setSamplesHistory([]);
  };

  const handleBaudRateChange = (rate: number) => {
    const updated = { ...config, baudRate: rate };
    setConfig(updated);
    eegService.updateConfig({ baudRate: rate });
  };

  const handleSampleRateChange = (hz: number) => {
    const updated = { ...config, samplingRateHz: hz };
    setConfig(updated);
    eegService.updateConfig({ samplingRateHz: hz });
  };

  const isConnected = status.state === 'connected' || status.state === 'streaming';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-white tracking-tight">BioAmp EXG Pill Hardware Setup</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Modular Data Layer
                </span>
              </div>
              <p className="text-xs text-slate-300">Frontopolar EEG Acquisition &bull; FP1 &bull; FP2 &bull; A1 Reference</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── NAVIGATION TABS ─────────────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('connection')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'connection'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Connection & Ports</span>
          </button>

          <button
            onClick={() => setActiveTab('oscilloscope')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'oscilloscope'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Oscilloscope</span>
            {status.state === 'streaming' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bridge'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Local Bridge & API</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Electrical Safety</span>
          </button>
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: CONNECTION & PORTS */}
          {activeTab === 'connection' && (
            <div className="space-y-5">
              
              {/* Connection Status Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                    status.state === 'streaming' ? 'bg-emerald-500 shadow-md shadow-emerald-200' :
                    status.state === 'connected' ? 'bg-indigo-600' :
                    status.state === 'connecting' ? 'bg-amber-500 animate-pulse' :
                    status.state === 'error' ? 'bg-rose-500' : 'bg-slate-400'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {status.state === 'streaming' ? 'BioAmp EXG Pill Streaming' :
                         status.state === 'connected' ? 'Port Connected (Idle)' :
                         status.state === 'connecting' ? 'Connecting to Serial Port...' :
                         status.state === 'error' ? 'Connection Error' : 'Hardware Disconnected'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        status.state === 'streaming' ? 'bg-emerald-100 text-emerald-800' :
                        status.state === 'connected' ? 'bg-indigo-100 text-indigo-800' :
                        status.state === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {status.state.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {status.portName ? `${status.portName} @ ${status.baudRate} baud` : 'No serial device currently open'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                    >
                      Disconnect Device
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectSerial}
                      disabled={isConnecting}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                    >
                      {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                      <span>Select & Connect Serial Port</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error Callout */}
              {status.errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hardware Alert: </span>
                    {status.errorMessage}
                  </div>
                </div>
              )}

              {/* Browser Web Serial Support Check */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isWebSerialSupported ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="font-semibold text-slate-800">
                    {isWebSerialSupported ? 'Web Serial API supported (Direct USB communication available)' : 'Web Serial API not available in this browser'}
                  </span>
                </div>
                {!isWebSerialSupported && (
                  <button
                    onClick={() => setActiveTab('bridge')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Use Local Python Bridge
                  </button>
                )}
              </div>

              {/* Hardware Configuration Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Baud Rate */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Serial Baud Rate</label>
                  <p className="text-[11px] text-slate-400">Match the baud rate set in your BioAmp Arduino/ESP32 firmware.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[9600, 57600, 115200, 230400].map(rate => (
                      <button
                        key={rate}
                        disabled={isConnected}
                        onClick={() => handleBaudRateChange(rate)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          config.baudRate === rate
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } disabled:opacity-50`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sampling Rate */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Sampling Frequency (Hz)</label>
                  <p className="text-[11px] text-slate-400">Standard frontopolar bandpass requires &ge; 128 Hz.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[128, 250, 500].map(hz => (
                      <button
                        key={hz}
                        disabled={isConnected}
                        onClick={() => handleSampleRateChange(hz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          config.samplingRateHz === hz
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } disabled:opacity-50`}
                      >
                        {hz} Hz
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configured Channels */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Configured Electrode Channels
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">International 10-20 Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.channels.map(ch => (
                    <div key={ch.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{ch.label}</div>
                        <div className="text-[11px] text-slate-500">Contact: {ch.impedanceKohm} k&Omega;</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE OSCILLOSCOPE */}
          {activeTab === 'oscilloscope' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time Waveform Monitor</h3>
                  <p className="text-xs text-slate-500">Channel FP1 microvolt differential (&mu;V)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Samples: <strong>{status.samplesReceived}</strong></span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500">Drops: <strong className={status.droppedPackets > 0 ? 'text-amber-600' : 'text-slate-700'}>{status.droppedPackets}</strong></span>
                </div>
              </div>

              {/* Waveform Canvas / SVG Container */}
              <div className="h-56 bg-slate-950 rounded-2xl p-4 flex flex-col justify-between border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
                  <span>+150 &mu;V</span>
                  <span className="font-mono text-emerald-400">
                    {status.state === 'streaming' ? 'STREAMING 250Hz' : 'DISCONNECTED'}
                  </span>
                </div>

                {/* Oscilloscope Grid & Trace */}
                <div className="w-full h-36 relative flex items-center">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-4 grid-cols-8 pointer-events-none opacity-20">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-indigo-400" />
                    ))}
                  </div>

                  {isConnected && samplesHistory.length > 2 ? (
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={samplesHistory
                          .map((val, idx) => {
                            const x = (idx / (samplesHistory.length - 1)) * 100;
                            const normalized = 50 - (val / 150) * 45;
                            const y = Math.max(5, Math.min(95, normalized));
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  ) : (
                    <div className="w-full text-center z-10 text-slate-500 text-xs flex flex-col items-center gap-2">
                      <Cpu className="w-8 h-8 text-slate-600 stroke-1" />
                      <span>Hardware disconnected. Zero baseline held &bull; No simulated data fabricated during acquisition.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
                  <span>-150 &mu;V</span>
                  <span>Sweep: 500ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Signal Quality: <strong className="text-slate-900">{status.signalQualityStatus}</strong></span>
                <span>Ground Reference: <strong>A1 (Left Mastoid)</strong></span>
                <span>Bandpass Filter: <strong>0.5 Hz &ndash; 35 Hz</strong></span>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL BRIDGE & API */}
          {activeTab === 'bridge' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Local Desktop WebSocket Bridge</h3>
                <p className="text-xs text-slate-500">
                  If running in browsers without Web Serial (Firefox, Safari) or connecting via Raspberry Pi/Linux, run this lightweight 15-line Python serial bridge.
                </p>
              </div>

              {/* WebSocket Target Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.bridgeUrl || 'ws://localhost:8765'}
                  onChange={(e) => setConfig({ ...config, bridgeUrl: e.target.value })}
                  placeholder="ws://localhost:8765"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleConnectBridge}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Connect Bridge
                </button>
              </div>

              {/* Python Script Snippet */}
              <div className="bg-slate-950 rounded-2xl p-4 text-xs font-mono text-slate-200 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>bridge.py (Python 3.9+)</span>
                  <span className="text-[10px]">pip install websockets pyserial</span>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-300">
{`import asyncio, websockets, serial

ser = serial.Serial('COM3', 115200, timeout=1)  # Change port as needed

async def handler(websocket):
    print("NeuroNexus connected via WebSocket")
    while True:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            await websocket.send(line)
        await asyncio.sleep(0.002)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: ELECTRICAL SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Mandatory Electrical Safety Guidelines for EEG</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  BioAmp EXG Pill connects skin-contact electrodes directly to scalp positions (FP1, FP2) and mastoid reference (A1). To ensure total human subject safety during hackathon demonstrations and laboratory sessions:
                </p>
                <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-5">
                  <li><strong>Power Source:</strong> Only power the BioAmp EXG microcontroller via battery bank or a galvanically isolated laptop running on battery power.</li>
                  <li><strong>Never use mains power:</strong> Never connect the microcontroller to a PC or charger plugged directly into AC mains without medical-grade isolation.</li>
                  <li><strong>No improvised electronics:</strong> Use only standard pre-gelled Ag/AgCl disposable electrodes or shielded BioAmp cables.</li>
                  <li><strong>Skin preparation:</strong> Clean scalp and mastoid contact areas with alcohol wipes to maintain low contact impedance (&lt; 5 k&Omega;).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-900">Academic & Observational Research Scope</h4>
                <p>
                  NeuroNexus uses EEG telemetry solely to study student attention vigilance and cognitive workload dynamics during academic coursework. It is not an FDA-cleared diagnostic device and should not be used for clinical or medical diagnostics.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>Hardware Status: <strong>{status.state.toUpperCase()}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Close Manager
          </button>
        </div>

      </div>
    </div>
  );
};
