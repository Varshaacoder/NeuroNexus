import React from 'react';
import { UserProfile } from '../types';
import { AVAILABLE_COURSES } from '../mockData';
import { isDemoUser } from '../utils/neuroSessionStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';
import { BookOpen, Target, Sparkles, ArrowRight, Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface AcademicSnapshotProps {
  user: UserProfile;
  onNavigateCourses?: () => void;
  onOpenMockTest?: () => void;
}

export const AcademicSnapshot: React.FC<AcademicSnapshotProps> = ({ user, onNavigateCourses, onOpenMockTest }) => {
  const isDemo = isDemoUser(user.id, user.email);
  const isFresh = (!isDemo) && (user.enrolledCourses?.length === 0);

  if (isFresh) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Personalized Knowledge & Syllabus Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">Syllabus mastery, weak topic diagnostics, and monthly velocity</p>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateCourses && (
              <button
                onClick={onNavigateCourses}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Browse Courses</span>
                <ArrowRight size={13} />
              </button>
            )}
            {onOpenMockTest && (
              <button
                onClick={onOpenMockTest}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Target size={13} />
                <span>Attend Mock Test</span>
              </button>
            )}
          </div>
        </div>

        <div className="py-8 px-4 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
            <BookOpen size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">No Course Reports or Analysis Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Since you are a new student who hasn't enrolled in courses yet, your weekly reports are fresh. Join courses to begin syllabus tracking, and attend a diagnostic mock test so our system can analyze your baseline knowledge.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
            <div 
              onClick={onNavigateCourses}
              className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-indigo-600 font-bold text-xs mb-1">
                <span>1. Course Enrollment</span>
                <ArrowRight size={12} />
              </div>
              <p className="text-xs font-semibold text-slate-800">Enroll in core subjects</p>
              <p className="text-[11px] text-slate-400 mt-1">CS201, CS202, CS204 to unlock syllabus tracking.</p>
            </div>

            <div 
              onClick={onOpenMockTest}
              className="p-4 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-amber-600 font-bold text-xs mb-1">
                <span>2. Attend Mock Test</span>
                <ArrowRight size={12} />
              </div>
              <p className="text-xs font-semibold text-slate-800">Analyze your baseline</p>
              <p className="text-[11px] text-slate-400 mt-1">15-minute diagnostic test to build your topic radar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate genuine progress for enrolled courses
  const courseProgress = (user.enrolledCourses && user.enrolledCourses.length > 0)
    ? AVAILABLE_COURSES.filter(c => user.enrolledCourses.includes(c.id)).map(c => ({
        name: c.code,
        progress: isDemo ? c.progress : (user.overallProgress || 0),
        fill: c.color === 'indigo' ? '#4f46e5' : c.color === 'emerald' ? '#10b981' : c.color === 'amber' ? '#f59e0b' : '#8b5cf6'
      }))
    : (isDemo ? AVAILABLE_COURSES.slice(0, 4).map(c => ({
        name: c.code,
        progress: c.progress,
        fill: '#4f46e5'
      })) : []);

  const demoWeakTopics = [
    { topic: 'Pointer Arithmetic', mastery: 38, focusContext: '79% Focus (High effort, memory tracing bottleneck)', status: 'Cognitive Saturation' },
    { topic: 'Relational Algebra', mastery: 42, focusContext: '68% Focus (Attention drift after 15m)', status: 'Vigilance Dip' },
    { topic: 'Discrete Probability', mastery: 48, focusContext: '74% Focus (Moderate stability)', status: 'Needs Practice' },
  ];

  const userWeakTopics = (user.weakTopics && user.weakTopics.length > 0)
    ? user.weakTopics.map(w => ({
        topic: w.name,
        mastery: w.mastery,
        focusContext: `${user.focusScore || 0}% Focus observed`,
        status: 'Needs Practice'
      }))
    : (isDemo ? demoWeakTopics : []);

  const demoStrongTopics = [
    { topic: 'Functions & Scope', mastery: 91, focusContext: '92% Focus (Flow state)' },
    { topic: 'Linear Arrays', mastery: 88, focusContext: '86% Focus (Steady)' },
    { topic: 'Basic SQL Queries', mastery: 85, focusContext: '84% Focus (Optimal)' },
  ];

  const userStrongTopics = user.strongestTopic
    ? [{ topic: user.strongestTopic.name, mastery: user.strongestTopic.mastery, focusContext: 'Verified Strong Foundation' }]
    : (isDemo ? demoStrongTopics : []);

  const monthlyImprovement = isDemo ? [
    { week: 'Week 1', Pointers: 10, Recursion: 15, Graphs: 5 },
    { week: 'Week 2', Pointers: 15, Recursion: 20, Graphs: 10 },
    { week: 'Week 3', Pointers: 25, Recursion: 30, Graphs: 20 },
    { week: 'Week 4', Pointers: 35, Recursion: 42, Graphs: 48 },
  ] : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-7">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic & Cognitive Analytics</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Topic Mastery + Neural Context</h2>
          <p className="text-xs text-slate-500 mt-0.5">Cross-referencing demonstrated problem-solving accuracy with observed attentional engagement</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Stage 4: Unified Analytics
          </span>
        </div>
      </div>

      {/* Scientific Caution Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Principle:</strong> EEG indicators represent observational physiological context (cognitive workload, mental effort, and vigilance drift). Academic mastery is evaluated directly through problem-solving accuracy and verified assessment evidence. Correlation does not imply causation.
        </div>
      </div>

      {/* Course Progress Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>Active Course Progress</span>
          <span className="text-xs text-slate-400 font-normal">Syllabus Completion</span>
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseProgress} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={22}>
                {courseProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="progress" position="right" formatter={(val: any) => `${val}%`} fill="#64748b" fontWeight={600} fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column: Weak Topics + Strong Topics with Neural Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Weak Topics with Neural Observations */}
        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-800">Weak Topics Requiring Practice</h3>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md">
              {userWeakTopics.length} Identified
            </span>
          </div>

          <div className="space-y-3">
            {userWeakTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-rose-100 flex flex-col items-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1.5" />
                <span className="font-bold text-slate-800">No Weak Topics Identified Yet</span>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  You have not missed questions in any assessments yet. Take a diagnostic test to evaluate topics.
                </p>
              </div>
            ) : (
              userWeakTopics.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200/60 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.topic}</span>
                    <span className="font-black text-rose-600">{item.mastery}% Mastery</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.mastery}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span className="text-indigo-700 font-medium">{item.focusContext}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{item.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Strong Topics with Neural Observations */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-800">Verified Strong Topics</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
              {userStrongTopics.length} Identified
            </span>
          </div>

          <div className="space-y-3">
            {userStrongTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-emerald-100 flex flex-col items-center">
                <Award className="w-7 h-7 text-slate-300 mb-1.5" />
                <span className="font-bold text-slate-800">No Strong Topics Recorded Yet</span>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Demonstrated competencies will appear here as you take tests and complete modules.
                </p>
              </div>
            ) : (
              userStrongTopics.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200/60 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.topic}</span>
                    <span className="font-black text-emerald-600">{item.mastery}% Mastery</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.mastery}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span className="text-emerald-700 font-medium">{item.focusContext}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">High Stability</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Monthly Improvement with Multi-Subject Bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Assessment Improvement Velocity This Month</h3>
          <span className="text-xs text-slate-400">Weekly Delta</span>
        </div>
        {monthlyImprovement.length === 0 ? (
          <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <TrendingUp className="w-7 h-7 text-slate-300 mb-1.5" />
            <span className="text-xs font-bold text-slate-700">No Assessment History Recorded Yet</span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Topic-by-topic growth will track here over time as you complete practice tests.
            </p>
          </div>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyImprovement} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="Pointers" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Recursion" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Graphs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                <span className="text-slate-600 font-semibold">Pointer Arithmetic (+25%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-slate-600 font-semibold">Recursion (+27%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-600 font-semibold">Graph Algorithms (+43%)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

