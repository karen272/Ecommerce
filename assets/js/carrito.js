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
    mostrarCarrito();   // cart.html
    mostrarCheckout();  // verificar.html

    // Mostrar modal con el nombre del producto eliminado
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
                  <img src="${item.img || "assets/img/product/default.png"}" alt="${item.nombre}" class="img-fluid">
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
                <input type="number" class="quantity-input" value="${item.cantidad}" min="1" max="10" data-id="${item.id}">
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

    actualizarResumen();
}

// =========================
// ACTUALIZAR RESUMEN EN cart.html
// =========================
function actualizarResumen() {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const resumenSubtotal = document.querySelector(".summary-item .summary-value");
    const resumenTotal = document.querySelector(".summary-total .summary-value");

    if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    if (resumenTotal) resumenTotal.textContent = `$${subtotal.toLocaleString()}`;
}

// =========================
// MOSTRAR CHECKOUT EN verificar.html
// =========================
function mostrarCheckout() {
    const contenedor = document.getElementById("checkout-items");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    let subtotal = 0;

    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;

        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
          <div class="order-item-image">
            <img src="${item.img || "assets/img/product/default.png"}" alt="${item.nombre}" class="img-fluid">
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
    document.getElementById("checkout-subtotal").textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById("checkout-total").innerHTML = `<strong>$${subtotal.toLocaleString()}</strong>`;
    document.getElementById("checkout-btn-price").textContent = `$${subtotal.toLocaleString()}`;
}

// =========================
// VALIDAR FORMULARIO
// =========================
function validarFormulario() {
    let mensajes = [];

    const nombre = document.getElementById("first-name")?.value.trim();
    if (!nombre || nombre.length < 2) mensajes.push("Ingrese un nombre válido.");

    const apellido = document.getElementById("last-name")?.value.trim();
    if (!apellido || apellido.length < 2) mensajes.push("Ingrese un apellido válido.");

    const email = document.getElementById("email")?.value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) mensajes.push("Ingrese un email válido.");

    const phone = document.getElementById("phone")?.value.trim();
    const regexPhone = /^[0-9]{7,15}$/;
    if (!regexPhone.test(phone)) mensajes.push("Ingrese un teléfono válido.");

    const address = document.getElementById("address")?.value.trim();
    if (!address || address.length < 5) mensajes.push("Ingrese una dirección válida.");

    const city = document.getElementById("city")?.value.trim();
    if (!city || city.length < 2) mensajes.push("Ingrese una ciudad válida.");

    const zip = document.getElementById("zip")?.value.trim();
    if (!/^[0-9]{3,10}$/.test(zip)) mensajes.push("Ingrese un código postal válido.");

    const country = document.getElementById("country")?.value.trim();
    if (!country) mensajes.push("Seleccione un país.");

    if (mensajes.length > 0) {
        // 👉 Cargar errores en la lista UL del modal
        const errorList = document.getElementById("validationErrors");
        errorList.innerHTML = "";
        mensajes.forEach(msg => {
            const li = document.createElement("li");
            li.textContent = msg;
            errorList.appendChild(li);
        });

        // 👉 Mostrar modal
        const validationModal = new bootstrap.Modal(document.getElementById("validationModal"));
        validationModal.show();
        return false;
    }
    return true;
}

// =========================
// GENERAR LINK WHATSAPP
// =========================
function generarLinkWhatsApp() {
    if (carrito.length === 0) return alert("El carrito está vacío");

    if (!validarFormulario()) return; // 🚨 acá validamos antes de enviar

    const nombre = document.getElementById("first-name")?.value || "";
    const apellido = document.getElementById("last-name")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const direccion = document.getElementById("address")?.value || "";
    const depto = document.getElementById("apartment")?.value || "";
    const ciudad = document.getElementById("city")?.value || "";
    const cp = document.getElementById("zip")?.value || "";
    const pais = document.getElementById("country")?.value || "";
    const metodoPago = document.querySelector('input[name="payment-method"]:checked')?.id || "";

    let mensaje = "🚨 *NUEVO PEDIDO* 🚨%0A%0A";
    mensaje += `👤 Cliente: ${nombre} ${apellido}%0A`;
    mensaje += `📧 Email: ${email}%0A`;
    mensaje += `📍 Dirección: ${direccion} ${depto}, ${ciudad}, CP ${cp}, ${pais}%0A`;
    mensaje += `💳 Pago: ${metodoPago === "cash" ? "Efectivo" : "Transferencia"}%0A%0A`;

    mensaje += "🛒 *Detalle del pedido:*%0A";

    let total = 0;
    carrito.forEach(p => {
        mensaje += `- ${p.nombre} x${p.cantidad} = $${(p.precio * p.cantidad).toLocaleString()}%0A`;
        total += p.precio * p.cantidad;
    });

    mensaje += `%0A💰 *Total: $${total.toLocaleString()}*`;

    const numero = "5492291459739";
    const link = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(link, "_blank");
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
        if (item && item.cantidad < 10) item.cantidad++;
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
                // 👇 si está en 1 y le das a "–", elimina el producto
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
