document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLang = 'es';


    // --- TYPEWRITER EFFECT ---
    const typewriterElement = document.getElementById('typewriter');
    const rolesByLang = {
        es: [
            'Desarrollador Full Stack',
            'Graduado en DAW',
            'Estudiante de ASIX'
        ],
        en: [
            'Full Stack Developer',
            'DAW Graduate',
            'ASIX Student'
        ]
    };
    let roleIndex = 0;
    // El primer rol ya viene escrito en el HTML (para buscadores): la animación arranca desde ahí
    let charIndex = typewriterElement && typewriterElement.textContent === rolesByLang.es[0] ? rolesByLang.es[0].length : 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentRoles = rolesByLang[currentLang] || rolesByLang.es;
        const currentRole = currentRoles[roleIndex % currentRoles.length];
        
        if (isDeleting) {
            typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Deleting is faster
        } else {
            typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 1500; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % currentRoles.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(type, typeSpeed);
    }
    
    // Start Typewriter
    if (typewriterElement) {
        setTimeout(type, 800);
    }


    // --- SCROLL REVEAL (INTERSECTION OBSERVER) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px' // Triggers slightly before entry
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // --- LANGUAGE SWITCHER INTERACTIVITY ---
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang !== currentLang) {
                currentLang = lang;
                
                // Toggle active class on language buttons
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Translate the HTML page elements
                translatePage(lang);
            }
        });
    });

    function translatePage(lang) {
        // Keep the document language in sync (accessibility + crawlers that run JS)
        document.documentElement.lang = lang;

        // Translate elements carrying data-translate attributes
        const translatables = document.querySelectorAll('[data-translate]');
        translatables.forEach(el => {
            const translation = el.getAttribute(`data-${lang}`);
            if (translation) {
                el.innerHTML = translation;
            }
        });
        
        // Translate placeholders
        const placeholderInputs = document.querySelectorAll('[data-translate-placeholder]');
        placeholderInputs.forEach(input => {
            const translation = input.getAttribute(`data-placeholder-${lang}`);
            if (translation) {
                input.placeholder = translation;
            }
        });

        // Update CV download link and filename dynamically based on language
        const cvLink = document.querySelector('.cv-link');
        if (cvLink) {
            if (lang === 'en') {
                cvLink.href = 'cv/cv-en.pdf';
                cvLink.setAttribute('download', 'CV_Ferran_Farina_EN.pdf');
            } else {
                cvLink.href = 'cv/cv-es.pdf';
                cvLink.setAttribute('download', 'CV_Ferran_Farina_ES.pdf');
            }
        }
        
        // Reset typewriter animations to prevent text overlaps
        charIndex = 0;
        isDeleting = false;
        
        // Clear terminal output log history on language changes
        if (terminalOutputContainer) {
            terminalOutputContainer.innerHTML = '';
        }

        // Re-render icons injected by the translated HTML
        if (window.lucide) {
            lucide.createIcons();
        }
    }


    // --- INTERACTIVE TERMINAL ---
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    const terminalOutputContainer = document.getElementById('terminal-output-container');

    // Autofocus input when clicking anywhere inside terminal body
    if (terminalBody) {
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandText = terminalInput.value.trim();
                if (commandText) {
                    processCommand(commandText);
                }
                terminalInput.value = '';
            }
        });
    }

    function processCommand(cmd) {
        const lowerCmd = cmd.toLowerCase().trim();
        let commandKey = lowerCmd;
        
        // Command alias mapping (ES -> EN key names)
        const aliases = {
            'ayuda': 'help',
            'sobremi': 'about',
            'sobre-mi': 'about',
            'habilidades': 'skills',
            'proyectos': 'projects',
            'contacto': 'contact',
            'estudios': 'education',
            'educacion': 'education',
            'educación': 'education',
            'experiencia': 'experience',
            'certificaciones': 'certifications',
            'certificados': 'certifications',
            'limpiar': 'clear'
        };
        
        if (aliases[lowerCmd]) {
            commandKey = aliases[lowerCmd];
        }
        
        // Append entered command line to output log
        const cmdLine = document.createElement('div');
        cmdLine.className = 'terminal-line';
        cmdLine.innerHTML = `<span class="prompt">guest@ferran:~$</span> <span class="terminal-history-command">${escapeHTML(cmd)}</span>`;
        terminalOutputContainer.appendChild(cmdLine);

        // Define response element
        let responseLine = document.createElement('div');
        responseLine.className = 'terminal-line terminal-history-response';

        // Conditional Command Interpreter
        if (currentLang === 'es') {
            switch(commandKey) {
                case 'help':
                    responseLine.innerHTML = `Comandos disponibles:
  <span class="cmd-highlight">about</span>          - Quién soy y qué hago
  <span class="cmd-highlight">skills</span>         - Resumen del stack tecnológico
  <span class="cmd-highlight">projects</span>       - Proyectos recientes destacados
  <span class="cmd-highlight">education</span>      - Estudios y formación académica
  <span class="cmd-highlight">experience</span>     - Trayectoria y experiencia profesional
  <span class="cmd-highlight">certifications</span> - Certificaciones obtenidas
  <span class="cmd-highlight">contact</span>        - Información de contacto
  <span class="cmd-highlight">socials</span>        - Enlaces a perfiles profesionales
  <span class="cmd-highlight">clear</span>          - Limpiar historial de pantalla
  <span class="cmd-highlight">secret</span>         - ???`;
                    break;
                    
                case 'about':
                    responseLine.innerHTML = `[SOBRE MÍ]
Desarrollador Full Stack. Graduado en SMX por el ITB, graduado en DAW por la Escola del Treball y actualmente cursando ASIX en el Institut Puig Castellar.

Combino desarrollo web (React, PHP, SQL) con administración de sistemas: automatización con PowerShell, Bash y Microsoft Entra ID (Azure AD), servidores Linux y Windows Server, contenedores con Docker e infraestructura en Cloudflare. Mi enfoque consiste en unir código eficiente con infraestructuras seguras y altamente disponibles.`;
                    break;
                    
                case 'skills':
                    responseLine.innerHTML = `[TECNOLOGÍAS]
• <span class="cmd-highlight">Frontend:</span> HTML, CSS, JavaScript, TypeScript, React, React Native, Tailwind CSS, XML
• <span class="cmd-highlight">Backend y BBDD:</span> Node.js, PHP, Laravel, Java, MySQL, PostgreSQL, Supabase, WordPress
• <span class="cmd-highlight">Sistemas y Cloud:</span> Linux, Windows Server, Active Directory, Azure, Entra ID, PowerShell, Bash, Docker, Cloudflare
• <span class="cmd-highlight">Herramientas:</span> Git, Herramientas Microsoft, SEO técnico, Gemini AI, Expo Go
• <span class="cmd-highlight">Blandas:</span> Comunicación, Trabajo en equipo, Resolutivo, Adaptabilidad, Aprendizaje rápido`;
                    break;
                    
                case 'projects':
                    responseLine.innerHTML = `[PROYECTOS]
1. <span class="cmd-highlight">WhoPayNow:</span> App móvil inteligente para dividir gastos con escaneo de tickets mediante IA.
Haz clic en la tarjeta del proyecto para ver los detalles.`;
                    break;
                    
                case 'education':
                    responseLine.innerHTML = `[ESTUDIOS / EDUCACIÓN]
1. <span class="cmd-highlight">ASIX (Administración de Sistemas Informáticos en Red)</span>
   Institut Puig Castellar | 2026 - Presente
2. <span class="cmd-highlight">DAW (Desarrollo de Aplicaciones Web)</span>
   Escola del Treball de Barcelona | 2024 - 2026
3. <span class="cmd-highlight">SMX (Sistemas Microinformáticos y Redes)</span>
   Institut Tecnològic de Barcelona (ITB) | 2022 - 2024`;
                    break;
                    
                case 'experience':
                    responseLine.innerHTML = `[EXPERIENCIA LABORAL]
1. <span class="cmd-highlight">Desarrollador Full Stack</span>
   BAU, Centre Universitari d'Arts i Disseny | Marzo de 2026 - Presente
   • Responsable de las aplicaciones y portales web de la universidad y del desarrollo continuo del sistema de gestión universitaria (UMS). Automatización de usuarios y permisos con PowerShell y Microsoft Entra ID, SEO técnico e infraestructura en VPS y Cloudflare.
2. <span class="cmd-highlight">Desarrollador Full Stack (Prácticas)</span>
   BAU, Centre Universitari d'Arts i Disseny | Julio de 2025 - Febrero de 2026
   • Gestión de las plataformas web y aplicaciones de la universidad, y diseño y desarrollo de un nuevo sistema de gestión universitaria (UMS).
3. <span class="cmd-highlight">Técnico de Soporte TI (Prácticas Erasmus+)</span>
   VINOR SERVIZ LTD - Sofía, Bulgaria | Junio de 2024
   • Tareas de soporte técnico, redes locales y ofimática realizadas íntegramente en inglés.`;
                    break;
                    
                case 'certifications':
                    responseLine.innerHTML = `[CERTIFICACIONES]
• Actualmente no hay certificaciones registradas.`;
                    break;
                    
                case 'contact':
                    responseLine.innerHTML = `[CONTACTO]
• Email: <a href="mailto:contactferranfl@gmail.com" style="color: var(--neon-cyan)">contactferranfl@gmail.com</a>
• LinkedIn: <a href="https://www.linkedin.com/in/ferran-farinya/" target="_blank" rel="noopener noreferrer" style="color: var(--neon-cyan)">linkedin.com/in/ferran-farinya</a>`;
                    break;
                    
                case 'socials':
                    responseLine.innerHTML = `[SOCIALS]
• LinkedIn: <a href="https://www.linkedin.com/in/ferran-farinya/" target="_blank" rel="noopener noreferrer" style="color: var(--neon-purple)">linkedin.com/in/ferran-farinya</a>`;
                    break;

                case 'clear':
                    terminalOutputContainer.innerHTML = '';
                    responseLine = null; // Don't append empty response
                    break;
                    
                case 'secret':
                    responseLine.innerHTML = `[MATRIX DIAGNOSTICS ACTIVE]
01000110 01000101 01010010 01010010 01000001 01001110 
F E R R A N _ I N I T I A L I Z E D
Has accedido al subsistema secreto. ¡El código dominará el mundo! 🕶️`;
                    break;
                    
                default:
                    responseLine.innerHTML = `Comando no reconocido: "${escapeHTML(cmd)}". 
Escribe <span class="cmd-highlight">help</span> para ver la lista de comandos válidos.`;
            }
        } else {
            // ENGLISH
            switch(commandKey) {
                case 'help':
                    responseLine.innerHTML = `Available commands:
  <span class="cmd-highlight">about</span>          - Who I am and what I do
  <span class="cmd-highlight">skills</span>         - Tech stack summary
  <span class="cmd-highlight">projects</span>       - Featured recent projects
  <span class="cmd-highlight">education</span>      - Academic background and degrees
  <span class="cmd-highlight">experience</span>     - Work experience history
  <span class="cmd-highlight">certifications</span> - Professional certifications
  <span class="cmd-highlight">contact</span>        - Contact information
  <span class="cmd-highlight">socials</span>        - Links to professional profiles
  <span class="cmd-highlight">clear</span>          - Clear terminal screen
  <span class="cmd-highlight">secret</span>         - ???`;
                    break;
                    
                case 'about':
                    responseLine.innerHTML = `[ABOUT ME]
Full Stack Developer. Graduate in SMX from ITB, graduate in DAW from Escola del Treball, and currently studying ASIX at Institut Puig Castellar.

I combine web development (React, PHP, SQL) with systems administration: automation with PowerShell, Bash and Microsoft Entra ID (Azure AD), Linux and Windows Server administration, Docker containers and Cloudflare infrastructure. My goal is bridging clean, efficient code with secure and highly available systems.`;
                    break;
                    
                case 'skills':
                    responseLine.innerHTML = `[TECH STACK]
• <span class="cmd-highlight">Frontend:</span> HTML, CSS, JavaScript, TypeScript, React, React Native, Tailwind CSS, XML
• <span class="cmd-highlight">Backend & DB:</span> Node.js, PHP, Laravel, Java, MySQL, PostgreSQL, Supabase, WordPress
• <span class="cmd-highlight">Systems & Cloud:</span> Linux, Windows Server, Active Directory, Azure, Entra ID, PowerShell, Bash, Docker, Cloudflare
• <span class="cmd-highlight">Tools:</span> Git, Microsoft Tools, Technical SEO, Gemini AI, Expo Go
• <span class="cmd-highlight">Soft Skills:</span> Communication, Teamwork, Problem Solver, Adaptability, Quick Learner`;
                    break;
                    
                case 'projects':
                    responseLine.innerHTML = `[FEATURED PROJECTS]
1. <span class="cmd-highlight">WhoPayNow:</span> Smart mobile app to split group expenses with AI receipt scanning.
Click the project card to see the details.`;
                    break;
                    
                case 'education':
                    responseLine.innerHTML = `[EDUCATION & DEGREES]
1. <span class="cmd-highlight">ASIX (Network Computer Systems Administration)</span>
   Institut Puig Castellar | 2026 - Present
2. <span class="cmd-highlight">DAW (Web Application Development)</span>
   Escola del Treball de Barcelona | 2024 - 2026
3. <span class="cmd-highlight">SMX (Microcomputer Systems and Networks)</span>
   Institut Tecnològic de Barcelona (ITB) | 2022 - 2024`;
                    break;
                    
                case 'experience':
                    responseLine.innerHTML = `[WORK EXPERIENCE]
1. <span class="cmd-highlight">Full Stack Developer</span>
   BAU, Centre Universitari d'Arts i Disseny | March 2026 - Present
   • Responsible for the university's web applications and portals and for the ongoing development of the University Management System (UMS). User and permission automation with PowerShell and Microsoft Entra ID, technical SEO, and VPS and Cloudflare infrastructure.
2. <span class="cmd-highlight">Full Stack Developer (Internship)</span>
   BAU, Centre Universitari d'Arts i Disseny | July 2025 - February 2026
   • Management of the university's web platforms and applications, and design and development of a new University Management System (UMS).
3. <span class="cmd-highlight">IT Support Technician (Erasmus+ Internship)</span>
   VINOR SERVIZ LTD - Sofia, Bulgaria | June 2024
   • Support tasks, local networking, and office automation (conducted entirely in English).`;
                    break;
                    
                case 'certifications':
                    responseLine.innerHTML = `[CERTIFICATIONS]
• No certifications registered at the moment.`;
                    break;
                    
                case 'contact':
                    responseLine.innerHTML = `[CONTACT]
• Email: <a href="mailto:contactferranfl@gmail.com" style="color: var(--neon-cyan)">contactferranfl@gmail.com</a>
• LinkedIn: <a href="https://www.linkedin.com/in/ferran-farinya/" target="_blank" rel="noopener noreferrer" style="color: var(--neon-cyan)">linkedin.com/in/ferran-farinya</a>`;
                    break;
                    
                case 'socials':
                    responseLine.innerHTML = `[SOCIALS]
• LinkedIn: <a href="https://www.linkedin.com/in/ferran-farinya/" target="_blank" rel="noopener noreferrer" style="color: var(--neon-purple)">linkedin.com/in/ferran-farinya</a>`;
                    break;
                    
                case 'clear':
                    terminalOutputContainer.innerHTML = '';
                    responseLine = null;
                    break;
                    
                case 'secret':
                    responseLine.innerHTML = `[MATRIX DIAGNOSTICS ACTIVE]
01000110 01000101 01010010 01010010 01000001 01001110 
F E R R A N _ I N I T I A L I Z E D
You have accessed the secret subsystem. Code will rule the world! 🕶️`;
                    break;
                    
                default:
                    responseLine.innerHTML = `Command not recognized: "${escapeHTML(cmd)}". 
Type <span class="cmd-highlight">help</span> to view all valid commands.`;
            }
        }

        if (responseLine) {
            terminalOutputContainer.appendChild(responseLine);
        }

        // Scroll terminal to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Helper function to escape HTML variables
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }


    // --- PROJECT DETAILS DATA ---
    const projectDetails = {
        whopaynow: {
            title: "WhoPayNow",
            layout: "mobile",
            images: ["img/project_whopaynow_1.jpg", "img/project_whopaynow_2.jpg", "img/project_whopaynow_3.jpg", "img/project_whopaynow_4.jpg", "img/project_whopaynow_5.jpg", "img/project_whopaynow_6.jpg"],
            tags: ["React Native", "Expo", "Supabase", "Gemini AI", "Tailwind CSS"],
            es: {
                subtitle: "Aplicación móvil inteligente para dividir gastos compartidos",
                desc: `WhoPayNow es una aplicación móvil nativa diseñada para eliminar las matemáticas incómodas a la hora de dividir gastos compartidos (viajes, cenas, alquileres).
                <br><br>
                <b>Características clave:</b><br>
                • <b>Escaneo de Tickets con IA:</b> Procesa la imagen del ticket de compra mediante Google Gemini 1.5 Flash para extraer artículos y precios, permitiendo asignarlos de forma interactiva.<br>
                • <b>Reparto Personalizado Inteligente:</b> Controla importes individuales en tiempo real limitando el total para evitar errores en las sumas.<br>
                • <b>Soporte Multidivisa Avanzado:</b> Configuración de grupos en cualquiera de las 38 divisas principales, formateando automáticamente balances y notificaciones.<br>
                • <b>Tablón de la Vergüenza:</b> Identifica dinámicamente al máximo deudor asignándole la divertida "Insignia de la Rata" (🐀) y facilitando recordatorios rápidos y graciosos de cobro vía WhatsApp.<br>
                • <b>Papelera de Gastos Segura:</b> Borrado lógico para restaurar cualquier gasto eliminado con un toque y recalcular los balances al instante.`
            },
            en: {
                subtitle: "Intelligent mobile app to split group expenses",
                desc: `WhoPayNow is a native mobile application designed to eliminate awkward math and friction when dividing shared group expenses (trips, dinners, rent).
                <br><br>
                <b>Key Features:</b><br>
                • <b>AI Receipt Scanning:</b> Take a photo of the receipt and Google Gemini 1.5 Flash automatically extracts items, quantities, and prices for interactive assignment.<br>
                • <b>Smart Manual Splitting:</b> Control individual inputs in real-time, enforcing constraints so group sums never exceed the total cost.<br>
                • <b>Advanced Multi-Currency Support:</b> Set up groups with any of the 38 major global currencies, automatically formatting balances and alerts.<br>
                • <b>Board of Shame:</b> Dynamically flags the top debtor with a funny "Rat Badge" (🐀) and enables quick, humorous payment reminders via WhatsApp.<br>
                • <b>Secure Trash Bin:</b> Logical deletion flags that let you restore any deleted expense in one tap and recalculate group balances instantly.`
            }
        }
    };

    // --- MODAL ENGINE ---
    const projectModal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalBodyContent = document.getElementById('modal-body-content');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectCards && projectModal) {
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // If clicking external links inside project footer, do not open modal
                if (e.target.closest('a.proj-link')) {
                    return;
                }
                const id = card.getAttribute('data-project-id');
                if (id && projectDetails[id]) {
                    openModal(id);
                }
            });
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal on clicking overlay
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeModal();
            }
        });
        
        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function openModal(id) {
        const proj = projectDetails[id];
        const langData = proj[currentLang] || proj.es;
        
        // Generate tags markup
        const tagsMarkup = proj.tags.map(tag => `<span class="proj-tag">${tag}</span>`).join('');

        if (proj.layout === 'mobile') {
            // Generate side-by-side mini phone mockups gallery
            const galleryMarkup = proj.images.map((img, i) => `
                <div class="phone-mockup-mini">
                    <div class="phone-screen-mini">
                        <img src="${img}" alt="${currentLang === 'en' ? `${proj.title} app screen ${i + 1}` : `Pantalla ${i + 1} de la app ${proj.title}`}" loading="lazy" decoding="async">
                    </div>
                </div>
            `).join('');

            modalBodyContent.innerHTML = `
                <div class="modal-padded">
                    <div class="modal-project-header">
                        <h2>${proj.title}</h2>
                        <p class="modal-subtitle">${langData.subtitle}</p>
                        <div class="project-tags">${tagsMarkup}</div>
                    </div>
                </div>

                <div class="modal-mobile-gallery">
                    ${galleryMarkup}
                </div>

                <div class="modal-padded">
                    <div class="modal-project-desc">
                        <p>${langData.desc}</p>
                    </div>
                </div>
            `;
        } else {
            // Generate slides and dots markup for standard widescreen carousel
            const slidesMarkup = proj.images.map(img => `
                <div class="carousel-slide">
                    <img src="${img}" alt="${proj.title} detail photo">
                </div>
            `).join('');
            
            const dotsMarkup = proj.images.map((_, i) => `
                <span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');

            const carouselHtml = `
                <div class="modal-carousel">
                    <div class="carousel-track" id="carousel-track">
                        ${slidesMarkup}
                    </div>
                    <button class="carousel-btn prev" id="carousel-prev" aria-label="Previous image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button class="carousel-btn next" id="carousel-next" aria-label="Next image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                    <div class="carousel-dots" id="carousel-dots">
                        ${dotsMarkup}
                    </div>
                </div>
            `;

            modalBodyContent.innerHTML = `
                <div class="modal-project-header">
                    <h2>${proj.title}</h2>
                    <p class="modal-subtitle">${langData.subtitle}</p>
                    <div class="project-tags">${tagsMarkup}</div>
                </div>
                ${carouselHtml}
                <div class="modal-project-desc">
                    <p>${langData.desc}</p>
                </div>
            `;
        }

        // Show Modal with animation
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling

        // Only initialize carousel logic if we are NOT in mobile layout
        if (proj.layout !== 'mobile') {
            initCarousel(proj.images.length);
        }
    }

    function closeModal() {
        projectModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    }

    function initCarousel(totalSlides) {
        const track = document.getElementById('carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const dotsContainer = document.getElementById('carousel-dots');
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        let index = 0;

        function updateSlide() {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
            });
        }

        prevBtn.addEventListener('click', () => {
            index = (index - 1 + totalSlides) % totalSlides;
            updateSlide();
        });

        nextBtn.addEventListener('click', () => {
            index = (index + 1) % totalSlides;
            updateSlide();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                index = parseInt(dot.getAttribute('data-index'), 10);
                updateSlide();
            });
        });
    }
});
