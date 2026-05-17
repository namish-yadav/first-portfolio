document.addEventListener('DOMContentLoaded', (event) => {
    // Elements
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.getElementById('loading-progress');
    const profilePic = document.querySelector('.profile-pic');
    const username = document.querySelector('.username');
    const bio = document.querySelector('.bio');
    const links = document.querySelectorAll('.link-item');
    const discordBtn = document.getElementById('discordBtn');
    const copyNotification = document.getElementById('copyNotification');
    const modItems = document.querySelectorAll('.mod-item h3');
    const themeSwitch = document.getElementById('theme-switch');
    const backgroundElement = document.querySelector('.background');
    const navButtons = document.querySelectorAll('.nav-button');
    const contactsHeading = document.querySelector('.contacts-heading');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const parallaxText = document.querySelector('.parallax-text');
    const homeContainer = document.querySelector('.home-container');

    // Star Trail
    const starTrail = document.getElementById('star-trail');
    const stars = [];
    const maxStars = 20;

    function createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        starTrail.appendChild(star);
        stars.push(star);

        if (stars.length > maxStars) {
            const oldStar = stars.shift();
            starTrail.removeChild(oldStar);
        }

        setTimeout(() => {
            star.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            star.style.opacity = '0';
        }, 500);
    }

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            createStar(e.clientX, e.clientY);
        }
    });

    // Loading screen animation
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    animateContent();
                }, 500);
            }, 1000);
        }
        loadingProgress.textContent = progress.toFixed(2);
    }, 200);

    // Theme toggle functionality
    themeSwitch.addEventListener('change', function() {
        document.body.classList.toggle('light-theme');
        updateThemeColors();
    });

    function updateThemeColors() {
        if (document.body.classList.contains('light-theme')) {
            document.documentElement.style.setProperty('--c1', '#00ffe1');
            document.documentElement.style.setProperty('--c2', '#ccd1ea');
            document.documentElement.style.setProperty('--text-color', '#000000');
            backgroundElement.style.backgroundImage = "url('background12.gif')";
            contactsHeading.style.textShadow = '0 0 15px #00ffe1';
        } else {
            document.documentElement.style.setProperty('--c1', '#ff0000');
            document.documentElement.style.setProperty('--c2', '#030821');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            backgroundElement.style.backgroundImage = "url('background.gif')";
            contactsHeading.style.textShadow = '0 0 15px #ff0000';
        }
    }

    // Content animation function
    function animateContent() {
        profilePic.style.opacity = '0';
        profilePic.style.transform = 'scale(0.5)';
        setTimeout(() => {
            profilePic.style.transition = 'all 1s ease';
            profilePic.style.opacity = '1';
            profilePic.style.transform = 'scale(1)';
        }, 100);

        [username, bio, contactsHeading].forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'all 1s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300 + index * 200);
        });

        links.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
            setTimeout(() => {
                link.style.transition = 'all 0.8s ease';
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            }, 700 + index * 100);
        });
    }

    // Discord button click event
    discordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText('px93').then(() => {
            copyNotification.style.display = 'block';
            setTimeout(() => {
                copyNotification.style.opacity = '1';
                copyNotification.style.transform = 'translateY(0)';
            }, 10);
            setTimeout(() => {
                copyNotification.style.opacity = '0';
                copyNotification.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    copyNotification.style.display = 'none';
                }, 300);
            }, 2000);
        });
    });

    // Add hover effect for social media buttons
    links.forEach(link => {
        const hoverImage = link.querySelector('.hover-image');
        if (hoverImage) {
            link.addEventListener('mouseenter', () => {
                hoverImage.style.right = '16px';
                hoverImage.style.opacity = '1';
                hoverImage.style.filter = 'blur(0) brightness(1)';
            });
            link.addEventListener('mouseleave', () => {
                hoverImage.style.right = '-40px';
                hoverImage.style.opacity = '0';
                hoverImage.style.filter = 'blur(5px) brightness(0.7)';
            });
        }
    });

    // MODS section toggle
    modItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.nextElementSibling;
            const toggleBtn = item.querySelector('.toggle-btn');
            content.classList.toggle('active');
            toggleBtn.textContent = content.classList.contains('active') ? '-' : '+';
            if (content.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
    });

    // Smooth scroll for nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Image stack animation in loading screen
    const stackImages = document.querySelectorAll('.stack-image');
    let currentIndex = 0;

    function rotateImages() {
        stackImages.forEach((img, index) => {
            if (index === currentIndex) {
                img.style.zIndex = '3';
                img.style.transform = 'rotate(-5deg) scale(1.1)';
                img.style.opacity = '1';
            } else if (index === (currentIndex + 1) % stackImages.length) {
                img.style.zIndex = '2';
                img.style.transform = 'rotate(5deg) scale(1.05)';
                img.style.opacity = '0.7';
            } else {
                img.style.zIndex = '1';
                img.style.transform = 'rotate(-3deg) scale(1)';
                img.style.opacity = '0.5';
            }
        });
        currentIndex = (currentIndex + 1) % stackImages.length;
    }

    // Start image rotation
    let rotationInterval = setInterval(rotateImages, 2000);

    // Add click event to change GIF
    document.querySelector('.image-stack').addEventListener('click', () => {
        clearInterval(rotationInterval);
        rotateImages();
        rotationInterval = setInterval(rotateImages, 2000);
    });

    // Stop rotation when loading is complete
    window.addEventListener('load', () => {
        clearInterval(rotationInterval);
    });

    // Parallax effect for background and text (desktop only)
    window.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            if (backgroundElement) {
                backgroundElement.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
            }
            
            if (parallaxText) {
                const edgeLayer = parallaxText.querySelector('.edge');
                const glowLayer = parallaxText.querySelector('.glow');
                
                if (edgeLayer && glowLayer) {
                    edgeLayer.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
                    glowLayer.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
                }
            }
        }
    });

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when a menu item is clicked
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Scroll-based animations
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Parallax effect for home container (desktop only)
        if (window.innerWidth > 768 && homeContainer) {
            homeContainer.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        }

        // Fade in elements as they come into view
        document.querySelectorAll('.fade-in-element').forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight * 0.75) {
                element.classList.add('visible');
            }
        });
    });

    // Function to check if the device is mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Adjust parallax text for mobile devices
    function adjustParallaxTextForMobile() {
        if (isMobile() && parallaxText) {
            const edgeLayer = parallaxText.querySelector('.edge');
            const glowLayer = parallaxText.querySelector('.glow');
            
            if (edgeLayer && glowLayer) {
                edgeLayer.style.transform = 'translateX(-5px)';
                glowLayer.style.transform = 'translateX(5px)';
            }
        }
    }

    // Call the function on load and resize
    window.addEventListener('load', adjustParallaxTextForMobile);
    window.addEventListener('resize', adjustParallaxTextForMobile);

    // Initialize theme
    updateThemeColors();

    // Fix for mobile button glitch
    if (isMobile()) {
        links.forEach(link => {
            const hoverImage = link.querySelector('.hover-image');
            if (hoverImage) {
                link.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    hoverImage.style.right = '16px';
                    hoverImage.style.opacity = '1';
                    hoverImage.style.filter = 'blur(0) brightness(1)';
                });
                link.addEventListener('touchend', () => {
                    setTimeout(() => {
                        hoverImage.style.right = '-40px';
                        hoverImage.style.opacity = '0';
                        hoverImage.style.filter = 'blur(5px) brightness(0.7)';
                    }, 300);
                });
            }
        });
    }
});

