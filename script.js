// Typing Effect
let typeTimeout;
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 50;
const delayBetweenRoles = 2000;

document.addEventListener("DOMContentLoaded", () => {
    // Initialized in separate order in validation section for clearer flow, 
    // but ensured to run via the same typeWriter function.
    // Logic moved to setLanguage to start/restart.
});

function typeWriter() {
    const lang = localStorage.getItem('lang') || 'en';
    // Fallback to EN if translation missing
    const roles = (translations[lang] && translations[lang]["typing.roles"])
        ? translations[lang]["typing.roles"]
        : ["Java Enthusiast", "Problem Solver", "Tech Explorer", "Pizza Lover"];

    const currentRole = roles[roleIndex];
    const typingElement = document.getElementById("typing-text");

    if (!typingElement) return;

    if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = delayBetweenRoles;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
    }

    typeTimeout = setTimeout(typeWriter, typeSpeed);
}

// Particle Network
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 60; // Few particles for clean look
    const connectionDistance = 150;
    const mouseDistance = 200;

    let mouse = { x: null, y: null };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = '#3ddc84'; // Android green
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.3; /** Base opacity */
            ctx.fill();
        }
    }

    function init() {
        resize();
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.update();
            p.draw();

            // Connections
            for (let j = i; j < particles.length; j++) {
                let p2 = particles[j];
                let distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#3ddc84';
                    ctx.globalAlpha = 1 - (distance / connectionDistance);
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Mouse interaction
            if (mouse.x != null) {
                let distance = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
                if (distance < mouseDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#fff'; /* White line to mouse */
                    ctx.globalAlpha = (1 - (distance / mouseDistance)) * 0.5;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
}

// 3D Tilt Effect
function init3DTilt() {
    const cards = document.querySelectorAll('.app-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max -5deg to 5deg
            const rotateY = ((x - centerX) / centerX) * 5;

            // Apply transform to the whole card
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Form Validation
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Particles
    initParticles();

    // 2. Initialize 3D Tilt
    init3DTilt();

    // 3. Initialize Typing Effect
    typeWriter();

    // 4. Initialize Language
    const savedLang = localStorage.getItem('lang') || 'en';
    setLanguage(savedLang);

    // 5. Initialize Form Validation
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', validateForm);
    }

    // 6. Load Apps
    loadApps();
});

async function loadApps() {
    try {
        const response = await fetch('apps.json');
        const apps = await response.json();

        const publicContainer = document.getElementById('public-apps-container');
        const closedContainer = document.getElementById('closed-apps-container');

        let closedAppsCount = 0;

        apps.forEach(app => {
            const article = document.createElement('article');
            article.className = 'app-card';

            // Determine link based on status
            let linkUrl = `https://play.google.com/store/apps/details?id=${app.id}`;
            let linkTextKey = '';

            if (app.status === 'public') {
                linkTextKey = 'apps.public.desc';
            } else if (app.status === 'closed_testing') {
                linkTextKey = 'apps.test.desc';
                closedAppsCount++;
            }

            article.innerHTML = `
                <a href="${linkUrl}" target="_blank">
                    <img src="${app.image}" alt="${app.name} App" class="app-logo">
                </a>
                <h3 class="app-name">${app.name}</h3>
                <a href="${linkUrl}" class="app-link" target="_blank" data-i18n="${linkTextKey}">View</a>
            `;

            if (app.status === 'public' && publicContainer) {
                publicContainer.appendChild(article);
            } else if (app.status === 'closed_testing' && closedContainer) {
                closedContainer.appendChild(article);
            }
        });

        // Handle empty closed apps state
        const testerInfo = document.getElementById('tester-info');
        if (closedAppsCount === 0 && closedContainer) {
            if (testerInfo) {
                testerInfo.style.display = 'none';
            }
            const emptyMessage = document.createElement('p');
            emptyMessage.setAttribute('data-i18n', 'apps.closed.empty');
            // Add some styling inline or class if needed (simplified here)
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.width = '100%';
            emptyMessage.style.color = 'var(--text-secondary)';
            closedContainer.appendChild(emptyMessage);
        } else {
            if (testerInfo) {
                testerInfo.style.display = 'block'; // Ensure it's visible if apps exist
            }
        }

        // Re-initialize 3D tilt for new elements
        init3DTilt();

        // Re-apply current language to translate new elements
        const currentLang = localStorage.getItem('lang') || 'en';
        setLanguage(currentLang);

    } catch (error) {
        console.error('Error loading apps:', error);
    }
}

// Language Logic
function setLanguage(lang) {
    // Save preference
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    // Update buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `btn - ${lang} `) btn.classList.add('active');
    });

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Check if it has child elements that need preservation (simplified logic: just replace HTML)
            el.innerHTML = translations[lang][key];
        }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Handle Privacy Policy specific (Toggle visibility)
    if (document.getElementById('policy-en') && document.getElementById('policy-it')) {
        document.getElementById('policy-en').style.display = lang === 'en' ? 'block' : 'none';
        document.getElementById('policy-it').style.display = lang === 'it' ? 'block' : 'none';
    }

    // Reset Typing Effect
    if (typeof typeTimeout !== 'undefined') {
        clearTimeout(typeTimeout);
        roleIndex = 0;
        charIndex = 0;
        isDeleting = false;
        const typingText = document.getElementById("typing-text");
        if (typingText) {
            typingText.textContent = "";
            typeWriter();
        }
    }
}


function validateForm(e) {
    const name = document.querySelector('input[name="name"]');
    const email = document.querySelector('input[name="email"]');
    const message = document.querySelector('textarea[name="message"]');
    let isValid = true;

    // Reset previous styles
    [name, email, message].forEach(input => {
        input.style.borderColor = 'var(--glass-border)';
    });

    // Name Validation
    if (name.value.trim() === "") {
        isValid = false;
        highlightError(name);
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
        isValid = false;
        highlightError(email);
    }

    // Message Validation
    if (message.value.trim().length < 10) {
        isValid = false;
        highlightError(message);
    }

    if (!isValid) {
        e.preventDefault();
        // Optional: Add a shake animation or toast message here
    }
}

function highlightError(element) {
    element.style.borderColor = '#ff4d4d';
    // Add a shake animation class if defined in CSS
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}
