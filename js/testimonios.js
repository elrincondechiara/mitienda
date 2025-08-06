  document.addEventListener('DOMContentLoaded', async () => {
    const urlTestimonios = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Testimonios';
  
    // otras funciones como construirCategorias, mostrarProductos...
  
    async function mostrarTestimonios() {
      try {
        const resp = await fetch(urlTestimonios);
        if (!resp.ok) throw new Error(`Error al cargar testimonios: ${resp.status}`);
        const data = await resp.json();
  
        const contenedor = document.getElementById('testimonios');
        if (!contenedor) return;
  
        data.forEach(t => {
          const div = document.createElement('div');
          div.className = 'testimonio';
  
          div.innerHTML = `
            <img src="${t.imagen_url}" alt="Cliente ${t.nombre_cliente}" loading="lazy">
            <blockquote>"${t.comentario}"</blockquote>
            <p>— ${t.usuario_instagram || t.nombre_cliente}</p>
          `;
  
          contenedor.appendChild(div);
        });
      } catch (err) {
        console.error("Error cargando testimonios:", err);
      }
    }
  
    // Al final del bloque:
    await mostrarTestimonios();
  });
  