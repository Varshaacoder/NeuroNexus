import React, { useState } from 'react';
import {
  GraduationCap, ShieldCheck, KeyRound, Mail, Lock,
  Smartphone, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Sparkles, Building2, UserPlus, User, Brain
} from 'lucide-react';
import type { UserRole, UserProfile } from '../types';
import { PRESET_USERS } from '../mockData';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp' | 'sso'>('password');
  
  // Login fields
  const [email, setEmail] = useState('demo.student@apex.edu');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [simulatedOtp] = useState('482910');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState('Semester IV');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ssoModal, setSsoModal] = useState<'google' | 'microsoft' | null>(null);

  const createEmptyNewUser = (
    emailVal: string,
    nameVal?: string,
    roleVal?: UserRole,
    deptVal?: string,
    semVal?: string
  ): UserProfile => {
    const rawName = nameVal?.trim() || emailVal.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    return {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: formattedName || 'New User',
      email: emailVal.trim(),
      role: roleVal || selectedRole,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4f46e5&color=ffffff&bold=true`,
      institution: 'Apex Institute of Science & Technology',
      department: deptVal || 'Computer Science & Engineering',
      semester: semVal || 'Semester I',
      enrolledCourses: ['CS201', 'CS202'],
      rank: 'Bronze Scholar',
      rankScore: 0,
      overallProgress: 0,
      focusScore: 0,
      pomodoroCountWeek: 0,
      streakDays: 0,
      studyPreferences: [],
      preferredStudyHours: '',
      isFirstTime: true,
      hasDiagnosticAssessment: false,
      strongestTopic: undefined,
      weakTopics: [],
      weeklyProgressHistory: [],
      topicMasteryData: [],
      dailyStudyHours: [],
    };
  };

  const saveRegisteredUser = (user: UserProfile) => {
    try {
      const stored = localStorage.getItem('campus_qa_registered_users');
      const usersMap = stored ? JSON.parse(stored) : {};
      usersMap[user.email.toLowerCase().trim()] = user;
      localStorage.setItem('campus_qa_registered_users', JSON.stringify(usersMap));
    } catch {
      // ignore storage errors
    }
  };

  const resolveUser = (emailVal: string, role: UserRole): UserProfile => {
    const lower = emailVal.toLowerCase().trim();
    try {
      const stored = localStorage.getItem('campus_qa_registered_users');
      if (stored) {
        const usersMap = JSON.parse(stored);
        if (usersMap[lower]) {
          return usersMap[lower];
        }
      }
    } catch {
      // ignore parse errors
    }
    if (lower === 'demo.student@apex.edu' || lower.includes('demo')) return PRESET_USERS.demo_student;
    if (lower.includes('yumi')) return PRESET_USERS.yumi;
    if (lower.includes('alex')) return PRESET_USERS.alex;
    if (lower === 'rachel.torres@apex.edu' || lower.includes('rachel')) return PRESET_USERS.mentor_rachel;
    if (lower === 'a.thorne@apex.edu' || lower.includes('thorne')) return PRESET_USERS.faculty_thorne;
    if (lower === 'v.miller@apex.edu' || lower.includes('miller')) return PRESET_USERS.admin_dean;

    // For brand new user accounts, initialize clean empty data and save
    const brandNewUser = createEmptyNewUser(emailVal, undefined, role);
    saveRegisteredUser(brandNewUser);
    return brandNewUser;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setErrorMessage('Please enter a valid institutional email.'); return; }
    if (!password && authMethod === 'password') { setErrorMessage('Please enter your password.'); return; }
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(resolveUser(email, selectedRole));
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { setErrorMessage('Please enter your full name.'); return; }
    if (!regEmail.includes('@')) { setErrorMessage('Please enter a valid institutional email.'); return; }
    if (!regPassword || regPassword.length < 6) { setErrorMessage('Password must be at least 6 characters.'); return; }
    
    setLoading(true);
    setErrorMessage(null);

    const newUser = createEmptyNewUser(regEmail, regName, selectedRole, regDepartment, regSemester);
    saveRegisteredUser(newUser);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(newUser);
    }, 700);
  };

  const handleSendOtp = () => {
    if (!email.includes('@')) { setErrorMessage('Please enter a valid email first.'); return; }
    setErrorMessage(null);
    setOtpStep('verify');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) { setErrorMessage('Please enter all 6 digits.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(resolveUser(email, selectedRole));
    }, 600);
  };

  const handleQuickLogin = (key: keyof typeof PRESET_USERS) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLoginSuccess(PRESET_USERS[key]); }, 350);
  };

  const handleGoogleLogin = (persona: keyof typeof PRESET_USERS) => {
    setSsoModal(null);
    setLoading(true);
    setTimeout(() => { setLoading(false); onLoginSuccess(PRESET_USERS[persona]); }, 500);
  };

  const roleColors: Record<UserRole, string> = {
    'Student': 'bg-amber-500 text-white',
    'Senior Mentor': 'bg-indigo-600 text-white',
    'Faculty Mentor': 'bg-emerald-600 text-white',
    'Administrator': 'bg-purple-600 text-white',
  };

  const updateEmail = (role: UserRole) => {
    setSelectedRole(role);
    const defaults: Record<UserRole, string> = {
      'Student': 'demo.student@apex.edu',
      'Senior Mentor': 'rachel.torres@apex.edu',
      'Faculty Mentor': 'a.thorne@apex.edu',
      'Administrator': 'v.miller@apex.edu',
    };
    setEmail(defaults[role]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-amber-50/30 flex flex-col">
      
      {/* Full page loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-600">
              {mode === 'register' ? 'Creating Academic Profile...' : 'Authenticating...'}
            </span>
          </div>
        </div>
      )}

      {/* Top Quick Access Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-black text-slate-800 flex items-center gap-1">
              <span>⚡</span>
              <span>1-Click Demo Login:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleQuickLogin('demo_student')} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />Demo Student (Judges)
            </button>
            <button onClick={() => handleQuickLogin('yumi')} className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors">🎓 Yumi (Returning)</button>
            <button onClick={() => handleQuickLogin('alex')} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors">🚀 Alex (First Time)</button>
            <button onClick={() => handleQuickLogin('mentor_rachel')} className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors">🤝 Senior Mentor</button>
            <button onClick={() => handleQuickLogin('faculty_thorne')} className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors">🏛️ Faculty</button>
            <button onClick={() => handleQuickLogin('admin_dean')} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors">🛡️ Admin</button>
          </div>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Card Header */}
          <div className="bg-gradient-to-br from-[#2855D9] via-[#6842D0] to-[#8755E8] rounded-t-3xl p-7 text-white text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-4 backdrop-blur-xs">
              <Brain className="w-8 h-8 text-[#00AFC1]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Neuro<span className="text-[#00AFC1]">Nexus</span>
            </h1>
            <p className="text-sm text-blue-100 mt-1.5 font-medium">
              AI Academic Collaboration & NeuroFocus Platform
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-white/10 p-1 rounded-xl mt-4 border border-white/20">
              <button
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  mode === 'register' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-indigo-200 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register / New User
              </button>
            </div>
          </div>

          <div className="bg-white rounded-b-3xl shadow-xl border border-slate-200 border-t-0 p-6 space-y-5">
            
            {/* REGISTER MODE */}
            {mode === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Select Campus Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Student', 'Senior Mentor', 'Faculty Mentor', 'Administrator'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          selectedRole === role
                            ? roleColors[role] + ' border-transparent shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 text-slate-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@apex.edu"
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select value={regDepartment} onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-slate-800 font-semibold">
                      <option value="AI&DS (Artificial Intelligence & Data Science)">AI&DS</option>
                      <option value="Computer Science & Engineering">Computer Science</option>
                      <option value="Information Technology (IT)">IT</option>
                      <option value="ECE (Electronics & Communication)">ECE</option>
                      <option value="AI&ML (Artificial Intelligence & Machine Learning)">AI&ML</option>
                      <option value="EEE (Electrical & Electronics)">EEE</option>
                      <option value="E&I (Electronics & Instrumentation)">E&I</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select value={regSemester} onChange={(e) => setRegSemester(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-slate-800 font-semibold">
                      <option value="Semester I">Semester I</option>
                      <option value="Semester II">Semester II</option>
                      <option value="Semester III">Semester III</option>
                      <option value="Semester IV">Semester IV</option>
                      <option value="Semester V">Semester V</option>
                      <option value="Semester VI">Semester VI</option>
                      <option value="Semester VII">Semester VII</option>
                      <option value="Semester VIII">Semester VIII</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 text-slate-800" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]">
                  <UserPlus className="w-4 h-4" />
                  Create Profile & Take Assessment
                </button>
              </form>
            ) : (
              /* LOGIN MODE */
              <>
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Campus Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Student', 'Senior Mentor', 'Faculty Mentor', 'Administrator'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => updateEmail(role)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          selectedRole === role
                            ? roleColors[role] + ' border-transparent shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="flex border-b border-slate-200">
                  {([['password', 'Password', KeyRound], ['otp', 'OTP (Passwordless)', Smartphone], ['sso', 'SSO', Building2]] as const).map(([method, label, Icon]) => (
                    <button
                      key={method}
                      onClick={() => { setAuthMethod(method); setErrorMessage(null); setOtpStep('input'); }}
                      className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                        authMethod === method
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* PASSWORD METHOD */}
                {authMethod === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institutional Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@apex.edu"
                          className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 text-slate-800 transition-all" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <button type="button" onClick={() => alert('Password reset link sent to ' + email)} className="text-xs text-indigo-600 hover:underline font-medium">Forgot?</button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 text-slate-800 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit"
                      className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]">
                      <span>Sign In as {selectedRole}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* OTP METHOD */}
                {authMethod === 'otp' && (
                  <div className="space-y-4">
                    {otpStep === 'input' ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institutional Email</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@apex.edu"
                              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 text-slate-800 transition-all" />
                          </div>
                        </div>
                        <button onClick={handleSendOtp}
                          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center justify-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Send 6-Digit OTP Code
                        </button>
                      </>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100" onClick={() => setOtpDigits(simulatedOtp.split(''))}>
                          <div className="text-xs font-bold text-emerald-900">
                            Demo OTP Code: <span className="font-mono tracking-widest bg-white px-2 py-0.5 rounded border border-emerald-300">{simulatedOtp}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 mt-0.5">Click here to auto-fill</div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">Enter 6-Digit Code</label>
                          <div className="flex gap-2 justify-between">
                            {otpDigits.map((digit, idx) => (
                              <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit}
                                onChange={(e) => {
                                  const next = [...otpDigits]; next[idx] = e.target.value; setOtpDigits(next);
                                  if (e.target.value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                                }}
                                onKeyDown={(e) => { if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                                className="w-11 h-12 text-center text-xl font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 text-slate-800"
                              />
                            ))}
                          </div>
                        </div>

                        <button type="submit"
                          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Verify & Continue
                        </button>

                        <button type="button" onClick={() => setOtpStep('input')} className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
                          ← Change email or resend OTP
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* SSO METHOD */}
                {authMethod === 'sso' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Authenticate using your institution's federated identity provider:</p>
                    
                    <button onClick={() => setSsoModal('google')}
                      className="w-full py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      Continue with Google Workspace (Apex.edu)
                    </button>

                    <button onClick={() => setSsoModal('microsoft')}
                      className="w-full py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-xs">
                      <svg className="w-4 h-4" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/>
                        <path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                      </svg>
                      Continue with Microsoft 365 / Entra ID
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Google SSO Modal */}
      {ssoModal === 'google' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
              <h3 className="font-bold text-sm text-slate-800">Choose Google Account</h3>
              <button onClick={() => setSsoModal(null)} className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Sign in to <strong>NeuroNexus</strong> with:</p>
            <div className="space-y-2">
              {[
                { key: 'demo_student', label: 'Demo Student', email: 'demo.student@apex.edu' },
                { key: 'yumi', label: 'Yumi Tanaka', email: 'yumi.tanaka@apex.edu' },
                { key: 'faculty_thorne', label: 'Dr. Aris Thorne', email: 'a.thorne@apex.edu' },
              ].map(({ key, label, email: em }) => (
                <button key={key} onClick={() => handleGoogleLogin(key as keyof typeof PRESET_USERS)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-3 text-left transition-colors">
                  <img src={PRESET_USERS[key as keyof typeof PRESET_USERS]?.avatar} alt={label} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500">{em}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Microsoft SSO Modal */}
      {ssoModal === 'microsoft' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              <h3 className="font-bold text-sm text-slate-800">Microsoft 365 / Entra ID</h3>
              <button onClick={() => setSsoModal(null)} className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Apex University Directory Accounts:</p>
            <div className="space-y-2">
              {[
                { key: 'demo_student', label: 'Demo Student', email: 'demo.student@apex.edu' },
                { key: 'admin_dean', label: 'Dean Vance Miller', email: 'v.miller@apex.edu' },
              ].map(({ key, label, email: em }) => (
                <button key={key} onClick={() => handleGoogleLogin(key as keyof typeof PRESET_USERS)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-3 text-left transition-colors">
                  <img src={PRESET_USERS[key as keyof typeof PRESET_USERS]?.avatar} alt={label} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500">{em}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
