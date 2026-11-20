/* BLACK BRAND — shared UX helpers: scroll lock, drawer close, backdrop-click, Escape. No dependencies. */
(function () {
  var b = document.body;
  function q(s) { return document.querySelector(s); }
  function sync() {
    var nav = q('#nav'), side = q('#side'), modal = q('#modal');
    var open = (nav && nav.classList.contains('open')) || (side && side.classList.contains('open') && innerWidth <= 900) || (modal && modal.classList.contains('open'));
    b.classList.toggle('lock', !!open);
    var bg = q('#sideBg'); if (bg && side) bg.classList.toggle('open', side.classList.contains('open'));
  }
  document.addEventListener('click', function () { requestAnimationFrame(sync); }, true);
  window.addEventListener('hashchange', function () { requestAnimationFrame(sync); });
  window.addEventListener('resize', sync);

  // storefront: close button inside the mobile drawer
  var nav = q('#nav');
  if (nav) {
    var brandHeader = document.createElement('div');
    brandHeader.className = 'mobile-menu-header';
    brandHeader.innerHTML = '<span class="mobile-menu-wordmark">BLACK BRAND<small>DEFINE YOUR STYLE</small></span>';
    nav.insertBefore(brandHeader, nav.firstChild);
    var menuFooter = document.createElement('div');
    menuFooter.className = 'mobile-menu-footer';
    menuFooter.innerHTML = '<span>BLACK BRAND · SRI LANKA</span><small>Considered style, everyday confidence.</small>';
    nav.appendChild(menuFooter);
    var toggle = nav.querySelector('.shop-expand');
    var shop = nav.querySelector('.dd');
    if (toggle && shop) toggle.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var expanded = shop.classList.toggle('mobile-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', expanded ? 'Collapse shop categories' : 'Expand shop categories');
      toggle.textContent = expanded ? '−' : '+';
    });
    function syncSelected() {
      var current = window.location.hash || '#/';
      nav.querySelectorAll('a[href^="#/"]').forEach(function (link) {
        link.classList.toggle('mobile-selected', link.getAttribute('href') === current);
        if (link.classList.contains('mobile-selected')) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#/"]');
      if (link) { nav.querySelectorAll('a').forEach(function (a) { a.classList.remove('mobile-selected'); }); link.classList.add('mobile-selected'); }
    });
    window.addEventListener('hashchange', syncSelected);
    syncSelected();
  }
  if (nav && !nav.querySelector('.drawer-close')) {
    var x = document.createElement('button'); x.className = 'drawer-close'; x.type = 'button';
    x.setAttribute('aria-label', 'Close menu'); x.textContent = '×';
    var head = nav.querySelector('.mobile-menu-header');
    if (head) head.appendChild(x); else nav.insertBefore(x, nav.firstChild);
    x.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      nav.classList.remove('open');
      var backdrop = q('#drawerBg'); if (backdrop) backdrop.classList.remove('open');
      sync();
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); var d = q('#drawerBg'); if (d) d.classList.remove('open'); } });
  }
  // click outside the dialog closes it
  var m = q('#modal');
  if (m) m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav) nav.classList.remove('open'); var d = q('#drawerBg'); if (d) d.classList.remove('open');
    var s = q('#searchbar'); if (s) s.classList.remove('open');
  });
  // admin: tap the dim area to close the sidebar (the admin shell is rendered later, so delegate)
  document.addEventListener('click', function (e) {
    if (e.target.id === 'sideBg') { var s = q('#side'); if (s) s.classList.remove('open'); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    var shell = q('#root');
    if (shell && !q('#sideBg')) { var bg = document.createElement('div'); bg.id = 'sideBg'; bg.className = 'side-bg'; document.body.appendChild(bg); }
  });
})();
