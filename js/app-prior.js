var myApp = angular.module("myApp", ["ui.router"]);

myApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/forecast");

    $stateProvider.state({
        name: "login",
        url: "/login",
        templateUrl: "templates/login.html",
        controller: "LoginController",
    });

    $stateProvider.state({
        name: "forecast",
        url: "/forecast",
        templateUrl: "templates/forecast.html",
        controller: "ForecastController",
    });

    $stateProvider.state({
        name: "variables",
        url: "/variables",
        templateUrl: "templates/variables.html",
        controller: "VariablesController",
    });

    $stateProvider.state({
        name: "breakeven",
        url: "/breakeven",
        templateUrl: "templates/breakeven.html",
        controller: "BreakevenController",
    });

    $stateProvider.state({
        name: "admin",
        url: "/admin",
        templateUrl: "templates/admin.html",
        controller: "AdminController",
    });

});

myApp.service("APIService", ["$http", function ($http) {
    var api = "./api";
    return {
        "configs": function (data) {
            return $http({
                method: "POST",
                url: api + "/configs.php",
                data: data
            });
        },
        "incomes": function (data) {
            return $http({
                method: "POST",
                url: api + "/incomes.php",
                data: data
            });
        },
        "cogs": function (data) {
            return $http({
                method: "POST",
                url: api + "/cogs.php",
                data: data
            });
        },
        "expenditures": function (data) {
            return $http({
                method: "POST",
                url: api + "/expenditures.php",
                data: data
            });
        },
        "budget_remove": function (data) {
            return $http({
                method: "POST",
                url: api + "/budget-remove.php",
                data: data
            });
        },
        "budget_add": function (data) {
            return $http({
                method: "POST",
                url: api + "/budget-add.php",
                data: data
            });
        },
        "budget_edit": function (data) {
            return $http({
                method: "POST",
                url: api + "/budget-edit.php",
                data: data
            });
        },
        "sequence": function (data) {
            return $http({
                method: "POST",
                url: api + "/sequence.php",
                data: data
            });
        },
    };
}]);

myApp.controller("LoginController", ["$scope", "$state", "$stateParams", "APIService", function ($scope, $state, $stateParams, APIService) {
    $scope.configs = {};
    APIService.configs()
        .then(function (response) {
            $scope.configs = response.data;
        }, function (error) {});
}]);

myApp.controller("ForecastController", ["$scope", "$state", "$stateParams", "APIService", function ($scope, $state, $stateParams, APIService) {
    var init = function () {
        $scope.edits = false;

        $scope.configs = {};
        APIService.configs()
            .then(function (response) {
                $scope.configs = response.data;
            }, function (error) {});

        $scope.incomes = {};
        $scope.income_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.incomes()
            .then(function (response) {
                $scope.incomes = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.incomes.length; ++i) {
                    total += $scope.incomes[i].annual;
                }

                var percentage = 0.00;
                for (var i = 0; i < $scope.incomes.length; ++i) {
                    $scope.incomes[i].percentage = 100 * $scope.incomes[i].annual / total;
                    percentage += $scope.incomes[i].percentage;
                }

                $scope.income_summary.total = total;
                $scope.income_summary.percentage = percentage;
            }, function (error) {});


        $scope.cogs = {};
        $scope.cogs_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.cogs()
            .then(function (response) {
                $scope.cogs = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.cogs.length; ++i) {
                    total += $scope.cogs[i].annual;
                }

                var percentage = 0.00;
                var percentageTI = 0.00;
                for (var i = 0; i < $scope.cogs.length; ++i) {
                    $scope.cogs[i].percentage = 100 * $scope.cogs[i].annual / total;
                    percentage += $scope.cogs[i].percentage;

                    $scope.cogs[i].percentageTI = 100 * $scope.cogs[i].annual / $scope.income_summary.total;
                    percentageTI += $scope.cogs[i].percentageTI;
                }

                $scope.cogs_summary.total = total;
                $scope.cogs_summary.percentage = percentage;
                $scope.cogs_summary.percentageTI = percentageTI;
            }, function (error) {});


        $scope.expenditures = {};
        $scope.expenditures_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.expenditures()
            .then(function (response) {
                $scope.expenditures = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.expenditures.length; ++i) {
                    total += $scope.expenditures[i].annual;
                }

                var percentage = 0.00;
                var percentageTI = 0.00;
                for (var i = 0; i < $scope.expenditures.length; ++i) {
                    $scope.expenditures[i].percentage = 100 * $scope.expenditures[i].annual / total;
                    percentage += $scope.expenditures[i].percentage;

                    $scope.expenditures[i].percentageTI = 100 * $scope.expenditures[i].annual / $scope.income_summary.total;
                    percentageTI += $scope.expenditures[i].percentageTI;
                }

                $scope.expenditures_summary.total = total;
                $scope.expenditures_summary.percentage = percentage;
                $scope.expenditures_summary.percentageTI = percentageTI;
            }, function (error) {});
    };

    $scope.recalculate = function () {
        init();
    };

    init();

    $scope.remove = function (heading) {
        if (window.confirm("Remove data?")) {
            APIService.budget_remove(heading)
                .then(function (response) {
                    init();
                }, function (error) {
                    alert("Error removing a budget headline"); // +error.data);
                });
        }
    };

    $scope.edits = false;
    $scope.edit = function (heading) {
        //if(window.confirm("Edit amount?"))
        {
            APIService.budget_edit(heading)
                .then(function (response) {
                    //init();
                }, function (error) {
                    alert("Error editing"); // +error.data);
                });
        }
    };


    $scope.sequence = function (account_type_id, who) {
        APIService.sequence({
                'type_id': account_type_id
            })
            .then(function (response) {
                who.account_number = response.data;
            }, function (error) {
                alert("Error retrieving sequence number"); // +error.data);
            });
    };


    $scope.add = {
        "budget": function (account_type_id, heading) {
            //alert(type+", "+heading.account_name);
            var data = {
                "account_type_id": account_type_id,
                "heading": heading,
            };
            APIService.budget_add(data)
                .then(function (response) {
                    init();

                    // clear user input
                    $scope.income = {};
                    $scope.cog = {};
                    $scope.expense = {};

                    //alert(type+" SUBMITTING, "+heading.account_name);
                    //alert("Submit successful");
                }, function (error) {
                    alert("Error adding account name or budget headline."); // +error.data);
                });
        },
    };
}]);

myApp.controller("VariablesController", ["$scope", "$state", "$stateParams", "APIService", function ($scope, $state, $stateParams, APIService) {
    $scope.data = [{
        "id": "1",
        "name": "One"
    }, {
        "id": "2",
        "name": "Two"
    }];
    var init = function () {
        $scope.edits = false;

        $scope.configs = {};
        APIService.configs()
            .then(function (response) {
                $scope.configs = response.data;
            }, function (error) {});

        $scope.incomes = {};
        $scope.income_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.incomes()
            .then(function (response) {
                $scope.incomes = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.incomes.length; ++i) {
                    total += $scope.incomes[i].annual;
                }

                var percentage = 0.00;
                for (var i = 0; i < $scope.incomes.length; ++i) {
                    $scope.incomes[i].percentage = 100 * $scope.incomes[i].annual / total;
                    percentage += $scope.incomes[i].percentage;
                }

                $scope.income_summary.total = total;
                $scope.income_summary.percentage = percentage;
            }, function (error) {});


        $scope.cogs = {};
        $scope.cogs_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.cogs()
            .then(function (response) {
                $scope.cogs = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.cogs.length; ++i) {
                    total += $scope.cogs[i].annual;
                }

                var percentage = 0.00;
                var percentageTI = 0.00;
                for (var i = 0; i < $scope.cogs.length; ++i) {
                    $scope.cogs[i].percentage = 100 * $scope.cogs[i].annual / total;
                    percentage += $scope.cogs[i].percentage;

                    $scope.cogs[i].percentageTI = 100 * $scope.cogs[i].annual / $scope.income_summary.total;
                    percentageTI += $scope.cogs[i].percentageTI;
                }

                $scope.cogs_summary.total = total;
                $scope.cogs_summary.percentage = percentage;
                $scope.cogs_summary.percentageTI = percentageTI;
            }, function (error) {});


        $scope.expenditures = {};
        $scope.expenditures_summary = {
            "total": 0.00,
            "percentage": 0.00
        };
        APIService.expenditures()
            .then(function (response) {
                $scope.expenditures = response.data;

                var total = 0.00;
                for (var i = 0; i < $scope.expenditures.length; ++i) {
                    total += $scope.expenditures[i].annual;
                }

                var percentage = 0.00;
                var percentageTI = 0.00;
                for (var i = 0; i < $scope.expenditures.length; ++i) {
                    $scope.expenditures[i].percentage = 100 * $scope.expenditures[i].annual / total;
                    percentage += $scope.expenditures[i].percentage;

                    $scope.expenditures[i].percentageTI = 100 * $scope.expenditures[i].annual / $scope.income_summary.total;
                    percentageTI += $scope.expenditures[i].percentageTI;
                }

                $scope.expenditures_summary.total = total;
                $scope.expenditures_summary.percentage = percentage;
                $scope.expenditures_summary.percentageTI = percentageTI;
            }, function (error) {});
    };

    $scope.recalculate = function () {
        init();
    };

    init();

    $scope.remove = function (heading) {
        if (window.confirm("Remove data?")) {
            APIService.budget_remove(heading)
                .then(function (response) {
                    init();
                }, function (error) {
                    alert("Error removing a budget headline"); // +error.data);
                });
        }
    };

    $scope.edits = false;
    $scope.edit = function (heading) {
        //if(window.confirm("Edit amount?"))
        {
            APIService.budget_edit(heading)
                .then(function (response) {
                    //init();
                }, function (error) {
                    alert("Error editing"); // +error.data);
                });
        }
    };


    $scope.sequence = function (account_type_id, who) {
        APIService.sequence({
                'type_id': account_type_id
            })
            .then(function (response) {
                who.account_number = response.data;
            }, function (error) {
                alert("Error retrieving sequence number"); // +error.data);
            });
    };


    $scope.add = {
        "budget": function (account_type_id, heading) {
            //alert(type+", "+heading.account_name);
            var data = {
                "account_type_id": account_type_id,
                "heading": heading,
            };
            APIService.budget_add(data)
                .then(function (response) {
                    init();

                    // clear user input
                    $scope.income = {};
                    $scope.cog = {};
                    $scope.expense = {};

                    //alert(type+" SUBMITTING, "+heading.account_name);
                    //alert("Submit successful");
                }, function (error) {
                    alert("Error adding account name or budget headline."); // +error.data);
                });
        },
    };
}]);

myApp.controller("BreakevenController", ["$scope", "$state", "$stateParams", "APIService", function ($scope, $state, $stateParams, APIService) {}]);

myApp.controller("AdminController", ["$scope", "$state", "$stateParams", "APIService", function ($scope, $state, $stateParams, APIService) {}]);