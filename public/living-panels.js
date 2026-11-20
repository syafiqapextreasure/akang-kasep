(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-living-story]').forEach(story => {
    const panels = [...story.querySelectorAll('[data-living-panel]')];
    const status = story.querySelector('[data-panel-status]');
    if (panels.length < 2) return;
    let current = 0, timer = null, visible = false, hovered = false, focused = false, manual = false;
    const duration = 4500;
    const canPlay = () => visible && !document.hidden && !reduced.matches && !hovered && !focused && !manual;
    function sync() {
      clearTimeout(timer);
      timer = null;
      const playing = canPlay();
      story.dataset.playing = String(playing);
      story.dataset.mode = manual ? 'manual' : reduced.matches ? 'reduced' : playing ? 'automatic' : 'held';
      if (playing) timer = setTimeout(() => { select((current + 1) % panels.length); sync(); }, duration);
    }
    function select(index, announce = false) {
      current = index;
      story.dataset.activeScene = String(index);
      panels.forEach((panel, i) => {
        panel.classList.toggle('is-active', i === index);
        panel.setAttribute('aria-pressed', String(i === index));
      });
      if (announce) status.textContent = panels[index].querySelector('.panel-title').textContent + '. Selected for manual browsing.';
    }
    function choose(index) { manual = true; select(index, true); sync(); }
    panels.forEach((panel, index) => {
      panel.addEventListener('click', () => choose(index));
      panel.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % panels.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + panels.length - 1) % panels.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = panels.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        choose(target);
        panels[target].focus({preventScroll:true});
      });
    });
    story.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') { hovered = true; sync(); } });
    story.addEventListener('pointerleave', () => { hovered = false; sync(); });
    story.addEventListener('focusin', () => { focused = true; sync(); });
    story.addEventListener('focusout', event => { if (!story.contains(event.relatedTarget)) { focused = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    addEventListener('pagehide', () => { clearTimeout(timer); timer = null; });
    addEventListener('pageshow', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.15}).observe(story);
    } else visible = true;
    select(0);
    sync();
  });
})();
