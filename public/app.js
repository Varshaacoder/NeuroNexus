/**
 * NEURONEXUS CLIENT APPLICATION CORE
 * Complete Single-Page Application Logic & Waveform Animation Engine
 * Team: Infinite Loopers (Team ID: DEX26031)
 */

class NeuronexusApp {
  constructor() {
    this.token = localStorage.getItem("neuronexus_token") || "";
    this.currentUser = null;
    this.currentView = "landing";
    this.currentLessonId = 1;
    this.currentQuizId = 1;
    this.quizUserAnswers = {};
    this.selectedMood = "Feeling stressed";
    this.eegScenario = "good";
    this.isWaveformPaused = false;
    this.heroWaveAnimId = null;
    this.liveWaveAnimId = null;
    this.liveDataBuffer = { Fp1: [], Fp2: [], Cz: [], Pz: [] };
    this.liveBufferIndex = 0;

    window.addEventListener("DOMContentLoaded", () => this.init());
  }

  async init() {
    // 1. Check or establish default session as Student (Alex Rivera)
    await this.restoreOrDemoLogin("student");

    // 2. Start Hero Waveform Animation
    this.initHeroWaveform();

    // 3. Initialize Live EEG Loop
    this.initLiveEEGWaveform();

    // 4. Default View Navigation
    this.navigate("landing");

    // Replace icons
    if (window.feather) feather.replace();
  }

  // =========================================================================
  // AUTHENTICATION & INSTANT ROLE SWITCHING
  // =========================================================================
  async restoreOrDemoLogin(defaultRole = "student") {
    if (this.token) {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          this.setCurrentUser(data.user);
          return;
        }
      } catch (e) {
        console.warn("Failed to restore session, falling back to demo login.", e);
      }
    }
    await this.switchRole(defaultRole, false);
  }

  async switchRole(role, autoNavigate = true) {
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.token) {
        this.token = data.token;
        localStorage.setItem("neuronexus_token", this.token);
        this.setCurrentUser(data.user);
        this.showToast(`Switched role to ${data.user.name} (${role.toUpperCase()})`);

        if (autoNavigate) {
          if (role === "faculty") this.navigate("faculty");
          else if (role === "parent") this.navigate("parent");
          else this.navigate("dashboard");
        }
      }
    } catch (e) {
      console.error("Demo switch failed:", e);
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRoleBadge");
    const avatarEl = document.getElementById("userAvatar");
    const facultyBtn = document.getElementById("navFacultyBtn");
    const parentBtn = document.getElementById("navParentBtn");

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      roleEl.textContent = user.role.toUpperCase();
      roleEl.className = `text-[10px] font-semibold uppercase ${
        user.role === 'faculty' ? 'text-indigo-400' :
        user.role === 'parent' ? 'text-emerald-400' : 'text-cyan-400'
      }`;
    }
    if (avatarEl && user.avatar_url) avatarEl.src = user.avatar_url;

    // Show/hide role-specific navigation tabs
    if (facultyBtn) {
      facultyBtn.classList.toggle("hidden", !(user.role === "faculty" || user.role === "admin"));
    }
    if (parentBtn) {
      parentBtn.classList.toggle("hidden", !(user.role === "parent" || user.role === "admin"));
    }

    if (window.feather) feather.replace();
  }

  async resetDemoData() {
    if (!confirm("Reset demo data to initial clean hackathon state?")) return;
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      this.showToast(data.message || "Demo data reset!");
      await this.switchRole("student", true);
    } catch (e) {
      this.showToast("Reset failed: " + e.message, "error");
    }
  }

  // =========================================================================
  // NAVIGATION & VIEW CONTROLLER
  // =========================================================================
  navigate(viewName) {
    this.currentView = viewName;

    // Hide all view sections
    document.querySelectorAll(".view-section").forEach(sec => sec.classList.add("hidden"));

    // Deactivate nav links
    document.querySelectorAll(".nav-link").forEach(btn => {
      btn.classList.remove("bg-slate-800", "text-white", "font-bold");
      btn.classList.add("text-slate-300");
    });

    // Show target section
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Highlight active nav link
    const activeBtn = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (activeBtn) {
      activeBtn.classList.add("bg-slate-800", "text-white", "font-bold");
      activeBtn.classList.remove("text-slate-300");
    }

    // Load dynamic data for view
    if (viewName === "dashboard") this.loadDashboard();
    else if (viewName === "courses") this.loadCourses();
    else if (viewName === "lesson") this.loadLesson(this.currentLessonId);
    else if (viewName === "quiz") this.loadQuiz(this.currentQuizId);
    else if (viewName === "neuro") this.loadNeuroStudio();
    else if (viewName === "ai-insights") this.loadAIInsights();
    else if (viewName === "wellbeing") this.loadWellbeingCheckins();
    else if (viewName === "parent") this.loadParentPortalData();
    else if (viewName === "faculty") this.loadFacultyAnalytics();
    else if (viewName === "privacy") this.loadPrivacySettings();
    else if (viewName === "qa") this.loadCampusQA();

    if (window.feather) feather.replace();
  }

  // =========================================================================
  // 10-STEP HACKATHON DEMO WALKTHROUGH FLOW (FOR JUDGES)
  // =========================================================================
  async runDemoStep(step) {
    switch (step) {
      case 1:
        // Step 1: Landing Page & Animated Wave
        this.navigate("landing");
        this.showToast("Step 1: Welcome to Neuronexus. Notice the animated brain wave and core vision.");
        break;

      case 2:
        // Step 2: Student Dashboard
        await this.switchRole("student", false);
        this.navigate("dashboard");
        this.showToast("Step 2: Student Dashboard loaded for Alex Rivera. Inspect topic mastery & progress.");
        break;

      case 3:
        // Step 3: Java Video Lesson
        this.currentLessonId = 1;
        this.navigate("lesson");
        this.showToast("Step 3: Java Inheritance lesson with embedded YouTube tutorial & code notes.");
        break;

      case 4:
        // Step 4: Take Quiz & See Mastery
        this.currentQuizId = 1;
        this.navigate("quiz");
        this.showToast("Step 4: Practice Quiz. Select your answers to evaluate topic mastery.");
        break;

      case 5:
        // Step 5: Neuro Analysis (3 Scenarios)
        this.navigate("neuro");
        this.switchEEGScenario("good");
        this.showToast("Step 5: Neuro Analysis Studio. Notice the persistent 'DEMO DATA' badge & 3 scenarios.");
        break;

      case 6:
        // Step 6: AI Insights ('Why am I seeing this?')
        this.navigate("ai-insights");
        setTimeout(() => this.openEvidenceModal(1), 400);
        this.showToast("Step 6: AI Classroom. Opened 'Why am I seeing this?' transparent evidence explanation.");
        break;

      case 7:
        // Step 7: Student Wellbeing Check-in & Share
        this.navigate("wellbeing");
        this.selectMood("Feeling stressed");
        document.getElementById("wellbeingNotesInput").value = "Balancing CS201 midterms and CS301 recursion labs this week.";
        document.getElementById("wellbeingShareGuardianCheck").checked = true;
        this.showToast("Step 7: Voluntary student wellbeing check-in. Pre-filled with sharing permission.");
        break;

      case 8:
        // Step 8: Parent Portal Verification
        await this.switchRole("parent", false);
        this.navigate("parent");
        this.showToast("Step 8: Logged in as Eleanor Rivera (Guardian). Authorized academic & shared check-in visible.");
        break;

      case 9:
        // Step 9: Revoke Student Sharing
        await this.switchRole("student", false);
        this.navigate("wellbeing");
        this.showToast("Step 9: Switched back to Alex. Click 'Revoke Sharing' on check-in #1 to stop guardian access!");
        break;

      case 10:
        // Step 10: Faculty Analytics
        await this.switchRole("faculty", false);
        this.navigate("faculty");
        this.showToast("Step 10: Faculty Analytics for Prof. Chen. Aggregated difficulty patterns without student surveillance.");
        break;
    }
  }

  // =========================================================================
  // ANIMATED EEG WAVEFORM ENGINES (CANVAS)
  // =========================================================================
  initHeroWaveform() {
    const canvas = document.getElementById("heroWaveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw 3 flowing biopotential traces (Alpha 10Hz, Beta 18Hz, Theta 6Hz)
      const traces = [
        { color: "rgba(6, 182, 212, 0.85)", yMid: height * 0.28, freq: 0.04, amp: 22, speed: 0.05 },
        { color: "rgba(139, 92, 246, 0.85)", yMid: height * 0.52, freq: 0.07, amp: 18, speed: 0.07 },
        { color: "rgba(56, 189, 248, 0.75)", yMid: height * 0.76, freq: 0.025, amp: 20, speed: 0.04 }
      ];

      traces.forEach(t => {
        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 8;

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
      this.heroWaveAnimId = requestAnimationFrame(render);
    };

    render();
  }

  async initLiveEEGWaveform() {
    const canvas = document.getElementById("liveEEGCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Fetch initial packet stream
    await this.fetchLiveEEGPackets();

    // Stream refresh interval
    setInterval(() => {
      if (!this.isWaveformPaused && this.currentView === "neuro") {
        this.fetchLiveEEGPackets();
      }
    }, 1200);

    let offset = 0;
    const render = () => {
      if (this.currentView === "neuro" && !this.isWaveformPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const channels = ["Fp1", "Fp2", "Cz", "Pz"];
        const colors = ["#06b6d4", "#38bdf8", "#818cf8", "#a78bfa"];
        const channelHeight = h / channels.length;

        channels.forEach((ch, idx) => {
          const yCenter = (idx + 0.5) * channelHeight;
          const data = this.liveDataBuffer[ch] || [];

          // Channel baseline and label
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, yCenter);
          ctx.lineTo(w, yCenter);
          ctx.stroke();

          ctx.fillStyle = colors[idx];
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`${ch} (±500µV)`, 10, yCenter - 14);

          // Draw signal waveform
          if (data.length > 1) {
            ctx.beginPath();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = colors[idx];
            ctx.shadowColor = colors[idx];
            ctx.shadowBlur = 6;

            const stepX = w / Math.max(1, data.length - 1);
            for (let i = 0; i < data.length; i++) {
              // Scale microvolts to pixels (range +-500 uV mapped to +-35px)
              const yVal = yCenter - (data[i] / 500.0) * (channelHeight * 0.42);
              if (i === 0) ctx.moveTo(i * stepX, yVal);
              else ctx.lineTo(i * stepX, yVal);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });

        offset += 1;
      }
      this.liveWaveAnimId = requestAnimationFrame(render);
    };

    render();
  }

  async fetchLiveEEGPackets() {
    try {
      const res = await fetch(`/api/eeg/live-stream?scenario=${this.eegScenario}`);
      const data = await res.json();
      if (data && data.channels) {
        this.liveDataBuffer = data.channels;
        this.updateNeuroMetricsUI(data);
      }
    } catch (e) {
      console.warn("Failed to fetch EEG stream", e);
    }
  }

  updateNeuroMetricsUI(data) {
    const badge = document.getElementById("neuroDataSourceBadge");
    const qualityPill = document.getElementById("neuroQualityStatusPill");
    const covPct = document.getElementById("neuroCoveragePct");
    const covBar = document.getElementById("neuroCoverageBar");
    const activeBox = document.getElementById("neuroFocusActiveBox");
    const suppBox = document.getElementById("neuroFocusSuppressedBox");
    const suppReason = document.getElementById("neuroSuppressionReason");
    const focusVal = document.getElementById("neuroFocusValue");
    const focusLbl = document.getElementById("neuroFocusLabel");
    const artifactStatus = document.getElementById("neuroArtifactStatus");

    if (badge) {
      badge.textContent = data.data_source || "DEMO DATA — NOT LIVE EEG";
      if (data.scenario === "disconnected") badge.className = "px-3 py-1 rounded-full text-xs font-extrabold tracking-wider badge-nosignal";
      else badge.className = "px-3 py-1 rounded-full text-xs font-extrabold tracking-wider badge-demo";
    }

    if (qualityPill) {
      qualityPill.textContent = data.signal_quality || "Good";
      qualityPill.className = `px-2 py-0.5 rounded text-[11px] font-bold ${
        data.signal_quality === "Good" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
        data.signal_quality === "Poor" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
        "bg-rose-500/20 text-rose-400 border border-rose-500/30"
      }`;
    }

    if (covPct) covPct.textContent = `${data.valid_coverage_pct || 0}%`;
    if (covBar) {
      covBar.style.width = `${data.valid_coverage_pct || 0}%`;
      covBar.className = data.valid_coverage_pct > 70 ? "bg-emerald-500 h-2 rounded-full" : "bg-amber-500 h-2 rounded-full";
    }

    if (artifactStatus) {
      if (data.scenario === "noisy") {
        artifactStatus.textContent = "High EMG / Clipping Detected";
        artifactStatus.className = "font-bold text-amber-400";
      } else if (data.scenario === "disconnected") {
        artifactStatus.textContent = "No Signal / Flatline";
        artifactStatus.className = "font-bold text-rose-400";
      } else {
        artifactStatus.textContent = "Normal Baseline (<5%)";
        artifactStatus.className = "font-bold text-emerald-400";
      }
    }

    // Handle Focus Estimate vs Suppression
    if (data.estimate && data.estimate.is_suppressed) {
      if (activeBox) activeBox.classList.add("hidden");
      if (suppBox) suppBox.classList.remove("hidden");
      if (suppReason) suppReason.textContent = data.estimate.suppression_reason || "Signal quality is limited. Estimate suppressed.";
    } else {
      if (suppBox) suppBox.classList.add("hidden");
      if (activeBox) activeBox.classList.remove("hidden");
      if (focusVal && data.estimate) focusVal.textContent = `${data.estimate.focus_index || 78.4}%`;
      if (focusLbl && data.estimate) focusLbl.textContent = data.estimate.focus_category || "High Engagement";
    }
  }

  switchEEGScenario(scenario) {
    this.eegScenario = scenario;

    // Update scenario button styles
    ["good", "noisy", "disconnected"].forEach(s => {
      const btn = document.getElementById(`btnScenario${s === 'good' ? 'Good' : s === 'noisy' ? 'Noisy' : 'Disc'}`);
      if (btn) {
        if (s === scenario) {
          btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 text-white border border-cyan-400 shadow-sm transition-all";
        } else {
          btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all";
        }
      }
    });

    this.fetchLiveEEGPackets();
    this.showToast(`Switched to Scenario: ${scenario.toUpperCase()}`);
  }

  toggleWaveformPause() {
    this.isWaveformPaused = !this.isWaveformPaused;
    const btn = document.getElementById("btnWaveformPause");
    if (btn) btn.textContent = this.isWaveformPaused ? "Resume Wave" : "Pause Wave";
  }

  // =========================================================================
  // VIEW: STUDENT DASHBOARD
  // =========================================================================
  async loadDashboard() {
    try {
      // 1. Load Courses
      const cRes = await fetch("/api/courses", { headers: { Authorization: `Bearer ${this.token}` } });
      const courses = await cRes.json();
      const cContainer = document.getElementById("dashboardCoursesList");
      if (cContainer && Array.isArray(courses)) {
        cContainer.innerHTML = courses.map(c => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">${c.code}</span>
                <h4 class="font-bold text-white text-sm">${c.title}</h4>
              </div>
              <p class="text-xs text-slate-400">${c.description}</p>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-right">
                <div class="text-xs font-bold text-slate-200">${c.progress_pct}% Completed</div>
                <div class="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div class="bg-cyan-500 h-1.5 rounded-full" style="width: ${c.progress_pct}%"></div>
                </div>
              </div>
              <button onclick="app.openCourse(${c.id})" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
                Continue &rarr;
              </button>
            </div>
          </div>
        `).join("");
      }

      // 2. Load Topic Mastery
      const mRes = await fetch("/api/student/topic-mastery", { headers: { Authorization: `Bearer ${this.token}` } });
      const mastery = await mRes.json();
      const mContainer = document.getElementById("dashboardMasteryList");
      if (mContainer && Array.isArray(mastery)) {
        mContainer.innerHTML = mastery.map(m => `
          <div>
            <div class="flex items-center justify-between text-xs font-semibold mb-1">
              <span class="text-slate-200">${m.topic}</span>
              <span class="${m.mastery_pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}">${m.mastery_pct}%</span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="${m.mastery_pct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} h-2 rounded-full" style="width: ${m.mastery_pct}%"></div>
            </div>
            <div class="text-[10px] text-slate-400 mt-1">${m.questions_correct}/${m.questions_attempted} verified answers • ${m.course_code}</div>
          </div>
        `).join("");
      }

      // 3. Load Recommendations Preview
      const rRes = await fetch("/api/recommendations", { headers: { Authorization: `Bearer ${this.token}` } });
      const recs = await rRes.json();
      const rContainer = document.getElementById("dashboardRecommendationsList");
      if (rContainer && Array.isArray(recs)) {
        rContainer.innerHTML = recs.slice(0, 3).map(r => `
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div class="space-y-1.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.category === 'academic' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
                ${r.category === 'academic' ? 'Academic Evidence' : 'Neuro Context'}
              </span>
              <h4 class="font-bold text-slate-100 text-xs">${r.title}</h4>
              <p class="text-slate-400 text-xs line-clamp-3">${r.recommendation_text}</p>
            </div>
            <div class="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[11px]">
              <button onclick="app.openEvidenceModal(${r.id})" class="text-cyan-400 hover:underline font-semibold">
                Why am I seeing this?
              </button>
              <button onclick="app.executeRecAction('${r.action_route}')" class="text-slate-300 hover:text-white font-bold">
                ${r.action_label} &rarr;
              </button>
            </div>
          </div>
        `).join("");
      }

    } catch (e) {
      console.error("Dashboard load failed:", e);
    }
  }

  // =========================================================================
  // VIEW: COURSES & EMBEDDED YOUTUBE LESSONS
  // =========================================================================
  async loadCourses() {
    try {
      const res = await fetch("/api/courses", { headers: { Authorization: `Bearer ${this.token}` } });
      const courses = await res.json();
      const grid = document.getElementById("coursesCatalogGrid");
      if (!grid || !Array.isArray(courses)) return;

      grid.innerHTML = courses.map(c => `
        <div class="glass-panel overflow-hidden flex flex-col justify-between border-slate-700/60">
          <div class="h-44 w-full relative overflow-hidden bg-slate-900">
            <img src="${c.thumbnail_url}" alt="${c.title}" class="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-300">
            <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-cyan-400 text-xs font-bold border border-cyan-500/30">
              ${c.code} • ${c.level}
            </div>
          </div>
          <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-white">${c.title}</h3>
              <p class="text-slate-400 text-xs leading-relaxed">${c.description}</p>
            </div>
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span class="text-xs text-slate-400">Instructor: <strong class="text-slate-200">${c.instructor_name}</strong></span>
              <button onclick="app.openCourse(${c.id})" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider">
                Open Syllabus &rarr;
              </button>
            </div>
          </div>
        </div>
      `).join("");

    } catch (e) {
      console.error("Courses load error:", e);
    }
  }

  async openCourse(courseId) {
    // Open Lesson 1 for Course 1 or Lesson 3 for Course 2
    if (courseId === 1) this.currentLessonId = 1;
    else this.currentLessonId = 3;
    this.navigate("lesson");
  }

  async loadLesson(lessonId) {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${this.token}` } });
      const lesson = await res.json();

      document.getElementById("lessonCourseUnit").textContent = `${lesson.course_title} • ${lesson.unit_title}`;
      document.getElementById("lessonTitle").textContent = lesson.title;
      document.getElementById("lessonDescription").textContent = lesson.description;
      document.getElementById("lessonVideoTitle").textContent = lesson.video_title || "Educational Video Lecture";

      // YouTube Embed
      const iframe = document.getElementById("lessonYoutubeIframe");
      if (iframe && lesson.video_url) {
        iframe.src = lesson.video_url;
      }
      const extLink = document.getElementById("lessonExternalVideoLink");
      if (extLink) extLink.href = lesson.video_url;

      // Lesson Notes Content
      const contentBox = document.getElementById("lessonContentMarkdown");
      if (contentBox) {
        contentBox.innerHTML = this.renderSimpleMarkdown(lesson.content_text);
      }

      // Complete button status
      const compBtn = document.getElementById("lessonCompleteBtn");
      if (compBtn) {
        if (lesson.is_completed) {
          compBtn.innerHTML = `<i data-feather="check-circle" class="w-4 h-4 text-emerald-400"></i> Completed`;
          compBtn.className = "px-4 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-2";
        } else {
          compBtn.innerHTML = `<i data-feather="check" class="w-4 h-4 text-slate-400"></i> Mark Lesson Completed`;
          compBtn.className = "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2";
        }
      }

      this.currentQuizId = lesson.quiz_id || 1;
      if (window.feather) feather.replace();

    } catch (e) {
      console.error("Lesson load error:", e);
    }
  }

  async markCurrentLessonComplete() {
    try {
      const res = await fetch(`/api/lessons/${this.currentLessonId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      this.showToast(data.message || "Lesson marked as completed!");
      this.loadLesson(this.currentLessonId);
    } catch (e) {
      this.showToast("Failed to complete lesson", "error");
    }
  }

  launchCurrentLessonQuiz() {
    this.navigate("quiz");
  }

  // =========================================================================
  // VIEW: PRACTICE QUIZZES & TOPIC MASTERY
  // =========================================================================
  async loadQuiz(quizId) {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${this.token}` } });
      const quiz = await res.json();

      document.getElementById("quizTitle").textContent = quiz.title;
      document.getElementById("quizDescription").textContent = quiz.description;

      const container = document.getElementById("quizQuestionsContainer");
      document.getElementById("quizResultsPanel").classList.add("hidden");
      document.getElementById("quizSubmitRow").classList.remove("hidden");
      this.quizUserAnswers = {};

      if (container && Array.isArray(quiz.questions)) {
        container.innerHTML = quiz.questions.map((q, idx) => `
          <div class="glass-panel p-6 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <h4 class="font-bold text-white text-sm">
                <span class="text-cyan-400 mr-2">Question ${idx + 1}.</span>
                ${q.question_text}
              </h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 shrink-0">
                ${q.topic}
              </span>
            </div>

            <div class="space-y-2.5">
              ${q.options.map((opt, oIdx) => `
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer text-xs text-slate-300 transition-colors">
                  <input type="radio" name="quiz_q_${q.id}" value="${oIdx}" onchange="app.recordQuizAnswer(${q.id}, ${oIdx})" class="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700">
                  <span>${opt}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `).join("");
      }

    } catch (e) {
      console.error("Quiz load error:", e);
    }
  }

  recordQuizAnswer(questionId, optionIndex) {
    this.quizUserAnswers[questionId] = optionIndex;
  }

  async submitQuizAnswers() {
    try {
      const res = await fetch(`/api/quizzes/${this.currentQuizId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: this.quizUserAnswers })
      });
      const data = await res.json();
      if (!data.success) {
        this.showToast(data.error || "Submission failed", "error");
        return;
      }

      // Display results panel
      document.getElementById("quizSubmitRow").classList.add("hidden");
      const resultsPanel = document.getElementById("quizResultsPanel");
      resultsPanel.classList.remove("hidden");
      document.getElementById("quizScoreText").textContent = `${data.score} / ${data.total_questions} (${data.percentage}%)`;

      const reviewContainer = document.getElementById("quizReviewContainer");
      if (reviewContainer && Array.isArray(data.results)) {
        reviewContainer.innerHTML = data.results.map((r, i) => `
          <div class="p-4 rounded-xl ${r.is_correct ? 'bg-emerald-950/20 border border-emerald-800/40' : 'bg-rose-950/20 border border-rose-800/40'} space-y-2 text-xs">
            <div class="flex items-center justify-between font-bold">
              <span class="text-slate-200">Q${i + 1}: ${r.question_text}</span>
              <span class="${r.is_correct ? 'text-emerald-400' : 'text-rose-400'}">${r.is_correct ? 'Correct (+1)' : 'Incorrect (0)'}</span>
            </div>
            <div class="text-slate-400 text-[11px] leading-relaxed">
              <strong class="text-slate-300">Explanation:</strong> ${r.explanation}
            </div>
          </div>
        `).join("");
      }

      this.showToast(`Quiz completed: ${data.score}/${data.total_questions}! Topic Mastery updated.`);
      window.scrollTo({ top: resultsPanel.offsetTop - 80, behavior: "smooth" });

    } catch (e) {
      this.showToast("Failed to submit quiz: " + e.message, "error");
    }
  }

  // =========================================================================
  // VIEW: NEURO ANALYSIS STUDIO
  // =========================================================================
  async loadNeuroStudio() {
    try {
      const res = await fetch("/api/eeg/sessions", { headers: { Authorization: `Bearer ${this.token}` } });
      const sessions = await res.json();
      const sContainer = document.getElementById("neuroSessionsList");
      if (sContainer && Array.isArray(sessions)) {
        sContainer.innerHTML = sessions.map(s => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">${s.session_title}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.signal_quality === 'Good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
                  ${s.signal_quality} Quality (${s.valid_data_coverage_pct}%)
                </span>
              </div>
              <p class="text-slate-400">Duration: ${Math.round(s.duration_seconds / 60)} minutes • Channels: ${s.channel_names}</p>
            </div>
            <div class="text-right">
              <div class="text-slate-300 font-semibold">${s.estimate_suppressed ? '<span class="text-amber-400">Estimate Suppressed</span>' : 'Focus: <span class="text-cyan-400 font-bold">' + s.avg_focus_index + '%</span>'}</div>
              <div class="text-[10px] text-slate-400">${new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        `).join("");
      }
    } catch (e) {
      console.error("Neuro studio sessions load error:", e);
    }
  }

  // =========================================================================
  // VIEW: EXPLAINABLE AI INSIGHTS
  // =========================================================================
  async loadAIInsights() {
    try {
      const res = await fetch("/api/recommendations", { headers: { Authorization: `Bearer ${this.token}` } });
      const recs = await res.json();
      const container = document.getElementById("aiInsightsFullList");
      if (container && Array.isArray(recs)) {
        container.innerHTML = recs.map(r => `
          <div class="glass-panel p-6 space-y-4 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  r.category === 'academic' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }">
                  ${r.category === 'academic' ? 'Academic Evidence (Primary)' : 'Neuro Context (Optional)'}
                </span>
              </div>
              <h4 class="font-bold text-white text-base">${r.title}</h4>
              <p class="text-slate-300 text-xs leading-relaxed">${r.recommendation_text}</p>
            </div>

            <div class="pt-4 border-t border-slate-800 space-y-3">
              <div class="p-3 rounded-lg bg-slate-900 text-[11px] text-slate-400">
                <strong class="text-slate-200">Basis:</strong> ${r.evidence_reason}
              </div>
              <div class="flex items-center justify-between pt-1">
                <button onclick="app.openEvidenceModal(${r.id})" class="text-cyan-400 hover:underline text-xs font-semibold">
                  Why am I seeing this?
                </button>
                <button onclick="app.executeRecAction('${r.action_route}')" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">
                  ${r.action_label} &rarr;
                </button>
              </div>
            </div>
          </div>
        `).join("");
      }
    } catch (e) {
      console.error("AI Insights load error:", e);
    }
  }

  async openEvidenceModal(recId) {
    try {
      const res = await fetch(`/api/recommendations/${recId}/evidence`, { headers: { Authorization: `Bearer ${this.token}` } });
      const data = await res.json();
      const modal = document.getElementById("evidenceModal");
      const body = document.getElementById("evidenceModalBody");

      if (body) {
        body.innerHTML = `
          <div class="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 space-y-1">
            <div class="font-bold text-sm text-white">${data.title}</div>
            <div class="text-[11px]">${data.reasoning_summary}</div>
          </div>

          <div class="space-y-2">
            <div class="font-bold text-slate-200 uppercase text-[10px] tracking-wider">Algorithm & Verification</div>
            <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div><strong class="text-slate-300">Engine:</strong> ${data.algorithm}</div>
              <div><strong class="text-slate-300">Confidence:</strong> High (Empirical quiz response telemetry)</div>
            </div>
          </div>

          ${data.quiz_attempt ? `
            <div class="space-y-2">
              <div class="font-bold text-slate-200 uppercase text-[10px] tracking-wider">Supporting Assessment Record</div>
              <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
                <div>Quiz: <strong class="text-white">${data.quiz_attempt.quiz_title}</strong></div>
                <div>Submitted Score: <strong class="text-cyan-400">${data.quiz_attempt.score} / ${data.quiz_attempt.total_questions} (${data.quiz_attempt.percentage}%)</strong></div>
                <div class="text-[10px] text-slate-400">Timestamp: ${new Date(data.quiz_attempt.completed_at).toLocaleString()}</div>
              </div>
            </div>
          ` : ''}

          <div class="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
            <strong class="text-slate-300">Privacy & Transparency Notice:</strong> ${data.disclaimer}
          </div>
        `;
      }

      if (modal) modal.classList.remove("hidden");
    } catch (e) {
      this.showToast("Failed to load evidence", "error");
    }
  }

  closeEvidenceModal() {
    const modal = document.getElementById("evidenceModal");
    if (modal) modal.classList.add("hidden");
  }

  executeRecAction(route) {
    if (route.startsWith("lesson-")) {
      this.currentLessonId = parseInt(route.replace("lesson-", ""));
      this.navigate("lesson");
    } else if (route === "neuro") {
      this.navigate("neuro");
    } else {
      this.navigate("courses");
    }
  }

  // =========================================================================
  // VIEW: STUDENT WELLBEING & FAMILY SUPPORT (SHARING CONTROLS)
  // =========================================================================
  async loadWellbeingCheckins() {
    try {
      const res = await fetch("/api/wellbeing/checkins", { headers: { Authorization: `Bearer ${this.token}` } });
      const checkins = await res.json();
      const container = document.getElementById("studentWellbeingCheckinsList");
      if (container && Array.isArray(checkins)) {
        if (checkins.length === 0) {
          container.innerHTML = `<div class="text-slate-400 text-xs py-4">No check-ins recorded yet. Fill out the voluntary form above!</div>`;
          return;
        }

        container.innerHTML = checkins.map(c => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm">${c.status_mood}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.is_shared_with_guardian ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                  ${c.is_shared_with_guardian ? 'Shared with Guardian (' + (c.guardian_name || 'Eleanor Rivera') + ')' : 'Private (Student Only)'}
                </span>
              </div>
              <p class="text-slate-300 italic">"${c.notes || 'No private notes attached'}"</p>
              <div class="text-[10px] text-slate-400">Recorded: ${new Date(c.created_at).toLocaleString()}</div>
            </div>

            <div class="shrink-0 flex items-center gap-2">
              ${c.is_shared_with_guardian ? `
                <button onclick="app.revokeCheckinSharing(${c.id})" class="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs">
                  Revoke Sharing
                </button>
              ` : `
                <button onclick="app.shareCheckinWithGuardian(${c.id})" class="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-xs">
                  Share with Guardian
                </button>
              `}
            </div>
          </div>
        `).join("");
      }
    } catch (e) {
      console.error("Wellbeing checkins load error:", e);
    }
  }

  selectMood(mood) {
    this.selectedMood = mood;
    document.querySelectorAll(".mood-btn").forEach(btn => {
      if (btn.textContent.includes(mood)) {
        btn.classList.add("bg-cyan-950", "border-cyan-500", "text-cyan-300");
      } else {
        btn.classList.remove("bg-cyan-950", "border-cyan-500", "text-cyan-300");
      }
    });
  }

  async submitWellbeingCheckin() {
    try {
      const notes = document.getElementById("wellbeingNotesInput").value.trim();
      const share = document.getElementById("wellbeingShareGuardianCheck").checked;
      const conv = document.getElementById("wellbeingRequestConvCheck").checked;

      const res = await fetch("/api/wellbeing/checkins", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          status_mood: this.selectedMood,
          notes: notes,
          is_shared_with_guardian: share,
          request_conversation: conv
        })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || "Check-in saved!");
        document.getElementById("wellbeingNotesInput").value = "";
        this.loadWellbeingCheckins();
      }
    } catch (e) {
      this.showToast("Failed to save check-in: " + e.message, "error");
    }
  }

  async shareCheckinWithGuardian(checkinId) {
    try {
      const res = await fetch(`/api/wellbeing/checkins/${checkinId}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.showToast(data.message || "Shared with guardian!");
      this.loadWellbeingCheckins();
    } catch (e) {
      this.showToast("Failed to share", "error");
    }
  }

  async revokeCheckinSharing(checkinId) {
    try {
      const res = await fetch(`/api/wellbeing/checkins/${checkinId}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.showToast(data.message || "Sharing revoked. Access removed!");
      this.loadWellbeingCheckins();
    } catch (e) {
      this.showToast("Failed to revoke", "error");
    }
  }

  // =========================================================================
  // VIEW: PARENT / GUARDIAN PORTAL
  // =========================================================================
  async loadParentPortalData() {
    try {
      const res = await fetch("/api/parent/student-summary", { headers: { Authorization: `Bearer ${this.token}` } });
      const data = await res.json();

      if (!data.authorized) {
        this.showToast(data.message || "Unauthorized guardian account", "error");
        return;
      }

      // Academic summaries
      const acadContainer = document.getElementById("parentAcademicSummaryList");
      if (acadContainer && Array.isArray(data.academic_summary)) {
        acadContainer.innerHTML = data.academic_summary.map(a => `
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${a.topic}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">${a.code}</span>
            </div>
            <div class="text-2xl font-black ${a.mastery_pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}">${a.mastery_pct}%</div>
            <div class="text-slate-400 text-[11px]">${a.questions_correct}/${a.questions_attempted} verified answers</div>
          </div>
        `).join("");
      }

      // Shared wellbeing check-ins
      const wellContainer = document.getElementById("parentSharedWellbeingList");
      if (wellContainer) {
        if (!data.shared_wellbeing_checkins || data.shared_wellbeing_checkins.length === 0) {
          wellContainer.innerHTML = `
            <div class="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
              <div class="font-semibold text-slate-300">No shared wellbeing records currently authorized.</div>
              <div>The student has not authorized any check-in for guardian view, or previous sharing was revoked.</div>
            </div>
          `;
        } else {
          wellContainer.innerHTML = data.shared_wellbeing_checkins.map(c => `
            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-sm flex items-center gap-2">
                  <span>${c.status_mood}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Explicitly Shared</span>
                </span>
                <span class="text-slate-400 text-[10px]">Shared: ${new Date(c.shared_at).toLocaleDateString()}</span>
              </div>
              <p class="text-slate-300 italic">"${c.notes}"</p>
            </div>
          `).join("");
        }
      }

    } catch (e) {
      console.error("Parent portal load error:", e);
    }
  }

  // =========================================================================
  // VIEW: FACULTY ANALYTICS
  // =========================================================================
  async loadFacultyAnalytics() {
    try {
      const res = await fetch("/api/faculty/analytics", { headers: { Authorization: `Bearer ${this.token}` } });
      const data = await res.json();

      const concContainer = document.getElementById("facultyTroublesomeConcepts");
      if (concContainer && Array.isArray(data.frequently_missed_concepts)) {
        concContainer.innerHTML = data.frequently_missed_concepts.map(c => `
          <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="font-bold text-slate-200">${c.concept}</div>
              <div class="text-slate-400 text-[11px] mt-0.5">${c.recommended_action}</div>
            </div>
            <div class="shrink-0 font-bold text-rose-400 text-sm">
              ${c.error_rate} Miss Rate
            </div>
          </div>
        `).join("");
      }

    } catch (e) {
      console.error("Faculty analytics load error:", e);
    }
  }

  // =========================================================================
  // VIEW: PRIVACY & CONSENT CENTER
  // =========================================================================
  async loadPrivacySettings() {
    try {
      const logsRes = await fetch("/api/privacy/audit-logs", { headers: { Authorization: `Bearer ${this.token}` } });
      const logs = await logsRes.json();
      const container = document.getElementById("privacyAuditLogsList");
      if (container && Array.isArray(logs)) {
        container.innerHTML = logs.map(l => `
          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span class="font-bold text-cyan-400">${l.action}</span>
              <span class="text-slate-300 mx-1">•</span>
              <span class="text-slate-400">${l.details}</span>
            </div>
            <span class="text-slate-400 text-[10px] shrink-0">${new Date(l.created_at).toLocaleTimeString()}</span>
          </div>
        `).join("");
      }
    } catch (e) {
      console.error("Privacy logs error:", e);
    }
  }

  async updateConsent(type, val) {
    try {
      const res = await fetch("/api/privacy/consents/update", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ consent_type: type, granted: val })
      });
      const data = await res.json();
      this.showToast(data.message || "Consent updated!");
      this.loadPrivacySettings();
    } catch (e) {
      this.showToast("Failed to update consent", "error");
    }
  }

  async withdrawAllConsents() {
    if (!confirm("Are you sure you want to withdraw all consents and purge cached EEG data?")) return;
    try {
      const res = await fetch("/api/privacy/consents/withdraw-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.showToast(data.message || "Consents withdrawn!");
      this.loadPrivacySettings();
    } catch (e) {
      this.showToast("Failed to withdraw consents", "error");
    }
  }

  // =========================================================================
  // VIEW: PRESERVED CAMPUS Q&A
  // =========================================================================
  async loadCampusQA() {
    try {
      const qRes = await fetch("/api/questions", { headers: { Authorization: `Bearer ${this.token}` } });
      const questions = await qRes.json();
      const qList = document.getElementById("qaQuestionsList");
      if (qList && Array.isArray(questions)) {
        qList.innerHTML = questions.map(q => `
          <div class="glass-panel p-5 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="px-2 py-0.5 rounded font-bold" style="background: ${q.category_color}20; color: ${q.category_color}">
                ${q.category_name}
              </span>
              <span class="text-slate-400">Asked by ${q.author_name}</span>
            </div>
            <h3 class="font-bold text-white text-base">${q.title}</h3>
            <p class="text-slate-300 text-xs line-clamp-2">${q.body}</p>
            <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div class="flex items-center gap-4">
                <span>${q.votes_count} Votes</span>
                <span>${q.answers_count} Answers</span>
              </div>
              <button onclick="app.showToast('Thread viewed')" class="text-cyan-400 hover:underline font-semibold">
                View Discussion &rarr;
              </button>
            </div>
          </div>
        `).join("");
      }

      // Mentors
      const mRes = await fetch("/api/mentors", { headers: { Authorization: `Bearer ${this.token}` } });
      const mentors = await mRes.json();
      const mList = document.getElementById("qaMentorsList");
      if (mList && Array.isArray(mentors)) {
        mList.innerHTML = mentors.map(m => `
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
            <div class="flex items-center justify-between font-bold text-white">
              <span>${m.name}</span>
              <span class="text-amber-400">★ ${m.rating}</span>
            </div>
            <div class="text-[11px] text-slate-400">${m.specialties}</div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-emerald-400">${m.availability}</span>
              <button onclick="app.showToast('Mentoring request sent to ' + '${m.name}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold">
                Request Chat
              </button>
            </div>
          </div>
        `).join("");
      }

    } catch (e) {
      console.error("Campus QA load error:", e);
    }
  }

  // =========================================================================
  // HARDWARE SETUP MODAL
  // =========================================================================
  async openHardwareModal() {
    try {
      const res = await fetch("/api/eeg/hardware/status");
      const data = await res.json();
      const modal = document.getElementById("hardwareModal");
      const body = document.getElementById("hardwareModalBody");

      if (body) {
        body.innerHTML = `
          <div class="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 space-y-1">
            <div class="font-bold text-white text-sm">${data.config.device_name}</div>
            <div class="text-cyan-400 text-[11px] font-semibold">${data.label}</div>
          </div>

          <div class="space-y-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <div class="flex justify-between"><span>Connection Interface:</span><strong class="text-white">${data.port}</strong></div>
            <div class="flex justify-between"><span>Baud Rate:</span><strong class="text-white">${data.baudrate} bps</strong></div>
            <div class="flex justify-between"><span>Sampling Rate:</span><strong class="text-white">${data.config.sampling_rate_hz} Hz</strong></div>
            <div class="flex justify-between"><span>Channels Supported:</span><strong class="text-cyan-400">${data.config.channels.join(", ")}</strong></div>
            <div class="flex justify-between"><span>Mains Notch Filter:</span><strong class="text-white">${data.config.mains_notch_freq_hz} Hz</strong></div>
            <div class="flex justify-between"><span>Bandpass Limits:</span><strong class="text-white">${data.config.bandpass_low_hz} - ${data.config.bandpass_high_hz} Hz</strong></div>
            <div class="flex justify-between"><span>Packet Drop Ratio:</span><strong class="text-emerald-400">${data.packet_drop_rate}%</strong></div>
          </div>

          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong class="text-slate-200">Microcontroller Bridge Ready:</strong>
            Connect BioAmp EXG Pill analog OUT to ESP32 ADC pin 34 (GPIO34). Flash the standard 250Hz serial stream sketch to stream live biopotentials.
          </div>
        `;
      }

      if (modal) modal.classList.remove("hidden");
    } catch (e) {
      this.showToast("Failed to load hardware status", "error");
    }
  }

  closeHardwareModal() {
    const modal = document.getElementById("hardwareModal");
    if (modal) modal.classList.add("hidden");
  }

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================
  renderSimpleMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-white mt-4 mb-1">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-cyan-400 mt-5 mb-2">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-white mt-6 mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-slate-100">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/```java([\s\S]*?)```/gim, '<pre class="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-xs overflow-x-auto my-3"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">$1</code>')
      .replace(/\n\n/gim, '<p class="mb-3">')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
    return html;
  }

  showToast(message, type = "info") {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2";
      document.body.appendChild(toast);
    }

    if (type === "error") {
      toast.className = "fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 bg-rose-950 text-rose-200 border border-rose-800 flex items-center gap-2";
    } else {
      toast.className = "fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 bg-cyan-950 text-cyan-200 border border-cyan-800 flex items-center gap-2";
    }

    toast.textContent = message;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";

    setTimeout(() => {
      toast.style.transform = "translateY(10px)";
      toast.style.opacity = "0";
    }, 3500);
  }
}

// Global Application Instance
const app = new NeuronexusApp();
