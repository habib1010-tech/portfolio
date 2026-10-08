import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initWebGL } from './webgl.js';
import { translations } from './translations.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Logic
  let currentLang = 'en';
  const langBtns = {
    en: document.getElementById('btn-en'),
    fr: document.getElementById('btn-fr')
  };

  function updateLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
    // Update active class
    langBtns.en.classList.toggle('active', lang === 'en');
    langBtns.fr.classList.toggle('active', lang === 'fr');
  }

  langBtns.en.addEventListener('click', () => updateLanguage('en'));
  langBtns.fr.addEventListener('click', () => updateLanguage('fr'));

  // Resume Dropdown
  const cvBtn = document.getElementById('download-cv-btn');
  const cvDropdown = document.getElementById('resume-dropdown');
  cvBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cvDropdown.classList.toggle('show');
  });
  document.addEventListener('click', () => {
    cvDropdown.classList.remove('show');
  });

  // 2. Custom Cursor
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  if (cursor && follower && window.innerWidth > 992) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out'
      });
    });

    // Hover state for links and buttons
    const hoverElements = document.querySelectorAll('a, button, .magnetic, .skill-tags span');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // 3. Magnetic Buttons effect
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
  });

  // Photo 3D Tilt Effect
  const profileCard = document.querySelector('.tilt-effect');
  if (profileCard && window.innerWidth > 992) {
    profileCard.addEventListener('mousemove', (e) => {
      const rect = profileCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(profileCard, {
        rotationY: x * 0.05,
        rotationX: -y * 0.05,
        transformPerspective: 900,
        ease: 'power2.out',
        duration: 0.5
      });
    });
    profileCard.addEventListener('mouseleave', () => {
      gsap.to(profileCard, { rotationY: 0, rotationX: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
    });
  }

  // 4. Loader Animation & WebGL Init
  const loader = document.querySelector('.loader');
  initWebGL();

  setTimeout(() => {
    gsap.to(loader, {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut',
      onComplete: playEntranceAnimations
    });
  }, 1500);

  // 5. Smooth Scroll Initialization (Lenis)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // 6. Navbar logic
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 7. Scroll Animations (GSAP)
  function playEntranceAnimations() {
    gsap.from('.animate-up', {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    });
  }

  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 85%' },
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      x: -30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1
    });
  });

  gsap.utils.toArray('.project-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 80%' },
      y: 50, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
  });

  // Parallax Images
  gsap.utils.toArray('.parallax-container').forEach(container => {
    const img = container.querySelector('.parallax-img');
    if (img) {
      gsap.to(img, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }
  });

  gsap.utils.toArray('.skill-tags span').forEach((tag) => {
    gsap.from(tag, {
      scrollTrigger: { trigger: '.skills-col', start: 'top 85%' },
      scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
      delay: Math.random() * 0.3
    });
  });
});
