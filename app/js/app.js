/*
 * app.js — Website Builder main application logic.
 * Handles form input, image uploads, AI text generation,
 * collapsible panels, live preview, and ZIP download.
 */
(function () {
  'use strict';

  var previewFrame = document.getElementById('previewFrame');
  var previewEmpty = document.getElementById('previewEmpty');
  var previewBtn   = document.getElementById('previewBtn');
  var downloadBtn  = document.getElementById('downloadBtn');
  var pageBtns     = document.querySelectorAll('.preview-page-btn');
  var deviceBtns   = document.querySelectorAll('.device-btn');
  var colorInputs  = document.querySelectorAll('input[type="color"]');
  var navLinks     = document.querySelectorAll('.app-nav-link');
  var panelToggles = document.querySelectorAll('.panel-toggle');
  var aiBtns       = document.querySelectorAll('.btn-ai');
  var fileInputs   = document.querySelectorAll('input[type="file"]');
  var urlInputs    = document.querySelectorAll('.image-input-row input[type="url"]');

  var scanBtn      = document.getElementById('scanBtn');
  var scanUrlInput  = document.getElementById('scanUrl');
  var scanStatus    = document.getElementById('scanStatus');
  var themeBtns     = document.querySelectorAll('.theme-card');
  var customPanel   = document.getElementById('customThemePanel');
  var signupModal   = document.getElementById('signupModal');
  var signupSubmit  = document.getElementById('signupSubmit');
  var signupCancel  = document.getElementById('signupCancel');

  var currentPage = 'index';
  var generatedFiles = null;
  var templatesLoaded = false;
  var uploadedImages = {}; // id -> data URI
  var currentTheme = 'classic';
  var userProfile = JSON.parse(localStorage.getItem('wb_profile') || 'null');

  // ===== Theme definitions =====
  var THEMES = {
    classic: {
      label: 'Classic',
      displayFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Montserrat', 'Segoe UI', sans-serif",
      colors: { primaryDark: '#1a4d3e', primaryMedium: '#2d6a4f', primaryLight: '#40916c', accentDark: '#1a2a5e', accentMedium: '#2541b2', accentLight: '#4169e1' }
    },
    modern: {
      label: 'Modern',
      displayFont: "'Inter', 'Segoe UI', sans-serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      googleFonts: 'Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700',
      colors: { primaryDark: '#0f172a', primaryMedium: '#1e40af', primaryLight: '#3b82f6', accentDark: '#9a3412', accentMedium: '#f97316', accentLight: '#fb923c' }
    },
    elegant: {
      label: 'Elegant',
      displayFont: "'Cormorant Garamond', Georgia, serif",
      bodyFont: "'Raleway', 'Segoe UI', sans-serif",
      googleFonts: 'Cormorant+Garamond:wght@400;500;600;700&family=Raleway:wght@400;500;600;700',
      colors: { primaryDark: '#4a1942', primaryMedium: '#6b2fa0', primaryLight: '#9333ea', accentDark: '#92600a', accentMedium: '#d4a843', accentLight: '#f0c95c' }
    }
  };

  // ===== Example data (roofing company) =====
  var EXAMPLE_DATA = {
    businessName: 'Summit Roofing Co.',
    tagline: 'Protecting What Matters Most',
    phone: '(619) 555-0142',
    email: 'info@summitroofing.com',
    city: 'San Diego',
    state: 'CA',
    zip: '92101',
    footerDescription: 'Summit Roofing Co. has been San Diego\'s trusted roofing contractor for over 15 years. Licensed, bonded, and insured.',
    stat1Num: '3,000+', stat1Label: 'Roofs Completed',
    stat2Num: '4.9', stat2Label: 'Star Rating',
    stat3Num: '15+', stat3Label: 'Years Experience',
    stat4Num: '100%', stat4Label: 'Licensed & Insured',
    featureSectionTitle: 'Why San Diego Trusts Summit',
    featureSectionDesc: 'Professional-grade roofing services with honest pricing and guaranteed results.',
    heroDescription: 'From emergency repairs to full roof replacements, our certified team delivers quality craftsmanship backed by a 25-year warranty. Free inspections for all San Diego homeowners.',
    heroImage: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1920&q=80',
    feature1Title: 'Licensed & Insured',
    feature1Desc: 'Fully licensed contractors with comprehensive insurance coverage for your complete peace of mind.',
    feature2Title: '25-Year Warranty',
    feature2Desc: 'Industry-leading warranty on all installations, because we stand behind every shingle we lay.',
    feature3Title: 'Free Inspections',
    feature3Desc: 'Complimentary roof inspections and detailed estimates with no obligation. Know exactly what you need.',
    cat1Title: 'Residential Roofing',
    cat1Desc: 'Shingle, tile, and flat roof solutions for homes of all sizes',
    cat1Image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=800&fit=crop&q=80',
    cat2Title: 'Commercial Roofing',
    cat2Desc: 'TPO, EPDM, and metal systems for businesses and warehouses',
    cat2Image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=800&fit=crop&q=80',
    cat3Title: 'Emergency Repairs',
    cat3Desc: '24/7 response for storm damage, leaks, and urgent repairs',
    cat3Image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=800&fit=crop&q=80',
    test1Author: 'Maria Gonzalez',
    test1Text: 'Summit replaced our entire roof after storm damage. They handled the insurance claim and finished in two days. Couldn\'t be happier.',
    test1Service: 'Full Roof Replacement',
    test2Author: 'James Chen',
    test2Text: 'Professional from start to finish. The crew was respectful, cleaned up every day, and the new roof looks amazing.',
    test2Service: 'Roof Repair',
    test3Author: 'Patricia Williams',
    test3Text: 'We got quotes from five companies. Summit wasn\'t the cheapest, but their warranty and reputation made them the clear choice. Worth every penny.',
    test3Service: 'Full Roof Replacement',
    ctaHeading: 'Protect Your Home Today',
    ctaText: 'Schedule your free roof inspection — no obligation, no pressure, just honest answers.',
    aboutStory: 'Summit Roofing Co. was founded in 2009 by Mike and Sarah Torres, two San Diego natives who saw too many homeowners getting overcharged for subpar roofing work.\n\nWhat started as a two-person crew working out of a pickup truck has grown into a team of 30+ certified roofing professionals. We\'ve completed over 3,000 projects across San Diego County.\n\nOur promise is simple: honest assessments, fair pricing, and craftsmanship that lasts. We treat every home like it\'s our own.',
    value1Title: 'Integrity',
    value1Desc: 'We\'ll never recommend work you don\'t need. Honest assessments, always.',
    value2Title: 'Craftsmanship',
    value2Desc: 'Every roof is installed to exceed manufacturer specifications and local building codes.',
    value3Title: 'Community',
    value3Desc: 'Proudly serving our San Diego neighbors with free roof inspections after every major storm.',
    servicesSubtitle: 'Professional roofing services for every budget and building type.',
    servicesCtaHeading: 'Not Sure What You Need?',
    servicesCtaText: 'Call us for a free inspection and we\'ll recommend the right solution for your roof.',
    aboutCtaHeading: 'Ready for a New Roof?',
    aboutCtaText: 'Get a free quote from San Diego\'s most trusted roofing team.',
    businessHours: 'Mon - Fri: 7am - 6pm\nSat: 8am - 2pm\nSun: Emergency Only',
    faq1Q: 'How much does a new roof cost?',
    faq1A: 'Roof costs depend on size, materials, and complexity. Most residential roofs in San Diego range from $8,000-$25,000. We provide free, detailed estimates.',
    faq2Q: 'How long does a roof replacement take?',
    faq2A: 'Most residential roofs take 1-3 days. Commercial projects vary. We\'ll give you a clear timeline before starting work.',
    faq3Q: 'Do you handle insurance claims?',
    faq3A: 'Yes! We work directly with your insurance company and handle the entire claims process so you don\'t have to.',
    faq4Q: 'What roofing materials do you recommend?',
    faq4A: 'For San Diego\'s climate, we typically recommend architectural shingles or concrete tile for homes, and TPO for flat commercial roofs. We\'ll help you choose the best option.',
    faq5Q: 'Are you licensed and insured?',
    faq5A: 'Absolutely. We\'re fully licensed (CA License #987654), bonded, and carry comprehensive general liability and workers\' compensation insurance.',
    pkg1Name: 'Roof Repair',
    pkg1Desc: 'Fix leaks, replace damaged shingles, and restore your roof\'s integrity.',
    pkg1Features: ['Leak detection & repair', 'Shingle replacement', 'Flashing repair', 'Gutter maintenance', '1-year repair warranty'],
    pkg1Image: 'https://images.unsplash.com/photo-1635424710928-0544e8603cf4?w=800&h=500&fit=crop&q=80',
    pkg2Name: 'Full Replacement',
    pkg2Desc: 'Complete tear-off and replacement with premium materials and our best warranty.',
    pkg2Features: ['Full tear-off & disposal', 'Premium material options', 'Ice & water shield underlayment', 'Ridge vent installation', '25-year workmanship warranty'],
    pkg2Image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop&q=80',
    pkg3Name: 'Commercial',
    pkg3Desc: 'Flat roof, TPO, EPDM, and metal roofing solutions for businesses of all sizes.',
    pkg3Features: ['Free commercial assessment', 'TPO & EPDM systems', 'Metal roofing', 'Preventive maintenance plans', 'Minimal business disruption', '30-year warranty available'],
    pkg3Image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=80'
  };

  var EXAMPLE_COLORS = {
    primaryDark: '#1a3a5c',
    primaryMedium: '#2a5a8c',
    primaryLight: '#3a7abd',
    accentDark: '#7a3b1e',
    accentMedium: '#c25a2a',
    accentLight: '#e07840'
  };

  // ===== Init =====
  loadTemplates()
    .then(function () {
      templatesLoaded = true;
      loadExamplePreview();
    })
    .catch(function (err) { console.error('Template load failed:', err); });

  function loadExamplePreview() {
    // Build the example site and show it in the preview immediately
    var exampleFonts = { displayFont: THEMES.classic.displayFont, bodyFont: THEMES.classic.bodyFont };
    generatedFiles = buildSite(EXAMPLE_DATA, EXAMPLE_COLORS, exampleFonts);
    renderPage();
    previewFrame.classList.add('visible');
    previewEmpty.style.display = 'none';
    // Don't enable download — user needs to enter their own info first
  }

  // ===== Collapsible panels =====
  panelToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      toggle.closest('.collapsible').classList.toggle('open');
    });
  });

  // ===== Theme switching =====
  themeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      themeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTheme = btn.getAttribute('data-theme');
      if (currentTheme === 'custom') {
        customPanel.style.display = '';
      } else {
        customPanel.style.display = 'none';
        // Apply theme colors to the custom color pickers too (so getColors reads them)
        var theme = THEMES[currentTheme];
        if (theme) {
          var ids = ['primaryDark','primaryMedium','primaryLight','accentDark','accentMedium','accentLight'];
          ids.forEach(function (key) {
            var el = document.getElementById('color' + key.charAt(0).toUpperCase() + key.slice(1));
            if (el) {
              el.value = theme.colors[key];
              var hex = document.querySelector('.color-hex[data-for="' + el.id + '"]');
              if (hex) hex.textContent = theme.colors[key];
            }
          });
        }
      }
    });
  });

  // ===== Website scanner =====
  var CORS_PROXIES = [
    function (u) { return 'https://api.allorigins.win/get?url=' + encodeURIComponent(u); },
    function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function (u) { return 'https://corsproxy.io/?' + encodeURIComponent(u); },
    function (u) { return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u); }
  ];

  function fetchWithProxies(url, proxyIndex) {
    if (proxyIndex >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));
    var proxyUrl = CORS_PROXIES[proxyIndex](url);
    return fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
      .then(function (r) {
        if (!r.ok) throw new Error('Proxy ' + proxyIndex + ' failed');
        return r.text();
      })
      .then(function (text) {
        if (text.length < 100) throw new Error('Empty response');
        // allorigins /get endpoint wraps content in JSON
        if (proxyIndex === 0) {
          try { var json = JSON.parse(text); if (json.contents) return json.contents; } catch (e) {}
        }
        return text;
      })
      .catch(function () {
        return fetchWithProxies(url, proxyIndex + 1);
      });
  }

  scanBtn.addEventListener('click', function () {
    var url = scanUrlInput.value.trim();
    if (!url) { scanUrlInput.focus(); return; }
    if (!url.startsWith('http')) url = 'https://' + url;

    scanStatus.textContent = 'Scanning website...';
    scanStatus.className = 'scan-status loading';
    scanBtn.disabled = true;
    scanBtn.classList.add('loading');

    fetchWithProxies(url, 0)
      .then(function (html) {
        var found = parseAndFillFromHtml(html);
        scanStatus.textContent = 'Found ' + found + ' field' + (found !== 1 ? 's' : '') + '. Review and edit below.';
        scanStatus.className = 'scan-status success';
      })
      .catch(function () {
        scanStatus.innerHTML = 'Could not reach site automatically. <button type="button" id="showPasteBtn" class="btn-paste-link">Paste HTML manually</button>';
        scanStatus.className = 'scan-status error';
        document.getElementById('showPasteBtn').addEventListener('click', showManualPaste);
      })
      .finally(function () {
        scanBtn.disabled = false;
        scanBtn.classList.remove('loading');
      });
  });

  function showManualPaste() {
    var existing = document.getElementById('manualPasteWrap');
    if (existing) { existing.style.display = ''; return; }
    var wrap = document.createElement('div');
    wrap.id = 'manualPasteWrap';
    wrap.style.marginTop = '8px';
    wrap.innerHTML = '<label style="font-size:.75rem;color:var(--text-dim);display:block;margin-bottom:4px">Paste your website\'s HTML source below:</label>' +
      '<textarea id="manualPasteArea" rows="4" placeholder="Right-click your site → View Page Source → Copy all → Paste here" style="width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-family:inherit;font-size:14px;resize:vertical"></textarea>' +
      '<button type="button" id="parseManualBtn" style="margin-top:6px;padding:8px 14px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-family:inherit;font-size:.78rem;font-weight:600;cursor:pointer;width:100%">Extract Info</button>';
    scanStatus.parentNode.appendChild(wrap);
    document.getElementById('parseManualBtn').addEventListener('click', function () {
      var html = document.getElementById('manualPasteArea').value;
      if (!html.trim()) return;
      var found = parseAndFillFromHtml(html);
      scanStatus.textContent = 'Found ' + found + ' field' + (found !== 1 ? 's' : '') + ' from pasted HTML.';
      scanStatus.className = 'scan-status success';
      wrap.style.display = 'none';
    });
  }

  function parseAndFillFromHtml(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var found = 0;
    var bodyText = doc.body ? doc.body.textContent : '';
    var allText = doc.documentElement ? doc.documentElement.textContent : bodyText;

    function fill(id, val) {
      if (val && val.trim()) { setField(id, val.trim()); found++; return true; }
      return false;
    }

    // ===== Business name: try OG title, then title tag, then h1 =====
    var ogTitle = doc.querySelector('meta[property="og:title"]');
    var titleEl = doc.querySelector('title');
    var h1 = doc.querySelector('h1');
    var siteName = doc.querySelector('meta[property="og:site_name"]');
    var bName = '';
    if (siteName && siteName.content) bName = siteName.content.trim();
    else if (ogTitle && ogTitle.content) bName = ogTitle.content.split('|')[0].split('-')[0].split('–')[0].split('—')[0].trim();
    else if (titleEl) bName = titleEl.textContent.split('|')[0].split('-')[0].split('–')[0].split('—')[0].trim();
    else if (h1) bName = h1.textContent.trim();
    if (bName && bName.length > 1 && bName.length < 80) fill('businessName', bName);

    // ===== Tagline: subtitle, h2, or short OG desc =====
    var ogDesc = doc.querySelector('meta[property="og:description"]');
    var metaDesc = doc.querySelector('meta[name="description"]');
    var descText = (ogDesc && ogDesc.content) ? ogDesc.content : (metaDesc && metaDesc.content) ? metaDesc.content : '';
    // Look for a short tagline-like element
    var subtitle = doc.querySelector('.tagline, .subtitle, .slogan, [class*="tagline"], [class*="subtitle"], [class*="slogan"], .hero-text, [class*="hero"] p, [class*="banner"] p');
    if (subtitle && subtitle.textContent.trim().length < 120) {
      fill('tagline', subtitle.textContent.trim());
    } else if (descText && descText.length < 100) {
      fill('tagline', descText.split('.')[0]);
    } else {
      // Try the first h2 if it's short
      var firstH2 = doc.querySelector('h2');
      if (firstH2 && firstH2.textContent.trim().length < 80) fill('tagline', firstH2.textContent.trim());
    }

    // ===== Hero description: meta description =====
    if (descText) fill('heroDescription', descText);

    // ===== Phone: tel links, then regex =====
    var phoneLinks = doc.querySelectorAll('a[href^="tel:"]');
    if (phoneLinks.length > 0) {
      var ph = phoneLinks[0].href.replace('tel:', '').replace(/\s+/g, '');
      fill('phone', phoneLinks[0].textContent.trim() || ph);
    } else {
      var phMatch = allText.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
      if (phMatch) fill('phone', phMatch[0]);
    }

    // ===== Email: mailto links, then regex =====
    var emailLinks = doc.querySelectorAll('a[href^="mailto:"]');
    if (emailLinks.length > 0) {
      fill('email', emailLinks[0].href.replace('mailto:', '').split('?')[0]);
    } else {
      var emMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emMatch) fill('email', emMatch[0]);
    }

    // ===== Address: multiple patterns =====
    var addrPatterns = [
      /(\d+\s+[\w\s.]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pkwy|Hwy)[.,]?\s+(?:(?:Ste|Suite|Apt|Unit|#)\s*\w+[.,]?\s+)?)([\w\s]+),\s*([A-Z]{2})\s+(\d{5})/i,
      /([\w\s]+),\s*([A-Z]{2})\s+(\d{5})/,
      /([\w\s]+),\s*([A-Z]{2})\b/
    ];
    for (var ai = 0; ai < addrPatterns.length; ai++) {
      var am = allText.match(addrPatterns[ai]);
      if (am) {
        if (am.length >= 5) { // Full address with street
          fill('city', am[2]); fill('state', am[3]); fill('zip', am[4]);
        } else if (am.length >= 4 && am[3]) { // City, ST ZIP
          fill('city', am[1]); fill('state', am[2]); fill('zip', am[3]);
        } else if (am.length >= 3) { // City, ST
          fill('city', am[1]); fill('state', am[2]);
        }
        break;
      }
    }

    // ===== Footer description =====
    var footer = doc.querySelector('footer, [class*="footer"], [role="contentinfo"]');
    if (footer) {
      var fps = footer.querySelectorAll('p, [class*="description"], [class*="about"]');
      fps.forEach(function (p) {
        var t = p.textContent.trim();
        if (t.length > 15 && t.length < 250 && !/©|copyright|rights reserved|privacy|terms/i.test(t)) {
          fill('footerDescription', t);
        }
      });
    }

    // ===== Services / categories from nav, headings, cards =====
    var serviceEls = doc.querySelectorAll('[class*="service"] h3, [class*="service"] h2, [class*="card"] h3, [class*="category"] h3, [class*="product"] h3, [class*="package"] h3, [class*="offering"] h3');
    var serviceNames = [];
    serviceEls.forEach(function (el) {
      var t = el.textContent.trim();
      if (t.length > 2 && t.length < 60 && serviceNames.indexOf(t) === -1) serviceNames.push(t);
    });
    // Also check nav links for service pages
    if (serviceNames.length < 3) {
      doc.querySelectorAll('nav a, [class*="nav"] a').forEach(function (a) {
        var t = a.textContent.trim();
        if (t.length > 2 && t.length < 40 && !/home|about|contact|blog|faq|login|cart|menu/i.test(t) && serviceNames.indexOf(t) === -1) {
          serviceNames.push(t);
        }
      });
    }
    for (var ci = 0; ci < Math.min(serviceNames.length, 3); ci++) {
      fill('cat' + (ci + 1) + 'Title', serviceNames[ci]);
    }

    // ===== Features / selling points =====
    var featureEls = doc.querySelectorAll('[class*="feature"] h3, [class*="benefit"] h3, [class*="value"] h3, [class*="why"] h3, [class*="feature"] h4, [class*="benefit"] h4');
    var features = [];
    featureEls.forEach(function (el) {
      var t = el.textContent.trim();
      if (t.length > 2 && t.length < 60 && features.length < 3) {
        features.push({ title: t, desc: '' });
        var next = el.nextElementSibling;
        if (next && (next.tagName === 'P' || next.tagName === 'SPAN' || next.tagName === 'DIV')) {
          features[features.length - 1].desc = next.textContent.trim().substring(0, 120);
        }
      }
    });
    for (var fi = 0; fi < features.length; fi++) {
      fill('feature' + (fi + 1) + 'Title', features[fi].title);
      if (features[fi].desc) fill('feature' + (fi + 1) + 'Desc', features[fi].desc);
    }

    // ===== Testimonials / reviews =====
    var testSels = '[class*="testimonial"], [class*="review"], [class*="quote"], blockquote, [class*="feedback"]';
    var testEls = doc.querySelectorAll(testSels);
    var testIdx = 0;
    testEls.forEach(function (el) {
      if (testIdx >= 3) return;
      var quote = '';
      var author = '';
      // Look for quote text
      var qEl = el.querySelector('p, [class*="text"], [class*="quote"], [class*="content"]');
      if (qEl) quote = qEl.textContent.trim();
      else quote = el.textContent.trim();
      // Look for author
      var aEl = el.querySelector('[class*="author"], [class*="name"], cite, [class*="client"], strong');
      if (aEl) author = aEl.textContent.trim();
      // Clean up
      if (author && quote.includes(author)) quote = quote.replace(author, '').trim();
      quote = quote.replace(/^[""\u201C]+|[""\u201D]+$/g, '').trim();
      if (quote.length > 15 && quote.length < 500) {
        testIdx++;
        fill('test' + testIdx + 'Text', quote.substring(0, 200));
        if (author && author.length < 60) fill('test' + testIdx + 'Author', author);
      }
    });

    // ===== Business hours =====
    var hoursEl = doc.querySelector('[class*="hours"], [class*="schedule"], [class*="opening"]');
    if (hoursEl) {
      var hoursText = hoursEl.textContent.trim().substring(0, 200);
      if (/\d/.test(hoursText) && /(mon|tue|wed|thu|fri|sat|sun|am|pm)/i.test(hoursText)) {
        fill('businessHours', hoursText);
      }
    }

    // ===== About text from about section or page =====
    var aboutSection = doc.querySelector('[class*="about"] p, [id*="about"] p, section[class*="about"], [class*="story"] p');
    if (aboutSection) {
      var aboutText = aboutSection.textContent.trim();
      if (aboutText.length > 30 && aboutText.length < 600) fill('aboutStory', aboutText);
    }

    return found;
  }

  function setField(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value;
  }

  // ===== Signup modal & profile =====
  function showSignupModal() {
    // Pre-fill if we have saved data
    if (userProfile) {
      setField('signupName', userProfile.name || '');
      setField('signupEmail', userProfile.email || '');
      setField('signupCompany', userProfile.company || '');
    }
    signupModal.style.display = '';
  }

  signupCancel.addEventListener('click', function () { signupModal.style.display = 'none'; });
  signupModal.addEventListener('click', function (e) { if (e.target === signupModal) signupModal.style.display = 'none'; });

  signupSubmit.addEventListener('click', function () {
    var name = document.getElementById('signupName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    if (!name || !email) {
      if (!name) document.getElementById('signupName').focus();
      else document.getElementById('signupEmail').focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('signupEmail').focus();
      return;
    }
    userProfile = {
      name: name,
      email: email,
      company: document.getElementById('signupCompany').value.trim(),
      plan: document.getElementById('signupPlan').value,
      created: new Date().toISOString()
    };
    localStorage.setItem('wb_profile', JSON.stringify(userProfile));
    signupModal.style.display = 'none';
    downloadZip();
  });

  // ===== Image uploads =====
  fileInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var targetId = input.getAttribute('data-upload-for');
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var dataUri = e.target.result;
        uploadedImages[targetId] = dataUri;
        // Set the URL field to show filename
        var urlField = document.getElementById(targetId);
        if (urlField) urlField.value = file.name;
        // Show thumbnail
        var thumb = document.querySelector('[data-thumb-for="' + targetId + '"]');
        if (thumb) {
          thumb.src = dataUri;
          thumb.classList.add('visible');
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // URL field thumbnail preview
  urlInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var targetId = input.id;
      // Clear uploaded image if user types a URL
      if (input.value.startsWith('http')) {
        delete uploadedImages[targetId];
        var thumb = document.querySelector('[data-thumb-for="' + targetId + '"]');
        if (thumb) {
          thumb.src = input.value;
          thumb.classList.add('visible');
          thumb.onerror = function () { thumb.classList.remove('visible'); };
        }
      }
    });
  });

  // ===== AI text generation =====
  var AI_PROMPTS = {
    tagline: function (d) { return 'A catchy business tagline for "' + d.businessName + '"'; },
    footer: function (d) { return 'A one-sentence footer description for "' + d.businessName + '"'; },
    hero: function (d) { return 'A 1-2 sentence hero description for "' + d.businessName + '" (' + (d.tagline || 'a business') + '). Keep it compelling.'; },
    about: function (d) { return 'A 2-3 paragraph founding story for "' + d.businessName + '". Make it authentic and warm.'; },
    'pkg-features': function (d) { return 'A list of 4-5 service package features for "' + d.businessName + '". One feature per line, no bullets or numbers.'; },
    'section-desc': function (d) { return 'A short section description for "' + d.businessName + '"'; },
    cta: function (d) { return 'A call-to-action sentence for "' + d.businessName + '"'; },
    faq: function (d) { return 'An FAQ answer for "' + d.businessName + '"'; }
  };

  aiBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-ai-target');
      var promptKey = btn.getAttribute('data-ai-prompt');
      var target = document.getElementById(targetId);
      if (!target) return;

      var businessName = document.getElementById('businessName').value.trim();
      if (!businessName) {
        document.getElementById('businessName').focus();
        return;
      }

      var promptFn = AI_PROMPTS[promptKey];
      if (!promptFn) return;

      var data = { businessName: businessName, tagline: document.getElementById('tagline').value.trim() };
      var promptText = promptFn(data);

      // Show loading state
      var origText = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .6s linear infinite"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>...';
      btn.disabled = true;

      // Generate text client-side (simple template-based, no API needed)
      setTimeout(function () {
        var generated = generateText(promptKey, data);
        target.value = generated;
        btn.innerHTML = origText;
        btn.disabled = false;
      }, 400);
    });
  });

  function generateText(key, data) {
    var name = data.businessName;
    switch (key) {
      case 'tagline':
        var taglines = [
          'Excellence in every detail',
          'Your success, our mission',
          'Where quality meets reliability',
          'Trusted by ' + (data.tagline || 'businesses') + ' everywhere',
          'Setting the standard since day one'
        ];
        return taglines[Math.floor(Math.random() * taglines.length)];
      case 'footer':
        return name + ' is dedicated to providing exceptional service to our clients. Contact us today to learn how we can help.';
      case 'hero':
        return 'We help businesses like yours achieve their goals with professional, reliable service. Let ' + name + ' be your trusted partner.';
      case 'about':
        return name + ' was founded with a simple mission: to deliver outstanding results for every client.\n\nOur team brings years of experience and a passion for what we do. We believe in building lasting relationships based on trust, quality, and results.\n\nWe look forward to working with you.';
      case 'pkg-features':
        return 'Professional consultation\nCustomized solutions\nDedicated support\nFast turnaround\nSatisfaction guaranteed';
      case 'section-desc':
        return 'Discover why clients across the area trust ' + name + ' for quality and reliability.';
      case 'cta':
        return 'Get in touch with ' + name + ' today for a free, no-obligation consultation.';
      case 'faq':
        return 'Please contact us directly and we\'ll be happy to answer any questions you have about our services.';
      default:
        return '';
    }
  }

  // ===== Gather form data =====
  function val(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    return el.value.trim();
  }

  function getImageValue(id) {
    // Return uploaded data URI if available, otherwise the URL field value
    return uploadedImages[id] || val(id);
  }

  function getFormData() {
    var data = {
      businessName: val('businessName'),
      tagline: val('tagline'),
      phone: val('phone'),
      email: val('email'),
      city: val('city'),
      state: val('state'),
      zip: val('zip'),
      footerDescription: val('footerDescription'),
      stat1Num: val('stat1Num'), stat1Label: val('stat1Label'),
      stat2Num: val('stat2Num'), stat2Label: val('stat2Label'),
      stat3Num: val('stat3Num'), stat3Label: val('stat3Label'),
      stat4Num: val('stat4Num'), stat4Label: val('stat4Label'),
      featureSectionTitle: val('featureSectionTitle'),
      featureSectionDesc: val('featureSectionDesc'),
      heroDescription: val('heroDescription'),
      heroImage: getImageValue('heroImage'),
      feature1Title: val('feature1Title'), feature1Desc: val('feature1Desc'),
      feature2Title: val('feature2Title'), feature2Desc: val('feature2Desc'),
      feature3Title: val('feature3Title'), feature3Desc: val('feature3Desc'),
      cat1Title: val('cat1Title'), cat1Desc: val('cat1Desc'), cat1Image: getImageValue('cat1Image'),
      cat2Title: val('cat2Title'), cat2Desc: val('cat2Desc'), cat2Image: getImageValue('cat2Image'),
      cat3Title: val('cat3Title'), cat3Desc: val('cat3Desc'), cat3Image: getImageValue('cat3Image'),
      test1Author: val('test1Author'), test1Text: val('test1Text'), test1Service: val('test1Service'),
      test2Author: val('test2Author'), test2Text: val('test2Text'), test2Service: val('test2Service'),
      test3Author: val('test3Author'), test3Text: val('test3Text'), test3Service: val('test3Service'),
      ctaHeading: val('ctaHeading'), ctaText: val('ctaText'),
      aboutStory: val('aboutStory'),
      value1Title: val('value1Title'), value1Desc: val('value1Desc'),
      value2Title: val('value2Title'), value2Desc: val('value2Desc'),
      value3Title: val('value3Title'), value3Desc: val('value3Desc'),
      servicesSubtitle: val('servicesSubtitle'),
      servicesCtaHeading: val('servicesCtaHeading'), servicesCtaText: val('servicesCtaText'),
      aboutCtaHeading: val('aboutCtaHeading'), aboutCtaText: val('aboutCtaText'),
      businessHours: val('businessHours'),
      faq1Q: val('faq1Q'), faq1A: val('faq1A'),
      faq2Q: val('faq2Q'), faq2A: val('faq2A'),
      faq3Q: val('faq3Q'), faq3A: val('faq3A'),
      faq4Q: val('faq4Q'), faq4A: val('faq4A'),
      faq5Q: val('faq5Q'), faq5A: val('faq5A')
    };
    for (var i = 1; i <= 3; i++) {
      data['pkg' + i + 'Name'] = val('pkg' + i + 'Name');
      data['pkg' + i + 'Desc'] = val('pkg' + i + 'Desc');
      data['pkg' + i + 'Image'] = getImageValue('pkg' + i + 'Image');
      var raw = val('pkg' + i + 'Features');
      data['pkg' + i + 'Features'] = raw ? raw.split('\n').filter(function (l) { return l.trim(); }) : [];
    }
    return data;
  }

  function getColors() {
    if (currentTheme !== 'custom' && THEMES[currentTheme]) {
      return THEMES[currentTheme].colors;
    }
    return {
      primaryDark: document.getElementById('colorPrimaryDark').value,
      primaryMedium: document.getElementById('colorPrimaryMedium').value,
      primaryLight: document.getElementById('colorPrimaryLight').value,
      accentDark: document.getElementById('colorAccentDark').value,
      accentMedium: document.getElementById('colorAccentMedium').value,
      accentLight: document.getElementById('colorAccentLight').value
    };
  }

  function getThemeFonts() {
    if (currentTheme === 'custom') {
      var sel = document.getElementById('customFont');
      return { displayFont: sel.value, bodyFont: "'Montserrat', 'Segoe UI', sans-serif" };
    }
    var theme = THEMES[currentTheme] || THEMES.classic;
    return { displayFont: theme.displayFont, bodyFont: theme.bodyFont };
  }

  // ===== Preview =====
  function showPreview() {
    if (!templatesLoaded) {
      alert('Templates are still loading. Please try again in a moment.');
      return;
    }
    var data = getFormData();
    if (!data.businessName) {
      document.getElementById('businessName').focus();
      return;
    }
    generatedFiles = buildSite(data, getColors(), getThemeFonts());
    renderPage();
    previewFrame.classList.add('visible');
    previewEmpty.style.display = 'none';
    downloadBtn.disabled = false;
  }

  function renderPage() {
    if (!generatedFiles) return;
    var html = renderPreviewHTML(generatedFiles, currentPage);
    var doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    // Intercept link clicks inside the preview to navigate within the app
    interceptPreviewLinks(doc);
  }

  function interceptPreviewLinks(doc) {
    var PAGE_MAP = {
      'index.html': 'index',
      'services.html': 'services',
      'about.html': 'about',
      'contact.html': 'contact'
    };
    doc.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;
      // Extract the filename from the href
      var filename = href.split('/').pop().split('#')[0].split('?')[0];
      var page = PAGE_MAP[filename];
      if (page) {
        e.preventDefault();
        currentPage = page;
        // Update toolbar buttons
        pageBtns.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-page') === page);
        });
        renderPage();
      }
    });
  }

  // ===== Page switching =====
  pageBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pageBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentPage = btn.getAttribute('data-page');
      renderPage();
    });
  });

  // ===== Device toggle =====
  deviceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      deviceBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (btn.getAttribute('data-device') === 'mobile') {
        previewFrame.classList.add('mobile');
      } else {
        previewFrame.classList.remove('mobile');
      }
    });
  });

  // ===== Color hex display =====
  colorInputs.forEach(function (input) {
    var hexSpan = document.querySelector('.color-hex[data-for="' + input.id + '"]');
    if (hexSpan) {
      input.addEventListener('input', function () { hexSpan.textContent = input.value; });
    }
  });

  // ===== Pricing plan buttons =====
  document.querySelectorAll('.btn-price').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var card = btn.closest('.price-card');
      var planName = card.querySelector('h3').textContent.trim().toLowerCase();
      var planMap = { 'free': 'free', 'pro support': 'pro', 'agency': 'agency' };
      var planVal = planMap[planName] || 'free';
      document.getElementById('signupPlan').value = planVal;
      showSignupModal();
    });
  });

  // ===== Nav links =====
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  // ===== Download ZIP =====
  function downloadZip() {
    if (!generatedFiles) return;
    var zip = new JSZip();

    // Separate uploaded images into their own files
    var imageIndex = 0;
    for (var path in generatedFiles) {
      var content = generatedFiles[path];
      // For HTML files, extract data URIs into image files
      if (path.endsWith('.html')) {
        content = content.replace(/src="(data:image\/[^;]+;base64,[^"]*)"/g, function (match, dataUri) {
          imageIndex++;
          var ext = dataUri.match(/data:image\/(\w+)/);
          ext = ext ? ext[1].replace('jpeg', 'jpg') : 'png';
          var filename = 'images/upload-' + imageIndex + '.' + ext;
          var base64 = dataUri.split(',')[1];
          zip.file(filename, base64, { base64: true });
          var prefix = path.indexOf('pages/') === 0 ? '../' : '';
          return 'src="' + prefix + filename + '"';
        });
      }
      zip.file(path, content);
    }

    var safeName = (getFormData().businessName || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = safeName + '.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // ===== Event listeners =====
  previewBtn.addEventListener('click', showPreview);
  downloadBtn.addEventListener('click', function () {
    if (!userProfile) {
      showSignupModal();
    } else {
      downloadZip();
    }
  });
})();
