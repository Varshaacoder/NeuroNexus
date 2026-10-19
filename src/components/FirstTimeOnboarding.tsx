import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Bell, 
  Users, 
  HelpCircle, 
  BrainCircuit, 
  ChevronRight, 
  Award,
  Zap,
  Target,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DiagnosticQuestion } from '../types';
import { AVAILABLE_COURSES, AVAILABLE_MENTORS, DIAGNOSTIC_QUESTIONS } from '../mockData';

interface FirstTimeOnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export const FirstTimeOnboarding: React.FC<FirstTimeOnboardingProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Institutional & Course Enrollment
  const [institution, setInstitution] = useState(user.institution || 'Apex Institute of Science & Technology');
  const [department, setDepartment] = useState(user.department || 'Computer Science & Engineering');
  const [semester, setSemester] = useState(user.semester || 'Semester IV');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    'CS201 C Systems', 
    'CS202 Data Structures', 
    'CS204 Database Systems'
  ]);

  // Step 2: Preferences & Hours
  const [studyPreferences, setStudyPreferences] = useState<string[]>([
    'Visual Memory Diagrams', 
    'Practice Questions First',
    'Interactive Code Walkthroughs'
  ]);
  const [preferredHours, setPreferredHours] = useState('Evening (18:00 - 21:00)');
  const [notificationSettings, setNotificationSettings] = useState({
    quizAlerts: true,
    mentorMessages: true,
    dailySummary: true,
    peerInvites: false
  });
  const [weeklyGoalPomodoros, setWeeklyGoalPomodoros] = useState(8);

  // Step 3: Diagnostic Assessment
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState(0);

  const toggleCourse = (courseName: string) => {
    if (selectedCourses.includes(courseName)) {
      if (selectedCourses.length > 1) {
        setSelectedCourses(selectedCourses.filter(c => c !== courseName));
      }
    } else {
      setSelectedCourses([...selectedCourses, courseName]);
    }
  };

  const togglePreference = (pref: string) => {
    if (studyPreferences.includes(pref)) {
      setStudyPreferences(studyPreferences.filter(p => p !== pref));
    } else {
      setStudyPreferences([...studyPreferences, pref]);
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIdx]: optionIdx
    });
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Calculate final score
      let correct = 0;
      DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          correct++;
        }
      });
      const finalScore = Math.round((correct / DIAGNOSTIC_QUESTIONS.length) * 100);
      setDiagnosticScore(finalScore);
      setAssessmentCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback if canvas-confetti is not loaded
      }
    }
  };

  const handleFinishOnboarding = () => {
    // Generate new student profile dynamically based on diagnostic results
    const scorePct = diagnosticScore || 60;
    const initialRank = scorePct >= 80 ? 'Gold Learner' : scorePct >= 50 ? 'Silver Rising' : 'Bronze Scholar';

    const updatedUser: UserProfile = {
      ...user,
      institution,
      department,
      semester,
      enrolledCourses: selectedCourses,
      studyPreferences,
      preferredStudyHours: preferredHours,
      isFirstTime: false,
      hasDiagnosticAssessment: true,
      rank: initialRank,
      overallProgress: scorePct,
      focusScore: Math.min(scorePct + 15, 90),
      pomodoroCountWeek: 1,
      streakDays: 1,
      strongestTopic: {
        name: scorePct >= 60 ? 'Functions & Scopes' : 'Basic C Syntax',
        mastery: Math.min(scorePct + 20, 95)
      },
      weakTopics: [
        { name: 'Pointer Arithmetic', mastery: Math.max(scorePct - 20, 30), course: 'C Programming & Systems', trend: 'Initial Assessment' },
        { name: 'Structures & Memory Layout', mastery: Math.max(scorePct - 10, 45), course: 'C Programming & Systems', trend: 'Initial Assessment' },
      ],
      weeklyProgressHistory: [
        { week: 'W1', score: scorePct }
      ],
      topicMasteryData: [
        { subject: 'C Systems', mastery: scorePct },
        { subject: 'Data Structures', mastery: Math.max(scorePct - 15, 25) },
        { subject: 'DBMS', mastery: Math.max(scorePct - 10, 30) },
        { subject: 'Probability', mastery: Math.max(scorePct - 20, 20) },
      ],
      dailyStudyHours: [
        { day: 'Mon', hours: 1.0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 },
        { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 },
      ],
      rankScore: scorePct * 15,
    };
    onComplete(updatedUser);
  };

  const currentQ = DIAGNOSTIC_QUESTIONS[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/60 to-amber-100/60 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    First-Time Student Onboarding
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Step {currentStep} of 3</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Welcome to <span className="bg-gradient-to-r from-indigo-600 to-amber-600 bg-clip-text text-transparent">NeuroNexus</span>
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Let's configure your academic command center and establish your personalized learning baseline.
                </p>
              </div>
            </div>

            {/* Stepper pills */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === step
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                      : currentStep > step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: INSTITUTION & AVAILABLE COURSES */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-200">
            
            {/* Academic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* AI Assistant Introduction Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-indigo-950">Meet NexusAI — Your 24/7 Academic Copilot</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Syllabus-Trained
                  </span>
                </div>
                <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                  Nexus analyzes your coursework, monitors question threads, identifies subtle concept blind spots (e.g. pointer arithmetic & memory leaks), and generates custom 10-minute micro-drills right before lectures.
                </p>
              </div>
            </div>

            {/* Select Enrolled Courses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Select Your Enrolled Courses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click to add or remove courses for this semester (choose at least one):
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {selectedCourses.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_COURSES.map((course) => {
                  const isSelected = selectedCourses.some(c => c.startsWith(course.code));
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(`${course.code} ${course.name.split(' ')[0]}`)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {course.code}
                        </span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 mt-2">{course.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {course.credits} Credits • {course.faculty}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mentors Preview */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Assigned Mentors for Your Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AVAILABLE_MENTORS.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900 truncate">{m.name}</h3>
                        <span className="text-[9px] font-semibold px-1 rounded bg-indigo-100 text-indigo-800">
                          {m.badge.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{m.specialty}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{m.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 group transition-all"
              >
                <span>Continue to Study Preferences</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STUDY PREFERENCES & SCHEDULE CONFIG */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-200">
            
            {/* Preferred Study Hours */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Choose Preferred Study Hours
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                NexusAI aligns your automated micro-quizzes and revision reminders with your peak alertness window:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Morning Peak', time: 'Morning (08:00 - 11:00)', desc: 'Fresh theory & logic', icon: '🌅' },
                  { label: 'Afternoon Lab', time: 'Afternoon (13:00 - 16:00)', desc: 'Hands-on practice & lab work', icon: '☀️' },
                  { label: 'Evening Revision', time: 'Evening (18:00 - 21:00)', desc: 'Recommended focus block', icon: '🌆' },
                  { label: 'Night Owl Focus', time: 'Night (22:00 - 01:00)', desc: 'Deep problem solving', icon: '🌙' },
                ].map((slot) => {
                  const isSelected = preferredHours === slot.time;
                  return (
                    <div
                      key={slot.time}
                      onClick={() => setPreferredHours(slot.time)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{slot.icon}</div>
                      <div className="text-xs font-bold text-slate-900">{slot.label}</div>
                      <div className="text-[11px] font-semibold text-amber-700">{slot.time.split(' ')[1]}</div>
                      <p className="text-[10px] text-slate-500 mt-1">{slot.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Style Preferences */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Set Learning & Study Preferences
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Select the modalities that suit how you absorb complex engineering topics best:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Visual Memory Diagrams',
                  'Practice Questions First',
                  'Interactive Code Walkthroughs',
                  'Rigorous Mathematical Proofs',
                  'Spaced Repetition Flashcards',
                  'Peer Study Discussion Circles'
                ].map((pref) => {
                  const isSelected = studyPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? `✓ ${pref}` : `+ ${pref}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Configuration */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                3. Configure Smart Notifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Upcoming Quiz & Exam Reminders</div>
                    <div className="text-[10px] text-slate-500">Alert 24h & 2h before midterm assessments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.quizAlerts}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, quizAlerts: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Mentor & Faculty Verified Answers</div>
                    <div className="text-[10px] text-slate-500">Real-time alerts when your questions get verified</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.mentorMessages}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, mentorMessages: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">AI Daily Academic Summary</div>
                    <div className="text-[10px] text-slate-500">Personalized progress summary delivered every morning</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailySummary}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, dailySummary: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Weekly Pomodoro Target</div>
                    <div className="text-[10px] text-slate-500">Aim for {weeklyGoalPomodoros} focus blocks (4 hours)</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setWeeklyGoalPomodoros(Math.max(2, weeklyGoalPomodoros - 2))}
                      className="w-6 h-6 rounded bg-white border border-slate-300 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-4 text-center">{weeklyGoalPomodoros}</span>
                    <button 
                      type="button" 
                      onClick={() => setWeeklyGoalPomodoros(weeklyGoalPomodoros + 2)}
                      className="w-6 h-6 rounded bg-white border border-slate-300 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back to Courses
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 group transition-all"
              >
                <span>Proceed to Diagnostic Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DIAGNOSTIC KNOWLEDGE ASSESSMENT */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {!assessmentCompleted ? (
              <>
                {/* Diagnostic Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Initial Academic Knowledge Diagnostic
                      </h2>
                      <p className="text-[11px] text-amber-800">
                        No previous academic profile exists. This 5-question baseline assessment will calibrate your personalized learning profile.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    Question {currentQuestionIdx + 1} of {DIAGNOSTIC_QUESTIONS.length}
                  </span>
                </div>

                {/* Question Box */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {currentQ.topic}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Course: {currentQ.course}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>

                  {currentQ.codeSnippet && (
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-indigo-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{currentQ.codeSnippet}</code>
                    </pre>
                  )}

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQuestionIdx] === optIdx;
                      const isCorrect = optIdx === currentQ.correctAnswer;
                      
                      let optionClasses = 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800';
                      if (showExplanation) {
                        if (isCorrect) {
                          optionClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isSelected) {
                          optionClasses = 'border-rose-400 bg-rose-50 text-rose-900';
                        }
                      } else if (isSelected) {
                        optionClasses = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => !showExplanation && handleSelectAnswer(optIdx)}
                          disabled={showExplanation}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optionClasses}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {showExplanation && isCorrect && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Correct ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {showExplanation && (
                    <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 space-y-1 animate-in fade-in">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Concept Explanation:</span>
                      </div>
                      <p className="leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Diagnostic Question Nav */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    {Object.keys(answers).length} answered
                  </span>

                  {showExplanation && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                      <span>
                        {currentQuestionIdx < DIAGNOSTIC_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Assessment'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Diagnostic Completed & Initial Profile Created */
              <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-amber-200">
                  <Award className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Diagnostic Baseline Established
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">
                    Learning Profile Initialized!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                    Your baseline assessment is complete. NexusAI has generated your initial topic radar and priority roadmap.
                  </p>
                </div>

                {/* Score & Initial Insights Snapshot */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Rank</span>
                    <div className="text-base font-extrabold text-amber-600 flex items-center gap-1.5 mt-0.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>{diagnosticScore >= 60 ? 'Gold Learner' : 'Silver Rising'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Mastery</span>
                    <div className="text-base font-extrabold text-indigo-600 mt-0.5">
                      {diagnosticScore}%
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Initial Flagged Focus Area</span>
                    <div className="text-xs font-bold text-rose-600 flex items-center justify-between mt-1">
                      <span>Pointer Arithmetic & Memory</span>
                      <span className="bg-rose-50 px-2 py-0.5 rounded text-[10px]">Priority Focus</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-300 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Academic Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
