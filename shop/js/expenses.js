// Expenses Management - Complete Implementation
class ExpensesManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.expenses = [];
        this.filteredExpenses = [];
        this.expensesChart = null;
        this.startDate = null;
        this.endDate = null;
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

        // Load expenses data
        await this.loadExpenses();
    }

    updateUI() {
        // Update user info
        document.getElementById('userName').textContent = this.currentUser.full_name || this.currentUser.username;
        document.getElementById('userRole').textContent = this.currentUser.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';


        // Set default dates (Today)
        this.setTodayRange();
    }

    setTodayRange() {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        this.startDate = start.toISOString();
        this.endDate = end.toISOString();

        const fromInput = document.getElementById('expenseFromDate');
        const toInput = document.getElementById('expenseToDate');
        if (fromInput) fromInput.value = start.toISOString().split('T')[0];
        if (toInput) toInput.value = end.toISOString().split('T')[0];

        // Set default date for new expense modal
        const expenseDateInput = document.getElementById('expenseDate');
        if (expenseDateInput) expenseDateInput.value = now.toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Add expense button
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.showAddExpenseModal();
            });
        }

        // Export button
        const exportExpensesBtn = document.getElementById('exportExpensesBtn');
        if (exportExpensesBtn) {
            exportExpensesBtn.addEventListener('click', () => {
                this.exportExpenses();
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
                    this.applyPresetFilter(value);
                }
            });
        }

        const applyExpenseFilter = document.getElementById('applyExpenseFilter');
        if (applyExpenseFilter) {
            applyExpenseFilter.addEventListener('click', () => {
                this.applyCustomFilter();
            });
        }

        // Category filter
        const expenseCategory = document.getElementById('expenseCategory');
        if (expenseCategory) {
            expenseCategory.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Save expense button
        const saveExpenseBtn = document.getElementById('saveExpenseBtn');
        if (saveExpenseBtn) {
            saveExpenseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveExpense();
            });
        }

        // Delete expense button
        const deleteExpenseBtn = document.getElementById('deleteExpenseBtn');
        if (deleteExpenseBtn) {
            deleteExpenseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteExpense();
            });
        }

        // Expense type change
        const expenseType = document.getElementById('expenseType');
        if (expenseType) {
            expenseType.addEventListener('change', (e) => {
                this.updateExpenseType(e.target.value);
            });
        }

        // Recurring expense checkbox
        const recurringExpense = document.getElementById('recurringExpense');
        if (recurringExpense) {
            recurringExpense.addEventListener('change', (e) => {
                this.toggleRecurringOptions(e.target.checked);
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

        // Edit expense event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-expense-btn')) {
                const btn = e.target.closest('.edit-expense-btn');
                const expenseId = btn.dataset.id;
                this.showEditExpenseModal(expenseId);
            }
        });

        // Delete expense event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-expense-btn')) {
                const btn = e.target.closest('.delete-expense-btn');
                const expenseId = btn.dataset.id;
                if (confirm('Are you sure you want to delete this expense?')) {
                    this.deleteExpenseById(expenseId);
                }
            }
        });
    }

    async loadExpenses() {
        showLoading(true);

        try {
            const fromDate = document.getElementById('expenseFromDate').value;
            const toDate = document.getElementById('expenseToDate').value;

            // Build query
            let query = supabaseClient
                .from('expenses')
                .select(`
                    *,
                    profiles!expenses_created_by_fkey (full_name)
                `)
                .eq('shop_id', this.shopId)
                .order('expense_date', { ascending: false });

            // Apply date filter
            query = query.gte('expense_date', this.startDate.split('T')[0])
                .lte('expense_date', this.endDate.split('T')[0]);

            const { data: expenses, error } = await query;

            if (error) throw error;

            this.expenses = expenses || [];
            this.filteredExpenses = [...this.expenses];

            // Update stats and charts
            this.updateExpenseStats();
            this.updateExpensesChart();
            this.renderExpensesTable();

        } catch (error) {

            showNotification('Failed to load expenses', 'error');
        } finally {
            showLoading(false);
        }
    }

    updateExpenseStats() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];




        // Calculate stats for filtered date range
        let totalExpenses = 0;
        let totalIncome = 0;
        let todayExpenses = 0;
        let todayIncome = 0;

        this.expenses.forEach(expense => {
            const amount = parseFloat(expense.amount || 0);
            const expenseDate = expense.expense_date ?
                new Date(expense.expense_date).toISOString().split('T')[0] : null;



            if (expense.expense_type === 'expense') {
                totalExpenses += amount;

                // Check if it's today's expense
                if (expenseDate === todayStr) {
                    todayExpenses += amount;

                }
            } else if (expense.expense_type === 'income') {
                totalIncome += amount;

                // Check if it's today's income
                if (expenseDate === todayStr) {
                    todayIncome += amount;
                }
            }
        });

        const netBalance = totalIncome - totalExpenses;

        console.log('Calculated stats:', {
            totalExpenses,
            totalIncome,
            todayExpenses,
            todayIncome,
            netBalance
        });

        // Update display
        const todayExpensesEl = document.getElementById('todayExpenses');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const totalIncomeEl = document.getElementById('totalIncome');
        const netBalanceEl = document.getElementById('netBalance');

        if (todayExpensesEl) {
            todayExpensesEl.textContent = formatCurrency(todayExpenses);

        }

        if (totalExpensesEl) {
            totalExpensesEl.textContent = formatCurrency(totalExpenses);
        }

        if (totalIncomeEl) {
            totalIncomeEl.textContent = formatCurrency(totalIncome);
        }

        if (netBalanceEl) {
            netBalanceEl.textContent = formatCurrency(netBalance);

            // Update net balance color
            if (netBalance < 0) {
                netBalanceEl.style.color = 'var(--danger)';
                netBalanceEl.classList.add('negative');
                netBalanceEl.classList.remove('positive');
            } else if (netBalance > 0) {
                netBalanceEl.style.color = 'var(--success)';
                netBalanceEl.classList.add('positive');
                netBalanceEl.classList.remove('negative');
            } else {
                netBalanceEl.style.color = 'var(--gray)';
                netBalanceEl.classList.remove('positive', 'negative');
            }
        }
    }

    updateExpensesChart() {
        const ctx = document.getElementById('expensesChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.expensesChart) {
            this.expensesChart.destroy();
        }

        // Calculate expenses by category
        const expensesByCategory = {};

        this.expenses.forEach(expense => {
            if (expense.expense_type === 'expense') {
                const category = expense.category || 'Other';
                expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(expense.amount || 0);
            }
        });

        // Prepare chart data
        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);

        // Create chart colors
        const colors = [
            '#f72585', '#7209b7', '#3a0ca3', '#4361ee',
            '#4cc9f0', '#f8961e', '#4ade80', '#22d3ee'
        ];

        this.expensesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${formatCurrency(context.raw)}`;
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
                    }
                }
            }
        });
    }

    renderExpensesTable() {
        const tableBody = document.getElementById('expensesTable');
        if (!tableBody) return;

        if (this.filteredExpenses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-money-bill-wave fa-2x"></i>
                            <p>No expenses found</p>
                            <small>Add expenses or adjust filters</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredExpenses.map(expense => {
            const isIncome = expense.expense_type === 'income';
            const amountClass = isIncome ? 'text-success' : 'text-danger';
            const typeBadge = isIncome ? 'success' : 'danger';
            const typeText = isIncome ? 'Income' : 'Expense';

            const date = expense.expense_date ?
                new Date(expense.expense_date).toLocaleDateString() : 'N/A';

            return `
                <tr>
                    <td>${date}</td>
                    <td>
                        <span class="category-badge ${expense.category?.toLowerCase().replace(' ', '-') || 'other'}">
                            ${expense.category || 'Uncategorized'}
                        </span>
                    </td>
                    <td>
                        <div class="expense-description">
                            ${expense.description}
                            ${expense.receipt_number ? `<small>Receipt: ${expense.receipt_number}</small>` : ''}
                        </div>
                    </td>
                    <td class="${amountClass}">
                        <strong>${isIncome ? '+' : '-'}${formatCurrency(expense.amount)}</strong>
                    </td>
                    <td>
                        <span class="type-badge ${typeBadge}">
                            ${typeText}
                        </span>
                    </td>
                    <td>${expense.profiles?.full_name || 'N/A'}</td>
                    <td>
                        ${expense.receipt_number ? `
                        <a href="#" class="receipt-link" data-receipt="${expense.receipt_number}">
                            <i class="fas fa-receipt"></i>
                        </a>
                        ` : 'N/A'}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary edit-expense-btn" data-id="${expense.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${this.currentUser.role === 'shop_admin' ? `
                            <button class="btn btn-sm btn-danger delete-expense-btn" data-id="${expense.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
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
                start = new Date(now);
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                return;
        }

        this.startDate = start.toISOString();
        this.endDate = end.toISOString();
        this.updatePeriodLabels(preset);
        this.loadExpenses();
    }

    applyCustomFilter() {
        const fromDate = document.getElementById('expenseFromDate').value;
        const toDate = document.getElementById('expenseToDate').value;

        if (!fromDate || !toDate) {
            showNotification('Please select both from and to dates', 'error');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            showNotification('From date cannot be after to date', 'error');
            return;
        }

        this.startDate = new Date(fromDate).toISOString();
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        this.endDate = end.toISOString();

        this.updatePeriodLabels('custom');
        this.loadExpenses();
    }

    updatePeriodLabels(preset) {
        const labels = {
            today: 'Today',
            yesterday: 'Yesterday',
            week: 'This Week',
            month: 'This Month',
            year: 'This Year',
            custom: 'Selected Period'
        };
        const label = labels[preset] || 'Period';

        document.querySelectorAll('.period').forEach(el => {
            el.textContent = label;
        });
    }

    filterByCategory(category) {
        if (!category) {
            this.filteredExpenses = [...this.expenses];
        } else {
            this.filteredExpenses = this.expenses.filter(expense =>
                expense.category === category
            );
        }

        this.renderExpensesTable();
    }

    showAddExpenseModal() {
        // Reset form
        document.getElementById('expenseModalTitle').textContent = 'Add Expense/Income';
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseId').value = '';
        document.getElementById('deleteExpenseBtn').style.display = 'none';

        // Set default values
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('expenseType').value = 'expense';
        document.getElementById('expenseCategorySelect').value = '';
        document.getElementById('recurringExpense').checked = false;

        // Hide recurring options
        this.toggleRecurringOptions(false);

        // Update expense type display
        this.updateExpenseType('expense');

        // Show modal
        document.getElementById('expenseModal').classList.add('active');
    }

    async showEditExpenseModal(expenseId) {
        showLoading(true);

        try {
            const { data: expense, error } = await supabaseClient
                .from('expenses')
                .select('*')
                .eq('id', expenseId)
                .single();

            if (error) throw error;

            // Populate form
            document.getElementById('expenseModalTitle').textContent = 'Edit Expense/Income';
            document.getElementById('expenseId').value = expense.id;
            document.getElementById('expenseDate').value = expense.expense_date || '';
            document.getElementById('expenseType').value = expense.expense_type || 'expense';
            document.getElementById('expenseCategorySelect').value = expense.category || '';
            document.getElementById('expenseAmount').value = expense.amount || '';
            document.getElementById('expenseDescription').value = expense.description || '';
            document.getElementById('expenseReceipt').value = expense.receipt_number || '';
            document.getElementById('recurringExpense').checked = expense.is_recurring || false;

            if (expense.is_recurring) {
                document.getElementById('recurringFrequency').value = expense.recurring_frequency || 'monthly';
                document.getElementById('recurringEndDate').value = expense.recurring_end_date || '';
                this.toggleRecurringOptions(true);
            }

            // Update expense type display
            this.updateExpenseType(expense.expense_type);

            // Show delete button for admin
            document.getElementById('deleteExpenseBtn').style.display =
                this.currentUser.role === 'shop_admin' ? 'block' : 'none';

            // Show modal
            document.getElementById('expenseModal').classList.add('active');

        } catch (error) {

            showNotification('Failed to load expense details', 'error');
        } finally {
            showLoading(false);
        }
    }

    updateExpenseType(expenseType) {
        const amountInput = document.getElementById('expenseAmount');
        const typeSelect = document.getElementById('expenseType');

        if (expenseType === 'income') {
            amountInput.min = '0';
            amountInput.placeholder = '0.00';
            typeSelect.classList.add('border-success');
            typeSelect.classList.remove('border-danger');
        } else {
            amountInput.min = '0';
            amountInput.placeholder = '0.00';
            typeSelect.classList.add('border-danger');
            typeSelect.classList.remove('border-success');
        }
    }

    toggleRecurringOptions(show) {
        const recurringOptions = document.getElementById('recurringOptions');
        if (recurringOptions) {
            recurringOptions.style.display = show ? 'block' : 'none';
        }
    }

    async saveExpense() {
        // Get form values
        const expenseId = document.getElementById('expenseId').value;
        const expenseDate = document.getElementById('expenseDate').value;
        const expenseType = document.getElementById('expenseType').value;
        const category = document.getElementById('expenseCategorySelect').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
        const description = document.getElementById('expenseDescription').value.trim();
        const receiptNumber = document.getElementById('expenseReceipt').value.trim();
        const isRecurring = document.getElementById('recurringExpense').checked;
        const recurringFrequency = document.getElementById('recurringFrequency')?.value || null;
        const recurringEndDate = document.getElementById('recurringEndDate')?.value || null;

        // Validate
        if (!expenseDate || !expenseType || !category || !amount || !description) {
            showNotification('All fields except receipt are required', 'error');
            return;
        }

        if (amount <= 0) {
            showNotification('Amount must be greater than 0', 'error');
            return;
        }

        showLoading(true);

        try {
            const expenseData = {
                shop_id: this.shopId,
                expense_date: expenseDate,
                expense_type: expenseType,
                category: category,
                amount: amount,
                description: description,
                receipt_number: receiptNumber || null,
                is_recurring: isRecurring,
                recurring_frequency: isRecurring ? recurringFrequency : null,
                recurring_end_date: isRecurring ? recurringEndDate : null,
                updated_at: new Date().toISOString()
            };

            let result;

            if (expenseId) {
                // Update existing expense
                const { data, error } = await supabaseClient
                    .from('expenses')
                    .update(expenseData)
                    .eq('id', expenseId)
                    .select()
                    .single();

                if (error) throw error;
                result = data;

                // Create audit log
                await this.createAuditLog('update', 'expenses', expenseId, null, expenseData);

                showNotification('Expense updated successfully', 'success');
            } else {
                // Add new expense
                expenseData.created_by = this.currentUser.id;

                const { data, error } = await supabaseClient
                    .from('expenses')
                    .insert([expenseData])
                    .select()
                    .single();

                if (error) throw error;
                result = data;

                // Create audit log
                await this.createAuditLog('create', 'expenses', result.id, null, expenseData);

                showNotification(expenseType === 'income' ? 'Income recorded successfully' : 'Expense recorded successfully', 'success');
            }

            // Close modal and refresh
            this.closeAllModals();
            await this.loadExpenses();

        } catch (error) {

            showNotification('Failed to save expense: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async deleteExpense() {
        const expenseId = document.getElementById('expenseId').value;

        if (!expenseId) return;

        if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
            return;
        }

        await this.deleteExpenseById(expenseId);
    }

    async deleteExpenseById(expenseId) {
        showLoading(true);

        try {
            const { error } = await supabaseClient
                .from('expenses')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;

            // Create audit log
            await this.createAuditLog('delete', 'expenses', expenseId, null, null);

            showNotification('Expense deleted successfully', 'success');

            // Refresh expenses
            await this.loadExpenses();

        } catch (error) {

            showNotification('Failed to delete expense', 'error');
        } finally {
            showLoading(false);
        }
    }

    async exportExpenses() {
        showLoading(true);

        try {
            // Get all expenses data
            const expenseData = this.filteredExpenses.map(expense => {
                const isIncome = expense.expense_type === 'income';

                return {
                    'Date': expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A',
                    'Type': isIncome ? 'Income' : 'Expense',
                    'Category': expense.category || 'Uncategorized',
                    'Description': expense.description,
                    'Amount': parseFloat(expense.amount || 0).toFixed(2),
                    'Receipt': expense.receipt_number || 'N/A',
                    'Added By': expense.profiles?.full_name || 'N/A',
                    'Recurring': expense.is_recurring ? 'Yes' : 'No',
                    'Frequency': expense.recurring_frequency || 'N/A'
                };
            });

            // Create CSV content
            let csv = 'Date,Type,Category,Description,Amount,Receipt,Added By,Recurring,Frequency\n';

            expenseData.forEach(expense => {
                csv += `"${expense.Date}","${expense.Type}","${expense.Category}","${expense.Description}",${expense.Amount},"${expense.Receipt}","${expense['Added By']}","${expense.Recurring}","${expense.Frequency}"\n`;
            });

            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `expenses_${this.shopId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('Expenses exported successfully', 'success');

        } catch (error) {

            showNotification('Failed to export expenses', 'error');
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

// Initialize on expenses page
if (window.location.pathname.includes('expenses.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new ExpensesManager();
    });
}
