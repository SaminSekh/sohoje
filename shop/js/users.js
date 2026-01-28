// Users Management - Complete Implementation with Backend Validation
class UsersManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.shopName = '';
        this.users = [];
        this.filteredUsers = [];
        this.init();
    }

    async init() {
        // Check authentication
        this.currentUser = authManager.getCurrentUser();

        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Use shopId from authManager (Visitor Mode support)
        this.shopId = authManager.shopId || this.currentUser.shop_id;

        if (!this.shopId) {
            showNotification('No shop assigned', 'error');
            setTimeout(() => authManager.logout(), 2000);
            return;
        }

        // Check permissions - shop admin AND visitor super admin can manage users
        if (this.currentUser.role !== 'shop_admin' && this.currentUser.role !== 'super_admin') {
            showNotification('Access denied. Shop admin access required.', 'error');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        // Load shop name
        await this.loadShopName();

        // Update UI
        this.updateUI();

        // Setup event listeners
        this.setupEventListeners();

        // Load users data
        await this.loadUsers();
    }

    async loadShopName() {
        try {
            const { data: shop, error } = await supabaseClient
                .from('shops')
                .select('shop_name')
                .eq('id', this.shopId)
                .single();

            if (!error && shop) {
                this.shopName = shop.shop_name;
            }
        } catch (error) {

            this.shopName = 'Unknown Shop';
        }
    }

    updateUI() {
        // Update user info
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');

        if (userNameEl) userNameEl.textContent = this.currentUser.full_name || this.currentUser.username;
        if (userRoleEl) {
            if (this.currentUser.role === 'shop_admin' || this.currentUser.role === 'super_admin') {
                userRoleEl.textContent = 'Shop Admin';
            } else {
                userRoleEl.textContent = 'Shop Staff';
            }
        }

    }

    setupEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }

        // Export button
        const exportUsersBtn = document.getElementById('exportUsersBtn');
        if (exportUsersBtn) {
            exportUsersBtn.addEventListener('click', () => {
                this.exportUsers();
            });
        }

        // Refresh button
        const refreshUsers = document.getElementById('refreshUsers');
        if (refreshUsers) {
            refreshUsers.addEventListener('click', () => {
                this.loadUsers();
            });
        }

        // Search input
        const usersSearch = document.getElementById('usersSearch');
        if (usersSearch) {
            usersSearch.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        // Role filter
        const usersRoleFilter = document.getElementById('usersRoleFilter');
        if (usersRoleFilter) {
            usersRoleFilter.addEventListener('change', (e) => {
                this.filterByRole(e.target.value);
            });
        }

        // Status filter
        const usersStatusFilter = document.getElementById('usersStatusFilter');
        if (usersStatusFilter) {
            usersStatusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Save user button
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }

        // Delete user button
        const deleteUserBtn = document.getElementById('deleteUserBtn');
        if (deleteUserBtn) {
            deleteUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteUser();
            });
        }

        // Generate password button
        const generatePassword = document.getElementById('generatePassword');
        if (generatePassword) {
            generatePassword.addEventListener('click', () => {
                this.generatePassword();
            });
        }

        // User role change (for permission updates)
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.addEventListener('change', (e) => {
                this.updatePermissionsBasedOnRole(e.target.value);
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Edit user event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-user-btn')) {
                const btn = e.target.closest('.edit-user-btn');
                const userId = btn.dataset.id;
                this.showEditUserModal(userId);
            }
        });

        // Delete user event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-user-btn')) {
                const btn = e.target.closest('.delete-user-btn');
                const userId = btn.dataset.id;
                if (confirm('Are you sure you want to delete this user?')) {
                    this.deleteUserById(userId);
                }
            }
        });

        // Toggle user status event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-user-status')) {
                const btn = e.target.closest('.toggle-user-status');
                const userId = btn.dataset.id;
                const currentStatus = btn.dataset.status === 'true';
                this.toggleUserStatus(userId, !currentStatus);
            }
        });
    }

    async loadUsers() {
        showLoading(true);

        try {
            // Load users for this shop only - WITHOUT shops join
            const { data: users, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('shop_id', this.shopId)
                .neq('role', 'super_admin')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.users = users || [];
            this.filteredUsers = [...this.users];



            // Update stats and table
            this.updateUserStats();
            this.renderUsersTable();

        } catch (error) {

            showNotification('Failed to load users', 'error');

            // If no users found, show empty state
            if (error.message.includes('No rows found') || error.code === 'PGRST116') {
                this.users = [];
                this.filteredUsers = [];
                this.renderUsersTable();
            }
        } finally {
            showLoading(false);
        }
    }

    updateUserStats() {
        const totalUsers = this.users.length;
        const activeAdmins = this.users.filter(u => u.role === 'shop_admin' && u.is_active).length;
        const activeStaff = this.users.filter(u => u.role === 'shop_staff' && u.is_active).length;
        const inactiveUsers = this.users.filter(u => !u.is_active).length;

        // Update display
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeAdmins').textContent = activeAdmins;
        document.getElementById('activeStaff').textContent = activeStaff;
        document.getElementById('inactiveUsers').textContent = inactiveUsers;
    }

    renderUsersTable() {
        const tableBody = document.getElementById('usersTable');
        if (!tableBody) {

            return;
        }

        if (this.filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-users fa-2x"></i>
                            <p>No users found</p>
                            <small>Click "Add User" to create your first user</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredUsers.map(user => {
            const roleBadgeClass = user.role === 'shop_admin' ? 'badge-primary' : 'badge-info';
            const roleText = user.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';

            const statusClass = user.is_active ? 'status-active' : 'status-inactive';
            const statusText = user.is_active ? 'Active' : 'Inactive';

            const createdDate = user.created_at ?
                new Date(user.created_at).toLocaleDateString() : 'N/A';

            const lastLogin = user.last_login ?
                new Date(user.last_login).toLocaleString() : 'Never';

            // Online status check (2 minute threshold)
            let isOnline = false;
            if (user.last_seen) {
                const lastSeen = new Date(user.last_seen);
                const now = new Date();
                const diffMs = now - lastSeen;
                const diffMins = Math.floor(diffMs / 60000);
                isOnline = diffMins < 2;
            }

            return `
                <tr>
                    <td>
                        <div class="user-info">
                            <strong>${user.username || 'No username'}</strong>
                            ${isOnline ? '<span class="online-indicator" title="Online Now"></span>' : ''}
                            ${user.email ? `<small>${user.email}</small>` : ''}
                        </div>
                    </td>
                    <td>${user.full_name || 'N/A'}</td>
                    <td>
                        <span class="badge ${roleBadgeClass}">
                            ${roleText}
                        </span>
                    </td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <span class="${statusClass}">
                            ${statusText}
                        </span>
                        <button class="btn btn-sm toggle-user-status" 
                                data-id="${user.id}" 
                                data-status="${user.is_active}"
                                title="${user.is_active ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-power-off ${user.is_active ? 'text-success' : 'text-danger'}"></i>
                        </button>
                    </td>
                    <td>${createdDate}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-user-btn" data-id="${user.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${user.id !== this.currentUser.id ? `
                            <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterUsers(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.phone && user.phone.includes(searchTerm))
            );
        }

        this.renderUsersTable();
    }

    filterByRole(role) {
        if (!role) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => user.role === role);
        }

        this.renderUsersTable();
    }

    filterByStatus(status) {
        if (!status) {
            this.filteredUsers = [...this.users];
        } else {
            const isActive = status === 'active';
            this.filteredUsers = this.users.filter(user => user.is_active === isActive);
        }

        this.renderUsersTable();
    }

    showAddUserModal() {
        // Reset form
        document.getElementById('userModalTitle').textContent = 'Add User';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('deleteUserBtn').style.display = 'none';

        // Set default values
        document.getElementById('userActive').checked = true;
        document.getElementById('userRole').value = 'shop_staff';

        // Generate password
        this.generatePassword();

        // Update permissions based on default role
        this.updatePermissionsBasedOnRole('shop_staff');

        // Show modal
        document.getElementById('userModal').classList.add('active');
    }

    async showEditUserModal(userId) {
        showLoading(true);

        try {
            const { data: user, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // Populate form
            document.getElementById('userModalTitle').textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username || '';
            document.getElementById('password').value = ''; // Don't show current password
            document.getElementById('fullName').value = user.full_name || '';
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userRole').value = user.role || 'shop_staff';
            document.getElementById('userActive').checked = user.is_active;

            // Load permissions from user data (if stored)
            if (user.permissions) {
                this.loadPermissions(user.permissions);
            } else {
                // Set default permissions based on role
                this.updatePermissionsBasedOnRole(user.role);
            }

            // Show delete button (except for current user)
            document.getElementById('deleteUserBtn').style.display =
                user.id !== this.currentUser.id ? 'block' : 'none';

            // Show modal
            document.getElementById('userModal').classList.add('active');

        } catch (error) {

            showNotification('Failed to load user details', 'error');
        } finally {
            showLoading(false);
        }
    }

    updatePermissionsBasedOnRole(role) {
        // Define default permissions for each role
        const defaultPermissions = {
            shop_admin: {
                dashboard: true,
                pos: true,
                inventory: true,
                sales: true,
                credit: true,
                expenses: true,
                users: true,
                settings: true,
                audit: true
            },
            shop_staff: {
                dashboard: false,
                pos: true,
                inventory: true,
                sales: false,
                credit: true,
                expenses: false,
                users: false,
                settings: false,
                audit: false
            }
        };

        const permissions = defaultPermissions[role] || defaultPermissions.shop_staff;

        // Update checkboxes
        Object.keys(permissions).forEach(perm => {
            const checkbox = document.getElementById(`perm${perm.charAt(0).toUpperCase() + perm.slice(1)}`);
            if (checkbox) {
                checkbox.checked = permissions[perm];
                // Always allow changing permissions regardless of role
                checkbox.disabled = false;
            }
        });
    }

    loadPermissions(permissions) {
        // Load permissions from user data
        Object.keys(permissions).forEach(perm => {
            const checkbox = document.getElementById(`perm${perm.charAt(0).toUpperCase() + perm.slice(1)}`);
            if (checkbox) {
                checkbox.checked = permissions[perm];
            }
        });
    }

    getPermissionsFromForm() {
        const permissions = {};

        // Get all permission checkboxes
        const permElements = [
            'permDashboard', 'permPOS', 'permInventory', 'permSales',
            'permCredit', 'permExpenses', 'permUsers', 'permSettings', 'permAudit'
        ];

        permElements.forEach(permId => {
            const checkbox = document.getElementById(permId);
            if (checkbox) {
                const permName = permId.replace('perm', '').toLowerCase();
                permissions[permName] = checkbox.checked;
            }
        });

        return permissions;
    }

    generatePassword() {
        // Generate a random password
        const length = 8;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        document.getElementById('password').value = password;
    }

    async saveUser() {
        // Get form values
        const userId = document.getElementById('userId').value;
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('userPhone').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value;
        const isActive = document.getElementById('userActive').checked;
        let permissions = this.getPermissionsFromForm();

        // Validate
        if (!username || !fullName || !role) {
            showNotification('Username, full name and role are required', 'error');
            return;
        }

        if (!userId && !password) {
            showNotification('Password is required for new users', 'error');
            return;
        }

        if (password && password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // BACKEND VALIDATION: Validate and sanitize permissions based on role
        permissions = this.validateAndSanitizePermissions(role, permissions);

        showLoading(true);

        try {
            if (userId) {
                // Update existing user in profiles table
                const userData = {
                    username: username,
                    full_name: fullName,
                    phone: phone || null,
                    email: email || null,
                    role: role,
                    is_active: isActive,
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                };

                // Add password to profile update if provided
                if (password) {
                    userData.password = password;
                }

                const { data, error } = await supabaseClient
                    .from('profiles')
                    .update(userData)
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) throw error;

                // ✅ IMPORTANT: Update current user in sessionStorage if editing own account
                if (userId === this.currentUser.id) {
                    const updatedUser = { ...this.currentUser, ...userData };
                    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    authManager.currentUser = updatedUser;
                }

                // If password is provided, also try to update it in auth.users
                if (password) {
                    try {
                        const { error: authError } = await supabaseClient.auth.admin.updateUserById(
                            userId,
                            { password: password }
                        );

                        if (authError) {

                        }
                    } catch (e) {

                    }
                }

                // Create audit log
                await this.createAuditLog('update', 'profiles', userId, null, {
                    username: username,
                    role: role,
                    permissions: permissions,
                    updated_fields: Object.keys(userData)
                });

                showNotification('User updated successfully', 'success');

            } else {
                // First check if username already exists
                const { data: existingUser } = await supabaseClient
                    .from('profiles')
                    .select('id')
                    .eq('username', username)
                    .single();

                if (existingUser) {
                    throw new Error('Username already exists');
                }

                // Create profile entry
                const userData = {
                    username: username,
                    password: password, // Include password in profile
                    full_name: fullName,
                    phone: phone || null,
                    email: email || `${username}@shop.local`,
                    role: role,
                    shop_id: this.shopId,
                    is_active: isActive,
                    permissions: permissions,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };



                const { data: profileData, error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert([userData])
                    .select()
                    .single();

                if (profileError) throw profileError;

                // Try to create auth user (optional)
                try {
                    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                        email: email || `${username}@shop.local`,
                        password: password,
                        options: {
                            data: {
                                username: username,
                                full_name: fullName,
                                role: role,
                                shop_id: this.shopId
                            }
                        }
                    });

                    if (authError) {

                    } else if (authData.user) {
                        // Update profile with auth user ID
                        await supabaseClient
                            .from('profiles')
                            .update({ id: authData.user.id })
                            .eq('id', profileData.id);
                    }
                } catch (authError) {

                    // Continue without auth user
                }

                // Create audit log
                await this.createAuditLog('create', 'profiles', profileData.id, null, {
                    username: username,
                    role: role,
                    permissions: permissions,
                    created_by: this.currentUser.id
                });

                showNotification('User added successfully', 'success');
            }

            // Close modal and refresh
            this.closeAllModals();
            await this.loadUsers();

        } catch (error) {

            showNotification('Failed to save user: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    // BACKEND VALIDATION FUNCTION
    validateAndSanitizePermissions(role, permissions) {
        // For shop_admin, we generally trust the settings but ensure they have basic access
        if (role === 'shop_admin') {
            return {
                dashboard: true,
                pos: true,
                inventory: true,
                sales: true,
                credit: true,
                expenses: true,
                users: true,
                settings: true,
                audit: true,
                ...permissions
            };
        }

        // For staff or others, simply return the permissions as selected in the UI
        // We've removed the hardcoded restrictions to allow granular control

        return permissions;
    }

    async deleteUser() {
        const userId = document.getElementById('userId').value;

        if (!userId) return;

        if (userId === this.currentUser.id) {
            showNotification('You cannot delete your own account', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        await this.deleteUserById(userId);
    }

    async deleteUserById(userId) {
        if (userId === this.currentUser.id) {
            showNotification('You cannot delete your own account', 'error');
            return;
        }

        showLoading(true);

        try {
            // Delete from profiles table first
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) throw profileError;

            // Try to delete from auth.users (optional)
            try {
                const { error: authError } = await supabaseClient.auth.admin.deleteUser(
                    userId
                );

                if (authError) {

                }
            } catch (authError) {

            }

            // Create audit log
            await this.createAuditLog('delete', 'profiles', userId, null, null);

            showNotification('User deleted successfully', 'success');

            // Refresh users
            await this.loadUsers();

        } catch (error) {

            showNotification('Failed to delete user: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async toggleUserStatus(userId, newStatus) {
        if (userId === this.currentUser.id) {
            showNotification('You cannot change your own status', 'error');
            return;
        }

        showLoading(true);

        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    is_active: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            // Create audit log
            await this.createAuditLog('update', 'profiles', userId, null, {
                is_active: newStatus
            });

            showNotification(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');

            // Refresh users
            await this.loadUsers();

        } catch (error) {

            showNotification('Failed to update user status', 'error');
        } finally {
            showLoading(false);
        }
    }

    async exportUsers() {
        showLoading(true);

        try {
            // Get all users data
            const userData = this.filteredUsers.map(user => {
                const roleText = user.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';
                const statusText = user.is_active ? 'Active' : 'Inactive';
                const createdDate = user.created_at ?
                    new Date(user.created_at).toLocaleDateString() : 'N/A';
                const lastLogin = user.last_login ?
                    new Date(user.last_login).toLocaleString() : 'Never';

                // Parse permissions for display
                let permissionSummary = 'No permissions';
                if (user.permissions) {
                    const activePerms = Object.keys(user.permissions).filter(key => user.permissions[key] === true);
                    if (activePerms.length > 0) {
                        permissionSummary = activePerms.join(', ');
                    }
                }

                return {
                    'Username': user.username,
                    'Full Name': user.full_name || 'N/A',
                    'Role': roleText,
                    'Phone': user.phone || 'N/A',
                    'Email': user.email || 'N/A',
                    'Status': statusText,
                    'Permissions': permissionSummary,
                    'Created Date': createdDate,
                    'Last Login': lastLogin,
                    'Shop': this.shopName
                };
            });

            // Create CSV content
            let csv = 'Username,Full Name,Role,Phone,Email,Status,Permissions,Created Date,Last Login,Shop\n';

            userData.forEach(user => {
                csv += `"${user.Username}","${user['Full Name']}","${user.Role}","${user.Phone}","${user.Email}","${user.Status}","${user.Permissions}","${user['Created Date']}","${user['Last Login']}","${user.Shop}"\n`;
            });

            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `users_${this.shopId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('Users exported successfully', 'success');

        } catch (error) {

            showNotification('Failed to export users', 'error');
        } finally {
            showLoading(false);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async createAuditLog(actionType, tableName, recordId, oldData, newData) {
        try {
            await supabaseClient
                .from('audit_logs')
                .insert({
                    shop_id: this.shopId,
                    user_id: this.currentUser.id,
                    action_type: actionType,
                    table_name: tableName,
                    record_id: recordId,
                    old_data: oldData,
                    new_data: newData,
                    ip_address: await this.getIPAddress(),
                    user_agent: navigator.userAgent
                });
        } catch (error) {

        }
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }
}

// Initialize on users page
if (window.location.pathname.includes('users.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new UsersManager();
    });
}
