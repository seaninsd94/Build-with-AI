/*
 * templates.js — Loads template files from the repo and provides
 * placeholder replacement, CSS color substitution, and content injection.
 */
var TEMPLATE_FILES = {
  'index.html':              '../index.html',
  'css/styles.css':          '../css/styles.css',
  'js/main.js':              '../js/main.js',
  'pages/services.html':     '../pages/services.html',
  'pages/about.html':        '../pages/about.html',
  'pages/contact.html':      '../pages/contact.html',
  'images/logo.svg':         '../images/logo.svg',
  'images/logo-white.svg':   '../images/logo-white.svg',
  'robots.txt':              '../robots.txt',
  'sitemap.xml':             '../sitemap.xml'
};

var templateCache = {};

function loadTemplates() {
  var entries = Object.entries(TEMPLATE_FILES);
  return Promise.all(
    entries.map(function (entry) {
      return fetch(entry[1]).then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + entry[0]);
        return r.text();
      });
    })
  ).then(function (results) {
    entries.forEach(function (entry, i) { templateCache[entry[0]] = results[i]; });
    return templateCache;
  });
}

/* ===== Placeholder replacement ===== */
function replacePlaceholders(content, data) {
  return content
    .replace(/\{\{BUSINESS_NAME\}\}/g, data.businessName || 'My Business')
    .replace(/\{\{TAGLINE\}\}/g,       data.tagline || 'Your Tagline Here')
    .replace(/\{\{PHONE\}\}/g,         data.phone || '(555) 000-0000')
    .replace(/\{\{EMAIL\}\}/g,         data.email || 'info@example.com')
    .replace(/\{\{ADDRESS\}\}/g,       data.address || '123 Main St')
    .replace(/\{\{CITY\}\}/g,          data.city || 'Your City')
    .replace(/\{\{STATE\}\}/g,         data.state || 'ST')
    .replace(/\{\{ZIP\}\}/g,           data.zip || '00000');
}

/* ===== CSS color replacement ===== */
function replaceColors(cssContent, colors) {
  return cssContent
    .replace(/--color-primary-dark:\s*#[0-9a-fA-F]{3,8}/,  '--color-primary-dark: '  + colors.primaryDark)
    .replace(/--color-primary-medium:\s*#[0-9a-fA-F]{3,8}/, '--color-primary-medium: ' + colors.primaryMedium)
    .replace(/--color-primary-light:\s*#[0-9a-fA-F]{3,8}/,  '--color-primary-light: '  + colors.primaryLight)
    .replace(/--color-accent-dark:\s*#[0-9a-fA-F]{3,8}/,    '--color-accent-dark: '    + colors.accentDark)
    .replace(/--color-accent-medium:\s*#[0-9a-fA-F]{3,8}/,  '--color-accent-medium: '  + colors.accentMedium)
    .replace(/--color-accent-light:\s*#[0-9a-fA-F]{3,8}/,   '--color-accent-light: '   + colors.accentLight);
}

/* ===== Logo SVG with business name ===== */
function buildLogoSvg(businessName, fill, fillAccent) {
  var name = businessName || 'Your Brand';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60">' +
    '<rect width="300" height="60" fill="none"/>' +
    '<text x="10" y="38" font-family="Georgia, serif" font-size="28" font-weight="600" fill="' + fill + '">' +
    name.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
    '</text></svg>';
}

/* ===== Home page content replacement ===== */
function replaceHomeContent(html, data) {
  // Hero description
  if (data.heroDescription) {
    html = html.replace(
      /A brief, compelling description of what you do and why visitors should care\. Keep it to 1-2 sentences\./,
      escapeHtml(data.heroDescription)
    );
  }
  // Hero image
  if (data.heroImage) {
    html = html.replace(
      /https:\/\/images\.unsplash\.com\/photo-1497366216548-37526070297c\?[^"']*/,
      escapeAttr(data.heroImage)
    );
  }
  // Features
  var featureDefaults = [
    ['Feature One', 'Describe your first key differentiator or service benefit.'],
    ['Feature Two', 'Describe your second key differentiator or service benefit.'],
    ['Feature Three', 'Describe your third key differentiator or service benefit.']
  ];
  for (var i = 0; i < 3; i++) {
    var n = i + 1;
    var title = data['feature' + n + 'Title'];
    var desc = data['feature' + n + 'Desc'];
    if (title) html = html.replace(featureDefaults[i][0], escapeHtml(title));
    if (desc) html = html.replace(featureDefaults[i][1], escapeHtml(desc));
  }
  // Categories
  var catDefaults = [
    ['Category One', 'photo-1504384308090-c894fdcc538d'],
    ['Category Two', 'photo-1521737604893-d14cc237f11d'],
    ['Category Three', 'photo-1522071820081-009f0129c71c']
  ];
  for (var j = 0; j < 3; j++) {
    var cn = j + 1;
    var catTitle = data['cat' + cn + 'Title'];
    var catImage = data['cat' + cn + 'Image'];
    if (catTitle) html = html.replace(catDefaults[j][0], escapeHtml(catTitle));
    if (catImage) {
      html = html.replace(
        new RegExp('https://images\\.unsplash\\.com/' + catDefaults[j][1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"\']*'),
        escapeAttr(catImage)
      );
    }
  }
  // Testimonials
  var testTexts = [
    'Add a real client testimonial here. Keep it specific and authentic.',
    'Another client testimonial. Focus on the outcome and experience.',
    'A third testimonial. Variety in length and detail keeps it authentic.'
  ];
  for (var k = 0; k < 3; k++) {
    var tn = k + 1;
    var tText = data['test' + tn + 'Text'];
    var tAuthor = data['test' + tn + 'Author'];
    if (tText) html = html.replace(testTexts[k], escapeHtml(tText));
    if (tAuthor) {
      // Replace only the first remaining "Client Name"
      html = html.replace('Client Name', escapeHtml(tAuthor));
    }
  }
  // Footer description
  if (data.footerDescription) {
    html = html.replace(
      /A brief description of your business for the footer\./,
      escapeHtml(data.footerDescription)
    );
  }
  return html;
}

/* ===== Services page content replacement ===== */
function replaceServicesContent(html, data) {
  var pkgDefaults = [
    { name: 'Essential Package', desc: 'Perfect for getting started. Includes the core features you need.',
      features: ['Core feature one', 'Core feature two', 'Core feature three', 'Basic support'],
      image: 'photo-1460925895917-afdab827c52f' },
    { name: 'Premium Package', desc: 'Our most popular option. Everything you need for a great experience.',
      features: ['Everything in Starter', 'Premium feature one', 'Premium feature two', 'Premium feature three', 'Priority support'],
      image: 'photo-1553877522-43269d4ea984' },
    { name: 'Complete Package', desc: 'The full experience. Custom-tailored to your exact requirements.',
      features: ['Everything in Premium', 'Custom feature one', 'Custom feature two', 'Dedicated account manager', 'White-glove service', '24/7 support'],
      image: 'photo-1552664730-d307ca884978' }
  ];
  for (var i = 0; i < 3; i++) {
    var n = i + 1;
    var pkgName = data['pkg' + n + 'Name'];
    var pkgDesc = data['pkg' + n + 'Desc'];
    var pkgFeatures = data['pkg' + n + 'Features'];
    var pkgImage = data['pkg' + n + 'Image'];
    if (pkgName) html = html.replace(pkgDefaults[i].name, escapeHtml(pkgName));
    if (pkgDesc) html = html.replace(pkgDefaults[i].desc, escapeHtml(pkgDesc));
    if (pkgFeatures && pkgFeatures.length > 0) {
      // Build new list items
      var oldItems = pkgDefaults[i].features.map(function (f) { return '<li>' + f + '</li>'; }).join('\n                ');
      var newItems = pkgFeatures.map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('\n                ');
      html = html.replace(oldItems, newItems);
    }
    if (pkgImage) {
      html = html.replace(
        new RegExp('https://images\\.unsplash\\.com/' + pkgDefaults[i].image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"\']*'),
        escapeAttr(pkgImage)
      );
    }
  }
  // Footer description
  if (data.footerDescription) {
    html = html.replace(
      /A brief description of your business for the footer\./,
      escapeHtml(data.footerDescription)
    );
  }
  return html;
}

/* ===== About page content replacement ===== */
function replaceAboutContent(html, data) {
  // Story
  if (data.aboutStory) {
    var storyParagraphs = data.aboutStory.split('\n').filter(function (l) { return l.trim(); });
    var storyHtml = storyParagraphs.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('\n          ');
    html = html.replace(
      /<p>Tell your founding story here[^<]*<\/p>\s*<p>Keep it authentic[^<]*<\/p>\s*<p>You can add a team photo[^<]*<\/p>/,
      storyHtml
    );
  }
  // Values
  var valueDefaults = [
    ['Value One', 'Describe a core value that guides your business.'],
    ['Value Two', 'Describe another core value that sets you apart.'],
    ['Value Three', 'A third value that resonates with your clients.']
  ];
  for (var i = 0; i < 3; i++) {
    var n = i + 1;
    var vTitle = data['value' + n + 'Title'];
    var vDesc = data['value' + n + 'Desc'];
    if (vTitle) html = html.replace(valueDefaults[i][0], escapeHtml(vTitle));
    if (vDesc) html = html.replace(valueDefaults[i][1], escapeHtml(vDesc));
  }
  // Footer description
  if (data.footerDescription) {
    html = html.replace(
      /A brief description of your business for the footer\./,
      escapeHtml(data.footerDescription)
    );
  }
  return html;
}

/* ===== Contact page content replacement ===== */
function replaceContactContent(html, data) {
  // Business hours
  if (data.businessHours) {
    var hoursHtml = data.businessHours.split('\n').filter(function (l) { return l.trim(); }).join('<br>');
    html = html.replace(
      /Mon - Fri: 9am - 5pm<br>Sat: By Appointment<br>Sun: Closed/,
      hoursHtml
    );
  }
  // Footer description
  if (data.footerDescription) {
    html = html.replace(
      /A brief description of your business for the footer\./,
      escapeHtml(data.footerDescription)
    );
  }
  return html;
}

/* ===== Utility ===== */
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ===== Build full site ===== */
function buildSite(data, colors) {
  var files = {};
  for (var key in templateCache) {
    var content = replacePlaceholders(templateCache[key], data);
    if (key === 'css/styles.css') {
      content = replaceColors(content, colors);
    }
    files[key] = content;
  }
  // Replace logo SVGs with business name
  files['images/logo.svg'] = buildLogoSvg(data.businessName, colors.primaryDark, colors.accentMedium);
  files['images/logo-white.svg'] = buildLogoSvg(data.businessName, '#ffffff', 'rgba(255,255,255,0.8)');

  // Apply page-specific content replacements
  files['index.html'] = replaceHomeContent(files['index.html'], data);
  files['pages/services.html'] = replaceServicesContent(files['pages/services.html'], data);
  files['pages/about.html'] = replaceAboutContent(files['pages/about.html'], data);
  files['pages/contact.html'] = replaceContactContent(files['pages/contact.html'], data);

  return files;
}

/* ===== Render preview HTML for iframe ===== */
function renderPreviewHTML(files, page) {
  var html;
  if (page === 'index') {
    html = files['index.html'];
  } else {
    html = files['pages/' + page + '.html'];
  }

  // Inline CSS and JS so the iframe is self-contained
  var css = files['css/styles.css'];
  var js = files['js/main.js'];

  html = html.replace(
    /<link[^>]*href=["'][^"']*styles\.css["'][^>]*>/,
    '<style>' + css + '</style>'
  );
  html = html.replace(
    /<script[^>]*src=["'][^"']*main\.js["'][^>]*><\/script>/,
    '<script>' + js + '<\/script>'
  );

  // Replace SVG image sources with inline data URIs
  var logoDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(files['images/logo.svg'])));
  var logoWhiteDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(files['images/logo-white.svg'])));
  html = html.replace(/(?:\.\.\/)?images\/logo\.svg/g, logoDataUri);
  html = html.replace(/(?:\.\.\/)?images\/logo-white\.svg/g, logoWhiteDataUri);

  return html;
}
