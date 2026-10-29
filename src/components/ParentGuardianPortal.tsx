import React from 'react';
import { ShieldCheck, EyeOff, BookOpen, Heart, Award, CheckCircle2, Lock, LifeBuoy } from 'lucide-react';
import type { UserProfile } from '../types';

interface ParentGuardianPortalProps {
  user: UserProfile;
  onNavigateDashboard?: () => void;
}

export const ParentGuardianPortal: React.FC<ParentGuardianPortalProps> = ({ user, onNavigateDashboard }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-[#17213B]">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-bold mb-2 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized Guardian Portal</span>
        </div>
        <h1 className="text-3xl font-black text-[#17213B]">Family Support & Wellbeing Overview</h1>
        <p className="text-[#64708A] text-sm mt-1">
          Viewing authorized records for <strong className="text-[#17213B]">Alex Rivera</strong>. Logged in as <span className="text-[#059669] font-bold">Eleanor Rivera</span> (Guardian).
        </p>
      </div>

      {/* Strict Privacy Boundary Banner */}
      <div className="p-5 border border-[#A7F3D0] bg-[#ECFDF5] rounded-2xl text-xs text-[#065F46] leading-relaxed space-y-1 shadow-2xs">
        <div className="font-bold flex items-center gap-2 text-sm text-[#047857]">
          <EyeOff className="w-4 h-4" />
          <span>Privacy Boundary Enforced</span>
        </div>
        <p>
          This portal displays <strong>ONLY</strong> academic summaries and wellbeing check-ins that the student has explicitly authorized. Private student notes and raw EEG biopotentials are strictly inaccessible.
        </p>
      </div>

      {/* Authorized Academic Progress Summary */}
      <div className="p-6 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#17213B] border-b border-[#E1E7F2] pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2855D9]" />
          <span>Authorized Academic Progress Summary</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17213B] text-sm">Java OOP & Inheritance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">CS201</span>
            </div>
            <div className="text-3xl font-black text-[#059669]">80%</div>
            <div className="text-[#64708A] text-xs">4 / 5 verified quiz answers</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17213B] text-sm">Recursion & Base Cases</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">CS301</span>
            </div>
            <div className="text-3xl font-black text-[#D97706]">40%</div>
            <div className="text-[#64708A] text-xs">2 / 5 verified quiz answers</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17213B] text-sm">Database Normalization</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">CS204</span>
            </div>
            <div className="text-3xl font-black text-[#059669]">85%</div>
            <div className="text-[#64708A] text-xs">5 / 6 verified quiz answers</div>
          </div>

        </div>
      </div>

      {/* Student-Shared Wellbeing Check-ins */}
      <div className="p-6 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#17213B] border-b border-[#E1E7F2] pb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#8755E8]" />
          <span>Student-Shared Wellbeing Check-ins</span>
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#E1E7F2] shadow-2xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17213B] text-sm flex items-center gap-2">
                <span>Feeling stressed 😰</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Explicitly Shared by Student
                </span>
              </span>
              <span className="text-[#8E9BB0] text-[10px]">Shared: Oct 28, 2026</span>
            </div>
            <p className="text-[#64708A] italic leading-relaxed">
              "Balancing CS201 midterms and CS301 recursion labs this week."
            </p>
            <div className="text-[11px] text-[#059669] font-medium pt-1">
              ✓ Student authorized this notification to foster constructive family encouragement.
            </div>
          </div>
        </div>
      </div>

      {/* Support & Resources */}
      <div className="p-6 bg-[#F3F6FF] border border-[#E1E7F2] rounded-2xl space-y-3 text-xs text-[#64708A]">
        <div className="font-bold text-[#17213B] flex items-center gap-2 text-sm">
          <LifeBuoy className="w-4 h-4 text-[#2855D9]" />
          <span>Guardian Resources & Counseling Liaison</span>
        </div>
        <p>If you would like guidance on supporting your student through rigorous STEM coursework, confidential campus resources are available:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[#17213B] font-semibold">
          <div className="p-3 rounded-xl bg-white border border-[#E1E7F2]">Family Academic Liaison: (555) 234-5678 (M-F 9am-5pm)</div>
          <div className="p-3 rounded-xl bg-white border border-[#E1E7F2]">Student Advising Portal: advising@apex.edu</div>
        </div>
      </div>

    </div>
  );
};
