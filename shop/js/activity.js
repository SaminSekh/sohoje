class ActivityManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.activities = [];
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
            return;
        }

        this.updateUserInfo();
        this.setupEventListeners();
        await this.loadActivities();
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
        const refreshBtn = document.getElementById('refreshActivity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadActivities());
        }

        const searchInput = document.getElementById('activitySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterActivities());
        }

        const actionFilter = document.getElementById('actionTypeFilter');
        if (actionFilter) {
            actionFilter.addEventListener('change', () => this.filterActivities());
        }
    }

    async loadActivities() {
        showLoading(true);
        try {
            const { data, error } = await supabaseClient
                .from('audit_logs')
                .select(`
                    *,
                    profiles:user_id(username, full_name)
                `)
                .eq('shop_id', this.shopId)
                .neq('table_name', 'auth') // Exclude login/logout for activity page
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;

            this.activities = data || [];
            this.renderActivities(this.activities);
        } catch (error) {

            showNotification('Failed to load activities', 'error');
        } finally {
            showLoading(false);
        }
    }

    renderActivities(activities) {
        const tableBody = document.getElementById('activityTable');
        if (!tableBody) return;

        if (activities.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No activities found</td></tr>';
            return;
        }

        tableBody.innerHTML = activities.map(log => {
            const userName = log.profiles?.full_name || log.profiles?.username || 'Unknown User';
            const details = this.formatLogDetails(log);
            const actionClass = this.getActionClass(log.action_type);

            return `
                <tr>
                    <td>
                        <div class="date-info">
                            ${formatDate(log.created_at)}
                            <small class="text-muted d-block">${formatTime(log.created_at)}</small>
                        </div>
                    </td>
                    <td><strong>${userName}</strong></td>
                    <td><span class="badge ${actionClass}">${log.action_type || 'Action'}</span></td>
                    <td><span class="badge badge-secondary">${log.table_name || 'N/A'}</span></td>
                    <td><small class="text-muted" title='${JSON.stringify(log.new_data || {})}'>${details}</small></td>
                </tr>
            `;
        }).join('');
    }

    filterActivities() {
        const searchTerm = document.getElementById('activitySearch').value.toLowerCase();
        const actionType = document.getElementById('actionTypeFilter').value;

        const filtered = this.activities.filter(log => {
            const matchesSearch = !searchTerm ||
                (log.profiles?.full_name?.toLowerCase().includes(searchTerm) ||
                    log.profiles?.username?.toLowerCase().includes(searchTerm) ||
                    log.table_name?.toLowerCase().includes(searchTerm) ||
                    JSON.stringify(log.new_data || {}).toLowerCase().includes(searchTerm));

            const matchesAction = !actionType || log.action_type === actionType;

            return matchesSearch && matchesAction;
        });

        this.renderActivities(filtered);
    }

    getActionClass(action) {
        const actionMap = {
            'create': 'badge-success',
            'update': 'badge-info',
            'delete': 'badge-danger',
            'sell': 'badge-primary',
            'add_stock': 'badge-warning'
        };
        return actionMap[action?.toLowerCase()] || 'badge-secondary';
    }

    formatLogDetails(log) {
        const data = log.new_data || {};
        const action = log.action_type?.toLowerCase();
        const table = log.table_name?.toLowerCase();

        if (table === 'sales' && action === 'sell') {
            return `Sale: ${data.invoice_number} | Amount: ${formatCurrency(data.total_amount)} | Items: ${data.items_count}`;
        }

        if (table === 'products') {
            if (action === 'create') return `Added product: ${data.product_name} (Stock: ${data.stock})`;
            if (action === 'update') return `Updated product: ${data.product_name} (Stock: ${data.stock})`;
            if (action === 'delete') return `Deleted product ID: ${data.product_id || log.record_id}`;
            if (action === 'add_stock') return `Added Stock: ${data.quantity} to ${data.product_name}`;
        }

        if (table === 'credits') {
            if (action === 'create') return `New Credit: ${data.buyer_name} | Amount: ${formatCurrency(data.total_amount)}`;
            if (action === 'payment') return `Payment from ${data.buyer_name}: ${formatCurrency(data.amount)}`;
            if (action === 'delete') return `Deleted credit record ID: ${log.record_id}`;
        }

        // Generic representation
        const details = log.new_data ? JSON.stringify(log.new_data) : (log.action_type || 'N/A');
        return details.length > 100 ? details.substring(0, 100) + '...' : details;
    }
}

// Global helpers if not in main.js
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
    new ActivityManager();
});
