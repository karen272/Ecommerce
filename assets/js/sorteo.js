/**
 * Sorteo por monto de compra
 * > $5.000  → 1 número | ≥ $10.000 → 4 | ≥ $20.000 → 7
 * Los números se guardan en localStorage (únicos en este navegador).
 * Para control global entre todos los clientes hace falta un backend.
 */
const SORTEO = {
  KEY_USADOS: "sorteo_numeros_usados",
  NUM_MIN: 1,
  NUM_MAX: 9999,
};

function cantidadChancesSorteo(totalCompra) {
  if (totalCompra >= 20000) return 7;
  if (totalCompra >= 10000) return 4;
  if (totalCompra > 5000) return 1;
  return 0;
}

function descripcionNivelSorteo(totalCompra) {
  const n = cantidadChancesSorteo(totalCompra);
  if (n === 7) return "Compra de $20.000 o más — 7 números";
  if (n === 4) return "Compra de $10.000 o más — 4 números";
  if (n === 1) return "Compra mayor a $5.000 — 1 número";
  return "Sumá más de $5.000 para participar del sorteo";
}

function obtenerNumerosUsadosSorteo() {
  try {
    const data = JSON.parse(localStorage.getItem(SORTEO.KEY_USADOS) || "[]");
    return Array.isArray(data) ? data.map(Number).filter((n) => !isNaN(n) && n >= SORTEO.NUM_MIN && n <= SORTEO.NUM_MAX) : [];
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

function textoSorteoWhatsApp(totalCompra, numeros) {
  if (!numeros.length) return "";

  let texto = "\n\n🎟️ *SORTEO*\n";
  texto += `${descripcionNivelSorteo(totalCompra)}\n`;
  texto += `Números asignados (${numeros.length}): *${formatearNumerosSorteo(numeros)}*\n`;
  texto += "_Cada número es único (no se repite)._";
  return texto;
}

function actualizarPreviewSorteo(totalCompra) {
  const el = document.getElementById("sorteo-preview");
  if (!el) return;

  const chances = cantidadChancesSorteo(totalCompra);
  if (chances === 0) {
    el.classList.add("d-none");
    el.innerHTML = "";
    return;
  }

  el.classList.remove("d-none");
  el.innerHTML = `
    <div class="sorteo-preview-inner">
      <div class="sorteo-preview-icon" aria-hidden="true"><i class="bi bi-ticket-perforated-fill"></i></div>
      <div class="sorteo-preview-text">
        <strong>¡Participás del sorteo!</strong>
        <p class="mb-0">${descripcionNivelSorteo(totalCompra)}</p>
        <small>Al confirmar el pedido te enviamos tus números por WhatsApp.</small>
      </div>
    </div>
  `;
}
