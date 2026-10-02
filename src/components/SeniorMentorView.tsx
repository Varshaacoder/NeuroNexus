import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Award, 
  ChevronRight, 
  BookOpen, 
  Clock,
  Send
} from 'lucide-react';
import { UserProfile } from '../types';

interface SeniorMentorViewProps {
  user: UserProfile;
  onOpenAIClassroom: () => void;
}

export const SeniorMentorView: React.FC<SeniorMentorViewProps> = ({
  user,
  onOpenAIClassroom,
}) => {
  const [mentees, setMentees] = useState([
    { name: 'Yumi Tanaka', progress: 68, weakTopic: 'Pointer Arithmetic', status: 'Active 2h ago', flag: 'Needs 1-on-1 drill' },
    { name: 'Demo Student', progress: 71, weakTopic: 'Probability & Pointers', status: 'Online now', flag: 'Mock test taken' },
    { name: 'Alex Chen', progress: 45, weakTopic: 'C Syntax & Memory', status: 'Onboarding completed', flag: 'New mentee' },
  ]);

  const [questions, setQuestions] = useState([
    { id: 1, student: 'Yumi Tanaka', question: 'How does dynamic memory deallocation with free() track the block size?', topic: 'Memory & Heap', time: '15m ago', answered: false },
    { id: 2, student: 'Demo Student', question: 'Can an array of pointers have varying row lengths in C?', topic: 'Pointer Arrays', time: '1h ago', answered: true },
  ]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Senior Peer Mentor Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome, <span className="text-indigo-600">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Assigned to CS201 & CS202. You have 3 active mentees and 1 peer question awaiting clarification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAIClassroom}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-200 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Peer Study Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Mentees & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mentees Tracking */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-black text-slate-900">Assigned Mentees</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">3 Students</span>
          </div>

          <div className="space-y-3">
            {mentees.map((m) => (
              <div key={m.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{m.name}</span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.2 rounded border border-rose-200">
                      Weak: {m.weakTopic}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {m.status} • {m.flag}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-indigo-600">{m.progress}%</div>
                  <button className="text-[10px] font-bold text-indigo-700 hover:underline mt-0.5">
                    Schedule 1-on-1
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peer Q&A Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-black text-slate-900">Peer Question Queue</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              1 Unresolved
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{q.student}</span>
                  <span className="text-[10px] text-slate-400">{q.time}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">"{q.question}"</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {q.topic}
                  </span>
                  <button
                    onClick={() => alert(`Answer modal opened for student question by ${q.student}`)}
                    className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-2xs"
                  >
                    Reply to Student
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
