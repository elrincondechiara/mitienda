let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    const buttons = document.querySelectorAll('.whatsapp-float');
    buttons.forEach(btn => {
        btn.style.transition = "opacity 0.5s";
    });

    if (currentScroll > lastScroll) {
        // Scroll hacia abajo -> ocultar
        buttons.forEach(btn => btn.style.opacity = "0.2");
    } else {
        // Scroll hacia arriba -> mostrar
        buttons.forEach(btn => btn.style.opacity = "1");
    }
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});