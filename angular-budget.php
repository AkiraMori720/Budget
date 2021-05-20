<?php

/**
 * Plugin Name: Budget
 * Description: Managing Budget from the WordPress back end panel.
 * Version: 1.0.0
 * Author: Kzar
 * Author URI: mailto:kzar1102@outlook.com?subject=AngularBudget
 * Requires at least: 4.9
 * Tested up to: 5.3
 * Requires PHP: 5.6
 * Text Domain: angular-budget
 * License: GPL2+
 *
 */

if (!defined('ABSPATH')) {
    die;
}

// load plugin text domain
// function angular_budget_load_plugin_textdomain() {

//     $result = load_plugin_textdomain(
//         'angular_budget',
//         false, 
//         dirname( plugin_basename( __FILE__ ) ) . '/translation' 
//     );
// }

// add_action('plugins_loaded', 'angular_budget_load_plugin_textdomain');

// Define constants.

define('ANGULAR_BUDGET_PLUGIN_NAME', basename(__DIR__));
define('ANGULAR_BUDGET_VERSION', '1.0.0');
define('ANGULAR_BUDGET_PLUGIN_DIR', untrailingslashit(plugin_dir_path(__FILE__)));
define('ANGULAR_BUDGET_PLUGIN_URL', untrailingslashit(plugins_url(basename(plugin_dir_path(__FILE__)), basename(__FILE__))));
define('ANGULAR_BUDGET_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Global Managers
// require_once dirname(__FILE__) . '/classes/class-oc-event-manager.php';
// require_once dirname(__FILE__) . '/classes/class-oc-dr-manager.php';
// require_once dirname(__FILE__) . '/classes/class-oc-enquiry-manager.php';

// Plugin Activation
register_activation_hook(__FILE__, 'angular_budget_activate');

function angular_budget_activate(){
    // Global Managers Activate
    angular_budget_db_install();
}

function angular_budget_db_install() {
    global $wpdb;

    $wpdb_prefix = $wpdb->prefix;
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $sql = "CREATE TABLE `${wpdb_prefix}cogs_accounts` (
        `account_id` varchar(36) NOT NULL PRIMARY KEY,
        `user_id` int(11) NOT NULL,
        `account_type_id` varchar(36) NOT NULL,
        `account_number` varchar(255) NOT NULL,
        `account_name` varchar(255) NOT NULL,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        KEY `user_id` (`user_id`),
        KEY `cogs_accounts_ibfk_1` (`account_type_id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    dbDelta( $sql );

    $sql = "CREATE TABLE `${wpdb_prefix}cogs_account_types` (
        `type_id` varchar(36) NOT NULL PRIMARY KEY,
        `type_name` varchar(255) NOT NULL DEFAULT '',
        `type_sequence` int(10) NOT NULL DEFAULT 0,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp()
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      INSERT INTO `${wpdb_prefix}cogs_account_types` (`type_id`, `type_name`, `type_sequence`, `created_at`) VALUES
            ('3FT32E5F-CF6F-4F4B-896F-986A8IU4EA7A', 'Debts', 3078, '2020-10-23 12:28:42')
        ON DUPLICATE KEY UPDATE
            `type_name` = 'Debts',
            `type_sequence` = 3078,
            `created_at` = '2020-10-23 12:28:42';
        INSERT INTO `${wpdb_prefix}cogs_account_types` (`type_id`, `type_name`, `type_sequence`, `created_at`) VALUES
            ('B34B9FC0-3C61-429C-BB24-17C139108FF8', 'Income', 4068, '2020-10-23 12:28:42')
        ON DUPLICATE KEY UPDATE
            `type_name` = 'Income',
            `type_sequence` = 4068,
            `created_at` = '2020-10-23 12:28:42';
        INSERT INTO `${wpdb_prefix}cogs_account_types` (`type_id`, `type_name`, `type_sequence`, `created_at`) VALUES
            ('F8F32E5F-CF6F-4F4B-875F-986AAEE4EA7A', 'COGS', 5058, '2020-10-23 12:28:42')
        ON DUPLICATE KEY UPDATE
            `type_name` = 'COGS',
            `type_sequence` = 5058,
            `created_at` = '2020-10-23 12:28:42';
        INSERT INTO `${wpdb_prefix}cogs_account_types` (`type_id`, `type_name`, `type_sequence`, `created_at`) VALUES
            ('FB9E9C53-BDF0-11E9-9854-A9BCB2474DAD', 'Expenditure', 6033, '2020-10-23 12:28:42')
        ON DUPLICATE KEY UPDATE
            `type_name` = 'Expenditure',
            `type_sequence` = 6033,
            `created_at` = '2020-10-23 12:28:42';
      ";

    dbDelta( $sql );

    $sql = "CREATE TABLE `${wpdb_prefix}cogs_budgets` (
        `budget_id` varchar(36) NOT NULL PRIMARY KEY,
        `user_id` int(11) NOT NULL,
        `account_id` varchar(36) NOT NULL,
        `year_id` varchar(36) NOT NULL,
        `budget_amount` double(10,2) NOT NULL DEFAULT 0.00,
        `m1_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m2_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m3_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m4_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m5_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m6_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m7_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m8_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m9_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m10_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m11_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `m12_actual` double(10,2) NOT NULL DEFAULT 0.00,
        `today_debt` double(10,2) NOT NULL DEFAULT 0.00,
        `monthly_due` double(10,2) NOT NULL DEFAULT 0.00,
        `interest_rate` double(10,2) NOT NULL DEFAULT 0.00,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        KEY `user_id` (`user_id`),
        KEY `cogs_budgets_ibfk_1` (`account_id`),
        KEY `cogs_budgets_ibfk_2` (`year_id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    dbDelta( $sql );

    $sql = "CREATE TABLE `${wpdb_prefix}cogs_configs` (
        `config_id` varchar(36) NOT NULL PRIMARY KEY,
        `user_id` int(11) NOT NULL,
        `config_company` varchar(255) NOT NULL DEFAULT '',
        `config_address` varchar(255) NOT NULL DEFAULT '',
        `config_website` varchar(255) NOT NULL DEFAULT '' COMMENT 'No white space',
        `config_logo` varchar(255) NOT NULL DEFAULT '',
        `config_banner` varchar(255) NOT NULL DEFAULT '',
        `created_at` timestamp NOT NULL DEFAULT current_timestamp()
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    dbDelta( $sql );

    
    $sql = "CREATE TABLE `${wpdb_prefix}cogs_years` (
        `year_id` varchar(36) NOT NULL PRIMARY KEY,
        `user_id` int(11) NOT NULL,
        `year_name` varchar(4) NOT NULL,
        `total_budget_income` double(10,2) NOT NULL DEFAULT 0.00,
        `forecast_percent_m1` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m2` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m3` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m4` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m5` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m6` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m7` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m8` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m9` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m10` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m11` double(10,2) NOT NULL DEFAULT 8.33,
        `forecast_percent_m12` double(10,2) NOT NULL DEFAULT 8.33,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        UNIQUE KEY `uk_user_year_name` (`user_id`, `year_name`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    dbDelta( $sql );
}

function angular_budget_register_menu(){
    add_menu_page('12 Month Forecast','Budget','read','angular_budget','goto_budget_page','',26);
}

function goto_budget_page(){
    require_once ANGULAR_BUDGET_PLUGIN_DIR . '/pages/budget.php';  
}

add_action('admin_menu','angular_budget_register_menu');

function fontawesome_icon_budget_menu() {
    echo '<style type="text/css" media="screen">
        icon16.icon-media:before, #toplevel_page_angular_budget .toplevel_page_angular_budget div.wp-menu-image:before {
        font-family: "Font Awesome 5 Free" !important;
        content: "\\f53c";
        font-style:normal;
        font-weight:900;
        }
    </style>';
    }
add_action('admin_head', 'fontawesome_icon_budget_menu');


/**
 * Auto-version Assets
 */
function budget_auto_version_file( $path_to_file ) {
    $file = ANGULAR_BUDGET_PLUGIN_DIR . '/' . $path_to_file;
    if ( ! file_exists( $file ) ) return false;

    $mtime = filemtime( $file );
    $url = plugins_url($path_to_file, __FILE__) . '?v=' . $mtime;

    return $url;
}
    
function angular_enqueue($hook){
    if($hook == "toplevel_page_angular_budget") 
    {
        wp_enqueue_script('angular_budget_angular_min_script', budget_auto_version_file('vendor/angular.js'));
        wp_enqueue_script('angular_budget_angular_santitize_script', budget_auto_version_file('vendor/angular-sanitize.js'));
        wp_enqueue_script('angular_budget_ui_router_script', budget_auto_version_file('vendor/angular-ui-router.js'));
        wp_enqueue_script('angular_budget_state_event_script', budget_auto_version_file('vendor/angular-resource.js'));
        wp_enqueue_script('angular_budget_state_event_script', budget_auto_version_file('vendor/angular-animate.js'));
        wp_enqueue_script('angular_budget_state_event_script', budget_auto_version_file('vendor/lodash.js'));
        wp_enqueue_script('angular_budget_app_script', budget_auto_version_file('js/app.js'));
        wp_enqueue_style('fontawesome','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css', '', '5.11.2', 'all');
        wp_enqueue_style('angular_budget_style', budget_auto_version_file('css/style.css'));
        wp_enqueue_style('angular_budget_w3_style', budget_auto_version_file('css/w3.css'));
    }
}
add_action('admin_enqueue_scripts',  'angular_enqueue');


// ShortCode
// The shortcode function
function angular_budget_shortcode() { 
 
    // Advertisement code pasted inside a variable
    $string = '';
    if(current_user_can('read')){
        $string = '
        <link rel="stylesheet" href="'. budget_auto_version_file('css/w3.css') . '" media="all">
        <link rel="stylesheet" href="' . budget_auto_version_file('css/style.css') . '" media="all">
        <script>
            window.WP = {
                plugin_url: "' . ANGULAR_BUDGET_PLUGIN_URL . '",
                plugin_name: "' . ANGULAR_BUDGET_PLUGIN_NAME . '"
            }
        </script>
        <script src="' . budget_auto_version_file('vendor/angular.js') . '"></script>
        <script src="' . budget_auto_version_file('vendor/angular-sanitize.js') . '"></script>
        <script src="' . budget_auto_version_file('vendor/angular-ui-router.js') . '"></script>
        <script src="' . budget_auto_version_file('vendor/angular-resource.js') . '"></script>
        <script src="' . budget_auto_version_file('vendor/angular-animate.js') . '"></script>
        <script src="' . budget_auto_version_file('vendor/lodash.js') . '"></script>
        <script src="' . budget_auto_version_file('js/app.js') . '"></script>
        <div ng-app="myApp" class="w3-teal" style="min-width: 1024px;" id="angular_budget_body">
            <div class="wrapper">
                <div class="w3-sand" style="min-height: 600px;">
                    <ui-view></ui-view>
                </div>
        
                <div class="w3-container w3-teal w3-center no-print">
                    &copy; Advanced Training Academy
                </div>
            </div>
        </div>';
         
        // Ad code returned
    }
    return $string; 
     
}
// Register shortcode
add_shortcode('angular_budget_window', 'angular_budget_shortcode'); 



// Plugin Deactivation
register_deactivation_hook(__FILE__, 'angular_budget_deactivate');


function angular_budget_deactivate(){
    flush_rewrite_rules();
}