import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initWebGL } from './webgl.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Loader Animation
  const loader = document.querySelector('.loader');
  
  // Initialize WebGL background
  initWebGL();

  setTimeout(() => {
    gsap.to(loader, {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut',
      onComplete: () => {
        // Trigger initial entrance animations
        playEntranceAnimations();
      }
    });
  }, 1500);

  // 2. Smooth Scroll Initialization (Lenis)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // GSAP + Lenis Integration
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 3. Navbar logic
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 4. Scroll Animations (GSAP)
  
  function playEntranceAnimations() {
    const tl = gsap.timeline();
    
    tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.hero-title-line', { y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power4.out' }, "-=0.4")
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, "-=0.4")
      .from('.hero-cta .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, "-=0.4");
  }

  // Section headers
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Timeline items
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
      },
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: i * 0.1
    });
  });

  // Project cards
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Skills
  gsap.utils.toArray('.skill-tags span').forEach((tag, i) => {
    gsap.from(tag, {
      scrollTrigger: {
        trigger: '.skills-col',
        start: 'top 85%',
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
      delay: Math.random() * 0.5
    });
  });
});
