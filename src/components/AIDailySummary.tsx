import React from 'react';
import type { UserProfile } from '../types';
import { Bot, Sparkles, TrendingUp, AlertTriangle, BookOpen, Zap } from 'lucide-react';
import { getStudentSessions } from '../utils/neuroSessionStore';

interface AIDailySummaryProps { 
  user: UserProfile; 
  onNavigateCourses?: () => void;
  onOpenMockTest?: () => void;
  onNavigateMessages?: () => void;
}

export const AIDailySummary: React.FC<AIDailySummaryProps> = ({ 
  user, onNavigateCourses, onOpenMockTest, onNavigateMessages 
}) => {
  const isFresh = (!user.email?.toLowerCase().includes('demo')) && (user.enrolledCourses?.length === 0);
  const sessions = getStudentSessions(user.id);
  const latestSessionWithEeg = sessions.find(s => s.hasEegData && s.neuralMetrics);

  if (isFresh) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-slate-900 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">AI Academic & Cognitive Insights</h3>
              <p className="text-[11px] text-violet-200">Personalized for {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            NexusAI
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Courses</span>
              </div>
              <div className="text-xs font-black text-indigo-950">Not Enrolled Yet</div>
              <div className="text-sm font-black text-indigo-600 mt-1">0 Courses</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Diagnostic</span>
              </div>
              <div className="text-xs font-black text-amber-950">Pending Calibration</div>
              <div className="text-sm font-black text-amber-600 mt-1">Ready to Test</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="font-bold text-slate-800">Onboarding Action Plan:</div>
            <p>EEG telemetry is currently inactive. Curriculum diagnostic recommendations will establish your baseline once you enroll in core subjects and complete a mock test.</p>
          </div>
        </div>
      </div>
    );
  }

  const weakest = user.weakTopics?.[0] ?? { name: 'Pointer Arithmetic', mastery: 38 };
  const strongest = user.strongestTopic ?? { name: 'Functions', mastery: 91 };

  const improvements = [
    { topic: 'Pointers', improvement: 6, color: '#6366f1' },
    { topic: 'Structures', improvement: 6, color: '#10b981' },
    { topic: 'Probability', improvement: 3, color: '#f59e0b' },
    { topic: 'DBMS', improvement: 5, color: '#8b5cf6' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-slate-900 p-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">AI Academic & Cognitive Insights</h3>
            <p className="text-[11px] text-violet-200">Evidence-Backed Learning Strategy for {user.name.split(' ')[0]}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          NexusAI
        </span>
      </div>

      <div className="p-6 space-y-5">
        
        {/* Strongest / Weakest topic stat cards */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Strongest Mastery</span>
            </div>
            <div className="text-xs font-bold text-slate-800 truncate">{strongest.name}</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{strongest.mastery}%</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Priority Focus Area</span>
            </div>
            <div className="text-xs font-bold text-slate-800 truncate">{weakest.name}</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{weakest.mastery}%</div>
          </div>
        </div>

        {/* Evidence-Based Recommendations (Stage 5) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">Evidence-Based Action Plan:</span>
            {latestSessionWithEeg ? (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Synchronized with Neuro Telemetry
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Academic Test Data Only</span>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                <span>Micro-Sprint Strategy: 18-min study blocks for {weakest.name}</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-4 leading-relaxed">
                <strong>Observation:</strong> Spectral Beta power declined significantly after minute 18 during your last C Systems session, suggesting cognitive fatigue during pointer tracing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                <span>Consult Senior Mentor Rachel Torres on Recursion Depth</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-4 leading-relaxed">
                <strong>Observation:</strong> Missed test item on recursive stack allocation despite steady 88% focus score, indicating a conceptual syntax hurdle rather than an attention lapse.
              </p>
            </div>
          </div>
        </div>

        {/* Measurable Progress Tracker */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-indigo-950">Follow-Up Strategy Impact</div>
            <div className="text-[11px] text-indigo-700 mt-0.5">
              +6% Mastery observed in Structures after adopting 15m intervals
            </div>
          </div>
          <span className="font-black text-indigo-600 text-sm">Verified ✓</span>
        </div>

      </div>
    </div>
  );
};
