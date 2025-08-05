function alertaConfirm(mensaje, callback) {
  if (confirm(mensaje)) {
    callback();
  }
}

// Variables globales para estado
let metodoEnvioSeleccionado = 'retiro';
let codigoPostal = '';
let direccionEntrega = '';
let telefonoContacto = '';
let costoEnvio = 0; // inicializado aquí

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Actualizar contador carrito (función que debes tener definida)
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, prod) => sum + prod.cantidad, 0);
    const contador = document.getElementById('contador-carrito');
    if (contador) contador.textContent = total;
  }

// Función para eliminar producto del carrito
function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  mostrarCarrito();
  actualizarContadorCarrito();
}

// Función para pagar con Mercado Pago (debes tenerla implementada)
async function pagarConMercadoPago() {
  const carrito = JSON.parse(localStorage.getItem('carrito'));
  if (!carrito || carrito.length === 0) {
      alerta("El carrito está vacío. Agrega productos antes de pagar.");
      return;
  }

  // Convertir a estructura para Mercado Pago
  const items = carrito.map(item => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precio
  }));

  try {
      const respuesta = await fetch("https://mitienda-ftxw.onrender.com/crear-preferencia", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ items })
      });

      if (!respuesta.ok) {
          throw new Error("Error al crear preferencia");
      }

      const data = await respuesta.json();
      // Redirigir al checkout de Mercado Pago
      window.location.href = data.init_point;
  } catch (error) {
      console.error(error);
      alerta("Ocurrió un error al iniciar el pago. Verificá tu conexión o intenta más tarde.");
  }
}

// Función para mostrar el carrito
async function mostrarCarrito() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '';

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (carrito.length === 0) {
    modalBody.innerHTML = "<p style='text-align:center; padding:1em;'>El carrito está vacío.</p>";
    modal.style.display = 'flex';
    return;
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Renderizar productos
  carrito.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'modal-product-row';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'modal-product-info';
    infoDiv.style.display = 'flex';
    infoDiv.style.alignItems = 'center';
    infoDiv.style.gap = '0.5em';

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.value = item.cantidad;
    qtyInput.className = 'modal-product-qty';
    qtyInput.style.width = '50px';
    qtyInput.setAttribute('aria-label', `Cantidad de ${item.nombre}`);
    qtyInput.addEventListener('change', e => {
      const val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) {
        e.target.value = item.cantidad;
        return;
      }
      carrito[index].cantidad = val;
      guardarCarrito(carrito);
      mostrarCarrito(); // refresca modal y totales
    });

    const name = document.createElement('div');
    name.className = 'modal-product-name';
    name.textContent = item.nombre;

    const price = document.createElement('div');
    price.className = 'modal-product-price';
    price.textContent = `$${(item.precio * item.cantidad).toFixed(2)}`;

    const btnRemove = document.createElement('button');
    btnRemove.className = 'modal-btn-remove';
    btnRemove.textContent = "✕";
    btnRemove.title = "Eliminar producto";
    btnRemove.setAttribute('aria-label', `Eliminar ${item.nombre} del carrito`);
    btnRemove.addEventListener('click', () => eliminarDelCarrito(index));

    infoDiv.appendChild(qtyInput);
    infoDiv.appendChild(name);

    row.appendChild(infoDiv);
    row.appendChild(price);
    row.appendChild(btnRemove);

    modalBody.appendChild(row);
  });

  // Método de envío
  const opcionEnvioDiv = document.createElement('fieldset');
  opcionEnvioDiv.className = 'modal-envio-opciones';
  opcionEnvioDiv.innerHTML = `
  <style>
    #opcion-envio-titulo {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 8px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #444;
    }
    .metodo-envio-option {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      gap: 8px;
      font-size: 1rem;
      cursor: pointer;
      font-family: inherit;
    }
    .metodo-envio-option input[type="radio"] {
      accent-color: #d81b60;
      transform: scale(1.2);
      cursor: pointer;
    }
  </style>

  <div>
    <div id="opcion-envio-titulo">📦 Método de envío</div>
    <label class="metodo-envio-option">
      <input type="radio" name="metodo-envio" value="retiro" ${metodoEnvioSeleccionado === 'retiro' ? 'checked' : ''}>
      Retiro en tienda
    </label>
    <label class="metodo-envio-option">
      <input type="radio" name="metodo-envio" value="envio" ${metodoEnvioSeleccionado === 'envio' ? 'checked' : ''}>
      Envío a domicilio
    </label>
  </div>
`;

  modalBody.appendChild(opcionEnvioDiv);

  // Mostrar u ocultar formulario según método de envío
  const formEnvioDiv = document.createElement('div');
  formEnvioDiv.className = 'formulario-envio';
  formEnvioDiv.style.marginTop = '1rem';
  formEnvioDiv.style.display = metodoEnvioSeleccionado === 'envio' ? 'block' : 'none';
  formEnvioDiv.innerHTML = `
  <style>
    #form-envio {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
    }
    #form-envio label {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 4px;
    }
    #form-envio input[type="text"] {
      padding: 10px 12px;
      font-size: 1rem;
      border: 1.5px solid #ccc;
      border-radius: 8px;
      transition: border-color 0.3s ease;
      outline-offset: 2px;
      outline-color: transparent;
      width: 100%;
      box-sizing: border-box;
    }
    #form-envio input[type="text"]:focus {
      border-color: #d81b60;
      box-shadow: 0 0 8px rgba(216, 27, 96, 0.5);
      outline-color: #d81b60;
    }
    #resultado-envio {
      font-weight: 700;
      color: #2e7d32; /* verde */
      min-height: 1.5em;
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }
  </style>

  <div id="form-envio">
    <label for="input-cp">📮 Código Postal:</label>
    <input type="text" id="input-cp" placeholder="Ej: 1704" value="${codigoPostal}" />

    <div id="resultado-envio"></div>

    <label for="input-direccion">📍 Dirección:</label>
    <input type="text" id="input-direccion" placeholder="Calle y número" value="${direccionEntrega}" />

    <label for="input-telefono">📞 Teléfono (Opcional):</label>
    <input type="text" id="input-telefono" placeholder="Ingresá tu teléfono" value="${telefonoContacto}" />
  </div>
`;

  modalBody.appendChild(formEnvioDiv);

  // Total
  const totalDiv = document.createElement('div');
  totalDiv.className = 'modal-total';
  totalDiv.style.fontWeight = 'bold';
  totalDiv.style.marginTop = '10px';
  const totalConEnvio = subtotal + costoEnvio;
  totalDiv.textContent = `Total: $${totalConEnvio.toFixed(2)}`;
  modalBody.appendChild(totalDiv);

  // Eventos método envío
  opcionEnvioDiv.querySelectorAll('input[name="metodo-envio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      metodoEnvioSeleccionado = radio.value;
      if (metodoEnvioSeleccionado === 'envio') {
        formEnvioDiv.style.display = 'block';
      } else {
        formEnvioDiv.style.display = 'none';
        costoEnvio = 0;
        totalDiv.textContent = `Total: $${subtotal.toFixed(2)}`;
      }
    });
  });

  // Inputs formulario envío
  const inputCP = formEnvioDiv.querySelector('#input-cp');
  const resultadoEnvio = formEnvioDiv.querySelector('#resultado-envio');
  const inputDireccion = formEnvioDiv.querySelector('#input-direccion');
  const inputTelefono = formEnvioDiv.querySelector('#input-telefono');

  // Manejar inputs y cálculo costo envío con debounce
  let debounceTimeout;
  if (inputCP) {
    inputCP.addEventListener('input', e => {
      clearTimeout(debounceTimeout);
      codigoPostal = e.target.value.trim();

      if (!codigoPostal) {
        resultadoEnvio.textContent = "Por favor ingresá un código postal.";
        resultadoEnvio.style.color = 'red';
        costoEnvio = 0;
        totalDiv.textContent = `Total: $${(subtotal + costoEnvio).toFixed(2)}`;
        return;
      }

      resultadoEnvio.textContent = "Consultando costo de envío...";
      resultadoEnvio.style.color = 'black';

      debounceTimeout = setTimeout(async () => {
        try {
          const resp = await fetch('https://opensheet.elk.sh/12ij43IAUUSJDJTKKLJ9xxJ6hBUxKN0YOAcVj2PUOry8/Envios');
          if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

          const data = await resp.json();
          const enviosArray = Array.isArray(data) ? data : (data.envios || []);
          const registro = enviosArray.find(envio => envio.cp === codigoPostal);

          if (registro) {
            costoEnvio = Number(registro.costo);
            resultadoEnvio.textContent = `El costo de envío a ${registro.provincia} es $${registro.costo}`;
            resultadoEnvio.style.color = 'green';
          } else {
            costoEnvio = 0;
            resultadoEnvio.textContent = "No se encontró información para ese código postal.";
            resultadoEnvio.style.color = 'orange';
          }
          totalDiv.textContent = `Total: $${(subtotal + costoEnvio).toFixed(2)}`;
        } catch (error) {
          console.error("Error consultando costo de envío:", error);
          costoEnvio = 0;
          resultadoEnvio.textContent = "Hubo un error al consultar. Intentalo más tarde.";
          resultadoEnvio.style.color = 'red';
          totalDiv.textContent = `Total: $${(subtotal + costoEnvio).toFixed(2)}`;
        }
      }, 600);
    });
  }

  if (inputDireccion) {
    inputDireccion.addEventListener('input', e => {
      direccionEntrega = e.target.value.trim();
    });
  }

  if (inputTelefono) {
    inputTelefono.addEventListener('input', e => {
      telefonoContacto = e.target.value.trim();
    });
  }

  // Botón WhatsApp
  const btnWhats = document.createElement('button');
  btnWhats.className = 'modal-btn-whatsapp';
  btnWhats.textContent = "Enviar pedido por WhatsApp";
  btnWhats.style.marginTop = '1em';
  btnWhats.addEventListener('click', () => {
    if (metodoEnvioSeleccionado === 'envio') {
      if (costoEnvio <= 0) {
        alert("Por favor ingresá un código postal válido para calcular el envío.");
        return;
      }
      if (!direccionEntrega) {
        alert("Por favor ingresá la dirección de entrega.");
        return;
      }
      if (!telefonoContacto) {
        alert("Por favor ingresá un número de celular de contacto.");
        return;
      }
    }

    let mensaje = "Hola, quiero comprar:\n";
    carrito.forEach(item => {
      mensaje += `• ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
    });
    mensaje += `\nSubtotal: $${subtotal.toFixed(2)}\n`;

    if (metodoEnvioSeleccionado === 'envio') {
      mensaje += `Costo de envío: $${costoEnvio.toFixed(2)}\n`;
      mensaje += `Total: $${(subtotal + costoEnvio).toFixed(2)}\n`;
      mensaje += `Dirección de entrega: ${direccionEntrega}\n`;
      mensaje += `Teléfono de contacto: ${telefonoContacto}\n`;
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
    if (typeof alertaConfirm !== 'function') {
      alert("Función alertaConfirm no definida");
      return;
    }
    alertaConfirm(
      "Serás redirigido a Mercado Pago para completar tu compra. Luego, envianos el comprobante por WhatsApp para coordinar el envío. ¡Gracias!",
      () => {
        modal.style.display = 'none';

        if (metodoEnvioSeleccionado === 'envio') {
          if (costoEnvio <= 0) {
            alert("Por favor ingresá un código postal válido para calcular el envío.");
            return;
          }
          const envioItemIndex = carrito.findIndex(i => i.nombre === 'Costo de envío');
          if (envioItemIndex >= 0) {
            carrito[envioItemIndex].precio = costoEnvio;
            carrito[envioItemIndex].cantidad = 1;
          } else {
            carrito.push({ nombre: 'Costo de envío', precio: costoEnvio, cantidad: 1 });
          }
        } else {
          const envioItemIndex = carrito.findIndex(i => i.nombre === 'Costo de envío');
          if (envioItemIndex >= 0) carrito.splice(envioItemIndex, 1);
        }
        guardarCarrito(carrito);
        actualizarContadorCarrito();
        pagarConMercadoPago();
      }
    );
  });
  modalBody.appendChild(btnMP);

  modal.style.display = 'flex';
}
