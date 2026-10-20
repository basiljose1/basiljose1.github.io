/* Plain JS, no dependencies. Content is fully visible without JS; the "js" class opts into reveal animations. */
(() => {
    const root = document.documentElement;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    root.classList.add('js');

    /* ----- Mobile nav ----- */
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const setMenu = open => {
        toggle.setAttribute('aria-expanded', open);
        menu.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });

    /* ----- Header background + timeline draw on scroll ----- */
    const header = document.getElementById('header');
    const timeline = document.getElementById('timeline');
    let ticking = false;
    const onScroll = () => {
        header.classList.toggle('scrolled', scrollY > 30);
        if (!reduceMotion) {
            const r = timeline.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
            timeline.style.setProperty('--progress', p.toFixed(3));
        }
        ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    /* ----- Active nav link ----- */
    const links = [...document.querySelectorAll('.nav-link')];
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            links.forEach(a => {
                const on = a.getAttribute('href') === '#' + en.target.id;
                a.classList.toggle('active', on);
                on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => navObserver.observe(s));

    /* ----- Counters ----- */
    const runCounter = el => {
        const to = +el.dataset.to, start = performance.now(), dur = 1400;
        const step = now => {
            const t = Math.min(1, (now - start) / dur);
            el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    /* ----- Scroll reveals (staggered via --d in markup) ----- */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            en.target.classList.add('in');
            if (!reduceMotion) en.target.querySelectorAll('.count').forEach(runCounter);
            revealObserver.unobserve(en.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    if (reduceMotion) return; // everything below is decorative motion

    /* ----- Typed role line ----- */
    const typed = document.getElementById('typed');
    const roles = ['Backend Engineer', 'Distributed Systems', 'Kafka & Microservices'];
    let ri = 0, ci = roles[0].length, deleting = true;
    const type = () => {
        const word = roles[ri];
        ci += deleting ? -1 : 1;
        typed.textContent = word.slice(0, ci);
        let wait = deleting ? 45 : 85;
        if (!deleting && ci === word.length) { deleting = true; wait = 1800; }
        else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; wait = 300; }
        setTimeout(type, wait);
    };
    setTimeout(type, 2200);

    if (!finePointer) return;

    /* ----- Card tilt (desktop) ----- */
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
            card.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
        });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--rx');
            card.style.removeProperty('--ry');
        });
    });

    /* ----- Cursor glow (desktop) ----- */
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.prepend(glow);
    let gx = 0, gy = 0, pending = false;
    addEventListener('pointermove', e => {
        gx = e.clientX; gy = e.clientY;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            glow.style.setProperty('--x', gx + 'px');
            glow.style.setProperty('--y', gy + 'px');
            pending = false;
        });
    }, { passive: true });
})();
