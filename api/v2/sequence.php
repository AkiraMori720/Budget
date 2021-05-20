<?php
require_once "class.accounting.inc.php";

$accounting = new accounting();

$data = json_decode(file_get_contents('php://input'));

$sequence = $accounting->sequence($data->type_id ?? '');

header("Content-Type: application/json");
echo json_encode($sequence);
