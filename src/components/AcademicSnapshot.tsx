import React from 'react';
import { UserProfile } from '../types';
import { AVAILABLE_COURSES } from '../mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';
import { BookOpen, Target, Sparkles, ArrowRight, Award } from 'lucide-react';

interface AcademicSnapshotProps {
  user: UserProfile;
  onNavigateCourses?: () => void;
  onOpenMockTest?: () => void;
}

export const AcademicSnapshot: React.FC<AcademicSnapshotProps> = ({ user, onNavigateCourses, onOpenMockTest }) => {
  const isFresh = (!user.email?.toLowerCase().includes('demo')) && (user.enrolledCourses?.length === 0);

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
            Since you are a new student who hasn't applied for courses yet, your weekly reports are fresh. Join courses to begin syllabus tracking, and attend a diagnostic mock test so our system can analyze your baseline knowledge.
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

  const courseProgress = AVAILABLE_COURSES.slice(0, 4).map(c => ({
    name: c.code,
    progress: c.progress,
    fill: c.color === 'indigo' ? '#4f46e5' : c.color === 'emerald' ? '#10b981' : c.color === 'amber' ? '#f59e0b' : '#8b5cf6'
  }));

  const weakTopics = [
    { topic: 'Pointer Arithmetic', mastery: 38 },
    { topic: 'Relational Algebra', mastery: 42 },
    { topic: 'Discrete Probability', mastery: 48 },
  ];

  const strongTopics = [
    { topic: 'Functions & Scope', mastery: 91 },
    { topic: 'Linear Arrays', mastery: 88 },
    { topic: 'Basic SQL Queries', mastery: 85 },
  ];

  const monthlyImprovement = [
    { week: 'Week 1', Pointers: 10, Recursion: 15, Graphs: 5 },
    { week: 'Week 2', Pointers: 15, Recursion: 20, Graphs: 10 },
    { week: 'Week 3', Pointers: 25, Recursion: 30, Graphs: 20 },
    { week: 'Week 4', Pointers: 35, Recursion: 42, Graphs: 48 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Course Progress</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseProgress} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 600 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={24}>
                {courseProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="progress" position="right" formatter={(val: any) => `${val}%`} fill="#64748b" fontWeight={500} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-rose-600 mb-4">Weak Topics Requiring Attention</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weakTopics} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 14 }} />
                <Tooltip cursor={{ fill: '#fff1f2' }} />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]} barSize={20}>
                  {weakTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mastery < 40 ? '#e11d48' : '#f59e0b'} />
                  ))}
                  <LabelList dataKey="mastery" position="right" formatter={(val: any) => `${val}%`} fill="#64748b" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-emerald-600 mb-4">Strong Topics</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strongTopics} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 14 }} />
                <Tooltip cursor={{ fill: '#ecfdf5' }} />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]} barSize={20}>
                  {strongTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mastery > 90 ? '#10b981' : '#34d399'} />
                  ))}
                  <LabelList dataKey="mastery" position="right" formatter={(val: any) => `${val}%`} fill="#64748b" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Progress Improvement This Month</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyImprovement} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="Pointers" fill="#e11d48" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recursion" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Graphs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-600"></div>
            <span className="text-sm text-slate-600 font-medium">Pointers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-600 font-medium">Recursion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-slate-600 font-medium">Graphs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
