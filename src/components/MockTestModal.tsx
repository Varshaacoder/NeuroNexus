import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, LearningSession, FocusTimePoint } from '../types';
import { MOCK_TEST_QUESTIONS } from '../mockData';
import { X, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, RotateCcw, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { saveStudentSession } from '../utils/neuroSessionStore';

// Demo focus-dynamics curve for mock-test EEG telemetry.
// Clearly labeled in the UI as "Demo Data — Not Live EEG".
// avgFocus / peakFocus / validCoverage are DERIVED from this array,
// never hardcoded as standalone constants.
const DEMO_FOCUS_DYNAMICS: FocusTimePoint[] = [
  { timestamp: '00:00', minute: 1, attentionScore: 78, signalQuality: 98, phase: 'Test Start' },
  { timestamp: '03:00', minute: 3, attentionScore: 86, signalQuality: 97, phase: 'Question 1' },
  { timestamp: '06:00', minute: 6, attentionScore: 92, signalQuality: 95, phase: 'Question 2 (Peak)' },
  { timestamp: '09:00', minute: 9, attentionScore: 84, signalQuality: 96, phase: 'Question 3' },
  { timestamp: '12:00', minute: 12, attentionScore: 76, signalQuality: 91, phase: 'Question 4' },
  { timestamp: '15:00', minute: 15, attentionScore: 80, signalQuality: 97, phase: 'Review & Submit' },
];

const demoAvgFocus = Math.round(
  DEMO_FOCUS_DYNAMICS.reduce((acc, d) => acc + d.attentionScore, 0) / DEMO_FOCUS_DYNAMICS.length
);
const demoPeakFocus = Math.max(...DEMO_FOCUS_DYNAMICS.map(d => d.attentionScore));
const demoValidCoverage = Math.round(
  DEMO_FOCUS_DYNAMICS.reduce((acc, d) => acc + d.signalQuality, 0) / DEMO_FOCUS_DYNAMICS.length
);

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  testTitle?: string;
  testCourse?: string;
  onNavigateToNeuroAnalysis?: (sessionId: string) => void;
}

export const MockTestModal: React.FC<MockTestModalProps> = ({
  isOpen,
  onClose,
  user,
  testTitle = 'Personalized Mock Test',
  testCourse = 'CS201 C Programming & Systems',
  onNavigateToNeuroAnalysis,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: { [questionId]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [enableEeg, setEnableEeg] = useState(true);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen, isSubmitted]);

  if (!isOpen) return null;

  const q = MOCK_TEST_QUESTIONS[currentIdx];
  const isLast = currentIdx === MOCK_TEST_QUESTIONS.length - 1;
  const isFirst = currentIdx === 0;

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [q.id]: optionIdx });
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const testScore = MOCK_TEST_QUESTIONS.reduce(
      (acc, question) => acc + (answers[question.id] === question.correctAnswer ? 1 : 0),
      0
    );
    const pctScore = Math.round((testScore / MOCK_TEST_QUESTIONS.length) * 100);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionId = `test_${Date.now()}`;

    // Topic level performance
    const topicPerf = MOCK_TEST_QUESTIONS.map(qItem => ({
      topic: qItem.topic,
      score: answers[qItem.id] === qItem.correctAnswer ? 1 : 0,
      total: 1,
      correct: answers[qItem.id] === qItem.correctAnswer,
    }));

    // If EEG was enabled, use the shared demo focus-dynamics curve.
    // avgFocus / peakFocus / validCoverage are derived from DEMO_FOCUS_DYNAMICS,
    // not hardcoded constants — see the module-level definitions above.
    const focusDyn: FocusTimePoint[] = enableEeg ? DEMO_FOCUS_DYNAMICS : [];

    const newSession: LearningSession = {
      id: sessionId,
      userId: user.id,
      title: testTitle,
      type: 'quiz',
      course: testCourse,
      topic: MOCK_TEST_QUESTIONS[0]?.topic || 'Curriculum Diagnostic',
      startTime: `Today, ${timeStr}`,
      durationMinutes: 15,
      score: pctScore,
      totalQuestions: MOCK_TEST_QUESTIONS.length,
      correctAnswers: testScore,
      hasEegData: enableEeg,
      isSimulated: enableEeg,
      topicPerformance: topicPerf,
      focusDynamics: enableEeg ? focusDyn : undefined,
      neuralMetrics: enableEeg ? {
        avgFocus: demoAvgFocus,
        peakFocus: demoPeakFocus,
        fatigueOnsetMinute: 12,
        thetaBetaRatio: 1.35,
        alphaAsymmetry: 0.20,
        sampleEntropy: 1.89,
        coherence: 0.66,
        validCoveragePercent: demoValidCoverage,
        signalQualityStatus: 'Excellent',
        artifactsDetectedCount: 1,
        channels: {
          fp1: { label: 'FP1 (Left Frontal)', status: 'Active', impedanceKohm: 4.0 },
          fp2: { label: 'FP2 (Right Frontal)', status: 'Active', impedanceKohm: 4.2 },
          a1: { label: 'A1 (Mastoid Ref)', status: 'Active', impedanceKohm: 3.8 },
        },
        isSimulated: true,
      } : undefined,
      aiRecommendations: enableEeg ? [
        {
          id: `rec_test_${sessionId}`,
          recommendation: 'Review pointer dereference syntax and memory offsets before the mid-term.',
          evidence: `Estimated attention averaged ${demoAvgFocus}% across ${DEMO_FOCUS_DYNAMICS.length} sampled intervals; error on question 2 coincided with an elevated cognitive workload reading.`,
          actionType: 'revision',
          actionTopic: 'Pointer Arithmetic',
        }
      ] : undefined,
    };

    saveStudentSession(user.id, newSession);
    setCreatedSessionId(sessionId);
  };

  const resetTest = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(15 * 60);
    setCreatedSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const score = isSubmitted
    ? MOCK_TEST_QUESTIONS.reduce((acc, question) => acc + (answers[question.id] === question.correctAnswer ? 1 : 0), 0)
    : 0;

  const pct = Math.round((score / MOCK_TEST_QUESTIONS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800">{testTitle}</h2>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              {testCourse}
            </span>
            {enableEeg && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                <Brain className="w-3 h-3" />
                NeuroFocus Monitored
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                timeLeft < 120 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            {/* Progress indicator */}
            {!isSubmitted && (
              <span className="text-xs font-bold text-slate-500">
                {currentIdx + 1} / {MOCK_TEST_QUESTIONS.length}
              </span>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!isSubmitted && (
          <div className="h-1 bg-slate-200 shrink-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / MOCK_TEST_QUESTIONS.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSubmitted ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question navigation dots */}
              <div className="flex items-center gap-2">
                {MOCK_TEST_QUESTIONS.map((question, idx) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                      idx === currentIdx
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : answers[question.id] !== undefined
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {q.topic}
                    </span>
                    <span className="text-xs text-slate-400">{q.course}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed mb-5">
                    {q.question}
                  </h3>

                  {q.codeSnippet && (
                    <div className="mb-5 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      <div className="flex items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] text-slate-500 ml-3 font-mono">C snippet</span>
                      </div>
                      <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((optionText, idx) => {
                      const isSelected = answers[q.id] === idx;
                      const label = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {label}
                          </div>
                          <span className={`text-sm pt-1.5 font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Results Screen
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Score card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center border-4 ${
                  pct >= 80 ? 'border-emerald-500 bg-emerald-50' : pct >= 60 ? 'border-amber-500 bg-amber-50' : 'border-rose-500 bg-rose-50'
                }`}>
                  <Trophy className={`w-10 h-10 ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'}`} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">Test Complete!</h2>
                <p className="text-sm text-slate-500 mb-6">
                  {pct >= 80 ? '🎉 Excellent! Keep up the great work!' : pct >= 60 ? '👍 Good effort. Review missed concepts.' : '📚 Needs practice. Focus on Pointer Arithmetic.'}
                </p>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-black text-slate-800">{score}/{MOCK_TEST_QUESTIONS.length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Correct</div>
                  </div>
                  <div className="w-px h-16 bg-slate-200" />
                  <div className="text-center">
                    <div className={`text-4xl font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {pct}%
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Accuracy</div>
                  </div>
                </div>
              </div>

              {/* NeuroFocus Attempt Summary */}
              {enableEeg ? (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-5 space-y-3.5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-sm text-slate-900">NeuroFocus Telemetry Attached</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      Demo Data — Not Live EEG
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Attention values are <strong>estimates derived from the demo focus-dynamics curve</strong>, not direct measurements of concentration or understanding. EEG can indicate cognitive workload and vigilance drift only.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div
                      className="p-3 bg-white/90 rounded-xl border border-indigo-100 relative group"
                      title={`Estimated attention index, averaged across ${DEMO_FOCUS_DYNAMICS.length} sampled intervals of the demo curve. Not a live EEG measurement.`}
                    >
                      <div className="text-xs text-slate-500 font-medium">Average Focus</div>
                      <div className="text-xl font-black text-indigo-950 mt-0.5">{demoAvgFocus}%</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">est. from demo curve</div>
                    </div>
                    <div
                      className="p-3 bg-white/90 rounded-xl border border-indigo-100"
                      title="Peak estimated attention reached during the demo focus curve."
                    >
                      <div className="text-xs text-slate-500 font-medium">Peak Focus</div>
                      <div className="text-xl font-black text-indigo-950 mt-0.5">{demoPeakFocus}%</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">single-interval max</div>
                    </div>
                    <div
                      className="p-3 bg-white/90 rounded-xl border border-indigo-100"
                      title="Mean signal-quality index across the demo focus curve."
                    >
                      <div className="text-xs text-slate-500 font-medium">Valid Coverage</div>
                      <div className="text-xl font-black text-purple-950 mt-0.5">{demoValidCoverage}%</div>
                    </div>
                  </div>

                  {onNavigateToNeuroAnalysis && createdSessionId && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToNeuroAnalysis(createdSessionId);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <Brain className="w-4 h-4" />
                      <span>View Full Neuro Analysis Report for this Attempt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No EEG data was recorded during this attempt. Academic scores were saved, but no neural report was generated.</span>
                </div>
              )}

              {/* Topic-Wise Strengths and Weaknesses */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Topic-Wise Diagnostic Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {MOCK_TEST_QUESTIONS.map((question) => {
                    const isPassed = answers[question.id] === question.correctAnswer;
                    return (
                      <div
                        key={question.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isPassed
                            ? 'bg-emerald-50/60 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50/60 text-rose-800 border-rose-200'
                        }`}
                      >
                        <span className="font-semibold">{question.topic}</span>
                        <span className="font-bold">{isPassed ? '✓ Passed' : '✗ Needs Practice'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-question breakdown */}
              <h3 className="text-base font-black text-slate-800">Question Review</h3>
              {MOCK_TEST_QUESTIONS.map((question, idx) => {
                const userAnswerIdx = answers[question.id];
                const isCorrect = userAnswerIdx === question.correctAnswer;
                const userAnswerText = userAnswerIdx !== undefined ? question.options[userAnswerIdx] : 'Not answered';
                const correctAnswerText = question.options[question.correctAnswer];
                return (
                  <div key={question.id} className={`bg-white rounded-2xl border p-5 ${isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
                    <div className="flex gap-3 mb-3">
                      {isCorrect
                        ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      }
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">Q{idx + 1} · {question.topic}</div>
                        <p className="text-sm font-bold text-slate-800">{question.question}</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div className={`p-2.5 rounded-xl text-xs font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        <span className="font-bold">Your answer: </span>{userAnswerText}
                      </div>
                      {!isCorrect && (
                        <div className="p-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800">
                          <span className="font-bold">Correct: </span>{correctAnswerText}
                        </div>
                      )}
                      <div className="p-2.5 rounded-xl text-xs bg-indigo-50 text-indigo-800 border border-indigo-100">
                        <span className="font-bold">Explanation: </span>{question.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          {!isSubmitted ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  disabled={isFirst}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <label className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableEeg}
                    onChange={(e) => setEnableEeg(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-400"
                  />
                  <span>Track NeuroFocus (Demo)</span>
                </label>
              </div>

              {!isLast ? (
                <button
                  onClick={() => setCurrentIdx(i => Math.min(MOCK_TEST_QUESTIONS.length - 1, i + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
                >
                  Submit Test
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-end gap-3">
              <button onClick={resetTest} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-sm">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button onClick={onClose} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
