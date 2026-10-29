import type { UserProfile, SmartReminder, ProgressInsight, TimetableItem, DiagnosticQuestion } from './types';

// ─── PRESET USER PERSONAS ───────────────────────────────────────────────────

export const PRESET_USERS: Record<string, UserProfile> = {
  demo_student: {
    id: 'demo_student',
    name: 'Demo Student',
    email: 'demo.student@apex.edu',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Computer Science & Engineering',
    semester: 'Semester IV',
    enrolledCourses: ['CS201 C Systems', 'CS202 Data Structures', 'CS204 Database Systems', 'MA202 Discrete Probability'],
    rank: 'Gold Learner',
    overallProgress: 71,
    focusScore: 85,
    pomodoroCountWeek: 6,
    streakDays: 7,
    studyPreferences: ['Visual Models', 'Practice First', 'Interactive Q&A'],
    preferredStudyHours: 'Evening (18:00 - 21:00)',
    isFirstTime: false,
    hasDiagnosticAssessment: true,
    strongestTopic: { name: 'Dynamic Programming & Recursion', mastery: 93 },
    weakTopics: [
      { name: 'Pointer Arithmetic', mastery: 38, course: 'C Programming & Systems', trend: '+4%' },
      { name: 'Probability & Distributions', mastery: 42, course: 'Discrete Mathematics', trend: '+2%' },
      { name: 'B-Tree Indexing', mastery: 54, course: 'Database Management', trend: '+1%' }
    ],
    weeklyProgressHistory: [
      { week: 'W1', score: 52 }, { week: 'W2', score: 58 }, { week: 'W3', score: 61 },
      { week: 'W4', score: 67 }, { week: 'W5', score: 71 },
    ],
    topicMasteryData: [
      { subject: 'C Systems', mastery: 74 }, { subject: 'Data Structures', mastery: 88 },
      { subject: 'DBMS', mastery: 65 }, { subject: 'Probability', mastery: 42 },
      { subject: 'Algorithms', mastery: 79 }, { subject: 'OS', mastery: 60 },
    ],
    dailyStudyHours: [
      { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 1.8 }, { day: 'Wed', hours: 3.2 },
      { day: 'Thu', hours: 2.1 }, { day: 'Fri', hours: 4.0 }, { day: 'Sat', hours: 1.5 }, { day: 'Sun', hours: 2.8 },
    ],
    rankScore: 1820,
  },
  yumi: {
    id: 'yumi',
    name: 'Yumi Tanaka',
    email: 'yumi.tanaka@apex.edu',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Computer Science & Engineering',
    semester: 'Semester IV',
    enrolledCourses: ['CS201 C Systems', 'CS202 Data Structures', 'CS204 Database Systems'],
    rank: 'Gold Learner',
    overallProgress: 68,
    focusScore: 82,
    pomodoroCountWeek: 4,
    streakDays: 5,
    studyPreferences: ['Conceptual Notes', 'Code Walkthroughs', 'Peer Discussions'],
    preferredStudyHours: 'Evening (18:00 - 21:00)',
    isFirstTime: false,
    hasDiagnosticAssessment: true,
    strongestTopic: { name: 'Functions & Scopes', mastery: 91 },
    weakTopics: [
      { name: 'Pointer Arithmetic', mastery: 41, course: 'C Programming & Systems', trend: '+6%' },
      { name: 'Structures & Memory Layout', mastery: 58, course: 'C Programming & Systems', trend: '+6%' },
      { name: 'Conditional Probability', mastery: 52, course: 'Discrete Mathematics', trend: '+3%' }
    ],
    weeklyProgressHistory: [
      { week: 'W1', score: 48 }, { week: 'W2', score: 54 }, { week: 'W3', score: 59 },
      { week: 'W4', score: 63 }, { week: 'W5', score: 68 },
    ],
    topicMasteryData: [
      { subject: 'C Systems', mastery: 68 }, { subject: 'Data Structures', mastery: 85 },
      { subject: 'DBMS', mastery: 72 }, { subject: 'Probability', mastery: 52 },
      { subject: 'Functions', mastery: 91 }, { subject: 'Pointers', mastery: 41 },
    ],
    dailyStudyHours: [
      { day: 'Mon', hours: 2.0 }, { day: 'Tue', hours: 1.5 }, { day: 'Wed', hours: 3.0 },
      { day: 'Thu', hours: 1.8 }, { day: 'Fri', hours: 2.5 }, { day: 'Sat', hours: 1.0 }, { day: 'Sun', hours: 2.2 },
    ],
    rankScore: 1740,
  },
  alex: {
    id: 'alex',
    name: 'Alex Chen',
    email: 'alex.chen@apex.edu',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Computer Science & Engineering',
    semester: 'Semester IV',
    enrolledCourses: ['CS201 C Systems', 'CS202 Data Structures'],
    rank: 'Silver Rising',
    overallProgress: 64,
    focusScore: 78,
    pomodoroCountWeek: 3,
    streakDays: 4,
    studyPreferences: ['Practice Drills', 'Code Examples'],
    preferredStudyHours: 'Morning (08:00 - 11:00)',
    isFirstTime: false,
    hasDiagnosticAssessment: true,
    strongestTopic: { name: 'Data Structures & Arrays', mastery: 88 },
    weakTopics: [
      { name: 'Pointer Arithmetic', mastery: 40, course: 'C Programming & Systems', trend: '+5%' },
      { name: 'Relational Algebra', mastery: 50, course: 'Database Management Systems', trend: '+3%' },
    ],
    weeklyProgressHistory: [
      { week: 'W1', score: 42 }, { week: 'W2', score: 48 }, { week: 'W3', score: 55 },
      { week: 'W4', score: 60 }, { week: 'W5', score: 64 },
    ],
    topicMasteryData: [
      { subject: 'C Systems', mastery: 65 }, { subject: 'Data Structures', mastery: 88 },
      { subject: 'DBMS', mastery: 50 }, { subject: 'Probability', mastery: 45 },
    ],
    dailyStudyHours: [
      { day: 'Mon', hours: 1.5 }, { day: 'Tue', hours: 2.0 }, { day: 'Wed', hours: 2.5 },
      { day: 'Thu', hours: 1.2 }, { day: 'Fri', hours: 3.0 }, { day: 'Sat', hours: 1.0 }, { day: 'Sun', hours: 2.0 },
    ],
    rankScore: 1450,
  },
  mentor_rachel: {
    id: 'mentor_rachel',
    name: 'Rachel Torres',
    email: 'rachel.torres@apex.edu',
    role: 'Senior Mentor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Computer Science & Engineering',
    semester: 'Graduate Fellow / Year IV',
    enrolledCourses: ['CS201 C Systems', 'CS202 Data Structures'],
    isFirstTime: false,
    weeklyProgressHistory: [],
    topicMasteryData: [],
    dailyStudyHours: [],
    rankScore: 2400,
  },
  faculty_thorne: {
    id: 'faculty_thorne',
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@apex.edu',
    role: 'Faculty Mentor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Department of Computer Science',
    semester: 'Faculty / Course Director',
    enrolledCourses: ['CS201 C Systems', 'CS204 Database Systems'],
    isFirstTime: false,
    weeklyProgressHistory: [],
    topicMasteryData: [],
    dailyStudyHours: [],
    rankScore: 0,
  },
  admin_dean: {
    id: 'admin_dean',
    name: 'Dean Vance Miller',
    email: 'v.miller@apex.edu',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Academic Affairs & Systems Admin',
    semester: 'Administration',
    enrolledCourses: [],
    isFirstTime: false,
    weeklyProgressHistory: [],
    topicMasteryData: [],
    dailyStudyHours: [],
    rankScore: 0,
  },
  guardian_eleanor: {
    id: 'guardian_eleanor',
    name: 'Eleanor Rivera',
    email: 'eleanor.rivera@guardian.edu',
    role: 'Parent/Guardian',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Science & Technology',
    department: 'Authorized Guardian of: Alex Rivera',
    semester: 'Active Guardian Consent',
    enrolledCourses: ['CS201', 'CS202'],
    isFirstTime: false,
    weeklyProgressHistory: [],
    topicMasteryData: [],
    dailyStudyHours: [],
    rankScore: 0,
  }
};

// ─── COURSES ────────────────────────────────────────────────────────────────

export const AVAILABLE_COURSES = [
  {
    id: 'CS201', code: 'CS201', name: 'C Programming & Systems',
    credits: 4, faculty: 'Dr. Aris Thorne', color: 'indigo',
    description: 'Memory management, pointers, structs, file I/O, and systems-level C.',
    progress: 74, totalTopics: 12, completedTopics: 9,
    nextClass: 'Today at 11:00 AM',
    materials: 4,
    weakTopics: ['Pointer Arithmetic', 'Double Pointers', 'Dynamic Memory'],
  },
  {
    id: 'CS202', code: 'CS202', name: 'Data Structures & Algorithms',
    credits: 4, faculty: 'Prof. Elena Rostova', color: 'emerald',
    description: 'Arrays, linked lists, trees, graphs, dynamic programming, complexity.',
    progress: 88, totalTopics: 14, completedTopics: 12,
    nextClass: 'Tomorrow at 09:00 AM',
    materials: 6,
    weakTopics: ['Graph Traversal', 'Red-Black Trees'],
  },
  {
    id: 'CS204', code: 'CS204', name: 'Database Management Systems',
    credits: 3, faculty: 'Dr. Marcus Vance', color: 'amber',
    description: 'Relational algebra, SQL, normalization, transactions, indexing.',
    progress: 65, totalTopics: 10, completedTopics: 6,
    nextClass: 'Tomorrow at 09:30 AM',
    materials: 3,
    weakTopics: ['Relational Calculus', 'B-Tree Indexing'],
  },
  {
    id: 'MA202', code: 'MA202', name: 'Discrete Probability & Logic',
    credits: 3, faculty: 'Dr. Sarah Lin', color: 'purple',
    description: 'Probability theory, combinatorics, Bayes theorem, random variables.',
    progress: 58, totalTopics: 10, completedTopics: 6,
    nextClass: 'Friday at 10:00 AM',
    materials: 2,
    weakTopics: ['Conditional Bayes', 'Moment Generating Functions'],
  },
  {
    id: 'CS206', code: 'CS206', name: 'Computer Organization & Architecture',
    credits: 3, faculty: 'Prof. David K.', color: 'rose',
    description: 'ISA, pipelining, caches, memory hierarchy, I/O.',
    progress: 61, totalTopics: 11, completedTopics: 7,
    nextClass: 'Wednesday at 02:00 PM',
    materials: 5,
    weakTopics: ['Cache Coherence', 'Pipelining Hazards'],
  },
  {
    id: 'CS208', code: 'CS208', name: 'Operating Systems & Concurrency',
    credits: 4, faculty: 'Dr. Aris Thorne', color: 'cyan',
    description: 'Processes, threads, scheduling, synchronization, virtual memory.',
    progress: 55, totalTopics: 13, completedTopics: 7,
    nextClass: 'Thursday at 03:00 PM',
    materials: 4,
    weakTopics: ['Deadlock Detection', 'Semaphores vs Mutexes'],
  },
];

// ─── MENTORS ─────────────────────────────────────────────────────────────────

export const AVAILABLE_MENTORS = [
  {
    id: 'm1', name: 'Rachel Torres', role: 'Senior Peer Mentor (4th Year)',
    specialty: 'C Systems, Pointers, Memory Management', rating: 4.9, sessions: 68,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Senior Mentor', available: true, department: 'CSE',
    bio: 'Specialist in low-level C programming. Run weekly pointer drill sessions.',
  },
  {
    id: 'm2', name: 'Devin Patel', role: 'Teaching Assistant',
    specialty: 'Algorithms, Complexity, Tree Traversal', rating: 4.8, sessions: 42,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Algorithms Lead', available: false, department: 'CSE',
    bio: 'PhD student focusing on algorithm complexity and competitive programming.',
  },
  {
    id: 'm3', name: 'Dr. Aris Thorne', role: 'Course Director & Faculty Lead',
    specialty: 'Systems Architecture & Low-Level C', rating: 5.0, sessions: 200,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    badge: 'Faculty Mentor', available: true, department: 'CSE',
    bio: 'PhD from MIT. 15 years of systems programming research and teaching.',
  },
  {
    id: 'm4', name: 'Priya Sharma', role: 'Senior Peer Mentor (3rd Year)',
    specialty: 'DBMS, SQL, Normalization', rating: 4.7, sessions: 31,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badge: 'DBMS Expert', available: true, department: 'IT',
    bio: 'Database enthusiast. Helped 30+ students pass their midterms.',
  },
];

// ─── SMART REMINDERS ─────────────────────────────────────────────────────────

export const SMART_REMINDERS: SmartReminder[] = [
  {
    id: 'r1', type: 'test',
    title: 'DBMS Midterm Quiz Tomorrow',
    description: 'Relational Algebra & Normalization (3NF/BCNF)',
    meta: 'Tomorrow at 09:30 AM • Hall 3B',
    tag: 'Quiz Alert', color: 'rose', actionLabel: 'Quick Prep', actionPayload: 'prep_dbms', urgent: true
  },
  {
    id: 'r2', type: 'announcement',
    title: 'Faculty Verified Answer',
    description: 'Your question about int *p[5] vs int (*p)[5] was verified by Dr. Thorne.',
    meta: '2 hours ago • C Programming Forum',
    tag: 'Verified', color: 'emerald', actionLabel: 'View Solution', actionPayload: 'view_solution'
  },
  {
    id: 'r3', type: 'resource',
    title: 'New Resource: Memory Leaks & Heap Tracing',
    description: 'Lecture 8 PDF + code examples uploaded by Dr. Thorne',
    meta: 'Just now • CS201',
    tag: 'Resource', color: 'indigo', actionLabel: 'Download', actionPayload: 'download_pdf'
  },
  {
    id: 'r4', type: 'mentor',
    title: 'Message from Mentor Rachel',
    description: '"Reviewed your pointer drill submission. Let\'s do a 15-min call."',
    meta: 'Today at 5:00 PM • Peer Room 4',
    tag: 'Mentor', color: 'violet', actionLabel: 'Join Session', actionPayload: 'join_rachel'
  },
  {
    id: 'r5', type: 'question',
    title: 'Peers Need Help (Your Strong Zone)',
    description: '3 classmates posted about Recursion in Functions — your highest mastery area.',
    meta: '+30 Peer Karma Points available',
    tag: 'Peer Q&A', color: 'amber', actionLabel: 'Answer Now', actionPayload: 'answer_peers'
  },
];

// ─── PROGRESS MOTIVATIONS ─────────────────────────────────────────────────────

export const PROGRESS_MOTIVATIONS: ProgressInsight[] = [
  { id: 'pm1', metric: 'Pointer Mastery +14%', description: 'Pointer score improved from 38% → 52% across 3 targeted drills.', badge: 'Concept Climb', accent: 'emerald' },
  { id: 'pm2', metric: '5-Day Study Streak', description: 'Daily study goal completed for 5 consecutive days without interruption.', badge: 'Streak Master', accent: 'amber' },
  { id: 'pm3', metric: 'Peer Impact: 3 Answers', description: 'You answered 3 questions in Functions & Scope helping classmates pass.', badge: 'Peer Hero', accent: 'indigo' },
  { id: 'pm4', metric: 'Course Progress +12%', description: 'Monthly syllabus completion increased by 12% across all courses.', badge: 'Monthly Milestone', accent: 'purple' },
];

// ─── TODAY'S TIMETABLE ────────────────────────────────────────────────────────

export const TODAY_TIMETABLE: TimetableItem[] = [
  { id: 't1', time: '09:00 - 10:30', title: 'CS204 Database Systems', type: 'lecture', location: 'Auditorium 201', instructorOrPeer: 'Dr. Marcus Vance' },
  { id: 't2', time: '11:00 - 12:45', title: 'CS201 Systems Lab: Memory & Pointers', type: 'lab', location: 'Lab Room 304', instructorOrPeer: 'Dr. Aris Thorne' },
  { id: 't3', time: '15:00 - 16:00', title: 'Faculty Office Hours & Q&A', type: 'office_hours', location: 'Office B-12 / Virtual', instructorOrPeer: 'Dr. Aris Thorne' },
  { id: 't4', time: '17:00 - 18:00', title: 'Peer Study: Pointer Traps & Arrays', type: 'peer_study', location: 'Study Hub 4 & Discord', instructorOrPeer: 'Rachel Torres (Senior Mentor)' },
  { id: 't5', time: '20:00 - 21:30', title: 'AI Focus Block: Pointer Arithmetic (90m)', type: 'ai_focus', location: 'NexusAI Workspace', instructorOrPeer: 'NexusAI Tutor', activeNow: true },
];

// ─── DIAGNOSTIC QUESTIONS ─────────────────────────────────────────────────────

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1, topic: 'Pointer Arithmetic', course: 'C Programming & Systems',
    question: 'Given int arr[] = {10, 20, 30, 40, 50} and int *ptr = arr, what is the value of *(ptr + 3)?',
    codeSnippet: 'int arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\nprintf("%d", *(ptr + 3));',
    options: ['30', '40', '50', 'Address of arr[3]'],
    correctAnswer: 1,
    explanation: 'ptr + 3 advances by 3 × sizeof(int) bytes to arr[3] which holds value 40. Dereferencing yields 40.'
  },
  {
    id: 2, topic: 'Functions & Scopes', course: 'C Programming & Systems',
    question: 'What happens when a C function modifies a parameter passed by value?',
    codeSnippet: 'void modify(int x) { x = x + 10; }\n// called: modify(a);',
    options: ["The caller's variable a is modified directly.", "Only the function's local copy of x is modified; a remains unchanged.", 'A runtime segfault occurs.', 'The variable becomes a heap allocation.'],
    correctAnswer: 1,
    explanation: 'C passes by value by default — the function gets a separate copy of x. Mutating x does not alter the caller\'s variable a.'
  },
  {
    id: 3, topic: 'Discrete Probability', course: 'Discrete Mathematics',
    question: 'If events A and B are statistically independent, what is P(A ∩ B)?',
    options: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A) / P(B)', 'P(A) + P(B) − P(A ∪ B)'],
    correctAnswer: 1,
    explanation: 'By definition of independence: P(A ∩ B) = P(A) × P(B).'
  },
  {
    id: 4, topic: 'Database Normalization', course: 'Database Management Systems',
    question: 'Which normal form eliminates all transitive functional dependencies?',
    options: ['1NF', '2NF', '3NF', 'Unnormalized'],
    correctAnswer: 2,
    explanation: '3NF requires 2NF plus no non-prime attribute transitively depends on any candidate key.'
  },
  {
    id: 5, topic: 'Structure Padding', course: 'C Programming & Systems',
    question: 'Why might sizeof(struct { char a; int b; }) evaluate to 8 bytes instead of 5?',
    codeSnippet: 'struct Data {\n  char a; // 1 byte\n  int b;  // 4 bytes\n};',
    options: ['Compiler bug', 'Structure padding for int alignment', 'Heap overhead from malloc', 'Pointer indirection'],
    correctAnswer: 1,
    explanation: 'The compiler inserts 3 bytes of padding after char a so that int b aligns to a 4-byte boundary.'
  }
];

// ─── MOCK TEST QUESTIONS ──────────────────────────────────────────────────────

export const MOCK_TEST_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 101, topic: 'Pointer Arithmetic', course: 'C Programming & Systems',
    question: 'Consider int *p = (int*)1000. Assuming sizeof(int)==4, what is the value of p + 2?',
    options: ['1002', '1004', '1008', 'Undefined Behavior'],
    correctAnswer: 2,
    explanation: 'p + 2 advances by 2 × 4 = 8 bytes: 1000 + 8 = 1008.'
  },
  {
    id: 102, topic: 'Pointer Arithmetic', course: 'C Programming & Systems',
    question: 'What is the output of the following C snippet?',
    codeSnippet: 'int a[3] = {100, 200, 300};\nint *p = a;\nprintf("%d", *p++);\nprintf("%d", *p);',
    options: ['100 100', '100 200', '200 200', '101 200'],
    correctAnswer: 1,
    explanation: 'Postfix ++ evaluates after dereference. *p++ yields a[0] (100), then p advances to a[1]. Next *p yields 200.'
  },
  {
    id: 103, topic: 'Probability', course: 'Discrete Mathematics',
    question: 'Rolling a fair die twice — probability that sum equals 7?',
    options: ['1/12', '1/6 (6/36)', '1/9', '5/36'],
    correctAnswer: 1,
    explanation: 'Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 of 36 total = 1/6.'
  },
  {
    id: 104, topic: 'Structures & Memory', course: 'C Programming & Systems',
    question: 'How do you access member val through pointer struct Node *ptr?',
    options: ['ptr.val', 'ptr->val or (*ptr).val', 'ptr.*val', '&ptr->val'],
    correctAnswer: 1,
    explanation: 'Arrow operator ptr->val is syntactic sugar for (*ptr).val.'
  },
  {
    id: 105, topic: 'Pointer Arithmetic', course: 'C Programming & Systems',
    question: 'Can you subtract two pointers of same type pointing to elements in same array?',
    options: ['No, prohibited by C standard.', 'Yes, yields number of elements between them (ptrdiff_t).', 'Yes, yields raw byte difference.', 'Only for heap memory.'],
    correctAnswer: 1,
    explanation: 'p - q yields ptrdiff_t equal to the index difference (element count between them).'
  }
];

// ─── RANK LEADERBOARD ────────────────────────────────────────────────────────

export const RANK_LEADERBOARD = [
  { rank: 1, name: 'Aditya Kumar', score: 2180, badge: 'Platinum Master', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', change: +2, dept: 'CSE' },
  { rank: 2, name: 'Sophia Chen', score: 2150, badge: 'Platinum Master', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', change: 0, dept: 'IT' },
  { rank: 3, name: 'Arjun Mehta', score: 2090, badge: 'Platinum Master', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', change: -1, dept: 'CSE' },
  { rank: 4, name: 'Zara Williams', score: 1980, badge: 'Gold Learner', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', change: +3, dept: 'ECE' },
  { rank: 5, name: 'Demo Student', score: 1820, badge: 'Gold Learner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', change: +1, dept: 'CSE', isCurrentUser: true },
  { rank: 6, name: 'Yumi Tanaka', score: 1740, badge: 'Gold Learner', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', change: -1, dept: 'CSE', isCurrentUser: false },
  { rank: 7, name: 'Rohan Desai', score: 1690, badge: 'Silver Rising', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', change: +2, dept: 'CSE' },
  { rank: 8, name: 'Meera Iyer', score: 1620, badge: 'Silver Rising', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', change: 0, dept: 'IT' },
  { rank: 9, name: 'Carlos Rivera', score: 1550, badge: 'Silver Rising', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', change: -2, dept: 'ECE' },
  { rank: 10, name: 'Alex Chen', score: 1200, badge: 'Bronze Scholar', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', change: +5, dept: 'CSE' },
];

// ─── HOMEWORK / COMMUNITY POSTS ───────────────────────────────────────────────

export const COMMUNITY_POSTS = [
  {
    id: 'p1', type: 'homework',
    author: { name: 'Demo Student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'Student' },
    course: 'CS201 C Systems', topic: 'Pointer Arithmetic',
    title: 'Why does *p++ differ from (*p)++?',
    content: 'I understand that ++ has higher precedence than * for postfix, but the behavior in my code is confusing me when I use both in the same expression. Can someone explain with a concrete memory trace?',
    tags: ['pointers', 'operators', 'C'],
    replies: 4, upvotes: 12, verified: false,
    timestamp: '2 hours ago', isPinned: false,
  },
  {
    id: 'p2', type: 'announcement',
    author: { name: 'Dr. Aris Thorne', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'Faculty Mentor' },
    course: 'CS201 C Systems', topic: 'Midterm',
    title: '📢 DBMS Midterm Coverage: Chapters 5–8 + SQL Lab',
    content: 'The midterm will focus on Functional Dependencies, Armstrong\'s Axioms, 2NF/3NF/BCNF decomposition, and SQL query optimization. Office hours extended to 4 PM tomorrow.',
    tags: ['midterm', 'DBMS', 'announcement'],
    replies: 8, upvotes: 47, verified: true,
    timestamp: '3 hours ago', isPinned: true,
  },
  {
    id: 'p3', type: 'homework',
    author: { name: 'Yumi Tanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'Student' },
    course: 'MA202 Discrete Probability', topic: 'Bayes Theorem',
    title: 'Help with Bayes Theorem conditional probability chain',
    content: 'I\'m stuck on problem 4.12 from the textbook. When we chain P(A|B) × P(B|C) — is that equal to P(A|C)? My intuition says no but I can\'t form a formal counter-example.',
    tags: ['probability', 'Bayes', 'logic'],
    replies: 2, upvotes: 7, verified: false,
    timestamp: '5 hours ago', isPinned: false,
  },
  {
    id: 'p4', type: 'resource',
    author: { name: 'Rachel Torres', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', role: 'Senior Mentor' },
    course: 'CS201 C Systems', topic: 'Memory',
    title: '📂 Pointer Cheat Sheet v2 — Memory Address Visualization',
    content: 'Uploaded a 2-page visual cheat sheet for pointer arithmetic and double-pointer dereferencing. Print and bring to lab!',
    tags: ['resource', 'cheatsheet', 'pointers'],
    replies: 11, upvotes: 38, verified: true,
    timestamp: '1 day ago', isPinned: true,
  },
  {
    id: 'p5', type: 'homework',
    author: { name: 'Rohan Desai', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'Student' },
    course: 'CS202 Data Structures', topic: 'Graphs',
    title: 'Confused about BFS vs DFS time complexity on dense graphs',
    content: 'For adjacency matrix representation both BFS and DFS are O(V²). But for sparse graphs with adjacency list it\'s O(V+E). How do I decide which representation to use in exam answers?',
    tags: ['graphs', 'complexity', 'BFS', 'DFS'],
    replies: 3, upvotes: 15, verified: false,
    timestamp: '1 day ago', isPinned: false,
  },
];

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export const INITIAL_MESSAGES = [
  { id: 'msg1', from: 'Rachel Torres', fromId: 'mentor_rachel', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', role: 'Senior Mentor', preview: 'Hey! Reviewed your pointer drill. Let\'s meet before the lab on Thursday.', time: '5:12 PM', unread: true },
  { id: 'msg2', from: 'Dr. Aris Thorne', fromId: 'faculty_thorne', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'Faculty Mentor', preview: 'Your struct padding question was great. See the verified answer I posted.', time: '2:44 PM', unread: true },
  { id: 'msg3', from: 'Devin Patel', fromId: 'm2', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', role: 'Teaching Assistant', preview: 'Check out the new graph traversal resource I shared in the DS forum.', time: 'Yesterday', unread: false },
];
