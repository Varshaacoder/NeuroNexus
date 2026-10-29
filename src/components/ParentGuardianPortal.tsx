import React, { useState } from 'react';
import {
  ShieldCheck, EyeOff, BookOpen, Heart, Award, CheckCircle2, Lock,
  Calendar, Clock, AlertCircle, TrendingUp, UserCheck, MessageSquare,
  Bell, FileText, Send, Phone, Mail, Sliders, ChevronRight, Download,
  CheckSquare, ArrowUpRight, AlertTriangle, User, GraduationCap, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import type { UserProfile } from '../types';

interface ParentGuardianPortalProps {
  user: UserProfile;
  onNavigateDashboard?: () => void;
  onNavigateCourses?: () => void;
  onNavigateWellbeing?: () => void;
  onLogout?: () => void;
}

export const ParentGuardianPortal: React.FC<ParentGuardianPortalProps> = ({
  user,
  onNavigateDashboard,
  onNavigateCourses,
  onNavigateWellbeing,
  onLogout
}) => {
  // Navigation tabs for the Parent Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'exams' | 'teachers' | 'support' | 'settings'>('overview');

  // Interactive Attendance Threshold
  const [attendanceThreshold, setAttendanceThreshold] = useState<number>(85);

  // Teacher Communication Form State
  const [selectedTeacher, setSelectedTeacher] = useState('Prof. Robert Chen (CS201 Java OOP)');
  const [communicationTopic, setCommunicationTopic] = useState('Academic Progress & Project Guidance');
  const [communicationFormat, setCommunicationFormat] = useState('Virtual Office Hours (Zoom)');
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Notification Filter State
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'attendance' | 'exam' | 'assignment'>('all');

  // Academic Progress Chart Data (Month-by-Month)
  const academicProgressData = [
    { month: 'Jan', gpa: 82, attendance: 96 },
    { month: 'Feb', gpa: 85, attendance: 95 },
    { month: 'Mar', gpa: 83, attendance: 94 },
    { month: 'Apr', gpa: 88, attendance: 97 },
    { month: 'May', gpa: 87, attendance: 93 },
    { month: 'Jun', gpa: 91, attendance: 96 },
    { month: 'Recent', gpa: 88.4, attendance: 94.8 },
  ];

  // Subject Performance List
  const subjectGrades = [
    {
      code: 'CS201',
      title: 'Object-Oriented Programming (Java)',
      faculty: 'Prof. Robert Chen',
      score: 92,
      grade: 'A+',
      status: 'Strong Mastery',
      statusColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
      remark: 'Exceptional grasp of inheritance hierarchies and polymorphism. Active in lab code reviews.'
    },
    {
      code: 'CS301',
      title: 'Data Structures & Algorithms',
      faculty: 'Dr. Aris Thorne',
      score: 74,
      grade: 'B',
      status: 'Needs Support',
      statusColor: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]',
      remark: 'Solid grasp of asymptotic bounds, but recursion tree stack tracing requires focused practice.'
    },
    {
      code: 'CS204',
      title: 'Database Management Systems',
      faculty: 'Prof. Elena Rostova',
      score: 89,
      grade: 'A',
      status: 'Strong Mastery',
      statusColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
      remark: 'Excellent work in 3NF schema normalization and relational indexing.'
    },
    {
      code: 'MATH220',
      title: 'Discrete Mathematics & Graph Theory',
      faculty: 'Dr. Marcus Vance',
      score: 86,
      grade: 'A',
      status: 'Consistent',
      statusColor: 'text-[#2855D9] bg-[#EEF3FF] border-[#D5E2FF]',
      remark: 'High accuracy on boolean algebra and inductive proofs.'
    },
    {
      code: 'CS208',
      title: 'Computer Systems & Architecture',
      faculty: 'Prof. Alan Miller',
      score: 81,
      grade: 'B+',
      status: 'Stable',
      statusColor: 'text-[#2855D9] bg-[#EEF3FF] border-[#D5E2FF]',
      remark: 'Good comprehension of memory hierarchies and cache miss rates.'
    }
  ];

  // Upcoming & Completed Assignments
  const assignments = [
    {
      id: 'a1',
      course: 'CS301',
      title: 'Red-Black Tree Self-Balancing Implementation',
      dueDate: 'Nov 2, 2026',
      status: 'Pending Submission',
      statusBadge: 'bg-amber-100 text-amber-900 border-amber-300',
      priority: 'High'
    },
    {
      id: 'a2',
      course: 'CS204',
      title: 'Query Optimization & B-Tree Indexing Lab',
      dueDate: 'Nov 8, 2026',
      status: 'In Progress',
      statusBadge: 'bg-blue-100 text-blue-900 border-blue-300',
      priority: 'Normal'
    },
    {
      id: 'a3',
      course: 'CS201',
      title: 'Unit 2 Polymorphism & Interface Design Project',
      dueDate: 'Submitted Oct 24',
      status: 'Graded: 95/100 (A+)',
      statusBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      priority: 'Completed'
    },
    {
      id: 'a4',
      course: 'CS301',
      title: 'Recurrence Relations Homework #3',
      dueDate: 'Submitted Oct 18',
      status: 'Graded: 78/100 (B)',
      statusBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      priority: 'Completed'
    }
  ];

  // Upcoming Examination Schedule
  const examSchedule = [
    {
      course: 'CS201 OOP (Java)',
      title: 'Midterm Examination (Theory & Code)',
      date: 'Nov 4, 2026 • 10:00 AM - 12:00 PM',
      location: 'Hall B • Main Campus',
      coverage: 'Units 1–3 (Classes, Polymorphism, Interfaces)'
    },
    {
      course: 'CS301 Data Structures',
      title: 'Midterm Examination (Problem Solving)',
      date: 'Nov 15, 2026 • 02:00 PM - 04:30 PM',
      location: 'Hall A • Turing Complex',
      coverage: 'Units 1–4 (Asymptotics, Trees, Hash Maps)'
    }
  ];

  // Faculty Contacts
  const teachers = [
    {
      name: 'Prof. Robert Chen',
      subject: 'CS201 Object-Oriented Programming',
      email: 'r.chen@apex.edu',
      officeHours: 'Tue & Thu: 2:00 PM – 4:00 PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
    },
    {
      name: 'Dr. Aris Thorne',
      subject: 'CS301 Data Structures & Algorithms',
      email: 'a.thorne@apex.edu',
      officeHours: 'Mon & Wed: 10:00 AM – 12:00 PM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120'
    },
    {
      name: 'Prof. Elena Rostova',
      subject: 'CS204 Database Management Systems',
      email: 'e.rostova@apex.edu',
      officeHours: 'Wed & Fri: 1:00 PM – 3:00 PM',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'
    }
  ];

  // Notifications
  const notifications = [
    {
      id: 'n1',
      type: 'exam',
      title: 'CS201 Midterm Examination Date Confirmed',
      desc: 'Hall tickets generated for Nov 4, 10:00 AM in Hall B. Please ensure student brings ID.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 'n2',
      type: 'assignment',
      title: 'New Teacher Remark from Dr. Aris Thorne',
      desc: '"Feedback posted on Homework #3. Recommend reviewing tree recursion notes before lab."',
      time: 'Yesterday',
      unread: true
    },
    {
      id: 'n3',
      type: 'attendance',
      title: 'Attendance Target Achieved: 94.8%',
      desc: 'Alex maintained 100% attendance across all labs and lectures this past week.',
      time: '3 days ago',
      unread: false
    },
    {
      id: 'n4',
      type: 'assignment',
      title: 'Upcoming Deadline: CS301 Red-Black Trees',
      desc: 'Assignment due in 4 days (Nov 2). Alex has started drafting the code test cases.',
      time: '4 days ago',
      unread: false
    }
  ];

  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === 'all') return true;
    return n.type === notificationFilter;
  });

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus(`Communication request successfully sent to ${selectedTeacher}. Faculty typically respond within 24–48 business hours.`);
    setCommunicationMessage('');
    setTimeout(() => setRequestStatus(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F3F6FF] text-[#17213B] pb-16">
      
      {/* ── TOP PARENT PORTAL BRANDED BANNER ───────────────────────────────── */}
      <div className="bg-white border-b border-[#E1E7F2] sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#00AFC1] text-white flex items-center justify-center shadow-md shadow-[#059669]/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#17213B] tracking-tight">Parent & Guardian Portal</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Verified Guardian Access
                </span>
              </div>
              <p className="text-xs text-[#64708A] mt-0.5">
                Logged in as <strong className="text-[#17213B]">Eleanor Vance</strong> (Mother / Guardian) &bull; Linked Student: <strong className="text-[#2855D9]">Alex Rivera (ID: #NEU-2024-8891)</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onNavigateWellbeing && (
              <button
                onClick={onNavigateWellbeing}
                className="px-3 py-1.5 rounded-xl bg-white text-[#8755E8] border border-[#E8DCFD] hover:bg-[#F6F0FF] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Wellbeing Center</span>
              </button>
            )}
            {onNavigateCourses && (
              <button
                onClick={onNavigateCourses}
                className="px-3 py-1.5 rounded-xl bg-white text-[#2855D9] border border-[#D5E2FF] hover:bg-[#EEF3FF] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curriculum</span>
              </button>
            )}
            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                className="px-3 py-1.5 rounded-xl bg-[#2855D9] text-white hover:bg-[#1E44B5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Student View &rarr;</span>
              </button>
            )}
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-bold border-t border-[#E1E7F2] py-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Student Overview', icon: User },
            { id: 'academics', label: 'Academic Performance', icon: GraduationCap },
            { id: 'attendance', label: 'Attendance Tracking', icon: UserCheck },
            { id: 'exams', label: 'Assignments & Exams', icon: Calendar },
            { id: 'teachers', label: 'Teacher Connect', icon: MessageSquare },
            { id: 'support', label: 'Progress & Support', icon: TrendingUp },
            { id: 'settings', label: 'Parent Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2855D9] text-white shadow-xs'
                    : 'text-[#64708A] hover:bg-[#F3F6FF] hover:text-[#17213B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PRIVACY NOTICE BANNER ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex items-start gap-3 shadow-2xs text-xs text-[#065F46] leading-relaxed">
          <EyeOff className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#047857] block text-sm">Official Parent & Guardian Educational Record</span>
            This dashboard displays academic performance, verified attendance records, teacher communications, and student-authorized wellbeing summaries. Private student study scratchpads and raw biopotentials are strictly shielded by student consent boundaries.
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD CONTENT AREA ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION A: STUDENT OVERVIEW
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'academics') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            {/* Student ID Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E1E7F2]">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                  alt="Alex Rivera"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#2855D9]/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[#17213B]">Alex Rivera</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">
                      Enrolled Full-Time
                    </span>
                  </div>
                  <div className="text-xs text-[#64708A] mt-1 flex flex-wrap items-center gap-2">
                    <span><strong>Program:</strong> B.S. Computer Science & Engineering</span>
                    <span>&bull;</span>
                    <span><strong>Year:</strong> Semester IV</span>
                    <span>&bull;</span>
                    <span><strong>Section:</strong> B (Cohort 2024-28)</span>
                    <span>&bull;</span>
                    <span><strong>Student ID:</strong> #NEU-2024-8891</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EEF3FF] text-[#2855D9] hover:bg-[#D5E2FF] transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Advisor</span>
                </button>
              </div>
            </div>

            {/* 4 Primary Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#F3F6FF] border border-[#E1E7F2] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#64708A]">
                  <span>Cumulative GPA</span>
                  <Award className="w-4 h-4 text-[#2855D9]" />
                </div>
                <div className="text-3xl font-black text-[#17213B]">3.78 <span className="text-sm font-semibold text-[#64708A]">/ 4.0</span></div>
                <div className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top 12% in CS Cohort (Grade: A)</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#065F46]">
                  <span>Semester Attendance</span>
                  <UserCheck className="w-4 h-4 text-[#059669]" />
                </div>
                <div className="text-3xl font-black text-[#047857]">94.8%</div>
                <div className="text-[11px] text-[#059669] font-semibold">
                  74 of 78 working days present (Threshold: 85%)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#EEF3FF] border border-[#D5E2FF] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2855D9]">
                  <span>Study Consistency</span>
                  <Clock className="w-4 h-4 text-[#2855D9]" />
                </div>
                <div className="text-3xl font-black text-[#2855D9]">14 Days</div>
                <div className="text-[11px] text-[#2855D9] font-semibold">
                  Active continuous study streak
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F6F0FF] border border-[#E8DCFD] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8755E8]">
                  <span>Assignments & Labs</span>
                  <CheckSquare className="w-4 h-4 text-[#8755E8]" />
                </div>
                <div className="text-3xl font-black text-[#8755E8]">24 / 26</div>
                <div className="text-[11px] text-[#8755E8] font-semibold">
                  92.3% submission rate (2 pending)
                </div>
              </div>

            </div>

            {/* Upcoming Deadlines Quick Strip */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block text-sm">Upcoming Major Examination: CS201 Midterm</strong>
                  <span className="text-slate-600">Scheduled on <strong>Nov 4, 2026 (in 6 days)</strong> &bull; Hall B &bull; Units 1–3</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('exams')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all text-xs self-start md:self-auto shrink-0 shadow-2xs"
              >
                View Full Exam Schedule &rarr;
              </button>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION B: ACADEMIC PERFORMANCE & SUBJECT-WISE GRADES
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'academics') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7F2] pb-4">
              <div>
                <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#2855D9]" />
                  <span>Subject-Wise Marks & Academic Progress</span>
                </h3>
                <p className="text-xs text-[#64708A] mt-0.5">Verified continuous evaluation metrics and teacher remarks for Semester IV.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-bold">
                  All Credits On Track (22 / 22)
                </span>
              </div>
            </div>

            {/* Academic Growth Chart */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E1E7F2] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17213B]">Academic Performance Trend (% Marks Month-over-Month)</span>
                <span className="text-[#64708A]">Semester Target: &gt; 85%</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={academicProgressData}>
                    <defs>
                      <linearGradient id="parentGpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2855D9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2855D9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64708A' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64708A' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Academic Average']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E1E7F2', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="gpa" stroke="#2855D9" strokeWidth={2.5} fillOpacity={1} fill="url(#parentGpaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject List Cards */}
            <div className="space-y-3">
              {subjectGrades.map((sub) => (
                <div key={sub.code} className="p-4 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs hover:shadow-xs transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">
                          {sub.code}
                        </span>
                        <strong className="text-sm font-bold text-[#17213B]">{sub.title}</strong>
                      </div>
                      <span className="text-xs text-[#64708A] block mt-0.5">Instructor: {sub.faculty}</span>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-xl font-black text-[#17213B]">{sub.score}%</span>
                        <span className="text-xs text-[#64708A] block">Grade: {sub.grade}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${sub.statusColor}`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E1E7F2] text-xs text-[#64708A] flex items-start gap-1.5">
                    <span className="font-semibold text-[#17213B] shrink-0">Faculty Remark:</span>
                    <span className="italic leading-snug">"{sub.remark}"</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION C: ATTENDANCE TRACKING & ALERT CONFIGURATION
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'attendance') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7F2] pb-4">
              <div>
                <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#059669]" />
                  <span>Attendance Tracking & Absence Log</span>
                </h3>
                <p className="text-xs text-[#64708A] mt-0.5">Daily biometric and classroom attendance records monitored in real time.</p>
              </div>

              {/* Threshold Configurator */}
              <div className="flex items-center gap-2 bg-[#F3F6FF] px-3 py-1.5 rounded-xl border border-[#E1E7F2] text-xs">
                <span className="text-[#64708A] font-semibold">Alert Threshold:</span>
                <select
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="bg-white border border-[#E1E7F2] rounded-lg px-2 py-1 font-bold text-[#17213B] text-xs focus:outline-none"
                >
                  <option value={90}>Below 90% (Strict)</option>
                  <option value={85}>Below 85% (Standard University)</option>
                  <option value={75}>Below 75% (Minimum Exam Eligibility)</option>
                </select>
              </div>
            </div>

            {/* Attendance Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E1E7F2] text-center">
                <span className="text-xs text-[#64708A] font-bold uppercase block">Working Days</span>
                <strong className="text-2xl font-black text-[#17213B] mt-1 block">78</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                <span className="text-xs text-[#065F46] font-bold uppercase block">Days Present</span>
                <strong className="text-2xl font-black text-[#047857] mt-1 block">74</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-center">
                <span className="text-xs text-[#92400E] font-bold uppercase block">Excused Leaves</span>
                <strong className="text-2xl font-black text-[#B45309] mt-1 block">3</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-center">
                <span className="text-xs text-[#991B1B] font-bold uppercase block">Unexcused</span>
                <strong className="text-2xl font-black text-[#DC2626] mt-1 block">1</strong>
              </div>
            </div>

            {/* Recent Absence Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17213B] uppercase tracking-wider block">Recent Absence & Leave History</span>
              <div className="divide-y divide-[#E1E7F2] border border-[#E1E7F2] rounded-2xl overflow-hidden text-xs">
                <div className="p-3 bg-[#F8FAFC] flex items-center justify-between">
                  <span className="font-semibold text-[#17213B]">Oct 3, 2026 &bull; Wednesday</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    Medical Leave Approved
                  </span>
                </div>
                <div className="p-3 bg-white flex items-center justify-between">
                  <span className="font-semibold text-[#17213B]">Sept 14, 2026 &bull; Friday</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    University Field Workshop
                  </span>
                </div>
                <div className="p-3 bg-[#F8FAFC] flex items-center justify-between">
                  <span className="font-semibold text-[#17213B]">Aug 28, 2026 &bull; Tuesday</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                    Unexcused Absence (Followed up)
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION D: ASSIGNMENTS & EXAMINATIONS
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'exams') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="border-b border-[#E1E7F2] pb-4">
              <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8755E8]" />
                <span>Assignments, Deadlines & Examination Schedule</span>
              </h3>
              <p className="text-xs text-[#64708A] mt-0.5">Tracking submission timeliness, exam dates, and evaluation outcomes.</p>
            </div>

            {/* Examination Schedule Box */}
            <div className="p-5 rounded-2xl bg-[#F6F0FF] border border-[#E8DCFD] space-y-3">
              <span className="text-xs font-bold text-[#8755E8] uppercase tracking-wider block">Semester IV Examination Timetable</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examSchedule.map((exam, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#E8DCFD] shadow-2xs space-y-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6F0FF] text-[#8755E8]">
                      {exam.course}
                    </span>
                    <strong className="text-sm font-bold text-[#17213B] block">{exam.title}</strong>
                    <div className="text-[#64708A] flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#2855D9]" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="text-[#64708A] text-[11px]">{exam.location} &bull; {exam.coverage}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#17213B] uppercase tracking-wider block">Coursework Assignments & Submissions</span>
              <div className="divide-y divide-[#E1E7F2] border border-[#E1E7F2] rounded-2xl overflow-hidden text-xs">
                {assignments.map((asg) => (
                  <div key={asg.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF3FF] text-[#2855D9] border border-[#D5E2FF]">
                          {asg.course}
                        </span>
                        <strong className="text-sm font-bold text-[#17213B]">{asg.title}</strong>
                      </div>
                      <span className="text-[#64708A] text-xs mt-1 block">Due: {asg.dueDate} &bull; Priority: {asg.priority}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border self-start sm:self-auto ${asg.statusBadge}`}>
                      {asg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION E: TEACHER COMMUNICATION & CONTACT INTERFACE
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'teachers') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="border-b border-[#E1E7F2] pb-4">
              <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2855D9]" />
                <span>Teacher Directory & Direct Communication Request</span>
              </h3>
              <p className="text-xs text-[#64708A] mt-0.5">Connect with course instructors and academic mentors for meetings or guidance.</p>
            </div>

            {requestStatus && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{requestStatus}</span>
              </div>
            )}

            {/* Teachers Directory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teachers.map((t, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E1E7F2] space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <strong className="font-bold text-sm text-[#17213B] block">{t.name}</strong>
                      <span className="text-[#64708A] text-[11px] block">{t.subject}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-[#64708A]">
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#2855D9]" /> {t.email}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#8755E8]" /> {t.officeHours}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Communication Request Form */}
            <form onSubmit={handleTeacherSubmit} className="p-5 rounded-2xl bg-[#EEF3FF]/70 border border-[#D5E2FF] space-y-4 text-xs">
              <span className="text-sm font-bold text-[#17213B] block">Request Academic Advising Meeting or Send Inquiry</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#17213B] font-bold mb-1">Select Instructor</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E1E7F2] rounded-xl text-xs font-medium text-[#17213B]"
                  >
                    {teachers.map((t, idx) => (
                      <option key={idx} value={`${t.name} (${t.subject.split(' ')[0]})`}>{t.name} - {t.subject.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#17213B] font-bold mb-1">Discussion Topic</label>
                  <select
                    value={communicationTopic}
                    onChange={(e) => setCommunicationTopic(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E1E7F2] rounded-xl text-xs font-medium text-[#17213B]"
                  >
                    <option value="Academic Progress & Project Guidance">Academic Progress & Project Guidance</option>
                    <option value="Exam Preparation & Study Advice">Exam Preparation & Study Advice</option>
                    <option value="Attendance / Medical Leave Coordination">Attendance / Medical Leave Coordination</option>
                    <option value="General Check-in">General Check-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#17213B] font-bold mb-1">Meeting Preference</label>
                  <select
                    value={communicationFormat}
                    onChange={(e) => setCommunicationFormat(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E1E7F2] rounded-xl text-xs font-medium text-[#17213B]"
                  >
                    <option value="Virtual Office Hours (Zoom)">Virtual Office Hours (Zoom)</option>
                    <option value="Campus Office Meeting">Campus Office Meeting</option>
                    <option value="Written Email Consultation">Written Email Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#17213B] font-bold mb-1">Message or Questions for Teacher</label>
                <textarea
                  rows={3}
                  required
                  value={communicationMessage}
                  onChange={(e) => setCommunicationMessage(e.target.value)}
                  placeholder="e.g. Would appreciate a 15-minute discussion during office hours on Alex's CS301 recursion preparation."
                  className="w-full p-3 bg-white border border-[#E1E7F2] rounded-xl text-xs text-[#17213B] placeholder-[#64708A] focus:outline-none focus:ring-2 focus:ring-[#2855D9]/30"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64708A]">Communications are cataloged in your parent notification center.</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#2855D9] hover:bg-[#1E44B5] transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to Teacher</span>
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION F: NOTIFICATIONS & ALERTS
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'support') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7F2] pb-4">
              <div>
                <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>Parent Notifications & Campus Bulletins</span>
                </h3>
                <p className="text-xs text-[#64708A] mt-0.5">Official updates, exam reminders, and grade releases.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F3F6FF] p-1 rounded-xl text-xs font-bold border border-[#E1E7F2]">
                {(['all', 'exam', 'assignment', 'attendance'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setNotificationFilter(f)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] transition-all ${
                      notificationFilter === f ? 'bg-white text-[#2855D9] shadow-2xs font-extrabold' : 'text-[#64708A]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div key={notif.id} className="p-4 rounded-2xl bg-white border border-[#E1E7F2] shadow-2xs flex items-start gap-3 text-xs">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    notif.type === 'exam' ? 'bg-purple-100 text-purple-700' :
                    notif.type === 'attendance' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {notif.type === 'exam' ? <Calendar className="w-4 h-4" /> :
                     notif.type === 'attendance' ? <UserCheck className="w-4 h-4" /> :
                     <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm font-bold text-[#17213B]">{notif.title}</strong>
                      <span className="text-[11px] text-[#8E9BB0] shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[#64708A] text-xs mt-1 leading-relaxed">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION G: STUDENT PROGRESS, WELLBEING & CONVERSATION STARTERS
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'support') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="border-b border-[#E1E7F2] pb-4">
              <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#8755E8]" />
                <span>Student Support & Family Discussion Points</span>
              </h3>
              <p className="text-xs text-[#64708A] mt-0.5">Constructive, positive discussion prompts based on student-shared reflections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Positive Achievements */}
              <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                <span className="text-xs font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths & Milestones
                </span>
                <ul className="space-y-2 text-xs text-[#065F46] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">&bull;</span>
                    <span>Scored <strong>95%</strong> on Java OOP Polymorphism Lab Project.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">&bull;</span>
                    <span>Maintained a <strong>14-day continuous study habit</strong> without missed sessions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">&bull;</span>
                    <span>Classroom attendance is <strong>94.8%</strong>, exceeding cohort benchmark.</span>
                  </li>
                </ul>
              </div>

              {/* Constructive Discussion Points */}
              <div className="p-5 rounded-2xl bg-[#EEF3FF] border border-[#D5E2FF] space-y-3">
                <span className="text-xs font-bold text-[#2855D9] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Suggested Family Discussion Points
                </span>
                <ul className="space-y-2 text-xs text-[#1E40AF] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2855D9] font-bold">&bull;</span>
                    <span>Celebrate the 95% Java score and ask about the inheritance project!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2855D9] font-bold">&bull;</span>
                    <span>Encourage attending Dr. Thorne's Friday review on recursion tree structures.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2855D9] font-bold">&bull;</span>
                    <span>Check in on exam prep for CS201 Midterm (Nov 4) to ensure restorative sleep.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION H: PARENT PROFILE & SETTINGS
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'overview' || activeTab === 'settings') && (
          <div className="bg-white rounded-3xl border border-[#E1E7F2] p-6 shadow-xs space-y-6">
            
            <div className="border-b border-[#E1E7F2] pb-4">
              <h3 className="text-xl font-black text-[#17213B] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#64708A]" />
                <span>Parent Profile & Notification Preferences</span>
              </h3>
              <p className="text-xs text-[#64708A] mt-0.5">Manage communication channels, linked student access, and alert thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Profile Details */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E1E7F2] space-y-3">
                <span className="font-bold text-[#17213B] text-sm block">Parent / Guardian Credentials</span>
                <div className="space-y-2 text-[#64708A]">
                  <div><strong className="text-[#17213B]">Name:</strong> Eleanor Vance</div>
                  <div><strong className="text-[#17213B]">Relationship:</strong> Mother / Primary Guardian</div>
                  <div><strong className="text-[#17213B]">Email:</strong> eleanor.vance@guardian.apex.edu</div>
                  <div><strong className="text-[#17213B]">Phone:</strong> +1 (555) 432-8921</div>
                  <div><strong className="text-[#17213B]">Linked Student:</strong> Alex Rivera (ID: #NEU-2024-8891)</div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E1E7F2] space-y-3">
                <span className="font-bold text-[#17213B] text-sm block">Active Notification Channels</span>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between text-[#17213B]">
                    <span>Weekly Academic Progress Email Digest</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#2855D9]" />
                  </label>
                  <label className="flex items-center justify-between text-[#17213B]">
                    <span>Instant SMS for Attendance Drop Below {attendanceThreshold}%</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#2855D9]" />
                  </label>
                  <label className="flex items-center justify-between text-[#17213B]">
                    <span>Exam Schedule & Hall Ticket Notices</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#2855D9]" />
                  </label>
                  <label className="flex items-center justify-between text-[#17213B]">
                    <span>Student-Shared Wellbeing Alerts</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#2855D9]" />
                  </label>
                </div>
              </div>

            </div>

            {/* Logout button */}
            {onLogout && (
              <div className="pt-4 border-t border-[#E1E7F2] flex justify-end">
                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                >
                  Sign Out of Parent Portal
                </button>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};
