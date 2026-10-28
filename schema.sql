-- ============================================================
-- NEURONEXUS DATABASE SCHEMA
-- Unified Platform: CAMPUS-Q&A + Neuro Analytics + Courses +
-- Quizzes + Explainable AI + Family Support & Wellbeing
-- Team: Infinite Loopers (Team ID: DEX26031)
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'faculty', 'parent', 'admin', 'ta')),
    department TEXT DEFAULT 'Computer Science',
    year_of_study TEXT DEFAULT 'Junior',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    reputation INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. GUARDIAN RELATIONSHIPS (Student <-> Parent/Guardian)
CREATE TABLE IF NOT EXISTS guardian_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guardian_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'pending', 'revoked')),
    relationship_type TEXT DEFAULT 'parent',
    authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, guardian_id)
);

-- 3. COURSES, UNITS & LESSONS
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category TEXT DEFAULT 'Computer Science',
    level TEXT DEFAULT 'Intermediate',
    thumbnail_url TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content_text TEXT NOT NULL,
    video_url TEXT DEFAULT '',
    video_title TEXT DEFAULT '',
    duration_minutes INTEGER DEFAULT 15,
    order_index INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed INTEGER DEFAULT 0,
    completed_at TIMESTAMP DEFAULT NULL,
    notes TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 4. QUIZZES, QUESTIONS, ATTEMPTS & TOPIC MASTERY
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time_limit_minutes INTEGER DEFAULT 10,
    passing_score_pct INTEGER DEFAULT 70,
    is_scheduled_test INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT NULL,
    window_end TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    topic TEXT NOT NULL,
    options_json TEXT NOT NULL, -- JSON array of 4 strings
    correct_option_index INTEGER NOT NULL CHECK(correct_option_index BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    order_index INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage REAL NOT NULL,
    answers_json TEXT NOT NULL, -- JSON dict of question_id: selected_index
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    mastery_pct INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    calculation_basis TEXT DEFAULT '',
    last_assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, topic)
);

-- 5. NEURO ANALYSIS & EEG SESSIONS
CREATE TABLE IF NOT EXISTS eeg_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_title TEXT NOT NULL,
    data_source TEXT NOT NULL CHECK(data_source IN (
        'LIVE EEG — CONNECTED HARDWARE',
        'RECORDED EEG — PREVIOUSLY ACQUIRED DATA',
        'DEMO DATA — NOT LIVE EEG',
        'NO SIGNAL — DEVICE NOT CONNECTED'
    )),
    scenario_type TEXT DEFAULT 'good' CHECK(scenario_type IN ('good', 'noisy', 'disconnected')),
    signal_quality TEXT DEFAULT 'Good' CHECK(signal_quality IN ('Good', 'Limited', 'Poor', 'Insufficient data', 'Disconnected')),
    valid_data_coverage_pct INTEGER DEFAULT 95,
    duration_seconds INTEGER DEFAULT 1200,
    avg_focus_index REAL DEFAULT NULL,
    estimate_suppressed INTEGER DEFAULT 0,
    suppression_reason TEXT DEFAULT '',
    channel_names TEXT DEFAULT 'Fp1, Fp2, Cz, Pz',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXPLAINABLE AI STUDY RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS study_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK(category IN ('academic', 'neuro_contextual')),
    title TEXT NOT NULL,
    recommendation_text TEXT NOT NULL,
    evidence_reason TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK(source_type IN ('quiz_error', 'lesson_incomplete', 'eeg_fatigue', 'consistency')),
    source_reference_id INTEGER DEFAULT NULL,
    action_label TEXT NOT NULL,
    action_route TEXT NOT NULL,
    dismissed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. STUDENT WELLBEING CHECK-INS & SHARING
CREATE TABLE IF NOT EXISTS wellbeing_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status_mood TEXT NOT NULL CHECK(status_mood IN (
        'Feeling good',
        'Feeling okay',
        'Feeling stressed',
        'Feeling overwhelmed',
        'Would like support'
    )),
    notes TEXT DEFAULT '',
    request_conversation INTEGER DEFAULT 0,
    is_shared_with_guardian INTEGER DEFAULT 0,
    guardian_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    shared_at TIMESTAMP DEFAULT NULL,
    revoked_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CONSENT, PRIVACY & AUDIT LOGS
CREATE TABLE IF NOT EXISTS user_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK(consent_type IN (
        'eeg_acquisition',
        'research_sharing',
        'wellbeing_participation',
        'guardian_academic_sharing',
        'guardian_wellbeing_sharing'
    )),
    granted INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, consent_type)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id INTEGER DEFAULT NULL,
    details TEXT DEFAULT '',
    ip_address TEXT DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. PRESERVED CAMPUS-Q&A TABLES
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    description TEXT DEFAULT '',
    count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    views INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    accepted_answer_id INTEGER DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    is_accepted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL CHECK(target_type IN ('question', 'answer')),
    target_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK(target_type IN ('question', 'answer')),
    target_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 10. MENTORING WORKFLOW
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialties TEXT NOT NULL,
    availability TEXT NOT NULL,
    rating REAL DEFAULT 4.9,
    bio TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS mentoring_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'completed', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user ON topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_eeg_sessions_user ON eeg_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON study_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_user ON wellbeing_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
