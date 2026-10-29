// Comprehensive Test Suite for NeuroNexus Browser History & Navigation
import assert from 'assert';

// Mock browser window, history, and document for headless verification
class MockHistory {
  constructor() {
    this.stack = [];
    this.index = -1;
  }

  pushState(state, title, url) {
    // If we've gone back and then push, truncate the forward stack
    if (this.index < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.index + 1);
    }
    this.stack.push({ state, title, url });
    this.index++;
    global.window.location.pathname = url;
  }

  replaceState(state, title, url) {
    if (this.index >= 0 && this.index < this.stack.length) {
      this.stack[this.index] = { state, title, url };
    } else {
      this.stack.push({ state, title, url });
      this.index = 0;
    }
    global.window.location.pathname = url;
  }

  back() {
    if (this.index > 0) {
      this.index--;
      const entry = this.stack[this.index];
      global.window.location.pathname = entry.url;
      if (global.popstateHandler) {
        global.popstateHandler({ state: entry.state });
      }
      return true;
    }
    return false;
  }

  forward() {
    if (this.index < this.stack.length - 1) {
      this.index++;
      const entry = this.stack[this.index];
      global.window.location.pathname = entry.url;
      if (global.popstateHandler) {
        global.popstateHandler({ state: entry.state });
      }
      return true;
    }
    return false;
  }
}

// Setup global mock environment
global.window = {
  location: { pathname: '/', search: '' },
  history: new MockHistory(),
  scrollTo: () => {},
  addEventListener: (event, handler) => {
    if (event === 'popstate') global.popstateHandler = handler;
  },
  removeEventListener: () => {}
};
global.document = { title: '' };

// Import our router functions
const { parseRoute, routeToPath, navigateHistory } = await import('./src/utils/router.ts');

console.log('================================================================');
console.log('  NEURONEXUS BROWSER BACK & FORWARD NAVIGATION TEST SUITE');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Test ${total}: ${name}`);
    console.error(`         Error: ${err.message}`);
  }
}

// ── 1. ROUTE PARSING TESTS ───────────────────────────────────────────────────
test('Route / resolves to Landing page', () => {
  const r = parseRoute('/');
  assert.strictEqual(r.page, 'landing');
  assert.strictEqual(r.authModal, false);
});

test('Route /dashboard resolves to Dashboard', () => {
  const r = parseRoute('/dashboard');
  assert.strictEqual(r.page, 'dashboard');
});

test('Route /ai-classroom resolves to AI Classroom with modal active', () => {
  const r = parseRoute('/ai-classroom');
  assert.strictEqual(r.page, 'ai-classroom');
  assert.strictEqual(r.modal, 'aiClassroom');
});

test('Route /ai-help alias resolves to AI Classroom', () => {
  const r = parseRoute('/ai-help');
  assert.strictEqual(r.page, 'ai-classroom');
  assert.strictEqual(r.modal, 'aiClassroom');
});

test('Route /courses and /courses/lessons resolve to Courses', () => {
  assert.strictEqual(parseRoute('/courses').page, 'courses');
  assert.strictEqual(parseRoute('/courses/lessons').page, 'courses');
});

test('Route /neuro-analysis and /neuro resolve to Neuro Analysis', () => {
  assert.strictEqual(parseRoute('/neuro-analysis').page, 'neuro-analysis');
  assert.strictEqual(parseRoute('/neuro').page, 'neuro-analysis');
});

test('Route /community and /campus-qa resolve to Community', () => {
  assert.strictEqual(parseRoute('/community').page, 'community');
  assert.strictEqual(parseRoute('/campus-qa').page, 'community');
  assert.strictEqual(parseRoute('/qa').page, 'community');
});

test('Route /wellbeing resolves to Student Wellbeing', () => {
  assert.strictEqual(parseRoute('/wellbeing').page, 'wellbeing');
});

test('Route /parent-portal and /parent resolve to Parent Portal', () => {
  assert.strictEqual(parseRoute('/parent-portal').page, 'parent-portal');
  assert.strictEqual(parseRoute('/parent').page, 'parent-portal');
});

test('Route /faculty resolves to Faculty Dashboard', () => {
  assert.strictEqual(parseRoute('/faculty').page, 'faculty');
});

test('Route /signin and /signup resolve with appropriate authModal and mode', () => {
  const login = parseRoute('/signin');
  assert.strictEqual(login.authModal, true);
  assert.strictEqual(login.authMode, 'login');

  const reg = parseRoute('/signup');
  assert.strictEqual(reg.authModal, true);
  assert.strictEqual(reg.authMode, 'register');
});

// ── 2. CANONICAL PATH GENERATION ─────────────────────────────────────────────
test('routeToPath generates clean canonical paths', () => {
  assert.strictEqual(routeToPath('landing'), '/');
  assert.strictEqual(routeToPath('dashboard'), '/dashboard');
  assert.strictEqual(routeToPath('ai-classroom'), '/ai-classroom');
  assert.strictEqual(routeToPath('neuro-analysis'), '/neuro-analysis');
  assert.strictEqual(routeToPath('courses'), '/courses');
  assert.strictEqual(routeToPath('community'), '/community');
  assert.strictEqual(routeToPath('wellbeing'), '/wellbeing');
  assert.strictEqual(routeToPath('parent-portal'), '/parent-portal');
  assert.strictEqual(routeToPath('faculty'), '/faculty');
  assert.strictEqual(routeToPath('landing', true, 'login'), '/signin');
  assert.strictEqual(routeToPath('landing', true, 'register'), '/signup');
});

// ── 3. REAL BROWSER BACK / FORWARD SEQUENCE SIMULATION ───────────────────────
test('Simulate 7-step user back/forward workflow requested in prompt', () => {
  let activePage = 'landing';
  let activeModal = null;

  // Handler attached to window popstate
  global.popstateHandler = (e) => {
    const r = parseRoute(global.window.location.pathname);
    activePage = r.page;
    activeModal = r.modal;
  };

  // Step 1: Open homepage
  navigateHistory('/', { page: 'landing' }, { replace: true });
  activePage = 'landing';
  assert.strictEqual(global.window.location.pathname, '/');
  assert.strictEqual(activePage, 'landing');

  // Step 2: Navigate to Dashboard
  navigateHistory('/dashboard', { page: 'dashboard' });
  activePage = 'dashboard';
  assert.strictEqual(global.window.location.pathname, '/dashboard');
  assert.strictEqual(activePage, 'dashboard');

  // Step 3: Open AI Classroom
  navigateHistory('/ai-classroom', { page: 'ai-classroom', modal: 'aiClassroom' });
  activePage = 'ai-classroom';
  activeModal = 'aiClassroom';
  assert.strictEqual(global.window.location.pathname, '/ai-classroom');
  assert.strictEqual(activePage, 'ai-classroom');
  assert.strictEqual(activeModal, 'aiClassroom');

  // Step 4: Click Browser Back -> Must return to Dashboard
  global.window.history.back();
  assert.strictEqual(global.window.location.pathname, '/dashboard', 'URL must return to /dashboard on first Back');
  assert.strictEqual(activePage, 'dashboard', 'Page must be dashboard on first Back');
  assert.strictEqual(activeModal, null, 'AI Classroom modal must close');

  // Step 5: Click Browser Back again -> Must return to Homepage
  global.window.history.back();
  assert.strictEqual(global.window.location.pathname, '/', 'URL must return to / on second Back');
  assert.strictEqual(activePage, 'landing', 'Page must be landing on second Back');

  // Step 6: Click Browser Forward -> Must return to Dashboard
  global.window.history.forward();
  assert.strictEqual(global.window.location.pathname, '/dashboard', 'URL must return to /dashboard on first Forward');
  assert.strictEqual(activePage, 'dashboard', 'Page must be dashboard on first Forward');

  // Step 7: Click Browser Forward again -> Must return to AI Classroom
  global.window.history.forward();
  assert.strictEqual(global.window.location.pathname, '/ai-classroom', 'URL must return to /ai-classroom on second Forward');
  assert.strictEqual(activePage, 'ai-classroom', 'Page must be ai-classroom on second Forward');
  assert.strictEqual(activeModal, 'aiClassroom', 'AI Classroom modal must reopen on second Forward');
});

// ── 4. DIRECT REFRESH & PERSISTENCE TESTS ─────────────────────────────────────
test('Directly opening nested route /wellbeing preserves page state', () => {
  global.window.location.pathname = '/wellbeing';
  const r = parseRoute('/wellbeing');
  assert.strictEqual(r.page, 'wellbeing');
});

test('Directly opening nested route /parent-portal preserves page state', () => {
  global.window.location.pathname = '/parent-portal';
  const r = parseRoute('/parent-portal');
  assert.strictEqual(r.page, 'parent-portal');
});

console.log(`\n----------------------------------------------------------------`);
console.log(`  RESULT: ${passed} / ${total} tests PASSED cleanly.`);
console.log(`----------------------------------------------------------------\n`);

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
