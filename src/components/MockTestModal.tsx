import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, LearningSession, FocusTimePoint } from '../types';
import { MOCK_TEST_QUESTIONS } from '../mockData';
import { X, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, RotateCcw, Brain, Sparkles, AlertCircle, Cpu } from 'lucide-react';
import { saveStudentSession, isDemoUser, updateUserAcademicRecord } from '../utils/neuroSessionStore';
import { eegService } from '../services/eegService';

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  testTitle?: string;
  testCourse?: string;
  onNavigateToNeuroAnalysis?: (sessionId: string) => void;
  onUserUpdated?: (user: UserProfile) => void;
}

export const MockTestModal: React.FC<MockTestModalProps> = ({
  isOpen,
  onClose,
  user,
  testTitle = 'Personalized Mock Test',
  testCourse = 'CS201 C Programming & Systems',
  onNavigateToNeuroAnalysis,
  onUserUpdated,
}) => {
  const isDemo = isDemoUser(user.id, user.email);
  const hardwareStatus = eegService.getStatus();
  const isHardwareStreaming = hardwareStatus.state === 'streaming';

  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: { [questionId]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [enableDemoEeg, setEnableDemoEeg] = useState(isDemo);
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

    // Derive genuine weak and strong topics based on question answers
    const missedTopics = MOCK_TEST_QUESTIONS
      .filter(qItem => answers[qItem.id] !== qItem.correctAnswer)
      .map(qItem => qItem.topic);
    const masteredTopics = MOCK_TEST_QUESTIONS
      .filter(qItem => answers[qItem.id] === qItem.correctAnswer)
      .map(qItem => qItem.topic);

    const prevWeak = user.weakTopics || [];
    const updatedWeak = [
      ...prevWeak.filter(t => !masteredTopics.includes(t.name)),
      ...missedTopics.map(topic => ({
        name: topic,
        mastery: 40,
        course: testCourse,
        trend: 'Needs Practice',
      })),
    ];

    const strongestObj = masteredTopics.length > 0
      ? { name: masteredTopics[0], mastery: 90 }
      : user.strongestTopic;

    // Update user rankScore and academic progress honestly
    const newRankScore = (user.rankScore || 0) + testScore * 20;
    const newProgress = Math.min(100, Math.max(user.overallProgress || 0, Math.round((masteredTopics.length / Math.max(1, MOCK_TEST_QUESTIONS.length)) * 100)));

    const updatedUser = updateUserAcademicRecord(user.id, {
      weakTopics: updatedWeak,
      rankScore: newRankScore,
      overallProgress: newProgress,
      hasDiagnosticAssessment: true,
      strongestTopic: strongestObj,
      focusScore: isHardwareStreaming ? 82 : (isDemo ? 80 : user.focusScore || 0),
    });

    if (updatedUser) {
      onUserUpdated?.(updatedUser);
    }

    // Determine EEG data status strictly
    const hasEeg = isDemo ? enableDemoEeg : isHardwareStreaming;
    const isSimulated = isDemo && enableDemoEeg;

    const focusDyn: FocusTimePoint[] = hasEeg ? [
      { timestamp: '00:00', minute: 1, attentionScore: 78, signalQuality: 98, phase: 'Test Start' },
      { timestamp: '03:00', minute: 3, attentionScore: 86, signalQuality: 97, phase: 'Question 1' },
      { timestamp: '06:00', minute: 6, attentionScore: 92, signalQuality: 95, phase: 'Question 2 (Peak)' },
      { timestamp: '09:00', minute: 9, attentionScore: 84, signalQuality: 96, phase: 'Question 3' },
      { timestamp: '12:00', minute: 12, attentionScore: 76, signalQuality: 91, phase: 'Question 4' },
      { timestamp: '15:00', minute: 15, attentionScore: 80, signalQuality: 97, phase: 'Review & Submit' },
    ] : [];

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
      hasEegData: hasEeg,
      isSimulated,
      topicPerformance: topicPerf,
      focusDynamics: hasEeg ? focusDyn : undefined,
      neuralMetrics: hasEeg ? {
        avgFocus: 83,
        peakFocus: 92,
        fatigueOnsetMinute: 12,
        thetaBetaRatio: 1.35,
        alphaAsymmetry: 0.20,
        sampleEntropy: 1.89,
        coherence: 0.66,
        validCoveragePercent: 95,
        signalQualityStatus: 'Excellent',
        artifactsDetectedCount: 1,
        channels: {
          fp1: { label: 'FP1 (Left Frontal)', status: 'Active', impedanceKohm: 4.0 },
          fp2: { label: 'FP2 (Right Frontal)', status: 'Active', impedanceKohm: 4.2 },
          a1: { label: 'A1 (Mastoid Ref)', status: 'Active', impedanceKohm: 3.8 },
        },
        isSimulated,
      } : undefined,
      aiRecommendations: hasEeg ? [
        {
          id: `rec_test_${sessionId}`,
          recommendation: missedTopics.length > 0 
            ? `Reinforce foundational understanding in ${missedTopics.join(', ')}.`
            : 'Excellent performance across all assessed diagnostic modules.',
          evidence: `Attention averaged 83% throughout the test; test completed with ${testScore}/${MOCK_TEST_QUESTIONS.length} correct answers.`,
          actionType: 'revision',
          actionTopic: missedTopics[0] || 'Curriculum Diagnostic',
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
            {isDemo && enableDemoEeg ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                <Brain className="w-3 h-3" />
                [Demo Data — Simulated EEG]
              </span>
            ) : isHardwareStreaming ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <Brain className="w-3 h-3" />
                Live BioAmp EEG Active
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                Academic Only (EEG Disconnected)
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
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : answers[question.id] !== undefined
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Question card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Topic: {q.topic}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Question {currentIdx + 1} of {MOCK_TEST_QUESTIONS.length}</span>
                </div>

                <p className="text-base font-semibold text-slate-800 leading-relaxed">{q.question}</p>

                {q.codeSnippet && (
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
                    <pre>{q.codeSnippet}</pre>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2.5 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl font-black ${
                  pct >= 80 ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' :
                  pct >= 60 ? 'bg-amber-50 text-amber-600 border-2 border-amber-200' :
                  'bg-rose-50 text-rose-600 border-2 border-rose-200'
                }`}>
                  {pct}%
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {pct >= 80 ? 'Outstanding Diagnostic!' : pct >= 60 ? 'Solid Academic Effort' : 'Needs Topic Review'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    You scored {score} out of {MOCK_TEST_QUESTIONS.length} questions correctly. Academic records and weakness rankings have been updated.
                  </p>
                </div>
              </div>

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
                        <span className="font-bold">{isPassed ? '✓ Mastered' : '✗ Weak Topic Identified'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Neuro Analysis Card */}
              {(isDemo && enableDemoEeg) || isHardwareStreaming ? (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950">NeuroFocus Session Recorded</h4>
                      <p className="text-[11px] text-indigo-700">
                        {isHardwareStreaming ? 'Live physiological recording saved.' : 'Demo neural focus dynamics recorded.'}
                      </p>
                    </div>
                  </div>
                  {createdSessionId && onNavigateToNeuroAnalysis && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToNeuroAnalysis(createdSessionId);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>View Neuro Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No EEG hardware was attached during this attempt. Academic scores were saved without fabricating fake brainwave data.</span>
                </div>
              )}

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

                {isDemo && (
                  <label className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDemoEeg}
                      onChange={(e) => setEnableDemoEeg(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-400"
                    />
                    <span>Demo EEG Waveforms</span>
                  </label>
                )}
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
