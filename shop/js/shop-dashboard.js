// Shop Dashboard Manager - COMPLETE FIXED VERSION
class ShopDashboardManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.shopData = null;
        this.salesChart = null;
        this.activities = [];
        this.startDate = null;
        this.endDate = null;

        // Current totals for balance calculation
        this.totalVolumeSales = 0;
        this.totalIncome = 0;
        this.totalExpenses = 0;
        this.totalOutstandingCredit = 0;

        // Listen for user updates to re-enforce permissions
        window.addEventListener('user-updated', (event) => {

            this.currentUser = event.detail.user;
            this.enforcePermissions();
        });

        // RE-BIND LISTENERS when menu is updated (MenuManager clears and rebuilds sidebar)
        window.addEventListener('menu-updated', () => {

            this.setupEventListeners();
        });
    }

    async init() {
        // Check authentication
        this.currentUser = authManager.getCurrentUser();

        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Use shopId from authManager (which supports Visitor Mode override)
        // Fallback to currentUser.shop_id if locally not set (though authManager should have it)
        this.shopId = authManager.shopId || this.currentUser.shop_id;

        if (!this.shopId) {
            showNotification('No shop assigned', 'error');
            setTimeout(() => authManager.logout(), 2000);
            return;
        }

        // Set default dates (Today)
        this.setTodayRange();

        // Update UI
        this.updateUI();

        // Setup event listeners
        this.setupEventListeners();

        // Load shop data FIRST (needed for logo fallbacks and status check)
        await this.updateShopName();

        // Check if shop is frozen, suspended or has a warning
        if (this.shopData) {
            const status = this.shopData.status || 'active';
            const isFrozen = status.includes('frozen');
            const isSuspended = status.includes('suspended');
            const isWarning = status.includes('warning');

            if (isFrozen) {
                this.showSuspensionWarning('frozen');
                return;
            } else if (isSuspended) {
                this.showSuspensionWarning('suspended');
            } else if (isWarning) {
                this.showPaymentWarning();
            }
        }

        // Load dashboard data
        await this.loadDashboardData();

        // Check for activity hash in URL
        if (window.location.hash === '#activity') {
            this.showSection('activitySection');
            this.loadActivity();

            // Highlight activity in menu
            const activityLink = document.getElementById('activityLink');
            if (activityLink) {
                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                activityLink.classList.add('active');
            }
        }
    }

    setTodayRange() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        this.startDate = start.toISOString();
        this.endDate = end.toISOString();
    }

    updateUI() {
        const user = this.currentUser;

        // Update user info
        const userNameEl = document.getElementById('userName');
        const userFullNameEl = document.getElementById('userFullName');
        const welcomeNameEl = document.getElementById('welcomeName');
        const userAvatarEl = document.getElementById('userAvatar');
        const userRoleEl = document.getElementById('userRole');
        const userEmailEl = document.getElementById('userEmail');

        if (userNameEl) userNameEl.textContent = user.full_name || user.username;
        if (userFullNameEl) userFullNameEl.textContent = user.full_name || user.username;
        if (welcomeNameEl) welcomeNameEl.textContent = user.full_name || user.username;
        if (userAvatarEl) userAvatarEl.textContent = (user.full_name || user.username).charAt(0).toUpperCase();
        if (userRoleEl) {
            if (user.role === 'shop_admin' || user.role === 'super_admin') {
                userRoleEl.textContent = 'Shop Admin';
            } else {
                userRoleEl.textContent = 'Shop Staff';
            }

            // Back to Super Admin Button
            if (user.role === 'super_admin') {
                const backBtnId = 'backToSuperAdminBtn';
                let backBtn = document.getElementById(backBtnId);

                if (!backBtn) {
                    backBtn = document.createElement('button');
                    backBtn.id = backBtnId;
                    backBtn.className = 'btn btn-sm btn-success mt-2';
                    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Super Admin';
                    backBtn.style.width = '100%';
                    backBtn.style.fontSize = '0.8rem';
                    // Style to match sidebar theme
                    backBtn.style.color = '#fff';

                    // Insert after the user info container's last child
                    userRoleEl.parentNode.appendChild(backBtn);

                    backBtn.addEventListener('click', () => {
                        // Clear visitor session
                        sessionStorage.removeItem('visitorShopId');
                        // Redirect to Super Admin Dashboard
                        window.location.href = 'super-admin.html';
                    });
                }
            }
        }
        if (userEmailEl && user.email) userEmailEl.textContent = user.email;

        // Update shop name
        this.updateShopName();



        // Enforce granular permissions for UI elements
        this.enforcePermissions();
    }

    enforcePermissions() {
        const user = this.currentUser;
        if (!user) return;

        // Permissions to check
        const permissions = {
            sales: ['todaySales', 'salesChange', 'salesChartContainer', 'recentSales'],
            profit: ['grossProfit', 'profitChange', 'productCostValue', 'productSellValue', 'currentBalance'],
            credit: ['outstandingCredit', 'creditChange'],
            expenses: ['totalExpenses', 'expenseChange'],
            audit: ['activitySection']
        };

        // If shop_staff, check granular permissions
        if (user.role === 'shop_staff') {
            const userPerms = user.permissions || {};

            // Helper to hide elements
            const hideElement = (id) => {
                const el = document.getElementById(id);
                if (el) {
                    // Find the closest card or container to hide
                    const container = el.closest('.stat-card') || el.closest('.chart-container') || el.closest('.table-container') || el;
                    container.style.display = 'none';
                }
            };

            // Check each permission category
            if (!userPerms.sales) {
                permissions.sales.forEach(id => hideElement(id));
            }
            if (!userPerms.profit) {
                permissions.profit.forEach(id => hideElement(id));
            }
            if (!userPerms.credit) {
                permissions.credit.forEach(id => hideElement(id));
            }
            if (!userPerms.expenses) {
                permissions.expenses.forEach(id => hideElement(id));
            }
            if (!userPerms.audit) {
                permissions.audit.forEach(id => hideElement(id));
            }

            // If they don't have dashboard permission, hide everything but welcome
            if (userPerms.dashboard === false) {
                const statsGrid = document.querySelector('.stats-grid');
                if (statsGrid) statsGrid.style.display = 'none';
                const dashboardContent = document.getElementById('dashboardContent');
                if (dashboardContent) dashboardContent.style.display = 'none';
            }
        }
    }

    async updateShopName() {
        try {
            // Fetch basic shop info 
            const { data: shop, error } = await supabaseClient
                .from('shops')
                .select('shop_name, shop_logo, current_balance, status, admin_phone, admin_whatsapp, admin_telegram, admin_note')
                .eq('id', this.shopId)
                .single();

            if (!error && shop) {
                this.shopData = shop;
                this.shopLogo = shop.shop_logo || null;
                this.shopAsset = parseFloat(shop.current_balance || 0);

                // Update shop name in UI
                const shopNameHeader = document.getElementById('shopNameHeader');
                if (shopNameHeader) {
                    shopNameHeader.textContent = shop.shop_name;
                }
            }

            // Fetch Settings for Currency
            const { data: settings, error: settingsError } = await supabaseClient
                .from('shop_settings')
                .select('currency')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (!settingsError && settings) {
                window.shopCurrency = settings.currency || 'INR';
            } else {
                window.shopCurrency = 'INR';
            }

        } catch (error) {
            console.error('Error updating shop details:', error);
        }
    }

    showSuspensionWarning(type = 'suspended') {
        const adminPhone = this.shopData.admin_phone || '+91 00000 00000';
        const adminWA = this.shopData.admin_whatsapp || adminPhone;
        const adminTG = this.shopData.admin_telegram || '';

        const title = type === 'frozen' ? 'Shop Frozen' : 'Shop Suspended';
        const icon = type === 'frozen' ? 'fa-snowflake' : 'fa-exclamation-triangle';
        const color = type === 'frozen' ? '#3498db' : '#e74c3c';

        // Create a persistent overlay
        const overlay = document.createElement('div');
        overlay.id = 'suspensionOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.92)';
        overlay.style.zIndex = '9999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';
        overlay.style.padding = '20px';
        overlay.style.backdropFilter = 'blur(8px)';

        overlay.innerHTML = `
            <div style="background: white; color: #333; padding: 40px; border-radius: 24px; max-width: 550px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.5); border-top: 8px solid ${color};">
                <i class="fas ${icon}" style="font-size: 80px; color: ${color}; margin-bottom: 25px;"></i>
                <h2 style="font-size: 28px; margin-bottom: 15px; font-weight: 800; color: #1a1a1a;">${title}</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #4b5563;">
                    Your access to this shop has been restricted by the system administrator. 
                    Please use the contact options below to resolve this immediately.
                </p>
                
                <div style="display: grid; gap: 12px; margin-bottom: 30px;">
                    <a href="tel:${adminPhone.replace(/\s+/g, '')}" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: #f3f4f6; color: #1f2937; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: 0.2s;">
                        <i class="fas fa-phone-alt" style="color: #6366f1;"></i> Call: ${adminPhone}
                    </a>
                    
                    <a href="https://wa.me/${adminWA.replace(/\D/g, '')}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: #e8f5e9; color: #1b5e20; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: 0.2s;">
                        <i class="fab fa-whatsapp" style="color: #25d366; font-size: 1.2rem;"></i> WhatsApp Admin
                    </a>

                    ${adminTG ? `
                    <a href="https://t.me/${adminTG.replace('@', '')}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: #e3f2fd; color: #0d47a1; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: 0.2s;">
                        <i class="fab fa-telegram-plane" style="color: #0088cc; font-size: 1.2rem;"></i> Telegram Admin
                    </a>
                    ` : ''}
                </div>

                ${this.shopData.admin_note ? `
                <div style="background: #fffdf2; border-left: 4px solid #f6e05e; padding: 15px; margin-bottom: 25px; border-radius: 8px; text-align: left;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #856404; text-transform: uppercase; margin-bottom: 5px;">Admin Note:</span>
                    <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;">${this.shopData.admin_note}</p>
                </div>
                ` : ''}

                <div style="border-top: 1px solid #eee; padding-top: 25px;">
                    <button onclick="authManager.logout()" style="background: #1a1a1a; color: white; border: none; padding: 14px 40px; border-radius: 12px; cursor: pointer; font-weight: 700; width: 100%; font-size: 1rem; transition: 0.3s;">
                        Securely Log Out
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    showPaymentWarning() {
        const adminPhone = this.shopData.admin_phone || '+91 00000 00000';
        const adminWA = this.shopData.admin_whatsapp || adminPhone;

        const warningDiv = document.createElement('div');
        warningDiv.id = 'paymentWarningBanner';
        warningDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 15px 20px;
            margin: 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        `;

        warningDiv.innerHTML = `
            <div style="background: #fc8181; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1rem; font-weight: 700;">Payment Overdue Notice</h4>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                    Your monthly system subscription payment is pending. Please contact the administrator immediately to avoid service interruption.
                </p>
            </div>
            <div style="display: flex; gap: 10px; flex-shrink: 0;">
                <a href="https://wa.me/${adminWA.replace(/\D/g, '')}" target="_blank" style="background: #25d366; color: white; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <i class="fab fa-whatsapp"></i> WhatsApp Admin
                </a>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const content = mainContent.querySelector('.content');
            if (content) {
                content.prepend(warningDiv);
            } else {
                mainContent.prepend(warningDiv);
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authManager.logout();
            });
        }


        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-sm btn-primary';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshBtn.addEventListener('click', () => {
            this.loadDashboardData();
        });

        const navbarRight = document.getElementById('navbarRight');
        if (navbarRight) {
            navbarRight.appendChild(refreshBtn);
        }



        // Time Range Filter
        const timeRangeFilter = document.getElementById('timeRangeFilter');
        const customDateRange = document.getElementById('customDateRange');
        const applyCustomRange = document.getElementById('applyCustomRange');

        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === 'custom') {
                    if (customDateRange) customDateRange.style.display = 'flex';
                } else {
                    if (customDateRange) customDateRange.style.display = 'none';
                    this.applyPresetFilter(value);
                }
            });
        }

        if (applyCustomRange) {
            applyCustomRange.addEventListener('click', () => {
                const start = document.getElementById('startDate').value;
                const end = document.getElementById('endDate').value;
                if (start && end) {
                    this.startDate = new Date(start).toISOString();
                    const endDay = new Date(end);
                    endDay.setHours(23, 59, 59, 999);
                    this.endDate = endDay.toISOString();
                    this.loadDashboardData();
                } else {
                    showNotification('Please select both start and end dates', 'warning');
                }
            });
        }

        // Dashboard Deletion Delegation
        document.addEventListener('click', (e) => {
            const deleteTopProductBtn = e.target.closest('.delete-top-product');
            if (deleteTopProductBtn) {
                const id = deleteTopProductBtn.dataset.id;
                const name = deleteTopProductBtn.dataset.name;
                this.deleteTopProduct(id, name);
                return;
            }

            const deleteRecentSaleBtn = e.target.closest('.delete-recent-sale');
            if (deleteRecentSaleBtn) {
                const id = deleteRecentSaleBtn.dataset.id;
                const invoice = deleteRecentSaleBtn.dataset.invoice;
                this.deleteRecentSale(id, invoice);
                return;
            }
        });
    }

    applyPresetFilter(preset) {
        const now = new Date();
        let start, end;

        switch (preset) {
            case 'today':
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                start = new Date(now);
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setDate(now.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                // This week (last 7 days)
                start = new Date(now);
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                // This month
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'year':
                // This year
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                return;
        }

        this.startDate = start.toISOString();
        this.endDate = end.toISOString();
        this.loadDashboardData();
    }

    async loadDashboardData() {
        showLoading(true);

        try {
            // Update Card Titles based on selection
            this.updateCardLabels();

            // Load all dashboard components
            await Promise.all([
                this.loadSalesStats(),
                this.loadOutstandingCredit(),
                this.loadTotalExpenses(),
                this.loadInventoryValuation(),
                this.loadSalesChart(),
                this.loadTopProducts(),
                this.loadRecentSales(),
                this.loadLowStockAlerts()
            ]);

            // Load balance after components have fetched their respective totals
            await this.loadFinancialSummaries();

        } catch (error) {

            showNotification('Failed to load dashboard data', 'error');
        } finally {
            showLoading(false);
        }
    }

    updateCardLabels() {
        const filter = document.getElementById('timeRangeFilter')?.value || 'today';
        const labels = {
            today: 'Today\'s',
            yesterday: 'Yesterday\'s',
            week: 'Weekly',
            month: 'Monthly',
            year: 'Yearly',
            custom: 'Period\'s'
        };
        const label = labels[filter] || 'Selected';

        // Update sales label
        if (document.getElementById('salesFilterLabel')) {
            const filterTexts = {
                today: 'Today',
                yesterday: 'Yesterday',
                week: 'This Week',
                month: 'This Month',
                year: 'This Year',
                custom: 'Custom Range'
            };
            const periodText = filterTexts[filter] || 'All Time';
            document.getElementById('salesFilterLabel').textContent = periodText;

            // Also update expense filter label if it exists
            const expenseFilterLabel = document.getElementById('expenseFilterLabel') ||
                document.querySelector('.stat-card .stat-icon.expense + .stat-info .change');
            if (expenseFilterLabel) {
                expenseFilterLabel.textContent = periodText;
            }
        }

        // Update 'Expenses' title if it's dynamic
        const expenseTitle = document.querySelector('.stat-card .stat-icon.expense + .stat-info h3');
        if (expenseTitle) {
            expenseTitle.textContent = `${label} Expenses`;
        }

        // Update 'Monthly Balance' title
        if (document.getElementById('netBalanceTitle')) {
            document.getElementById('netBalanceTitle').textContent = `${label.replace("'s", "")} Balance`;
        }
    }

    async loadSalesStats() {
        try {
            // 1. Fetch Sales Data
            const { data: sales, error } = await supabaseClient
                .from('sales')
                .select('id, total_amount, discount_amount, created_at')
                .eq('shop_id', this.shopId)
                .gte('created_at', this.startDate)
                .lte('created_at', this.endDate);

            if (error) throw error;

            const totalSales = sales?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) || 0;
            const totalDiscounts = sales?.reduce((sum, sale) => sum + parseFloat(sale.discount_amount || 0), 0) || 0;
            this.totalVolumeSales = totalSales; // Store for balance calculation

            const salesEl = document.getElementById('totalSales'); // UPDATED ID
            if (salesEl) {
                salesEl.textContent = formatCurrency(totalSales);
            }

            // 2. [REMOVED SALES CHANGE LOGIC FOR BREVITY IF NOT USED IN NEW CARDS, BUT FILTER LABEL HANDLES CONTEXT]
            // actually user requested structure doesn't show change % in stats-grid cards explicitly in the text description provided,
            // but the new card has 'salesFilterLabel' instead of 'salesChange'. 
            // I will skip the complex 'change %' calculation if not needed, or leave it if it doesn't hurt.
            // Be safe, just skip it to declutter, or keep if needed later. 
            // The HTML I put has 'salesFilterLabel' which is static text "This Month" etc updated by JS. 
            // So 'salesChange' ID is gone.

            // 3. Calculate Profit (Client-Side Logic)
            let realGrossProfit = 0;
            try {
                if (sales && sales.length > 0) {
                    const saleIds = sales.map(s => s.id);
                    // A. Fetch sale items (without joining products to avoid FK issues)
                    const { data: saleItems, error: itemsError } = await supabaseClient
                        .from('sale_items')
                        .select('product_id, quantity, unit_price, cost_price') // Added cost_price
                        .in('sale_id', saleIds);

                    if (itemsError) throw itemsError;

                    if (saleItems && saleItems.length > 0) {
                        // B. Fetch related products (cost price) - for fallback
                        const productIds = [...new Set(saleItems.map(item => item.product_id).filter(id => id))];

                        let productCosts = {};
                        if (productIds.length > 0) {
                            const { data: products, error: productsError } = await supabaseClient
                                .from('products')
                                .select('id, cost_price')
                                .in('id', productIds);

                            if (!productsError && products) {
                                products.forEach(p => {
                                    productCosts[p.id] = parseFloat(p.cost_price || 0);
                                });
                            }
                        }

                        // C. Calculate Profit
                        realGrossProfit = saleItems.reduce((sum, item) => {
                            const quantity = parseFloat(item.quantity || 0);
                            const sellingPrice = parseFloat(item.unit_price || 0);

                            // Use recorded cost price first, then fallback to current product cost
                            let costPrice = 0;
                            if (item.cost_price !== null && item.cost_price !== undefined) {
                                costPrice = parseFloat(item.cost_price);
                            } else {
                                costPrice = productCosts[item.product_id] || 0;
                            }

                            const itemProfit = (sellingPrice - costPrice) * quantity;
                            return sum + itemProfit;
                        }, 0);
                    }
                }

                // Subtract global discounts from the gross profit
                realGrossProfit -= totalDiscounts;

            } catch (calcErr) {
                console.error('Profit Calculation Error:', calcErr);
            }

            // Update Profit UI
            const grossProfitEl = document.getElementById('totalProfit'); // UPDATED ID
            if (grossProfitEl) {
                grossProfitEl.textContent = formatCurrency(realGrossProfit);
            }

            // 4. Calculate Profit Percentage (Markup: Profit / Cost)
            const totalCost = totalSales - realGrossProfit;
            let profitMargin = 0;
            if (totalCost > 0) {
                profitMargin = (realGrossProfit / totalCost) * 100;
            } else if (totalSales > 0) {
                profitMargin = 100;
            }

            const profitMarginEl = document.getElementById('profitMargin');
            if (profitMarginEl) {
                profitMarginEl.textContent = `${profitMargin.toFixed(1)}%`;
            }

        } catch (error) {
            console.error('Error loading sales stats:', error);
            if (document.getElementById('totalSales')) document.getElementById('totalSales').textContent = formatCurrency(0);
        }
    }

    async loadOutstandingCredit() {
        try {
            // Get ALL credits for shop to calculate totals
            const { data: credits, error } = await supabaseClient
                .from('credits')
                .select('total_amount, pending_amount')
                .eq('shop_id', this.shopId);

            if (error) throw error;

            const totalCreditAllTime = credits?.reduce((sum, credit) => sum + parseFloat(credit.total_amount || 0), 0) || 0;
            const totalPending = credits?.reduce((sum, credit) => sum + parseFloat(credit.pending_amount || 0), 0) || 0;

            this.totalOutstandingCredit = totalPending; // Store pending for Net Balance calc?

            if (document.getElementById('totalCredit')) {
                document.getElementById('totalCredit').textContent = formatCurrency(totalCreditAllTime);
            }
            if (document.getElementById('pendingBalance')) {
                document.getElementById('pendingBalance').textContent = formatCurrency(totalPending);
            }

        } catch (error) {
            console.error('Error loading credits:', error);
            if (document.getElementById('totalCredit')) document.getElementById('totalCredit').textContent = formatCurrency(0);
        }
    }

    async loadTotalExpenses() {
        try {
            const { data: expenses, error } = await supabaseClient
                .from('expenses')
                .select('amount, expense_type')
                .eq('shop_id', this.shopId)
                .gte('expense_date', this.startDate.split('T')[0])
                .lte('expense_date', this.endDate.split('T')[0]);

            if (error) throw error;

            const totalExpenses = expenses?.filter(e => e.expense_type !== 'income').reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
            const totalIncome = expenses?.filter(e => e.expense_type === 'income').reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;

            this.totalExpenses = totalExpenses;
            this.totalIncome = totalIncome;

            // Target the expense value element. It might be 'todayExpenses' or 'totalExpenses' depending on view.
            const expensesEl = document.getElementById('todayExpenses') || document.getElementById('totalExpenses');
            if (expensesEl) {
                expensesEl.textContent = formatCurrency(totalExpenses);
            }

        } catch (error) {
            console.error('Error loading expenses:', error);
            const expensesEl = document.getElementById('todayExpenses') || document.getElementById('totalExpenses');
            if (expensesEl) {
                expensesEl.textContent = formatCurrency(0);
            }
        }
    }

    async loadInventoryValuation() {
        try {
            // Fetch all columns to avoid missing column errors and ensure we get stock/quantity
            const { data: products, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('shop_id', this.shopId);

            if (error) throw error;

            // Defensive: Check both 'stock' and 'quantity' columns
            // Some tables use 'stock', some 'quantity'. Previous code checked both.
            // Aggregation logic:

            let totalCostVal = 0;
            let totalSellVal = 0;
            let totalItems = 0; // Product Count
            let totalUnits = 0; // In Stock
            let outOfStockCount = 0;

            if (products) {
                totalItems = products.length;

                products.forEach(p => {
                    const stockVal = parseInt(p.stock) || parseInt(p.quantity) || 0;
                    const cost = parseFloat(p.cost_price) || 0;
                    const price = parseFloat(p.selling_price) || 0;

                    totalCostVal += (stockVal * cost);
                    totalSellVal += (stockVal * price);
                    totalUnits += stockVal;

                    if (stockVal <= 0) {
                        outOfStockCount++;
                    }
                });
            }

            this.totalInventoryValue = totalCostVal; // Store for ref if needed
            this.totalInventorySellValue = totalSellVal;

            if (document.getElementById('productCostValue')) document.getElementById('productCostValue').textContent = formatCurrency(totalCostVal);
            if (document.getElementById('productSellValue')) document.getElementById('productSellValue').textContent = formatCurrency(totalSellVal);

            // New Inventory Logistics Cards
            if (document.getElementById('productCount')) document.getElementById('productCount').textContent = totalItems;
            if (document.getElementById('inStock')) document.getElementById('inStock').textContent = totalUnits;
            if (document.getElementById('outOfStock')) document.getElementById('outOfStock').textContent = outOfStockCount;


        } catch (error) {
            console.error('Error loading inventory valuation:', error);
            if (document.getElementById('productCostValue')) document.getElementById('productCostValue').textContent = formatCurrency(0);
        }
    }

    async loadCurrentBalance() {
        try {
            // Formula: (Sales - Outstanding Credit) + Income - Expenses + Shop Asset
            // (Sales - Outstanding Credit) is essentially Cash from Sales
            const cashFromSales = (this.totalVolumeSales || 0) - (this.totalOutstandingCredit || 0);
            const netBalance = cashFromSales + (this.totalIncome || 0) - (this.totalExpenses || 0) + (this.shopAsset || 0);

            const balanceEl = document.getElementById('currentBalance');
            if (balanceEl) {
                balanceEl.textContent = formatCurrency(netBalance);

                // Card highlight effect
                const card = balanceEl.closest('.stat-card');
                if (card) {
                    if (netBalance < 0) {
                        balanceEl.style.color = 'var(--danger)';
                        card.style.borderLeft = '4px solid var(--danger)';
                    } else if (netBalance > 0) {
                        balanceEl.style.color = 'var(--success)';
                        card.style.borderLeft = '4px solid var(--success)';
                    } else {
                        balanceEl.style.color = 'var(--gray)';
                        card.style.borderLeft = '4px solid var(--light-gray)';
                    }
                }
            }
        } catch (error) {

        }
    }

    async loadSalesChart() {
        try {

            const start = new Date(this.startDate);
            const end = new Date(this.endDate);

            // Determine chart granularity and range
            const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            let range = [];

            if (diffDays <= 1) {
                // Today or Yesterday - show by hour? (Let's stick to 7 days or selected period)
                // For simplicity, always show 7 days if range is small, otherwise show the range
                const daysToShow = Math.max(7, diffDays);
                for (let i = daysToShow - 1; i >= 0; i--) {
                    const date = new Date(end);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    range.push(date);
                }
            } else {
                // Show the selected range (up to 30 days for performance)
                const daysToShow = Math.min(30, diffDays);
                for (let i = daysToShow - 1; i >= 0; i--) {
                    const date = new Date(end);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    range.push(date);
                }
            }

            console.log('Date range for chart:', {
                start: range[0].toLocaleDateString(),
                end: range[range.length - 1].toLocaleDateString()
            });

            // Prepare data for chart
            const chartLabels = [];
            const chartData = [];

            // Get sales data for each day
            for (let i = 0; i < range.length; i++) {
                const currentDate = range[i];

                // Set start and end of the day
                const startOfDay = new Date(currentDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(currentDate);
                endOfDay.setHours(23, 59, 59, 999);

                // Create label
                const isFinalDay = i === range.length - 1;
                let label;
                if (isFinalDay && range[i].toDateString() === new Date().toDateString()) {
                    label = 'Today';
                } else {
                    label = currentDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric'
                    });
                }
                chartLabels.push(label);



                try {
                    // Fetch sales for this specific day
                    const { data: dailySales, error } = await supabaseClient
                        .from('sales')
                        .select('total_amount, created_at')
                        .eq('shop_id', this.shopId)
                        .gte('created_at', startOfDay.toISOString())
                        .lte('created_at', endOfDay.toISOString());

                    if (error) {

                        chartData.push(0);
                        continue;
                    }

                    // Calculate total for the day
                    let dailyTotal = 0;
                    if (dailySales && dailySales.length > 0) {
                        dailyTotal = dailySales.reduce((sum, sale) => {
                            return sum + (parseFloat(sale.total_amount) || 0);
                        }, 0);


                    } else {

                    }

                    chartData.push(dailyTotal);

                } catch (fetchError) {

                    chartData.push(0);
                }
            }




            // Create chart with today highlighted
            this.createSalesChartWithToday(chartLabels, chartData);

            // Update summary
            this.updateChartSummary(chartData);

        } catch (error) {

            this.createEmptyChartWithToday();
        }
    }

    createSalesChartWithToday(labels, data) {
        const ctx = document.getElementById('salesChart');
        if (!ctx) {

            return;
        }

        // Destroy existing chart if it exists
        if (this.salesChart) {
            this.salesChart.destroy();
        }

        // Find today's index
        const todayIndex = labels.indexOf('Today');

        // Prepare background colors (highlight today)
        const backgroundColors = labels.map((label, index) => {
            if (label === 'Today') {
                return 'rgba(67, 97, 238, 0.3)'; // Highlighted blue
            }
            return 'rgba(67, 97, 238, 0.1)'; // Normal blue
        });

        // Prepare border colors
        const borderColors = labels.map((label, index) => {
            if (label === 'Today') {
                return '#4361ee'; // Bright blue for today
            }
            return 'rgba(67, 97, 238, 0.5)'; // Semi-transparent for other days
        });

        // Prepare point backgrounds
        const pointBackgroundColors = labels.map((label, index) => {
            if (label === 'Today') {
                return '#ffd166'; // Yellow for today
            }
            return '#4361ee'; // Blue for other days
        });

        // Create the chart
        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales Amount',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#4361ee',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: pointBackgroundColors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: todayIndex >= 0 ? [4, 4, 4, 4, 4, 4, 6] : 4,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const dateLabel = context.label || '';

                                if (dateLabel === 'Today') {
                                    return `Today's Sales: ${formatCurrency(value)}`;
                                }
                                return `${dateLabel}: ${formatCurrency(value)}`;
                            },
                            title: function (context) {
                                const dateLabel = context[0].label;
                                if (dateLabel === 'Today') {
                                    return '📅 Today';
                                }
                                return dateLabel;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        cornerRadius: 5
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function (value) {
                                return formatCurrency(value);
                            },
                            font: {
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: `Sales Amount`,
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                }
            }
        });

        // Add today's indicator
        if (todayIndex >= 0) {
            this.addTodayIndicator(todayIndex, data[todayIndex]);
        }
    }

    addTodayIndicator(todayIndex, todayValue) {
        const chartContainer = document.getElementById('salesChartContainer');
        if (!chartContainer) return;

        // Remove existing indicator
        const existingIndicator = document.querySelector('.today-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create today's indicator
        const indicator = document.createElement('div');
        indicator.className = 'today-indicator';
        indicator.innerHTML = `
        <div class="today-indicator-content">
            <span class="today-badge">TODAY</span>
            <span class="today-amount">${formatCurrency(todayValue)}</span>
        </div>
    `;

        chartContainer.appendChild(indicator);
    }

    updateChartSummary(data) {
        if (!data || data.length === 0) return;

        const todayValue = data[data.length - 1] || 0;
        const yesterdayValue = data.length >= 2 ? data[data.length - 2] : 0;
        const weekTotal = data.reduce((sum, value) => sum + value, 0);
        const weekAverage = weekTotal / data.length;

        // Find best day
        const bestDayValue = Math.max(...data);
        const bestDayIndex = data.indexOf(bestDayValue);

        // Update chart info section
        const chartInfo = document.querySelector('.chart-info');
        if (chartInfo) {
            chartInfo.innerHTML = `
            <div class="chart-stats">
                <div class="chart-stat">
                    <span class="stat-label">Today</span>
                    <span class="stat-value today">${formatCurrency(todayValue)}</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Weekly Total</span>
                    <span class="stat-value total">${formatCurrency(weekTotal)}</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Daily Average</span>
                    <span class="stat-value average">${formatCurrency(weekAverage)}</span>
                </div>
                <div class="chart-stat">
                    <span class="stat-label">Best Day</span>
                    <span class="stat-value best">${formatCurrency(bestDayValue)}</span>
                </div>
            </div>
        `;
        }
    }

    createEmptyChartWithToday() {
        const labels = [];
        const data = [];
        const today = new Date();

        // Create labels for last 7 days including today
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);

            let label;
            if (i === 0) {
                label = 'Today';
            } else {
                label = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric'
                });
            }

            labels.push(label);
            data.push(0);
        }

        this.createSalesChartWithToday(labels, data);

        // Show no data message
        const chartContainer = document.getElementById('salesChartContainer');
        if (chartContainer) {
            const noDataMsg = document.createElement('div');
            noDataMsg.className = 'chart-no-data';
            noDataMsg.innerHTML = `
            <i class="fas fa-chart-line"></i>
            <p>No sales data available</p>
            <small>Start making sales to see the trend</small>
        `;
            chartContainer.appendChild(noDataMsg);
        }
    }

    async loadTopProducts() {
        try {
            // 1. Fetch Sales for the period to get their IDs
            const { data: sales, error: salesError } = await supabaseClient
                .from('sales')
                .select('id')
                .eq('shop_id', this.shopId)
                .gte('created_at', this.startDate)
                .lte('created_at', this.endDate);

            if (salesError) throw salesError;

            if (!sales || sales.length === 0) {
                this.showEmptyTopProducts();
                return;
            }

            const saleIds = sales.map(s => s.id);

            // 2. Fetch sale items for these sales
            const { data: saleItems, error: itemsError } = await supabaseClient
                .from('sale_items')
                .select('quantity, total_price, product_id')
                .in('sale_id', saleIds);

            if (itemsError) throw itemsError;

            if (!saleItems || saleItems.length === 0) {
                this.showEmptyTopProducts();
                return;
            }

            // Get product details separately
            const productIds = [...new Set(saleItems.map(item => item.product_id).filter(id => id))];

            let productsMap = {};
            if (productIds.length > 0) {
                const { data: products, error: productError } = await supabaseClient
                    .from('products')
                    .select('id, product_name, product_image')
                    .in('id', productIds)
                    .eq('shop_id', this.shopId);

                if (!productError && products) {
                    productsMap = products.reduce((map, product) => {
                        map[product.id] = {
                            name: product.product_name,
                            image: product.product_image
                        };
                        return map;
                    }, {});
                }
            }

            // Group by product
            const productStats = {};
            saleItems.forEach(item => {
                const productId = item.product_id;
                const productInfo = productsMap[productId] || { name: `Product ${productId}`, image: null };

                if (!productStats[productId]) {
                    productStats[productId] = {
                        id: productId,
                        name: productInfo.name,
                        image: productInfo.image,
                        quantity: 0,
                        totalRevenue: 0
                    };
                }
                productStats[productId].quantity += item.quantity || 0;
                productStats[productId].totalRevenue += parseFloat(item.total_price || 0);
            });

            // Sort and get top 5
            const sortedProducts = Object.values(productStats)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            this.renderTopProducts(sortedProducts);

        } catch (error) {

            this.showErrorTopProducts();
        }
    }

    renderTopProducts(products) {
        const topProductsList = document.getElementById('topProductsList');
        if (!topProductsList) return;

        if (products.length === 0) {
            this.showEmptyTopProducts();
            return;
        }

        topProductsList.innerHTML = products.map((product, index) => `
        <div class="product-item">
            <span class="rank">${index + 1}</span>
            <div class="product-details-wrapper" style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <img src="${product.image || this.shopLogo || 'https://via.placeholder.com/150?text=No+Image'}" 
                     alt="${product.name}" 
                     style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(0,0,0,0.05);">
                <div class="product-details" style="flex: 1;">
                    <span class="product-name" style="font-weight: 500; font-size: 0.95rem;">${product.name}</span>
                    <div class="product-stats">
                        <span class="sold-count">${product.quantity} sold</span>
                        <span class="revenue">${formatCurrency(product.totalRevenue)}</span>
                    </div>
                </div>
                ${this.currentUser.role === 'shop_admin' ? `
                <button class="btn btn-sm btn-outline-danger delete-top-product" data-id="${product.id}" data-name="${product.name}" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    }

    showEmptyTopProducts() {
        const topProductsList = document.getElementById('topProductsList');
        if (topProductsList) {
            topProductsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-2x"></i>
                <p>No sales data yet</p>
                <small>Make your first sale to see top products</small>
            </div>
        `;
        }
    }

    showErrorTopProducts() {
        const topProductsList = document.getElementById('topProductsList');
        if (topProductsList) {
            topProductsList.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <p>Error loading products</p>
                <small>Please try refreshing</small>
            </div>
        `;
        }
    }

    async loadRecentSales() {
        try {
            // First get recent sales
            const { data: sales, error } = await supabaseClient
                .from('sales')
                .select(`
                    id, 
                    invoice_number, 
                    total_amount, 
                    payment_method, 
                    created_at, 
                    sold_by,
                    buyer_name
                `)
                .eq('shop_id', this.shopId)
                .gte('created_at', this.startDate)
                .lte('created_at', this.endDate)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            const tableBody = document.getElementById('recentSales');

            if (!sales || sales.length === 0) {
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center py-3">No recent sales</td>
                        </tr>
                    `;
                }
                return;
            }

            // Get all sale items for these sales in one query
            const saleIds = sales.map(sale => sale.id);

            const { data: allSaleItems, error: itemsError } = await supabaseClient
                .from('sale_items')
                .select(`
                    sale_id,
                    quantity,
                    unit_price,
                    total_price,
                    product_id
                `)
                .in('sale_id', saleIds);

            if (itemsError) {

                throw itemsError;
            }

            // Get all product names in one query
            const productIds = [...new Set(allSaleItems
                .filter(item => item.product_id)
                .map(item => item.product_id))];

            let productsMap = {};
            if (productIds.length > 0) {
                const { data: products, error: productsError } = await supabaseClient
                    .from('products')
                    .select('id, product_name, product_image')
                    .in('id', productIds);

                if (!productsError && products) {
                    productsMap = products.reduce((map, product) => {
                        map[product.id] = {
                            name: product.product_name,
                            image: product.product_image
                        };
                        return map;
                    }, {});
                }
            }

            // Process sales data
            const salesWithItems = sales.map(sale => {
                // Find items for this sale
                const saleItems = allSaleItems.filter(item => item.sale_id === sale.id);

                if (saleItems.length === 0) {
                    return {
                        ...sale,
                        product_name: 'Custom Sale (No Items)',
                        quantity: 1, // Assume 1 unit for custom sales
                        unit_price: parseFloat(sale.total_amount) || 0
                    };
                }

                // Get first item for display
                const firstItem = saleItems[0];
                const productInfo = firstItem.product_id
                    ? (productsMap[firstItem.product_id] || { name: 'Product', image: null })
                    : { name: 'Product', image: null };

                const productName = productInfo.name;
                const productImage = productInfo.image;

                // If there are multiple items, show indication
                const displayName = saleItems.length > 1
                    ? `${productName} +${saleItems.length - 1} more`
                    : productName;

                // Calculate total quantity for the sale
                const totalQuantity = saleItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

                // Determine unit price to show
                let displayUnitPrice = 0;
                if (saleItems.length === 1) {
                    displayUnitPrice = firstItem.unit_price || 0;
                } else {
                    // For multiple items, showing one unit price is misleading. 
                    // We can show the average or 0, but 0 looks like an error.
                    // Let's show the total sale amount divided by quantity as an 'Avg' or just 0 if we hide it.
                    // Better approach: handle it in the HTML render.
                    displayUnitPrice = 0;
                }

                return {
                    ...sale,
                    product_name: displayName,
                    product_image: productImage,
                    quantity: totalQuantity, // Show total quantity of all items
                    unit_price: displayUnitPrice,
                    item_count: saleItems.length
                };
            });

            if (tableBody) {
                tableBody.innerHTML = salesWithItems.map(sale => `
                    <tr>
                        <td>
                            <div class="product-info" style="display: flex; align-items: center; gap: 12px;">
                                <img src="${sale.product_image || this.shopLogo || 'https://via.placeholder.com/150?text=No+Image'}" 
                                     alt="Product" 
                                     style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(0,0,0,0.05);">
                                <div>
                                    <strong>${sale.product_name}</strong>
                                    ${sale.buyer_name ? `<small class="text-muted d-block">Customer: ${sale.buyer_name}</small>` : ''}
                                    <small class="text-muted">Invoice: ${sale.invoice_number || 'N/A'}</small>
                                </div>
                            </div>
                        </td>
                        <td>${sale.quantity}</td>
                        <td>${sale.item_count > 1 ? '<span class="text-muted" title="Multiple items">-</span>' : formatCurrency(sale.unit_price)}</td>
                        <td><strong>${formatCurrency(sale.total_amount)}</strong></td>
                        <td>
                            <span class="badge ${sale.payment_method === 'cash' ? 'badge-success' :
                        sale.payment_method === 'credit' ? 'badge-warning' :
                            sale.payment_method === 'card' ? 'badge-info' :
                                sale.payment_method === 'online' ? 'badge-primary' : 'badge-secondary'}">
                                ${sale.payment_method || 'cash'}
                            </span>
                        </td>
                        <td>
                            <div class="date-info">
                                ${formatDate(sale.created_at)}
                                <small class="text-muted d-block">${formatTime(sale.created_at)}</small>
                            </div>
                        </td>
                        <td>
                            <div class="user-info">
                                <i class="fas fa-user"></i>
                                ${sale.sold_by || 'System'}
                            </div>
                        </td>
                        <td>
                            ${this.currentUser.role === 'shop_admin' ? `
                            <button class="btn btn-sm btn-danger delete-recent-sale" data-id="${sale.id}" data-invoice="${sale.invoice_number}" title="Delete Sale & Restore Stock">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : '-'}
                        </td>
                    </tr>
                `).join('');
            }

        } catch (error) {

            const tableBody = document.getElementById('recentSales');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-3 text-danger">
                            <i class="fas fa-exclamation-triangle"></i> Error loading sales data
                        </td>
                    </tr>
                `;
            }
        }
    }

    async loadLowStockAlerts() {
        try {
            const { data: products, error } = await supabaseClient
                .from('products')
                .select('product_name, sku, stock, product_image')
                .eq('shop_id', this.shopId)
                .lt('stock', 10)
                .order('stock', { ascending: true })
                .limit(10);

            if (error) throw error;

            const tableBody = document.getElementById('lowStockTable');

            if (!products || products.length === 0) {
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">All products have sufficient stock</td>
                        </tr>
                    `;
                }
                return;
            }

            if (tableBody) {
                tableBody.innerHTML = products.map(product => {
                    let status = 'warning';
                    let statusText = 'Low';

                    if (product.stock < 5) {
                        status = 'danger';
                        statusText = 'Very Low';
                    } else if (product.stock < 10) {
                        status = 'warning';
                        statusText = 'Low';
                    }

                    return `
                        <tr>
                            <td>
                                <div class="product-info-wrapper" style="display: flex; align-items: center; gap: 12px;">
                                    <img src="${product.product_image || this.shopLogo || 'https://via.placeholder.com/150?text=No+Image'}" 
                                         alt="${product.product_name}"
                                         style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(0,0,0,0.05);">
                                    <strong>${product.product_name}</strong>
                                </div>
                            </td>
                            <td>${product.sku || 'N/A'}</td>
                            <td>${product.stock}</td>
                            <td>10</td>
                            <td>
                                <span class="badge badge-${status}">
                                    ${statusText}
                                </span>
                            </td>
                            <td>
                                <a href="inventory.html" class="btn btn-sm btn-primary">
                                    <i class="fas fa-edit"></i> Restock
                                </a>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

        } catch (error) {

        }
    }

    async deleteTopProduct(productId, name) {
        if (!confirm(`Are you sure you want to PERMANENTLY delete product "${name}"? This will remove all inventory and history for this item.`)) {
            return;
        }

        showLoading(true);
        try {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', productId)
                .eq('shop_id', this.shopId);

            if (error) throw error;

            showNotification('Product deleted successfully', 'success');

            // Audit Log
            if (window.authManager) {
                await window.authManager.createAuditLog('delete', 'products', productId, null, { name: name });
            }

            // Refresh dashboard
            await this.loadDashboardData();

        } catch (error) {

            showNotification('Failed to delete product: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async deleteRecentSale(saleId, invoice) {
        if (!confirm(`Are you sure you want to delete sale #${invoice}? Associated stock will be restored to products.`)) {
            return;
        }

        showLoading(true);
        try {
            // 1. Get sale items to restore stock
            const { data: saleItems, error: itemsError } = await supabaseClient
                .from('sale_items')
                .select('product_id, quantity')
                .eq('sale_id', saleId);

            if (itemsError) throw itemsError;

            // 2. Restore stock for each item
            if (saleItems && saleItems.length > 0) {
                for (const item of saleItems) {
                    if (item.product_id) {
                        // Get current stock
                        const { data: product, error: pError } = await supabaseClient
                            .from('products')
                            .select('stock')
                            .eq('id', item.product_id)
                            .single();

                        if (!pError && product) {
                            const newStock = (parseFloat(product.stock) || 0) + (parseFloat(item.quantity) || 0);
                            await supabaseClient
                                .from('products')
                                .update({ stock: newStock })
                                .eq('id', item.product_id);
                        }
                    }
                }
            }

            // 3. Delete sale (cascading normally deletes sale_items, but we delete them explicitly just in case)
            const { error: deleteItemsError } = await supabaseClient
                .from('sale_items')
                .delete()
                .eq('sale_id', saleId);

            if (deleteItemsError) throw deleteItemsError;

            const { error: deleteSaleError } = await supabaseClient
                .from('sales')
                .delete()
                .eq('id', saleId)
                .eq('shop_id', this.shopId);

            if (deleteSaleError) throw deleteSaleError;

            showNotification('Sale deleted and stock restored', 'success');

            // Audit Log
            if (window.authManager) {
                await window.authManager.createAuditLog('delete', 'sales', saleId, null, { invoice: invoice });
            }

            // Refresh dashboard
            await this.loadDashboardData();

        } catch (error) {

            showNotification('Failed to delete sale: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async loadFinancialSummaries() {
        try {
            // 1. Fetch Latest Shop Asset (Base Balance)
            const { data: shop } = await supabaseClient.from('shops').select('current_balance').eq('id', this.shopId).single();
            const shopBaseAsset = parseFloat(shop?.current_balance || 0);

            // 2. Gather Components
            // We use the filtered totals calculated in other methods
            const filteredSales = this.totalVolumeSales || 0;
            const filteredExpenses = this.totalExpenses || 0;
            const filteredIncome = this.totalIncome || 0;
            const totalPending = this.totalOutstandingCredit || 0;
            const inventorySellValue = this.totalInventorySellValue || 0;

            // 3. Calculate Cash in Hand (Current Balance)
            // Formula: (Sales + Income + BaseAsset) - (Expenses + Pending)
            const cashInHand = (filteredSales + filteredIncome + shopBaseAsset) - (filteredExpenses + totalPending);

            if (document.getElementById('currentBalance')) document.getElementById('currentBalance').textContent = formatCurrency(cashInHand);


            // 4. Calculate Shop Valuation
            // Formula from Super Admin logic: (Sales + CashInHand + InventorySellValue) - Expenses
            const valuation = (filteredSales + cashInHand + inventorySellValue) - filteredExpenses;

            if (document.getElementById('shopValuation')) document.getElementById('shopValuation').textContent = formatCurrency(valuation);


            // 5. Today's Expenses (Handled by loadTotalExpenses to reflect filter)
            // if (document.getElementById('todayExpenses')) document.getElementById('todayExpenses').textContent = formatCurrency(this.totalExpenses);


            // 6. Shop sales+balance (Net Balance without Pending)
            // Formula: (Sales + Income + Asset) - (Exp)
            const salesPlusBalance = (filteredSales + filteredIncome + shopBaseAsset) - filteredExpenses;
            if (document.getElementById('netBalance')) document.getElementById('netBalance').textContent = formatCurrency(salesPlusBalance);


        } catch (err) {
            console.error("Error loading financial summaries:", err);
        }
    }

}

// Helper functions (add these if not in main.js)


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function formatTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return '';
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        if (show) {
            loadingElement.classList.add('active');
        } else {
            loadingElement.classList.remove('active');
        }
    }
}

function showNotification(message, type = 'info') {
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
        notificationElement.textContent = message;
        notificationElement.className = `notification ${type}`;
        notificationElement.style.display = 'block';

        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 3000);
    } else {
        alert(message); // Fallback
    }
}

// Initialize when on dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize when DOM is ready
        const dashboardManager = new ShopDashboardManager();
        dashboardManager.init();
        // Export for globally accessibility
        window.dashboardManager = dashboardManager;
    });
}
