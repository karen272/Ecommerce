<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$configFile = __DIR__ . '/instagram-config.php';
$exampleFile = __DIR__ . '/instagram-config.example.php';

if (!file_exists($configFile)) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error'   => 'Falta configurar api/instagram-config.php (copiá instagram-config.example.php).',
        'posts'   => [],
    ]);
    exit;
}

$config = require $configFile;
$token  = trim($config['access_token'] ?? '');
$userId = trim($config['user_id'] ?? '');
$limit  = max(1, min(12, (int) ($config['limit'] ?? 3)));
$ttl    = max(300, (int) ($config['cache_ttl'] ?? 3600));
$version = $config['api_version'] ?? 'v21.0';

if (!$token || !$userId || strpos($token, 'PEGAR') !== false) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error'   => 'Completá access_token e user_id en api/instagram-config.php',
        'posts'   => [],
    ]);
    exit;
}

$cacheDir  = dirname(__DIR__) . '/assets/data';
$cacheFile = $cacheDir . '/instagram-cache.json';

if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (
        is_array($cached)
        && !empty($cached['posts'])
        && isset($cached['fetched_at'])
        && (time() - (int) $cached['fetched_at']) < $ttl
    ) {
        echo json_encode([
            'success' => true,
            'cached'  => true,
            'posts'   => array_slice($cached['posts'], 0, $limit),
        ]);
        exit;
    }
}

$fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
$url = "https://graph.facebook.com/{$version}/{$userId}/media"
    . '?fields=' . urlencode($fields)
    . '&limit=' . $limit
    . '&access_token=' . urlencode($token);

$response = httpGet($url);
$data = json_decode($response, true);

if (!is_array($data) || isset($data['error'])) {
    $message = $data['error']['message'] ?? 'Error al consultar Instagram';
    http_response_code(502);

    if (file_exists($cacheFile)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if (!empty($cached['posts'])) {
            echo json_encode([
                'success' => true,
                'cached'  => true,
                'stale'   => true,
                'warning' => $message,
                'posts'   => array_slice($cached['posts'], 0, $limit),
            ]);
            exit;
        }
    }

    echo json_encode([
        'success' => false,
        'error'   => $message,
        'posts'   => [],
    ]);
    exit;
}

$posts = [];
foreach ($data['data'] ?? [] as $item) {
    if (empty($item['permalink'])) {
        continue;
    }
    $posts[] = [
        'id'            => $item['id'] ?? '',
        'caption'       => $item['caption'] ?? '',
        'media_type'    => $item['media_type'] ?? 'IMAGE',
        'media_url'     => $item['media_url'] ?? '',
        'thumbnail_url' => $item['thumbnail_url'] ?? '',
        'permalink'     => $item['permalink'],
        'timestamp'     => $item['timestamp'] ?? '',
        'image'         => imageForPost($item),
    ];
}

$payload = [
    'fetched_at' => time(),
    'posts'      => $posts,
];
file_put_contents($cacheFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'cached'  => false,
    'posts'   => $posts,
]);

function imageForPost(array $item): string
{
    $type = $item['media_type'] ?? 'IMAGE';
    if ($type === 'VIDEO' || $type === 'REELS') {
        return $item['thumbnail_url'] ?? $item['media_url'] ?? '';
    }
    return $item['media_url'] ?? $item['thumbnail_url'] ?? '';
}

function httpGet(string $url): string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result !== false ? $result : '';
    }

    $context = stream_context_create([
        'http' => ['timeout' => 15, 'ignore_errors' => true],
    ]);
    return (string) file_get_contents($url, false, $context);
}
