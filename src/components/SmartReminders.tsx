import React, { useState } from 'react';
import { Bell, BookOpen, Video, MessageSquare, FileText, AlertCircle, X, Clock, ArrowRight, Check } from 'lucide-react';
import type { SmartReminder, UserProfile } from '../types';
import { SMART_REMINDERS } from '../mockData';

interface SmartRemindersProps { user: UserProfile; }

type FilterType = 'all' | 'test' | 'mentor' | 'resource' | 'question' | 'announcement';

const COLOR_MAP: Record<string, string> = {
  rose: 'border-l-rose-500 bg-rose-50/50',
  emerald: 'border-l-emerald-500 bg-emerald-50/50',
  indigo: 'border-l-indigo-500 bg-indigo-50/50',
  violet: 'border-l-violet-500 bg-violet-50/50',
  amber: 'border-l-amber-500 bg-amber-50/50',
  cyan: 'border-l-cyan-500 bg-cyan-50/50',
};

const BADGE_MAP: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const BTN_MAP: Record<string, string> = {
  rose: 'bg-rose-600 hover:bg-rose-700 text-white',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  violet: 'bg-violet-600 hover:bg-violet-700 text-white',
  amber: 'bg-amber-500 hover:bg-amber-600 text-white',
  cyan: 'bg-cyan-600 hover:bg-cyan-700 text-white',
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  test: <AlertCircle className="w-4 h-4" />,
  resource: <FileText className="w-4 h-4" />,
  mentor: <MessageSquare className="w-4 h-4" />,
  announcement: <Bell className="w-4 h-4" />,
  question: <BookOpen className="w-4 h-4" />,
  session: <Video className="w-4 h-4" />,
};

export const SmartReminders: React.FC<SmartRemindersProps> = ({ user }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [actioned, setActioned] = useState<Set<string>>(new Set());

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'test', label: '📝 Tests' },
    { key: 'mentor', label: '🤝 Mentors' },
    { key: 'resource', label: '📂 Resources' },
    { key: 'question', label: '❓ Q&A' },
    { key: 'announcement', label: '📢 Notices' },
  ];

  const visible = SMART_REMINDERS.filter(r =>
    !dismissed.has(r.id) && (filter === 'all' || r.type === filter)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Smart Reminders & Alerts</h3>
          {visible.filter(r => r.urgent).length > 0 && (
            <span className="w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
              {visible.filter(r => r.urgent).length}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{visible.length} active</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              filter === f.key
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No reminders in this category
          </div>
        )}
        {visible.map((reminder) => (
          <div key={reminder.id}
            className={`border-l-4 rounded-r-2xl p-4 border border-l-4 ${COLOR_MAP[reminder.color]} transition-all`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 text-slate-400">
                {TYPE_ICON[reminder.type] || <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_MAP[reminder.color]}`}>
                        {reminder.tag}
                      </span>
                      {reminder.urgent && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{reminder.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{reminder.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {reminder.meta}
                    </p>
                  </div>
                  <button onClick={() => setDismissed(prev => new Set([...prev, reminder.id]))}
                    className="shrink-0 text-slate-300 hover:text-slate-600 transition-colors mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {actioned.has(reminder.id) ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                      <Check className="w-3.5 h-3.5" />Actioned
                    </span>
                  ) : (
                    <button
                      onClick={() => setActioned(prev => new Set([...prev, reminder.id]))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${BTN_MAP[reminder.color]}`}
                    >
                      {reminder.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
