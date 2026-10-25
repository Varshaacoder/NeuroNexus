/**
 * NeuroNexus — Synthetic EEG Simulation Engine
 * 
 * Generates physiologically plausible synthetic EEG-like signals in software:
 * - Multi-frequency composition: Delta (1-3Hz), Theta (4-7Hz), Alpha (8-12Hz), Beta (13-30Hz), Gamma (30-45Hz)
 * - Dynamic cognitive state transitions: "Baseline Wakefulness", "Deep Focus", "Fatigue / Mind Wandering", "High Cognitive Load"
 * - Configurable parameters: amplitude (10-150 uV), noise level, dominant rhythm
 * - Controlled physiological eye blink artifacts (occasional positive frontal deflections)
 * - Clear metadata tagging: All samples & reports explicitly labeled as SIMULATED / DEMO DATA
 */

export type SimulationCognitiveState = 'focus' | 'relaxation' | 'fatigue' | 'overload';

export interface SimulationParams {
  samplingRateHz: number;          // e.g. 250 Hz
  baseAmplitudeUv: number;         // e.g. 25 uV typical scalp EEG
  noiseLevelPercent: number;       // 0 - 50%
  dominantState: SimulationCognitiveState;
  generateBlinks: boolean;
  frequencyShiftHz: number;        // fine frequency tuning
}

export interface SimulatedEEGSample {
  timestamp: number;
  sampleIndex: number;
  voltages: number[];              // [FP1, FP2, A1_Ref] in microvolts
  qualityScore: number;            // 0 - 100%
  isArtifact: boolean;
  artifactType?: 'blink' | 'drift' | 'noise';
  currentPhase: SimulationCognitiveState;
  isSimulated: true;               // Immutable flag
}

export interface SimulationMetrics {
  elapsedSeconds: number;
  sampleCount: number;
  estimatedAttention: number;      // 0 - 100% (illustrative synthetic estimate)
  simulatedThetaBetaRatio: number; // e.g. 1.25 - 1.85
  dominantBand: 'Alpha (10Hz)' | 'Beta (18Hz)' | 'Theta (6Hz)';
}

export class EEGSimulationEngine {
  private static instance: EEGSimulationEngine;

  private params: SimulationParams = {
    samplingRateHz: 250,
    baseAmplitudeUv: 25,
    noiseLevelPercent: 12,
    dominantState: 'focus',
    generateBlinks: true,
    frequencyShiftHz: 0,
  };

  private isRunning = false;
  private isPaused = false;
  private timerId: any = null;
  private sampleCounter = 0;
  private sessionStartMs = 0;
  private pauseStartMs = 0;
  private totalPausedMs = 0;

  // Signal phase accumulators for clean sinusoidal superposition
  private phaseDelta = 0;
  private phaseTheta = 0;
  private phaseAlpha = 0;
  private phaseBeta = 0;
  private phaseGamma = 0;

  // Blink artifact generator state
  private blinkSamplesRemaining = 0;
  private blinkAmplitude = 0;

  // Listeners
  private sampleListeners: Array<(s: SimulatedEEGSample) => void> = [];
  private metricsListeners: Array<(m: SimulationMetrics) => void> = [];

  private constructor() {}

  public static getInstance(): EEGSimulationEngine {
    if (!EEGSimulationEngine.instance) {
      EEGSimulationEngine.instance = new EEGSimulationEngine();
    }
    return EEGSimulationEngine.instance;
  }

  public getParams(): SimulationParams {
    return { ...this.params };
  }

  public updateParams(newParams: Partial<SimulationParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  public onSample(cb: (s: SimulatedEEGSample) => void): () => void {
    this.sampleListeners.push(cb);
    return () => {
      this.sampleListeners = this.sampleListeners.filter(l => l !== cb);
    };
  }

  public onMetrics(cb: (m: SimulationMetrics) => void): () => void {
    this.metricsListeners.push(cb);
    return () => {
      this.metricsListeners = this.metricsListeners.filter(l => l !== cb);
    };
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public isSuspended(): boolean {
    return this.isPaused;
  }

  public start(): void {
    if (this.isRunning && !this.isPaused) return;

    if (this.isPaused) {
      this.totalPausedMs += Date.now() - this.pauseStartMs;
      this.isPaused = false;
    } else {
      this.isRunning = true;
      this.isPaused = false;
      this.sampleCounter = 0;
      this.sessionStartMs = Date.now();
      this.totalPausedMs = 0;
    }

    // Interval batch generator: 25ms tick generates ~6 samples (for 250Hz) to maintain smooth browser performance
    const batchIntervalMs = 24;
    const samplesPerTick = Math.round((this.params.samplingRateHz * batchIntervalMs) / 1000);

    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.isPaused) return;
      for (let i = 0; i < samplesPerTick; i++) {
        this.generateNextSample();
      }
      this.broadcastMetrics();
    }, batchIntervalMs);
  }

  public pause(): void {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.pauseStartMs = Date.now();
  }

  public resume(): void {
    if (this.isRunning && this.isPaused) {
      this.start();
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  public reset(): void {
    this.stop();
    this.sampleCounter = 0;
    this.phaseDelta = 0;
    this.phaseTheta = 0;
    this.phaseAlpha = 0;
    this.phaseBeta = 0;
    this.phaseGamma = 0;
    this.blinkSamplesRemaining = 0;
    this.broadcastMetrics();
  }

  /**
   * Generates a single continuous synthetic sample across multi-band wave superposition
   */
  private generateNextSample(): void {
    const fs = this.params.samplingRateHz;
    const dt = 1.0 / fs;
    this.sampleCounter++;

    // Band frequencies (with optional user fine-tuning)
    const fDelta = 2.0;
    const fTheta = 5.5 + this.params.frequencyShiftHz;
    const fAlpha = 10.0 + this.params.frequencyShiftHz;
    const fBeta = 18.0 + this.params.frequencyShiftHz;
    const fGamma = 35.0;

    // Amplitude weights based on simulated cognitive state
    let wDelta = 0.2;
    let wTheta = 0.3;
    let wAlpha = 0.4;
    let wBeta = 0.7;
    let wGamma = 0.1;

    switch (this.params.dominantState) {
      case 'focus':
        // High Beta (analytical processing), lower Alpha & Theta
        wBeta = 0.85;
        wAlpha = 0.25;
        wTheta = 0.25;
        break;
      case 'relaxation':
        // High Alpha (relaxed wakefulness, 10Hz rhythm), low Beta
        wAlpha = 0.95;
        wBeta = 0.2;
        wTheta = 0.3;
        break;
      case 'fatigue':
        // High Theta (drowsiness, mind wandering), suppressed Beta
        wTheta = 0.85;
        wBeta = 0.2;
        wAlpha = 0.4;
        break;
      case 'overload':
        // Desynchronized high Beta and Gamma with elevated amplitude variance
        wBeta = 0.95;
        wGamma = 0.4;
        wAlpha = 0.15;
        break;
    }

    // Update continuous sinusoidal phases
    this.phaseDelta += 2 * Math.PI * fDelta * dt;
    this.phaseTheta += 2 * Math.PI * fTheta * dt;
    this.phaseAlpha += 2 * Math.PI * fAlpha * dt;
    this.phaseBeta += 2 * Math.PI * fBeta * dt;
    this.phaseGamma += 2 * Math.PI * fGamma * dt;

    // Base bio-potential synthesis (uV)
    const baseAmp = this.params.baseAmplitudeUv;
    let rawEEG =
      (Math.sin(this.phaseDelta) * wDelta +
        Math.sin(this.phaseTheta) * wTheta +
        Math.sin(this.phaseAlpha) * wAlpha +
        Math.sin(this.phaseBeta) * wBeta +
        Math.sin(this.phaseGamma) * wGamma) * baseAmp;

    // Add white Gaussian / pink noise
    const noiseFactor = (this.params.noiseLevelPercent / 100) * baseAmp;
    const noise = (Math.random() - 0.5) * 2 * noiseFactor;
    rawEEG += noise;

    // Occasional realistic eye blink artifact (large positive peak 80-160 uV lasting ~200ms)
    let isArtifact = false;
    let artifactType: SimulatedEEGSample['artifactType'] = undefined;

    if (this.params.generateBlinks && this.blinkSamplesRemaining <= 0) {
      // 0.4% chance per sample to initiate an eye blink (roughly once every 1-3 seconds)
      if (Math.random() < 0.003) {
        this.blinkSamplesRemaining = Math.round(fs * 0.25); // 250ms duration
        this.blinkAmplitude = 90 + Math.random() * 50;
      }
    }

    if (this.blinkSamplesRemaining > 0) {
      const progress = 1 - this.blinkSamplesRemaining / Math.round(fs * 0.25);
      // Half-sine bell curve envelope
      const blinkShape = Math.sin(progress * Math.PI);
      rawEEG += blinkShape * this.blinkAmplitude;
      this.blinkSamplesRemaining--;
      isArtifact = true;
      artifactType = 'blink';
    }

    const fp1Val = Math.round(rawEEG * 10) / 10;
    // FP2 with minor natural hemispheric variation (+/- 2uV)
    const fp2Val = Math.round((rawEEG * 0.95 + (Math.random() - 0.5) * 3) * 10) / 10;
    const refVal = 0.0;

    const sample: SimulatedEEGSample = {
      timestamp: Date.now(),
      sampleIndex: this.sampleCounter,
      voltages: [fp1Val, fp2Val, refVal],
      qualityScore: isArtifact ? 45 : Math.round(98 - this.params.noiseLevelPercent * 0.8),
      isArtifact,
      artifactType,
      currentPhase: this.params.dominantState,
      isSimulated: true,
    };

    this.sampleListeners.forEach(l => l(sample));
  }

  private broadcastMetrics(): void {
    const elapsedMs = Math.max(0, Date.now() - this.sessionStartMs - this.totalPausedMs);
    const elapsedSeconds = Math.round(elapsedMs / 1000);

    let attention = 84;
    let tbr = 1.32;
    let dominant: SimulationMetrics['dominantBand'] = 'Beta (18Hz)';

    switch (this.params.dominantState) {
      case 'focus':
        attention = 88;
        tbr = 1.25;
        dominant = 'Beta (18Hz)';
        break;
      case 'relaxation':
        attention = 72;
        tbr = 1.48;
        dominant = 'Alpha (10Hz)';
        break;
      case 'fatigue':
        attention = 54;
        tbr = 1.82;
        dominant = 'Theta (6Hz)';
        break;
      case 'overload':
        attention = 68;
        tbr = 1.38;
        dominant = 'Beta (18Hz)';
        break;
    }

    const metrics: SimulationMetrics = {
      elapsedSeconds,
      sampleCount: this.sampleCounter,
      estimatedAttention: attention,
      simulatedThetaBetaRatio: tbr,
      dominantBand: dominant,
    };

    this.metricsListeners.forEach(l => l(metrics));
  }
}

export const simulationEngine = EEGSimulationEngine.getInstance();
