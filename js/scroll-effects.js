const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animar');
    });
  });
  
  document.querySelectorAll('.animable').forEach(el => observer.observe(el));

  // scroll-effects.js

// Este script aplica una animación de aparición al hacer scroll

document.addEventListener('DOMContentLoaded', function () {
    const elementos = document.querySelectorAll('.fade-in');
  
    function mostrarElementos() {
      const triggerBottom = window.innerHeight * 0.85;
  
      elementos.forEach(el => {
        const boxTop = el.getBoundingClientRect().top;
        if (boxTop < triggerBottom) {
          el.classList.add('visible');
        } else {
          el.classList.remove('visible');
        }
      });
    }
  
    window.addEventListener('scroll', mostrarElementos);
    mostrarElementos(); // ejecuta al cargar
  });
  