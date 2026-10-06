// Hero 3D, modo reclutador y taller de código. Aditivo: no modifica script.js.
(() => {
    'use strict';
    const root = document.documentElement;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const full = () => root.dataset.motion !== 'reduced';

    // 1. Detalles tecnológicos: marco HUD en la foto, cinta de tecnologías y línea de tiempo que se enciende al hacer scroll.
    const ws = $('.hero-workspace');
    if (ws) ['tl', 'tr', 'bl', 'br'].forEach(c => { const s = document.createElement('span'); s.className = `hud hud-${c}`; s.setAttribute('aria-hidden', 'true'); ws.append(s); });
    const techs = [['fab fa-js', 'JavaScript'], ['fab fa-react', 'React'], ['fab fa-node-js', 'Node.js'], ['fab fa-php', 'PHP'], ['fas fa-database', 'MySQL'], ['fab fa-python', 'Python'], ['fab fa-java', 'Java'], ['fab fa-html5', 'HTML5'], ['fab fa-css3-alt', 'CSS3'], ['fab fa-angular', 'Angular'], ['fab fa-aws', 'AWS'], ['fab fa-docker', 'Docker'], ['fab fa-git-alt', 'Git'], ['fab fa-github', 'GitHub']];
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    marquee.setAttribute('aria-hidden', 'true');
    const items = techs.map(([i, n]) => `<span><i class="${i}"></i>${n}</span>`).join('');
    marquee.innerHTML = `<div class="marquee-track">${items}${items}</div>`;
    $('.stack-strip')?.after(marquee);
    const timeline = $('.timeline');
    if (timeline) {
        let tf = 0;
        const upd = () => {
            tf = 0;
            const r = timeline.getBoundingClientRect();
            timeline.style.setProperty('--tl', Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height)).toFixed(3));
            $$('.timeline-item', timeline).forEach(it => it.classList.toggle('is-reached', $('.timeline-icon', it).getBoundingClientRect().top < innerHeight * .6));
        };
        addEventListener('scroll', () => { if (!tf) tf = requestAnimationFrame(upd); }, { passive: true });
        upd();
    }

    // Rendimiento: pausa el lienzo mientras haces scroll y las animaciones que no se ven.
    let scrollTimer;
    addEventListener('scroll', () => {
        root.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => root.classList.remove('is-scrolling'), 140);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
        const off = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('is-offscreen', !en.isIntersecting)), { rootMargin: '80px' });
        [$('.hero-section'), $('.marquee')].filter(Boolean).forEach(n => off.observe(n));
    }

    // 2. Taller IDE: tres archivos con color de sintaxis, vista previa en vivo, consola y retos que se comprueban solos.
    const ide = $('#ide');
    if (!ide) return;
    const base = 'body{margin:0;background:#0d1112;color:#eef0ec;font-family:system-ui,sans-serif}';
    const gridBody = 'body {\n  margin: 0;\n  padding: 20px;\n  font-family: system-ui, sans-serif;\n  background: #0d1112;\n  color: #eef0ec;\n}\n\n';
    const retos = [
        { title: 'Dale vida al título', file: 'css', task: 'En style.css, cambia el color del h1 a #c4f568.', hint: 'Dentro de h1 { }, escribe color: #c4f568;',
          check: "getComputedStyle(document.querySelector('h1')).color==='rgb(196, 245, 104)'",
          files: { html: '<main>\n  <h1>Hola, soy desarrollador</h1>\n  <p>Cambia el color de este título.</p>\n</main>',
                   css: 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-content: center;\n  text-align: center;\n  font-family: system-ui, sans-serif;\n  background: #0d1112;\n  color: #eef0ec;\n}\n\nh1 {\n  color: white;\n  font-size: 2rem;\n}\n',
                   js: "// Este reto es solo de CSS.\nconsole.log('Listo para empezar 🚀');\n" } },
        { title: 'Haz que el botón cuente', file: 'js', task: 'En script.js, haz que cada clic en el botón sume 1 y lo muestre en #n.', hint: 'btn.addEventListener("click", () => { clics++; n.textContent = clics; });',
          check: "(()=>{const n=document.getElementById('n'),a=n.textContent;document.getElementById('btn').click();return n.textContent!==a})()",
          files: { html: '<button id="btn">Sumar</button>\n<p>Clics: <strong id="n">0</strong></p>',
                   css: 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-content: center;\n  justify-items: center;\n  gap: 14px;\n  background: #0d1112;\n  color: #eef0ec;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 12px 26px;\n  border: 0;\n  border-radius: 8px;\n  background: #c4f568;\n  color: #152006;\n  font-weight: 700;\n  cursor: pointer;\n}\n',
                   js: "let clics = 0;\nconst btn = document.getElementById('btn');\nconst n = document.getElementById('n');\n\n// TODO: al hacer clic, suma 1 y muestra el total en #n\n" } },
        { title: 'Diseño en 3 columnas', file: 'css', task: 'En style.css, haz que .grid use CSS Grid con 3 columnas iguales.', hint: 'display: grid; grid-template-columns: repeat(3, 1fr);',
          check: "getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.trim().split(/\\s+/).length===3",
          files: { html: '<section class="grid">\n  <div>HTML</div>\n  <div>CSS</div>\n  <div>JS</div>\n</section>',
                   css: gridBody + '.grid {\n  gap: 12px;\n}\n\n.grid div {\n  padding: 28px 10px;\n  border-radius: 10px;\n  background: #171b1c;\n  border: 1px solid #ffffff1f;\n  text-align: center;\n}\n',
                   js: "// Este reto es solo de CSS.\n" } }
    ];
    // Contenido didáctico de cada reto.
    Object.assign(retos[0], {
        steps: [
            { say: '¡Hola! Soy <strong>Ayvarcitoo</strong>, tu guía. En CSS cada regla tiene un <strong>selector</strong> (a quién), una <strong>propiedad</strong> (qué cambia) y un <strong>valor</strong> (cómo). Por ejemplo: <code>h1 { color: red; }</code>' },
            { say: 'Los estilos viven en <code>style.css</code>. Abre esa pestaña y busca la regla <code>h1</code>.', go: 'css' },
            { say: 'Cambia el valor <code>white</code> por <code>#c4f568</code> y mira cómo se pinta el título en la vista previa. Si prefieres, lo hago yo.', solve: true }
        ],
        solve: s => { s.css = s.css.replace('color: white;', 'color: #c4f568;'); },
        win: '¡Lo lograste! 🎉 Cambiaste una <strong>propiedad</strong>: <code>h1</code> apunta al título y <code>color</code> define cómo se ve. Así se diseña toda una web.'
    });
    Object.assign(retos[1], {
        steps: [
            { say: 'JavaScript reacciona a <strong>eventos</strong>: algo que hace la persona, como un clic. <code>addEventListener</code> "escucha" ese evento y ejecuta una función.' },
            { say: 'Abre <code>script.js</code>. Ya existen tres variables: <code>clics</code> guarda el número, <code>btn</code> es el botón y <code>n</code> es el texto que se muestra.', go: 'js' },
            { say: 'Reemplaza el comentario TODO por un <code>addEventListener</code> que haga <code>clics++</code> (suma 1) y escriba el total con <code>n.textContent = clics</code>.', solve: true }
        ],
        solve: s => { s.js = s.js.replace(/\/\/ TODO.*\n/, "btn.addEventListener('click', () => {\n  clics++;\n  n.textContent = clics;\n});\n"); },
        win: '¡Excelente! 🎉 Usaste un <strong>evento</strong>: el navegador espera el clic y ejecuta tu función. Así funcionan los botones, menús y formularios de cualquier web.'
    });
    Object.assign(retos[2], {
        steps: [
            { say: '<strong>CSS Grid</strong> divide un contenedor en filas y columnas. Se activa con <code>display: grid</code>.' },
            { say: 'Con <code>grid-template-columns: repeat(3, 1fr)</code> pides 3 columnas; <code>1fr</code> significa "una parte igual del espacio disponible".', go: 'css' },
            { say: 'Escribe esas dos líneas dentro de la regla <code>.grid</code> en <code>style.css</code>. ¿Quieres que lo haga por ti?', solve: true }
        ],
        solve: s => { s.css = s.css.replace('.grid {\n  gap: 12px;', '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;'); },
        win: '¡Perfecto! 🎉 Con <strong>CSS Grid</strong> armaste un diseño en columnas. Es la base de las páginas modernas y adaptables.'
    });
    const state = retos.map(r => ({ ...r.files }));
    const store = {
        get() { try { return JSON.parse(localStorage.getItem('portfolio.retos') || '[]'); } catch { return []; } },
        set(v) { try { localStorage.setItem('portfolio.retos', JSON.stringify(v)); } catch { /* sin guardado */ } }
    };
    const done = new Set(store.get());
    let cur = 0, file = 'html', runId = 0, timer, freeTab = false;
    const ta = $('#ideCode'), pre = $('#ideHl'), gut = $('#ideGutter'), frame = $('#ideFrame'), con = $('#ideConsole'), status = $('#ideStatus');
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const grammar = {
        html: [/(<!--[\s\S]*?-->)|(<\/?[\w-]+|\/?>)|(\s[\w-]+)(?==)|("[^"]*")/g, ['c', 'k', 'a', 's']],
        css: [/(\/\*[\s\S]*?\*\/)|(#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b)|([.#][\w-]+)|([\w-]+)(?=\s*:)|(\b\d+\.?\d*(?:px|rem|em|%|s|vh|vw|fr)?)|("[^"]*")/g, ['c', 'n', 'k', 'a', 'n', 's']],
        js: [/(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|new|true|false|null|document|window|console)\b|(\b\d+\.?\d*\b)/g, ['c', 's', 'k', 'n']]
    };
    function highlight(src, lang) {
        const [re, cls] = grammar[lang];
        let out = '', last = 0;
        src.replace(re, (m, ...g) => {
            const at = g[g.length - 2];
            const k = g.findIndex((x, i) => i < g.length - 2 && x !== undefined);
            out += esc(src.slice(last, at)) + `<span class="t-${cls[k]}">${esc(m)}</span>`;
            last = at + m.length;
            return m;
        });
        return out + esc(src.slice(last)) + '\n';
    }
    function paint() {
        pre.innerHTML = highlight(ta.value, file);
        gut.textContent = Array.from({ length: ta.value.split('\n').length }, (_, i) => i + 1).join('\n');
        const before = ta.value.slice(0, ta.selectionStart).split('\n');
        $('#ideCursor').textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}`;
    }
    function say(text, kind = '') { status.textContent = text; status.dataset.kind = kind; }
    function log(type, text) {
        const line = document.createElement('div');
        line.className = `log-${type}`;
        line.textContent = `${type === 'error' ? '✕' : '›'} ${text}`;
        con.append(line);
        while (con.children.length > 40) con.firstElementChild.remove();
        con.scrollTop = con.scrollHeight;
    }
    function run() {
        clearTimeout(timer);
        runId++;
        const s = state[cur], r = retos[cur];
        con.replaceChildren();
        say('Ejecutando…', 'run');
        const hook = `const send=(t,a)=>parent.postMessage({pg:'log',type:t,text:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')},'*');['log','warn','error'].forEach(k=>{const o=console[k];console[k]=(...a)=>{send(k,a);o.apply(console,a)}});addEventListener('error',e=>send('error',[e.message]));`;
        const test = `setTimeout(()=>{let ok=false;try{ok=!!(${r.check})}catch(e){}parent.postMessage({pg:'check',run:${runId},ok},'*')},80);`;
        frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${base}</style><style>${s.css.replace(/<\/style/gi, '<\\/style')}</style></head><body>${s.html}<script>${hook}<\/script><script>try{${s.js.replace(/<\/script/gi, '<\\/script')}\n}catch(e){console.error(e.message)}<\/script><script>${test}<\/script></body></html>`;
    }
    function burst() {
        if (!full()) return;
        const box = $('#ideBurst');
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('i');
            const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 160;
            p.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--c:${['#c4f568', '#70dce7', '#b79aff', '#ecdc76'][i % 4]}`;
            box.append(p);
            setTimeout(() => p.remove(), 1000);
        }
    }
    function renderRetos() {
        $('#ideRetos').replaceChildren(...retos.map((r, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'reto' + (i === cur ? ' is-current' : '') + (done.has(i) ? ' is-done' : '');
            b.setAttribute('aria-pressed', String(i === cur));
            b.innerHTML = `<i class="fas fa-${done.has(i) ? 'circle-check' : 'circle'}" aria-hidden="true"></i><span>${esc(r.title)}</span>`;
            b.addEventListener('click', () => { cur = i; file = r.file; load(); });
            return b;
        }));
        $('#ideProgress').style.width = `${done.size / retos.length * 100}%`;
        $('#ideCount').textContent = `${done.size} / ${retos.length} retos`;
        $('#ideFinish').hidden = done.size < retos.length;
    }
    function load(keep) {
        $('#ideTask').textContent = retos[cur].task;
        $('#ideHint').hidden = true;
        $('#ideHint').textContent = retos[cur].hint;
        $$('[data-file]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.file === file)));
        ta.value = state[cur][file];
        ta.scrollTop = 0;
        $('#ideLang').textContent = { html: 'HTML', css: 'CSS', js: 'JavaScript' }[file];
        renderRetos();
        paint();
        run();
        if (!keep) bot.reset();
    }
    ta.addEventListener('input', () => { state[cur][file] = ta.value; paint(); say('Editando…'); clearTimeout(timer); timer = setTimeout(run, 600); });
    ['keyup', 'click'].forEach(ev => ta.addEventListener(ev, paint));
    ta.addEventListener('scroll', () => { pre.scrollTop = gut.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }, { passive: true });
    ta.addEventListener('keydown', e => {
        if (e.key === 'Escape') { freeTab = true; say('Tab libera el foco. Escribe para volver a sangrar.'); return; }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
        if (e.key === 'Tab' && !e.shiftKey && !freeTab) { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); return; }
        if (e.key === 'Enter') {
            const v = ta.value, s = ta.selectionStart, ls = v.lastIndexOf('\n', s - 1) + 1;
            const indent = v.slice(ls, s).match(/^\s*/)[0] + (v[s - 1] === '{' ? '  ' : '');
            e.preventDefault();
            ta.setRangeText('\n' + indent, s, ta.selectionEnd, 'end');
            ta.dispatchEvent(new Event('input'));
        }
        if (e.key !== 'Tab' && e.key !== 'Shift') freeTab = false;
    });
    $$('[data-file]').forEach(b => b.addEventListener('click', () => { file = b.dataset.file; load(true); }));
    $('#ideRun').addEventListener('click', run);
    $('#ideReset').addEventListener('click', () => { state[cur] = { ...retos[cur].files }; load(); });
    $('#ideHintBtn').addEventListener('click', () => { $('#ideHint').hidden = !$('#ideHint').hidden; });
    $$('[data-device]').forEach(b => b.addEventListener('click', () => {
        $('#ideStage').dataset.device = b.dataset.device;
        $$('[data-device]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    addEventListener('message', e => {
        if (e.source !== frame.contentWindow || !e.data) return;
        if (e.data.pg === 'log') { log(e.data.type, e.data.text); if (e.data.type === 'error') bot.error(e.data.text); }
        if (e.data.pg === 'check' && e.data.run === runId) {
            if (e.data.ok) {
                say('✓ Reto superado', 'ok');
                if (!done.has(cur)) { done.add(cur); store.set([...done]); renderRetos(); burst(); bot.win(); }
            } else say('Todavía no. Revisa la pista si te atascas.', 'pending');
        }
    });
    // Byte: el asistente que explica cada paso.
    const botText = $('#ideBotText'), botNext = $('#ideBotNext'), botPrev = $('#ideBotPrev'), botAct = $('#ideBotAct');
    const bot = {
        i: 0, won: false, timer: 0,
        say(html) {
            clearTimeout(this.timer);
            botText.classList.add('is-typing');
            const show = () => { botText.innerHTML = html; botText.classList.remove('is-typing'); };
            if (full()) this.timer = setTimeout(show, 380); else show();
        },
        reset() {
            this.i = 0;
            this.won = done.has(cur);
            if (this.won) this.say(retos[cur].win); else this.say(retos[cur].steps[0].say);
            this.buttons();
        },
        step(d) { this.i = Math.max(0, Math.min(retos[cur].steps.length - 1, this.i + d)); this.say(retos[cur].steps[this.i].say); this.buttons(); },
        win() { this.won = true; this.say(retos[cur].win + (done.size === retos.length ? ' <strong>¡Terminaste los tres retos!</strong>' : '')); this.buttons(); },
        error(text) { if (!this.won) this.say(`Veo un error en la consola: <code>${esc(text)}</code>. Revisa que no falten llaves, paréntesis o comillas.`); },
        buttons() {
            const r = retos[cur], s = r.steps[this.i], last = cur === retos.length - 1;
            botPrev.disabled = this.won || this.i === 0;
            botAct.hidden = this.won || !(s.go || s.solve);
            botAct.textContent = s.solve ? 'Hazlo por mí' : 'Abrir archivo';
            botNext.textContent = this.won ? (last ? 'Hablemos' : 'Siguiente reto') : 'Siguiente paso';
            botNext.disabled = !this.won && this.i >= r.steps.length - 1;
        }
    };
    botPrev.addEventListener('click', () => bot.step(-1));
    botAct.addEventListener('click', () => {
        const s = retos[cur].steps[bot.i];
        if (s.solve) { retos[cur].solve(state[cur]); file = retos[cur].file; load(true); } else { file = s.go; load(true); }
    });
    botNext.addEventListener('click', () => {
        if (!bot.won) { bot.step(1); return; }
        if (cur === retos.length - 1) $('a[href="#contact"]')?.click(); else { cur++; file = retos[cur].file; load(); }
    });

    // Tour guiado con ventanas emergentes sobre cada parte del editor.
    const tourSteps = [
        ['.ide-tabs', 'Estos son los archivos del proyecto. HTML da la estructura, CSS el estilo y JavaScript el comportamiento.'],
        ['.ide-code', 'Aquí escribes. Los colores distinguen etiquetas, textos y números. Con Tab sangras y con Enter se mantiene la sangría.'],
        ['#ideRun', 'Ejecuta con este botón o con Ctrl + Enter. Además, se ejecuta solo cuando dejas de escribir.'],
        ['.ide-prev', 'Este es el resultado en vivo. Cambia entre pantalla y móvil para probar si tu diseño se adapta.'],
        ['#ideConsole', 'La consola muestra mensajes y errores. Es la mejor amiga de quien programa.'],
        ['#ideRetos', 'Estos son los retos. Se marcan solos cuando lo logras.'],
        ['.ide-bot', 'Y aquí estaré yo, explicándote cada paso. ¡Empecemos!']
    ];
    let tour = null, ti = 0;
    const tourBtn = $('#ideTourBtn');
    try { if (!localStorage.getItem('portfolio.tour')) tourBtn.classList.add('is-new'); } catch { /* sin guardado */ }
    function tourPlace() {
        if (!tour) return;
        const r = $(tourSteps[ti][0]).getBoundingClientRect(), hole = $('.tour-hole', tour), pop = $('.tour-pop', tour), pad = 8;
        Object.assign(hole.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
        const ph = pop.offsetHeight, pw = pop.offsetWidth;
        let top = r.bottom + pad + 14;
        if (top + ph > innerHeight - 10) top = r.top - pad - 14 - ph;
        pop.style.top = `${Math.min(Math.max(10, top), innerHeight - ph - 10)}px`;
        pop.style.left = `${Math.min(Math.max(10, r.left + r.width / 2 - pw / 2), innerWidth - pw - 10)}px`;
    }
    function tourShow() {
        const [sel, text] = tourSteps[ti];
        $(sel).scrollIntoView({ block: 'center', behavior: full() ? 'smooth' : 'auto' });
        $('.tour-pop p', tour).textContent = text;
        $('.tour-count', tour).textContent = `${ti + 1} / ${tourSteps.length}`;
        $('[data-tour="prev"]', tour).disabled = ti === 0;
        $('[data-tour="next"]', tour).textContent = ti === tourSteps.length - 1 ? 'Empezar' : 'Siguiente';
        setTimeout(tourPlace, full() ? 500 : 30);
        $('[data-tour="next"]', tour).focus({ preventScroll: true });
    }
    function endTour() {
        if (!tour) return;
        tour.remove(); tour = null;
        document.removeEventListener('keydown', tourKeys);
        removeEventListener('resize', tourPlace);
        tourBtn.classList.remove('is-new');
        try { localStorage.setItem('portfolio.tour', '1'); } catch { /* sin guardado */ }
        tourBtn.focus({ preventScroll: true });
    }
    function tourKeys(e) {
        if (e.key === 'Escape') endTour();
        else if (e.key === 'ArrowRight') $('[data-tour="next"]', tour).click();
        else if (e.key === 'ArrowLeft') $('[data-tour="prev"]', tour).click();
    }
    tourBtn.addEventListener('click', () => {
        if (tour) return;
        tour = document.createElement('div');
        tour.className = 'tour';
        tour.innerHTML = '<div class="tour-hole"></div><div class="tour-pop" role="dialog" aria-label="Tour guiado del taller"><p></p><div class="tour-nav"><span class="tour-count"></span><button type="button" data-tour="skip">Salir</button><button type="button" data-tour="prev">Atrás</button><button type="button" data-tour="next" class="is-primary">Siguiente</button></div></div>';
        document.body.append(tour);
        ti = 0;
        tour.addEventListener('click', e => {
            const a = e.target.closest('[data-tour]')?.dataset.tour;
            if (a === 'skip') endTour();
            else if (a === 'prev' && ti > 0) { ti--; tourShow(); }
            else if (a === 'next') { if (ti < tourSteps.length - 1) { ti++; tourShow(); } else endTour(); }
        });
        document.addEventListener('keydown', tourKeys);
        addEventListener('resize', tourPlace);
        tourShow();
    });
    load();
})();

