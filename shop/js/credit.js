// Credit Management - Complete Implementation
class CreditManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.credits = [];
        this.filteredCredits = [];
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

        // Load credit data
        await this.loadCredits();

        // Load call history
        await this.loadCallHistory();
    }

    updateUI() {
        // Update user info
        document.getElementById('userName').textContent = this.currentUser.full_name || this.currentUser.username;
        document.getElementById('userRole').textContent = this.currentUser.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';


        // Set default date for new credit
        document.getElementById('creditDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Add credit button
        const addCreditBtn = document.getElementById('addCreditBtn');
        if (addCreditBtn) {
            addCreditBtn.addEventListener('click', () => {
                this.showAddCreditModal();
            });
        }

        // Export button
        const exportCreditBtn = document.getElementById('exportCreditBtn');
        if (exportCreditBtn) {
            exportCreditBtn.addEventListener('click', () => {
                this.exportCredits();
            });
        }

        // Refresh button
        const refreshCredit = document.getElementById('refreshCredit');
        if (refreshCredit) {
            refreshCredit.addEventListener('click', () => {
                this.loadCredits();
            });
        }

        // Search input
        const creditSearch = document.getElementById('creditSearch');
        if (creditSearch) {
            creditSearch.addEventListener('input', (e) => {
                this.filterCredits(e.target.value);
            });
        }

        // Status filter
        const creditStatus = document.getElementById('creditStatus');
        if (creditStatus) {
            creditStatus.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Save credit button
        const saveCreditBtn = document.getElementById('saveCreditBtn');
        if (saveCreditBtn) {
            saveCreditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCredit();
            });
        }

        // Delete credit button
        const deleteCreditBtn = document.getElementById('deleteCreditBtn');
        if (deleteCreditBtn) {
            deleteCreditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteCredit();
            });
        }

        // Save payment button
        const savePaymentBtn = document.getElementById('savePaymentBtn');
        if (savePaymentBtn) {
            savePaymentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.savePayment();
            });
        }

        // Add product to credit
        const addProductToCredit = document.getElementById('addProductToCredit');
        if (addProductToCredit) {
            addProductToCredit.addEventListener('click', () => {
                this.addProductToCreditForm();
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

        // Edit credit event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-credit-btn')) {
                const btn = e.target.closest('.edit-credit-btn');
                const creditId = btn.dataset.id;
                this.showEditCreditModal(creditId);
            }
        });

        // Add payment event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-payment-btn')) {
                const btn = e.target.closest('.add-payment-btn');
                const creditId = btn.dataset.id;
                this.showAddPaymentModal(creditId);
            }
        });

        // Call buyer event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.call-buyer-btn')) {
                const btn = e.target.closest('.call-buyer-btn');
                const phone = btn.dataset.phone;
                this.callBuyer(phone);
            }
        });

        // View credit details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-credit-btn')) {
                const btn = e.target.closest('.view-credit-btn');
                const creditId = btn.dataset.id;
                this.viewCreditDetails(creditId);
            }
        });

        // Delete credit event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-credit-btn')) {
                const btn = e.target.closest('.delete-credit-btn');
                const creditId = btn.dataset.id;
                if (confirm('Are you sure you want to delete this credit record?')) {
                    this.deleteCreditById(creditId);
                }
            }
        });
    }

    async loadCredits() {
        showLoading(true);

        try {


            const { data: credits, error } = await supabaseClient
                .from('credits')
                .select('*')
                .eq('shop_id', this.shopId)
                .order('created_at', { ascending: false });

            if (error) {

                throw error;
            }



            this.credits = credits || [];
            this.filteredCredits = [...this.credits];

            // Update stats and table
            this.updateCreditStats();
            this.renderCreditsTable();

        } catch (error) {

            showNotification('Failed to load credit records: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    updateCreditStats() {
        if (!this.credits || this.credits.length === 0) {
            document.getElementById('totalOutstanding').textContent = formatCurrency(0);
            document.getElementById('activeBuyers').textContent = '0';
            document.getElementById('recentlyCleared').textContent = formatCurrency(0);
            document.getElementById('overdueAmount').textContent = formatCurrency(0);
            return;
        }

        // Calculate stats
        const totalOutstanding = this.credits.reduce((sum, credit) => {
            return sum + (parseFloat(credit.pending_amount) || 0);
        }, 0);

        const activeBuyers = new Set(this.credits
            .filter(credit => (parseFloat(credit.pending_amount) || 0) > 0)
            .map(credit => credit.buyer_phone)
        ).size;

        // Recently cleared (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentlyCleared = this.credits
            .filter(credit => {
                if (!credit.updated_at) return false;
                const creditDate = new Date(credit.updated_at);
                return creditDate >= sevenDaysAgo && (parseFloat(credit.pending_amount) || 0) === 0;
            })
            .reduce((sum, credit) => sum + (parseFloat(credit.total_amount) || 0), 0);

        // Overdue amounts
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueAmount = this.credits
            .filter(credit => {
                if (!credit.due_date || (parseFloat(credit.pending_amount) || 0) === 0) return false;
                const dueDate = new Date(credit.due_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
            })
            .reduce((sum, credit) => sum + (parseFloat(credit.pending_amount) || 0), 0);

        // Update display
        document.getElementById('totalOutstanding').textContent = formatCurrency(totalOutstanding);
        document.getElementById('activeBuyers').textContent = activeBuyers;
        document.getElementById('recentlyCleared').textContent = formatCurrency(recentlyCleared);
        document.getElementById('overdueAmount').textContent = formatCurrency(overdueAmount);
    }

    renderCreditsTable() {
        const tableBody = document.getElementById('creditTable');
        if (!tableBody) return;

        if (this.filteredCredits.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-credit-card fa-2x"></i>
                            <p>No credit records found</p>
                            <small>Add credit sales from POS or here</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredCredits.map(credit => {
            // Parse amounts
            const totalAmount = parseFloat(credit.total_amount) || 0;
            const amountPaid = parseFloat(credit.amount_paid) || 0;
            const pendingAmount = parseFloat(credit.pending_amount) || 0;

            // Calculate status
            let status = 'pending';
            let statusText = 'Pending';

            if (pendingAmount === 0) {
                status = 'completed';
                statusText = 'Completed';
            } else if (pendingAmount > 0 && pendingAmount < totalAmount) {
                status = 'partial';
                statusText = 'Partial';
            }

            // Check if overdue
            if (credit.due_date) {
                const dueDate = new Date(credit.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today && pendingAmount > 0) {
                    status = 'overdue';
                    statusText = 'Overdue';
                }
            }

            // Format dates
            const creditDate = credit.credit_date ?
                new Date(credit.credit_date).toLocaleDateString('en-IN') : 'N/A';

            const dueDate = credit.due_date ?
                new Date(credit.due_date).toLocaleDateString('en-IN') : 'N/A';

            return `
                <tr>
                    <td>
                        <div class="buyer-info">
                            <strong>${credit.buyer_name || 'N/A'}</strong>
                            ${credit.buyer_phone ? `
                            <div class="phone-actions">
                                <small>${credit.buyer_phone}</small>
                                <button class="btn btn-sm call-buyer-btn" data-phone="${credit.buyer_phone}" title="Call">
                                    <i class="fas fa-phone"></i>
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    </td>
                    <td>${credit.buyer_phone || 'N/A'}</td>
                    <td>${formatCurrency(totalAmount)}</td>
                    <td>${formatCurrency(amountPaid)}</td>
                    <td>
                        <span class="pending-amount ${status}">
                            ${formatCurrency(pendingAmount)}
                        </span>
                    </td>
                    <td>${creditDate}</td>
                    <td>${dueDate}</td>
                    <td>
                        <span class="status-badge ${status}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary view-credit-btn" data-id="${credit.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success add-payment-btn" data-id="${credit.id}" title="Add Payment" ${pendingAmount === 0 ? 'disabled' : ''}>
                                <i class="fas fa-money-bill"></i>
                            </button>
                            <button class="btn btn-sm btn-warning edit-credit-btn" data-id="${credit.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${this.currentUser.role === 'shop_admin' ? `
                            <button class="btn btn-sm btn-danger delete-credit-btn" data-id="${credit.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterCredits(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredCredits = [...this.credits];
        } else {
            this.filteredCredits = this.credits.filter(credit => {
                const buyerName = (credit.buyer_name || '').toLowerCase();
                const buyerPhone = (credit.buyer_phone || '');
                const search = searchTerm.toLowerCase();

                return buyerName.includes(search) || buyerPhone.includes(search);
            });
        }

        this.renderCreditsTable();
    }

    filterByStatus(status) {
        if (!status || status === 'all') {
            this.filteredCredits = [...this.credits];
        } else {
            this.filteredCredits = this.credits.filter(credit => {
                const pendingAmount = parseFloat(credit.pending_amount) || 0;
                const totalAmount = parseFloat(credit.total_amount) || 0;

                if (status === 'overdue') {
                    if (!credit.due_date || pendingAmount === 0) return false;
                    const dueDate = new Date(credit.due_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate < today;
                }

                // For other statuses, calculate based on pending amount
                if (status === 'pending') {
                    return pendingAmount === totalAmount;
                } else if (status === 'partial') {
                    return pendingAmount > 0 && pendingAmount < totalAmount;
                } else if (status === 'completed') {
                    return pendingAmount === 0;
                }
                return true;
            });
        }

        this.renderCreditsTable();
    }

    showAddCreditModal() {
        // Reset form
        document.getElementById('creditModalTitle').textContent = 'Add Credit Sale';
        document.getElementById('creditForm').reset();
        document.getElementById('creditId').value = '';
        document.getElementById('deleteCreditBtn').style.display = 'none';

        // Set default dates
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        document.getElementById('creditDate').value = today.toISOString().split('T')[0];
        document.getElementById('dueDate').value = thirtyDaysLater.toISOString().split('T')[0];

        // Clear products list
        document.getElementById('creditProducts').innerHTML = '';

        // Show modal
        document.getElementById('creditModal').classList.add('active');

        // Focus on first input
        setTimeout(() => {
            document.getElementById('buyerName').focus();
        }, 100);
    }

    async showEditCreditModal(creditId) {
        showLoading(true);

        try {
            const { data: credit, error } = await supabaseClient
                .from('credits')
                .select('*')
                .eq('id', creditId)
                .eq('shop_id', this.shopId)
                .single();

            if (error) throw error;

            // Populate form
            document.getElementById('creditModalTitle').textContent = 'Edit Credit';
            document.getElementById('creditId').value = credit.id;
            document.getElementById('buyerName').value = credit.buyer_name || '';
            document.getElementById('buyerPhone').value = credit.buyer_phone || '';
            document.getElementById('buyerAddress').value = credit.buyer_address || '';
            document.getElementById('totalAmount').value = credit.total_amount || '';
            document.getElementById('amountPaid').value = credit.amount_paid || '';

            // Format dates for input
            const creditDate = credit.credit_date ? credit.credit_date.split('T')[0] : '';
            const dueDate = credit.due_date ? credit.due_date.split('T')[0] : '';

            document.getElementById('creditDate').value = creditDate;
            document.getElementById('dueDate').value = dueDate;
            document.getElementById('creditNotes').value = credit.notes || '';

            // Show delete button for admin
            document.getElementById('deleteCreditBtn').style.display =
                this.currentUser.role === 'shop_admin' ? 'block' : 'none';

            // Show modal
            document.getElementById('creditModal').classList.add('active');

        } catch (error) {

            showNotification('Failed to load credit details', 'error');
        } finally {
            showLoading(false);
        }
    }

    addProductToCreditForm() {
        const productsList = document.getElementById('creditProducts');
        const productCount = productsList.children.length + 1;

        const productHtml = `
            <div class="credit-product-item" data-index="${productCount}">
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" placeholder="Product Name" class="product-name" required>
                    </div>
                    <div class="form-group">
                        <input type="number" placeholder="Quantity" class="product-quantity" min="1" value="1" required>
                    </div>
                    <div class="form-group">
                        <input type="number" placeholder="Price" class="product-price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-sm btn-danger remove-product-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        productsList.insertAdjacentHTML('beforeend', productHtml);

        // Add remove event listener
        const newItem = productsList.lastElementChild;
        const removeBtn = newItem.querySelector('.remove-product-btn');
        removeBtn.addEventListener('click', () => {
            newItem.remove();
        });
    }

    async saveCredit() {
        // Get form values
        const creditId = document.getElementById('creditId').value;
        const buyerName = document.getElementById('buyerName').value.trim();
        const buyerPhone = document.getElementById('buyerPhone').value.trim();
        const buyerAddress = document.getElementById('buyerAddress').value.trim();
        const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
        const creditDate = document.getElementById('creditDate').value;
        const dueDate = document.getElementById('dueDate').value;
        const notes = document.getElementById('creditNotes').value.trim();

        // Validate
        if (!buyerName || !buyerPhone || !totalAmount || !creditDate) {
            showNotification('Buyer name, phone, total amount and date are required', 'error');
            return;
        }

        if (amountPaid > totalAmount) {
            showNotification('Amount paid cannot exceed total amount', 'error');
            return;
        }

        const pendingAmount = totalAmount - amountPaid;
        const status = pendingAmount === 0 ? 'completed' :
            pendingAmount === totalAmount ? 'pending' : 'partial';

        showLoading(true);

        try {
            const creditData = {
                shop_id: this.shopId,
                buyer_name: buyerName,
                buyer_phone: buyerPhone,
                buyer_address: buyerAddress || null,
                total_amount: totalAmount,
                amount_paid: amountPaid,
                pending_amount: pendingAmount,
                credit_date: creditDate,
                due_date: dueDate || null,
                status: status,
                notes: notes || null,
                updated_at: new Date().toISOString()
            };

            let result;

            if (creditId) {
                // Update existing credit
                const { data, error } = await supabaseClient
                    .from('credits')
                    .update(creditData)
                    .eq('id', creditId)
                    .eq('shop_id', this.shopId)
                    .select()
                    .single();

                if (error) throw error;
                result = data;

                // Audit Log
                if (window.authManager) {
                    await window.authManager.createAuditLog('update', 'credits', creditId, null, creditData);
                }

                showNotification('Credit updated successfully', 'success');
            } else {
                // Add new credit
                creditData.created_by = this.currentUser.id;

                const { data, error } = await supabaseClient
                    .from('credits')
                    .insert([creditData])
                    .select()
                    .single();

                if (error) throw error;
                result = data;

                // Audit Log
                if (window.authManager) {
                    await window.authManager.createAuditLog('create', 'credits', result.id, null, creditData);
                }

                showNotification('Credit added successfully', 'success');
            }

            // Close modal and refresh
            this.closeAllModals();
            await this.loadCredits();

        } catch (error) {

            showNotification('Failed to save credit: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async deleteCredit() {
        const creditId = document.getElementById('creditId').value;

        if (!creditId) return;

        if (!confirm('Are you sure you want to delete this credit record? This action cannot be undone.')) {
            return;
        }

        await this.deleteCreditById(creditId);
    }

    async deleteCreditById(creditId) {
        showLoading(true);

        try {
            // Check if credit has payments
            const { data: payments, error: paymentsError } = await supabaseClient
                .from('credit_payments')
                .select('id')
                .eq('credit_id', creditId)
                .eq('shop_id', this.shopId);

            if (paymentsError) throw paymentsError;

            if (payments && payments.length > 0) {
                if (!confirm(`This credit record has ${payments.length} payment(s). Deleting it will also PERMANENTLY delete all associated payment history. Are you sure you want to proceed?`)) {
                    return;
                }

                // Delete associated payments first
                const { error: deletePaymentsError } = await supabaseClient
                    .from('credit_payments')
                    .delete()
                    .eq('credit_id', creditId)
                    .eq('shop_id', this.shopId);

                if (deletePaymentsError) throw deletePaymentsError;
            }

            // Delete credit
            const { error } = await supabaseClient
                .from('credits')
                .delete()
                .eq('id', creditId)
                .eq('shop_id', this.shopId);

            if (error) throw error;

            // Audit Log
            if (window.authManager) {
                await window.authManager.createAuditLog('delete', 'credits', creditId, null, {
                    credit_id: creditId,
                    deleted_payments_count: payments ? payments.length : 0
                });
            }

            showNotification('Credit and associated payments deleted successfully', 'success');

            // Refresh credits
            await this.loadCredits();

            // Close modal
            this.closeAllModals();

        } catch (error) {

            showNotification('Failed to delete credit: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async showAddPaymentModal(creditId) {
        showLoading(true);

        try {
            const { data: credit, error } = await supabaseClient
                .from('credits')
                .select('*')
                .eq('id', creditId)
                .eq('shop_id', this.shopId)
                .single();

            if (error) throw error;

            // Populate modal
            document.getElementById('paymentBuyerName').textContent = credit.buyer_name || 'Unknown';
            document.getElementById('pendingAmountDisplay').textContent = formatCurrency(credit.pending_amount);

            // Store credit ID for saving payment
            document.getElementById('savePaymentBtn').dataset.creditId = creditId;

            // Set default date
            document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];

            // Set max payment amount and placeholder
            const paymentInput = document.getElementById('paymentAmount');
            paymentInput.max = credit.pending_amount;
            paymentInput.placeholder = `Max: ${formatCurrency(credit.pending_amount)}`;
            paymentInput.value = '';

            // Clear other fields
            document.getElementById('paymentMethod').value = 'cash';
            document.getElementById('paymentNotes').value = '';

            // Show modal
            document.getElementById('paymentModal').classList.add('active');

            // Focus on payment amount
            setTimeout(() => {
                paymentInput.focus();
            }, 100);

        } catch (error) {

            showNotification('Failed to load credit details', 'error');
        } finally {
            showLoading(false);
        }
    }

    async savePayment() {
        const creditId = document.getElementById('savePaymentBtn').dataset.creditId;
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value) || 0;
        const paymentDate = document.getElementById('paymentDate').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const paymentNotes = document.getElementById('paymentNotes').value.trim();

        // Validate
        if (!paymentAmount || paymentAmount <= 0) {
            showNotification('Please enter a valid payment amount', 'error');
            return;
        }

        if (!paymentDate) {
            showNotification('Please select payment date', 'error');
            return;
        }

        showLoading(true);

        try {
            // Get current credit
            const { data: credit, error: creditError } = await supabaseClient
                .from('credits')
                .select('*')
                .eq('id', creditId)
                .eq('shop_id', this.shopId)
                .single();

            if (creditError) throw creditError;

            // Validate payment amount
            const pendingAmount = parseFloat(credit.pending_amount) || 0;
            if (paymentAmount > pendingAmount) {
                showNotification(`Payment amount exceeds pending amount of ${formatCurrency(pendingAmount)}`, 'error');
                return;
            }

            // Create payment record
            const paymentData = {
                credit_id: creditId,
                payment_amount: paymentAmount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                notes: paymentNotes || null,
                created_by: this.currentUser.id,
                shop_id: this.shopId
            };

            const { error: paymentError } = await supabaseClient
                .from('credit_payments')
                .insert([paymentData]);

            if (paymentError) throw paymentError;

            // Update credit record
            const currentAmountPaid = parseFloat(credit.amount_paid) || 0;
            const newAmountPaid = currentAmountPaid + paymentAmount;
            const newPendingAmount = parseFloat(credit.total_amount) - newAmountPaid;
            const newStatus = newPendingAmount === 0 ? 'completed' :
                newPendingAmount === credit.total_amount ? 'pending' : 'partial';

            const { error: updateError } = await supabaseClient
                .from('credits')
                .update({
                    amount_paid: newAmountPaid,
                    pending_amount: newPendingAmount,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', creditId)
                .eq('shop_id', this.shopId);

            if (updateError) throw updateError;

            // Record call history for payment collection
            await this.recordCall(credit.buyer_name, credit.buyer_phone, 'payment_collection');

            // Audit Log
            if (window.authManager) {
                await window.authManager.createAuditLog('payment', 'credit_payments', creditId, null, {
                    amount: paymentAmount,
                    method: paymentMethod,
                    buyer_name: credit.buyer_name
                });
            }

            showNotification('Payment recorded successfully', 'success');

            // Close modal and refresh
            this.closeAllModals();
            await this.loadCredits();
            await this.loadCallHistory();

        } catch (error) {

            showNotification('Failed to record payment: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async viewCreditDetails(creditId) {
        showLoading(true);

        try {
            // Get credit record
            const { data: credit, error: creditError } = await supabaseClient
                .from('credits')
                .select('*')
                .eq('id', creditId)
                .eq('shop_id', this.shopId)
                .single();

            if (creditError) throw creditError;

            // Get payment history separately
            const { data: payments, error: paymentsError } = await supabaseClient
                .from('credit_payments')
                .select('*')
                .eq('credit_id', creditId)
                .eq('shop_id', this.shopId)
                .order('payment_date', { ascending: false });

            if (paymentsError) throw paymentsError;

            // Attach payments to credit object
            credit.credit_payments = payments || [];

            // Create detailed view modal
            this.showCreditDetailsModal(credit);

        } catch (error) {
            console.error('View credit details error:', error);
            showNotification('Failed to load credit details: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    showCreditDetailsModal(credit) {
        // Safe date formatter helper
        const safeFormatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            try {
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN');
            } catch (e) {
                return 'N/A';
            }
        };

        const modalHtml = `
            <div class="modal active" id="creditDetailsModal">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-invoice"></i> Credit Details</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="credit-details">
                            <div class="detail-section">
                                <h4>Buyer Information</h4>
                                <div class="detail-row">
                                    <span class="detail-label">Name:</span>
                                    <span class="detail-value">${credit.buyer_name || 'N/A'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Phone:</span>
                                    <span class="detail-value">${credit.buyer_phone || 'N/A'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Address:</span>
                                    <span class="detail-value">${credit.buyer_address || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Credit Information</h4>
                                <div class="detail-row">
                                    <span class="detail-label">Total Amount:</span>
                                    <span class="detail-value">${formatCurrency(credit.total_amount)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount Paid:</span>
                                    <span class="detail-value">${formatCurrency(credit.amount_paid)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Pending Amount:</span>
                                    <span class="detail-value">${formatCurrency(credit.pending_amount)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Credit Date:</span>
                                    <span class="detail-value">${safeFormatDate(credit.credit_date)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Due Date:</span>
                                    <span class="detail-value">${safeFormatDate(credit.due_date)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value">
                                        <span class="status-badge ${credit.status || 'pending'}">${(credit.status || 'pending').toUpperCase()}</span>
                                    </span>
                                </div>
                            </div>
                            
                            ${credit.notes ? `
                            <div class="detail-section">
                                <h4>Notes</h4>
                                <p>${credit.notes}</p>
                            </div>
                            ` : ''}
                            
                            ${credit.credit_payments && credit.credit_payments.length > 0 ? `
                            <div class="detail-section">
                                <h4>Payment History</h4>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Method</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${credit.credit_payments.map(payment => `
                                                <tr>
                                                    <td>${safeFormatDate(payment.payment_date)}</td>
                                                    <td>${formatCurrency(payment.payment_amount)}</td>
                                                    <td>${(payment.payment_method || 'cash').toUpperCase()}</td>
                                                    <td>${payment.notes || ''}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary close-modal">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('creditDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add close event listener
        const modal = document.getElementById('creditDetailsModal');
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    callBuyer(phone) {
        if (!phone) {
            showNotification('No phone number available', 'error');
            return;
        }

        // Format phone number for tel: link
        const formattedPhone = phone.replace(/\D/g, '');

        // Add country code if not present
        let telLink;
        if (formattedPhone.startsWith('0')) {
            telLink = `tel:+880${formattedPhone.substring(1)}`;
        } else if (formattedPhone.startsWith('880')) {
            telLink = `tel:+${formattedPhone}`;
        } else {
            telLink = `tel:${formattedPhone}`;
        }

        // Create temporary link and click it
        const link = document.createElement('a');
        link.href = telLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Record the call
        this.recordCall('Credit Customer', phone, 'outgoing_call');
    }

    async recordCall(buyerName, buyerPhone, callType) {
        try {
            await supabaseClient
                .from('call_history')
                .insert({
                    shop_id: this.shopId,
                    buyer_name: buyerName,
                    buyer_phone: buyerPhone,
                    call_type: callType,
                    called_by: this.currentUser.id,
                    call_time: new Date().toISOString()
                });
        } catch (error) {

        }
    }

    async loadCallHistory() {
        try {
            const { data: calls, error } = await supabaseClient
                .from('call_history')
                .select(`
                    *,
                    profiles!call_history_called_by_fkey (full_name)
                `)
                .eq('shop_id', this.shopId)
                .order('call_time', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderCallHistory(calls || []);

        } catch (error) {

        }
    }

    renderCallHistory(calls) {
        const container = document.getElementById('callsList');
        if (!container) return;

        if (calls.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-phone fa-2x"></i>
                    <p>No call history yet</p>
                    <small>Call history will appear here after calls are made</small>
                </div>
            `;
            return;
        }

        container.innerHTML = calls.map(call => {
            const callTime = new Date(call.call_time);
            const formattedTime = callTime.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="call-item">
                    <div class="call-info">
                        <div class="call-header">
                            <span class="call-buyer">${call.buyer_name || 'Unknown'}</span>
                            <span class="call-type ${call.call_type}">
                                ${call.call_type === 'payment_collection' ? 'Payment' : 'Call'}
                            </span>
                        </div>
                        <div class="call-details">
                            <span class="call-phone">
                                <i class="fas fa-phone"></i> ${call.buyer_phone || 'N/A'}
                            </span>
                            <span class="call-time">
                                <i class="fas fa-clock"></i> ${formattedTime}
                            </span>
                            <span class="call-by">
                                <i class="fas fa-user"></i> ${call.profiles?.full_name || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async exportCredits() {
        if (this.filteredCredits.length === 0) {
            showNotification('No data to export', 'warning');
            return;
        }

        showLoading(true);

        try {
            // Get all credits data with formatted dates
            const creditData = this.filteredCredits.map(credit => {
                const creditDate = credit.credit_date ?
                    new Date(credit.credit_date).toLocaleDateString('en-IN') : 'N/A';

                const dueDate = credit.due_date ?
                    new Date(credit.due_date).toLocaleDateString('en-IN') : 'N/A';

                return {
                    'Buyer Name': credit.buyer_name || '',
                    'Phone': credit.buyer_phone || '',
                    'Total Amount': parseFloat(credit.total_amount || 0).toFixed(2),
                    'Amount Paid': parseFloat(credit.amount_paid || 0).toFixed(2),
                    'Pending Amount': parseFloat(credit.pending_amount || 0).toFixed(2),
                    'Credit Date': creditDate,
                    'Due Date': dueDate,
                    'Status': credit.status || 'pending',
                    'Address': credit.buyer_address || '',
                    'Notes': credit.notes || ''
                };
            });

            // Create CSV content
            let csv = 'Buyer Name,Phone,Total Amount,Amount Paid,Pending Amount,Credit Date,Due Date,Status,Address,Notes\n';

            creditData.forEach(credit => {
                csv += `"${credit['Buyer Name'].replace(/"/g, '""')}","${credit.Phone}","${credit['Total Amount']}","${credit['Amount Paid']}","${credit['Pending Amount']}","${credit['Credit Date']}","${credit['Due Date']}","${credit.Status}","${credit.Address.replace(/"/g, '""')}","${credit.Notes.replace(/"/g, '""')}"\n`;
            });

            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `credit_report_${this.shopId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('Credit report exported successfully', 'success');

        } catch (error) {

            showNotification('Failed to export credit report', 'error');
        } finally {
            showLoading(false);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });

        // Remove any credit details modal
        const creditDetailsModal = document.getElementById('creditDetailsModal');
        if (creditDetailsModal) {
            creditDetailsModal.remove();
        }
    }

    // Helper function to create test credit (for debugging)
    async createTestCredit() {
        try {
            const testData = {
                shop_id: this.shopId,
                buyer_name: "Test Buyer",
                buyer_phone: "01234567890",
                total_amount: 1500.50,
                amount_paid: 500,
                pending_amount: 1000.50,
                credit_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'partial',
                created_by: this.currentUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient
                .from('credits')
                .insert([testData])
                .select();

            if (error) throw error;


            showNotification('Test credit added successfully', 'success');
            await this.loadCredits();

        } catch (error) {

            showNotification('Failed to create test credit', 'error');
        }
    }
}

// Helper functions


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
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
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.display = 'block';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize on credit page
if (window.location.pathname.includes('credit.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const creditManager = new CreditManager();

        // For debugging - add test button (remove in production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testBtn = document.createElement('button');
            testBtn.className = 'btn btn-warning';
            testBtn.innerHTML = '<i class="fas fa-vial"></i> Test Credit';
            testBtn.style.position = 'fixed';
            testBtn.style.bottom = '20px';
            testBtn.style.right = '20px';
            testBtn.style.zIndex = '9999';
            testBtn.onclick = () => creditManager.createTestCredit();
            document.body.appendChild(testBtn);
        }
    });
}
