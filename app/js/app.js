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

  var currentPage = 'index';
  var generatedFiles = null;
  var templatesLoaded = false;
  var uploadedImages = {}; // id -> data URI

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
    generatedFiles = buildSite(EXAMPLE_DATA, EXAMPLE_COLORS);
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
    return {
      primaryDark: document.getElementById('colorPrimaryDark').value,
      primaryMedium: document.getElementById('colorPrimaryMedium').value,
      primaryLight: document.getElementById('colorPrimaryLight').value,
      accentDark: document.getElementById('colorAccentDark').value,
      accentMedium: document.getElementById('colorAccentMedium').value,
      accentLight: document.getElementById('colorAccentLight').value
    };
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
    generatedFiles = buildSite(data, getColors());
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
  downloadBtn.addEventListener('click', downloadZip);
})();
