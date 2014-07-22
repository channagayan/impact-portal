(function (module) {
    mifosX.controllers = _.extend(module, {
        RichDashboard: function (scope, resourceFactory, localStorageService, $rootScope, location) {
        	
        	scope.recent = [];
            scope.recent = localStorageService.get('Location');
            scope.recentEight = [];
            scope.frequent = [];
            scope.recentArray = [];
            scope.uniqueArray = [];
            scope.searchParams = [];
            scope.recents = [];
            scope.dashModel = 'dashboard';
            
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
            scope.data22= [
                {
                    "key" : "Quantity" ,
                    "values" : [ [ 1 , 1, 'EGG1'] , [ 2 , 2, 'EGG2'] , [ 3 , 3, 'EGG3'] , [ 4 , 10, 'EGG4'] ,[ 5 , 10, 'EGG5'],[ 1 , 1, 'EGG6'] , [ 2 , 2, 'EGG7'] , [ 3 , 3, 'EGG8'] , [ 4 , 10, 'EGG9'] ]
                },
                {
                    "key" : "Quantity2" ,
                    "values" : [ [ 1 , 5, 'EGG1'] , [ 2 , 6, 'EGG2'] , [ 3 , 2, 'EGG3'] , [ 4 , 8, 'EGG4'] ,[ 5 , 9, 'EGG5'],[ 1 , 5, 'EGG6'] , [ 2 ,6, 'EGG7'] , [ 3 , 2, 'EGG8'] , [ 4 , 9, 'EGG9'] ]
                }
            ].map(function(series) {
                    series.values = series.values.map(function(d) { return {x: d[0], y: d[1], label1: d[2] } });
                    return series;
                });
            scope.clientsPieData=[
                { key: "One", y: 5 },
                { key: "Two", y: 2 },
                { key: "Three", y: 9 },
                { key: "Four", y: 7 },
                { key: "Five", y: 4 },
                { key: "Six", y: 3 },
                { key: "Seven", y: 9 }
            ];

            ////this is for line chart
            nv.addGraph(function() {
                var chart = nv.models.lineChart()
                        .useInteractiveGuideline(true)
                    ;
                
                chart.width(700);
                chart.margin({left:100});
                chart.color(['#2ca02c', 'darkred']);
                chart.x(function(d,i) { return i })
                ;
                chart.xAxis
                    .axisLabel('X axis')
                    .tickFormat(function(d) {
                        var label = scope.data22[0].values[d].label1;
                        return label;
                    })
                ;
                chart.yAxis
                    .axisLabel('Y axis')
                    .tickFormat(function(d){
                        return d3.format(',f')(d);
                    })
                ;

                d3.select('#chart svg')
                    .datum(scope.data22)
                    .transition().duration(500)
                    .call(chart)
                ;

                nv.utils.windowResize(chart.update);

                return chart;
            });



            ////////end of line chart/////////////
//console.log(scope.noOfClientsChartData);


        }
    });
    mifosX.ng.application.controller('RichDashboard', ['$scope', 'ResourceFactory', 'localStorageService', '$rootScope', '$location', mifosX.controllers.RichDashboard]).run(function ($log) {
        $log.info("RichDashboard initialized");
    });
}(mifosX.controllers || {}));