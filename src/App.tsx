import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { FirstTimeOnboarding } from './components/FirstTimeOnboarding';
import { Navbar } from './components/Navbar';
import { WelcomeCard } from './components/WelcomeCard';
import { AIDailySummary } from './components/AIDailySummary';
import { AcademicSnapshot } from './components/AcademicSnapshot';
import { SmartReminders } from './components/SmartReminders';
import { ProgressMotivation } from './components/ProgressMotivation';
import { TimetableSchedule } from './components/TimetableSchedule';
import { MockTestModal } from './components/MockTestModal';
import { AIClassroomModal } from './components/AIClassroomModal';
import { RevisionModal } from './components/RevisionModal';
import { PracticeQuestionsModal } from './components/PracticeQuestionsModal';
import { PomodoroModal } from './components/PomodoroModal';
import { SeniorMentorView } from './components/SeniorMentorView';
import { FacultyView } from './components/FacultyView';
import { AdminView } from './components/AdminView';
import { CoursesPage } from './components/CoursesPage';
import { CourseDetailModal } from './components/CourseDetailModal';
import { LeaderboardPage } from './components/LeaderboardPage';
import { CommunityPage } from './components/CommunityPage';
import { MessagingPage } from './components/MessagingPage';
import { SMART_REMINDERS, INITIAL_MESSAGES } from './mockData';
import type { UserProfile, AppPage } from './types';

type ModalType = 'mockTest' | 'aiClassroom' | 'revision' | 'practice' | 'pomodoro' | 'notifications' | null;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [revisionTopic, setRevisionTopic] = useState('');
  const [practiceTopic, setPracticeTopic] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages] = useState(INITIAL_MESSAGES.filter(m => m.unread).length);

  // Persist user session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('campus_qa_user');
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
    try {
      localStorage.setItem('campus_qa_user', JSON.stringify(user));
      const registered = localStorage.getItem('campus_qa_registered_users');
      const usersMap = registered ? JSON.parse(registered) : {};
      const key = user.email.toLowerCase().trim();
      if (usersMap[key] || (!key.includes('demo') && !key.includes('rachel') && !key.includes('thorne') && !key.includes('miller'))) {
        usersMap[key] = user;
        localStorage.setItem('campus_qa_registered_users', JSON.stringify(usersMap));
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
    try {
      localStorage.removeItem('campus_qa_user');
    } catch {
      // Ignore storage errors
    }
  };

  const handleSwitchUser = (key: string) => {
    import('./mockData').then(m => {
      const user = m.PRESET_USERS[key as keyof typeof m.PRESET_USERS];
      if (user) handleLogin(user);
    });
  };

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    if (page === 'ai-classroom') setOpenModal('aiClassroom');
    setShowNotifications(false);
  };

  const openRevision = (topic: string) => { setRevisionTopic(topic); setOpenModal('revision'); };
  const openPractice = (topic: string) => { setPracticeTopic(topic); setOpenModal('practice'); };
  const closeModal = () => setOpenModal(null);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }

  // ── ROLE-BASED VIEWS ──────────────────────────────────────────────────────
  const renderRoleView = () => {
    switch (currentUser.role) {
      case 'Senior Mentor':
        return <SeniorMentorView user={currentUser} onOpenAIClassroom={() => setOpenModal('aiClassroom')} />;
      case 'Faculty Mentor':
        return <FacultyView user={currentUser} />;
      case 'Administrator':
        return <AdminView user={currentUser} />;
      default:
        return renderStudentDashboard();
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'courses':
        return <CoursesPage user={currentUser} onSelectCourse={(c) => setSelectedCourse(c)} />;
      case 'leaderboard':
        return <LeaderboardPage user={currentUser} />;
      case 'community':
        return <CommunityPage user={currentUser} />;
      case 'messages':
        return <MessagingPage user={currentUser} />;
      case 'ai-classroom':
        // AI Classroom is a modal, navigate back to dashboard
        setCurrentPage('dashboard');
        setOpenModal('aiClassroom');
        return renderStudentDashboard();
      default:
        return renderRoleView();
    }
  };

  const renderStudentDashboard = () => (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Welcome + Graphs */}
      <WelcomeCard
        user={currentUser}
        onOpenRevision={openRevision}
        onOpenPracticeQuestions={openPractice}
        onOpenMiniAssessment={(topic) => { setPracticeTopic(topic); setOpenModal('mockTest'); }}
        onOpenMockTest={() => setOpenModal('mockTest')}
        onOpenAIClassroom={() => setOpenModal('aiClassroom')}
        onOpenPomodoro={() => setOpenModal('pomodoro')}
        onNavigateCourses={() => setCurrentPage('courses')}
        onNavigateMessages={() => setCurrentPage('messages')}
      />

      {/* Two-column: AI Summary + Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AIDailySummary 
          user={currentUser} 
          onNavigateCourses={() => setCurrentPage('courses')}
          onOpenMockTest={() => setOpenModal('mockTest')}
          onNavigateMessages={() => setCurrentPage('messages')}
        />
        <SmartReminders user={currentUser} />
      </div>

      {/* Academic Snapshot (full width) */}
      <AcademicSnapshot 
        user={currentUser} 
        onNavigateCourses={() => setCurrentPage('courses')}
        onOpenMockTest={() => setOpenModal('mockTest')}
      />

      {/* Two-column: Progress Motivations + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProgressMotivation user={currentUser} />
        <TimetableSchedule user={currentUser} onOpenAIClassroom={() => setOpenModal('aiClassroom')} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        unreadCount={SMART_REMINDERS.filter(r => r.urgent).length}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadMessages={unreadMessages}
        onOpenTimer={() => setOpenModal('pomodoro')}
      />

      {/* Notification Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-16 right-4 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto p-3 space-y-2">
              {SMART_REMINDERS.map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800">{r.title}</div>
                  <div className="text-slate-500 mt-0.5">{r.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{renderPageContent()}</main>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {openModal === 'mockTest' && (
        <MockTestModal isOpen onClose={closeModal} user={currentUser} />
      )}
      {openModal === 'aiClassroom' && (
        <AIClassroomModal isOpen onClose={closeModal} user={currentUser} />
      )}
      {openModal === 'revision' && (
        <RevisionModal isOpen topic={revisionTopic} onClose={closeModal} />
      )}
      {openModal === 'practice' && (
        <PracticeQuestionsModal isOpen topic={practiceTopic} onClose={closeModal} />
      )}
      {openModal === 'pomodoro' && (
        <PomodoroModal isOpen onClose={closeModal} />
      )}
      {selectedCourse && (
        <CourseDetailModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          user={currentUser}
          onOpenMockTest={() => { setSelectedCourse(null); setOpenModal('mockTest'); }}
          onOpenAIClassroom={() => { setSelectedCourse(null); setOpenModal('aiClassroom'); }}
        />
      )}
    </div>
  );
}
