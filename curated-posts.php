<?php
/**
 * Plugin Name:       Curated Posts Block
 * Description:       Curated posts block
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Blake
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       curated-posts
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function curated_posts_block_init() {

	register_block_type( __DIR__ . '/build' );

    wp_register_style(
        "blake-davis/curated-posts-block/stylesheet",
        plugins_url("./build/style-index.css", __FILE__),
        // filemtime(plugin_dir_path(__FILE__) . '/style-index.css') // Stylesheet "version number" -- added to the URL as a query string for cache busting purposes
    );

    wp_enqueue_style("blake-davis/curated-posts-block/stylesheet");
}
add_action("init", "curated_posts_block_init");
// add_action( 'wp_enqueue_scripts', 'wpdocs_register_plugin_styles' );

// Register REST route
add_action("rest_api_init", function () {

  register_rest_route(
    "blake/v1",
    "/curated-posts-block-stylesheet/",
    [
        "methods"  => 'GET',
        "callback" => function() { return plugins_url("./build/style-index.css", __FILE__); },
    ] );
} );
