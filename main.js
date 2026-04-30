

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


// Loading screen
const images = [
    'manhatta 1.jpg', 'heros.jpg', 'monkey bar.jpg', 'The Corner Store.jpg',
    'polo bar.jpg', 'deux chats.jpg', 'The Standard.jpg', 'manhatta 3.jpg',
    'bar madonna.jpg', "jefrey's grocery.jpg", 'manhatta 2.jpg'
];

const loadingContainer = document.getElementById('loading-images');

// Generate edge positions avoiding the center 35-65% x, 30-70% y
function edgePosition() {
    const zones = [
        () => ({ left: Math.random() * 28, top: Math.random() * 80 + 10 }),
        () => ({ left: Math.random() * 28 + 68, top: Math.random() * 80 + 10 }),
        () => ({ left: Math.random() * 40 + 20, top: Math.random() * 18 }),
        () => ({ left: Math.random() * 40 + 20, top: Math.random() * 18 + 76 }),
    ];
    const pos = zones[Math.floor(Math.random() * zones.length)]();
    return pos;
}

images.forEach((src, i) => {
    setTimeout(() => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'loading-img';
        const pos = edgePosition();
        img.style.left = pos.left + 'vw';
        img.style.top  = pos.top + 'vh';
        loadingContainer.appendChild(img);
        setTimeout(() => img.remove(), 3500);
    }, i * 400);
});

const siteTitle = document.querySelector('.site-title');
const skipAnimation = new URLSearchParams(window.location.search).has('skip');

if (skipAnimation) {
    document.getElementById('loading').remove();
    history.replaceState({}, '', window.location.pathname);
} else {
    siteTitle.style.opacity = '0';

    setTimeout(() => {
        const loading = document.getElementById('loading');
        const loadingTitle = document.getElementById('loading-title');
        const targetRect = siteTitle.getBoundingClientRect();
        const fromRect = loadingTitle.getBoundingClientRect();

        const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const scaleX = targetRect.width / fromRect.width;
        const scaleY = targetRect.height / fromRect.height;
        const dx = (targetRect.left + targetRect.width / 2 - (fromRect.left + fromRect.width / 2)) / zoom;
        const dy = (targetRect.top + targetRect.height / 2 - (fromRect.top + fromRect.height / 2)) / zoom;
        const scale = Math.min(scaleX, scaleY);

        loadingTitle.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.9s ease';
        loadingTitle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
        loadingTitle.style.opacity = '0';

        setTimeout(() => {
            loading.classList.add('hidden');
            siteTitle.style.transition = 'opacity 0.4s ease';
            siteTitle.style.opacity = '1';
            setTimeout(() => {
                loading.remove();
                siteTitle.style.transition = '';
                siteTitle.style.opacity = '';
            }, 600);
        }, 900);
    }, 6000);
}


// Back to top button
const backToTop = document.getElementById('back-to-top');
document.querySelector('main').addEventListener('scroll', function() {
    backToTop.classList.toggle('visible', this.scrollTop > 200);
});
backToTop.addEventListener('click', () => {
    document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' });
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

document.getElementById('submit-form').addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = document.querySelector('.form-submit');
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    try {
    const file = document.getElementById('form-image').files[0];
    const category = document.getElementById('form-category').value;
    const location = document.getElementById('form-location').value;
    const price = document.getElementById('form-price').value || 'NA';
    const email = document.getElementById('form-email').value;
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
            category, location, price, email, note,
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
    card.dataset.by = email || 'Community';
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
    const detail = document.createElement('div');
    detail.className = 'detail';
    detail.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">OBJECT:</span>
            <span class="detail-value">${card.dataset.customObject || card.dataset.object || 'NA'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">LOCATION:</span>
            <span class="detail-value">${card.dataset.location || 'NA'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">PRICE:</span>
            <span class="detail-value">${card.dataset.price || 'NA'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">SUBMITTED BY:</span>
            <span class="detail-value">${card.dataset.by || 'NA'}</span>
        </div>
        <div class="detail-row detail-note">
            <span class="detail-label">NOTE:</span>
            <span class="detail-value">${card.dataset.note || ''}</span>
        </div>
    `;
    card.appendChild(detail);
    let flipTimer;
    card.addEventListener('click', () => {
        const isFlipped = card.classList.toggle('flipped');
        clearTimeout(flipTimer);
        if (isFlipped) {
            flipTimer = setTimeout(() => card.classList.remove('flipped'), 10000);
        }
    });
}

document.querySelectorAll('.card:not(#submit-card)').forEach(card => buildDetail(card));
loadSavedCards();

// Scroll-driven compact header
const headerInnerEl = document.querySelector('.header-inner');
const mainScrollEl  = document.querySelector('main');
const compactDist   = 300;

mainScrollEl.addEventListener('scroll', () => {
    const p = Math.min(mainScrollEl.scrollTop / compactDist, 1);
    headerInnerEl.style.height        = (30 - 18 * p) + 'vh';
    headerInnerEl.style.paddingTop    = (50 - 38 * p) + 'px';
    headerInnerEl.style.paddingBottom = (28 - 22 * p) + 'px';
    headerInnerEl.style.gap           = (20 - 14 * p) + 'px';
    if (siteTitle.style.opacity !== '0') {
        siteTitle.style.fontSize = (90 - 50 * p) + 'px';
    }
    document.querySelectorAll('.filter-link').forEach(l => l.style.fontSize = (12 - 4 * p) + 'px');
    document.querySelectorAll('.gallery-view-link, .about-link').forEach(l => { l.style.fontSize = (12 - 2 * p) + 'px'; l.style.top = (50 - 38 * p) + 'px'; });
});
