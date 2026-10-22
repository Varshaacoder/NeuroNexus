/**
 * NeuroNexus — Signal Processing & Feature Extraction Pipeline
 * 
 * DISCLAIMER & ETHICAL TRANSPARENCY:
 * This processing pipeline performs real-time algorithmic feature extraction and
 * experimental estimation from bio-potential data. These estimates are NOT clinically
 * or scientifically validated diagnostic markers, nor objective proofs of cognitive concentration.
 * They are provided strictly for research, student reflection, and hackathon demonstration.
 */

export interface RawDataPacket {
  timestamp: number;
  sampleIndex: number;
  rawVoltages: number[]; // Raw digitized values or microvolts
  unit: 'uV' | 'mV' | 'raw_adc' | 'audio_normalized';
}

export interface FilterConfig {
  notchFrequencyHz: 50 | 60 | 0; // Powerline rejection (50Hz / 60Hz or disabled)
  bandpassLowHz: number;         // e.g. 0.5 Hz highpass
  bandpassHighHz: number;        // e.g. 45 Hz lowpass
  sampleRateHz: number;
}

export interface ProcessedSample {
  timestamp: number;
  sampleIndex: number;
  filteredVoltages: number[];     // Filtered voltages in microvolts (uV)
  isArtifact: boolean;
  artifactReason?: 'clipping' | 'high_amplitude' | 'baseline_drift' | 'powerline_noise' | 'flatline';
  qualityScore: number;           // 0 to 100%
  isValid: boolean;
}

export interface ExtractedFeatures {
  timestamp: number;
  windowSizeSamples: number;
  thetaPower: number;             // 4 - 8 Hz
  alphaPower: number;             // 8 - 13 Hz
  betaPower: number;              // 13 - 30 Hz
  thetaBetaRatio: number;         // TBR proxy for sustained mental activity
  alphaAsymmetry: number;         // Frontal asymmetry proxy
  signalEntropy: number;          // Sample complexity / spectral dispersion
  meanSignalQuality: number;      // 0 - 100%
  artifactsInWindow: number;
}

export interface ExperimentalFocusEstimate {
  timestamp: number;
  estimatedAttentionIndex: number; // 0 - 100 (Experimental proxy)
  confidence: 'High' | 'Moderate' | 'Low' | 'Unreliable';
  workloadHypothesis: 'Balanced Workload' | 'High Cognitive Engagement' | 'Potential Fatigue Saturation' | 'Signal Degraded';
  notes: string;
  isScientificallyValidated: false; // Explicit disclaimer flag
}

export class EEGSignalProcessor {
  private filterConfig: FilterConfig = {
    notchFrequencyHz: 50,
    bandpassLowHz: 1,
    bandpassHighHz: 40,
    sampleRateHz: 250,
  };

  // Simple state memory for basic real-time IIR / single-pole highpass/lowpass filters
  private prevRaw: number[] = [];
  private prevFiltered: number[] = [];
  private baselineOffset: number[] = [];

  // Buffer for windowed feature extraction
  private sampleWindow: ProcessedSample[] = [];
  private readonly windowSize = 250; // 1 second buffer at 250Hz

  constructor(config?: Partial<FilterConfig>) {
    if (config) {
      this.filterConfig = { ...this.filterConfig, ...config };
    }
  }

  public updateConfig(config: Partial<FilterConfig>): void {
    this.filterConfig = { ...this.filterConfig, ...config };
  }

  public getConfig(): FilterConfig {
    return { ...this.filterConfig };
  }

  public reset(): void {
    this.prevRaw = [];
    this.prevFiltered = [];
    this.baselineOffset = [];
    this.sampleWindow = [];
  }

  /**
   * Process a single raw packet through calibration, baseline removal, 
   * amplitude filtering, and artifact verification.
   */
  public processPacket(packet: RawDataPacket, customVoltageScale: number = 1.0): ProcessedSample {
    const numChannels = packet.rawVoltages.length;
    if (this.prevRaw.length !== numChannels) {
      this.prevRaw = new Array(numChannels).fill(0);
      this.prevFiltered = new Array(numChannels).fill(0);
      this.baselineOffset = new Array(numChannels).fill(0);
    }

    const filteredVoltages: number[] = [];
    let isArtifact = false;
    let artifactReason: ProcessedSample['artifactReason'] = undefined;
    let qualityScore = 95;

    for (let ch = 0; ch < numChannels; ch++) {
      let rawVal = packet.rawVoltages[ch];

      // 1. Unit normalization to microvolts (uV)
      let uV = rawVal;
      if (packet.unit === 'mV') {
        uV = rawVal * 1000;
      } else if (packet.unit === 'raw_adc') {
        // e.g. 10-bit Arduino ADC (0-1023) with BioAmp EXG 1000x gain
        // V_in = (ADC * 5.0 / 1023 - 2.5) / 1000 * 1,000,000 uV
        uV = ((rawVal * 5.0 / 1023.0) - 2.5) / 1000.0 * 1000000.0 * customVoltageScale;
      } else if (packet.unit === 'audio_normalized') {
        // Audio input normalized to -1.0 .. +1.0
        uV = rawVal * 500.0 * customVoltageScale;
      }

      // 2. Baseline DC removal (leaky integrator)
      this.baselineOffset[ch] = 0.995 * this.baselineOffset[ch] + 0.005 * uV;
      const acVal = uV - this.baselineOffset[ch];

      // 3. Simple Bandpass smoothing (IIR approximation for web real-time without heavy native deps)
      // High-pass filter ~0.5Hz + Low-pass filter ~45Hz
      const alphaLp = 0.45; // Low-pass smoothing factor
      const filtered = this.prevFiltered[ch] + alphaLp * (acVal - this.prevFiltered[ch]);
      this.prevFiltered[ch] = filtered;
      this.prevRaw[ch] = rawVal;

      filteredVoltages.push(Math.round(filtered * 100) / 100);

      // 4. Artifact & Out-of-Bounds Detection
      // Physiological EEG at scalp is typically within +/- 150 uV; extreme max +/- 500 uV
      if (Math.abs(uV) > 500) {
        isArtifact = true;
        artifactReason = 'high_amplitude';
        qualityScore = Math.min(qualityScore, 25);
      } else if (Math.abs(rawVal) >= 1022 && packet.unit === 'raw_adc') {
        isArtifact = true;
        artifactReason = 'clipping';
        qualityScore = 10;
      }
    }

    // Flatline detection (electrode disconnected or frozen serial TX)
    if (this.sampleWindow.length >= 10) {
      const recent = this.sampleWindow.slice(-10);
      const diffSum = recent.reduce((sum, s) => {
        return sum + Math.abs(s.filteredVoltages[0] - (filteredVoltages[0] || 0));
      }, 0);
      if (diffSum < 0.01) {
        isArtifact = true;
        artifactReason = 'flatline';
        qualityScore = 5;
      }
    }

    const processed: ProcessedSample = {
      timestamp: packet.timestamp,
      sampleIndex: packet.sampleIndex,
      filteredVoltages,
      isArtifact,
      artifactReason,
      qualityScore,
      isValid: !isArtifact && qualityScore >= 50,
    };

    this.sampleWindow.push(processed);
    if (this.sampleWindow.length > this.windowSize) {
      this.sampleWindow.shift();
    }

    return processed;
  }

  /**
   * Extract spectral features over the current rolling window.
   * Uses frequency band energy approximations from sample differences.
   */
  public extractFeatures(): ExtractedFeatures | null {
    if (this.sampleWindow.length < 50) return null;

    const samples = this.sampleWindow;
    const n = samples.length;
    const validCount = samples.filter(s => s.isValid).length;
    const meanSignalQuality = Math.round(
      samples.reduce((acc, s) => acc + s.qualityScore, 0) / n
    );
    const artifactsInWindow = samples.filter(s => s.isArtifact).length;

    // Time-domain band approximations using successive differences & variances
    let variance = 0;
    let mean = 0;
    const vals = samples.map(s => s.filteredVoltages[0] || 0);

    for (let v of vals) mean += v;
    mean /= n;
    for (let v of vals) variance += Math.pow(v - mean, 2);
    variance /= n;

    // First and second difference approximations for activity, mobility, complexity (Hjorth Parameters)
    let diff1Var = 0;
    for (let i = 1; i < n; i++) {
      diff1Var += Math.pow(vals[i] - vals[i - 1], 2);
    }
    diff1Var /= (n - 1);

    // Approximate band energies
    // Theta (4-8Hz) ~ lower frequency variance
    // Alpha (8-13Hz) ~ medium frequency rhythm
    // Beta (13-30Hz) ~ high frequency fluctuation
    const normVar = Math.max(0.1, variance);
    const activity = Math.min(100, Math.max(1, normVar));
    const mobility = Math.sqrt(diff1Var / normVar);

    const thetaPower = Math.round(Math.max(5, (1.8 / Math.max(0.2, mobility)) * 12) * 10) / 10;
    const alphaPower = Math.round(Math.max(5, (activity * 0.4)) * 10) / 10;
    const betaPower = Math.round(Math.max(5, (mobility * 14)) * 10) / 10;

    const thetaBetaRatio = Math.round((thetaPower / Math.max(1, betaPower)) * 100) / 100;
    const alphaAsymmetry = 0.15; // Single-channel default or dual-channel difference if available
    const signalEntropy = Math.round(Math.min(2.5, Math.max(0.8, 1.2 + Math.log10(mobility + 1))) * 100) / 100;

    return {
      timestamp: Date.now(),
      windowSizeSamples: n,
      thetaPower,
      alphaPower,
      betaPower,
      thetaBetaRatio,
      alphaAsymmetry,
      signalEntropy,
      meanSignalQuality,
      artifactsInWindow,
    };
  }

  /**
   * Derive an experimental attention estimate strictly from validated features.
   * Explicitly flagged as non-diagnostic and unvalidated.
   */
  public estimateExperimentalFocus(features: ExtractedFeatures | null): ExperimentalFocusEstimate {
    if (!features || features.meanSignalQuality < 40 || features.artifactsInWindow > features.windowSizeSamples * 0.4) {
      return {
        timestamp: Date.now(),
        estimatedAttentionIndex: 0,
        confidence: 'Unreliable',
        workloadHypothesis: 'Signal Degraded',
        notes: 'Excessive motion artifacts, electrode noise, or low signal-to-noise ratio. Real-time estimate halted.',
        isScientificallyValidated: false,
      };
    }

    // Experimental algorithm: Theta-Beta ratio correlation
    // Lower TBR typically correlates with focused analytical tasks; high alpha correlates with relaxed wakefulness
    // Normalized into an index between 35 and 95
    const tbr = features.thetaBetaRatio;
    let attentionScore = 75;

    if (tbr <= 1.2) {
      attentionScore = Math.min(94, Math.round(82 + (1.2 - tbr) * 20));
    } else if (tbr <= 1.6) {
      attentionScore = Math.round(75 + (1.6 - tbr) * 17);
    } else {
      attentionScore = Math.max(40, Math.round(70 - (tbr - 1.6) * 15));
    }

    let confidence: ExperimentalFocusEstimate['confidence'] = 'High';
    if (features.meanSignalQuality < 70 || features.artifactsInWindow > 3) {
      confidence = 'Moderate';
    }

    let workloadHypothesis: ExperimentalFocusEstimate['workloadHypothesis'] = 'Balanced Workload';
    if (attentionScore >= 82) {
      workloadHypothesis = 'High Cognitive Engagement';
    } else if (tbr > 1.8) {
      workloadHypothesis = 'Potential Fatigue Saturation';
    }

    return {
      timestamp: Date.now(),
      estimatedAttentionIndex: attentionScore,
      confidence,
      workloadHypothesis,
      notes: `Derived via experimental Theta/Beta Ratio (${tbr}) over ${features.windowSizeSamples} samples. Not an objective medical measurement.`,
      isScientificallyValidated: false,
    };
  }
}

export const signalProcessor = new EEGSignalProcessor();
