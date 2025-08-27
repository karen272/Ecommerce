let carrito = [];

// =========================
// AGREGAR AL CARRITO
// =========================
function agregarAlCarrito(producto) {
    const existente = carrito.find(p => p.id === producto.id);
    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }
    actualizarCarrito();
    guardarCarrito();
}

// =========================
// QUITAR PRODUCTO
// =========================
function quitarDelCarrito(id) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
    guardarCarrito();
    mostrarCarrito();
    mostrarCheckout();

    const removeModalMessage = document.getElementById("removeModalMessage");
    removeModalMessage.textContent = `${item.nombre} fue eliminado del carrito.`;

    const removeModal = new bootstrap.Modal(document.getElementById("removeModal"));
    removeModal.show();
}

// =========================
// ACTUALIZAR CONTADOR
// =========================
function actualizarCarrito() {
    const totalUnidades = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    document.querySelectorAll('.cart-count').forEach(contador => {
        contador.textContent = totalUnidades;
    });
}

// =========================
// LOCALSTORAGE
// =========================
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
    const data = localStorage.getItem("carrito");
    if (data) {
        carrito = JSON.parse(data);
        actualizarCarrito();
    }
}

// =========================
// MOSTRAR CARRITO EN cart.html
// =========================
function mostrarCarrito() {
    const contenedor = document.querySelector(".cart-items");
    if (!contenedor) return;

    contenedor.innerHTML = `
      <div class="cart-header d-none d-lg-block">
        <div class="row align-items-center">
          <div class="col-lg-6"><h5>Producto</h5></div>
          <div class="col-lg-2 text-center"><h5>Precio</h5></div>
          <div class="col-lg-2 text-center"><h5>Cantidad</h5></div>
          <div class="col-lg-2 text-center"><h5>Total</h5></div>
        </div>
      </div>
    `;

    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
          <div class="row align-items-center">
            <div class="col-lg-6 col-12 mt-3">
              <div class="product-info d-flex align-items-center">
                <div class="product-image">
                  <img src="${item.img || 'assets/img/product/default.png'}" alt="${item.nombre}" class="img-fluid">
                </div>
                <div class="product-details">
                  <h6 class="product-title">${item.nombre}</h6>
                  <button class="remove-item btn btn-link text-danger p-0" data-id="${item.id}">
                    <i class="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-12 text-center">
              <div class="price-tag"><span>$${item.precio.toLocaleString()}</span></div>
            </div>
            <div class="col-lg-2 col-12 text-center">
              <div class="quantity-selector">
                <button class="quantity-btn decrease" data-id="${item.id}"><i class="bi bi-dash"></i></button>
                <input type="number" class="quantity-input" value="${item.cantidad}" min="1" data-id="${item.id}" readonly>
                <button class="quantity-btn increase" data-id="${item.id}"><i class="bi bi-plus"></i></button>
              </div>
            </div>
            <div class="col-lg-2 col-12 text-center">
              <div class="item-total"><span>$${totalItem.toLocaleString()}</span></div>
            </div>
          </div>
        `;
        contenedor.appendChild(div);
    });

    // Actualizamos resumen
    actualizarCheckout();
}

// =========================
// ACTUALIZAR RESUMEN Y CHECKOUT
// =========================
function actualizarCheckout() {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const shippingCost = subtotal > 8900 ? 0 : 3000;
    const total = subtotal + shippingCost;

    // Cart.html
    const resumenSubtotal = document.querySelector(".summary-item .summary-value");
    const resumenTotal = document.querySelector(".summary-total .summary-value");
    const shippingLabel = document.querySelector(".shipping-item .form-check-label");

    if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    if (shippingLabel) shippingLabel.textContent = shippingCost === 0 ? "Envío estándar Gratis" : `Envío estándar $${shippingCost.toLocaleString()}`;
    if (resumenTotal) resumenTotal.textContent = `$${total.toLocaleString()}`;

    // Checkout.html
    const subtotalEl = document.getElementById("checkout-subtotal");
    const shippingEl = document.querySelector(".order-shipping span:last-child");
    const totalEl = document.getElementById("checkout-total");
    const btnPriceEl = document.getElementById("checkout-btn-price");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
    if (btnPriceEl) btnPriceEl.textContent = `$${total.toLocaleString()}`;
}

// =========================
// MOSTRAR CHECKOUT EN verificar.html
// =========================
function mostrarCheckout() {
    const contenedor = document.getElementById("checkout-items");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
          <div class="order-item-image">
            <img src="${item.img || 'assets/img/product/default.png'}" alt="${item.nombre}" class="img-fluid">
          </div>
          <div class="order-item-details">
            <h4>${item.nombre}</h4>
            <div class="order-item-price">
              <span class="quantity">${item.cantidad} ×</span>
              <span class="price">$${item.precio.toLocaleString()}</span>
            </div>
          </div>
        `;
        contenedor.appendChild(div);
    });

    document.querySelector(".item-count").textContent = `${carrito.length} artículos`;

    // Reutilizamos la función para total, subtotal y envío
    actualizarCheckout();
}
// =========================
// generar link de whatsapp
// =========================
function generarLinkWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    // --- Datos del cliente ---
    const nombre = document.getElementById("first-name")?.value.trim();
    const apellido = document.getElementById("last-name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const telefono = document.getElementById("phone")?.value.trim();
    const direccion = document.getElementById("address")?.value.trim();
    const depto = document.getElementById("apartment")?.value.trim();
    const ciudad = document.getElementById("city")?.value.trim();
    const cp = document.getElementById("zip")?.value.trim();
    const pais = document.getElementById("country")?.value.trim();
    const metodoPago = document.querySelector('input[name="payment-method"]:checked');

    // --- Validaciones ---
    let errores = [];
    if (!nombre) errores.push("⚠️ Ingresá tu nombre.");
    if (!apellido) errores.push("⚠️ Ingresá tu apellido.");
    if (!email) errores.push("⚠️ Ingresá tu email.");
    if (!telefono) errores.push("⚠️ Ingresá tu número de teléfono.");
    if (!direccion) errores.push("⚠️ Ingresá tu dirección.");
    if (!ciudad) errores.push("⚠️ Ingresá tu ciudad.");
    if (!cp) errores.push("⚠️ Ingresá tu código postal.");
    if (!pais) errores.push("⚠️ Seleccioná tu país.");
    if (!metodoPago) errores.push("⚠️ Seleccioná un método de pago.");

    if (errores.length > 0) {
        const errorList = document.getElementById("validationErrors");
        errorList.innerHTML = errores.map(err => `<li>${err}</li>`).join("");
        
        const validationModal = new bootstrap.Modal(document.getElementById("validationModal"));
        validationModal.show();
        return;
    }

    // --- Armamos mensaje ---
    let mensaje = "🚨 *NUEVO PEDIDO* 🚨\n\n";
    mensaje += `👤 Cliente: ${nombre} ${apellido}\n`;
    mensaje += `📧 Email: ${email}\n`;
    mensaje += `📍 Dirección: ${direccion} ${depto}, ${ciudad}, CP ${cp}, ${pais}\n`;
    mensaje += `💳 Pago: ${metodoPago.id === "cash" ? "Efectivo" : "Transferencia"}\n\n`;

    mensaje += "🛒 *Detalle del pedido:*\n";

    // --- Subtotal ---
    let subtotal = 0;
    carrito.forEach(p => {
        mensaje += `- ${p.nombre} x${p.cantidad} = $${(p.precio * p.cantidad).toString()}\n`;
        subtotal += p.precio * p.cantidad;
    });

    // --- Envío ---
    let envio = 0;
    if (subtotal >= 8900) {
        mensaje += `\n🚚 Envío: GRATIS (más de $9.000)\n`;
    } else {
        envio = 3000;
        mensaje += `\n🚚 Envío: $${envio.toString()}\n`;
    }

    // --- Total ---
    let total = subtotal + envio;
    mensaje += `\n💰 *Total: $${total.toString()}*`;

    // --- Enviar a WhatsApp ---
    const numero = "5492291459738"; 
    const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(link, "_blank");
    localStorage.removeItem("carrito");
    carrito = [];
    actualizarCarrito();
    mostrarCarrito();
    mostrarCheckout();

}

// =========================
// EVENTOS DE CARRITO
// =========================
document.addEventListener("click", e => {
    if (e.target.closest(".remove-item")) {
        const id = e.target.closest(".remove-item").dataset.id;
        quitarDelCarrito(id);
    }

    if (e.target.closest(".increase")) {
        const id = e.target.closest(".increase").dataset.id;
        const item = carrito.find(p => p.id == id);
        if (item) item.cantidad++;
        guardarCarrito();
        mostrarCarrito();
        mostrarCheckout();
    }

    if (e.target.closest(".decrease")) {
        const id = e.target.closest(".decrease").dataset.id;
        const item = carrito.find(p => p.id == id);
        if (item) {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                quitarDelCarrito(id);
                return;
            }
        }
        guardarCarrito();
        mostrarCarrito();
        mostrarCheckout();
    }
});

// =========================
// INICIALIZAR
// =========================
window.addEventListener("DOMContentLoaded", () => {
    cargarCarrito();
    mostrarCarrito();
    mostrarCheckout();

    document.querySelectorAll('.cart-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.product-item');
            const producto = {
                id: btn.dataset.id || index + 1,
                nombre: btn.dataset.name 
                        || (item.querySelector('.product-name a') 
                            ? item.querySelector('.product-name a').textContent.trim()
                            : item.querySelector('.product-name').textContent.trim()),
                precio: parseFloat(btn.dataset.price 
                        || item.querySelector('.product-price').textContent.replace('$','').replace('.','').trim()),
                img: btn.dataset.img || item.querySelector('img').src,
                cantidad: 1
            };
            agregarAlCarrito(producto);

            const modalMessage = document.getElementById("cartModalMessage");
            modalMessage.textContent = `${producto.nombre} agregado al carrito ✅`;

            const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
            cartModal.show();
        });
    });

    const btnPedido = document.querySelector(".place-order-btn");
    if (btnPedido) {
        btnPedido.addEventListener("click", e => {
            e.preventDefault();
            generarLinkWhatsApp();
        });
    }
});
