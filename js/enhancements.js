(() => {
    'use strict';
    const root = document.documentElement;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const full = () => root.dataset.motion !== 'reduced';
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    (function boot() {
        try { if (sessionStorage.getItem('portfolio.boot') || !full()) return; sessionStorage.setItem('portfolio.boot', '1'); } catch { if (!full()) return; }
        const lines = ['> iniciando jose-ayvar.dev', '> cargando stack: JavaScript · PHP · React · Node.js', '> conectando interfaz ↔ servidor ↔ datos', '> listo. Bienvenido.'];
        const el = document.createElement('div');
        el.className = 'boot';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<pre></pre><span>toca para saltar</span>';
        document.body.append(el);
        const pre = $('pre', el);
        let i = 0;
        const end = () => { if (el.classList.contains('is-done')) return; el.classList.add('is-done'); setTimeout(() => el.remove(), 500); };
        const next = () => { if (el.classList.contains('is-done')) return; if (i < lines.length) { pre.textContent += lines[i++] + '\n'; setTimeout(next, 260); } else setTimeout(end, 400); };
        el.addEventListener('click', end);
        setTimeout(end, 3200);
        next();
    })();

    const glyphs = '01<>/{}[]#$%';
    function decode(el) {
        const text = el.textContent;
        let frame = 0;
        const timer = setInterval(() => {
            frame++;
            el.textContent = [...text].map((c, k) => c === ' ' || k < frame * text.length / 16 ? c : glyphs[Math.random() * glyphs.length | 0]).join('');
            if (frame >= 16) { clearInterval(timer); el.textContent = text; }
        }, 35);
    }
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            if (full()) decode(e.target);
        }), { threshold: 0.9 });
        $$('.section-header .section-subtitle').forEach(el => io.observe(el));
    }

    const sections = [['home', 'Inicio'], ['about', 'Sobre mí'], ['experience', 'Experiencia'], ['skills', 'Stack'], ['projects', 'Proyectos'], ['playground', 'Taller'], ['education', 'Educación'], ['contact', 'Contacto']];
    const rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Secciones de la página');
    rail.innerHTML = sections.map(([id, label]) => `<a href="#${id}" data-rail="${id}"><span>${label}</span></a>`).join('');
    document.body.append(rail);
    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) $$('[data-rail]').forEach(a => a.classList.toggle('is-on', a.dataset.rail === e.target.id));
        }), { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(([id]) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }

    if (fine.matches) {
        $$('.btn, .social-icon').forEach(b => {
            b.addEventListener('pointermove', e => {
                if (!full()) return;
                const r = b.getBoundingClientRect();
                b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .25}px`;
            });
            b.addEventListener('pointerleave', () => { b.style.translate = ''; });
        });
        $$('.project-card').forEach(c => {
            c.addEventListener('pointermove', e => {
                if (!full()) return;
                const r = c.getBoundingClientRect();
                c.style.setProperty('--rx', `${(.5 - (e.clientY - r.top) / r.height) * 6}deg`);
                c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 8}deg`);
            });
            c.addEventListener('pointerleave', () => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); });
        });
    }

    const form = $('#terminalForm');
    const input = $('#terminalInput');
    const output = $('#terminalOutput');
    const extra = {
        neofetch: () => 'jose@portfolio\n──────────────\nRol:       Ingeniero de Software Jr\nStack:     JavaScript · PHP · React · Node.js\nDatos:     MySQL · PostgreSQL · MongoDB\nNube:      AWS EC2 · RDS · S3\nDocente:   Informática, Robótica y Programación\nUbicación: Lima, Perú\nEstado:    ● disponible',
        hire: () => { setTimeout(() => $('a[href="#contact"]')?.click(), 400); return 'Buena decisión. Te llevo al formulario de contacto.\nTambién puedes escribirme a joseayvar28@gmail.com'; }
    };
    function runExtra(raw) {
        const fn = extra[raw.trim().toLowerCase()];
        if (!fn) return false;
        const entry = document.createElement('div');
        entry.className = 'terminal-entry';
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = 'jose@portfolio ~ $ ';
        const p = document.createElement('p');
        p.textContent = fn();
        entry.append(prompt, document.createTextNode(raw.trim()), p);
        output.append(entry);
        output.scrollTop = output.scrollHeight;
        input.value = '';
        return true;
    }
    if (form && input && output) {
        document.addEventListener('submit', e => {
            if (e.target === form && runExtra(input.value)) { e.preventDefault(); e.stopImmediatePropagation(); }
        }, true);
        const shortcuts = $('.terminal-shortcuts');
        if (shortcuts) ['neofetch', 'hire'].forEach(name => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = name;
            b.addEventListener('click', () => runExtra(name));
            shortcuts.append(b);
        });
    }

    // Si GitHub no responde, dejo este bloque oculto.
    const gh = $('#githubLive');
    if (gh && 'fetch' in window) {
        fetch('https://api.github.com/users/AyvarAntonio/repos?sort=updated&per_page=6', { headers: { Accept: 'application/vnd.github+json' } })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(repos => {
                const list = repos.filter(r => !r.fork).slice(0, 3);
                if (!list.length) return;
                gh.innerHTML = '<div class="gh-head"><span><span class="status-dot" aria-hidden="true"></span> GITHUB EN VIVO</span><a class="text-link" href="https://github.com/AyvarAntonio" target="_blank" rel="noopener noreferrer">@AyvarAntonio</a></div><div class="gh-list">' +
                    list.map(r => `<a class="gh-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(r.name)}</strong><span>${esc(r.description || 'Repositorio público')}</span><small>${esc(r.language || 'Código')} · ★ ${r.stargazers_count}</small></a>`).join('') + '</div>';
                gh.hidden = false;
            })
            .catch(() => {});
    }
})();

// El registro para usar la página sin conexión requiere HTTPS.
(() => {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
    addEventListener('beforeinstallprompt', event => { event.preventDefault(); window.__pwaPrompt = event; });
    addEventListener('appinstalled', () => { window.__pwaPrompt = null; });
})();

(() => {
    const btn = document.getElementById('installApp');
    if (!btn) return;
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) { btn.hidden = true; return; }
    btn.addEventListener('click', async () => {
        const prompt = window.__pwaPrompt;
        if (prompt) { prompt.prompt(); await prompt.userChoice.catch(() => {}); window.__pwaPrompt = null; return; }
        const toast = document.getElementById('toastRegion');
        toast.textContent = /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'En iPhone: toca Compartir y luego "Añadir a pantalla de inicio".' : 'Abre el menú del navegador y elige "Instalar app" o "Añadir a pantalla de inicio".';
        toast.classList.add('is-visible');
        setTimeout(() => toast.classList.remove('is-visible'), 4500);
    });
})();
