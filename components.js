/**
 * components.js — Injects shared navigation and footer on every page.
 * BRAND_PLACEHOLDER: [YOUR AGENCY NAME] — search project for this comment + logo strings.
 */

(function () {
  "use strict";

  var NAV_LINKS = [
    { href: "index.html", label: "Home", id: "home" },
    { href: "portfolio.html", label: "Portfolio", id: "portfolio" },
    { href: "services.html", label: "Services", id: "services" },
    { href: "client-area.html", label: "Client Area", id: "client-area" },
    { href: "contact.html", label: "Contact", id: "contact" },
  ];

  function getCurrentPageId() {
    var body = document.body;
    return (body && body.getAttribute("data-page")) || "home";
  }

  function renderDesktopNav() {
    var current = getCurrentPageId();
    return NAV_LINKS.map(function (link) {
      var active = link.id === current ? " is-active" : "";
      var aria = link.id === current ? ' aria-current="page"' : "";
      return (
        '<a href="' +
        link.href +
        '" class="' +
        active.trim() +
        '"' +
        aria +
        ' data-nav-link>' +
        link.label +
        "</a>"
      );
    }).join("");
  }

  function renderOverlayNav() {
    var current = getCurrentPageId();
    return NAV_LINKS.map(function (link) {
      var active = link.id === current ? " is-active" : "";
      var aria = link.id === current ? ' aria-current="page"' : "";
      return (
        '<a href="' +
        link.href +
        '" class="' +
        active.trim() +
        '"' +
        aria +
        ' data-nav-link>' +
        link.label +
        "</a>"
      );
    }).join("");
  }

  /**
   * Inner markup for <header id="site-header" class="site-header"> — outer shell lives on each page.
   */
  function getHeaderInnerHtml() {
    return (
      '<div class="site-header__inner">' +
      '<a href="index.html" class="logo" aria-label="[YOUR AGENCY NAME] home">' +
      '<span class="logo__accent">[YOUR</span><span class="logo__rest"> AGENCY NAME]</span>' +
      "</a>" +
      '<nav class="nav-desktop" aria-label="Primary navigation">' +
      renderDesktopNav() +
      "</nav>" +
      '<a class="btn btn--primary nav-cta btn--magnetic" href="contact.html">Start a Project</a>' +
      '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-overlay" aria-label="Open menu">' +
      '<span class="nav-toggle__bars" aria-hidden="true">' +
      "<span></span><span></span><span></span>" +
      "</span>" +
      "</button>" +
      "</div>" +
      '<div class="nav-overlay" id="nav-overlay" role="dialog" aria-modal="true" aria-label="Mobile menu" hidden>' +
      '<button type="button" class="nav-overlay__close" id="nav-overlay-close" aria-label="Close menu">×</button>' +
      '<nav class="nav-overlay__links" aria-label="Mobile primary">' +
      renderOverlayNav() +
      "</nav>" +
      '<a class="btn btn--primary nav-overlay__cta btn--magnetic" href="contact.html">Start a Project</a>' +
      "</div>"
    );
  }

  function getFooterInnerHtml() {
    var year = new Date().getFullYear();
    return (
      '<div class="site-footer__grid">' +
      '<div class="site-footer__brand">' +
      '<a href="index.html" class="logo" aria-label="[YOUR AGENCY NAME] home">' +
      '<span class="logo__accent">[YOUR</span><span class="logo__rest"> AGENCY NAME]</span>' +
      "</a>" +
      "<p>Building the future, one site at a time.</p>" +
      "</div>" +
      "<div>" +
      "<h3>Explore</h3>" +
      "<ul>" +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="portfolio.html">Portfolio</a></li>' +
      '<li><a href="services.html">Services</a></li>' +
      '<li><a href="client-area.html">Client Area</a></li>' +
      '<li><a href="contact.html">Contact</a></li>' +
      "</ul>" +
      "</div>" +
      "<div>" +
      "<h3>Connect</h3>" +
      '<p style="margin:0 0 0.75rem;color:var(--text-secondary);font-size:0.95rem;">hello@[youragency].com</p>' +
      '<div class="social-row" role="list">' +
      '<a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram (placeholder)">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
      "</a>" +
      '<a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (placeholder)">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.05h.05c.53-1 1.84-2.05 3.78-2.05 4.05 0 4.8 2.67 4.8 6.13V24h-4v-6.7c0-1.6 0-3.65-2.22-3.65-2.22 0-2.56 1.74-2.56 3.53V24h-4V8.5z"/></svg>' +
      "</a>" +
      '<a href="https://behance.net/" target="_blank" rel="noopener noreferrer" aria-label="Behance (placeholder)">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.327 4.5h-3.01c-.224-.944-.924-1.657-2.292-1.657-1.687 0-2.813 1.118-2.813 3.13 0 2.05 1.123 3.222 2.813 3.222 1.365 0 2.19-.556 2.61-1.657H24v2.657zM6.513 10.5c.96 0 1.622.556 1.858 1.35H3.62c.26-.9.9-1.35 1.893-1.35zM3.62 14.25h4.75c-.24 1.05-1.01 1.8-2.38 1.8-1.55 0-2.55-1.05-2.37-1.8z"/></svg>' +
      "</a>" +
      '<a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub (placeholder)">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.9c.57.1.78-.25.78-.55 0-.27-.01-1.13-.01-2.05-3.19.69-3.86-1.37-3.86-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.72 1.26 3.38.96.1-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.09-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.8 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.59.23 2.77.11 3.06.75.8 1.2 1.83 1.2 3.09 0 4.43-2.69 5.4-5.26 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>' +
      "</a>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="site-footer__bottom">© ' +
      year +
      ' [YOUR AGENCY NAME]. All Rights Reserved.</div>'
    );
  }

  function inject() {
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) {
      header.innerHTML = getHeaderInnerHtml();
    }
    if (footer) {
      footer.innerHTML = getFooterInnerHtml();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
