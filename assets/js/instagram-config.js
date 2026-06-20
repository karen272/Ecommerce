/**
 * Configuración del feed de Instagram (@pochoclosla22)
 *
 * OPCIÓN RECOMENDADA — Behold (gratis, sin PHP, se actualiza solo):
 * 1. Entrá a https://behold.so y creá cuenta gratis.
 * 2. Conectá la cuenta @pochoclosla22 (debe ser Empresa o Creador en Instagram).
 * 3. Creá un feed tipo "JSON", poné 3 posts y copiá la URL (ej: https://feeds.behold.so/xxxxx).
 * 4. Pegala abajo en beholdFeedUrl.
 *
 * OPCIÓN ALTERNATIVA — PHP + Meta Graph API:
 * Configurá api/instagram-config.php (ver instagram-config.example.php).
 */
window.INSTAGRAM_FEED_CONFIG = {
  beholdFeedUrl: "",
  phpApiUrl: "api/instagram-feed.php",
  postLimit: 3,
};
