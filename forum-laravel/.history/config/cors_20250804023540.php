<?php

return [
    'paths' => ['api/*', '*'], // Add all routes that need CORS

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*','http://192.168.1.101:8000'], // For development only

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Set to true if using cookies/auth
];