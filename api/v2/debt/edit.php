<?php
if ('POST' !== $_SERVER["REQUEST_METHOD"]) {
    echo 'Only post request supports here.';
    return;
}
require_once "../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

$response = $accounting->debt_edit($data->budget_id, $data->debt_data);

header("Content-Type: application/json");
echo json_encode($response);
