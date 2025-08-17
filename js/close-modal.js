// Para cerrar el modal con el botón de cierre
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');

    if (modal && modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});