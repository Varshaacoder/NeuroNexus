import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Award, Flame, Clock, TrendingUp, ArrowRight,
  AlertTriangle, FileCheck2, Video, BookOpen, HelpCircle, Target, Sparkles, Users
} from 'lucide-react';
import { Brain } from 'lucide-react';
import type { UserProfile } from '../types';

interface WelcomeCardProps {
  user: UserProfile;
  onOpenRevision: (topic: string) => void;
  onOpenPracticeQuestions: (topic: string) => void;
  onOpenMiniAssessment: (topic: string) => void;
  onOpenMockTest: () => void;
  onOpenAIClassroom: () => void;
  onOpenPomodoro: () => void;
  onNavigateCourses: () => void;
  onNavigateMessages?: () => void;
  onNavigateTests?: () => void;
  onNavigateNeuroAnalysis?: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  user, onOpenRevision, onOpenPracticeQuestions, onOpenMiniAssessment,
  onOpenMockTest, onOpenAIClassroom, onOpenPomodoro, onNavigateCourses,
  onNavigateMessages, onNavigateTests, onNavigateNeuroAnalysis,
}) => {
  const isFreshUser = (!user.email?.toLowerCase().includes('demo')) && (user.enrolledCourses?.length === 0);
  const recommendedTopic = user.weakTopics?.[0] ?? { name: 'Pointer Arithmetic', mastery: 41, course: 'C Programming & Systems' };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning.';
    if (h < 17) return 'Good Afternoon.';
    return 'Good Evening.';
  };

  const currentRank = user.rank || 'Bronze Scholar';
  const progressPct = user.overallProgress ?? 0;
  const focusPct = user.focusScore ?? 0;
  const pomodoroCount = user.pomodoroCountWeek ?? 0;
  const streak = user.streakDays ?? 0;

  return (
    <div className="space-y-6">
      
      {/* ── PERSONALIZED WELCOME CARD (CLEAN LIGHT MODE) ────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 border border-slate-200 shadow-xs"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isFreshUser ? (
                  <>Welcome, <span className="text-indigo-600">{user.name.split(' ')[0]}</span>! 🎓</>
                ) : (
                  <>Welcome Back, <span className="text-indigo-600">{user.name.split(' ')[0]}</span></>
                )}
              </h1>
              <div className="text-sm font-semibold text-slate-500 mt-1">
                {isFreshUser ? 'Fresh Student Profile • Ready for Course Selection' : getGreeting()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {isFreshUser ? 'Freshman Scholar (Uncalibrated)' : `You are currently ranked ${currentRank}.`}
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">• {user.department}</span>
              </div>
            </div>
          </div>

          {/* Course Navigation shortcut */}
          <button
            onClick={onNavigateCourses}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-bold text-slate-700 hover:text-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>{isFreshUser ? 'Browse Courses to Enroll' : `View Enrolled Courses (${user.enrolledCourses?.length ?? 4})`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── FRESH USER ONBOARDING OR METRIC STAT CARDS ROW ────────────────────────── */}
        {isFreshUser ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-amber-50/50 border border-indigo-100 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Get Started: Calibrate Your Academic Profile</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              As a new student, your personal analytics, weekly study velocity, and topic mastery reports will generate once you enroll in courses and take your first diagnostic test. Follow these recommended next steps:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Step 1: Enroll in Courses & Groups */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">1. Enroll in Courses & Groups</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-normal">
                    Choose core subjects for your department (CS201, CS202, CS204) and join batch study circles.
                  </p>
                </div>
                <button
                  onClick={onNavigateCourses}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step 2: Diagnostic Mock Test */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">2. Attend Mock Test</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-normal">
                    Take a 15-minute diagnostic test to calibrate your strengths and build your Topic Mastery Radar.
                  </p>
                </div>
                <button
                  onClick={onOpenMockTest}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Start Diagnostic Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step 3: Connect with Mentors & Seniors */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">3. Connect with Mentors</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-normal">
                    Your Campus AI Advisor in Messages will help you connect with faculty leads and senior mentors.
                  </p>
                </div>
                <button
                  onClick={onNavigateMessages || onNavigateCourses}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open AI Advisor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── METRIC STAT CARDS ROW ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Overall Academic Progress */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                <div className="flex items-center justify-between text-indigo-700 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Academic Progress</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1">
                  Overall: {progressPct}%
                </div>
                <div className="w-full h-1.5 bg-indigo-200 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* 2. Focus Score */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/80">
                <div className="flex items-center justify-between text-purple-700 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Cognitive Index</span>
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1">
                  Focus Score: {focusPct}%
                </div>
                <div className="text-[11px] text-purple-600 font-semibold mt-2.5">
                  Top 15% attention retention
                </div>
              </div>

              {/* 3. Pomodoro Sessions */}
              <div
                onClick={onOpenPomodoro}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/80 cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div className="flex items-center justify-between text-amber-700 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pomodoro Timer</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {pomodoroCount} Sessions
                </div>
                <div className="text-[11px] text-amber-700 font-semibold mt-2.5">
                  Completed this week
                </div>
              </div>

              {/* 4. Study Streak */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                <div className="flex items-center justify-between text-emerald-700 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Study Momentum</span>
                  <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  {streak} Days
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-2.5">
                  Consecutive daily goal met
                </div>
              </div>
            </div>

            {/* ── CURRENT RECOMMENDED TOPIC ────────────────────────────────────── */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Current Recommended Topic:
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {recommendedTopic.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {recommendedTopic.course ?? 'C Programming & Systems'} • Understanding: <span className="font-bold text-rose-600">{recommendedTopic.mastery}%</span>
                  </div>
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                    <span>Understanding</span>
                    <span className="text-rose-600 font-black">{recommendedTopic.mastery}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: `${recommendedTopic.mastery}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Target: 80% to reach Gold threshold</div>
                </div>
              </div>
            </div>

            {/* ── SUGGESTED NEXT ACTION (COLORFUL BUTTON ACCESSORIES) ──────────── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Suggested Next Actions:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Quick Pathways</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Action 1: 10-minute revision (Emerald) */}
                <button
                  onClick={() => onOpenRevision(recommendedTopic.name)}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Revision (10m)</span>
                </button>

                {/* Action 2: 5 practice questions (Indigo) */}
                <button
                  onClick={() => onOpenPracticeQuestions(recommendedTopic.name)}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">5 Practice Qs</span>
                </button>

                {/* Action 3: Mini assessment (Amber) */}
                <button
                  onClick={() => onOpenMiniAssessment(recommendedTopic.name)}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-xs shadow-amber-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Assessment</span>
                </button>

                {/* Action 4: Start AI Classroom Session (Cyan/Violet) */}
                <button
                  onClick={onOpenAIClassroom}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xs shadow-violet-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <Video className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">AI Classroom</span>
                </button>

                {/* Action 5: Tests Hub (Blue) */}
                <button
                  onClick={onNavigateTests}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">Scheduled Tests</span>
                </button>

                {/* Action 6: Neuro Analysis (Purple/Fuchsia) */}
                <button
                  onClick={onNavigateNeuroAnalysis}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                  <Brain className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                  <span className="truncate">Neuro Analysis</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── GRAPH ANALYSIS GRID (RECHARTS VISUALIZATION) ────────────────────────── */}
      {isFreshUser ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Performance Analytics & Mastery Radar</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Weekly progress velocity, Topic Mastery Radar, and daily focus hours will begin calculating as you attend mock tests and complete course modules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Weekly Progress Dual-Series Area & Line Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">Weekly Progress Analysis</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Dual Metric
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Mastery vs. Cognitive Focus Stability</p>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0" />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-bold mb-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1 text-indigo-600">
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                  <span>Academic Mastery</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                  <span>Cognitive Workload Index</span>
                </div>
              </div>

              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { week: 'W1', academicScore: 52, cognitiveIndex: 68 },
                      { week: 'W2', academicScore: 58, cognitiveIndex: 72 },
                      { week: 'W3', academicScore: 61, cognitiveIndex: 76 },
                      { week: 'W4', academicScore: 67, cognitiveIndex: 81 },
                      { week: 'W5', academicScore: progressPct || 71, cognitiveIndex: focusPct || 85 },
                    ]}
                    margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="academicGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cognitiveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        `${val}%`,
                        String(name) === 'academicScore' ? 'Academic Mastery' : 'Cognitive Workload Index'
                      ]}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="academicScore"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#academicGrad)"
                      dot={{ fill: '#6366f1', strokeWidth: 0, r: 2.5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cognitiveIndex"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      fill="url(#cognitiveGrad)"
                      dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 2.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500 text-[11px]">Velocity: +{progressPct - 48}% mastery</span>
              <span className="font-bold text-purple-600 text-[11px]">+6.2% focus stability</span>
            </div>
          </div>

          {/* 2. Topic Mastery Radar Chart with Neural Context */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Topic Mastery Radar</h3>
                  <p className="text-xs text-slate-500">Problem-solving vs. Neural Stability</p>
                </div>
                <Award className="w-5 h-5 text-amber-500 shrink-0" />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-bold mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1 text-purple-600">
                  <div className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
                  <span>Demonstrated Mastery</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-600">
                  <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                  <span>Observed Neural Focus</span>
                </div>
              </div>

              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                    { subject: 'C Systems', mastery: 74, neuralStability: 82 },
                    { subject: 'Data Structures', mastery: 88, neuralStability: 86 },
                    { subject: 'DBMS', mastery: 65, neuralStability: 78 },
                    { subject: 'Probability', mastery: 42, neuralStability: 64 },
                    { subject: 'Functions', mastery: 91, neuralStability: 88 },
                    { subject: 'Pointers', mastery: 38, neuralStability: 79 },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8.5, fill: '#64748b', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Demonstrated Mastery"
                      dataKey="mastery"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Observed Neural Focus"
                      dataKey="neuralStability"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium truncate">Peak: Functions (91% / 88%)</span>
              <span className="font-bold text-rose-500 shrink-0">High Load: Pointers (38% / 79%)</span>
            </div>
          </div>

          {/* 3. Daily Study Hours Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Study Hours</h3>
                  <p className="text-xs text-slate-500">Weekly active focus time</p>
                </div>
                <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={user.dailyStudyHours?.length ? user.dailyStudyHours : [
                    { day: 'Mon', hours: 2.0 }, { day: 'Tue', hours: 1.5 }, { day: 'Wed', hours: 3.0 },
                    { day: 'Thu', hours: 1.8 }, { day: 'Fri', hours: 2.5 }, { day: 'Sat', hours: 1.0 }, { day: 'Sun', hours: 2.2 },
                  ]} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2, 3, 4, 5, 6].map((_, index) => (
                        <Cell key={index} fill={index === 2 ? '#10b981' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="text-slate-500">Peak day: Wednesday</span>
              <span className="font-bold text-emerald-600">Total: 14.0 hrs</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
