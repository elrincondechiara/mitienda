// ==========================
// 🪐 UTILIDADES GENERALES
// ==========================

// Modal de alerta reutilizable
async function alerta(mensaje) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `<p style="text-align: center; font-size: 1.1em;">${mensaje}</p>`;
        modal.style.display = 'flex';

        const cerrar = () => {
            modal.style.display = 'none';
            document.getElementById('modal-close').removeEventListener('click', cerrar);
            resolve();
        };

        document.getElementById('modal-close').addEventListener('click', cerrar);
    });
}

// Modal de confirmación reutilizable
function alertaConfirm(mensaje, callbackSi) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <p style="text-align: center; font-size: 1.1em;">${mensaje}</p>
        <div style="margin-top: 1em; display: flex; justify-content: center; gap: 1em;">
            <button id="modal-ok" class="modal-btn">Sí</button>
            <button id="modal-cancel" class="modal-btn modal-btn-cancel">No</button>
        </div>
    `;
    modal.style.display = 'flex';

    document.getElementById('modal-ok').onclick = () => {
        modal.style.display = 'none';
        callbackSi();
    };
    document.getElementById('modal-cancel').onclick = () => {
        modal.style.display = 'none';
    };
}

// ==========================
// 🛒 CARRITO
// ==========================

// Inicializar carrito si no existe
if (!localStorage.getItem('carrito')) {
    localStorage.setItem('carrito', JSON.stringify([]));
}

// Actualizar contador flotante
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contador = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contadorElem = document.getElementById('carrito-contador');
    if (contadorElem) {
        contadorElem.innerText = contador;
    }
}

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alerta(`${nombre} agregado al carrito`);
}

function toggleSeccionCP() {
    const tipoEnvio = document.getElementById('tipo-envio').value;
    const seccionCP = document.getElementById('seccion-cp');
    if (tipoEnvio === 'envio') {
        seccionCP.style.display = 'block';
    } else {
        seccionCP.style.display = 'none';
        costoEnvio = 0;
        actualizarTotalCarrito();
    }
}

async function consultarEnvioYActualizarTotal() {
    const cp = document.getElementById('input-cp').value.trim();
    const resultado = document.getElementById('resultado-envio');

    if (!cp) {
        resultado.textContent = "Por favor ingresá un código postal.";
        resultado.style.color = 'red';
        return;
    }

    try {
        const resp = await fetch(urlEnvios);
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data = await resp.json();
        console.log('Datos envíos:', data);

        const enviosArray = Array.isArray(data) ? data : (data.envios || []);

        const registro = enviosArray.find(envio => envio.cp === cp);

        if (registro) {
            resultado.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
            resultado.style.color = 'green';
            // Aquí actualizá el total sumando el costo de envío (lo que ya tenías que hacer)
        } else {
            resultado.textContent = "No se encontró información para ese código postal.";
            resultado.style.color = 'orange';
        }
    } catch (error) {
        console.error("Error al consultar costos de envío:", error);
        resultado.textContent = "Hubo un error al consultar. Intentalo más tarde.";
        resultado.style.color = 'red';
    }
}

function actualizarTotalCarrito() {
    let total = 0;
    carrito.forEach((producto) => {
        total += producto.precio * producto.cantidad;
    });
    total += costoEnvio;
    const totalDiv = document.getElementById('total-carrito');
    if (totalDiv) totalDiv.innerText = `Total: $${total}`;
}

	function enviarPedidoPorWhatsApp() {
    const tipoEnvio = document.getElementById('tipo-envio').value;
    const cp = document.getElementById('input-cp').value.trim();
    let mensaje = '🛒 *Pedido El Rincón de Chiara*%0A%0A';

    carrito.forEach((producto) => {
        mensaje += `• ${producto.nombre} x${producto.cantidad} - $${producto.precio * producto.cantidad}%0A`;
    });

    mensaje += `%0A💰 Subtotal: $${carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)}%0A`;

    if (tipoEnvio === 'envio') {
        mensaje += `🚚 Envío a domicilio (CP ${cp}): $${costoEnvio}%0A`;
    } else {
        mensaje += `🏪 Retiro en tienda (sin costo)%0A`;
    }

    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0) + costoEnvio;
    mensaje += `🧾 *Total: $${total}*%0A`;

    mensaje += `%0A📍 Método de entrega: ${tipoEnvio === 'envio' ? 'Envío a domicilio' : 'Retiro en tienda'}`;

    const numeroWhatsApp = '5491150648790'; // Reemplazá por el número real con código país y sin espacios
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, '_blank');
}

	
	// Enviar pedido por WhatsApp
	function enviarPedidoWhatsApp(carrito) {
		let mensaje = "Hola, quiero comprar:\n";
		carrito.forEach(item => {
			mensaje += `• ${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}\n`;
		});
		const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
		mensaje += `\nTotal: $${total}`;
	
		const texto = encodeURIComponent(mensaje);
		window.open(`https://wa.me/5491150648790?text=${texto}`, "_blank");
	}
	
	// ==========================
	// 🟢 INICIALIZACIÓN
	// ==========================
	
	// Inicializar contador al cargar
	document.addEventListener('DOMContentLoaded', () => {
		actualizarContadorCarrito();
	
		// Configurar cierre de modal al presionar ✕
		const modalClose = document.getElementById('modal-close');
		if (modalClose) {
			modalClose.addEventListener('click', () => {
				document.getElementById('modal').style.display = 'none';
			});
		}
	});