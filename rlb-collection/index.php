<?php
/**
 * Plugin Name: RLB Collection
 * Version: 1.0.1
 * Author: Blake Davis
 * Description: A flexible Gutenberg block for querying and displaying a group of posts.
 * Text Domain: rlb-collection
 * TEST TEST
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}



function rlb_collection_block_init() {
    wp_enqueue_script('jquery');

    wp_register_script(
        'rlb-collection/editor-script',
        plugins_url('rlb-collection-editor.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-data'],
        filemtime(plugin_dir_path(__FILE__) . '/rlb-collection-editor.js')
    );

    wp_register_style(
        'rlb-collection/stylesheet',
        plugins_url('rlb-collection-style.css', __FILE__),
        ['wp-edit-blocks'],
        filemtime(plugin_dir_path(__FILE__) . '/rlb-collection-style.css')
    );



    register_block_type(
        'rlb-collection/block-library',
        ['api_version'     => 2,
         'title'           => 'Collection',
         'icon'            => 'columns',
         'editor_script'   => 'rlb-collection/editor-script',
         'style'           => 'rlb-collection/stylesheet'
        ]
    );
}
add_action('init', 'rlb_collection_block_init');





add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script('rlb-collection/render-script');
    wp_enqueue_script('rlb-collection/frontend-script');

    wp_register_script('rlb-collection/render-script', plugins_url('/rlb-collection-render.js', __FILE__), null);
    wp_register_script('rlb-collection/frontend-script', plugins_url('/rlb-collection-frontend.js', __FILE__), ['wp-api-fetch', 'wp-polyfill', 'wp-data']);
});





// Set script attributes
function set_scripts_type_attribute($tag, $handle, $src) {
    $module_handles = ['rlb-collection/editor-script',
                       'rlb-collection/render-script',
                       'rlb-collection/frontend-script'];

    if (in_array($handle, $module_handles)) {
        $tag = '<script type="module" src="' . $src . '"></script>';
    }

    return $tag;
}
add_filter('script_loader_tag', 'set_scripts_type_attribute', 10, 3);



// ========================================================
add_action('publish_post', 'postPublished');




// ========================================================
function get_collection_items($params) {
    $query_args = [
        'cat'            => $params['filterCategory'], //(isset($params['filterCategory']) ? $params['filterCategory'] : ""), // Ternary expression prevents array to string conversion error if filterCategory is undefined
        'order'          => $params['order'],
        'meta_key'       => ($params['showEvents'] == 'true' ? 'event_start' : ''),
        'orderby'        => ($params['showEvents'] == 'true' ? 'meta_value'  : $params['orderby']),
        'posts_per_page' => -1,
        'post_type'      => [$params['showAwards']   == 'true' ? 'awards'   : null,
                             $params['showEvents']   == 'true' ? 'events'   : null,
                             $params['showMentions'] == 'true' ? 'mentions' : null,
                             $params['showPosts']    == 'true' ? 'post'     : null,   // Default "post" type MUST be
                             $params['showProducts'] == 'true' ? 'products' : null,   // singular (i.e. not "posts")
                             $params['showReviews']  == 'true' ? 'reviews'  : null
                            ],
    ];
    $the_query = new WP_Query($query_args);

    $items = [];

    while ($the_query->have_posts()) {
        $the_query->the_post();

        $newItem = [
            'name'  => get_the_title(),
            'image' => g17_get_the_post_thumbnail_url(),
            'link'  => get_the_permalink(),
            'date'  => get_the_date(),       // Post creation date
            'type'  => get_post_type()
        ];

        switch($newItem['type']) {
            case ('events'):
                $data = get_current_post_data('events');
                $meta = get_post_meta(get_the_ID(), 'events_mb', true);

                $date_count = 2;                                          // Figure out how many dates the event has.
                while (!empty($data['mb']['startdate' . $date_count])) {  // Starts on 2, bc 1 always exists.
                    $date_count++;
                }

                $today = date('Y-m-d');

                // Skip event if its latest startdate is before today for 'upcoming' collections,
                // and if its latest enddate is after today for 'past' collections
                if ($params['filterDate'] == 'upcoming') {
                    if (!empty($data['mb']['startdate' . ($date_count - 1)])) {
                        if ($data['mb']['startdate' . ($date_count - 1)] < $today) {
                            continue 2;                             // Skip to next post w/o adding to $items.
                        }                                           // Has to be "continue 2" to break switch and while loop.
                    }                                               // "continue" in this context is equivalent to "break".
                } elseif ($params['filterDate'] == 'past') {
                    if (!empty($data['mb']['enddate' . ($date_count - 1)])) {
                        if ($data['mb']['enddate' . ($date_count - 1)] > $today) {
                            continue 2;
                        }
                    }
                }



                // Create string of start/end date values to display in collection
                $dates = '';
                for ($i = 1; $i < $date_count; $i++) {
                    $date_string = '';

                    $startdate = rlb_format_date($meta['startdate' . $i], true, false);
                    $starttime = rlb_format_date($meta['startdate' . $i], false, true);
                    $enddate = rlb_format_date($meta['enddate' . $i], true, false);
                    $endtime = rlb_format_date($meta['enddate' . $i], false, true);

                    $date_string .= $startdate . ' ' . $starttime . ' - ';

                    if ($startdate == $enddate) {
                        $date_string .= $endtime;

                    } else {
                        $date_string .= $enddate . ' ' . $endtime;
                    }

                    $dates .= '<p>' . $date_string . '</p>';
                }

                $newItem['inPersonTickets'] = $meta['ticket']['url'];
                $newItem['onlineTickets'] = $meta['url'];
                $newItem['age'] = $meta['age'];
                $newItem['excerpt'] = get_the_excerpt();
                $newItem['dates'] = $dates;
                break;



            case ('products'):
                $data = get_post_meta(get_the_ID(), 'products_mb', true);

                $newItem['link']        = add_query_arg(get_utm_data(), $data['link']);
                $newItem['price']       = $data['price'];
                $newItem['description'] = $data['description'];
                break;

            default:

        }

        $items[] = $newItem;
    }

    wp_reset_postdata();

    return $items;
}
add_action('wp_ajax_get_collection_items', 'get_collection_items');
add_action('wp_ajax_nopriv_get_collection_items', 'get_collection_items');





// ========================================================
function rlb_format_date($date_unformatted, $show_date = true, $show_time = true) {
    if (!empty($date_unformatted)) {

        if ($show_date && $show_time) {
            return date_format(date_create($date_unformatted), "M d, Y g:iA");

        } else if ($show_date) { // Return date only
            return date_format(date_create($date_unformatted), "M d, Y");

        } else { // Return time only
            return date_format(date_create($date_unformatted), "g:iA");
        }

    } else {
        return;
    }
};





// ========================================================
function my_rest_api_init() {
    register_rest_route('rodney-lee-brands/rlb-collection',
                        '/items',
                        ['methods'             => ['GET', 'POST', 'PUT'],
                         'permission_callback' => '__return_true',
                         'callback'            => function (\WP_REST_Request $request) {

//                                                      $categories = get_categories();
//                                                      $category_names = array_map(function ($element) { return $element->name; }, $categories);
//                                                      $categories_string = implode(',', $category_names);

                                                      return array( 'request'    => $request,
                                                                    'headers'    => $request->get_headers(),
                                                                    'parameters' => $request->get_params(),
                                                                    'categories' => get_categories(), //$categories_string,
                                                                    'html'       => get_collection_items($request->get_params()));
                                                  }, // end callback function
    ]);
}
add_action('rest_api_init', 'my_rest_api_init', 10, 1);

