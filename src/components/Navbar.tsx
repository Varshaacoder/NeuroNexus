import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Bell, Sparkles, LogOut, Search, ChevronDown,
  ShieldCheck, Flame, Clock, BookOpen, Users, MessageSquare,
  Trophy, Home, Menu, X, User, ChevronRight, Bot, Brain, FileCheck2, Cpu
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

const NAV_ITEMS: { label: string; page: AppPage; icon: React.ReactNode; }[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <Home className="w-4 h-4" /> },
  { label: 'Courses', page: 'courses', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Tests', page: 'tests', icon: <FileCheck2 className="w-4 h-4" /> },
  { label: 'Neuro Analysis', page: 'neuro-analysis', icon: <Brain className="w-4 h-4 text-indigo-600" /> },
  { label: 'Community', page: 'community', icon: <Users className="w-4 h-4" /> },
  { label: 'Leaderboard', page: 'leaderboard', icon: <Trophy className="w-4 h-4" /> },
  { label: 'Messages', page: 'messages', icon: <MessageSquare className="w-4 h-4" /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser, onLogout, onSwitchUser, onOpenNotifications,
  unreadCount, currentPage, onNavigate, unreadMessages, onOpenTimer,
  onOpenHardwareManager,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [eegState, setEegState] = useState(eegService.getStatus().state);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return eegService.onStatusChange((s) => setEegState(s.state));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          action: () => { onNavigate('courses'); setShowSearch(false); setSearchQuery(''); }
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
          action: () => { onNavigate('community'); setShowSearch(false); setSearchQuery(''); }
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
          action: () => { onNavigate('leaderboard'); setShowSearch(false); setSearchQuery(''); }
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
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md shadow-indigo-200">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-slate-900 tracking-tight">
              Neuro<span className="text-indigo-600">Nexus</span>
            </span>
            {isDemoUser(currentUser.id, currentUser.email) && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                DEMO MODE
              </span>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        {currentUser.role === 'Student' && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                  currentPage === item.page
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.page === 'messages' && unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}

        {/* Search Bar */}
        <div ref={searchRef} className="hidden lg:block flex-1 max-w-sm relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearch(true)}
              onChange={(e) => { handleSearch(e.target.value); setShowSearch(true); }}
              placeholder="Search courses, posts, students... (Ctrl+K)"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {searchResults.length} Results for "{searchQuery}"
                    </span>
                  </div>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={result.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        result.type === 'course' ? 'bg-indigo-500' :
                        result.type === 'post' ? 'bg-amber-500' :
                        result.type === 'rank' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}>
                        {result.type === 'course' ? '📚' : result.type === 'post' ? '💬' : result.type === 'rank' ? '🏆' : '👤'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{result.title}</div>
                        <div className="text-[11px] text-slate-500">{result.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No results for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* BioAmp Hardware Pill */}
          <button
            onClick={onOpenHardwareManager}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              eegState === 'streaming'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : eegState === 'connected'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="BioAmp EXG Pill Hardware Settings"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {eegState === 'streaming' ? 'BioAmp: Live' : eegState === 'connected' ? 'BioAmp: Ready' : 'BioAmp HW'}
            </span>
            {eegState === 'streaming' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </button>

          {/* Timer Pill */}
          {currentUser.role === 'Student' && currentUser.streakDays && (
            <button
              onClick={onOpenTimer}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{currentUser.streakDays}d</span>
              <span className="text-amber-300">|</span>
              <Clock className="w-3 h-3" />
              <span>Timer</span>
            </button>
          )}

          {/* AI Button */}
          {currentUser.role === 'Student' && (
            <button
              onClick={() => onNavigate('ai-classroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentPage === 'ai-classroom'
                  ? 'bg-violet-600 text-white border-violet-700'
                  : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Classroom</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-white transition-all"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-lg object-cover" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none">{currentUser.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Direct Sign Out Button */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
              title="Sign Out of NeuroNexus"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
                onClick={() => setShowUserMenu(false)}
              >
                {/* Current user info */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-xs text-slate-500">{currentUser.email}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block ${getRoleColor(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch Persona */}
                <div className="p-2">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Persona (Demo / Evaluator)
                  </div>
                  {Object.entries(PRESET_USERS).map(([key, user]) => {
                    const isActive = user.id === currentUser.id;
                    return (
                      <button
                        key={key}
                        onClick={() => onSwitchUser(key)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                          isActive ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{user.role}{user.rank ? ` • ${user.rank}` : ''}</div>
                        </div>
                        {isActive && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && currentUser.role === 'Student' && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {/* Mobile Search */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search courses, posts, students..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-slate-800 placeholder-slate-400"
            />
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setShowMobileMenu(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentPage === item.page
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { onNavigate('ai-classroom'); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>AI Classroom</span>
          </button>
          <button
            onClick={() => { onLogout(); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
