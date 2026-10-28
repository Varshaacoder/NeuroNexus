import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle2, ArrowRight, Award, RotateCcw } from 'lucide-react';
import { MOCK_TEST_QUESTIONS } from '../mockData';

interface PracticeQuestionsModalProps {
  isOpen: boolean;
  topic: string;
  onClose: () => void;
  onQuestionsFinished?: (score: number) => void;
}

export const PracticeQuestionsModal: React.FC<PracticeQuestionsModalProps> = ({
  isOpen,
  topic,
  onClose,
  onQuestionsFinished,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = MOCK_TEST_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: idx
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIdx < MOCK_TEST_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      let correct = 0;
      MOCK_TEST_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) correct++;
      });
      const pct = Math.round((correct / MOCK_TEST_QUESTIONS.length) * 100);
      setIsFinished(true);
      onQuestionsFinished?.(pct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-indigo-100">
                5 Practice Questions
              </span>
              <h2 className="text-lg font-black text-white">{topic} Drill</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isFinished ? (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Question {currentIdx + 1} of {MOCK_TEST_QUESTIONS.length}</span>
                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Instant Grading Active</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentQ.question}
                </h3>

                {currentQ.codeSnippet && (
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-indigo-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}

                <div className="space-y-2 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentIdx] === optIdx;
                    const isCorrect = optIdx === currentQ.correctAnswer;
                    
                    let cls = 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800';
                    if (showFeedback) {
                      if (isCorrect) {
                        cls = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        cls = 'border-rose-400 bg-rose-50 text-rose-900';
                      }
                    } else if (isSelected) {
                      cls = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => !showFeedback && handleSelectOption(optIdx)}
                        disabled={showFeedback}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${cls}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {showFeedback && isCorrect && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Correct ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed animate-in fade-in">
                    <strong>Explanation:</strong> {currentQ.explanation}
                  </div>
                )}
              </div>

              {showFeedback && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2"
                  >
                    <span>{currentIdx < MOCK_TEST_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Drill Completed!</h3>
                <p className="text-xs text-slate-600 mt-1">Your response history has updated your understanding score.</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold max-w-sm mx-auto">
                🎉 Pointer Arithmetic Mastery updated: 41% → 52% (+11%)
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Return to Academic Command Center
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
