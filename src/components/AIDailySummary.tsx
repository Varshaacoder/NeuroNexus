import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Bot, Sparkles, TrendingUp, AlertTriangle, Clock, BookOpen, Zap } from 'lucide-react';
import type { UserProfile } from '../types';

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

  if (isFresh) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Today's AI Academic Insights</h3>
              <p className="text-[11px] text-violet-200">Personalized for {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            NexusAI
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Courses</span>
              </div>
              <div className="text-xs font-black text-indigo-950">Not Enrolled Yet</div>
              <div className="text-sm font-black text-indigo-600 mt-1">0 Courses</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Diagnostic</span>
              </div>
              <div className="text-xs font-black text-amber-950">Pending Calibration</div>
              <div className="text-sm font-black text-amber-600 mt-1">Ready to Test</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-800">NexusAI Onboarding Recommendations:</div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Enroll in Courses:</strong> Apply for CS201, CS202, CS204 to unlock syllabus tracking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Attend Mock Test:</strong> Complete a diagnostic test so NexusAI can identify your strengths.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Consult AI Chatbot:</strong> Go to Messages to ask your Campus AI Advisor for mentor introductions.</span>
              </li>
            </ul>
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

  const focusTopics = [
    { label: weakest.name, color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { label: 'Structures', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { label: 'Probability', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Today's AI Academic Insights</h3>
            <p className="text-[11px] text-violet-200">Personalized for {user.name.split(' ')[0]}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          NexusAI
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Strongest / Weakest topic stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Strongest</span>
            </div>
            <div className="text-sm font-black text-emerald-900 leading-tight">{strongest.name.split(' ').slice(0, 2).join(' ')}</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{strongest.mastery}%</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Weakest</span>
            </div>
            <div className="text-sm font-black text-rose-900 leading-tight">{weakest.name.split(' ').slice(0, 2).join(' ')}</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{weakest.mastery}%</div>
          </div>
        </div>

        {/* Improvement Bar Chart */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Improvement Since Last Session
          </h4>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={improvements} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `+${v}%`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }} formatter={(v) => [`+${v}%`, 'Improvement']} />
                <Bar dataKey="improvement" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {improvements.map((item, idx) => <Cell key={idx} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Focus */}
        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Recommended Focus Today
            </span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
              <Clock className="w-3 h-3" />
              90 min
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {focusTopics.map((t, i) => (
              <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${t.color}`}>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div className="text-[12px] text-slate-600 italic border-l-2 border-violet-400 pl-3">
          You improved by <strong className="text-violet-700">6%</strong> in Structures since your last test. 
          {user.streakDays ? ` You've maintained a ${user.streakDays}-day study streak. 🔥` : ''}{' '}
          Focus on <strong className="text-rose-600">{weakest.name}</strong> to unlock{' '}
          <strong className="text-amber-600">Platinum Rank</strong>.
        </div>
      </div>
    </div>
  );
};
