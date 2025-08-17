const urlEnvios = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Envios';

document.addEventListener('DOMContentLoaded', async () => {
  const urlCategorias = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Categorias';
  const urlProductos = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Lista';

  try {
    // Paraleo para mejor rendimiento
    const [categoriasResp, productosResp] = await Promise.all([
      fetch(urlCategorias),
      fetch(urlProductos)
    ]);

    if (!categoriasResp.ok) throw new Error(`Error al cargar categorías: ${categoriasResp.status}`);
    if (!productosResp.ok) throw new Error(`Error al cargar productos: ${productosResp.status}`);

    const categoriasData = await categoriasResp.json();
    const productosData = await productosResp.json();

    construirCategorias(categoriasData);
    mostrarProductos(productosData);
  } catch (error) {
    console.error("Error cargando categorías o productos:", error);
    alerta("Error cargando la tienda. Intenta nuevamente.");
  }

  function construirCategorias(data) {
    const nav = document.getElementById('categorias-nav');
    const contenedor = document.getElementById('categorias-contenedor');

    // Limpiar contenido previo para evitar duplicados si se llama más de una vez
    nav.innerHTML = '';
    contenedor.innerHTML = '';

    data.forEach(({ categoria }) => {
      if (!categoria) return;
      const catKey = categoria.toLowerCase().trim();
      const catDisplay = categoria.charAt(0).toUpperCase() + categoria.slice(1);

      // Crear link accesible
      const link = document.createElement('a');
      link.href = `#${catKey}`;
      link.textContent = catDisplay;
      link.setAttribute('role', 'link');
      link.setAttribute('aria-label', `Ir a categoría ${catDisplay}`);
      nav.appendChild(link);

      // Crear contenedor categoría
      const section = document.createElement('section');
      section.className = 'container';
      section.id = catKey;
      section.setAttribute('aria-live', 'polite'); // Anunciar cambios si se actualiza
      contenedor.appendChild(section);
    });
  }

  function mostrarProductos(data) {
    // Cache contenedores para acceso rápido
    const contenedores = {};
    document.querySelectorAll('.container').forEach(sec => contenedores[sec.id] = sec);

    // Fragmento para batch DOM insertion y mejor performance
    const fragmentosPorCategoria = {};

    data.forEach(producto => {
      if (!producto.categoria) return;

      const categoriaKey = producto.categoria.toLowerCase().trim();
      const contenedorCat = contenedores[categoriaKey];
      if (!contenedorCat) return;

      if (!fragmentosPorCategoria[categoriaKey]) {
        fragmentosPorCategoria[categoriaKey] = document.createDocumentFragment();
      }

      const sinStock = !producto.stock || Number(producto.stock) <= 0;
      const tieneDescuento = producto.descuento && parseFloat(producto.descuento) > 0;

      // Crear elemento producto
      const div = document.createElement('div');
      div.className = 'product';
      div.dataset.nombre = producto.nombre || '';
      div.dataset.precio = producto.precio || '0';
      div.style.position = 'relative';
      div.tabIndex = sinStock ? -1 : 0; // No accesible si sin stock

      // Aplicar estilos si sin stock
      if (sinStock) {
        div.style.filter = 'grayscale(100%)';
        div.style.opacity = '0.6';
        div.style.pointerEvents = 'none';
      }

      // Crear contenido optimizado
      div.innerHTML = `
        <img 
          src="${producto.imagen ? producto.imagen + '?v=' + Date.now() : 'img/no-image.png'}" 
          alt="${producto.nombre || 'Producto sin nombre'}" 
          title="${producto.nombre || ''} - $${producto.precio || '0'} - ${producto.descripcion || ''}"
          loading="lazy"
          style="cursor: ${sinStock ? 'default' : 'pointer'}"
        />
        <h3>${producto.nombre || 'Sin nombre'}</h3>
        <p>${producto.descripcion || ''}</p>
        <p class="precio-producto">$${producto.precio || '0'}</p>
      `;

      // Si sin stock mostrar aviso
      if (sinStock) {
        const aviso = document.createElement('div');
        aviso.textContent = 'Sin stock';
        Object.assign(aviso.style, {
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontWeight: 'bold',
          userSelect: 'none'
        });
        div.appendChild(aviso);
      }

      // Mostrar descuento si aplica y no sin stock
      if (tieneDescuento && !sinStock) {
        const oferta = document.createElement('div');
        oferta.textContent = `¡Oferta! -${producto.descuento}%`;
        Object.assign(oferta.style, {
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#ff4081',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          userSelect: 'none'
        });
        div.appendChild(oferta);

        // Calcular precio final con descuento
        const precioOriginal = parseFloat(producto.precio) || 0;
        const descuento = parseFloat(producto.descuento);
        const precioFinal = precioOriginal - (precioOriginal * (descuento / 100));

        const precioP = div.querySelector('p.precio-producto');
        if (precioP) {
          precioP.innerHTML = `
            <span style="text-decoration: line-through; color: gray;">$${precioOriginal.toFixed(2)}</span><br>
            <span style="color: #d81b60; font-weight: bold;">$${precioFinal.toFixed(2)}</span>
          `;
        }
      }

      // Evento click imagen para abrir galería, solo si hay stock
      const img = div.querySelector('img');
      if (img && !sinStock) {
        img.addEventListener('click', () => mostrarGaleriaProducto(producto));
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            mostrarGaleriaProducto(producto);
          }
        });
      }

      fragmentosPorCategoria[categoriaKey].appendChild(div);
    });

    // Insertar fragmentos al DOM de una sola vez
    Object.entries(fragmentosPorCategoria).forEach(([cat, frag]) => {
      contenedores[cat].appendChild(frag);
    });
  }

  // Consulta costo de envío, pública para ser llamada externamente
  window.consultarEnvio = async function () {
    const cpInput = document.getElementById('input-cp');
    if (!cpInput) return;
    const cp = cpInput.value.trim();
    const resultado = document.getElementById('resultado-envio');

    if (!cp) {
      resultado.textContent = "Por favor ingresá un código postal.";
      resultado.style.color = 'red';
      return;
    }

    resultado.textContent = "Consultando costo de envío...";
    resultado.style.color = 'black';

    try {
      // Cache simple en sesión para evitar múltiples fetch en la misma sesión
      if (!window._cacheEnvios) {
        const resp = await fetch(urlEnvios);
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
        window._cacheEnvios = await resp.json();
      }
      const enviosArray = Array.isArray(window._cacheEnvios) ? window._cacheEnvios : (window._cacheEnvios.envios || []);

      const registro = enviosArray.find(envio => envio.cp === cp);
      if (registro) {
        resultado.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
        resultado.style.color = 'green';
      } else {
        resultado.textContent = "No se encontró información para ese código postal.";
        resultado.style.color = 'orange';
      }
    } catch (err) {
      console.error("Error consultando costo de envío:", err);
      resultado.textContent = "Hubo un error al consultar. Intentalo más tarde.";
      resultado.style.color = 'red';
    }
  };

});

// Modal galería producto optimizado, accesible y responsivo
function mostrarGaleriaProducto(producto) {
  const modal = document.getElementById('gallery-modal');
  const modalContent = document.getElementById('gallery-content');

  // Limpieza rápida y eficiente
  modalContent.innerHTML = '';

  const contenedorGaleria = document.createElement('div');
  contenedorGaleria.className = 'galeria-producto';
  contenedorGaleria.style.textAlign = 'center';
  contenedorGaleria.style.maxWidth = '90vw';
  contenedorGaleria.style.margin = 'auto';

  const titulo = document.createElement('h3');
  titulo.textContent = producto.nombre || 'Producto';
  titulo.style.color = '#d81b60';
  titulo.style.marginBottom = '0.5em';
  contenedorGaleria.appendChild(titulo);

  const descripcion = document.createElement('p');
  descripcion.textContent = producto['descripción_larga'] || producto.descripcion || '';
  descripcion.style.marginBottom = '1em';
  contenedorGaleria.appendChild(descripcion);

  // Selector colores si existen
  const colores = producto.colores ? producto.colores.split(',').map(c => c.trim()).filter(c => c) : [];
  if (colores.length) {
    const colorContainer = document.createElement('div');
    colorContainer.style.marginBottom = '1em';

    const label = document.createElement('label');
    label.textContent = 'Selecciona un color:';
    label.style.display = 'block';
    label.style.marginBottom = '0.5em';
    label.style.fontWeight = 'bold';
    label.htmlFor = 'select-color';

    const select = document.createElement('select');
    select.id = 'select-color';
    select.style.padding = '0.5em';
    select.style.borderRadius = '4px';
    select.setAttribute('aria-label', 'Selector de color');

    colores.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      select.appendChild(option);
    });

    colorContainer.appendChild(label);
    colorContainer.appendChild(select);
    contenedorGaleria.appendChild(colorContainer);
  }

  // Galería de imágenes (máx 6) con estilos suaves
  const imagenes = [producto.imagen, producto.imagen1, producto.imagen2, producto.imagen3, producto.imagen4, producto.imagen5]
    .filter(Boolean);

  imagenes.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = producto.nombre || 'Imagen del producto';
    img.loading = 'lazy';
    Object.assign(img.style, {
      width: '100%',
      maxWidth: '300px',
      borderRadius: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      margin: '0.5em auto',
      display: 'block',
      userSelect: 'none',
    });
    contenedorGaleria.appendChild(img);
  });

  // Botón agregar al carrito con feedback accesible
  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'modal-btn';
  btnAgregar.textContent = 'Agregar al carrito';
  btnAgregar.setAttribute('aria-label', `Agregar ${producto.nombre} al carrito`);
  btnAgregar.style.marginTop = '1em';

  btnAgregar.addEventListener('click', () => {
    const colorSeleccionado = document.getElementById('select-color')?.value || '';
    const nombreConColor = colorSeleccionado ? `${producto.nombre} (${colorSeleccionado})` : producto.nombre;
    agregarAlCarrito(nombreConColor, parseFloat(producto.precio) || 0);
    modal.style.display = 'none';
    alerta("Producto agregado al carrito", 1500);
  });

  contenedorGaleria.appendChild(btnAgregar);

  modalContent.appendChild(contenedorGaleria);

  // Mostrar modal y poner foco accesible
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  modal.focus();

  // Cerrar modal con Escape
  function onEsc(e) {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
      modal.removeAttribute('aria-hidden');
      document.removeEventListener('keydown', onEsc);
    }
  }
  document.addEventListener('keydown', onEsc, { once: true });
}

// Cerrar modal galería con botón X, accesible
document.getElementById('gallery-close').addEventListener('click', () => {
  const modal = document.getElementById('gallery-modal');
  modal.style.display = 'none';
  modal.removeAttribute('aria-hidden');
});
