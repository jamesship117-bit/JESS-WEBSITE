/**
 * main.js — Cursor, nav, page transitions, scroll reveals, filters, client dashboard, contact form.
 * Depends on components.js loading first (injects header/footer before this file runs DOMContentLoaded).
 */

(function () {
  "use strict";

  var NOTES_STORAGE_KEY = "[YOUR_AGENCY_NAME]_client_notes_v1";

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Page enter transition                                                      */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Custom cursor                                                              */
  /* -------------------------------------------------------------------------- */

  function initCustomCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    var dot = document.querySelector(".custom-cursor__dot");
    var ring = document.querySelector(".custom-cursor__ring");
    if (!dot || !ring) {
      return;
    }

    document.body.classList.add("has-custom-cursor");

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var ringX = mx;
    var ringY = my;

    function move(e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    }

    function tick() {
      ringX += (mx - ringX) * 0.18;
      ringY += (my - ringY) * 0.18;
      ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
      requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", move, { passive: true });
    requestAnimationFrame(tick);
  }

  /* -------------------------------------------------------------------------- */
  /* Mobile navigation                                                          */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Internal page transitions                                                  */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Intersection Observer — fade up                                            */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Magnetic buttons                                                           */
  /* -------------------------------------------------------------------------- */

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
  /* Portfolio filters                                                          */
  /* -------------------------------------------------------------------------- */

  function initPortfolioFilters() {
    var bar = document.getElementById("portfolio-filters");
    if (!bar) {
      return;
    }
    var buttons = bar.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll("[data-category]");

    function apply(filter) {
      items.forEach(function (card) {
        var cat = (card.getAttribute("data-category") || "").toLowerCase();
        var show = filter === "all" || cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
      buttons.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-filter") === filter);
      });
    }

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) {
        return;
      }
      apply(btn.getAttribute("data-filter") || "all");
    });

    apply("all");
  }

  /* -------------------------------------------------------------------------- */
  /* Client area — tabs, notes (localStorage), settings toast                   */
  /* -------------------------------------------------------------------------- */

  function initClientArea() {
    if (document.body.getAttribute("data-page") !== "client-area") {
      return;
    }

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

    activateTab("dashboard");

    /* Notes */
    var notesListEl = document.getElementById("notes-list");
    var noteTitleInput = document.getElementById("note-title");
    var noteBodyInput = document.getElementById("note-body");
    var noteForm = document.getElementById("note-form");
    var noteDetail = document.getElementById("note-detail");
    var selectedId = null;

    function loadNotes() {
      try {
        var raw = localStorage.getItem(NOTES_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveNotes(list) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
    }

    function renderNotes() {
      var list = loadNotes();
      if (!notesListEl) {
        return;
      }
      notesListEl.innerHTML = "";
      if (!list.length) {
        selectedId = null;
        notesListEl.innerHTML =
          '<p class="note-item__preview" style="padding:0.75rem 0;">No notes yet. Add one below.</p>';
        if (noteDetail) {
          noteDetail.innerHTML = "<p>Select a note or create a new one.</p>";
        }
        return;
      }
      list
        .slice()
        .sort(function (a, b) {
          return b.updatedAt - a.updatedAt;
        })
        .forEach(function (note) {
          var row = document.createElement("div");
          row.className = "notes-list__row";

          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "note-item" + (note.id === selectedId ? " is-selected" : "");
          btn.setAttribute("data-note-id", note.id);
          btn.innerHTML =
            '<p class="note-item__title"></p><p class="note-item__preview"></p><p class="note-item__preview" style="font-size:0.75rem;margin-top:0.35rem;"></p>';
          btn.querySelector(".note-item__title").textContent = note.title || "Untitled";
          var prev = btn.querySelectorAll(".note-item__preview");
          prev[0].textContent = (note.body || "").slice(0, 80);
          prev[1].textContent = new Date(note.updatedAt).toLocaleString();
          btn.addEventListener("click", function () {
            selectedId = note.id;
            renderNotes();
            renderDetail(note);
          });

          var del = document.createElement("button");
          del.type = "button";
          del.textContent = "Delete";
          del.className = "btn btn--note-delete";
          del.setAttribute("aria-label", "Delete note");
          del.addEventListener("click", function () {
            var next = loadNotes().filter(function (n) {
              return n.id !== note.id;
            });
            saveNotes(next);
            if (selectedId === note.id) {
              selectedId = null;
            }
            renderNotes();
            if (noteDetail) {
              noteDetail.innerHTML = "<p>Note deleted.</p>";
            }
          });

          row.appendChild(btn);
          row.appendChild(del);
          notesListEl.appendChild(row);
        });

      if (selectedId) {
        var found = null;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === selectedId) {
            found = list[i];
            break;
          }
        }
        if (found) {
          renderDetail(found);
        }
      }
    }

    function renderDetail(note) {
      if (!noteDetail || !note) {
        return;
      }
      noteDetail.innerHTML =
        "<h3 style=\"margin-top:0;font-family:var(--font-display);\"></h3><p style=\"color:var(--text-secondary);font-size:0.85rem;\"></p><p style=\"white-space:pre-wrap;margin-top:1rem;\"></p>";
      noteDetail.querySelector("h3").textContent = note.title || "Untitled";
      noteDetail.querySelectorAll("p")[0].textContent = new Date(note.updatedAt).toLocaleString();
      noteDetail.querySelectorAll("p")[1].textContent = note.body || "";
    }

    if (noteForm) {
      noteForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var title = (noteTitleInput && noteTitleInput.value.trim()) || "Untitled";
        var body = (noteBodyInput && noteBodyInput.value.trim()) || "";
        if (!body) {
          return;
        }
        var list = loadNotes();
        var id = "n_" + Date.now();
        list.push({
          id: id,
          title: title,
          body: body,
          updatedAt: Date.now(),
        });
        saveNotes(list);
        selectedId = id;
        if (noteTitleInput) {
          noteTitleInput.value = "";
        }
        if (noteBodyInput) {
          noteBodyInput.value = "";
        }
        renderNotes();
        renderDetail(list[list.length - 1]);
      });
    }

    renderNotes();

    /* Chat send — UI only */
    var chatForm = document.getElementById("chat-form");
    var chatInput = document.getElementById("chat-input");
    var chatThread = document.getElementById("chat-thread");
    if (chatForm && chatInput && chatThread) {
      chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = chatInput.value.trim();
        if (!text) {
          return;
        }
        var bubble = document.createElement("div");
        bubble.className = "chat-bubble chat-bubble--client";
        bubble.textContent = text;
        chatThread.appendChild(bubble);
        chatInput.value = "";
        chatThread.scrollTop = chatThread.scrollHeight;
      });
    }

    /* Settings toast */
    var settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        showToast("Settings saved (preview).");
      });
    }
  }

  function showToast(message) {
    var existing = document.getElementById("app-toast");
    if (existing) {
      existing.remove();
    }
    var t = document.createElement("div");
    t.id = "app-toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("is-visible");
    });
    setTimeout(function () {
      t.classList.remove("is-visible");
      setTimeout(function () {
        t.remove();
      }, 400);
    }, 2600);
  }

  /* -------------------------------------------------------------------------- */
  /* Contact form                                                               */
  /* -------------------------------------------------------------------------- */

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) {
      return;
    }

    var wrap = document.getElementById("contact-form-wrap");
    var success = document.getElementById("contact-success");

    function setError(id, msg) {
      var field = document.getElementById(id);
      if (!field) {
        return;
      }
      var parent = field.closest(".field");
      var err = parent && parent.querySelector(".field__error");
      if (parent) {
        parent.classList.toggle("field--error", !!msg);
      }
      if (err) {
        err.textContent = msg || "";
      }
    }

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var desc = document.getElementById("cf-description");
      var ok = true;

      setError("cf-name", "");
      setError("cf-email", "");
      setError("cf-description", "");

      if (!name || !name.value.trim()) {
        setError("cf-name", "Please enter your full name.");
        ok = false;
      }
      if (!email || !email.value.trim() || !validateEmail(email.value.trim())) {
        setError("cf-email", "Enter a valid email address.");
        ok = false;
      }
      if (!desc || desc.value.trim().length < 20) {
        setError("cf-description", "Please write at least 20 characters about your project.");
        ok = false;
      }

      if (!ok) {
        return;
      }

      if (wrap) {
        wrap.classList.add("is-hidden");
      }
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Boot                                                                       */
  /* -------------------------------------------------------------------------- */

  onReady(function () {
    initPageEnter();
    initCustomCursor();
    initNav();
    initPageTransitions();
    initReveal();
    initMagnetic();
    initPortfolioFilters();
    initClientArea();
    initContactForm();
  });
})();
