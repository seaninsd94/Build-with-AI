/*
 * Website Builder Template - JavaScript
 * Mobile menu, sticky header, scroll animations, form validation, FAQ accordion
Show less
 */
document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initStickyHeader();
  initSmoothScroll();
  initScrollAnimations();
  initContactForm();
  initFaqAccordion();
  setActiveNavLink();
});
/* ===== MOBILE MENU ===== */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navList = document.querySelector('.nav-list');
  if (!toggle || !navList) return;
  toggle.addEventListener('click', function () {
    navList.classList.toggle('active');
    toggle.classList.toggle('active');
  });
  // Close menu when a link is clicked
  navList.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navList.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
}
/* ===== STICKY HEADER ===== */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}
/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}
/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  elements.forEach(function (el) {
    observer.observe(el);
  });
}
/* ===== CONTACT FORM ===== */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Validate required fields
    let valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });
    // Validate email format
    const email = form.querySelector('input[type="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }
    if (!valid) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    // Submit form data
    const formData = new FormData(form);
    fetch(form.action || '/', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    })
      .then(function (response) {
        if (response.ok) {
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.background = '#28a745';
          form.reset();
          setTimeout(function () {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Submission failed');
        }
      })
      .catch(function () {
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.style.background = '#dc3545';
        setTimeout(function () {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      });
  });
  // Clear error states on input
  form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (field) {
    field.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });
}
/* ===== FAQ ACCORDION ===== */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;
  questions.forEach(function (question) {
    question.addEventListener('click', function () {
      const item = this.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      // Close all other items
      document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
        openItem.classList.remove('active');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}
/* ===== ACTIVE NAV LINK ===== */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}
