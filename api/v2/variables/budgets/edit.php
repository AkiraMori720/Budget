<?php
require_once "../../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

// Don't edit for yearly total page
if ('all' == $budget_data->month) {
    $response = [];
} else {
    $response = $accounting->variables_budget_edit($data->budget_id, $data->budget_data);
}

header("Content-Type: application/json");
echo json_encode($response);
