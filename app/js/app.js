/*
 * app.js — Website Builder main application logic.
 * Handles form input, collapsible panels, live preview, page switching, and ZIP download.
 */
(function () {
  'use strict';

  // DOM refs
  var previewFrame = document.getElementById('previewFrame');
  var previewEmpty = document.getElementById('previewEmpty');
  var previewBtn   = document.getElementById('previewBtn');
  var downloadBtn  = document.getElementById('downloadBtn');
  var pageBtns     = document.querySelectorAll('.preview-page-btn');
  var deviceBtns   = document.querySelectorAll('.device-btn');
  var colorInputs  = document.querySelectorAll('input[type="color"]');
  var navLinks     = document.querySelectorAll('.app-nav-link');
  var panelToggles = document.querySelectorAll('.panel-toggle');

  var currentPage = 'index';
  var generatedFiles = null;
  var templatesLoaded = false;

  // ===== Init =====
  loadTemplates()
    .then(function () { templatesLoaded = true; })
    .catch(function (err) { console.error('Template load failed:', err); });

  // ===== Collapsible panels =====
  panelToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var panel = toggle.closest('.collapsible');
      panel.classList.toggle('open');
    });
  });

  // ===== Gather all form data =====
  function val(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    return el.value.trim();
  }

  function getFormData() {
    var data = {
      // Business info
      businessName: val('businessName'),
      tagline:      val('tagline'),
      phone:        val('phone'),
      email:        val('email'),
      city:         val('city'),
      state:        val('state'),
      zip:          val('zip'),
      footerDescription: val('footerDescription'),
      // Home page
      heroDescription: val('heroDescription'),
      heroImage:       val('heroImage'),
      feature1Title: val('feature1Title'), feature1Desc: val('feature1Desc'),
      feature2Title: val('feature2Title'), feature2Desc: val('feature2Desc'),
      feature3Title: val('feature3Title'), feature3Desc: val('feature3Desc'),
      cat1Title: val('cat1Title'), cat1Image: val('cat1Image'),
      cat2Title: val('cat2Title'), cat2Image: val('cat2Image'),
      cat3Title: val('cat3Title'), cat3Image: val('cat3Image'),
      test1Author: val('test1Author'), test1Text: val('test1Text'),
      test2Author: val('test2Author'), test2Text: val('test2Text'),
      test3Author: val('test3Author'), test3Text: val('test3Text'),
      // About page
      aboutStory:  val('aboutStory'),
      value1Title: val('value1Title'), value1Desc: val('value1Desc'),
      value2Title: val('value2Title'), value2Desc: val('value2Desc'),
      value3Title: val('value3Title'), value3Desc: val('value3Desc'),
      // Contact page
      businessHours: val('businessHours')
    };
    // Services page — packages
    for (var i = 1; i <= 3; i++) {
      data['pkg' + i + 'Name'] = val('pkg' + i + 'Name');
      data['pkg' + i + 'Desc'] = val('pkg' + i + 'Desc');
      data['pkg' + i + 'Image'] = val('pkg' + i + 'Image');
      var raw = val('pkg' + i + 'Features');
      data['pkg' + i + 'Features'] = raw ? raw.split('\n').filter(function (l) { return l.trim(); }) : [];
    }
    return data;
  }

  function getColors() {
    return {
      primaryDark:   document.getElementById('colorPrimaryDark').value,
      primaryMedium: document.getElementById('colorPrimaryMedium').value,
      primaryLight:  document.getElementById('colorPrimaryLight').value,
      accentDark:    document.getElementById('colorAccentDark').value,
      accentMedium:  document.getElementById('colorAccentMedium').value,
      accentLight:   document.getElementById('colorAccentLight').value
    };
  }

  // ===== Preview =====
  function showPreview() {
    if (!templatesLoaded) {
      alert('Templates are still loading. Please wait a moment and try again.');
      return;
    }
    var data = getFormData();
    if (!data.businessName) {
      document.getElementById('businessName').focus();
      return;
    }
    var colors = getColors();
    generatedFiles = buildSite(data, colors);

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
      input.addEventListener('input', function () {
        hexSpan.textContent = input.value;
      });
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
    for (var path in generatedFiles) {
      zip.file(path, generatedFiles[path]);
    }
    var businessName = getFormData().businessName || 'my-website';
    var safeName = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
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
