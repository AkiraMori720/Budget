<?php

$path = $_SERVER['DOCUMENT_ROOT'];

include_once $path . '/wp-load.php';

define("USER_ID", 1);

class accounting
{
    private $wpdb;
    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
    }

    /**
     * Generate random unique ID
     */
    private function id()
    {
        $sql = "SELECT UPPER(UUID()) id;";

        $account = $this->wpdb->get_results($sql);

        return $account[0]->id;
    }

    /**
     * Site configurations data
     */
    public function configs()
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();
        $sql = "SELECT config_id, config_company `company`, config_address `address`, config_website website, config_logo logo, config_banner banner, created_at FROM ${prefix}cogs_configs WHERE user_id = ${user_id};";

        $configs = $this->wpdb->get_results($sql, ARRAY_A);
        if(!count($configs)){
            $insert_sql = "INSERT INTO ${prefix}cogs_configs (config_id, user_id, config_company, config_address, config_website, config_logo, config_banner, created_at) 
            VALUES ( UPPER(UUID()), ${user_id}, 'Bob Septic Service', '', 'http://192.168.1.76/cogs', 'images/logo.png', 'images/banner.png', CURRENT_TIMESTAMP);";
            $this->wpdb->query($insert_sql);
            $configs = $this->wpdb->get_results($sql, ARRAY_A);
        }

        return $configs[0];
    }

    /**
     * Update site configurations
     */
    public function updateConfigs($data){

        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $company =$data->configs->company;
        $config_id = $data->configs->config_id;

        $sql = "UPDATE ${prefix}cogs_configs
        SET config_company = '${company}'
        WHERE config_id='${config_id}' AND user_id = ${user_id}";

        return $this->wpdb->query($sql);
    }

    /**
     * Budgets
     */
    public function budgets($type, $year)
    {
        if (!in_array($type, ['Income', 'COGS', 'Expenditure'])) return [];
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();
        
        $sql = "SELECT
            b.budget_id,
            a.account_id,
            a.account_name,
            a.account_number,
            t.type_id,
            t.type_name,
            y.*,
            COUNT(a.account_id) entries,
            SUM(b.budget_amount) annual,
            SUM(b.budget_amount)/12 monthly_average
        FROM ${prefix}cogs_budgets b
        INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
        INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
        INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
        WHERE
            b.user_id = ${user_id} AND
            t.type_name='${type}' AND
            y.year_name='${year}'
        GROUP BY
            b.budget_id, a.account_id, YEAR(b.year_id)
        ORDER BY
            b.year_id ASC,
            t.type_name,
            a.account_name
        ;";
        
        $budgets = $this->wpdb->get_results($sql, ARRAY_A);

        if (in_array($type, ['Expenditure'])){
            $type = "Debts";
            $sql = "SELECT
                b.budget_id,
                a.account_id,
                a.account_name,
                a.account_number,
                t.type_id,
                t.type_name,
                y.*,
                COUNT(a.account_id) entries,
                SUM(b.budget_amount) annual,
                SUM(b.budget_amount)/12 monthly_average
            FROM ${prefix}cogs_budgets b
            INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
            INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
            INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
            WHERE
                b.user_id = ${user_id} AND
                t.type_name='${type}' AND
                y.year_name='${year}'
            GROUP BY
                b.budget_id, a.account_id, YEAR(b.year_id)
            ORDER BY
                b.year_id ASC,
                t.type_name,
                a.account_name
            ;";
            $debts = $this->wpdb->get_results($sql, ARRAY_A);

            $budgets = array_merge($budgets, $debts);
        }

        for($i = 0 ; $i < count($budgets) ; $i++){
            $budgets[$i]['annual'] = floatval($budgets[$i]['annual']);
        }
        return $budgets;
    }


    /**
     * Create new budget
     */
    public function budget_add($account_type_id, $budget)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $year_name = $budget->year ?? date('Y');

        $year = $this->getYearByUser($user_id,$year_name);

        $account_id = $this->id();
        $account_number = $budget->account_number ?? '';
        $account_name = $budget->account_name ?? '';

        $sql = "INSERT INTO `${prefix}cogs_accounts` (account_id, user_id, account_type_id, account_number, account_name)
            VALUES ('${account_id}', ${user_id}, '${account_type_id}', '${account_number}', '${account_name}');";

        $this->wpdb->query($sql);

        $budget_id = $this->id();
        $budget_amount = $budget->budget_amount;
        $year_id =  $year['year_id'];

        $sql = "INSERT INTO ${prefix}cogs_budgets (budget_id, user_id, account_id, year_id, budget_amount) VALUES ('${budget_id}', $user_id, '${account_id}', '${year_id}', ${budget_amount});";

        return $this->wpdb->query($sql);
    }

    /**
     * Remove a budget
     */
    public function budget_remove($budget_id = false)
    {
        if (!$budget_id) return;
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $sql = "DELETE FROM ${prefix}cogs_budgets WHERE budget_id='${budget_id}' AND user_id=${user_id}";

        return $this->wpdb->query($sql);
    }

    /**
     * Edit a budget
     *
     * @param string $budget_id
     * @param object $budget_data
     * @return void
     */
    public function budget_edit($budget_id, $budget_data)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();
        
        $budget_amount = $budget_data->budget_amount;
        $budget_id = $budget_id;
        $year = $budget_data->year ?? 0;

        $sql = "UPDATE ${prefix}cogs_budgets b
        INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
        SET budget_amount = ${budget_amount}
        WHERE b.budget_id='${budget_id}' AND y.year_name='${year}' AND b.user_id=${user_id};";

        return $this->wpdb->query($sql);
    }

    /**
     * Sequence generator for specified account type id
     */
    public function sequence($type_id)
    {
        if (!$type_id) return;
        $prefix = $this->wpdb->prefix;
        $sql = "UPDATE `${prefix}cogs_account_types` SET type_sequence=type_sequence+1 WHERE type_id='${type_id}';";
        $this->wpdb->query($sql);

        $sql = "SELECT type_sequence+1 `sequence` FROM `${prefix}cogs_account_types` WHERE type_id='${type_id}';";
        $runner = $this->wpdb->get_results($sql, ARRAY_A);

        return $runner['sequence'];
    }

    /**
     * Variables budgets
     *
     * @param string $type
     * @param int $year
     * @param $month
     * @return void
     */
    public function variables_budgets($type, $year, $month, $percentage = null)
    {
        if (!in_array($type, ['Income', 'COGS', 'Expenditure'])) return [];
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $sql = "SELECT
            b.budget_id,
            b.m{$month}_actual monthly_actual,
            a.account_id,
            a.account_name,
            a.account_number,
            t.type_id,
            t.type_name,
            y.*,
            y.forecast_percent_m{$month} forecast_percent,
            COUNT(a.account_id) entries,
            SUM(b.budget_amount) annual,
            SUM(b.budget_amount)/12 monthly_average
        FROM ${prefix}cogs_budgets b
        INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
        INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
        INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
        WHERE
            b.user_id=${user_id} AND t.type_name='${type}' AND y.year_name='${year}'
        GROUP BY
            b.budget_id, a.account_id, YEAR(b.year_id)
        ORDER BY
            b.year_id ASC,
            t.type_name,
            a.account_name
        ;";
        $budgets = $this->wpdb->get_results($sql, ARRAY_A);

        if (in_array($type, ['Expenditure'])){
            $type = "Debts";
            $sql = "SELECT
                b.budget_id,
                b.m{$month}_actual monthly_actual,
                a.account_id,
                a.account_name,
                a.account_number,
                t.type_id,
                t.type_name,
                y.*,
                y.forecast_percent_m{$month} forecast_percent,
                COUNT(a.account_id) entries,
                SUM(b.budget_amount) annual,
                SUM(b.budget_amount)/12 monthly_average
            FROM ${prefix}cogs_budgets b
            INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
            INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
            INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
            WHERE
                b.user_id=${user_id} AND t.type_name='${type}' AND y.year_name='${year}'
            GROUP BY
                b.budget_id, a.account_id, YEAR(b.year_id)
            ORDER BY
                b.year_id ASC,
                t.type_name,
                a.account_name
            ;";
            $debts = $this->wpdb->get_results($sql, ARRAY_A);

            $budgets = array_merge($budgets, $debts);
            // foreach($debts AS $key => $debt){
            //     $budgets[count($budgets)+$key].push($debt);
            // }
        }
        if($percentage != null){
            foreach($budgets AS $key=>$budget){
                $budgets[$key]['monthly_actual'] = floatval($budget['annual']*$budget['forecast_percent']/100);
                $budgets[$key]['all_month'] = $budget['forecast_percent_m1']+$budget['forecast_percent_m2']+$budget['forecast_percent_m3']+$budget['forecast_percent_m4']+$budget['forecast_percent_m5']+$budget['forecast_percent_m6']+$budget['forecast_percent_m7']+$budget['forecast_percent_m8']+$budget['forecast_percent_m9']+$budget['forecast_percent_m10']+$budget['forecast_percent_m11']+$budget['forecast_percent_m12'];
                $budgets[$key]['annual'] = floatval($budgets[$key]['annual']);
            }
        }else{
            $total_budget_income = 0;
            foreach($budgets AS $key=>$budget){
                $total_budget_income += $budget['annual']*$budget['forecast_percent']/100;
                $budgets[$key]['annual'] = floatval($budgets[$key]['annual']);
                $budgets[$key]['monthly_actual'] = floatval($budgets[$key]['monthly_actual']);
            }
            foreach($budgets AS $key=>$budget){
                $budgets[$key]['total_budget_income'] = $total_budget_income;
                $budgets[$key]['all_month'] = $budget['forecast_percent_m1']+$budget['forecast_percent_m2']+$budget['forecast_percent_m3']+$budget['forecast_percent_m4']+$budget['forecast_percent_m5']+$budget['forecast_percent_m6']+$budget['forecast_percent_m7']+$budget['forecast_percent_m8']+$budget['forecast_percent_m9']+$budget['forecast_percent_m10']+$budget['forecast_percent_m11']+$budget['forecast_percent_m12'];
            }
        }
        return $budgets;
    }

    public function variables_budget_edit($budget_id, $budget_data)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $monthly_actual = $budget_data->monthly_actual;
        $budget_id = $budget_id;
        $year = $budget_data->year ?? 0;

        $sql = "UPDATE ${prefix}cogs_budgets b
        INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
        SET b.m{$budget_data->month}_actual = ${monthly_actual}
        WHERE b.user_id=${user_id} AND b.budget_id='${budget_id}' AND y.year_name='${year}'";

        return $this->wpdb->query($sql);
    }

    /**
     * Variables total budgets
     *
     * @param string $type
     * @param int $year
     * @param $month
     * @return void
     */
    public function variables_total_budgets($type, $year)
    {
        if (!in_array($type, ['Income', 'COGS', 'Expenditure', 'Debts'])) return [];
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $sql = "SELECT
            b.budget_id,
            SUM(b.m1_actual + b.m2_actual + b.m3_actual + b.m4_actual + b.m5_actual + b.m6_actual + b.m7_actual + b.m8_actual + b.m9_actual + b.m10_actual + b.m11_actual + b.m12_actual) monthly_actual,
            a.account_id,
            a.account_name,
            a.account_number,
            t.type_id,
            t.type_name,
            y.*,
            COUNT(a.account_id) entries,
            SUM(b.budget_amount) annual,
            SUM(b.budget_amount)/12 monthly_average,
            b.today_debt,
            b.monthly_due,
            /*b.yearly_payoff,*/
            b.interest_rate
        FROM ${prefix}cogs_budgets b
        INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
        INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
        INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
        WHERE
            b.user_id=${user_id} AND t.type_name='${type}' AND y.year_name='${year}'
        GROUP BY
            b.budget_id, a.account_id, YEAR(b.year_id)
        ORDER BY
            b.year_id ASC,
            t.type_name,
            a.account_name
        ;";
        $budgets = $this->wpdb->get_results($sql, ARRAY_A);
        if (in_array($type, ['Expenditure'])){
            $type = "Debts";
            $sql = "SELECT
                b.budget_id,
                SUM(b.m1_actual + b.m2_actual + b.m3_actual + b.m4_actual + b.m5_actual + b.m6_actual + b.m7_actual + b.m8_actual + b.m9_actual + b.m10_actual + b.m11_actual + b.m12_actual) monthly_actual,
                a.account_id,
                a.account_name,
                a.account_number,
                t.type_id,
                t.type_name,
                y.*,
                COUNT(a.account_id) entries,
                SUM(b.budget_amount) annual,
                SUM(b.budget_amount)/12 monthly_average,
                b.today_debt,
                b.monthly_due,
                /*b.yearly_payoff,*/
                b.interest_rate
            FROM ${prefix}cogs_budgets b
            INNER JOIN ${prefix}cogs_accounts a ON a.account_id = b.account_id
            INNER JOIN ${prefix}cogs_account_types t ON t.type_id = a.account_type_id
            INNER JOIN ${prefix}cogs_years y ON b.year_id = y.year_id
            WHERE
                b.user_id=${user_id} AND t.type_name='${type}' AND y.year_name='${year}'
            GROUP BY
                b.budget_id, a.account_id, YEAR(b.year_id)
            ORDER BY
                b.year_id ASC,
                t.type_name,
                a.account_name
            ;";
            $debts = $this->wpdb->get_results($sql, ARRAY_A);
  
            $budgets = array_merge($budgets, $debts);
        }
        $total_budget_income = 0;
        foreach($budgets AS $key=>$budget){
            for($m=1;$m<=12;$m++){
                $forecast_percentage = $budget['forecast_percent_m'.$m];
                $total_budget_income += $budget['annual']*$forecast_percentage/100;
            }
        }
        foreach($budgets AS $key=>$budget){
            $budgets[$key]['total_budget_income'] = $total_budget_income;
            $budgets[$key]['annual'] = floatval($budgets[$key]['annual']);
            $budgets[$key]['today_debt'] = floatval($budgets[$key]['today_debt']);
            $budgets[$key]['monthly_due'] = floatval($budgets[$key]['monthly_due']);
            $budgets[$key]['interest_rate'] = floatval($budgets[$key]['interest_rate']);
        }        
        return $budgets;
    }

    /**
     * Save total budget income
     *
     * @param int $year
     * @param float $amount
     * @return void
     */
    public function total_budget_income_save($year, $amount = 0.00)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $sql = "UPDATE ${prefix}cogs_years SET total_budget_income=${amount} WHERE year_name='${year}' AND user_id=${user_id};";

        return $this->wpdb->query($sql);
    }

    /**
     * Save forecast percent
     *
     * @param int $year
     * @param int $month
     * @param float $percent
     * @return void
     */
     public function forecast_percent_save($year, $month, $percent = 8.33)
     {
         $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

         $sql = "UPDATE ${prefix}cogs_years SET forecast_percent_m{$month}=${percent} WHERE year_name='${year}' AND user_id=${user_id};";

         return $this->wpdb->query($sql);
     }

     /**
     * Create new debts
     */
    public function debt_add($account_type_id, $data)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $year_name = $data->budget->year ?? date('Y');

        $year = $this->getYearByUser($user_id, $year_name);

        $account_id = $this->id();
        $account_number = $data->account_number ?? '';
        $account_name = $data->account_name ?? '';

        $sql = "INSERT INTO `${prefix}cogs_accounts` (account_id, user_id, account_type_id, account_number, account_name)
            VALUES ('${account_id}', ${user_id}, '${account_type_id}', '${account_number}', '${account_name}');";

        $this->wpdb->query($sql);

        $budget_id = $this->id();
        $year_id =  $year['year_id'];
        $today_debt = $data->today_debt;
        $monthly_due = $data->monthly_due;
        $budget_amount = $data->monthly_due*12;
        $interest_rate = $data->interest_rate;

        $sql = "INSERT INTO ${prefix}cogs_budgets (budget_id, user_id, account_id, year_id, today_debt, budget_amount, monthly_due, interest_rate) VALUES ('${budget_id}', ${user_id}, '${account_id}', '${year_id}', ${today_debt}, ${budget_amount}, ${monthly_due}, ${interest_rate});";

        return $this->wpdb->query($sql);
    }

    /**
     * Edit a debt
     *
     * @param string $budget_id
     * @param object $budget_data
     * @return void
     */
    public function debt_edit($budget_id, $data)
    {
        $prefix = $this->wpdb->prefix;
        $user_id = get_current_user_id();

        $today_debt = $data->today_debt;
        $monthly_due = $data->monthly_due;
        $budget_amount = $data->monthly_due*12;
        $interest_rate = $data->interest_rate;
        $budget_id = $budget_id;
        $year = $data->year ?? 0;

        $sql = "UPDATE ${prefix}cogs_budgets d
        INNER JOIN ${prefix}cogs_years y ON d.year_id = y.year_id
        SET today_debt = ${today_debt}, monthly_due = ${monthly_due}, budget_amount = ${budget_amount}, interest_rate = ${interest_rate}
        WHERE d.budget_id='${budget_id}' AND d.user_id=${user_id} AND y.year_name='${year}';";

        return $this->wpdb->query($sql);
    }

    /**
     * Get Year By User
     * 
     * 
     */
    public function getYearByUser($user_id, $year_name){
        $prefix = $this->wpdb->prefix;

        $sql = "SELECT * FROM ${prefix}cogs_years WHERE year_name = '${year_name}' AND user_id=${user_id};";
        $year = $this->wpdb->get_results($sql, ARRAY_A);
        
        if (!count($year)){
            $year_id = $this->id();
            $insert_sql = "INSERT INTO ${prefix}cogs_years (year_id, user_id, year_name, created_at) VALUES ('${year_id}', ${user_id}, '${year_name}', CURRENT_TIMESTAMP)";
            $this->wpdb->query($insert_sql);
            $year = $this->wpdb->get_results($sql, ARRAY_A);
        };
        return $year[0];
    }
}
