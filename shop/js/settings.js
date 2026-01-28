// Settings Management - Complete Implementation
class SettingsManager {
    constructor() {
        this.currentUser = null;
        this.shopId = null;
        this.shopData = null;
        this.products = [];
        this.categories = [];
        this.selectedProducts = new Set();
        this.carouselImages = []; // Array of Base64 strings
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

        // Load shop settings
        await this.loadShopSettings();

        // Load backup history
        await this.loadBackupHistory();
    }

    updateUI() {
        // Update user info
        document.getElementById('userName').textContent = this.currentUser.full_name || this.currentUser.username;
        document.getElementById('userRole').textContent = this.currentUser.role === 'shop_admin' ? 'Shop Admin' : 'Shop Staff';

        // Display Shop ID beside heading
        const shopIdDisplay = document.getElementById('shopIdDisplay');
        if (shopIdDisplay) {
            shopIdDisplay.textContent = `(ID: ${this.shopId})`;
        }

        // Generate and display shop link
        this.updateShopLink();
    }

    updateShopLink() {
        const publicLinkInput = document.getElementById('shopPublicLink');
        const viewShopBtn = document.getElementById('viewShopBtn');

        if (publicLinkInput && this.shopId) {
            const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
            let publicUrl;

            // Professional Short URL (Works locally and on web)
            if (this.shopData && this.shopData.slug) {
                // Generates: .../shop-products.html?free
                publicUrl = `${baseUrl}/shop-products.html?${encodeURIComponent(this.shopData.slug)}`;
            } else if (this.shopId) {
                publicUrl = `${baseUrl}/shop-products.html?id=${encodeURIComponent(this.shopId)}`;
            } else {
                publicUrl = '#';
            }

            publicLinkInput.value = publicUrl;

            if (viewShopBtn) {
                viewShopBtn.href = publicUrl;
            }
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Shop info form
        const shopInfoForm = document.getElementById('shopInfoForm');
        if (shopInfoForm) {
            shopInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveShopInfo();
            });
        }

        // Business settings form
        const businessForm = document.getElementById('businessForm');
        if (businessForm) {
            businessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBusinessSettings();
            });
        }

        // POS settings form
        const posForm = document.getElementById('posForm');
        if (posForm) {
            posForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePOSSettings();
            });
        }

        // Logo upload
        const uploadLogoBtn = document.getElementById('uploadLogoBtn');
        if (uploadLogoBtn) {
            uploadLogoBtn.addEventListener('click', () => {
                document.getElementById('logoFile').click();
            });
        }

        // Logo file input
        const logoFile = document.getElementById('logoFile');
        if (logoFile) {
            logoFile.addEventListener('change', (e) => {
                this.handleLogoUpload(e.target.files[0]);
            });
        }

        // Remove logo
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (removeLogoBtn) {
            removeLogoBtn.addEventListener('click', () => {
                this.removeLogo();
            });
        }

        // Export buttons
        const exportAllDataBtn = document.getElementById('exportAllDataBtn');
        if (exportAllDataBtn) {
            exportAllDataBtn.addEventListener('click', () => {
                this.exportAllData();
            });
        }

        const exportPdfReportsBtn = document.getElementById('exportPdfReportsBtn');
        if (exportPdfReportsBtn) {
            exportPdfReportsBtn.addEventListener('click', () => {
                this.exportPdfReports();
            });
        }

        const backupToCloudBtn = document.getElementById('backupToCloudBtn');
        if (backupToCloudBtn) {
            backupToCloudBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }

        // Auto backup settings
        const enableAutoBackup = document.getElementById('enableAutoBackup');
        if (enableAutoBackup) {
            enableAutoBackup.addEventListener('change', (e) => {
                this.saveAutoBackupSettings();
            });
        }

        const backupTime = document.getElementById('backupTime');
        if (backupTime) {
            backupTime.addEventListener('change', () => {
                this.saveAutoBackupSettings();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Copy Link button
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                const publicLinkInput = document.getElementById('shopPublicLink');
                if (publicLinkInput && publicLinkInput.value) {
                    publicLinkInput.select();
                    document.execCommand('copy');
                    showNotification('Shop link copied to clipboard!', 'success');
                }
            });
        }

        // Public View form
        const publicViewForm = document.getElementById('publicViewForm');
        if (publicViewForm) {
            publicViewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePublicViewSettings();
            });
        }

        // Discount Code buttons
        const addDiscountBtn = document.getElementById('addDiscountBtn');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => {
                this.showAddDiscountModal();
            });
        }

        const discountForm = document.getElementById('discountForm');
        if (discountForm) {
            discountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDiscountCode();
            });
        }

        // Carousel image selection
        const addCarouselItem = document.getElementById('addCarouselItem');
        const carouselFileInput = document.getElementById('carouselFileInput');
        if (addCarouselItem && carouselFileInput) {
            addCarouselItem.addEventListener('click', () => {
                if (this.carouselImages.length >= 5) {
                    showNotification('Max 5 images allowed', 'warning');
                    return;
                }
                carouselFileInput.click();
            });

            carouselFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handleCarouselSelection(file);
            });
        }

        // Theme selection
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                const color = card.dataset.color;

                document.getElementById('publicThemeColor').value = color;
                document.getElementById('publicThemeLayout').value = theme;

                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        // Slug live preview
        const shopSlugInput = document.getElementById('shopSlug');
        if (shopSlugInput) {
            shopSlugInput.addEventListener('input', () => {
                const slug = shopSlugInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
                if (this.shopData) {
                    this.shopData.slug = slug;
                    this.updateShopLink();
                }
            });
        }
    }

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }

    async loadShopSettings() {
        showLoading(true);

        try {
            // Load shop data
            const { data: shop, error } = await supabaseClient
                .from('shops')
                .select('*')
                .eq('id', this.shopId)
                .single();

            if (error) throw error;

            this.shopData = shop;



            // Load shop settings
            const { data: settings, error: settingsError } = await supabaseClient
                .from('shop_settings')
                .select('*')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (settingsError) console.warn('Settings load error:', settingsError);

            // Populate forms
            this.populateShopInfoForm(shop);
            this.populateBusinessSettings(settings);
            this.populatePOSSettings(settings);
            this.populatePublicViewSettings(settings);

            // Handle discount codes (ensure it's an array)
            let discounts = settings?.discount_codes || [];
            if (typeof discounts === 'string') {
                try { discounts = JSON.parse(discounts); } catch (e) { discounts = []; }
            }
            this.renderDiscountCodes(discounts);

        } catch (error) {

            showNotification('Failed to load shop settings', 'error');
        } finally {
            showLoading(false);
        }
    }

    populateShopInfoForm(shop) {
        if (!shop) return;

        document.getElementById('shopName').value = shop.shop_name || '';
        document.getElementById('shopSlug').value = shop.slug || '';
        document.getElementById('shopAddress').value = shop.address || '';
        document.getElementById('shopPhone').value = shop.phone || '';

        // Set logo preview - Column is shop_logo, not logo_url
        const logoPreview = document.getElementById('logoPreview');
        if (shop.shop_logo) {
            logoPreview.src = shop.shop_logo;
        } else {
            logoPreview.src = 'assets/default-shop-logo.png';
        }

        // Update link whenever form is populated
        this.updateShopLink();
    }

    populateBusinessSettings(settings) {
        const businessType = this.shopData?.business_type || settings?.business_type || 'general';
        document.getElementById('businessType').value = businessType;
        document.getElementById('shopCurrency').value = settings?.currency || 'INR';
        document.getElementById('taxRate').value = settings?.tax_rate || '18';
        document.getElementById('profitMargin').value = settings.default_profit_margin || '30';
        document.getElementById('enableTax').checked = settings.enable_tax_calculation !== false;
        document.getElementById('enableLowStockAlert').checked = settings.enable_low_stock_alert !== false;
        document.getElementById('lowStockThreshold').value = settings.low_stock_threshold || '10';

        // Load current_balance from shopData
        if (this.shopData) {
            document.getElementById('shopAsset').value = this.shopData.current_balance || 0;
        }
    }

    populatePOSSettings(settings) {
        if (!settings) {
            // Set defaults
            document.getElementById('defaultPaymentMethod').value = 'cash';
            document.getElementById('enableBarcodeScanner').checked = true;
            document.getElementById('enableQuickSale').checked = true;
            document.getElementById('autoPrintInvoice').checked = false;
            document.getElementById('receiptHeader').value = 'Thank you for shopping with us!';
            document.getElementById('receiptFooter').value = 'Please visit again!';
            return;
        }

        document.getElementById('defaultPaymentMethod').value = settings.default_payment_method || 'cash';
        document.getElementById('enableBarcodeScanner').checked = settings.enable_barcode_scanner !== false;
        document.getElementById('enableQuickSale').checked = settings.enable_quick_sale !== false;
        document.getElementById('autoPrintInvoice').checked = settings.auto_print_invoice || false;
        document.getElementById('receiptHeader').value = settings.receipt_header || 'Thank you for shopping with us!';
        document.getElementById('receiptFooter').value = settings.receipt_footer || 'Please visit again!';
    }

    async saveShopInfo() {
        const shopName = document.getElementById('shopName').value.trim();
        const slug = document.getElementById('shopSlug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        const address = document.getElementById('shopAddress').value.trim();
        const phone = document.getElementById('shopPhone').value.trim();

        // Validate
        if (!shopName || !slug) {
            showNotification('Shop name and unique address are required', 'error');
            return;
        }

        showLoading(true);

        try {
            // Check if slug is already taken by another shop
            const { data: slugCheck } = await supabaseClient
                .from('shops')
                .select('id')
                .eq('slug', slug)
                .neq('id', this.shopId)
                .maybeSingle();

            if (slugCheck) {
                showNotification('This unique address is already taken. Please choose another.', 'error');
                showLoading(false);
                return;
            }

            const shopData = {
                shop_name: shopName,
                slug: slug,
                address: address || null,
                phone: phone || null,
                updated_at: new Date().toISOString()
            };



            const { data, error } = await supabaseClient
                .from('shops')
                .update(shopData)
                .eq('id', this.shopId)
                .select();

            if (error) {

                throw error;
            }


            if (data && data[0]) this.shopData = data[0]; // Update local cache

            // Create audit log
            await this.createAuditLog('update', 'shops', this.shopId, null, {
                shop_name: shopName,
                updated_fields: ['shop_name', 'address', 'phone']
            });

            // Update shop name display
            this.updateShopNameDisplay(shopName);

            // Refresh the public link display
            this.updateShopLink();

            showNotification('Shop information saved successfully', 'success');

        } catch (error) {

            showNotification('Failed to save shop information: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async saveBusinessSettings() {
        const businessType = document.getElementById('businessType').value;
        const currency = document.getElementById('shopCurrency').value;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;
        const enableTax = document.getElementById('enableTax').checked;
        const enableLowStockAlert = document.getElementById('enableLowStockAlert').checked;
        const lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value) || 10;

        showLoading(true);

        try {
            const settingsData = {
                shop_id: this.shopId,
                business_type: businessType,
                currency: currency,
                tax_rate: taxRate,
                default_profit_margin: profitMargin,
                enable_tax_calculation: enableTax,
                enable_low_stock_alert: enableLowStockAlert,
                low_stock_threshold: lowStockThreshold,
                updated_at: new Date().toISOString()
            };

            // Check if settings exist using maybeSingle (doesn't error on 0 rows)
            const { data: existingSettings, error: checkError } = await supabaseClient
                .from('shop_settings')
                .select('id')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (checkError) console.warn('Settings check error:', checkError.message);

            let result;
            let businessTypeSaved = true;

            const performSave = async (data) => {
                if (existingSettings) {
                    return await supabaseClient
                        .from('shop_settings')
                        .update(data)
                        .eq('shop_id', this.shopId)
                        .select()
                        .maybeSingle();
                } else {
                    return await supabaseClient
                        .from('shop_settings')
                        .insert([data])
                        .select()
                        .maybeSingle();
                }
            };

            let { data: savedData, error: saveError } = await performSave(settingsData);

            if (saveError) {
                // If column is missing, retry without it
                if (saveError.message.includes('column "business_type" does not exist')) {
                    businessTypeSaved = false;
                    const fallbackData = { ...settingsData };
                    delete fallbackData.business_type;

                    const { data: retryData, error: retryError } = await performSave(fallbackData);
                    if (retryError) throw retryError;
                    result = retryData;
                } else {
                    throw saveError;
                }
            } else {
                result = savedData;
            }

            // Save business_type and current_balance to shops table so it's in sync for Super Admin
            const shopAsset = parseFloat(document.getElementById('shopAsset').value) || 0;
            const shopUpdateData = {
                business_type: businessType,
                current_balance: shopAsset,
                updated_at: new Date().toISOString()
            };

            const { error: shopError } = await supabaseClient
                .from('shops')
                .update(shopUpdateData)
                .eq('id', this.shopId);

            if (shopError) {
                // If current_balance or business_type missing, try update without it but still updated_at
                if (shopError.message.includes('column')) {
                    console.warn('One or more columns missing in shops table:', shopError.message);
                } else {
                    console.error('Shop update error:', shopError.message);
                }
            } else if (this.shopData) {
                this.shopData.current_balance = shopAsset;
                this.shopData.business_type = businessType;
            }

            // Create audit log
            if (result && result.id) {
                await this.createAuditLog('update', 'shop_settings', result.id, null, {
                    currency: currency,
                    tax_rate: taxRate,
                    updated_fields: Object.keys(settingsData)
                });
            }

            showNotification('Business settings saved successfully', 'success');

        } catch (error) {
            console.error('Critical save error:', error);
            showNotification('Failed to save business settings: ' + (error.message || 'Unknown Error'), 'error');
        } finally {
            showLoading(false);
        }
    }

    async savePOSSettings() {
        const defaultPaymentMethod = document.getElementById('defaultPaymentMethod').value;
        const enableBarcodeScanner = document.getElementById('enableBarcodeScanner').checked;
        const enableQuickSale = document.getElementById('enableQuickSale').checked;
        const autoPrintInvoice = document.getElementById('autoPrintInvoice').checked;
        const receiptHeader = document.getElementById('receiptHeader').value.trim();
        const receiptFooter = document.getElementById('receiptFooter').value.trim();

        showLoading(true);

        try {
            const settingsData = {
                shop_id: this.shopId,
                default_payment_method: defaultPaymentMethod,
                enable_barcode_scanner: enableBarcodeScanner,
                enable_quick_sale: enableQuickSale,
                auto_print_invoice: autoPrintInvoice,
                receipt_header: receiptHeader,
                receipt_footer: receiptFooter,
                updated_at: new Date().toISOString()
            };

            // Check if settings exist
            const { data: existingSettings } = await supabaseClient
                .from('shop_settings')
                .select('id')
                .eq('shop_id', this.shopId)
                .single();

            let result;

            if (existingSettings) {
                // Update existing settings
                const { data, error } = await supabaseClient
                    .from('shop_settings')
                    .update(settingsData)
                    .eq('shop_id', this.shopId)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // Create new settings
                const { data, error } = await supabaseClient
                    .from('shop_settings')
                    .insert([settingsData])
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            // Create audit log
            await this.createAuditLog('update', 'shop_settings', result.id, null, {
                default_payment_method: defaultPaymentMethod,
                updated_fields: Object.keys(settingsData)
            });

            showNotification('POS settings saved successfully', 'success');

        } catch (error) {

            showNotification('Failed to save POS settings', 'error');
        } finally {
            showLoading(false);
        }
    }

    populatePublicViewSettings(settings) {
        if (settings) {
            document.getElementById('publicWhatsapp').value = settings.whatsapp_number || '';
            document.getElementById('publicTelegram').value = settings.telegram_id || '';
            document.getElementById('publicFacebook').value = settings.facebook_url || '';
            document.getElementById('publicInstagram').value = settings.instagram_url || '';
            document.getElementById('publicMapsUrl').value = settings.google_maps_url || '';
            document.getElementById('publicOpeningHours').value = settings.opening_hours || '';
            document.getElementById('publicAboutUs').value = settings.about_us || '';
            document.getElementById('publicThemeColor').value = settings.theme_color || '#0f6425';
            document.getElementById('publicThemeLayout').value = settings.theme_layout || 'default';
            document.getElementById('publicBannerText').value = settings.banner_text || '';
            document.getElementById('publicCustomDomain').value = settings.custom_domain || '';
            document.getElementById('publicKeywords').value = settings.seo_keywords || '';
            document.getElementById('publicCustomScripts').value = settings.custom_scripts || '';

            // Update active theme card
            const layout = settings.theme_layout || 'default';
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === layout);
            });

            this.carouselImages = settings.carousel_images || [];
        } else {
            this.carouselImages = [];
        }

        // Always render, so the "Add" button shows up
        this.renderCarouselPreviews();
    }

    handleCarouselSelection(file) {
        if (file.size > 1024 * 1024) { // Max 1MB each
            showNotification('Image size should be less than 1MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.carouselImages.push(e.target.result);
            this.renderCarouselPreviews();
        };
        reader.readAsDataURL(file);
    }

    renderCarouselPreviews() {
        try {
            const grid = document.getElementById('carouselPreview');
            const addBtn = document.getElementById('addCarouselItem');
            if (!grid || !addBtn) return;

            grid.innerHTML = ''; // Clear only previews

            if (!Array.isArray(this.carouselImages)) this.carouselImages = [];

            this.carouselImages.forEach((src, index) => {
                const item = document.createElement('div');
                item.className = 'carousel-preview-item';
                item.innerHTML = `
                    <img src="${src}" alt="Slide ${index + 1}">
                    <button type="button" class="remove-carousel-item" onclick="app.removeCarouselImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                grid.appendChild(item);
            });

            // Show/Hide the add button instead of deleting it
            if (this.carouselImages.length >= 5) {
                addBtn.style.display = 'none';
            } else {
                addBtn.style.display = 'flex';
            }
        } catch (err) {
            console.error('Error rendering carousel:', err);
        }
    }

    removeCarouselImage(index) {
        this.carouselImages.splice(index, 1);
        this.renderCarouselPreviews();
    }

    async savePublicViewSettings() {
        const whatsappNumber = document.getElementById('publicWhatsapp')?.value.trim() || '';
        const telegramId = document.getElementById('publicTelegram')?.value.trim() || '';
        const facebookUrl = document.getElementById('publicFacebook')?.value.trim() || '';
        const instagramUrl = document.getElementById('publicInstagram')?.value.trim() || '';
        let mapsUrl = document.getElementById('publicMapsUrl')?.value.trim() || '';

        // Auto-extract src from iframe if user pastes the whole tag
        if (mapsUrl.includes('<iframe')) {
            const match = mapsUrl.match(/src=["']([^"']+)["']/);
            if (match && match[1]) {
                mapsUrl = match[1];
            }
        }

        // Validation: Google Maps URLs must contain /embed to work in an iframe
        if (mapsUrl && mapsUrl.includes('google.com/maps') && !mapsUrl.includes('/embed')) {
            showNotification('Invalid Map URL. Please use the "Embed a map" option in Google Maps, not the standard link.', 'error');
            showLoading(false);
            return;
        }
        const openingHours = document.getElementById('publicOpeningHours')?.value.trim() || '';
        const aboutUs = document.getElementById('publicAboutUs')?.value.trim() || '';
        const themeColor = document.getElementById('publicThemeColor')?.value || '#0f6425';
        const themeLayout = document.getElementById('publicThemeLayout')?.value || 'default';
        const bannerText = document.getElementById('publicBannerText')?.value.trim() || '';
        const customDomain = document.getElementById('publicCustomDomain')?.value.trim() || '';
        const seoKeywords = document.getElementById('publicKeywords')?.value.trim() || '';
        const customScripts = document.getElementById('publicCustomScripts')?.value.trim() || '';

        showLoading(true);

        try {
            const settingsData = {
                shop_id: this.shopId,
                whatsapp_number: whatsappNumber,
                telegram_id: telegramId,
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                google_maps_url: mapsUrl,
                opening_hours: openingHours,
                about_us: aboutUs,
                theme_color: themeColor,
                theme_layout: themeLayout,
                carousel_images: this.carouselImages,
                banner_text: bannerText,
                custom_domain: customDomain,
                seo_keywords: seoKeywords,
                custom_scripts: customScripts,
                updated_at: new Date().toISOString()
            };

            const { data: existingSettings, error: checkError } = await supabaseClient
                .from('shop_settings')
                .select('id')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (checkError) throw checkError;

            let result;
            if (existingSettings) {
                const { error: updateError } = await supabaseClient
                    .from('shop_settings')
                    .update(settingsData)
                    .eq('shop_id', this.shopId);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabaseClient
                    .from('shop_settings')
                    .insert([settingsData]);
                if (insertError) throw insertError;
            }

            // Sync with current shop settings locally if needed
            showNotification('Public view settings saved successfully', 'success');
        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save public view settings: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    showAddDiscountModal() {
        document.getElementById('discountModalTitle').textContent = 'Add Discount Code';
        document.getElementById('discountForm').reset();
        document.getElementById('discountId').value = '';
        document.getElementById('discountModal').classList.add('active');
    }

    async saveDiscountCode() {
        const id = document.getElementById('discountId').value;
        const name = document.getElementById('discountCodeName').value.trim().toUpperCase();
        const type = document.getElementById('discountType').value;
        const value = parseFloat(document.getElementById('discountValue').value) || 0;
        const minOrder = parseFloat(document.getElementById('discountMinOrder').value) || 0;
        const status = document.getElementById('discountStatus').value;
        const description = document.getElementById('discountDescription').value.trim();

        if (!name || value <= 0) {
            showNotification('Please enter a valid code and value', 'error');
            return;
        }

        showLoading(true);

        try {
            // First, get current settings to avoid overwriting other fields
            const { data: settings, error: fetchError } = await supabaseClient
                .from('shop_settings')
                .select('*')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let discounts = settings?.discount_codes || [];
            if (typeof discounts === 'string') {
                try { discounts = JSON.parse(discounts); } catch (e) { discounts = []; }
            }
            if (!Array.isArray(discounts)) discounts = [];

            if (id) {
                // Update existing
                discounts = discounts.map(d => d.id === id ? { ...d, name, type, value, minOrder, status, description } : d);
            } else {
                // Add new
                const newDiscount = {
                    id: Date.now().toString(),
                    name, type, value, minOrder, status, description,
                    created_at: new Date().toISOString()
                };
                discounts.push(newDiscount);
            }

            if (settings) {
                // Update existing
                const { error: saveError } = await supabaseClient
                    .from('shop_settings')
                    .update({
                        discount_codes: discounts,
                        updated_at: new Date().toISOString()
                    })
                    .eq('shop_id', this.shopId);

                if (saveError) throw saveError;
            } else {
                // Create new
                const { error: saveError } = await supabaseClient
                    .from('shop_settings')
                    .insert([{
                        shop_id: this.shopId,
                        discount_codes: discounts,
                        updated_at: new Date().toISOString()
                    }]);

                if (saveError) throw saveError;
            }

            showNotification('Discount code saved successfully', 'success');
            this.renderDiscountCodes(discounts);
            this.closeAllModals();
        } catch (error) {
            console.error('Save Error:', error);
            showNotification('Failed to save discount code: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    renderDiscountCodes(discounts) {
        const tbody = document.getElementById('discountsTableBody');
        if (!tbody) return;

        // Ensure discounts is a valid array
        if (typeof discounts === 'string') {
            try { discounts = JSON.parse(discounts); } catch (e) { discounts = []; }
        }
        if (!Array.isArray(discounts)) discounts = [];

        if (discounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No discount codes found</td></tr>';
            return;
        }

        tbody.innerHTML = discounts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(d => `
            <tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                <td>${d.type === 'percentage' ? d.value + '%' : formatCurrency(d.value)}</td>
                <td>${formatCurrency(d.minOrder)}</td>
                <td><span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}">${d.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info edit-discount" data-id="${d.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-discount" data-id="${d.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        // Add listeners
        tbody.querySelectorAll('.edit-discount').forEach(btn => {
            btn.addEventListener('click', () => {
                const discount = discounts.find(d => d.id === btn.dataset.id);
                this.showEditDiscountModal(discount);
            });
        });

        tbody.querySelectorAll('.delete-discount').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this discount code?')) {
                    this.deleteDiscountCode(btn.dataset.id);
                }
            });
        });
    }

    showEditDiscountModal(d) {
        document.getElementById('discountModalTitle').textContent = 'Edit Discount Code';
        document.getElementById('discountId').value = d.id;
        document.getElementById('discountCodeName').value = d.name;
        document.getElementById('discountType').value = d.type;
        document.getElementById('discountValue').value = d.value;
        document.getElementById('discountMinOrder').value = d.minOrder;
        document.getElementById('discountStatus').value = d.status;
        document.getElementById('discountDescription').value = d.description || '';
        document.getElementById('discountModal').classList.add('active');
    }

    async deleteDiscountCode(id) {
        showLoading(true);
        try {
            const { data: settings } = await supabaseClient
                .from('shop_settings')
                .select('discount_codes')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            let discounts = settings?.discount_codes || [];
            if (typeof discounts === 'string') {
                try { discounts = JSON.parse(discounts); } catch (e) { discounts = []; }
            }
            discounts = discounts.filter(d => d.id !== id);

            await supabaseClient
                .from('shop_settings')
                .update({ discount_codes: discounts, updated_at: new Date().toISOString() })
                .eq('shop_id', this.shopId);

            showNotification('Discount code deleted', 'success');
            this.renderDiscountCodes(discounts);
        } catch (error) {
            showNotification('Failed to delete discount code', 'error');
        } finally {
            showLoading(false);
        }
    }

    async handleLogoUpload(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please upload a valid image file (JPEG, PNG, GIF, WebP)', 'error');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image size should be less than 2MB', 'error');
            return;
        }

        showLoading(true);

        try {
            // In a real application, you would upload to Supabase Storage or another service
            // For now, we'll convert to base64 and store as a data URL
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64Image = e.target.result;

                // Update shop record with logo URL - Column is shop_logo
                const { error } = await supabaseClient
                    .from('shops')
                    .update({
                        shop_logo: base64Image,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.shopId);

                if (error) throw error;

                // Update preview
                document.getElementById('logoPreview').src = base64Image;

                // Create audit log
                await this.createAuditLog('update', 'shops', this.shopId, null, {
                    logo_updated: true
                });

                showNotification('Logo uploaded successfully', 'success');
                showLoading(false);
            };

            reader.onerror = () => {
                throw new Error('Failed to read file');
            };

            reader.readAsDataURL(file);

        } catch (error) {

            showNotification('Failed to upload logo', 'error');
            showLoading(false);
        }
    }

    async removeLogo() {
        if (!confirm('Are you sure you want to remove the shop logo?')) {
            return;
        }

        showLoading(true);

        try {
            const { error } = await supabaseClient
                .from('shops')
                .update({
                    shop_logo: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.shopId);

            if (error) throw error;

            // Reset to default logo
            document.getElementById('logoPreview').src = 'assets/default-shop-logo.png';

            // Create audit log
            await this.createAuditLog('update', 'shops', this.shopId, null, {
                logo_removed: true
            });

            showNotification('Logo removed successfully', 'success');

        } catch (error) {

            showNotification('Failed to remove logo', 'error');
        } finally {
            showLoading(false);
        }
    }

    async exportAllData() {
        showLoading(true);

        try {
            // Export all shop data to a single JSON file
            const exportData = {
                shop_info: this.shopData,
                timestamp: new Date().toISOString(),
                exported_by: this.currentUser.id
            };

            // Get all data tables
            const tables = ['products', 'sales', 'sale_items', 'credits', 'credit_payments', 'expenses', 'profiles'];

            for (const table of tables) {
                const { data, error } = await supabaseClient
                    .from(table)
                    .select('*')
                    .eq('shop_id', this.shopId);

                if (!error && data) {
                    exportData[table] = data;
                }
            }

            // Convert to JSON string
            const jsonString = JSON.stringify(exportData, null, 2);

            // Create download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shop_backup_${this.shopId}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Record backup
            await this.recordBackup('full_export', 'json', exportData);

            showNotification('All data exported successfully', 'success');

        } catch (error) {

            showNotification('Failed to export data', 'error');
        } finally {
            showLoading(false);
        }
    }

    async exportPdfReports() {
        // Note: This is a placeholder. For production, use a PDF library like jsPDF or pdfmake
        showNotification('PDF export requires additional setup with a PDF library', 'info');

        // Example implementation with jsPDF:
        /*
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text('Shop Report', 10, 10);
        doc.text(`Shop: ${this.shopData.shop_name}`, 10, 20);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 30);
        
        // Add more content...
        
        doc.save('shop_report.pdf');
        */
    }

    async createBackup() {
        showLoading(true);

        try {
            // Create a backup record
            const backupData = {
                shop_id: this.shopId,
                backup_type: 'manual',
                backup_date: new Date().toISOString(),
                created_by: this.currentUser.id,
                status: 'completed',
                notes: 'Manual backup created from settings'
            };

            const { data: backup, error } = await supabaseClient
                .from('backups')
                .insert([backupData])
                .select()
                .single();

            if (error) throw error;

            // In a real application, you would also backup the actual data
            // This could involve exporting to Supabase Storage or another service

            // Create audit log
            await this.createAuditLog('create', 'backups', backup.id, null, {
                backup_type: 'manual',
                status: 'completed'
            });

            showNotification('Backup created successfully', 'success');

            // Refresh backup history
            await this.loadBackupHistory();

        } catch (error) {

            showNotification('Failed to create backup', 'error');
        } finally {
            showLoading(false);
        }
    }

    async saveAutoBackupSettings() {
        const enableAutoBackup = document.getElementById('enableAutoBackup').checked;
        const backupTime = document.getElementById('backupTime').value;

        try {
            const settingsData = {
                shop_id: this.shopId,
                enable_auto_backup: enableAutoBackup,
                auto_backup_time: backupTime,
                updated_at: new Date().toISOString()
            };

            // Update settings
            const { data: existingSettings } = await supabaseClient
                .from('shop_settings')
                .select('id')
                .eq('shop_id', this.shopId)
                .single();

            if (existingSettings) {
                await supabaseClient
                    .from('shop_settings')
                    .update(settingsData)
                    .eq('shop_id', this.shopId);
            } else {
                await supabaseClient
                    .from('shop_settings')
                    .insert([settingsData]);
            }

            if (enableAutoBackup) {
                showNotification('Auto backup enabled', 'success');
            } else {
                showNotification('Auto backup disabled', 'info');
            }

        } catch (error) {

            showNotification('Failed to save auto backup settings', 'error');
        }
    }

    async loadBackupHistory() {
        try {
            const { data: backups, error } = await supabaseClient
                .from('backups')
                .select(`
                    *,
                    profiles!backups_created_by_fkey (full_name)
                `)
                .eq('shop_id', this.shopId)
                .order('backup_date', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderBackupHistory(backups || []);

        } catch (error) {

        }
    }

    renderBackupHistory(backups) {
        const container = document.getElementById('backupsList');
        if (!container) return;

        if (backups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-database fa-2x"></i>
                    <p>No backups found</p>
                    <small>Create your first backup</small>
                </div>
            `;
            return;
        }

        container.innerHTML = backups.map(backup => {
            const backupDate = backup.backup_date ?
                new Date(backup.backup_date).toLocaleString() : 'N/A';

            const statusClass = backup.status === 'completed' ? 'success' :
                backup.status === 'failed' ? 'danger' : 'warning';

            return `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-header">
                            <span class="backup-type">${backup.backup_type || 'Manual'}</span>
                            <span class="backup-date">${backupDate}</span>
                        </div>
                        <div class="backup-details">
                            <span class="backup-status ${statusClass}">
                                ${backup.status || 'Unknown'}
                            </span>
                            <span class="backup-by">
                                By: ${backup.profiles?.full_name || 'N/A'}
                            </span>
                            ${backup.notes ? `<span class="backup-notes">${backup.notes}</span>` : ''}
                        </div>
                    </div>
                    <div class="backup-size">
                        ${backup.size ? this.formatFileSize(backup.size) : 'Unknown'}
                    </div>
                </div>
            `;
        }).join('');
    }

    async recordBackup(type, format, data) {
        try {
            // Calculate approximate size
            const size = new Blob([JSON.stringify(data)]).size;

            const backupData = {
                shop_id: this.shopId,
                backup_type: type,
                backup_date: new Date().toISOString(),
                format: format,
                size: size,
                created_by: this.currentUser.id,
                status: 'completed',
                notes: `Exported ${type} in ${format} format`
            };

            await supabaseClient
                .from('backups')
                .insert([backupData]);

        } catch (error) {

        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateShopNameDisplay(shopName) {
        // Use MenuManager to update sidebar header
        if (window.menuManager) {
            window.menuManager.updateSidebarHeader();
        }

        // Update shop name in page title if exists
        const pageTitle = document.querySelector('.navbar-left h3');
        if (pageTitle && pageTitle.textContent.includes('Shop Settings')) {
            pageTitle.textContent = `${shopName} - Settings`;
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

// Initialize on settings page
if (window.location.pathname.includes('settings.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new SettingsManager();
    });
}
