/*
 * templates.js — Loads template files from the repo and provides
 * placeholder replacement + CSS color variable substitution.
 */
const TEMPLATE_FILES = {
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

const templateCache = {};

async function loadTemplates() {
  const entries = Object.entries(TEMPLATE_FILES);
  const results = await Promise.all(
    entries.map(([key, url]) =>
      fetch(url).then(r => {
        if (!r.ok) throw new Error('Failed to load ' + key);
        return r.text();
      })
    )
  );
  entries.forEach(([key], i) => { templateCache[key] = results[i]; });
  return templateCache;
}

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

function replaceColors(cssContent, colors) {
  return cssContent
    .replace(/--color-primary-dark:\s*#[0-9a-fA-F]{3,8}/,  '--color-primary-dark: '  + colors.primaryDark)
    .replace(/--color-primary-medium:\s*#[0-9a-fA-F]{3,8}/, '--color-primary-medium: ' + colors.primaryMedium)
    .replace(/--color-primary-light:\s*#[0-9a-fA-F]{3,8}/,  '--color-primary-light: '  + colors.primaryLight)
    .replace(/--color-accent-dark:\s*#[0-9a-fA-F]{3,8}/,    '--color-accent-dark: '    + colors.accentDark)
    .replace(/--color-accent-medium:\s*#[0-9a-fA-F]{3,8}/,  '--color-accent-medium: '  + colors.accentMedium)
    .replace(/--color-accent-light:\s*#[0-9a-fA-F]{3,8}/,   '--color-accent-light: '   + colors.accentLight);
}

function buildSite(data, colors) {
  const files = {};
  for (const [key, raw] of Object.entries(templateCache)) {
    let content = replacePlaceholders(raw, data);
    if (key === 'css/styles.css') {
      content = replaceColors(content, colors);
    }
    files[key] = content;
  }
  return files;
}

function renderPreviewHTML(files, page) {
  let html, cssPath, jsPath, imgPrefix;

  if (page === 'index') {
    html = files['index.html'];
    cssPath = 'css/styles.css';
    jsPath = 'js/main.js';
    imgPrefix = '';
  } else {
    html = files['pages/' + page + '.html'];
    cssPath = '../css/styles.css';
    jsPath = '../js/main.js';
    imgPrefix = '../';
  }

  // Inline CSS and JS so the iframe is self-contained
  const css = files['css/styles.css'];
  const js = files['js/main.js'];

  // Replace external CSS link with inline style
  html = html.replace(
    /<link[^>]*href=["'][^"']*styles\.css["'][^>]*>/,
    '<style>' + css + '</style>'
  );

  // Replace external JS src with inline script
  html = html.replace(
    /<script[^>]*src=["'][^"']*main\.js["'][^>]*><\/script>/,
    '<script>' + js + '<\/script>'
  );

  // Replace SVG image sources with inline data URIs
  const logoSvg = files['images/logo.svg'];
  const logoWhiteSvg = files['images/logo-white.svg'];
  const logoDataUri = 'data:image/svg+xml;base64,' + btoa(logoSvg);
  const logoWhiteDataUri = 'data:image/svg+xml;base64,' + btoa(logoWhiteSvg);

  html = html.replace(/(?:\.\.\/)?images\/logo\.svg/g, logoDataUri);
  html = html.replace(/(?:\.\.\/)?images\/logo-white\.svg/g, logoWhiteDataUri);

  return html;
}
