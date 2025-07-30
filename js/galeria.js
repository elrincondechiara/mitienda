function mostrarGaleriaProducto(producto) {
    const modal = document.getElementById('gallery-modal');
    const modalContent = document.getElementById('gallery-content');

    modalContent.innerHTML = '';

    const contenedorGaleria = document.createElement('div');
    contenedorGaleria.className = 'galeria-producto';
    contenedorGaleria.style.textAlign = 'center';

    const titulo = document.createElement('h3');
    titulo.textContent = producto.nombre;
    titulo.style.color = '#d81b60';
    titulo.style.marginBottom = '0.5em';
    contenedorGaleria.appendChild(titulo);

    const descripcion = document.createElement('p');
    descripcion.textContent = producto['descripción_larga'] || producto.descripcion || '';
    descripcion.style.marginBottom = '1em';
    contenedorGaleria.appendChild(descripcion);

    // Selección de color
    const colores = producto.colores ? producto.colores.split(',').map(c => c.trim()) : [];
        if (colores.length > 0) {
        const colorContainer = document.createElement('div');
        colorContainer.style.marginBottom = '1em';

        const label = document.createElement('label');
        label.textContent = 'Selecciona un color:';
        label.style.display = 'block';
        label.style.marginBottom = '0.5em';
        label.style.fontWeight = 'bold';

        const select = document.createElement('select');
        select.id = 'select-color';
        select.style.padding = '0.5em';
        select.style.borderRadius = '4px';

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

    const imagenes = [producto.imagen, producto.imagen1, producto.imagen2, producto.imagen3, producto.imagen4, producto.imagen5].filter(img => img);

    imagenes.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = producto.nombre;
        img.style.width = '100%';
		img.style.maxWidth = '300px';
		img.style.borderRadius = '16px'; // más suavizado
		img.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
		img.style.margin = '0.5em auto';
		img.style.display = 'block';
        contenedorGaleria.appendChild(img);
    });

    const btnAgregar = document.createElement('button');
    btnAgregar.className = 'modal-btn';
    btnAgregar.textContent = 'Agregar al carrito';
    btnAgregar.addEventListener('click', () => {
        const colorSeleccionado = document.getElementById('select-color')?.value || '';
        const nombreConColor = colorSeleccionado ? `${producto.nombre} (${colorSeleccionado})` : producto.nombre;
        agregarAlCarrito(nombreConColor, parseInt(producto.precio));
        modal.style.display = 'none';
    });
    contenedorGaleria.appendChild(btnAgregar);

    modalContent.appendChild(contenedorGaleria);
    modal.style.display = 'flex';
}

document.getElementById('gallery-close').addEventListener('click', () => {
    document.getElementById('gallery-modal').style.display = 'none';
});