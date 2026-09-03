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

// ============================================================
// DOMContentLoaded - INISIALISASI
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // Inisialisasi Modal
    const modalEl = document.getElementById('orderModal');
    if (modalEl) {
        orderModalInstance = new bootstrap.Modal(modalEl);
        modalEl.addEventListener('shown.bs.modal', () => {
            initOrUpdateMap();
            setTimeout(() => {
                const tooltip = document.getElementById('locationTooltip');
                if (tooltip) {
                    tooltip.classList.add('show');
                    setTimeout(() => tooltip.classList.remove('show'), 6000);
                }
            }, 500);
        });
    }

    // Auto close navbar di mobile
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const allNavLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');

    allNavLinks.forEach(link => {
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
        .then(response => response.json())
        .then(data => {
            siteConfig = data;
            applyThemeColors();
            applyLogo();
            applyHero();
            updateHeroBestSeller();
            applyBranding();
            applyWhatsAppLinks();
            applySocialMediaLinks();
            renderProducts();
        })
        .catch(error => console.error('Gagal memuat content.json:', error));

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
    logoContainers.forEach(container => {
        if (siteConfig.logo.image_url && siteConfig.logo.image_url.trim() !== "") {
            container.innerHTML = `<img src="${siteConfig.logo.image_url}" alt="Logo" class="w-100 h-100 object-fit-contain">`;
        } else {
            container.innerHTML = `<span class="font-serif fw-bold" style="font-size: ${window.innerWidth < 576 ? '14px' : '18px'};">${siteConfig.logo.text_icon || '00'}</span>`;
        }
    });
}

function applyHero() {
    if (!siteConfig.hero) return;

    const heroSection = document.getElementById('beranda');
    if (heroSection && siteConfig.hero.background_image) {
        heroSection.style.background = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${siteConfig.hero.background_image}') center/cover no-repeat`;
    }

    const heroImgEl = document.getElementById('heroMainImage');
    if (heroImgEl && siteConfig.hero.hero_image) {
        heroImgEl.src = siteConfig.hero.hero_image;
    }

    const heroHeading = document.getElementById('heroHeading');
    if (heroHeading && siteConfig.hero.heading) {
        heroHeading.innerText = siteConfig.hero.heading;
    }

    const heroSubtitle = document.getElementById('heroSubtitle');
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
        document.getElementById('footerAddress').innerHTML = `<i class="fa-solid fa-location-dot me-2 text-warning"></i> ${siteConfig.address}`;
    }
    if (siteConfig.operational_hours && document.getElementById('footerOperational')) {
        document.getElementById('footerOperational').innerHTML = `<i class="fa-solid fa-clock me-2 text-info"></i> ${siteConfig.operational_hours}`;
    }
    if (siteConfig.modal_settings && siteConfig.modal_settings.modal_title && document.getElementById('modalTitleText')) {
        document.getElementById('modalTitleText').innerText = siteConfig.modal_settings.modal_title;
    }
}

function applyWhatsAppLinks() {
    const waFormatted = `https://wa.me/${siteConfig.whatsapp || '6285786012464'}`;
    const floatingMsg = siteConfig.whatsapp_messages?.floating_button || "Halo kak, saya ingin bertanya seputar produk Delapan Kopi. 👋";

    const floatingBtn = document.getElementById('floatingWaBtn');
    if (floatingBtn) floatingBtn.href = `${waFormatted}?text=${encodeURIComponent(floatingMsg)}`;

    const footerWa = document.getElementById('footerWa');
    if (footerWa) {
        footerWa.href = waFormatted;
        footerWa.innerHTML = `<i class="fa-brands fa-whatsapp me-2 text-success"></i> +${siteConfig.whatsapp || '6285786012464'}`;
    }

    const socialWa = document.getElementById('socialWa');
    if (socialWa) socialWa.href = waFormatted;

    const jar8Msg = siteConfig.whatsapp_messages?.jar_8l || "Halo kak, saya ingin konsultasi dan pesan paket *Dispenser 8 Liter* untuk acara saya. Mohon info detailnya ya! 🙏";
    const jar8Btn = document.getElementById('jarBtn8L');
    if (jar8Btn) jar8Btn.href = `${waFormatted}?text=${encodeURIComponent(jar8Msg)}`;

    const jar16Msg = siteConfig.whatsapp_messages?.jar_16l || "Halo kak, saya ingin konsultasi dan pesan paket *Dispenser 16 Liter* untuk acara saya. Mohon info detailnya ya! 🙏";
    const jar16Btn = document.getElementById('jarBtn16L');
    if (jar16Btn) jar16Btn.href = `${waFormatted}?text=${encodeURIComponent(jar16Msg)}`;
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
// HERO BEST SELLER (DIPERBAIKI - Hanya update gambar)
// ============================================================

function updateHeroBestSeller() {
    const bestSeller = siteConfig.products?.bestSeller?.[0];
    if (!bestSeller) return;

    const heroImgEl = document.getElementById('heroMainImage');
    if (heroImgEl && bestSeller.image) {
        heroImgEl.src = bestSeller.image;
        heroImgEl.alt = bestSeller.name;
    }

    // NOTE: Elemen overlay hero sudah dihapus dari HTML,
    // jadi tidak perlu update nama/deskripsi/badge lagi.
}

// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts() {
    const wrapper = document.getElementById('productSliderWrapper');
    if (!wrapper || !siteConfig.products) return;
    wrapper.innerHTML = '';

    const allItems = [
        ...(siteConfig.products.bestSeller || []).map(p => ({ ...p, badge: 'Best Seller', badgeClass: 'badge-bestseller', categoryName: 'Favorit' })),
        ...(siteConfig.products.coffee || []).map(p => ({ ...p, badge: 'Coffee', badgeClass: 'badge-coffee', categoryName: 'Kopi' })),
        ...(siteConfig.products.nonCoffee || []).map(p => ({ ...p, badge: 'Non-Coffee', badgeClass: 'badge-noncoffee', categoryName: 'Non-Kopi' }))
    ];

    allItems.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const imgSrc = item.image ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600';
        const safeName = item.name.replace(/'/g, "\\'");
        const description = item.description || 'Pilihan menu favorit berkualitas tinggi dari Delapan Kopi.';

        slide.innerHTML = `
            <div class="product-card">
                <div class="product-img-holder">
                    <span class="product-badge ${item.badgeClass}">${item.badge}</span>
                    <img src="${imgSrc}" alt="${item.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category-tag">${item.categoryName}</span>
                    <h3 class="product-title">${item.name}</h3>
                    <div class="product-price">${item.price}</div>
                    <p class="product-desc">${description}</p>
                    <button type="button" onclick="openOrderModal('${safeName}')" class="btn-order-product">
                        <i class="fa-solid fa-bag-shopping"></i> Pesan Sekarang
                    </button>
                </div>
            </div>
        `;
        wrapper.appendChild(slide);
    });

    if (productSwiper) {
        productSwiper.destroy(true, true);
        productSwiper = null;
    }

    setTimeout(() => {
        productSwiper = new Swiper('.productSlider', {
            slidesPerView: 1.2,
            spaceBetween: 16,
            loop: allItems.length > 4,
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
// LOKASI / MAP
// ============================================================

function detectUserLocation() {
    const btn = document.querySelector('.btn-detect-location');
    if (!btn) return;

    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner"></i> Mendeteksi...';
    btn.classList.add('loading');
    btn.disabled = true;

    const tooltip = document.getElementById('locationTooltip');
    if (tooltip) {
        tooltip.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1" style="color: #0d6efd;"></i> Mengakses GPS Anda...';
        tooltip.classList.add('show');
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude.toFixed(6);
                currentLng = position.coords.longitude.toFixed(6);
                const latLng = [currentLat, currentLng];

                if (map && marker) {
                    map.setView(latLng, 16);
                    marker.setLatLng(latLng);
                    const markerElement = marker.getElement();
                    if (markerElement) {
                        markerElement.classList.add('pulse-marker');
                        setTimeout(() => markerElement.classList.remove('pulse-marker'), 2000);
                    }
                }

                const coordDisplay = document.getElementById('coordDisplay');
                if (coordDisplay) coordDisplay.innerText = `${currentLat}, ${currentLng}`;
                showToast('success', '✅ Lokasi Terdeteksi!', `Koordinat: ${currentLat}, ${currentLng}`);

                if (tooltip) {
                    tooltip.innerHTML = '<i class="fa-solid fa-check-circle text-success me-1"></i> <span class="text-success fw-bold">Lokasi berhasil dideteksi!</span>';
                    setTimeout(() => tooltip.classList.remove('show'), 3000);
                }

                btn.innerHTML = originalHtml;
                btn.classList.remove('loading');
                btn.disabled = false;
            },
            (error) => {
                let errorMessage = 'Gagal mendeteksi lokasi. ';
                switch (error.code) {
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
                    setTimeout(() => tooltip.classList.remove('show'), 5000);
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
            const position = marker.getLatLng();
            currentLat = position.lat.toFixed(6);
            currentLng = position.lng.toFixed(6);
            const coordDisplay = document.getElementById('coordDisplay');
            if (coordDisplay) coordDisplay.innerText = `${currentLat}, ${currentLng}`;
        });

        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            currentLat = e.latlng.lat.toFixed(6);
            currentLng = e.latlng.lng.toFixed(6);
            const coordDisplay = document.getElementById('coordDisplay');
            if (coordDisplay) coordDisplay.innerText = `${currentLat}, ${currentLng}`;
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
    const toast = document.getElementById('locationToast');
    if (!toast) return;

    const icon = toast.querySelector('.toast-icon');
    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');

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
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function closeToast() {
    const toast = document.getElementById('locationToast');
    if (toast) {
        toast.classList.remove('show');
        clearTimeout(toast._timeout);
    }
}

// ============================================================
// MODAL ORDER
// ============================================================

function openOrderModal(initialProduct = "") {
    const container = document.getElementById('orderItemsContainer');
    if (container) {
        container.innerHTML = '';
        addOrderItem(initialProduct, 1, 'Normal (100%)');
    }
    if (orderModalInstance) {
        orderModalInstance.show();
    }
}

function addOrderItem(selectedName = "", qty = 1, selectedSweetness = "Normal (100%)") {
    const container = document.getElementById('orderItemsContainer');
    if (!container) return;

    const rowId = 'item-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    let optionsHtml = '<option value="" disabled>--- Pilih Menu ---</option>';

    if (siteConfig && siteConfig.products) {
        if (siteConfig.products.bestSeller && siteConfig.products.bestSeller.length > 0) {
            optionsHtml += '<optgroup label="-- FAVORIT / BEST SELLER --">';
            siteConfig.products.bestSeller.forEach(p => {
                const valStr = `${p.name}|${p.price}|${p.rawPrice}`;
                const isSelected = (p.name === selectedName) ? 'selected' : '';
                optionsHtml += `<option value="${valStr}" ${isSelected}>${p.name} - ${p.price}</option>`;
            });
            optionsHtml += '</optgroup>';
        }
        if (siteConfig.products.coffee && siteConfig.products.coffee.length > 0) {
            optionsHtml += '<optgroup label="-- COFFEE --">';
            siteConfig.products.coffee.forEach(p => {
                const valStr = `${p.name}|${p.price}|${p.rawPrice}`;
                const isSelected = (p.name === selectedName) ? 'selected' : '';
                optionsHtml += `<option value="${valStr}" ${isSelected}>${p.name} - ${p.price}</option>`;
            });
            optionsHtml += '</optgroup>';
        }
        if (siteConfig.products.nonCoffee && siteConfig.products.nonCoffee.length > 0) {
            optionsHtml += '<optgroup label="-- NON-COFFEE --">';
            siteConfig.products.nonCoffee.forEach(p => {
                const valStr = `${p.name}|${p.price}|${p.rawPrice}`;
                const isSelected = (p.name === selectedName) ? 'selected' : '';
                optionsHtml += `<option value="${valStr}" ${isSelected}>${p.name} - ${p.price}</option>`;
            });
            optionsHtml += '</optgroup>';
        }
    }

    if (!selectedName) {
        optionsHtml = optionsHtml.replace('value="" disabled', 'value="" disabled selected');
    }

    const sweetnessLevels = (siteConfig.modal_settings && siteConfig.modal_settings.sweetness_levels) ?
        siteConfig.modal_settings.sweetness_levels :
        ["Normal (100%)", "Slight (70% - 80%)", "Less (50%)", "Low (25%)", "No Sugar"];

    let sweetnessOptionsHtml = '';
    sweetnessLevels.forEach(lvl => {
        const isSel = (lvl === selectedSweetness) ? 'selected' : '';
        sweetnessOptionsHtml += `<option value="${lvl}" ${isSel}>${lvl}</option>`;
    });

    const rowDiv = document.createElement('div');
    rowDiv.className = 'card p-3 bg-light border item-row';
    rowDiv.id = rowId;
    rowDiv.innerHTML = `
        <div class="row g-2 align-items-center">
            <div class="col-12 col-md-5 col-product">
                <label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">PRODUK</label>
                <select class="form-select form-select-sm product-choice" onchange="calculateGrandTotal()" required>
                    ${optionsHtml}
                </select>
            </div>
            <div class="col-6 col-md-4 col-sweetness">
                <label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">TINGKAT KEMANISAN</label>
                <select class="form-select form-select-sm product-sweetness">
                    ${sweetnessOptionsHtml}
                </select>
            </div>
            <div class="col-4 col-md-2 col-qty">
                <label class="form-label text-muted fw-semibold" style="font-size: 9px; margin-bottom: 2px;">JUMLAH</label>
                <input type="number" class="form-control form-control-sm product-qty" min="1" value="${qty}" oninput="calculateGrandTotal()" required>
            </div>
            <div class="col-2 col-md-1 col-delete text-end">
                <label class="form-label d-block text-white" style="font-size: 9px; margin-bottom: 2px;">-</label>
                <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="removeOrderItem('${rowId}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
    container.appendChild(rowDiv);
    calculateGrandTotal();
}

function removeOrderItem(rowId) {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length > 1) {
        const el = document.getElementById(rowId);
        if (el) el.remove();
        calculateGrandTotal();
    } else {
        alert("Minimal harus ada 1 produk dalam pesanan.");
    }
}

function calculateGrandTotal() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
        const selectEl = row.querySelector('.product-choice');
        const qtyEl = row.querySelector('.product-qty');
        if (selectEl && selectEl.value && qtyEl && qtyEl.value) {
            const valParts = selectEl.value.split('|');
            const rawPrice = parseInt(valParts[2]) || 0;
            const qty = parseInt(qtyEl.value) || 0;
            grandTotal += rawPrice * qty;
        }
    });
    const grandTotalEl = document.getElementById('grandTotalDisplay');
    if (grandTotalEl) grandTotalEl.innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

// ============================================================
// SEND WHATSAPP ORDER
// ============================================================

function sendWhatsAppOrder(event) {
    event.preventDefault();

    const nameEl = document.getElementById('customerName');
    const addressEl = document.getElementById('customerAddress');

    const name = nameEl ? nameEl.value : '';
    const address = addressEl ? addressEl.value : '';
    const mapsLink = `https://maps.google.com/?q=${currentLat},${currentLng}`;

    let itemsText = "";
    let isValid = true;
    let grandTotal = 0;

    const rows = document.querySelectorAll('.item-row');
    rows.forEach((row, index) => {
        const selectEl = row.querySelector('.product-choice');
        const sweetEl = row.querySelector('.product-sweetness');
        const qtyEl = row.querySelector('.product-qty');

        if (!selectEl || !selectEl.value) {
            isValid = false;
            return;
        }

        const valParts = selectEl.value.split('|');
        const rawPrice = parseInt(valParts[2]) || 0;
        const qty = parseInt(qtyEl.value) || 0;
        const subtotal = rawPrice * qty;
        grandTotal += subtotal;

        itemsText += `${index + 1}. *${valParts[0]}* (${valParts[1]})\n   - Jumlah: *${qty} Botol*\n   - Manis: *${sweetEl.value}*\n   - Subtotal: *Rp ${subtotal.toLocaleString('id-ID')}*\n\n`;
    });

    if (!isValid) {
        alert("Mohon pilih menu terlebih dahulu pada setiap baris produk.");
        return;
    }

    // Gunakan template dari content.json atau fallback
    const template = siteConfig.whatsapp_messages?.order_template ||
        "Halo kak 👋\n\nIzin pesan produk berikut:\n{items}\n\n*Estimasi Total:* *Rp {total}*\n\n*Nama Pemesan:* {name}\n*Detail Alamat:* {address}\n*Titik Google Maps:* {maps}\n\nMohon info ketersediaan dan total pembayarannya ya, terima kasih! 🙏";

    const textMessage = template
        .replace(/{items}/g, itemsText.trim())
        .replace(/{total}/g, grandTotal.toLocaleString('id-ID'))
        .replace(/{name}/g, name)
        .replace(/{address}/g, address)
        .replace(/{maps}/g, mapsLink);

    const encodedMessage = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${siteConfig.whatsapp || '6285786012464'}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}
