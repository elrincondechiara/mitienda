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