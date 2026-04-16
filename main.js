
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
    const category = document.getElementById('form-category').value;
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
