/**
 * AAKAR FILMS — ADMIN PORTAL CONTROLLER (admin.js)
 * Features:
 * - Real-time password validation (Capital letter [A-Z], Number [0-9], Special character [!@#$%...], Min 8 chars)
 * - Password visibility toggle (Eye icon)
 * - 1-Click Demo autofill (Aakar@2026!)
 * - Resilient session/auth management across file:// and http://
 * - Protected route guard for dashboard.html
 * - Logout functionality
 * - Customer Dashboard navigation
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
        if (navCustomerLink) {
            navCustomerLink.href = customerUrl;
        }

        const topbarCustomerLink = document.getElementById('topbarCustomerLink');
        if (topbarCustomerLink) {
            topbarCustomerLink.href = customerUrl;
        }

        return; // Dashboard logic complete
    }


    /* ==========================================================================
       2. ADMIN LOGIN CONTROLLER (For login.html)
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
