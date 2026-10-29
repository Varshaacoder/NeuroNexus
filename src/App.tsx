import React, { useState, useEffect, useCallback } from 'react';
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
import { TestsPage } from './components/TestsPage';
import { NeuroAnalysisPage } from './components/NeuroAnalysisPage';
import { BioAmpHardwareModal } from './components/BioAmpHardwareModal';
import { HardwareDashboard } from './components/HardwareDashboard';
import { LandingPage } from './components/LandingPage';
import { ParentGuardianPortal } from './components/ParentGuardianPortal';
import { StudentWellbeingPage } from './components/StudentWellbeingPage';
import { SMART_REMINDERS, INITIAL_MESSAGES, PRESET_USERS } from './mockData';
import { isDemoUser, resetDemoData } from './utils/neuroSessionStore';
import { parseRoute, routeToPath, navigateHistory, ROUTE_TITLES } from './utils/router';
import type { UserProfile, AppPage } from './types';

type ModalType = 'mockTest' | 'aiClassroom' | 'revision' | 'practice' | 'pomodoro' | 'notifications' | null;

export default function App() {
  const initialRoute = parseRoute();

  // Restore authenticated session or initialize demo user if direct protected route
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('campus_qa_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore parse errors
    }
    // If opening an authorized route directly without previous session,
    // default to demo student (or Eleanor for parent-portal) so visitors can inspect valid routes without roadblock
    if (initialRoute.page !== 'landing' && !initialRoute.authModal) {
      if (initialRoute.page === 'parent-portal') {
        return PRESET_USERS.guardian_eleanor;
      }
      return PRESET_USERS.demo_student;
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<AppPage>(initialRoute.page as AppPage);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(initialRoute.authModal);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialRoute.authMode);
  const [openModal, setOpenModal] = useState<ModalType>(initialRoute.modal as ModalType);

  const [revisionTopic, setRevisionTopic] = useState('');
  const [practiceTopic, setPracticeTopic] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages] = useState(INITIAL_MESSAGES.filter(m => m.unread).length);
  const [activeTestConfig, setActiveTestConfig] = useState<{ title: string; course: string; topic?: string }>({
    title: 'Personalized Mock Test',
    course: 'CS201 C Programming & Systems',
  });
  const [selectedNeuroSessionId, setSelectedNeuroSessionId] = useState<string | null>(null);
  const [showHardwareModal, setShowHardwareModal] = useState(false);

  // ── 1. INITIAL ROUTE SYNCHRONIZATION ───────────────────────────────────────
  useEffect(() => {
    const init = parseRoute();
    const targetPath = routeToPath(init.page as AppPage, init.authModal, init.authMode);
    navigateHistory(
      targetPath,
      { page: init.page, authModal: init.authModal, authMode: init.authMode, modal: init.modal },
      { replace: true }
    );
  }, []);

  // ── 2. BROWSER BACK / FORWARD POPSTATE LISTENER ───────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute(window.location.pathname, window.location.search);
      setCurrentPage(route.page as AppPage);
      setShowAuthModal(route.authModal);
      setAuthMode(route.authMode);
      setOpenModal(route.modal as ModalType);
      setShowNotifications(false);

      // Restore session if user exists in storage or default to persona for route
      if (!currentUser && route.page !== 'landing' && !route.authModal) {
        try {
          const saved = localStorage.getItem('campus_qa_user');
          if (saved) setCurrentUser(JSON.parse(saved));
          else if (route.page === 'parent-portal') setCurrentUser(PRESET_USERS.guardian_eleanor);
          else setCurrentUser(PRESET_USERS.demo_student);
        } catch {
          if (route.page === 'parent-portal') setCurrentUser(PRESET_USERS.guardian_eleanor);
          else setCurrentUser(PRESET_USERS.demo_student);
        }
      }

      // Update document title
      const key = route.path.replace('/', '') || 'landing';
      document.title = `NeuroNexus | ${ROUTE_TITLES[key] || 'AI Academic Collaboration'}`;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // ── 3. PROGRAMMATIC NAVIGATION WITH HISTORY ───────────────────────────────
  const handleNavigate = useCallback((page: AppPage, options?: { replace?: boolean }) => {
    setCurrentPage(page);
    setShowNotifications(false);
    setShowAuthModal(false);

    if (page === 'ai-classroom') {
      setOpenModal('aiClassroom');
    } else if (openModal === 'aiClassroom') {
      setOpenModal(null);
    }

    const targetPath = routeToPath(page, false);
    navigateHistory(
      targetPath,
      {
        page,
        authModal: false,
        authMode: 'login',
        modal: page === 'ai-classroom' ? 'aiClassroom' : null
      },
      options
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [openModal]);

  const openAuth = (mode: 'login' | 'register') => {
    setShowAuthModal(true);
    setAuthMode(mode);
    const targetPath = mode === 'register' ? '/signup' : '/signin';
    navigateHistory(targetPath, { page: 'landing', authModal: true, authMode: mode, modal: null });
  };

  const closeAuth = () => {
    setShowAuthModal(false);
    navigateHistory('/', { page: 'landing', authModal: false, authMode: 'login', modal: null });
  };

  const handleLogin = (user: UserProfile, targetPage?: AppPage) => {
    setCurrentUser(user);
    setShowAuthModal(false);
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
    if (targetPage) {
      handleNavigate(targetPage);
    } else if (user.role === 'Parent/Guardian') {
      handleNavigate('parent-portal');
    } else if (user.role === 'Faculty Mentor') {
      handleNavigate('faculty');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuthModal(false);
    try {
      localStorage.removeItem('campus_qa_user');
    } catch {
      // Ignore storage errors
    }
    handleNavigate('landing');
  };

  const handleSwitchUser = (key: string) => {
    import('./mockData').then(m => {
      const user = m.PRESET_USERS[key as keyof typeof m.PRESET_USERS];
      if (user) handleLogin(user);
    });
  };

  const openRevision = (topic: string) => { setRevisionTopic(topic); setOpenModal('revision'); };
  const openPractice = (topic: string) => { setPracticeTopic(topic); setOpenModal('practice'); };
  const closeModal = () => {
    if (openModal === 'aiClassroom' && currentPage === 'ai-classroom') {
      handleNavigate('dashboard');
    } else {
      setOpenModal(null);
    }
  };

  // ── AUTH & LANDING GATES ──────────────────────────────────────────────────
  if (!currentUser) {
    if (showAuthModal) {
      return (
        <div className="relative min-h-screen bg-[#F3F6FF]">
          <div className="max-w-md mx-auto pt-6 px-4">
            <button
              onClick={closeAuth}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E1E7F2] text-[#17213B] shadow-sm hover:bg-[#F3F6FF] transition-all"
            >
              ← Back to Platform Overview
            </button>
          </div>
          <AuthPage
            initialMode={authMode}
            onLoginSuccess={(u) => handleLogin(u)}
            onModeChange={(m) => {
              setAuthMode(m);
              navigateHistory(m === 'register' ? '/signup' : '/signin', { page: 'landing', authModal: true, authMode: m }, { replace: true });
            }}
          />
        </div>
      );
    }

    if (currentPage === 'parent-portal') {
      return (
        <div className="min-h-screen bg-slate-50">
          <Navbar
            currentUser={PRESET_USERS.guardian_eleanor}
            onLogout={handleLogout}
            onSwitchUser={handleSwitchUser}
            onOpenNotifications={() => setShowNotifications(!showNotifications)}
            unreadCount={0}
            currentPage="parent-portal"
            onNavigate={handleNavigate}
            unreadMessages={0}
            onOpenTimer={() => setOpenModal('pomodoro')}
          />
          <ParentGuardianPortal
            user={PRESET_USERS.guardian_eleanor}
            onNavigateDashboard={() => handleNavigate('dashboard')}
            onNavigateCourses={() => handleNavigate('courses')}
            onNavigateWellbeing={() => handleNavigate('wellbeing')}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <LandingPage
        onEnterDashboard={(user) => handleLogin(user || PRESET_USERS.demo_student)}
        onOpenAuth={() => openAuth('login')}
        onNavigatePage={(page) => {
          if (page === 'parent-portal') {
            handleLogin(PRESET_USERS.guardian_eleanor, 'parent-portal');
          } else {
            handleNavigate(page);
          }
        }}
      />
    );
  }

  // ── ROLE-BASED VIEWS ──────────────────────────────────────────────────────
  const renderRoleView = () => {
    switch (currentUser.role) {
      case 'Senior Mentor':
        return <SeniorMentorView user={currentUser} onOpenAIClassroom={() => handleNavigate('ai-classroom')} />;
      case 'Faculty Mentor':
        return <FacultyView user={currentUser} />;
      case 'Administrator':
        return <AdminView user={currentUser} />;
      case 'Parent/Guardian':
        return (
          <ParentGuardianPortal
            user={currentUser}
            onNavigateDashboard={() => handleNavigate('dashboard')}
            onNavigateCourses={() => handleNavigate('courses')}
            onNavigateWellbeing={() => handleNavigate('wellbeing')}
            onLogout={handleLogout}
          />
        );
      default:
        return renderStudentDashboard();
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onEnterDashboard={() => handleNavigate('dashboard')}
            onOpenAuth={() => openAuth('login')}
            onNavigatePage={(page) => {
              if (page === 'parent-portal') {
                handleLogin(PRESET_USERS.guardian_eleanor, 'parent-portal');
              } else {
                handleNavigate(page);
              }
            }}
          />
        );
      case 'parent-portal':
        return (
          <ParentGuardianPortal
            user={currentUser.role === 'Parent/Guardian' ? currentUser : PRESET_USERS.guardian_eleanor}
            onNavigateDashboard={() => handleNavigate('dashboard')}
            onNavigateCourses={() => handleNavigate('courses')}
            onNavigateWellbeing={() => handleNavigate('wellbeing')}
            onLogout={handleLogout}
          />
        );
      case 'wellbeing':
        return (
          <StudentWellbeingPage
            user={currentUser}
            onNavigateDashboard={() => handleNavigate('dashboard')}
            onOpenTimer={() => setOpenModal('pomodoro')}
          />
        );
      case 'faculty':
        return <FacultyView user={currentUser.role === 'Faculty Mentor' ? currentUser : PRESET_USERS.faculty_thorne} />;
      case 'courses':
        return <CoursesPage user={currentUser} onSelectCourse={(c) => setSelectedCourse(c)} />;
      case 'tests':
        return (
          <TestsPage
            user={currentUser}
            onStartTest={(cfg) => {
              setActiveTestConfig(cfg);
              setOpenModal('mockTest');
            }}
            onNavigateToNeuroAnalysis={(sessId) => {
              if (sessId) setSelectedNeuroSessionId(sessId);
              handleNavigate('neuro-analysis');
            }}
          />
        );
      case 'neuro-analysis':
        return (
          <NeuroAnalysisPage
            user={currentUser}
            initialSessionId={selectedNeuroSessionId}
            onNavigateToTests={() => handleNavigate('tests')}
            onStartStudySession={() => setOpenModal('pomodoro')}
            onOpenHardwareManager={() => setShowHardwareModal(true)}
            onNavigateToHardwareRig={() => handleNavigate('hardware-integration')}
          />
        );
      case 'hardware-integration':
        return (
          <HardwareDashboard
            user={currentUser}
            onNavigateToNeuroAnalysis={() => handleNavigate('neuro-analysis')}
            onOpenTimer={() => setOpenModal('pomodoro')}
          />
        );
      case 'leaderboard':
        return <LeaderboardPage user={currentUser} />;
      case 'community':
        return <CommunityPage user={currentUser} />;
      case 'messages':
        return <MessagingPage user={currentUser} />;
      case 'ai-classroom':
        // Renders student dashboard with AI Classroom modal active on this route
        return renderRoleView();
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
        onOpenAIClassroom={() => handleNavigate('ai-classroom')}
        onOpenPomodoro={() => setOpenModal('pomodoro')}
        onNavigateCourses={() => handleNavigate('courses')}
        onNavigateMessages={() => handleNavigate('messages')}
        onNavigateTests={() => handleNavigate('tests')}
        onNavigateNeuroAnalysis={() => handleNavigate('neuro-analysis')}
        onNavigateHardware={() => handleNavigate('hardware-integration')}
      />

      {/* Two-column: AI Summary + Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AIDailySummary 
          user={currentUser} 
          onNavigateCourses={() => handleNavigate('courses')}
          onOpenMockTest={() => setOpenModal('mockTest')}
          onNavigateMessages={() => handleNavigate('messages')}
        />
        <SmartReminders user={currentUser} />
      </div>

      {/* Academic Snapshot (full width) */}
      <AcademicSnapshot 
        user={currentUser} 
        onNavigateCourses={() => handleNavigate('courses')}
        onOpenMockTest={() => setOpenModal('mockTest')}
      />

      {/* Two-column: Progress Motivations + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProgressMotivation user={currentUser} />
        <TimetableSchedule user={currentUser} onOpenAIClassroom={() => handleNavigate('ai-classroom')} />
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
        onOpenHardwareManager={() => setShowHardwareModal(true)}
      />

      {/* Persistent Demo Mode Banner (Suppressed on Parent Portal) */}
      {isDemoUser(currentUser.id, currentUser.email) && currentPage !== 'parent-portal' && currentUser.role !== 'Parent/Guardian' && (
        <div className="bg-gradient-to-r from-amber-600 via-indigo-700 to-purple-800 text-white px-4 py-2 text-xs shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-white/20">
              DEMO MODE
            </span>
            <span>
              <strong>Demonstration Dataset Active</strong> &bull; Evaluation profile with pre-populated records [<span className="font-semibold text-amber-200">Demo Data &mdash; Not Live EEG</span>].
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={() => {
                resetDemoData();
                window.location.reload();
              }}
              className="px-2.5 py-1 rounded bg-black/25 hover:bg-black/45 text-amber-100 hover:text-white border border-white/20 transition-all font-semibold"
            >
              Reset Demo Records
            </button>
            <button
              onClick={() => {
                handleLogout();
              }}
              className="px-2.5 py-1 rounded bg-white text-indigo-900 hover:bg-indigo-50 font-bold transition-all shadow-2xs"
            >
              + Register New Student (Clean State)
            </button>
          </div>
        </div>
      )}

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
        <MockTestModal
          isOpen
          onClose={closeModal}
          user={currentUser}
          testTitle={activeTestConfig.title}
          testCourse={activeTestConfig.course}
          onNavigateToNeuroAnalysis={(sessId) => {
            setSelectedNeuroSessionId(sessId);
            handleNavigate('neuro-analysis');
          }}
          onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        />
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
        <PomodoroModal
          isOpen
          onClose={closeModal}
          user={currentUser}
          onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          onNavigateToNeuroAnalysis={(sessId) => {
            if (sessId) setSelectedNeuroSessionId(sessId);
            handleNavigate('neuro-analysis');
          }}
          onOpenHardwareManager={() => setShowHardwareModal(true)}
        />
      )}
      {selectedCourse && (
        <CourseDetailModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          user={currentUser}
          onOpenMockTest={() => { setSelectedCourse(null); setOpenModal('mockTest'); }}
          onOpenAIClassroom={() => { setSelectedCourse(null); handleNavigate('ai-classroom'); }}
        />
      )}
      {showHardwareModal && (
        <BioAmpHardwareModal
          isOpen={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
        />
      )}
    </div>
  );
}
