/**
 * Sorteo Scaloneta — números únicos por pedido confirmado.
 * Más de $5.000 -> 1 número | Más de $10.000 -> 2 números.
 * Los números usados se guardan en localStorage (únicos en este navegador).
 */
const SORTEO = {
  KEY_USADOS: "sorteo_numeros_usados",
  NUM_MIN: 1,
  NUM_MAX: 9999,
  MONTO_UN_NUMERO: 5000,
  MONTO_DOBLE_NUMEROS: 10000,
};

function cantidadNumerosPorPedido(totalCompra) {
  const total = Number(totalCompra) || 0;

  if (total > SORTEO.MONTO_DOBLE_NUMEROS) return 2;
  if (total > SORTEO.MONTO_UN_NUMERO) return 1;
  return 0;
}

function descripcionCantidadNumeros(totalCompra) {
  const total = Number(totalCompra) || 0;
  const cantidad = cantidadNumerosPorPedido(total);

  if (cantidad === 2) {
    return `Compra mayor a $${SORTEO.MONTO_DOBLE_NUMEROS.toLocaleString("es-AR")} — 2 números`;
  }

  if (cantidad === 1) {
    return `Compra mayor a $${SORTEO.MONTO_UN_NUMERO.toLocaleString("es-AR")} — 1 número`;
  }

  return `Compra menor o igual a $${SORTEO.MONTO_UN_NUMERO.toLocaleString("es-AR")} — sin número`;
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
      error: `Solo quedan ${disponibles.length} numero(s) disponibles en el sorteo. Escribinos por WhatsApp para coordinar.`,
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

function textoSorteoWhatsApp(numeros, totalCompra) {
  if (!numeros.length) return "";

  const total = Number(totalCompra) || 0;
  const etiqueta = numeros.length > 1 ? "Numeros asignados" : "Numero asignado";

  let texto = "\n\n*SORTEO - Alentemos a la Scaloneta*\n";
  texto += `${descripcionCantidadNumeros(total)}\n`;
  texto += `${etiqueta} (${numeros.length}): *${formatearNumerosSorteo(numeros)}*`;
  return texto;
}

function actualizarPreviewSorteo(cantidadItems, totalCompra) {
  const el = document.getElementById("sorteo-preview");
  if (!el) return;

  if (!cantidadItems || cantidadItems <= 0) {
    el.classList.add("d-none");
    el.innerHTML = "";
    return;
  }

  const total = Number(totalCompra) || 0;
  const cantidad = cantidadNumerosPorPedido(total);
  const montoUno = SORTEO.MONTO_UN_NUMERO.toLocaleString("es-AR");
  const montoDos = SORTEO.MONTO_DOBLE_NUMEROS.toLocaleString("es-AR");

  let lineaNumeros = `Este pedido todavia <span class="sorteo-preview-num">no participa</span> del sorteo.`;
  let lineaTip = `Supera los $${montoUno} y recibis <strong>1 numero</strong>. Si pasas los $${montoDos}, recibis <strong>2 numeros</strong>.`;
  let titulo = "Sumate al sorteo";

  if (cantidad === 1) {
    titulo = "Participas del sorteo";
    lineaNumeros = `Este pedido te da <span class="sorteo-preview-num">1 numero</span> para el sorteo.`;
    lineaTip = `Si superas los $${montoDos}, recibis <strong>2 numeros</strong> en el mismo pedido.`;
  }

  if (cantidad === 2) {
    titulo = "Participas del sorteo";
    lineaNumeros = `Este pedido te da <span class="sorteo-preview-num">2 numeros</span> para el sorteo.`;
    lineaTip = `Genial! Superaste los $${montoDos} y sumas doble chance en esta compra.`;
  }

  el.classList.remove("d-none");
  el.innerHTML = `
    <div class="sorteo-preview-inner">
      <div class="sorteo-preview-icon" aria-hidden="true"><i class="bi bi-ticket-perforated-fill"></i></div>
      <div class="sorteo-preview-text">
        <strong class="sorteo-preview-title">${titulo}</strong>
        <p class="sorteo-preview-main">${lineaNumeros}</p>
        <p class="sorteo-preview-tip">${lineaTip}</p>
        <p class="sorteo-preview-meta"><i class="bi bi-calendar-event" aria-hidden="true"></i> Sorteo: próximo viernes 20:30 hs · <i class="bi bi-truck" aria-hidden="true"></i> Premio a domicilio</p>
      </div>
    </div>
  `;
}
