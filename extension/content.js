/* PIT-11 clean download - content script for epit.podatki.gov.pl.
 * No network calls, no dependencies. Everything happens locally in the page. */
(function () {
  'use strict';

  /* ---------- cleaning (pure; also used by the test harness) ---------- */

  // Shrinks the content of any form page taller than one printable A4 sheet (285mm).
  // Self-contained: it is also serialized into the cleaned file as an inline script.
  function fitPages(doc) {
    var win = doc.defaultView, mm = 96 / 25.4, b = doc.body;
    b.classList.add('measuring');
    [].forEach.call(doc.querySelectorAll('.page'), function (p) {
      var kids = [].filter.call(p.children, function (c) {
        return !c.classList.contains('page-header') && !c.classList.contains('page-footer');
      });
      p.style.removeProperty('--fit');
      delete p.dataset.fit;
      var hdr = p.querySelector('.page-header');
      var avail = 285 * mm - (hdr ? hdr.offsetHeight : 0) - 30;
      var used = kids.reduce(function (s, c) {
        var cs = win.getComputedStyle(c);
        return s + c.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      }, 0);
      if (used > avail) {
        var z = (avail / used).toFixed(3);
        p.style.setProperty('--fit', z);
        p.dataset.fit = z;
      }
    });
    b.classList.remove('measuring');
  }

  var FIX_CSS =
    'html,body{overflow:auto!important;height:auto!important}\n' +
    'body.measuring{zoom:1!important}\n' +
    'body.measuring .page-header{display:flex!important}\n' +
    '@media print{.page{overflow:hidden} .page>:not(.page-header):not(.page-footer){zoom:var(--fit,1)}}\n';

  // rawHtml: iframe.contentDocument.documentElement.outerHTML (or a full saved page).
  function cleanHtml(rawHtml) {
    var doc = new DOMParser().parseFromString(rawHtml, 'text/html');

    // 1. Portal-appended style (overflow:hidden + width-based zoom).
    [].forEach.call(doc.querySelectorAll('style'), function (s) {
      var t = s.textContent;
      if (/overflow\s*:\s*hidden/.test(t) && /zoom\s*:\s*\.9/.test(t) && /min-width/.test(t)) s.remove();
    });
    // 2. Pagination script that already ran; any other scripts too.
    [].forEach.call(doc.querySelectorAll('script'), function (s) { s.remove(); });
    // 3. Browser-extension junk: custom elements outside the form, attributes on <html>/<body>.
    [].forEach.call(doc.querySelectorAll('*'), function (el) {
      if (el.localName.indexOf('-') > 0 && !el.closest('.form')) el.remove();
    });
    [doc.documentElement, doc.body].forEach(function (el) {
      [].slice.call(el.attributes).forEach(function (a) {
        if (el === doc.documentElement && a.name === 'lang') return;
        el.removeAttribute(a.name);
      });
    });
    if (!doc.head.querySelector('meta[charset]')) {
      var m = doc.createElement('meta');
      m.setAttribute('charset', 'utf-8');
      doc.head.prepend(m);
    }
    // 4. Scroll fix + print auto-fit.
    var st = doc.createElement('style');
    st.id = 'local-fixes';
    st.textContent = FIX_CSS;
    doc.body.appendChild(st);
    var sc = doc.createElement('script');
    sc.id = 'local-fit';
    sc.textContent = '(' + fitPages.toString() + ')(document);';
    doc.body.appendChild(sc);

    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  var api = { cleanHtml: cleanHtml, fitPages: fitPages };
  if (typeof window !== 'undefined') window.PIT11Clean = api;
  if (location.hostname !== 'epit.podatki.gov.pl') return; // test harness: only expose API

  /* ---------- page integration ---------- */

  var URL_RE = /\/yourpit\/previewSource\/[^/]+\/PIT-11\/(\d{4})\/(\d+)/i;
  var BOX_ID = 'pit11-clean-box';

  function formIframe() {
    var frames = document.querySelectorAll('iframe.preview__iframe, iframe');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].id === 'pit11-print-frame') continue;
      try {
        var d = frames[i].contentDocument;
        if (d && d.querySelector('.page')) return frames[i];
      } catch (e) { /* cross-origin, ignore */ }
    }
    return null;
  }

  // PIT-11_<YEAR>_<PAYER> - payer taken from field 9 ("Nazwa pełna") of the form.
  function baseName() {
    var m = location.pathname.match(URL_RE);
    var year = m ? m[1] : 'document';
    var payer = '';
    var f = formIframe();
    if (f) {
      var t = f.contentDocument.body.innerText || '';
      var pm = t.match(/9\.\s*Nazwa pe\u0142na[^\n]*\n+\s*([^\n]+)/i);
      if (pm) {
        payer = pm[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0142/g, 'l').replace(/\u0141/g, 'L')
          .split(/\s+/).slice(0, 2).join('_').replace(/[^A-Za-z0-9_]/g, '');
      }
    }
    if (!payer && m) payer = m[2];
    return 'PIT-11_' + year + (payer ? '_' + payer : '');
  }

  function getClean() {
    var f = formIframe();
    if (!f) { alert('PIT-11 form not loaded yet.'); return null; }
    return cleanHtml(f.contentDocument.documentElement.outerHTML);
  }

  // Renders the cleaned form in a hidden same-origin iframe and opens the print dialog
  // for it (destination "Save as PDF"). No pop-up and no automatic download involved.
  function downloadPdf() {
    var html = getClean();
    if (!html) return;
    var name = baseName();
    var old = document.getElementById('pit11-print-frame');
    if (old) old.remove();
    var fr = document.createElement('iframe');
    fr.id = 'pit11-print-frame';
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0;visibility:hidden';
    document.body.appendChild(fr);
    var d = fr.contentDocument;
    d.open();
    d.write(html);
    d.close();
    d.title = name;
    setTimeout(function () {
      fitPages(d); // in case the page CSP blocked the inline fit script
      var oldTitle = document.title;
      document.title = name; // Chrome suggests the PDF file name from the title
      fr.contentWindow.focus();
      fr.contentWindow.print();
      setTimeout(function () { document.title = oldTitle; }, 1000);
    }, 400);
  }

  // Same look as the portal's "Download document" button on the PIT-37 preview.
  function makeBtn(label, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.style.cssText = 'display:flex;align-items:center;height:40px;padding:8px 16px;border:0;border-radius:4px;' +
      'background:#0052a5;color:#fff;font:700 16px/24px "Open Sans",Montserrat,Arial,sans-serif;cursor:pointer;' +
      'transition:background-color .15s';
    var ic = document.createElement('span');
    ic.setAttribute('aria-hidden', 'true');
    ic.textContent = 'download';
    ic.style.cssText = 'display:inline-block;width:32px;height:24px;font:normal 24px/24px "Material Symbols Rounded";' +
      'font-feature-settings:"liga";-webkit-font-smoothing:antialiased;text-align:left;overflow:hidden';
    var tx = document.createElement('span');
    tx.textContent = label;
    b.appendChild(ic);
    b.appendChild(tx);
    b.addEventListener('mouseenter', function () { b.style.background = '#3376ab'; });
    b.addEventListener('mouseleave', function () { b.style.background = '#0052a5'; });
    b.addEventListener('click', fn);
    return b;
  }

  // Place the button where the PIT-37 preview has its download button: first item of
  // .action__container (above the Preview / Simplified preview tabs). It scrolls with the page.
  function placeBox(box) {
    var ac = document.querySelector('.action__container');
    if (ac) {
      box.style.cssText = 'align-self:flex-start;margin:0';
      ac.insertBefore(box, ac.firstChild);
      return;
    }
    var back = [].find.call(document.querySelectorAll('a,button'), function (e) {
      return /^\s*(arrow_back\s*)?(back|wstecz|powr\u00f3t)\s*$/i.test(e.innerText || '');
    });
    if (back && back.parentNode) {
      box.style.cssText = 'margin:16px 0';
      back.parentNode.insertBefore(box, back.nextSibling);
      return;
    }
    box.style.cssText = 'position:absolute;top:280px;right:48px;z-index:10';
    document.body.appendChild(box);
  }

  // Follow the portal language (PL/EN switch in the header).
  function label() {
    var lang = (document.documentElement.lang || '').toLowerCase();
    var pl = lang ? lang.indexOf('pl') === 0 : /podgl\u0105d dokumentu/i.test(document.body.innerText || '');
    return pl ? 'Pobierz dokument' : 'Download document';
  }

  function ensureBox() {
    var box = document.getElementById(BOX_ID);
    var onPage = URL_RE.test(location.pathname) && formIframe();
    if (!onPage) { if (box) box.remove(); return; }
    if (box && document.body.contains(box)) {
      var t = box.querySelector('button span:last-child');
      if (t && t.textContent !== label()) t.textContent = label();
      return;
    }
    box = document.createElement('div');
    box.id = BOX_ID;
    box.appendChild(makeBtn(label(), downloadPdf));
    placeBox(box);
  }

  // SPA: route changes happen client-side and the iframe is filled by script,
  // so watch DOM mutations and also poll lightly (iframe content is not observable from here).
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; ensureBox(); }, 300);
  }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  setInterval(ensureBox, 1500);
  ensureBox();
})();
