// Sales Reporting - Complete Implementation
class SalesManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.sales = [];
        this.filteredSales = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.salesChart = null;
        this.paymentChart = null;
        this.selectedSales = new Set(); // Selection tracking
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

        // Update UI
        this.updateUI();

        // Load Shop Config (Currency, etc.)
        await initializeShopConfig(this.shopId);

        // Setup event listeners
        this.setupEventListeners();

        // Initialize date pickers
        this.initDatePickers();

        // Load sales data
        await this.loadSalesData();
    }

    updateUI() {
        // Update user info
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');

        if (userNameEl) {
            userNameEl.textContent = this.currentUser.full_name || this.currentUser.username;
        }

        if (userRoleEl) {
            userRoleEl.textContent = this.currentUser.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';
        }

        // Set default dates (Today)
        this.setTodayRange();
    }

    setTodayRange() {
        const today = new Date();
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);

        const fromDateInput = document.getElementById('fromDate');
        const toDateInput = document.getElementById('toDate');

        if (fromDateInput) fromDateInput.value = start.toISOString().split('T')[0];
        if (toDateInput) toDateInput.value = end.toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Export buttons
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        // Date filter buttons
        const applyDateFilter = document.getElementById('applyDateFilter');
        if (applyDateFilter) {
            applyDateFilter.addEventListener('click', () => {
                this.applyDateFilter();
            });
        }

        const resetDateFilter = document.getElementById('resetDateFilter');
        if (resetDateFilter) {
            resetDateFilter.addEventListener('click', () => {
                this.resetDateFilter();
            });
        }

        // Time Range Filter
        const timeRangeFilter = document.getElementById('timeRangeFilter');
        const customDateRange = document.getElementById('customDateRange');

        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === 'custom') {
                    if (customDateRange) customDateRange.style.display = 'flex';
                } else {
                    if (customDateRange) customDateRange.style.display = 'none';
                    this.applyQuickFilter(value);
                }
            });
        }

        // Chart period change
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateSalesChart(parseInt(e.target.value));
            });
        }

        // Search input
        const salesSearch = document.getElementById('salesSearch');
        if (salesSearch) {
            salesSearch.addEventListener('input', (e) => {
                this.filterSales(e.target.value);
            });
        }

        // Refresh button
        const refreshSales = document.getElementById('refreshSales');
        if (refreshSales) {
            refreshSales.addEventListener('click', () => {
                this.loadSalesData();
            });
        }

        // Pagination buttons
        const prevPage = document.getElementById('prevPage');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                this.previousPage();
            });
        }

        const nextPage = document.getElementById('nextPage');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                this.nextPage();
            });
        }

        // Print sale button
        const printSaleBtn = document.getElementById('printSaleBtn');
        if (printSaleBtn) {
            printSaleBtn.addEventListener('click', () => {
                this.printSaleDetails();
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

        // View sale details event delegation - FIXED
        const salesTable = document.getElementById('salesTable');
        if (salesTable) {
            salesTable.addEventListener('click', (e) => {
                const viewBtn = e.target.closest('.view-sale-btn');
                if (viewBtn) {
                    const saleId = viewBtn.dataset.id;
                    this.showSaleDetails(saleId);
                }
            });
        }


        // Bulk selection listeners
        const selectAllSales = document.getElementById('selectAllSales');
        if (selectAllSales) {
            selectAllSales.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Bulk action buttons
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.handleBulkDelete();
            });
        }

        const cancelSelection = document.getElementById('cancelSelection');
        if (cancelSelection) {
            cancelSelection.addEventListener('click', () => {
                this.clearSelection();
            });
        }

        // Row checkbox delegation
        if (salesTable) {
            salesTable.addEventListener('change', (e) => {
                if (e.target.classList.contains('sale-checkbox')) {
                    this.toggleSaleSelection(e.target.dataset.id, e.target.checked);
                }
            });
        }
    }

    initDatePickers() {
        // Initialize flatpickr if available
        if (typeof flatpickr !== 'undefined') {
            flatpickr('.datepicker', {
                dateFormat: 'Y-m-d',
                maxDate: 'today'
            });
        }
    }

    async loadSalesData() {
        showLoading(true);

        try {
            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;



            // First, get sales with basic info
            let query = supabaseClient
                .from('sales')
                .select('*')
                .eq('shop_id', this.shopId)
                .order('created_at', { ascending: false });

            // Apply date filter if dates are set
            if (fromDate && toDate) {
                query = query.gte('created_at', `${fromDate}T00:00:00`)
                    .lte('created_at', `${toDate}T23:59:59`);
            }

            const { data: sales, error } = await query;

            if (error) {

                throw error;
            }



            // If no sales found
            if (!sales || sales.length === 0) {
                this.sales = [];
                this.filteredSales = [];
                this.renderSalesTable();
                this.updateSalesStats();
                this.updateSalesChart(7);
                this.updatePaymentChart();
                showNotification('No sales found for selected period', 'info');
                return;
            }

            // Get sale items for each sale in batch
            const saleIds = sales.map(sale => sale.id);

            // Get all sale items in one query
            const { data: allSaleItems, error: itemsError } = await supabaseClient
                .from('sale_items')
                .select('*')
                .in('sale_id', saleIds);

            if (itemsError) {

            }

            // Fetch products manually (Step 2: Bypass potentially missing FK join issues)
            const productIds = [...new Set((allSaleItems || []).map(item => item.product_id).filter(id => id))];
            let productsMap = {};

            if (productIds.length > 0) {
                const { data: productsData, error: productsError } = await supabaseClient
                    .from('products')
                    .select('id, product_name, sku, product_image, cost_price')
                    .in('id', productIds);

                if (productsError) {

                }

                if (productsData) {
                    productsData.forEach(p => {
                        productsMap[p.id] = p;
                    });
                }
            }

            // Group sale items by sale_id and attach product info
            const saleItemsMap = {};
            if (allSaleItems) {
                allSaleItems.forEach(item => {
                    // Attach product manually
                    if (item.product_id) {
                        item.products = productsMap[item.product_id];
                    }

                    if (!saleItemsMap[item.sale_id]) {
                        saleItemsMap[item.sale_id] = [];
                    }
                    saleItemsMap[item.sale_id].push(item);
                });
            }

            // NOTE: sold_by column contains the username string, not the UUID.
            // So we don't need to fetch profiles to resolve names.
            // We can use sale.sold_by directly.

            // Process sales data
            const salesWithItems = sales.map(sale => {
                let saleItems = saleItemsMap[sale.id] || [];

                // Determine staff name
                // POS saves the username directly in sold_by column, so we use it directly.
                let staffName = sale.sold_by || 'Unknown';

                let totalQuantity = 0;
                let totalCost = 0;
                let productNames = '';

                if (saleItems.length === 0) {
                    // Handle sales with no items (Custom Sales)
                    totalQuantity = 1;
                    totalCost = 0;
                    productNames = 'Custom Sale (No Items)';
                } else {
                    // Calculate total quantity and total cost
                    totalQuantity = saleItems.reduce((sum, item) =>
                        sum + (parseInt(item.quantity) || 0), 0);

                    totalCost = saleItems.reduce((sum, item) => {
                        const cost = parseFloat(item.cost_price || item.products?.cost_price || 0);
                        return sum + (cost * (parseInt(item.quantity) || 0));
                    }, 0);

                    // Get product names for display
                    productNames = saleItems.slice(0, 2).map(item =>
                        item.products?.product_name || 'Product'
                    ).join(', ');
                }

                return {
                    ...sale,
                    sale_items: saleItems,
                    staff_name: staffName,
                    total_quantity: totalQuantity,
                    total_cost: totalCost,
                    product_names: productNames
                };
            });

            this.sales = salesWithItems;
            this.filteredSales = [...this.sales];



            // Update stats and charts
            this.updateSalesStats();
            this.updateSalesChart(7); // Default 7 days
            this.updatePaymentChart();
            this.renderSalesTable();
            this.updatePagination();

            showNotification(`Loaded ${this.sales.length} sales records`, 'success');

        } catch (error) {

            showNotification('Failed to load sales data. Please check console for details.', 'error');
        } finally {
            showLoading(false);
        }
    }

    updateSalesStats() {
        // Calculate stats for the filtered date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Today's sales
        const todaySales = this.sales.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= today;
        });

        const todayTotal = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
        const todayOrders = todaySales.length;

        // Yesterday's sales
        const yesterdaySales = this.sales.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= yesterday && saleDate < today;
        });

        const yesterdayTotal = yesterdaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
        const yesterdayOrders = yesterdaySales.length;

        // Credit sales
        const creditSales = this.sales.filter(sale => sale.payment_method === 'credit');
        const creditTotal = creditSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);

        // Calculate changes
        let salesChange = 0;
        if (yesterdayTotal > 0) {
            salesChange = ((todayTotal - yesterdayTotal) / yesterdayTotal * 100);
        } else if (todayTotal > 0) {
            salesChange = 100;
        }

        let ordersChange = 0;
        if (yesterdayOrders > 0) {
            ordersChange = ((todayOrders - yesterdayOrders) / yesterdayOrders * 100);
        } else if (todayOrders > 0) {
            ordersChange = 100;
        }

        // Average order value
        const avgOrder = this.sales.length > 0 ?
            this.sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) / this.sales.length : 0;

        // Update display
        const totalSalesAmountEl = document.getElementById('totalSalesAmount');
        const totalOrdersEl = document.getElementById('totalOrders');
        const creditSalesEl = document.getElementById('creditSales');
        const averageOrderEl = document.getElementById('averageOrder');

        if (totalSalesAmountEl) totalSalesAmountEl.textContent = formatCurrency(todayTotal);
        if (totalOrdersEl) totalOrdersEl.textContent = todayOrders;
        if (creditSalesEl) creditSalesEl.textContent = formatCurrency(creditTotal);
        if (averageOrderEl) averageOrderEl.textContent = formatCurrency(avgOrder);

        // Update changes
        const salesChangeEl = document.getElementById('salesChange');
        if (salesChangeEl) {
            salesChangeEl.textContent = `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`;
            salesChangeEl.className = `change ${salesChange >= 0 ? 'positive' : 'negative'}`;
        }

        const ordersChangeEl = document.getElementById('ordersChange');
        if (ordersChangeEl) {
            ordersChangeEl.textContent = `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`;
            ordersChangeEl.className = `change ${ordersChange >= 0 ? 'positive' : 'negative'}`;
        }
    }

    updateSalesChart(days = 7) {
        const ctx = document.getElementById('salesChart');
        if (!ctx) {

            return;
        }

        // Destroy existing chart
        if (this.salesChart) {
            this.salesChart.destroy();
        }

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create array of last 7 days INCLUDING TODAY
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dates.push(date);
        }



        // Initialize sales data array
        const salesData = new Array(days).fill(0);

        // Fill sales data
        this.sales.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            saleDate.setHours(0, 0, 0, 0);

            // Find which day index this sale belongs to
            for (let i = 0; i < dates.length; i++) {
                if (saleDate.getTime() === dates[i].getTime()) {
                    salesData[i] += parseFloat(sale.total_amount || 0);
                    break;
                }
            }
        });

        // Create labels with "Today" for the last date (today)
        const labels = dates.map((date, index) => {
            const isToday = date.toDateString() === today.toDateString();
            if (isToday) {
                return 'Today';
            } else {
                return date.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
            }
        });




        // Chart will fill the responsive .chart-wrapper container via CSS

        // Find today's index
        const todayIndex = labels.indexOf('Today');

        // Create gradient for chart
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(67, 97, 238, 0.3)');
        gradient.addColorStop(1, 'rgba(67, 97, 238, 0.05)');

        // Create chart with Today highlighted
        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales Amount',
                    data: salesData,
                    borderColor: '#4361ee',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: labels.map((label, index) =>
                        label === 'Today' ? '#ffd166' : '#4361ee'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: labels.map((label, index) =>
                        label === 'Today' ? 6 : 4
                    ),
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
                                return `Sales: ${formatCurrency(context.raw)}`;
                            },
                            title: function (context) {
                                const label = context[0].label;
                                if (label === 'Today') {
                                    return '📅 Today';
                                }
                                return label;
                            }
                        }
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
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Add Today's sales indicator
        if (todayIndex >= 0) {
            this.addTodaySalesIndicator(salesData[todayIndex]);
        }
    }

    addTodaySalesIndicator(todaySales) {
        // Find or create indicator container
        let indicatorContainer = document.querySelector('.today-indicator-container');
        if (!indicatorContainer) {
            indicatorContainer = document.createElement('div');
            indicatorContainer.className = 'today-indicator-container';
            const chartContainer = document.getElementById('salesChart').parentElement;
            chartContainer.appendChild(indicatorContainer);
        }

        indicatorContainer.innerHTML = `
            <div class="today-indicator">
                <span class="today-badge">TODAY'S SALES</span>
                <span class="today-amount">${formatCurrency(todaySales)}</span>
            </div>
        `;
    }

    updatePaymentChart() {
        const ctx = document.getElementById('paymentChart');
        if (!ctx) {

            return;
        }

        // Destroy existing chart
        if (this.paymentChart) {
            this.paymentChart.destroy();
        }

        // Calculate payment method distribution
        const paymentMethods = {};
        this.sales.forEach(sale => {
            const method = sale.payment_method || 'unknown';
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });

        // If no payment data, create empty chart
        if (Object.keys(paymentMethods).length === 0) {
            paymentMethods.cash = 0;
            paymentMethods.card = 0;
            paymentMethods.credit = 0;
        }

        // Prepare chart data
        const labels = Object.keys(paymentMethods);
        const data = Object.values(paymentMethods);
        const colors = ['#4cc9f0', '#f72585', '#f8961e', '#4895ef', '#3a0ca3'];

        // Chart will fill the responsive .chart-wrapper container via CSS

        // Create chart
        this.paymentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderSalesTable() {
        const tableBody = document.getElementById('salesTable');
        if (!tableBody) return;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSales = this.filteredSales.slice(startIndex, endIndex);

        if (pageSales.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-receipt fa-2x"></i>
                            <p>No sales found</p>
                            <small>Try adjusting your filters</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = pageSales.map(sale => {
            // Calculate product count and names
            const productCount = sale.sale_items?.length || 0;
            const isSelected = this.selectedSales.has(sale.id);

            return `
                <tr class="${isSelected ? 'selected-row' : ''}">
                    <td>
                        <input type="checkbox" class="sale-checkbox" data-id="${sale.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>
                        <strong>${sale.invoice_number || 'N/A'}</strong>
                    </td>
                    <td>${formatDate(sale.created_at)}</td>
                    <td>${sale.buyer_name || 'Walk-in Customer'}</td>
                    <td>
                        <div class="product-list">
                            ${sale.sale_items && sale.sale_items.length > 0 ?
                    sale.sale_items.slice(0, 3).map(item => `
                                    <div class="product-item-mini">
                                        <img src="${item.products?.product_image || 'https://via.placeholder.com/40?text=No+Img'}" 
                                             alt="${item.products?.product_name || 'Product'}" 
                                             class="product-thumb-sm">
                                        <div class="product-info-mini">
                                            <span class="product-name-mini" title="${item.products?.product_name || 'Product'}">
                                                ${item.products?.product_name || 'Product'}
                                            </span>
                                            <span class="product-meta-mini">
                                                SKU: ${item.products?.sku || 'N/A'} | Qty: ${item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                `).join('')
                    : `
                                <div class="custom-sale-placeholder">
                                    <i class="fas fa-tag"></i>
                                    <span>Custom Sale</span>
                                </div>
                              `
                }
                            ${productCount > 3 ? `<small style="color: #666; font-size: 0.8em; margin-left: 5px;">+${productCount - 3} more items</small>` : ''}
                        </div>
                    </td>
                    <td>${sale.total_quantity || 0}</td>
                    <td>${formatCurrency(sale.total_cost || 0)}</td>
                    <td>${formatCurrency(sale.total_amount)}</td>
                    <td>
                        <span class="payment-method-badge ${sale.payment_method}">
                            ${(sale.payment_method || 'N/A').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${sale.sale_status}">
                            ${sale.sale_status || 'completed'}
                        </span>
                    </td>
                    <td>${sale.staff_name || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-sale-btn" data-id="${sale.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
            prevBtn.classList.toggle('disabled', this.currentPage <= 1);
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
            nextBtn.classList.toggle('disabled', this.currentPage >= totalPages);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderSalesTable();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderSalesTable();
            this.updatePagination();
        }
    }

    applyDateFilter() {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!fromDate || !toDate) {
            showNotification('Please select both from and to dates', 'error');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            showNotification('From date cannot be after to date', 'error');
            return;
        }

        this.currentPage = 1;
        this.loadSalesData();
    }

    resetDateFilter() {
        // Reset to last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
        document.getElementById('toDate').value = today.toISOString().split('T')[0];

        this.currentPage = 1;
        this.loadSalesData();
    }

    applyQuickFilter(range) {
        const today = new Date();
        let fromDate = new Date();

        switch (range) {
            case 'today':
                // Already today
                fromDate = new Date(today);
                break;
            case 'yesterday':
                fromDate.setDate(today.getDate() - 1);
                today.setDate(today.getDate() - 1);
                break;
            case 'week':
                fromDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                fromDate.setMonth(today.getMonth() - 1);
                break;
            case 'year':
                fromDate.setFullYear(today.getFullYear() - 1);
                break;
        }

        fromDate.setHours(0, 0, 0, 0);
        today.setHours(23, 59, 59, 999);

        document.getElementById('fromDate').value = fromDate.toISOString().split('T')[0];
        document.getElementById('toDate').value = today.toISOString().split('T')[0];

        this.currentPage = 1;
        this.loadSalesData();
    }

    filterSales(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredSales = [...this.sales];
        } else {
            this.filteredSales = this.sales.filter(sale =>
                sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sale.buyer_name && sale.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (sale.buyer_phone && sale.buyer_phone.includes(searchTerm)) ||
                sale.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        this.currentPage = 1;
        this.renderSalesTable();
        this.updatePagination();
    }

    async showSaleDetails(saleId) {
        showLoading(true);


        try {
            // Get sale details

            const { data: sale, error } = await supabaseClient
                .from('sales')
                .select('*')
                .eq('id', saleId)
                .single();

            if (error) {

                throw error;
            }


            // Get sale items (Step 1: Raw items)

            const { data: saleItems, error: itemsError } = await supabaseClient
                .from('sale_items')
                .select('*')
                .eq('sale_id', saleId);

            if (itemsError) {

                throw itemsError;
            }


            // Step 2: Fetch associated products manually (since FK might be missing)
            const productIds = [...new Set(saleItems.map(item => item.product_id).filter(id => id))];
            let productsMap = {};

            if (productIds.length > 0) {
                const { data: productsData, error: productsError } = await supabaseClient
                    .from('products')
                    .select('id, product_name, sku, product_image, cost_price, selling_price, stock, updated_at')
                    .in('id', productIds);

                if (!productsError && productsData) {
                    productsData.forEach(p => {
                        productsMap[p.id] = p;
                    });
                }
            }

            // Get staff name
            // Determine staff name
            let staffName = sale.sold_by || 'Unknown';
            if (sale.sold_by && typeof sale.sold_by === 'string' && sale.sold_by.includes('-')) {
                // If it looks like a UUID, try to resolve it
                try {
                    const { data: staff } = await supabaseClient
                        .from('profiles')
                        .select('full_name, username')
                        .eq('id', sale.sold_by)
                        .single();
                    if (staff) staffName = staff.full_name || staff.username;
                } catch (e) { }
            } else if (sale.sold_by === this.currentUser?.id) {
                staffName = this.currentUser.full_name || this.currentUser.username || 'Me';
            }

            // Fetch Credit info if applicable
            let creditData = null;
            if (sale.payment_method === 'credit') {
                const { data: credit } = await supabaseClient
                    .from('credits')
                    .select('*')
                    .eq('sale_id', saleId)
                    .single();
                creditData = credit;
            }

            // Enrich items
            const enrichedItems = await Promise.all(saleItems.map(async (item, idx) => {
                const dbProduct = productsMap[item.product_id];
                const product = {
                    product_name: item.product_name || dbProduct?.product_name || 'Removed Product',
                    sku: item.sku || dbProduct?.sku || 'N/A',
                    product_image: item.product_image || dbProduct?.product_image || null,
                    cost_price: item.cost_price || dbProduct?.cost_price || 0,
                    updated_at: dbProduct?.updated_at || null
                };
                item.products = product;

                try {
                    // 1. Frequency (Only if product exists)
                    let frequency = 0;
                    if (item.product_id) {
                        const { count } = await supabaseClient
                            .from('sale_items')
                            .select('id', { count: 'exact', head: true })
                            .eq('product_id', item.product_id);
                        frequency = count || 0;
                    }

                    // 2. Days from Last Update to Sell
                    let daysToSell = 'N/A';
                    if (product.updated_at) {
                        const productDate = new Date(product.updated_at);
                        const saleDate = new Date(sale.created_at);
                        const diffTime = Math.abs(saleDate - productDate);
                        daysToSell = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + ' days';
                    }

                    // 3. Profit Calculation - USE ITEM COST IF AVAILABLE (Price at time of sale)
                    const costPricePerUnit = parseFloat(item.cost_price || product.cost_price || 0);
                    const sellPricePerUnit = parseFloat(item.unit_price || 0);
                    const profitPerUnit = sellPricePerUnit - costPricePerUnit;
                    const totalProfit = profitPerUnit * item.quantity;
                    const profitPercent = costPricePerUnit > 0 ? ((profitPerUnit / costPricePerUnit) * 100).toFixed(1) : '100.0';

                    return {
                        ...item,
                        stats: {
                            frequency: frequency,
                            daysToSell: daysToSell,
                            profit: totalProfit,
                            profitPercent: profitPercent,
                            costPrice: costPricePerUnit
                        }
                    };
                } catch (calcError) {
                    return { ...item, stats: { frequency: 0, daysToSell: 'Error', profit: 0, profitPercent: 0, costPrice: 0 } };
                }
            }));

            // Update modal title
            const invEl = document.getElementById('invoiceNumber');
            if (invEl) invEl.textContent = sale.invoice_number || 'N/A';

            // Build rich HTML
            const itemsHtml = enrichedItems.map((item, index) => {
                const p = item.products || {};
                const stats = item.stats || { frequency: 0, daysToSell: 0, profit: 0, profitPercent: 0, costPrice: 0 };
                const isProfit = stats.profit >= 0;

                return `
            <div class="sale-item-modern mb-3">
                <div class="d-flex align-items-center gap-3 p-3 bg-white rounded-3 border shadow-sm">
                    <div class="product-img-wrapper" style="width: 70px; height: 70px; flex-shrink: 0; background: #f8f9fa; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        ${p.product_image ?
                        `<img src="${p.product_image}" alt="${p.product_name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<i class="fas fa-box text-muted fa-lg"></i>`
                    }
                    </div>
                    
                    <div class="flex-grow-1" style="min-width: 0;">
                        <div class="d-flex justify-content-between align-items-start mb-2 mob-column">
                            <div style="min-width: 0; flex: 1;">
                                <h6 class="mb-0 fw-bold text-dark text-truncate">${p.product_name}</h6>
                                <span class="text-muted extra-small d-block">SKU: ${p.sku} • Qty: <strong>x${item.quantity}</strong></span>
                            </div>
                            <div class="text-md-end item-badges">
                                <div class="profit-badge ${isProfit ? 'profit-up' : 'profit-down'}">
                                    <i class="fas fa-trending-${isProfit ? 'up' : 'down'} me-1"></i>
                                    ${isProfit ? '+' : ''}${formatCurrency(stats.profit)}
                                </div>
                                <div class="extra-small text-muted mt-1 margin-label">${stats.profitPercent}% margin</div>
                            </div>
                        </div>
                        
                        <hr class="my-2 opacity-10">
                        
                        <div class="d-flex justify-content-between align-items-center mob-column gap-2">
                            <div class="price-steps">
                                <span class="step-label">Buy:</span>
                                <span class="step-value">${formatCurrency(stats.costPrice)}</span>
                                <span class="step-separator">→</span>
                                <span class="step-label">Sell:</span>
                                <span class="step-value fw-bold text-primary">${formatCurrency(item.unit_price)}</span>
                            </div>
                            <div class="item-total-price fw-bold text-dark">
                                ${formatCurrency(item.total_price)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            }).join('');

            const totalItems = (saleItems || []).reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
            const totalProfit = enrichedItems.reduce((sum, item) => sum + (item.stats?.profit || 0), 0);

            const contentHtml = `
            <div class="sale-details-modern">
                <!-- Quick Summary Header (3 Cards) -->
                <div class="row g-3 mb-4">
                    <div class="col-4">
                        <div class="info-card-modern p-3 rounded-3 text-center border bg-light h-100 shadow-sm">
                            <i class="fas fa-calendar-day text-success mb-2"></i>
                            <div class="text-muted extra-small text-uppercase fw-bold">Date</div>
                            <div class="fw-bold fs-7">${formatDate(sale.created_at).split(',')[0]}</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="info-card-modern p-3 rounded-3 text-center border bg-light h-100 shadow-sm">
                            <i class="fas fa-credit-card text-warning mb-2"></i>
                            <div class="text-muted extra-small text-uppercase fw-bold">Payment</div>
                            <div class="fw-bold text-uppercase fs-7">${sale.payment_method || 'Cash'}</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="info-card-modern p-3 rounded-3 text-center border bg-light h-100 shadow-sm">
                            <i class="fas fa-user-tie text-info mb-2"></i>
                            <div class="text-muted extra-small text-uppercase fw-bold">Staff</div>
                            <div class="fw-bold fs-7">${staffName}</div>
                        </div>
                    </div>
                </div>

                <!-- Customer & Credit Info -->
                <div class="customer-info-modern p-3 bg-white rounded-3 border mb-4 shadow-sm">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div class="d-flex align-items-center">
                            <div class="customer-avatar me-3">
                                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 45px; height: 45px; font-size: 1.2rem; box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold text-dark">${sale.buyer_name || 'Walk-in Customer'}</h6>
                                <p class="text-muted extra-small mb-0">${sale.buyer_phone ? `<i class="fas fa-phone-alt me-1"></i> ${sale.buyer_phone}` : 'No contact info provided'}</p>
                            </div>
                        </div>
                        <div class="text-md-end">
                            ${creditData ? `
                                <div class="credit-split-card shadow-sm" style="min-width: 200px;">
                                    <div class="credit-side paid">
                                        <div class="credit-label-sm">Paid</div>
                                        <div class="credit-value-lg text-success-dark">${formatCurrency(creditData.amount_paid)}</div>
                                    </div>
                                    <div class="credit-side pending">
                                        <div class="credit-label-sm">Pending</div>
                                        <div class="credit-value-lg text-danger-dark">${formatCurrency(creditData.pending_amount)}</div>
                                    </div>
                                </div>
                            ` : `
                                <div class="p-2 px-3 rounded-pill bg-success-light border d-inline-flex align-items-center">
                                    <i class="fas fa-check-circle me-2"></i>
                                    <span class="extra-small fw-bold text-uppercase ls-1">Fully Paid</span>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <div class="items-section">
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h6 class="fw-bold mb-0 text-uppercase small ls-1 text-primary">
                            <i class="fas fa-shopping-basket me-2"></i>Items Purchased (${totalItems})
                        </h6>
                        <div class="badge bg-light text-muted border py-1 px-2" style="font-size: 0.65rem;">Sold by: <strong>${staffName}</strong></div>
                    </div>
                    <div class="items-list-modern">
                        ${itemsHtml}
                    </div>
                </div>
                
                <!-- Final Totals -->
                <div class="totals-section-modern p-4 rounded-3 mt-4" style="background: #f8f9fa; border: 1px dashed #dee2e6;">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted small">Net Profit for this sale</span>
                        <span class="fw-bold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}">
                            ${formatCurrency(totalProfit)}
                        </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-3 mt-2 border-top border-2">
                        <span class="h5 fw-bold mb-0 text-dark">Total Bill</span>
                        <span class="h5 fw-bold mb-1 text-primary" style="font-size: 1.5rem;">${formatCurrency(sale.total_amount)}</span>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('saleDetailsContent').innerHTML = contentHtml;

            // Store sale data for printing
            const printBtn = document.getElementById('printSaleBtn');
            if (printBtn) printBtn.dataset.saleId = saleId;

            // Show modal
            // Check if using Bootstrap Modal or custom CSS modal
            const modalEl = document.getElementById('saleDetailsModal');
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const saleDetailsModal = new bootstrap.Modal(modalEl);
                saleDetailsModal.show();
            } else {
                modalEl.classList.add('active');
            }

            // Show modal
            document.getElementById('saleDetailsModal').classList.add('active');

        } catch (error) {

            showNotification('Failed to load details: ' + (error.message || error), 'error');
        } finally {
            showLoading(false);
        }
    }

    printSaleDetails() {
        const saleId = document.getElementById('printSaleBtn').dataset.saleId;
        if (!saleId) {
            showNotification('No sale selected for printing', 'error');
            return;
        }

        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        const shopName = document.getElementById('shopNameHeader')?.textContent || 'Shop Management System';
        const saleItems = sale.sale_items || [];

        const itemsHtml = saleItems.map(item => `
            <tr>
                <td style="padding: 5px 0;">${item.product_name || 'Product'}<br><small style="color: #666;">${item.quantity} x ${formatCurrency(item.unit_price)}</small></td>
                <td style="text-align: right; vertical-align: top; padding: 5px 0;">${formatCurrency(item.total_price)}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${sale.invoice_number}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
                    body { font-family: 'Courier Prime', monospace; width: 80mm; margin: 0 auto; padding: 10px; color: #000; font-size: 12px; }
                    .text-center { text-align: center; }
                    .header { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .shop-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; border-bottom: 1px dashed #000; }
                    .totals { margin-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; }
                    .footer { margin-top: 30px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                    @media print { body { width: 100%; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header text-center">
                    <div class="shop-name">${shopName}</div>
                    <div>INVOICE / RECEIPT</div>
                </div>

                <div class="info-section">
                    <div class="info-row"><span>Date:</span> <span>${formatDate(sale.created_at)}</span></div>
                    <div class="info-row"><span>Invoice:</span> <span>${sale.invoice_number}</span></div>
                    <div class="info-row"><span>Payment:</span> <span style="text-transform: uppercase;">${sale.payment_method}</span></div>
                    ${sale.buyer_name ? `<div class="info-row"><span>Customer:</span> <span>${sale.buyer_name}</span></div>` : ''}
                </div>

                <table>
                    <thead>
                        <tr style="border-bottom: 1px dashed #000;">
                            <th style="text-align: left; padding-bottom: 5px;">Item</th>
                            <th style="text-align: right; padding-bottom: 5px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="info-row"><span>Subtotal:</span> <span>${formatCurrency(parseFloat(sale.total_amount) + parseFloat(sale.discount_amount || 0))}</span></div>
                    <div class="info-row"><span>Discount:</span> <span>-${formatCurrency(sale.discount_amount || 0)}</span></div>
                    <div class="total-row"><span>TOTAL:</span> <span>${formatCurrency(sale.total_amount)}</span></div>
                </div>

                <div class="footer text-center">
                    <p>Thank you for shopping with us!</p>
                    <p>Invoice generated by Shop Management System</p>
                    <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Print Now</button>
                    <button class="no-print" onclick="window.close()" style="margin-top: 10px; padding: 8px 15px; background: #666; color: #fff; border: none; cursor: pointer; border-radius: 4px; margin-left:10px;">Close</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    async exportToExcel() {
        showLoading(true);

        try {
            if (this.filteredSales.length === 0) {
                showNotification('No data to export', 'warning');
                return;
            }

            // Prepare CSV content
            let csv = 'Invoice Number,Date,Customer,Phone,Products,Quantity,Buy Price,Total Amount,Payment Method,Status,Sold By\n';

            this.filteredSales.forEach(sale => {
                const products = sale.sale_items?.map(item =>
                    `${item.products?.product_name || 'Product'} x${item.quantity}`
                ).join('; ') || 'N/A';

                const totalItems = sale.sale_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

                csv += `"${sale.invoice_number || 'N/A'}","${formatDate(sale.created_at)}","${sale.buyer_name || 'Walk-in'}","${sale.buyer_phone || 'N/A'}","${products}",${totalItems},${sale.total_cost || 0},${sale.total_amount || 0},"${sale.payment_method || 'N/A'}","${sale.sale_status || 'completed'}","${sale.staff_name || 'N/A'}"\n`;
            });

            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('Sales report exported successfully as CSV', 'success');

        } catch (error) {

            showNotification('Failed to export sales report', 'error');
        } finally {
            showLoading(false);
        }
    }

    async exportToPDF() {
        showNotification('PDF export requires jsPDF library to be installed', 'info');
        // For PDF export, you would need to install and use jsPDF library
        // Example: https://github.com/parallax/jsPDF
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // --- Bulk Action Methods ---

    toggleSaleSelection(saleId, isSelected) {
        if (isSelected) {
            this.selectedSales.add(saleId);
        } else {
            this.selectedSales.delete(saleId);
            const selectAllCheck = document.getElementById('selectAllSales');
            if (selectAllCheck) selectAllCheck.checked = false;
        }
        this.updateBulkActionBar();
        this.renderSalesTable();
    }

    toggleSelectAll(isSelected) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSales = this.filteredSales.slice(startIndex, endIndex);

        pageSales.forEach(sale => {
            if (isSelected) {
                this.selectedSales.add(sale.id);
            } else {
                this.selectedSales.delete(sale.id);
            }
        });

        this.updateBulkActionBar();
        this.renderSalesTable();
    }

    updateBulkActionBar() {
        const bar = document.getElementById('bulkActionBar');
        const count = document.getElementById('selectedCount');

        if (this.selectedSales.size > 0) {
            bar.classList.add('active');
            count.textContent = this.selectedSales.size;
        } else {
            bar.classList.remove('active');
            count.textContent = '0';
        }
    }

    clearSelection() {
        this.selectedSales.clear();
        const selectAllCheck = document.getElementById('selectAllSales');
        if (selectAllCheck) selectAllCheck.checked = false;
        this.updateBulkActionBar();
        this.renderSalesTable();
    }

    async handleBulkDelete() {
        const count = this.selectedSales.size;
        if (count === 0) return;

        if (!confirm(`Are you sure you want to delete ${count} selected sales? This will restore stock to the products involved. This action is permanent.`)) {
            return;
        }

        showLoading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const saleIds = Array.from(this.selectedSales);

            for (const saleId of saleIds) {
                try {
                    await this.deleteSaleRecord(saleId);
                    successCount++;
                } catch (err) {

                    failCount++;
                }
            }

            if (successCount > 0) {
                showNotification(`Successfully deleted ${successCount} sales and restored stock.`, 'success');
            }
            if (failCount > 0) {
                showNotification(`Failed to delete ${failCount} sales.`, 'error');
            }

            this.selectedSales.clear();
            await this.loadSalesData();

        } catch (error) {

            showNotification('An error occurred during bulk deletion.', 'error');
        } finally {
            showLoading(false);
            this.updateBulkActionBar();
        }
    }

    async deleteSaleRecord(saleId) {
        const { data: items, error: itemsError } = await supabaseClient
            .from('sale_items')
            .select('product_id, quantity')
            .eq('sale_id', saleId);

        if (itemsError) throw itemsError;

        if (items && items.length > 0) {
            for (const item of items) {
                if (item.product_id) {
                    const { data: product, error: pError } = await supabaseClient
                        .from('products')
                        .select('stock')
                        .eq('id', item.product_id)
                        .single();

                    if (!pError && product) {
                        const currentStock = parseFloat(product.stock) || 0;
                        const soldQty = parseFloat(item.quantity) || 0;
                        const newStock = currentStock + soldQty;

                        await supabaseClient
                            .from('products')
                            .update({ stock: newStock })
                            .eq('id', item.product_id);
                    }
                }
            }
        }

        await supabaseClient
            .from('sale_items')
            .delete()
            .eq('sale_id', saleId);

        const { error: saleError } = await supabaseClient
            .from('sales')
            .delete()
            .eq('id', saleId)
            .eq('shop_id', this.shopId);

        if (saleError) throw saleError;

        if (window.authManager) {
            await window.authManager.createAuditLog('delete', 'sales', saleId, null, { sale_id: saleId, action: 'bulk_delete' });
        }
    }
}

// Initialize on sales page
if (window.location.pathname.includes('sales.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new SalesManager();
    });
}
