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
  mostrarNotificacionCarrito({ nombre: item.nombre }, "remove");
}

// =========================
// NOTIFICACIÓN AL AGREGAR
// =========================
function mostrarNotificacionCarrito(producto, tipo = "add") {
  let container = document.getElementById("cart-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "cart-toast-container";
    container.className = "cart-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }

  container.querySelectorAll(".cart-toast").forEach(t => t.remove());

  const esEliminar = tipo === "remove";
  const toast = document.createElement("div");
  toast.className = `cart-toast${esEliminar ? " cart-toast--remove" : ""}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <div class="cart-toast-icon"><i class="bi bi-${esEliminar ? "trash" : "check-circle"}-fill" aria-hidden="true"></i></div>
    <div class="cart-toast-body">
      <strong>${esEliminar ? "Producto eliminado" : "¡Agregado al carrito!"}</strong>
      <span>${producto.nombre}</span>
    </div>
    ${esEliminar ? "" : '<a href="cart.html" class="cart-toast-link">Ver carrito</a>'}
    <button type="button" class="cart-toast-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  const cerrar = () => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".cart-toast-close").addEventListener("click", cerrar);
  setTimeout(cerrar, esEliminar ? 3000 : 4500);
}

function mostrarNotificacionAgregado(producto) {
  mostrarNotificacionCarrito(producto, "add");
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
  const contenedor = document.querySelector(".cart-list");
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="cart-empty text-center py-5">
        <i class="bi bi-cart-x display-4 text-muted mb-3 d-block"></i>
        <p class="mb-3">Tu carrito está vacío</p>
        <a href="index.html" class="btn btn-accent">Ver productos</a>
      </div>
    `;
    actualizarCheckout();
    return;
  }

  contenedor.innerHTML = `
    <div class="cart-header d-none d-lg-block">
      <div class="row align-items-center g-0">
        <div class="col-lg-5"><h5>Producto</h5></div>
        <div class="col-lg-2 text-center"><h5>Precio</h5></div>
        <div class="col-lg-3 text-center"><h5>Cantidad</h5></div>
        <div class="col-lg-2 text-center"><h5>Total</h5></div>
      </div>
    </div>
  `;

  carrito.forEach(item => {
    const totalItem = item.precio * item.cantidad;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="cart-item-card">
        <button type="button" class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.nombre}">
          <i class="bi bi-trash" aria-hidden="true"></i>
          <span class="remove-item-label">Eliminar</span>
        </button>
        <div class="cart-item-product">
          <div class="product-image">
            <img src="${item.img || 'assets/img/product/default.png'}" alt="${item.nombre}" class="img-fluid">
          </div>
          <div class="product-details">
            <h6 class="product-title">${item.nombre}</h6>
            <p class="cart-item-unit-price d-lg-none">$${item.precio.toLocaleString()} <small>c/u</small></p>
          </div>
        </div>
        <div class="cart-item-price-col">
          <span class="cart-field-label">Precio</span>
          <div class="price-tag"><span>$${item.precio.toLocaleString()}</span></div>
        </div>
        <div class="cart-item-qty-col">
          <span class="cart-field-label">Cantidad</span>
          <div class="quantity-selector">
            <button type="button" class="quantity-btn decrease" data-id="${item.id}" aria-label="Menos cantidad"><i class="bi bi-dash"></i></button>
            <input type="number" class="quantity-input" value="${item.cantidad}" min="1" data-id="${item.id}" readonly aria-label="Cantidad">
            <button type="button" class="quantity-btn increase" data-id="${item.id}" aria-label="Más cantidad"><i class="bi bi-plus"></i></button>
          </div>
        </div>
        <div class="cart-item-total-col">
          <span class="cart-field-label">Total</span>
          <div class="item-total"><span>$${totalItem.toLocaleString()}</span></div>
        </div>
      </div>
    `;
    contenedor.appendChild(div);
  });

  actualizarCheckout();
}

// =========================
// ACTUALIZAR RESUMEN Y CHECKOUT
// =========================
function actualizarCheckout() {
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const shippingCost = 0; // Siempre gratis
  const total = subtotal + shippingCost;

  // Cart.html
  const resumenSubtotal = document.querySelector(".summary-item .summary-value");
  const resumenTotal = document.querySelector(".summary-total .summary-value");
  const shippingLabel = document.querySelector(".shipping-item .form-check-label");

  if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toLocaleString()}`;
  if (shippingLabel) shippingLabel.textContent = "Envío gratis";
  if (resumenTotal) resumenTotal.textContent = `$${total.toLocaleString()}`;

  // Checkout.html
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.querySelector(".order-shipping span:last-child");
  const totalEl = document.getElementById("checkout-total");
  const btnPriceEl = document.getElementById("checkout-btn-price");

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
  if (shippingEl) shippingEl.textContent = "Gratis";
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
  const direccion = document.getElementById("address")?.value.trim();
  const depto = document.getElementById("apartment")?.value.trim();
  const metodoPago = document.querySelector('input[name="payment-method"]:checked');

  // --- Validaciones ---
  let errores = [];
  if (!nombre) errores.push("⚠️ Ingresá tu nombre.");
  if (!apellido) errores.push("⚠️ Ingresá tu apellido.");
  if (!direccion) errores.push("⚠️ Ingresá tu dirección.");
  if (!metodoPago) errores.push("⚠️ Seleccioná un método de pago.");

  if (errores.length > 0) {
    const errorList = document.getElementById("validationErrors");
    errorList.innerHTML = errores.map(err => `<li>${err}</li>`).join("");

    const validationModal = new bootstrap.Modal(document.getElementById("validationModal"));
    validationModal.show();
    return;
  }

  // --- Armamos mensaje ---
  let mensaje = " *NUEVO PEDIDO!*  \n\n";
  mensaje += `• Cliente: ${nombre} ${apellido}\n`;
  mensaje += `• Dirección: ${direccion} ${depto}\n`;
  mensaje += `• Pago: ${metodoPago.id === "cash" ? "Efectivo" : "Transferencia"}\n\n`;

  mensaje += "*Detalle del pedido:*\n";

  // --- Subtotal ---
  let subtotal = 0;
  carrito.forEach(p => {
    mensaje += `- ${p.nombre} x${p.cantidad} = $${(p.precio * p.cantidad).toString()}\n`;
    subtotal += p.precio * p.cantidad;
  });

  // --- Envío ---
  mensaje += `\n→Envío: GRATIS\n`;
  let envio = 0;

  // --- Total ---
  let total = subtotal + envio;
  mensaje += `\n*Total: $${total.toLocaleString("es-AR")}*`;

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
      if (btn.disabled) return;

      const item = btn.closest('.product-item');
      const qtyInput = btn.closest('.purchase-section')?.querySelector('.quantity-input');
      const cantidad = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

      let nombre = btn.dataset.name;
      if (!nombre && item) {
        nombre = item.querySelector('.product-name a')?.textContent.trim()
          || item.querySelector('.product-name')?.textContent.trim();
      }
      if (!nombre) {
        nombre = document.querySelector('.product-details .product-name')?.textContent.trim();
      }

      let precio = parseFloat(btn.dataset.price);
      if (!precio && item?.querySelector('.product-price')) {
        precio = parseFloat(
          item.querySelector('.product-price').textContent.replace(/[^\d]/g, '')
        );
      }

      const producto = {
        id: btn.dataset.id || String(index + 1),
        nombre: nombre || 'Producto',
        precio: precio || 0,
        img: btn.dataset.img || item?.querySelector('img')?.src || '',
        cantidad
      };

      agregarAlCarrito(producto);
      mostrarNotificacionAgregado(producto);
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
