import React, { useState } from 'react';
import {
  X, BookOpen, Award, CheckCircle2, AlertTriangle, TrendingUp,
  FileCheck2, Bot, Download, MessageSquare, ArrowRight, Sparkles, Trophy
} from 'lucide-react';
import type { UserProfile } from '../types';

export interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    code: string;
    name: string;
    faculty: string;
    credits: number;
    description: string;
    progress: number;
    color: string;
    nextClass?: string;
    materials?: number;
    weakTopics?: string[];
  } | null;
  user: UserProfile;
  onOpenMockTest?: () => void;
  onOpenAIClassroom?: () => void;
}

interface ModuleTopic {
  title: string;
  completion: number;
  status: 'Mastered' | 'In Progress' | 'Needs Focus';
  subtopics: string[];
}

const COURSE_SYLLABUS: Record<string, { rank: number; totalStudents: number; modules: ModuleTopic[] }> = {
  CS201: {
    rank: 5,
    totalStudents: 142,
    modules: [
      { title: 'Module 1: C Fundamentals & Scopes', completion: 95, status: 'Mastered', subtopics: ['Variables & Types', 'Control Flow', 'Functions', 'Stack Frames'] },
      { title: 'Module 2: Pointer Arithmetic & Memory Addressing', completion: 38, status: 'Needs Focus', subtopics: ['Pointer Math', 'Dereferencing', 'Array Indexing', 'Void Pointers'] },
      { title: 'Module 3: Dynamic Memory Allocation', completion: 65, status: 'In Progress', subtopics: ['malloc & free', 'calloc & realloc', 'Heap Memory Tracing', 'Valgrind'] },
      { title: 'Module 4: Structures, Padding & Unions', completion: 58, status: 'In Progress', subtopics: ['struct Memory Layout', 'Alignment Padding', 'Bitfields', 'Unions'] },
      { title: 'Module 5: File I/O & Systems Programming', completion: 82, status: 'Mastered', subtopics: ['File Pointers', 'fopen/fclose', 'fread/fwrite', 'Errno'] },
    ]
  },
  CS202: {
    rank: 2,
    totalStudents: 138,
    modules: [
      { title: 'Module 1: Linear Data Structures', completion: 92, status: 'Mastered', subtopics: ['Dynamic Arrays', 'Singly Linked Lists', 'Doubly Linked Lists', 'Stacks & Queues'] },
      { title: 'Module 2: Tree Data Structures', completion: 88, status: 'Mastered', subtopics: ['Binary Search Trees', 'AVL Trees', 'Heaps & Priority Queues', 'B-Trees'] },
      { title: 'Module 3: Graph Algorithms', completion: 62, status: 'In Progress', subtopics: ['BFS & DFS', 'Dijkstra Shortest Path', 'Kruskal MST', 'Topological Sort'] },
      { title: 'Module 4: Dynamic Programming & Recursion', completion: 94, status: 'Mastered', subtopics: ['Memoization', 'Tabulation', 'Knapsack Problem', 'LCS'] },
    ]
  },
  CS204: {
    rank: 8,
    totalStudents: 115,
    modules: [
      { title: 'Module 1: Relational Model & SQL', completion: 80, status: 'Mastered', subtopics: ['Relational Algebra', 'DML & DDL', 'Complex Joins', 'Subqueries'] },
      { title: 'Module 2: Database Normalization', completion: 54, status: 'In Progress', subtopics: ['Functional Dependencies', '1NF & 2NF', '3NF & BCNF', 'Lossless Join'] },
      { title: 'Module 3: Indexing & Storage Structures', completion: 48, status: 'Needs Focus', subtopics: ['B-Tree Indexing', 'Hash Indexes', 'Query Optimization', 'Execution Plans'] },
      { title: 'Module 4: Transactions & Concurrency', completion: 70, status: 'In Progress', subtopics: ['ACID Properties', 'Two-Phase Locking', 'Deadlocks', 'WAL Recovery'] },
    ]
  },
  MA202: {
    rank: 12,
    totalStudents: 120,
    modules: [
      { title: 'Module 1: Propositional & Predicate Logic', completion: 85, status: 'Mastered', subtopics: ['Truth Tables', 'Logical Equivalence', 'Quantifiers', 'Proof Techniques'] },
      { title: 'Module 2: Discrete Probability Foundations', completion: 42, status: 'Needs Focus', subtopics: ['Sample Spaces', 'Conditional Probability', 'Bayes Theorem', 'Independence'] },
      { title: 'Module 3: Random Variables & Distributions', completion: 55, status: 'In Progress', subtopics: ['Binomial Distribution', 'Poisson Process', 'Expectation', 'Variance'] },
    ]
  }
};

const DEFAULT_SYLLABUS = {
  rank: 6,
  totalStudents: 110,
  modules: [
    { title: 'Module 1: Core Concepts & Principles', completion: 80, status: 'Mastered' as const, subtopics: ['Foundations', 'Terminology', 'Basic Practice'] },
    { title: 'Module 2: Advanced Topics & Application', completion: 55, status: 'In Progress' as const, subtopics: ['Analysis', 'Problem Solving', 'Case Studies'] },
    { title: 'Module 3: Practical Lab & Assessment', completion: 40, status: 'Needs Focus' as const, subtopics: ['Lab Drill', 'Midterm Prep', 'Revision'] },
  ]
};

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen, onClose, course, user: _, onOpenMockTest, onOpenAIClassroom
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials' | 'ranking'>('syllabus');

  if (!isOpen || !course) return null;

  const syllabus = COURSE_SYLLABUS[course.code] || DEFAULT_SYLLABUS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Course Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-amber-300">
                  {course.code}
                </span>
                <span className="text-xs text-indigo-200 font-medium">{course.credits} Academic Credits</span>
              </div>
              <h2 className="text-2xl font-black text-white">{course.name}</h2>
              <p className="text-xs text-indigo-200 mt-1">Instructor: {course.faculty}</p>
            </div>

            {/* Course Rank Pill */}
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-2xl text-center shrink-0 min-w-[120px]">
              <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" />
                Course Rank
              </div>
              <div className="text-2xl font-black text-white mt-0.5">#{syllabus.rank}</div>
              <div className="text-[10px] text-indigo-200 font-medium">Top {Math.round((syllabus.rank / syllabus.totalStudents) * 100)}% of {syllabus.totalStudents}</div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-2 mt-5 border-t border-white/10 pt-3">
            {[
              { id: 'syllabus', label: 'Topic Breakdown', icon: BookOpen },
              { id: 'ranking', label: 'Course Rank & Metrics', icon: Award },
              { id: 'materials', label: 'Resources & Downloads', icon: Download },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: SYLLABUS TOPIC BREAKDOWN */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              
              {/* Overall Progress Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Overall Syllabus Mastery</div>
                  <div className="text-2xl font-black text-indigo-950 mt-0.5">{course.progress}% Completed</div>
                  <p className="text-xs text-indigo-600 mt-0.5">3 modules mastered • 2 topics require drill practice</p>
                </div>
                <div className="w-36 shrink-0">
                  <div className="w-full h-3 bg-indigo-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Module Cards */}
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Module-Wise Topic Completion</h3>
              <div className="space-y-3">
                {syllabus.modules.map((mod, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            mod.status === 'Mastered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            mod.status === 'Needs Focus' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {mod.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mod.subtopics.map((sub, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-lg font-black ${
                          mod.completion >= 80 ? 'text-emerald-600' : mod.completion < 50 ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {mod.completion}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all ${
                          mod.completion >= 80 ? 'bg-emerald-500' : mod.completion < 50 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${mod.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COURSE RANK & METRICS */}
          {activeTab === 'ranking' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-amber-900">#{syllabus.rank}</div>
                  <div className="text-xs font-bold text-amber-700 mt-1">Course Leaderboard Position</div>
                  <p className="text-[11px] text-amber-600 mt-1">Out of {syllabus.totalStudents} enrolled students</p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                  <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-indigo-900">{course.progress}%</div>
                  <div className="text-xs font-bold text-indigo-700 mt-1">Topic Mastery Index</div>
                  <p className="text-[11px] text-indigo-600 mt-1">Top 10% percentile in {course.code}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">📊 Rank Calculation Method</div>
                <p>Course ranks are calculated weekly based on quiz accuracy, diagnostic assessment scores, and practice question completion speed within {course.name}.</p>
              </div>
            </div>
          )}

          {/* TAB 3: RESOURCES & DOWNLOADS */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              {[
                { title: `${course.code} Lecture Notes & Memory Cheat Sheet`, size: '2.4 MB • PDF', icon: '📄' },
                { title: 'Midterm Practice Question Bank with Answer Keys', size: '4.1 MB • PDF', icon: '📝' },
                { title: 'Lab Assignment Code Templates & Test Suite', size: '1.2 MB • ZIP', icon: '💻' },
                { title: 'Faculty Verified Reference Handbook', size: '5.8 MB • PDF', icon: '📚' },
              ].map((res, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{res.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{res.title}</div>
                      <div className="text-[11px] text-slate-500">{res.size}</div>
                    </div>
                  </div>
                  <button onClick={() => alert(`Downloading ${res.title}...`)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => { onClose(); onOpenMockTest?.(); }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              Generate Course Mock Test
            </button>
            <button
              onClick={() => { onClose(); onOpenAIClassroom?.(); }}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-200 flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              Start AI Classroom Session
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
