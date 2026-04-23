
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

// Hide actual title until loading finishes
const siteTitle = document.querySelector('.site-title');
siteTitle.style.opacity = '0';

setTimeout(() => {
    const loading = document.getElementById('loading');
    const loadingTitle = document.getElementById('loading-title');
    const targetRect = siteTitle.getBoundingClientRect();
    const fromRect = loadingTitle.getBoundingClientRect();

    const scaleX = targetRect.width / fromRect.width;
    const scaleY = targetRect.height / fromRect.height;
    const dx = targetRect.left + targetRect.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy = targetRect.top + targetRect.height / 2 - (fromRect.top + fromRect.height / 2);
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

// About panel
document.getElementById('about-tab').addEventListener('click', () => {
    document.getElementById('about-panel').classList.toggle('open');
});

// Back to top button
const backToTop = document.getElementById('back-to-top');
document.querySelector('main').addEventListener('scroll', function() {
    backToTop.classList.toggle('visible', this.scrollTop > 200);
});
backToTop.addEventListener('click', () => {
    document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' });
});

// Cropper
let cropper = null;
let croppedDataUrl = null;

document.getElementById('form-image').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    croppedDataUrl = null;
    const reader = new FileReader();
    reader.onload = function(ev) {
        document.getElementById('upload-label').style.display = 'none';
        document.getElementById('crop-container').style.display = 'none';
        if (cropper) { cropper.destroy(); cropper = null; }
        const preview = document.getElementById('crop-preview');
        preview.src = ev.target.result;
        preview.style.display = 'block';
        document.getElementById('crop-btn').style.display = 'block';
        document.getElementById('crop-image').src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('crop-btn').addEventListener('click', () => {
    const cropBtn = document.getElementById('crop-btn');

    if (!cropper) {
        // Start cropping
        document.getElementById('crop-preview').style.display = 'none';
        const cropContainer = document.getElementById('crop-container');
        cropContainer.style.display = 'block';
        cropper = new Cropper(document.getElementById('crop-image'), {
            viewMode: 1,
            autoCropArea: 1,
            background: false,
            guides: false,
            highlight: false,
        });
        cropBtn.textContent = 'CONFIRM';
    } else {
        // Confirm crop
        cropper.getCroppedCanvas().toBlob(blob => {
            const reader = new FileReader();
            reader.onload = ev => {
                croppedDataUrl = ev.target.result;
                document.getElementById('crop-container').style.display = 'none';
                cropper.destroy();
                cropper = null;
                const preview = document.getElementById('crop-preview');
                preview.src = croppedDataUrl;
                preview.style.display = 'block';
                cropBtn.textContent = 'CROP';
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }
});

// Show custom category input when "Other" is selected
document.getElementById('form-category').addEventListener('change', function() {
    const customField = document.getElementById('custom-category-field');
    const customInput = document.getElementById('form-category-custom');
    if (this.value === 'Other') {
        customField.style.display = '';
        customInput.required = true;
    } else {
        customField.style.display = 'none';
        customInput.required = false;
    }
});

const overlay = document.getElementById('modal-overlay');

function closeModal() {
    overlay.classList.remove('open');
    document.getElementById('submit-form').reset();
    if (cropper) { cropper.destroy(); cropper = null; }
    croppedDataUrl = null;
    document.getElementById('crop-container').style.display = 'none';
    document.getElementById('crop-image').src = '';
    document.getElementById('crop-preview').style.display = 'none';
    document.getElementById('crop-preview').src = '';
    const label = document.querySelector('.upload-label');
    if (label) label.style.display = '';
    const customField = document.getElementById('custom-category-field');
    if (customField) customField.style.display = 'none';
    const customInput = document.getElementById('form-category-custom');
    if (customInput) customInput.required = false;
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
    const rawCategory = document.getElementById('form-category').value;
    const category = rawCategory === 'Other'
        ? (document.getElementById('form-category-custom').value || 'Other')
        : rawCategory;
    const location = document.getElementById('form-location').value;
    const price = document.getElementById('form-price').value || 'NA';
    const email = document.getElementById('form-email').value;
    const note = document.getElementById('form-note').value;

    if (!croppedDataUrl) {
        alert('Please crop your image first.');
        submitBtn.textContent = 'SUBMIT';
        submitBtn.disabled = false;
        return;
    }

    const imageBase64 = croppedDataUrl.split(',')[1];

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
    img.src = croppedDataUrl;
    img.alt = category;
    card.appendChild(img);

    const submitCard = document.getElementById('submit-card');
    submitCard.parentNode.insertBefore(card, submitCard.nextSibling);

    buildDetail(card);
    closeModal();
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
            <span class="detail-value">${card.dataset.object || 'NA'}</span>
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
            <span class="detail-label">Note:</span>
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
