import React from 'react';
import { Clock, MapPin, Users, Bot, GraduationCap, Brain, Activity } from 'lucide-react';
import type { TimetableItem, UserProfile } from '../types';
import { TODAY_TIMETABLE } from '../mockData';

interface TimetableScheduleProps { user: UserProfile; onOpenAIClassroom: () => void; }

const TYPE_CONFIG: Record<TimetableItem['type'], { icon: React.ReactNode; bg: string; badge: string; badgeColor: string; }> = {
  lecture: {
    icon: <GraduationCap className="w-4 h-4" />,
    bg: 'bg-indigo-50 border-indigo-200', badge: 'Lecture', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  lab: {
    icon: <Brain className="w-4 h-4" />,
    bg: 'bg-emerald-50 border-emerald-200', badge: 'Lab', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  office_hours: {
    icon: <Users className="w-4 h-4" />,
    bg: 'bg-amber-50 border-amber-200', badge: 'Office Hours', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  peer_study: {
    icon: <Activity className="w-4 h-4" />,
    bg: 'bg-violet-50 border-violet-200', badge: 'Peer Study', badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  ai_focus: {
    icon: <Bot className="w-4 h-4" />,
    bg: 'bg-cyan-50 border-cyan-200', badge: 'AI Focus', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
};

export const TimetableSchedule: React.FC<TimetableScheduleProps> = ({ user, onOpenAIClassroom }) => {
  const now = new Date();
  const hour = now.getHours();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Today's Timetable</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="space-y-2.5">
        {TODAY_TIMETABLE.map((item) => {
          const config = TYPE_CONFIG[item.type];
          const isActive = item.activeNow;

          return (
            <div key={item.id}
              className={`flex gap-3 p-3.5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-50 to-indigo-50 border-cyan-300 ring-2 ring-cyan-300/30'
                  : `${config.bg} border`
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-slate-600 ${
                isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-white/70'
              }`}>
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${config.badgeColor}`}>
                        {config.badge}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-600 text-white animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.instructorOrPeer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-700">{item.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                  {isActive && (
                    <button onClick={onOpenAIClassroom}
                      className="text-[11px] font-bold text-cyan-700 hover:underline flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      Join AI Session →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
