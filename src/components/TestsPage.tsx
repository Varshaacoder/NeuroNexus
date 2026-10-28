import React, { useState } from 'react';
import {
  FileCheck2, Sparkles, Calendar, Clock, Award, CheckCircle2,
  AlertCircle, ArrowRight, Plus, Filter, BookOpen, Brain, Shield,
  ChevronRight, Play
} from 'lucide-react';
import type { UserProfile, CollegeScheduledTest, LearningSession } from '../types';
import { getCollegeScheduledTests, saveCollegeScheduledTest, getStudentSessions } from '../utils/neuroSessionStore';

interface TestsPageProps {
  user: UserProfile;
  onStartTest: (testConfig: { title: string; course: string; topic?: string; isPersonalized?: boolean }) => void;
  onNavigateToNeuroAnalysis: (sessionId?: string) => void;
}

export const TestsPage: React.FC<TestsPageProps> = ({ user, onStartTest, onNavigateToNeuroAnalysis }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'regular' | 'personalized' | 'college' | 'attempts'>('all');
  const [collegeTests, setCollegeTests] = useState<CollegeScheduledTest[]>(getCollegeScheduledTests());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Faculty form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('C Programming & Systems');
  const [newCourseCode, setNewCourseCode] = useState('CS201');
  const [newDate, setNewDate] = useState('Oct 30, 2026 • 10:00 AM');
  const [newDuration, setNewDuration] = useState(30);
  const [newQuestionsCount, setNewQuestionsCount] = useState(15);
  const [newInstructions, setNewInstructions] = useState('');
  const [newTopics, setNewTopics] = useState('Memory Management, Structs');

  const sessions = getStudentSessions(user.id);
  const testAttempts = sessions.filter(s => s.type === 'quiz' || s.type === 'college_test');

  const isFacultyOrAdmin = user.role === 'Faculty Mentor' || user.role === 'Administrator';

  const handleCreateCollegeTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTest: CollegeScheduledTest = {
      id: `ctest_${Date.now()}`,
      title: newTitle.trim(),
      course: newCourse,
      courseCode: newCourseCode,
      facultyName: user.name,
      facultyRole: user.role === 'Administrator' ? 'Administrator' : 'Faculty Mentor',
      scheduledDate: newDate,
      deadline: newDate.split('•')[0]?.trim() || 'Oct 30, 2026',
      durationMinutes: Number(newDuration),
      totalQuestions: Number(newQuestionsCount),
      status: 'Upcoming',
      instructions: newInstructions || 'Official college benchmark evaluation with optional NeuroFocus cognitive monitoring.',
      topicsCovered: newTopics.split(',').map(t => t.trim()),
      eegMonitoringRecommended: true,
    };

    saveCollegeScheduledTest(newTest);
    setCollegeTests(getCollegeScheduledTests());
    setShowScheduleModal(false);
    setNewTitle('');
    setNewInstructions('');
  };

  // Regular practice test templates
  const REGULAR_MOCK_TESTS = [
    {
      id: 'reg_01',
      title: 'C Programming & Systems Diagnostics',
      course: 'CS201 C Programming & Systems',
      code: 'CS201',
      duration: '15 mins',
      questions: 5,
      difficulty: 'Intermediate',
      topics: ['Pointers', 'Struct Alignment', 'Recursion', 'Memory Layout'],
      color: 'indigo',
    },
    {
      id: 'reg_02',
      title: 'Data Structures & Algorithmic Complexity',
      course: 'CS202 Data Structures & Algorithms',
      code: 'CS202',
      duration: '15 mins',
      questions: 5,
      difficulty: 'Intermediate',
      topics: ['Binary Trees', 'Heaps', 'Graph BFS/DFS', 'Sorting Asymptotics'],
      color: 'emerald',
    },
    {
      id: 'reg_03',
      title: 'Relational DBMS & SQL Schema Design',
      course: 'CS204 Database Management Systems',
      code: 'CS204',
      duration: '15 mins',
      questions: 5,
      difficulty: 'Hard',
      topics: ['3NF & BCNF Normalization', 'Indexing', 'ACID Transactions'],
      color: 'purple',
    },
    {
      id: 'reg_04',
      title: 'Discrete Mathematics & Probability',
      course: 'MA202 Discrete Mathematics & Probability',
      code: 'MA202',
      duration: '15 mins',
      questions: 5,
      difficulty: 'Hard',
      topics: ['Conditional Probability', 'Bayes Theorem', 'Combinatorics'],
      color: 'amber',
    },
  ];

  // Weak topics for personalized test generation
  const weakTopics = user.weakTopics && user.weakTopics.length > 0
    ? user.weakTopics
    : [
        { name: 'Pointer Arithmetic', mastery: 41, course: 'C Programming & Systems' },
        { name: 'Conditional Probability', mastery: 52, course: 'Discrete Mathematics' },
        { name: 'B-Tree Indexing', mastery: 54, course: 'Database Management' },
      ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── HEADER BANNER ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Assessment & Testing Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Assessments, Mock Tests & College Benchmarks
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Attend regular curriculum practice tests, generate adaptive tests tailored to your identified weak topics, and track verified college-scheduled examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule College Test</span>
              </button>
            )}
            <button
              onClick={() => onStartTest({
                title: `Adaptive Diagnostic: ${weakTopics[0]?.name || 'Pointer Arithmetic'}`,
                course: weakTopics[0]?.course || 'CS201 C Systems',
                topic: weakTopics[0]?.name || 'Pointer Arithmetic',
                isPersonalized: true
              })}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Quick Adaptive Test</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Tests</div>
            <div className="text-2xl font-black text-white mt-0.5">{testAttempts.length} Attempts</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {testAttempts.length > 0
                ? Math.round(testAttempts.reduce((a, b) => a + (b.score || 0), 0) / testAttempts.length)
                : 0}%
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Exams</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{collegeTests.length} Scheduled</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NeuroFocus Mode</div>
            <div className="text-2xl font-black text-indigo-400 mt-0.5">Enabled (Demo)</div>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Test Formats' },
          { id: 'regular', label: 'Regular Mock Tests' },
          { id: 'personalized', label: 'Personalized Adaptive' },
          { id: 'college', label: `College-Scheduled (${collegeTests.length})` },
          { id: 'attempts', label: `Recent Attempts (${testAttempts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: PERSONALIZED MOCK TESTS (Adaptive) ───────────────────── */}
      {(activeTab === 'all' || activeTab === 'personalized') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personalized Adaptive Mock Tests</h2>
                <p className="text-xs text-slate-500">Auto-generated diagnostic tests directly addressing your demonstrated weak topics</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Calibrated to Student Mastery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Target Weak Area
                    </span>
                    <span className="text-xs font-black text-rose-600">
                      {topic.mastery}% Mastery
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{topic.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{topic.course}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Competency Deficit</span>
                      <span>Target: 80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${topic.mastery}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">5 Targeted Questions</span>
                  <button
                    onClick={() => onStartTest({
                      title: `Adaptive Diagnostic: ${topic.name}`,
                      course: topic.course,
                      topic: topic.name,
                      isPersonalized: true
                    })}
                    className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 2: REGULAR MOCK TESTS ────────────────────────────────────── */}
      {(activeTab === 'all' || activeTab === 'regular') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Curriculum Practice Mock Tests</h2>
                <p className="text-xs text-slate-500">Standard practice evaluations matching standard university exam formats</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {REGULAR_MOCK_TESTS.length} Standard Tests Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REGULAR_MOCK_TESTS.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {test.code}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {test.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{test.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{test.questions} Questions • {test.difficulty}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {test.topics.map((t, tidx) => (
                      <span key={tidx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onStartTest({
                      title: test.title,
                      course: test.course,
                      topic: test.topics[0],
                      isPersonalized: false
                    })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Begin Practice Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3: COLLEGE-SCHEDULED TESTS ───────────────────────────────── */}
      {(activeTab === 'all' || activeTab === 'college') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Official College-Scheduled Tests</h2>
                <p className="text-xs text-slate-500">Scheduled by university faculty mentors and department administrators</p>
              </div>
            </div>

            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New Test</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {collegeTests.map((ctest) => (
              <div
                key={ctest.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      College Official
                    </span>
                    <span className="text-xs font-bold text-slate-500">{ctest.courseCode} — {ctest.course}</span>
                    <span className="text-[11px] font-semibold text-slate-400">• Scheduled by {ctest.facultyName} ({ctest.facultyRole})</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{ctest.title}</h3>
                  <p className="text-xs text-slate-600 leading-normal">{ctest.instructions}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-indigo-700">
                      <Calendar className="w-3.5 h-3.5" />
                      {ctest.scheduledDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ctest.durationMinutes} Minutes
                    </span>
                    <span>•</span>
                    <span>{ctest.totalQuestions} Questions</span>
                    {ctest.eegMonitoringRecommended && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <Brain className="w-3 h-3" />
                        NeuroFocus Monitored
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onStartTest({
                      title: ctest.title,
                      course: ctest.course,
                      topic: ctest.topicsCovered[0],
                      isPersonalized: false
                    })}
                    className="w-full md:w-auto py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Enter Scheduled Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 4: RECENT ATTEMPTS & TEST HISTORY ────────────────────────── */}
      {(activeTab === 'all' || activeTab === 'attempts') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Completed Attempts</h2>
                <p className="text-xs text-slate-500">Verified test performance, question breakdown, and linked cognitive reports</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {testAttempts.length} Completed Attempts
            </span>
          </div>

          {testAttempts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center">
              <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Test Attempts Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Completed mock tests and scheduled college examinations will appear here with topic accuracy breakdowns and linked Neuro Analysis reports.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100">
                {testAttempts.map((attempt) => (
                  <div key={attempt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">{attempt.startTime}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600">{attempt.course}</span>
                        {attempt.hasEegData && (
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            EEG Recorded
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{attempt.title}</h4>
                      {attempt.topicPerformance && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {attempt.topicPerformance.map((tp, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                tp.correct
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {tp.topic}: {tp.correct ? '✓ Pass' : '✗ Missed'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">{attempt.score}%</div>
                        <div className="text-[11px] text-slate-500">
                          {attempt.correctAnswers !== undefined && attempt.totalQuestions !== undefined
                            ? `${attempt.correctAnswers}/${attempt.totalQuestions} Correct`
                            : 'Score Result'}
                        </div>
                      </div>

                      {attempt.hasEegData ? (
                        <button
                          onClick={() => onNavigateToNeuroAnalysis(attempt.id)}
                          className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>View Neuro Report</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No EEG Recorded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCHEDULE NEW COLLEGE TEST MODAL (FACULTY / ADMIN ONLY) ─────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Schedule Official College Assessment</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCollegeTest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CS201 Mid-Semester Diagnostic Benchmark"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newQuestionsCount}
                    onChange={(e) => setNewQuestionsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topics Covered (comma-separated)</label>
                <input
                  type="text"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Instructions / Guidelines</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Instructions for students regarding syllabus, time limit, and materials..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
