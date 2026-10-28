# NEURONEXUS — Complete Hackathon Platform

> **"Your scores show what you achieved. Neuronexus helps you understand your learning journey."**  
> **Product Vision:** *"Learn smarter. Understand your progress. Stay in control."*

- **Project Name:** Neuronexus
- **Team Name:** Infinite Loopers
- **Theme:** Open Innovation (Software Category)
- **Team ID:** DEX26031

---

## 🌟 Executive Summary

Neuronexus is an intelligent learning and student wellbeing platform combining **verified academic performance**, **interactive YouTube video lessons**, **quizzes & topic mastery tracking**, **optional biopotential EEG analytics**, **explainable AI study recommendations**, and **student-controlled family wellbeing support**.

Academic evidence remains the primary source for grades and learning suggestions. EEG is an optional, experimental contextual feature rather than a replacement for academic assessment.

---

## 🚀 Quick Start (Zero Third-Party Pip Dependencies)

Neuronexus runs with pure standard Python 3.10+ and modern web standards. No `npm install` or heavy pip packages required.

### 1. Launch the Server
Open a terminal in the project directory:
```bash
python server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in any modern web browser.

### 2. Run the Automated Test Suite
```bash
python test_suite.py
```
*Current Status: 8/8 unit and integration tests passing in 0.28s.*

---

## 👥 Hackathon Demo Accounts & 1-Click Role Switcher

The top of the web interface features an **Instant 1-Click Role Switcher** and a **10-Step Interactive Judge Walkthrough**.

| Role | User Name | Demo Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex@neuronexus.edu` | `campus123` | Courses, YouTube lessons, quizzes, Neuro Analysis, private wellbeing check-ins, sharing controls |
| **Faculty** | Prof. Robert Chen | `chen@neuronexus.edu` | `campus123` | Course/lesson management, YouTube URL configuration, aggregated curriculum analytics (no student surveillance) |
| **Parent/Guardian** | Eleanor Rivera | `eleanor@guardian.edu` | `campus123` | Authorized academic progress summary, student-shared wellbeing check-ins (private notes & EEG strictly blocked) |
| **Administrator** | Dr. Sarah Vance | `admin@neuronexus.edu` | `campus123` | System audit logs, consent policies, platform health |

---

## 🎯 10-Step Hackathon Judge Walkthrough

Use the step buttons at the very top banner of the application to execute the judge demonstration in under 4 minutes:

1. **Step 1: Landing Page**  
   Notice the signature animated brain-signal waveform on HTML5 Canvas, product messaging, and the non-clinical privacy pledge.
2. **Step 2: Student Dashboard**  
   Logged in as Alex Rivera. Inspect course progress (CS201 Java & CS301 Algorithms), topic mastery matrix (Java Inheritance 80%, Recursion 40%), and recent study consistency.
3. **Step 3: Java Video Lesson**  
   Open CS201 Unit 2 Lesson: *Inheritance in Java*. Watch the embedded YouTube tutorial (`https://www.youtube.com/embed/9JpDgwpnBsk`), review the Java code notes, and click "Mark Lesson Completed".
4. **Step 4: Take Quiz & See Mastery**  
   Launch the 5-question Java Inheritance Mastery Quiz. Select answers, submit, and inspect instant automatic scoring, question explanations, and dynamic topic mastery update.
5. **Step 5: Neuro Analysis (3 Scenarios)**  
   Open the Waveform Viewer featuring the persistent badge `DEMO DATA — NOT LIVE EEG`. Switch between:
   - **Scenario A (Good Signal):** Clean waveforms, 96% coverage, experimental focus trend (~78%).
   - **Scenario B (Noisy Signal):** Motion artifacts, 42% coverage, **estimate automatically suppressed** to prevent misleading metrics.
   - **Scenario C (Disconnected):** Zero biopotential packets, flatline, "NO SIGNAL — DEVICE NOT CONNECTED".
6. **Step 6: AI Insights ("Why am I seeing this?")**  
   Click "Why am I seeing this?" on a study recommendation to open the transparent modal linking the suggestion directly to missed quiz questions.
7. **Step 7: Student Wellbeing Check-in & Share**  
   Submit a voluntary self-report ("Feeling stressed", private notes). Check "Share with Guardian Eleanor Rivera" and save.
8. **Step 8: Parent Portal Verification**  
   Click "Parent" in the top bar to log in as Eleanor Rivera. Verify that Eleanor can see the authorized academic summary and the explicitly shared check-in, while private notes remain inaccessible.
9. **Step 9: Revoke Student Sharing**  
   Switch back to Alex and click "Revoke Sharing". Return to the Parent Portal to confirm the check-in is instantly blocked on the server!
10. **Step 10: Faculty Analytics**  
    Log in as Prof. Robert Chen to inspect class difficulty patterns, frequently missed quiz concepts (e.g. static method hiding: 64% error rate), without any private student surveillance.

---

## 🧠 Hardware Integration Architecture (BioAmp EXG Pill)

Neuronexus includes modular firmware and signal processing for biopotential analog front-ends:

- **Firmware file:** [`sketch_oct28a_copy_20261028141956.ino`](./sketch_oct28a_copy_20261028141956.ino)
- **Hardware Board:** BioAmp EXG Pill (v1.0b) paired with Arduino / ESP32.
- **Sampling Rate:** 250 Hz (4000 microsecond loop interval).
- **Filtering:** 50 Hz digital notch filter + 0.5 Hz - 35 Hz bandpass filter.
- **Telemetry Format:** `[timestamp_us, raw_uV, filtered_uV]` streamed over Serial at 115200 baud.
- **Feature Pipeline (`eeg_processor.py`):**
  - Missing sample and rail saturation detection (clipping threshold: $\pm 480 \mu V$).
  - Spectral band powers: Theta (4-8 Hz), Alpha (8-12 Hz), Beta (13-30 Hz).
  - Shannon spectral entropy calculation.
  - Experimental focus index: $\beta / (\theta + \alpha)$.
  - **Automatic Suppression Trigger:** If signal quality coverage < 60%, estimate is suppressed with an honest explanation.

---

## 🔒 Security & Privacy by Design

- **Granular Consent:** Unbundled consent toggles for EEG acquisition, research participation, and guardian sharing.
- **Student-Controlled Revocation:** Revoking access immediately prevents guardian APIs from retrieving sensitive records.
- **Role-Based Authorization:** Server-enforced permissions on all sensitive API endpoints.
- **Cryptographic Hashing:** Passwords secured with PBKDF2-SHA256 and unique cryptographic salt.
- **Audit Logging:** All consent changes, sharing actions, and revocations are persisted to the immutable audit log table.
- **Non-Clinical Guarantee:** The platform clearly disclaims medical diagnosis and never uses EEG to assess mental illness or determine grades.

---

## 📁 Repository Structure

```
neuronexus/
├── server.py              # Zero-dependency Python 3 HTTP Server & REST API
├── database.py            # SQLite database access layer, PBKDF2 hashing, and demo seeding
├── schema.sql             # Relational SQLite schema with foreign keys and indexes
├── eeg_processor.py       # BioAmp EXG 250Hz signal processor, notch filter, and 3 demo scenarios
├── sketch_oct28a_...ino   # Arduino / ESP32 BioAmp EXG Pill firmware sketch
├── test_suite.py          # Automated test suite (8 passing tests)
├── public/
│   ├── index.html         # Rich modern SPA with 10-step judge walkthrough & all roles
│   ├── app.js             # Client router, Canvas waveform animator, and API handlers
│   └── styles.css         # Midnight-navy & electric-cyan glassmorphism styling
├── campus_qa.db           # Seeded relational database
└── README.md              # Project documentation and presentation guide
```

---

## 🏆 Hackathon Submission Details

- **Event:** Open Innovation Hackathon
- **Team ID:** DEX26031
- **Team Name:** Infinite Loopers
- **Repository:** `https://github.com/TanushreeProgrammer/neuronexus-extended.git`
