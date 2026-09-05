/**
 * ÉLAN – Premium Restaurant Website
 * script.js
 *
 * Modules (in execution order):
 *  0.  Custom cursor
 *  1.  Preloader
 *  2.  Navigation – scroll state & active link
 *  3.  Mobile menu
 *  4.  Smooth scroll
 *  5.  Scroll-triggered reveal animations (IntersectionObserver)
 *  6.  Parallax – cinematic section
 *  7.  Menu tabs
 *  8.  Gallery lightbox
 *  9.  Testimonials carousel
 * 10.  Reservation form
 * 11.  Back-to-top button
 * 12.  Init
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   0. CUSTOM CURSOR
   – Small gold dot that follows the mouse exactly
   – Larger gradient ring that lags behind with lerp easing
   – Expands on hoverable elements, morphs on click
   – Hidden on touch / mobile devices
   ═══════════════════════════════════════════════════════════════ */
function initCursor() {
  // Only on non-touch, non-mobile
  const isTouchDevice = () =>
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

  if (isTouchDevice()) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Inject cursor elements ── */
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  /* ── Hide the native cursor site-wide ── */
  document.documentElement.style.cursor = 'none';

  /* ── State ── */
  let mouseX = -200, mouseY = -200; // start off-screen
  let ringX  = -200, ringY  = -200;
  let isHovering = false;
  let isClicking = false;
  let isHidden   = false;
  let rafId;

  /* ── Track mouse ── */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isHidden) {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
      isHidden = false;
    }
  });

  /* ── Hide when mouse leaves the window ── */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    isHidden = true;
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
    isHidden = false;
  });

  /* ── Hover – expand ring on interactive elements ── */
  const hoverTargets = [
    'a', 'button', '.tab-btn', '.gallery-item',
    '.dish-card', '.nav-logo', '.footer-logo',
    '.btn', '.dot', 'input', 'select', 'textarea',
    '.mobile-nav-link'
  ].join(', ');

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      isHovering = true;
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      isHovering = false;
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    }
  });

  /* ── Click burst ── */
  document.addEventListener('mousedown', () => {
    isClicking = true;
    dot.classList.add('cursor-click');
    ring.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    isClicking = false;
    dot.classList.remove('cursor-click');
    ring.classList.remove('cursor-click');
  });

  /* ── Animation loop – lerp the ring position ── */
  const LERP = 0.10; // lower = more lag

  function animate() {
    // Lerp ring toward mouse
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;

    // Dot snaps instantly (uses CSS transform for sub-pixel precision)
    dot.style.transform  = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    rafId = requestAnimationFrame(animate);
  }

  animate();

  /* ── Clean up if viewport becomes touch-sized ── */
  const mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) {
      cancelAnimationFrame(rafId);
      dot.remove();
      ring.remove();
      document.documentElement.style.cursor = '';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   1. PRELOADER
   ═══════════════════════════════════════════════════════════════ */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Minimum display time so the animation completes gracefully
  const MIN_MS = 1800;
  const start  = Date.now();

  function dismiss() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_MS - elapsed);

    setTimeout(() => {
      preloader.classList.add('fade-out');
      // Remove from DOM after transition ends
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }, remaining);
  }

  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss, { once: true });
  }
}

/* ═══════════════════════════════════════════════════════════════
   2. NAVIGATION – scroll state & active link highlight
   ═══════════════════════════════════════════════════════════════ */
function initNavigation() {
  const header   = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!header) return;

  // Toggle glass background on scroll
  function onScroll() {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);

    // Back-to-top visibility
    const btt = document.getElementById('back-to-top');
    if (btt) btt.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init

  // Active section highlight via IntersectionObserver
  const sections = document.querySelectorAll('main section[id], header + main section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   3. MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay   = document.getElementById('mobile-overlay');
  if (!hamburger || !mobileNav || !overlay) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    // Focus first link for accessibility
    const firstLink = mobileNav.querySelector('.mobile-nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  mobileNav.querySelectorAll('.mobile-nav-link, .mobile-reserve').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}

/* ═══════════════════════════════════════════════════════════════
   4. SMOOTH SCROLL
   ═══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  // Handles any in-page anchor click
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h'), 10) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════════
   5. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.animate-reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.08 }
  );

  document.querySelectorAll('.animate-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Image mask reveals (chef, about)
  const maskObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  document.querySelectorAll('.chef-image-wrap, .about-image-wrap').forEach(el => {
    maskObserver.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════════
   6. PARALLAX – cinematic section
   ═══════════════════════════════════════════════════════════════ */
function initParallax() {
  const cinematicBg  = document.getElementById('cinematic-bg');
  if (!cinematicBg) return;

  // Disable on mobile/tablet to prevent jank
  const isMobile = () => window.innerWidth <= 768;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function updateParallax() {
    if (isMobile()) return;

    const rect   = cinematicBg.parentElement.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const vh     = window.innerHeight;
    const ratio  = (vh / 2 - center) / vh; // –0.5 to 0.5
    const offset = ratio * 80; // max 40px shift

    const img = cinematicBg.querySelector('.cinematic-img');
    if (img) img.style.transform = `translateY(${offset}px)`;

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   7. MENU TABS
   ═══════════════════════════════════════════════════════════════ */
function initMenuTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-panel');
  if (!tabButtons.length) return;

  function activateTab(btn) {
    const targetTab = btn.dataset.tab;

    // Update button states
    tabButtons.forEach(b => {
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });

    // Swap panels with animation
    tabPanels.forEach(panel => {
      const isTarget = panel.id === `tab-${targetTab}`;
      if (isTarget) {
        panel.removeAttribute('hidden');
        panel.classList.add('active');
        // Re-trigger CSS animation by removing & re-adding
        const list = panel.querySelector('.menu-list');
        if (list) {
          list.style.animation = 'none';
          // Force reflow
          void list.offsetWidth;
          list.style.animation = '';
        }
      } else {
        panel.classList.remove('active');
        panel.setAttribute('hidden', '');
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn));

    // Keyboard navigation (left/right arrows)
    btn.addEventListener('keydown', (e) => {
      const all   = [...tabButtons];
      const idx   = all.indexOf(btn);
      let next    = null;
      if (e.key === 'ArrowRight') next = all[(idx + 1) % all.length];
      if (e.key === 'ArrowLeft')  next = all[(idx - 1 + all.length) % all.length];
      if (next) { next.focus(); activateTab(next); }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   8. GALLERY LIGHTBOX
   ═══════════════════════════════════════════════════════════════ */
function initLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbClose     = document.getElementById('lightbox-close');
  const lbPrev      = document.getElementById('lightbox-prev');
  const lbNext      = document.getElementById('lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lbImg || !galleryItems.length) return;

  // Build image list from gallery
  const images = [...galleryItems].map(item => {
    const img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;
    const data = images[currentIndex];

    // Fade out → swap → fade in
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.96)';

    setTimeout(() => {
      lbImg.src = data.src;
      lbImg.alt = data.alt;
      lbImg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      lbImg.style.opacity    = '1';
      lbImg.style.transform  = 'scale(1)';
    }, 150);
  }

  function openLightbox(index) {
    currentIndex = index;
    showImage(index);
    lightbox.removeAttribute('hidden');
    lightbox.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.add('closing');
    document.body.style.overflow = '';

    lightbox.addEventListener('animationend', () => {
      lightbox.setAttribute('hidden', '');
      lightbox.classList.remove('closing');
      lbImg.src = '';
    }, { once: true });
  }

  // Open on gallery item click
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => showImage(currentIndex - 1));
  lbNext.addEventListener('click',  () => showImage(currentIndex + 1));

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showImage(currentIndex - 1);
    if (e.key === 'ArrowRight')  showImage(currentIndex + 1);
  });

  // Click outside image closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   9. TESTIMONIALS CAROUSEL
   ═══════════════════════════════════════════════════════════════ */
function initCarousel() {
  const track      = document.getElementById('carousel-track');
  const dotsWrap   = document.getElementById('carousel-dots');
  if (!track || !dotsWrap) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  const total  = slides.length;
  let current  = 0;
  let autoInterval;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.dot');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => {
      const active = i === current;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', String(active));
    });

    // Update live region (aria-live is on .carousel)
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', String(i !== current));
    });
  }

  function startAuto() {
    autoInterval = setInterval(() => goTo(current + 1), 5500);
  }

  function stopAuto() {
    clearInterval(autoInterval);
  }

  // Initialise
  goTo(0);
  startAuto();

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  // Pause on hover / focus
  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);
  track.parentElement.addEventListener('focusin',    stopAuto);
  track.parentElement.addEventListener('focusout',   startAuto);

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      delta < 0 ? goTo(current + 1) : goTo(current - 1);
    }
    startAuto();
  }, { passive: true });

  // Keyboard (when carousel is focused)
  dotsWrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
    if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
  });
}

/* ═══════════════════════════════════════════════════════════════
   10. RESERVATION FORM
   ═══════════════════════════════════════════════════════════════ */
function initReservationForm() {
  const form    = document.getElementById('reservation-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  // Set minimum date to today
  const dateInput = form.querySelector('#f-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Elegant floating-label effect – add .filled class when input has value
  form.querySelectorAll('.form-input').forEach(input => {
    function checkFilled() {
      input.classList.toggle('filled', input.value.trim() !== '');
    }
    input.addEventListener('input',  checkFilled);
    input.addEventListener('change', checkFilled);
    checkFilled();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      // Highlight invalid fields
      form.querySelectorAll(':invalid').forEach(field => {
        field.classList.add('error');
        field.addEventListener('input', () => field.classList.remove('error'), { once: true });
      });
      // Focus first invalid
      const first = form.querySelector(':invalid');
      if (first) first.focus();
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      form.querySelectorAll('.form-input').forEach(i => i.classList.remove('filled'));
      submitBtn.textContent = 'Confirm Reservation';
      submitBtn.disabled    = false;
      success.removeAttribute('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Hide success after 6 seconds
      setTimeout(() => success.setAttribute('hidden', ''), 6000);
    }, 1200);
  });
}

/* ═══════════════════════════════════════════════════════════════
   11. BACK TO TOP
   ═══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════════
   12. LAZY LOADING – polite nudge for browsers without native support
   ═══════════════════════════════════════════════════════════════ */
function initLazyImages() {
  // Modern browsers handle loading="lazy" natively.
  // For older ones, we use IntersectionObserver as a lightweight polyfill.
  if ('loading' in HTMLImageElement.prototype) return;

  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  if (!lazyImgs.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) img.src = img.dataset.src;
      obs.unobserve(img);
    });
  }, { rootMargin: '200px 0px' });

  lazyImgs.forEach(img => io.observe(img));
}

/* ═══════════════════════════════════════════════════════════════
   INIT – DOMContentLoaded
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initPreloader();
  initNavigation();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initParallax();
  initMenuTabs();
  initLightbox();
  initCarousel();
  initReservationForm();
  initBackToTop();
  initLazyImages();
});
