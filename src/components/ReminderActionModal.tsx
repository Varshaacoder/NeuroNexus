import React from 'react';
import { X, CheckCircle2, Download, Calendar, Users, FileText, ArrowRight } from 'lucide-react';
import { SmartReminder } from '../types';

interface ReminderActionModalProps {
  isOpen: boolean;
  reminder: SmartReminder | null;
  onClose: () => void;
  onOpenClassroom: () => void;
}

export const ReminderActionModal: React.FC<ReminderActionModalProps> = ({
  isOpen,
  reminder,
  onClose,
  onOpenClassroom,
}) => {
  if (!isOpen || !reminder) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {reminder.tag}
            </span>
            <span className="text-xs text-slate-500 font-medium">{reminder.meta}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">{reminder.title}</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{reminder.description}</p>
        </div>

        {/* Dynamic Action Content */}
        {reminder.type === 'announcement' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Faculty Verified Solution by Dr. Aris Thorne:</span>
            </div>
            <p className="leading-relaxed bg-white p-3 rounded-xl border border-emerald-200 font-mono text-[11px]">
              "int *p[5] declares an array of 5 integer pointers (size: 5 * 8 = 40 bytes on 64-bit systems). In contrast, int (*p)[5] declares a single pointer to an array of 5 integers (size: 8 bytes). Incrementing (*p) advances by 20 bytes (the entire array), whereas incrementing p[0] advances by 4 bytes."
            </p>
          </div>
        )}

        {reminder.type === 'resource' && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Resource Attachment Ready for Download:</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">CS201_Lecture8_MemoryLeaks_HeapTracing.pdf</p>
                <p className="text-[10px] text-slate-500">2.4 MB • Verified by Dr. Thorne</p>
              </div>
              <button
                onClick={() => alert('Downloading CS201_Lecture8_MemoryLeaks_HeapTracing.pdf')}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-2xs hover:bg-indigo-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {reminder.type === 'mentor' && (
          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-2 text-xs text-violet-950">
            <div className="flex items-center gap-1.5 font-bold text-violet-900">
              <Users className="w-4 h-4 text-violet-600" />
              <span>Peer Study Room: Rachel Torres</span>
            </div>
            <p className="text-xs text-violet-800">
              Rachel has opened the study hub for pointer arithmetic code puzzles. Click below to launch the interactive live session.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenClassroom();
              }}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-200 flex items-center justify-center gap-2"
            >
              <span>Join Peer Study Room Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {reminder.type === 'test' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>DBMS Midterm Exam Brief:</span>
            </div>
            <p className="text-xs text-rose-800">
              Tomorrow at 09:30 AM in Hall 3B. Topics: Functional Dependencies, Armstrong's Axioms, 2NF, 3NF, BCNF decomposition.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
