/**
 * AAKAR FILMS — ADMIN PORTAL CONTROLLER (admin.js)
 * Features:
 * - Real-time password validation (Capital letter [A-Z], Number [0-9], Special character [!@#$%...], Min 8 chars)
 * - Password visibility toggle (Eye icon)
 * - 1-Click Demo autofill (Aakar@2026!)
 * - Protected route guard for dashboard.html
 * - Full Studio CRM: Live Bookings DB in localStorage, Search, Filter, Status Changer, Delete
 * - Live KPI calculations (Total Inquiries, Pipeline Revenue, Upcoming Shoots)
 * - Interactive Tabs (Overview, Bookings CRM, Shoots Schedule, Studio Packages, Gear & Crew)
 * - Modal for adding new bookings
 * - CSV Report Export
 * - Real-time ticking clock
 * - WhatsApp Quick Chat Hub
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       AUTH STORAGE HELPERS (Resilient across local file:// and http://)
       ========================================================================== */
    function checkIsLoggedIn() {
        try {
            return sessionStorage.getItem('aakar_admin_logged_in') === 'true' || 
                   localStorage.getItem('aakar_admin_logged_in') === 'true';
        } catch (e) {
            return false;
        }
    }

    function saveAuthSession(email) {
        try {
            sessionStorage.setItem('aakar_admin_logged_in', 'true');
            sessionStorage.setItem('aakar_admin_user_email', email);
            localStorage.setItem('aakar_admin_logged_in', 'true');
            localStorage.setItem('aakar_admin_user_email', email);
        } catch (e) {
            console.warn('Storage not available:', e);
        }
    }

    function clearAuthSession() {
        try {
            sessionStorage.removeItem('aakar_admin_logged_in');
            sessionStorage.removeItem('aakar_admin_user_email');
            localStorage.removeItem('aakar_admin_logged_in');
            localStorage.removeItem('aakar_admin_user_email');
        } catch (e) {
            console.warn('Storage error on logout:', e);
        }
    }

    /* ==========================================================================
       1. ROUTE GUARD & WORKSPACE CONTROLLER (For dashboard.html)
       ========================================================================== */
    const isDashboardPage = document.querySelector('.admin-layout') !== null;

    if (isDashboardPage) {
        const loggedIn = checkIsLoggedIn();
        
        // If not logged in, redirect to login page
        if (!loggedIn) {
            window.location.replace('login.html');
            return;
        }

        // Display user email in profile
        let storedEmail = 'admin@aakarfilms.com';
        try {
            storedEmail = sessionStorage.getItem('aakar_admin_user_email') || 
                          localStorage.getItem('aakar_admin_user_email') || 
                          'admin@aakarfilms.com';
        } catch (e) {}

        const displayEmailEl = document.getElementById('displayAdminEmail');
        if (displayEmailEl) {
            displayEmailEl.textContent = storedEmail;
        }

        // Logout handler
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                clearAuthSession();
                window.location.href = 'login.html';
            });
        }

        // Customer Dashboard switcher links (handles both root and subfolder paths)
        const isSubdir = window.location.pathname.includes('/admin');
        const customerUrl = isSubdir ? '../index.html' : 'index.html';
        
        const navCustomerLink = document.getElementById('navCustomerDashboardLink');
        if (navCustomerLink) navCustomerLink.href = customerUrl;

        const topbarCustomerLink = document.getElementById('topbarCustomerLink');
        if (topbarCustomerLink) topbarCustomerLink.href = customerUrl;

        /* ======================================================================
           2. FULL STUDIO CRM & DASHBOARD FEATURES
           ====================================================================== */
        const STORAGE_KEY = 'aakar_photoshoot_bookings';

        // Initial Seed Bookings if localStorage is empty
        function getBookings() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                let list = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(list) || list.length === 0) {
                    list = [
                        {
                            id: 'AK-9081',
                            name: 'Rohan & Ananya Sharma',
                            phone: '9825164720',
                            shootType: 'Pre-Wedding Shoot',
                            date: '2026-11-18',
                            location: 'City Palace, Udaipur',
                            amount: '₹1,20,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-04T10:30:00Z'
                        },
                        {
                            id: 'AK-9082',
                            name: 'Priya & Dev Patel',
                            phone: '9898234110',
                            shootType: 'Gold Royal Heritage',
                            date: '2026-11-24',
                            location: 'The Oberoi Udaivilas, Udaipur',
                            amount: '₹2,50,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-05T14:15:00Z'
                        },
                        {
                            id: 'AK-9083',
                            name: 'Dr. Pooja & Harshil Desai',
                            phone: '9712345678',
                            shootType: 'Maternity Shoot',
                            date: '2026-12-02',
                            location: 'Aakar Signature Studio, Ahmedabad',
                            amount: '₹45,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-05T18:40:00Z'
                        },
                        {
                            id: 'AK-9084',
                            name: 'Sneha & Karan Mehta',
                            phone: '9824011223',
                            shootType: 'Pre-Wedding Shoot',
                            date: '2026-12-08',
                            location: 'White Desert, Rann of Kutch',
                            amount: '₹1,25,000',
                            status: 'Pending',
                            createdAt: '2026-11-06T09:10:00Z'
                        },
                        {
                            id: 'AK-9085',
                            name: 'Vikram & Natasha Joshi',
                            phone: '9909988776',
                            shootType: 'Platinum Imperial VIP',
                            date: '2026-12-15',
                            location: 'Fairmont Jaipur, Rajasthan',
                            amount: '₹2,80,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-06T12:00:00Z'
                        },
                        {
                            id: 'AK-9086',
                            name: 'Aarav Singhania',
                            phone: '9723456789',
                            shootType: 'Fashion Photography',
                            date: '2026-12-22',
                            location: 'Heritage Haveli, Ahmedabad',
                            amount: '₹60,000',
                            status: 'Completed',
                            createdAt: '2026-11-06T15:20:00Z'
                        }
                    ];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                }
                return list;
            } catch (e) {
                return [];
            }
        }

        function saveBookingsList(list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            } catch (e) {
                console.warn('Storage error:', e);
            }
        }

        // Live Real-Time Clock
        const liveClockText = document.getElementById('liveClockText');
        function updateClock() {
            if (!liveClockText) return;
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            liveClockText.textContent = now.toLocaleDateString('en-US', options);
        }
        updateClock();
        setInterval(updateClock, 1000);

        // Sidebar Tabs Switcher
        const tabButtons = document.querySelectorAll('.sidebar-menu .tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const pageHeaderTitle = document.getElementById('pageHeaderTitle');

        const tabTitles = {
            'tab-overview': 'Studio Operations Hub',
            'tab-bookings': 'Live Bookings & Client Inquiries CRM',
            'tab-schedule': 'Shoots Calendar & Call Sheet',
            'tab-packages': 'Studio Photography & Film Packages',
            'tab-crew': 'Creative Crew & Production Gear Inventory'
        };

        function switchTab(targetTabId) {
            tabButtons.forEach(btn => {
                if (btn.getAttribute('data-tab') === targetTabId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            tabPanes.forEach(pane => {
                if (pane.id === targetTabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            if (pageHeaderTitle && tabTitles[targetTabId]) {
                pageHeaderTitle.textContent = tabTitles[targetTabId];
            }

            // Re-apply glassy interactivity to elements on newly switched tab
            setTimeout(() => {
                initGlassmorphicEffects();
            }, 50);
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // "View All" link on Overview tab switches directly to CRM tab
        const btnViewAllBookings = document.getElementById('btnViewAllBookings');
        if (btnViewAllBookings) {
            btnViewAllBookings.addEventListener('click', () => {
                switchTab('tab-bookings');
            });
        }

        // Helper: Category badge CSS class
        function getCategoryBadgeClass(service) {
            const lower = (service || '').toLowerCase();
            if (lower.includes('wedding')) return 'cat-wedding';
            if (lower.includes('pre-wedding')) return 'cat-prewedding';
            if (lower.includes('maternity')) return 'cat-maternity';
            if (lower.includes('baby')) return 'cat-baby';
            if (lower.includes('fashion')) return 'cat-fashion';
            return 'cat-cinema';
        }

        // Helper: Status badge CSS class
        function getStatusPillClass(status) {
            const lower = (status || '').toLowerCase();
            if (lower === 'confirmed') return 'status-confirmed';
            if (lower === 'pending') return 'status-pending';
            if (lower === 'completed') return 'status-completed';
            return 'status-review';
        }

        // Recalculate KPI Metric Cards
        function updateKPIMetrics(bookings) {
            const totalCount = bookings.length;
            const badgeBookingCount = document.getElementById('badgeBookingCount');
            if (badgeBookingCount) badgeBookingCount.textContent = totalCount;

            const kpiTotalBookings = document.getElementById('kpiTotalBookings');
            if (kpiTotalBookings) kpiTotalBookings.textContent = totalCount;

            // Pipeline Revenue: calculate total estimated amounts
            let totalAmountNum = 0;
            let confirmedShootsCount = 0;

            bookings.forEach(b => {
                if (b.status === 'Confirmed' || b.status === 'Completed') {
                    confirmedShootsCount++;
                }
                if (b.amount) {
                    const cleaned = String(b.amount).replace(/[^0-9]/g, '');
                    const val = parseInt(cleaned, 10);
                    if (!isNaN(val)) totalAmountNum += val;
                } else {
                    totalAmountNum += 75000; // default estimated value
                }
            });

            const kpiTotalRevenue = document.getElementById('kpiTotalRevenue');
            if (kpiTotalRevenue) {
                kpiTotalRevenue.textContent = '₹' + totalAmountNum.toLocaleString('en-IN');
            }

            const kpiShootsThisMonth = document.getElementById('kpiShootsThisMonth');
            if (kpiShootsThisMonth) {
                kpiShootsThisMonth.textContent = confirmedShootsCount;
            }
        }

        // Render Recent Table on Overview Tab (Top 5)
        function renderOverviewTable(bookings) {
            const tbody = document.getElementById('overviewRecentTableBody');
            if (!tbody) return;

            const recentFive = bookings.slice(0, 5);
            if (recentFive.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:#888;">No bookings recorded yet.</td></tr>';
                return;
            }

            tbody.innerHTML = recentFive.map(b => {
                const waUrl = `https://wa.me/91${b.phone}?text=Hello%20${encodeURIComponent(b.name)},%20this%20is%20Aakar%20Films%20Studio%20regarding%20your%20photo%20shoot%20booking%20(${b.id}).`;
                return `
                    <tr>
                        <td>
                            <div class="client-name-cell">
                                <span class="client-name-bold">${b.name}</span>
                                <span class="client-phone-sub">+91 ${b.phone}</span>
                            </div>
                        </td>
                        <td>
                            <span class="category-badge ${getCategoryBadgeClass(b.shootType)}">${b.shootType}</span>
                        </td>
                        <td>${b.date}</td>
                        <td>
                            <span class="status-pill ${getStatusPillClass(b.status)}">${b.status}</span>
                        </td>
                        <td>
                            <div class="table-actions-group">
                                <a href="${waUrl}" target="_blank" rel="noopener" class="action-btn-sm action-btn-whatsapp" title="WhatsApp Client">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render All Bookings Full Table (Tab 2)
        function renderCRMTable(bookings) {
            const tbody = document.getElementById('crmBookingsTableBody');
            if (!tbody) return;

            if (bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:#888;">No inquiries match the current search / filter criteria.</td></tr>';
                return;
            }

            tbody.innerHTML = bookings.map(b => {
                const waUrl = `https://wa.me/91${b.phone}?text=Hello%20${encodeURIComponent(b.name)},%20this%20is%20Aakar%20Films%20Studio%20regarding%20your%20photo%20shoot%20booking%20(${b.id}).`;
                const amountDisplay = b.amount ? (b.amount.startsWith('₹') ? b.amount : '₹' + b.amount) : '₹1,25,000';
                
                return `
                    <tr data-booking-id="${b.id}">
                        <td><strong style="color:var(--color-rose-dark); font-family:monospace;">${b.id}</strong></td>
                        <td>
                            <div class="client-name-cell">
                                <span class="client-name-bold">${b.name}</span>
                                <span class="client-phone-sub">+91 ${b.phone}</span>
                            </div>
                        </td>
                        <td>
                            <span class="category-badge ${getCategoryBadgeClass(b.shootType)}">${b.shootType}</span>
                        </td>
                        <td><strong>${b.date}</strong></td>
                        <td><i class="fa-solid fa-location-dot" style="color:var(--color-rose); font-size:0.75rem; margin-right:4px;"></i>${b.location || 'Studio Ahmedabad'}</td>
                        <td><strong>${amountDisplay}</strong></td>
                        <td>
                            <select class="filter-select crm-status-select" data-id="${b.id}" style="padding:4px 8px; font-size:0.74rem;">
                                <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </td>
                        <td>
                            <div class="table-actions-group">
                                <a href="${waUrl}" target="_blank" rel="noopener" class="action-btn-sm action-btn-whatsapp" title="Chat on WhatsApp">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </a>
                                <button type="button" class="action-btn-sm action-btn-delete" data-id="${b.id}" title="Delete Record">
                                    <i class="fa-regular fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach event listeners for status change dropdowns
            document.querySelectorAll('.crm-status-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const newStatus = e.target.value;
                    const all = getBookings();
                    const item = all.find(x => x.id === id);
                    if (item) {
                        item.status = newStatus;
                        saveBookingsList(all);
                        refreshAllViews();
                    }
                });
            });

            // Attach event listeners for delete buttons
            document.querySelectorAll('.action-btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    if (confirm(`Are you sure you want to delete inquiry ${id}?`)) {
                        let all = getBookings();
                        all = all.filter(x => x.id !== id);
                        saveBookingsList(all);
                        refreshAllViews();
                    }
                });
            });
        }

        // Master Refresh Function
        function refreshAllViews() {
            const allBookings = getBookings();
            updateKPIMetrics(allBookings);
            renderOverviewTable(allBookings);
            applyCRMSearchAndFilter();
            initGlassmorphicEffects();
        }

        // Live Search and Status Filter for CRM
        const searchInput = document.getElementById('crmSearchInput');
        const statusFilter = document.getElementById('crmStatusFilter');

        function applyCRMSearchAndFilter() {
            const all = getBookings();
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const status = statusFilter ? statusFilter.value : 'ALL';

            const filtered = all.filter(item => {
                const matchesQuery = !query || 
                    (item.name && item.name.toLowerCase().includes(query)) ||
                    (item.phone && item.phone.toLowerCase().includes(query)) ||
                    (item.shootType && item.shootType.toLowerCase().includes(query)) ||
                    (item.location && item.location.toLowerCase().includes(query)) ||
                    (item.id && item.id.toLowerCase().includes(query));

                const matchesStatus = (status === 'ALL') || (item.status === status);

                return matchesQuery && matchesStatus;
            });

            renderCRMTable(filtered);
        }

        if (searchInput) searchInput.addEventListener('input', applyCRMSearchAndFilter);
        if (statusFilter) statusFilter.addEventListener('change', applyCRMSearchAndFilter);

        // Export Bookings to CSV
        const btnExportCSV = document.getElementById('btnExportCSV');
        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', () => {
                const bookings = getBookings();
                if (bookings.length === 0) {
                    alert('No bookings to export.');
                    return;
                }

                let csv = 'Booking ID,Client Name,Phone,Shoot Type,Shoot Date,Location,Amount,Status\n';
                bookings.forEach(b => {
                    const safeName = `"${(b.name || '').replace(/"/g, '""')}"`;
                    const safeLocation = `"${(b.location || '').replace(/"/g, '""')}"`;
                    const safeAmount = `"${(b.amount || '').replace(/"/g, '""')}"`;
                    csv += `${b.id},${safeName},${b.phone},${b.shootType},${b.date},${safeLocation},${safeAmount},${b.status}\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `aakar_bookings_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

        // WhatsApp Quick Chat Hub Handler
        const btnWaQuickSend = document.getElementById('btnWaQuickSend');
        const waQuickPhone = document.getElementById('waQuickPhone');
        if (btnWaQuickSend && waQuickPhone) {
            btnWaQuickSend.addEventListener('click', () => {
                let phone = waQuickPhone.value.trim().replace(/[^0-9]/g, '');
                if (!phone) {
                    alert('Please enter a valid phone number.');
                    return;
                }
                if (phone.length === 10) phone = '91' + phone;
                window.open(`https://wa.me/${phone}?text=Hello,%20this%20is%20Aakar%20Films%20Studio.`, '_blank');
            });
        }

        // "+ New Booking" Modal Management
        const newBookingModal = document.getElementById('adminNewBookingModal');
        const btnOpenModal1 = document.getElementById('btnOpenNewBookingModal');
        const btnOpenModal2 = document.getElementById('btnOpenNewBookingModal2');
        const btnCloseModal = document.getElementById('btnCloseNewBookingModal');
        const btnCancelModal = document.getElementById('btnCancelNewBooking');
        const newBookingForm = document.getElementById('adminNewBookingForm');

        function openModal() {
            if (newBookingModal) {
                newBookingModal.classList.add('open');
                // Set default minimum date to today
                const dateInput = document.getElementById('modalShootDate');
                if (dateInput) {
                    dateInput.min = new Date().toISOString().split('T')[0];
                }
            }
        }

        function closeModal() {
            if (newBookingModal) {
                newBookingModal.classList.remove('open');
                if (newBookingForm) newBookingForm.reset();
            }
        }

        if (btnOpenModal1) btnOpenModal1.addEventListener('click', openModal);
        if (btnOpenModal2) btnOpenModal2.addEventListener('click', openModal);
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        window.addEventListener('click', (e) => {
            if (e.target === newBookingModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && newBookingModal && newBookingModal.classList.contains('open')) {
                closeModal();
            }
        });

        // Add New Booking Form Submit
        if (newBookingForm) {
            newBookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('modalClientName').value.trim();
                const phone = document.getElementById('modalClientPhone').value.trim();
                const date = document.getElementById('modalShootDate').value;
                const shootType = document.getElementById('modalShootType').value;
                const location = document.getElementById('modalShootLocation').value.trim() || 'Studio Ahmedabad';
                let amount = document.getElementById('modalShootAmount').value.trim();
                const status = document.getElementById('modalShootStatus').value || 'Confirmed';

                if (!name || !phone || !date) {
                    alert('Please fill in all required fields.');
                    return;
                }

                if (!amount) amount = '₹1,25,000';
                if (!amount.startsWith('₹')) amount = '₹' + amount;

                const newRecord = {
                    id: 'AK-' + Math.floor(1000 + Math.random() * 9000),
                    name,
                    phone,
                    date,
                    shootType,
                    location,
                    amount,
                    status,
                    createdAt: new Date().toISOString()
                };

                const currentList = getBookings();
                currentList.unshift(newRecord);
                saveBookingsList(currentList);

                closeModal();
                refreshAllViews();
            });
        }

        /* ======================================================================
           GLASSMORPHISM INTERACTIVE CLICK & TACTILE SHEEN CONTROLLER
           Adds authentic frosted glass ripple, specular beam sweep, and active glow
           ====================================================================== */
        function initGlassmorphicEffects() {
            const featureSelectors = [
                '.metric-card',
                '.dash-card',
                '.schedule-card',
                '.package-card',
                '.gear-row',
                '.crew-item',
                '.nav-item',
                '.btn-primary-action',
                '.btn-secondary-action',
                '.btn-topbar-customer',
                '.topbar-clock',
                '.status-pill',
                '.category-badge',
                '.action-btn-sm',
                '.whatsapp-hub-card',
                '.studio-table tbody tr',
                '.btn-wa-send',
                '.btn-logout',
                '.filter-select',
                '.search-input'
            ];

            const elements = document.querySelectorAll(featureSelectors.join(','));

            elements.forEach(el => {
                if (!el.classList.contains('glass-interactive')) {
                    el.classList.add('glass-interactive');
                }

                if (el.dataset.glassyBound === 'true') return;
                el.dataset.glassyBound = 'true';

                el.addEventListener('click', function(e) {
                    // 1. Crystal Ripple Wave from exact mouse coordinates
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const ripple = document.createElement('span');
                    ripple.className = 'glass-ripple-wave';
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    this.appendChild(ripple);

                    setTimeout(() => {
                        ripple.remove();
                    }, 700);

                    // 2. Light Sheen Reflection Beam sweep across glass
                    let beam = this.querySelector('.glass-sheen-beam');
                    if (!beam) {
                        beam = document.createElement('span');
                        beam.className = 'glass-sheen-beam';
                        this.appendChild(beam);
                    }
                    this.classList.remove('trigger-sheen');
                    void this.offsetWidth; // Force reflow
                    this.classList.add('trigger-sheen');

                    // 3. Tactile Pressed Crystal Effect
                    this.classList.add('glassy-clicked');
                    setTimeout(() => {
                        this.classList.remove('glassy-clicked');
                    }, 300);

                    // 4. Feature Selection & Focus Highlight
                    if (this.classList.contains('metric-card')) {
                        document.querySelectorAll('.metric-card').forEach(c => c.classList.remove('glassy-selected'));
                        this.classList.add('glassy-selected');
                    } else if (this.classList.contains('schedule-card')) {
                        document.querySelectorAll('.schedule-card').forEach(c => c.classList.remove('glassy-selected'));
                        this.classList.add('glassy-selected');
                    } else if (this.classList.contains('package-card')) {
                        document.querySelectorAll('.package-card').forEach(c => c.classList.remove('glassy-selected'));
                        this.classList.add('glassy-selected');
                    } else if (this.classList.contains('gear-row') || this.classList.contains('crew-item')) {
                        const parentList = this.closest('.gear-list, .crew-list');
                        if (parentList) {
                            parentList.querySelectorAll('.gear-row, .crew-item').forEach(c => c.classList.remove('glassy-selected'));
                        }
                        this.classList.add('glassy-selected');
                    } else if (this.tagName === 'TR') {
                        const tbody = this.closest('tbody');
                        if (tbody) {
                            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('glassy-row-active'));
                        }
                        this.classList.add('glassy-row-active');
                    }
                });
            });
        }

        // Initialize All Dashboard Views
        refreshAllViews();
        initGlassmorphicEffects();

        return; // Dashboard initialization complete
    }


    /* ==========================================================================
       3. ADMIN LOGIN CONTROLLER (For login.html)
       ========================================================================== */
    const loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    const btnDemoFill = document.getElementById('btnDemoFill');
    const loginAlert = document.getElementById('loginAlert');
    const loginAlertText = document.getElementById('loginAlertText');

    // Password requirement checklist DOM nodes
    const reqCapital = document.getElementById('reqCapital');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');
    const reqLength = document.getElementById('reqLength');

    // Regex Validation Rules (User requested: MUST contain Capital, Number, Special char)
    const hasCapitalRegex = /[A-Z]/;
    const hasNumberRegex = /[0-9]/;
    const hasSpecialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

    function setItemValid(element, isValid) {
        if (!element) return;
        if (isValid) {
            element.classList.add('valid');
            const icon = element.querySelector('i');
            if (icon) {
                icon.className = 'fa-solid fa-circle-check';
            }
        } else {
            element.classList.remove('valid');
            const icon = element.querySelector('i');
            if (icon) {
                icon.className = 'fa-regular fa-circle-check';
            }
        }
    }

    // Real-time password requirement validator
    function validatePasswordRequirements(pwd) {
        const hasCapital = hasCapitalRegex.test(pwd);
        const hasNumber = hasNumberRegex.test(pwd);
        const hasSpecial = hasSpecialRegex.test(pwd);
        const hasLength = pwd.length >= 8;

        setItemValid(reqCapital, hasCapital);
        setItemValid(reqNumber, hasNumber);
        setItemValid(reqSpecial, hasSpecial);
        setItemValid(reqLength, hasLength);

        return hasCapital && hasNumber && hasSpecial && hasLength;
    }

    // Listen to password typing in real-time
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            validatePasswordRequirements(e.target.value);
            hideAlert();
        });
    }

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePasswordIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        });
    }

    // 1-Click Demo Credentials Auto-Fill
    if (btnDemoFill && emailInput && passwordInput) {
        btnDemoFill.addEventListener('click', (e) => {
            e.preventDefault();
            emailInput.value = 'admin@aakarfilms.com';
            passwordInput.value = 'Aakar@2026!';
            validatePasswordRequirements(passwordInput.value);
            hideAlert();
            passwordInput.focus();
        });
    }

    // Alert helpers
    function showAlert(message) {
        if (loginAlert && loginAlertText) {
            loginAlertText.textContent = message;
            loginAlert.classList.add('show');
        }
    }

    function hideAlert() {
        if (loginAlert) {
            loginAlert.classList.remove('show');
        }
    }

    // Form Submit Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email) {
            showAlert('Please enter your admin email address.');
            if (emailInput) emailInput.focus();
            return;
        }

        // Strict verification of password rules (Capital, Number, Special char, Min 8)
        const isValid = validatePasswordRequirements(password);
        if (!isValid) {
            showAlert('Password must contain at least 1 capital letter (A-Z), 1 number (0-9), and 1 special character (!@#$).');
            if (passwordInput) passwordInput.focus();
            return;
        }

        // Store authenticated session
        saveAuthSession(email);

        // Success animation on button
        const submitBtn = document.getElementById('btnAdminLogin');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>LOGGING IN...</span>';
            submitBtn.style.opacity = '0.9';
            submitBtn.disabled = true;
        }

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 400);
    });

});
