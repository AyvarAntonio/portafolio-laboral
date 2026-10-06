(() => {
    'use strict';

    const root = document.documentElement;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const motionEnabled = () => root.dataset.motion !== 'reduced';
    const emailAddress = 'joseayvar28@gmail.com';
    const storage = {
        get(key) { try { return localStorage.getItem(`portfolio.${key}`); } catch { return null; } },
        set(key, value) { try { localStorage.setItem(`portfolio.${key}`, value); } catch { /* Las preferencias siguen funcionando en esta visita. */ } }
    };

    let toastTimer;
    function notify(message) {
        const region = $('#toastRegion');
        clearTimeout(toastTimer);
        region.textContent = message;
        region.classList.add('is-visible');
        toastTimer = setTimeout(() => region.classList.remove('is-visible'), 4000);
    }

    // Tema, acento y movimiento se comparten entre todos los controles.
    const themeToggle = $('#themeToggle');
    const motionToggle = $('#motionToggle');
    let motionPaused = storage.get('motion') === 'paused';

    function updateAppearance() {
        const dark = root.dataset.theme === 'dark';
        const label = dark ? 'Activar modo claro' : 'Activar modo oscuro';
        themeToggle.setAttribute('aria-label', label);
        themeToggle.title = label;
        $('i', themeToggle).className = `fas fa-${dark ? 'sun' : 'moon'}`;
        $('meta[name="theme-color"]').content = dark ? '#080a0b' : '#f4f5ef';
        $$('[data-set-accent]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.setAccent === root.dataset.accent));
        });
        document.dispatchEvent(new Event('portfolio:palette'));
    }

    function toggleTheme() {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        storage.set('theme', root.dataset.theme);
        updateAppearance();
    }

    function setAccent(accent) {
        if (!['lime', 'cyan', 'violet'].includes(accent)) return;
        root.dataset.accent = accent;
        storage.set('accent', accent);
        updateAppearance();
    }

    function updateMotion() {
        const paused = motionPaused || reducedMotion.matches;
        root.dataset.motion = paused ? 'reduced' : 'full';
        motionToggle.disabled = reducedMotion.matches;
        motionToggle.setAttribute('aria-pressed', String(paused));
        const label = reducedMotion.matches ? 'Movimiento reducido por la configuración de tu dispositivo' : paused ? 'Activar animaciones' : 'Pausar animaciones';
        motionToggle.setAttribute('aria-label', label);
        motionToggle.title = label;
        $('i', motionToggle).className = `fas fa-${paused ? 'play' : 'pause'}`;
        document.dispatchEvent(new Event('portfolio:motion'));
    }

    function toggleMotion() {
        if (reducedMotion.matches) {
            notify('Se respeta la preferencia de movimiento reducido de tu dispositivo.');
            return;
        }
        motionPaused = !motionPaused;
        storage.set('motion', motionPaused ? 'paused' : 'full');
        updateMotion();
        notify(motionPaused ? 'Animaciones pausadas. Tú marcas el ritmo.' : 'Animaciones activadas.');
    }

    themeToggle.addEventListener('click', toggleTheme);
    motionToggle.addEventListener('click', toggleMotion);
    $$('[data-set-accent]').forEach(button => button.addEventListener('click', () => setAccent(button.dataset.setAccent)));
    reducedMotion.addEventListener('change', updateMotion);
    updateAppearance();
    updateMotion();

    // Etiquetas accesibles para los enlaces sociales originales.
    const socialNames = { 'fa-instagram': 'Instagram', 'fa-linkedin-in': 'LinkedIn', 'fa-github': 'GitHub', 'fa-tiktok': 'TikTok', 'fa-envelope': 'Enviar correo' };
    $$('.social-icon').forEach(link => {
        const icon = $('i', link);
        const name = Object.entries(socialNames).find(([className]) => icon?.classList.contains(className))?.[1];
        if (name) {
            link.setAttribute('aria-label', name);
            link.title = name;
        }
        if (icon) icon.setAttribute('aria-hidden', 'true');
    });
    $$('a[target="_blank"]').forEach(link => { link.rel = 'noopener noreferrer'; });

    // Navegación móvil sin dependencias externas.
    const navbar = $('.navbar');
    const navToggle = $('.navbar-toggler');
    const navMenu = $('#navbarNav');
    const navLinks = $$('.navbar-nav .nav-link');
    const sections = $$('main > section[id]');

    function closeMenu() {
        navMenu.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        $('i', navToggle).className = 'fas fa-bars';
    }

    navToggle.addEventListener('click', () => {
        const open = navToggle.getAttribute('aria-expanded') !== 'true';
        navMenu.classList.toggle('show', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        $('i', navToggle).className = `fas fa-${open ? 'xmark' : 'bars'}`;
    });
    document.addEventListener('click', event => {
        if (!navbar.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navMenu.classList.contains('show')) {
            closeMenu();
            navToggle.focus();
        }
    });
    matchMedia('(min-width: 992px)').addEventListener('change', closeMenu);

    function goTo(id) {
        const target = document.getElementById(id.replace(/^#/, ''));
        if (!target) return;
        closeMenu();
        target.scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'instant', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        try { history.replaceState(null, '', `#${target.id}`); } catch { /* También admite abrir index.html directamente. */ }
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const id = link.getAttribute('href').slice(1);
        if (!document.getElementById(id)) return;
        event.preventDefault();
        goTo(id);
    });

    let scrollFrame = 0;
    function updateScroll() {
        const y = window.scrollY;
        const total = root.scrollHeight - window.innerHeight;
        $('#scrollProgress').style.transform = `scaleX(${total > 0 ? Math.min(1, y / total) : 0})`;
        navbar.classList.toggle('scrolled', y > 30);
        $('#backToTop').classList.toggle('active', y > 600);
        const active = [...sections].reverse().find(section => section.offsetTop <= y + 150) || sections[0];
        navLinks.forEach(link => {
            const selected = link.getAttribute('href') === `#${active.id}`;
            link.classList.toggle('active', selected);
            if (selected) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        scrollFrame = 0;
    }
    function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    updateScroll();

    const timeFormatter = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
    function updateClock() {
        if (document.hidden) return;
        $('#localTime').textContent = `${timeFormatter.format(new Date())} PET`;
        $('#currentYear').textContent = new Date().getFullYear();
    }
    updateClock();
    setInterval(updateClock, 60000);
    document.addEventListener('visibilitychange', updateClock);

    // Texto rotativo con espacio reservado; se detiene al pausar o salir de la pestaña.
    const roles = ['Full Stack Developer', 'Ingeniero de Software Jr', 'Innovador Tecnológico'];
    const typed = $('#typed');
    let typeTimer;
    let roleIndex = 0;
    let character = roles[0].length;
    let deleting = true;
    function typeStep() {
        if (!motionEnabled() || document.hidden) return;
        const role = roles[roleIndex];
        character += deleting ? -1 : 1;
        typed.textContent = role.slice(0, character);
        let delay = deleting ? 35 : 65;
        if (character === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 300;
        } else if (!deleting && character === role.length) {
            deleting = true;
            delay = 2800;
        }
        typeTimer = setTimeout(typeStep, delay);
    }
    function syncTyping() {
        clearTimeout(typeTimer);
        roleIndex = 0;
        character = roles[0].length;
        deleting = true;
        typed.textContent = roles[0];
        if (motionEnabled() && !document.hidden) typeTimer = setTimeout(typeStep, 2800);
    }
    document.addEventListener('portfolio:motion', syncTyping);
    document.addEventListener('visibilitychange', syncTyping);
    syncTyping();

    // Aparición progresiva y métricas: un único observador por tipo, una sola ejecución.
    function observeOnce(elements, callback, options = {}) {
        if (!('IntersectionObserver' in window)) { elements.forEach(callback); return; }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                callback(entry.target);
            });
        }, { threshold: 0.12, ...options });
        elements.forEach(element => observer.observe(element));
    }

    const revealElements = $$('[data-aos]');
    if (motionEnabled() && 'IntersectionObserver' in window) {
        revealElements.forEach(element => element.classList.add('reveal-pending'));
        observeOnce(revealElements, element => {
            element.classList.remove('reveal-pending');
            element.classList.add('reveal-visible');
        }, { rootMargin: '0px 0px -25px 0px', threshold: 0.05 });
    }

    function animateNumber(target, render, duration = 1200) {
        if (!motionEnabled()) { render(target); return; }
        const start = performance.now();
        function frame(now) {
            const progress = motionEnabled() ? Math.min((now - start) / duration, 1) : 1;
            render(target * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
    observeOnce($$('.stat-number[data-count]'), element => {
        animateNumber(Number(element.dataset.count), value => { element.textContent = `${Math.round(value)}+`; });
    });
    observeOnce($$('.progress-bar[data-width]'), bar => {
        bar.style.width = `${bar.dataset.width}%`;
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuenow', bar.dataset.width);
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-label', $('.skill-name', bar.closest('.skill-item')).textContent);
    });
    observeOnce($$('.chart-circle[data-percent]'), circle => {
        animateNumber(Number(circle.dataset.percent), value => circle.style.setProperty('--percent', value.toFixed(1)));
    });

    // Luz al pasar el puntero y una inclinación sutil en la fotografía.
    const cards = $$('.certificate-card, .skill-category-card, .education-card, .timeline-content, .project-card, .contact-form-container');
    cards.forEach(card => card.classList.add('spotlight-card'));
    [...cards, ...$$('[data-tilt]')].forEach(card => {
        let frame = 0;
        card.addEventListener('pointermove', event => {
            if (!finePointer.matches || !motionEnabled()) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                card.style.setProperty('--spot-x', `${x}px`);
                card.style.setProperty('--spot-y', `${y}px`);
                if (card.hasAttribute('data-tilt')) {
                    card.style.setProperty('--tilt-y', `${(x / rect.width - .5) * 9}deg`);
                    card.style.setProperty('--tilt-x', `${(.5 - y / rect.height) * 7}deg`);
                }
            });
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
            cancelAnimationFrame(frame);
            card.style.removeProperty('--tilt-x');
            card.style.removeProperty('--tilt-y');
        });
    });

    const halo = $('.cursor-halo');
    let haloFrame = 0;
    document.addEventListener('pointermove', event => {
        if (!finePointer.matches || !motionEnabled() || event.pointerType === 'touch') return;
        cancelAnimationFrame(haloFrame);
        haloFrame = requestAnimationFrame(() => {
            const interactive = Boolean(event.target.closest('a, button, input, textarea'));
            halo.classList.add('is-active');
            halo.classList.toggle('is-hovering', interactive);
            const halfSize = interactive ? 21 : 13;
            halo.style.transform = `translate3d(${event.clientX - halfSize}px, ${event.clientY - halfSize}px, 0)`;
        });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => halo.classList.remove('is-active'));
    document.addEventListener('click', event => {
        const button = event.target.closest('.btn, .filter-btn');
        if (!button || !motionEnabled() || event.detail === 0) return;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.append(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // Los filtros y la búsqueda comparten estado para evitar carreras al alternar rápido.
    const projectItems = $$('.project-grid > [data-category]');
    const projectSearch = $('#projectSearch');
    let activeFilter = 'all';
    const projectIndex = projectItems.map(element => ({
        element,
        categories: element.dataset.category.split(' '),
        text: normalize(`${$('.project-content', element).textContent} ${element.dataset.category}`)
    }));
    function filterProjects() {
        const terms = normalize(projectSearch.value).split(/\s+/).filter(Boolean);
        let visible = 0;
        projectIndex.forEach(project => {
            const matches = (activeFilter === 'all' || project.categories.includes(activeFilter)) && terms.every(term => project.text.includes(term));
            project.element.hidden = !matches;
            if (matches) visible++;
        });
        $$('.filter-btn').forEach(button => {
            const active = button.dataset.filter === activeFilter;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        $('#projectResults').textContent = `${visible} ${visible === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}`;
        $('#projectsEmpty').hidden = visible !== 0;
        scheduleScroll();
    }
    $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterProjects();
    }));
    projectSearch.addEventListener('input', filterProjects);
    $('#resetProjects').addEventListener('click', () => {
        activeFilter = 'all';
        projectSearch.value = '';
        filterProjects();
        projectSearch.focus({ preventScroll: true });
    });

    // Laboratorio Full Stack: explica el flujo con una simulación visual local.
    const lab = $('#architectureLab');
    const runFlow = $('#runFlow');
    const flowLog = $('#flowLog');
    const layerContent = {
        frontend: { title: 'La experiencia comienza aquí.', description: 'Interfaces adaptables e interactivas que convierten las acciones del usuario en solicitudes al servidor.' },
        backend: { title: 'La lógica que conecta todo.', description: 'El servidor recibe la solicitud, valida la información y coordina la respuesta mediante una API y las reglas de la aplicación.' },
        database: { title: 'Información organizada, decisiones claras.', description: 'La capa de datos almacena y consulta la información que necesita la aplicación, usando bases de datos relacionales o documentales.' }
    };
    let flowTimer;
    let flowRunning = false;
    function selectLayer(layer) {
        const content = layerContent[layer];
        if (!content) return;
        $$('[data-layer]').forEach(button => {
            const selected = button.dataset.layer === layer;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        $('#layerTitle').textContent = content.title;
        $('#layerDescription').textContent = content.description;
    }
    function stopFlow() {
        clearTimeout(flowTimer);
        flowRunning = false;
        runFlow.disabled = false;
        lab.classList.remove('flow-running');
        $('span', runFlow).textContent = 'Simular solicitud';
    }
    function finishFlow() {
        stopFlow();
        selectLayer('frontend');
        $('#labStatus').textContent = 'RECORRIDO COMPLETADO';
        flowLog.classList.add('is-complete');
        flowLog.textContent = '✓ Simulación completada: interfaz → servidor → datos → respuesta.';
    }
    $$('[data-layer]').forEach(button => button.addEventListener('click', () => {
        stopFlow();
        selectLayer(button.dataset.layer);
        $('#labStatus').textContent = 'EXPLORANDO ARQUITECTURA';
        flowLog.classList.remove('is-complete');
        flowLog.textContent = `❯ Capa seleccionada: ${$('strong', button).textContent}. Inicia la simulación para recorrer el flujo completo.`;
    }));
    runFlow.addEventListener('click', () => {
        stopFlow();
        if (!motionEnabled()) { finishFlow(); return; }
        flowRunning = true;
        runFlow.disabled = true;
        $('span', runFlow).textContent = 'Simulando…';
        lab.classList.add('flow-running');
        flowLog.classList.remove('is-complete');
        const steps = [
            ['frontend', '01 / SOLICITUD', '❯ Interfaz → el usuario solicita la lista de proyectos.'],
            ['backend', '02 / PROCESAMIENTO', '❯ Servidor → la API valida y prepara la consulta.'],
            ['database', '03 / CONSULTA', '❯ Datos → la información vuelve al servidor y a la interfaz.']
        ];
        function step(index) {
            if (index === steps.length) { finishFlow(); return; }
            const [layer, status, message] = steps[index];
            selectLayer(layer);
            $('#labStatus').textContent = status;
            flowLog.textContent = message;
            flowTimer = setTimeout(() => step(index + 1), 1000);
        }
        step(0);
    });
    document.addEventListener('portfolio:motion', () => { if (flowRunning && !motionEnabled()) finishFlow(); });

    // Dialogs nativos: teclado, foco, Escape y cierre al pulsar el fondo.
    function openDialog(dialog) {
        $$('dialog[open]').forEach(open => open.close());
        dialog.showModal();
        root.classList.add('has-dialog');
        document.body.classList.add('dialog-open');
    }
    $$('dialog').forEach(dialog => {
        $('[data-close-dialog]', dialog).addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            const rect = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
        });
        dialog.addEventListener('close', () => {
            if (!$('dialog[open]')) {
                document.body.classList.remove('dialog-open');
                root.classList.remove('has-dialog');
            }
        });
    });

    const projectFeatures = {
        ecommerce: ['Catálogo de productos y carrito de compras.', 'Pasarela de pagos con Stripe.', 'Panel de administración de la tienda.', 'Frontend en React y backend con Node.js y MongoDB.'],
        fitness: ['Seguimiento de ejercicios y actividad física.', 'Registro de nutrición y progreso personal.', 'Visualización del progreso con Chart.js.', 'Aplicación en React Native con Firebase y Redux.'],
        dashboard: ['Gráficos interactivos y visualización de datos.', 'Análisis de información en tiempo real.', 'Interfaz web construida con Vue.js y D3.js.', 'Backend con Express y PostgreSQL.']
    };
    const projectDialog = $('#projectDialog');
    let selectedProject = '';
    function showProject(id) {
        const item = projectItems.find(project => project.dataset.project === id);
        if (!item) return;
        selectedProject = $('.project-title', item).textContent;
        $('#projectDialogTitle').textContent = selectedProject;
        $('#projectDialogCategory').textContent = $('.project-category', item).textContent;
        $('#projectDialogDescription').textContent = $('.project-description', item).textContent;
        $('#projectDialogTechnologies').replaceChildren(...$$('.tech-tag', item).map(tag => tag.cloneNode(true)));
        $('#projectDialogFeatures').replaceChildren(...projectFeatures[id].map(text => {
            const li = document.createElement('li');
            li.textContent = text;
            return li;
        }));
        const preview = $('.project-preview', item);
        const detail = $('#projectDialogPreview');
        detail.className = `detail-preview ${[...preview.classList].find(name => name.startsWith('preview-'))}`;
        detail.replaceChildren(...[...preview.children].map(child => child.cloneNode(true)));
        openDialog(projectDialog);
        projectDialog.scrollTop = 0;
    }
    $$('[data-project-open]').forEach(button => button.addEventListener('click', () => showProject(button.dataset.projectOpen)));
    $('#projectContact').addEventListener('click', event => {
        event.preventDefault();
        setSubject(`Consulta sobre ${selectedProject}`);
        projectDialog.close();
        goTo('contact');
    });

    async function copyEmail() {
        let copied = false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(emailAddress);
                copied = true;
            }
        } catch { /* Alternativa para navegadores que bloquean Clipboard API. */ }
        if (!copied) {
            const previous = document.activeElement;
            const field = document.createElement('textarea');
            field.value = emailAddress;
            field.readOnly = true;
            field.style.cssText = 'position:fixed;left:-9999px;top:0';
            ($('dialog[open]') || document.body).append(field);
            field.select();
            try { copied = document.execCommand('copy'); } catch { copied = false; }
            field.remove();
            previous?.focus({ preventScroll: true });
        }
        notify(copied ? 'Correo copiado. ¡Hablemos de tu próxima idea!' : `Puedes copiar mi correo: ${emailAddress}`);
    }
    $$('[data-copy-email]').forEach(button => button.addEventListener('click', copyEmail));

    // Command palette: todos los resultados son acciones reales del portafolio.
    const commandDialog = $('#commandDialog');
    const commandSearch = $('#commandSearch');
    const commandResults = $('#commandResults');
    const navigationActions = [
        ['Inicio', 'home', 'house'], ['Sobre mí', 'about', 'user'], ['Experiencia laboral', 'experience', 'briefcase'],
        ['Stack y habilidades', 'skills', 'code'], ['Proyectos', 'projects', 'layer-group'], ['Taller en vivo', 'playground', 'laptop-code'],
        ['Educación y estudios', 'education', 'graduation-cap'], ['Contacto', 'contact', 'envelope']
    ].map(([label, id, icon]) => ({ label, icon, group: 'SECCIÓN', run: () => goTo(id) }));
    const commandActions = [
        ...navigationActions,
        { label: 'Laboratorio Full Stack interactivo', icon: 'microchip', group: 'EXPLORAR', run: () => goTo('architectureLab') },
        ...projectItems.map(item => ({ label: $('.project-title', item).textContent, icon: 'arrow-up-right-from-square', group: 'PROYECTO', run: () => showProject(item.dataset.project) })),
        { label: 'Descargar CV', icon: 'download', group: 'ACCIÓN', run: () => $('#downloadCV').click() },
        { label: 'Copiar correo electrónico', icon: 'copy', group: 'ACCIÓN', run: copyEmail },
        { label: 'Cambiar tema claro / oscuro', icon: 'circle-half-stroke', group: 'APARIENCIA', run: toggleTheme },
        { label: 'Pausar / activar animaciones', icon: 'pause', group: 'APARIENCIA', run: toggleMotion },
        { label: 'Cambiar color neón', icon: 'palette', group: 'APARIENCIA', run: () => {
            const accents = ['lime', 'cyan', 'violet'];
            setAccent(accents[(accents.indexOf(root.dataset.accent) + 1) % accents.length]);
        } }
    ];
    let matchingActions = [];

    function renderCommands() {
        const query = normalize(commandSearch.value);
        matchingActions = commandActions.filter(action => normalize(`${action.label} ${action.group}`).includes(query));
        commandResults.replaceChildren(...matchingActions.map((action, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'command-result';
            const icon = document.createElement('i');
            icon.className = `fas fa-${action.icon}`;
            icon.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.textContent = action.label;
            const group = document.createElement('small');
            group.textContent = action.group;
            button.append(icon, label, group);
            button.addEventListener('click', () => executeCommand(index));
            return button;
        }));
        $('#commandStatus').textContent = `${matchingActions.length} acciones disponibles`;
        if (!matchingActions.length) {
            const empty = document.createElement('p');
            empty.className = 'command-empty';
            empty.textContent = 'No hay resultados. Prueba con «proyectos», «CV» o «contacto».';
            commandResults.append(empty);
        }
    }
    function executeCommand(index) {
        const action = matchingActions[index];
        if (!action) return;
        commandDialog.close();
        action.run();
    }
    function openCommands() {
        closeMenu();
        commandSearch.value = '';
        renderCommands();
        openDialog(commandDialog);
        commandSearch.focus();
    }
    $$('[data-open-command]').forEach(button => button.addEventListener('click', openCommands));
    commandSearch.addEventListener('input', renderCommands);
    commandDialog.addEventListener('keydown', event => {
        const buttons = $$('.command-result', commandResults);
        if (['ArrowDown', 'ArrowUp'].includes(event.key) && buttons.length) {
            event.preventDefault();
            const current = buttons.indexOf(document.activeElement);
            const next = current === -1 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
            buttons[next].focus();
        } else if (event.key === 'Enter' && event.target === commandSearch) {
            event.preventDefault();
            executeCommand(0);
        }
    });
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
            event.preventDefault();
            if (commandDialog.open) commandDialog.close();
            else openCommands();
        }
    });

    // Terminal acotada a comandos locales; nunca ejecuta JavaScript introducido por el visitante.
    const terminalInput = $('#terminalInput');
    const terminalOutput = $('#terminalOutput');
    const terminalHistory = [];
    let historyIndex = 0;
    let terminalDraft = '';
    function runTerminal(raw) {
        const command = normalize(raw);
        if (!command) return;
        terminalHistory.push(raw.trim());
        if (terminalHistory.length > 50) terminalHistory.shift();
        historyIndex = terminalHistory.length;
        terminalInput.value = '';
        terminalDraft = '';
        if (command === 'clear') { terminalOutput.replaceChildren(); return; }
        let result;
        switch (command) {
            case 'help':
                result = 'whoami      Sobre mí\nskills      Mi stack tecnológico\nlab         Laboratorio Full Stack\nprojects    Explorar proyectos\nexperience  Mi experiencia laboral\neducation   Mi formación\ncontact     Hablemos\ncv          Descargar mi CV\ntheme       Cambiar claro / oscuro\nclear       Limpiar la terminal\n\n↑ / ↓ para recuperar comandos anteriores.';
                break;
            case 'whoami':
            case 'about':
                result = 'Jose Ayvar · Ingeniero de Software Jr\nDesarrollador Full Stack y docente de Informática, Robótica y Programación.\nPachacamac, Lima, Perú. Disponible para nuevos proyectos.';
                break;
            case 'skills': result = $$('.skill-name').map(name => `→ ${name.textContent}`).join('\n'); break;
            case 'lab': result = 'Abriendo el laboratorio. Explora las capas o simula una solicitud Full Stack.'; goTo('architectureLab'); break;
            case 'projects': result = 'Abriendo mis proyectos. Filtra por categoría o busca tu tecnología favorita.'; goTo('projects'); break;
            case 'experience': result = 'Explora mi trayectoria profesional.'; goTo('experience'); break;
            case 'education': result = 'Formación técnica y estudios de Ingeniería de Software.'; goTo('education'); break;
            case 'contact': result = `Conectemos: ${emailAddress}\nTambién puedes usar el formulario de contacto.`; goTo('contact'); break;
            case 'cv': result = 'Descarga solicitada: CV-Jose-Ayvar.pdf'; $('#downloadCV').click(); break;
            case 'theme': toggleTheme(); result = `Tema ${root.dataset.theme === 'dark' ? 'oscuro' : 'claro'} activado.`; break;
            default: result = `Comando no encontrado: ${raw.trim()}\nEscribe help para explorar los comandos disponibles.`;
        }
        const entry = document.createElement('div');
        entry.className = 'terminal-entry';
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = 'jose@portfolio ~ $ ';
        const output = document.createElement('p');
        output.textContent = result;
        entry.append(prompt, document.createTextNode(raw.trim()), output);
        terminalOutput.append(entry);
        while (terminalOutput.children.length > 30) terminalOutput.firstElementChild.remove();
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    $('#terminalForm').addEventListener('submit', event => { event.preventDefault(); runTerminal(terminalInput.value); });
    $$('[data-command]').forEach(button => button.addEventListener('click', () => runTerminal(button.dataset.command)));
    terminalInput.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !terminalHistory.length) return;
        event.preventDefault();
        if (historyIndex === terminalHistory.length) terminalDraft = terminalInput.value;
        historyIndex = Math.max(0, Math.min(terminalHistory.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
        terminalInput.value = historyIndex === terminalHistory.length ? terminalDraft : terminalHistory[historyIndex];
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    });

    // El formulario se envía con Netlify Forms y se informa el resultado real del envío.
    const contactForm = $('#contactForm');
    const formFields = ['name', 'email', 'subject', 'message'].map(id => document.getElementById(id));
    const formStatus = $('#formStatus');
    const subjectInput = $('#subject');
    const messageInput = $('#message');
    contactForm.noValidate = true;
    let sending = false;

    function syncTopics() {
        $$('[data-subject]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.subject === subjectInput.value)));
    }
    function setSubject(value) {
        subjectInput.value = value;
        clearError(subjectInput);
        syncTopics();
    }
    function updateMessageCount() { $('#messageCount').textContent = `${messageInput.value.length} / 3000`; }
    function clearError(input) {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        const feedback = $('.form-feedback', input.closest('.form-group'));
        if (feedback) feedback.textContent = '';
    }
    function validateField(input) {
        let message = '';
        if (!input.value.trim()) message = 'Completa este campo para continuar.';
        else if (input.type === 'email' && input.validity.typeMismatch) message = 'Escribe un correo electrónico válido.';
        else if (input.id === 'message' && input.value.trim().length < 10) message = 'Cuéntame un poco más: al menos 10 caracteres.';
        else if (input.maxLength > 0 && input.value.length > input.maxLength) message = `Usa un máximo de ${input.maxLength} caracteres.`;
        clearError(input);
        if (!message) return true;
        const feedback = $('.form-feedback', input.closest('.form-group'));
        feedback.id = `${input.id}Feedback`;
        feedback.textContent = message;
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${input.id === 'message' ? 'messageCount ' : ''}${feedback.id}`);
        return false;
    }
    formFields.forEach(input => {
        input.addEventListener('input', () => clearError(input));
        input.addEventListener('blur', () => { if (input.value) validateField(input); });
    });
    $$('[data-subject]').forEach(button => button.addEventListener('click', () => setSubject(button.dataset.subject)));
    subjectInput.addEventListener('input', syncTopics);
    messageInput.addEventListener('input', updateMessageCount);

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;
        const valid = formFields.map(validateField).every(Boolean);
        if (!valid) { $('.is-invalid', contactForm).focus(); return; }
        sending = true;
        const button = $('button[type="submit"]', contactForm);
        const submitText = $('.submit-text', button);
        const spinner = $('.spinner-border', button);
        const originalLabel = submitText.innerHTML;
        button.disabled = true;
        contactForm.setAttribute('aria-busy', 'true');
        submitText.textContent = 'Enviando mensaje…';
        spinner.classList.remove('d-none');
        spinner.setAttribute('aria-hidden', 'true');
        formStatus.hidden = false;
        formStatus.dataset.status = 'sending';
        formStatus.textContent = 'Conectando con el servicio de mensajes…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch('/', {
                method: 'POST', body: new URLSearchParams(new FormData(contactForm)).toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: controller.signal
            });
            if (!response.ok) throw new Error('El servicio no confirmó la entrega.');
            const name = $('#name').value.trim();
            formStatus.dataset.status = 'success';
            formStatus.textContent = `¡Gracias, ${name}! Tu mensaje se envió correctamente. Te responderé al correo que indicaste.`;
            const urgent = document.createElement('a');
            urgent.className = 'form-fallback';
            urgent.target = '_blank';
            urgent.rel = 'noopener noreferrer';
            urgent.textContent = '¿Urgente? Escríbeme por WhatsApp';
            urgent.href = `https://wa.me/51946016559?text=${encodeURIComponent(`Hola Jose, soy ${name}. Te acabo de escribir desde tu portafolio: ${$('#subject').value.trim()}.`)}`;
            formStatus.append(' ', urgent);
            contactForm.reset();
            syncTopics();
            updateMessageCount();
        } catch (error) {
            formStatus.dataset.status = 'error';
            formStatus.textContent = error.name === 'AbortError'
                ? `La conexión tardó demasiado y no se pudo confirmar el envío. Tu texto sigue aquí. Puedes intentarlo de nuevo o escribirme a ${emailAddress}.`
                : `No se pudo enviar el mensaje. Tu texto sigue aquí para que puedas intentarlo de nuevo. También puedes escribirme a ${emailAddress}.`;
            const fallback = document.createElement('a');
            fallback.className = 'form-fallback';
            fallback.textContent = 'Enviar con mi app de correo';
            fallback.href = `mailto:${emailAddress}?subject=${encodeURIComponent($('#subject').value.trim())}&body=${encodeURIComponent(`${messageInput.value.trim().slice(0, 1500)}\n\n— ${$('#name').value.trim()} (${$('#email').value.trim()})`)}`;
            formStatus.append(' ', fallback);
        } finally {
            clearTimeout(timeout);
            sending = false;
            button.disabled = false;
            contactForm.removeAttribute('aria-busy');
            submitText.innerHTML = originalLabel;
            spinner.classList.add('d-none');
        }
    });

    // Fondo ambiental de toda la página. Un solo lienzo, limitado a 30 fps,
    // que se detiene al pausar las animaciones o al ocultar la pestaña.
    const canvas = $('#networkCanvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    let width = 0;
    let height = 0;
    let particles = [];
    let networkFrame = 0;
    let lastFrame = 0;
    let accent = getComputedStyle(root).getPropertyValue('--accent').trim();
    const pointer = { x: -1000, y: -1000 };

    function drawNetwork(advance) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = accent;
        context.strokeStyle = accent;
        particles.forEach((particle, index) => {
            if (advance) {
                particle.x = (particle.x + particle.vx + width) % width;
                particle.y = (particle.y + particle.vy + height) % height;
            }
            context.globalAlpha = .35;
            context.beginPath();
            context.arc(particle.x, particle.y, 1.3, 0, Math.PI * 2);
            context.fill();
            function connect(other) {
                const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
                if (distance > 140) return;
                context.globalAlpha = (1 - distance / 140) * .2;
                context.beginPath();
                context.moveTo(particle.x, particle.y);
                context.lineTo(other.x, other.y);
                context.stroke();
            }
            for (let other = index + 1; other < particles.length; other++) connect(particles[other]);
            if (finePointer.matches) connect(pointer);
        });
        context.globalAlpha = 1;
    }
    function animateNetwork(now) {
        if (now - lastFrame > 32) { if (!root.classList.contains('is-scrolling')) drawNetwork(true); lastFrame = now; }
        networkFrame = requestAnimationFrame(animateNetwork);
    }
    function syncNetwork() {
        cancelAnimationFrame(networkFrame);
        networkFrame = 0;
        drawNetwork(false);
        if (motionEnabled() && !document.hidden) networkFrame = requestAnimationFrame(animateNetwork);
    }
    function resizeNetwork() {
        width = document.documentElement.clientWidth;
        height = window.innerHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: width < 768 ? 22 : 48 }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
        }));
        syncNetwork();
    }
    document.addEventListener('pointermove', event => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
    document.addEventListener('visibilitychange', syncNetwork);
    document.addEventListener('portfolio:motion', syncNetwork);
    document.addEventListener('portfolio:palette', () => {
        accent = getComputedStyle(root).getPropertyValue('--accent').trim();
        drawNetwork(false);
    });
    window.addEventListener('resize', resizeNetwork, { passive: true });
    resizeNetwork();
})();
