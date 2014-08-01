(function (module) {
    mifosX.controllers = _.extend(module, {
        LoansDashboard: function (scope, resourceFactory, localStorageService, $rootScope, location) {
            scope.tenantNames=[];
            scope.currentTenant="default";
        	scope.recent = [];
            scope.recent = localStorageService.get('Location');
            scope.recentEight = [];
            scope.frequent = [];
            scope.recentArray = [];
            scope.uniqueArray = [];
            scope.searchParams = [];
            scope.recents = [];
            scope.dashModel = 'dashboard';

            function getUserDetails(userName){

                resourceFactory.testResource.get( function (data) {
                    scope.userdata=cleanResponse(data);
                    for(var user in scope.userdata.users ){

                        if(scope.userdata.users[user].userName==userName){

                            for(var tenant in scope.userdata.users[user].tenants){
                                scope.tenantNames.push(scope.userdata.users[user].tenants[tenant].tenant);
                            }
                            setPAR1PieData();
                            setPAR30PieData();

                        }

                    }
                });
            }

            getUserDetails(resourceFactory.getUserName());
            function formatDate(Date){
                formatedDate="";
                var year=Date.getFullYear();
                var month=Date.getMonth()+1;
                var day=Date.getDate();
                formatedDate=year+"-"+month+"-"+day;
                return formatedDate;
            };
            scope.switch = function() {
	        	location.path('/richdashboard');
			}
            
            scope.$on("UserAuthenticationSuccessEvent", function (event, data) {
	            if (sessionManager.get(data)) {
	                scope.currentSession = sessionManager.get(data);
	            }
            });
            
            //to retrieve last 8 recent activities
            for (var rev = scope.recent.length - 1; rev > 0; rev--) {
                scope.recentArray.push(scope.recent[rev]);
            }
            scope.unique = function (array) {
                array.forEach(function (value) {
                    if (scope.uniqueArray.indexOf(value) === -1) {
                        scope.uniqueArray.push(value);
                    }
                });
            }
            scope.unique(scope.recentArray);
            //recent activities retrieved

            //retrieve last 8 recent activities
            for (var l = 0; l < 11; l++) {
                if (scope.uniqueArray[l]) {
                    if (scope.uniqueArray[l] != '/') {
                        if (scope.uniqueArray[l] != '/home') {
                            scope.recents.push(scope.uniqueArray[l]);
                        }
                    }
                }
            }
            // 8 recent activities retrieved

            //count duplicates
            var i = scope.recent.length;
            var obj = {};
            while (i) {
                obj[scope.recent[--i]] = (obj[scope.recent[i]] || 0) + 1;
            }
            //count ends here

            //to sort based on counts
            var sortable = [];
            for (var i in obj) {
                sortable.push([i, obj[i]]);
            }
            sortable.sort(function (a, b) {
                return a[1] - b[1]
            });
            //sort end here

            //to retrieve the locations from sorted array
            var sortedArray = [];
            for (var key in sortable) {
                sortedArray.push(sortable[key][0]);
            }
            //retrieving ends here

            //retrieve last 8 frequent actions
            for (var freq = sortedArray.length - 1; freq > sortedArray.length - 11; freq--) {
                if (sortedArray[freq]) {
                    if (sortedArray[freq] != '/') {
                        if (sortedArray[freq] != '/home') {
                            scope.frequent.push(sortedArray[freq]);
                        }
                    }
                }
            }

            scope.client = [];
            scope.offices = [];
            scope.cOfficeName = 'Head Office';
            scope.dOfficeName = 'Head Office';
            scope.bOfficeName = 'Head Office';
            scope.chartType = 'Days';
            scope.collectionPieData = [];
            scope.dashModel = 'rich-dashboard';
            scope.switch = function() {
	        	location.path('/home');
			}

            scope.xFunction = function () {
                return function (d) {
                    return d.key;
                };
            };
            scope.yFunction = function () {
                return function (d) {
                    return d.y;
                };
            };
            var colorArray = ['#0f82f5', '#008000', '#808080', '#000000', '#FFE6E6'];
            var colorArrayPie = ['#008000', '#ff4500'];
            scope.colorFunction = function () {
                return function (d, i) {
                    return colorArray[i];
                };
            };
            scope.colorFunctionPie = function () {
                return function (d, i) {
                    return colorArrayPie[i];
                };
            };

            /*scope.setLoansData=function(tenantName){
                resourceFactory.loansResource.get({reportDate:'2014-07-08',reportName:'Outstanding loans',tenantIdentifier:tenantName},function (data){
                    scope.loans=data;
                    scope.loansValues=[];
                    for(var i in scope.loans.dataPointValues){
                        scope.loansValues[i]=[scope.loans.dataPointValues[i].dataPointValues[1],scope.loans.dataPointValues[i].dataPointValues[0]];
                    }
                    //console.log(tenantName);
                    scope.loansData=[{"key":data.tenantIdentifier,"values":scope.loansValues}];

                });
            }*/


            /////////////////////////////////////////////////////////////////////////////line chart for loans/////////////////////////
            function cleanResponse(resp) {
                return JSON.parse(angular.toJson(resp));
            };
            //scope.totalLoanAmountData=[];
            scope.setTotalLoanAmount=function(tenantName) {
                var tempLoanData=[];
                resourceFactory.loanAmountByDateResource.get({reportStartDate: '2014-06-06', reportEndDate: '2014-07-22', reportName: 'Outstanding loans', tenantIdentifier: tenantName}, function (data) {
                    scope.loans = cleanResponse(data);
                    scope.loanValues=[];
                    for (var i in scope.loans) {
                        var totalLoanInOneRecord=0;
                        for(var j in scope.loans[i].dataPointValues){
                             totalLoanInOneRecord+=parseInt(scope.loans[i].dataPointValues[j].dataPointValues[0]);
                        }
                        //console.log(totalLoanInOneRecord);
                        scope.loanValues[i] = [1,totalLoanInOneRecord, scope.loans[i].dateCaptured];
                    }
                    tempLoanData.push({
                        "key": scope.loans[0].tenantIdentifier,
                        "values": scope.loanValues
                    });
                    scope.totalLoanAmountData=tempLoanData.map(function (series) {
                        series.values = series.values.map(function (d) {
                            return {x: d[0], y: d[1], label1: d[2] }
                        });
                        return series;
                    });

                    redrawTotalLoanAmountChart();
                });

            };




            ////this is for line chart

            function redrawTotalLoanAmountChart() {
                nv.addGraph(function() {
                    var chart = nv.models.lineChart()
                        .useInteractiveGuideline(true);
                    chart.width(700);
                    chart.margin({left:100});
                    chart.color(['#2ca02c', 'darkred']);
                    chart.x(function(d,i) { return i });
                    chart.xAxis
                        .axisLabel('Date')
                        .tickFormat(function(d) {
                            var label = scope.totalLoanAmountData[0].values[d].label1;
                            return label;
                        });
                    chart.yAxis
                        .axisLabel('Loan Value')
                        .tickFormat(function(d){
                            return d3.format(',f')(d);
                        });
                    d3.select('#totalLoanAmountchart svg')
                        .datum(scope.totalLoanAmountData)
                        .transition().duration(500)
                        .call(chart);;
                    nv.utils.windowResize(chart.update);;
                    return chart;
                });
            };


            /////////////////////////////////////////////////////////////////////////////end of line chart for loans//////////////////


            /////////////////////////////////////////////////////////////////PAR1 pie chart////////////////////////////
            function redrawPAR1PieChart() {
                nv.addGraph(function () {
                    var chart = nv.models.pieChart()
                        .x(function (d) {
                            return d.label
                        })
                        .y(function (d) {
                            return d.value
                        })
                        .showLabels(true);
                    chart.margin({top: 200});


                    d3.select("#PAR1piechart svg")
                        .datum(scope.PAR1pieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }
            scope.PAR1pieData=[];
            function setPAR1PieData(){
                for(var i in scope.tenantNames){
                    resourceFactory.PAR1Resource.get({ reportDate:'2014-06-06', reportName: 'PAR1', tenantIdentifier: scope.tenantNames[i]}, function (data) {

                        scope.PAR1pieData.push({
                            "label": data.tenantIdentifier,
                            "value" : data.dataPointValues[0].dataPointValues[0]
                        });

                        redrawPAR1PieChart();
                    });
                }
            }


            /////////////////////////////////////////////////////////end of PAR1 pie chart////////////////////////////////

            /////////////////////////////////////////////////////////////////PAR30 pie chart////////////////////////////
            function redrawPAR30PieChart() {
                nv.addGraph(function () {
                    var chart = nv.models.pieChart()
                        .x(function (d) {
                            return d.label
                        })
                        .y(function (d) {
                            return d.value
                        })
                        .showLabels(true);
                    chart.margin({top: 200});


                    d3.select("#PAR30piechart svg")
                        .datum(scope.PAR30pieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }
            scope.PAR30pieData=[];
            function setPAR30PieData(){
                for(var i in scope.tenantNames){
                    resourceFactory.PAR30Resource.get({ reportDate:'2014-06-06', reportName: 'PAR30', tenantIdentifier: scope.tenantNames[i]}, function (data) {

                        scope.PAR30pieData.push({
                            "label": data.tenantIdentifier,
                            "value" : data.dataPointValues[0].dataPointValues[0]
                        });

                        redrawPAR30PieChart();
                    });
                }
            }


            /////////////////////////////////////////////////////////end of PAR30 pie chart////////////////////////////////

            /////////////////////////////////////////////////////////////////////////////loans amount bar chart///////////////////////
            function redrawLoansAmountChart() {
                nv.addGraph(function () {
                    var chart = nv.models.discreteBarChart()
                            .x(function (d) {
                                return d.label
                            })
                            .y(function (d) {
                                return d.value
                            })
                            .staggerLabels(true)
                            .tooltips(true)
                            .showValues(true)
                            .transitionDuration(350)
                        ;

                    d3.select('#loansbarchart svg')
                        .datum(scope.loansData)
                        .call(chart);

                    nv.utils.windowResize(chart.update);

                    return chart;
                });
            }

            scope.setLoansData=function(tenantName){
                resourceFactory.loansResource.get({reportDate:'2014-07-08',reportName:'Outstanding loans',tenantIdentifier:tenantName},function (data){
                    scope.loans=data;
                    scope.loansValues=[];
                    for(var i in scope.loans.dataPointValues){
                        scope.loansValues.push({"label":scope.loans.dataPointValues[i].dataPointValues[1],"value":scope.loans.dataPointValues[i].dataPointValues[0]});
                    }
                    scope.loansData=[{"key":data.tenantIdentifier,"values":scope.loansValues}];
                    redrawLoansAmountChart();
                });
            }

            /////////////////////////////////////////////////////////////////////////////end of loans amount bar chart////////////////
            scope.setTotalLoanAmount("default");
            scope.setLoansData("default");
            setPAR1PieData();
            setPAR30PieData();
        }
    });
    mifosX.ng.application.controller('LoansDashboard', ['$scope', 'ResourceFactory', 'localStorageService', '$rootScope', '$location', mifosX.controllers.LoansDashboard]).run(function ($log) {
        $log.info("LoansDashboard initialized");
    });
}(mifosX.controllers || {}));