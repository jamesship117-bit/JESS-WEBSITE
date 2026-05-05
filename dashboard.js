/**
 * dashboard.js — Client area dashboard only (replaces main.js on client-area.html).
 *
 * VENDORED FROM main.js — keep in sync if site-wide cursor/nav/transitions/reveal/magnetic change.
 */
(function () {
  "use strict";

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initPageEnter() {
    document.body.classList.add("page-enter");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("page-enter-active");
        document.body.classList.remove("page-enter");
      });
    });
    setTimeout(function () {
      document.body.classList.remove("page-enter-active");
    }, 500);
  }

  function initCustomCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    var root = document.querySelector(".custom-cursor");
    var dot = document.querySelector(".custom-cursor__dot");
    var ring = document.querySelector(".custom-cursor__ring");
    if (!root || !dot || !ring) {
      return;
    }
    document.body.appendChild(root);
    document.body.classList.add("has-custom-cursor");
    var vpx = window.innerWidth / 2;
    var vpy = window.innerHeight / 2;
    var mx = vpx;
    var my = vpy;
    var ringX = mx;
    var ringY = my;
    function tf(x, y) {
      return "translate3d(" + x + "px," + y + "px,0) translate(-50%, -50%)";
    }
    function syncPointerToRoot() {
      var r = root.getBoundingClientRect();
      mx = vpx - r.left;
      my = vpy - r.top;
      dot.style.transform = tf(mx, my);
    }
    function move(e) {
      vpx = e.clientX;
      vpy = e.clientY;
      syncPointerToRoot();
    }
    function tick() {
      ringX += (mx - ringX) * 0.18;
      ringY += (my - ringY) * 0.18;
      ring.style.transform = tf(ringX, ringY);
      requestAnimationFrame(tick);
    }
    syncPointerToRoot();
    ringX = mx;
    ringY = my;
    ring.style.transform = tf(ringX, ringY);
    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("scroll", syncPointerToRoot, { passive: true, capture: true });
    window.addEventListener("resize", syncPointerToRoot, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("scroll", syncPointerToRoot, { passive: true });
      window.visualViewport.addEventListener("resize", syncPointerToRoot, { passive: true });
    }
    requestAnimationFrame(tick);
  }

  function initNav() {
    var header = document.getElementById("site-header");
    if (!header) {
      return;
    }
    var toggle = document.getElementById("nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var closeBtn = document.getElementById("nav-overlay-close");
    function setOpen(open) {
      header.classList.toggle("is-open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      }
      if (overlay) {
        overlay.hidden = !open;
      }
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (toggle && overlay) {
      toggle.addEventListener("click", function () {
        setOpen(!header.classList.contains("is-open"));
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }
    header.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest(".nav-overlay__links a")) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    });
  }

  function isInternalPageLink(href) {
    if (!href || href.indexOf("#") === 0) {
      return false;
    }
    try {
      var u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) {
        return false;
      }
      return /\.html$/i.test(u.pathname) || u.pathname.endsWith("/");
    } catch (err) {
      return false;
    }
  }

  function fileName(path) {
    var seg = (path || "").split("/").filter(Boolean);
    var last = seg[seg.length - 1] || "index.html";
    if (!last || last.indexOf(".") === -1) {
      return "index.html";
    }
    return last;
  }

  function initPageTransitions() {
    document.body.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.getAttribute("target") === "_blank" || a.hasAttribute("download")) {
        return;
      }
      var href = a.getAttribute("href");
      if (!isInternalPageLink(href)) {
        return;
      }
      var url = new URL(href, window.location.href);
      if (fileName(url.pathname) === fileName(window.location.pathname)) {
        return;
      }
      e.preventDefault();
      document.body.classList.add("page-exit");
      var dest = a.href;
      setTimeout(function () {
        window.location.href = dest;
      }, 380);
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function initMagnetic() {
    var buttons = document.querySelectorAll(".btn--magnetic");
    buttons.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        var max = 12;
        x = Math.max(Math.min(x, max), -max);
        y = Math.max(Math.min(y, max), -max);
        btn.style.transform = "translate(" + x * 0.35 + "px," + y * 0.35 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Dashboard (client-area only)                                               */
  /* -------------------------------------------------------------------------- */

  var selectedNoteId = null;

  function readAllProjects() {
    try {
      var raw = localStorage.getItem(AgencyAuth.STORAGE_PROJECTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function projectsForUser(user) {
    var ids = user.projects || [];
    return readAllProjects().filter(function (p) {
      return ids.indexOf(p.id) >= 0;
    });
  }

  function persistUser(user) {
    AgencyAuth.updateUser(user.id, {
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      password: user.password,
      preferredContact: user.preferredContact,
      notes: user.notes,
      messages: user.messages,
      projects: user.projects,
    });
  }

  function migrateLegacyNotes(user) {
    var key = AgencyAuth.LEGACY_NOTES_KEY;
    try {
      var raw = localStorage.getItem(key);
      if (!raw || (user.notes && user.notes.length)) {
        return;
      }
      var old = JSON.parse(raw);
      if (!Array.isArray(old) || !old.length) {
        return;
      }
      var now = Date.now();
      user.notes = old.map(function (n) {
        return {
          id: n.id || "n_" + now + "_" + Math.random().toString(36).slice(2),
          title: n.title || "Untitled",
          content: n.body || n.content || "",
          createdAt: n.updatedAt || now,
          updatedAt: n.updatedAt || now,
        };
      });
      persistUser(user);
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function badgeClass(status) {
    var s = (status || "").toLowerCase();
    if (s.indexOf("review") >= 0) {
      return "badge badge--review";
    }
    if (s.indexOf("complete") >= 0) {
      return "badge badge--done";
    }
    if (s.indexOf("hold") >= 0) {
      return "badge";
    }
    return "badge badge--progress";
  }

  function progressWidth(status) {
    var s = (status || "").toLowerCase();
    if (s.indexOf("complete") >= 0) {
      return "100%";
    }
    if (s.indexOf("review") >= 0) {
      return "88%";
    }
    return "62%";
  }

  function renderProjects(user) {
    var grid = document.getElementById("projects-grid");
    if (!grid) {
      return;
    }
    var list = projectsForUser(user);
    if (!list.length) {
      grid.innerHTML = '<p class="section__lead" style="margin:0">No projects assigned yet.</p>';
      return;
    }
    grid.innerHTML = list
      .map(function (p) {
        var bc = badgeClass(p.status);
        return (
          '<article class="glass glass--static" style="padding:1.25rem">' +
          '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:0.75rem">' +
          '<h3 class="portfolio-item__name" style="margin:0">' +
          escapeHtml(p.name || "Project") +
          "</h3>" +
          '<span class="' +
          bc +
          '">' +
          escapeHtml(p.status || "—") +
          "</span></div>" +
          '<p style="color:var(--text-secondary);font-size:0.9rem;margin:0.35rem 0 0">Last updated: <time>' +
          escapeHtml(p.startDate || "") +
          "</time></p>" +
          '<div class="progress" aria-hidden="true"><div class="progress__bar" style="width:' +
          progressWidth(p.status) +
          '"></div></div>' +
          '<button type="button" class="btn btn--magnetic" style="margin-top:1rem">View Details</button>' +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function updateStats(user) {
    var list = projectsForUser(user);
    var active = list.filter(function (p) {
      return (p.status || "").toLowerCase().indexOf("complete") < 0;
    }).length;
    var pending = list.filter(function (p) {
      return (p.status || "").toLowerCase().indexOf("review") >= 0;
    }).length;
    var unread = (user.messages || []).filter(function (m) {
      return !m.read;
    }).length;
    var elA = document.getElementById("stat-active");
    var elP = document.getElementById("stat-pending");
    var elU = document.getElementById("stat-unread");
    if (elA) {
      elA.textContent = String(active);
    }
    if (elP) {
      elP.textContent = String(pending);
    }
    if (elU) {
      elU.textContent = String(unread);
    }
  }

  function personalizeHeader(user) {
    var t = document.getElementById("dash-welcome-title");
    if (t) {
      t.textContent = "Welcome back, " + (user.name || "Client");
    }
  }

  function renderActivity(user) {
    var ul = document.getElementById("dash-activity");
    if (!ul) {
      return;
    }
    var notes = (user.notes || []).slice().sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    var items = notes.slice(0, 5).map(function (n) {
      return (
        "<li><span>" +
        escapeHtml(n.title || "Note") +
        "</span><time>" +
        new Date(n.updatedAt || Date.now()).toLocaleString() +
        "</time></li>"
      );
    });
    if (!items.length) {
      ul.innerHTML = '<li><span>No recent activity yet.</span><time>—</time></li>';
    } else {
      ul.innerHTML = items.join("");
    }
  }

  function renderMessagesThread(user) {
    var thread = document.getElementById("chat-thread");
    if (!thread) {
      return;
    }
    thread.innerHTML = "";
    (user.messages || []).forEach(function (m) {
      var div = document.createElement("div");
      div.className =
        m.from === "agency" ? "chat-bubble chat-bubble--agency" : "chat-bubble chat-bubble--client";
      div.textContent = m.text || "";
      thread.appendChild(div);
    });
    thread.scrollTop = thread.scrollHeight;
  }

  function initTabs(activateId) {
    var tabButtons = document.querySelectorAll("[data-tab-target]");
    var panels = document.querySelectorAll("[data-tab-panel]");
    function activateTab(id) {
      tabButtons.forEach(function (b) {
        var on = b.getAttribute("data-tab-target") === id;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-tab-panel") === id;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    }
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activateTab(btn.getAttribute("data-tab-target"));
      });
    });
    activateTab(activateId || "dashboard");
    return activateTab;
  }

  function initNotes(user) {
    var notesListEl = document.getElementById("notes-list");
    var noteTitleInput = document.getElementById("note-title");
    var noteBodyInput = document.getElementById("note-body");
    var noteForm = document.getElementById("note-form");
    var noteDetail = document.getElementById("note-detail");

    function loadNotesList() {
      return user.notes || [];
    }

    function saveNotesList(list) {
      user.notes = list;
      persistUser(user);
    }

    function renderNotes() {
      if (!notesListEl) {
        return;
      }
      var list = loadNotesList();
      notesListEl.innerHTML = "";
      if (!list.length) {
        selectedNoteId = null;
        notesListEl.innerHTML = '<p class="note-editor__placeholder">No notes yet. Add one below.</p>';
        if (noteDetail) {
          noteDetail.innerHTML = '<p class="note-editor__placeholder">Select a note or create a new one.</p>';
        }
        return;
      }
      list
        .slice()
        .sort(function (a, b) {
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        })
        .forEach(function (note) {
          var row = document.createElement("div");
          row.className = "notes-list__row";
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "note-item" + (note.id === selectedNoteId ? " is-selected" : "");
          btn.setAttribute("data-note-id", note.id);
          btn.innerHTML =
            '<p class="note-item__title"></p><p class="note-item__preview"></p><p class="note-item__preview note-item__preview--meta"></p>';
          btn.querySelector(".note-item__title").textContent = note.title || "Untitled";
          var prev = btn.querySelectorAll(".note-item__preview");
          prev[0].textContent = (note.content || "").slice(0, 80);
          prev[1].textContent = new Date(note.updatedAt || note.createdAt).toLocaleString();
          btn.addEventListener("click", function () {
            selectedNoteId = note.id;
            renderNotes();
            renderDetail(note, user, saveNotesList, renderNotes);
          });
          var del = document.createElement("button");
          del.type = "button";
          del.textContent = "Delete";
          del.className = "btn btn--note-delete";
          del.setAttribute("aria-label", "Delete note");
          del.addEventListener("click", function (e) {
            e.stopPropagation();
            if (!window.confirm("Delete this note?")) {
              return;
            }
            var next = loadNotesList().filter(function (n) {
              return n.id !== note.id;
            });
            saveNotesList(next);
            if (selectedNoteId === note.id) {
              selectedNoteId = null;
            }
            renderNotes();
            if (noteDetail) {
              noteDetail.innerHTML = '<p class="note-editor__placeholder">Note deleted.</p>';
            }
          });
          row.appendChild(btn);
          row.appendChild(del);
          notesListEl.appendChild(row);
        });
      if (selectedNoteId) {
        var found = null;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === selectedNoteId) {
            found = list[i];
            break;
          }
        }
        if (found) {
          renderDetail(found, user, saveNotesList, renderNotes);
        }
      }
    }

    function renderDetail(note, userRef, saveList, rerender) {
      if (!noteDetail || !note) {
        return;
      }
      var nid = note.id;
      noteDetail.innerHTML =
        '<label class="visually-hidden" for="note-edit-title">Title</label>' +
        '<input id="note-edit-title" class="field" style="width:100%;margin-bottom:0.75rem;padding:0.75rem 1rem;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:inherit;font:inherit" value="" />' +
        '<p class="note-editor__meta" id="note-edit-meta"></p>' +
        '<label class="visually-hidden" for="note-edit-body">Body</label>' +
        '<textarea id="note-edit-body" class="note-editor__edit field" rows="6" style="width:100%;padding:0.75rem 1rem;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:inherit;font:inherit"></textarea>' +
        '<div class="note-editor__actions">' +
        '<button type="button" class="btn btn--primary btn--magnetic" id="note-save-btn">Save changes</button>' +
        "</div>";
      var titleEl = document.getElementById("note-edit-title");
      var bodyEl = document.getElementById("note-edit-body");
      var meta = document.getElementById("note-edit-meta");
      if (titleEl) {
        titleEl.value = note.title || "";
      }
      if (bodyEl) {
        bodyEl.value = note.content || "";
      }
      if (meta) {
        meta.textContent = "Updated " + new Date(note.updatedAt || note.createdAt).toLocaleString();
      }
      document.getElementById("note-save-btn").addEventListener("click", function () {
        var list = loadNotesList();
        var now = Date.now();
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === nid) {
            list[i].title = (titleEl && titleEl.value.trim()) || "Untitled";
            list[i].content = (bodyEl && bodyEl.value) || "";
            list[i].updatedAt = now;
            break;
          }
        }
        saveList(list);
        AgencyAuth.showToast("Note saved.", "success");
        rerender();
        for (var j = 0; j < list.length; j++) {
          if (list[j].id === nid) {
            renderDetail(list[j], userRef, saveList, rerender);
            break;
          }
        }
      });
    }

    if (noteForm) {
      noteForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var title = (noteTitleInput && noteTitleInput.value.trim()) || "Untitled";
        var body = (noteBodyInput && noteBodyInput.value.trim()) || "";
        var errBody = document.getElementById("note-err-body");
        if (errBody) {
          errBody.textContent = "";
        }
        if (!body) {
          if (errBody) {
            errBody.textContent = "Enter note content.";
          }
          return;
        }
        var list = loadNotesList();
        var id = "n_" + Date.now();
        var now = Date.now();
        list.push({
          id: id,
          title: title,
          content: body,
          createdAt: now,
          updatedAt: now,
        });
        saveNotesList(list);
        selectedNoteId = id;
        if (noteTitleInput) {
          noteTitleInput.value = "";
        }
        if (noteBodyInput) {
          noteBodyInput.value = "";
        }
        renderNotes();
        var last = list[list.length - 1];
        renderDetail(last, user, saveNotesList, renderNotes);
      });
    }
    renderNotes();
  }

  function initChat(user) {
    var chatForm = document.getElementById("chat-form");
    var chatInput = document.getElementById("chat-input");
    var chatThread = document.getElementById("chat-thread");
    if (!chatForm || !chatInput || !chatThread) {
      return;
    }
    renderMessagesThread(user);
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = chatInput.value.trim();
      if (!text) {
        return;
      }
      if (!user.messages) {
        user.messages = [];
      }
      user.messages.push({
        id: "m_" + Date.now(),
        from: "client",
        text: text,
        at: new Date().toISOString(),
        read: true,
      });
      persistUser(user);
      chatInput.value = "";
      renderMessagesThread(user);
    });
  }

  function initSettings(user) {
    var form = document.getElementById("settings-form");
    if (!form) {
      return;
    }
    document.getElementById("set-name").value = user.name || "";
    document.getElementById("set-email").value = user.email || "";
    document.getElementById("set-company").value = user.company || "";
    document.getElementById("set-phone").value = user.phone || "";
    var contact = document.getElementById("set-contact");
    if (contact) {
      var opts = ["Email", "Phone", "Slack / Chat"];
      var pref = user.preferredContact || "Email";
      contact.innerHTML = opts
        .map(function (o) {
          return "<option" + (o === pref ? " selected" : "") + ">" + o + "</option>";
        })
        .join("");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("set-name").value.trim();
      var company = document.getElementById("set-company").value.trim();
      var phone = document.getElementById("set-phone").value.trim();
      var pref = contact ? contact.value : "Email";
      var curPw = document.getElementById("set-current-password").value;
      var newPw = document.getElementById("set-new-password").value;
      var newPw2 = document.getElementById("set-new-password2").value;
      user.name = name || user.name;
      user.company = company;
      user.phone = phone;
      user.preferredContact = pref;
      if (newPw || newPw2 || curPw) {
        if (newPw.length < 8) {
          AgencyAuth.showToast("New password must be at least 8 characters.", "error");
          return;
        }
        if (newPw !== newPw2) {
          AgencyAuth.showToast("New passwords do not match.", "error");
          return;
        }
        AgencyAuth.hashPassword(curPw).then(function (h) {
          if (h !== user.password) {
            AgencyAuth.showToast("Current password is incorrect.", "error");
            return;
          }
          AgencyAuth.hashPassword(newPw).then(function (h2) {
            user.password = h2;
            persistUser(user);
            document.getElementById("set-current-password").value = "";
            document.getElementById("set-new-password").value = "";
            document.getElementById("set-new-password2").value = "";
            AgencyAuth.showToast("Settings updated successfully.", "success");
          });
        });
        return;
      }
      persistUser(user);
      AgencyAuth.showToast("Settings updated successfully.", "success");
    });
  }

  onReady(function () {
    var user = AgencyAuth.protectRoute();
    if (!user) {
      return;
    }
    AgencyAuth.revealAuthPendingBody();
    migrateLegacyNotes(user);
    user = AgencyAuth.getCurrentUser() || user;

    initPageEnter();
    initCustomCursor();
    initNav();
    initPageTransitions();
    initReveal();

    var hash = (window.location.hash || "").replace("#", "");
    var startTab = hash === "settings" ? "settings" : "dashboard";
    var activateTab = initTabs(startTab);

    personalizeHeader(user);
    renderProjects(user);
    updateStats(user);
    renderActivity(user);
    initNotes(user);
    initChat(user);
    initSettings(user);

    window.addEventListener("hashchange", function () {
      var h = (window.location.hash || "").replace("#", "");
      if (h === "settings") {
        activateTab("settings");
      }
    });

    initMagnetic();
  });
})();

