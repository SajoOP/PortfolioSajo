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

    tl.fromTo('.char-wrap',
        { y: -120, opacity: 0, rotationX: 90, scale: 1.5 },
        { y: 0, opacity: 1, rotationX: 0, scale: 1, duration: 0.8, stagger: 0.04, ease: 'power4.out' }
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

    // 10. Dev Project Inspector Modal Logic
    const devModal = document.getElementById('dev-modal');
    if (devModal) {
        const devModalOverlay = devModal.querySelector('.modal-overlay');
        const closeDevBtn = devModal.querySelector('.close-dev-modal');

        const modalFile = document.getElementById('dev-modal-file');
        const modalTag = document.getElementById('dev-modal-tag');
        const modalTitle = document.getElementById('dev-modal-title');
        const modalDesc = document.getElementById('dev-modal-desc');
        const modalStack = document.getElementById('dev-modal-stack');
        const modalCodeLang = document.getElementById('dev-modal-code-lang');
        const modalCode = document.getElementById('dev-modal-code');
        const modalImg = document.getElementById('dev-modal-img');
        const modalGithubLink = document.getElementById('dev-modal-github-link');
        const modalDemoLink = document.getElementById('dev-modal-demo-link');

        function openDevModal(btn) {
            const data = btn.dataset;

            if (modalFile) modalFile.textContent = data.file || 'project.src';
            if (modalTag) modalTag.textContent = data.tag || 'SOFTWARE DEV';
            if (modalTitle) modalTitle.textContent = data.title || 'PROYECTO';
            if (modalDesc) modalDesc.textContent = data.desc || '';
            if (modalCodeLang) modalCodeLang.textContent = (data.file || '').toUpperCase();
            if (modalCode) modalCode.textContent = data.code || '// No code preview available';
            if (modalImg) modalImg.src = data.img || '';

            // Stack pills
            if (modalStack) {
                modalStack.innerHTML = '';
                const stackItems = (data.stack || '').split(',');
                stackItems.forEach(item => {
                    if (item.trim()) {
                        const pill = document.createElement('span');
                        pill.className = 'tech-pill';
                        pill.textContent = item.trim();
                        modalStack.appendChild(pill);
                    }
                });
            }

            // GitHub & Demo Links
            if (modalGithubLink) {
                modalGithubLink.href = data.github || '#';
            }

            if (modalDemoLink) {
                if (data.demo && data.demo.trim() !== '') {
                    modalDemoLink.href = data.demo;
                    modalDemoLink.style.display = 'inline-block';
                } else {
                    modalDemoLink.style.display = 'none';
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
        const thumb = card.querySelector('img.hover-video');
        const btn   = card.querySelector('.view-full-btn');
        if (!thumb || !btn) return;

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

            // For Shorts (9:16) displayed in a 16:9 card, scale up to fill
            const baseStyle = 'position:absolute;top:50%;left:50%;border:none;pointer-events:none;z-index:1;transform:translate(-50%,-50%);';
            previewFrame.style.cssText = isShortCard
                ? baseStyle + 'height:300%;width:169%;'   // scale 9:16 to fill 16:9 card
                : baseStyle + 'width:100%;height:100%;';

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
        videoContainer.innerHTML = '';
        modalTitle.textContent = title || '';

        // Detect Shorts by video ID for vertical modal layout
        const videoId = (videoSrc.split('/embed/')[1] || '').split('?')[0];
        const isShort = SHORTS_IDS.includes(videoId);
        modalContent.classList.toggle('modal-shorts', isShort);

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
        modalContent.classList.remove('modal-shorts');
    }

    // Delegate click on all view-full-btn (works on Swiper clones too)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-full-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            openModal(btn.dataset.video, btn.dataset.type, btn.dataset.title);
        }
    });

    // Also make slide title clickable
    document.addEventListener('click', (e) => {
        const title = e.target.closest('.slide-title');
        if (title) {
            const overlay = title.closest('.video-overlay');
            const btn = overlay ? overlay.querySelector('.view-full-btn') : null;
            if (btn) {
                openModal(btn.dataset.video, btn.dataset.type, btn.dataset.title);
            }
        }
    });

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});
