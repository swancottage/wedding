document.addEventListener('DOMContentLoaded', () => {
    const ASSETS = {
        imageBanks: [
            ['/src/onk1.JPG', '/src/onk2.JPG'],
            ['/src/par1.JPG', '/src/par2.JPG'],
            ['/src/beige1.JPG', '/src/beige2.JPG'],
            ['/src/red1.JPG', '/src/red3.JPG'],
            ['/src/white1.JPG', '/src/blue1.JPG', '/src/blue2.JPG'],
            ['/src/jean1.JPG', '/src/jean2.JPG', '/src/jean3.JPG', '/src/jean4.JPG']
        ],
        bannerBanks: [
            '/src/wide1.JPG', '/src/wide2.JPG', '/src/wide3.JPG', '/src/wide4.JPG', '/src/wide5.JPG'
        ],
        events: [
            { icon: '/src/mark.png', title: 'Khan Maak Procession', time: '07:49 AM', desc: '' },
            { icon: '/src/tea.png', title: 'Chinese Tea Ceremony', time: '08:49 AM', desc: '' },
            { icon: '/src/celeb.png', title: 'Wedding Reception', time: '12:00 PM', desc: '(Buffet)' }
        ]
    };

    // Utilities
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let stage = 'closed';
    const sealWrapper = document.getElementById('seal-wrapper');
    const envelope = document.getElementById('envelope');
    const ecardStage = document.getElementById('ecard-stage');
    const seal = document.getElementById('crest-seal');

    const openEnvelope = () => {
        if (stage !== 'closed') return;
        stage = 'opening';

        // 1. Trigger seal animation to top
        seal.classList.add('seal-moving');

        // 2. Trigger envelope opening sequence (flap then card)
        setTimeout(() => {
            envelope.classList.add('opening');
        }, 800);

        // 3. Transition into Ecard
        setTimeout(() => {
            // Relocate seal to the header-anchor within the ecard so it scrolls naturally
            const anchor = document.getElementById('header-anchor');
            anchor.appendChild(seal);
            seal.classList.remove('seal-moving');

            // Convert transformed position to local position (center of anchor)
            seal.style.position = 'absolute';
            seal.style.top = '50%';
            seal.style.left = '50%';
            seal.style.transform = 'translate(-50%, -50%) scale(0.6)';
            seal.style.margin = '0';
            seal.style.zIndex = '100';

            sealWrapper.style.opacity = '0';
            setTimeout(() => {
                sealWrapper.classList.add('hidden');
                ecardStage.classList.remove('hidden');
                document.body.classList.add('show-bg');
                setTimeout(() => document.body.classList.add('instant-bg'), 1500);
                window.scrollTo(0, 0);
                initObservers();
            }, 1000);
        }, 3500);
    };

    const timer = setTimeout(openEnvelope, 5000);

    seal.addEventListener('click', () => {
        playMusic();
        clearTimeout(timer);
        openEnvelope();
    });

    // 1. Populate Gallery
    const galleryWires = document.querySelector('.gallery-wires');

    const populateGalleryImages = () => {
        // Pick one random from each bank and shuffle the final 6
        const selectedImages = ASSETS.imageBanks.map(bank => getRandomItem(bank));
        const shuffledImages = shuffleArray(selectedImages);

        let existingCards = galleryWires.querySelectorAll('.photo-card-item');
        if (existingCards.length === 0) {
            shuffledImages.forEach((src, i) => {
                const card = document.createElement('div');
                card.className = 'photo-card-item';
                const swayStart = (Math.random() * 4 - 5).toFixed(1);
                const swayEnd = (Math.random() * 4 + 1).toFixed(1);
                const swaySpeed = (Math.random() * 2 + 3).toFixed(1);
                const swayDelay = (Math.random() * -5).toFixed(1);
                card.style.setProperty('--sway-start', `${swayStart}deg`);
                card.style.setProperty('--sway-end', `${swayEnd}deg`);
                card.style.setProperty('--sway-speed', `${swaySpeed}s`);
                card.style.setProperty('--sway-delay', `${swayDelay}s`);
                const yOffset = (Math.random() * 20 - 10).toFixed(1);
                card.style.transform = `translateY(${yOffset}px)`;
                card.innerHTML = `
                    <img src="${src}" alt="Moment" draggable="false">
                    <div class="card-caption">Memoir ${i + 1}</div>
                `;
                galleryWires.appendChild(card);
            });
        } else {
            existingCards.forEach((card, i) => {
                card.querySelector('img').src = shuffledImages[i];
            });
        }
    };

    // Call initially
    populateGalleryImages();

    // Image Popup Modal Logic
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeImageModalBtn = document.getElementById('close-image-modal');

    galleryWires.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            modalImage.src = e.target.src;
            imageModal.classList.add('visible');
        }
    });

    const closeImageModal = () => {
        imageModal.classList.remove('visible');
    };
    closeImageModalBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (e) => {
        // close if clicked outside the image (on the dark overlay)
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // Scroll Sway Handler
    let isScrolling;
    window.addEventListener('scroll', () => {
        const photos = document.querySelectorAll('.photo-card-item');
        photos.forEach(photo => photo.classList.add('scrolling'));

        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            photos.forEach(photo => photo.classList.remove('scrolling'));
        }, 150); // Stop swaying 150ms after scroll stops
    }, { passive: true });

    // Populate Schedule
    const scheduleGrid = document.getElementById('schedule-grid');
    ASSETS.events.forEach((event, i) => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        // Add staggered transition delays for the pop effect
        item.style.setProperty('--delay', `${i * 0.15}s`);
        item.innerHTML = `
            <div class="sched-icon">
                <img src="${event.icon}" alt="${event.title}" onerror="this.style.display='none'; this.parentNode.innerText='★'">
            </div>
            <div class="sched-title">${event.title}</div>
            <div class="sched-time">${event.time} ${event.desc}</div>
        `;
        scheduleGrid.appendChild(item);
    });

    // Slot Machine Date Logic (Enhanced with cycles)
    const initSlots = () => {
        const containers = document.querySelectorAll('.slot-container');
        containers.forEach(container => {
            const strip = container.querySelector('.slot-strip');
            const target = parseInt(container.dataset.target);
            const isYear = target > 1000;

            if (isYear) {
                // Year transition: from 2000 to target
                for (let n = 2019; n <= target; n++) {
                    const numDiv = document.createElement('div');
                    numDiv.className = 'slot-number';
                    numDiv.textContent = n;
                    strip.appendChild(numDiv);
                }
            } else {
                // Number transition: just 0 to target
                for (let n = 0; n <= target; n++) {
                    const numDiv = document.createElement('div');
                    numDiv.className = 'slot-number';
                    numDiv.textContent = n;
                    strip.appendChild(numDiv);
                }
            }
        });
    };
    initSlots();

    const triggerSlots = () => {
        const containers = document.querySelectorAll('.slot-container');
        containers.forEach(container => {
            const strip = container.querySelector('.slot-strip');
            const targetHeight = container.offsetHeight;
            const totalNumbers = strip.querySelectorAll('.slot-number').length;

            // Move to the very last number in the strip
            strip.style.transform = `translateY(-${(totalNumbers - 1) * targetHeight}px)`;
        });
    };

    const resetSlots = () => {
        const strips = document.querySelectorAll('.slot-strip');
        strips.forEach(strip => {
            strip.style.transform = 'translateY(0)';
        });
    };

    // Advanced Observers
    const initObservers = () => {
        // 1. Photo Color Transitions based on position (Gradual)
        const galleryObserver = () => {
            const photos = document.querySelectorAll('.photo-card-item');
            const vh = window.innerHeight;
            const centerLine = vh / 2;
            const activeRange = vh * 0.2; // The range where it's 100% color

            photos.forEach(photo => {
                const rect = photo.getBoundingClientRect();
                const photoCenter = rect.top + rect.height / 2;

                // Calculate distance from center line
                const distFromCenter = Math.abs(photoCenter - centerLine);

                // Progress from 0 (at center) to 1 (far away)
                // Normalize so that within 'activeRange', progress is 0
                const normalizedDist = Math.max(0, distFromCenter - activeRange);
                const fadeRange = vh * 0.4; // Distance over which it fades out
                const progress = Math.min(1, normalizedDist / fadeRange);

                // Apply gradual filters
                const grayscale = (progress * 100).toFixed(1);
                const contrast = (0.6 + (1 - progress) * 0.5).toFixed(2);
                const brightness = (1.3 - (1 - progress) * 0.3).toFixed(2);
                const scale = (1 + (1 - progress) * 0.1).toFixed(2);

                photo.style.filter = `grayscale(${grayscale}%) contrast(${contrast}) brightness(${brightness})`;
                // Maintain the original translateY from the populate phase
                const currentTransform = photo.style.transform.split('scale')[0];
                photo.style.transform = `${currentTransform} scale(${scale})`;

                // Z-index based on proximity to center
                photo.style.zIndex = Math.round((1 - progress) * 10);
            });
        };
        window.addEventListener('scroll', galleryObserver);
        galleryObserver();

        // 2. Generic Scroll Reveal (Date and Schedule) - Individually triggered
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('date-strip')) {
                        if (!entry.target.classList.contains('activated')) {
                            entry.target.classList.add('animate-fade', 'activated');
                            triggerSlots();
                        }
                    } else if (entry.target.classList.contains('schedule-item')) {
                        entry.target.classList.add('animate-pop');
                    } else if (entry.target.classList.contains('bride-name') || entry.target.classList.contains('groom-name') || entry.target.classList.contains('ampersand')) {
                        entry.target.classList.add('active');
                    }
                } else {
                    if (entry.target.classList.contains('date-strip')) {
                        // Only reset if it's mostly out of view to avoid flickering
                        if (entry.intersectionRatio < 0.05) {
                            entry.target.classList.remove('animate-fade', 'activated');
                            resetSlots();
                        }
                    } else if (entry.target.classList.contains('schedule-item')) {
                        if (entry.intersectionRatio < 0.05) {
                            entry.target.classList.remove('animate-pop');
                        }
                    } else if (entry.target.classList.contains('bride-name') || entry.target.classList.contains('groom-name') || entry.target.classList.contains('ampersand')) {
                        if (entry.intersectionRatio < 0.05) {
                            entry.target.classList.remove('active');
                        }
                    }
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.date-strip, .schedule-item, .bride-name, .groom-name, .ampersand').forEach(el => revealObserver.observe(el));
        // 3. Background fade out past banner
        const bannerSection = document.querySelector('.banner-section');

        // Randomize banner image
        const updateBannerImage = () => {
            if (bannerSection) {
                const newSrc = getRandomItem(ASSETS.bannerBanks);
                bannerSection.style.backgroundImage = `url('${newSrc}')`;
            }
        };
        updateBannerImage(); // Initial

        if (bannerSection) {
            const bgObserver = () => {
                if (!document.body.classList.contains('show-bg')) return;
                const rect = bannerSection.getBoundingClientRect();

                // Fade out as the banner scrolls past the top of the viewport
                if (rect.top < 0) {
                    const scrollProgress = -rect.top / rect.height;
                    let opacity = 0.15 * (1 - scrollProgress);
                    opacity = Math.max(0, Math.min(0.15, opacity));
                    document.body.style.setProperty('--bg-opacity', opacity.toFixed(3));
                } else {
                    document.body.style.setProperty('--bg-opacity', 0.15);
                }
            };
            window.addEventListener('scroll', bgObserver, { passive: true });
            bgObserver();
        }

        // 4. Out-of-view observers for shuffling images
        const shuffleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // When completely out of view, reshuffle
                if (!entry.isIntersecting) {
                    if (entry.target.classList.contains('gallery-section')) {
                        populateGalleryImages();
                    } else if (entry.target.classList.contains('banner-section')) {
                        updateBannerImage();
                    }
                }
            });
        }, { threshold: 0 }); // Triggers when 0% visible

        const gallerySection = document.querySelector('.gallery-section');
        if (gallerySection) shuffleObserver.observe(gallerySection);
        if (bannerSection) shuffleObserver.observe(bannerSection);
    };

    // --- Audio Logic ---
    // Using a beautiful classical piece (Canon in D) from Wikimedia Commons as a placeholder
    const bgAudio = new Audio('/src/myuniverse.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0;
    let audioStarted = false;
    const audioToggle = document.getElementById('audio-toggle');

    audioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!audioStarted) {
            playMusic();
        } else {
            if (bgAudio.paused) {
                bgAudio.play();
                audioToggle.classList.add('playing');
                audioToggle.classList.remove('muted');
                audioToggle.innerHTML = '🎵';
            } else {
                bgAudio.pause();
                audioToggle.classList.remove('playing');
                audioToggle.classList.add('muted');
                audioToggle.innerHTML = '🔇';
            }
        }
    });

    const fadeAudioIn = () => {
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (vol < 0.6) { // Max volume target
                vol = Math.min(0.6, vol + 0.05);
                bgAudio.volume = vol;
            } else {
                clearInterval(fadeInterval);
            }
        }, 400); // Gradually increase every 400ms for a slow, elegant rise
    };

    const playMusic = () => {
        if (!audioStarted) {
            // Attempt to play the audio
            bgAudio.play().then(() => {
                audioStarted = true;
                audioToggle.classList.add('playing');
                audioToggle.innerHTML = '🎵';
                fadeAudioIn();
            }).catch(e => {
                // Browsers may block autoplay without sufficient interaction
                console.log('Waiting for user interaction to play audio...', e);
            });
        }
    };

    // Attach interaction listeners to start music if they don't click the seal first
    document.addEventListener('click', playMusic, { once: true });
    document.addEventListener('scroll', playMusic, { once: true, passive: true });
    document.addEventListener('touchstart', playMusic, { once: true, passive: true });
});
