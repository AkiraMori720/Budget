<?php


?>
<script>
window.WP = {
    plugin_url: "<?php echo ANGULAR_BUDGET_PLUGIN_URL; ?>",
    plugin_name: "<?php echo ANGULAR_BUDGET_PLUGIN_NAME; ?>"
}
</script>
<div ng-app="myApp" class="w3-teal">
    <div class="wrapper">
        <div class="w3-sand" style="min-height: 600px;">
            <ui-view></ui-view>
        </div>

        <div class="w3-container w3-teal w3-center no-print">
            &copy; Advanced Training Academy
        </div>
    </div>
</div>