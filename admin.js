/**
 * AAKAR FILMS — ADMIN PORTAL CONTROLLER (admin.js)
 * Features:
 * - Real-time password validation (Capital letter, Number, Special character, Min length)
 * - Password visibility toggle
 * - 1-Click Demo autofill
 * - Resilient session/auth management across file:// and http://
 * - Protected route guard for dashboard.html
 * - Logout functionality
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       AUTH STORAGE HELPERS (Resilient for local files and servers)
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
       1. ROUTE GUARD (For dashboard.html)
       ========================================================================== */
    const isDashboardPage = document.querySelector('.admin-layout') !== null;

    if (isDashboardPage) {
        const loggedIn = checkIsLoggedIn();
        
        // If not logged in, redirect to login page
        if (!loggedIn) {
            window.location.replace('login.html');
            return;
        }

        // Display user email
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

        /* ======================================================================
           STUDIO DASHBOARD CONTROLLER (CRM, Analytics, Schedule, Bookings)
           ====================================================================== */
        const STORAGE_KEY = 'aakar_photoshoot_bookings';

        // 1. Initial Mock / Seed Data
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
                            name: 'Priya Patel & Dev Patel',
                            phone: '9898234110',
                            shootType: 'Wedding Photography',
                            date: '2026-11-24',
                            location: 'Grand Ballroom, Ahmedabad',
                            amount: '₹3,50,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-05T14:15:00Z'
                        },
                        {
                            id: 'AK-9083',
                            name: 'Dr. Sneha & Kunal Vora',
                            phone: '9724589100',
                            shootType: 'Maternity Photography',
                            date: '2026-11-12',
                            location: 'Aakar Indoor Studio 1',
                            amount: '₹45,000',
                            status: 'Pending',
                            createdAt: '2026-11-06T09:00:00Z'
                        },
                        {
                            id: 'AK-9084',
                            name: 'Kiara Mehta',
                            phone: '9638527410',
                            shootType: 'Fashion & Editorial',
                            date: '2026-12-02',
                            location: 'Heritage Resort, Jaipur',
                            amount: '₹85,000',
                            status: 'In Review',
                            createdAt: '2026-11-06T11:20:00Z'
                        },
                        {
                            id: 'AK-9085',
                            name: 'Aarav & Meera Joshi',
                            phone: '9427189230',
                            shootType: 'Baby Shower Shoot',
                            date: '2026-11-15',
                            location: 'Pal Luxury Hall, Surat',
                            amount: '₹35,000',
                            status: 'Confirmed',
                            createdAt: '2026-11-06T15:45:00Z'
                        }
                    ];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                }
                return list;
            } catch (e) {
                return [];
            }
        }

        function saveBookings(list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            } catch (e) {
                console.warn('LocalStorage save failed:', e);
            }
        }

        // Live Clock
        function updateClock() {
            const clockEl = document.getElementById('liveClockText');
            if (!clockEl) return;
            const now = new Date();
            const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            clockEl.textContent = now.toLocaleString('en-IN', options);
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Helper: Category Badge Class
        function getCategoryClass(category) {
            if (!category) return 'cat-wedding';
            const cat = category.toLowerCase();
            if (cat.includes('pre-wedding')) return 'cat-prewedding';
            if (cat.includes('wedding')) return 'cat-wedding';
            if (cat.includes('maternity')) return 'cat-maternity';
            if (cat.includes('baby')) return 'cat-baby';
            if (cat.includes('fashion')) return 'cat-fashion';
            return 'cat-cinema';
        }

        // Helper: Status Pill Class
        function getStatusClass(status) {
            const s = (status || 'Pending').toLowerCase();
            if (s === 'confirmed') return 'status-confirmed';
            if (s === 'completed') return 'status-completed';
            if (s === 'in review' || s === 'review') return 'status-review';
            return 'status-pending';
        }

        // Format Currency
        function formatAmount(val) {
            if (!val) return '₹65,000';
            if (String(val).startsWith('₹')) return val;
            const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
            return isNaN(num) ? '₹65,000' : '₹' + num.toLocaleString('en-IN');
        }

        // Render KPIs
        function renderKPIs(list) {
            const totalEl = document.getElementById('kpiTotalBookings');
            const revenueEl = document.getElementById('kpiRevenue');
            const upcomingEl = document.getElementById('kpiUpcomingCount');
            const pendingEl = document.getElementById('kpiPendingCount');
            const badgeCountEl = document.getElementById('badgeBookingCount');

            if (totalEl) totalEl.textContent = list.length;
            if (badgeCountEl) badgeCountEl.textContent = list.length;

            let totalRevenue = 0;
            let pendingCount = 0;
            let upcomingCount = 0;
            const todayStr = new Date().toISOString().split('T')[0];

            list.forEach(b => {
                const num = parseInt(String(b.amount || '65000').replace(/[^0-9]/g, ''), 10);
                totalRevenue += isNaN(num) ? 65000 : num;

                if (b.status === 'Pending' || b.status === 'In Review') {
                    pendingCount++;
                }
                if (b.date && b.date >= todayStr) {
                    upcomingCount++;
                }
            });

            if (revenueEl) {
                if (totalRevenue >= 100000) {
                    revenueEl.textContent = '₹' + (totalRevenue / 100000).toFixed(2) + ' L';
                } else {
                    revenueEl.textContent = '₹' + totalRevenue.toLocaleString('en-IN');
                }
            }

            if (upcomingEl) upcomingEl.textContent = Math.max(upcomingCount, 1);
            if (pendingEl) pendingEl.textContent = pendingCount;
        }

        // Render Recent Table (Overview Tab)
        function renderRecentTable(list) {
            const tbody = document.getElementById('recentBookingsTbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            const recentList = list.slice(0, 5);
            if (recentList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--color-text-muted);">No bookings found. Click "+ New Booking" to add one.</td></tr>';
                return;
            }

            recentList.forEach(item => {
                const tr = document.createElement('tr');
                const catClass = getCategoryClass(item.shootType);
                const statusClass = getStatusClass(item.status);
                const cleanPhone = String(item.phone || '').replace(/[^0-9]/g, '');

                tr.innerHTML = `
                    <td>
                        <div class="client-name-cell">
                            <span class="client-name-bold">${escapeHtml(item.name || 'Client')}</span>
                            <span class="client-phone-sub">+91 ${escapeHtml(cleanPhone)}</span>
                        </div>
                    </td>
                    <td><span class="category-badge ${catClass}">${escapeHtml(item.shootType || 'Wedding Photography')}</span></td>
                    <td>
                        <div class="client-name-cell">
                            <span><i class="fa-regular fa-calendar" style="color:var(--color-rose); margin-right:4px;"></i> ${escapeHtml(item.date || 'TBD')}</span>
                            <span class="client-phone-sub"><i class="fa-solid fa-location-dot" style="margin-right:4px;"></i> ${escapeHtml(item.location || 'Studio')}</span>
                        </div>
                    </td>
                    <td>
                        <button type="button" class="status-pill ${statusClass} btn-cycle-status" data-id="${item.id}" title="Click to cycle status">
                            <i class="fa-solid fa-circle-dot" style="font-size:0.5rem;"></i>
                            <span>${escapeHtml(item.status || 'Pending')}</span>
                        </button>
                    </td>
                    <td>
                        <div class="table-actions-group">
                            <a href="https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(item.name || 'Client')},%20greetings%20from%20Aakar%20Films!%20Regarding%20your%20${encodeURIComponent(item.shootType || 'shoot')}%20booking%20(${item.id})..." target="_blank" class="action-btn-sm action-btn-whatsapp" title="Chat on WhatsApp">
                                <i class="fa-brands fa-whatsapp"></i>
                            </a>
                            <button type="button" class="action-btn-sm action-btn-delete" data-id="${item.id}" title="Delete Record">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Render Full Table (All Bookings Tab)
        function renderAllTable(list) {
            const tbody = document.getElementById('allBookingsTbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 32px; color: var(--color-text-muted);">No records match your search or filter criteria.</td></tr>';
                return;
            }

            list.forEach(item => {
                const tr = document.createElement('tr');
                const catClass = getCategoryClass(item.shootType);
                const statusClass = getStatusClass(item.status);
                const cleanPhone = String(item.phone || '').replace(/[^0-9]/g, '');
                const estAmount = formatAmount(item.amount);

                tr.innerHTML = `
                    <td><strong>#${escapeHtml(item.id || 'AK-001')}</strong></td>
                    <td>
                        <div class="client-name-cell">
                            <span class="client-name-bold">${escapeHtml(item.name || 'Client')}</span>
                            <span class="client-phone-sub">+91 ${escapeHtml(cleanPhone)}</span>
                        </div>
                    </td>
                    <td><span class="category-badge ${catClass}">${escapeHtml(item.shootType || 'Wedding Photography')}</span></td>
                    <td>
                        <div class="client-name-cell">
                            <span><i class="fa-regular fa-calendar" style="color:var(--color-rose); margin-right:4px;"></i> ${escapeHtml(item.date || 'TBD')}</span>
                            <span class="client-phone-sub"><i class="fa-solid fa-location-dot" style="margin-right:4px;"></i> ${escapeHtml(item.location || 'Studio')}</span>
                        </div>
                    </td>
                    <td><strong style="color:var(--color-rose-dark);">${estAmount}</strong></td>
                    <td>
                        <button type="button" class="status-pill ${statusClass} btn-cycle-status" data-id="${item.id}" title="Click to cycle status (Pending -> Confirmed -> Completed)">
                            <i class="fa-solid fa-circle-dot" style="font-size:0.5rem;"></i>
                            <span>${escapeHtml(item.status || 'Pending')}</span>
                        </button>
                    </td>
                    <td>
                        <div class="table-actions-group">
                            <a href="https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(item.name || 'Client')},%20greetings%20from%20Aakar%20Films!%20Regarding%20your%20${encodeURIComponent(item.shootType || 'shoot')}%20booking%20(${item.id})..." target="_blank" class="action-btn-sm action-btn-whatsapp" title="Chat on WhatsApp">
                                <i class="fa-brands fa-whatsapp"></i>
                            </a>
                            <button type="button" class="action-btn-sm action-btn-delete" data-id="${item.id}" title="Delete Record">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Render Schedule Cards (Tab 3)
        function renderSchedule(list) {
            const container = document.getElementById('scheduleListContainer');
            if (!container) return;
            container.innerHTML = '';

            const photographers = ['Herik Navdiwala (Director)', 'Vikram Rathore (Candid Lead)', 'Pooja Shah (Portraits)', 'Aniket Verma (Cinema Team)'];
            const gearConfigs = [
                'Sony FX6 + G-Master 24-70mm + DJI Ronin RS3 Pro',
                'Sony A7S III + 85mm f/1.4 + Drone Inspire 3',
                'Profoto B10X Strobes + 50mm f/1.2 + Softboxes',
                'Dual Camera Setup + Wireless Mic Lavs + S-Log3'
            ];

            const scheduledList = list.slice(0, 6);
            scheduledList.forEach((item, idx) => {
                const card = document.createElement('div');
                card.className = 'schedule-card';
                const photog = photographers[idx % photographers.length];
                const gear = gearConfigs[idx % gearConfigs.length];

                card.innerHTML = `
                    <div>
                        <span class="schedule-date-badge"><i class="fa-regular fa-calendar-check"></i> ${escapeHtml(item.date || 'Upcoming')}</span>
                        <h4 class="schedule-title">${escapeHtml(item.name || 'Client Shoot')}</h4>
                        <div class="schedule-meta">
                            <span><i class="fa-solid fa-camera"></i> ${escapeHtml(item.shootType || 'Wedding Shoot')}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || 'Studio Set 1')}</span>
                            <span><i class="fa-solid fa-video"></i> ${gear}</span>
                        </div>
                    </div>
                    <div class="schedule-footer">
                        <span class="schedule-photographer"><i class="fa-solid fa-user-tie" style="color:var(--color-rose); margin-right:4px;"></i> ${photog}</span>
                        <a href="https://wa.me/91${String(item.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="action-btn-sm action-btn-whatsapp" title="Message Client">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Main Refresh Function
        let allBookings = getBookings();

        function refreshDashboardViews() {
            renderKPIs(allBookings);
            renderRecentTable(allBookings);
            applyFiltersAndRenderAll();
            renderSchedule(allBookings);
        }

        // Filtering Logic for All Bookings tab
        function applyFiltersAndRenderAll() {
            const query = (document.getElementById('bookingSearchInput')?.value || '').toLowerCase().trim();
            const catFilter = document.getElementById('filterCategory')?.value || 'ALL';
            const statusFilter = document.getElementById('filterStatus')?.value || 'ALL';

            const filtered = allBookings.filter(b => {
                const matchQuery = !query || 
                    (b.name && b.name.toLowerCase().includes(query)) ||
                    (b.phone && b.phone.includes(query)) ||
                    (b.location && b.location.toLowerCase().includes(query)) ||
                    (b.id && b.id.toLowerCase().includes(query));

                const matchCat = (catFilter === 'ALL') || (b.shootType === catFilter);
                const matchStatus = (statusFilter === 'ALL') || (b.status === statusFilter);

                return matchQuery && matchCat && matchStatus;
            });

            renderAllTable(filtered);
        }

        // Bind Search & Filters
        document.getElementById('bookingSearchInput')?.addEventListener('input', applyFiltersAndRenderAll);
        document.getElementById('filterCategory')?.addEventListener('change', applyFiltersAndRenderAll);
        document.getElementById('filterStatus')?.addEventListener('change', applyFiltersAndRenderAll);

        // Tab Switching Logic
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const pageHeaderTitle = document.getElementById('pageHeaderTitle');

        const tabTitles = {
            'tab-overview': 'Studio Operations Hub',
            'tab-bookings': 'All Inquiries & Shoots CRM',
            'tab-schedule': 'Production Calendar & Call Sheets',
            'tab-packages': 'Package Pricing & Service Tiers',
            'tab-crew': 'Gear & Creative Team Roster'
        };

        function switchTab(tabId) {
            tabButtons.forEach(btn => {
                if (btn.getAttribute('data-tab') === tabId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            tabPanes.forEach(pane => {
                if (pane.id === tabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            if (pageHeaderTitle && tabTitles[tabId]) {
                pageHeaderTitle.textContent = tabTitles[tabId];
            }
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });

        // "View All" button on overview jumps to all bookings tab
        document.getElementById('btnGoToAllBookings')?.addEventListener('click', () => {
            switchTab('tab-bookings');
        });

        // Delegate Status Cycling & Record Deletion
        document.addEventListener('click', (e) => {
            // Cycle status
            const cycleBtn = e.target.closest('.btn-cycle-status');
            if (cycleBtn) {
                const id = cycleBtn.getAttribute('data-id');
                const item = allBookings.find(b => b.id === id);
                if (item) {
                    const statuses = ['Pending', 'Confirmed', 'Completed', 'In Review'];
                    const currentIdx = statuses.indexOf(item.status);
                    item.status = statuses[(currentIdx + 1) % statuses.length];
                    saveBookings(allBookings);
                    refreshDashboardViews();
                }
                return;
            }

            // Delete Record
            const deleteBtn = e.target.closest('.action-btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete inquiry #${id}?`)) {
                    allBookings = allBookings.filter(b => b.id !== id);
                    saveBookings(allBookings);
                    refreshDashboardViews();
                }
                return;
            }
        });

        // Add New Booking Modal Handling
        const newBookingModal = document.getElementById('newBookingModal');
        const btnOpenModal = document.getElementById('btnOpenNewBookingModal');
        const btnCloseModal = document.getElementById('btnCloseNewBookingModal');
        const btnCancelModal = document.getElementById('btnCancelBookingModal');
        const newBookingForm = document.getElementById('newBookingForm');

        function openModal() {
            if (newBookingModal) newBookingModal.classList.add('open');
            const dateInput = document.getElementById('mShootDate');
            if (dateInput && !dateInput.value) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }

        function closeModal() {
            if (newBookingModal) newBookingModal.classList.remove('open');
            if (newBookingForm) newBookingForm.reset();
        }

        if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
        if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

        window.addEventListener('click', (e) => {
            if (e.target === newBookingModal) closeModal();
        });

        // Form Submit -> Save new booking
        if (newBookingForm) {
            newBookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newRecord = {
                    id: 'AK-' + Math.floor(1000 + Math.random() * 9000),
                    name: document.getElementById('mClientName')?.value.trim() || 'New Client',
                    phone: document.getElementById('mClientPhone')?.value.trim() || '',
                    shootType: document.getElementById('mShootType')?.value || 'Wedding Photography',
                    date: document.getElementById('mShootDate')?.value || '',
                    location: document.getElementById('mLocation')?.value.trim() || 'Aakar Studio',
                    amount: document.getElementById('mBudget')?.value.trim() || '₹85,000',
                    status: 'Confirmed',
                    createdAt: new Date().toISOString()
                };

                allBookings.unshift(newRecord);
                saveBookings(allBookings);
                refreshDashboardViews();
                closeModal();
            });
        }

        // WhatsApp Direct Broadcaster from Overview card
        document.getElementById('btnSendDirectWa')?.addEventListener('click', () => {
            const phoneInput = document.getElementById('waDirectPhone');
            const phone = (phoneInput?.value || '').replace(/[^0-9]/g, '');
            if (!phone || phone.length < 10) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }
            const defaultMsg = encodeURIComponent("Hello! Greetings from Aakar Films & Cinematography. We received your photoshoot inquiry and would love to share our portfolio and packages.");
            window.open(`https://wa.me/91${phone}?text=${defaultMsg}`, '_blank');
        });

        // Export Bookings to CSV Spreadsheet
        document.getElementById('btnExportCsv')?.addEventListener('click', () => {
            if (!allBookings || allBookings.length === 0) {
                alert('No bookings available to export.');
                return;
            }

            let csvContent = 'Booking ID,Client Name,Phone,Shoot Category,Shoot Date,Location,Est Amount,Status\n';
            allBookings.forEach(b => {
                const row = [
                    `"${b.id || ''}"`,
                    `"${(b.name || '').replace(/"/g, '""')}"`,
                    `"${b.phone || ''}"`,
                    `"${b.shootType || ''}"`,
                    `"${b.date || ''}"`,
                    `"${(b.location || '').replace(/"/g, '""')}"`,
                    `"${b.amount || ''}"`,
                    `"${b.status || ''}"`
                ];
                csvContent += row.join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Aakar_Films_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // Initial Render
        refreshDashboardViews();

        return; // Completed dashboard initialization
    }

    /* ==========================================================================
       2. LOGIN PAGE CONTROLLER (For login.html)
       ========================================================================== */
    const loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    const loginAlert = document.getElementById('loginAlert');
    const loginAlertText = document.getElementById('loginAlertText');
    const btnDemoFill = document.getElementById('btnDemoFill');

    // Requirement checklist elements
    const reqCapital = document.getElementById('reqCapital');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');
    const reqLength = document.getElementById('reqLength');

    // Validation patterns
    const hasCapitalRegex = /[A-Z]/;
    const hasNumberRegex = /[0-9]/;
    const hasSpecialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

    // Helper: update item status
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

    // Real-time password validator
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
        }, 500);
    });

});
