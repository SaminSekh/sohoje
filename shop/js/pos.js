// POS System Manager - COMPLETELY FIXED VERSION
class POSManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.cart = [];
        this.products = [];
        this.cartTotal = 0;
        this.cartSubtotal = 0;
        this.discount = 0;
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

        // Update Shop Info (Wait for it so we have the logo)
        await this.updateShopName();

        // Update UI
        this.updateUI();

        // Setup event listeners
        this.setupEventListeners();

        // Load products
        await this.loadProducts();

        // Update time
        this.updateCurrentTime();

        // Load recent transactions
        await this.loadRecentTransactions();

        // Check for held sales
        this.checkHeldSales();
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

        // Update currency symbols
        const discountCurrency = document.getElementById('discountCurrency');
        if (discountCurrency) {
            discountCurrency.textContent = getCurrencySymbol();
        }
    }

    async updateShopName() {
        try {
            const { data: shop, error } = await supabaseClient
                .from('shops')
                .select('shop_name, shop_logo')
                .eq('id', this.shopId)
                .single();

            if (!error && shop) {
                this.shopData = shop;
                this.shopLogo = shop.shop_logo || null;
            }

            // Fetch Currency
            const { data: settings } = await supabaseClient
                .from('shop_settings')
                .select('currency')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (settings) {
                window.shopCurrency = settings.currency || 'INR';
            }
        } catch (error) {
            console.error('Error fetching shop info:', error);
        }
    }

    setupEventListeners() {
        // Product search
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterProductsBy(filter);
            });
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryChange(e.target.value);
            });
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.handleTypeChange(e.target.value);
            });
        }

        // Add to cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const btn = e.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.id;
                this.showPriceEditor(productId);
            }
        });

        // Remove from cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-from-cart')) {
                const btn = e.target.closest('.remove-from-cart');
                const productId = btn.dataset.id;
                this.removeFromCart(productId);
            }
        });

        // Edit price in cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-price-btn')) {
                const btn = e.target.closest('.edit-price-btn');
                const productId = btn.dataset.id;
                this.editCartItemPrice(productId);
            }
        });

        // Update quantity
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('cart-quantity')) {
                const productId = e.target.dataset.id;
                const quantity = parseInt(e.target.value) || 1;
                this.updateCartQuantity(productId, quantity);
            }
        });

        // Discount input
        const discountInput = document.getElementById('discountAmount');
        if (discountInput) {
            discountInput.addEventListener('input', (e) => {
                this.discount = parseFloat(e.target.value) || 0;
                this.updateCartTotals();
            });
        }

        // Payment method change
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.togglePaymentFields(e.target.value);
            });
        });

        // Amount received input
        const amountReceived = document.getElementById('amountReceived');
        if (amountReceived) {
            amountReceived.addEventListener('input', (e) => {
                const received = parseFloat(e.target.value) || 0;
                const change = received - this.cartTotal;
                const changeElement = document.getElementById('changeAmount');
                if (changeElement) {
                    changeElement.value = change > 0 ? change.toFixed(2) : '0.00';
                }
            });
        }

        // Amount paid for credit
        const amountPaid = document.getElementById('amountPaid');
        if (amountPaid) {
            amountPaid.addEventListener('input', (e) => {
                const paid = parseFloat(e.target.value) || 0;
                const pending = this.cartTotal - paid;
                const pendingElement = document.getElementById('pendingAmount');
                if (pendingElement) {
                    pendingElement.value = pending > 0 ? pending.toFixed(2) : '0.00';
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.processCheckout();
            });
        }

        // Clear cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Hold sale button
        const holdSaleBtn = document.getElementById('holdSaleBtn');
        if (holdSaleBtn) {
            holdSaleBtn.addEventListener('click', () => {
                this.holdSale();
            });
        }

        // Print invoice button
        const printInvoiceBtn = document.getElementById('printInvoiceBtn');
        if (printInvoiceBtn) {
            printInvoiceBtn.addEventListener('click', () => {
                this.printInvoice();
            });
        }

        // Refresh transactions
        const refreshTransactions = document.getElementById('refreshTransactions');
        if (refreshTransactions) {
            refreshTransactions.addEventListener('click', () => {
                this.loadRecentTransactions();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Load held sale button
        const loadHeldSaleBtn = document.getElementById('loadHeldSaleBtn');
        if (loadHeldSaleBtn) {
            loadHeldSaleBtn.addEventListener('click', () => {
                this.loadHeldSale();
            });
        }

        // Mobile cart toggle
        const mobileCartToggle = document.getElementById('mobileCartToggle');
        if (mobileCartToggle) {
            mobileCartToggle.addEventListener('click', () => {
                this.toggleMobileCart();
            });
        }

        // Mobile close button
        const closeCartBtn = document.getElementById('closeCartBtn');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                this.closeMobileCart();
            });
        }

        // Cart backdrop click (close cart)
        const cartBackdrop = document.getElementById('cartBackdrop');
        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', () => {
                this.closeMobileCart();
            });
        }
    }

    checkHeldSales() {
        const heldSale = localStorage.getItem(`hold_sale_${this.shopId}`);
        if (heldSale) {
            showNotification('There is a held sale available', 'info');
        }
    }

    async loadProducts() {
        showLoading(true);

        try {
            const { data: products, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('shop_id', this.shopId)
                .order('product_name');

            if (error) throw error;

            this.products = products || [];
            this.renderProducts();

            // Load categories for filter
            this.loadCategories();

        } catch (error) {

            showNotification('Failed to load products', 'error');
        } finally {
            showLoading(false);
        }
    }

    renderProducts() {
        const container = document.getElementById('productGrid');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open fa-2x"></i>
                    <p>No products available</p>
                    <small>Add products from inventory</small>
                </div>
            `;

            const productCount = document.getElementById('productCount');
            if (productCount) {
                productCount.innerHTML = `
                    <span class="count-badge">0 Items</span>
                    <span class="stock-badge">Total Stock: 0</span>
                `;
            }
            return;
        }

        container.innerHTML = this.products.map(product => {
            const stock = parseInt(product.stock) || 0;
            const stockClass = stock < 1 ? 'out-of-stock' :
                stock < 10 ? 'low-stock' : 'in-stock';

            const price = parseFloat(product.selling_price) || 0;

            return `
                <div class="product-card ${stockClass}">
                    <div class="product-image-container">
                        <img src="${product.product_image || this.shopLogo || 'https://via.placeholder.com/300?text=No+Image'}" 
                             class="product-img-pos" 
                             alt="${product.product_name}">
                        ${stock < 1 ? '<div class="out-of-stock-overlay">Sold Out</div>' : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-category-type">
                            ${product.category || 'General'} ${product.type ? `• ${product.type}` : ''}
                        </div>
                        <div class="product-name" title="${product.product_name || 'Unnamed Product'}">
                            ${product.product_name || 'Unnamed Product'}
                        </div>
                        <div class="product-sku">SKU: ${product.sku || 'N/A'}</div>
                        <div class="product-meta">
                            <span class="stock-status ${stockClass}">
                                <i class="fas ${stock < 1 ? 'fa-times-circle' : 'fa-check-circle'}"></i> 
                                ${stock < 1 ? 'Out of Stock' : `${stock} in stock`}
                            </span>
                        </div>
                        <div class="product-price-action">
                            <div class="product-price">${formatCurrency(price)}</div>
                            <button class="btn btn-sm btn-primary add-to-cart-btn" 
                                    data-id="${product.id}"
                                    ${stock < 1 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const productCount = document.getElementById('productCount');
        if (productCount) {
            const totalStock = this.products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
            productCount.innerHTML = `
                <span class="count-badge">${this.products.length} Items</span>
                <span class="stock-badge">Total Stock: ${totalStock}</span>
            `;
        }
    }

    loadCategories() {
        const categories = new Set();
        this.products.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });

        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    loadTypes(category) {
        const typeFilter = document.getElementById('typeFilter');
        if (!typeFilter) return;

        if (!category) {
            typeFilter.style.display = 'none';
            typeFilter.innerHTML = '<option value="">All Types</option>';
            return;
        }

        const types = new Set();
        this.products.forEach(product => {
            if (product.category === category && product.type) {
                types.add(product.type);
            }
        });

        if (types.size === 0) {
            typeFilter.style.display = 'none';
            typeFilter.innerHTML = '<option value="">All Types</option>';
            return;
        }

        typeFilter.style.display = 'inline-block';
        typeFilter.innerHTML = '<option value="">All Types</option>';

        const sortedTypes = Array.from(types).sort();
        sortedTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });
    }

    handleCategoryChange(category) {
        this.loadTypes(category);
        this.filterProductsCombined();
    }

    handleTypeChange(type) {
        this.filterProductsCombined();
    }

    filterProducts(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderProducts();
            return;
        }

        const filtered = this.products.filter(product =>
            (product.product_name && product.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        this.renderFilteredProducts(filtered);
    }

    filterProductsBy(filterType) {
        let filtered = this.products;

        switch (filterType) {
            case 'low-stock':
                filtered = this.products.filter(p => p.stock < 10 && p.stock > 0);
                break;
            case 'out-of-stock':
                filtered = this.products.filter(p => p.stock < 1);
                break;
            default:
                filtered = this.products;
        }

        this.renderFilteredProducts(filtered);
    }

    filterProductsByCategory(category) {
        this.handleCategoryChange(category);
    }

    filterProductsCombined() {
        const categoryFilter = document.getElementById('categoryFilter');
        const typeFilter = document.getElementById('typeFilter');
        const searchInput = document.getElementById('productSearch');

        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedType = typeFilter ? typeFilter.value : '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        let filtered = this.products;

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (selectedType) {
            filtered = filtered.filter(p => p.type === selectedType);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                (p.product_name && p.product_name.toLowerCase().includes(searchTerm)) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm))
            );
        }

        this.renderFilteredProducts(filtered);
    }

    renderFilteredProducts(filteredProducts) {
        const container = document.getElementById('productGrid');
        if (!container) return;

        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search fa-2x"></i>
                    <p>No products found</p>
                    <small>Try a different search term</small>
                </div>
            `;

            const productCount = document.getElementById('productCount');
            if (productCount) {
                productCount.innerHTML = `
                    <span class="count-badge">0 Found</span>
                    <span class="stock-badge">Total Stock: 0</span>
                `;
            }
            return;
        }

        container.innerHTML = filteredProducts.map(product => {
            const stock = parseInt(product.stock) || 0;
            const stockClass = stock < 1 ? 'out-of-stock' :
                stock < 10 ? 'low-stock' : 'in-stock';

            const price = parseFloat(product.selling_price) || 0;

            return `
                <div class="product-card ${stockClass}">
                    <div class="product-image-container">
                        <img src="${product.product_image || this.shopLogo || 'https://via.placeholder.com/300?text=No+Image'}" 
                             class="product-img-pos" 
                             alt="${product.product_name}">
                        ${stock < 1 ? '<div class="out-of-stock-overlay">Sold Out</div>' : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-category-type">
                            ${product.category || 'General'} ${product.type ? `• ${product.type}` : ''}
                        </div>
                        <div class="product-name" title="${product.product_name || 'Unnamed Product'}">
                            ${product.product_name || 'Unnamed Product'}
                        </div>
                        <div class="product-sku">SKU: ${product.sku || 'N/A'}</div>
                        <div class="product-meta">
                            <span class="stock-status ${stockClass}">
                                <i class="fas ${stock < 1 ? 'fa-times-circle' : 'fa-check-circle'}"></i> 
                                ${stock < 1 ? 'Out of Stock' : `${stock} in stock`}
                            </span>
                        </div>
                        <div class="product-price-action">
                            <div class="product-price">${formatCurrency(price)}</div>
                            <button class="btn btn-sm btn-primary add-to-cart-btn" 
                                    data-id="${product.id}"
                                    ${stock < 1 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const productCount = document.getElementById('productCount');
        if (productCount) {
            const totalStock = filteredProducts.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
            productCount.innerHTML = `
                <span class="count-badge">${filteredProducts.length} Found</span>
                <span class="stock-badge">Total Stock: ${totalStock}</span>
            `;
        }
    }

    showPriceEditor(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const stock = parseInt(product.stock) || 0;
        if (stock < 1) {
            showNotification('Product out of stock', 'warning');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-tag"></i> Set Selling Price</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Product: <strong>${product.product_name || 'Unnamed Product'}</strong></label>
                    </div>
                    <div class="form-group">
                        <label>Original Price</label>
                        <input type="number" id="originalPrice" class="form-control" 
                               value="${parseFloat(product.selling_price).toFixed(2)}" 
                               readonly>
                    </div>
                    <div class="form-group">
                        <label for="customPrice">Selling Price *</label>
                        <input type="number" id="customPrice" class="form-control" 
                               value="${parseFloat(product.selling_price).toFixed(2)}" 
                               min="0" step="0.01" required>
                        <small class="form-text">Enter negotiated price</small>
                    </div>
                    <div class="form-row" style="margin-top: 15px;">
                        <div class="form-group">
                            <button class="btn btn-secondary btn-block close-price-modal">
                                Cancel
                            </button>
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary btn-block" id="addWithCustomPrice">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            const customPriceInput = document.getElementById('customPrice');
            if (customPriceInput) {
                customPriceInput.focus();
                customPriceInput.select();
            }
        }, 100);

        modal.querySelector('#addWithCustomPrice').addEventListener('click', () => {
            const customPriceInput = document.getElementById('customPrice');
            const customPrice = parseFloat(customPriceInput.value);

            if (isNaN(customPrice) || customPrice < 0) {
                showNotification('Please enter a valid price', 'error');
                customPriceInput.focus();
                return;
            }

            this.addToCartWithCustomPrice(productId, customPrice);
            modal.remove();
        });

        modal.querySelector('.close-price-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#customPrice').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('#addWithCustomPrice').click();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    addToCartWithCustomPrice(productId, customPrice = null) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const stock = parseInt(product.stock) || 0;
        if (stock < 1) {
            showNotification('Product out of stock', 'warning');
            return;
        }

        const price = customPrice !== null ? parseFloat(customPrice) : parseFloat(product.selling_price) || 0;
        const existingItem = this.cart.find(item => item.id === productId);

        if (existingItem) {
            if (existingItem.quantity >= stock) {
                showNotification(`Only ${stock} units available in stock`, 'warning');
                return;
            }
            existingItem.quantity += 1;
            if (customPrice !== null && existingItem.price !== price) {
                existingItem.price = price;
                existingItem.price_changed = true;
            }
        } else {
            this.cart.push({
                id: product.id,
                name: product.product_name || 'Unnamed Product',
                sku: product.sku || 'N/A',
                price: price,
                original_price: parseFloat(product.selling_price) || 0,
                cost_price: parseFloat(product.cost_price) || 0, // Store cost price
                quantity: 1,
                stock: stock,
                product_image: product.product_image || null,
                price_changed: customPrice !== null
            });
        }

        this.updateCartDisplay();

        const productName = product.product_name || 'Product';
        const message = customPrice !== null && customPrice !== parseFloat(product.selling_price)
            ? `${productName} added at negotiated price ${formatCurrency(price)}`
            : `${productName} added to cart`;
        showNotification(message, 'success');
    }

    editCartItemPrice(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        if (!cartItem) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Price</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Product: <strong>${cartItem.name}</strong></label>
                    </div>
                    <div class="form-group">
                        <label>Original Price</label>
                        <input type="number" class="form-control" 
                               value="${cartItem.original_price.toFixed(2)}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="editPrice">Current Price</label>
                        <input type="number" id="editPrice" class="form-control" 
                               value="${cartItem.price.toFixed(2)}" 
                               min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Total for ${cartItem.quantity} units</label>
                        <input type="number" id="editTotal" class="form-control" 
                               value="${(cartItem.price * cartItem.quantity).toFixed(2)}" 
                               readonly>
                    </div>
                    <div class="form-row" style="margin-top: 15px;">
                        <div class="form-group">
                            <button class="btn btn-secondary btn-block close-edit-modal">
                                Cancel
                            </button>
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary btn-block" id="savePrice">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const editPriceInput = modal.querySelector('#editPrice');
        const editTotalInput = modal.querySelector('#editTotal');

        editPriceInput.addEventListener('input', () => {
            const newPrice = parseFloat(editPriceInput.value) || 0;
            const total = newPrice * cartItem.quantity;
            editTotalInput.value = total.toFixed(2);
        });

        setTimeout(() => {
            editPriceInput.focus();
            editPriceInput.select();
        }, 100);

        modal.querySelector('#savePrice').addEventListener('click', () => {
            const newPrice = parseFloat(editPriceInput.value);

            if (isNaN(newPrice) || newPrice < 0) {
                showNotification('Please enter a valid price', 'error');
                editPriceInput.focus();
                return;
            }

            cartItem.price = newPrice;
            cartItem.price_changed = newPrice !== cartItem.original_price;
            this.updateCartDisplay();
            showNotification('Price updated successfully', 'success');
            modal.remove();
        });

        modal.querySelector('.close-edit-modal').addEventListener('click', () => {
            modal.remove();
        });

        editPriceInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('#savePrice').click();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            const itemName = this.cart[index].name;
            this.cart.splice(index, 1);
            this.updateCartDisplay();
            showNotification(`${itemName} removed from cart`, 'info');
        }
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        if (quantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        if (quantity > item.stock) {
            showNotification(`Only ${item.stock} units available`, 'warning');
            quantity = item.stock;
        }

        item.quantity = quantity;
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-basket"></i>
                    </div>
                    <h5>Your cart is empty</h5>
                    <p>Select products from the list to start a sale</p>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <img src="${item.product_image || 'https://via.placeholder.com/150?text=No+Image'}" 
                             class="product-img-cart" 
                             alt="${item.name}">
                        <div class="cart-item-info">
                            <div class="cart-item-name">
                                <strong>${item.name}</strong>
                                <small>SKU: ${item.sku}</small>
                                ${item.price_changed ?
                    `<span class="price-changed-badge">Negotiated</span>` :
                    ''}
                            </div>
                            <div class="cart-item-price">
                                <span class="price-text">${formatCurrency(item.price)} × </span>
                                <input type="number" 
                                       class="cart-quantity" 
                                       data-id="${item.id}"
                                       value="${item.quantity}" 
                                       min="1" 
                                       max="${item.stock}">
                            </div>
                            <div class="cart-item-actions">
                                <button class="btn btn-sm btn-light edit-price-btn" data-id="${item.id}" title="Edit Price">
                                    <i class="fas fa-tag"></i>
                                </button>
                                <button class="btn btn-sm btn-light text-danger remove-from-cart" data-id="${item.id}" title="Remove">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        this.updateCartTotals();
    }

    updateCartTotals() {
        this.cartSubtotal = this.cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        this.cartTotal = this.cartSubtotal - this.discount;
        if (this.cartTotal < 0) this.cartTotal = 0;

        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');

        if (subtotalElement) {
            subtotalElement.textContent = formatCurrency(this.cartSubtotal);
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(this.cartTotal);
        }

        const pendingAmount = document.getElementById('pendingAmount');
        const amountPaid = document.getElementById('amountPaid');
        if (pendingAmount && amountPaid) {
            const paid = parseFloat(amountPaid.value) || 0;
            pendingAmount.value = (this.cartTotal - paid).toFixed(2);
        }

        // Update cart count badge
        this.updateCartCount();
    }

    updateCartCount() {
        const cartCountBadge = document.getElementById('cartCountBadge');
        if (!cartCountBadge) return;

        const itemCount = this.cart.length;

        if (itemCount > 0) {
            cartCountBadge.textContent = itemCount;
            cartCountBadge.classList.add('active');
        } else {
            cartCountBadge.textContent = '0';
            cartCountBadge.classList.remove('active');
        }
    }

    toggleMobileCart() {
        const cartSection = document.getElementById('cartSection');
        const cartBackdrop = document.getElementById('cartBackdrop');

        if (!cartSection || !cartBackdrop) return;

        const isActive = cartSection.classList.contains('active');

        if (isActive) {
            this.closeMobileCart();
        } else {
            this.openMobileCart();
        }
    }

    openMobileCart() {
        const cartSection = document.getElementById('cartSection');
        const cartBackdrop = document.getElementById('cartBackdrop');

        if (cartSection) {
            cartSection.classList.add('active');
        }

        if (cartBackdrop) {
            cartBackdrop.classList.add('active');
        }

        // Prevent body scroll when cart is open
        document.body.style.overflow = 'hidden';
    }

    closeMobileCart() {
        const cartSection = document.getElementById('cartSection');
        const cartBackdrop = document.getElementById('cartBackdrop');

        if (cartSection) {
            cartSection.classList.remove('active');
        }

        if (cartBackdrop) {
            cartBackdrop.classList.remove('active');
        }

        // Restore body scroll
        document.body.style.overflow = '';
    }

    togglePaymentFields(paymentMethod) {
        const creditInfo = document.getElementById('creditInfo');
        const cashPayment = document.getElementById('cashPayment');

        if (!creditInfo || !cashPayment) return;

        // Update active card class
        document.querySelectorAll('.payment-card').forEach(card => {
            if (card.dataset.method === paymentMethod) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        if (paymentMethod === 'credit') {
            creditInfo.style.display = 'block';
            cashPayment.style.display = 'none';
        } else {
            creditInfo.style.display = 'none';
            cashPayment.style.display = 'block';
        }
    }

    async processCheckout() {
        if (this.cart.length === 0) {
            showNotification('Cart is empty', 'warning');
            return;
        }

        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethodElement) {
            showNotification('Please select payment method', 'error');
            return;
        }
        const paymentMethod = paymentMethodElement.value;

        if (paymentMethod === 'credit') {
            const buyerName = document.getElementById('buyerName');
            const buyerPhone = document.getElementById('buyerPhone');
            const amountPaid = document.getElementById('amountPaid');

            if (!buyerName || !buyerPhone) {
                showNotification('Please enter buyer information for credit sale', 'error');
                return;
            }

            const name = buyerName.value.trim();
            const phone = buyerPhone.value.trim();
            const paid = parseFloat(amountPaid?.value || 0) || 0;

            if (!name || !phone) {
                showNotification('Buyer name and phone are required for credit sales', 'error');
                return;
            }

            if (paid > this.cartTotal) {
                showNotification('Amount paid cannot exceed total amount', 'error');
                return;
            }
        } else if (paymentMethod === 'cash') {
            const amountReceived = document.getElementById('amountReceived');
            if (amountReceived) {
                const received = parseFloat(amountReceived.value) || 0;
                if (received < this.cartTotal) {
                    showNotification('Insufficient amount received', 'error');
                    return;
                }
            }
        }

        showLoading(true);

        try {
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const total = this.cartTotal;

            const currentUser = authManager.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Get user identifier - FIXED: Use username/email instead of UUID
            let soldByValue = currentUser.username || currentUser.email || 'pos_user';

            const saleData = {
                shop_id: this.shopId,
                invoice_number: invoiceNumber,
                total_amount: total,
                discount_amount: this.discount,
                payment_method: paymentMethod,
                sold_by: soldByValue, // Using text instead of UUID
                amount_paid: total,
                pending_amount: 0,
                sale_status: 'completed'
            };

            if (paymentMethod === 'credit') {
                const buyerName = document.getElementById('buyerName');
                const buyerPhone = document.getElementById('buyerPhone');
                const buyerAddress = document.getElementById('buyerAddress');
                const amountPaid = document.getElementById('amountPaid');

                saleData.buyer_name = buyerName ? buyerName.value.trim() : '';
                saleData.buyer_phone = buyerPhone ? buyerPhone.value.trim() : '';
                saleData.buyer_address = buyerAddress ? buyerAddress.value.trim() : '';

                const paid = parseFloat(amountPaid?.value || 0) || 0;
                saleData.amount_paid = paid;
                saleData.pending_amount = total - paid;
                saleData.sale_status = 'credit';

                if (!saleData.buyer_name || !saleData.buyer_phone) {
                    throw new Error('Buyer name and phone are required for credit sales');
                }
            }



            // Create sale record
            const { data: sale, error: saleError } = await supabaseClient
                .from('sales')
                .insert([saleData])
                .select()
                .single();

            if (saleError) {


                // If error is about sold_by, try alternative approach
                if (saleError.message.includes('sold_by')) {
                    // Try with a simpler sold_by value
                    saleData.sold_by = 'system';

                    const { data: sale2, error: saleError2 } = await supabaseClient
                        .from('sales')
                        .insert([saleData])
                        .select()
                        .single();

                    if (saleError2) throw saleError2;
                    return await this.completeSaleProcess(sale2.id, paymentMethod, total, saleData);
                }

                throw saleError;
            }

            await this.completeSaleProcess(sale.id, paymentMethod, total, saleData);

        } catch (error) {


            let errorMessage = 'Failed to process sale';
            if (error.message) {
                errorMessage += ': ' + error.message;
            }

            showNotification(errorMessage, 'error');
        } finally {
            showLoading(false);
        }
    }

    async completeSaleProcess(saleId, paymentMethod, total, saleData) {
        try {
            // Insert sale items
            const saleItems = this.cart.map(item => ({
                sale_id: saleId,
                product_id: item.id,
                product_name: item.name, // Save snapshot of name
                sku: item.sku,           // Save snapshot of SKU
                product_image: item.product_image, // Save snapshot of image
                quantity: item.quantity,
                unit_price: item.price,
                original_price: item.original_price,
                cost_price: item.cost_price,
                total_price: item.price * item.quantity,
                price_changed: item.price_changed || false
            }));



            const { error: itemsError } = await supabaseClient
                .from('sale_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;



            // Update product stock
            await this.updateProductStocks();

            // Create credit record if needed
            if (paymentMethod === 'credit' && saleData.pending_amount > 0) {
                const creditData = {
                    shop_id: this.shopId,
                    buyer_name: saleData.buyer_name,
                    buyer_phone: saleData.buyer_phone,
                    buyer_address: saleData.buyer_address || '',
                    total_amount: total,
                    amount_paid: saleData.amount_paid,
                    pending_amount: saleData.pending_amount,
                    credit_date: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    sale_id: saleId
                };



                const { error: creditError } = await supabaseClient
                    .from('credits')
                    .insert([creditData]);

                if (creditError) {

                }
            }

            showNotification('Sale completed successfully!', 'success');

            // Clear cart
            this.clearCart();

            // Reset form
            this.resetPaymentForm();

            // Reload recent transactions
            await this.loadRecentTransactions();

            // Reload products to show updated stock
            await this.loadProducts();

            // Get sale details for invoice
            const { data: sale } = await supabaseClient
                .from('sales')
                .select('*')
                .eq('id', saleId)
                .single();

            // Show invoice modal
            this.showInvoice(sale, this.cart);

            // Audit Log
            if (window.authManager) {
                await window.authManager.createAuditLog('sell', 'sales', saleId, null, {
                    invoice_number: sale.invoice_number,
                    total_amount: total,
                    payment_method: paymentMethod,
                    items_count: saleItems.length
                });
            }

        } catch (error) {

            throw error;
        }
    }

    async updateProductStocks() {


        for (const item of this.cart) {
            try {
                const { data: product, error: fetchError } = await supabaseClient
                    .from('products')
                    .select('stock, product_name')
                    .eq('id', item.id)
                    .eq('shop_id', this.shopId)
                    .single();

                if (fetchError) {

                    throw new Error(`Product ${item.id} not found`);
                }

                if (!product) {
                    throw new Error(`Product ${item.id} not found in shop`);
                }

                const currentStock = parseInt(product.stock) || 0;

                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.product_name}. Available: ${currentStock}, Requested: ${item.quantity}`);
                }

                const newStock = currentStock - item.quantity;



                const { error: updateError } = await supabaseClient
                    .from('products')
                    .update({
                        stock: newStock,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id)
                    .eq('shop_id', this.shopId);

                if (updateError) {

                    throw updateError;
                }



                const localProduct = this.products.find(p => p.id === item.id);
                if (localProduct) {
                    localProduct.stock = newStock;
                }

            } catch (error) {

                throw error;
            }
        }


    }

    clearCart() {
        this.cart = [];
        this.discount = 0;
        this.updateCartDisplay();

        const discountInput = document.getElementById('discountAmount');
        if (discountInput) {
            discountInput.value = '';
        }

        showNotification('Cart cleared', 'info');
    }

    holdSale() {
        if (this.cart.length === 0) {
            showNotification('Cart is empty', 'warning');
            return;
        }

        const holdData = {
            cart: this.cart,
            discount: this.discount,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(`hold_sale_${this.shopId}`, JSON.stringify(holdData));

        showNotification('Sale held successfully', 'success');
    }

    loadHeldSale() {
        const heldData = localStorage.getItem(`hold_sale_${this.shopId}`);
        if (!heldData) {
            showNotification('No held sale found', 'warning');
            return;
        }

        try {
            const holdData = JSON.parse(heldData);
            this.cart = holdData.cart || [];
            this.discount = holdData.discount || 0;
            this.updateCartDisplay();

            const discountInput = document.getElementById('discountAmount');
            if (discountInput) {
                discountInput.value = this.discount;
            }

            showNotification('Held sale loaded successfully', 'success');
        } catch (error) {

            showNotification('Failed to load held sale', 'error');
        }
    }

    resetPaymentForm() {
        const buyerName = document.getElementById('buyerName');
        const buyerPhone = document.getElementById('buyerPhone');
        const buyerAddress = document.getElementById('buyerAddress');
        const amountPaid = document.getElementById('amountPaid');
        const pendingAmount = document.getElementById('pendingAmount');

        if (buyerName) buyerName.value = '';
        if (buyerPhone) buyerPhone.value = '';
        if (buyerAddress) buyerAddress.value = '';
        if (amountPaid) amountPaid.value = '';
        if (pendingAmount) pendingAmount.value = '';

        const amountReceived = document.getElementById('amountReceived');
        const changeAmount = document.getElementById('changeAmount');

        if (amountReceived) amountReceived.value = '';
        if (changeAmount) changeAmount.value = '';

        const cashRadio = document.querySelector('input[value="cash"]');
        if (cashRadio) {
            cashRadio.checked = true;
            this.togglePaymentFields('cash');
        }
    }

    async loadRecentTransactions() {
        try {
            const { data: transactions, error } = await supabaseClient
                .from('sales')
                .select(`
                    id,
                    invoice_number,
                    total_amount,
                    payment_method,
                    sale_status,
                    created_at
                `)
                .eq('shop_id', this.shopId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderRecentTransactions(transactions || []);

        } catch (error) {

        }
    }

    renderRecentTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt fa-2x"></i>
                    <p>No recent transactions</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-header">
                        <span class="invoice-number">${transaction.invoice_number}</span>
                        <span class="transaction-amount">${formatCurrency(transaction.total_amount)}</span>
                    </div>
                    <div class="transaction-details">
                        <span class="payment-method ${transaction.payment_method}">
                            ${transaction.payment_method.toUpperCase()}
                        </span>
                        <span class="transaction-time">
                            ${formatDate(transaction.created_at)}
                        </span>
                    </div>
                </div>
                <span class="transaction-status ${transaction.sale_status}">
                    ${transaction.sale_status}
                </span>
            </div>
        `).join('');
    }

    showInvoice(sale, cartItems) {
        const invoiceContent = document.getElementById('invoiceContent');
        if (!invoiceContent) return;

        const itemsHtml = cartItems.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)} 
                    ${item.price_changed ? `<small class="text-warning">(Negotiated)</small>` : ''}
                </td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        invoiceContent.innerHTML = `
            <div class="invoice">
                <div class="invoice-header">
                    <h3>INVOICE</h3>
                    <div class="invoice-number">${sale.invoice_number}</div>
                </div>
                
                <div class="invoice-details">
                    <div class="shop-info">
                        <h4>Shop Information</h4>
                        <p>Date: ${new Date(sale.created_at).toLocaleDateString()}</p>
                        <p>Time: ${new Date(sale.created_at).toLocaleTimeString()}</p>
                    </div>
                    
                    ${sale.buyer_name ? `
                    <div class="buyer-info">
                        <h4>Buyer Information</h4>
                        <p>Name: ${sale.buyer_name}</p>
                        <p>Phone: ${sale.buyer_phone}</p>
                        ${sale.buyer_address ? `<p>Address: ${sale.buyer_address}</p>` : ''}
                    </div>
                    ` : ''}
                </div>
                
                <table class="invoice-items">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(sale.total_amount + sale.discount_amount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Discount:</span>
                        <span>${formatCurrency(sale.discount_amount)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total Amount:</span>
                        <span>${formatCurrency(sale.total_amount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Amount Paid:</span>
                        <span>${formatCurrency(sale.amount_paid)}</span>
                    </div>
                    ${sale.pending_amount > 0 ? `
                    <div class="total-row pending">
                        <span>Pending Amount:</span>
                        <span>${formatCurrency(sale.pending_amount)}</span>
                    </div>
                    ` : ''}
                    <div class="total-row">
                        <span>Payment Method:</span>
                        <span>${sale.payment_method.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        `;

        const invoiceModal = document.getElementById('invoiceModal');
        if (invoiceModal) {
            invoiceModal.classList.add('active');
        }

        const printBtn = document.getElementById('printActualBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }

    printInvoice() {
        if (this.cart.length === 0) {
            showNotification('Cart is empty', 'warning');
            return;
        }

        this.showInvoice({
            invoice_number: `DRAFT-${Date.now()}`,
            total_amount: this.cartTotal,
            discount_amount: this.discount,
            amount_paid: this.cartTotal,
            pending_amount: 0,
            payment_method: 'cash',
            created_at: new Date().toISOString()
        }, this.cart);
    }

    updateCurrentTime() {
        const update = () => {
            const now = new Date();
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');

            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            }

            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
        };

        update();
        setInterval(update, 1000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Initialize POS on pos.html page
if (window.location.pathname.includes('pos.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new POSManager();
    });
}
