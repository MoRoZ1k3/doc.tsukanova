const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav-list a")];
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const sections = [...document.querySelectorAll("main section[id]")];
const currentSectionValue = document.querySelector(".header-current__value");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMenuState(isOpen) {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function setActiveSection(section) {
  const activeId = section ? `#${section.id}` : "";
  const currentTitle = section?.dataset.sectionTitle || "Главная";

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === activeId);
  });

  if (currentSectionValue) {
    currentSectionValue.textContent = currentTitle;
  }
}

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index * 0.05, 0.35)}s`);
});

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";

    if (!expanded) {
      return;
    }

    if (!event.target.closest(".site-header")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });
}

if (prefersReducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (sections.length) {
  setActiveSection(sections[0]);

  const visibility = new Map();
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      const sortedSections = [...sections].sort(
        (first, second) => (visibility.get(second) || 0) - (visibility.get(first) || 0)
      );

      const activeSection = sortedSections.find(
        (section) => (visibility.get(section) || 0) > 0
      );

      if (activeSection) {
        setActiveSection(activeSection);
      }
    },
    {
      threshold: [0.15, 0.3, 0.45, 0.6],
      rootMargin: "-20% 0px -45% 0px",
    }
  );

  sections.forEach((section) => activeObserver.observe(section));
}
