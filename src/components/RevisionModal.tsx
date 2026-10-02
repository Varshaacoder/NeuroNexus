import React from 'react';
import { BookOpen, X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  topic: string;
  onClose: () => void;
  onOpenPractice?: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  topic,
  onClose,
  onOpenPractice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-emerald-100">
                10-Minute Rapid Revision Deck
              </span>
              <h2 className="text-lg font-black text-white">{topic} Concept Recap</h2>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Core Principle: Type-Scaled Arithmetic</span>
            </div>
            <p className="text-xs text-emerald-800">
              When adding an integer <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 font-mono font-bold">k</code> to a pointer <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 font-mono font-bold">p</code>, the memory address increases by <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 font-mono font-bold">k * sizeof(*p)</code> bytes.
            </p>
          </div>

          {/* Visual Memory Representation */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Visual Representation of `p + 2`:
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300">
                <div className="text-[10px] text-slate-400">0x1000</div>
                <div className="font-bold text-indigo-700">arr[0]</div>
                <div className="text-[10px] font-bold text-indigo-500 mt-1">p</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300">
                <div className="text-[10px] text-slate-400">0x1004</div>
                <div className="font-bold text-slate-700">arr[1]</div>
                <div className="text-[10px] text-slate-400 mt-1">p + 1</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100 border-2 border-emerald-500 shadow-xs">
                <div className="text-[10px] text-emerald-800">0x1008</div>
                <div className="font-bold text-emerald-900">arr[2]</div>
                <div className="text-[10px] font-black text-emerald-700 mt-1">p + 2 ✓</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300">
                <div className="text-[10px] text-slate-400">0x100C</div>
                <div className="font-bold text-slate-700">arr[3]</div>
                <div className="text-[10px] text-slate-400 mt-1">p + 3</div>
              </div>
            </div>
          </div>

          {/* Common Exam Pitfalls */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>3 Critical Pitfalls to Avoid in Midterms:</span>
            </h3>
            <ul className="space-y-2 list-none p-0">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>1. Precedence Trap:</strong> <code className="bg-white px-1 rounded font-mono">*p++</code> dereferences first, then advances the pointer. <code className="bg-white px-1 rounded font-mono">(*p)++</code> increments the value stored at the address.
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>2. Pointer Subtraction:</strong> Subtracting two pointers <code className="bg-white px-1 rounded font-mono">q - p</code> evaluates to the number of elements between them, not the byte distance!
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>3. Illegal Operations:</strong> You <em>cannot</em> add two pointers together (<code className="bg-white px-1 rounded font-mono">p + q</code> is illegal syntax in C).
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close Deck
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenPractice?.();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2"
          >
            <span>Test Yourself: 5 Practice Qs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
