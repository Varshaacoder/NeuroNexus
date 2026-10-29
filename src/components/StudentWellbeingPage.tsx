import React, { useState } from 'react';
import { Heart, ShieldCheck, EyeOff, Sparkles, CheckCircle2, AlertCircle, Coffee, Clock, Lock, ArrowRight } from 'lucide-react';
import type { UserProfile } from '../types';

interface StudentWellbeingPageProps {
  user: UserProfile;
  onNavigateDashboard: () => void;
  onOpenTimer?: () => void;
}

export const StudentWellbeingPage: React.FC<StudentWellbeingPageProps> = ({
  user,
  onNavigateDashboard,
  onOpenTimer
}) => {
  const [selectedMood, setSelectedMood] = useState<'energized' | 'focused' | 'stressed' | 'fatigued'>('focused');
  const [personalNotes, setPersonalNotes] = useState('');
  const [shareWithGuardian, setShareWithGuardian] = useState(true);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const moods = [
    { id: 'focused', label: 'Focused & Steady', emoji: '🎯', desc: 'Flow state, productive cognitive rhythm', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
    { id: 'energized', label: 'Energized & Motivated', emoji: '⚡', desc: 'Ready for challenging tests and deep work', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { id: 'stressed', label: 'Mild Academic Stress', emoji: '😰', desc: 'Feeling slight exam pressure or deadline load', color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { id: 'fatigued', label: 'Cognitively Fatigued', emoji: '🔋', desc: 'High mental workload, need a Pomodoro rest', color: 'border-rose-300 bg-rose-50 text-rose-800' },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedStatus('Check-in logged! Your wellbeing record is updated with student-controlled privacy.');
    setTimeout(() => setSubmittedStatus(null), 4500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-[#17213B]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF] text-xs font-bold mb-2 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#8755E8]" />
            <span>Student Agency & Cognitive Care</span>
          </div>
          <h1 className="text-3xl font-black text-[#17213B]">Student Wellbeing & Rest Center</h1>
          <p className="text-[#64708A] text-sm mt-1">
            Voluntary mental workload check-ins and restorative study recommendations for <strong className="text-[#17213B]">{user.name}</strong>.
          </p>
        </div>

        <button
          onClick={onNavigateDashboard}
          className="self-start sm:self-auto px-4 py-2 text-xs font-bold text-[#2855D9] bg-[#EEF3FF] hover:bg-[#D5E2FF] rounded-xl border border-[#D5E2FF] transition-all flex items-center gap-1.5"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-5 border border-[#B4EFF5] bg-[#E6F9FC] rounded-2xl text-xs text-[#0F6570] leading-relaxed space-y-1 shadow-2xs">
        <div className="font-bold flex items-center gap-2 text-sm text-[#008392]">
          <EyeOff className="w-4 h-4 text-[#00AFC1]" />
          <span>Student Privacy & Safe Space Guarantee</span>
        </div>
        <p>
          Your wellbeing self-assessments and reflections belong solely to you. Faculty mentors and university administrators <strong>NEVER</strong> have access to your personal emotional states or private notes. You decide voluntarily whether your designated guardian (<span className="font-bold">Eleanor Vance</span>) receives high-level summaries.
        </p>
      </div>

      {/* Mood Check-In Form */}
      <div className="p-6 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs space-y-6">
        <div className="border-b border-[#E1E7F2] pb-4">
          <h2 className="text-lg font-bold text-[#17213B] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8755E8]" />
            <span>Current State of Mind & Cognitive Energy</span>
          </h2>
          <p className="text-xs text-[#64708A] mt-1">Take 15 seconds to reflect before or after deep academic study sessions.</p>
        </div>

        {submittedStatus && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submittedStatus}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {moods.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${m.color} ring-2 ring-[#2855D9] shadow-sm font-semibold`
                      : 'border-[#E1E7F2] hover:bg-[#F3F6FF] text-[#17213B]'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{m.emoji}</div>
                  <div className="text-sm font-bold">{m.label}</div>
                  <div className="text-[11px] text-[#64708A] mt-1 leading-snug">{m.desc}</div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17213B] mb-1.5 uppercase tracking-wider">
              Personal Study Notes & Reflections (Private by Default)
            </label>
            <textarea
              rows={3}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="e.g. Completed 2 units of Java OOP. Felt good on inheritance, but pointers in Systems programming needed an extra coffee break."
              className="w-full p-3.5 text-sm bg-[#F3F6FF] border border-[#E1E7F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2855D9]/30 focus:border-[#2855D9] text-[#17213B] placeholder:text-[#64708A]"
            />
          </div>

          <div className="p-4 bg-[#F3F6FF] border border-[#E1E7F2] rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#17213B]">Share high-level status with Parent/Guardian</div>
                <div className="text-[11px] text-[#64708A]">Allows Eleanor Vance to see your mood emoji and reassurance status in the Parent Portal.</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={shareWithGuardian}
                onChange={(e) => setShareWithGuardian(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2855D9]"></div>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#2855D9] hover:bg-[#1E44B5] transition-all shadow-sm"
            >
              Submit Check-In Record
            </button>
            {onOpenTimer && (
              <button
                type="button"
                onClick={onOpenTimer}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#17213B] bg-white border border-[#E1E7F2] hover:bg-[#F3F6FF] transition-all flex items-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                Launch 5-Min Rest Timer
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Recommended Cognitive Rest Rituals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2855D9] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#17213B]">25/5 Pomodoro Cycle</h3>
          <p className="text-xs text-[#64708A] leading-relaxed">
            Short 25-minute sprints prevent theta-wave fatigue buildup. Step away from screens during 5-minute intervals.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#E6F9FC] text-[#00AFC1] flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#17213B]">20-20-20 Visual Relief</h3>
          <p className="text-xs text-[#64708A] leading-relaxed">
            Every 20 minutes, gaze at an object 20 feet away for 20 seconds to reset ciliary eye muscles and reduce mental strain.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#F5F0FF] text-[#8755E8] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#17213B]">Total Data Sovereignty</h3>
          <p className="text-xs text-[#64708A] leading-relaxed">
            You can revoke guardian sharing or wipe all wellbeing check-in records at any time from your settings.
          </p>
        </div>
      </div>
    </div>
  );
};
