# CLAUDE.md - Website Builder Template
> A minimal, professional website template built with vanilla HTML, CSS, and JavaScript.
Show less
> Designed for AI-assisted customization with Claude Code.
## Project Overview
**Template:** Professional Business Website Builder
**Stack:** HTML5, CSS3, JavaScript (ES6+) - No frameworks
**Fonts:** Google Fonts (Playfair Display + Montserrat)
**Status:** Ready for customization
---
## Quick Start
```bash
# Start local development server
python -m http.server 8000
# Open http://localhost:8000
```
---
## Project Structure
```
Build-with-AI/
├── CLAUDE.md              # This file - AI guidelines
├── index.html             # Homepage
├── css/
│   └── styles.css         # Main stylesheet (CSS variables for easy theming)
├── js/
│   └── main.js            # Mobile menu, forms, scroll effects, FAQ accordion
├── images/
│   ├── logo.svg           # Placeholder logo
│   └── logo-white.svg     # White logo for dark backgrounds
└── pages/
    ├── services.html      # Services/packages page
    ├── about.html         # About page
    └── contact.html       # Contact form with FAQ
```
---
## How to Customize
### 1. Brand Colors (css/styles.css, lines 5-20)
Change these CSS variables to rebrand the entire site:
```css
--color-primary-dark: #1a4d3e;     /* Main brand color */
--color-primary-medium: #2d6a4f;
--color-primary-light: #40916c;
--color-accent-dark: #1a2a5e;      /* Accent color */
--color-accent-medium: #2541b2;
--color-accent-light: #4169e1;
```
### 2. Business Info
Search and replace these placeholders across all files:
| Placeholder | Replace With |
|------------|-------------|
| `{{BUSINESS_NAME}}` | Your business name |
| `{{TAGLINE}}` | Your tagline |
| `{{PHONE}}` | Your phone number |
| `{{EMAIL}}` | Your email address |
| `{{ADDRESS}}` | Your address |
| `{{CITY}}` | Your city |
| `{{STATE}}` | Your state |
| `{{ZIP}}` | Your zip code |
### 3. Content
- Edit HTML files directly for text changes
- Replace images in the `images/` folder
- Edit `css/styles.css` for styling
- Edit `js/main.js` for behavior
### 4. Add a New Page
1. Copy `pages/about.html` as your template
2. Update the `<title>`, meta description, and content
3. Add a nav link in all HTML files
---
## Component Library
### Available Sections
| Component | Class | Description |
|-----------|-------|-------------|
| Hero | `.hero` | Full-screen hero with image/video background |
| Section | `.section` | Standard content section (96px padding) |
| Section Alt | `.section-alt` | Alternate background section |
| Section Dark | `.section-dark` | Dark background with white text |
| Card Grid | `.features-grid` | Auto-responsive card grid |
| Package Card | `.package-card` | Service/pricing card with image |
| Testimonial | `.testimonial-card` | Client review card |
| FAQ Accordion | `.faq-container` | Expandable FAQ items |
| Contact Form | `.contact-form` | Validated form with submission |
| Stats Bar | `.stats-bar` | Horizontal metrics display |
| CTA Section | `.cta-section` | Call-to-action banner |
### Available Buttons
| Class | Style |
|-------|-------|
| `.btn-primary` | Solid primary color |
| `.btn-secondary` | Solid accent color |
| `.btn-outline` | Outlined primary |
| `.btn-outline-white` | Outlined white (for dark bg) |
---
## Form Setup
The contact form has client-side validation. To receive submissions:
### Netlify Forms (if hosting on Netlify)
Add `data-netlify="true"` to the `<form>` tag.
### Formspree (any host)
1. Sign up at https://formspree.io
2. Add `action="https://formspree.io/f/YOUR_ID"` and `method="POST"` to the form
---
## Responsive Breakpoints
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop | >1024px | Multi-column grids, full nav |
| Tablet | 768-1024px | 2-column grids, condensed nav |
| Mobile | <768px | Single column, hamburger menu |
| Small | <480px | Minimal spacing, full-width buttons |
---
## AI Assistant Guidelines
### When customizing this template:
1. **Change colors via CSS variables** - Never hard-code colors
2. **Keep it responsive** - Test at all breakpoints
3. **Use semantic HTML** - Proper headings, landmarks, alt text
4. **Keep it vanilla** - No frameworks, no build tools
5. **Use inline SVG for icons** - No external icon libraries
### Things to avoid:
- Don't add JavaScript frameworks
- Don't add external CSS frameworks
- Don't remove the mobile menu functionality
- Don't change the responsive breakpoint values without testing
- Don't add images larger than 200KB without optimization
---
## Deployment
This is a static site. Deploy anywhere:
- **Netlify** - Drag and drop at netlify.com/drop
- **GitHub Pages** - Free from repository settings
- **Vercel** - CLI or Git integration
- **Any web host** - Upload via FTP
