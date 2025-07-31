document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup-bienvenida');
    const closeBtn = document.getElementById('popup-close');
  
    // Mostrar automáticamente después de un segundo
    setTimeout(() => {
      if (popup) popup.classList.remove('hidden');
    }, 1000);
  
    // Cerrar popup
    if (closeBtn && popup) {
      closeBtn.addEventListener('click', () => {
        popup.classList.add('hidden');
      });
    }
  });
  