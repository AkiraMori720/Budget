<?php
require_once "../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

$response = $accounting->budget_remove($data->budget_id ?? '');

header("Content-Type: application/json");
echo json_encode($response);
