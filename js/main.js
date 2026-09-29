document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // 2. Scroll Progress Bar
    const scrollbar = document.getElementById('weird-scrollbar');
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollbar.style.width = scrollPercentage + '%';

        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove('open');
                navLinks.classList.remove('active');
            }
        });
    }

    // 3. Name Animation - Split by WORDS to prevent mid-word line breaks
    const nameTarget = document.getElementById('name-glitch-target');
    const nameText = nameTarget.getAttribute('data-text') || nameTarget.textContent.trim();
    nameTarget.setAttribute('data-text', nameText);
    nameTarget.innerHTML = '';

    const words = nameText.split(' ');
    const allCharSpans = [];

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word-wrap');
        wordSpan.setAttribute('data-text', word);

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char-wrap');
            charSpan.textContent = char;
            // data-char is used by CSS ::before / ::after for glitch ghost layers
            charSpan.setAttribute('data-char', char);
            wordSpan.appendChild(charSpan);
            allCharSpans.push(charSpan);
        });

        nameTarget.appendChild(wordSpan);
        if (wordIndex < words.length - 1) {
            nameTarget.appendChild(document.createTextNode(' '));
        }
    });

    // 4. GSAP Cinematic Entrance Animation
    const tl = gsap.timeline();

    tl.fromTo('#hero-greeting',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    .fromTo('.char-wrap',
        { y: -120, opacity: 0, rotationX: 90, scale: 1.5 },
        { y: 0, opacity: 1, rotationX: 0, scale: 1, duration: 0.8, stagger: 0.04, ease: 'power4.out' },
        '-=0.2'
    )
    .to('#name-glitch-target', {
        onComplete: () => startRandomGlitch(allCharSpans)
    })
    .to(['#hero-content', '#navbar'], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
    }, '-=0.3')
    .fromTo('#nickname-bar',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'back.out(1.4)' },
        '-=0.1'
    );

    // --- Random Glitch Scheduler ---
    // Effect catalogue: each is a CSS class + optional char-swap
    const GLITCH_EFFECTS = ['char-glitch', 'char-flicker'];
    // Corrupt chars pool for the swap effect
    const CORRUPT_CHARS = '!@#$%^&*_-=+<>?/|\\~';

    let glitchActive = false; // prevent overlap on same char

    function fireRandomGlitch(chars) {
        if (chars.length === 0) return;

        // Pick a random char span (skip spaces, only real letters)
        const letterSpans = chars.filter(s => s.textContent.trim() !== '');
        const target = letterSpans[Math.floor(Math.random() * letterSpans.length)];
        const effect = GLITCH_EFFECTS[Math.floor(Math.random() * GLITCH_EFFECTS.length)];
        const originalChar = target.getAttribute('data-char');

        // Occasionally swap to a corrupt char for extra chaos (~30% of events)
        const doSwap = Math.random() < 0.30;
        if (doSwap) {
            const corruptChar = CORRUPT_CHARS[Math.floor(Math.random() * CORRUPT_CHARS.length)];
            target.textContent = corruptChar;
            target.setAttribute('data-char', corruptChar);
        }

        target.classList.add(effect);

        // Clean up after animation finishes (longest effect ~400ms)
        const cleanup = () => {
            target.classList.remove(effect);
            if (doSwap) {
                target.textContent = originalChar;
                target.setAttribute('data-char', originalChar);
            }
            target.removeEventListener('animationend', cleanup);
        };
        target.addEventListener('animationend', cleanup);

        // Safety fallback in case animationend doesn't fire
        setTimeout(() => {
            target.classList.remove(effect);
            if (doSwap) {
                target.textContent = originalChar;
                target.setAttribute('data-char', originalChar);
            }
        }, 600);
    }

    function startRandomGlitch(chars) {
        function scheduleNext() {
            // Random delay between 800ms and 3.5s — feels organic, not mechanical
            const delay = 800 + Math.random() * 2700;
            setTimeout(() => {
                // Sometimes fire 2 chars in a quick burst for extra drama
                fireRandomGlitch(chars);
                if (Math.random() < 0.25) {
                    setTimeout(() => fireRandomGlitch(chars), 80 + Math.random() * 120);
                }
                scheduleNext();
            }, delay);
        }
        scheduleNext();
    }


    // 5. Swiper 3D Carousel - with proper infinite loop
    const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
        },
        loop: true,
        loopAdditionalSlides: 3,
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        }
    });

    // 6. Cards now use YouTube thumbnails (img), no inline video playback needed.

    // 8. Skills filter tabs
    document.querySelectorAll('.skill-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Toggle active state
            document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;

            document.querySelectorAll('.skill-card').forEach(card => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden', !show);
            });
        });
    });

    // 9. Dev Projects filter tabs
    document.querySelectorAll('.dev-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;

            document.querySelectorAll('.dev-card').forEach(card => {
                const categories = (card.dataset.category || '').split(' ');
                const show = filter === 'all' || categories.includes(filter);
                card.classList.toggle('hidden', !show);
            });
        });
    });

    // 10. Dev Project Inspector Modal Logic (Rich Markdown Specs & Decorative Code)
    const DEV_PROJECTS_DATA = {
        scalia: {
            id: 'scalia',
            title: 'SCALIA — Plataforma de Teoría Musical e Instrumentos',
            tag: 'JAVA / DESKTOP / SOFTWARE ENGINEERING',
            badge: '● DESKTOP ENGINE',
            file: 'Main.java',
            lang: 'JAVA / JAVAFX',
            img: './img/scalia.png',
            github: 'https://github.com/JustPersy/IngeSoft1',
            demo: '',
            stack: ['Java 17', 'JavaFX 21', 'MySQL 8.0', 'JDBC Driver', 'JUnit 5', 'Maven', 'MVC / DAO Architecture'],
            docHtml: `
                <div class="md-block">
                    <h4>// RESUMEN EJECUTIVO (README.MD)</h4>
                    <p>Aplicación de escritorio interactiva desarrollada con <strong>Java 17</strong> y <strong>JavaFX</strong> para <em>Ingeniería de Software 1 (Universidad Nacional de Colombia)</em>. Diseñada como una estación de trabajo educativa que transforma conceptos musicales abstractos en herramientas pedagógicas interactivas con persistencia relacional en <strong>MySQL</strong>.</p>
                </div>

                <div class="md-block">
                    <h4>// CAPACIDADES & MÓDULOS DEL SISTEMA</h4>
                    <ul class="md-features-list">
                        <li><strong>🎼 Motor de Teoría Musical:</strong> Algoritmo de cálculo armónico capaz de construir escalas diatónicas, pentatónicas y modos griegos, además de cifrado de acordes (tríadas, tétradas y tensiones) e intervalos dinámicos.</li>
                        <li><strong>🎸 Visualizador Interactivo de Instrumentos:</strong> Mapeo paramétrico de diapasones de guitarra, bajo y piano con representación gráfica en tiempo real de digitación y escalas.</li>
                        <li><strong>🎯 Afinador Acústico & Biblioteca:</strong> Afinador digital con afinaciones estándar y alternativas (Drop D, DADGAD, Open G, Half-Step Down) y visualización de frecuencias.</li>
                        <li><strong>💾 Persistencia Relacional MySQL:</strong> Arquitectura <em>DAO (Data Access Object)</em> con conexión JDBC nativa para usuarios, biblioteca de afinaciones personalizadas y registro de progreso.</li>
                        <li><strong>🧪 Suite de Pruebas Unitarias con JUnit 5:</strong> Cobertura exhaustiva sobre la lógica de construcción de intervalos, consistencia relacional y cálculo de frecuencias.</li>
                    </ul>
                </div>

                <div class="md-block">
                    <h4>// ARQUITECTURA & PATRONES DE DISEÑO</h4>
                    <div class="md-arch-chips">
                        <span class="arch-chip">Patrón MVC (Model-View-Controller)</span>
                        <span class="arch-chip">Patrón DAO para persistencia MySQL</span>
                        <span class="arch-chip">FXML + CSS3 desacoplado para interfaz gráfica</span>
                        <span class="arch-chip">JavaFX Scene Graph optimizado</span>
                    </div>
                </div>
            `,
            codeSnippetHtml: `<span class="co-cmt">// Scalia Desktop Application - Main Engine</span>
<span class="co-kw">package</span> com.scalia;

<span class="co-kw">import</span> javafx.application.Application;
<span class="co-kw">import</span> javafx.fxml.FXMLLoader;
<span class="co-kw">import</span> javafx.scene.Parent;
<span class="co-kw">import</span> javafx.scene.Scene;
<span class="co-kw">import</span> javafx.stage.Stage;
<span class="co-kw">import</span> com.scalia.models.User;

<span class="co-kw">public class</span> <span class="co-cls">Main</span> <span class="co-kw">extends</span> <span class="co-cls">Application</span> {
    <span class="co-ann">@Override</span>
    <span class="co-kw">public void</span> <span class="co-fn">start</span>(<span class="co-cls">Stage</span> stage) <span class="co-kw">throws</span> Exception {
        <span class="co-cls">FXMLLoader</span> loader = <span class="co-kw">new</span> <span class="co-cls">FXMLLoader</span>(
            getClass().<span class="co-fn">getResource</span>(<span class="co-str">"/fxml/SplashView.fxml"</span>)
        );
        <span class="co-cls">Parent</span> root = loader.<span class="co-fn">load</span>();
        <span class="co-cls">Scene</span> scene = <span class="co-kw">new</span> <span class="co-cls">Scene</span>(root, <span class="co-num">1080</span>, <span class="co-num">720</span>);
        scene.<span class="co-fn">getStylesheets</span>().<span class="co-fn">add</span>(
            getClass().<span class="co-fn">getResource</span>(<span class="co-str">"/css/styles.css"</span>).<span class="co-fn">toExternalForm</span>()
        );
        stage.<span class="co-fn">setTitle</span>(<span class="co-str">"Scalia - Music Theory Platform"</span>);
        stage.<span class="co-fn">setScene</span>(scene);
        stage.<span class="co-fn">show</span>();
    }

    <span class="co-kw">public static void</span> <span class="co-fn">main</span>(String[] args) {
        <span class="co-fn">launch</span>(args);
    }
}`
        },

        partcosmos: {
            id: 'partcosmos',
            title: 'PARTÍCULAS & COSMOS — Simulador Físico 2D',
            tag: 'PHYSICS SIMULATION / INTERACTIVE WEB / GAME DEV',
            badge: '● MOTOR EN CANVAS',
            file: 'universe.js',
            lang: 'JAVASCRIPT ES6+',
            img: './img/partcosmos.png',
            github: 'https://github.com/SajoOP/Particulas-Cosmos',
            demo: 'https://sajoop.github.io/Particulas-Cosmos/',
            stack: ['JavaScript ES6+', 'HTML5 Canvas API', 'Velocity Verlet Integration', 'Langevin Dynamics', 'Yukawa Potential', 'Box-Muller Transform'],
            docHtml: `
                <div class="md-block">
                    <h4>// RESUMEN EJECUTIVO (README.MD)</h4>
                    <p>Simulador físico interactivo en 2D desarrollado en <strong>JavaScript puro</strong> sobre <strong>HTML5 Canvas</strong>, sin librerías de física de terceros. Explora el comportamiento emergente de sistemas dinámicos a dos escalas extremas: <strong>Escala Cósmica</strong> (astrofísica gravitacional N-cuerpos) y <strong>Escala Atómica</strong> (fuerzas electromagnéticas y fuerza nuclear fuerte).</p>
                </div>

                <div class="md-block">
                    <h4>// FUNDAMENTOS FÍSICOS & MODELOS MATEMÁTICOS</h4>
                    <ul class="md-features-list">
                        <li><strong>🌌 Escala Cósmica — N-Cuerpos con Softening:</strong> Gravitación newtoniana modificada con factor de suavizado (Softening ε): F = G·(m₁m₂) / (r² + ε²)^(3/2) · r. Previene singularidades numéricas (división por cero y aceleración infinita) durante acercamientos críticos.</li>
                        <li><strong>💥 Colisiones Inelásticas & Conservación del Momento:</strong> Los astros que colisionan se fusionan en un único cuerpo de mayor masa, cuya velocidad final preserva estrictamente la Ley de Conservación del Momento Lineal: v_f = (m₁v₁ + m₂v₂) / (m₁ + m₂).</li>
                        <li><strong>⚛️ Escala Atómica — Fuerza Fuerte (Potencial de Yukawa):</strong> Protones y neutrones experimentan una curva semiclásica de Yukawa con tres zonas: repulsión de núcleo duro a distancia mínima (emulando exclusión de Pauli), fuerte atracción de enlace a escala nuclear y decaimiento exponencial e^(-r/R).</li>
                        <li><strong>🔥 Termostato de Langevin (Transformada de Box-Muller):</strong> Control de agitación térmica y temperatura constante aplicando fricción gaussiana calculada numéricamente con la transformada de Box-Muller para generar ruido blanco con distribución normal.</li>
                        <li><strong>⚡ Integrador Velocity Verlet:</strong> Algoritmo simpléctico de segundo orden con óptima conservación de la energía mecánica a largo plazo frente a Euler tradicional.</li>
                    </ul>
                </div>

                <div class="md-block">
                    <h4>// CAPACIDADES INTERACTIVAS</h4>
                    <div class="md-arch-chips">
                        <span class="arch-chip">Simulación N-cuerpos en tiempo real a 60 FPS</span>
                        <span class="arch-chip">Creación interactiva de astros y partículas con el ratón</span>
                        <span class="arch-chip">Control de constante G, escala temporal y termostato</span>
                        <span class="arch-chip">Renderizado con estela orbital mediante Alpha Blending</span>
                    </div>
                </div>
            `,
            codeSnippetHtml: `<span class="co-cmt">// Velocity Verlet Integration & Softened N-Body Gravity</span>
<span class="co-kw">function</span> <span class="co-fn">step</span>(dt) {
    <span class="co-cmt">// 1. Actualizar posiciones: r(t+dt) = r + v·dt + ½a·dt²</span>
    bodies.<span class="co-fn">forEach</span>(b =&gt; {
        b.pos.<span class="co-fn">add</span>(b.vel.<span class="co-fn">scale</span>(dt).<span class="co-fn">add</span>(b.acc.<span class="co-fn">scale</span>(<span class="co-num">0.5</span> * dt * dt)));
    });

    <span class="co-cmt">// 2. Nuevas aceleraciones con Softening ε (evita singularidades)</span>
    <span class="co-kw">const</span> newAccels = bodies.<span class="co-fn">map</span>(b =&gt; <span class="co-fn">computeGravity</span>(b, bodies));

    <span class="co-cmt">// 3. Actualizar velocidades: v(t+dt) = v + ½(a(t) + a(t+dt))·dt</span>
    bodies.<span class="co-fn">forEach</span>((b, i) =&gt; {
        b.vel.<span class="co-fn">add</span>(b.acc.<span class="co-fn">add</span>(newAccels[i]).<span class="co-fn">scale</span>(<span class="co-num">0.5</span> * dt));
        b.acc = newAccels[i];
    });
}

<span class="co-kw">function</span> <span class="co-fn">computeGravity</span>(body, others) {
    <span class="co-kw">let</span> ax = <span class="co-num">0</span>, ay = <span class="co-num">0</span>;
    others.<span class="co-fn">forEach</span>(o =&gt; {
        <span class="co-kw">if</span> (o === body) <span class="co-kw">return</span>;
        <span class="co-kw">const</span> dx = o.x - body.x, dy = o.y - body.y;
        <span class="co-kw">const</span> r2 = dx*dx + dy*dy + EPSILON*EPSILON;
        <span class="co-kw">const</span> f  = G * o.mass / Math.<span class="co-fn">pow</span>(r2, <span class="co-num">1.5</span>);
        ax += f * dx; ay += f * dy;
    });
    <span class="co-kw">return</span> { x: ax, y: ay };
}`
        },

        clickandmunch: {
            id: 'clickandmunch',
            title: 'CLICK & MUNCH — Sistema de Órdenes para Restaurantes',
            tag: 'MICROSERVICES / DISTRIBUTED ARCHITECTURE / EVENT-DRIVEN',
            badge: '● 10 MICROSERVICIOS',
            file: 'OrderService.java',
            lang: 'JAVA / SPRING BOOT & RABBITMQ',
            img: './img/clickandmunch.jpg',
            github: 'https://github.com/msbetancourtge/SwArch',
            demo: '',
            stack: ['TypeScript', 'Java Spring Boot', 'Python FastAPI', 'RabbitMQ', 'Docker Compose', 'PostgreSQL (x7)', 'MongoDB', 'React', 'React Native Expo'],
            docHtml: `
                <div class="md-block">
                    <h4>// RESUMEN EJECUTIVO (README.MD)</h4>
                    <p>Plataforma empresarial de gestión de pedidos y comandas para restaurantes diseñada bajo una <strong>arquitectura distribuida de 10 microservicios</strong> y <strong>29 contenedores Docker Compose</strong>. Desarrollada para alta disponibilidad y desacoplamiento asíncrono mediante el <strong>patrón Mediator con RabbitMQ</strong>.</p>
                </div>

                <div class="md-block">
                    <h4>// DECISIONES ARQUITECTURALES & COMPONENTES CLAVE</h4>
                    <ul class="md-features-list">
                        <li><strong>🐰 Patrón Mediator con RabbitMQ:</strong> Centraliza la comunicación entre productores de eventos (<code>OrderService</code>, <code>ReservationService</code>) y canales de notificación (<code>NotificationService</code>, <code>TelegramWorker</code>), desacoplando completamente los servicios centrales.</li>
                        <li><strong>🍳 Kitchen Display System (KDS) en Tiempo Real:</strong> Pantalla de comandas para cocineros conectada mediante <strong>WebSockets bidireccionales nativos</strong>, garantizando actualización instantánea sin sobrecarga de polling.</li>
                        <li><strong>🐍 CheckoutService Especializado en Python (FastAPI):</strong> Microservicio de transacciones y cálculo de propinas/impuestos en Python por su alto rendimiento en operaciones asíncronas de facturación.</li>
                        <li><strong>🛡️ Single Edge API Gateway:</strong> Punto de acceso único en puerto <code>8080</code> que unifica el enrutamiento HTTP, WebSockets y Server-Sent Events (SSE) hacia los microservicios internos aislados.</li>
                        <li><strong>🗄️ Persistencia Políglota Aislada:</strong> 7 bases de datos PostgreSQL independientes por servicio, una base MongoDB para catálogo dinámico de menú y PostGIS para geolocalización de restaurantes.</li>
                        <li><strong>📱 Doble Canal Frontend:</strong> Dashboard web interactivo para administración y KDS (React/Vite/TypeScript) + Aplicación móvil nativa para comensales en React Native con Expo.</li>
                    </ul>
                </div>

                <div class="md-block">
                    <h4>// TOPOLOGÍA DE INFRAESTRUCTURA</h4>
                    <div class="md-arch-chips">
                        <span class="arch-chip">29 Contenedores Docker (Docker Compose Orchestrated)</span>
                        <span class="arch-chip">RabbitMQ AMQP Broker (Topic Exchange)</span>
                        <span class="arch-chip">Bot de Telegram con colas durables para alertas al cliente</span>
                        <span class="arch-chip">Monitoreo con Healthchecks en todos los contenedores</span>
                    </div>
                </div>
            `,
            codeSnippetHtml: `<span class="co-cmt">// OrderService.java — Event-Driven Order Processing with RabbitMQ</span>
<span class="co-ann">@RestController</span>
<span class="co-ann">@RequestMapping</span>(<span class="co-str">"/order"</span>)
<span class="co-kw">public class</span> <span class="co-cls">OrderService</span> {
    <span class="co-ann">@Autowired</span> <span class="co-kw">private</span> <span class="co-cls">EventBus</span> eventBus;
    <span class="co-ann">@Autowired</span> <span class="co-kw">private</span> <span class="co-cls">KitchenWebSocketService</span> kitchenWS;

    <span class="co-ann">@PostMapping</span>
    <span class="co-kw">public</span> <span class="co-cls">ResponseEntity</span>&lt;<span class="co-cls">Order</span>&gt; <span class="co-fn">createOrder</span>(<span class="co-ann">@RequestBody</span> <span class="co-cls">OrderRequest</span> req) {
        <span class="co-cmt">// 1. Persistir orden en PostgreSQL aislada del dominio</span>
        <span class="co-cls">Order</span> order = orderService.<span class="co-fn">create</span>(req);

        <span class="co-cmt">// 2. Mediator: RabbitMQ despacha evento asíncrono</span>
        <span class="co-cmt">// (TelegramWorker y NotificationService consumen sin acoplamiento)</span>
        eventBus.<span class="co-fn">publish</span>(<span class="co-kw">new</span> <span class="co-cls">OrderCreatedEvent</span>(
            order.<span class="co-fn">getId</span>(), order.<span class="co-fn">getRestaurantId</span>(), order.<span class="co-fn">getItems</span>()
        ));

        <span class="co-cmt">// 3. Push inmediato por WebSocket a las pantallas de cocina</span>
        kitchenWS.<span class="co-fn">broadcast</span>(order.<span class="co-fn">getRestaurantId</span>(), order);

        <span class="co-kw">return</span> <span class="co-cls">ResponseEntity</span>.<span class="co-fn">status</span>(<span class="co-cls">HttpStatus</span>.CREATED).<span class="co-fn">body</span>(order);
    }
}`
        }
    };

    const devModal = document.getElementById('dev-modal');
    if (devModal) {
        const devModalOverlay = devModal.querySelector('.modal-overlay');
        const closeDevBtn = devModal.querySelector('.close-dev-modal');

        const modalFile = document.getElementById('dev-modal-file');
        const modalTag = document.getElementById('dev-modal-tag');
        const modalBadge = document.getElementById('dev-modal-badge');
        const modalTitle = document.getElementById('dev-modal-title');
        const modalDoc = document.getElementById('dev-modal-doc');
        const modalStack = document.getElementById('dev-modal-stack');
        const modalCodeLang = document.getElementById('dev-modal-code-lang');
        const modalCode = document.getElementById('dev-modal-code');
        const modalImg = document.getElementById('dev-modal-img');
        const modalGithubLink = document.getElementById('dev-modal-github-link');
        const modalDemoLink = document.getElementById('dev-modal-demo-link');

        function openDevModal(btn) {
            const projectKey = btn.dataset.project;
            const project = DEV_PROJECTS_DATA[projectKey];

            if (project) {
                if (modalFile) modalFile.textContent = project.file;
                if (modalTag) modalTag.textContent = project.tag;
                if (modalBadge) modalBadge.textContent = project.badge;
                if (modalTitle) modalTitle.textContent = project.title;
                if (modalCodeLang) modalCodeLang.textContent = project.lang;
                if (modalCode) modalCode.innerHTML = project.codeSnippetHtml;
                if (modalImg) modalImg.src = project.img;
                if (modalDoc) modalDoc.innerHTML = project.docHtml;

                // Stack pills
                if (modalStack) {
                    modalStack.innerHTML = '';
                    project.stack.forEach(item => {
                        const pill = document.createElement('span');
                        pill.className = 'tech-pill';
                        pill.textContent = item;
                        modalStack.appendChild(pill);
                    });
                }

                // GitHub & Demo Links
                if (modalGithubLink) {
                    modalGithubLink.href = project.github || '#';
                    modalGithubLink.style.display = project.github ? 'inline-block' : 'none';
                }

                if (modalDemoLink) {
                    if (project.demo && project.demo.trim() !== '') {
                        modalDemoLink.href = project.demo;
                        modalDemoLink.style.display = 'inline-block';
                    } else {
                        modalDemoLink.style.display = 'none';
                    }
                }
            } else {
                // Fallback for generic dataset buttons
                const data = btn.dataset;
                if (modalFile) modalFile.textContent = data.file || 'project.src';
                if (modalTag) modalTag.textContent = data.tag || 'SOFTWARE DEV';
                if (modalTitle) modalTitle.textContent = data.title || 'PROYECTO';
                if (modalDoc) modalDoc.innerHTML = `<div class="md-block"><p>${data.desc || ''}</p></div>`;
                if (modalCodeLang) modalCodeLang.textContent = (data.file || '').toUpperCase();
                if (modalCode) modalCode.textContent = data.code || '// No code preview available';
                if (modalImg) modalImg.src = data.img || '';

                if (modalStack) {
                    modalStack.innerHTML = '';
                    (data.stack || '').split(',').forEach(item => {
                        if (item.trim()) {
                            const pill = document.createElement('span');
                            pill.className = 'tech-pill';
                            pill.textContent = item.trim();
                            modalStack.appendChild(pill);
                        }
                    });
                }
                if (modalGithubLink) modalGithubLink.href = data.github || '#';
                if (modalDemoLink) {
                    if (data.demo && data.demo.trim() !== '') {
                        modalDemoLink.href = data.demo;
                        modalDemoLink.style.display = 'inline-block';
                    } else {
                        modalDemoLink.style.display = 'none';
                    }
                }
            }

            devModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeDevModal() {
            devModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.dev-details-btn');
            if (btn) {
                e.preventDefault();
                openDevModal(btn);
            }
        });

        if (closeDevBtn) closeDevBtn.addEventListener('click', closeDevModal);
        if (devModalOverlay) devModalOverlay.addEventListener('click', closeDevModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && devModal.classList.contains('active')) {
                closeDevModal();
            }
        });
    }

    // 6. YouTube Hover Preview — on hover show a muted autoplay iframe
    const SHORTS_IDS = ['gqqetFvpSzs', 'Es2HZDn27NA', 'n9A1JYE-XEA'];

    document.querySelectorAll('.video-card').forEach(card => {
        // Skip external-only cards (e.g. IMAGECHEF, to prevent third-party copyright embed block)
        if (card.classList.contains('video-card-external') || card.dataset.externalUrl) {
            return;
        }

        const thumb = card.querySelector('img.hover-video');
        const btn   = card.querySelector('.view-full-btn');
        if (!thumb || !btn || !btn.dataset.video) return;

        const embedBase = btn.dataset.video; // e.g. https://www.youtube.com/embed/XXXXX
        const videoId   = embedBase.split('/embed/')[1] || '';
        const isShortCard = SHORTS_IDS.includes(videoId);

        let previewFrame = null;

        card.addEventListener('mouseenter', () => {
            if (previewFrame) return;

            previewFrame = document.createElement('iframe');
            // autoplay, muted, no controls, loop
            previewFrame.src = `${embedBase}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&disablekb=1&modestbranding=1`;
            previewFrame.allow = 'autoplay; encrypted-media';

            // Keep preview strictly within the 16:9 card box for all videos
            previewFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;pointer-events:none;z-index:1;background:#000;';

            card.appendChild(previewFrame);
            thumb.style.opacity = '0';
            thumb.style.transition = 'opacity 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            if (previewFrame) {
                previewFrame.remove();
                previewFrame = null;
            }
            thumb.style.opacity = '1';
        });
    });

    // 7. Video Modal Logic
    const modal         = document.getElementById('video-modal');
    const modalOverlay  = modal.querySelector('.modal-overlay');
    const modalContent  = modal.querySelector('.modal-content');
    const closeBtn      = modal.querySelector('.close-modal');
    const videoContainer = document.getElementById('video-container');
    const modalTitle    = document.getElementById('modal-title');

    function openModal(videoSrc, videoType, title) {
        if (!videoSrc) return;
        videoContainer.innerHTML = '';
        modalTitle.textContent = title || '';

        if (videoType === 'youtube') {
            const iframe = document.createElement('iframe');
            iframe.src = videoSrc + '?autoplay=1&rel=0&modestbranding=1';
            iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.cssText = 'width:100%;height:100%;border:none;';
            videoContainer.appendChild(iframe);
        } else {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            video.style.cssText = 'width:100%;height:100%;background:#000;';
            videoContainer.appendChild(video);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        videoContainer.innerHTML = '';
        document.body.style.overflow = '';
    }

    // Delegate click on all view-full-btn (works on Swiper clones too)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-full-btn');
        if (btn) {
            const externalUrl = btn.dataset.externalUrl || (btn.tagName === 'A' ? btn.getAttribute('href') : null);
            if (externalUrl && externalUrl.startsWith('http')) {
                window.open(externalUrl, '_blank', 'noopener,noreferrer');
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (btn.dataset.video) {
                e.preventDefault();
                e.stopPropagation();
                openModal(btn.dataset.video, btn.dataset.type, btn.dataset.title);
            }
        }
    });

    // Also make slide title clickable
    document.addEventListener('click', (e) => {
        const title = e.target.closest('.slide-title');
        if (title) {
            const card = title.closest('.video-card');
            if (card && (card.dataset.externalUrl || card.classList.contains('video-card-external'))) {
                const extUrl = card.dataset.externalUrl || 'https://youtu.be/WhPzUXGopUI';
                window.open(extUrl, '_blank', 'noopener,noreferrer');
                return;
            }
            const overlay = title.closest('.video-overlay');
            const btn = overlay ? overlay.querySelector('.view-full-btn') : null;
            if (btn) {
                if (btn.dataset.externalUrl) {
                    window.open(btn.dataset.externalUrl, '_blank', 'noopener,noreferrer');
                } else if (btn.dataset.video) {
                    openModal(btn.dataset.video, btn.dataset.type, btn.dataset.title);
                }
            }
        }
    });

    // Clicking on an external card directly opens YouTube
    document.addEventListener('click', (e) => {
        const extCard = e.target.closest('.video-card-external');
        if (extCard && !e.target.closest('.view-full-btn') && !e.target.closest('.slide-title')) {
            const extUrl = extCard.dataset.externalUrl || 'https://youtu.be/WhPzUXGopUI';
            window.open(extUrl, '_blank', 'noopener,noreferrer');
        }
    });

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});
