// ==========================
// 🪐 UTILIDADES GENERALES
// ==========================

// Modal de alerta reutilizable, devuelve Promise que se resuelve al cerrar
function alerta(mensaje, timeout = 0) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal');
      const modalBody = document.getElementById('modal-body');
      const modalClose = document.getElementById('modal-close');
  
      if (!modal || !modalBody || !modalClose) {
        console.warn('Modal o elementos faltantes en DOM');
        alert(mensaje); // fallback simple
        resolve();
        return;
      }
  
      modalBody.innerHTML = `<p style="text-align:center; font-size:1.1em;">${mensaje}</p>`;
      modal.style.display = 'flex';
  
      const cerrar = () => {
        modal.style.display = 'none';
        modalClose.removeEventListener('click', cerrar);
        resolve();
      };
  
      modalClose.addEventListener('click', cerrar);
  
      // Si timeout > 0, cerrar automáticamente después de ese tiempo (ms)
      if (timeout > 0) {
        setTimeout(cerrar, timeout);
      }
    });
  }
  
  // Modal de confirmación reutilizable con Promise (mejor que callback)
  function alertaConfirm(mensaje) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal');
      const modalBody = document.getElementById('modal-body');
      if (!modal || !modalBody) {
        resolve(false);
        return;
      }
  
      modalBody.innerHTML = `
        <p style="text-align:center; font-size:1.1em;">${mensaje}</p>
        <div style="margin-top:1em; display:flex; justify-content:center; gap:1em;">
          <button id="modal-ok" class="modal-btn" aria-label="Confirmar Sí">Sí</button>
          <button id="modal-cancel" class="modal-btn modal-btn-cancel" aria-label="Cancelar No">No</button>
        </div>
      `;
      modal.style.display = 'flex';
  
      const btnOk = document.getElementById('modal-ok');
      const btnCancel = document.getElementById('modal-cancel');
  
      if (!btnOk || !btnCancel) {
        resolve(false);
        modal.style.display = 'none';
        return;
      }
  
      const cerrar = () => { modal.style.display = 'none'; };
      btnOk.onclick = () => {
        cerrar();
        resolve(true);
      };
      btnCancel.onclick = () => {
        cerrar();
        resolve(false);
      };
    });
  }
  
  // ==========================
  // 🛒 CARRITO
  // ==========================
  
  // Manejo seguro de carrito en localStorage con funciones helper
  const STORAGE_KEY = 'carrito';
  
  // Obtener carrito desde localStorage
  function obtenerCarrito() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  // Guardar carrito en localStorage
  function guardarCarrito(carrito) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    } catch {
      console.error("Error guardando carrito en localStorage");
    }
  }
  
  // Actualizar contador flotante en UI
  function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const contador = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contadorElem = document.getElementById('carrito-contador');
    if (contadorElem) {
      contadorElem.innerText = contador;
      contadorElem.style.display = contador > 0 ? 'inline-block' : 'none';
    }
  }
  
  // Agregar producto al carrito (por nombre y precio)
  async function agregarAlCarrito(nombre, precio) {
    if (!nombre || isNaN(precio)) {
      await alerta('Producto inválido');
      return;
    }
  
    const carrito = obtenerCarrito();
    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ nombre, precio: Number(precio), cantidad: 1 });
    }
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    await alerta(`${nombre} agregado al carrito`, 1500);
  }
  
  // ==========================
  // Manejo sección código postal y costo envío
  // ==========================
  
  <!-- let costoEnvio = 0; // global para mantener costo envío actual -->
  
  function toggleSeccionCP() {
    const tipoEnvio = document.getElementById('tipo-envio')?.value || '';
    const seccionCP = document.getElementById('seccion-cp');
    if (!seccionCP) return;
  
    if (tipoEnvio === 'envio') {
      seccionCP.style.display = 'block';
    } else {
      seccionCP.style.display = 'none';
      costoEnvio = 0;
      actualizarTotalCarrito();
    }
  }
  
  async function consultarEnvioYActualizarTotal() {
    const cp = document.getElementById('input-cp')?.value.trim();
    const resultado = document.getElementById('resultado-envio');
  
    if (!resultado) return;
  
    if (!cp) {
      resultado.textContent = "Por favor ingresá un código postal.";
      resultado.style.color = 'red';
      costoEnvio = 0;
      actualizarTotalCarrito();
      return;
    }
  
    resultado.textContent = "Consultando costo de envío...";
    resultado.style.color = 'black';
  
    try {
      // Cache simple para evitar múltiples fetch
      if (!window._cacheEnvios) {
        const resp = await fetch(urlEnvios);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        window._cacheEnvios = await resp.json();
      }
  
      const enviosArray = Array.isArray(window._cacheEnvios) ? window._cacheEnvios : (window._cacheEnvios.envios || []);
      const registro = enviosArray.find(e => e.cp === cp);
  
      if (registro) {
        resultado.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
        resultado.style.color = 'green';
        costoEnvio = Number(registro.costo) || 0;
      } else {
        resultado.textContent = "No se encontró información para ese código postal.";
        resultado.style.color = 'orange';
        costoEnvio = 0;
      }
    } catch (error) {
      console.error("Error al consultar costos de envío:", error);
      resultado.textContent = "Hubo un error al consultar. Intentalo más tarde.";
      resultado.style.color = 'red';
      costoEnvio = 0;
    }
    actualizarTotalCarrito();
  }
  
  // ==========================
  // Actualizar total carrito con costoEnvio
  // ==========================
  function actualizarTotalCarrito() {
    const carrito = obtenerCarrito();
    let total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    total += costoEnvio;
  
    const totalDiv = document.getElementById('total-carrito');
    if (totalDiv) {
      totalDiv.innerText = `Total: $${total.toFixed(2)}`;
    }
  }
  
  // ==========================
  // Enviar pedido por WhatsApp (unificado, seguro y con encodeURI)
  // ==========================
  function enviarPedidoPorWhatsApp() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alerta('El carrito está vacío');
      return;
    }
  
    const tipoEnvio = document.getElementById('tipo-envio')?.value || 'retiro';
    const cp = document.getElementById('input-cp')?.value.trim() || '';
    const subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const total = subtotal + costoEnvio;
  
    let mensaje = `🛒 *Pedido El Rincón de Chiara*\n\n`;
    carrito.forEach(({ nombre, cantidad, precio }) => {
      mensaje += `• ${nombre} x${cantidad} - $${(precio * cantidad).toFixed(2)}\n`;
    });
  
    mensaje += `\n💰 Subtotal: $${subtotal.toFixed(2)}\n`;
  
    if (tipoEnvio === 'envio') {
      mensaje += `🚚 Envío a domicilio (CP ${cp}): $${costoEnvio.toFixed(2)}\n`;
    } else {
      mensaje += `🏪 Retiro en tienda (sin costo)\n`;
    }
  
    mensaje += `🧾 *Total: $${total.toFixed(2)}*\n`;
    mensaje += `\n📍 Método de entrega: ${tipoEnvio === 'envio' ? 'Envío a domicilio' : 'Retiro en tienda'}`;
  
    const numeroWhatsApp = '5491150648790'; // Cambiar al número real
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  
    window.open(url, '_blank');
  }
  
  // ==========================
  // 🟢 INICIALIZACIÓN
  // ==========================
  
  document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
  
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
      });
    }
  
    // Si tenés un select para tipo de envío, agregá evento para mostrar/ocultar CP
    const tipoEnvioSelect = document.getElementById('tipo-envio');
    if (tipoEnvioSelect) {
      tipoEnvioSelect.addEventListener('change', () => {
        toggleSeccionCP();
      });
    }
  
    // Actualizar total carrito al iniciar
    actualizarTotalCarrito();
  });
  