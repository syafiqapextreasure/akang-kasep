(() => {
  'use strict';
  document.querySelectorAll('[data-comparison]').forEach(frame => {
    const input = frame.querySelector('.comparison-input');
    if (!input) return;
    const update = () => {
      const value = Math.max(0, Math.min(100, Number(input.value) || 0));
      frame.style.setProperty('--comparison', value + '%');
      frame.dataset.edge = value === 0 ? 'after' : value === 100 ? 'before' : 'split';
      input.setAttribute('aria-valuetext', `${value}% before, ${100 - value}% after`);
    };
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    update();
  });
})();
