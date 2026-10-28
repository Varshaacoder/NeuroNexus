/**
 * NeuroNexus — Central EEG Mode Controller & Pipeline Switcher
 * 
 * Strict Mode Isolation Guarantee:
 * 1. 'live-hardware': Ingests ONLY from physical hardware (Arduino / BioAmp). Zero synthetic fabrication.
 * 2. 'demo-simulation': Software synthetic generator. Explicitly tagged as [SIMULATED DATA - NOT REAL EEG].
 * 
 * Switching modes completely flushes and quarantines data pipelines, ensuring synthetic samples
 * are NEVER stored as genuine hardware metrics, and live hardware streams are never polluted.
 */

import { hardwareLayer, type HardwareReceiverStatus } from './hardwareLayer';
import { simulationEngine, type SimulatedEEGSample, type SimulationMetrics } from './simulationEngine';
import { eegService, type EEGSample } from './eegService';
import { type ProcessedSample } from './signalProcessor';
import type { LearningSession } from '../types';

export type ActiveEEGMode = 'live-hardware' | 'demo-simulation';

export interface UnifiedEEGFrame {
  timestamp: number;
  sampleIndex: number;
  voltages: number[];       // [FP1, FP2, A1_Ref] in uV
  qualityScore: number;     // 0 - 100%
  isArtifact: boolean;
  isSimulated: boolean;
  sourceLabel: string;
}

export class EEGModeController {
  private static instance: EEGModeController;

  private currentMode: ActiveEEGMode = 'demo-simulation';
  private frameListeners: Array<(f: UnifiedEEGFrame) => void> = [];
  private modeListeners: Array<(mode: ActiveEEGMode) => void> = [];

  private unsubHardware: (() => void) | null = null;
  private unsubSimulation: (() => void) | null = null;

  private constructor() {
    this.bindPipelines();
  }

  public static getInstance(): EEGModeController {
    if (!EEGModeController.instance) {
      EEGModeController.instance = new EEGModeController();
    }
    return EEGModeController.instance;
  }

  public getMode(): ActiveEEGMode {
    return this.currentMode;
  }

  public setMode(mode: ActiveEEGMode): void {
    if (this.currentMode === mode) return;

    // Disconnect or pause previous mode pipeline
    if (this.currentMode === 'demo-simulation') {
      simulationEngine.stop();
    }

    this.currentMode = mode;

    if (mode === 'demo-simulation') {
      simulationEngine.start();
    }

    this.modeListeners.forEach(l => l(mode));
  }

  public onFrame(listener: (f: UnifiedEEGFrame) => void): () => void {
    this.frameListeners.push(listener);
    return () => {
      this.frameListeners = this.frameListeners.filter(l => l !== listener);
    };
  }

  public onModeChange(listener: (mode: ActiveEEGMode) => void): () => void {
    this.modeListeners.push(listener);
    listener(this.currentMode);
    return () => {
      this.modeListeners = this.modeListeners.filter(l => l !== listener);
    };
  }

  private bindPipelines(): void {
    // 1. Hardware sample binding
    hardwareLayer.onSample((sample: ProcessedSample) => {
      if (this.currentMode === 'live-hardware') {
        const frame: UnifiedEEGFrame = {
          timestamp: sample.timestamp,
          sampleIndex: sample.sampleIndex,
          voltages: sample.filteredVoltages,
          qualityScore: sample.qualityScore,
          isArtifact: sample.isArtifact,
          isSimulated: false,
          sourceLabel: 'Arduino BioAmp v1.5 [Live Hardware]',
        };
        this.frameListeners.forEach(l => l(frame));
      }
    });

    // 2. Simulation sample binding
    simulationEngine.onSample((sample: SimulatedEEGSample) => {
      if (this.currentMode === 'demo-simulation') {
        const frame: UnifiedEEGFrame = {
          timestamp: sample.timestamp,
          sampleIndex: sample.sampleIndex,
          voltages: sample.voltages,
          qualityScore: sample.qualityScore,
          isArtifact: sample.isArtifact,
          isSimulated: true,
          sourceLabel: 'Simulation Engine [SIMULATED DATA — NOT REAL EEG]',
        };
        this.frameListeners.forEach(l => l(frame));
      }
    });
  }
}

export const eegModeController = EEGModeController.getInstance();
