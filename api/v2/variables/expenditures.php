<?php
if ('POST' !== $_SERVER["REQUEST_METHOD"]) {
    echo 'Only post request supports here.';
    return;
}

require_once "../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

if ('all' == $data->month ?? '') {
    $expenditures = $accounting->variables_total_budgets('Expenditure', $data->year ?? date('Y'));
} else {
    $expenditures = $accounting->variables_budgets('Expenditure', $data->year ?? date('Y'), $data->month ?? date('n'), $data->percentage ?? null);
}

header("Content-Type: application/json");
echo json_encode($expenditures);
