window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hide');
    }, 1050);
});

document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("visible"), i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
    document.querySelectorAll(".fade").forEach(el => observer.observe(el));

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
});

// Alterna entre modo claro/escuro e salva a preferência do usuário
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

    // o <head> já aplicou o tema salvo/preferido antes do paint; só sincroniza o ícone
    updateIcon(document.documentElement.getAttribute("data-theme") || "light");

    toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateIcon(next);
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
