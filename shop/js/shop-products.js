// Public Shop Products Logic with Carousel, Theme Support and Cart
class ShopProductsViewer {
    constructor() {
        this.shopId = null;
        this.shopData = null;
        this.shopSettings = null;
        this.products = [];
        this.filteredProducts = [];
        this.types = new Set();
        this.cart = [];
        this.appliedDiscount = null;
        this.selectedType = 'all';
        this.selectedOrderMethod = 'whatsapp';
        this.currentSlide = 0;
        this.deferredPrompt = null;

        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        let thisShopId = urlParams.get('id');
        let shopSlug = urlParams.get('u');

        // Check for "Short Style" URL (e.g. ?free)
        if (!thisShopId && !shopSlug && window.location.search.length > 1) {
            // Take the first parameter name as the slug
            shopSlug = window.location.search.substring(1).split('&')[0].split('=')[0];
        }

        if (!thisShopId && !shopSlug) {
            console.error('URL Search Params:', window.location.search);
            this.renderError('Could not identify the shop. The link appears to be incomplete (missing Shop ID or Unique Address).');
            return;
        }

        this.shopId = thisShopId;

        try {
            console.log('Initializing Shop Viewing...');

            // Fetch Shop Data
            let shopQuery = supabaseClient.from('shops').select('*');

            if (shopSlug) {
                shopQuery = shopQuery.eq('slug', shopSlug);
            } else {
                shopQuery = shopQuery.eq('id', this.shopId);
            }

            const { data: shop, error: shopError } = await shopQuery.maybeSingle();

            if (shopError) {
                console.error('Database Error (Shops):', shopError);
                throw new Error(`Database Error: ${shopError.message}`);
            }

            if (!shop) {
                this.renderError('We couldn\'t find the shop you\'re looking for.');
                return;
            }

            // Check for restricted status (frozen or suspended)
            const status = shop.status || 'active';
            if (status.includes('frozen') || status.includes('suspended')) {
                const adminPhone = shop.admin_phone || '+91 00000 00000';
                const adminWA = shop.admin_whatsapp || adminPhone;
                const adminTG = shop.admin_telegram || '';

                const errorMsg = `
                    <div style="max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-top: 6px solid #e74c3c;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 60px; color: #e74c3c; margin-bottom: 20px;"></i>
                        <h2 style="font-size: 24px; color: #333; margin-bottom: 15px;">Shop Temporarily Unavailable</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                            This shop has been suspended by the system administrator. 
                            Please contact the administrator directly using the options below:
                        </p>
                        <div style="display: grid; gap: 10px;">
                            <a href="tel:${adminPhone}" style="display: block; padding: 15px; background: #f8f9fa; color: #333; text-decoration: none; border-radius: 10px; font-weight: 700;">
                                <i class="fas fa-phone"></i> Call Admin: ${adminPhone}
                            </a>
                            <a href="https://wa.me/${adminWA.replace(/\D/g, '')}" target="_blank" style="display: block; padding: 15px; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 10px; font-weight: 700;">
                                <i class="fab fa-whatsapp"></i> WhatsApp Admin
                            </a>
                            ${adminTG ? `
                                <a href="https://t.me/${adminTG.replace('@', '')}" target="_blank" style="display: block; padding: 15px; background: #e3f2fd; color: #1565c0; text-decoration: none; border-radius: 10px; font-weight: 700;">
                                    <i class="fab fa-telegram"></i> Telegram Admin
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
                this.renderError(errorMsg);
                return;
            }
            this.shopData = shop;
            this.shopId = shop.id; // Update shopId in case we searched by slug

            // Fetch Settings Separately (and gracefully)
            const { data: settings, error: settingsError } = await supabaseClient
                .from('shop_settings')
                .select('*')
                .eq('shop_id', this.shopId)
                .maybeSingle();

            if (settingsError) {
                console.warn('Settings load error (Non-critical):', settingsError);
            }
            this.shopSettings = settings || {};

            console.log('Shop data and settings loaded successfully.');

            this.applyTheme();
            this.updateUI();
            await this.loadProducts();
            this.loadCartFromStorage();
            this.setupEventListeners();
            this.initCarousel();

            const yearEl = document.getElementById('year');
            if (yearEl) yearEl.textContent = new Date().getFullYear();

        } catch (error) {
            console.error('Initialization error details:', error);
            this.renderError(`Something went wrong while loading the shop: ${error.message}`);
        }
    }

    applyTheme() {
        const primary = this.shopSettings.theme_color || '#0f6425';
        const layout = this.shopSettings.theme_layout || 'default';

        document.documentElement.style.setProperty('--public-primary', primary);
        const secondary = this.adjustColor(primary, -20);
        document.documentElement.style.setProperty('--public-secondary', secondary);

        // Reset defaults
        document.documentElement.style.setProperty('--public-radius', '12px');
        document.documentElement.style.setProperty('--public-font', "'Inter', sans-serif");
        document.body.style.background = '#f9f9f9';
        document.body.style.color = '#333';

        // Apply Layout Specific Styles
        switch (layout) {
            case 'ocean':
                document.documentElement.style.setProperty('--public-radius', '30px');
                break;
            case 'sunset':
                document.documentElement.style.setProperty('--public-radius', '15px');
                break;
            case 'neon':
                document.body.style.background = '#0a0a0a';
                document.body.style.color = '#fff';
                document.documentElement.style.setProperty('--public-radius', '4px');
                break;
            case 'minimal':
                document.documentElement.style.setProperty('--public-radius', '0px');
                document.body.style.background = '#ffffff';
                break;
            case 'luxe':
                document.documentElement.style.setProperty('--public-font', "'Playfair Display', serif");
                document.documentElement.style.setProperty('--public-radius', '0px');
                break;
            case 'berry':
                document.documentElement.style.setProperty('--public-radius', '20px');
                break;
            case 'eco':
                document.documentElement.style.setProperty('--public-radius', '8px');
                document.body.style.background = '#f0f4f0';
                break;
            case 'royal':
                document.documentElement.style.setProperty('--public-radius', '12px');
                break;
            case 'retro':
                document.documentElement.style.setProperty('--public-radius', '0px');
                document.documentElement.style.setProperty('--public-font', "'Space Mono', monospace");
                break;
        }

        // Add theme-specific class to body for CSS targeting
        document.body.className = `public-shop-body theme-${layout}`;
    }

    adjustColor(hex, amt) {
        let usePound = false;
        if (hex[0] == "#") {
            hex = hex.slice(1);
            usePound = true;
        }

        // Handle 3-digit hex
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        let num = parseInt(hex, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let g = ((num >> 8) & 0x00FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        let b = (num & 0x0000FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;

        const rr = r.toString(16).padStart(2, '0');
        const gg = g.toString(16).padStart(2, '0');
        const bb = b.toString(16).padStart(2, '0');

        return (usePound ? "#" : "") + rr + gg + bb;
    }

    updateUI() {
        document.title = `${this.shopData.shop_name} - Online Menu`;
        document.getElementById('publicHeaderName').textContent = this.shopData.shop_name;
        document.getElementById('footerShopName').textContent = this.shopData.shop_name;
        document.getElementById('publicHeroName').textContent = this.shopData.shop_name;
        document.getElementById('publicHeroAddress').textContent = this.shopData.address || 'Address not listed';

        // Footer & Links
        const addr = this.shopData.address || 'Address not listed';
        const phone = this.shopData.phone || 'N/A';
        const whatsapp = this.shopSettings.whatsapp_number || this.shopData.phone || '';

        document.getElementById('footerAbout').textContent = this.shopSettings.about_us || 'Experience the best shopping with us. High quality products and fast delivery.';
        document.getElementById('footerAddress').textContent = addr;
        document.getElementById('footerAddressLink').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

        document.getElementById('footerPhone').textContent = phone;
        document.getElementById('footerPhoneLink').href = `tel:${phone}`;

        document.getElementById('footerWA').textContent = whatsapp || 'N/A';
        if (whatsapp) {
            const cleanWA = whatsapp.replace(/\+/g, '').replace(/\s/g, '');
            document.getElementById('footerWALink').href = `https://wa.me/${cleanWA}`;
        }

        if (this.shopData.shop_logo) {
            document.getElementById('publicHeaderLogo').src = this.shopData.shop_logo;
        }

        if (this.shopSettings.banner_text) {
            document.getElementById('popupText').textContent = this.shopSettings.banner_text;
            setTimeout(() => {
                document.getElementById('bannerPopup').style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }, 1500); // Small delay for better UX
        }

        if (this.shopSettings.opening_hours) {
            document.getElementById('footerHours').textContent = this.shopSettings.opening_hours;
        }

        const mapsUrl = this.shopSettings.google_maps_url || this.shopSettings.maps_url;
        if (mapsUrl) {
            const container = document.getElementById('mapContainer');
            const iframe = document.getElementById('googleMap');
            if (container && iframe) {
                container.style.display = 'block';
                iframe.src = mapsUrl;
            }
        }

        if (this.shopSettings.facebook_url) document.getElementById('fbLink').href = this.shopSettings.facebook_url;
        else document.getElementById('fbLink').style.display = 'none';

        if (this.shopSettings.instagram_url) document.getElementById('igLink').href = this.shopSettings.instagram_url;
        else document.getElementById('igLink').style.display = 'none';

        // Nav Drawer Population
        document.getElementById('navShopName').textContent = this.shopData.shop_name;
        document.getElementById('navYear').textContent = new Date().getFullYear();
        if (this.shopSettings.facebook_url) document.getElementById('navFb').href = this.shopSettings.facebook_url;
        if (this.shopSettings.instagram_url) document.getElementById('navIg').href = this.shopSettings.instagram_url;

        // SEO Keywords
        if (this.shopSettings.seo_keywords) {
            let meta = document.querySelector('meta[name="keywords"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = "keywords";
                document.head.appendChild(meta);
            }
            meta.content = this.shopSettings.seo_keywords;
        }

        // Custom Scripts Injection
        if (this.shopSettings.custom_scripts) {
            // Create a temporary container
            const div = document.createElement('div');
            div.innerHTML = this.shopSettings.custom_scripts;

            // Extract and execute scripts
            Array.from(div.querySelectorAll('script')).forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                document.body.appendChild(newScript);
            });

            // Append non-script elements (like style or meta)
            Array.from(div.childNodes).forEach(node => {
                if (node.nodeName !== 'SCRIPT') {
                    document.head.appendChild(node.cloneNode(true));
                }
            });
        }
    }

    initCarousel() {
        const carousel = document.getElementById('heroCarousel');
        const dotsContainer = document.getElementById('carouselDots');
        if (!carousel || !dotsContainer) return;

        let images = this.shopSettings.carousel_images || [];

        // Handle potential stringified JSON
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch (e) { images = []; }
        }

        // Ensure images is actually an array
        if (!Array.isArray(images)) images = [];

        // If no custom images, the default one from HTML will stay (it has the IDs)
        if (images.length === 0) return;

        // Populate carousel
        carousel.innerHTML = images.map((src, index) => `
            <div class="public-carousel-item" style="background-image: url('${src}');">
                <div class="public-hero-overlay">
                    <h2 ${index === 0 ? 'id="publicHeroName"' : ''}>${this.shopData.shop_name}</h2>
                    <p ${index === 0 ? 'id="publicHeroAddress"' : ''}>${this.shopData.address || ''}</p>
                </div>
            </div>
        `).join('');

        // Populate dots
        dotsContainer.innerHTML = images.map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');

        // Reset slide
        this.currentSlide = 0;
        this.updateCarousel();

        // Clear existing interval
        if (this.carouselInterval) clearInterval(this.carouselInterval);

        if (images.length > 1) {
            this.carouselInterval = setInterval(() => {
                this.currentSlide = (this.currentSlide + 1) % images.length;
                this.updateCarousel();
            }, 5000);
        }

        dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.onclick = () => {
                this.currentSlide = parseInt(dot.dataset.index);
                this.updateCarousel();
            };
        });
    }

    updateCarousel() {
        const carousel = document.getElementById('heroCarousel');
        const dots = document.querySelectorAll('.carousel-dot');
        carousel.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === this.currentSlide));
    }

    async loadProducts() {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('shop_id', this.shopId)
                .order('product_name', { ascending: true });

            if (error) throw error;
            this.products = data || [];
            this.filteredProducts = [...this.products];
            this.products.forEach(p => { if (p.type) this.types.add(p.type); });

            this.renderTypes();
            this.renderProducts();
        } catch (error) {
            console.error(error);
            this.renderError('Failed to load products.');
        }
    }

    renderTypes() {
        const container = document.getElementById('typesContainer');
        if (!container) return;

        // Clear only generated buttons, keep the 'All' button (first child)
        // Actually easier to just rebuild or append. 
        // Let's clear everything but the first element if we want to preserve valid event listeners on "All", 
        // OR just rebuild "All" button too.
        // The safest way given the 'All' button is static in HTML is to find it or append after it.
        // But the previous code just appended. Let's stick to appending but robustly.

        // Clear strictly the dynamic ones if possible, but simplest is:
        const allBtn = container.querySelector('[data-type="all"]');

        // Remove all siblings of allBtn
        while (allBtn.nextSibling) {
            allBtn.nextSibling.remove();
        }

        this.types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'public-cat-btn'; // Keep class for styling
            btn.textContent = type;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.public-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedType = type;
                this.handleFilter();
            });
            container.appendChild(btn);
        });

        if (allBtn) {
            allBtn.onclick = (e) => {
                document.querySelectorAll('.public-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedType = 'all';
                this.handleFilter();
            };
        }
    }

    setupEventListeners() {
        document.getElementById('publicSearch').addEventListener('input', () => this.handleFilter());
        document.getElementById('cartToggle').addEventListener('click', () => this.toggleCart(true));
        document.getElementById('closeCart').addEventListener('click', () => this.toggleCart(false));
        document.getElementById('overlay').addEventListener('click', () => {
            this.toggleCart(false);
            this.toggleNav(false);
        });
        document.getElementById('applyDiscountBtn').addEventListener('click', () => this.applyDiscount());

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (this.cart.length === 0) return alert('Your basket is empty!');
            this.toggleOrderModal(true);
        });

        document.querySelectorAll('.public-order-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.public-order-opt').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.selectedOrderMethod = opt.dataset.method;
            });
        });

        document.getElementById('cancelOrder').onclick = () => this.toggleOrderModal(false);
        document.getElementById('confirmOrder').onclick = () => this.sendOrder();

        // Nav Drawer
        document.getElementById('navToggle').onclick = () => this.toggleNav(true);
        document.getElementById('closeNav').onclick = () => this.toggleNav(false);

        // Close nav on link click
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.onclick = () => this.toggleNav(false);
        });

        // PWA Install logic
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            // Show the install button
            const installContainer = document.getElementById('installAppContainer');
            if (installContainer) installContainer.style.display = 'block';
        });

        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) {
            installBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!this.deferredPrompt) return;
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                this.deferredPrompt = null;
                const installContainer = document.getElementById('installAppContainer');
                if (installContainer) installContainer.style.display = 'none';
            });
        }

        // Popup Handlers
        const closePopup = document.getElementById('closePopup');
        const popupAction = document.getElementById('popupAction');
        const bannerPopup = document.getElementById('bannerPopup');

        const hidePopup = () => {
            if (bannerPopup) bannerPopup.style.display = 'none';
            document.body.style.overflow = '';
        };

        if (closePopup) closePopup.onclick = hidePopup;
        if (popupAction) popupAction.onclick = hidePopup;
        if (bannerPopup) {
            bannerPopup.onclick = (e) => {
                if (e.target === bannerPopup) hidePopup();
            };
        }

        // Product Detail Handlers
        const detailModal = document.getElementById('productDetailModal');
        const closeDetail = document.getElementById('closeProductDetail');
        if (closeDetail && detailModal) {
            closeDetail.onclick = () => {
                detailModal.classList.remove('active');
                document.body.style.overflow = '';
            };
            detailModal.onclick = (e) => {
                if (e.target === detailModal) {
                    detailModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            };
        }
    }

    toggleNav(show) {
        document.getElementById('navDrawer').classList.toggle('active', show);
        document.getElementById('overlay').style.display = show ? 'block' : 'none';

        // Prevent body scroll
        document.body.style.overflow = show ? 'hidden' : '';
    }

    handleFilter() {
        const searchTerm = document.getElementById('publicSearch').value.toLowerCase();
        this.filteredProducts = this.products.filter(p => {
            const name = (p.product_name || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm);
            const matchesType = this.selectedType === 'all' || p.type === this.selectedType;
            return matchesSearch && matchesType;
        });
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const currency = this.shopSettings.currency || 'INR';

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">No products found</div>';
            return;
        }

        grid.innerHTML = this.filteredProducts.map(product => {
            let specsInfo = '';
            let metadata = product.metadata;

            // Handle potential stringified metadata
            if (typeof metadata === 'string') {
                try { metadata = JSON.parse(metadata); } catch (e) { metadata = null; }
            }

            if (!metadata && product.description && product.description.includes('--SPECIFICATIONS--')) {
                try {
                    metadata = JSON.parse(product.description.split('--SPECIFICATIONS--')[1].trim());
                } catch (e) { }
            }

            if (metadata && typeof metadata === 'object') {
                const specs = [];
                for (const [key, val] of Object.entries(metadata)) {
                    if (val) {
                        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                        specs.push(`<span class="spec-item" style="font-size: 0.75rem; color: #666; margin-right: 8px; display: inline-block;"><strong>${label}:</strong> ${val}</span>`);
                    }
                }
                if (specs.length > 0) {
                    specsInfo = `<div class="product-specs" style="margin: 5px 0;">${specs.join('')}</div>`;
                }
            }

            return `
                <div class="public-product-card">
                    <div class="public-product-img" onclick="app.openProductDetail('${product.id}')">
                        <img src="${product.product_image || 'assets/default-product.png'}" alt="${product.product_name}" style="cursor: zoom-in;">
                    </div>
                    <div class="public-product-details">
                        <span class="public-product-cat">${product.type || 'General'}</span>
                        <h3 class="public-product-name" onclick="app.openProductDetail('${product.id}')" style="cursor: pointer;">${product.product_name}</h3>
                        ${product.description ? `<p class="public-product-desc" style="font-size: 0.85rem; color: #666; margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${product.description.split('--SPECIFICATIONS--')[0].trim()}</p>` : ''}
                        ${specsInfo}
                        <div class="public-product-price">${this.formatCurrency(product.selling_price, currency)}</div>
                        <button class="public-add-btn" onclick="app.addToCart('${product.id}', event)">
                            <i class="fas fa-shopping-basket"></i> Add to Basket
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addToCart(productId, event) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // --- Animation Logic ---
        const btn = event.currentTarget;
        const cartIcon = document.getElementById('cartToggle');
        let productImg;

        const productCard = btn.closest('.public-product-card');
        if (productCard) {
            productImg = productCard.querySelector('img');
        } else {
            // Fallback for Modal
            productImg = document.getElementById('detailImage');
        }

        if (productImg && cartIcon) {
            const flyingImg = document.createElement('img');
            flyingImg.src = productImg.src;
            flyingImg.className = 'flying-img';

            // Initial position
            const rect = productImg.getBoundingClientRect();
            flyingImg.style.top = `${rect.top}px`;
            flyingImg.style.left = `${rect.left}px`;
            flyingImg.style.width = `${rect.width}px`;
            flyingImg.style.height = `${rect.height}px`;

            document.body.appendChild(flyingImg);

            // Target position (cart icon)
            const cartRect = cartIcon.getBoundingClientRect();

            setTimeout(() => {
                flyingImg.style.top = `${cartRect.top + 10}px`;
                flyingImg.style.left = `${cartRect.left + 10}px`;
                flyingImg.style.width = '20px';
                flyingImg.style.height = '20px';
                flyingImg.style.opacity = '0.5';
            }, 10);

            // Clean up and bounce cart
            setTimeout(() => {
                flyingImg.remove();
                cartIcon.classList.add('cart-bounce');
                setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
            }, 1200);
        }

        // Button feedback
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        btn.classList.add('added');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('added');
        }, 1500);
        // -------------------------

        const existing = this.cart.find(item => item.id === productId);
        if (existing) existing.quantity++;
        else this.cart.push({ id: product.id, name: product.product_name, price: product.selling_price, image: product.product_image, quantity: 1 });

        this.saveCartToStorage();
        this.updateCartUI();
    }

    updateCartUI() {
        const list = document.getElementById('cartItemsList');
        const count = document.getElementById('cartCount');
        const currency = this.shopSettings.currency || 'INR';

        count.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        if (this.cart.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 20px;">Empty</div>';
            this.updateTotals();
            return;
        }

        list.innerHTML = this.cart.map(item => `
            <div class="public-cart-item">
                <img src="${item.image || 'assets/default-product.png'}" alt="${item.name}">
                <div class="public-cart-item-info">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h5 style="margin: 0;">${item.name}</h5>
                        <button class="delete-item-btn" onclick="app.removeFromCart('${item.id}')" style="background: none; border: none; color: #ff4757; cursor: pointer; padding: 0 5px;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="public-cart-item-price">${this.formatCurrency(item.price, currency)}</div>
                    <div class="public-cart-controls">
                        <button class="public-qty-btn" onclick="app.updateQty('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="public-qty-btn" onclick="app.updateQty('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateTotals();
    }

    removeFromCart(productId) {
        if (confirm('Remove this item from basket?')) {
            this.cart = this.cart.filter(i => i.id !== productId);
            this.saveCartToStorage();
            this.updateCartUI();
        }
    }

    updateQty(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) this.cart = this.cart.filter(i => i.id !== productId);
            this.saveCartToStorage();
            this.updateCartUI();
        }
    }

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        const currency = this.shopSettings.currency || 'INR';

        if (this.appliedDiscount) {
            const d = this.appliedDiscount;
            if (subtotal >= d.minOrder) {
                discount = d.type === 'percentage' ? (subtotal * d.value / 100) : d.value;
                document.getElementById('discountRow').style.display = 'flex';
                document.getElementById('discountVal').textContent = `- ${this.formatCurrency(discount, currency)}`;
                document.getElementById('discountMsg').textContent = `Applied: ${d.name}`;
                document.getElementById('discountMsg').style.color = '#14aa14';
            } else {
                this.appliedDiscount = null;
                document.getElementById('discountRow').style.display = 'none';
                document.getElementById('discountMsg').textContent = `Min order ${this.formatCurrency(d.minOrder, currency)} required.`;
                document.getElementById('discountMsg').style.color = 'red';
            }
        }

        document.getElementById('subtotalVal').textContent = this.formatCurrency(subtotal, currency);
        document.getElementById('totalVal').textContent = this.formatCurrency(subtotal - discount, currency);
    }

    applyDiscount() {
        const input = document.getElementById('discountCode');
        const code = input.value.trim().toUpperCase();

        if (!code) return;

        let discounts = this.shopSettings.discount_codes || [];

        // Handle potential stringified JSON from database
        if (typeof discounts === 'string') {
            try {
                discounts = JSON.parse(discounts);
            } catch (e) {
                console.error('Error parsing discount codes:', e);
                discounts = [];
            }
        }

        if (!Array.isArray(discounts)) discounts = [];

        const found = discounts.find(d =>
            d.name && d.name.toUpperCase() === code && d.status === 'active'
        );

        if (found) {
            this.appliedDiscount = found;
            this.updateTotals();
            input.value = ''; // Clear input
            console.log('Discount applied:', found);
        } else {
            document.getElementById('discountMsg').textContent = 'Invalid or expired code';
            document.getElementById('discountMsg').style.color = 'red';
        }
    }

    sendOrder() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const currency = this.shopSettings.currency || 'INR';
        let discount = 0;
        let discountNote = "";

        if (this.appliedDiscount) {
            const d = this.appliedDiscount;
            if (subtotal >= d.minOrder) {
                discount = d.type === 'percentage' ? (subtotal * d.value / 100) : d.value;
                discountNote = `\n*Discount (${d.name}): -${this.formatCurrency(discount, currency)}*`;
            }
        }

        const total = subtotal - discount;
        let message = `🛒 *NEW ORDER*\n\n`;
        this.cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} (${this.formatCurrency(item.price * item.quantity, currency)})\n`;
        });

        message += `\nSubtotal: ${this.formatCurrency(subtotal, currency)}`;
        if (discount > 0) message += discountNote;
        message += `\n*TOTAL: ${this.formatCurrency(total, currency)}*`;

        if (this.selectedOrderMethod === 'whatsapp') {
            const num = (this.shopSettings.whatsapp_number || this.shopData.phone || '').replace(/\D/g, '');
            window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            const user = (this.shopSettings.telegram_id || '').replace('@', '');
            window.open(`https://t.me/${user}?text=${encodeURIComponent(message)}`, '_blank');
        }
    }

    toggleCart(show) { document.getElementById('cartSidebar').classList.toggle('active', show); document.getElementById('overlay').style.display = show ? 'block' : 'none'; }
    toggleOrderModal(show) { document.getElementById('orderModal').classList.toggle('active', show); }
    formatCurrency(amount, currencyCode) { try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(amount || 0); } catch (e) { return (amount || 0).toFixed(2) + ' ' + currencyCode; } }
    saveCartToStorage() { localStorage.setItem(`cart_${this.shopId}`, JSON.stringify(this.cart)); }
    loadCartFromStorage() { const saved = localStorage.getItem(`cart_${this.shopId}`); if (saved) { this.cart = JSON.parse(saved); this.updateCartUI(); } }
    renderError(msg) { document.body.innerHTML = `<div style="text-align:center;padding:100px;">${msg}</div>`; }

    openProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productDetailModal');
        const img = document.getElementById('detailImage');
        const name = document.getElementById('detailName');
        const price = document.getElementById('detailPrice');
        const cat = document.getElementById('detailCat');
        const desc = document.getElementById('detailDesc');
        const specsContainer = document.getElementById('detailSpecs');
        const addBtn = document.getElementById('detailAddToCart');

        const currency = this.shopSettings.currency || 'INR';

        if (modal && img) {
            img.src = product.product_image || 'assets/default-product.png';
            name.textContent = product.product_name;
            price.textContent = this.formatCurrency(product.selling_price, currency);
            cat.textContent = product.type || 'General';

            // Handle Description & Specs
            let metadata = product.metadata;
            if (typeof metadata === 'string') {
                try { metadata = JSON.parse(metadata); } catch (e) { metadata = null; }
            }

            const pureDesc = product.description ? product.description.split('--SPECIFICATIONS--')[0].trim() : 'No description provided.';
            desc.textContent = pureDesc;

            // Specs
            specsContainer.innerHTML = '';
            if (metadata && typeof metadata === 'object') {
                for (const [key, val] of Object.entries(metadata)) {
                    if (val) {
                        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                        specsContainer.innerHTML += `
                            <div style="background: #f1f5f9; padding: 8px 15px; border-radius: 8px; font-size: 0.85rem; color: #475569;">
                                <strong>${label}:</strong> ${val}
                            </div>
                        `;
                    }
                }
            }

            // Update Add Button
            addBtn.onclick = (e) => {
                this.addToCart(productId, e);
            };

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => { app = new ShopProductsViewer(); window.app = app; });
