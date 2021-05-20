<?php
if ('POST' !== $_SERVER["REQUEST_METHOD"]) {
    echo 'Only post request supports here.';
    return;
}

require_once "../class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

if ('all' == $data->month ?? '') {
    $incomes = $accounting->variables_total_budgets('Income', $data->year ?? date('Y'));
} else {
    $incomes = $accounting->variables_budgets('Income', $data->year ?? date('Y'), $data->month ?? date('n'), $data->percentage ?? null);
}

header("Content-Type: application/json");
echo json_encode($incomes);
