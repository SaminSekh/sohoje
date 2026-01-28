// Utility Functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.add('active');
        } else {
            loading.classList.remove('active');
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        // Create notification element if it doesn't exist
        const notificationEl = document.createElement('div');
        notificationEl.id = 'notification';
        notificationEl.className = `notification ${type}`;
        notificationEl.textContent = message;
        document.body.appendChild(notificationEl);

        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
        return;
    }

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function formatCurrency(amount, currencyCode = null) {
    const code = currencyCode || window.shopCurrency || 'INR';
    const locale = getLocaleForCurrency(code);

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code,
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2
        }).format(amount || 0);
    } catch (e) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }
}

function getCurrencySymbol(currencyCode = null) {
    const code = currencyCode || window.shopCurrency || 'INR';
    const locale = getLocaleForCurrency(code);
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code
        }).formatToParts(0).find(part => part.type === 'currency').value;
    } catch (e) {
        return '₹'; // Default fallback
    }
}

function getLocaleForCurrency(currencyCode) {
    const localeMap = {
        'INR': 'en-IN',
        'USD': 'en-US',
        'GBP': 'en-GB',
        'EUR': 'en-DE',
        'JPY': 'ja-JP',
        'BDT': 'en-BD',
        'PKR': 'en-PK',
        'AED': 'ar-AE',
        'SAR': 'ar-SA',
        'RUB': 'ru-RU',
        'CAD': 'en-CA',
        'AUD': 'en-AU',
        'CNY': 'zh-CN',
        'KWD': 'ar-KW',
        'OMR': 'ar-OM',
        'QAR': 'ar-QA',
        'BHD': 'ar-BH'
    };
    return localeMap[currencyCode] || 'en-US';
}

// Initialize Shop Configuration (Currency, etc.)
async function initializeShopConfig(shopId) {
    if (!shopId) return;
    try {
        const { data: settings, error } = await supabaseClient
            .from('shop_settings')
            .select('currency')
            .eq('shop_id', shopId)
            .maybeSingle();

        if (!error && settings) {
            window.shopCurrency = settings.currency || 'INR';
        } else {
            window.shopCurrency = 'INR';
        }
    } catch (e) {
        console.warn('Failed to initialize shop config:', e);
        window.shopCurrency = 'INR';
    }
}

// Format date
function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== PERMISSION MANAGEMENT ====================

// Global Permission Manager
class PermissionManager {
    constructor() {
        this.pagePermissionMap = {
            'dashboard.html': 'dashboard',
            'pos.html': 'pos',
            'inventory.html': 'inventory',
            'sales.html': 'sales',
            'credit.html': 'credit',
            'expenses.html': 'expenses',
            'users.html': 'users',
            'settings.html': 'settings',
            'super-admin.html': '*'
        };
    }

    init() {

        // Wait for auth manager to be ready
        if (!window.authManager) {
            setTimeout(() => this.init(), 500);
            return;
        }

        this.checkCurrentPageAccess();
        this.updateSidebar();
        this.hideRestrictedElements();
    }

    checkCurrentPageAccess() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        const currentPage = this.getCurrentPageName();

        // Skip check for login page
        if (currentPage === 'index.html' || currentPage === '') return;

        // Check if user has access to current page
        if (!this.hasAccessToPage(currentPage)) {
            showNotification('Access Denied! You do not have permission to view this page.', 'error');

            // Redirect to first accessible page
            setTimeout(() => {
                this.redirectToFirstAccessiblePage();
            }, 2000);

            return false;
        }

        return true;
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop();
        return pageName || '';
    }

    hasAccessToPage(pageName) {
        const requiredPermission = this.pagePermissionMap[pageName];

        if (!requiredPermission) {
            return true; // If page not in map, allow access
        }

        return authManager.hasPermission(requiredPermission);
    }

    updateSidebar() {
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && !href.includes('logout')) {
                const pageName = href.split('/').pop();

                if (!this.hasAccessToPage(pageName)) {
                    link.parentElement.style.display = 'none';
                } else {
                    link.parentElement.style.display = 'block';
                }
            }
        });
    }

    hideRestrictedElements() {
        // Hide restricted buttons based on permissions
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Example: Hide Add User button if user doesn't have users permission
        if (!authManager.hasPermission('users')) {
            const addUserBtn = document.getElementById('addUserBtn');
            if (addUserBtn) {
                addUserBtn.style.display = 'none';
            }
        }

        // Example: Hide Export button if user doesn't have export permission
        if (!authManager.hasPermission('export')) {
            const exportBtn = document.getElementById('exportUsersBtn');
            if (exportBtn) {
                exportBtn.style.display = 'none';
            }
        }

        // Add more element hiding logic as needed
    }

    redirectToFirstAccessiblePage() {
        const accessiblePages = [
            { page: 'dashboard.html', perm: 'dashboard' },
            { page: 'pos.html', perm: 'pos' },
            { page: 'inventory.html', perm: 'inventory' },
            { page: 'credit.html', perm: 'credit' },
            { page: 'sales.html', perm: 'sales' },
            { page: 'expenses.html', perm: 'expenses' },
            { page: 'users.html', perm: 'users' },
            { page: 'settings.html', perm: 'settings' }
        ];

        // Check current user's role and permissions
        const user = authManager.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // For shop_staff, check specific permissions
        if (user.role === 'shop_staff') {
            // Check if user has any custom permissions
            if (user.permissions) {
                for (const page of accessiblePages) {
                    if (user.permissions[page.perm] === true) {
                        window.location.href = page.page;
                        return;
                    }
                }
            }

            // Default fallback for shop_staff without permissions
            if (authManager.hasPermission('pos')) {
                window.location.href = 'pos.html';
            } else if (authManager.hasPermission('inventory')) {
                window.location.href = 'inventory.html';
            } else if (authManager.hasPermission('credit')) {
                window.location.href = 'credit.html';
            } else {
                // No permissions, logout
                authManager.logout();
            }
            return;
        }

        // For shop_admin and super_admin
        for (const page of accessiblePages) {
            if (authManager.hasPermission(page.perm)) {
                window.location.href = page.page;
                return;
            }
        }

        // If no page is accessible, logout
        authManager.logout();
    }

    // Update user permissions in session
    updateUserPermissions(permissions) {
        const user = authManager.getCurrentUser();
        if (!user) return;

        // Update user object with new permissions
        user.permissions = permissions;

        // Update session storage
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        // Update auth manager
        authManager.currentUser = user;

        // Refresh UI
        this.updateSidebar();
        this.hideRestrictedElements();
    }
}

// Initialize Permission Manager
const permissionManager = new PermissionManager();

// ==================== FORM HANDLERS ====================

// Form Submission Handlers
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Permission Manager (with delay to ensure auth is ready)
    // DISABLED: Using MenuManager and AuthManager granular permissions instead
    /*
    setTimeout(() => {
        permissionManager.init();
    }, 1000);
    */

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent form submission and page refresh
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showNotification('Please enter username and password', 'error');
                return;
            }

            await authManager.login(username, password);
        });

        // Add Enter key support
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    // ==================== MOBILE SIDEBAR TOGGLE ====================
    // Initialize mobile menu
    initMobileMenu();

    // Global click handler for closing sidebar on outside click
    document.addEventListener('click', function (e) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (window.innerWidth <= 768 &&
            sidebar &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !e.target.closest('.menu-toggle')) {

            sidebar.classList.remove('active');
            removeOverlay();
        }
    });

    // Global escape key handler
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                removeOverlay();
            }
        }
    });

    // Overlay functions
    function addOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
            cursor: pointer;
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
            document.body.appendChild(overlay);

            // Add fade in effect
            setTimeout(() => {
                overlay.style.display = 'block';
                setTimeout(() => {
                    overlay.style.opacity = '1';
                }, 10);
            }, 10);
        } else {
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }

        // Click on overlay to close sidebar
        overlay.addEventListener('click', function () {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
                removeOverlay();
            }
        });
    }

    function removeOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    // ==================== MOBILE SIDEBAR TOGGLE ====================
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!menuToggle || !sidebar) {
            return;
        }

        // Mobile menu toggle
        menuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            sidebar.classList.toggle('active');

            // Add overlay when sidebar is open
            if (sidebar.classList.contains('active')) {
                addOverlay();
            } else {
                removeOverlay();
            }
        });

        // Use delegation for sidebar navigation links (mobile)
        const navLinksContainer = document.querySelector('.nav-links');
        if (navLinksContainer) {
            navLinksContainer.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && window.innerWidth <= 768) {
                    // Don't close for logout link immediately
                    if (link.id !== 'logoutBtn' && !link.href.includes('logout')) {
                        setTimeout(() => {
                            sidebar.classList.remove('active');
                            removeOverlay();
                        }, 100);
                    }
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                removeOverlay();
            }
        });

        // Use delegation for buttons inside sidebar
        sidebar.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn, [role="button"]');
            if (button && !button.classList.contains('menu-toggle') && window.innerWidth <= 768) {
                setTimeout(() => {
                    sidebar.classList.remove('active');
                    removeOverlay();
                }, 100);
            }
        });
    }

    // Initialize Profile Password Change
    initProfilePasswordChange();
});

function initProfilePasswordChange() {
    // Inject Change Password Modal if it doesn't exist
    if (!document.getElementById('changePasswordModal')) {
        const modalHtml = `
            <div class="modal" id="changePasswordModal">
                <div class="modal-content" style="max-width: 400px; border-radius: 15px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="background: #2563eb; color: white; padding: 20px;">
                        <h3 style="margin: 0;"><i class="fas fa-key"></i> Change Password</h3>
                        <button class="close-modal" style="color: white; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 25px;">
                        <form id="changePasswordForm">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-lock"></i> Current Password</label>
                                <input type="password" id="currPwd" required placeholder="Verify current password" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-key"></i> New Password</label>
                                <input type="password" id="newPwd" required minlength="6" placeholder="At least 6 characters" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-check-double"></i> Confirm New Password</label>
                                <input type="password" id="confPwd" required placeholder="Confirm new password" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" style="padding: 20px; background: #f9f9f9; display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn btn-secondary btn-action close-modal" style="padding: 10px 20px; border-radius: 8px;">Cancel</button>
                        <button class="btn btn-primary btn-action" id="confirmChangePwdBtn" style="padding: 10px 20px; border-radius: 8px; background: #2563eb; color: white; border: none; cursor: pointer;">Update Password</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('changePasswordModal');

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.classList.remove('active'));
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        document.getElementById('confirmChangePwdBtn').addEventListener('click', async () => {
            const curr = document.getElementById('currPwd').value;
            const next = document.getElementById('newPwd').value;
            const conf = document.getElementById('confPwd').value;
            const user = window.authManager.getCurrentUser();

            if (!curr || !next || !conf) {
                showNotification('All fields are required', 'error');
                return;
            }

            if (curr !== user.password) {
                showNotification('Current password is incorrect', 'error');
                return;
            }

            if (next !== conf) {
                showNotification('New passwords do not match', 'error');
                return;
            }

            if (next.length < 6) {
                showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            try {
                await window.authManager.changePassword(next);
                showNotification('Password updated successfully!', 'success');
                modal.classList.remove('active');
                document.getElementById('changePasswordForm').reset();
            } catch (err) {
                showNotification('Failed to update password', 'error');
            }
        });
    }

    // Add click listeners to profile sections
    document.addEventListener('click', (e) => {
        const profileEl = e.target.closest('.user-menu') ||
            e.target.closest('.user-info') ||
            e.target.closest('.sidebar-header') ||
            e.target.closest('.user-details');

        if (profileEl) {
            // Don't open if clicking logout/menu-toggle
            if (e.target.closest('#logoutBtn') || e.target.closest('.menu-toggle')) return;

            const modal = document.getElementById('changePasswordModal');
            if (modal) {
                document.getElementById('changePasswordForm').reset();
                modal.classList.add('active');
            }
        }
    });

    // Add CSS for pointer cursor
    if (!document.getElementById('profileStyle')) {
        const style = document.createElement('style');
        style.id = 'profileStyle';
        style.textContent = `
            .user-menu, .user-info, .sidebar-header, .user-details { cursor: pointer !important; }
            .user-menu:hover, .user-info:hover, .sidebar-header:hover { opacity: 0.8 !important; }
        `;
        document.head.appendChild(style);
    }
}

// Export functions for use in other files
window.utils = {
    showLoading,
    showNotification,
    formatCurrency,
    formatDate,
    debounce
};

// Export permission manager
window.permissionManager = permissionManager;
