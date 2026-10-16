const VISIBLE_CLASS = 'is-visible';

function initReveal() {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (!elements.length) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add(VISIBLE_CLASS));

    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(VISIBLE_CLASS);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );

  elements.forEach(el => observer.observe(el));
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');

  if (!header) {
    return;
  }

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

initReveal();
initHeader();
