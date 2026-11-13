(function () {
    const screen = document.getElementById("loading-screen");
    if (!screen || document.documentElement.classList.contains("skip-splash")) return;

    const minSplashMs = 420;
    const started = performance.now();

    function hideSplash() {
        const wait = Math.max(0, minSplashMs - (performance.now() - started));
        setTimeout(() => {
            screen.classList.add("hide");
            try { sessionStorage.setItem("seen-welcome", "1"); } catch (e) {}
            screen.addEventListener("transitionend", () => screen.remove(), { once: true });
        }, wait);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") hideSplash();
    else document.addEventListener("DOMContentLoaded", hideSplash);
})();

document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                entry.target.addEventListener("transitionend", () => {
                    entry.target.style.transitionDelay = "";
                }, { once: true });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
    document.querySelectorAll(".fade").forEach((el) => {
        const siblings = el.parentElement
            ? [...el.parentElement.children].filter((node) => node.classList.contains("fade"))
            : [];
        const index = siblings.indexOf(el);
        if (index > 0) el.style.transitionDelay = Math.min(index, 5) * 40 + "ms";
        observer.observe(el);
    });

    const marquee = document.querySelector(".repo-track");
    if (marquee) {
        let inView = true;
        const marqueeWatch = new IntersectionObserver((entries) => {
            inView = entries.some((entry) => entry.isIntersecting);
            marquee.style.animationPlayState = inView ? "running" : "paused";
        });
        marqueeWatch.observe(marquee.parentElement || marquee);
        const scroller = marquee.parentElement;
        if (scroller) {
            const play = () => {
                marquee.style.animationPlayState = inView ? "running" : "paused";
            };
            scroller.addEventListener("pointerdown", () => {
                marquee.style.animationPlayState = "paused";
            }, { passive: true });
            scroller.addEventListener("pointerup", play, { passive: true });
            scroller.addEventListener("pointercancel", play, { passive: true });
        }
    }

    document.querySelectorAll(".event-thumbs img").forEach(img => {
        img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });

    document.getElementById("lightbox").addEventListener("click", function (e) {
        if (e.target === this) closeLightbox();
    });

    const resumeModalEl = document.getElementById("resume-modal");
    if (resumeModalEl) {
        resumeModalEl.addEventListener("click", function (e) {
            if (e.target === this) closeResume();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeLightbox();
            closeResume();
        }
    });

    initThemeToggle();
    initMobileMenu();
});

function initMobileMenu() {
    const toggleBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const icon = document.getElementById("menu-icon");
    if (!toggleBtn || !menu) return;

    function setOpen(open) {
        menu.classList.toggle("open", open);
        toggleBtn.setAttribute("aria-expanded", String(open));
        toggleBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        icon.className = open ? "ri-close-line" : "ri-menu-line";
    }

    toggleBtn.addEventListener("click", () => {
        setOpen(!menu.classList.contains("open"));
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1120) setOpen(false);
    });
}

function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const iconMoon = document.getElementById("theme-icon-moon");
    const iconSun = document.getElementById("theme-icon-sun");
    if (!toggleBtn) return;

    function updateIcon(theme) {
        const isDark = theme === "dark";
        iconMoon.style.display = isDark ? "none" : "";
        iconSun.style.display = isDark ? "" : "none";
        toggleBtn.title = isDark ? "Modo claro" : "Modo escuro";
    }

    updateIcon(document.documentElement.getAttribute("data-theme") || "light");

    function applyTheme(next) {
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateIcon(next);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = next === "dark" ? "#0e1015" : "#ffffff";
    }

    toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce && typeof document.startViewTransition === "function") {
            document.startViewTransition(() => applyTheme(next));
        } else {
            applyTheme(next);
        }
    });
}

function openLightbox(src, alt) {
    const lb = document.getElementById("lightbox");
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-img").alt = alt;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
}

function openResume() {
    const modal = document.getElementById("resume-modal");
    document.getElementById("resume-iframe").src = "curriculo-gabriel-teramae.pdf";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeResume() {
    document.getElementById("resume-modal").classList.remove("open");
    document.getElementById("resume-iframe").src = "";
    document.body.style.overflow = "";
}

function showTab(tab, event) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + tab).classList.add("active");
    event.target.closest(".tab-btn").classList.add("active");
}
