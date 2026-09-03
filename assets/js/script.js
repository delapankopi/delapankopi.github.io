// ============================================================
// KONFIGURASI & VARIABEL GLOBAL
// ============================================================

let siteConfig = {};
let orderModalInstance = null;
let map = null;
let marker = null;
let currentLat = -6.8796;
let currentLng = 109.1256;
let productSwiper = null;
let testimoniSwiper = null;

// ============================================================
// WHATSAPP MESSAGES - SEMUA PESAN DARI content.json
// ============================================================

function getWhatsAppUrl(messageKey, params) {
    var waNumber = siteConfig.whatsapp || '6285786012464';
    var messages = siteConfig.whatsapp_messages || {};
    var message = '';

    // Pilih pesan berdasarkan key
    if (messageKey === 'floating_button') {
        message = messages.floating_button || "Halo kak, saya ingin bertanya seputar produk Delapan Kopi. 👋";
    } else if (messageKey === 'jar_8l') {
        message = messages.jar_8l || "Halo kak, saya ingin konsultasi dan pesan paket *Dispenser 8 Liter* untuk acara saya. 🙏";
    } else if (messageKey === 'jar_16l') {
        message = messages.jar_16l || "Halo kak, saya ingin konsultasi dan pesan paket *Dispenser 16 Liter* untuk acara saya. 🙏";
    } else if (messageKey === 'order_template') {
        message = messages.order_template || "Halo kak 👋\n\nSaya ingin pesan produk berikut:\n{items}\n\n*Estimasi Total:* *Rp {total}*\n\n*Nama Pemesan:* {name}\n*Detail Alamat:* {address}\n*Titik Google Maps:* {maps}\n\nMohon info ketersediaan dan total pembayarannya ya, terima kasih! 🙏";
    } else if (messageKey === 'product_inquiry') {
        message = messages.product_inquiry || "Halo kak, saya tertarik dengan produk *{product_name}*. Mohon info lebih lanjut ya! 😊";
    } else if (messageKey === 'general_inquiry') {
        message = messages.general_inquiry || "Halo kak, saya ingin bertanya seputar menu dan harga Delapan Kopi. Terima kasih! ☕";
    } else if (messageKey === 'event_inquiry') {
        message = messages.event_inquiry || "Halo kak, saya ingin konsultasi untuk acara {event_type}. Butuh paket minuman untuk ±{jumlah} orang. Mohon rekomendasinya! 🎉";
    } else if (messageKey === 'custom_order') {
        message = messages.custom_order || "Halo kak, saya ingin order custom untuk acara. Mohon dibantu ya! 🙏";
    } else {
        message = messages.general_inquiry || "Halo kak, saya ingin bertanya seputar produk Delapan Kopi. 👋";
    }

    // Replace params jika ada
    if (params) {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                message = message.replace(new RegExp('{' + key + '}', 'g'), params[key]);
            }
        }
    }

    return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
}

// ============================================================
// DOMContentLoaded - INISIALISASI
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    // Inisialisasi Modal
    const modalEl = document.getElementById('orderModal');
    if (modalEl) {
        orderModalInstance = new bootstrap.Modal(modalEl);
        modalEl.addEventListener('shown.bs.modal', function() {
            initOrUpdateMap();
            setTimeout(function() {
                const tooltip = document.getElementById('locationTooltip');
                if (tooltip) {
                    tooltip.classList.add('show');
                    setTimeout(function() {
                        tooltip.classList.remove('show');
                    }, 6000);
                }
            }, 500);
        });
    }

    // Auto close navbar di mobile
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const allNavLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');

    allNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('data-bs-toggle') === 'dropdown') return;
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    navbarCollapse.classList.remove('show');
                }
                if (navbarToggler) {
                    navbarToggler.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Load content.json
    fetch('content.json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            siteConfig = data;
            applyThemeColors();
            applyLogo();
            applyHero();
            updateHeroBestSeller();
            applyBranding();
            applyWhatsAppLinks();
            applySocialMediaLinks();
            renderProducts();
            renderTestimonials();
        })
        .catch(function(error) { console.error('Gagal memuat content.json:', error); });

    // Inisialisasi AOS
    AOS.init({ duration: 800, once: true, offset: 100 });
});

// ============================================================
// FUNGSI APLIKASI KONFIGURASI
// ============================================================

function applyThemeColors() {
    if (!siteConfig.theme_colors) return;
    const root = document.documentElement;
    if (siteConfig.theme_colors.primary_green) root.style.setProperty('--sb-green', siteConfig.theme_colors.primary_green);
    if (siteConfig.theme_colors.dark_green) root.style.setProperty('--sb-green-dark', siteConfig.theme_colors.dark_green);
    if (siteConfig.theme_colors.light_bg) root.style.setProperty('--coffee-50', siteConfig.theme_colors.light_bg);
}

function applyLogo() {
    if (!siteConfig.logo) return;
    const logoContainers = document.querySelectorAll('.brand-logo-container');
    logoContainers.forEach(function(container) {
        if (siteConfig.logo.image_url && siteConfig.logo.image_url.trim() !== "") {
            container.innerHTML = '<img src="' + siteConfig.logo.image_url + '" alt="Logo" class="w-100 h-100 object-fit-contain">';
        } else {
            var fontSize = window.innerWidth < 576 ? '14px' : '18px';
            container.innerHTML = '<span class="font-serif fw-bold" style="font-size: ' + fontSize + ';">' + (siteConfig.logo.text_icon || '00') + '</span>';
        }
    });
}

function applyHero() {
    if (!siteConfig.hero) return;

    var heroSection = document.getElementById('beranda');
    if (heroSection && siteConfig.hero.background_image) {
        heroSection.style.background = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("' + siteConfig.hero.background_image + '") center/cover no-repeat';
    }

    var heroImgEl = document.getElementById('heroMainImage');
    if (heroImgEl && siteConfig.hero.hero_image) {
        heroImgEl.src = siteConfig.hero.hero_image;
    }

    var heroHeading = document.getElementById('heroHeading');
    if (heroHeading && siteConfig.hero.heading) {
        heroHeading.innerText = siteConfig.hero.heading;
    }

    var heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle && siteConfig.hero.subtitle) {
        heroSubtitle.innerText = siteConfig.hero.subtitle;
    }
}

function applyBranding() {
    if (siteConfig.brand && document.getElementById('navBrand')) {
        document.getElementById('navBrand').innerText = siteConfig.brand;
    }
    if (siteConfig.tagline && document.getElementById('navTagline')) {
        document.getElementById('navTagline').innerText = siteConfig.tagline;
    }
    if (siteConfig.address && document.getElementById('footerAddress')) {
        document.getElementById('footerAddress').innerHTML = '<i class="fa-solid fa-location-dot me-2 text-warning"></i> ' + siteConfig.address;
    }
    if (siteConfig.operational_hours && document.getElementById('footerOperational')) {
        document.getElementById('footerOperational').innerHTML = '<i class="fa-solid fa-clock me-2 text-info"></i> ' + siteConfig.operational_hours;
    }
    if (siteConfig.modal_settings && siteConfig.modal_settings.modal_title && document.getElementById('modalTitleText')) {
        document.getElementById('modalTitleText').innerText = siteConfig.modal_settings.modal_title;
    }
}

function applyWhatsAppLinks() {
    // Floating Button
    var floatingBtn = document.getElementById('floatingWaBtn');
    if (floatingBtn) {
        floatingBtn.href = getWhatsAppUrl('floating_button');
    }

    // Footer WhatsApp - Kontak & Lokasi
    var footerWa = document.getElementById('footerWa');
    if (footerWa) {
        footerWa.href = 'https://wa.me/' + (siteConfig.whatsapp || '6285786012464');
    }

    // Jar 8L
    var jar8Btn = document.getElementById('jarBtn8L');
    if (jar8Btn) {
        jar8Btn.href = getWhatsAppUrl('jar_8l');
    }

    // Jar 16L
    var jar16Btn = document.getElementById('jarBtn16L');
    if (jar16Btn) {
        jar16Btn.href = getWhatsAppUrl('jar_16l');
    }
}

function applySocialMediaLinks() {
    if (siteConfig.instagram && document.getElementById('footerIg')) {
        document.getElementById('footerIg').href = siteConfig.instagram;
    }
    if (siteConfig.facebook && document.getElementById('footerFb')) {
        document.getElementById('footerFb').href = siteConfig.facebook;
    }
    if (siteConfig.tiktok && document.getElementById('footerTiktok')) {
        document.getElementById('footerTiktok').href = siteConfig.tiktok;
    }
}

// ============================================================
// HERO BEST SELLER
// ============================================================

function updateHeroBestSeller() {
    if (!siteConfig.products) return;
    var bestSeller = siteConfig.products.bestSeller && siteConfig.products.bestSeller[0] ? siteConfig.products.bestSeller[0] : null;
    if (!bestSeller) return;

    var heroImgEl = document.getElementById('heroMainImage');
    if (heroImgEl && bestSeller.image) {
        heroImgEl.src = bestSeller.image;
        heroImgEl.alt = bestSeller.name;
    }
}

// ============================================================
// RENDER PRODUCTS - FIXED
// ============================================================

function renderProducts() {
    var wrapper = document.getElementById('productSliderWrapper');
    if (!wrapper || !siteConfig.products) return;
    wrapper.innerHTML = '';

    // Proses BEST SELLER
    var bestSellerItems = [];
    if (siteConfig.products.bestSeller) {
        for (var i = 0; i < siteConfig.products.bestSeller.length; i++) {
            var p = siteConfig.products.bestSeller[i];
            bestSellerItems.push({
                name: p.name,
                price: p.price,
                rawPrice: p.rawPrice,
                image: p.image,
                description: p.description,
                categoryName: 'Kopi',
                isBestSeller: true,
                isNew: p.isNew || false
            });
        }
    }

    // Proses COFFEE
    var coffeeItems = [];
    if (siteConfig.products.coffee) {
        for (var j = 0; j < siteConfig.products.coffee.length; j++) {
            var p2 = siteConfig.products.coffee[j];
            coffeeItems.push({
                name: p2.name,
                price: p2.price,
                rawPrice: p2.rawPrice,
                image: p2.image,
                description: p2.description,
                categoryName: 'Kopi',
                isBestSeller: p2.isBestSeller || false,
                isNew: p2.isNew || false
            });
        }
    }

    // Proses NON-COFFEE
    var nonCoffeeItems = [];
    if (siteConfig.products.nonCoffee) {
        for (var k = 0; k < siteConfig.products.nonCoffee.length; k++) {
            var p3 = siteConfig.products.nonCoffee[k];
            nonCoffeeItems.push({
                name: p3.name,
                price: p3.price,
                rawPrice: p3.rawPrice,
                image: p3.image,
                description: p3.description,
                categoryName: 'Non-Kopi',
                isBestSeller: p3.isBestSeller || false,
                isNew: p3.isNew || false
            });
        }
    }

    var allItems = bestSellerItems.concat(coffeeItems).concat(nonCoffeeItems);

    for (var l = 0; l < allItems.length; l++) {
        var item = allItems[l];
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';

        var imgSrc = item.image ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600';
        var safeName = item.name.replace(/'/g, "\\'");
        var description = item.description || 'Pilihan menu favorit berkualitas tinggi dari Delapan Kopi.';

        // ===== BADGE DI ATAS GAMBAR =====
        var imageBadgeHtml = '';
        
        if (item.isBestSeller) {
            imageBadgeHtml = '<span class="product-badge badge-bestseller">⭐ Best Seller</span>';
        } else if (item.isNew) {
            imageBadgeHtml = '<span class="product-badge badge-new">✨ New</span>';
        }

        // ===== BADGE KATEGORI DI CARD =====
        var categoryBadgeClass = '';
        var categoryLabel = '';

        if (item.categoryName === 'Kopi') {
            categoryBadgeClass = 'badge-coffee';
            categoryLabel = '☕ Kopi';
        } else if (item.categoryName === 'Non-Kopi') {
            categoryBadgeClass = 'badge-noncoffee';
            categoryLabel = '🥤 Non-Kopi';
        }

        slide.innerHTML = 
            '<div class="product-card">' +
                '<div class="product-img-holder">' +
                    imageBadgeHtml +
                    '<img src="' + imgSrc + '" alt="' + item.name + '" loading="lazy">' +
                '</div>' +
                '<div class="product-info">' +
                    '<span class="product-category-tag ' + categoryBadgeClass + '">' + categoryLabel + '</span>' +
                    '<h3 class="product-title">' + item.name + '</h3>' +
                    '<div class="product-price">' + item.price + '</div>' +
                    '<p class="product-desc">' + description + '</p>' +
                    '<button type="button" onclick="openOrderModal(\'' + safeName + '\')" class="btn-order-product">' +
                        '<i class="fa-solid fa-bag-shopping"></i> Pesan Sekarang' +
                    '</button>' +
                '</div>' +
            '</div>';

        wrapper.appendChild(slide);
    }

    if (productSwiper) {
        productSwiper.destroy(true, true);
        productSwiper = null;
    }

    setTimeout(function() {
        productSwiper = new Swiper('.productSlider', {
            slidesPerView: 1.2,
            spaceBetween: 16,
            loop: false,
            grabCursor: true,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                0: { slidesPerView: 2, spaceBetween: 10, slidesPerGroup: 1 },
                400: { slidesPerView: 2, spaceBetween: 12, slidesPerGroup: 1 },
                576: { slidesPerView: 2.2, spaceBetween: 16, slidesPerGroup: 1 },
                768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 1 },
                992: { slidesPerView: 3.5, spaceBetween: 22, slidesPerGroup: 1 },
                1200: { slidesPerView: 4, spaceBetween: 24, slidesPerGroup: 1 }
            }
        });
    }, 100);
}

// ============================================================
// RENDER TESTIMONI (SLIDER) - FOTO BESAR DI ATAS
// ============================================================

function renderTestimonials() {
    var wrapper = document.getElementById('testimoniSliderWrapper');
    if (!wrapper || !siteConfig.testimonials || siteConfig.testimonials.length === 0) {
        var section = document.getElementById('testimoni');
        if (section) section.style.display = 'none';
        return;
    }

    wrapper.innerHTML = '';

    for (var i = 0; i < siteConfig.testimonials.length; i++) {
        var item = siteConfig.testimonials[i];
        var starsHtml = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        
        // Jika avatar kosong, gunakan gambar placeholder
        var imgSrc = item.avatar && item.avatar.trim() !== '' 
            ? item.avatar 
            : 'assets/img/default.webp';

        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = 
            '<div class="testimoni-card">' +
                '<img src="' + imgSrc + '" alt="' + item.name + '" class="testimoni-image" loading="lazy">' +
                '<div class="testimoni-body">' +
                    '<div class="stars">' + starsHtml + '</div>' +
                    '<p class="testimoni-text">' + item.text + '</p>' +
                    '<div class="testimoni-author">' +
                        '<p class="testimoni-name">' + item.name + '</p>' +
                        '<p class="testimoni-role">' + (item.role || '') + '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';

        wrapper.appendChild(slide);
    }

    if (testimoniSwiper) {
        testimoniSwiper.destroy(true, true);
        testimoniSwiper = null;
    }

    setTimeout(function() {
        var totalTestimonials = siteConfig.testimonials.length;
        
        testimoniSwiper = new Swiper('.testimoniSlider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: totalTestimonials > 3,
            grabCursor: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.testimoni-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.testimoni-next',
                prevEl: '.testimoni-prev',
            },
            breakpoints: {
                0: { 
                    slidesPerView: 1, 
                    spaceBetween: 12
                },
                576: { 
                    slidesPerView: 1.2, 
                    spaceBetween: 16
                },
                768: { 
                    slidesPerView: 2, 
                    spaceBetween: 20
                },
                992: { 
                    slidesPerView: Math.min(3, totalTestimonials), 
                    spaceBetween: 24
                }
            }
        });
    }, 150);
}

// ============================================================
// LOKASI / MAP
// ============================================================

function detectUserLocation() {
    var btn = document.querySelector('.btn-detect-location');
    if (!btn) return;

    var originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner"></i> Mendeteksi...';
    btn.classList.add('loading');
    btn.disabled = true;

    var tooltip = document.getElementById('locationTooltip');
    if (tooltip) {
        tooltip.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1" style="color: #0d6efd;"></i> Mengakses GPS Anda...';
        tooltip.classList.add('show');
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLat = position.coords.latitude.toFixed(6);
                currentLng = position.coords.longitude.toFixed(6);
                var latLng = [currentLat, currentLng];

                if (map && marker) {
                    map.setView(latLng, 16);
                    marker.setLatLng(latLng);
                    var markerElement = marker.getElement();
                    if (markerElement) {
                        markerElement.classList.add('pulse-marker');
                        setTimeout(function() {
                            markerElement.classList.remove('pulse-marker');
                        }, 2000);
                    }
                }

                var coordDisplay = document.getElementById('coordDisplay');
                if (coordDisplay) coordDisplay.innerText = currentLat + ', ' + currentLng;
                showToast('success', '✅ Lokasi Terdeteksi!', 'Koordinat: ' + currentLat + ', ' + currentLng);

                if (tooltip) {
                    tooltip.innerHTML = '<i class="fa-solid fa-check-circle text-success me-1"></i> <span class="text-success fw-bold">Lokasi berhasil dideteksi!</span>';
                    setTimeout(function() { tooltip.classList.remove('show'); }, 3000);
                }

                btn.innerHTML = originalHtml;
                btn.classList.remove('loading');
                btn.disabled = false;
            },
            function(error) {
                var errorMessage = 'Gagal mendeteksi lokasi. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Izin lokasi ditolak.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Informasi lokasi tidak tersedia.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Waktu deteksi habis.';
                        break;
                    default:
                        errorMessage += 'Terjadi kesalahan.';
                }

                showToast('error', '❌ Gagal Deteksi', errorMessage);

                if (tooltip) {
                    tooltip.innerHTML = '<i class="fa-solid fa-circle-exclamation text-danger me-1"></i> <span class="text-danger fw-bold">' + errorMessage + '</span>';
                    setTimeout(function() { tooltip.classList.remove('show'); }, 5000);
                }

                btn.innerHTML = originalHtml;
                btn.classList.remove('loading');
                btn.disabled = false;
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    } else {
        showToast('error', '❌ Tidak Didukung', 'Browser Anda tidak mendukung Geolocation.');
        btn.innerHTML = originalHtml;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function initOrUpdateMap() {
    if (!map) {
        map = L.map('map').setView([currentLat, currentLng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

        marker.on('dragend', function() {
            var position = marker.getLatLng();
            currentLat = position.lat.toFixed(6);
            currentLng = position.lng.toFixed(6);
            var coordDisplay = document.getElementById('coordDisplay');
            if (coordDisplay) coordDisplay.innerText = currentLat + ', ' + currentLng;
        });

        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            currentLat = e.latlng.lat.toFixed(6);
            currentLng = e.latlng.lng.toFixed(6);
            var coordDisplay = document.getElementById('coordDisplay');
            if (coordDisplay) coordDisplay.innerText = currentLat + ', ' + currentLng;
        });
    } else {
        map.invalidateSize();
        map.setView([currentLat, currentLng], 14);
        marker.setLatLng([currentLat, currentLng]);
    }
}

// ============================================================
// TOAST NOTIFIKASI
// ============================================================

function showToast(type, title, message) {
    var toast = document.getElementById('locationToast');
    if (!toast) return;

    var icon = toast.querySelector('.toast-icon');
    var titleEl = document.getElementById('toastTitle');
    var messageEl = document.getElementById('toastMessage');

    if (icon) icon.className = 'toast-icon';

    if (type === 'success') {
        if (icon) icon.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
        if (icon) icon.classList.add('success');
        toast.style.borderLeftColor = '#198754';
    } else if (type === 'error') {
        if (icon) icon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        if (icon) icon.classList.add('error');
        toast.style.borderLeftColor = '#dc3545';
    } else {
        if (icon) icon.innerHTML = '<i class="fa-solid fa-info-circle"></i>';
        if (icon) icon.classList.add('info');
        toast.style.borderLeftColor = '#0d6efd';
    }

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 5000);
}

function closeToast() {
    var toast = document.getElementById('locationToast');
    if (toast) {
        toast.classList.remove('show');
        clearTimeout(toast._timeout);
    }
}

// ============================================================
// MODAL ORDER
// ============================================================

function openOrderModal(initialProduct) {
    if (initialProduct === undefined) initialProduct = "";
    var container = document.getElementById('orderItemsContainer');
    if (container) {
        container.innerHTML = '';
        addOrderItem(initialProduct, 1, 'Normal (100%)');
    }
    if (orderModalInstance) {
        orderModalInstance.show();
    }
}

function addOrderItem(selectedName, qty, selectedSweetness) {
    if (selectedName === undefined) selectedName = "";
    if (qty === undefined) qty = 1;
    if (selectedSweetness === undefined) selectedSweetness = "Normal (100%)";
    
    var container = document.getElementById('orderItemsContainer');
    if (!container) return;

    var rowId = 'item-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    var optionsHtml = '<option value="" disabled>--- Pilih Menu ---</option>';

    if (siteConfig && siteConfig.products) {
        if (siteConfig.products.bestSeller && siteConfig.products.bestSeller.length > 0) {
            optionsHtml += '<optgroup label="-- FAVORIT / BEST SELLER --">';
            for (var i = 0; i < siteConfig.products.bestSeller.length; i++) {
                var p = siteConfig.products.bestSeller[i];
                var valStr = p.name + '|' + p.price + '|' + p.rawPrice;
                var isSelected = (p.name === selectedName) ? 'selected' : '';
                optionsHtml += '<option value="' + valStr + '" ' + isSelected + '>' + p.name + ' - ' + p.price + '</option>';
            }
            optionsHtml += '</optgroup>';
        }
        if (siteConfig.products.coffee && siteConfig.products.coffee.length > 0) {
            optionsHtml += '<optgroup label="-- COFFEE --">';
            for (var j = 0; j < siteConfig.products.coffee.length; j++) {
                var p2 = siteConfig.products.coffee[j];
                var valStr2 = p2.name + '|' + p2.price + '|' + p2.rawPrice;
                var isSelected2 = (p2.name === selectedName) ? 'selected' : '';
                optionsHtml += '<option value="' + valStr2 + '" ' + isSelected2 + '>' + p2.name + ' - ' + p2.price + '</option>';
            }
            optionsHtml += '</optgroup>';
        }
        if (siteConfig.products.nonCoffee && siteConfig.products.nonCoffee.length > 0) {
            optionsHtml += '<optgroup label="-- NON-COFFEE --">';
            for (var k = 0; k < siteConfig.products.nonCoffee.length; k++) {
                var p3 = siteConfig.products.nonCoffee[k];
                var valStr3 = p3.name + '|' + p3.price + '|' + p3.rawPrice;
                var isSelected3 = (p3.name === selectedName) ? 'selected' : '';
                optionsHtml += '<option value="' + valStr3 + '" ' + isSelected3 + '>' + p3.name + ' - ' + p3.price + '</option>';
            }
            optionsHtml += '</optgroup>';
        }
    }

    if (!selectedName) {
        optionsHtml = optionsHtml.replace('value="" disabled', 'value="" disabled selected');
    }

    var sweetnessLevels = (siteConfig.modal_settings && siteConfig.modal_settings.sweetness_levels) ?
        siteConfig.modal_settings.sweetness_levels :
        ["Normal (100%)", "Slight (70% - 80%)", "Less (50%)", "Low (25%)", "No Sugar"];

    var sweetnessOptionsHtml = '';
    for (var l = 0; l < sweetnessLevels.length; l++) {
        var lvl = sweetnessLevels[l];
        var isSel = (lvl === selectedSweetness) ? 'selected' : '';
        sweetnessOptionsHtml += '<option value="' + lvl + '" ' + isSel + '>' + lvl + '</option>';
    }

    var rowDiv = document.createElement('div');
    rowDiv.className = 'card p-3 bg-light border item-row';
    rowDiv.id = rowId;
    rowDiv.innerHTML = 
        '<div class="row g-2 align-items-center">' +
            '<div class="col-12 col-md-5 col-product">' +
                '<label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">PRODUK</label>' +
                '<select class="form-select form-select-sm product-choice" onchange="calculateGrandTotal()" required>' +
                    optionsHtml +
                '</select>' +
            '</div>' +
            '<div class="col-6 col-md-4 col-sweetness">' +
                '<label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">TINGKAT KEMANISAN</label>' +
                '<select class="form-select form-select-sm product-sweetness">' +
                    sweetnessOptionsHtml +
                '</select>' +
            '</div>' +
            '<div class="col-4 col-md-2 col-qty">' +
                '<label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">JUMLAH</label>' +
                '<input type="number" class="form-control form-control-sm product-qty" min="1" value="' + qty + '" oninput="calculateGrandTotal()" required>' +
            '</div>' +
            '<div class="col-2 col-md-1 col-delete text-end">' +
                '<label class="form-label d-block text-white" style="font-size: 9px; margin-bottom: 2px;">-</label>' +
                '<button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="removeOrderItem(\'' + rowId + '\')" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    container.appendChild(rowDiv);
    calculateGrandTotal();
}

function removeOrderItem(rowId) {
    var rows = document.querySelectorAll('.item-row');
    if (rows.length > 1) {
        var el = document.getElementById(rowId);
        if (el) el.remove();
        calculateGrandTotal();
    } else {
        alert("Minimal harus ada 1 produk dalam pesanan.");
    }
}

function calculateGrandTotal() {
    var grandTotal = 0;
    var rows = document.querySelectorAll('.item-row');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var selectEl = row.querySelector('.product-choice');
        var qtyEl = row.querySelector('.product-qty');
        if (selectEl && selectEl.value && qtyEl && qtyEl.value) {
            var valParts = selectEl.value.split('|');
            var rawPrice = parseInt(valParts[2]) || 0;
            var qty = parseInt(qtyEl.value) || 0;
            grandTotal += rawPrice * qty;
        }
    }
    var grandTotalEl = document.getElementById('grandTotalDisplay');
    if (grandTotalEl) grandTotalEl.innerText = 'Rp ' + grandTotal.toLocaleString('id-ID');
}

// ============================================================
// SEND WHATSAPP ORDER
// ============================================================

function sendWhatsAppOrder(event) {
    event.preventDefault();

    var nameEl = document.getElementById('customerName');
    var addressEl = document.getElementById('customerAddress');

    var name = nameEl ? nameEl.value : '';
    var address = addressEl ? addressEl.value : '';
    var mapsLink = 'https://maps.google.com/?q=' + currentLat + ',' + currentLng;

    var itemsText = "";
    var isValid = true;
    var grandTotal = 0;

    var rows = document.querySelectorAll('.item-row');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var selectEl = row.querySelector('.product-choice');
        var sweetEl = row.querySelector('.product-sweetness');
        var qtyEl = row.querySelector('.product-qty');

        if (!selectEl || !selectEl.value) {
            isValid = false;
            break;
        }

        var valParts = selectEl.value.split('|');
        var rawPrice = parseInt(valParts[2]) || 0;
        var qty = parseInt(qtyEl.value) || 0;
        var subtotal = rawPrice * qty;
        grandTotal += subtotal;

        itemsText += (i + 1) + '. *' + valParts[0] + '* (' + valParts[1] + ')\n   - Jumlah: *' + qty + ' Botol*\n   - Manis: *' + sweetEl.value + '*\n   - Subtotal: *Rp ' + subtotal.toLocaleString('id-ID') + '*\n\n';
    }

    if (!isValid) {
        alert("Mohon pilih menu terlebih dahulu pada setiap baris produk.");
        return;
    }

    // Gunakan template dari content.json melalui getWhatsAppUrl
    var waUrl = getWhatsAppUrl('order_template', {
        items: itemsText.trim(),
        total: grandTotal.toLocaleString('id-ID'),
        name: name,
        address: address,
        maps: mapsLink
    });

    window.open(waUrl, '_blank');
}
function applyBranding() {
    if (siteConfig.brand && document.getElementById('navBrand')) {
        document.getElementById('navBrand').innerText = siteConfig.brand;
    }
    if (siteConfig.tagline && document.getElementById('navTagline')) {
        document.getElementById('navTagline').innerText = siteConfig.tagline;
    }
    
    // Address with Google Maps Link
    if (siteConfig.address && document.getElementById('footerAddress')) {
        var addressLink = document.getElementById('footerAddressLink');
        if (addressLink) {
            addressLink.textContent = siteConfig.address;
            if (siteConfig.google_maps_url) {
                addressLink.href = siteConfig.google_maps_url;
                addressLink.target = '_blank';
                addressLink.rel = 'noopener noreferrer';
            }
        } else {
            // Fallback jika tidak ada link terpisah
            document.getElementById('footerAddress').innerHTML = '<i class="fa-solid fa-location-dot me-2 text-warning"></i> ' + siteConfig.address;
        }
    }
    
    if (siteConfig.operational_hours && document.getElementById('footerOperational')) {
        document.getElementById('footerOperational').innerHTML = '<i class="fa-solid fa-clock me-2 text-info"></i> ' + siteConfig.operational_hours;
    }
    if (siteConfig.modal_settings && siteConfig.modal_settings.modal_title && document.getElementById('modalTitleText')) {
        document.getElementById('modalTitleText').innerText = siteConfig.modal_settings.modal_title;
    }
}
