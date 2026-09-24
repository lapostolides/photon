/* Scroll reveal: sections rise and fade in as they enter the viewport.

   Failure mode matters more than the effect here, so nothing is hidden
   until the IntersectionObserver has proved it actually fires: elements
   start VISIBLE, and are only hidden once a live callback reports them
   sitting below the fold. If the observer never runs — as happens in
   some embedded frames — the page simply shows everything, unanimated.
   A scroll listener is the backstop for anything the observer misses. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var EASE = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)';
  var hidden = [];

  function hide(el) {
    if (el.getAttribute('data-rv') !== 'watch') return;
    el.setAttribute('data-rv', 'hidden');
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.willChange = 'opacity, transform';
    hidden.push(el);
  }

  function show(el) {
    if (el.getAttribute('data-rv') === 'shown') return;
    var wasHidden = el.getAttribute('data-rv') === 'hidden';
    el.setAttribute('data-rv', 'shown');
    var i = hidden.indexOf(el);
    if (i > -1) hidden.splice(i, 1);
    if (!wasHidden) { el.style.opacity = ''; el.style.transform = ''; return; }
    // force the hidden state to commit, then transition to visible
    void el.offsetHeight;
    el.style.transition = EASE;
    el.style.opacity = '1';
    el.style.transform = 'none';
    setTimeout(function () { el.style.willChange = 'auto'; }, 800);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var el = e.target;
      if (e.isIntersecting) {
        show(el);
        io.unobserve(el);
      } else if (e.boundingClientRect.top > (window.innerHeight || 0) * 0.9) {
        hide(el);   // below the fold, and we now know the observer is live
      } else {
        show(el);   // already scrolled past: leave it alone
        io.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.03 });

  function watch() {
    var nodes = document.querySelectorAll('section, footer');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.hasAttribute('data-rv') || el.closest('nav')) continue;
      el.setAttribute('data-rv', 'watch');
      io.observe(el);
    }
  }

  // Backstop: if the observer goes quiet, scrolling still reveals.
  var ticking = false;
  function sweep() {
    ticking = false;
    var vh = window.innerHeight || 0;
    hidden.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.94) show(el);
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  function run() {
    watch();
    var mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 20000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
