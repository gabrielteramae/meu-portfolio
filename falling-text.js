(function () {
    const root = document.getElementById("falling-welcome");
    if (!root) return;

    const lines = [
        { words: ["Olá!"], className: "falling-line falling-line-hello" },
        { words: ["Seja", "Bem-Vindo", ":)"], className: "falling-line falling-line-msg" }
    ];
    const gravity = 0.56;
    const mouseConstraintStiffness = 0.9;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    const canvasHost = document.createElement("div");
    canvasHost.className = "falling-text-canvas";
    root.appendChild(target);
    root.appendChild(canvasHost);

    if (reduceMotion || typeof Matter === "undefined") return;

    let stopped = false;
    let engine = null;
    let raf = 0;

    function destroy() {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(raf);
        if (engine) {
            Matter.World.clear(engine.world, false);
            Matter.Engine.clear(engine);
        }
    }

    const screen = document.getElementById("loading-screen");
    if (screen) {
        const observer = new MutationObserver(() => {
            if (!screen.classList.contains("hide")) return;
            observer.disconnect();
            window.setTimeout(destroy, 700);
        });
        observer.observe(screen, { attributes: true, attributeFilter: ["class"] });
    }

    function start() {
        if (stopped) return;
        const rect = root.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width <= 0 || height <= 0) return;

        const { Engine, World, Bodies, Mouse, MouseConstraint, Body } = Matter;

        engine = Engine.create({
            positionIterations: 4,
            velocityIterations: 3
        });
        engine.world.gravity.y = gravity;

        const boundary = {
            isStatic: true,
            render: { fillStyle: "transparent" }
        };
        const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundary);
        const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundary);
        const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundary);
        const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundary);

        const wordBodies = [...target.querySelectorAll(".word")].map((elem) => {
            const box = elem.getBoundingClientRect();
            const x = box.left - rect.left + box.width / 2;
            const y = box.top - rect.top + box.height / 2;
            const body = Bodies.rectangle(x, y, Math.max(box.width, 8), Math.max(box.height, 8), {
                restitution: 0.25,
                frictionAir: 0.02,
                friction: 0.35,
                density: 0.002,
                render: { fillStyle: "transparent" }
            });
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.4, y: 0 });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.02);
            return { elem, body };
        });

        wordBodies.forEach(({ elem, body }) => {
            elem.style.position = "absolute";
            elem.style.left = body.position.x + "px";
            elem.style.top = body.position.y + "px";
            elem.style.transform = "translate(-50%, -50%)";
        });

        const mouse = Mouse.create(root);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: {
                stiffness: mouseConstraintStiffness,
                render: { visible: false }
            }
        });

        World.add(engine.world, [
            floor,
            leftWall,
            rightWall,
            ceiling,
            mouseConstraint,
            ...wordBodies.map((item) => item.body)
        ]);

        let last = performance.now();
        const sync = (now) => {
            if (stopped) return;
            const delta = Math.min(32, now - last);
            last = now;
            Engine.update(engine, delta);
            wordBodies.forEach(({ body, elem }) => {
                elem.style.left = body.position.x + "px";
                elem.style.top = body.position.y + "px";
                elem.style.transform = "translate(-50%, -50%) rotate(" + body.angle + "rad)";
            });
            raf = requestAnimationFrame(sync);
        };
        raf = requestAnimationFrame(sync);
    }

    const boot = () => requestAnimationFrame(start);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(boot);
    } else {
        boot();
    }
})();
