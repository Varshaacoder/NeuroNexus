import type { AppPage } from '../types';

export interface RouteState {
  page: AppPage | 'faculty';
  authModal: boolean;
  authMode: 'login' | 'register';
  modal: string | null;
  path: string;
}

export const ROUTE_TITLES: Record<string, string> = {
  landing: 'AI Academic Collaboration & NeuroFocus Platform',
  dashboard: 'Student Dashboard',
  courses: 'Computer Science Curriculum & YouTube Lessons',
  tests: 'Diagnostic Mock Tests & Neural Tracking',
  'neuro-analysis': 'Cognitive Workload & EEG Biopotentials',
  'hardware-integration': 'BioAmp Hardware Ingestion Rig',
  community: 'Campus Peer Q&A & Academic Forum',
  leaderboard: 'Academic Rank & Neural Streak Leaderboard',
  messages: 'Direct Faculty & Mentor Messaging',
  'ai-classroom': 'Interactive AI Whiteboard & Socratic Tutor',
  'parent-portal': 'Authorized Family Support & Wellbeing Portal',
  wellbeing: 'Student Wellbeing & Rest Center',
  faculty: 'Faculty Mentor Academic Analytics',
  signin: 'Institutional Sign In',
  signup: 'Student Registration & Assessment',
};

/**
 * Normalizes a pathname string (removes trailing slashes, lowercases).
 */
export function normalizePath(pathname: string): string {
  const clean = pathname.trim().toLowerCase();
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

/**
 * Parses any browser pathname into a normalized RouteState.
 */
export function parseRoute(pathname = window.location.pathname, search = window.location.search): RouteState {
  const norm = normalizePath(pathname);

  // 1. Authentication routes
  if (norm === '/signin' || norm === '/login') {
    return { page: 'landing', authModal: true, authMode: 'login', modal: null, path: norm };
  }
  if (norm === '/signup' || norm === '/register') {
    return { page: 'landing', authModal: true, authMode: 'register', modal: null, path: norm };
  }

  // 2. Home / Landing routes
  if (norm === '/' || norm === '/home' || norm === '/landing') {
    return { page: 'landing', authModal: false, authMode: 'login', modal: null, path: '/' };
  }

  // 3. Core feature pages
  if (norm === '/dashboard') {
    return { page: 'dashboard', authModal: false, authMode: 'login', modal: null, path: '/dashboard' };
  }
  if (norm === '/courses' || norm === '/courses/lessons' || norm === '/lessons') {
    return { page: 'courses', authModal: false, authMode: 'login', modal: null, path: '/courses' };
  }
  if (norm === '/tests' || norm === '/mock-test' || norm === '/exams') {
    return { page: 'tests', authModal: false, authMode: 'login', modal: null, path: '/tests' };
  }
  if (norm === '/neuro-analysis' || norm === '/neuro' || norm === '/eeg') {
    return { page: 'neuro-analysis', authModal: false, authMode: 'login', modal: null, path: '/neuro-analysis' };
  }
  if (norm === '/hardware-integration' || norm === '/hardware' || norm === '/bioamp') {
    return { page: 'hardware-integration', authModal: false, authMode: 'login', modal: null, path: '/hardware-integration' };
  }
  if (norm === '/community' || norm === '/campus-qa' || norm === '/qa' || norm === '/forum') {
    return { page: 'community', authModal: false, authMode: 'login', modal: null, path: '/community' };
  }
  if (norm === '/leaderboard' || norm === '/ranks') {
    return { page: 'leaderboard', authModal: false, authMode: 'login', modal: null, path: '/leaderboard' };
  }
  if (norm === '/messages' || norm === '/chat') {
    return { page: 'messages', authModal: false, authMode: 'login', modal: null, path: '/messages' };
  }
  if (norm === '/ai-classroom' || norm === '/ai-help' || norm === '/classroom') {
    return { page: 'ai-classroom', authModal: false, authMode: 'login', modal: 'aiClassroom', path: '/ai-classroom' };
  }
  if (norm === '/parent-portal' || norm === '/parent' || norm === '/guardian') {
    return { page: 'parent-portal', authModal: false, authMode: 'login', modal: null, path: '/parent-portal' };
  }
  if (norm === '/wellbeing' || norm === '/student-wellbeing' || norm === '/wellness') {
    return { page: 'wellbeing', authModal: false, authMode: 'login', modal: null, path: '/wellbeing' };
  }
  if (norm === '/faculty' || norm === '/faculty-dashboard') {
    return { page: 'faculty', authModal: false, authMode: 'login', modal: null, path: '/faculty' };
  }

  // Fallback: match by prefix
  if (norm.startsWith('/courses')) return { page: 'courses', authModal: false, authMode: 'login', modal: null, path: '/courses' };
  if (norm.startsWith('/neuro')) return { page: 'neuro-analysis', authModal: false, authMode: 'login', modal: null, path: '/neuro-analysis' };
  if (norm.startsWith('/parent')) return { page: 'parent-portal', authModal: false, authMode: 'login', modal: null, path: '/parent-portal' };

  // Unknown route -> default to landing page
  return { page: 'landing', authModal: false, authMode: 'login', modal: null, path: '/' };
}

/**
 * Generates the clean canonical URL path for a given page and auth state.
 */
export function routeToPath(page: AppPage | 'faculty', authModal = false, authMode: 'login' | 'register' = 'login'): string {
  if (authModal) {
    return authMode === 'register' ? '/signup' : '/signin';
  }
  switch (page) {
    case 'landing': return '/';
    case 'dashboard': return '/dashboard';
    case 'courses': return '/courses';
    case 'tests': return '/tests';
    case 'neuro-analysis': return '/neuro-analysis';
    case 'hardware-integration': return '/hardware-integration';
    case 'community': return '/community';
    case 'leaderboard': return '/leaderboard';
    case 'messages': return '/messages';
    case 'ai-classroom': return '/ai-classroom';
    case 'parent-portal': return '/parent-portal';
    case 'wellbeing': return '/wellbeing';
    case 'faculty': return '/faculty';
    default: return '/';
  }
}

/**
 * Pushes or replaces a browser history entry and updates document.title.
 */
export function navigateHistory(
  targetPath: string,
  state: Partial<RouteState> = {},
  options: { replace?: boolean } = {}
): void {
  const currentPath = normalizePath(window.location.pathname);
  const target = normalizePath(targetPath);

  // Set document title
  const key = targetPath.replace('/', '') || 'landing';
  const subtitle = ROUTE_TITLES[key] || 'AI Academic Collaboration';
  document.title = `NeuroNexus | ${subtitle}`;

  const stateToSave = {
    ...state,
    path: target,
    timestamp: Date.now(),
  };

  // Only push if target path is actually different or replacing
  if (options.replace) {
    window.history.replaceState(stateToSave, '', target);
  } else if (currentPath !== target) {
    window.history.pushState(stateToSave, '', target);
  }
}
