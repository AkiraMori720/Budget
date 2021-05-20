var myApp = angular.module('myApp', ['ui.router']);

myApp.constant( 'WP', window.WP );

myApp.value('currentYear', {
	value: new Date().getFullYear(),
});

myApp.value('yearOptions', {
	value: Array.from(Array(21), (x, index) => 2020 + index),
});

myApp.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider.state('login', {
		url: '/login',
		templateUrl: WP.plugin_url + '/templates/login.html',
		controller: 'LoginController',
	});

	$stateProvider.state('admin', {
		url: '/admin',
		templateUrl: WP.plugin_url + '/templates/admin.html',
		controller: 'AdminController',
	});

	$stateProvider.state('forecast', {
		url: '/forecast/:year?',
		templateUrl: WP.plugin_url + '/templates/forecast.html',
		controller: 'ForecastController',
	});

	$stateProvider.state('forecastMonthly', {
		url: '/forecast-monthly/:year/:month?',
		templateUrl: WP.plugin_url + '/templates/forecast_monthly.html',
		controller: 'ForecastMonthlyController',
	});

	$stateProvider.state('variables', {
		url: '/variables/:year/:month?',
		templateUrl: WP.plugin_url + '/templates/variables.html',
		controller: 'VariablesController',
	});

	$stateProvider.state('breakeven', {
		url: '/breakeven/:year?',
		templateUrl: WP.plugin_url + '/templates/breakeven.html',
		controller: 'BreakevenController',
	});

	$stateProvider.state('report', {
		url: '/report/:year?',
		templateUrl: WP.plugin_url + '/templates/report.html',
		controller: 'ReportController',
	});

	$stateProvider.state('debtWorkBook', {
		url: '/debt-work-book/:year?',
		templateUrl: WP.plugin_url + '/templates/debt.html',
		controller: 'DebtController',
	});

	$urlRouterProvider.otherwise('/forecast/');
});

myApp.service('APIService', [
	'$http',
	function ($http) {
		var api = WP.plugin_url + '/api/v2';
		return {
			configs: function (data) {
				return $http({
					method: 'POST',
					url: api + '/configs.php',
					data: data,
				});
			},
			incomes: function (data) {
				return $http({
					method: 'POST',
					url: api + '/incomes.php',
					data: data,
				});
			},
			cogs: function (data) {
				return $http({
					method: 'POST',
					url: api + '/cogs.php',
					data: data,
				});
			},
			expenditures: function (data) {
				return $http({
					method: 'POST',
					url: api + '/expenditures.php',
					data: data,
				});
			},
			budget_add: function (data) {
				return $http({
					method: 'POST',
					url: api + '/budgets/add.php',
					data: data,
				});
			},
			budget_remove: function (data) {
				return $http({
					method: 'POST',
					url: api + '/budgets/remove.php',
					data: data,
				});
			},
			budget_edit: function (data) {
				return $http({
					method: 'POST',
					url: api + '/budgets/edit.php',
					data: data,
				});
			},
			sequence: function (data) {
				return $http({
					method: 'POST',
					url: api + '/sequence.php',
					data: data,
				});
			},

			// Variables page data
			variables_incomes: function (data) {
				return $http({
					method: 'POST',
					url: api + '/variables/incomes.php',
					data: data,
				});
			},
			variables_cogs: function (data) {
				return $http({
					method: 'POST',
					url: api + '/variables/cogs.php',
					data: data,
				});
			},
			variables_expenditures: function (data) {
				return $http({
					method: 'POST',
					url: api + '/variables/expenditures.php',
					data: data,
				});
			},

			monthly_actual_edit: function (data) {
				return $http({
					method: 'POST',
					url: api + '/variables/budgets/edit.php',
					data: data,
				});
			},
			total_budget_income_save: function (data) {
				return $http({
					method: 'POST',
					url: api + '/years/total-budget-income-save.php',
					data: data,
				});
			},
			forecast_month_percent_save: function (data) {
				return $http({
					method: 'POST',
					url: api + '/years/forecast-month-percent-save.php',
					data: data,
				});
			},
			updateConfigs: function(data) {
				return $http({
					method: 'POST',
					url: api + '/configs_update.php',
					data: data,
				});
			},
			// Manage Debt
			debts: function (data) {
				return $http({
					method: 'POST',
					url: api + '/debts.php',
					data: data,
				});
			},
			debt_add: function (data) {
				return $http({
					method: 'POST',
					url: api + '/debt/add.php',
					data: data,
				});
			},
			debt_edit: function (data) {
				return $http({
					method: 'POST',
					url: api + '/debt/edit.php',
					data: data,
				});
			},
 
		};
	},
]);

myApp.controller('LoginController', [
	'$scope',
	'$state',
	'$stateParams',
	'APIService',
	function ($scope, $state, $stateParams, APIService) {
		$scope.configs = {};
		APIService.configs().then(
			function (response) {
				$scope.configs = response.data;
			},
			function (error) {}
		);
	},
]);

myApp.controller('AdminController', [
	'$scope',
	'$state',
	'$stateParams',
	'APIService',
	function ($scope, $state, $stateParams, APIService) {},
]);

myApp.controller('DebtController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.yearOptions = yearOptions.value || [];
			$scope.year = $state.params.year || currentYear.value;
			$scope.edits = false;
			$scope.plugin_url = WP.plugin_url;

			if (!$state.params.year) {
				$state.go(
					'forecast',
					{ year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				currentYear.value = $state.params.year;
				$state.go('debtWorkBook', { year: $scope.year }, { notify: true });
			};

			$scope.debts = {};
			$scope.total = {
				payoff: 0,
				balance: 0,
				projected_interest: 0,
			};
			// Get Company Config
			$scope.configs = {};
			APIService.configs().then(
				function (response) {
					$scope.configs = response.data;
				},
				function (error) {}
			);
			// End
			APIService.debts({ year: $scope.year }).then(
				function (response) {
					$scope.debts = response.data;
					let payoff = 0;
					let balance = 0;
					let projected_interest = 0;
					angular.forEach(
						$scope.debts,
						function (value, key) {
							value.sn = key+1;
							payoff += value.monthly_actual;
							value.yearly_payoff = value.annual;
							value.balance = value.yearly_payoff-value.monthly_actual;
							balance += value.balance;
							value.projected_interest = (value.yearly_payoff*value.interest_rate)/100;
							projected_interest += value.projected_interest;
						},
						[]
					);
					$scope.total.payoff = payoff;
					$scope.total.balance = balance;
					$scope.total.projected_interest = projected_interest;
				},
				function (error) {
					console.error(error);
				}
			);
		};

		$scope.recalculate = function () {
			init();
		};

		sortData = function(data, order, field) {
			if(field === "account_name"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => a[field].toLowerCase() < b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'ASC';
				}
			}else if(field === "account_number"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => parseInt(b[field].replace(" ", ""))-parseInt(a[field].replace(" ", "")));
					$scope.sortOrder = 'ASC';
				}
			}else{
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => b[field]-a[field]);
					$scope.sortOrder = 'ASC';
				}
			}
			return data;
		}

		$scope.sortOrder = 'ASC';
		$scope.sortField = 'account_name';
		$scope.sort = function (type, field) {
			let data = [...$scope[type]];
			$scope[type] = sortData(data, $scope.sortOrder, field);
			$scope.sortField = field;
		};

		init();

		$scope.add = {
			debt: function (account_type_id, data) {
				var data = {
					account_type_id: account_type_id,
					debt: { year: $scope.year, ...data },
				};

				APIService.debt_add(data).then(
					function (response) {
						init();

						// clear user input
						$scope.debt = {};
					},
					function (error) {
						alert('Error adding account name or budget headline.');
						console.error(error);
					}
				);
			},
		};

		$scope.remove = function (data) {
			if (window.confirm('Are you sure to remove data this record?')) {
				APIService.budget_remove({ budget_id: data?.budget_id }).then(
					function (response) {
						init();
					},
					function (error) {
						alert('Error removing a budget headline');
						console.error(error);
					}
				);
			}
		};

		$scope.edits = false;
		$scope.edit = function (data) {
			APIService.debt_edit({
				budget_id: data.budget_id,
				debt_data: {
					year: $scope.year,
					today_debt: data.today_debt,
					monthly_due: data.monthly_due,
					// yearly_payoff: data.yearly_payoff,
					interest_rate: data.interest_rate,
				},
			}).then(
				function (response) {
					init();
					$scope.edits = true;
				},
				function (error) {
					alert('Error editing');
					console.error(error);
				}
			);
		};

		$scope.sequence = function (account_type_id, who) {
			APIService.sequence({
				type_id: account_type_id,
			}).then(
				function (response) {
					who.account_number = response.data;
				},
				function (error) {
					alert('Error retrieving sequence number'); // +error.data);
				}
			);
		};

		$scope.editCompany = function(configs) {
			APIService.updateConfigs({
				configs,
			});
		}
	},
]);

myApp.controller('ForecastController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.activeUrl = 'forecast';
			$scope.yearOptions = yearOptions.value || [];
			$scope.year = $state.params.year || currentYear.value;
			$scope.edits = false;
			$scope.total_budget_income = 0;
			$scope.plugin_url = WP.plugin_url;

			if (!$state.params.year) {
				$state.go(
					'forecast',
					{ year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				currentYear.value = $state.params.year;
				$state.go('forecast', { year: $scope.year }, { notify: true });
			};

			$scope.incomes = {};
			$scope.income_summary = {
				total: 0.0,
				percentage: 0.0,
			};
			// Get Company Config
			$scope.configs = {};
			APIService.configs().then(
				function (response) {
					$scope.configs = response.data;
				},
				function (error) {}
			);
			// End
			APIService.incomes({ year: $scope.year }).then(
				function (response) {
					$scope.incomes = response.data;

					// TODO: Get data from year
					$scope.total_budget_income =
						response.data[0]?.total_budget_income ?? 0;

					var total = 0.0;
					angular.forEach(
						$scope.incomes,
						function (value, key) {
							value.sn = key+1;
							total += value.annual * 1;
						},
						[]
					);
					var percentage = 0.0;
					angular.forEach(
						$scope.incomes,
						function (value, key) {
							value.percentage = (100 * value.annual) / total;
							percentage += value.percentage * 1;
						},
						[]
					);

					$scope.income_summary.total = total;
					$scope.income_summary.percentage = percentage;

					$scope.cogs = {};
					$scope.cogs_summary = {
						total: 0.0,
						percentage: 0.0,
						percentageTI: 0.0,
					};
					APIService.cogs({ year: $scope.year }).then(
						function (response) {
							$scope.cogs = response.data;

							var total = 0.0;
							angular.forEach(
								$scope.cogs,
								function (value, key) {
									total += value.annual * 1;
								},
								[]
							);

							var percentage = 0.0;
							var percentageTI = 0.0; // of Total Income
							angular.forEach(
								$scope.cogs,
								function (value, key) {
									value.percentage =
										(100 * value.annual) / total;
									percentage += value.percentage * 1;

									value.percentageTI =
										(100 * value.annual) /
										$scope.income_summary.total;
									percentageTI += value.percentageTI * 1;
								},
								[]
							);

							$scope.cogs_summary.total = total;
							$scope.cogs_summary.percentage = percentage;
							$scope.cogs_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);

					$scope.expenditures = {};
					$scope.expenditures_summary = {
						total: 0.0,
						percentage: 0.0,
						percentageTI: 0.0,
					};

					APIService.expenditures({ year: $scope.year }).then(
						function (response) {
							$scope.expenditures = response.data;

							var total = 0.0;
							angular.forEach(
								$scope.expenditures,
								function (value, key) {
									total += value.annual * 1;
								},
								[]
							);

							var percentage = 0.0;
							var percentageTI = 0.0; // of Total Income
							angular.forEach(
								$scope.expenditures,
								function (value, key) {
									value.percentage =
										(100 * value.annual) / total;
									percentage += value.percentage * 1;

									value.percentageTI =
										(100 * value.annual) /
										$scope.income_summary.total;
									percentageTI += value.percentageTI * 1;
								},
								[]
							);

							$scope.expenditures_summary.total = total;
							$scope.expenditures_summary.percentage = percentage;
							$scope.expenditures_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);
				},
				function (error) {
					console.error(error);
				}
			);
		};

		$scope.recalculate = function () {
			init();
		};

		sortData = function(data, order, field) {
			if(field === "account_name"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => a[field].toLowerCase() < b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'ASC';
				}
			}else if(field === "account_number"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => parseInt(b[field].replace(" ", ""))-parseInt(a[field].replace(" ", "")));
					$scope.sortOrder = 'ASC';
				}
			}else{
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => b[field]-a[field]);
					$scope.sortOrder = 'ASC';
				}
			}
			return data;
		}

		$scope.sortOrder = 'ASC';
		$scope.sortField = 'account_name';
		$scope.sort = function (type, field) {
			let data = [...$scope[type]];
			$scope[type] = sortData(data, $scope.sortOrder, field);
			$scope.sortField = field;
		};

		init();

		$scope.add = {
			budget: function (account_type_id, budget_data) {
				var data = {
					account_type_id: account_type_id,
					budget: { year: $scope.year, ...budget_data },
				};

				APIService.budget_add(data).then(
					function (response) {
						init();

						// clear user input
						$scope.income = {};
						$scope.cog = {};
						$scope.expense = {};
					},
					function (error) {
						alert('Error adding account name or budget headline.');
						console.error(error);
					}
				);
			},
		};

		$scope.remove = function (budget) {
			if (window.confirm('Remove data?')) {
				APIService.budget_remove({ budget_id: budget?.budget_id }).then(
					function (response) {
						init();
					},
					function (error) {
						alert('Error removing a budget headline');
						console.error(error);
					}
				);
			}
		};

		$scope.edits = false;
		$scope.edit = function (budget) {
			APIService.budget_edit({
				budget_id: budget.budget_id,
				budget_data: {
					year: $scope.year,
					budget_amount: budget.annual,
				},
			}).then(
				function (response) {
					init();
					$scope.edits = true;
				},
				function (error) {
					alert('Error editing');
					console.error(error);
				}
			);
		};

		$scope.sequence = function (account_type_id, who) {
			APIService.sequence({
				type_id: account_type_id,
			}).then(
				function (response) {
					who.account_number = response.data;
				},
				function (error) {
					alert('Error retrieving sequence number'); // +error.data);
				}
			);
		};

		$scope.editCompany = function(configs) {
			APIService.updateConfigs({
				configs: $scope.configs,
			});
		}
	},
]);

// ForecastMonthly Controller Created By Vineet
myApp.controller('ForecastMonthlyController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.activeUrl = 'forecast';
			$scope.year = $state.params.year || currentYear.value;
			$scope.month = $state.params.month || new Date().getMonth() + 1;
			$scope.yearOptions = yearOptions.value || [];
			$scope.total_budget_income = 0;
			$scope.edits = false;
			$scope.percentage = 8.33;
			$scope.all_month = 100;
			$scope.plugin_url = WP.plugin_url;

			if (!$state.params.year || !$state.params.month) {
				$state.go(
					'forecast-monthly',
					{ month: $scope.month, year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				$state.go(
					'forecast-monthly',
					{ month: $scope.month, year: $scope.year },
					{ notify: true }
				);
			};

			$scope.incomes = {};
			$scope.income_summary = {
				total: 0.0,
				percentage: 0.0,
			};

			// Get Company Config
			$scope.configs = {};
			APIService.configs().then(
				function (response) {
					$scope.configs = response.data;
				},
				function (error) {}
			);
			// End

			APIService.variables_incomes({
				year: $scope.year,
				month: $scope.month,
				percentage: $scope.percentage,
			}).then(
				function (response) {
					// TODO: Get data from year
					$scope.total_budget_income =
						response.data[0]?.total_budget_income ?? 0;
					$scope.percentage =
						response.data[0]?.forecast_percent ?? 8.33;
					$scope.all_month = response.data[0]?.all_month ?? 100;
					$scope.incomes = response.data;

					var total = 0.0;
					for (var i = 0; i < $scope.incomes.length; ++i) {
						total += $scope.incomes[i].annual * 1;
					}
					var percentage = 0.0;
					for (var i = 0; i < $scope.incomes.length; ++i) {
						$scope.incomes[i].sn = i+1;
						$scope.incomes[i].percentage =
							(100 * $scope.incomes[i].annual) / total;
						percentage += $scope.incomes[i].percentage * 1;
					}

					$scope.income_summary.total = total;
					$scope.income_summary.percentage = percentage;

					$scope.cogs = [];
					$scope.cogs_summary = {
						total: 0.0,
						percentage: 0.0,
					};
					APIService.variables_cogs({
						year: $scope.year,
						month: $scope.month,
						percentage: $scope.percentage,
					}).then(
						function (response) {
							$scope.cogs = response.data;

							var total = 0.0;
							for (var i = 0; i < $scope.cogs.length; ++i) {
								total += $scope.cogs[i].annual * 1;
							}

							var percentage = 0.0;
							var percentageTI = 0.0;

							for (var i = 0; i < $scope.cogs.length; ++i) {
								$scope.cogs[i].sn = i+1;
								$scope.cogs[i].percentage =
									(100 * ($scope.cogs[i].annual * 1)) /
									(total * 1);
								percentage += $scope.cogs[i].percentage * 1;

								$scope.cogs[i].percentageTI =
									(100 * ($scope.cogs[i].annual * 1)) /
									($scope.income_summary.total * 1);
								percentageTI += $scope.cogs[i].percentageTI * 1;
							}

							$scope.cogs_summary.total = total;
							$scope.cogs_summary.percentage = percentage;
							$scope.cogs_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);

					$scope.expenditures = {};
					$scope.expenditures_summary = {
						total: 0.0,
						percentage: 0.0,
					};
					APIService.variables_expenditures({
						year: $scope.year,
						month: $scope.month,
						percentage: $scope.percentage,
					}).then(
						function (response) {
							$scope.expenditures = response.data;

							var total = 0.0;
							for (
								var i = 0;
								i < $scope.expenditures.length;
								++i
							) {
								total += $scope.expenditures[i].annual * 1;
							}

							var percentage = 0.0;
							var percentageTI = 0.0;
							for (
								var i = 0;
								i < $scope.expenditures.length;
								++i
							) {
								$scope.expenditures[i].sn = i+1;
								$scope.expenditures[i].percentage =
									(100 * $scope.expenditures[i].annual) /
									total;
								percentage +=
									$scope.expenditures[i].percentage * 1;

								$scope.expenditures[i].percentageTI =
									(100 * $scope.expenditures[i].annual) /
									$scope.income_summary.total;
								percentageTI +=
									$scope.expenditures[i].percentageTI;
							}

							$scope.expenditures_summary.total = total;
							$scope.expenditures_summary.percentage = percentage;
							$scope.expenditures_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);
				},
				function (error) {
					console.log(error);
				}
			);
		};

		$scope.getTotalDiff = function () {
			var total = 0;
			for (var i = 0; i < $scope.incomes.length; i++) {
				total +=
					$scope.incomes[i].monthly_actual -
					($scope.incomes[i].annual /
						12 /
						($scope.income_summary.total / 12)) *
						$scope.total_budget_income;
			}
			return total;
		};

		$scope.getTotalMonthlyActual = function () {
			var total = 0;
			if($scope.incomes){
				for (var i = 0; i < $scope.incomes.length; i++) {
					total += $scope.incomes[i].monthly_actual * 1;
				}
			}
			return total;
		};

		$scope.getCogsTotalMonthlyActual = function () {
			var total = 0;
			if($scope.cogs){
				for (var i = 0; i < $scope.cogs.length; i++) {
					total += $scope.cogs[i].monthly_actual * 1;
				}
			}
			return total;
		};

		$scope.getExpTotalMonthlyActual = function () {
			var total = 0;
			if($scope.expenditures){
				for (var i = 0; i < $scope.expenditures.length; i++) {
					total += $scope.expenditures[i].monthly_actual * 1;
				}
			}
			return total;
		};

		sortData = function(data, order, field) {
			if(field === "account_name"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => a[field].toLowerCase() < b[field].toLowerCase() ? 1 : -1);
					$scope.sortOrder = 'ASC';
				}
			}else if(field === "account_number"){
				if($scope.sortField !== field){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => parseInt(a[field].replace(" ", ""))-parseInt(b[field].replace(" ", "")));
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => parseInt(b[field].replace(" ", ""))-parseInt(a[field].replace(" ", "")));
					$scope.sortOrder = 'ASC';
				}
			}else{
				if($scope.sortField !== field){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else if($scope.sortOrder === "ASC"){
					data = data.sort((a, b) => a[field]-b[field]);
					$scope.sortOrder = 'DESC';
				}else {
					data = data.sort((a, b) => b[field]-a[field]);
					$scope.sortOrder = 'ASC';
				}
			}
			return data;
		}

		$scope.sortOrder = 'ASC';
		$scope.sortField = 'account_name';
		$scope.sort = function (type, field) {
			let data = [...$scope[type]];
			$scope[type] = sortData(data, $scope.sortOrder, field);
			$scope.sortField = field;
		};
		
		$scope.recalculate = function () {
			init();
		};

		init();

		$scope.edits = false;
		$scope.edit = function (budget) {
			APIService.monthly_actual_edit({
				budget_id: budget.budget_id,
				budget_data: {
					year: $scope.year,
					month: $scope.month,
					monthly_actual: budget.monthly_actual,
				},
			}).then(
				function (response) {
					//init();
				},
				function (error) {
					// alert('Error editing');
					console.log(error);
				}
			);
		};

		$scope.changePercentage = function (percentage) {
			APIService.forecast_month_percent_save({
				year: $scope.year,
				month: $scope.month,
				percentage: percentage,
			}).then(
				function (response) {
					console.log('Data saved');
				},
				function (error) {
					alert('Error editing' + error);
				}
			);
		};
		$scope.editCompany = function(configs) {
			APIService.updateConfigs({
				configs,
			});
		}
	},
]);
// End

myApp.controller('VariablesController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.activeUrl = 'variance';
			$scope.year = $state.params.year || currentYear.value;
			$scope.month = $state.params.month || new Date().getMonth() + 1;
			$scope.yearOptions = yearOptions.value || [];
			$scope.total_budget_income = 0;
			$scope.edits = false;
			$scope.plugin_url = WP.plugin_url;

			if (!$state.params.year || !$state.params.month) {
				$state.go(
					'variables',
					{ month: $scope.month, year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				$state.go(
					'variables',
					{ month: $scope.month, year: $scope.year },
					{ notify: true }
				);
			};

			$scope.incomes = {};
			$scope.income_summary = {
				total: 0.0,
				percentage: 0.0,
			};

			// Get Company Config
			$scope.configs = {};
			APIService.configs().then(
				function (response) {
					$scope.configs = response.data;
				},
				function (error) {}
			);
			// End

			APIService.variables_incomes({
				year: $scope.year,
				month: $scope.month,
			}).then(
				function (response) {
					// TODO: Get data from year
					$scope.total_budget_income =
						response.data[0]?.total_budget_income ?? 0;

					$scope.incomes = response.data;

					var total = 0.0;
					for (var i = 0; i < $scope.incomes.length; ++i) {
						total += $scope.incomes[i].annual * 1;
					}
					var percentage = 0.0;
					for (var i = 0; i < $scope.incomes.length; ++i) {
						$scope.incomes[i].percentage =
							(100 * $scope.incomes[i].annual) / total;
						percentage += $scope.incomes[i].percentage * 1;
						$scope.incomes[i].monthly_actual = $scope.incomes[i].monthly_actual === 0 ? '' : $scope.incomes[i].monthly_actual;
					}

					$scope.income_summary.total = total;
					$scope.income_summary.percentage = percentage;

					$scope.cogs = [];
					$scope.cogs_summary = {
						total: 0.0,
						percentage: 0.0,
					};
					APIService.variables_cogs({
						year: $scope.year,
						month: $scope.month,
					}).then(
						function (response) {
							$scope.cogs = response.data;

							var total = 0.0;
							for (var i = 0; i < $scope.cogs.length; ++i) {
								total += $scope.cogs[i].annual * 1;
							}

							var percentage = 0.0;
							var percentageTI = 0.0;

							for (var i = 0; i < $scope.cogs.length; ++i) {
								$scope.cogs[i].monthly_actual = $scope.cogs[i].monthly_actual === 0 ? '' : $scope.cogs[i].monthly_actual;
								$scope.cogs[i].percentage =
									(100 * ($scope.cogs[i].annual * 1)) /
									(total * 1);
								percentage += $scope.cogs[i].percentage * 1;

								$scope.cogs[i].percentageTI =
									(100 * ($scope.cogs[i].annual * 1)) /
									($scope.income_summary.total * 1);
								percentageTI += $scope.cogs[i].percentageTI * 1;
							}

							$scope.cogs_summary.total = total;
							$scope.cogs_summary.percentage = percentage;
							$scope.cogs_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);

					$scope.expenditures = [];
					$scope.expenditures_summary = {
						total: 0.0,
						percentage: 0.0,
					};
					APIService.variables_expenditures({
						year: $scope.year,
						month: $scope.month,
					}).then(
						function (response) {
							$scope.expenditures = response.data;

							var total = 0.0;
							for (var i = 0; i < $scope.expenditures.length; ++i) {
								total += $scope.expenditures[i].annual * 1;
							}

							var percentage = 0.0;
							var percentageTI = 0.0;
							for (var i = 0; i < $scope.expenditures.length; ++i) {
								$scope.expenditures[i].percentage = (100 * $scope.expenditures[i].annual) / total;
								percentage += $scope.expenditures[i].percentage * 1;
								$scope.expenditures[i].percentageTI = (100 * $scope.expenditures[i].annual) / $scope.income_summary.total;
								percentageTI += $scope.expenditures[i].percentageTI;
								$scope.expenditures[i].monthly_actual = $scope.expenditures[i].monthly_actual === 0 ? '' : $scope.expenditures[i].monthly_actual;
							}

							$scope.expenditures_summary.total = total;
							$scope.expenditures_summary.percentage = percentage;
							$scope.expenditures_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);
				},
				function (error) {
					console.log(error);
				}
			);
		};

		$scope.getTotalDiff = function () {
			var total = 0;
			for (var i = 0; i < $scope.incomes.length; i++) {
				total +=
					$scope.incomes[i].monthly_actual -
					($scope.incomes[i].annual /
						12 /
						($scope.income_summary.total / 12)) *
						$scope.total_budget_income;
			}
			return total;
		};

		$scope.getTotalMonthlyActual = function () {
			var total = 0;
			if($scope.incomes){
				for (var i = 0; i < $scope.incomes.length; i++) {
					total += $scope.incomes[i].monthly_actual * 1;
				}
			}
			return total;
		};

		$scope.getCogsTotalMonthlyActual = function () {
			var total = 0;
			if($scope.cogs){
				for (var i = 0; i < $scope.cogs.length; i++) {
					total += $scope.cogs[i].monthly_actual * 1;
				}
			}
			return total;
		};

		$scope.getExpTotalMonthlyActual = function () {
			var total = 0;
			if($scope.expenditures){
				for (var i = 0; i < $scope.expenditures.length; i++) {
					total += $scope.expenditures[i].monthly_actual * 1;
				}
			}
			return total;
		};

		$scope.recalculate = function () {
			init();
		};

		init();

		$scope.edits = false;
		$scope.edit = function (budget) {
			APIService.monthly_actual_edit({
				budget_id: budget.budget_id,
				budget_data: {
					year: $scope.year,
					month: $scope.month,
					monthly_actual: budget.monthly_actual,
				},
			}).then(
				function (response) {
					//init();
				},
				function (error) {
					// alert('Error editing');
					console.log(error);
				}
			);
		};

		$scope.total_budget_income_save = function (amount) {
			APIService.total_budget_income_save({
				year: $scope.year,
				amount: amount,
			}).then(
				function (response) {
					console.log('Data saved');
				},
				function (error) {
					alert('Error editing' + error);
				}
			);
		};
		$scope.editCompany = function(configs) {
			APIService.updateConfigs({
				configs,
			});
		}
	},
]);

myApp.controller('BreakevenController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.yearOptions = yearOptions.value || [];
			$scope.year = $state.params.year || currentYear;

			$scope.total_revenue = 0.0;
			$scope.total_expenses = 0.0;
			$scope.total_cogs = 0.0;
			$scope.plugin_url = WP.plugin_url;

			if (!$state.params.year) {
				$state.go(
					'breakeven',
					{ year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				currentYear.value = $state.params.year;
				$state.go(
					'breakeven',
					{ year: $scope.year },
					{ notify: true }
				);
			};

			// Get Company Config
			$scope.configs = {};
			APIService.configs().then(
				function (response) {
					$scope.configs = response.data;
				},
				function (error) {}
			);
			// End

			APIService.incomes({ year: $scope.year }).then(
				function (response) {
					$scope.incomes = response.data;
					var total = 0.0;
					for (var i = 0; i < $scope.incomes.length; ++i) {
						total += $scope.incomes[i].annual * 1;
					}
					$scope.total_revenue = total;
				},
				function (error) {
					console.log(error);
				}
			);

			APIService.expenditures({ year: $scope.year }).then(
				function (response) {
					$scope.expenditures = response.data;
					var total = 0.0;
					for (var i = 0; i < $scope.expenditures.length; ++i) {
						total += $scope.expenditures[i].annual * 1;
					}
					$scope.total_expenses = total;
				},
				function (error) {
					console.log(error);
				}
			);

			APIService.cogs({ year: $scope.year }).then(
				function (response) {
					$scope.cogs = response.data;
					var total = 0.0;
					for (var i = 0; i < $scope.cogs.length; ++i) {
						total += $scope.cogs[i].annual * 1;
					}
					$scope.total_cogs = total;
				},
				function (error) {
					console.log(error);
				}
			);

			$scope.break_even = function () {
				return (
					$scope.total_expenses /
					(1 - $scope.total_cogs / $scope.total_revenue)
				);
			};
			$scope.per_day = function () {
				return $scope.break_even() / 260;
			};
			$scope.overhead = function () {
				return ($scope.total_expenses / $scope.total_cogs) * 100;
			};
			$scope.total_gross_sales = function () {
				return $scope.total_revenue;
			};
			$scope.gross_profit = function () {
				return $scope.total_revenue - $scope.total_cogs;
			};
			$scope.t_cogs = function () {
				return $scope.total_gross_sales() - $scope.gross_profit();
			};
			$scope.total_var_cogs_ex = function () {
				return $scope.t_cogs();
			};
			$scope.operating_expenses = function () {
				return $scope.total_expenses;
			};
			$scope.operating_pl = function () {
				return $scope.gross_profit() - $scope.operating_expenses();
			};
		};
		init();
		$scope.editCompany = function(configs) {
			APIService.updateConfigs({
				configs,
			});
		}
	},
]);

myApp.controller('ReportController', [
	'$scope',
	'$state',
	'APIService',
	'currentYear',
	'yearOptions',
	function ($scope, $state, APIService, currentYear, yearOptions) {
		var init = function () {
			$scope.yearOptions = yearOptions.value || [];
			$scope.year = $state.params.year || currentYear;

			if (!$state.params.year) {
				$state.go(
					'report',
					{ year: currentYear.value },
					{ notify: false }
				);
			}

			$scope.setYear = function () {
				currentYear.value = $state.params.year;
				$state.go('report', { year: $scope.year }, { notify: false });
			};

			$scope.incomes = {};
			$scope.income_summary = {
				total: 0.0,
				percentage: 0.0,
			};

			APIService.incomes({ year: $scope.year }).then(
				function (response) {
					$scope.incomes = response.data;

					var total = 0.0;
					angular.forEach(
						$scope.incomes,
						function (value, key) {
							total += value.annual;
						},
						[]
					);

					var percentage = 0.0;
					angular.forEach(
						$scope.incomes,
						function (value, key) {
							value.percentage = (100 * value.annual) / total;
							percentage += value.percentage;
						},
						[]
					);

					$scope.income_summary.total = total;
					$scope.income_summary.percentage = percentage;

					$scope.cogs = {};
					$scope.cogs_summary = {
						total: 0.0,
						percentage: 0.0,
						percentageTI: 0.0,
					};
					APIService.cogs({ year: $scope.year }).then(
						function (response) {
							$scope.cogs = response.data;

							var total = 0.0;
							angular.forEach(
								$scope.cogs,
								function (value, key) {
									total += value.annual;
								},
								[]
							);

							var percentage = 0.0;
							var percentageTI = 0.0; // of Total Income
							angular.forEach(
								$scope.cogs,
								function (value, key) {
									value.percentage =
										(100 * value.annual) / total;
									percentage += value.percentage;

									value.percentageTI =
										(100 * value.annual) /
										$scope.income_summary.total;
									percentageTI += value.percentageTI;
								},
								[]
							);

							$scope.cogs_summary.total = total;
							$scope.cogs_summary.percentage = percentage;
							$scope.cogs_summary.percentageTI = percentageTI;
						},
						function (error) {}
					);

					$scope.expenditures = {};
					$scope.expenditures_summary = {
						total: 0.0,
						percentage: 0.0,
						percentageTI: 0.0,
					};
					APIService.expenditures({ year: $scope.year }).then(
						function (response) {
							$scope.expenditures = response.data;

							var total = 0.0;
							angular.forEach(
								$scope.expenditures,
								function (value, key) {
									total += value.annual;
								},
								[]
							);

							var percentage = 0.0;
							var percentageTI = 0.0; // of Total Income
							angular.forEach(
								$scope.expenditures,
								function (value, key) {
									value.percentage =
										(100 * value.annual) / total;
									percentage += value.percentage;

									value.percentageTI =
										(100 * value.annual) /
										$scope.income_summary.total;
									percentageTI += value.percentageTI;
								},
								[]
							);

							$scope.expenditures_summary.total = total;
							$scope.expenditures_summary.percentage = percentage;
							$scope.expenditures_summary.percentageTI = percentageTI;
						},
						function (error) {
							console.error(error);
						}
					);
				},
				function (error) {
					console.error(error);
				}
			);
		};

		init();
	},
]);
