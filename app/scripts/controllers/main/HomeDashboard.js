(function (module) {
    mifosX.controllers = _.extend(module, {
        HomeDashboard: function (scope, resourceFactory, localStorageService, $rootScope, location) {


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

                                //redrawPieChart();
                            }

                            setClientsPieData();
                            scope.setActiveClientsPieData(scope.currentTenant);
                            setSavingsPieData();
                            setLoansPieData();




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
            var colorArrayPie = ['#008000', '#ff4500','#0f82f5', '#008000', '#808080', '#000000', '#FFE6E6'];
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

            /////////////////////////////////////////////////////////////////pie chart////////////////////////////
            function redrawPieChart() {
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


                    d3.select("#clientspiechart svg")
                        .datum(scope.clientspieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }
            scope.clientspieData=[];
            function setClientsPieData(){
                // console.log(scope.tenantNames);
                for(var i in scope.tenantNames){
                    resourceFactory.noOfClientsResource.get({ reportDate:'2014-06-06', reportName: 'Number of Clients', tenantIdentifier: scope.tenantNames[i]}, function (data) {

                        scope.clientspieData.push({
                            "label": data.tenantIdentifier,
                            "value" : data.dataPointValues[0].dataPointValues[0]
                        });

                        redrawPieChart();
                    });
                }
            }


            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            function cleanResponse(resp) {
                return JSON.parse(angular.toJson(resp));
            };

            scope.getNoOfClients=function(tenantName) {
                var data23= [];


                resourceFactory.noOfClientsByDateResource.get({reportStartDate: '2014-06-06', reportEndDate: '2014-07-22', reportName: 'Number of Clients', tenantIdentifier: tenantName}, function (data) {
                    scope.noOfClients = cleanResponse(data);
                    scope.clientsValues = [];
                    for (var i in scope.noOfClients) {
                        scope.clientsValues[i] = [1, parseInt(scope.noOfClients[i].dataPointValues[0].dataPointValues[0]), scope.noOfClients[i].dateCaptured];
                    }
                    data23.push({
                        "key": scope.noOfClients[0].tenantIdentifier,
                        "values": scope.clientsValues
                    });

                    scope.data23 = data23.map(function (series) {
                        series.values = series.values.map(function (d) {
                            return {x: d[0], y: d[1], label1: d[2] }
                        });
                        return series;
                    });
                    redrawClientslineChart();


                });

            };


            ////this is for line chart

            function redrawClientslineChart() {
                nv.addGraph(function() {
                    var chart = nv.models.lineChart()
                        .useInteractiveGuideline(true);
                    chart.width(700);
                    chart.margin({left:50});
                    chart.color(['#2ca02c', 'darkred']);
                    chart.x(function(d,i) { return i });
                    chart.xAxis
                        .axisLabel('X axis')
                        .tickFormat(function(d) {
                            var label = scope.data23[0].values[d].label1;
                            return label;
                        });
                    chart.yAxis
                        .axisLabel('Y axis')
                        .tickFormat(function(d){
                            return d3.format(',f')(d);
                        });
                    d3.select('#chart svg')
                        .datum(scope.data23)
                        .transition().duration(500)
                        .call(chart);;
                    nv.utils.windowResize(chart.update);;
                    return chart;
                });
            };


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
                    resourceFactory.savingsAmountResource.get({ reportDate:'2014-06-06', reportName: 'Savings amount', tenantIdentifier: scope.tenantNames[i]}, function (data) {
                        scope.savings = cleanResponse(data);
                        var total=0;
                        for(var t in scope.savings.dataPointValues){
                            total+=parseInt(scope.savings.dataPointValues[t].dataPointValues[0]);
                        }

                        scope.savingspieData.push({
                            "label": scope.savings.tenantIdentifier,
                            "value" : total
                        });
                        //console.log(scope.clientspieData);
                        redrawSavingsPieChart();
                    });
                }
            }


            ////////////////////////////////////////////////end of savings pie chart/////////////////////////////////////////////


            ///////////////////////////////////////////////////////////////// loans pie chart////////////////////////////
            function redrawLoansPieChart() {
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


                    d3.select("#loanspiechart svg")
                        .datum(scope.loanspieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }
            scope.loanspieData=[];
            function setLoansPieData(){
                for(var i in scope.tenantNames){
                    resourceFactory.savingsAmountResource.get({ reportDate:'2014-06-06', reportName: 'Outstanding loans', tenantIdentifier: scope.tenantNames[i]}, function (data) {
                        scope.loans = cleanResponse(data);
                        var total=0;
                        for(var t in scope.loans.dataPointValues){
                            total+=parseInt(scope.loans.dataPointValues[t].dataPointValues[0]);
                        }

                        scope.loanspieData.push({
                            "label": scope.loans.tenantIdentifier,
                            "value" : total
                        });
                        //console.log(scope.clientspieData);
                        redrawLoansPieChart();
                    });
                }
            }


            ////////////////////////////////////////////////end of loans pie chart/////////////////////////////////////////////

/////////////////////////////////////////////////////////////////Active clients pie chart////////////////////////////
            function redrawActivePieChart() {
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


                    d3.select("#activeclientspiechart svg")
                        .datum(scope.activeClientspieData)
                        .transition().duration(350)
                        .call(chart);

                    return chart;
                });
            }

            scope.setActiveClientsPieData=function (tenant){
                scope.activeClientspieData=[];
                resourceFactory.noOfClientsResource.get({ reportDate:'2014-08-01', reportName: 'Active clients', tenantIdentifier: tenant}, function (data) {

                    scope.activeClients=cleanResponse(data);

                    var clientType=["Active","Non Funded","Prospects"]

                    scope.activeClientspieData.push({
                        "label": clientType[0],
                        "value": scope.activeClients.dataPointValues[0].dataPointValues[1]
                    });
                    scope.activeClientspieData.push({
                        "label": clientType[1],
                        "value": scope.activeClients.dataPointValues[0].dataPointValues[2]
                    });
                    scope.activeClientspieData.push({
                        "label": clientType[2],
                        "value": scope.activeClients.dataPointValues[0].dataPointValues[3]
                    });

                    redrawActivePieChart();
                });

            }


            ///////////////////////////////////////////////////////////////////////////////////////////////////////



            //redrawClientslineChart();
            //console.log(scope.data23);
            //setClientsPieData();
            scope.getNoOfClients("default");
            //redrawClientslineChart();
            /* var d = new Date();
             d.setDate(d.getDate() - 1);
             console.log(formatDate(d));
             console.log(d.getMonth());*/

        }
    });
    mifosX.ng.application.controller('HomeDashboard', ['$scope', 'ResourceFactory', 'localStorageService', '$rootScope', '$location', mifosX.controllers.HomeDashboard]).run(function ($log) {

        $log.info("HomeDashboard initialized");
    });
}(mifosX.controllers || {}));