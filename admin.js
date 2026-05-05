/**
 * admin.js — Admin panel (localStorage). Requires auth.js + main.js for shared UI.
 */
(function () {
  "use strict";

  var modalCallback = null;

  function openModal(title, body, onConfirm) {
    var m = document.getElementById("admin-modal");
    document.getElementById("admin-modal-title").textContent = title;
    document.getElementById("admin-modal-body").textContent = body;
    modalCallback = onConfirm;
    m.hidden = false;
    m.classList.add("is-open");
  }

  function closeModal() {
    var m = document.getElementById("admin-modal");
    m.classList.remove("is-open");
    m.hidden = true;
    modalCallback = null;
  }

  function readMessages() {
    try {
      var raw = localStorage.getItem(AgencyAuth.STORAGE_MESSAGES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeMessages(list) {
    localStorage.setItem(AgencyAuth.STORAGE_MESSAGES, JSON.stringify(list));
  }

  function readProjects() {
    try {
      var raw = localStorage.getItem(AgencyAuth.STORAGE_PROJECTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeProjects(list) {
    localStorage.setItem(AgencyAuth.STORAGE_PROJECTS, JSON.stringify(list));
  }

  function readSettings() {
    try {
      var raw = localStorage.getItem(AgencyAuth.STORAGE_SETTINGS);
      return raw
        ? JSON.parse(raw)
        : {
            agencyName: "[YOUR AGENCY NAME]",
            contactEmail: "hello@[youragency].com",
            businessHours: "Mon–Fri, 9am–5pm [TIMEZONE]",
            socialLinks: "",
          };
    } catch (e) {
      return {};
    }
  }

  function writeSettings(o) {
    localStorage.setItem(AgencyAuth.STORAGE_SETTINGS, JSON.stringify(o));
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function userNameById(id) {
    var users = AgencyAuth.readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i].name || users[i].email;
      }
    }
    return "—";
  }

  function renderOverview() {
    var users = AgencyAuth.readUsers();
    var projects = readProjects();
    var messages = readMessages();
    var unread = messages.filter(function (m) {
      return !m.read;
    }).length;
    var stats = document.getElementById("admin-overview-stats");
    stats.innerHTML =
      '<article class="glass glass--static stat-card"><p class="stat-card__value">' +
      users.length +
      '</p><p class="stat-card__label">Total Users</p></article>' +
      '<article class="glass glass--static stat-card"><p class="stat-card__value">' +
      projects.filter(function (p) {
        return (p.status || "").indexOf("Complete") < 0;
      }).length +
      '</p><p class="stat-card__label">Active Projects</p></article>' +
      '<article class="glass glass--static stat-card"><p class="stat-card__value">' +
      unread +
      '</p><p class="stat-card__label">Pending Messages</p></article>' +
      '<article class="glass glass--static stat-card"><p class="stat-card__value">—</p><p class="stat-card__label">Total Revenue (placeholder)</p></article>';

    var sorted = users.slice().sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    var recent = sorted.slice(0, 5);
    var wrap = document.getElementById("admin-recent-users");
    wrap.innerHTML =
      "<table class=\"admin-table\"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>" +
      recent
        .map(function (u) {
          return (
            "<tr><td>" +
            escapeHtml(u.name) +
            "</td><td>" +
            escapeHtml(u.email) +
            "</td><td>" +
            escapeHtml(u.role) +
            "</td><td>" +
            escapeHtml((u.createdAt || "").split("T")[0]) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    var feed = document.getElementById("admin-activity-feed");
    var lines = [];
    recent.forEach(function (u) {
      lines.push({
        t: new Date(u.createdAt || 0).getTime(),
        html:
          "<span>User registered: " +
          escapeHtml(u.name || u.email) +
          "</span><time>" +
          new Date(u.createdAt || Date.now()).toLocaleString() +
          "</time>",
      });
    });
    messages.slice(-5).forEach(function (m) {
      lines.push({
        t: new Date(m.createdAt || 0).getTime(),
        html:
          "<span>Message from " +
          escapeHtml(m.name || "") +
          "</span><time>" +
          new Date(m.createdAt || Date.now()).toLocaleString() +
          "</time>",
      });
    });
    lines.sort(function (a, b) {
      return b.t - a.t;
    });
    feed.innerHTML = lines
      .slice(0, 8)
      .map(function (x) {
        return "<li>" + x.html + "</li>";
      })
      .join("");
  }

  function renderUsersTable(filter) {
    var users = AgencyAuth.readUsers();
    var q = (filter || "").toLowerCase().trim();
    if (q) {
      users = users.filter(function (u) {
        return (
          (u.name || "").toLowerCase().indexOf(q) >= 0 || (u.email || "").toLowerCase().indexOf(q) >= 0
        );
      });
    }
    var host = document.getElementById("admin-users-table");
    host.innerHTML =
      '<table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>' +
      users
        .map(function (u) {
          return (
            "<tr data-user-id=\"" +
            escapeHtml(u.id) +
            "\"><td>" +
            escapeHtml(u.name) +
            "</td><td>" +
            escapeHtml(u.email) +
            "</td><td>" +
            escapeHtml(u.company || "") +
            "</td><td>" +
            escapeHtml(u.role) +
            "</td><td>" +
            escapeHtml((u.createdAt || "").split("T")[0]) +
            '</td><td><button type="button" class="btn btn--magnetic admin-act-role" data-id="' +
            escapeHtml(u.id) +
            "\" style=\"padding:0.35rem 0.65rem;font-size:0.8rem\">Edit role</button> " +
            '<button type="button" class="btn btn--magnetic admin-act-del" data-id="' +
            escapeHtml(u.id) +
            "\" style=\"padding:0.35rem 0.65rem;font-size:0.8rem\">Delete</button></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    host.querySelectorAll(".admin-act-role").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var u = null;
        var allu = AgencyAuth.readUsers();
        for (var j = 0; j < allu.length; j++) {
          if (allu[j].id === id) {
            u = allu[j];
            break;
          }
        }
        if (!u) {
          return;
        }
        var next = u.role === "admin" ? "client" : "admin";
        openModal("Change role", "Set " + (u.email || "") + " to role: " + next + "?", function () {
          AgencyAuth.updateUser(id, { role: next });
          AgencyAuth.showToast("Role updated.", "success");
          renderUsersTable(document.getElementById("admin-user-search").value);
          renderOverview();
        });
      });
    });
    host.querySelectorAll(".admin-act-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        openModal("Delete user", "Permanently remove this user? This cannot be undone.", function () {
          var next = AgencyAuth.readUsers().filter(function (x) {
            return x.id !== id;
          });
          AgencyAuth.writeUsers(next);
          AgencyAuth.showToast("User deleted.", "info");
          renderUsersTable(document.getElementById("admin-user-search").value);
          renderOverview();
          fillProjectClientSelect();
        });
      });
    });
  }

  function fillProjectClientSelect() {
    var sel = document.getElementById("ap-client");
    if (!sel) {
      return;
    }
    sel.innerHTML = AgencyAuth.readUsers()
      .filter(function (u) {
        return u.role === "client";
      })
      .map(function (u) {
        return '<option value="' + escapeHtml(u.id) + '">' + escapeHtml(u.name || u.email) + "</option>";
      })
      .join("");
  }

  function renderProjectsTable() {
    var list = readProjects();
    var host = document.getElementById("admin-projects-table");
    host.innerHTML =
      '<table class="admin-table"><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Start</th><th>Actions</th></tr></thead><tbody>' +
      list
        .map(function (p) {
          return (
            "<tr><td>" +
            escapeHtml(p.name) +
            "</td><td>" +
            escapeHtml(userNameById(p.clientId)) +
            "</td><td>" +
            escapeHtml(p.status) +
            "</td><td>" +
            escapeHtml(p.startDate || "") +
            '</td><td><button type="button" class="admin-proj-del btn btn--magnetic" data-id="' +
            escapeHtml(p.id) +
            "\" style=\"padding:0.35rem 0.65rem;font-size:0.8rem\">Delete</button></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
    host.querySelectorAll(".admin-proj-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        openModal("Delete project", "Remove this project record?", function () {
          writeProjects(
            readProjects().filter(function (p) {
              return p.id !== id;
            })
          );
          AgencyAuth.showToast("Project removed.", "info");
          renderProjectsTable();
          renderOverview();
        });
      });
    });
  }

  function renderMessagesList() {
    var list = readMessages().slice().sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    var host = document.getElementById("admin-messages-list");
    if (!list.length) {
      host.innerHTML = '<p class="section__lead">No messages yet.</p>';
      return;
    }
    host.innerHTML = list
      .map(function (m) {
        var mid = m.id || "msg_unknown";
        var expId = "msg-exp-" + mid.replace(/[^a-z0-9_-]/gi, "");
        return (
          '<article class="glass glass--static" style="padding:1rem;margin-bottom:0.75rem">' +
          '<button type="button" class="btn" style="width:100%;text-align:left;border:none;background:transparent;color:inherit;padding:0" aria-expanded="false" aria-controls="' +
          expId +
          '" data-msg-toggle="' +
          escapeHtml(expId) +
          '">' +
          "<strong>" +
          escapeHtml(m.subject || "Project inquiry") +
          "</strong><br/><span style=\"color:var(--text-secondary);font-size:0.85rem\">" +
          escapeHtml(m.name || "") +
          " · " +
          escapeHtml(m.email || "") +
          " · " +
          new Date(m.createdAt || Date.now()).toLocaleString() +
          "</span></button>" +
          '<div id="' +
          expId +
          '" hidden style="margin-top:0.75rem;font-size:0.9rem;white-space:pre-wrap">' +
          escapeHtml(m.body || m.preview || "") +
          "</div>" +
          '<div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">' +
          '<button type="button" class="btn btn--magnetic admin-msg-read" data-id="' +
          escapeHtml(mid) +
          "\">Mark read</button>" +
          '<button type="button" class="btn btn--magnetic admin-msg-del" data-id="' +
          escapeHtml(mid) +
          "\">Delete</button>" +
          "</div></article>"
        );
      })
      .join("");

    host.querySelectorAll("[data-msg-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expId = btn.getAttribute("data-msg-toggle");
        var panel = document.getElementById(expId);
        if (!panel) {
          return;
        }
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
      });
    });
    host.querySelectorAll(".admin-msg-read").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var arr = readMessages();
        arr.forEach(function (m) {
          if (m.id === id) {
            m.read = true;
          }
        });
        writeMessages(arr);
        renderMessagesList();
        renderOverview();
      });
    });
    host.querySelectorAll(".admin-msg-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        openModal("Delete message", "Remove this message?", function () {
          writeMessages(
            readMessages().filter(function (m) {
              return m.id !== id;
            })
          );
          renderMessagesList();
          renderOverview();
        });
      });
    });
  }

  function loadSettingsForm() {
    var s = readSettings();
    document.getElementById("as-name").value = s.agencyName || "";
    document.getElementById("as-email").value = s.contactEmail || "";
    document.getElementById("as-hours").value = s.businessHours || "";
    document.getElementById("as-social").value = s.socialLinks || "";
  }

  function initAdminTabs() {
    var tabs = document.querySelectorAll("[data-admin-tab]");
    var panels = document.querySelectorAll("[data-admin-panel]");
    function go(id) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-admin-tab") === id;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-admin-panel") === id;
        p.hidden = !on;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        go(t.getAttribute("data-admin-tab"));
      });
    });
    go("overview");
  }

  document.getElementById("admin-modal-cancel").addEventListener("click", closeModal);
  document.getElementById("admin-modal-confirm").addEventListener("click", function () {
    if (modalCallback) {
      modalCallback();
    }
    closeModal();
  });

  document.getElementById("admin-user-search").addEventListener("input", function () {
    renderUsersTable(this.value);
  });

  document.getElementById("admin-add-user-toggle").addEventListener("click", function () {
    var f = document.getElementById("admin-add-user-form");
    f.style.display = f.style.display === "none" ? "block" : "none";
  });

  document.getElementById("admin-create-user-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("au-name").value.trim();
    var email = document.getElementById("au-email").value.trim();
    var company = document.getElementById("au-company").value.trim();
    var role = document.getElementById("au-role").value;
    var password = document.getElementById("au-password").value;
    AgencyAuth.registerUser(name, email, password, company, "").then(function (res) {
      if (!res.success) {
        AgencyAuth.showToast(res.error, "error");
        return;
      }
      AgencyAuth.updateUser(res.user.id, { role: role });
      AgencyAuth.showToast("User created.", "success");
      document.getElementById("admin-create-user-form").reset();
      document.getElementById("admin-add-user-form").style.display = "none";
      renderUsersTable(document.getElementById("admin-user-search").value);
      fillProjectClientSelect();
      renderOverview();
    });
  });

  document.getElementById("admin-add-project-toggle").addEventListener("click", function () {
    var f = document.getElementById("admin-add-project-form");
    f.style.display = f.style.display === "none" ? "block" : "none";
    fillProjectClientSelect();
  });

  document.getElementById("admin-project-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("ap-name").value.trim();
    var clientId = document.getElementById("ap-client").value;
    var status = document.getElementById("ap-status").value;
    var list = readProjects();
    var id = "proj_" + Date.now();
    list.push({
      id: id,
      name: name,
      clientId: clientId,
      status: status,
      startDate: new Date().toISOString().split("T")[0],
    });
    writeProjects(list);
    var u = null;
    var allu2 = AgencyAuth.readUsers();
    for (var k = 0; k < allu2.length; k++) {
      if (allu2[k].id === clientId) {
        u = allu2[k];
        break;
      }
    }
    if (u) {
      var ids = u.projects || [];
      if (ids.indexOf(id) < 0) {
        ids.push(id);
      }
      AgencyAuth.updateUser(clientId, { projects: ids });
    }
    AgencyAuth.showToast("Project saved.", "success");
    document.getElementById("admin-project-form").reset();
    document.getElementById("admin-add-project-form").style.display = "none";
    renderProjectsTable();
    renderOverview();
  });

  document.getElementById("agency-settings-form").addEventListener("submit", function (e) {
    e.preventDefault();
    writeSettings({
      agencyName: document.getElementById("as-name").value.trim(),
      contactEmail: document.getElementById("as-email").value.trim(),
      businessHours: document.getElementById("as-hours").value.trim(),
      socialLinks: document.getElementById("as-social").value.trim(),
    });
    AgencyAuth.showToast("Agency settings saved.", "success");
  });

  function boot() {
    if (!AgencyAuth.adminRoute()) {
      return;
    }
    AgencyAuth.revealAuthPendingBody();
    if (!localStorage.getItem(AgencyAuth.STORAGE_SETTINGS)) {
      writeSettings(readSettings());
    }
    initAdminTabs();
    renderOverview();
    renderUsersTable("");
    fillProjectClientSelect();
    renderProjectsTable();
    renderMessagesList();
    loadSettingsForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
