<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'me',
        '*'
    ],

    'allowed_methods' => [
        'POST',
        'GET',
        'OPTIONS',
        'PUT',
        'PATCH',
        'DELETE'
    ],

    'allowed_origins' => [
        '*',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://192.168.1.104:8000'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'X-Auth-Token',
        'Origin',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],

    'exposed_headers' => [
        'Cache-Control',
        'Content-Language',
        'Content-Type',
        'Expires',
        'Last-Modified',
        'Pragma'
    ],
    'credentials' => true,

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,
];
