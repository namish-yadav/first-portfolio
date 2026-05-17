document.addEventListener('DOMContentLoaded', () => {

    // ─── Elements ──────────────────────────────────────────────────────────────
    const loadingScreen     = document.getElementById('loading-screen');
    const loadingProgress   = document.getElementById('loading-progress');
    const loadingContent    = document.querySelector('.loading-content');
    const profilePic        = document.querySelector('.profile-pic');
    const username          = document.querySelector('.username');
    const bio               = document.querySelector('.bio');
    const links             = document.querySelectorAll('.link-item');
    const discordBtn        = document.getElementById('discordBtn');
    const copyNotification  = document.getElementById('copyNotification');
    const modItems          = document.querySelectorAll('.mod-item h3');
    const themeSwitch       = document.getElementById('theme-switch');
    const backgroundElement = document.querySelector('.background');
    const navButtons        = document.querySelectorAll('.nav-button');
    const contactsHeading   = document.querySelector('.contacts-heading');
    const mobileMenuToggle  = document.querySelector('.mobile-menu-toggle');
    const mobileMenu        = document.querySelector('.mobile-menu');
    const parallaxText      = document.querySelector('.parallax-text');
    const homeContainer     = document.querySelector('.home-container');
  
    // ─── Premium Cursor Trail (desktop only) ───────────────────────────────────
    const isDesktop = () => window.innerWidth > 768;
  
    if (isDesktop()) {
      const canvas = document.createElement('canvas');
      canvas.id = 'cursor-canvas';
      Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '9999',
      });
      document.body.appendChild(canvas);
  
      const ctx = canvas.getContext('2d');
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      resize();
      window.addEventListener('resize', resize);
  
      const mouse = { x: -300, y: -300 };
      let hue = 10; // start near red to match --c1
      const particles = [];
      const MAX_P = 90;
      const TRAIL_LEN = 24;
      const trail = [];
  
      class Particle {
        constructor(x, y, h) {
          this.x = x; this.y = y; this.hue = h;
          this.size    = Math.random() * 4 + 1.5;
          this.life    = 1;
          this.decay   = Math.random() * 0.016 + 0.011;
          this.vx      = (Math.random() - 0.5) * 1.8;
          this.vy      = (Math.random() - 0.5) * 1.8;
          this.gravity = 0.04;
        }
        update() {
          this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
          this.life -= this.decay; this.size *= 0.968;
        }
        draw() {
          ctx.save();
          ctx.globalAlpha = Math.max(0, this.life);
          const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.6);
          g.addColorStop(0,   `hsla(${this.hue},100%,80%,1)`);
          g.addColorStop(0.4, `hsla(${this.hue},100%,60%,0.5)`);
          g.addColorStop(1,   `hsla(${this.hue},100%,40%,0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
  
      document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX; mouse.y = e.clientY;
        hue = (hue + 1.2) % 360;
        for (let i = 0; i < 3; i++) {
          particles.push(new Particle(
            mouse.x + (Math.random() - 0.5) * 8,
            mouse.y + (Math.random() - 0.5) * 8,
            hue + (Math.random() * 24 - 12)
          ));
        }
        trail.push({ x: mouse.x, y: mouse.y, h: hue });
        if (trail.length > TRAIL_LEN) trail.shift();
      });
  
      // Click burst
      document.addEventListener('click', (e) => {
        for (let i = 0; i < 20; i++) {
          const p = new Particle(e.clientX, e.clientY, hue + (Math.random() * 50 - 25));
          p.vx = (Math.random() - 0.5) * 7;
          p.vy = (Math.random() - 0.5) * 7;
          p.size = Math.random() * 5 + 2;
          p.decay = 0.02;
          particles.push(p);
        }
      });
  
      function drawTrail() {
        if (trail.length < 2) return;
        for (let i = 1; i < trail.length; i++) {
          const t = i / trail.length;
          ctx.save();
          ctx.globalAlpha = t * 0.5;
          ctx.strokeStyle = `hsl(${trail[i].h},100%,65%)`;
          ctx.lineWidth   = t * 3;
          ctx.lineCap     = 'round';
          ctx.shadowBlur  = 8;
          ctx.shadowColor = `hsl(${trail[i].h},100%,65%)`;
          ctx.beginPath();
          ctx.moveTo(trail[i-1].x, trail[i-1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
          ctx.restore();
        }
      }
  
      function drawOrb(x, y) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0,   `hsla(${hue},100%,95%,0.95)`);
        g.addColorStop(0.3, `hsla(${hue},100%,70%,0.6)`);
        g.addColorStop(1,   `hsla(${hue},100%,50%,0)`);
        ctx.save();
        ctx.shadowBlur  = 20;
        ctx.shadowColor = `hsl(${hue},100%,65%)`;
        ctx.fillStyle   = g;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
  
      (function loop() {
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTrail();
        drawOrb(mouse.x, mouse.y);
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update(); particles[i].draw();
          if (particles[i].life <= 0 || particles[i].size < 0.3) particles.splice(i, 1);
        }
        while (particles.length > MAX_P) particles.shift();
        requestAnimationFrame(loop);
      })();
    }
  
    // ─── Loading Screen ────────────────────────────────────────────────────────
    let progress = 0;
    const loadingInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);
  
        // Update CSS var for loading bar
        if (loadingContent) loadingContent.style.setProperty('--load-pct', '100%');
  
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            animateContent();
          }, 700);
        }, 800);
      }
      loadingProgress.textContent = progress.toFixed(2);
      // Sync CSS loading bar
      if (loadingContent) loadingContent.style.setProperty('--load-pct', progress + '%');
    }, 200);
  
    // ─── Theme Toggle ──────────────────────────────────────────────────────────
    themeSwitch.addEventListener('change', () => {
      document.body.classList.toggle('light-theme');
      updateThemeColors();
    });
  
    function updateThemeColors() {
      const light = document.body.classList.contains('light-theme');
      if (light) {
        document.documentElement.style.setProperty('--c1', '#0057ff');
        document.documentElement.style.setProperty('--c2', '#00c2ff');
        document.documentElement.style.setProperty('--c1-dim', 'rgba(0,87,255,0.12)');
        document.documentElement.style.setProperty('--c1-glow', 'rgba(0,87,255,0.4)');
        document.documentElement.style.setProperty('--text-color', '#0d0d14');
        if (backgroundElement) backgroundElement.style.backgroundImage = "url('background12.gif')";
      } else {
        document.documentElement.style.setProperty('--c1', '#ff2d2d');
        document.documentElement.style.setProperty('--c2', '#ff6b00');
        document.documentElement.style.setProperty('--c1-dim', 'rgba(255,45,45,0.18)');
        document.documentElement.style.setProperty('--c1-glow', 'rgba(255,45,45,0.5)');
        document.documentElement.style.setProperty('--text-color', '#f0ece8');
        if (backgroundElement) backgroundElement.style.backgroundImage = "url('background.gif')";
      }
    }
  
    // ─── Content Entrance Animation ────────────────────────────────────────────
    function animateContent() {
      // Profile pic — scale in
      profilePic.style.opacity = '0';
      profilePic.style.transform = 'scale(0.6)';
      setTimeout(() => {
        profilePic.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
        profilePic.style.opacity = '1';
        profilePic.style.transform = 'scale(1)';
      }, 80);
  
      // Stagger text elements
      [username, bio, contactsHeading].forEach((el, i) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 260 + i * 140);
      });
  
      // Stagger links
      links.forEach((link, i) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-12px)';
        setTimeout(() => {
          link.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.3,0.64,1)';
          link.style.opacity = '1';
          link.style.transform = 'translateX(0)';
        }, 550 + i * 80);
      });
    }
  
    // ─── Discord Copy ──────────────────────────────────────────────────────────
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText('px93').then(() => {
        copyNotification.style.display = 'block';
        setTimeout(() => {
          copyNotification.style.opacity = '1';
          copyNotification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        setTimeout(() => {
          copyNotification.style.opacity = '0';
          copyNotification.style.transform = 'translateX(-50%) translateY(10px)';
          setTimeout(() => { copyNotification.style.display = 'none'; }, 300);
        }, 2000);
      });
    });
  
    // ─── Social Link Hover Images ──────────────────────────────────────────────
    links.forEach(link => {
      const hoverImage = link.querySelector('.hover-image');
      if (!hoverImage) return;
      link.addEventListener('mouseenter', () => {
        hoverImage.style.right = '14px';
        hoverImage.style.opacity = '1';
        hoverImage.style.filter = 'blur(0) brightness(1)';
      });
      link.addEventListener('mouseleave', () => {
        hoverImage.style.right = '-50px';
        hoverImage.style.opacity = '0';
        hoverImage.style.filter = 'blur(6px) brightness(0.7)';
      });
    });
  
    // ─── Mods Toggle ──────────────────────────────────────────────────────────
    modItems.forEach(item => {
      item.addEventListener('click', () => {
        const content   = item.nextElementSibling;
        const toggleBtn = item.querySelector('.toggle-btn');
        const isOpen    = content.classList.contains('active');
        content.classList.toggle('active');
        toggleBtn.textContent = isOpen ? '+' : '−';
        content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
      });
    });
  
    // ─── Smooth Scroll Nav ─────────────────────────────────────────────────────
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('href')?.substring(1);
        if (!id) return;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  
    // ─── Image Stack (Loading Screen) ─────────────────────────────────────────
    const stackImages = document.querySelectorAll('.stack-image');
    let currentIndex = 0;
  
    function rotateImages() {
      stackImages.forEach((img, i) => {
        if (i === currentIndex) {
          img.style.zIndex = '3';
          img.style.transform = 'rotate(-4deg) scale(1.08)';
          img.style.opacity = '1';
        } else if (i === (currentIndex + 1) % stackImages.length) {
          img.style.zIndex = '2';
          img.style.transform = 'rotate(4deg) scale(1.04)';
          img.style.opacity = '0.65';
        } else {
          img.style.zIndex = '1';
          img.style.transform = 'rotate(-2deg) scale(1)';
          img.style.opacity = '0.4';
        }
      });
      currentIndex = (currentIndex + 1) % stackImages.length;
    }
  
    let rotationInterval = setInterval(rotateImages, 2000);
  
    document.querySelector('.image-stack')?.addEventListener('click', () => {
      clearInterval(rotationInterval);
      rotateImages();
      rotationInterval = setInterval(rotateImages, 2000);
    });
  
    window.addEventListener('load', () => clearInterval(rotationInterval));
  
    // ─── Parallax (Desktop) ────────────────────────────────────────────────────
    window.addEventListener('mousemove', (e) => {
      if (!isDesktop()) return;
      const mx = e.clientX / window.innerWidth;
      const my = e.clientY / window.innerHeight;
  
      if (backgroundElement) {
        backgroundElement.style.transform = `translate(${mx * 8}px, ${my * 8}px)`;
      }
  
      if (parallaxText) {
        const edge = parallaxText.querySelector('.edge');
        const glow = parallaxText.querySelector('.glow');
        if (edge) edge.style.transform = `translate(${mx * 18}px, ${my * 18}px)`;
        if (glow) glow.style.transform = `translate(${mx * 9}px, ${my * 9}px)`;
      }
    });
  
    // ─── Mobile Menu ───────────────────────────────────────────────────────────
    mobileMenuToggle?.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        mobileMenuToggle?.classList.remove('active');
        mobileMenu?.classList.remove('active');
      });
    });
  
    // ─── Scroll Animations ─────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      const wh = window.innerHeight;
  
      if (isDesktop() && homeContainer) {
        homeContainer.style.transform = `translateY(${sy * 0.28}px)`;
      }
  
      document.querySelectorAll('.fade-in-element').forEach(el => {
        if (el.getBoundingClientRect().top < wh * 0.8) {
          el.classList.add('visible');
        }
      });
    });
  
    // ─── Mobile Parallax Adjust ────────────────────────────────────────────────
    function adjustParallaxMobile() {
      if (isMobileUA() && parallaxText) {
        const edge = parallaxText.querySelector('.edge');
        const glow = parallaxText.querySelector('.glow');
        if (edge) edge.style.transform = 'translateX(-4px)';
        if (glow) glow.style.transform = 'translateX(4px)';
      }
    }
  
    function isMobileUA() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  
    window.addEventListener('load', adjustParallaxMobile);
    window.addEventListener('resize', adjustParallaxMobile);
  
    // ─── Mobile Touch Fix for Hover Images ────────────────────────────────────
    if (isMobileUA()) {
      links.forEach(link => {
        const hoverImage = link.querySelector('.hover-image');
        if (!hoverImage) return;
        link.addEventListener('touchstart', (e) => {
          e.preventDefault();
          hoverImage.style.right = '14px';
          hoverImage.style.opacity = '1';
          hoverImage.style.filter = 'blur(0) brightness(1)';
        });
        link.addEventListener('touchend', () => {
          setTimeout(() => {
            hoverImage.style.right = '-50px';
            hoverImage.style.opacity = '0';
            hoverImage.style.filter = 'blur(6px) brightness(0.7)';
          }, 300);
        });
      });
    }
  
    // ─── Init ──────────────────────────────────────────────────────────────────
    updateThemeColors();
  
  });