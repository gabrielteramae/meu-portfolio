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

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });
});

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

function showTab(tab, event) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + tab).classList.add("active");
    event.target.closest(".tab-btn").classList.add("active");
}


const SYSTEM_PROMPT = `Você é o assistente virtual do portfólio de Gabriel Teramae Chan. Responda sempre em português, de forma simpática, direta e profissional. Não invente informações — use apenas o que está descrito abaixo.

Sobre Gabriel Teramae Chan:
- Profissional bancário com experiência em Risco Socioambiental e Climático (SAC)
- Cursando Gestão Ambiental na USP (EACH) e Sistemas de Informação na Universidade Presbiteriana Mackenzie
- Experiência como Assistente de Risco Social, Ambiental e Climático no Banco BMG (nov 2025 - mai 2026): gestão de riscos ESG, automação de dados com Python no Azure Databricks, governança de risco de crédito
- Experiência como Estagiário na Faculdade CTA (jun-ago 2025): análise de dados, social selling, Excel, Google Sheets, CRM
- Skills técnicas: Python, SQL, Azure Databricks, Power BI, Excel avançado, HTML/CSS/JavaScript, Git, AWS
- Skills ESG: PRSAC, GRSAC, DRSAC, normas ISO, IFRS, PLD/FTP
- Inglês C1 avançado

Projetos Pessoais (todos disponíveis no GitHub - github.com/gabrielteramae):
- portfolio-status-tracker: vitrine de projetos com monitoramento de status em tempo real, feito em React, Vite e hooks personalizados para checagem de uptime
- risk-management-credit: simulador de credit scoring com modelo treinado em dataset público de crédito, formulário para simular probabilidade de inadimplência, em Python com scikit-learn e FastAPI
- esg-dashboard: dashboard ESG com dados reais de qualidade do ar, CO2 e energia renovável via APIs públicas, feito em Angular e TypeScript
- jogo-online-2d: jogo bidimensional para rodar no navegador, em JavaScript, HTML5 e CSS3
- python-calculator: calculadora em Python com Tkinter para operações matemáticas básicas
- previsao-do-tempo: aplicação web em React para consulta de previsão do tempo
- finance-dashboard: dashboard financeiro interativo em Python com Streamlit e Pandas para análise de indicadores de receita e despesas
- checklist-simples: API REST CRUD para gerenciamento de tarefas, em Java com Spring Boot
- site: página web feita para a disciplina de Fundamentos de Web
- transformador-de-arquivos: conversor e filtro de arquivos CSV, JSON ou XML direto no navegador, em C# / ASP.NET Core, hospedado na Railway
- r6career: painel de estatísticas para Rainbow Six Siege (projeto privado, em desenvolvimento)
- gabrielteramae: repositório "Sobre mim" do perfil do GitHub

Para ver a lista completa e atualizada de projetos, direcione a pessoa para github.com/gabrielteramae?tab=repositories.

Eventos: O Custo da IA - Estratégias para Escalar sem Explodir o Budget (Cubo Itaú, com a Oracle, sobre arquitetura, infraestrutura, engenharia de dados, governança e otimização de recursos para escalar IA), Itaú Carreiras 2026 (reflexões sobre carreira, cultura e mercado financeiro, e conhecimento do novo Programa de Estágio do Itaú), Semana de Produtos Itaú 2026 (IA aplicada a produtos e experiências), C6 Tech Week 2026 (arquitetura de sistemas, IA na experiência do cliente e prevenção de fraudes), LLMs eficientes: custo, contexto e arquitetura — evento no Cubo Itaú em parceria com a Microsoft, com foco em como arquitetura, gestão de contexto e model routing impactam custo e performance em soluções com LLMs
- Contato: gabrielhaogoldie@gmail.com | LinkedIn: gabriel-teramae-chan-00552a2b7 | GitHub: gabrielteramae

Responda perguntas sobre experiência, formação, skills, projetos e formas de contato. Se perguntarem algo fora desse escopo, redirecione gentilmente para os temas do portfólio. Mantenha respostas curtas e objetivas (máximo 3 parágrafos).`;

let chatHistory = [];
let chatOpen = false;

function toggleChat() {
    chatOpen = !chatOpen;
    const box = document.getElementById("chat-box");
    const iconOpen = document.getElementById("chat-icon-open");
    const iconClose = document.getElementById("chat-icon-close");
    box.classList.toggle("open", chatOpen);
    iconOpen.style.display = chatOpen ? "none" : "";
    iconClose.style.display = chatOpen ? "" : "none";
    if (chatOpen) {
        setTimeout(() => document.getElementById("chat-input").focus(), 100);
    }
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    appendMessage(text, "user");
    chatHistory.push({ role: "user", content: text });

    const typingEl = appendMessage("Digitando...", "typing");

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 1000,
                system: SYSTEM_PROMPT,
                messages: chatHistory
            })
        });

        const data = await res.json();
        const reply = data.content?.[0]?.text || data.error?.message || "Desculpe, não consegui responder agora.";
        typingEl.remove();
        appendMessage(reply, "bot");
        chatHistory.push({ role: "assistant", content: reply });
    } catch (err) {
        typingEl.remove();
        appendMessage("Erro: " + err.message, "bot");
    }
}

function appendMessage(text, type) {
    const messages = document.getElementById("chat-messages");
    const el = document.createElement("div");
    el.className = "chat-msg " + type;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
}
