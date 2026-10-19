export type UserRole = 'Student' | 'Senior Mentor' | 'Faculty Mentor' | 'Administrator';

export type LearnerRank = 'Bronze Scholar' | 'Silver Rising' | 'Gold Learner' | 'Platinum Master';

export interface WeeklyProgress { week: string; score: number; }
export interface TopicMastery { subject: string; mastery: number; }
export interface DailyStudyHours { day: string; hours: number; }

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  institution: string;
  department: string;
  semester: string;
  enrolledCourses: string[];
  rank?: LearnerRank;
  rankScore?: number;
  overallProgress?: number;
  focusScore?: number;
  pomodoroCountWeek?: number;
  totalStudyMinutes?: number;
  streakDays?: number;
  studyPreferences?: string[];
  preferredStudyHours?: string;
  isFirstTime?: boolean;
  hasDiagnosticAssessment?: boolean;
  strongestTopic?: { name: string; mastery: number; };
  weakTopics?: Array<{ name: string; mastery: number; course: string; trend?: string; }>;
  weeklyProgressHistory: WeeklyProgress[];
  topicMasteryData: TopicMastery[];
  dailyStudyHours: DailyStudyHours[];
}

export interface SmartReminder {
  id: string;
  type: 'test' | 'session' | 'mentor' | 'resource' | 'question' | 'announcement';
  title: string;
  description: string;
  meta: string;
  tag: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
  actionLabel: string;
  actionPayload?: string;
  urgent?: boolean;
}

export interface ProgressInsight {
  id: string;
  metric: string;
  description: string;
  badge: string;
  accent: 'emerald' | 'indigo' | 'amber' | 'purple';
}

export interface TimetableItem {
  id: string;
  time: string;
  title: string;
  type: 'lecture' | 'lab' | 'office_hours' | 'peer_study' | 'ai_focus';
  location: string;
  instructorOrPeer: string;
  activeNow?: boolean;
}

export interface DiagnosticQuestion {
  id: number;
  topic: string;
  course: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type AppPage =
  | 'dashboard'
  | 'courses'
  | 'tests'
  | 'neuro-analysis'
  | 'community'
  | 'leaderboard'
  | 'messages'
  | 'profile'
  | 'ai-classroom';

export interface NeuralMetrics {
  avgFocus: number;
  peakFocus: number;
  fatigueOnsetMinute?: number;
  thetaBetaRatio: number;
  alphaAsymmetry: number;
  sampleEntropy: number;
  coherence: number;
  validCoveragePercent: number;
  signalQualityStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Disconnected';
  artifactsDetectedCount: number;
  channels: {
    fp1: { label: string; status: 'Active' | 'Noisy' | 'Disconnected'; impedanceKohm: number };
    fp2: { label: string; status: 'Active' | 'Noisy' | 'Disconnected'; impedanceKohm: number };
    a1: { label: string; status: 'Active' | 'Reference Attached' | 'Disconnected'; impedanceKohm: number };
  };
  isSimulated: boolean;
}

export interface FocusTimePoint {
  timestamp: string; // e.g., "10:02 AM" or "02:00"
  minute: number;
  attentionScore: number; // 0 - 100
  signalQuality: number; // 0 - 100
  isArtifact?: boolean;
  phase?: string; // e.g. "Warmup", "Deep Focus", "Fatigue", "Recovery"
}

export interface AIRecommendation {
  id: string;
  recommendation: string;
  evidence: string;
  actionType: 'break' | 'revision' | 'practice' | 'mentor' | 'adaptive_test';
  actionTopic?: string;
}

export interface PomodoroPhaseRecord {
  phaseType: 'focus' | 'short_break' | 'long_break';
  startTimeMs: number;
  endTimeMs: number;
  durationSeconds: number;
  completed: boolean;
  eegRecordingActive: boolean;
}

export interface LearningSession {
  id: string;
  userId: string;
  title: string;
  type: 'study' | 'pomodoro' | 'quiz' | 'college_test';
  course: string;
  topic?: string;
  startTime: string; // ISO string or human formatted date
  durationMinutes: number;
  focusMinutes?: number;
  breakMinutes?: number;
  pomodoroPhases?: PomodoroPhaseRecord[];
  eegInterrupted?: boolean;
  interruptionReason?: string;
  score?: number; // percentage if quiz/test
  totalQuestions?: number;
  correctAnswers?: number;
  hasEegData: boolean;
  isSimulated: boolean;
  neuralMetrics?: NeuralMetrics;
  focusDynamics?: FocusTimePoint[];
  aiRecommendations?: AIRecommendation[];
  topicPerformance?: Array<{ topic: string; score: number; total: number; correct: boolean }>;
}

export interface WeeklyNeuralReport {
  weekLabel: string;
  eligibleSessionsCount: number;
  totalRecordingMinutes: number;
  avgAttentionScore: number;
  sessionToSessionVariation: number; // Standard deviation or % spread
  validRecordingCoveragePercent: number;
  quizPerformanceAvg: number;
  topicImprovement: Array<{ topic: string; delta: string; status: 'improved' | 'steady' | 'needs_practice' }>;
  comparisonWithPrevious?: {
    percentageChange: number;
    baselinePeriod: string;
    description: string;
  };
  statusMessage?: string;
  hasSufficientData: boolean;
}

export interface CollegeScheduledTest {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  facultyName: string;
  facultyRole: 'Faculty Mentor' | 'Administrator';
  scheduledDate: string;
  deadline: string;
  durationMinutes: number;
  totalQuestions: number;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Missed';
  instructions: string;
  topicsCovered: string[];
  eegMonitoringRecommended: boolean;
}
