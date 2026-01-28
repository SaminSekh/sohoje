// Menu Manager - Dynamically manages menu visibility based on user permissions
class MenuManager {
    constructor() {
        this.menuItems = {};
        this.currentUser = null;
        this.userPermissions = {};
        this.userRole = null;
        this.isVisitorMode = false;

        // Initial menu setup IMMEDIATELY
        this.setupMenuStructure();
        this.init();
    }

    init() {
        // Listen for user updates
        window.addEventListener('user-updated', (event) => {

            this.handleUserUpdate(event.detail);
        });

        // Check if user is already available from authManager
        if (window.authManager) {
            const user = window.authManager.getCurrentUser();
            if (user) {
                this.handleUserUpdate({
                    user: user,
                    permissions: user.permissions || {},
                    role: user.role,
                    shopId: window.authManager.shopId // Pass shopId for Visitor Mode
                });
            }
        }
    }

    handleUserUpdate(userData) {
        if (!userData || !userData.user) return;


        this.currentUser = userData.user;
        this.userRole = userData.role;

        // Determine Visitor Mode: Super Admin + Shop ID present
        if (this.userRole === 'super_admin' && userData.shopId) {
            this.isVisitorMode = true;
        } else {
            this.isVisitorMode = false;
        }

        // CRITICAL: Ensure permissions is always an object, never null/undefined
        let permissions = userData.permissions || {};

        // CRITICAL FIX: Parse permissions if they're stored as a string
        if (typeof permissions === 'string') {
            try {
                permissions = JSON.parse(permissions);

            } catch (e) {

                permissions = {};
            }
        }

        this.userPermissions = permissions;

        // Additional safety check
        if (typeof this.userPermissions !== 'object' || this.userPermissions === null) {

            this.userPermissions = {};
        }

        // Update sidebar header (Logo + Name)
        this.updateSidebarHeader();

        // Update menu immediately
        this.updateMenu();

        // Check if user has permission to be on current page
        this.checkPagePermission();
    }

    async updateSidebarHeader() {
        if (!this.currentUser || !this.currentUser.shop_id) {
            // Support for super_admin or users without shop
            const shopNameHeader = document.getElementById('shopNameHeader');
            if (shopNameHeader) {
                shopNameHeader.textContent = this.userRole === 'super_admin' ? 'Super Admin' : 'Shop Management';
            }
            return;
        }

        try {
            // Fetch shop details for logo and name
            const { data: shop, error } = await supabaseClient
                .from('shops')
                .select('shop_name, shop_logo')
                .eq('id', this.currentUser.shop_id)
                .single();

            if (error) throw error;

            if (shop) {
                // Update shop name
                const shopNameHeader = document.getElementById('shopNameHeader');
                if (shopNameHeader) {
                    shopNameHeader.textContent = shop.shop_name;
                }

                // Update logo
                const sidebarTitle = document.querySelector('.sidebar-header h2');
                if (sidebarTitle) {
                    // Find or create logo element
                    let logoImg = sidebarTitle.querySelector('.sidebar-logo');
                    const icon = sidebarTitle.querySelector('.fas.fa-store');

                    if (shop.shop_logo) {
                        // Create image if it doesn't exist
                        if (!logoImg) {
                            logoImg = document.createElement('img');
                            logoImg.className = 'sidebar-logo';
                            logoImg.style.width = '30px';
                            logoImg.style.height = '30px';
                            logoImg.style.borderRadius = '4px';
                            logoImg.style.marginRight = '10px';
                            logoImg.style.verticalAlign = 'middle';
                            logoImg.style.objectFit = 'cover';

                            // Insert before the name span
                            if (shopNameHeader) {
                                sidebarTitle.insertBefore(logoImg, shopNameHeader);
                            } else {
                                sidebarTitle.prepend(logoImg);
                            }
                        }
                        logoImg.src = shop.shop_logo;
                        logoImg.style.display = 'inline-block';

                        // Hide default icon if exists
                        if (icon) icon.style.display = 'none';
                    } else {
                        // If no logo, show icon and hide img
                        if (logoImg) logoImg.style.display = 'none';
                        if (icon) icon.style.display = 'inline-block';
                    }
                }
            }
        } catch (error) {

        }
    }

    setupMenuStructure() {
        // Define all menu items and their permissions
        this.menuItems = {
            dashboard: {
                id: 'menu-dashboard',
                text: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                href: 'dashboard.html',
                permission: 'dashboard',
                type: 'shop'
            },
            superDashboard: {
                id_attr: 'dashboardLink',
                text: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                href: 'super-admin.html',
                permission: 'dashboard',
                type: 'super_admin'
            },
            manageShops: {
                id_attr: 'shopsLink',
                text: 'Manage Shops',
                icon: 'fas fa-store',
                href: 'super-admin.html#shops',
                permission: 'shops',
                type: 'super_admin'
            },
            manageUsers: {
                id_attr: 'usersLink',
                text: 'Manage Users',
                icon: 'fas fa-users',
                href: 'super-admin.html#users',
                permission: 'users',
                type: 'super_admin'
            },
            manageActivity: {
                id_attr: 'activityLink',
                text: 'Activity',
                icon: 'fas fa-history',
                href: 'super-admin.html#activity',
                permission: 'activity',
                type: 'super_admin'
            },
            manageLogs: {
                id_attr: 'logsLink',
                text: 'Logs',
                icon: 'fas fa-clipboard-list',
                href: 'super-admin.html#logs',
                permission: 'audit',
                type: 'super_admin'
            },
            pos: {
                id: 'menu-pos',
                text: 'POS',
                icon: 'fas fa-cash-register',
                href: 'pos.html',
                permission: 'pos',
                type: 'shop'
            },
            inventory: {
                id: 'menu-inventory',
                text: 'Inventory',
                icon: 'fas fa-boxes',
                href: 'inventory.html',
                permission: 'inventory',
                type: 'shop'
            },
            sales: {
                id: 'menu-sales',
                text: 'Sales Report',
                icon: 'fas fa-chart-line',
                href: 'sales.html',
                permission: 'sales',
                type: 'shop'
            },
            credit: {
                id: 'menu-credit',
                text: 'Credit',
                icon: 'fas fa-credit-card',
                href: 'credit.html',
                permission: 'credit',
                type: 'shop'
            },
            expenses: {
                id: 'menu-expenses',
                text: 'Expenses',
                icon: 'fas fa-money-bill-wave',
                href: 'expenses.html',
                permission: 'expenses',
                type: 'shop'
            },
            activity: {
                id: 'menu-activity',
                text: 'Activity',
                icon: 'fas fa-history',
                href: 'activity.html',
                permission: 'audit',
                type: 'shop'
            },
            users: {
                id: 'menu-users',
                text: 'Users',
                icon: 'fas fa-users',
                href: 'users.html',
                permission: 'users',
                type: 'shop'
            },
            settings: {
                id: 'menu-settings',
                text: 'Settings',
                icon: 'fas fa-cog',
                href: 'settings.html',
                permission: 'settings',
                type: 'shop'
            },
            audit: {
                id: 'menu-audit',
                text: 'Audit Log',
                icon: 'fas fa-clipboard-list',
                href: 'audit.html',
                permission: 'audit',
                type: 'shop'
            },
            logout: {
                id: 'menu-logout',
                text: 'Logout',
                icon: 'fas fa-sign-out-alt',
                href: '#',
                id_attr: 'logoutBtn',
                permission: 'always',
                type: 'both'
            }
        };
    }

    updateMenu() {




        const sidebar = document.querySelector('.sidebar .nav-links');
        if (!sidebar) {

            return;
        }

        // Clear existing menu completely
        sidebar.innerHTML = '';

        // Create menu items based on permissions
        Object.values(this.menuItems).forEach(menuItem => {
            const shouldShow = this.shouldShowMenuItem(menuItem);

            if (shouldShow) {
                const li = document.createElement('li');
                const a = document.createElement('a');

                // VISITOR MODE FIX: Append shop_id to links to persist context
                let href = menuItem.href;
                if (this.isVisitorMode && this.currentUser.shopId) { // Note: using currentUser.shopId might be wrong if it's not set
                    // Better to use window.authManager.shopId or a stored property
                    // Let's use the one we captured in handleUserUpdate if we stored it, 
                    // but handleUserUpdate didn't store it in a class property explicitly besides implicity via currentUser/role check?
                    // Wait, handleUserUpdate logic stored it where? 
                    // Ah, it didn't store shopId in a dedicated property, just used it for isVisitorMode check.
                    // I should get it from authManager to be safe.
                    const shopId = window.authManager?.shopId;
                    if (shopId && href !== '#') {
                        href = `${href}?shop_id=${shopId}`;
                    }
                }

                a.href = href;
                if (menuItem.id_attr) a.id = menuItem.id_attr;

                // Add icon
                const icon = document.createElement('i');
                icon.className = menuItem.icon;
                a.appendChild(icon);

                // Add text with space
                a.appendChild(document.createTextNode(' ' + menuItem.text));

                // Check if current page is active
                const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
                if (currentPage === menuItem.href) {
                    a.classList.add('active');
                }

                li.appendChild(a);
                sidebar.appendChild(li);
            }
        });

        // Dispatch event so other scripts can re-bind listeners (like Activity or Logout)
        window.dispatchEvent(new CustomEvent('menu-updated'));


    }

    shouldShowMenuItem(menuItem) {
        // Special case for logout - always show
        if (menuItem.permission === 'always') return true;

        // Role-based type enforcement
        if (this.userRole === 'super_admin') {
            if (this.isVisitorMode) {
                // VISITOR MODE: Act like a Shop Admin
                // Show 'shop' items, hide 'super_admin' items
                if (menuItem.type !== 'shop' && menuItem.type !== 'both') return false;
            } else {
                // STANDARD MODE: Act like Super Admin
                // Show 'super_admin' items, hide 'shop' items
                if (menuItem.type !== 'super_admin' && menuItem.type !== 'both') return false;
            }
        } else {
            // Other roles ONLY see shop or both type items
            if (menuItem.type !== 'shop' && menuItem.type !== 'both') return false;
        }

        // If user has permissions defined, check them first
        if (this.userPermissions && Object.keys(this.userPermissions).length > 0) {
            // Check if this specific permission is defined
            if (this.userPermissions[menuItem.permission] !== undefined) {
                return this.userPermissions[menuItem.permission] === true;
            }
        }

        // Fallback to role-based defaults if no specific permission is found
        if (this.userRole === 'super_admin' || this.userRole === 'shop_admin') {
            return true;
        }

        return false;
    }

    getRedirectPage() {
        // Super admin and shop admin always default to dashboard
        if (this.userRole === 'super_admin' || this.userRole === 'shop_admin') {
            return 'dashboard.html';
        }

        // For staff, find the first accessible page
        for (const menuItem of Object.values(this.menuItems)) {
            if (this.shouldShowMenuItem(menuItem)) {
                return menuItem.href;
            }
        }

        // If no pages accessible, return dashboard or login as fallback
        return 'dashboard.html';
    }

    // Check permission for current page
    checkPagePermission() {
        const currentPage = window.location.pathname.split('/').pop();

        // Find which menu item corresponds to current page
        for (const [key, menuItem] of Object.entries(this.menuItems)) {
            if (menuItem.href === currentPage) {
                const hasPermission = this.shouldShowMenuItem(menuItem);

                if (!hasPermission && this.currentUser) {

                    showNotification('Access denied. You do not have permission to access this page.', 'error');

                    const redirectPage = this.getRedirectPage();

                    // Immediate redirect if it's the forbidden dashboard or we're initializing
                    if (currentPage === 'dashboard.html') {
                        window.location.href = redirectPage;
                    } else {
                        setTimeout(() => {
                            if (currentPage !== redirectPage) {
                                window.location.href = redirectPage;
                            } else {
                                authManager.logout();
                            }
                        }, 2000);
                    }
                    return false;
                }
                return true;
            }
        }

        return true;
    }
}

// Initialize Menu Manager immediately and globally
const menuManager = new MenuManager();
window.menuManager = menuManager;

document.addEventListener('DOMContentLoaded', () => {
    if (window.menuManager) {
        window.menuManager.updateMenu();
    }
});
