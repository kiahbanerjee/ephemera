const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
document.documentElement.style.setProperty('--splash-height', (window.innerHeight / zoom) + 'px');

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

// Wrap every word in hover-word spans (text nodes only, preserves existing HTML)
document.querySelectorAll('.content-inner p').forEach(p => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) textNodes.push(node);
    textNodes.forEach(textNode => {
        const parts = textNode.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
            if (!part || /^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
            } else {
                const span = document.createElement('span');
                span.className = 'hover-word';
                span.textContent = part;
                frag.appendChild(span);
            }
        });
        textNode.parentNode.replaceChild(frag, textNode);
    });
});

// Parallax title
const aboutTitle = document.getElementById('about-title');
window.addEventListener('scroll', () => {
    aboutTitle.style.transform = `translateY(-${window.scrollY * 0.35}px)`;
});
