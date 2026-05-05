

// Heavy smooth scroll
let targetY = window.scrollY;
let currentY = window.scrollY;
const scrollEase = 0.055;

window.addEventListener('wheel', e => {
    e.preventDefault();
    targetY += e.deltaY;
    targetY = Math.max(0, targetY);
}, { passive: false });

(function smoothLoop() {
    const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    targetY = Math.min(targetY, maxScroll);
    currentY += (targetY - currentY) * scrollEase;
    window.scrollTo(0, currentY);
    requestAnimationFrame(smoothLoop);
})();

// Fix splash height for zoom: 1.5
const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
document.documentElement.style.setProperty('--splash-height', (window.innerHeight / zoom) + 'px');

document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const filter = link.textContent.trim();
        document.querySelectorAll('.card:not(#submit-card)').forEach(card => {
            if (filter === 'ALL' || card.dataset.object.toUpperCase() === filter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});


// Random placement of splash images
(function placeSplashImages() {
    const loading = document.getElementById('loading');
    const imgs = Array.from(document.querySelectorAll('.splash-img'));
    const W = loading.offsetWidth;
    const H = loading.offsetHeight;
    const imgW = 80, imgH = 80, titleH = 130;

    // Shuffle images so order changes each load
    imgs.sort(() => Math.random() - 0.5);

    // Divide into a 3×2 grid of zones, pick random spot within each
    const cols = 3, rows = 2;
    const zoneW = W / cols, zoneH = (H - titleH) / rows;
    const zones = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            zones.push({ x: c * zoneW, y: r * zoneH });

    zones.sort(() => Math.random() - 0.5);

    imgs.forEach((img, i) => {
        const zone = zones[i % zones.length];
        const x = zone.x + 20 + Math.random() * (zoneW - imgW - 40);
        const y = zone.y + 20 + Math.random() * (zoneH - imgH - 20);
        img.style.left = x + 'px';
        img.style.top  = y + 'px';
        img.style.animationDelay = (i * 1.5 + Math.random() * 0.5) + 's';
    });
})();

// Invert header when near top (splash visible)
const headerEl = document.querySelector('header');
window.addEventListener('scroll', () => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const splashH = window.innerHeight / z;
    headerEl.classList.toggle('inverted', window.scrollY >= splashH);
});

// Parallax title on splash
const loadingTitle = document.getElementById('loading-title');
window.addEventListener('scroll', () => {
    loadingTitle.style.transform = `translateY(-${window.scrollY * 0.35}px)`;
});


// Image preview in modal
document.getElementById('form-image').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const left = document.querySelector('.modal-left');
        let preview = left.querySelector('.upload-preview');
        if (!preview) {
            preview = document.createElement('img');
            preview.className = 'upload-preview';
            left.appendChild(preview);
        }
        preview.src = ev.target.result;
        document.getElementById('upload-label').style.display = 'none';

        let changeBtn = left.querySelector('.change-upload-btn');
        if (!changeBtn) {
            changeBtn = document.createElement('button');
            changeBtn.type = 'button';
            changeBtn.className = 'change-upload-btn';
            changeBtn.textContent = 'CHANGE UPLOAD';
            changeBtn.addEventListener('click', e => {
                e.stopPropagation();
                document.getElementById('form-image').click();
            });
            left.appendChild(changeBtn);
        }
    };
    reader.readAsDataURL(file);
});


// Custom category dropdown
const customSelect = document.getElementById('custom-category');
const nativeSelect = document.getElementById('form-category');
const selectValue = customSelect.querySelector('.custom-select-value');

customSelect.querySelector('.custom-select-trigger').addEventListener('click', () => {
    customSelect.classList.toggle('open');
});

customSelect.querySelectorAll('.custom-select-option').forEach(opt => {
    opt.addEventListener('click', () => {
        selectValue.textContent = opt.textContent;
        nativeSelect.value = opt.dataset.value;
        customSelect.classList.remove('open');
    });
});

document.addEventListener('click', e => {
    if (!customSelect.contains(e.target)) customSelect.classList.remove('open');
});

const overlay = document.getElementById('modal-overlay');

function closeModal() {
    overlay.classList.remove('open');
    document.getElementById('submit-form').reset();
    selectValue.textContent = '';
    customSelect.classList.remove('open');
    const preview = document.querySelector('.upload-preview');
    if (preview) preview.remove();
    const changeBtn = document.querySelector('.change-upload-btn');
    if (changeBtn) changeBtn.remove();
    const label = document.querySelector('.upload-label');
    if (label) label.style.display = '';
}

document.getElementById('submit-card').addEventListener('click', () => {
    overlay.classList.add('open');
});
overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});
document.getElementById('modal-close').addEventListener('click', e => {
    e.stopPropagation();
    closeModal();
});


const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6L5uT-6Gip9CiqYTwvqFQl39gO0c0my1jPpLdZF4m5NWgBJo2i_gL69aXaGpYx_7G3w/exec';

function showFormToast(msg) {
    let toast = document.getElementById('form-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'form-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 2500);
}

document.getElementById('submit-form').addEventListener('submit', async e => {
    e.preventDefault();

    const category = document.getElementById('form-category').value;
    const location = document.getElementById('form-location').value;
    const price = document.getElementById('form-price').value;

    const file = document.getElementById('form-image').files[0];
    if (!category || !location || !price || !file) {
        showFormToast('pls fill <3');
        return;
    }

    const submitBtn = document.querySelector('.form-submit');
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    try {
    const note = document.getElementById('form-note').value;

    const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
            category, location, price, note,
            imageBase64,
            imageMimeType: 'image/jpeg',
            imageName: file.name
        })
    });

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.object = category;
    card.dataset.location = location;
    card.dataset.price = price;
    card.dataset.by = 'Community';
    card.dataset.note = note;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = category;
    card.appendChild(img);

    const submitCard = document.getElementById('submit-card');
    submitCard.parentNode.insertBefore(card, submitCard.nextSibling);

    buildDetail(card);
    closeModal();
    const successOverlay = document.getElementById('success-overlay');
    successOverlay.classList.add('open');
    setTimeout(() => successOverlay.classList.remove('open'), 2000);
    } catch (err) {
        console.error('Submission error:', err);
        alert('Submission failed: ' + err.message);
    } finally {
        submitBtn.textContent = 'SUBMIT';
        submitBtn.disabled = false;
    }
});

async function loadSavedCards() {
    const url = `https://docs.google.com/spreadsheets/d/1D0gaICwWj3kSvwjrA_nxVazcgKTmSy9Nwd5vfh6_FtI/gviz/tq?tqx=out:json`;

    const res = await fetch(url);
    const text = await res.text();

    const json = JSON.parse(text.substring(47, text.length - 2));
    const rows = json.table.rows;

    rows.forEach(row => {
        const cols = row.c;
        const imageUrl = cols[5]?.v?.trim();
        if (!imageUrl || !imageUrl.startsWith('http')) return;

        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.object = cols[0]?.v || '';
        card.dataset.location = cols[1]?.v || '';
        card.dataset.price = cols[2]?.v || 'NA';
        card.dataset.by = cols[3]?.v || 'Community';
        card.dataset.note = cols[4]?.v || '';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = card.dataset.object;
        card.appendChild(img);

        const submitCard = document.getElementById('submit-card');
        submitCard.parentNode.insertBefore(card, submitCard.nextSibling);
        buildDetail(card);
    });
}

function buildDetail(card) {
    const category = document.createElement('span');
    category.className = 'card-category';
    category.textContent = card.dataset.object || '';

    const location = document.createElement('span');
    location.className = 'card-location';
    location.textContent = card.dataset.location || '';

    const price = document.createElement('span');
    price.className = 'card-price';
    price.textContent = card.dataset.price || '';

    card.appendChild(category);
    card.appendChild(location);
    card.appendChild(price);

    if (card.dataset.note) {
        const tooltip = document.createElement('div');
        tooltip.className = 'card-note-tooltip';
        tooltip.textContent = card.dataset.note;
        document.body.appendChild(tooltip);

        const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        card.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
        card.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
        card.addEventListener('mousemove', e => {
            tooltip.style.left = (e.clientX / z + 12) + 'px';
            tooltip.style.top  = (e.clientY / z + 12) + 'px';
        });
    }
}

document.querySelectorAll('.card:not(#submit-card)').forEach(card => buildDetail(card));
loadSavedCards();

