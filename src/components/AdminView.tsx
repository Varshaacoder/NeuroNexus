import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileCheck2, 
  BarChart, 
  Lock, 
  Database, 
  Server,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminViewProps {
  user: UserProfile;
}

export const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      
      {/* Welcome Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            System Administrator & Institutional Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome, <span className="text-purple-700">{user.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Apex Institute of Science & Technology • Enterprise Single Sign-On & Diagnostic Compliance
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Students Enrolled', val: '1,248', desc: 'Across 4 Engineering Depts', icon: <Users className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' },
          { label: 'Diagnostic Baseline Rate', val: '96.4%', desc: '1,203 initial profiles calibrated', icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Faculty Verified Solutions', val: '438', desc: '100% peer QA coverage', icon: <CheckCircle2 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' },
          { label: 'FERPA & SSO Compliance', val: '100%', desc: 'TLS 256-bit cryptographic tokens', icon: <ShieldCheck className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 border-purple-200' },
        ].map((stat) => (
          <div key={stat.label} className={`p-5 rounded-2xl border ${stat.bg} shadow-2xs`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{stat.label}</span>
              <div className="p-2 rounded-xl bg-white shadow-2xs">{stat.icon}</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.val}</div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Security & Department Baseline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <span>Campus Authentication & SSO Logs</span>
          </h2>
          <div className="space-y-2 text-xs font-mono">
            {[
              { time: '18:04:12', event: 'Google Workspace OAuth2 token verified: demo.student@apex.edu', status: 'PASS' },
              { time: '18:01:45', event: 'OTP Dispatched (AES-256): yumi.tanaka@apex.edu', status: 'SENT' },
              { time: '17:58:20', event: 'Faculty Session Elevated: a.thorne@apex.edu [RBAC: Faculty Mentor]', status: 'AUTH' },
              { time: '17:55:02', event: 'Diagnostic Assessment Profile Committed: alex.chen@apex.edu', status: 'DB_SYNC' },
            ].map((log, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{log.time}</span>
                <span className="text-slate-800 truncate mx-2">{log.event}</span>
                <span className="text-emerald-700 font-bold">{log.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            <span>Department Diagnostic Benchmarks</span>
          </h2>
          <div className="space-y-3">
            {[
              { dept: 'Computer Science & Engineering', avg: 74, benchmark: 'Exceeding Target' },
              { dept: 'Information Technology', avg: 71, benchmark: 'On Track' },
              { dept: 'Electronics & Communication', avg: 66, benchmark: 'Intervention Scheduled' },
            ].map((d) => (
              <div key={d.dept} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>{d.dept}</span>
                  <span className="text-purple-700">{d.avg}% Avg Mastery</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${d.avg}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-right">{d.benchmark}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
