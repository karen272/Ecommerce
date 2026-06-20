/**
 * Carga las últimas publicaciones reales de @pochoclosla22.
 * Fuentes: Behold JSON (recomendado) o api/instagram-feed.php (Meta Graph API).
 */
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/pochoclosla22/";

function getInstagramConfig() {
  const defaults = {
    beholdFeedUrl: "",
    phpApiUrl: "api/instagram-feed.php",
    postLimit: 3,
  };
  return { ...defaults, ...(window.INSTAGRAM_FEED_CONFIG || {}) };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function truncateCaption(text, max = 90) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + "…";
}

function normalizeBeholdPosts(data) {
  return (data.posts || []).map((post) => ({
    id: post.id,
    caption: post.prunedCaption || post.caption || "",
    permalink: post.permalink,
    image:
      post.sizes?.medium?.mediaUrl ||
      post.sizes?.large?.mediaUrl ||
      post.sizes?.small?.mediaUrl ||
      post.thumbnailUrl ||
      post.mediaUrl ||
      "",
  }));
}

function normalizePhpPosts(data) {
  return (data.posts || []).map((post) => ({
    id: post.id,
    caption: post.caption || "",
    permalink: post.permalink,
    image: post.image || post.thumbnail_url || post.media_url || "",
  }));
}

function renderInstagramLoading(container) {
  container.innerHTML = `
    <div class="col-12 instagram-feed-status">
      <div class="instagram-feed-loading">
        <span class="instagram-feed-spinner" aria-hidden="true"></span>
        Cargando publicaciones de Instagram…
      </div>
    </div>
  `;
}

function renderInstagramError(container, message) {
  container.innerHTML = `
    <div class="col-12 instagram-feed-status">
      <p class="instagram-feed-error">${escapeHtml(message)}</p>
      <p class="instagram-feed-setup-hint">
        Para mostrar las últimas publicaciones automáticamente, configurá
        <code>beholdFeedUrl</code> en <code>assets/js/instagram-config.js</code>
        (gratis en <a href="https://behold.so" target="_blank" rel="noopener noreferrer">behold.so</a>)
        o el token de Meta en <code>api/instagram-config.php</code>.
      </p>
      <a href="${INSTAGRAM_PROFILE_URL}" class="btn btn-instagram-follow" target="_blank" rel="noopener noreferrer">
        <i class="bi bi-instagram"></i> Ver perfil en Instagram
      </a>
    </div>
  `;
}

function renderInstagramPosts(container, posts, limit) {
  const visible = posts.filter((post) => post.permalink && post.image).slice(0, limit);

  if (visible.length === 0) {
    throw new Error("No hay publicaciones con imagen para mostrar.");
  }

  container.innerHTML = visible
    .map((post) => {
      const caption = truncateCaption(post.caption);
      const alt = caption || "Publicación de Pochoclos La 22 en Instagram";

      return `
        <div class="col-12 col-md-4">
          <a href="${escapeAttr(post.permalink)}" class="instagram-post-card" target="_blank" rel="noopener noreferrer" aria-label="Abrir publicación en Instagram">
            <img src="${escapeAttr(post.image)}" alt="${escapeAttr(alt)}" class="instagram-post-img" loading="lazy">
            <span class="instagram-post-overlay">
              <i class="bi bi-instagram"></i>
              <span>Ver en Instagram</span>
            </span>
            ${caption ? `<span class="instagram-post-caption">${escapeHtml(caption)}</span>` : ""}
          </a>
        </div>
      `;
    })
    .join("");
}

async function fetchBeholdPosts(feedUrl) {
  const response = await fetch(feedUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo conectar con el feed de Behold.");
  }

  const data = await response.json();
  const posts = normalizeBeholdPosts(data);

  if (posts.length === 0) {
    throw new Error("El feed de Behold no tiene publicaciones.");
  }

  return posts;
}

async function fetchPhpPosts(apiUrl) {
  const response = await fetch(apiUrl, { cache: "no-store" });
  const data = await response.json();

  if (!data.success || !Array.isArray(data.posts) || data.posts.length === 0) {
    throw new Error(data.error || "No hay publicaciones disponibles desde el servidor.");
  }

  return normalizePhpPosts(data);
}

async function loadInstagramPosts(config) {
  const beholdUrl = (config.beholdFeedUrl || "").trim();

  if (beholdUrl) {
    return fetchBeholdPosts(beholdUrl);
  }

  return fetchPhpPosts(config.phpApiUrl);
}

async function renderInstagramFeed() {
  const container = document.getElementById("instagram-posts");
  if (!container) return;

  const config = getInstagramConfig();
  renderInstagramLoading(container);

  try {
    const posts = await loadInstagramPosts(config);
    renderInstagramPosts(container, posts, config.postLimit);
  } catch (error) {
    const isLocalFile = window.location.protocol === "file:";
    let message = error.message || "No pudimos cargar las publicaciones.";

    if (isLocalFile && !config.beholdFeedUrl.trim()) {
      message =
        "Abrí el sitio con un servidor web (no como archivo local) o configurá beholdFeedUrl en instagram-config.js.";
    }

    renderInstagramError(container, message);
  }
}

document.addEventListener("DOMContentLoaded", renderInstagramFeed);
