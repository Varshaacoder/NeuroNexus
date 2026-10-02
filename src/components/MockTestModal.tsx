import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../types';
import { MOCK_TEST_QUESTIONS } from '../mockData';
import { X, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, RotateCcw } from 'lucide-react';

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const MockTestModal: React.FC<MockTestModalProps> = ({ isOpen, onClose, user: _ }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: { [questionId]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current!); setIsSubmitted(true); return 0; }
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

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetTest = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(15 * 60);
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
            <h2 className="text-lg font-black text-slate-800">Personalized Mock Test</h2>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              Pointer Arithmetic + Probability
            </span>
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
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={isFirst}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
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
                  onClick={handleSubmit}
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
