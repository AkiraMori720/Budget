<?php
require_once "../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

$response = $accounting->budget_add($data->account_type_id, $data->budget);

header("Content-Type: application/json");
echo json_encode($response);
