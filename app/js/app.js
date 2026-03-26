/*
 * app.js — Website Builder main application logic.
 * Handles form input, live preview, page switching, and ZIP download.
 */
(function () {
  'use strict';

  // DOM refs
  const previewFrame = document.getElementById('previewFrame');
  const previewEmpty = document.getElementById('previewEmpty');
  const previewBtn   = document.getElementById('previewBtn');
  const downloadBtn  = document.getElementById('downloadBtn');
  const pageBtns     = document.querySelectorAll('.preview-page-btn');
  const deviceBtns   = document.querySelectorAll('.device-btn');
  const colorInputs  = document.querySelectorAll('input[type="color"]');
  const navLinks     = document.querySelectorAll('.app-nav-link');

  let currentPage = 'index';
  let generatedFiles = null;
  let templatesLoaded = false;

  // ===== Init =====
  loadTemplates()
    .then(function () {
      templatesLoaded = true;
    })
    .catch(function (err) {
      console.error('Template load failed:', err);
    });

  // ===== Gather form data =====
  function getFormData() {
    return {
      businessName: document.getElementById('businessName').value.trim(),
      tagline:      document.getElementById('tagline').value.trim(),
      phone:        document.getElementById('phone').value.trim(),
      email:        document.getElementById('email').value.trim(),
      city:         document.getElementById('city').value.trim(),
      state:        document.getElementById('state').value.trim(),
      zip:          document.getElementById('zip').value.trim()
    };
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

    var html = renderPreviewHTML(generatedFiles, currentPage);
    var doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    previewFrame.classList.add('visible');
    previewEmpty.style.display = 'none';
    downloadBtn.disabled = false;
  }

  // ===== Page switching =====
  pageBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pageBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentPage = btn.getAttribute('data-page');
      if (generatedFiles) {
        var html = renderPreviewHTML(generatedFiles, currentPage);
        var doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
      }
    });
  });

  // ===== Device toggle =====
  deviceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      deviceBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var device = btn.getAttribute('data-device');
      if (device === 'mobile') {
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

  // ===== Nav smooth scroll + active state =====
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
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
