(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsDashboard: function (scope, resourceFactory, localStorageService, $rootScope, location) {
            scope.tenantNames=[];
            scope.currentTenant="default";
            scope.currentTenantSavingsbyOffice="default";
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
                            setSavingsPieData();
                            scope.setTotalSavingsAmount();

                        }

                    }
                });
            }

            getUserDetails(resourceFactory.getUserName());
            
            scope.switch = function() {
	        	location.path('/richdashboard');
			}
            function formatDate(Date){
                formatedDate="";
                var year=Date.getFullYear();
                var month=Date.getMonth()+1;
                var day=Date.getDate();
                formatedDate=year+"-"+month+"-"+day;
                return formatedDate;
            };
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




            /////////////////////////////////////////////////////////////////////////////line chart for savnings/////////////////////////
            function cleanResponse(resp) {
                return JSON.parse(angular.toJson(resp));
            };
            scope.setTotalSavingsAmount=function() {
                scope.totalSavingsAmountData=[];
                var today = new Date();
                var dayBeforeTwoMonths=new Date();
                dayBeforeTwoMonths.setDate(today.getDate() - 60);
                for(var s in scope.tenantNames){

                resourceFactory.savingsAmountByDateResource.get({reportStartDate: formatDate(dayBeforeTwoMonths), reportEndDate: formatDate(today), reportName: 'Savings amount', tenantIdentifier: scope.tenantNames[s]}, function (data) {
                    scope.savings = cleanResponse(data);
                    var savingsValues=[];
                    for (var i in scope.savings) {
                        var totalSavingsInOneRecord=0;
                        for(var j in scope.savings[i].dataPointValues){
                            totalSavingsInOneRecord+=parseInt(scope.savings[i].dataPointValues[j].dataPointValues[0]);
                        }
                        savingsValues.push({x:1,y:totalSavingsInOneRecord, label1:scope.savings[i].dateCaptured});
                    }
                    scope.totalSavingsAmountData.push({
                        "key": scope.savings[0].tenantIdentifier,
                        "values": savingsValues
                    });
                    redrawTotalSavingsAmountChart();

                });
      }
            };




            ////this is for line chart

            function redrawTotalSavingsAmountChart() {
                nv.addGraph(function() {
                    var chart = nv.models.lineChart()
                        .useInteractiveGuideline(true);
                    chart.width(700);
                    chart.margin({left:100});
                    chart.color(['#2ca02c','darkred', 'darkblue']);
                    chart.x(function(d,i) { return i });
                    chart.xAxis
                        .axisLabel('Date')
                        .tickFormat(function(d) {
                            var label = scope.totalSavingsAmountData[0].values[d].label1;
                            return label;
                        });
                    chart.yAxis
                        .axisLabel('Savings Value')
                        .tickFormat(function(d){
                            return d3.format(',f')(d);
                        });
                    d3.select('#totalSavingsAmountchart svg')
                        .datum(scope.totalSavingsAmountData)
                        .transition().duration(500)
                        .call(chart);;
                    nv.utils.windowResize(chart.update);;
                    return chart;
                });
            };


            /////////////////////////////////////////////////////////////////////////////end of line chart for savings//////////////////

            /////////////////////////////////////////////////////////////////////////////savings amount bar chart///////////////////////
            function redrawSavingsAmountChart() {
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
                            .transitionDuration(1000)
                        ;
                    chart.yAxis
                        .axisLabel('Savings Amount');
                    chart.xAxis
                        .axisLabel('Currency');
                    chart.margin({bottom:75,left:100});

                    d3.select('#savingsbarchart svg')
                        .datum(scope.savingsData)
                        .call(chart);

                    nv.utils.windowResize(chart.update);

                    return chart;
                });
            }

            scope.setSavingsData=function(tenantName){
                resourceFactory.savingsAmountResource.get({reportName:'Savings amount',tenantIdentifier:tenantName},function (data){
                    scope.savings=data;
                    scope.savingsValues=[];
                    for(var i in scope.savings.dataPointValues){
                        scope.savingsValues.push({"label":scope.savings.dataPointValues[i].dataPointValues[1],"value":scope.savings.dataPointValues[i].dataPointValues[0]});
                    }
                    console.log(tenantName);
                    scope.savingsData=[{"key":data.tenantIdentifier,"values":scope.savingsValues}];
                    redrawSavingsAmountChart();
                });
            }

            /////////////////////////////////////////////////////////////////////////////end of savings amount bar chart////////////////


            ///////////////////////////////////////////////////////////////// savings pie chart////////////////////////////
            function redrawSavingsPieChart() {
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


                    d3.select("#savingspiechart svg")
                        .datum(scope.savingspieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }
            scope.savingspieData=[];
            function setSavingsPieData(){
                for(var i in scope.tenantNames){
                    resourceFactory.savingsAmountResource.get({  reportName: 'Savings amount', tenantIdentifier: scope.tenantNames[i]}, function (data) {
                        scope.savings = cleanResponse(data);
                        var total=0;
                        for(var t in scope.savings.dataPointValues){
                            total+=parseInt(scope.savings.dataPointValues[t].dataPointValues[0]);
                        }

                        scope.savingspieData.push({
                            "label": scope.savings.tenantIdentifier,
                            "value" : total
                        });

                        redrawSavingsPieChart();
                    });
                }
            }


            ////////////////////////////////////////////////end of savings pie chart/////////////////////////////////////////////


            scope.setSavingsBallance=function(tenant){
                scope.savingsBallances=[];
                resourceFactory.savingsBallanceResource.get({  reportName: 'Savings by office', tenantIdentifier:tenant}, function (data) {
                  scope.tempSavingsBallance=cleanResponse(data);
                    for(var i in scope.tempSavingsBallance.dataPointValues){
                        scope.savingsBallances.push({
                            branch:scope.tempSavingsBallance.dataPointValues[i].dataPointValues[0],
                            value:scope.tempSavingsBallance.dataPointValues[i].dataPointValues[1]
                        })
                    }
                });
            }


            scope.setSavingsData(scope.currentTenant);
            setSavingsPieData();


        }
    });
    mifosX.ng.application.controller('SavingsDashboard', ['$scope', 'ResourceFactory', 'localStorageService', '$rootScope', '$location', mifosX.controllers.SavingsDashboard]).run(function ($log) {
        $log.info("SavingsDashboard initialized");
    });
}(mifosX.controllers || {}));