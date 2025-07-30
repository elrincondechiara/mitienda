const urlEnvios = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Envios';


document.addEventListener('DOMContentLoaded', async function() {
    const urlCategorias = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Categorias';
    const urlProductos = 'https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Lista';

    try {
        const categoriasResp = await fetch(urlCategorias);
        const categoriasData = await categoriasResp.json();
        construirCategorias(categoriasData);

        const productosResp = await fetch(urlProductos);
        const productosData = await productosResp.json();
        mostrarProductos(productosData);
    } catch (error) {
        console.error("Error cargando categorías o productos:", error);
        alerta("Error cargando la tienda. Intenta nuevamente.");
    }

    function construirCategorias(data) {
        const nav = document.getElementById('categorias-nav');
        const contenedor = document.getElementById('categorias-contenedor');

        data.forEach(categoriaObj => {
            const categoria = categoriaObj.categoria?.toLowerCase().trim();
            if (!categoria) return;
            const categoriaCapitalizada = categoria.charAt(0).toUpperCase() + categoria.slice(1);

            const link = document.createElement('a');
            link.href = `#${categoria}`;
            link.textContent = categoriaCapitalizada;
            nav.appendChild(link);

            const section = document.createElement('section');
            section.className = 'container';
            section.id = categoria;
            contenedor.appendChild(section);
        });
    }

    function mostrarProductos(data) {
        const contenedores = {};
        document.querySelectorAll('.container').forEach(section => {
            contenedores[section.id] = section;
        });

        data.forEach(producto => {
            const categoria = producto.categoria?.toLowerCase().trim();
            if (!contenedores[categoria]) return;

            const sinStock = !producto.stock || parseInt(producto.stock) <= 0;
            const tieneDescuento = producto.descuento && parseFloat(producto.descuento) > 0;

            const div = document.createElement('div');
            div.className = 'product';
            div.setAttribute('data-nombre', producto.nombre);
            div.setAttribute('data-precio', producto.precio);
            div.style.position = 'relative';

            if (sinStock) {
                div.style.filter = 'grayscale(100%)';
                div.style.opacity = '0.6';
                div.style.pointerEvents = 'none';
            }

            div.innerHTML = `
                <img src="${producto.imagen}?v=${Date.now()}" alt="${producto.nombre}" title="${producto.nombre} - $${producto.precio} - ${producto.descripcion}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>$${producto.precio}</p>
            `;

            if (sinStock) {
                const aviso = document.createElement('div');
                aviso.textContent = 'Sin stock';
                aviso.style.position = 'absolute';
                aviso.style.top = '10px';
                aviso.style.left = '10px';
                aviso.style.background = 'rgba(0, 0, 0, 0.7)';
                aviso.style.color = 'white';
                aviso.style.padding = '4px 8px';
                aviso.style.borderRadius = '4px';
                aviso.style.fontWeight = 'bold';
                div.appendChild(aviso);
            }

            if (tieneDescuento && !sinStock) {
                const oferta = document.createElement('div');
                oferta.textContent = `¡Oferta! -${producto.descuento}%`;
                oferta.style.position = 'absolute';
                oferta.style.top = '10px';
                oferta.style.right = '10px';
                oferta.style.background = '#ff4081';
                oferta.style.color = 'white';
                oferta.style.padding = '4px 8px';
                oferta.style.borderRadius = '4px';
                oferta.style.fontWeight = 'bold';
                oferta.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                div.appendChild(oferta);

                const precioOriginal = parseFloat(producto.precio);
                const descuento = parseFloat(producto.descuento);
                const precioFinal = precioOriginal - (precioOriginal * (descuento / 100));

                const precioHTML = div.querySelector('p:last-of-type');
                if (precioHTML) {
                    precioHTML.innerHTML = `
                        <span style="text-decoration: line-through; color: gray;">$${precioOriginal}</span>
                        <br>
                        <span style="color: #d81b60; font-weight: bold;">$${precioFinal.toFixed(2)}</span>
                    `;
                }
            }

            const img = div.querySelector('img');
            if (img && !sinStock) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    mostrarGaleriaProducto(producto);
                });
            }

            contenedores[categoria].appendChild(div);
        });
    }

    // Función para consultar costo de envío
    window.consultarEnvio = async function () {
        const cp = document.getElementById('input-cp').value.trim();
        const resultado = document.getElementById('resultado-envio');

        if (!cp) {
            resultado.textContent = "Por favor ingresá un código postal.";
            resultado.style.color = 'red';
            return;
        }

        try {
            const resp = await fetch(urlEnvios);
            if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

            const data = await resp.json();
            console.log('Datos recibidos en envíos:', data);

            // Asegurar que data sea un array
            const enviosArray = Array.isArray(data) ? data : (data.envios || []);

            const registro = enviosArray.find(envio => envio.cp === cp);

            if (registro) {
                resultado.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
                resultado.style.color = 'green';
            } else {
                resultado.textContent = "No se encontró información para ese código postal.";
                resultado.style.color = 'orange';
            }
        } catch (error) {
            console.error("Error consultando costo de envío:", error);
            resultado.textContent = "Hubo un error al consultar. Intentalo más tarde.";
            resultado.style.color = 'red';
        }
    }
});

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