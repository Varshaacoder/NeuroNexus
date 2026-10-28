import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  TrendingDown, 
  Upload, 
  Megaphone,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { UserProfile } from '../types';

interface FacultyViewProps {
  user: UserProfile;
}

export const FacultyView: React.FC<FacultyViewProps> = ({ user }) => {
  const [verifiedList, setVerifiedList] = useState<number[]>([1]);

  const toggleVerify = (id: number) => {
    if (verifiedList.includes(id)) {
      setVerifiedList(verifiedList.filter(item => item !== id));
    } else {
      setVerifiedList([...verifiedList, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Faculty Mentor & Course Director Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome, <span className="text-emerald-700">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              CS201 C Systems & CS204 Database Systems • 142 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert('Resource upload form opened: attach PDF lecture notes and memory traces')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Handout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Verification Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class Weak Topic Radar */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-black text-slate-900">Classroom Blind Spots</h2>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Attention Required
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-950">1. Pointer Arithmetic & Double Pointers</span>
                <span className="text-rose-700">Class Average: 39%</span>
              </div>
              <p className="text-[11px] text-rose-800">
                Over 64% of students confuse <code className="bg-white px-1 rounded font-mono">*p++</code> with <code className="bg-white px-1 rounded font-mono">(*p)++</code> in recent diagnostic quizzes.
              </p>
              <button 
                onClick={() => alert('Broadcasting 10-minute automated review prompt to all enrolled students.')}
                className="mt-1 px-3 py-1 bg-white border border-rose-300 text-rose-800 rounded-lg text-[10px] font-bold hover:bg-rose-100"
              >
                Broadcast 10m Micro-Revision to Class
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-950">2. Relational Algebra Normalization (3NF)</span>
                <span className="text-amber-700">Class Average: 54%</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Upcoming quiz tomorrow morning. Practice questions recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Faculty Verification Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-black text-slate-900">Faculty Verified Badge Queue</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">2 Submissions</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 1,
                author: 'Yumi Tanaka',
                question: 'Difference between int *p[5] and int (*p)[5] in array memory layout?',
                answer: 'int *p[5] is an array of 5 pointers to int. int (*p)[5] is a single pointer pointing to an array of 5 ints.',
              },
              {
                id: 2,
                author: 'Demo Student',
                question: 'Does free() automatically set the pointer to NULL?',
                answer: 'No, free() returns the memory to the heap allocator but leaves the pointer dangling with its old address.',
              }
            ].map((item) => {
              const isVerified = verifiedList.includes(item.id);
              return (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Student: {item.author}</span>
                    {isVerified ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Faculty Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800">Q: {item.question}</p>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                    A: {item.answer}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => toggleVerify(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isVerified
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                      }`}
                    >
                      {isVerified ? 'Revoke Badge' : '✓ Award Faculty Verified Badge'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
