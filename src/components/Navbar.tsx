import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Bell, Sparkles, LogOut, Search, ChevronDown,
  ShieldCheck, Flame, Clock, BookOpen, Users, MessageSquare,
  Trophy, Home, Menu, X, User, ChevronRight, Bot, Brain, FileCheck2, Cpu,
  Compass, MoreHorizontal, Check, Heart
} from 'lucide-react';
import type { UserProfile, UserRole, AppPage } from '../types';
import { PRESET_USERS, AVAILABLE_COURSES, COMMUNITY_POSTS, RANK_LEADERBOARD } from '../mockData';
import { isDemoUser } from '../utils/neuroSessionStore';
import { eegService } from '../services/eegService';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchUser: (userKey: string) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  unreadMessages: number;
  onOpenTimer: () => void;
  onOpenHardwareManager?: () => void;
}

type SearchResult = {
  type: 'course' | 'post' | 'rank' | 'student';
  title: string;
  subtitle: string;
  action: () => void;
};

interface NavItemDef {
  label: string;
  page: AppPage;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  accent?: string;
}

// ── PRIMARY NAVIGATION (Always directly accessible on desktop) ──────────────
const PRIMARY_NAV: NavItemDef[] = [
  { label: 'Home', page: 'landing', icon: Compass, description: 'Product landing page and platform overview', accent: 'text-[#2855D9]' },
  { label: 'Dashboard', page: 'dashboard', icon: Home, description: 'Personal study overview and analytics' },
  { label: 'Courses', page: 'courses', icon: BookOpen, description: 'Academic curriculum and course modules' },
  { label: 'Tests', page: 'tests', icon: FileCheck2, description: 'Diagnostic mock tests and benchmarks' },
  { label: 'Neuro Analysis', page: 'neuro-analysis', icon: Brain, description: 'Cognitive workload and focus dynamics', accent: 'text-[#00AFC1]' },
];

// ── SECONDARY NAVIGATION (Seamlessly available via 'More' on standard screens) ──
const SECONDARY_NAV: NavItemDef[] = [
  { label: 'Parent Portal', page: 'parent-portal', icon: ShieldCheck, description: 'Authorized student summary and family support', accent: 'text-[#059669]' },
  { label: 'Student Wellbeing', page: 'wellbeing', icon: Heart, description: 'Cognitive rest rituals and voluntary family check-in', accent: 'text-[#8755E8]' },
  { label: 'Hardware Rig', page: 'hardware-integration', icon: Cpu, description: 'Live EEG signal stream and hardware adapter', accent: 'text-[#00AFC1]' },
  { label: 'AI Classroom', page: 'ai-classroom', icon: Bot, description: 'Interactive Socratic tutor and whiteboard', accent: 'text-[#8755E8]' },
  { label: 'Community', page: 'community', icon: Users, description: 'Peer Q&A, faculty announcements and notes', accent: 'text-emerald-600' },
  { label: 'Leaderboard', page: 'leaderboard', icon: Trophy, description: 'Academic ranks, XP, and badges', accent: 'text-amber-600' },
  { label: 'Messages', page: 'messages', icon: MessageSquare, description: 'Faculty and mentor direct messaging', accent: 'text-blue-600' },
];

// ── PARENT / GUARDIAN NAVIGATION ────────────────────────────────────────────
const PARENT_PRIMARY_NAV: NavItemDef[] = [
  { label: 'Parent Dashboard', page: 'parent-portal', icon: ShieldCheck, description: 'Academic records & guardian overview', accent: 'text-[#059669]' },
  { label: 'Student Wellbeing', page: 'wellbeing', icon: Heart, description: 'Emotional check-ins and voluntary family sharing', accent: 'text-[#8755E8]' },
  { label: 'Courses & Curriculum', page: 'courses', icon: BookOpen, description: 'Syllabus, modules, and video lectures' },
  { label: 'Platform Overview', page: 'landing', icon: Compass, description: 'Platform overview and mission', accent: 'text-[#2855D9]' },
];

const PARENT_SECONDARY_NAV: NavItemDef[] = [
  { label: 'Direct Messages', page: 'messages', icon: MessageSquare, description: 'Faculty advising requests and messages', accent: 'text-blue-600' },
  { label: 'Campus Community', page: 'community', icon: Users, description: 'Announcements and peer forum', accent: 'text-emerald-600' },
];

// ── FACULTY MENTOR NAVIGATION ───────────────────────────────────────────────
const FACULTY_PRIMARY_NAV: NavItemDef[] = [
  { label: 'Faculty Hub', page: 'faculty', icon: GraduationCap, description: 'Curriculum analytics and course performance', accent: 'text-[#8755E8]' },
  { label: 'Courses', page: 'courses', icon: BookOpen, description: 'Course management and lesson playlists' },
  { label: 'Tests & Benchmarks', page: 'tests', icon: FileCheck2, description: 'Assessment results and diagnostic quizzes' },
  { label: 'Neuro Analysis', page: 'neuro-analysis', icon: Brain, description: 'Cognitive workload metrics', accent: 'text-[#00AFC1]' },
];

const FACULTY_SECONDARY_NAV: NavItemDef[] = [
  { label: 'Direct Messages', page: 'messages', icon: MessageSquare, description: 'Student advising and communication', accent: 'text-blue-600' },
  { label: 'Campus Community', page: 'community', icon: Users, description: 'Academic discussion forum', accent: 'text-emerald-600' },
  { label: 'Leaderboard', page: 'leaderboard', icon: Trophy, description: 'Department ranks and progress' },
  { label: 'Platform Overview', page: 'landing', icon: Compass, description: 'Home view', accent: 'text-[#2855D9]' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser, onLogout, onSwitchUser, onOpenNotifications,
  unreadCount, currentPage, onNavigate, unreadMessages, onOpenTimer,
  onOpenHardwareManager,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [eegState, setEegState] = useState(eegService.getStatus().state);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return eegService.onStatusChange((s) => setEegState(s.state));
  }, []);

  // Handle outside clicks and keyboard escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearch(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setShowMoreMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowUserMenu(false);
        setShowMoreMenu(false);
        setShowMobileMenu(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search courses
    AVAILABLE_COURSES.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({
          type: 'course',
          title: `${c.code} — ${c.name}`,
          subtitle: `${c.faculty} • ${c.credits} Credits`,
          action: () => { onNavigate('courses'); setShowSearch(false); setShowMobileSearch(false); setSearchQuery(''); }
        });
      }
    });

    // Search community posts
    COMMUNITY_POSTS.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)) {
        results.push({
          type: 'post',
          title: p.title,
          subtitle: `${p.course} • ${p.author.name}`,
          action: () => { onNavigate('community'); setShowSearch(false); setShowMobileSearch(false); setSearchQuery(''); }
        });
      }
    });

    // Search leaderboard names
    RANK_LEADERBOARD.forEach(r => {
      if (r.name.toLowerCase().includes(q)) {
        results.push({
          type: 'rank',
          title: r.name,
          subtitle: `Rank #${r.rank} • ${r.badge} • ${r.dept}`,
          action: () => { onNavigate('leaderboard'); setShowSearch(false); setShowMobileSearch(false); setSearchQuery(''); }
        });
      }
    });

    setSearchResults(results.slice(0, 6));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Student': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Senior Mentor': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Faculty Mentor': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Administrator': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Parent/Guardian': return 'bg-emerald-50 text-[#059669] border-[#A7F3D0]';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Role-aware primary and secondary navigation
  const primaryNav = currentUser.role === 'Parent/Guardian'
    ? PARENT_PRIMARY_NAV
    : currentUser.role === 'Faculty Mentor'
    ? FACULTY_PRIMARY_NAV
    : PRIMARY_NAV;

  const secondaryNav = currentUser.role === 'Parent/Guardian'
    ? PARENT_SECONDARY_NAV
    : currentUser.role === 'Faculty Mentor'
    ? FACULTY_SECONDARY_NAV
    : SECONDARY_NAV;

  // Check if current page is inside the Secondary/More menu
  const activeSecondaryItem = secondaryNav.find(item => item.page === currentPage);
  const isSecondaryActive = Boolean(activeSecondaryItem);

  const homePageDestination = currentUser.role === 'Parent/Guardian'
    ? 'parent-portal'
    : currentUser.role === 'Faculty Mentor'
    ? 'faculty'
    : 'dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 h-16 flex flex-row flex-nowrap items-center justify-between gap-2 lg:gap-3 xl:gap-4">
        
        {/* ── 1. LOGO & BRANDING ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate(homePageDestination)}
            className="flex items-center gap-2 sm:gap-2.5 group text-left focus:outline-none focus:ring-2 focus:ring-indigo-400/40 rounded-xl p-1 -m-1"
            title={`NeuroNexus ${currentUser.role === 'Parent/Guardian' ? 'Parent Portal' : 'Dashboard'}`}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                Neuro<span className="text-indigo-600">Nexus</span>
              </span>
              {isDemoUser(currentUser.id, currentUser.email) && currentPage !== 'parent-portal' && currentUser.role !== 'Parent/Guardian' && (
                <span className="hidden 2xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  DEMO MODE
                </span>
              )}
            </div>
          </button>
        </div>

        {/* ── 2. DESKTOP RESPONSIVE NAVIGATION (Single Horizontal Row) ────── */}
        <nav className="hidden lg:flex flex-row flex-nowrap items-center gap-1 xl:gap-1.5 shrink min-w-0" aria-label="Main Navigation">
          {/* Primary Navigation Items */}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                title={item.description}
                className={`flex flex-row flex-nowrap items-center gap-1.5 xl:gap-2 px-2.5 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.accent && !isActive ? item.accent : ''}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}

          {/* Secondary Navigation Items for Wide Screens (>= 1536px) */}
          {secondaryNav.length > 0 && (
            <div className="hidden 2xl:flex flex-row flex-nowrap items-center gap-1 xl:gap-1.5 shrink-0">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    title={item.description}
                    className={`flex flex-row flex-nowrap items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all relative shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.accent && !isActive ? item.accent : ''}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.page === 'messages' && unreadMessages > 0 && (
                      <span className="w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shrink-0">
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 'More' Overflow Dropdown for standard screens (< 1536px) */}
          {secondaryNav.length > 0 && (
            <div ref={moreMenuRef} className="relative 2xl:hidden shrink-0">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-row flex-nowrap items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all border shrink-0 whitespace-nowrap ${
                  isSecondaryActive
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold shadow-2xs'
                    : 'text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
                aria-expanded={showMoreMenu}
                aria-haspopup="true"
                title="Explore additional features and community modules"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="whitespace-nowrap">
                  {isSecondaryActive ? activeSecondaryItem?.label : 'More'}
                </span>
                {unreadMessages > 0 && !isSecondaryActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreMenu ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
              </button>

              {/* 'More' Menu Flyout Card */}
              {showMoreMenu && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                >
                  <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      Additional Modules & Features
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    {secondaryNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.page;
                      return (
                        <button
                          key={item.page}
                          onClick={() => {
                            onNavigate(item.page);
                            setShowMoreMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                            isActive
                              ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-100'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 group-hover:bg-slate-200 text-slate-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                <span>{item.label}</span>
                                {item.page === 'ai-classroom' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-violet-100 text-violet-700">
                                    AI
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {item.page === 'messages' && unreadMessages > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                                {unreadMessages}
                              </span>
                            )}
                            {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}

                    {/* Integrated Utilities in More Menu (for Student) */}
                    {currentUser.role === 'Student' && (
                      <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Study & Hardware Tools
                        </div>

                        <button
                          onClick={() => {
                            onOpenTimer();
                            setShowMoreMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold">Pomodoro & Stopwatch</span>
                            <span className="text-[10px] text-slate-400 block">Focus timer with streak counter</span>
                          </div>
                        </button>

                        {onOpenHardwareManager && (
                          <button
                            onClick={() => {
                              onOpenHardwareManager();
                              setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <Cpu className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold">BioAmp Hardware Manager</span>
                              <span className="text-[10px] text-slate-400 block">
                                Serial port & bridge diagnostics ({eegState})
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* ── 3. SEARCH (Adaptive inline / expanding input) ─────────────────── */}
        <div ref={searchRef} className="hidden lg:block relative shrink min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearch(true)}
              onChange={(e) => { handleSearch(e.target.value); setShowSearch(true); }}
              placeholder="Search courses, posts... (Ctrl+K)"
              className="w-36 xl:w-48 2xl:w-64 focus:w-64 pl-9 pr-7 py-1.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {searchResults.length} Matches for "{searchQuery}"
                    </span>
                  </div>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={result.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        result.type === 'course' ? 'bg-indigo-500' :
                        result.type === 'post' ? 'bg-amber-500' :
                        result.type === 'rank' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}>
                        {result.type === 'course' ? '📚' : result.type === 'post' ? '💬' : result.type === 'rank' ? '🏆' : '👤'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{result.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{result.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-center text-xs text-slate-400">
                  No matches found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 4. RIGHT ACTIONS & USER PROFILE ──────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Mobile search trigger */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Search courses & community"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Hardware Integration Dashboard Pill */}
          <button
            onClick={() => onNavigate('hardware-integration')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              currentPage === 'hardware-integration'
                ? 'bg-cyan-600 text-white border-cyan-700 shadow-2xs'
                : eegState === 'streaming'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : eegState === 'connected'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={`Hardware Ingestion Rig & Live Signal: ${eegState}`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">
              {currentPage === 'hardware-integration' ? 'Hardware Rig' : eegState === 'streaming' ? 'EEG Live' : eegState === 'connected' ? 'EEG Ready' : 'Hardware Rig'}
            </span>
            {eegState === 'streaming' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Timer Quick Pill (Wide screens only) */}
          {currentUser.role === 'Student' && currentUser.streakDays ? (
            <button
              onClick={onOpenTimer}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shrink-0"
              title="Open Pomodoro & Focus Timer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{currentUser.streakDays}d</span>
              <span className="text-amber-300">|</span>
              <Clock className="w-3 h-3" />
              <span className="hidden 2xl:inline">Timer</span>
            </button>
          ) : null}

          {/* AI Classroom Quick Launch Button (Visible on wide desktop) */}
          {currentUser.role === 'Student' && (
            <button
              onClick={() => onNavigate('ai-classroom')}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                currentPage === 'ai-classroom'
                  ? 'bg-violet-600 text-white border-violet-700 shadow-2xs'
                  : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
              }`}
              title="Launch AI Interactive Classroom"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Classroom</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors shrink-0"
            title="System & Academic Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown Button */}
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 sm:py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-white transition-all"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div className="hidden lg:block text-left max-w-[90px] xl:max-w-[110px]">
                <div className="text-xs font-bold text-slate-800 leading-none truncate">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                role="menu"
              >
                {/* Current user header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-200" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block ${getRoleColor(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch Persona (Demo & Evaluator Access) */}
                <div className="p-2">
                  <div className="px-2 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Switch Persona (Evaluator & Demo)
                  </div>
                  <div className="space-y-0.5 max-h-56 overflow-y-auto">
                    {Object.entries(PRESET_USERS).map(([key, user]) => {
                      const isActive = user.id === currentUser.id;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            onSwitchUser(key);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all ${
                            isActive ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                          role="menuitem"
                        >
                          <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">{user.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{user.role}{user.rank ? ` • ${user.rank}` : ''}</div>
                          </div>
                          {isActive && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Button (Visible on wide screens) */}
          <button
            onClick={onLogout}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shrink-0"
            title="Sign Out of NeuroNexus"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          {/* Mobile Hamburger Button (Tablets & Mobile: < lg) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── 5. MOBILE SEARCH OVERLAY (Appears when mobile search icon is tapped) ── */}
      {showMobileSearch && (
        <div className="lg:hidden px-4 py-2 bg-slate-50 border-t border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search courses, posts, topics..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-slate-800"
              autoFocus
            />
            <button
              onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 6. COMPACT MOBILE MENU (Phone & tablet: < lg) ──────────────────── */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Active User Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getRoleColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
          </div>

          {/* Core Modules for this Role */}
          <div>
            <div className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              {currentUser.role === 'Parent/Guardian' ? 'Guardian Portal' : currentUser.role === 'Faculty Mentor' ? 'Faculty Portal' : 'Academic Core'}
            </div>
            <div className="space-y-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => { onNavigate(item.page); setShowMobileMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.accent || 'text-indigo-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Modules & Collaboration */}
          {secondaryNav.length > 0 && (
            <div>
              <div className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Collaboration & Modules
              </div>
              <div className="space-y-1">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => { onNavigate(item.page); setShowMobileMenu(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${item.accent || 'text-slate-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.page === 'messages' && unreadMessages > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                          {unreadMessages}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Tools (if Student) */}
          {currentUser.role === 'Student' && (
            <div className="pt-2 border-t border-slate-100">
              <div className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onOpenTimer(); setShowMobileMenu(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Timer ({currentUser.streakDays || 0}d)</span>
                </button>

                {onOpenHardwareManager && (
                  <button
                    onClick={() => { onOpenHardwareManager(); setShowMobileMenu(false); }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold"
                  >
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>BioAmp ({eegState})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => { onLogout(); setShowMobileMenu(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
