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

// Parallax title
const aboutTitle = document.getElementById('about-title');
window.addEventListener('scroll', () => {
    aboutTitle.style.transform = `translateY(-${window.scrollY * 0.35}px)`;
});
