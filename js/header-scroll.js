/* TirthYatra – scroll-aware header
   - compacts once the page is scrolled a little
   - hides while scrolling down, returns as soon as you scroll up
   - stays put while the mobile menu / gallery panel is open
   - keeps --ty-header-height (the space reserved above the page) at the
     header's full-size height, so content never jumps when it shrinks.
   Replaces the inline "syncTirthYatraHeaderHeight" snippet that lived in index.html. */
(function () {
  'use strict';

  var header = document.querySelector('header.page-header');
  if (!header) return;

  var root = document.documentElement;
  var COMPACT = 'ty-header--compact';
  var HIDDEN = 'ty-header--hidden';

  var COMPACT_ON = 30;   // px scrolled before the header shrinks
  var COMPACT_OFF = 10;  // px it must come back to before it expands (avoids flicker)
  var HIDE_AFTER = 160;  // don't hide until we're past this scroll position
  var JITTER = 6;        // ignore scroll movements smaller than this

  var lastY = window.pageYOffset || 0;
  var ticking = false;
  var holdUntil = 0;     // after a menu click the header stays put while the page glides to the section

  /* ---------- reserved space above the page ---------- */
  var measureTimer;
  function measure() {
    if (header.classList.contains(COMPACT)) return;   // only measure the full-size header
    var h = header.getBoundingClientRect().height;
    // on phones/tablets the bar is a position:fixed panel, so the header box itself is 0px tall
    var panel = header.querySelector('.rd-navbar-panel');
    if (panel) h = Math.max(h, panel.getBoundingClientRect().bottom);
    if (h > 0) root.style.setProperty('--ty-header-height', h + 'px');
  }
  function measureSoon() {
    clearTimeout(measureTimer);
    measureTimer = setTimeout(measure, 250);           // wait for the shrink/expand transition to finish
  }

  /* ---------- highlight the menu item for the section in view ---------- */
  var spy = [];
  [].slice.call(header.querySelectorAll('.rd-nav-link[href^="#"]')).forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var marker = id && document.getElementById(id);   // the .ty-anchor sitting one header-height above its section
    if (marker) spy.push({ item: a.parentNode, marker: marker });
  });

  function updateActiveLink() {
    if (!spy.length) return;
    var current = null, best = -Infinity;
    for (var i = 0; i < spy.length; i++) {
      var top = spy[i].marker.getBoundingClientRect().top;
      // the section we've scrolled furthest into (menu order and page order can differ)
      if (top <= 60 && top > best) { best = top; current = spy[i]; }
    }
    for (var j = 0; j < spy.length; j++) spy[j].item.classList.toggle('active', spy[j] === current);
  }

  /* ---------- scroll behaviour ---------- */
  function menuIsOpen() {
    return !!header.querySelector(
      '.rd-navbar-nav-wrap.active, .rd-navbar-toggle.active, .rd-navbar-inner.active'
    );
  }

  function update() {
    ticking = false;
    var y = Math.max(window.pageYOffset || root.scrollTop || 0, 0);   // iOS rubber-band gives negatives

    var isCompact = header.classList.contains(COMPACT);
    if (!isCompact && y > COMPACT_ON) setState(COMPACT, true);
    else if (isCompact && y < COMPACT_OFF) setState(COMPACT, false);

    var delta = y - lastY;
    if (Math.abs(delta) >= JITTER) {
      if (delta > 0 && y > HIDE_AFTER && !menuIsOpen() && Date.now() > holdUntil) setState(HIDDEN, true);
      else if (delta < 0) setState(HIDDEN, false);
      lastY = y;
    }
    if (y <= 0) setState(HIDDEN, false);
    updateActiveLink();
  }

  // the classes go on <header> and on <html> (the floating login/links pills key off <html>)
  function setState(name, on) {
    header.classList.toggle(name, on);
    root.classList.toggle(name, on);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  header.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.rd-nav-link[href^="#"]');
    if (!link) return;
    holdUntil = Date.now() + 900;
    setState(HIDDEN, false);
    // on phones the menu is a drawer: close it so the section is visible
    var toggle = header.querySelector('.rd-navbar-toggle.active');
    if (toggle) toggle.click();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measureSoon);
  window.addEventListener('load', function () { measure(); update(); });
  window.addEventListener('pageshow', update);           // back/forward cache restores

  if (window.ResizeObserver) new ResizeObserver(measureSoon).observe(header);

  measure();
  update();
})();
