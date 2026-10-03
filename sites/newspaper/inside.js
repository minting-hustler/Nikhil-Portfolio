/* Inside pages: blocks are "inked" onto the paper as they scroll into view. */
(function () {
  var els = document.querySelectorAll('.ink');
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    document.documentElement.classList.add('rm'); return;
  }
  var io = new IntersectionObserver(function (es) {
    var batch = es.filter(function (e) { return e.isIntersecting; }).map(function (e) { io.unobserve(e.target); return e.target; });
    if (batch.length) gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08 });
  }, { rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
