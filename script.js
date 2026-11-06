/**
 * AAKAR FILMS — CONTROLLER & AUTOMATIC SLIDER SCRIPT (script.js)
 * Features:
 * - Automatic smooth sliding between Page 1 (Hero) and Page 2 (Our Photography Portfolio)
 * - Pause on hover & interactive navigation controls
 * - Service pre-selection on "Book a Shoot" modal
 * - Client-side persistence (LocalStorage DB) & WhatsApp payload formatting
 */

// =============================================================================
// 1. BACKEND ENGINE: AakarDataEngine
// =============================================================================
const AakarDataEngine = {
    CONTACT_NUMBER: '916354896783',
    STORAGE_KEY: 'aakar_photoshoot_bookings',

    async saveBooking(bookingData) {
        const newRecord = {
            id: 'AK-' + Date.now(),
            name: bookingData.name.trim(),
            phone: bookingData.phone.trim(),
            date: bookingData.date,
            shootType: bookingData.shootType,
            location: bookingData.location ? bookingData.location.trim() : 'Studio / TBD',
            createdAt: new Date().toISOString(),
            status: 'Pending'
        };

        // 1. Save to browser LocalStorage DB
        try {
            const existing = this.getAllBookings();
            existing.unshift(newRecord);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }

        // 2. Save to Node.js backend API if running
        if (window.location.protocol.startsWith('http')) {
            try {
                await fetch('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRecord)
                });
            } catch (err) {
                console.log('Saved in browser database.');
            }
        }

        return newRecord;
    },

    getAllBookings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    getWhatsAppURL(booking) {
        const text = 
            `*📸 NEW INQUIRY - AAKAR FILMS*%0A%0A` +
            `*Client Name:* ${encodeURIComponent(booking.name)}%0A` +
            `*Phone:* ${encodeURIComponent(booking.phone)}%0A` +
            `*Shoot Date:* ${encodeURIComponent(booking.date)}%0A` +
            `*Type of Shoot:* ${encodeURIComponent(booking.shootType)}%0A` +
            `*City / Location:* ${encodeURIComponent(booking.location)}%0A` +
            `*Booking ID:* ${encodeURIComponent(booking.id)}%0A%0A` +
            `_Sent via Aakar Films Website_`;

        return `https://wa.me/${this.CONTACT_NUMBER}?text=${text}`;
    }
};


// =============================================================================
// 2. FULLY AUTOMATIC SLIDER: Smooth Auto-Transition across Slides
// =============================================================================
class PageAutoSlider {
    constructor() {
        this.track = document.getElementById('sliderTrack');
        this.slides = document.querySelectorAll('.page-slide');
        this.viewport = document.getElementById('sliderViewport');

        this.currentIndex = 0;
        this.totalSlides = this.slides.length || 3;
        this.slideDurations = [3500, 4200, 4800]; // Timing for Slide 1 (Hero), Slide 2 (Portfolio), Slide 3 (Reviews & Packages)
        this.timer = null;
        this.isPaused = false;

        this.init();
    }

    init() {
        if (!this.track || this.totalSlides < 2) return;

        // Slide 1 -> Slide 2: "VIEW PORTFOLIO" button
        const btnSlideToPortfolio = document.getElementById('btnSlideToPortfolio');
        if (btnSlideToPortfolio) {
            btnSlideToPortfolio.addEventListener('click', () => {
                this.goToSlide(1);
            });
        }

        // Slide 2 -> Slide 3: "PACKAGES & REVIEWS" button
        const btnSlideToReviews = document.getElementById('btnSlideToReviews');
        if (btnSlideToReviews) {
            btnSlideToReviews.addEventListener('click', () => {
                this.goToSlide(2);
            });
        }

        // Slide 2 -> Slide 1: "← HERO" button
        const btnSlideBackToHero = document.getElementById('btnSlideBackToHero');
        if (btnSlideBackToHero) {
            btnSlideBackToHero.addEventListener('click', () => {
                this.goToSlide(0);
            });
        }

        // Slide 3 -> Slide 2: "← PORTFOLIO" button
        const btnSlideBackToPortfolio = document.getElementById('btnSlideBackToPortfolio');
        if (btnSlideBackToPortfolio) {
            btnSlideBackToPortfolio.addEventListener('click', () => {
                this.goToSlide(1);
            });
        }

        // Slide 3 -> Slide 1: "BACK TO HERO" button
        const btnSlideToHero = document.getElementById('btnSlideToHero');
        if (btnSlideToHero) {
            btnSlideToHero.addEventListener('click', () => {
                this.goToSlide(0);
            });
        }

        // Header logo click glides back to Slide 1
        const brandHomeLink = document.getElementById('brandHomeLink');
        if (brandHomeLink) {
            brandHomeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(0);
            });
        }

        // Interactive Navigation Pills (01 Archive, 02 Portfolio, 03 Packages & Reviews)
        const navPills = document.querySelectorAll('.nav-pill');
        navPills.forEach((pill) => {
            pill.addEventListener('click', () => {
                const targetSlide = parseInt(pill.getAttribute('data-slide'), 10);
                if (!isNaN(targetSlide)) {
                    this.goToSlide(targetSlide);
                }
            });
        });

        // Pause auto-sliding while actively hovering on cards or interacting
        if (this.viewport) {
            this.viewport.addEventListener('mouseenter', () => { this.isPaused = true; });
            this.viewport.addEventListener('mouseleave', () => { this.isPaused = false; });
            this.viewport.addEventListener('touchstart', () => { this.isPaused = true; }, { passive: true });
        }

        // Start automatic cycling
        this.scheduleNextSlide();
    }

    goToSlide(index) {
        clearTimeout(this.timer);
        this.currentIndex = (index + this.totalSlides) % this.totalSlides;
        const translateX = -(this.currentIndex * (100 / this.totalSlides));
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update active nav pill
        const navPills = document.querySelectorAll('.nav-pill');
        navPills.forEach((pill, i) => {
            pill.classList.toggle('active', i === this.currentIndex);
        });

        this.scheduleNextSlide();
    }

    scheduleNextSlide() {
        clearTimeout(this.timer);
        const duration = this.slideDurations[this.currentIndex] || 5000;

        this.timer = setTimeout(() => {
            // If user has mouse over or modal is open, wait and check again
            if (this.isPaused || document.querySelector('.modal-overlay.open')) {
                this.scheduleNextSlide();
                return;
            }

            // Smoothly glide to next slide automatically
            const nextIndex = (this.currentIndex + 1) % this.totalSlides;
            this.goToSlide(nextIndex);
        }, duration);
    }
}


// =============================================================================
// 3. UI EVENT HANDLER: Modals & Form Actions
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Initialize the automatic slider
    const slider = new PageAutoSlider();

    /* -------------------------------------------------------------------------
       Royal Cinematic Background Video Controller
       ------------------------------------------------------------------------- */
    const heroVideo = document.getElementById('heroCinemaVideo');
    if (heroVideo) {
        // Ensure autoplay on load
        heroVideo.muted = true;
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log('Autoplay deferred until user interaction');
            });
        }

        // Automatic fallback if current src fails
        heroVideo.addEventListener('error', () => {
            console.warn('Primary video failed, loading backup stream...');
            if (!heroVideo.dataset.failedOnce) {
                heroVideo.dataset.failedOnce = 'true';
                heroVideo.src = 'https://huggingface.co/datasets/FastVideo/Mixkit-Src/resolve/main/videos/mixkit-a-brides-hand-on-the-grooms-shoulder-at-their-wedding-5206_clip_1.mp4';
                heroVideo.load();
                heroVideo.play().catch(() => {});
            }
        });

        // Attempt to sync video from royal-shutter-studios live link if reachable
        try {
            fetch('https://heriknavdiwala763-ctrl.github.io/royal-shutter-studios/', { mode: 'cors' })
                .then(res => res.ok ? res.text() : null)
                .then(html => {
                    if (!html) return;
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const videoTag = doc.querySelector('video source') || doc.querySelector('video');
                    if (videoTag) {
                        let remoteSrc = videoTag.getAttribute('src');
                        if (remoteSrc) {
                            if (!remoteSrc.startsWith('http')) {
                                remoteSrc = new URL(remoteSrc, 'https://heriknavdiwala763-ctrl.github.io/royal-shutter-studios/').href;
                            }
                            console.log('Syncing video directly from royal-shutter-studios:', remoteSrc);
                            heroVideo.src = remoteSrc;
                            heroVideo.load();
                            heroVideo.play().catch(() => {});
                        }
                    }
                })
                .catch(() => {
                    // CORS/Network restricted - default high-definition video runs smoothly
                });
        } catch (e) {}
    }

    // Smooth scroll from hero to photo archive below
    const royalScrollLinks = document.querySelectorAll('a[href^="#sliderViewport"]');
    royalScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.getElementById('sliderViewport');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* -------------------------------------------------------------------------
       Set Minimum Date on Date Picker
       ------------------------------------------------------------------------- */
    const shootDateInput = document.getElementById('shootDate');
    if (shootDateInput) {
        const today = new Date().toISOString().split('T')[0];
        shootDateInput.setAttribute('min', today);
    }

    /* -------------------------------------------------------------------------
       Booking Modal Controls & Dynamic Service Selection
       ------------------------------------------------------------------------- */
    const bookModal = document.getElementById('bookModal');
    const closeBookModal = document.getElementById('closeBookModal');
    const shootTypeSelect = document.getElementById('shootType');
    const triggerBookButtons = document.querySelectorAll('.trigger-book-modal');

    const openBookModal = (preselectedService = null) => {
        if (!bookModal) return;

        // Auto-select category if specified
        if (preselectedService && shootTypeSelect) {
            let matched = false;
            for (let option of shootTypeSelect.options) {
                if (option.value === preselectedService) {
                    option.selected = true;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                for (let option of shootTypeSelect.options) {
                    if (option.value.toLowerCase().includes(preselectedService.toLowerCase()) || 
                        preselectedService.toLowerCase().includes(option.value.toLowerCase())) {
                        option.selected = true;
                        break;
                    }
                }
            }
        }

        bookModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeBookModalHandler = () => {
        if (!bookModal) return;
        bookModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    triggerBookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const service = btn.getAttribute('data-default-service');
            openBookModal(service);
        });
    });

    if (closeBookModal) closeBookModal.addEventListener('click', closeBookModalHandler);

    // Global Modal Backdrop & ESC Close
    window.addEventListener('click', (e) => {
        if (e.target === bookModal) closeBookModalHandler();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBookModalHandler();
    });

    /* -------------------------------------------------------------------------
       Booking Form Submission -> Backend Processing
       ------------------------------------------------------------------------- */
    const bookingForm = document.getElementById('bookingForm');
    const bookingSuccess = document.getElementById('bookingSuccess');

    if (bookingForm && bookingSuccess) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: document.getElementById('clientName')?.value || '',
                phone: document.getElementById('clientPhone')?.value || '',
                date: document.getElementById('shootDate')?.value || '',
                shootType: document.getElementById('shootType')?.value || 'Wedding Photography',
                location: document.getElementById('shootLocation')?.value || ''
            };

            const submitBtn = document.getElementById('bookingSubmitBtn');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>SAVING INQUIRY...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
            }

            // Save to Backend Engine
            const savedBooking = await AakarDataEngine.saveBooking(payload);

            // Update UI
            bookingForm.style.display = 'none';
            bookingSuccess.classList.add('show');

            // Generate WhatsApp Instant Send Button
            const waUrl = AakarDataEngine.getWhatsAppURL(savedBooking);
            let directWaBtn = document.getElementById('directWaConfirmBtn');
            if (!directWaBtn) {
                directWaBtn = document.createElement('a');
                directWaBtn.id = 'directWaConfirmBtn';
                directWaBtn.className = 'btn-whatsapp';
                directWaBtn.style.marginTop = '18px';
                directWaBtn.style.display = 'inline-flex';
                directWaBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> <span>Send Details to WhatsApp</span>';
                directWaBtn.target = '_blank';
                directWaBtn.rel = 'noopener';
                bookingSuccess.appendChild(directWaBtn);
            }
            directWaBtn.href = waUrl;
        });
    }

    /* -------------------------------------------------------------------------
       Interactive Studio FAQ Accordion
       ------------------------------------------------------------------------- */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const wasOpen = item.classList.contains('open');
            // Close other open FAQ items for clean accordion behavior
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) openItem.classList.remove('open');
            });
            // Toggle current item
            if (wasOpen) {
                item.classList.remove('open');
            } else {
                item.classList.add('open');
            }
        });
    });

});
