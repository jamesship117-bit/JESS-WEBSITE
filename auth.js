/**
 * auth.js — Frontend-only auth for [YOUR AGENCY NAME] client area.
 *
 * For production, replace localStorage with a real backend
 * (Node.js/Express + PostgreSQL, Supabase, Firebase, etc.).
 * SHA-256 without salt/pepper is not secure for real passwords; this is preview-only.
 */
(function () {
  "use strict";

  var STORAGE_USERS = "agency_users";
  var STORAGE_SESSION = "agency_session";
  var STORAGE_MESSAGES = "agency_messages";
  var STORAGE_SETTINGS = "agency_settings";
  var STORAGE_PROJECTS = "agency_projects";

  var SESSION_HOURS_DEFAULT = 24;
  var SESSION_HOURS_REMEMBER = 168;

  var LEGACY_NOTES_KEY = "[YOUR_AGENCY_NAME]_client_notes_v1";

  var SEED_ADMIN_EMAIL = "admin@agency.com";

  function bufToHex(buf) {
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      })
      .join("");
  }

  function generateToken() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var out = "";
    var arr = new Uint8Array(32);
    if (window.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (var i = 0; i < 32; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    for (var j = 0; j < 32; j++) {
      out += chars.charAt(arr[j] % chars.length);
    }
    return out;
  }

  function readUsers() {
    try {
      var raw = localStorage.getItem(STORAGE_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  function sessionExpiresAt(hours) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  async function hashPassword(password) {
    var enc = new TextEncoder();
    var buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
    return bufToHex(buf);
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_SESSION);
      if (!raw) {
        return null;
      }
      var s = JSON.parse(raw);
      if (!s || !s.userId || !s.expiresAt) {
        return null;
      }
      if (Date.now() > new Date(s.expiresAt).getTime()) {
        localStorage.removeItem(STORAGE_SESSION);
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function createSession(userId, opts) {
    opts = opts || {};
    var hours = opts.remember ? SESSION_HOURS_REMEMBER : SESSION_HOURS_DEFAULT;
    var sess = {
      userId: userId,
      token: generateToken(),
      expiresAt: sessionExpiresAt(hours),
    };
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(sess));
    return sess;
  }

  function destroySession() {
    localStorage.removeItem(STORAGE_SESSION);
  }

  function isAuthenticated() {
    return getSession() !== null;
  }

  function getCurrentUser() {
    var sess = getSession();
    if (!sess) {
      return null;
    }
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === sess.userId) {
        return users[i];
      }
    }
    return null;
  }

  function isAdmin() {
    var u = getCurrentUser();
    return !!(u && u.role === "admin");
  }

  function updateUser(userId, fields) {
    var users = readUsers();
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        Object.keys(fields || {}).forEach(function (k) {
          users[i][k] = fields[k];
        });
        found = true;
        break;
      }
    }
    if (found) {
      writeUsers(users);
    }
    return found;
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
  }

  async function registerUser() {
    return {
      success: false,
      error: "Self-registration is disabled. Contact your administrator for an account.",
    };
  }

  async function loginUser(email, password, remember) {
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email or password. Please try again." };
    }
    var hash = await hashPassword(password);
    var users = readUsers();
    var em = (email || "").trim().toLowerCase();
    for (var i = 0; i < users.length; i++) {
      if ((users[i].email || "").toLowerCase() === em && users[i].password === hash) {
        createSession(users[i].id, { remember: !!remember });
        return { success: true, user: users[i] };
      }
    }
    return { success: false, error: "Invalid email or password. Please try again." };
  }

  function logoutUser() {
    destroySession();
    window.location.href = "login.html";
  }

  function protectRoute() {
    if (!isAuthenticated()) {
      window.location.replace("login.html");
      return null;
    }
    var u = getCurrentUser();
    if (!u) {
      destroySession();
      showToast("Your account no longer exists. Please contact your administrator.", "error");
      setTimeout(function () {
        window.location.replace("login.html");
      }, 400);
      return null;
    }
    return u;
  }

  function adminRoute() {
    var u = protectRoute();
    if (!u) {
      return null;
    }
    if (u.role !== "admin") {
      window.location.replace("client-area.html");
      return null;
    }
    return u;
  }

  function redirectIfAuthenticated() {
    if (isAuthenticated()) {
      window.location.replace("client-area.html");
      return true;
    }
    return false;
  }

  function revealAuthPendingBody() {
    var u = getCurrentUser();
    if (u && u.forcePasswordChange) {
      return;
    }
    document.body.classList.remove("auth-pending");
  }

  /* -------------------------------------------------------------------------- */
  /* Toast stack (bottom-right, stackable)                                      */
  /* -------------------------------------------------------------------------- */

  function ensureToastStack() {
    var id = "agency-toast-stack";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "agency-toast-stack";
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  function showToast(message, type) {
    type = type || "info";
    var stack = ensureToastStack();
    var t = document.createElement("div");
    t.className = "agency-toast toast toast--" + type;
    t.setAttribute("role", "status");
    var inner = document.createElement("div");
    inner.className = "agency-toast__inner";
    inner.textContent = message;
    var close = document.createElement("button");
    close.type = "button";
    close.className = "agency-toast__close";
    close.setAttribute("aria-label", "Dismiss notification");
    close.textContent = "×";
    close.addEventListener("click", function () {
      t.classList.remove("is-visible");
      setTimeout(function () {
        t.remove();
      }, 300);
    });
    t.appendChild(inner);
    t.appendChild(close);
    stack.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("is-visible");
    });
    setTimeout(function () {
      if (t.parentNode) {
        t.classList.remove("is-visible");
        setTimeout(function () {
          t.remove();
        }, 400);
      }
    }, 3000);
  }

  /* -------------------------------------------------------------------------- */
  /* Seed default users                                                         */
  /* -------------------------------------------------------------------------- */

  // DEFAULT ADMIN CREDENTIALS — CHANGE IMMEDIATELY AFTER FIRST LOGIN
  // Email: admin@agency.com
  // Password: Admin1234!
  // Delete this comment block before going to production

  /* Precomputed SHA-256 (UTF-8) of "Admin1234!" — matches hashPassword() output */
  var SEED_ADMIN_HASH = "5ce41ada64f1e8ffb0acfaafa622b141438f3a5777785e7f0b830fb73e40d3d6";

  function seedIfEmpty() {
    if (readUsers().length > 0) {
      return Promise.resolve();
    }
    var now = new Date().toISOString();
    var users = [
      {
        id: "user_001",
        name: "Agency Admin",
        email: SEED_ADMIN_EMAIL.toLowerCase(),
        password: SEED_ADMIN_HASH,
        company: "[YOUR AGENCY NAME]",
        phone: "",
        role: "admin",
        forcePasswordChange: false,
        createdAt: now,
        avatar: null,
        projects: [],
        notes: [],
        messages: [],
        preferredContact: "Email",
      },
    ];
    writeUsers(users);

    if (!localStorage.getItem(STORAGE_MESSAGES)) {
      localStorage.setItem(STORAGE_MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PROJECTS)) {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify([]));
    }
  }

  window.AgencyAuth = {
    STORAGE_USERS: STORAGE_USERS,
    STORAGE_SESSION: STORAGE_SESSION,
    STORAGE_MESSAGES: STORAGE_MESSAGES,
    STORAGE_SETTINGS: STORAGE_SETTINGS,
    STORAGE_PROJECTS: STORAGE_PROJECTS,
    SESSION_HOURS_DEFAULT: SESSION_HOURS_DEFAULT,
    SESSION_HOURS_REMEMBER: SESSION_HOURS_REMEMBER,
    LEGACY_NOTES_KEY: LEGACY_NOTES_KEY,
    hashPassword: hashPassword,
    generateToken: generateToken,
    createSession: createSession,
    getSession: getSession,
    destroySession: destroySession,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    registerUser: registerUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    getCurrentUser: getCurrentUser,
    updateUser: updateUser,
    protectRoute: protectRoute,
    adminRoute: adminRoute,
    redirectIfAuthenticated: redirectIfAuthenticated,
    readUsers: readUsers,
    writeUsers: writeUsers,
    showToast: showToast,
    revealAuthPendingBody: revealAuthPendingBody,
    seedIfEmpty: seedIfEmpty,
  };

  seedIfEmpty();
})();
