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
  | 'community'
  | 'leaderboard'
  | 'messages'
  | 'profile'
  | 'ai-classroom';
