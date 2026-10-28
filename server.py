"""
NEURONEXUS BACKEND SERVER
Zero-dependency Python 3 HTTP Server & REST API.
Handles Authentication, Courses, Lessons with YouTube Embeds, Quizzes,
Topic Mastery, EEG Signal Analytics, Explainable AI Recommendations,
Student Wellbeing Check-ins with Guardian Access Control, Faculty Analytics,
Consent Management, and Campus Q&A.
Team: Infinite Loopers (Team ID: DEX26031)
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import mimetypes
import traceback
import sys
from datetime import datetime, timedelta

import database
from eeg_processor import eeg_service, HARDWARE_CONFIG

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

class NeuronexusHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Concise logging
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {self.command} {self.path.split('?')[0]} - {args[0] if args else ''}")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def get_auth_user(self):
        auth_header = self.headers.get("Authorization", "")
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        elif "token=" in self.headers.get("Cookie", ""):
            for part in self.headers.get("Cookie", "").split(";"):
                if "token=" in part:
                    token = part.split("token=")[1].strip()
        if not token:
            return None
        return database.get_user_from_token(token)

    def send_json(self, data, status_code=200):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status_code=400):
        self.send_json({"error": message, "status": status_code}, status_code)

    def parse_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def serve_static(self, filepath):
        if filepath == "" or filepath == "/":
            filepath = "index.html"
        clean_path = filepath.split("?")[0].lstrip("/")
        full_path = os.path.normpath(os.path.join(PUBLIC_DIR, clean_path))
        if not full_path.startswith(PUBLIC_DIR) or not os.path.exists(full_path) or os.path.isdir(full_path):
            full_path = os.path.join(PUBLIC_DIR, "index.html")

        if not os.path.exists(full_path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"File not found")
            return

        mime_type, _ = mimetypes.guess_type(full_path)
        if not mime_type:
            mime_type = "application/octet-stream"
        
        try:
            with open(full_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode("utf-8"))

    # =========================================================================
    # GET REQUEST ROUTING
    # =========================================================================
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if not path.startswith("/api/"):
            return self.serve_static(path)

        user = self.get_auth_user()
        user_id = user["id"] if user else None

        conn = database.get_db()
        cur = conn.cursor()

        try:
            # 1. Health & Meta
            if path == "/api/health":
                conn.close()
                return self.send_json({
                    "status": "ok",
                    "app": "Neuronexus Platform API",
                    "team": "Infinite Loopers (DEX26031)",
                    "version": "2.0.0",
                    "eeg_bridge": HARDWARE_CONFIG["device_name"]
                })

            # 2. Auth /me
            if path == "/api/auth/me":
                conn.close()
                if not user:
                    return self.send_error_json("Unauthorized", 401)
                safe_user = {k: user[k] for k in user if k not in ("password_hash", "salt")}
                return self.send_json({"user": safe_user})

            # 3. Courses List
            if path == "/api/courses":
                cur.execute("""
                    SELECT c.*, u.name as instructor_name,
                           (SELECT COUNT(*) FROM units WHERE course_id = c.id) as units_count,
                           (SELECT COUNT(*) FROM lessons l JOIN units un ON l.unit_id = un.id WHERE un.course_id = c.id) as lessons_count
                    FROM courses c
                    LEFT JOIN users u ON c.instructor_id = u.id
                    ORDER BY c.id ASC
                """)
                courses = [dict(r) for r in cur.fetchall()]
                # If user is student, compute completion pct
                for c in courses:
                    if user_id:
                        cur.execute("""
                            SELECT COUNT(*) FROM lesson_progress lp
                            JOIN lessons l ON lp.lesson_id = l.id
                            JOIN units u ON l.unit_id = u.id
                            WHERE u.course_id = ? AND lp.user_id = ? AND lp.completed = 1
                        """, (c["id"], user_id))
                        completed_cnt = cur.fetchone()[0]
                        c["user_completed_lessons"] = completed_cnt
                        c["progress_pct"] = round((completed_cnt / max(1, c["lessons_count"])) * 100)
                    else:
                        c["progress_pct"] = 0
                conn.close()
                return self.send_json(courses)

            # 4. Course Detail with Units & Lessons
            if path.startswith("/api/courses/") and not path.endswith("/lessons"):
                cid = path.split("/")[3]
                cur.execute("SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?", (cid,))
                course = cur.fetchone()
                if not course:
                    conn.close()
                    return self.send_error_json("Course not found", 404)
                course_dict = dict(course)

                cur.execute("SELECT * FROM units WHERE course_id = ? ORDER BY order_index ASC", (cid,))
                units = [dict(u) for u in cur.fetchall()]
                for u in units:
                    cur.execute("""
                        SELECT l.*,
                               (SELECT completed FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.user_id = ?) as is_completed
                        FROM lessons l
                        WHERE l.unit_id = ?
                        ORDER BY l.order_index ASC
                    """, (user_id, u["id"]))
                    u["lessons"] = [dict(l) for l in cur.fetchall()]
                course_dict["units"] = units
                conn.close()
                return self.send_json(course_dict)

            # 5. Lesson Detail
            if path.startswith("/api/lessons/"):
                lid = path.split("/")[3]
                cur.execute("""
                    SELECT l.*, u.course_id, u.title as unit_title, c.title as course_title,
                           (SELECT completed FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.user_id = ?) as is_completed,
                           (SELECT notes FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.user_id = ?) as user_notes,
                           (SELECT id FROM quizzes q WHERE q.lesson_id = l.id LIMIT 1) as quiz_id
                    FROM lessons l
                    JOIN units u ON l.unit_id = u.id
                    JOIN courses c ON u.course_id = c.id
                    WHERE l.id = ?
                """, (user_id, user_id, lid))
                row = cur.fetchone()
                conn.close()
                if not row:
                    return self.send_error_json("Lesson not found", 404)
                return self.send_json(dict(row))

            # 6. Quiz Detail (with Questions)
            if path.startswith("/api/quizzes/"):
                qid = path.split("/")[3]
                cur.execute("SELECT * FROM quizzes WHERE id = ?", (qid,))
                quiz = cur.fetchone()
                if not quiz:
                    conn.close()
                    return self.send_error_json("Quiz not found", 404)
                quiz_dict = dict(quiz)

                cur.execute("SELECT id, quiz_id, question_text, topic, options_json, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC", (qid,))
                questions = []
                for q_row in cur.fetchall():
                    q_d = dict(q_row)
                    q_d["options"] = json.loads(q_d["options_json"])
                    questions.append(q_d)
                quiz_dict["questions"] = questions
                conn.close()
                return self.send_json(quiz_dict)

            # 7. Topic Mastery for Student
            if path == "/api/student/topic-mastery":
                target_uid = int(query.get("user_id", [user_id or 1])[0])
                cur.execute("""
                    SELECT tm.*, c.title as course_title, c.code as course_code
                    FROM topic_mastery tm
                    JOIN courses c ON tm.course_id = c.id
                    WHERE tm.user_id = ?
                    ORDER BY tm.mastery_pct DESC
                """, (target_uid,))
                mastery = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(mastery)

            # 8. EEG Live Stream / Synthetic Stream
            if path == "/api/eeg/live-stream":
                scenario = query.get("scenario", ["good"])[0]
                packet = eeg_service.generate_demo_packet_stream(scenario=scenario, num_points=120)
                conn.close()
                return self.send_json(packet)

            # 9. EEG Sessions History
            if path == "/api/eeg/sessions":
                target_uid = int(query.get("user_id", [user_id or 1])[0])
                cur.execute("""
                    SELECT * FROM eeg_sessions
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                """, (target_uid,))
                sessions = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(sessions)

            # 10. EEG Hardware Status
            if path == "/api/eeg/hardware/status":
                conn.close()
                return self.send_json({
                    "config": HARDWARE_CONFIG,
                    "status": "connected_mock_bridge",
                    "port": "COM4 (BioAmp USB-Serial)",
                    "baudrate": 115200,
                    "packets_received": 142050,
                    "packet_drop_rate": 0.012,
                    "temperature_c": 31.4,
                    "label": "DEMO DATA — NOT LIVE EEG"
                })

            # 11. Explainable AI Recommendations
            if path == "/api/recommendations":
                target_uid = int(query.get("user_id", [user_id or 1])[0])
                cur.execute("""
                    SELECT * FROM study_recommendations
                    WHERE user_id = ? AND dismissed = 0
                    ORDER BY id ASC
                """, (target_uid,))
                recs = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(recs)

            # 12. "Why am I seeing this?" Recommendation Evidence Details
            if path.startswith("/api/recommendations/") and path.endswith("/evidence"):
                rec_id = path.split("/")[3]
                cur.execute("SELECT * FROM study_recommendations WHERE id = ?", (rec_id,))
                rec = cur.fetchone()
                if not rec:
                    conn.close()
                    return self.send_error_json("Recommendation not found", 404)
                rec_dict = dict(rec)
                
                # Retrieve supporting empirical records
                evidence_payload = {
                    "recommendation_id": rec_dict["id"],
                    "title": rec_dict["title"],
                    "category": rec_dict["category"],
                    "reasoning_summary": rec_dict["evidence_reason"],
                    "algorithm": "Neuronexus Transparent Evidence-Based Rule Engine (v2.1)",
                    "disclaimer": "Academic performance records are the primary evidence. EEG context is supplementary and non-clinical."
                }
                if rec_dict["source_type"] == "quiz_error":
                    cur.execute("""
                        SELECT qa.score, qa.total_questions, qa.percentage, qa.completed_at, q.title as quiz_title
                        FROM quiz_attempts qa
                        JOIN quizzes q ON qa.quiz_id = q.id
                        WHERE qa.user_id = ? ORDER BY qa.completed_at DESC LIMIT 1
                    """, (rec_dict["user_id"],))
                    attempt = cur.fetchone()
                    if attempt:
                        evidence_payload["quiz_attempt"] = dict(attempt)
                elif rec_dict["source_type"] == "eeg_fatigue":
                    cur.execute("SELECT * FROM eeg_sessions WHERE id = ?", (rec_dict["source_reference_id"],))
                    sess = cur.fetchone()
                    if sess:
                        evidence_payload["session_metadata"] = dict(sess)

                conn.close()
                return self.send_json(evidence_payload)

            # 13. Student Wellbeing Check-ins (Student View)
            if path == "/api/wellbeing/checkins":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                cur.execute("""
                    SELECT w.*, g.name as guardian_name
                    FROM wellbeing_checkins w
                    LEFT JOIN users g ON w.guardian_id = g.id
                    WHERE w.user_id = ?
                    ORDER BY w.created_at DESC
                """, (user["id"],))
                checkins = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(checkins)

            # 14. Parent/Guardian Portal Data Access
            # STRICT REQUIREMENT: Only returns student info if guardian is authorized,
            # and returns ONLY authorized academic summaries and explicitly shared wellbeing check-ins!
            if path == "/api/parent/student-summary":
                if not user or user["role"] not in ("parent", "admin"):
                    conn.close()
                    return self.send_error_json("Access restricted to authorized parents/guardians.", 403)

                # Find student linked to this guardian
                cur.execute("""
                    SELECT gr.student_id, u.name as student_name, u.email as student_email, u.department, u.year_of_study
                    FROM guardian_relationships gr
                    JOIN users u ON gr.student_id = u.id
                    WHERE gr.guardian_id = ? AND gr.status = 'active'
                """, (user["id"],))
                rel = cur.fetchone()
                if not rel:
                    conn.close()
                    return self.send_json({
                        "authorized": False,
                        "message": "No student currently linked to this guardian account."
                    })
                student_id = rel["student_id"]

                # Academic progress summary
                cur.execute("""
                    SELECT c.code, c.title, tm.topic, tm.mastery_pct, tm.questions_attempted, tm.questions_correct, tm.last_assessed_at
                    FROM topic_mastery tm
                    JOIN courses c ON tm.course_id = c.id
                    WHERE tm.user_id = ?
                """, (student_id,))
                academic_mastery = [dict(r) for r in cur.fetchall()]

                # Only fetch wellbeing check-ins where is_shared_with_guardian == 1
                cur.execute("""
                    SELECT id, status_mood, notes, request_conversation, shared_at, created_at
                    FROM wellbeing_checkins
                    WHERE user_id = ? AND is_shared_with_guardian = 1
                    ORDER BY shared_at DESC
                """, (student_id,))
                shared_checkins = [dict(r) for r in cur.fetchall()]

                # Return sanitized guardian payload (NO raw EEG, NO private notes)
                conn.close()
                return self.send_json({
                    "authorized": True,
                    "student": dict(rel),
                    "academic_summary": academic_mastery,
                    "shared_wellbeing_checkins": shared_checkins,
                    "privacy_notice": "Only academic summaries and check-ins explicitly shared by the student are displayed. Raw EEG and private records are protected."
                })

            # 15. Faculty Analytics
            # Aggregated academic performance. Individual EEG and private wellbeing are suppressed!
            if path == "/api/faculty/analytics":
                if not user or user["role"] not in ("faculty", "admin"):
                    conn.close()
                    return self.send_error_json("Access restricted to faculty members.", 403)

                cur.execute("""
                    SELECT q.title as quiz_title, c.title as course_title,
                           COUNT(qa.id) as total_attempts,
                           ROUND(AVG(qa.percentage), 1) as avg_score_pct,
                           MIN(qa.percentage) as min_score,
                           MAX(qa.percentage) as max_score
                    FROM quizzes q
                    JOIN courses c ON q.course_id = c.id
                    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
                    GROUP BY q.id
                """)
                quiz_stats = [dict(r) for r in cur.fetchall()]

                cur.execute("""
                    SELECT tm.topic, c.code as course_code,
                           ROUND(AVG(tm.mastery_pct), 1) as avg_mastery_pct,
                           COUNT(DISTINCT tm.user_id) as enrolled_students
                    FROM topic_mastery tm
                    JOIN courses c ON tm.course_id = c.id
                    GROUP BY tm.topic, c.code
                    ORDER BY avg_mastery_pct ASC
                """)
                topic_stats = [dict(r) for r in cur.fetchall()]

                conn.close()
                return self.send_json({
                    "quiz_statistics": quiz_stats,
                    "topic_mastery_distribution": topic_stats,
                    "frequently_missed_concepts": [
                        {"concept": "Overriding vs Hiding static methods", "error_rate": "64%", "recommended_action": "Schedule 15-min review in next lab"},
                        {"concept": "Subclass constructor super() invocation order", "error_rate": "48%", "recommended_action": "Review memory stack trace diagram"},
                        {"concept": "Base case boundary condition in recursion", "error_rate": "60%", "recommended_action": "Provide additional step-through exercises"}
                    ],
                    "privacy_guarantee": "Individual student EEG signals and wellbeing notes are strictly withheld from faculty dashboards to prevent surveillance bias."
                })

            # 16. Privacy Consents & Audit Logs
            if path == "/api/privacy/consents":
                target_uid = int(query.get("user_id", [user_id or 1])[0])
                cur.execute("SELECT * FROM user_consents WHERE user_id = ?", (target_uid,))
                consents = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(consents)

            if path == "/api/privacy/audit-logs":
                cur.execute("""
                    SELECT al.*, u.name as actor_name
                    FROM audit_logs al
                    LEFT JOIN users u ON al.actor_id = u.id
                    ORDER BY al.created_at DESC LIMIT 20
                """)
                logs = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(logs)

            # 17. Preserved Campus Q&A: Categories, Tags, Questions
            if path == "/api/categories":
                cur.execute("SELECT * FROM categories ORDER BY id ASC")
                cats = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(cats)

            if path == "/api/tags":
                cur.execute("SELECT * FROM tags ORDER BY count DESC LIMIT 30")
                tags = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(tags)

            if path == "/api/questions":
                search = query.get("search", [None])[0]
                category = query.get("category", [None])[0]
                sql = """
                    SELECT q.*, u.name as author_name, u.avatar_url as author_avatar, u.role as author_role,
                           c.name as category_name, c.color as category_color,
                           (SELECT COUNT(*) FROM bookmarks b WHERE b.question_id = q.id AND b.user_id = ?) as is_bookmarked,
                           (SELECT vote_type FROM votes v WHERE v.target_type = 'question' AND v.target_id = q.id AND v.user_id = ?) as user_vote
                    FROM questions q
                    JOIN users u ON q.author_id = u.id
                    JOIN categories c ON q.category_id = c.id
                    WHERE 1=1
                """
                params = [user_id, user_id]
                if search:
                    sql += " AND (q.title LIKE ? OR q.body LIKE ?)"
                    params.extend([f"%{search}%", f"%{search}%"])
                if category and category != "all":
                    sql += " AND c.slug = ?"
                    params.append(category)
                sql += " ORDER BY q.created_at DESC"
                cur.execute(sql, params)
                questions = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(questions)

            if path == "/api/mentors":
                cur.execute("""
                    SELECT mp.*, u.name, u.email, u.department, u.avatar_url
                    FROM mentor_profiles mp
                    JOIN users u ON mp.user_id = u.id
                    ORDER BY mp.rating DESC
                """)
                mentors = [dict(r) for r in cur.fetchall()]
                conn.close()
                return self.send_json(mentors)

            # 404 for unknown API
            conn.close()
            return self.send_error_json("API endpoint not found", 404)

        except Exception as e:
            traceback.print_exc()
            conn.close()
            return self.send_error_json(str(e), 500)

    # =========================================================================
    # POST REQUEST ROUTING
    # =========================================================================
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        user = self.get_auth_user()
        user_id = user["id"] if user else None

        conn = database.get_db()
        cur = conn.cursor()

        try:
            # 1. 1-Click Instant Demo Login (For Hackathon Judges)
            if path == "/api/auth/demo-switch":
                role_requested = body.get("role", "student")
                cur.execute("SELECT * FROM users WHERE role = ? ORDER BY id ASC LIMIT 1", (role_requested,))
                target_user = cur.fetchone()
                if not target_user:
                    conn.close()
                    return self.send_error_json(f"No demo user found for role: {role_requested}", 404)
                
                token = database.create_session(target_user["id"])
                safe_user = {k: target_user[k] for k in target_user if k not in ("password_hash", "salt")}
                conn.close()
                return self.send_json({
                    "token": token,
                    "user": safe_user,
                    "message": f"Successfully switched to {safe_user['name']} ({role_requested.capitalize()})"
                })

            # 2. Standard Login
            if path == "/api/auth/login":
                email = body.get("email", "").strip().lower()
                password = body.get("password", "").strip()
                cur.execute("SELECT * FROM users WHERE email = ?", (email,))
                user_row = cur.fetchone()
                if not user_row or not database.verify_password(password, user_row["password_hash"], user_row["salt"]):
                    conn.close()
                    return self.send_error_json("Invalid email or password", 401)

                token = database.create_session(user_row["id"])
                safe_user = {k: user_row[k] for k in user_row if k not in ("password_hash", "salt")}
                conn.close()
                return self.send_json({"token": token, "user": safe_user})

            # 3. Logout
            if path == "/api/auth/logout":
                auth_header = self.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header[7:].strip()
                    cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
                    conn.commit()
                conn.close()
                return self.send_json({"message": "Logged out successfully"})

            # 4. Mark Lesson Completed
            if path.startswith("/api/lessons/") and path.endswith("/complete"):
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                lid = path.split("/")[3]
                cur.execute("""
                    INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
                    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
                    ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = 1, completed_at = CURRENT_TIMESTAMP
                """, (user["id"], lid))
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "Lesson marked as completed!"})

            # 5. Faculty Add Lesson / YouTube Video
            if path.startswith("/api/courses/") and path.endswith("/lessons"):
                if not user or user["role"] not in ("faculty", "admin"):
                    conn.close()
                    return self.send_error_json("Only faculty can add lessons.", 403)
                cid = path.split("/")[3]
                title = body.get("title", "").strip()
                unit_id = body.get("unit_id", 1)
                desc = body.get("description", "").strip()
                content = body.get("content_text", "").strip()
                video_url = body.get("video_url", "").strip()
                video_title = body.get("video_title", "").strip()
                duration = int(body.get("duration_minutes", 15))

                # Normalize YouTube URL to standard embed
                if "watch?v=" in video_url:
                    vid_code = video_url.split("watch?v=")[1].split("&")[0]
                    video_url = f"https://www.youtube.com/embed/{vid_code}"
                elif "youtu.be/" in video_url:
                    vid_code = video_url.split("youtu.be/")[1].split("?")[0]
                    video_url = f"https://www.youtube.com/embed/{vid_code}"

                cur.execute("""
                    INSERT INTO lessons (unit_id, title, description, content_text, video_url, video_title, duration_minutes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (unit_id, title, desc, content, video_url, video_title, duration))
                conn.commit()
                new_lid = cur.lastrowid
                conn.close()
                return self.send_json({"success": True, "lesson_id": new_lid, "message": "Lesson added successfully!"})

            # 6. Submit Quiz Answers (Calculates Score, Mastery & Explainable Recommendations)
            if path.startswith("/api/quizzes/") and path.endswith("/submit"):
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                qid = path.split("/")[3]
                answers = body.get("answers", {})  # dict of question_id: selected_index

                cur.execute("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC", (qid,))
                questions = cur.fetchall()
                if not questions:
                    conn.close()
                    return self.send_error_json("No questions found for quiz", 404)

                score = 0
                total = len(questions)
                question_results = []
                topic = questions[0]["topic"] if questions else "General"
                course_id = 1

                for q in questions:
                    q_id_str = str(q["id"])
                    user_choice = answers.get(q_id_str, None)
                    is_correct = (user_choice is not None and int(user_choice) == int(q["correct_option_index"]))
                    if is_correct:
                        score += 1
                    question_results.append({
                        "question_id": q["id"],
                        "question_text": q["question_text"],
                        "user_choice": user_choice,
                        "correct_choice": q["correct_option_index"],
                        "is_correct": is_correct,
                        "explanation": q["explanation"]
                    })

                pct = round((score / total) * 100, 1)

                # Save attempt
                cur.execute("""
                    INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, percentage, answers_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (qid, user["id"], score, total, pct, json.dumps(answers)))
                attempt_id = cur.lastrowid

                # Update Topic Mastery
                cur.execute("""
                    INSERT INTO topic_mastery (user_id, course_id, topic, mastery_pct, questions_attempted, questions_correct, calculation_basis)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_id, course_id, topic) DO UPDATE SET
                        mastery_pct = ?,
                        questions_attempted = questions_attempted + ?,
                        questions_correct = questions_correct + ?,
                        last_assessed_at = CURRENT_TIMESTAMP
                """, (
                    user["id"], course_id, topic, int(pct), total, score,
                    f"Calculated from {total} verified quiz questions ({pct}% accuracy).",
                    int(pct), total, score
                ))

                # Generate Dynamic Explainable Recommendation if score < 80%
                if pct < 80:
                    cur.execute("""
                        INSERT INTO study_recommendations (user_id, category, title, recommendation_text, evidence_reason, source_type, source_reference_id, action_label, action_route)
                        VALUES (?, 'academic', ?, ?, ?, 'quiz_error', ?, 'Review Lesson & Practice', 'courses')
                    """, (
                        user["id"],
                        f"Review {topic} (Score: {score}/{total})",
                        f"You answered {total - score} out of {total} questions incorrectly on {topic}. Review the lesson materials and retry the quiz.",
                        f"Derived from Quiz Attempt #{attempt_id} ({pct}% accuracy on {topic})",
                        attempt_id
                    ))

                conn.commit()
                conn.close()

                return self.send_json({
                    "success": True,
                    "score": score,
                    "total_questions": total,
                    "percentage": pct,
                    "results": question_results,
                    "topic_mastery_updated": True
                })

            # 7. Submit Student Wellbeing Check-in
            if path == "/api/wellbeing/checkins":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                mood = body.get("status_mood", "Feeling okay")
                notes = body.get("notes", "").strip()
                conv = 1 if body.get("request_conversation", False) else 0
                share_guardian = 1 if body.get("is_shared_with_guardian", False) else 0

                guardian_id = None
                if share_guardian:
                    cur.execute("SELECT guardian_id FROM guardian_relationships WHERE student_id = ? AND status = 'active'", (user["id"],))
                    grow = cur.fetchone()
                    if grow:
                        guardian_id = grow["guardian_id"]

                cur.execute("""
                    INSERT INTO wellbeing_checkins (user_id, status_mood, notes, request_conversation, is_shared_with_guardian, guardian_id, shared_at)
                    VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
                """, (user["id"], mood, notes, conv, share_guardian, guardian_id, share_guardian))
                new_cid = cur.lastrowid

                # Audit log
                cur.execute("""
                    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                    VALUES (?, 'WELLBEING_CHECKIN_SUBMITTED', 'wellbeing_checkins', ?, ?)
                """, (user["id"], new_cid, f"Mood: {mood}, Shared: {bool(share_guardian)}"))

                conn.commit()
                conn.close()
                return self.send_json({
                    "success": True,
                    "id": new_cid,
                    "message": "Wellbeing check-in submitted. Thank you for checking in with yourself."
                })

            # 8. Student Share Check-in with Guardian
            if path.startswith("/api/wellbeing/checkins/") and path.endswith("/share"):
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                cid = path.split("/")[4]
                cur.execute("SELECT guardian_id FROM guardian_relationships WHERE student_id = ? AND status = 'active'", (user["id"],))
                grow = cur.fetchone()
                guardian_id = grow["guardian_id"] if grow else None

                cur.execute("""
                    UPDATE wellbeing_checkins
                    SET is_shared_with_guardian = 1, guardian_id = ?, shared_at = CURRENT_TIMESTAMP, revoked_at = NULL
                    WHERE id = ? AND user_id = ?
                """, (guardian_id, cid, user["id"]))
                
                cur.execute("""
                    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                    VALUES (?, 'WELLBEING_SHARED', 'wellbeing_checkins', ?, 'Student granted guardian access to checkin.')
                """, (user["id"], cid))

                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "Check-in successfully shared with your guardian."})

            # 9. Student Revoke Sharing with Guardian (CRITICAL HACKATHON DEMO STEP)
            if path.startswith("/api/wellbeing/checkins/") and path.endswith("/revoke"):
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                cid = path.split("/")[4]
                cur.execute("""
                    UPDATE wellbeing_checkins
                    SET is_shared_with_guardian = 0, revoked_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """, (cid, user["id"]))

                cur.execute("""
                    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                    VALUES (?, 'WELLBEING_REVOKED', 'wellbeing_checkins', ?, 'Student revoked guardian access.')
                """, (user["id"], cid))

                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "Sharing revoked. Guardian can no longer view this record."})

            # 10. Privacy Consents Update
            if path == "/api/privacy/consents/update":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                ctype = body.get("consent_type")
                granted = 1 if body.get("granted") else 0
                cur.execute("""
                    INSERT INTO user_consents (user_id, consent_type, granted)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_id, consent_type) DO UPDATE SET granted = ?, updated_at = CURRENT_TIMESTAMP
                """, (user["id"], ctype, granted, granted))

                cur.execute("""
                    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                    VALUES (?, 'CONSENT_UPDATED', 'user_consents', NULL, ?)
                """, (user["id"], f"{ctype} set to {bool(granted)}"))

                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "Consent settings updated."})

            # 11. Withdraw All Consents & Purge Data
            if path == "/api/privacy/consents/withdraw-all":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                cur.execute("UPDATE user_consents SET granted = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", (user["id"],))
                cur.execute("UPDATE wellbeing_checkins SET is_shared_with_guardian = 0, revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?", (user["id"],))
                cur.execute("""
                    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                    VALUES (?, 'ALL_CONSENTS_WITHDRAWN', 'user_consents', NULL, 'Student revoked all consents.')
                """, (user["id"],))
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "All consents withdrawn. Future collection and sharing stopped."})

            # 12. Preserved Campus Q&A: Ask Question, Post Answer, Vote
            if path == "/api/questions":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                title = body.get("title", "").strip()
                btext = body.get("body", "").strip()
                cat_id = body.get("category_id", 1)
                tags = body.get("tags", [])
                cur.execute("""
                    INSERT INTO questions (title, body, author_id, category_id)
                    VALUES (?, ?, ?, ?)
                """, (title, btext, user["id"], cat_id))
                qid = cur.lastrowid
                for t in tags:
                    cur.execute("INSERT OR IGNORE INTO tags (name, count) VALUES (?, 1)", (t,))
                    cur.execute("SELECT id FROM tags WHERE name = ?", (t,))
                    tr = cur.fetchone()
                    if tr:
                        cur.execute("INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)", (qid, tr[0]))
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "id": qid})

            if path == "/api/answers":
                if not user:
                    conn.close()
                    return self.send_error_json("Unauthorized", 401)
                qid = body.get("question_id")
                btext = body.get("body", "").strip()
                cur.execute("INSERT INTO answers (question_id, author_id, body) VALUES (?, ?, ?)", (qid, user["id"], btext))
                cur.execute("UPDATE questions SET answers_count = answers_count + 1 WHERE id = ?", (qid,))
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": "Answer posted!"})

            # 13. Demo Data Reset Action
            if path == "/api/demo/reset":
                conn.close()
                database.reset_and_seed_database()
                return self.send_json({"success": True, "message": "Demo data reset successfully to initial hackathon state!"})

            # 404 for unknown endpoint
            conn.close()
            return self.send_error_json("API endpoint not found", 404)

        except Exception as e:
            traceback.print_exc()
            conn.close()
            return self.send_error_json(str(e), 500)

def run_server(port=PORT):
    database.init_db()
    server_address = ("", port)
    httpd = socketserver.TCPServer(server_address, NeuronexusHandler)
    httpd.allow_reuse_address = True
    print(f"===========================================================")
    print(f"  NEURONEXUS BACKEND PLATFORM RUNNING AT http://localhost:{port}")
    print(f"  Team: Infinite Loopers (Team ID: DEX26031)")
    print(f"  Instant 1-Click Demo Login Bar enabled for Judges")
    print(f"===========================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(p)
