/**
 * Sorteo Scaloneta — números únicos por pedido confirmado.
 * 1 número por cada producto en el carrito (suma de cantidades).
 * Los números usados se guardan en localStorage (únicos en este navegador).
 */
const SORTEO = {
  KEY_USADOS: "sorteo_numeros_usados",
  NUM_MIN: 1,
  NUM_MAX: 9999,
};

function cantidadNumerosPorPedido(cantidadProductos) {
  return Math.max(0, Math.floor(Number(cantidadProductos) || 0));
}

function contarProductosEnCarrito(carrito) {
  if (!Array.isArray(carrito)) return 0;
  return carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
}

function descripcionCantidadNumeros(cantidadProductos) {
  const cantidad = cantidadNumerosPorPedido(cantidadProductos);

  if (cantidad === 1) {
    return "1 producto en el pedido — 1 número";
  }

  if (cantidad > 1) {
    return `${cantidad} productos en el pedido — ${cantidad} números`;
  }

  return "Sin productos en el pedido — sin números";
}

function obtenerNumerosUsadosSorteo() {
  try {
    const data = JSON.parse(localStorage.getItem(SORTEO.KEY_USADOS) || "[]");
    return Array.isArray(data)
      ? data.map(Number).filter((n) => !isNaN(n) && n >= SORTEO.NUM_MIN && n <= SORTEO.NUM_MAX)
      : [];
  } catch {
    return [];
  }
}

function registrarNumerosSorteo(numeros) {
  const usados = obtenerNumerosUsadosSorteo();
  const nuevos = [...new Set([...usados, ...numeros])];
  localStorage.setItem(SORTEO.KEY_USADOS, JSON.stringify(nuevos));
}

function generarNumerosSorteo(cantidad) {
  if (cantidad <= 0) return { numeros: [], error: null };

  const usados = new Set(obtenerNumerosUsadosSorteo());
  const disponibles = [];

  for (let i = SORTEO.NUM_MIN; i <= SORTEO.NUM_MAX; i++) {
    if (!usados.has(i)) disponibles.push(i);
  }

  if (disponibles.length < cantidad) {
    return {
      numeros: [],
      error: `Solo quedan ${disponibles.length} número(s) disponibles en el sorteo. Escribinos por WhatsApp para coordinar.`,
    };
  }

  const seleccionados = [];
  const pool = [...disponibles];

  for (let c = 0; c < cantidad; c++) {
    const idx = Math.floor(Math.random() * pool.length);
    seleccionados.push(pool[idx]);
    pool.splice(idx, 1);
  }

  seleccionados.sort((a, b) => a - b);
  registrarNumerosSorteo(seleccionados);

  return { numeros: seleccionados, error: null };
}

function formatearNumeroSorteo(n) {
  return String(n).padStart(4, "0");
}

function formatearNumerosSorteo(lista) {
  return lista.map(formatearNumeroSorteo).join(", ");
}

function textoSorteoWhatsApp(numeros, cantidadProductos) {
  if (!numeros.length) return "";

  const etiqueta = numeros.length > 1 ? "Números asignados" : "Número asignado";

  let texto = "\n\n*SORTEO — Alentemos a la Scaloneta*\n";
  texto += `${descripcionCantidadNumeros(cantidadProductos)}\n`;
  texto += `${etiqueta} (${numeros.length}): *${formatearNumerosSorteo(numeros)}*`;
  return texto;
}

function actualizarPreviewSorteo(cantidadProductos) {
  const el = document.getElementById("sorteo-preview");
  if (!el) return;

  const cantidad = cantidadNumerosPorPedido(cantidadProductos);

  if (cantidad <= 0) {
    el.classList.add("d-none");
    el.innerHTML = "";
    return;
  }

  const lineaNumeros =
    cantidad === 1
      ? `Este pedido te da <span class="sorteo-preview-num">1 número</span> para el sorteo.`
      : `Este pedido te da <span class="sorteo-preview-num">${cantidad} números</span> para el sorteo.`;

  const lineaTip =
    cantidad === 1
      ? "Cada producto que agregás al carrito suma un número único."
      : `Tenés ${cantidad} productos en el carrito, así que recibís ${cantidad} números distintos.`;

  el.classList.remove("d-none");
  el.innerHTML = `
    <div class="sorteo-preview-inner">
      <div class="sorteo-preview-icon" aria-hidden="true"><i class="bi bi-ticket-perforated-fill"></i></div>
      <div class="sorteo-preview-text">
        <strong class="sorteo-preview-title">¡Participás del sorteo!</strong>
        <p class="sorteo-preview-main">${lineaNumeros}</p>
        <p class="sorteo-preview-tip">${lineaTip}</p>
        <p class="sorteo-preview-meta"><i class="bi bi-calendar-event" aria-hidden="true"></i> Sorteo: próximo sábado 21 hs · <i class="bi bi-truck" aria-hidden="true"></i> Premio a domicilio</p>
      </div>
    </div>
  `;
}
