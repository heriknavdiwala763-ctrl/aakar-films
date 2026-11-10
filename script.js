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
        this.totalSlides = this.slides.length || 6;
        this.slideDurations = [3800, 4500, 5000, 5500, 6000, 6000]; // Timing for Slide 1 (Hero), Slide 2 (Portfolio), Slide 3 (Reviews & Packages), Slide 4 (Connect & Estimator), Slide 5 (Video Gallery), Slide 6 (Heirloom & Client Vault)
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

        // Slide 3 -> Slide 4: "04. STUDIO CONNECT & ESTIMATOR" button
        const btnSlideToConnect = document.getElementById('btnSlideToConnect');
        if (btnSlideToConnect) {
            btnSlideToConnect.addEventListener('click', () => {
                this.goToSlide(3);
            });
        }

        // Slide 3 -> Slide 1: "BACK TO HERO" button
        const btnSlideToHero = document.getElementById('btnSlideToHero');
        if (btnSlideToHero) {
            btnSlideToHero.addEventListener('click', () => {
                this.goToSlide(0);
            });
        }

        // Slide 4 -> Slide 3: "← 03. PACKAGES & REVIEWS" button
        const btnSlideBackToPackages = document.getElementById('btnSlideBackToPackages');
        if (btnSlideBackToPackages) {
            btnSlideBackToPackages.addEventListener('click', () => {
                this.goToSlide(2);
            });
        }

        // Slide 4 -> Slide 5: "05. CINEMATIC VIDEO GALLERY →" button
        const btnSlideToVideoGallery = document.getElementById('btnSlideToVideoGallery');
        if (btnSlideToVideoGallery) {
            btnSlideToVideoGallery.addEventListener('click', () => {
                this.goToSlide(4);
            });
        }

        // Slide 4 -> Slide 2: "02. PORTFOLIO" button
        const btnSlideBackToPortfolioFrom4 = document.getElementById('btnSlideBackToPortfolioFrom4');
        if (btnSlideBackToPortfolioFrom4) {
            btnSlideBackToPortfolioFrom4.addEventListener('click', () => {
                this.goToSlide(1);
            });
        }

        // Slide 4 -> Slide 1: "01. BACK TO HERO" button
        const btnSlideToHeroFrom4 = document.getElementById('btnSlideToHeroFrom4');
        if (btnSlideToHeroFrom4) {
            btnSlideToHeroFrom4.addEventListener('click', () => {
                this.goToSlide(0);
            });
        }

        // Slide 5 Navigation Actions
        const btnSlideBackToStudioFrom5 = document.getElementById('btnSlideBackToStudioFrom5');
        if (btnSlideBackToStudioFrom5) {
            btnSlideBackToStudioFrom5.addEventListener('click', () => {
                this.goToSlide(3);
            });
        }

        const btnSlideToPackagesFrom5 = document.getElementById('btnSlideToPackagesFrom5');
        if (btnSlideToPackagesFrom5) {
            btnSlideToPackagesFrom5.addEventListener('click', () => {
                this.goToSlide(2);
            });
        }

        const btnSlideToPortfolioFrom5 = document.getElementById('btnSlideToPortfolioFrom5');
        if (btnSlideToPortfolioFrom5) {
            btnSlideToPortfolioFrom5.addEventListener('click', () => {
                this.goToSlide(1);
            });
        }

        const btnSlideToHeroFrom5 = document.getElementById('btnSlideToHeroFrom5');
        if (btnSlideToHeroFrom5) {
            btnSlideToHeroFrom5.addEventListener('click', () => {
                this.goToSlide(0);
            });
        }

        // Slide 5 -> Slide 6: "06. HEIRLOOM ATELIER & CLIENT VAULT" button
        const btnSlideToSlide6 = document.getElementById('btnSlideToSlide6');
        if (btnSlideToSlide6) {
            btnSlideToSlide6.addEventListener('click', () => {
                this.goToSlide(5);
            });
        }

        // Slide 6 Navigation Actions
        const btnSlideBackToVideoGalleryFrom6 = document.getElementById('btnSlideBackToVideoGalleryFrom6');
        if (btnSlideBackToVideoGalleryFrom6) {
            btnSlideBackToVideoGalleryFrom6.addEventListener('click', () => {
                this.goToSlide(4);
            });
        }

        const btnSlideToStudioFrom6 = document.getElementById('btnSlideToStudioFrom6');
        if (btnSlideToStudioFrom6) {
            btnSlideToStudioFrom6.addEventListener('click', () => {
                this.goToSlide(3);
            });
        }

        const btnSlideToPackagesFrom6 = document.getElementById('btnSlideToPackagesFrom6');
        if (btnSlideToPackagesFrom6) {
            btnSlideToPackagesFrom6.addEventListener('click', () => {
                this.goToSlide(2);
            });
        }

        const btnSlideToPortfolioFrom6 = document.getElementById('btnSlideToPortfolioFrom6');
        if (btnSlideToPortfolioFrom6) {
            btnSlideToPortfolioFrom6.addEventListener('click', () => {
                this.goToSlide(1);
            });
        }

        const btnSlideToHeroFrom6 = document.getElementById('btnSlideToHeroFrom6');
        if (btnSlideToHeroFrom6) {
            btnSlideToHeroFrom6.addEventListener('click', () => {
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

        // Interactive Navigation Pills (01 Archive, 02 Portfolio, 03 Packages, 04 Studio, 05 Video Gallery, 06 Heirloom & Vault)
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

        // Check URL hash on page load (e.g. #slide5, #slide6, #video-gallery, #heirloom)
        if (window.location.hash === '#slide5' || window.location.hash === '#video-gallery') {
            setTimeout(() => {
                const viewport = document.getElementById('sliderViewport');
                if (viewport) {
                    viewport.scrollIntoView({ behavior: 'smooth' });
                }
                this.goToSlide(4);
            }, 300);
        } else if (window.location.hash === '#slide6' || window.location.hash === '#heirloom' || window.location.hash === '#client-vault') {
            setTimeout(() => {
                const viewport = document.getElementById('sliderViewport');
                if (viewport) {
                    viewport.scrollIntoView({ behavior: 'smooth' });
                }
                this.goToSlide(5);
            }, 300);
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

        // Pause any card videos that might be playing when sliding away
        const cardVideos = document.querySelectorAll('.card-video-player');
        cardVideos.forEach(v => {
            if (!v.paused) {
                v.pause();
                const wrapper = v.closest('.video-media-wrapper');
                if (wrapper) wrapper.classList.remove('playing');
            }
        });

        this.scheduleNextSlide();
    }

    scheduleNextSlide() {
        clearTimeout(this.timer);
        const duration = this.slideDurations[this.currentIndex] || 5000;

        this.timer = setTimeout(() => {
            // If user has mouse over or modal is open, wait and check again
            if (this.isPaused || document.querySelector('.modal-overlay.open') || document.querySelector('.cinema-theater-modal.open')) {
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
// 3. UI EVENT HANDLER: Hero Page & Modals
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Initialize slider (safely no-ops when < 2 slides exist)
    const slider = new PageAutoSlider();
    window.aakarPageSlider = slider;

    /* -------------------------------------------------------------------------
       Cinematic Background Video — autoplay + fallback chain
       ------------------------------------------------------------------------- */
    const heroVideo = document.getElementById('heroCinemaVideo');
    const heroYt = document.getElementById('heroYtIframe');

    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.defaultMuted = true;
        
        const tryPlay = () => {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    heroVideo.style.opacity = '1';
                    if (heroYt) heroYt.style.display = 'none';
                }).catch(() => {
                    // Autoplay with video tag was blocked or network failed, fallback to YouTube or user click
                    if (heroYt) heroYt.style.opacity = '1';
                });
            }
        };

        tryPlay();

        // Any click or touch on screen will immediately trigger play if blocked by browser policy
        const resumeOnUserAction = () => {
            heroVideo.play().catch(() => {});
            document.removeEventListener('click', resumeOnUserAction);
            document.removeEventListener('touchstart', resumeOnUserAction);
        };
        document.addEventListener('click', resumeOnUserAction, { once: true });
        document.addEventListener('touchstart', resumeOnUserAction, { once: true, passive: true });

        // If native video encounters an error, display YouTube
        heroVideo.addEventListener('error', () => {
            heroVideo.style.display = 'none';
            if (heroYt) {
                heroYt.style.display = 'block';
                heroYt.style.opacity = '1';
            }
        });
    }

    /* -------------------------------------------------------------------------
       "Explore Our Work" button — opens booking modal with elegant delay
       ------------------------------------------------------------------------- */
    const btnExploreWork = document.getElementById('btnExploreWork');
    if (btnExploreWork) {
        btnExploreWork.addEventListener('click', () => {
            openBookModal('Wedding Photography');
        });
    }

    /* -------------------------------------------------------------------------
       Transparent Header — glassmorphism activates on scroll
       ------------------------------------------------------------------------- */
    const siteHeader = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
        if (!siteHeader) return;
        siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });

    /* -------------------------------------------------------------------------
       Smooth scroll for all internal anchor links
       ------------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '#bookModal') return; // let modal/onclick handle
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    /* -------------------------------------------------------------------------
       4. Interactive Wedding Package & Cost Estimator (Slide 4)
       ------------------------------------------------------------------------- */
    const durationRadios = document.querySelectorAll('input[name="calcDuration"]');
    const addonCheckboxes = document.querySelectorAll('.calc-addon');
    const calcSummaryList = document.getElementById('calcSummaryList');
    const calcTotalDisplay = document.getElementById('calcTotalDisplay');
    const btnBookCustomEstimate = document.getElementById('btnBookCustomEstimate');
    const btnSendEstimateWhatsApp = document.getElementById('btnSendEstimateWhatsApp');

    function calculateBespokePackage() {
        if (!calcSummaryList || !calcTotalDisplay) return;

        let total = 0;
        let selectedDurationName = '2 Days Royal Wedding';
        let selectedDurationPrice = 125000;

        // 1. Get Selected Duration
        durationRadios.forEach(radio => {
            const card = radio.closest('.calc-tier-card');
            if (radio.checked) {
                selectedDurationPrice = parseInt(radio.value, 10) || 0;
                selectedDurationName = radio.getAttribute('data-tier-name') || 'Coverage';
                total += selectedDurationPrice;
                if (card) card.classList.add('active');
            } else {
                if (card) card.classList.remove('active');
            }
        });

        // HTML for breakdown list
        let breakdownHTML = `
            <div class="summary-item-row">
                <span><i class="fa-solid fa-calendar-check" style="color:var(--color-rose-dark); margin-right:6px;"></i> ${selectedDurationName}</span>
                <span>₹${selectedDurationPrice.toLocaleString('en-IN')}</span>
            </div>
        `;

        // 2. Add-ons
        let selectedAddons = [];
        addonCheckboxes.forEach(cb => {
            if (cb.checked) {
                const cost = parseInt(cb.value, 10) || 0;
                const name = cb.getAttribute('data-addon-name') || 'Addon';
                total += cost;
                selectedAddons.push({ name, cost });
                breakdownHTML += `
                    <div class="summary-item-row">
                        <span><i class="fa-solid fa-check" style="color:#2E7D32; margin-right:6px;"></i> ${name}</span>
                        <span>+₹${cost.toLocaleString('en-IN')}</span>
                    </div>
                `;
            }
        });

        calcSummaryList.innerHTML = breakdownHTML;
        calcTotalDisplay.textContent = '₹' + total.toLocaleString('en-IN');

        return {
            durationName: selectedDurationName,
            total,
            addons: selectedAddons
        };
    }

    if (durationRadios.length > 0) {
        durationRadios.forEach(r => r.addEventListener('change', calculateBespokePackage));
        addonCheckboxes.forEach(cb => cb.addEventListener('change', calculateBespokePackage));
        calculateBespokePackage(); // Initial calculation
    }

    // Book Custom Estimate Button -> Opens Booking Modal with custom details
    if (btnBookCustomEstimate) {
        btnBookCustomEstimate.addEventListener('click', () => {
            const calcData = calculateBespokePackage();
            const modal = document.getElementById('bookModal');
            const shootTypeSelect = document.getElementById('shootType');
            if (modal) {
                modal.classList.add('open');
                if (shootTypeSelect && calcData) {
                    const customLabel = `Custom Estimate: ${calcData.durationName} (₹${calcData.total.toLocaleString('en-IN')})`;
                    let customOpt = document.getElementById('customEstimateOption');
                    if (!customOpt) {
                        customOpt = document.createElement('option');
                        customOpt.id = 'customEstimateOption';
                        shootTypeSelect.appendChild(customOpt);
                    }
                    customOpt.value = customLabel;
                    customOpt.textContent = customLabel;
                    shootTypeSelect.value = customLabel;
                }
            }
        });
    }

    // Send Estimate directly on WhatsApp to Chaitya Koradiya
    if (btnSendEstimateWhatsApp) {
        btnSendEstimateWhatsApp.addEventListener('click', () => {
            const calcData = calculateBespokePackage();
            if (!calcData) return;

            let text = `*📸 BESPOKE ESTIMATE INQUIRY - AAKAR FILMS*%0A%0A` +
                       `*Selected Tier:* ${encodeURIComponent(calcData.durationName)}%0A` +
                       `*Add-ons Selected:*%0A`;

            if (calcData.addons.length > 0) {
                calcData.addons.forEach(a => {
                    text += `• ${encodeURIComponent(a.name)} (+₹${a.cost.toLocaleString('en-IN')})%0A`;
                });
            } else {
                text += `(No extra add-ons)%0A`;
            }

            text += `%0A*TOTAL ESTIMATED INVESTMENT:* ₹${calcData.total.toLocaleString('en-IN')}%0A%0A` +
                    `_Hello Chaitya & Shrey, I configured this custom package on your website and would like to check availability!_`;

            window.open(`https://wa.me/916354896783?text=${text}`, '_blank');
        });
    }

    /* -------------------------------------------------------------------------
       5. In-Page VIP Reservation Form (Slide 4)
       Connects directly into LocalStorage CRM -> Instantly visible in Admin!
       ------------------------------------------------------------------------- */
    const inpageBookingForm = document.getElementById('inpageBookingForm');
    const inpageSuccess = document.getElementById('inpageSuccess');

    if (inpageBookingForm && inpageSuccess) {
        inpageBookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('inpageName')?.value.trim() || '';
            const phone = document.getElementById('inpagePhone')?.value.trim() || '';
            const date = document.getElementById('inpageDate')?.value || '';
            const shootType = document.getElementById('inpageShootType')?.value || 'Wedding Photography';
            const location = document.getElementById('inpageLocation')?.value.trim() || 'Ahmedabad';
            const notes = document.getElementById('inpageNotes')?.value.trim() || '';

            const submitBtn = document.getElementById('btnInpageSubmit');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>TRANSMITTING INQUIRY...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
            }

            // Save to Aakar DB (localStorage CRM)
            const savedBooking = await AakarDataEngine.saveBooking({
                name,
                phone,
                date,
                shootType,
                location: notes ? `${location} (Note: ${notes})` : location
            });

            // Display success message
            inpageBookingForm.style.display = 'none';
            inpageSuccess.style.display = 'block';

            // WhatsApp Direct Action
            const waUrl = `https://wa.me/916354896783?text=Hello%20Chaitya%20and%20Shrey,%20I%20just%20submitted%20a%20VIP%20inquiry%20for%20${encodeURIComponent(name)}%20(${savedBooking.id})%20on%20${encodeURIComponent(date)}%20for%20${encodeURIComponent(shootType)}.`;
            
            let directWaBtn = document.getElementById('inpageWaConfirmBtn');
            if (!directWaBtn) {
                directWaBtn = document.createElement('a');
                directWaBtn.id = 'inpageWaConfirmBtn';
                directWaBtn.className = 'btn-whatsapp';
                directWaBtn.style.marginTop = '18px';
                directWaBtn.style.display = 'inline-flex';
                directWaBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> <span>Send Instant Notice on WhatsApp</span>';
                directWaBtn.target = '_blank';
                directWaBtn.rel = 'noopener';
                inpageSuccess.appendChild(directWaBtn);
            }
            directWaBtn.href = waUrl;
        });
    }

    /* -------------------------------------------------------------------------
       6. CINEMATIC VIDEO GALLERY CONTROLLER (Slide 5)
       - Category Filter Tabs (All, Wedding Highlights, Pre-Wedding, Reels 9:16, BTS)
       - In-Card Direct HTML5 Video Play / Pause with dynamic overlay
       - 4K Full-Screen Cinema Theater Lightbox Modal
       ------------------------------------------------------------------------- */
    function initVideoGallery() {
        const filterBtns = document.querySelectorAll('.video-filter-btn');
        const videoCards = document.querySelectorAll('.cinematic-videos-grid .video-card');
        const sectionDividers = document.querySelectorAll('.video-section-divider');

        // 1. Category Filtering Logic
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetFilter = btn.getAttribute('data-filter') || 'all';

                // Update active tab styling
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter category section dividers
                sectionDividers.forEach(div => {
                    const divCat = div.getAttribute('data-category');
                    if (targetFilter === 'all' || divCat === targetFilter) {
                        div.style.display = 'flex';
                    } else {
                        div.style.display = 'none';
                    }
                });

                // Filter cards with smooth display transition
                videoCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (targetFilter === 'all' || cardCat === targetFilter) {
                        card.style.display = 'flex';
                        card.style.opacity = '1';
                    } else {
                        // Pause if playing
                        const v = card.querySelector('.card-video-player');
                        if (v && !v.paused) {
                            v.pause();
                            const wrap = card.querySelector('.video-media-wrapper');
                            if (wrap) wrap.classList.remove('playing');
                        }
                        card.style.display = 'none';
                    }
                });
            });
        });

        // 2. Direct In-Card Video Playback
        videoCards.forEach(card => {
            const wrapper = card.querySelector('.video-media-wrapper');
            const video = card.querySelector('.card-video-player');
            const playOverlay = card.querySelector('.video-play-overlay');

            if (!video || !wrapper) return;

            const toggleCardPlay = (e) => {
                // If user clicks on the theater mode button or whatsapp button, ignore
                if (e.target.closest('.btn-theater-trigger') || e.target.closest('.btn-card-wa') || e.target.closest('.reel-ig-badge')) {
                    return;
                }

                if (video.paused) {
                    // Pause any other playing video cards first
                    document.querySelectorAll('.card-video-player').forEach(otherVid => {
                        if (otherVid !== video && !otherVid.paused) {
                            otherVid.pause();
                            const otherWrap = otherVid.closest('.video-media-wrapper');
                            if (otherWrap) otherWrap.classList.remove('playing');
                        }
                    });

                    // Pause auto slider while watching
                    if (window.aakarPageSlider) {
                        window.aakarPageSlider.isPaused = true;
                    }

                    // Ensure video has direct src set
                    if (!video.src && card.getAttribute('data-video')) {
                        video.src = card.getAttribute('data-video');
                        video.load();
                    }

                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            wrapper.classList.add('playing');
                            video.controls = true;
                        }).catch(err => {
                            console.warn('Video play fallback triggered:', err);
                            video.src = 'https://cdn.coverr.co/videos/coverr-a-loving-couple-holding-hands-and-walking-on-the-beach-2228/1080p.mp4';
                            video.load();
                            video.play().then(() => {
                                wrapper.classList.add('playing');
                                video.controls = true;
                            }).catch(e => console.error('Video stream error:', e));
                        });
                    }
                } else {
                    video.pause();
                    wrapper.classList.remove('playing');
                }
            };

            if (playOverlay) {
                playOverlay.addEventListener('click', toggleCardPlay);
            }
            video.addEventListener('click', toggleCardPlay);

            video.addEventListener('ended', () => {
                wrapper.classList.remove('playing');
                video.controls = false;
                if (window.aakarPageSlider) {
                    window.aakarPageSlider.isPaused = false;
                }
            });

            video.addEventListener('pause', () => {
                wrapper.classList.remove('playing');
            });
        });

        // 3. 4K Cinema Theater Lightbox Modal
        const cinemaModal = document.getElementById('cinemaTheaterModal');
        const cinemaVideo = document.getElementById('cinemaModalVideo');
        const cinemaCloseBtn = document.getElementById('closeCinemaModal');
        const cinemaBackdrop = document.getElementById('cinemaModalBackdrop');
        const cinemaTag = document.getElementById('cinemaModalTag');
        const cinemaTitle = document.getElementById('cinemaModalTitle');
        const cinemaDesc = document.getElementById('cinemaModalDesc');
        const cinemaWaBtn = document.getElementById('cinemaModalWhatsApp');

        const theaterTriggers = document.querySelectorAll('.btn-theater-trigger');

        const openCinemaTheater = (card) => {
            if (!cinemaModal || !cinemaVideo) return;

            const videoSrc = card.getAttribute('data-video') || '';
            const title = card.getAttribute('data-title') || 'Cinematic Film';
            const tag = card.getAttribute('data-tag') || 'Cinema Highlights';
            const desc = card.getAttribute('data-desc') || '';

            // Pause any card videos
            document.querySelectorAll('.card-video-player').forEach(v => {
                if (!v.paused) {
                    v.pause();
                    const w = v.closest('.video-media-wrapper');
                    if (w) w.classList.remove('playing');
                }
            });

            if (cinemaTag) cinemaTag.textContent = tag;
            if (cinemaTitle) cinemaTitle.textContent = title;
            if (cinemaDesc) cinemaDesc.textContent = desc;
            if (cinemaWaBtn) {
                cinemaWaBtn.href = `https://wa.me/916354896783?text=Hello%20Aakar%20Films,%20I%20am%20watching%20*${encodeURIComponent(title)}*%20(${encodeURIComponent(tag)})%20on%20your%20website%20and%20would%20love%20to%20book%20a%20similar%20cinematic%20film!`;
            }

            cinemaVideo.src = videoSrc;
            cinemaModal.classList.add('open');
            cinemaModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            if (window.aakarPageSlider) {
                window.aakarPageSlider.isPaused = true;
            }

            cinemaVideo.load();
            const cinemaPlayPromise = cinemaVideo.play();
            if (cinemaPlayPromise !== undefined) {
                cinemaPlayPromise.catch(e => {
                    console.warn('Cinema autoplay fallback:', e);
                    cinemaVideo.src = 'https://cdn.coverr.co/videos/coverr-a-loving-couple-holding-hands-and-walking-on-the-beach-2228/1080p.mp4';
                    cinemaVideo.load();
                    cinemaVideo.play().catch(err => console.warn(err));
                });
            }
        };

        const closeCinemaTheater = () => {
            if (!cinemaModal) return;
            cinemaModal.classList.remove('open');
            cinemaModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (cinemaVideo) {
                cinemaVideo.pause();
                cinemaVideo.removeAttribute('src');
                cinemaVideo.load();
            }

            if (window.aakarPageSlider) {
                window.aakarPageSlider.isPaused = false;
            }
        };

        theaterTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = btn.closest('.video-card');
                if (card) {
                    openCinemaTheater(card);
                }
            });
        });

        if (cinemaCloseBtn) cinemaCloseBtn.addEventListener('click', closeCinemaTheater);
        if (cinemaBackdrop) cinemaBackdrop.addEventListener('click', closeCinemaTheater);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cinemaModal && cinemaModal.classList.contains('open')) {
                closeCinemaTheater();
            }
        });
    }

    // Initialize Video Gallery Controller
    initVideoGallery();

    /* -------------------------------------------------------------------------
       Slide 6: Heirloom Atelier Swatch Material Switcher
       ------------------------------------------------------------------------- */
    function initHeirloomSwatches() {
        const swatchBtns = document.querySelectorAll('.swatch-pill');
        const featuredAlbumImg = document.getElementById('featuredAlbumImg');
        const featuredAlbumTitle = document.getElementById('featuredAlbumTitle');
        const featuredAlbumDesc = document.getElementById('featuredAlbumDesc');

        swatchBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                swatchBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const newImg = btn.getAttribute('data-img');
                const newTitle = btn.getAttribute('data-title');
                const newDesc = btn.getAttribute('data-desc');

                if (featuredAlbumImg && newImg) {
                    featuredAlbumImg.style.opacity = '0.3';
                    setTimeout(() => {
                        featuredAlbumImg.src = newImg;
                        featuredAlbumImg.style.opacity = '1';
                    }, 180);
                }

                if (featuredAlbumTitle && newTitle) {
                    featuredAlbumTitle.textContent = newTitle;
                }

                if (featuredAlbumDesc && newDesc) {
                    featuredAlbumDesc.textContent = newDesc;
                }
            });
        });
    }

    /* -------------------------------------------------------------------------
       Slide 6: Auspicious Muhurat & Wedding Season Availability Calendar
       ------------------------------------------------------------------------- */
    function initMuhuratCalendar() {
        const monthTabs = document.querySelectorAll('.month-tab');
        const datesGrid = document.getElementById('muhuratDatesGrid');
        if (!datesGrid) return;

        const calendarData = {
            nov26: [
                { day: "Tuesday", dateNum: "24 Nov", iso: "2026-11-24", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Friday", dateNum: "27 Nov", iso: "2026-11-27", stars: "⭐⭐⭐⭐⭐", status: "limited", label: "1 Team Left" },
                { day: "Saturday", dateNum: "28 Nov", iso: "2026-11-28", stars: "⭐⭐⭐⭐⭐", status: "locked", label: "Booked" },
                { day: "Sunday", dateNum: "29 Nov", iso: "2026-11-29", stars: "⭐⭐⭐⭐", status: "avail", label: "Available Slot" }
            ],
            dec26: [
                { day: "Wednesday", dateNum: "02 Dec", iso: "2026-12-02", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Saturday", dateNum: "05 Dec", iso: "2026-12-05", stars: "⭐⭐⭐⭐⭐", status: "locked", label: "Booked" },
                { day: "Sunday", dateNum: "06 Dec", iso: "2026-12-06", stars: "⭐⭐⭐⭐⭐", status: "limited", label: "1 Team Left" },
                { day: "Friday", dateNum: "11 Dec", iso: "2026-12-11", stars: "⭐⭐⭐⭐", status: "avail", label: "Available Slot" }
            ],
            jan27: [
                { day: "Friday", dateNum: "15 Jan", iso: "2027-01-15", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Sunday", dateNum: "17 Jan", iso: "2027-01-17", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Friday", dateNum: "22 Jan", iso: "2027-01-22", stars: "⭐⭐⭐⭐⭐", status: "limited", label: "1 Team Left" },
                { day: "Saturday", dateNum: "30 Jan", iso: "2027-01-30", stars: "⭐⭐⭐⭐", status: "avail", label: "Available Slot" }
            ],
            feb27: [
                { day: "Thursday", dateNum: "04 Feb", iso: "2027-02-04", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Sunday", dateNum: "07 Feb", iso: "2027-02-07", stars: "⭐⭐⭐⭐⭐", status: "locked", label: "Booked" },
                { day: "Friday", dateNum: "12 Feb", iso: "2027-02-12", stars: "⭐⭐⭐⭐⭐", status: "limited", label: "1 Team Left" },
                { day: "Sunday", dateNum: "14 Feb", iso: "2027-02-14", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Valentine Muhurat" }
            ],
            mar27: [
                { day: "Tuesday", dateNum: "02 Mar", iso: "2027-03-02", stars: "⭐⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Friday", dateNum: "05 Mar", iso: "2027-03-05", stars: "⭐⭐⭐⭐", status: "avail", label: "Available Slot" },
                { day: "Sunday", dateNum: "07 Mar", iso: "2027-03-07", stars: "⭐⭐⭐⭐⭐", status: "limited", label: "1 Team Left" },
                { day: "Thursday", dateNum: "11 Mar", iso: "2027-03-11", stars: "⭐⭐⭐⭐", status: "avail", label: "Available Slot" }
            ]
        };

        function renderDates(monthKey) {
            const list = calendarData[monthKey] || calendarData.nov26;
            datesGrid.innerHTML = list.map(item => `
                <div class="muhurat-date-card ${item.status}" data-iso="${item.iso}" data-status="${item.status}" title="${item.status === 'locked' ? 'This date is already locked by another royal couple' : 'Click to Reserve this Date'}">
                    <div>
                        <div class="md-header">
                            <span class="md-day">${item.day}</span>
                            <span class="md-muhurat-tag">${item.stars}</span>
                        </div>
                        <div class="md-date-num">${item.dateNum}</div>
                    </div>
                    <span class="md-status-pill ${item.status}">
                        ${item.status === 'avail' ? '<i class="fa-solid fa-check"></i> ' : ''}${item.label}
                    </span>
                </div>
            `).join('');

            // Wire up click event on available dates
            const dateCards = datesGrid.querySelectorAll('.muhurat-date-card');
            dateCards.forEach(card => {
                card.addEventListener('click', () => {
                    const status = card.getAttribute('data-status');
                    const iso = card.getAttribute('data-iso');
                    if (status === 'locked') {
                        alert('This auspicious date is already booked. Please select another date or contact Chaitya & Shrey directly on WhatsApp for special multi-team arrangements.');
                        return;
                    }

                    // Open booking modal with prefilled date
                    const bookModal = document.getElementById('bookModal');
                    const shootDateInput = document.getElementById('shootDate');
                    const shootTypeSelect = document.getElementById('shootType');

                    if (shootDateInput && iso) {
                        shootDateInput.value = iso;
                    }
                    if (shootTypeSelect) {
                        shootTypeSelect.value = 'Gold Royal Edition (₹1,25,000)';
                    }
                    if (bookModal) {
                        bookModal.classList.add('open');
                        document.body.style.overflow = 'hidden';
                        if (window.aakarPageSlider) window.aakarPageSlider.isPaused = true;
                    }
                });
            });
        }

        // Initial render for Nov 2026
        renderDates('nov26');

        monthTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                monthTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderDates(tab.getAttribute('data-month'));
            });
        });
    }

    /* -------------------------------------------------------------------------
       Slide 6: Client Vault Demo Lightbox Modal & Interactions
       ------------------------------------------------------------------------- */
    function initClientVaultModal() {
        const vaultModal = document.getElementById('clientVaultModal');
        const openBtn = document.getElementById('btnOpenClientVaultModal');
        const closeBtn = document.getElementById('closeClientVaultModal');
        const filterBtns = document.querySelectorAll('#vaultFilterTabs .vtab-pill');
        const photoCards = document.querySelectorAll('#vaultDemoGrid .vault-photo-card');
        const downloadAllBtn = document.getElementById('btnVaultDownloadAll');
        const shareLinkBtn = document.getElementById('btnVaultShareLink');

        if (!vaultModal) return;

        const openVault = () => {
            vaultModal.classList.add('open');
            vaultModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (window.aakarPageSlider) window.aakarPageSlider.isPaused = true;
        };

        const closeVault = () => {
            vaultModal.classList.remove('open');
            vaultModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (window.aakarPageSlider) window.aakarPageSlider.isPaused = false;
        };

        if (openBtn) openBtn.addEventListener('click', openVault);
        if (closeBtn) closeBtn.addEventListener('click', closeVault);

        vaultModal.addEventListener('click', (e) => {
            if (e.target === vaultModal) closeVault();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && vaultModal.classList.contains('open')) {
                closeVault();
            }
        });

        // Photo Favoriting toggle
        const favBtns = document.querySelectorAll('.btn-photo-fav');
        favBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isLiked = btn.classList.toggle('liked');
                if (isLiked) {
                    btn.innerHTML = '<i class="fa-solid fa-heart" style="color: #DE688E;"></i>';
                } else {
                    btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
                }
            });
        });

        // Gallery Filter Tabs
        filterBtns.forEach(tab => {
            tab.addEventListener('click', () => {
                filterBtns.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.getAttribute('data-vfilter');

                photoCards.forEach(card => {
                    const cat = card.getAttribute('data-cat');
                    if (filter === 'all' || cat === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Download All Simulation
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => {
                const originalText = downloadAllBtn.innerHTML;
                downloadAllBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing 4K ZIP...';
                downloadAllBtn.disabled = true;

                setTimeout(() => {
                    downloadAllBtn.innerHTML = '<i class="fa-solid fa-check"></i> ZIP Download Started!';
                    alert('✓ AAKAR FILMS Client Vault:\nSimulated high-bandwidth 4K Master Archive download started (1,280 Photos + 4K Cinema Film, 4.8 GB). In real production, this generates an instant high-speed link.');
                    setTimeout(() => {
                        downloadAllBtn.innerHTML = originalText;
                        downloadAllBtn.disabled = false;
                    }, 2500);
                }, 1200);
            });
        }

        // Share Link Simulation
        if (shareLinkBtn) {
            shareLinkBtn.addEventListener('click', () => {
                navigator.clipboard?.writeText(window.location.origin + window.location.pathname + '#client-vault-riya-rahul-pin-8842')
                    .catch(() => {});
                alert('✓ Gallery PIN: 8842\nPrivate gallery link copied to clipboard. In the client portal, you can share this PIN with wedding guests for direct access.');
            });
        }
    }

    // Initialize Slide 6 Controllers
    initHeirloomSwatches();
    initMuhuratCalendar();
    initClientVaultModal();

});
