<?php
/**
 * RG BAZZER - PHP Entry Point Wrapper
 * This file serves the React application's index.html.
 * It is useful for servers that prioritize index.php over index.html.
 */
if (file_exists('index.html')) {
    require_once('index.html');
} else {
    echo "Error: index.html not found. Please ensure you have built the project using 'npm run build'.";
}
?>
