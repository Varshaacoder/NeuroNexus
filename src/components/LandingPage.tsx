import React, { useEffect, useRef, useState } from 'react';
import {
  Brain, Activity, CheckSquare, Cpu, Heart, Play,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, BookOpen,
  Wifi, AlertTriangle, EyeOff, Sparkles, HelpCircle, Lock, Menu, X
} from 'lucide-react';
import type { UserProfile, AppPage } from '../types';
import { PRESET_USERS } from '../mockData';

interface LandingPageProps {
  onEnterDashboard: (user?: UserProfile) => void;
  onOpenAuth: () => void;
  onNavigatePage?: (page: AppPage) => void;
}

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard, onOpenAuth, onNavigatePage }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'good' | 'noisy' | 'disconnected'>('good');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animated Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // 3 traces in Light Theme colors:
      // Neural Cyan (#00AFC1), AI Violet (#8755E8), Royal Blue (#2855D9)
      const traces = [
        { color: 'rgba(0, 175, 193, 0.92)', yMid: height * 0.28, freq: 0.04, amp: 22, speed: 0.05 },
        { color: 'rgba(135, 85, 232, 0.90)', yMid: height * 0.52, freq: 0.07, amp: 18, speed: 0.07 },
        { color: 'rgba(40, 85, 217, 0.88)', yMid: height * 0.76, freq: 0.025, amp: 20, speed: 0.04 }
      ];

      traces.forEach(t => {
        ctx.beginPath();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 6;

        for (let x = 0; x < width; x += 3) {
          const y = t.yMid +
                    Math.sin(x * t.freq + step * t.speed) * t.amp +
                    Math.cos(x * 0.015 - step * 0.02) * (t.amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      step += 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleOpenParentPortal = () => {
    if (onNavigatePage) {
      onNavigatePage('parent-portal');
    } else {
      onEnterDashboard(PRESET_USERS.guardian_eleanor);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#17213B] flex flex-col font-sans">
      
      {/* ── TOP DEMO BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-[#F3F6FF] border-b border-[#E1E7F2] py-1.5 sm:py-2 px-2.5 sm:px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-black bg-[#E6F9FC] text-[#00AFC1] border border-[#B4EFF5] tracking-wider text-[10px] sm:text-[11px]">
              DEX26031
            </span>
            <span className="font-bold text-[#8755E8] text-[11px] sm:text-xs">Infinite Loopers</span>
            <span className="text-[#CBD5E1] hidden sm:inline">|</span>
            <span className="text-[#64708A] font-semibold hidden md:inline">Instant Role Selector:</span>
          </div>

          <div className="flex items-center flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#EEF3FF] hover:bg-[#D5E2FF] text-[#2855D9] border border-[#D5E2FF] text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              <span>Student</span>
            </button>
            <button
              onClick={() => onEnterDashboard(PRESET_USERS.faculty_thorne)}
              className="px-2 sm:px-3 py-1 rounded-lg bg-[#F6F0FF] hover:bg-[#E8DCFD] text-[#8755E8] border border-[#E8DCFD] text-[11px] sm:text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
            >
              🏛️ Faculty
            </button>
            <button
              onClick={handleOpenParentPortal}
              className="hidden xs:inline-flex px-2 sm:px-3 py-1 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] text-[11px] sm:text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
            >
              🛡️ Parent
            </button>
            <button
              onClick={onOpenAuth}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-white hover:bg-[#F3F6FF] text-[#17213B] border border-[#E1E7F2] text-[11px] sm:text-xs font-semibold transition-all shadow-2xs whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1E7F2] sticky top-10 z-40 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#2855D9] via-[#6842D0] to-[#8755E8] flex items-center justify-center text-white shadow-md shadow-[#2855D9]/20 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#17213B] whitespace-nowrap">
                NEURO<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2855D9] to-[#8755E8]">NEXUS</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#EEF3FF] text-[#2855D9] rounded-md border border-[#D5E2FF] whitespace-nowrap">
                Light Theme
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-semibold text-[#64708A] shrink min-w-0" aria-label="Landing Page Navigation">
            <a href="#features" className="hover:text-[#2855D9] transition-colors whitespace-nowrap">Features</a>
            <a href="#courses" className="hover:text-[#2855D9] transition-colors whitespace-nowrap">Courses</a>
            <a href="#neuro" className="hover:text-[#2855D9] transition-colors whitespace-nowrap">EEG Studio</a>
            <a href="#ai" className="hover:text-[#2855D9] transition-colors whitespace-nowrap">AI Insights</a>
            <a href="#wellbeing" className="hover:text-[#2855D9] transition-colors whitespace-nowrap">Wellbeing</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={handleOpenParentPortal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Parent Portal</span>
            </button>
            <button
              onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#2855D9] hover:bg-[#1E44B5] text-white text-xs font-bold shadow-md shadow-[#2855D9]/20 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Launch Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-[#64708A] hover:bg-[#F3F6FF] border border-[#E1E7F2] shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#2855D9]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Landing Page */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E1E7F2] bg-white px-4 py-3 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#64708A] hover:text-[#2855D9]">Features</a>
            <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#64708A] hover:text-[#2855D9]">Courses</a>
            <a href="#neuro" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#64708A] hover:text-[#2855D9]">EEG Studio</a>
            <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#64708A] hover:text-[#2855D9]">AI Insights</a>
            <a href="#wellbeing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#64708A] hover:text-[#2855D9]">Wellbeing</a>
            <div className="pt-2 border-t border-[#E1E7F2] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenParentPortal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Parent / Guardian Portal</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterDashboard(PRESET_USERS.demo_student);
                }}
                className="w-full py-2.5 rounded-xl bg-[#2855D9] text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Student Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── 1. HERO SECTION (White with Soft Blue-to-Violet Atmospheric Glow) ─── */}
      <section className="relative bg-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E1E7F2] overflow-hidden">
        {/* Soft Atmospheric Background Glow */}
        <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-gradient-to-br from-[#EEF3FF] via-[#F6F0FF] to-transparent rounded-full blur-3xl pointer-events-none opacity-85"></div>
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#E6F9FC]/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF3FF] border border-[#D5E2FF] text-[#2855D9] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00AFC1] animate-pulse"></span>
              Open Innovation Track • DEX26031 • Infinite Loopers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#17213B]">
              Understand How You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2855D9] to-[#8755E8]">
                Learn.
              </span>
              <br />
              Improve How You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AFC1] to-[#2855D9]">
                Perform.
              </span>
            </h1>

            <p className="text-[#64708A] text-lg sm:text-xl font-normal leading-relaxed max-w-2xl">
              <strong className="text-[#17213B] font-semibold">
                "Your scores show what you achieved. Neuronexus helps you understand your learning journey."
              </strong>{' '}
              A unified academic platform combining verified coursework, interactive YouTube video lessons, explainable AI study suggestions, and optional, privacy-first EEG signal analytics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-[#2855D9] hover:bg-[#1E44B5] shadow-lg shadow-[#2855D9]/20 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Explore Student Dashboard</span>
              </button>
              <button
                onClick={handleOpenParentPortal}
                className="px-6 py-3.5 rounded-xl font-bold text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] shadow-xs hover:border-[#059669]/40 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Parent / Guardian Portal</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#64708A] pt-4 border-t border-[#E1E7F2]">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>
                <strong>Privacy-First Guarantee:</strong> Academic evidence remains primary. EEG is strictly optional & non-clinical.
              </span>
            </div>
          </div>

          {/* Right Hero Neuroscience Waveform Visual (Light Mode with Subtle Glow) */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-white rounded-3xl border border-[#E1E7F2] shadow-xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E7F2] text-xs">
                <span className="font-bold text-[#17213B] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#E6F9FC] text-[#00AFC1]">
                    <Activity className="w-4 h-4" />
                  </span>
                  Bio-Signal Rhythms (Fp1, Fp2, Cz, Pz)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                  DEMO DATA — NOT LIVE EEG
                </span>
              </div>

              {/* Waveform Canvas */}
              <div className="relative my-3 rounded-2xl overflow-hidden bg-[#FAFCFF] border border-[#E1E7F2]" style={{
                backgroundImage: 'linear-gradient(to right, rgba(0, 175, 193, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 175, 193, 0.07) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}>
                <canvas ref={canvasRef} width={480} height={260} className="w-full h-56" />
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#64708A] border-t border-[#E1E7F2]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                  Sampling: 250 Hz (BioAmp EXG Pill ready)
                </span>
                <button
                  onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                  className="text-[#2855D9] hover:underline font-bold flex items-center gap-1"
                >
                  Open Signal Studio &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. FOUR PILLARS FEATURE CARDS (Alternate Light Blue #F3F6FF Background) */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F3F6FF] border-b border-[#E1E7F2]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#2855D9] border border-[#E1E7F2] shadow-2xs uppercase tracking-wider">
              Architecture Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17213B]">Designed for Genuine Learning Retention</h2>
            <p className="text-[#64708A] text-sm">Every feature connects academic evidence, AI guidance, and student agency into a coherent learning ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-7 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EEF3FF] border border-[#D5E2FF] text-[#2855D9] flex items-center justify-center mb-5 shadow-2xs">
                <YouTubeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17213B] mb-2">YouTube Video Lessons</h3>
              <p className="text-[#64708A] text-sm leading-relaxed">Curated computer science units with embedded YouTube tutorials, syntax references, and practical code notes.</p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#E6F9FC] border border-[#B4EFF5] text-[#00AFC1] flex items-center justify-center mb-5 shadow-2xs">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17213B] mb-2">Practice Quizzes & Mastery</h3>
              <p className="text-[#64708A] text-sm leading-relaxed">Interactive MCQs with instant scoring, transparent topic mastery indicators, and attempt histories.</p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#F6F0FF] border border-[#E8DCFD] text-[#8755E8] flex items-center justify-center mb-5 shadow-2xs">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17213B] mb-2">Explainable AI Insights</h3>
              <p className="text-[#64708A] text-sm leading-relaxed">Study suggestions with a transparent "Why am I seeing this?" modal linking directly to your quiz errors.</p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-[#E1E7F2] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mb-5 shadow-2xs">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17213B] mb-2">Student-Controlled Wellbeing</h3>
              <p className="text-[#64708A] text-sm leading-relaxed">Voluntary check-ins with granular student sharing controls. Revoke access from parents at any time.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. INTERACTIVE COURSE PREVIEWS SECTION (White Background) ───────── */}
      <section id="courses" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E1E7F2]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#2855D9] uppercase tracking-wider">Curriculum Previews</span>
              <h2 className="text-3xl font-black text-[#17213B] mt-1">Verified Academic Curriculum</h2>
              <p className="text-[#64708A] text-sm mt-1">Structured modules designed to build verifiable problem-solving competency.</p>
            </div>
            <button
              onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
              className="text-xs text-[#2855D9] hover:underline font-bold flex items-center gap-1"
            >
              <span>Explore Full Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="overflow-hidden bg-white border border-[#E1E7F2] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative h-48 bg-[#F3F6FF] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" alt="Java Programming" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-white/95 text-[#2855D9] text-xs font-bold border border-[#E1E7F2] shadow-xs">
                  CS201 • Intermediate
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#17213B]/80 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
                  <YouTubeIcon className="w-3.5 h-3.5 text-[#DC2626]" /> YouTube Lectures
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#17213B]">Object-Oriented Programming in Java</h3>
                  <p className="text-[#64708A] text-xs mt-1.5 leading-relaxed">Classes, objects, inheritance hierarchies, polymorphism, interfaces, and exception handling mechanics.</p>
                </div>
                <div className="pt-4 border-t border-[#E1E7F2] flex items-center justify-between text-xs">
                  <span className="text-[#64708A]">Instructor: <strong className="text-[#17213B]">Prof. Robert Chen</strong></span>
                  <button
                    onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                    className="px-4 py-2 rounded-xl bg-[#2855D9] hover:bg-[#1E44B5] text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Open Unit 2 &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden bg-white border border-[#E1E7F2] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative h-48 bg-[#F3F6FF] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800" alt="Algorithms" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-white/95 text-[#2855D9] text-xs font-bold border border-[#E1E7F2] shadow-xs">
                  CS301 • Advanced
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#17213B]/80 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
                  <YouTubeIcon className="w-3.5 h-3.5 text-[#DC2626]" /> YouTube Lectures
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#17213B]">Data Structures & Algorithm Analysis</h3>
                  <p className="text-[#64708A] text-xs mt-1.5 leading-relaxed">Asymptotic analysis, balanced search trees, graph algorithms, divide & conquer, and dynamic programming.</p>
                </div>
                <div className="pt-4 border-t border-[#E1E7F2] flex items-center justify-between text-xs">
                  <span className="text-[#64708A]">Instructor: <strong className="text-[#17213B]">Dr. Sarah Vance</strong></span>
                  <button
                    onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                    className="px-4 py-2 rounded-xl bg-[#2855D9] hover:bg-[#1E44B5] text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Open Unit 3 &rarr;
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. EEG ANALYTICS & NEUROSCIENCE HIGHLIGHT (Alternate Light Blue #F3F6FF) */}
      <section id="neuro" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F3F6FF] border-b border-[#E1E7F2]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F9FC] text-[#00AFC1] border border-[#B4EFF5]">
                Hardware & Signal Processing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#17213B] leading-tight">
                Honest, Transparent Biopotential Analytics
              </h2>
              <p className="text-[#64708A] text-sm leading-relaxed">
                Unlike black-box commercial gadgets, Neuronexus follows rigorous scientific integrity. We compute experimental focus through calibrated spectral band power ratios (&beta; / (&theta; + &alpha;)).
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#E1E7F2] flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F9FC] text-[#00AFC1] flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#17213B]">BioAmp EXG Pill Hardware Bridge</div>
                    <div className="text-xs text-[#64708A]">Streams at 250 Hz with 50 Hz mains notch and 0.5–35 Hz digital bandpass filtering.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E1E7F2] flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#17213B]">Automatic Estimate Suppression</div>
                    <div className="text-xs text-[#64708A]">If motion artifacts drop data coverage below 60%, estimates are honestly withheld to prevent false metrics.</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                  className="px-5 py-2.5 rounded-xl bg-[#00AFC1] hover:bg-[#0092A1] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Try 3 Live Signal Scenarios &rarr;
                </button>
              </div>
            </div>

            {/* Scenario Comparison Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div
                onClick={() => setSelectedScenario('good')}
                className={`p-5 bg-white rounded-2xl border cursor-pointer transition-all ${
                  selectedScenario === 'good' ? 'border-[#059669] ring-2 ring-[#059669]/20 shadow-sm' : 'border-[#A7F3D0]'
                }`}
              >
                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] inline-block mb-3">
                  Scenario A
                </div>
                <div className="font-bold text-sm text-[#17213B]">Clean Signal</div>
                <div className="text-2xl font-black text-[#059669] my-1">96% Valid</div>
                <div className="text-xs text-[#64708A]">Focus estimated (~78%) with high stability.</div>
              </div>

              <div
                onClick={() => setSelectedScenario('noisy')}
                className={`p-5 bg-white rounded-2xl border cursor-pointer transition-all ${
                  selectedScenario === 'noisy' ? 'border-[#D97706] ring-2 ring-[#D97706]/20 shadow-sm' : 'border-[#FDE68A]'
                }`}
              >
                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] inline-block mb-3">
                  Scenario B
                </div>
                <div className="font-bold text-sm text-[#17213B]">Noisy Artifacts</div>
                <div className="text-2xl font-black text-[#D97706] my-1">42% Valid</div>
                <div className="text-xs text-[#64708A]">Estimate suppressed to avoid misleading metrics.</div>
              </div>

              <div
                onClick={() => setSelectedScenario('disconnected')}
                className={`p-5 bg-white rounded-2xl border cursor-pointer transition-all ${
                  selectedScenario === 'disconnected' ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-sm' : 'border-[#FECACA]'
                }`}
              >
                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] inline-block mb-3">
                  Scenario C
                </div>
                <div className="font-bold text-sm text-[#17213B]">Disconnected</div>
                <div className="text-2xl font-black text-[#DC2626] my-1">0 Packets</div>
                <div className="text-xs text-[#64708A]">Instant offline flatline alert rendered.</div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 5. FINAL CALL-TO-ACTION SECTION (Royal-Blue-to-Violet Gradient Banner) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden shadow-xl"
            style={{ background: 'linear-gradient(135deg, #2855D9 0%, #5E41D8 50%, #8755E8 100%)' }}
          >
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 backdrop-blur-xs border border-white/20 text-white">
                Instant Hackathon Evaluation
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to Explore the Platform in Under 4 Minutes?
              </h2>
              <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                Use our interactive 10-step judge walkthrough to evaluate quizzes, video lessons, signal processing, student-controlled family check-ins, and faculty analytics.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onEnterDashboard(PRESET_USERS.demo_student)}
                  className="px-7 py-3.5 rounded-xl font-black text-[#2855D9] bg-white hover:bg-[#EEF3FF] shadow-lg transition-all transform active:scale-95"
                >
                  Launch Judge Walkthrough &rarr;
                </button>
                <button
                  onClick={() => onEnterDashboard(PRESET_USERS.guardian_eleanor)}
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 transition-all"
                >
                  Parent/Guardian Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER (Light Blue #F3F6FF Background, Dark Text, Blue Links) ─── */}
      <footer className="bg-[#F3F6FF] border-t border-[#E1E7F2] py-10 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[#64708A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2855D9] flex items-center justify-center text-white font-black text-xs shadow-2xs">
              N
            </div>
            <span className="font-bold text-[#17213B] text-sm">NEURONEXUS</span>
            <span>• Infinite Loopers (Team ID: DEX26031)</span>
          </div>
          <div className="text-center font-medium text-[#17213B]">
            "Your scores show what you achieved. Neuronexus helps you understand your learning journey."
          </div>
          <div className="flex items-center gap-4 text-[#2855D9] font-semibold">
            <button onClick={() => onEnterDashboard(PRESET_USERS.guardian_eleanor)} className="hover:underline">Parent Portal</button>
            <span>•</span>
            <button onClick={() => onEnterDashboard(PRESET_USERS.demo_student)} className="hover:underline">Student Dashboard</button>
            <span>•</span>
            <button onClick={() => onEnterDashboard(PRESET_USERS.faculty_thorne)} className="hover:underline">Faculty Hub</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
