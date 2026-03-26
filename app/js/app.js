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

  // ===== Init =====
  loadTemplates()
    .then(function () { templatesLoaded = true; })
    .catch(function (err) { console.error('Template load failed:', err); });

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
    'pkg-features': function (d) { return 'A list of 4-5 service package features for "' + d.businessName + '". One feature per line, no bullets or numbers.'; }
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
      heroDescription: val('heroDescription'),
      heroImage: getImageValue('heroImage'),
      feature1Title: val('feature1Title'), feature1Desc: val('feature1Desc'),
      feature2Title: val('feature2Title'), feature2Desc: val('feature2Desc'),
      feature3Title: val('feature3Title'), feature3Desc: val('feature3Desc'),
      cat1Title: val('cat1Title'), cat1Image: getImageValue('cat1Image'),
      cat2Title: val('cat2Title'), cat2Image: getImageValue('cat2Image'),
      cat3Title: val('cat3Title'), cat3Image: getImageValue('cat3Image'),
      test1Author: val('test1Author'), test1Text: val('test1Text'),
      test2Author: val('test2Author'), test2Text: val('test2Text'),
      test3Author: val('test3Author'), test3Text: val('test3Text'),
      aboutStory: val('aboutStory'),
      value1Title: val('value1Title'), value1Desc: val('value1Desc'),
      value2Title: val('value2Title'), value2Desc: val('value2Desc'),
      value3Title: val('value3Title'), value3Desc: val('value3Desc'),
      businessHours: val('businessHours')
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
