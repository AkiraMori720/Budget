<?php
require_once "class.accounting.inc.php";

$accounting = new accounting();

$configs = $accounting->configs();

header("Content-Type: application/json");
echo json_encode($configs);
