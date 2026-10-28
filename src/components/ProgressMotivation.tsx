import React from 'react';
import { TrendingUp, Award, Flame, Users, BookOpen } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProgressMotivationProps { user: UserProfile; }

export const ProgressMotivation: React.FC<ProgressMotivationProps> = ({ user }) => {
  const isFresh = (!user.email?.toLowerCase().includes('demo')) && (user.enrolledCourses?.length === 0);

  const motivations = isFresh ? [
    {
      icon: <Award className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50', border: 'border-amber-200', badge: 'Fresh Start',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: 'Account Initialized',
      detail: 'Welcome to Apex Institute! Your profile is ready for academic onboarding.'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'Step 1',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      title: 'Course Enrollment',
      detail: 'Choose your semester core courses in the Courses tab to begin syllabus tracking.'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'Step 2',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Diagnostic Test',
      detail: 'Attend a 15-min mock test to analyze your baseline and unlock your topic radar.'
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50', border: 'border-purple-200', badge: 'Step 3',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'Campus AI Chatbot',
      detail: 'Consult your AI Advisor in Messages to get introduced to mentors and seniors.'
    },
  ] : [
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'Concept Climb',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Pointer Mastery +14%',
      detail: 'Pointer score improved from 38% → 52% across 3 targeted drills.'
    },
    {
      icon: <Flame className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50', border: 'border-amber-200', badge: 'Streak Master',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: `${user.streakDays ?? 5}-Day Study Streak`,
      detail: 'Daily study goal completed for 5 consecutive days without interruption.'
    },
    {
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'Peer Hero',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      title: 'Peer Impact: 3 Answers',
      detail: 'You answered 3 questions in Functions & Scope, helping classmates pass.'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50', border: 'border-purple-200', badge: 'Monthly Milestone',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'Course Progress +12%',
      detail: 'Monthly syllabus completion increased by 12% across all courses.'
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900">Academic Milestones & Progress</h3>
        <span className="ml-auto text-[11px] text-slate-400 font-medium">Data-driven insights</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {motivations.map((m, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${m.bg} ${m.border}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl ${m.bg} border ${m.border} flex items-center justify-center shrink-0`}>
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-black text-slate-900">{m.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{m.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
