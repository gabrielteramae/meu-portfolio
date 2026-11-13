(function () {
    const root = document.getElementById("falling-welcome");
    if (!root || document.documentElement.classList.contains("skip-splash")) return;

    const lines = [
        { words: ["Olá!"], className: "falling-line falling-line-hello" },
        { words: ["Seja", "Bem-Vindo", ":)"], className: "falling-line falling-line-msg" }
    ];

    const target = document.createElement("div");
    target.className = "falling-text-target";

    lines.forEach((line) => {
        const row = document.createElement("div");
        row.className = line.className;
        line.words.forEach((word, index) => {
            if (index > 0) row.appendChild(document.createTextNode(" "));
            const span = document.createElement("span");
            span.className = "word";
            span.textContent = word;
            row.appendChild(span);
        });
        target.appendChild(row);
    });

    root.appendChild(target);
})();
