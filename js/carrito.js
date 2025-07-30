// Mostrar carrito emergente

function mostrarCarrito() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        modalBody.innerHTML = "<p style='text-align:center; padding:1em;'>El carrito está vacío.</p>";
        modal.style.display = 'flex';
        return;
    }

    // Mostrar productos con cantidad y precio
    let subtotal = 0;
    carrito.forEach((item, index) => {
        subtotal += item.precio * item.cantidad;

        const row = document.createElement('div');
        row.className = 'modal-product-row';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'modal-product-info';

        const name = document.createElement('div');
        name.className = 'modal-product-name';
        name.textContent = item.nombre;

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.value = item.cantidad;
        qtyInput.className = 'modal-product-qty';
        qtyInput.addEventListener('change', (e) => {
            const nuevaCantidad = parseInt(e.target.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                e.target.value = item.cantidad;
                return;
            }
            actualizarCantidadCarrito(index, nuevaCantidad);
        });

        infoDiv.appendChild(name);
        infoDiv.appendChild(qtyInput);

        const price = document.createElement('div');
        price.className = 'modal-product-price';
        price.textContent = `$${(item.precio * item.cantidad).toFixed(2)}`;

        const btnRemove = document.createElement('button');
        btnRemove.className = 'modal-btn-remove';
        btnRemove.textContent = "✕";
        btnRemove.title = "Eliminar";
        btnRemove.addEventListener('click', () => eliminarDelCarrito(index));

        row.appendChild(infoDiv);
        row.appendChild(price);
        row.appendChild(btnRemove);

        modalBody.appendChild(row);
    });

    // Selector para elegir método de retiro/envío
    const opcionEnvioDiv = document.createElement('div');
    opcionEnvioDiv.style.marginTop = '1em';
    opcionEnvioDiv.style.textAlign = 'center';

    opcionEnvioDiv.innerHTML = `
        <label>
            <input type="radio" name="metodo-envio" value="retiro" checked> Retiro en tienda
        </label>
        &nbsp;&nbsp;
        <label>
            <input type="radio" name="metodo-envio" value="envio"> Envío a domicilio
        </label>
    `;
    modalBody.appendChild(opcionEnvioDiv);

    // Input código postal (oculto inicialmente)
    const cpDiv = document.createElement('div');
    cpDiv.style.marginTop = '0.5em';
    cpDiv.style.textAlign = 'center';
    cpDiv.style.display = 'none';

    cpDiv.innerHTML = `
        <input type="text" id="input-cp" placeholder="Ingresá tu código postal" style="padding: 0.5em; width: 80%; font-size: 1em;" />
        <div id="resultado-envio" style="margin-top: 0.5em; font-weight: bold;"></div>
    `;

    modalBody.appendChild(cpDiv);

    // Mostrar/ocultar input código postal según opción
    opcionEnvioDiv.querySelectorAll('input[name="metodo-envio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'envio') {
                cpDiv.style.display = 'block';
                document.getElementById('input-cp').value = '';
                document.getElementById('resultado-envio').textContent = '';
                actualizarTotalConEnvio(0);
            } else {
                cpDiv.style.display = 'none';
                actualizarTotalConEnvio(0);
            }
        });
    });

    // Variable para guardar costo envío actual
    let costoEnvio = 0;

    // Función para actualizar total incluyendo envío
    function actualizarTotalConEnvio(costoEnvioNuevo) {
        costoEnvio = costoEnvioNuevo;
        const totalFinal = subtotal + costoEnvio;

        totalDiv.textContent = `Total: $${totalFinal.toFixed(2)}`;
    }

    // Escuchar input del código postal para consultar costo
    cpDiv.querySelector('#input-cp').addEventListener('input', async (e) => {
        const cp = e.target.value.trim();
        const resultado = document.getElementById('resultado-envio');

        if (!cp) {
            resultado.textContent = "Por favor ingresá un código postal.";
            resultado.style.color = 'red';
            actualizarTotalConEnvio(0);
            return;
        }

        try {
            const resp = await fetch('https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Envios');
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

            const data = await resp.json();

            const enviosArray = Array.isArray(data) ? data : (data.envios || []);
            const registro = enviosArray.find(envio => envio.cp === cp);

            if (registro) {
                resultado.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
                resultado.style.color = 'green';
                actualizarTotalConEnvio(Number(registro.costo));
            } else {
                resultado.textContent = "No se encontró información para ese código postal.";
                resultado.style.color = 'orange';
                actualizarTotalConEnvio(0);
            }
        } catch (error) {
            console.error("Error consultando costo de envío:", error);
            resultado.textContent = "Hubo un error al consultar. Intentalo más tarde.";
            resultado.style.color = 'red';
            actualizarTotalConEnvio(0);
        }
    });

    // Total final (subtotal + posible envío)
    const totalDiv = document.createElement('div');
    totalDiv.style.textAlign = 'right';
    totalDiv.style.fontWeight = 'bold';
    totalDiv.style.marginTop = '0.5em';
    totalDiv.textContent = `Total: $${subtotal.toFixed(2)}`;
    modalBody.appendChild(totalDiv);

    // Botón WhatsApp
    const btnWhats = document.createElement('button');
    btnWhats.className = 'modal-btn-whatsapp';
    btnWhats.textContent = "Enviar pedido por WhatsApp";
    btnWhats.style.marginTop = '1em';
    btnWhats.addEventListener('click', () => {
        // Armar mensaje con método de envío y costo
        const metodoEnvio = modalBody.querySelector('input[name="metodo-envio"]:checked').value;
        let mensaje = "Hola, quiero comprar:\n";
        carrito.forEach(item => {
            mensaje += `• ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
        });
        mensaje += `\nSubtotal: $${subtotal.toFixed(2)}\n`;

        if (metodoEnvio === 'envio') {
            if (costoEnvio > 0) {
                mensaje += `Costo de envío: $${costoEnvio.toFixed(2)}\n`;
                mensaje += `Total: $${(subtotal + costoEnvio).toFixed(2)}\n`;
            } else {
                alert("Por favor ingresá un código postal válido para calcular el envío.");
                return;
            }
        } else {
            mensaje += "Retiraré el pedido en tienda.\n";
            mensaje += `Total: $${subtotal.toFixed(2)}\n`;
        }

        const texto = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5491150648790?text=${texto}`, "_blank");
    });
    modalBody.appendChild(btnWhats);

    // Botón Mercado Pago
    const btnMP = document.createElement('button');
    btnMP.className = 'modal-btn-mercadopago';
    btnMP.textContent = "Pagar con Mercado Pago";
    btnMP.style.marginTop = '0.5em';
    btnMP.addEventListener('click', () => {
        alertaConfirm(
            "Serás redirigido a Mercado Pago para completar tu compra. Luego, envianos el comprobante de pago por Whatsapp para coordinar el envío. ¡Muchas gracias!",
            () => {
                modal.style.display = 'none';

                // Agregar costo envío al carrito antes de pagar
                const metodoSeleccionado = modalBody.querySelector('input[name="metodo-envio"]:checked');
                const metodoEnvio = metodoSeleccionado ? metodoSeleccionado.value : null;
                            
                if (metodoEnvio === 'envio') {                    if (costoEnvio === 0) {
                        alerta("Por favor ingresá un código postal válido para calcular el envío.");
                        return;
                    }
                    // Agregar item extra con costo de envío
                    const envioItemIndex = carrito.findIndex(item => item.nombre === 'Costo de envío');
                    if (envioItemIndex >= 0) {
                        carrito[envioItemIndex].precio = costoEnvio;
                        carrito[envioItemIndex].cantidad = 1;
                    } else {
                        carrito.push({ nombre: 'Costo de envío', precio: costoEnvio, cantidad: 1 });
                    }
                } else {
                    // Si es retiro, eliminar si existe el costo de envío
                    const envioItemIndex = carrito.findIndex(item => item.nombre === 'Costo de envío');
                    if (envioItemIndex >= 0) {
                        carrito.splice(envioItemIndex, 1);
                    }
                }
                localStorage.setItem('carrito', JSON.stringify(carrito));
                pagarConMercadoPago();
            }
        );
    });
    modalBody.appendChild(btnMP);

    modal.style.display = 'flex';
}

	// Actualizar cantidad de un producto en el carrito
	function actualizarCantidadCarrito(indice, nuevaCantidad) {
		const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
		carrito[indice].cantidad = nuevaCantidad;
		localStorage.setItem('carrito', JSON.stringify(carrito));
		actualizarContadorCarrito();
		mostrarCarrito();
	}
	
	// Eliminar producto del carrito
	function eliminarDelCarrito(indice) {
		const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
		carrito.splice(indice, 1);
		localStorage.setItem('carrito', JSON.stringify(carrito));
		actualizarContadorCarrito();
		mostrarCarrito();
	}

    function toggleSeccionCP() {
        const tipoEnvio = document.getElementById('tipo-envio').value;
        const seccionCP = document.getElementById('seccion-cp');
        if (tipoEnvio === 'envio') {
            seccionCP.style.display = 'block';
        } else {
            seccionCP.style.display = 'none';
            // Limpiar costo de envío y actualizar total si vuelve a retiro
            document.getElementById('resultado-envio').textContent = '';
            costoEnvio = 0;
            mostrarCarrito(); // Actualizar total sin envío
        }
    }