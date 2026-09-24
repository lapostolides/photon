/* Light-in-flight hero: a laser pulse propagating through a scattering
   medium in a bottle, drawn as a diagram rather than captured footage.
   Self-initializing so it works both in the streamed design component
   and in the exported static pages. */
(function () {
  var started = false;

  function init(canvas) {
    if (canvas.__lif) return;
    canvas.__lif = true;

    var ctx = canvas.getContext('2d');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = 0, H = 0, dpr = 1;

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function geom() {
      var bw = Math.min(W * 0.64, 900);
      var bx = W - bw - Math.max(W * 0.04, 24);
      var r = Math.min(H * 0.27, 108);
      return { bx: bx, bw: bw, cy: H * 0.6, r: r, nh: r * 0.33 };
    }

    function bottlePath(g) {
      var bx = g.bx, bw = g.bw, cy = g.cy, r = g.r, nh = g.nh;
      ctx.beginPath();
      ctx.moveTo(bx, cy - r);
      ctx.lineTo(bx + bw * 0.55, cy - r);
      ctx.quadraticCurveTo(bx + bw * 0.75, cy - r, bx + bw * 0.78, cy - nh);
      ctx.lineTo(bx + bw, cy - nh);
      ctx.lineTo(bx + bw, cy + nh);
      ctx.lineTo(bx + bw * 0.78, cy + nh);
      ctx.quadraticCurveTo(bx + bw * 0.75, cy + r, bx + bw * 0.55, cy + r);
      ctx.lineTo(bx, cy + r);
      ctx.closePath();
    }

    // Warm-white core falling off to ochre, matching the site accent.
    function pulseGradient(lx, cy, rad) {
      var grd = ctx.createRadialGradient(lx, cy, 0, lx, cy, rad);
      grd.addColorStop(0, 'rgba(255,247,228,0.95)');
      grd.addColorStop(0.16, 'rgba(250,224,158,0.62)');
      grd.addColorStop(0.42, 'rgba(224,174,68,0.26)');
      grd.addColorStop(1, 'rgba(184,128,26,0)');
      return grd;
    }

    function frame(t) {
      var g = geom();
      var period = 3600, span = g.bw * 1.62;
      var p = (t % period) / period;
      var lx = g.bx - g.bw * 0.3 + p * span;
      // fade only at the very edges, so the medium is never fully dark
      var alive = Math.min(1, Math.min(p, 1 - p) / 0.06) * 0.85 + 0.15;

      ctx.clearRect(0, 0, W, H);

      // incoming beam, only ahead of the wavefront
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var beamEnd = Math.min(lx, g.bx + g.bw);
      var beam = ctx.createLinearGradient(0, 0, beamEnd, 0);
      beam.addColorStop(0, 'rgba(224,174,68,0)');
      beam.addColorStop(0.72, 'rgba(224,174,68,' + (0.06 * alive).toFixed(3) + ')');
      beam.addColorStop(1, 'rgba(255,240,206,' + (0.3 * alive).toFixed(3) + ')');
      ctx.fillStyle = beam;
      ctx.fillRect(0, g.cy - 1.4, Math.max(0, beamEnd), 2.8);
      ctx.restore();

      // light scattering inside the medium
      ctx.save();
      bottlePath(g);
      ctx.clip();
      ctx.fillStyle = 'rgba(244,239,229,0.035)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = pulseGradient(lx, g.cy, g.r * 2.6);
      ctx.globalAlpha = alive;
      ctx.fillRect(0, 0, W, H);
      // sharper wavefront edge
      var wf = ctx.createLinearGradient(lx - g.r * 0.5, 0, lx + g.r * 0.22, 0);
      wf.addColorStop(0, 'rgba(255,248,232,0)');
      wf.addColorStop(0.7, 'rgba(255,250,238,0.5)');
      wf.addColorStop(1, 'rgba(255,252,244,0)');
      ctx.fillStyle = wf;
      ctx.fillRect(lx - g.r * 0.5, g.cy - g.r, g.r * 0.72, g.r * 2);
      ctx.globalAlpha = 1;
      ctx.restore();

      // glass outline, brightest where the pulse is passing
      ctx.save();
      bottlePath(g);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(244,239,229,0.13)';
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      var rim = ctx.createLinearGradient(lx - g.r * 1.5, 0, lx + g.r * 1.5, 0);
      rim.addColorStop(0, 'rgba(224,174,68,0)');
      rim.addColorStop(0.5, 'rgba(255,238,198,' + (0.5 * alive).toFixed(3) + ')');
      rim.addColorStop(1, 'rgba(224,174,68,0)');
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // caustic pooling on the surface below
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(lx, g.cy + g.r);
      ctx.scale(1, 0.17);
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 1.9, 0, Math.PI * 2);
      ctx.fillStyle = pulseGradient(0, 0, g.r * 1.9);
      ctx.globalAlpha = 0.75 * alive;
      ctx.fill();
      ctx.restore();

      // the surface itself
      ctx.save();
      var line = ctx.createLinearGradient(g.bx - g.bw * 0.3, 0, g.bx + g.bw * 1.1, 0);
      line.addColorStop(0, 'rgba(244,239,229,0)');
      line.addColorStop(0.5, 'rgba(244,239,229,0.12)');
      line.addColorStop(1, 'rgba(244,239,229,0)');
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(g.bx - g.bw * 0.3, g.cy + g.r + 0.5);
      ctx.lineTo(g.bx + g.bw * 1.1, g.cy + g.r + 0.5);
      ctx.stroke();
      ctx.restore();
    }

    var raf = 0, t0 = 0;
    function loop(now) {
      if (!t0) t0 = now;
      frame(now - t0);
      raf = requestAnimationFrame(loop);
    }

    function boot() {
      if (!resize()) { setTimeout(boot, 120); return; }
      if (reduce) { frame(1500); return; }
      cancelAnimationFrame(raf);
      t0 = 0;
      raf = requestAnimationFrame(loop);
    }
    boot();

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { if (resize() && reduce) frame(1500); });
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', function () { resize(); });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) { t0 = 0; raf = requestAnimationFrame(loop); }
    });
  }

  function scan() {
    var c = document.querySelector('[data-hero-canvas]');
    if (c) { init(c); started = true; }
    return started;
  }

  function watch() {
    if (scan()) return;
    var mo = new MutationObserver(function () { if (scan()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
