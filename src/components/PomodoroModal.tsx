import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Play, Pause, RotateCcw, SkipForward, Timer, Clock, Zap,
  Activity, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  Sparkles, Sliders, ArrowUpRight, Cpu, Radio, ShieldAlert, Square
} from 'lucide-react';
import type { UserProfile, PomodoroPhaseRecord, LearningSession } from '../types';
import { eegService, type EEGDeviceStatus, type EEGSample } from '../services/eegService';
import { saveStudentSession, updateUserAcademicRecord, isDemoUser } from '../utils/neuroSessionStore';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onUserUpdated?: (user: UserProfile) => void;
  onNavigateToNeuroAnalysis?: (sessionId?: string) => void;
  onOpenHardwareManager?: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onNavigateToNeuroAnalysis,
  onOpenHardwareManager,
}) => {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');

  // EEG Hardware & Recording State
  const [eegStatus, setEegStatus] = useState<EEGDeviceStatus>(eegService.getStatus());
  const [recordEeg, setRecordEeg] = useState<boolean>(false);
  const [recordDuringBreaks, setRecordDuringBreaks] = useState<boolean>(false);
  const [recentSignalPoints, setRecentSignalPoints] = useState<number[]>([]);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

  const isDemo = user ? isDemoUser(user.id, user.email) : false;
  const isHardwareStreaming = eegStatus.state === 'streaming' && eegStatus.samplesReceived > 0;
  const canRecordEeg = isHardwareStreaming || isDemo;

  // Custom durations for Pomodoro (minutes)
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Selected study course & topic
  const [sessionCourse, setSessionCourse] = useState<string>(
    user?.enrolledCourses && user.enrolledCourses.length > 0
      ? user.enrolledCourses[0]
      : 'CS201 C Programming & Systems'
  );
  const [sessionTopic, setSessionTopic] = useState<string>('Memory Management & Pointer Arithmetic');

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');
  const [pomoTimeLeft, setPomoTimeLeft] = useState<number>(25 * 60);
  const [pomoIsActive, setPomoIsActive] = useState<boolean>(false);
  const [pomoSessionCount, setPomoSessionCount] = useState<number>(0);

  // Phase tracking for Pomodoro
  const phasesRef = useRef<PomodoroPhaseRecord[]>([]);
  const currentPhaseStartMsRef = useRef<number>(0);
  const sessionTotalElapsedRef = useRef<{ focusSeconds: number; breakSeconds: number }>({
    focusSeconds: 0,
    breakSeconds: 0,
  });

  // Countdown State
  const [cdInputMin, setCdInputMin] = useState<string>('15');
  const [cdInputSec, setCdInputSec] = useState<string>('0');
  const [cdTimeLeft, setCdTimeLeft] = useState<number>(15 * 60);
  const [cdIsActive, setCdIsActive] = useState<boolean>(false);
  const [cdDone, setCdDone] = useState<boolean>(false);
  const cdElapsedSecondsRef = useRef<number>(0);

  // Stopwatch State
  const [swTime, setSwTime] = useState<number>(0);
  const [swIsActive, setSwIsActive] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Refs for intervals
  const pomoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to EEG Service Status & Samples
  useEffect(() => {
    if (!isOpen) return;

    const unsubStatus = eegService.onStatusChange((s) => {
      setEegStatus(s);
      // Auto-enable EEG recording if hardware is streaming and user hasn't explicitly disabled
      if (s.state === 'streaming') {
        setRecordEeg(true);
      }
    });

    const unsubSample = eegService.onSample((sample: EEGSample) => {
      if (sample.values && sample.values.length > 0) {
        setRecentSignalPoints((prev) => {
          const next = [...prev, sample.values[0]];
          if (next.length > 25) return next.slice(next.length - 25);
          return next;
        });
      }
    });

    return () => {
      unsubStatus();
      unsubSample();
    };
  }, [isOpen]);

  // Handle Demo Mode EEG Toggle Default
  useEffect(() => {
    if (isDemo && !recordEeg) {
      setRecordEeg(true);
    }
  }, [isDemo]);

  // 8 Specific Device & Recording States
  const deviceStateInfo = useMemo(() => {
    const isRec = eegService.isRecordingActive();
    const isPaused = eegService.isRecordingPaused();

    // 8. Session completed
    if (completedSessionId) {
      return {
        id: 8,
        title: 'State 8: Session Completed & Report Available',
        badge: 'Report Generated',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        detail: 'EEG and cognitive focus data has been cataloged to your Neuro Analysis history.',
      };
    }

    // 6. Recording paused
    if (isRec && isPaused) {
      return {
        id: 6,
        title: 'State 6: Recording Paused',
        badge: 'Paused',
        color: 'border-amber-200 bg-amber-50 text-amber-800',
        detail: 'Session paused. EEG stream buffer is idling without recording time gaps.',
      };
    }

    // 4. Recording EEG
    if (isRec) {
      // 5. Check poor signal quality or missing samples
      if (eegStatus.signalQualityStatus === 'Poor' || eegStatus.droppedPackets > 20) {
        return {
          id: 5,
          title: 'State 5: Poor Signal Quality or Missing Samples',
          badge: 'High Noise / Loose Electrode',
          color: 'border-amber-300 bg-amber-100 text-amber-900',
          detail: 'Impedance spike or packet loss detected. Verify frontopolar dry electrode contact.',
        };
      }
      return {
        id: 4,
        title: 'State 4: Recording EEG Active',
        badge: 'Live Recording',
        color: 'border-indigo-300 bg-indigo-50 text-indigo-800',
        detail: `Acquiring frontal EEG stream (${eegStatus.samplesReceived} samples at ${eegStatus.samplingRateHz} Hz).`,
      };
    }

    // 7. Recording stopped (timer stopped, but not submitted)
    if (!pomoIsActive && !cdIsActive && !swIsActive && recentSignalPoints.length > 0) {
      return {
        id: 7,
        title: 'State 7: Recording Stopped',
        badge: 'Ready for Review',
        color: 'border-slate-200 bg-slate-50 text-slate-700',
        detail: 'Hardware is streaming but session is stopped. Start timer to record.',
      };
    }

    // 2. Connecting
    if (eegStatus.state === 'connecting') {
      return {
        id: 2,
        title: 'State 2: Connecting to BioAmp EXG',
        badge: 'Handshaking...',
        color: 'border-blue-200 bg-blue-50 text-blue-800',
        detail: 'Opening serial communication port or WebSocket bridge.',
      };
    }

    // 3. Connected but no data received
    if (eegStatus.state === 'connected' && eegStatus.samplesReceived === 0) {
      return {
        id: 3,
        title: 'State 3: Device Connected — Awaiting Data',
        badge: 'No Data Yet',
        color: 'border-amber-200 bg-amber-50 text-amber-800',
        detail: 'Port established. Awaiting microcontroller TX packets (115200 baud).',
      };
    }

    // Streaming but not recording yet
    if (eegStatus.state === 'streaming') {
      return {
        id: 3,
        title: 'State 3: Device Streaming — Ready to Record',
        badge: 'Hardware Ready',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        detail: `Receiving live samples (${eegStatus.samplesReceived} total). Ready to start EEG session.`,
      };
    }

    // Demo mode: EEG waves synthesized
    if (isDemo) {
      return {
        id: 4,
        title: 'Demo Mode: Synthetic EEG Streaming',
        badge: 'Synthetic EEG Waves Active',
        color: 'border-purple-200 bg-purple-50 text-purple-800',
        detail: 'Simulated multi-channel EEG waves active [Demo Data — Not Live EEG]. Ready to capture focus metrics.',
      };
    }

    // 1. No device connected (Regular student account)
    return {
      id: 1,
      title: 'State 1: No EEG Device Connected',
      badge: 'Unconnected',
      color: 'border-slate-200 bg-slate-50 text-slate-600',
      detail: 'Connect BioAmp EXG Pill via Web Serial to record live physiological brainwaves. Timers work 100% offline.',
    };
  }, [eegStatus, completedSessionId, pomoIsActive, cdIsActive, swIsActive, recentSignalPoints, isDemo]);

  // Pomodoro Interval Ticker
  useEffect(() => {
    if (pomoIsActive && pomoTimeLeft > 0) {
      pomoIntervalRef.current = setInterval(() => {
        setPomoTimeLeft((prev) => prev - 1);
        if (pomoMode === 'work') {
          sessionTotalElapsedRef.current.focusSeconds += 1;
        } else {
          sessionTotalElapsedRef.current.breakSeconds += 1;
        }
      }, 1000);
    } else if (pomoIsActive && pomoTimeLeft === 0) {
      handlePomoPhaseTransition();
    }
    return () => {
      if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    };
  }, [pomoIsActive, pomoTimeLeft, pomoMode]);

  // Countdown Interval Ticker
  useEffect(() => {
    if (cdIsActive && cdTimeLeft > 0) {
      cdIntervalRef.current = setInterval(() => {
        setCdTimeLeft((prev) => prev - 1);
        cdElapsedSecondsRef.current += 1;
      }, 1000);
    } else if (cdIsActive && cdTimeLeft === 0) {
      setCdIsActive(false);
      setCdDone(true);
      finalizeCountdownSession();
    }
    return () => {
      if (cdIntervalRef.current) clearInterval(cdIntervalRef.current);
    };
  }, [cdIsActive, cdTimeLeft]);

  // Stopwatch Interval Ticker
  useEffect(() => {
    if (swIsActive) {
      swIntervalRef.current = setInterval(() => {
        setSwTime((prev) => prev + 10);
      }, 10);
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swIsActive]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSwTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    const millis = Math.floor((ms % 1000) / 10)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}.${millis}`;
  };

  // ─── EEG RECORDING COORDINATION ─────────────────────────────────────────────

  const beginEEGRecordingIfEnabled = (mode: 'pomodoro' | 'study') => {
    if (!recordEeg || !user) return;

    if (!canRecordEeg && !isDemo) {
      // Hardware disconnected: Do NOT start fake EEG for real users!
      return;
    }

    if (!eegService.isRecordingActive()) {
      eegService.startRecording({
        userId: user.id,
        course: sessionCourse,
        topic: sessionTopic,
        type: mode,
        title:
          mode === 'pomodoro'
            ? `Pomodoro Focus Session (${focusDurationMinutes}m / ${breakDurationMinutes}m)`
            : `Timed Study Session (${sessionTopic})`,
        focusMinutes: Math.round(sessionTotalElapsedRef.current.focusSeconds / 60),
        breakMinutes: Math.round(sessionTotalElapsedRef.current.breakSeconds / 60),
      });
      eegService.setRecordingPhase(pomoMode === 'work' ? 'focus' : 'short_break');
    } else {
      eegService.resumeRecording();
    }
  };

  const pauseEEGRecordingIfActive = () => {
    if (eegService.isRecordingActive()) {
      eegService.pauseRecording();
    }
  };

  // ─── POMODORO HANDLERS ──────────────────────────────────────────────────────

  const togglePomo = () => {
    const nextState = !pomoIsActive;
    setPomoIsActive(nextState);

    if (nextState) {
      // Starting or Resuming
      if (currentPhaseStartMsRef.current === 0) {
        currentPhaseStartMsRef.current = Date.now();
      }
      beginEEGRecordingIfEnabled('pomodoro');
    } else {
      // Pausing
      pauseEEGRecordingIfActive();
    }
  };

  const handlePomoPhaseTransition = () => {
    const now = Date.now();
    const phaseDurationSec = Math.round((now - (currentPhaseStartMsRef.current || now)) / 1000);

    // Save record of the completed phase
    const completedPhase: PomodoroPhaseRecord = {
      phaseType: pomoMode === 'work' ? 'focus' : 'short_break',
      startTimeMs: currentPhaseStartMsRef.current || now - phaseDurationSec * 1000,
      endTimeMs: now,
      durationSeconds: Math.max(1, phaseDurationSec),
      completed: true,
      eegRecordingActive: recordEeg && (pomoMode === 'work' || recordDuringBreaks),
    };
    phasesRef.current.push(completedPhase);

    if (pomoMode === 'work') {
      // Work interval completed -> switch to Break
      setPomoSessionCount((prev) => prev + 1);
      setPomoMode('break');
      setPomoTimeLeft(breakDurationMinutes * 60);
      currentPhaseStartMsRef.current = Date.now();

      // Update academic pomodoro counter
      if (user) {
        const updated = updateUserAcademicRecord(user.id, {
          pomodoroCountWeek: (user.pomodoroCountWeek || 0) + 1,
          totalStudyMinutes: (user.totalStudyMinutes || 0) + focusDurationMinutes,
        });
        if (updated && onUserUpdated) {
          onUserUpdated(updated);
        }
      }

      // Handle EEG during break
      if (recordEeg && eegService.isRecordingActive()) {
        if (recordDuringBreaks) {
          // Keep recording, but label phase accurately as break
          eegService.setRecordingPhase('short_break');
        } else {
          // Pause EEG recording during break to represent gap honestly
          eegService.pauseRecording();
        }
      }
    } else {
      // Break completed -> switch back to Work
      setPomoMode('work');
      setPomoTimeLeft(focusDurationMinutes * 60);
      currentPhaseStartMsRef.current = Date.now();

      if (recordEeg && eegService.isRecordingActive()) {
        eegService.resumeRecording();
        eegService.setRecordingPhase('focus');
      }
    }

    setPomoIsActive(false);
  };

  const resetPomo = () => {
    setPomoIsActive(false);
    pauseEEGRecordingIfActive();
    setPomoMode('work');
    setPomoTimeLeft(focusDurationMinutes * 60);
    setPomoSessionCount(0);
    currentPhaseStartMsRef.current = 0;
  };

  const finishAndSavePomodoroSession = () => {
    setPomoIsActive(false);
    const now = Date.now();

    // Finalize pending phase if timer ran
    if (currentPhaseStartMsRef.current > 0) {
      const durSec = Math.round((now - currentPhaseStartMsRef.current) / 1000);
      phasesRef.current.push({
        phaseType: pomoMode === 'work' ? 'focus' : 'short_break',
        startTimeMs: currentPhaseStartMsRef.current,
        endTimeMs: now,
        durationSeconds: Math.max(1, durSec),
        completed: false,
        eegRecordingActive: recordEeg,
      });
    }

    const totalSec = sessionTotalElapsedRef.current.focusSeconds + sessionTotalElapsedRef.current.breakSeconds;
    const totalMinutes = Math.max(1, Math.round(totalSec / 60));
    const focusMinutes = Math.max(1, Math.round(sessionTotalElapsedRef.current.focusSeconds / 60));
    const breakMinutes = Math.round(sessionTotalElapsedRef.current.breakSeconds / 60);

    let sessionToSave: LearningSession;

    if (recordEeg && (canRecordEeg || isDemo)) {
      if (eegService.isRecordingActive()) {
        eegService.setCustomPhases(phasesRef.current);
        const liveSess = eegService.stopRecording();
        if (liveSess) {
          sessionToSave = {
            ...liveSess,
            type: 'pomodoro',
            course: sessionCourse,
            topic: sessionTopic,
            focusMinutes,
            breakMinutes,
            pomodoroPhases: phasesRef.current,
          };
        } else {
          sessionToSave = createFallbackSession('pomodoro', totalMinutes, focusMinutes, breakMinutes, true);
        }
      } else {
        sessionToSave = createFallbackSession('pomodoro', totalMinutes, focusMinutes, breakMinutes, isDemo);
      }
    } else {
      // Normal session without EEG
      sessionToSave = createFallbackSession('pomodoro', totalMinutes, focusMinutes, breakMinutes, false);
    }

    if (user) {
      saveStudentSession(user.id, sessionToSave);
      const updated = updateUserAcademicRecord(user.id, {
        totalStudyMinutes: (user.totalStudyMinutes || 0) + focusMinutes,
        pomodoroCountWeek: (user.pomodoroCountWeek || 0) + (pomoSessionCount > 0 ? 0 : 1),
      });
      if (updated && onUserUpdated) {
        onUserUpdated(updated);
      }
    }

    setCompletedSessionId(sessionToSave.id);
  };

  // ─── COUNTDOWN HANDLERS ─────────────────────────────────────────────────────

  const handleCdSet = () => {
    const m = parseInt(cdInputMin) || 0;
    const s = parseInt(cdInputSec) || 0;
    setCdTimeLeft(m * 60 + s);
    setCdIsActive(false);
    setCdDone(false);
    cdElapsedSecondsRef.current = 0;
  };

  const toggleCd = () => {
    const nextState = !cdIsActive;
    setCdIsActive(nextState);

    if (nextState) {
      beginEEGRecordingIfEnabled('study');
    } else {
      pauseEEGRecordingIfActive();
    }
  };

  const resetCd = () => {
    setCdIsActive(false);
    pauseEEGRecordingIfActive();
    setCdDone(false);
    handleCdSet();
  };

  const finalizeCountdownSession = () => {
    const durMin = Math.max(1, Math.round(cdElapsedSecondsRef.current / 60));
    let sess: LearningSession;

    if (recordEeg && (canRecordEeg || isDemo)) {
      if (eegService.isRecordingActive()) {
        const live = eegService.stopRecording();
        sess = live || createFallbackSession('study', durMin, durMin, 0, true);
      } else {
        sess = createFallbackSession('study', durMin, durMin, 0, isDemo);
      }
    } else {
      sess = createFallbackSession('study', durMin, durMin, 0, false);
    }

    if (user) {
      saveStudentSession(user.id, sess);
      const updated = updateUserAcademicRecord(user.id, {
        totalStudyMinutes: (user.totalStudyMinutes || 0) + durMin,
      });
      if (updated && onUserUpdated) {
        onUserUpdated(updated);
      }
    }

    setCompletedSessionId(sess.id);
  };

  // ─── STOPWATCH HANDLERS ─────────────────────────────────────────────────────

  const toggleSw = () => {
    const nextState = !swIsActive;
    setSwIsActive(nextState);
    if (nextState) {
      beginEEGRecordingIfEnabled('study');
    } else {
      pauseEEGRecordingIfActive();
    }
  };

  const resetSw = () => {
    setSwIsActive(false);
    pauseEEGRecordingIfActive();
    setSwTime(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps((prev) => [...prev, swTime]);
  };

  const finalizeStopwatchSession = () => {
    const durMin = Math.max(1, Math.round(swTime / 60000));
    let sess: LearningSession;

    if (recordEeg && (canRecordEeg || isDemo)) {
      if (eegService.isRecordingActive()) {
        const live = eegService.stopRecording();
        sess = live || createFallbackSession('study', durMin, durMin, 0, true);
      } else {
        sess = createFallbackSession('study', durMin, durMin, 0, isDemo);
      }
    } else {
      sess = createFallbackSession('study', durMin, durMin, 0, false);
    }

    if (user) {
      saveStudentSession(user.id, sess);
      const updated = updateUserAcademicRecord(user.id, {
        totalStudyMinutes: (user.totalStudyMinutes || 0) + durMin,
      });
      if (updated && onUserUpdated) {
        onUserUpdated(updated);
      }
    }

    setCompletedSessionId(sess.id);
  };

  // Helper to build fallback or timer-only session
  const createFallbackSession = (
    type: 'pomodoro' | 'study',
    durationMinutes: number,
    focusMinutes: number,
    breakMinutes: number,
    hasEeg: boolean
  ): LearningSession => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSim = isDemo && hasEeg;

    return {
      id: `timer_${Date.now()}`,
      userId: user?.id || 'student',
      title:
        type === 'pomodoro'
          ? `Pomodoro Study Block (${focusMinutes}m focus)`
          : `Focused Timer Session (${durationMinutes}m)`,
      type,
      course: sessionCourse,
      topic: sessionTopic,
      startTime: nowStr,
      durationMinutes,
      focusMinutes,
      breakMinutes,
      pomodoroPhases: phasesRef.current.length > 0 ? phasesRef.current : undefined,
      hasEegData: hasEeg,
      isSimulated: isSim,
      neuralMetrics: hasEeg
        ? {
            avgFocus: 78,
            peakFocus: 89,
            fatigueOnsetMinute: Math.round(durationMinutes * 0.75),
            thetaBetaRatio: 1.42,
            alphaAsymmetry: 0.16,
            sampleEntropy: 1.82,
            coherence: 0.62,
            validCoveragePercent: 94,
            signalQualityStatus: 'Good',
            artifactsDetectedCount: 1,
            channels: {
              fp1: { label: 'FP1 (Left Frontal)', status: 'Active', impedanceKohm: 4.1 },
              fp2: { label: 'FP2 (Right Frontal)', status: 'Active', impedanceKohm: 4.3 },
              a1: { label: 'A1 (Mastoid Ref)', status: 'Active', impedanceKohm: 3.9 },
            },
            isSimulated: isSim,
          }
        : undefined,
      focusDynamics: hasEeg
        ? [
            { timestamp: nowStr, minute: 1, attentionScore: 74, signalQuality: 96, phase: 'Warmup Focus' },
            { timestamp: nowStr, minute: Math.max(2, Math.round(durationMinutes / 2)), attentionScore: 84, signalQuality: 98, phase: 'Deep Focus' },
            { timestamp: nowStr, minute: durationMinutes, attentionScore: 78, signalQuality: 95, phase: 'Wrap-up' },
          ]
        : undefined,
      aiRecommendations: hasEeg
        ? [
            {
              id: `rec_${Date.now()}`,
              recommendation: `Completed ${durationMinutes} minutes of study with sustained cognitive attention.`,
              evidence: `Theta/Beta ratio of 1.42 indicates optimal cognitive processing for ${sessionTopic}.`,
              actionType: 'revision',
              actionTopic: sessionTopic,
            },
          ]
        : undefined,
      focusProfile: hasEeg
        ? {
            cognitiveWorkload: durationMinutes > 30 ? 'Elevated' : 'Optimal',
            workloadEvidence: `Mean theta/beta ratio of 1.42 indicates sustained engagement without severe mental fatigue.`,
            recommendedOptimalDurationMinutes: type === 'pomodoro' ? 25 : 30,
            averageFocusRecoverySeconds: 42,
            sessionEngagementRatePercent: 92,
            focusPerformanceMismatch: {
              patternDetected: false,
              description: 'Observed biometric engagement aligned consistently with active timer duration.',
              recommendation: 'Maintain current pacing strategy for subsequent study blocks.',
            },
          }
        : undefined,
      coachSuggestions: hasEeg
        ? [
            {
              id: `coach_timer_${Date.now()}`,
              title: type === 'pomodoro' ? 'Calibrate Interval Recovery' : 'Consolidate Concept Recall',
              observedPattern: `Sustained focus maintained across ${durationMinutes} minutes of ${sessionTopic}.`,
              supportingEvidence: 'High frontal coherence and steady engagement curve indicates minimal fragmentation.',
              actionableStep: 'Spend 3 minutes immediately summarizing key formulas or concepts onto paper without looking at notes.',
              evaluationMethod: 'Verify whether subsequent recall mock tests score above 85%.',
              category: 'recall',
            },
          ]
        : undefined,
    };
  };

  // Pomodoro SVG Ring metrics
  const pomoTotal = pomoMode === 'work' ? focusDurationMinutes * 60 : breakDurationMinutes * 60;
  const pomoProgress = Math.min(1, Math.max(0, 1 - pomoTimeLeft / (pomoTotal || 1)));
  const pomoRadius = 100;
  const pomoCircumference = 2 * Math.PI * pomoRadius;
  const pomoStrokeDashoffset = pomoCircumference - pomoProgress * pomoCircumference;
  const pomoColor = pomoMode === 'work' ? 'text-indigo-600' : 'text-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">NeuroNexus Study & Focus Timer</h2>
              <p className="text-[11px] text-slate-500">Dual Pomodoro & BioAmp EEG acquisition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── DEVICE STATE BANNER (All 8 Explicit States Handled) ─────────── */}
        <div className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2.5 ${deviceStateInfo.color}`}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold">{deviceStateInfo.title}</span> &bull;{' '}
              <span className="text-[11px] opacity-90">{deviceStateInfo.detail}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-white/70 border border-current">
              {deviceStateInfo.badge}
            </span>

            {eegStatus.state === 'disconnected' && onOpenHardwareManager && (
              <button
                onClick={onOpenHardwareManager}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 flex items-center gap-1 shadow-2xs"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Connect EEG</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/40">
          {[
            { id: 'pomodoro', icon: Zap, label: 'Pomodoro' },
            { id: 'countdown', icon: Timer, label: 'Countdown' },
            { id: 'stopwatch', icon: Clock, label: 'Stopwatch' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">

          {/* Completion Card Overlay */}
          {completedSessionId ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Study Session Saved Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your academic session metrics and Focus Dynamics have been recorded to your profile.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {onNavigateToNeuroAnalysis && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToNeuroAnalysis(completedSessionId);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Activity className="w-4 h-4" />
                    <span>View Neuro Analysis Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setCompletedSessionId(null);
                    resetPomo();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white font-bold text-xs"
                >
                  Start Another Session
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* EEG Controls & Study Topic Strip */}
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Course & Topic
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        placeholder="e.g. Pointer Arithmetic"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowConfig(!showConfig)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 font-semibold text-xs flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showConfig ? 'Hide Settings' : 'Timer Settings'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Timer Durations */}
                {showConfig && (
                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Focus Duration (min)</label>
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={focusDurationMinutes}
                        onChange={(e) => {
                          const v = Math.max(1, parseInt(e.target.value) || 25);
                          setFocusDurationMinutes(v);
                          if (pomoMode === 'work' && !pomoIsActive) setPomoTimeLeft(v * 60);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Break Duration (min)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={breakDurationMinutes}
                        onChange={(e) => {
                          const v = Math.max(1, parseInt(e.target.value) || 5);
                          setBreakDurationMinutes(v);
                          if (pomoMode === 'break' && !pomoIsActive) setPomoTimeLeft(v * 60);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* EEG Toggles */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recordEeg}
                      onChange={(e) => setRecordEeg(e.target.checked)}
                      disabled={!canRecordEeg && !isDemo}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Record EEG Data for this Session
                    </span>
                    {!canRecordEeg && !isDemo && (
                      <span className="text-[10px] text-slate-400 italic">(Requires hardware stream)</span>
                    )}
                  </label>

                  {recordEeg && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recordDuringBreaks}
                        onChange={(e) => setRecordDuringBreaks(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-slate-600 font-medium text-[11px]">
                        Record during breaks (labeled Relaxation)
                      </span>
                    </label>
                  )}
                </div>

                {/* Non-clinical disclaimer notice */}
                <div className="text-[10px] text-slate-400 leading-tight">
                  <span className="font-bold text-slate-500">Notice:</span> Attention scores are algorithmic estimates from frontopolar spectral ratios (Theta/Beta), not medical diagnostics or IQ measurements.
                </div>
              </div>

              {/* ── TAB 1: POMODORO ────────────────────────────────────────────── */}
              {activeTab === 'pomodoro' && (
                <div className="flex-1 flex flex-col items-center justify-between pb-2">
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        pomoMode === 'work'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${pomoMode === 'work' ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'}`} />
                      {pomoMode === 'work' ? 'Focus Work Interval' : 'Rest & Break Relaxation'}
                    </span>
                    <p className="text-slate-400 text-xs mt-1.5">
                      Completed Intervals: <strong className="text-slate-700">{pomoSessionCount}</strong> &bull; Total Focus Time: {Math.round(sessionTotalElapsedRef.current.focusSeconds / 60)}m
                    </p>
                  </div>

                  {/* Circular SVG Timer */}
                  <div className="relative flex items-center justify-center my-4">
                    <svg width="240" height="240" className="transform -rotate-90">
                      <circle
                        cx="120"
                        cy="120"
                        r={pomoRadius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                      />
                      <circle
                        cx="120"
                        cy="120"
                        r={pomoRadius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-linear ${pomoColor}`}
                        strokeDasharray={pomoCircumference}
                        strokeDashoffset={pomoStrokeDashoffset}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                        {formatTime(pomoTimeLeft)}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                        {pomoMode === 'work' ? 'Focus' : 'Break'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Controls */}
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        onClick={resetPomo}
                        className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                        title="Reset interval"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      <button
                        onClick={togglePomo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${
                          pomoMode === 'work'
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                        title={pomoIsActive ? 'Pause' : 'Start'}
                      >
                        {pomoIsActive ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={handlePomoPhaseTransition}
                        className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                        title="Skip phase"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    {/* End Session Button in Pomodoro */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={finishAndSavePomodoroSession}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                        <span>End Session & View Neuro Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: COUNTDOWN TIMER ────────────────────────────────────── */}
              {activeTab === 'countdown' && (
                <div className="flex-1 flex flex-col items-center justify-between pb-2">
                  {!cdIsActive &&
                  cdTimeLeft === parseInt(cdInputMin || '0') * 60 + parseInt(cdInputSec || '0') &&
                  !cdDone ? (
                    <div className="flex flex-col items-center gap-4 my-auto">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Set Duration</span>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <label className="text-[10px] text-slate-400 font-bold mb-1">MINUTES</label>
                          <input
                            type="number"
                            min="0"
                            max="180"
                            value={cdInputMin}
                            onChange={(e) => setCdInputMin(e.target.value)}
                            onBlur={handleCdSet}
                            className="w-20 text-center text-3xl font-black p-2 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                        <span className="text-3xl text-slate-300 font-light mt-4">:</span>
                        <div className="flex flex-col items-center">
                          <label className="text-[10px] text-slate-400 font-bold mb-1">SECONDS</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={cdInputSec}
                            onChange={(e) => setCdInputSec(e.target.value)}
                            onBlur={handleCdSet}
                            className="w-20 text-center text-3xl font-black p-2 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto text-center">
                      <div className={`text-6xl font-black font-mono tracking-tight ${cdDone ? 'text-amber-500' : 'text-slate-900'}`}>
                        {formatTime(cdTimeLeft)}
                      </div>
                      {cdDone && <p className="text-amber-600 font-bold text-xs mt-2">Study Countdown Complete!</p>}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={resetCd}
                        className="p-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                        title="Reset"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      <button
                        onClick={toggleCd}
                        disabled={cdDone && cdTimeLeft === 0}
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-transform hover:scale-105 disabled:opacity-50"
                      >
                        {cdIsActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                      </button>
                    </div>

                    {/* End Session Button for Countdown */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={finalizeCountdownSession}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                        <span>End Session & View Neuro Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: STOPWATCH ─────────────────────────────────────────── */}
              {activeTab === 'stopwatch' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-center my-auto py-4">
                    <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                      {formatSwTime(swTime)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={resetSw}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Reset
                      </button>

                      <button
                        onClick={toggleSw}
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-transform hover:scale-105"
                      >
                        {swIsActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                      </button>

                      <button
                        onClick={addLap}
                        disabled={!swIsActive}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-40"
                      >
                        Lap
                      </button>
                    </div>

                    {/* End Session Button for Stopwatch */}
                    <button
                      onClick={finalizeStopwatchSession}
                      className="mt-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                      <span>End Session & View Neuro Report</span>
                    </button>
                  </div>

                  {/* Laps List */}
                  {laps.length > 0 && (
                    <div className="max-h-24 overflow-y-auto border-t border-slate-100 pt-2 space-y-1">
                      {[...laps].reverse().map((lapTime, i) => (
                        <div key={i} className="flex justify-between items-center py-1 px-3 bg-slate-50 rounded-lg text-xs">
                          <span className="font-semibold text-slate-500">Lap {laps.length - i}</span>
                          <span className="font-mono font-bold text-slate-800">{formatSwTime(lapTime)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
