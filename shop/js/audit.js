class AuditManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.auditLogs = [];
        this.init();
    }

    async init() {
        this.currentUser = authManager.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Use shopId from authManager (Visitor Mode support)
        this.shopId = authManager.shopId || this.currentUser.shop_id;

        if (!this.shopId) {
            showNotification('No shop assigned', 'error');
            return;
        }

        this.updateUserInfo();
        this.setupEventListeners();
        await this.loadAuditData();

        // Refresh online status every 2 minutes
        setInterval(() => this.loadOnlineStatus(), 120000);
    }

    updateUserInfo() {
        const elements = {
            'userName': this.currentUser.full_name || this.currentUser.username,
            'userRole': this.currentUser.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff',
            'userFullName': this.currentUser.full_name || this.currentUser.username,
            'userEmail': this.currentUser.email || '',
            'userAvatar': (this.currentUser.full_name || this.currentUser.username).charAt(0).toUpperCase()
        };

        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshAudit');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAuditData());
        }

        const searchInput = document.getElementById('auditSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAuditLogs());
        }
    }

    async loadAuditData() {
        showLoading(true);
        try {
            await Promise.all([
                this.loadAuditLogs(),
                this.loadOnlineStatus()
            ]);
        } catch (error) {

            showNotification('Failed to load audit data', 'error');
        } finally {
            showLoading(false);
        }
    }

    async loadAuditLogs() {
        const { data, error } = await supabaseClient
            .from('audit_logs')
            .select(`
                *,
                profiles:user_id(username, full_name)
            `)
            .eq('shop_id', this.shopId)
            .eq('table_name', 'auth') // Only auth logs
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;

        this.auditLogs = data || [];
        this.renderAuditLogs(this.auditLogs);
    }

    async loadOnlineStatus() {
        try {
            // Get all staff for this shop
            const { data: users, error: userError } = await supabaseClient
                .from('profiles')
                .select('id, username, full_name, last_login')
                .eq('shop_id', this.shopId)
                .eq('is_active', true);

            if (userError) throw userError;

            // Get recent activity for these users in the last 15 minutes
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();

            const { data: recentLogs, error: logError } = await supabaseClient
                .from('audit_logs')
                .select('user_id, created_at, action_type')
                .eq('shop_id', this.shopId)
                .gte('created_at', fifteenMinutesAgo);

            if (logError) throw logError;

            // Determine who is online:
            // 1. Had an activity in the last 15 mins
            // 2. OR their latest auth action was 'login' (simplified)

            const activeUserIds = new Set(recentLogs.map(log => log.user_id));

            this.renderOnlineUsers(users, activeUserIds);
        } catch (error) {

        }
    }

    renderAuditLogs(logs) {
        const tableBody = document.getElementById('auditTable');
        if (!tableBody) return;

        if (logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No login logs found</td></tr>';
            return;
        }

        tableBody.innerHTML = logs.map(log => {
            const userName = log.profiles?.full_name || log.profiles?.username || 'Unknown User';
            const action = log.action_type === 'login' ?
                '<span class="badge badge-success"><i class="fas fa-sign-in-alt"></i> Login</span>' :
                '<span class="badge badge-secondary"><i class="fas fa-sign-out-alt"></i> Logout</span>';

            const device = log.user_agent ? this.parseUserAgent(log.user_agent) : 'Unknown Device';

            return `
                <tr>
                    <td>
                        <div class="date-info">
                            ${formatDate(log.created_at)}
                            <small class="text-muted d-block">${formatTime(log.created_at)}</small>
                        </div>
                    </td>
                    <td><strong>${userName}</strong></td>
                    <td>${action}</td>
                    <td><small class="text-muted">${device}</small></td>
                </tr>
            `;
        }).join('');
    }

    renderOnlineUsers(users, activeUserIds) {
        const container = document.getElementById('onlineUsersList');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<div class="text-center w-100 p-3">No staff found</div>';
            return;
        }

        container.innerHTML = users.map(user => {
            const isOnline = activeUserIds.has(user.id);
            const statusDot = isOnline ? '<span class="online-dot"></span> Online' : '<span class="offline-dot"></span> Offline';
            const initials = (user.full_name || user.username).charAt(0).toUpperCase();

            return `
                <div class="online-user-item">
                    <div class="online-user-avatar">${initials}</div>
                    <div class="online-user-info">
                        <strong>${user.full_name || user.username}</strong>
                        <div style="font-size: 0.75rem;">${statusDot}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterAuditLogs() {
        const searchTerm = document.getElementById('auditSearch').value.toLowerCase();

        const filtered = this.auditLogs.filter(log => {
            return !searchTerm ||
                (log.profiles?.full_name?.toLowerCase().includes(searchTerm) ||
                    log.profiles?.username?.toLowerCase().includes(searchTerm) ||
                    log.action_type?.toLowerCase().includes(searchTerm));
        });

        this.renderAuditLogs(filtered);
    }

    parseUserAgent(ua) {
        if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile Device';
        if (ua.includes('Windows')) return 'Windows PC';
        if (ua.includes('Macintosh')) return 'Mac PC';
        if (ua.includes('Linux')) return 'Linux PC';
        return 'Web Browser';
    }
}

// Global helpers (duplicate for safety if script loaded independently)
if (typeof formatDate !== 'function') {
    window.formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };
}
if (typeof formatTime !== 'function') {
    window.formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
}
if (typeof showLoading !== 'function') {
    window.showLoading = (show) => {
        const el = document.getElementById('loading');
        if (el) el.classList.toggle('active', show);
    };
}
if (typeof showNotification !== 'function') {
    window.showNotification = (msg, type = 'info') => {
        const el = document.getElementById('notification');
        if (el) {
            el.textContent = msg;
            el.className = `notification ${type}`;
            el.style.display = 'block';
            setTimeout(() => el.style.display = 'none', 3000);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    new AuditManager();
});
