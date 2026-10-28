"""
NEURONEXUS DATABASE ACCESS LAYER
SQLite relational storage with cryptographic password hashing (PBKDF2-SHA256)
and demo data seeding for hackathon demonstration.
Team: Infinite Loopers (Team ID: DEX26031)
"""

import sqlite3
import os
import hashlib
import secrets
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus_qa.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def hash_password(password: str, salt: str = None):
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return hashed, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(new_hash, stored_hash)

def create_session(user_id: int, days_valid: int = 14) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=days_valid)
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    cur.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at.isoformat())
    )
    conn.commit()
    conn.close()
    return token

def get_user_from_token(token: str):
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.* FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > ?
    """, (token, datetime.now().isoformat()))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def reset_and_seed_database():
    """Forces recreation of tables and resets demo records cleanly."""
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass
    init_db()

def init_db():
    conn = get_db()
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()
    seed_demo_data(conn)
    conn.close()

def seed_demo_data(conn):
    cur = conn.cursor()
    # Check if already seeded
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] > 0:
        return

    # 1. SEED DEMO USERS
    demo_users = [
        # Student
        (1, "Alex Rivera", "alex@neuronexus.edu", "campus123", "student", "Computer Science", "Junior",
         "Passionate about Java, full-stack engineering, and understanding my learning rhythms.",
         "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", 420),
        # Faculty
        (2, "Prof. Robert Chen", "chen@neuronexus.edu", "campus123", "faculty", "Computer Science", "Faculty Advisor",
         "Associate Professor of Computer Science. Research in Programming Languages and Curriculum Design.",
         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", 1450),
        # Parent / Guardian
        (3, "Eleanor Rivera", "eleanor@guardian.edu", "campus123", "parent", "Family Support", "Guardian",
         "Parent of Alex Rivera. Supporting balanced academic and emotional growth.",
         "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", 210),
        # Administrator
        (4, "Dr. Sarah Vance", "admin@neuronexus.edu", "campus123", "admin", "Institutional Research", "Dean of Academics",
         "Platform Administrator & Dean of Learning Technologies.",
         "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", 3000),
        # Peer Student
        (5, "Marcus Vance", "marcus@neuronexus.edu", "campus123", "student", "Mechanical Engineering", "Sophomore",
         "Formula Student telemetry engineer & study group peer.",
         "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", 195)
    ]
    for uid, name, email, pwd, role, dept, yr, bio, avatar, rep in demo_users:
        h, s = hash_password(pwd)
        cur.execute(
            """INSERT INTO users (id, name, email, password_hash, salt, role, department, year_of_study, bio, avatar_url, reputation)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (uid, name, email, h, s, role, dept, yr, bio, avatar, rep)
        )

    # 2. SEED GUARDIAN RELATIONSHIP (Eleanor Rivera -> Alex Rivera)
    cur.execute(
        """INSERT INTO guardian_relationships (student_id, guardian_id, status, relationship_type)
           VALUES (1, 3, 'active', 'parent')"""
    )

    # 3. SEED USER CONSENTS (Granular Privacy Controls for Alex Rivera)
    consents = [
        (1, "eeg_acquisition", 1),
        (1, "research_sharing", 0),
        (1, "wellbeing_participation", 1),
        (1, "guardian_academic_sharing", 1),
        (1, "guardian_wellbeing_sharing", 1)
    ]
    cur.executemany("INSERT INTO user_consents (user_id, consent_type, granted) VALUES (?, ?, ?)", consents)

    # 4. SEED COURSES, UNITS & LESSONS (With Embedded YouTube Videos)
    cur.execute("""
        INSERT INTO courses (id, code, title, description, instructor_id, category, level, thumbnail_url)
        VALUES (
            1, 'CS201', 'Java Programming & Object-Oriented Design',
            'Master core object-oriented principles in Java: encapsulation, inheritance, polymorphism, and abstract design patterns.',
            2, 'Computer Science', 'Intermediate',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'
        )
    """)
    cur.execute("""
        INSERT INTO courses (id, code, title, description, instructor_id, category, level, thumbnail_url)
        VALUES (
            2, 'CS301', 'Data Structures & Algorithms',
            'Deep dive into recursion, stack frames, dynamic programming, and balanced search trees.',
            2, 'Computer Science', 'Advanced',
            'https://images.unsplash.com/photo-1516116211227-bbc8f20a9a46?w=600'
        )
    """)

    # Units for CS201
    cur.execute("INSERT INTO units (id, course_id, title, order_index) VALUES (1, 1, 'Unit 1: Foundations of OOP', 1)")
    cur.execute("INSERT INTO units (id, course_id, title, order_index) VALUES (2, 1, 'Unit 2: Inheritance, Polymorphism & Superclasses', 2)")

    # Lessons for CS201 Unit 2
    cur.execute("""
        INSERT INTO lessons (id, unit_id, title, description, content_text, video_url, video_title, duration_minutes, order_index)
        VALUES (
            1, 2, 'Inheritance in Java: Superclasses, Subclasses & extends',
            'Learn how Java enables code reuse through the extends keyword, constructor chaining, and subclass specialization.',
            '## 1. Core Concept of Inheritance in Java\n\nInheritance is a fundamental mechanism where one class acquires the properties (fields) and behaviors (methods) of another. In Java, this is achieved using the **`extends`** keyword.\n\n### The Superclass and Subclass\n- **Superclass (Parent):** The class whose features are inherited.\n- **Subclass (Child):** The class that inherits from another class.\n\n```java\n// Superclass\npublic class Vehicle {\n    protected String brand;\n    public Vehicle(String brand) {\n        this.brand = brand;\n    }\n    public void honk() {\n        System.out.println("Beep beep!");\n    }\n}\n\n// Subclass\npublic class Car extends Vehicle {\n    private int doors;\n    public Car(String brand, int doors) {\n        super(brand); // Must be the first statement!\n        this.doors = doors;\n    }\n}\n```\n\n### Critical Rules to Remember\n1. **Single Inheritance Only:** A Java class can directly inherit from only one superclass.\n2. **`super()` Constructor Call:** The subclass constructor MUST invoke `super()` implicitly or explicitly as its very first statement.\n3. **Private Members:** Private members of a parent class are NOT directly accessible in child classes; they must be accessed via protected or public getter/setter methods.',
            'https://www.youtube.com/embed/9JpDgwpnBsk',
            'Java Inheritance Tutorial - Full Guide with Code Examples',
            18, 1
        )
    """)
    cur.execute("""
        INSERT INTO lessons (id, unit_id, title, description, content_text, video_url, video_title, duration_minutes, order_index)
        VALUES (
            2, 2, 'Method Overriding vs Overloading and the super Keyword',
            'Understand how subclasses provide specialized implementations of superclass methods using @Override.',
            '## Method Overriding in Java\n\nMethod overriding occurs when a subclass has the same method name, return type, and argument list as a method in its superclass.\n\n### Rules for Overriding:\n1. The method signature must match exactly.\n2. The access level cannot be more restrictive than the parent method.\n3. Constructors and `static` methods cannot be overridden.\n4. Use the `@Override` annotation for compile-time safety check.',
            'https://www.youtube.com/embed/zb4-msrG_uk',
            'Method Overriding in Java Explained with Examples',
            15, 2
        )
    """)

    # Units & Lessons for CS301
    cur.execute("INSERT INTO units (id, course_id, title, order_index) VALUES (3, 2, 'Unit 1: Recursion & Call Stacks', 1)")
    cur.execute("""
        INSERT INTO lessons (id, unit_id, title, description, content_text, video_url, video_title, duration_minutes, order_index)
        VALUES (
            3, 3, 'Recursion: Call Stacks, Base Cases & Stack Overflow',
            'Analyze how recursive calls push activation records onto the call stack and how base cases prevent infinite recursion.',
            '## Recursion Fundamentals\n\nA recursive function solves a problem by calling a copy of itself with a smaller input.\n\n### 2 Crucial Components:\n1. **Base Case:** Condition that terminates recursion.\n2. **Recursive Step:** Progresses toward the base case.\n\nWithout a proper base case, excessive function frames will cause a `StackOverflowError` in the JVM.',
            'https://www.youtube.com/embed/m45p2e1b1A4',
            'Recursion in Computer Science - Stack Frames and Tracing',
            22, 1
        )
    """)

    # Lesson Progress for Alex Rivera (Lesson 1 completed)
    cur.execute("""
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, notes)
        VALUES (1, 1, 1, CURRENT_TIMESTAMP, 'Reviewed constructor chaining and super() syntax.')
    """)

    # 5. SEED PRACTICE QUIZZES & QUESTIONS
    # Quiz 1: Java Inheritance Mastery Quiz
    cur.execute("""
        INSERT INTO quizzes (id, course_id, lesson_id, title, description, time_limit_minutes, passing_score_pct, is_scheduled_test)
        VALUES (1, 1, 1, 'Java Inheritance Mastery Quiz', 'Test your understanding of superclasses, constructors, and method overriding.', 10, 70, 0)
    """)
    # 5 Verified Assessment Questions for Quiz 1
    q1_questions = [
        (
            1, 1,
            "What keyword is used in Java by a subclass to inherit from a superclass?",
            "Java Inheritance",
            json.dumps(["implements", "extends", "inherits", "super"]),
            1, # extends
            "In Java, 'extends' is the keyword used to establish class inheritance, while 'implements' is reserved for interface contracts.",
            1
        ),
        (
            2, 1,
            "Which statement is TRUE regarding constructor execution in Java inheritance?",
            "Java Inheritance",
            json.dumps([
                "Subclasses automatically inherit parent constructors as member methods.",
                "The subclass constructor must invoke super() implicitly or explicitly as its first statement.",
                "Constructors can be overridden in the child class with a different return type.",
                "A child class cannot call its parent constructor under any circumstances."
            ]),
            1, # The subclass constructor must invoke super()...
            "In Java, a subclass constructor always invokes super() (either explicitly or implicitly added by the compiler) before executing its own constructor body.",
            2
        ),
        (
            3, 1,
            "Can a subclass in Java directly access private fields defined in its superclass?",
            "Java Inheritance",
            json.dumps([
                "Yes, any subclass can access private fields directly.",
                "No, private fields are encapsulated within the declaring class and cannot be accessed directly by subclasses.",
                "Yes, as long as both classes are in the same package.",
                "Yes, by using the 'this' keyword."
            ]),
            1, # No, private fields are encapsulated...
            "Private fields cannot be accessed directly by subclasses. Subclasses must use protected or public getter/setter methods provided by the superclass.",
            3
        ),
        (
            4, 1,
            "What occurs when a subclass defines a method with the exact same name and parameter types as a method in its superclass?",
            "Java Inheritance",
            json.dumps([
                "Method Overloading",
                "Method Overriding",
                "Compilation Error: Duplicate symbol",
                "Operator Overloading"
            ]),
            1, # Method Overriding
            "Method overriding occurs when a subclass provides a specific implementation of a method already declared in its superclass with identical signature.",
            4
        ),
        (
            5, 1,
            "Which keyword prevents a superclass method from being overridden by any of its subclasses?",
            "Java Inheritance",
            json.dumps(["static", "abstract", "final", "protected"]),
            2, # final
            "Declaring a method as 'final' in Java guarantees that subclasses cannot override or alter its implementation.",
            5
        )
    ]
    cur.executemany("""
        INSERT INTO quiz_questions (id, quiz_id, question_text, topic, options_json, correct_option_index, explanation, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, q1_questions)

    # Quiz 2: Recursion & Call Stacks Practice Quiz
    cur.execute("""
        INSERT INTO quizzes (id, course_id, lesson_id, title, description, time_limit_minutes, passing_score_pct, is_scheduled_test)
        VALUES (2, 2, 3, 'Recursion & Call Stacks Practice Quiz', 'Evaluate your grasp of recursive base cases, stack frames, and termination.', 8, 70, 0)
    """)
    q2_questions = [
        (
            6, 2,
            "What happens in Java when a recursive method fails to reach a terminating base case?",
            "Recursion & Call Stacks",
            json.dumps(["NullPointerException", "OutOfMemoryError", "StackOverflowError", "InfiniteLoopException"]),
            2, # StackOverflowError
            "Without a valid base case, recursive stack frames continuously consume memory on the thread call stack until a java.lang.StackOverflowError is thrown.",
            1
        ),
        (
            7, 2,
            "What is an activation record (stack frame) responsible for storing during a function call?",
            "Recursion & Call Stacks",
            json.dumps([
                "Only the global heap objects",
                "Local variables, parameter values, and the return address for that call instance",
                "The entire compiled bytecode of the class",
                "Only CPU cache registers"
            ]),
            1, # Local variables, parameters...
            "Each stack frame allocates memory for the function instance's local variables, formal arguments, and the return instruction address.",
            2
        )
    ]
    cur.executemany("""
        INSERT INTO quiz_questions (id, quiz_id, question_text, topic, options_json, correct_option_index, explanation, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, q2_questions)

    # 6. SEED PREVIOUS QUIZ ATTEMPT FOR ALEX RIVERA (4 out of 5 on Java Inheritance)
    cur.execute("""
        INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, percentage, answers_json, completed_at)
        VALUES (
            1, 1, 1, 4, 5, 80.0,
            '{"1": 1, "2": 1, "3": 1, "4": 1, "5": 0}',
            CURRENT_TIMESTAMP
        )
    """)

    # 7. SEED TOPIC MASTERY (Academic Evidence)
    mastery_records = [
        (1, 1, "Java Inheritance", 80, 5, 4, "Calculated from 5 verified assessment answers (80% accuracy). Based strictly on academic testing."),
        (1, 2, "Recursion & Call Stacks", 40, 5, 2, "Calculated from 5 assessment attempts (40% accuracy). Base case understanding flagged for revision."),
        (1, 1, "Database Normalization", 85, 4, 3, "Calculated from 4 assessment questions (85% accuracy). Improved from prior attempt.")
    ]
    cur.executemany("""
        INSERT INTO topic_mastery (user_id, course_id, topic, mastery_pct, questions_attempted, questions_correct, calculation_basis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, mastery_records)

    # 8. SEED RECORDED EEG SESSIONS (Clearly Labeled Demo / Recorded Data)
    cur.execute("""
        INSERT INTO eeg_sessions (id, user_id, session_title, data_source, scenario_type, signal_quality, valid_data_coverage_pct, duration_seconds, avg_focus_index, estimate_suppressed, suppression_reason, channel_names)
        VALUES (
            1, 1, 'Java Inheritance Focused Study Session',
            'DEMO DATA — NOT LIVE EEG', 'good', 'Good', 96, 1500, 78.4, 0, '', 'Fp1, Fp2, Cz, Pz'
        )
    """)
    cur.execute("""
        INSERT INTO eeg_sessions (id, user_id, session_title, data_source, scenario_type, signal_quality, valid_data_coverage_pct, duration_seconds, avg_focus_index, estimate_suppressed, suppression_reason, channel_names)
        VALUES (
            2, 1, 'Late-Night Recursion Debugging Session',
            'DEMO DATA — NOT LIVE EEG', 'noisy', 'Poor', 42, 2400, NULL, 1,
            'Signal quality is limited (42% valid data coverage). Excessive movement artifacts detected. Focus estimate automatically suppressed to prevent misleading metrics.',
            'Fp1, Fp2, Cz, Pz'
        )
    """)

    # 9. SEED EXPLAINABLE AI STUDY RECOMMENDATIONS (Evidence-based)
    recs = [
        (
            1, 1, 'academic',
            'Review Java Constructor Chaining & final Keyword',
            'You answered question #5 incorrectly regarding final methods and scored 80% on Java Inheritance. Review Lesson 2.2 notes before taking scheduled exams.',
            'Triggered by Quiz #1 Attempt (Score: 80%, missed Question 5 on final modifier)',
            'quiz_error', 1, 'Review Lesson 2.2', 'lesson-2'
        ),
        (
            2, 1, 'academic',
            'Strengthen Recursion Base Case Identification',
            'Your topic mastery for Recursion & Call Stacks is at 40% (2/5 correct). We recommend re-reading Lesson 1.1 and tracing the call stack for 3 sample problems.',
            'Triggered by Topic Mastery threshold (<50% mastery in CS301 Unit 1)',
            'quiz_error', 2, 'Open Recursion Lesson', 'lesson-3'
        ),
        (
            3, 1, 'neuro_contextual',
            'Optimal Focus Window: Try 25-Minute Study Cycles',
            'During your recorded 40-minute late study session, signal quality and focus stability dropped noticeably after 25 minutes. Consider using the Pomodoro 25/5 rhythm.',
            'Triggered by EEG Session #2 spectral power decay curve after minute 25',
            'eeg_fatigue', 2, 'View Session Analysis', 'neuro'
        )
    ]
    cur.executemany("""
        INSERT INTO study_recommendations (id, user_id, category, title, recommendation_text, evidence_reason, source_type, source_reference_id, action_label, action_route)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, recs)

    # 10. SEED STUDENT WELLBEING CHECK-INS (Student-Controlled Sharing)
    # Checkin 1: SHARED with Eleanor Rivera (Guardian)
    cur.execute("""
        INSERT INTO wellbeing_checkins (id, user_id, status_mood, notes, request_conversation, is_shared_with_guardian, guardian_id, shared_at)
        VALUES (
            1, 1, 'Feeling stressed',
            'Balancing CS201 and CS301 project deadlines this week. Doing fine with coding, just feeling a bit pressured by midterms.',
            0, 1, 3, CURRENT_TIMESTAMP
        )
    """)
    # Checkin 2: PRIVATE (NOT shared! Must be strictly inaccessible to Parent!)
    cur.execute("""
        INSERT INTO wellbeing_checkins (id, user_id, status_mood, notes, request_conversation, is_shared_with_guardian, guardian_id, shared_at)
        VALUES (
            2, 1, 'Feeling overwhelmed',
            'Private thoughts regarding sleep habits and workload management. Taking a short break this evening.',
            1, 0, NULL, NULL
        )
    """)

    # 11. SEED AUDIT LOGS
    cur.execute("""
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
        VALUES (1, 'CONSENT_GRANTED', 'user_consents', 1, 'Student granted EEG acquisition and guardian summary sharing permissions.')
    """)
    cur.execute("""
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
        VALUES (1, 'WELLBEING_SHARED', 'wellbeing_checkins', 1, 'Student explicitly shared check-in #1 with guardian Eleanor Rivera.')
    """)

    # 12. SEED PRESERVED CAMPUS-Q&A CATEGORIES & QUESTIONS
    categories = [
        ("Academics & Courses", "academics", "Course recommendations, professor reviews, study tips, and syllabus advice", "book-open", "#4f46e5"),
        ("Campus Life & Housing", "campus-life", "Dorms, off-campus apartments, roommates, dining halls, and campus spots", "home", "#059669"),
        ("Career & Internships", "career", "Resume reviews, interview tips, internships, campus job openings, and recruiting", "briefcase", "#0284c7"),
        ("Clubs & Events", "clubs", "Student organizations, campus fests, hackathons, sports, and meetups", "users", "#7c3aed"),
        ("Exams & Study Prep", "exams", "Midterms, finals past papers, study groups, flashcards, and grading curves", "file-text", "#d97706"),
        ("Tech & Labs", "tech", "Campus Wi-Fi, computer labs, software licenses, 3D printing, and dev tools", "cpu", "#0891b2"),
        ("General", "general", "Any campus questions, announcements, lost and found, and general discussions", "help-circle", "#4b5563")
    ]
    cur.executemany("INSERT INTO categories (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)", categories)

    tags = [
        ("cs201", "Java programming and OOP design", 14),
        ("algorithms", "Data structures and algorithm design", 18),
        ("finals", "Final exams preparation and schedules", 15),
        ("study-spots", "Quiet places to study on campus", 8),
        ("internships", "Summer and fall co-op/internship experiences", 24)
    ]
    cur.executemany("INSERT INTO tags (name, description, count) VALUES (?, ?, ?)", tags)

    questions_data = [
        (
            1, "How does the grading curve work for CS201 with Prof. Chen?",
            "I am currently enrolled in CS201 (Java Programming). The syllabus mentions exam cutoffs are adjusted based on median score. How generous is the curve historically?",
            1, 1, 142, 18, 1, None, None, ["cs201", "finals"]
        ),
        (
            2, "What are the best quiet study spots on campus for deep work sessions?",
            "Looking for places with strong Wi-Fi, power outlets, and minimal noise for focused study blocks.",
            5, 2, 89, 25, 1, None, None, ["study-spots"]
        )
    ]
    for qid, title, body, author_id, cat_id, views, votes, answers_cnt, accepted, img, q_tags in questions_data:
        cur.execute(
            """INSERT INTO questions (id, title, body, author_id, category_id, views, votes_count, answers_count, accepted_answer_id, image_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (qid, title, body, author_id, cat_id, views, votes, answers_cnt, accepted, img)
        )
        for t_name in q_tags:
            cur.execute("SELECT id FROM tags WHERE name = ?", (t_name,))
            r = cur.fetchone()
            if r:
                cur.execute("INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)", (qid, r[0]))

    # Answers
    cur.execute("""
        INSERT INTO answers (id, question_id, author_id, body, votes_count, is_accepted)
        VALUES (1, 1, 2, 'The curve is calculated strictly to ensure fair letter grade distributions. Practice quizzes and active participation are heavily rewarded.', 12, 1)
    """)
    cur.execute("""
        INSERT INTO answers (id, question_id, author_id, body, votes_count, is_accepted)
        VALUES (2, 2, 1, 'The 4th floor reading room in the Science & Engineering library is almost silent with ample AC outlets.', 8, 1)
    """)

    # 13. SEED MENTOR PROFILES
    cur.execute("""
        INSERT INTO mentor_profiles (user_id, specialties, availability, rating, bio)
        VALUES (2, 'Java, OOP Architecture, Systems Design', 'Mon & Wed 3-5 PM', 4.95, 'Faculty advisor and systems researcher. Available for academic guidance and project code reviews.')
    """)
    cur.execute("""
        INSERT INTO mentoring_requests (student_id, mentor_id, topic, message, status)
        VALUES (1, 2, 'Inheritance & Design Patterns', 'Hi Professor, I would appreciate 15 minutes to review dynamic dispatch in my capstone project.', 'accepted')
    """)

    conn.commit()
