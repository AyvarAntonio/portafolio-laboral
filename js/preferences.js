// Aplicar las preferencias antes de pintar la página evita destellos de otro tema.
(() => {
    const root = document.documentElement;
    try {
        const theme = localStorage.getItem('portfolio.theme');
        const accent = localStorage.getItem('portfolio.accent');
        if (['dark', 'light'].includes(theme)) root.dataset.theme = theme;
        if (['lime', 'cyan', 'violet'].includes(accent)) root.dataset.accent = accent;
        const paused = localStorage.getItem('portfolio.motion') === 'paused';
        root.dataset.motion = paused || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    } catch {
        root.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    }
})();
