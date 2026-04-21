
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
}, 7000);

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
document.getElementById('submit-card').addEventListener('click', () => {
    overlay.classList.add('open');
});
overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
});


document.getElementById('submit-form').addEventListener('submit', e => {
    e.preventDefault();
    const file = document.getElementById('form-image').files[0];
    const rawCategory = document.getElementById('form-category').value;
    const category = rawCategory === 'Other'
        ? (document.getElementById('form-category-custom').value || 'Other')
        : rawCategory;
    const location = document.getElementById('form-location').value;
    const price = document.getElementById('form-price').value || 'NA';
    const note = document.getElementById('form-note').value;

    const reader = new FileReader();
    reader.onload = function(ev) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.object = category;
        card.dataset.location = location;
        card.dataset.price = price;
        card.dataset.by = 'Community';
        card.dataset.note = note;

        const img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = category;
        card.appendChild(img);

     
        const submitCard = document.getElementById('submit-card');
        submitCard.parentNode.insertBefore(card, submitCard.nextSibling);

        buildDetail(card);
        overlay.classList.remove('open');
        document.getElementById('submit-form').reset();
    };
    reader.readAsDataURL(file);
});


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
    card.addEventListener('click', () => card.classList.toggle('flipped'));
}

document.querySelectorAll('.card:not(#submit-card)').forEach(card => buildDetail(card));
