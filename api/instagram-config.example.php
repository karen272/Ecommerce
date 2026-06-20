<?php
/**
 * Copiá este archivo como instagram-config.php y completá los datos.
 *
 * ALTERNATIVA MÁS FÁCIL (sin PHP):
 * Usá Behold en assets/js/instagram-config.js → beholdFeedUrl
 * https://behold.so — conectás @pochoclosla22 y pegás la URL del feed JSON.
 *
 * ESTA OPCIÓN (PHP + Meta Graph API):
 * 1. Convertí @pochoclosla22 a cuenta Empresa o Creador en Instagram.
 * 2. Vinculala a una Página de Facebook.
 * 3. Entrá a https://developers.facebook.com/ → Crear app → Tipo "Negocios".
 * 4. Agregá producto "Instagram Graph API".
 * 5. En Graph API Explorer generá un token con permisos:
 *    instagram_basic, pages_show_list, pages_read_engagement
 * 6. Obtené el Instagram User ID:
 *    GET graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=TOKEN
 *    (o desde la configuración de la app de Meta)
 * 7. Convertí el token a long-lived (60 días):
 *    GET graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&...
 * 8. Pegá abajo el token long-lived y el ID numérico de la cuenta de Instagram.
 */
return [
    'access_token' => 'PEGAR_TOKEN_AQUI',
    'user_id'      => 'PEGAR_IG_USER_ID_AQUI',
    'limit'        => 3,
    'cache_ttl'    => 3600,
    'api_version'  => 'v21.0',
];
