  document.addEventListener('DOMContentLoaded', async () => {
    const urlTestimonios = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Testimonios';
  
    // otras funciones como construirCategorias, mostrarProductos...
  
    async function mostrarTestimonios() {
        try {
          const resp = await fetch(urlTestimonios);
          if (!resp.ok) throw new Error(`Error al cargar testimonios: ${resp.status}`);
          const data = await resp.json();
      
          const track = document.getElementById('testimonios');
          if (!track) return;
      
          data.forEach(t => {
            const div = document.createElement('div');
            div.className = 'testimonio';
      
            div.innerHTML = `
              <img src="${t.imagen_url}" alt="Testimonio visual de cliente" loading="lazy">
            `;
      
            track.appendChild(div);
          });
      
          iniciarCarrusel(data.length);
        } catch (err) {
          console.error("Error cargando testimonios:", err);
        }
      }        
  
    // Al final del bloque:
    await mostrarTestimonios();
  });
  

  function iniciarCarrusel(totalSlides) {
    const track = document.getElementById('testimonios');
    let index = 0;
  
    document.getElementById('nextBtn').addEventListener('click', () => {
      index = (index + 1) % totalSlides;
      track.style.transform = `translateX(-${index * 100}%)`;
    });
  
    document.getElementById('prevBtn').addEventListener('click', () => {
      index = (index - 1 + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${index * 100}%)`;
    });
  }