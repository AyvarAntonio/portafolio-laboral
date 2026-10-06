// Ayvarcitoo: asistente del portafolio. Responde al instante con datos reales y, si hay IA configurada, con IA.
(() => {
    'use strict';
    const AI_ENDPOINT = '/.netlify/functions/chat'; // función de Netlify con Gemini (vacío = solo respuestas locales)
    const root = document.documentElement;
    const $ = (s, c = document) => c.querySelector(s);
    const full = () => root.dataset.motion !== 'reduced';
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const fmt = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
    const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const has = (t, k) => k.length <= 3 ? ` ${t} `.includes(` ${k} `) : t.includes(k);

    const WA = 'https://wa.me/51946016559?text=Hola%20Jose%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20contigo.';
    const A = {
        wa: { label: 'WhatsApp', href: WA }, mail: { label: 'Correo', href: 'mailto:joseayvar28@gmail.com' },
        gh: { label: 'GitHub', href: 'https://github.com/AyvarAntonio' }, li: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-ayvar-82a980398' },
        cv: { label: 'Descargar CV', href: 'docs/CV-Jose-Ayvar.pdf', download: true },
        go: (label, id) => ({ label, go: id })
    };
    const sections = [['inicio', 'home'], ['sobre mi', 'about'], ['experiencia', 'experience'], ['stack', 'skills'], ['habilidades', 'skills'], ['proyectos', 'projects'], ['taller', 'playground'], ['editor', 'playground'], ['retos', 'playground'], ['educacion', 'education'], ['estudios', 'education'], ['contacto', 'contact']];

    // Respuestas locales: instantáneas y sin depender de ningún servicio.
    const kb = [
        { k: ['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'], a: '¡Hola! 👋 Soy <strong>Ayvarcitoo</strong>. Pregúntame lo que quieras sobre Jose, o pídeme que te lleve a una sección.' },
        { k: ['quien eres', 'que eres', 'como te llamas', 'eres un bot', 'eres una ia', 'eres humano', 'ayvarcitoo'], a: 'Soy <strong>Ayvarcitoo</strong>, el asistente virtual del portafolio de Jose. Respondo sobre su experiencia, te guío por la página y explico conceptos de programación.' },
        { k: ['quien es jose', 'sobre jose', 'presentate', 'cuentame de', 'perfil', 'sobre ti', 'quien es'], a: '<strong>Jose Ayvar</strong> es Ingeniero de Software Jr y desarrollador Full Stack en Lima, Perú. Estudia Ingeniería de Software en la UTP, es técnico titulado en Computación e Informática y combina el desarrollo web con la docencia de informática, robótica y programación.', act: [A.go('Sobre mí', 'about')] },
        { k: ['tecnolog', 'stack', 'lenguaje', 'habilidad', 'skills', 'sabe programar', 'dominas', 'domina', 'react', 'node', 'php', 'java', 'javascript', 'python', 'mysql', 'aws', 'docker', 'angular', 'tailwind', 'frameworks'], a: 'Su base es <strong>JavaScript, HTML5 y CSS3</strong>, con <strong>PHP, Node.js y Java (Spring Boot)</strong> en el backend. Usa <strong>React, Angular, Bootstrap y Tailwind</strong>; bases de datos <strong>MySQL, PostgreSQL, MongoDB y Firebase</strong>; y trabaja con <strong>AWS, Git/GitHub, Docker</strong> y CI/CD inicial.', act: [A.go('Ver stack', 'skills')] },
        { k: ['experiencia', 'trabajo', 'trabajado', 'laboral', 'empleo', 'donde trabaj', 'cargos', 'historial'], a: 'Hoy es <strong>desarrollador web freelance</strong> y <strong>docente de Computación</strong> en el Colegio San Miguel Emprendedor. Antes dio apoyo técnico en un sistema de ventas con Java (Negociaciones Cedro), fue docente de robótica, operador de BPO y digitalización en Polysistemas, docente auxiliar en la IE 7102 y vendedor en Movistar Empresas.', act: [A.go('Ver experiencia', 'experience')] },
        { k: ['docente', 'profesor', 'ensena', 'ensenar', 'clases', 'colegio', 'roblox', 'robotica', 'arduino', 'alumnos'], a: 'Enseña computación en primaria, secundaria y academia: ofimática, diseño gráfico y 3D, <strong>Roblox Studio (Luau)</strong>, algoritmos y desarrollo web. También dictó un taller de <strong>robótica con Arduino</strong>. Por eso creó el taller en vivo de esta página.', act: [A.go('Probar el taller', 'playground')] },
        { k: ['estudi', 'universidad', 'utp', 'instituto', 'carrera', 'titulo', 'educacion', 'certificad', 'curso'], a: 'Estudia <strong>Ingeniería de Software en la UTP</strong> y es <strong>Técnico en Computación e Informática</strong> titulado del IESTP Trentino Juan Pablo II. Tiene certificados de <strong>Python Basic</strong> y de un curso técnico de <strong>Java</strong> (POO, APIs y aplicaciones básicas).', act: [A.go('Ver educación', 'education')] },
        { k: ['proyecto', 'proyectos', 'trabajos hechos', 'realizado', 'demo', 'portafolio de'], a: 'Los proyectos de esta página son <strong>demostraciones conceptuales</strong> de su forma de trabajar. Su trabajo real está en GitHub. Además, desarrolló un sistema de ventas con Java, Jaspersoft y JPOS para un negocio de bebidas.', act: [A.go('Ver proyectos', 'projects'), A.gh] },
        { k: ['contact', 'escribir', 'whatsapp', 'wsp', 'correo', 'email', 'mail', 'telefono', 'numero', 'llamar', 'celular', 'hablar con'], a: 'Puedes escribirle por <strong>WhatsApp al +51 946 016 559</strong> o a <strong>joseayvar28@gmail.com</strong>.', act: [A.wa, A.mail, A.go('Formulario', 'contact')] },
        { k: ['disponible', 'contratar', 'contratarte', 'freelance', 'cotizar', 'presupuesto', 'precio', 'cobras', 'cuanto cuesta', 'tarifa', 'sitio web para', 'pagina web para'], a: 'Sí, Jose está <strong>disponible para nuevos proyectos</strong> web y sistemas a medida. El presupuesto depende de lo que necesites, así que lo mejor es contarle tu idea por WhatsApp.', act: [A.wa, A.mail] },
        { k: ['cv', 'curriculum', 'hoja de vida', 'resume'], a: 'Aquí tienes su CV en PDF 📄', act: [A.cv] },
        { k: ['donde vive', 'ubicacion', 'ubicado', 'lima', 'pachacamac', 'pais', 'remoto', 'presencial'], a: 'Jose vive en <strong>Lima, Perú</strong> (Pachacámac). Para coordinar la modalidad de trabajo, escríbele directamente.', act: [A.wa] },
        { k: ['ingles', 'idioma', 'idiomas', 'english'], a: 'Su CV indica <strong>inglés nivel básico</strong>. Español es su idioma principal.' },
        { k: ['github', 'linkedin', 'redes', 'repositorio'], a: 'Encuentras a Jose en GitHub y LinkedIn:', act: [A.gh, A.li] },
        { k: ['taller', 'retos', 'editor', 'codigo en vivo', 'como funciona el taller'], a: 'El <strong>taller en vivo</strong> es un mini editor con HTML, CSS y JavaScript, vista previa en tiempo real y 3 retos que se comprueban solos. Yo te guío paso a paso.', act: [A.go('Ir al taller', 'playground')] },
        { k: ['como esta hecho', 'hecho con', 'como lo hizo', 'tecnologias del portafolio', 'esta pagina', 'este portafolio'], a: 'Este portafolio está hecho con <strong>HTML, CSS y JavaScript puros</strong>, sin frameworks: animaciones, terminal, taller de código y yo, todo a mano. Se publica en Netlify.' },
        { k: ['instalar', 'instalo', 'app', 'aplicacion', 'descargar la pagina', 'pantalla de inicio'], a: 'Este portafolio se puede <strong>instalar como app</strong> y abrir incluso sin conexión. En Android o PC pulsa el botón; en iPhone usa <em>Compartir</em> y luego <em>Añadir a pantalla de inicio</em>.', act: [{ label: 'Instalar app', install: true }] },
        { k: ['gracias', 'genial', 'excelente', 'buenisimo', 'chevere'], a: '¡Con gusto! 😊 Si quieres, pregúntame algo más o escríbele a Jose.' },
        { k: ['chau', 'adios', 'hasta luego', 'nos vemos'], a: '¡Hasta pronto! 👋 Cuando quieras volver, aquí estaré.' },
        { k: ['chiste', 'algo gracioso'], a: '¿Por qué los programadores confunden Halloween con Navidad? Porque <code>Oct 31 == Dec 25</code> 🎃🎄' },
        { k: ['ayuda', 'que puedes hacer', 'que haces', 'comandos', 'opciones'], a: 'Puedo: 🔹 contarte sobre la <strong>experiencia y tecnologías</strong> de Jose, 🔹 <strong>llevarte</strong> a cualquier sección ("llévame a proyectos"), 🔹 cambiar el <strong>modo claro/oscuro</strong>, 🔹 explicarte conceptos de programación ("¿qué es una API?").' }
    ];
    const lessons = [
        { k: ['html'], a: '<strong>HTML</strong> es el lenguaje que da <em>estructura</em> a una página: títulos, párrafos, imágenes y botones se definen con etiquetas como <code>&lt;h1&gt;</code> o <code>&lt;p&gt;</code>.' },
        { k: ['css'], a: '<strong>CSS</strong> da <em>estilo</em> a la página: colores, tamaños, espacios y animaciones. Una regla tiene selector, propiedad y valor: <code>h1 { color: red; }</code>.' },
        { k: ['javascript', 'js'], a: '<strong>JavaScript</strong> da <em>comportamiento</em>: reacciona a clics, valida formularios y actualiza la página sin recargarla.' },
        { k: ['api'], a: 'Una <strong>API</strong> es un "mesero" entre programas: tú pides datos con una solicitud y ella te devuelve la respuesta, normalmente en formato JSON.' },
        { k: ['base de datos', 'sql', 'mysql'], a: 'Una <strong>base de datos</strong> guarda información ordenada, como tablas de usuarios o ventas. Con <strong>SQL</strong> se consulta y modifica, por ejemplo <code>SELECT * FROM clientes;</code>.' },
        { k: ['git', 'github'], a: '<strong>Git</strong> guarda el historial de cambios de tu código para poder volver atrás o trabajar en equipo. <strong>GitHub</strong> es la plataforma donde se comparten esos repositorios.' },
        { k: ['frontend', 'backend', 'full stack', 'fullstack'], a: 'El <strong>frontend</strong> es lo que ves y tocas en la web. El <strong>backend</strong> es lo que ocurre detrás: servidor, lógica y base de datos. Un desarrollador <strong>Full Stack</strong> trabaja en ambos.' },
        { k: ['responsive', 'adaptable'], a: 'Un diseño <strong>responsive</strong> se adapta a cualquier pantalla (celular, tablet o PC) usando CSS flexible como Grid, Flexbox y media queries.' },
        { k: ['variable'], a: 'Una <strong>variable</strong> es una caja con nombre donde guardas un dato: <code>let edad = 20;</code>. Luego puedes usarla o cambiarla.' },
        { k: ['funcion'], a: 'Una <strong>función</strong> es un bloque de código reutilizable con nombre: <code>function saludar() { console.log("Hola"); }</code> y se ejecuta al llamarla.' }
    ];
    const FALLBACK = { a: 'Esa pregunta se me escapa 😅. Puedo contarte sobre la <strong>experiencia, tecnologías y estudios</strong> de Jose, o llevarte a una sección. Para otra consulta, escríbele directo.', act: [A.wa] };

    // Interfaz
    const fab = document.createElement('button');
    fab.className = 'ayv-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir chat con Ayvarcitoo');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'ayvPanel');
    fab.innerHTML = '<i class="fas fa-robot" aria-hidden="true"></i><span class="ayv-dot" aria-hidden="true"></span>';
    const tip = document.createElement('div');
    tip.className = 'ayv-tip';
    tip.hidden = true;
    tip.textContent = '¡Hola! Soy Ayvarcitoo 👋 ¿Tienes dudas?';
    const panel = document.createElement('section');
    panel.className = 'ayv-panel';
    panel.id = 'ayvPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con Ayvarcitoo');
    panel.innerHTML = `<header class="ayv-head"><div class="ayv-ava" aria-hidden="true"><i class="fas fa-robot"></i></div><div><strong>Ayvarcitoo</strong><span id="ayvState"><i class="status-dot" aria-hidden="true"></i> En línea</span></div><button type="button" class="ayv-close" aria-label="Cerrar chat"><i class="fas fa-xmark" aria-hidden="true"></i></button></header>
        <div class="ayv-log" id="ayvLog" role="log" aria-live="polite"></div>
        <div class="ayv-chips" id="ayvChips"></div>
        <form class="ayv-form" id="ayvForm"><label class="visually-hidden" for="ayvInput">Escribe tu pregunta</label><input id="ayvInput" type="text" maxlength="300" placeholder="Pregúntame sobre Jose…" autocomplete="off"><button type="submit" aria-label="Enviar"><i class="fas fa-paper-plane" aria-hidden="true"></i></button></form>`;
    document.body.append(fab, tip, panel);
    const log = $('#ayvLog'), input = $('#ayvInput'), chips = $('#ayvChips');
    const hist = [];
    let ai = AI_ENDPOINT ? 'unknown' : 'off', welcomed = false, busy = false;

    function actions(list) {
        const box = document.createElement('div');
        box.className = 'ayv-acts';
        list.forEach(a => {
            const el = document.createElement(a.go || a.install ? 'button' : 'a');
            el.className = 'ayv-act';
            el.textContent = a.label;
            if (a.install) { el.type = 'button'; el.addEventListener('click', () => { if (window.__pwaPrompt) window.__pwaPrompt.prompt(); else add('bot', 'Tu navegador no muestra el botón de instalación. Abre el menú del navegador y busca <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.'); }); }
            else if (a.go) { el.type = 'button'; el.addEventListener('click', () => go(a.go)); }
            else { el.href = a.href; if (a.download) el.download = ''; else { el.target = '_blank'; el.rel = 'noopener noreferrer'; } }
            box.append(el);
        });
        return box;
    }
    function add(role, html, act) {
        const m = document.createElement('div');
        m.className = `ayv-msg ${role}`;
        const b = document.createElement('div');
        b.className = 'ayv-bubble';
        b.innerHTML = html;
        m.append(b);
        if (act?.length) m.append(actions(act));
        log.append(m);
        log.scrollTop = log.scrollHeight;
        return m;
    }
    function go(id) {
        const a = document.createElement('a');
        a.href = `#${id}`;
        document.body.append(a);
        a.click();
        a.remove();
        if (innerWidth < 768) close();
    }
    function typing() { const m = add('bot', '<span class="ayv-typing"><i></i><i></i><i></i></span>'); m.classList.add('is-typing'); return m; }
    const plain = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; };
    const wait = ms => new Promise(r => setTimeout(r, full() ? ms : 0));
    const best = (n, list) => { let top = null, score = 0; list.forEach(e => { const s = e.k.reduce((t, k) => t + (has(n, k) ? 2 + (k.includes(' ') ? 1 : 0) : 0), 0); if (s > score) { score = s; top = e; } }); return top; };

    async function askAI() {
        if (ai === 'off') return null;
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 20000);
        try {
            const r = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-8) }), signal: ctl.signal });
            if (!r.ok) throw new Error(String(r.status));
            const { reply } = await r.json();
            if (!reply) throw new Error('vacío');
            ai = 'on';
            $('#ayvState').innerHTML = '<i class="status-dot" aria-hidden="true"></i> En línea · IA activa';
            return reply;
        } catch { if (ai === 'unknown') ai = 'off'; return null; } finally { clearTimeout(t); }
    }
    async function answer(text) {
        const n = norm(text);
        const nav = /(llevame|lleva|ir a|ve a|vamos|muestrame|mostrar|abre|abrir|quiero ver|ver)\b/.test(n) && sections.find(([k]) => n.includes(k));
        if (nav) { setTimeout(() => go(nav[1]), 500); return { a: `Te llevo a <strong>${esc(nav[0])}</strong> 🚀` }; }
        const th = n.match(/\b(claro|oscuro)\b/);
        if (th && /(modo|tema|activa|pon|cambia)/.test(n)) {
            const want = th[1] === 'claro' ? 'light' : 'dark';
            if ((root.dataset.theme || 'dark') !== want) $('#themeToggle')?.click();
            return { a: `Listo, activé el modo <strong>${th[1]}</strong> ✨` };
        }
        const generic = /^(que es|que son|como (se|puedo|hago)|explica|explicame|diferencia|por que|para que sirve|cual es la diferencia)/.test(n);
        if (generic) {
            const les = best(n, lessons);
            if (les) return les;
        }
        const hit = best(n, kb);
        if (hit) return hit;
        if (ai !== 'off') { const r = await askAI(); if (r) return { ai: r }; }
        return FALLBACK;
    }
    async function send(text) {
        text = text.trim();
        if (!text || busy) return;
        busy = true;
        chips.hidden = true;
        add('user', esc(text));
        hist.push({ role: 'user', content: text });
        const t = typing();
        const [res] = await Promise.all([answer(text), wait(550)]);
        t.remove();
        const html = res.ai ? fmt(res.ai) : res.a;
        add('bot', html, res.act);
        hist.push({ role: 'assistant', content: res.ai || plain(res.a) });
        busy = false;
        input.focus({ preventScroll: true });
    }
    function open() {
        tip.hidden = true;
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-open'));
        fab.setAttribute('aria-expanded', 'true');
        if (!welcomed) {
            welcomed = true;
            add('bot', '¡Hola! Soy <strong>Ayvarcitoo</strong> 👋, el asistente de Jose. Pregúntame por su experiencia, tecnologías o cómo contratarlo. También te llevo a cualquier sección o te explico conceptos de programación.');
            ['¿Qué tecnologías usa?', '¿Está disponible?', 'Llévame a proyectos', '¿Puedo instalar la app?', 'Descargar CV'].forEach(q => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = q;
                b.addEventListener('click', () => send(q));
                chips.append(b);
            });
        }
        setTimeout(() => input.focus({ preventScroll: true }), 120);
    }
    function close() {
        panel.classList.remove('is-open');
        fab.setAttribute('aria-expanded', 'false');
        setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, full() ? 250 : 0);
        fab.focus({ preventScroll: true });
    }
    fab.addEventListener('click', () => (panel.hidden || !panel.classList.contains('is-open') ? open() : close()));
    $('.ayv-close', panel).addEventListener('click', close);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    $('#ayvForm').addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
    try {
        if (!sessionStorage.getItem('ayv.tip')) setTimeout(() => {
            if (!panel.hidden) return;
            tip.hidden = false;
            sessionStorage.setItem('ayv.tip', '1');
            setTimeout(() => { tip.hidden = true; }, 8000);
        }, 7000);
    } catch { /* sin guardado */ }
    tip.addEventListener('click', open);
})();
