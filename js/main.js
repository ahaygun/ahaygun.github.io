  // ── language toggle ──────────────────────────────────────────────
  const buttons = document.querySelectorAll(".lang-toggle button");
  const STORAGE_KEY = "cv-lang";

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-tr]").forEach(el => {
      const value = el.getAttribute("data-" + lang);
      if (value == null) return;
      if (/[<>]/.test(value)) el.innerHTML = value;
      else el.textContent = value;
    });
    buttons.forEach(b => b.classList.toggle("is-active", b.dataset.lang === lang));
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }
  buttons.forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } })();
  if (saved === "en" || saved === "tr") applyLang(saved);

  // ── scroll reveal ────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px 20% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // ── subtle pointer glow on cards ─────────────────────────────────
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
    });
  });

  // ── active section in nav ────────────────────────────────────────
  const navLinks = document.querySelectorAll(".navlinks a");
  const sections = [...document.querySelectorAll("section.block")];
  const lastId = sections[sections.length - 1].id;
  let clickedHref = null;

  function highlight(href) {
    navLinks.forEach(a => a.classList.toggle("is-active", href !== null && a.getAttribute("href") === href));
  }

  function setActiveNav() {
    // when at the very bottom, the last sections can't scroll to the top,
    // so honor the explicitly clicked link (or default to the last section)
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      highlight(clickedHref || "#" + lastId);
      return;
    }
    // otherwise: last section whose top has scrolled above the line just
    // below the sticky topbar (matches scroll-margin-top)
    let current = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= 130) current = s.id;
    }
    highlight(current !== null ? "#" + current : null);
  }

  // clicking a link is an explicit intent — reflect it immediately
  navLinks.forEach(a => a.addEventListener("click", () => {
    clickedHref = a.getAttribute("href");
    highlight(clickedHref);
  }));

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setActiveNav(); ticking = false; });
  }, { passive: true });
  setActiveNav();
