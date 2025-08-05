<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
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
        'http://localhost:3000',    // Common frontend dev server
        'http://localhost:5173',    // Common frontend dev server
        'http://127.0.0.1:3000',   // Alternative localhost
        'http://192.168.1.101:8000', // Your specific IP
        'http://192.168.1.102:8000' // Your specific IP
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

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,
];
