class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.shopId = null;

        // Load session immediately and synchronously
        this.restoreFromSessionSync();
    }

    restoreFromSessionSync() {
        try {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                this.currentUser = user;
                this.userRole = user.role;
                this.shopId = user.shop_id;

                // VISITOR MODE: If Super Admin, allow shop_id override from URL or Session
                if (this.userRole === 'super_admin') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const urlShopId = urlParams.get('shop_id');
                    const sessionShopId = sessionStorage.getItem('visitorShopId');

                    // Prefer URL param, then session storage
                    const targetShopId = urlShopId || sessionShopId;

                    if (targetShopId) {
                        this.shopId = targetShopId;
                        // Persist to session storage so it survives navigation without query param
                        sessionStorage.setItem('visitorShopId', targetShopId);

                        // Critical: Patch currentUser so all other scripts work automatically
                        this.currentUser.shop_id = targetShopId;

                        console.log('Visitor Mode: Active for Shop', this.shopId);
                    }
                } else {
                    // Safety: Clear visitor shop id if not super admin
                    sessionStorage.removeItem('visitorShopId');
                }

                let permissions = user.permissions || {};
                if (typeof permissions === 'string') {
                    try {
                        permissions = JSON.parse(permissions);
                    } catch (e) {
                        permissions = {};
                    }
                }

                // Dispatch event immediately so other scripts (like MenuManager) can see it
                window.dispatchEvent(new CustomEvent('user-updated', {
                    detail: {
                        user: this.currentUser,
                        role: this.userRole,
                        permissions: permissions,
                        shopId: this.shopId
                    }
                }));
            }
        } catch (e) {
            // Silently fail session restoration
        }
    }

    async init() {
        // If still no user, try restoring again (async) just in case
        if (!this.currentUser) {
            await this.restoreFromSession();
        }
        // If we have a user, check their access to the current page
        if (this.currentUser) {
            this.checkPageAccess();
            this.startHeartbeat();
        }
    }

    async restoreFromSession() {
        try {
            const storedUser = sessionStorage.getItem('currentUser');

            if (storedUser) {
                const user = JSON.parse(storedUser);
                this.currentUser = user;
                this.userRole = user.role;
                this.shopId = user.shop_id;

                // VISITOR MODE: Same logic as Sync
                if (this.userRole === 'super_admin') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const urlShopId = urlParams.get('shop_id');
                    const sessionShopId = sessionStorage.getItem('visitorShopId');

                    const targetShopId = urlShopId || sessionShopId;

                    if (targetShopId) {
                        this.shopId = targetShopId;
                        sessionStorage.setItem('visitorShopId', targetShopId);
                        this.currentUser.shop_id = targetShopId;
                    }
                }

                // Dispatch event so other managers can update
                window.dispatchEvent(new CustomEvent('user-updated', {
                    detail: {
                        user: this.currentUser,
                        role: this.userRole,
                        permissions: this.currentUser.permissions || {},
                        shopId: this.shopId
                    }
                }));

                this.startHeartbeat();
                return true;
            }
        } catch (error) {
            this.clearSession();
        }

        return false;
    }

    startHeartbeat() {
        if (this.heartbeatInterval) return;

        // Update immediately
        this.updateLastSeen();

        // Then every 60 seconds
        this.heartbeatInterval = setInterval(() => {
            this.updateLastSeen();
        }, 60000);
    }

    async updateLastSeen() {
        if (!this.currentUser) return;

        try {
            await supabaseClient
                .from('profiles')
                .update({ last_seen: new Date().toISOString() })
                .eq('id', this.currentUser.id);
        } catch (e) {
            // Silently fail to avoid disrupting user
        }
    }

    checkPageAccess() {
        const currentPage = window.location.pathname;
        const pageName = currentPage.split('/').pop() || '';

        // If on login page and already logged in, redirect to appropriate page
        if ((pageName === 'index.html' || pageName === '') && this.currentUser) {
            this.redirectToDashboard();
            return;
        }

        // If not on login page and no user, redirect to login
        if (pageName !== 'index.html' && pageName !== '' && !this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Special check for super-admin page
        if (pageName === 'super-admin.html') {
            if (!this.currentUser) {
                window.location.href = 'index.html';
                return;
            }

            if (this.userRole !== 'super_admin') {
                showNotification('Access denied. Super admin access required.', 'error');
                setTimeout(() => {
                    if (this.userRole === 'shop_admin' || this.userRole === 'shop_staff') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 2000);
                return;
            }
        }

        // Visitor Mode Check: Allow Super Admin to visit dashboard if shop_id is present
        if (pageName === 'dashboard.html' && this.userRole === 'super_admin') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('shop_id')) {
                return; // Allow access
            }
        }
    }

    async login(username, password) {
        showLoading(true);

        try {
            // Get user from database
            const { data: user, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Invalid username or password');
                }
                throw error;
            }

            // Check password
            if (user.password !== password) {
                throw new Error('Invalid username or password');
            }

            this.currentUser = user;
            this.userRole = user.role;
            this.shopId = user.shop_id;

            // Store in session storage
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            // Parse permissions if stored as string
            let permissions = this.currentUser.permissions || {};
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    permissions = {};
                }
            }

            // Dispatch event so other managers can update
            window.dispatchEvent(new CustomEvent('user-updated', {
                detail: {
                    user: this.currentUser,
                    role: this.userRole,
                    permissions: permissions
                }
            }));

            // Update last_login
            await supabaseClient
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);

            // Create audit log
            await this.createAuditLog('login', 'auth', user.id, null, {
                action: 'user_login',
                username: username
            });

            showNotification('Login successful! Redirecting...', 'success');

            // Redirect to appropriate dashboard
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);

        } catch (error) {
            showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            showLoading(false);
        }
    }

    async logout() {
        showLoading(true);

        try {
            // Create audit log (try-catch internally so it doesn't block logout)
            if (this.currentUser) {
                await this.createAuditLog('logout', 'auth', this.currentUser.id, null, {
                    action: 'user_logout',
                    username: this.currentUser.username
                });
            }
        } catch (error) {
            // Silently fail audit log during logout
        }

        // Always clear session and redirect regardless of audit log success
        this.clearSession();
        showLoading(false);
        window.location.href = 'index.html';
    }

    clearSession() {
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        this.userRole = null;
        this.shopId = null;
    }

    redirectToDashboard() {
        if (!this.userRole) {
            return;
        }

        let targetPage = 'index.html';

        switch (this.userRole) {
            case 'super_admin':
                targetPage = 'super-admin.html';
                break;
            case 'shop_admin':
                targetPage = 'dashboard.html';
                break;
            case 'shop_staff':
                if (window.menuManager && typeof window.menuManager.getRedirectPage === 'function') {
                    targetPage = window.menuManager.getRedirectPage();
                } else {
                    let staffPermissions = this.currentUser.permissions || {};
                    if (typeof staffPermissions === 'string') {
                        try {
                            staffPermissions = JSON.parse(staffPermissions);
                        } catch (e) {
                            staffPermissions = {};
                        }
                    }

                    if (staffPermissions.pos) {
                        targetPage = 'pos.html';
                    } else if (staffPermissions.inventory) {
                        targetPage = 'inventory.html';
                    } else if (staffPermissions.credit) {
                        targetPage = 'credit.html';
                    } else if (staffPermissions.settings) {
                        targetPage = 'settings.html';
                    } else if (staffPermissions.dashboard) {
                        targetPage = 'dashboard.html';
                    } else {
                        showNotification('Your account has no permissions. Please contact administrator.', 'error');
                        this.logout();
                        return;
                    }
                }
                break;
            default:
                targetPage = 'dashboard.html';
        }

        const currentPage = window.location.pathname;
        if (!currentPage.includes(targetPage)) {
            window.location.href = targetPage;
        }
    }

    hasPermission(requiredPermission) {
        if (!this.currentUser) return false;

        // Super admin has access to everything
        if (this.userRole === 'super_admin') return true;

        // Parse permissions if they're still a string
        let userPerms = this.currentUser.permissions || {};
        if (typeof userPerms === 'string') {
            try {
                userPerms = JSON.parse(userPerms);
            } catch (e) {
                userPerms = {};
            }
        }

        // Check if user has explicit permission or '*' (all)
        if (userPerms[requiredPermission] === true || userPerms['*'] === true) {
            return true;
        }

        // Fallback to role-based legacy permissions for legacy users
        const legacyPermissions = {
            shop_admin: ['dashboard', 'pos', 'inventory', 'sales', 'credit', 'expenses', 'users', 'settings', 'activity', 'audit'],
            shop_staff: ['pos', 'inventory', 'credit']
        };

        return legacyPermissions[this.userRole]?.includes(requiredPermission) || false;
    }

    async createAuditLog(action, tableName, recordId, oldData = null, newData = null) {
        try {
            if (!this.currentUser) return;

            const { error } = await supabaseClient
                .from('audit_logs')
                .insert([{
                    user_id: this.currentUser.id,
                    username: this.currentUser.username,
                    shop_id: this.shopId,
                    action: action,
                    table_name: tableName,
                    record_id: recordId,
                    old_data: oldData,
                    new_data: newData,
                    timestamp: new Date().toISOString()
                }]);

            if (error) throw error;
        } catch (error) {
            // Silently fail audit logs to not block main operations
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isSuperAdmin() {
        return this.userRole === 'super_admin';
    }

    async changePassword(newPassword) {
        if (!this.currentUser) throw new Error('Not authenticated');

        showLoading(true);
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    password: newPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Update local user data
            this.currentUser.password = newPassword;
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Audit log
            await this.createAuditLog('change_password', 'profiles', this.currentUser.id, null, {
                action: 'user_changed_own_password'
            });

            return { success: true };
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        } finally {
            showLoading(false);
        }
    }
}

// Initialize Auth Manager immediately
const authManager = new AuthManager();

// Call init when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    authManager.init();

    // Global delegated listener for logout button
    document.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) {
            e.preventDefault();
            authManager.logout();
        }
    });
});

// Export for use in other files
window.authManager = authManager;
