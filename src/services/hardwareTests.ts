/**
 * NeuroNexus — Hackathon Hardware Integration Test Suite
 * 
 * Tests the software pipeline components without needing physical hardware:
 * 1. Protocol ingestion & packet normalization
 * 2. Signal processing, baseline DC removal & artifact detection
 * 3. Flatline / electrode drop detection
 * 4. Frequency band feature extraction & Theta/Beta ratio calculation
 * 5. Scientific validation disclaimer enforcement
 */

import { EEGSignalProcessor, type RawDataPacket } from './signalProcessor';
import { hardwareLayer } from './hardwareLayer';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runSoftwarePipelineTests(): TestResult[] {
  const results: TestResult[] = [];
  const processor = new EEGSignalProcessor({ sampleRateHz: 250, notchFrequencyHz: 50 });

  // Test 1: Baseline DC Offset & AC extraction
  const t1Start = performance.now();
  processor.reset();
  // Feed 10 samples with a +200uV DC offset and a 10uV ripple
  let lastProcessed: any = null;
  for (let i = 0; i < 20; i++) {
    lastProcessed = processor.processPacket({
      timestamp: Date.now() + i * 4,
      sampleIndex: i,
      rawVoltages: [200 + (i % 2 === 0 ? 10 : -10)],
      unit: 'uV',
    });
  }
  const t1Pass = lastProcessed && Math.abs(lastProcessed.filteredVoltages[0]) < 150;
  results.push({
    name: 'Signal Processing: Baseline DC Removal',
    passed: t1Pass,
    message: t1Pass
      ? `DC offset successfully suppressed. Filtered output: ${lastProcessed.filteredVoltages[0]} uV.`
      : 'Failed to suppress baseline DC offset.',
    durationMs: Math.round(performance.now() - t1Start),
  });

  // Test 2: Artifact & Out-of-Bounds Detection (> 500uV or clipping)
  const t2Start = performance.now();
  processor.reset();
  const spikePacket: RawDataPacket = {
    timestamp: Date.now(),
    sampleIndex: 100,
    rawVoltages: [850], // Gross muscle movement or detachment
    unit: 'uV',
  };
  const spikeResult = processor.processPacket(spikePacket);
  const t2Pass = spikeResult.isArtifact && spikeResult.qualityScore < 50;
  results.push({
    name: 'Artifact Detection: High-Amplitude Spike Rejection',
    passed: t2Pass,
    message: t2Pass
      ? `High-voltage motion artifact (+850uV) correctly flagged: ${spikeResult.artifactReason} (Quality: ${spikeResult.qualityScore}%).`
      : 'High-voltage spike was not quarantined.',
    durationMs: Math.round(performance.now() - t2Start),
  });

  // Test 3: Flatline & Unconnected Electrode Quarantine
  const t3Start = performance.now();
  processor.reset();
  let flatlineResult: any = null;
  for (let i = 0; i < 15; i++) {
    flatlineResult = processor.processPacket({
      timestamp: Date.now() + i * 4,
      sampleIndex: i,
      rawVoltages: [0.0], // Unconnected wire reading 0V
      unit: 'uV',
    });
  }
  const t3Pass = flatlineResult && flatlineResult.isArtifact && flatlineResult.artifactReason === 'flatline';
  results.push({
    name: 'Electrode Contact: Flatline / Zero-Voltage Detection',
    passed: t3Pass,
    message: t3Pass
      ? 'Zero-voltage flatline correctly identified as disconnected electrode.'
      : 'Flatline condition was not flagged.',
    durationMs: Math.round(performance.now() - t3Start),
  });

  // Test 4: Feature Extraction & Windowed Energy Proxy
  const t4Start = performance.now();
  processor.reset();
  // Feed 60 clean alternating microvolt samples
  for (let i = 0; i < 60; i++) {
    const val = Math.sin((i / 250) * 2 * Math.PI * 10) * 25; // 10Hz Alpha rhythm (25uV)
    processor.processPacket({
      timestamp: Date.now() + i * 4,
      sampleIndex: i,
      rawVoltages: [val],
      unit: 'uV',
    });
  }
  const features = processor.extractFeatures();
  const t4Pass = features !== null && features.alphaPower > 0 && features.thetaBetaRatio > 0;
  results.push({
    name: 'Feature Extraction: Spectral Band Power & TBR Ratio',
    passed: t4Pass,
    message: t4Pass
      ? `Extracted spectral proxies: Alpha Power=${features?.alphaPower}, TBR=${features?.thetaBetaRatio}, Entropy=${features?.signalEntropy}.`
      : 'Feature extraction failed over sample window.',
    durationMs: Math.round(performance.now() - t4Start),
  });

  // Test 5: Ethical & Scientific Validation Disclaimer Enforcement
  const t5Start = performance.now();
  const focusEst = processor.estimateExperimentalFocus(features);
  const t5Pass = focusEst.isScientificallyValidated === false && focusEst.notes.includes('Not an objective medical');
  results.push({
    name: 'Transparency Guardrail: Experimental Disclaimer Flag',
    passed: t5Pass,
    message: t5Pass
      ? 'Verified: Attention estimate strictly marked as experimental proxy and non-diagnostic.'
      : 'Disclaimer flag missing from focus estimation.',
    durationMs: Math.round(performance.now() - t5Start),
  });

  // Test 6: Hardware Ingestion Layer Protocol Configuration
  const t6Start = performance.now();
  const cfg = hardwareLayer.getConfig();
  const t6Pass = cfg.baudRate > 0 && cfg.channels.length >= 1 && ['web-serial', 'websocket-bridge', 'audio-input'].includes(cfg.interfaceType);
  results.push({
    name: 'Hardware Ingestion Layer: Protocol Configuration Verified',
    passed: t6Pass,
    message: t6Pass
      ? `Modular configuration ready: Default Interface=${cfg.interfaceType}, Baud=${cfg.baudRate}, Expected Rate=${cfg.expectedSampleRateHz}Hz.`
      : 'Hardware configuration corrupted or uninitialized.',
    durationMs: Math.round(performance.now() - t6Start),
  });

  return results;
}
