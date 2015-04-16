
export maninController = angular.module('app')
  .controller('mainCntrl', ['$scope', function ($scope) {

    $scope.master = {}; // MASTER DATA STORED BY YEAR

    $scope.selected_year = 2005;
    $scope.years = d3.range(2005, 1865, -5);

    $scope.filters = {};
    $scope.hasFilters = false;

    $scope.tooltip = {};

    // FORMATS USED IN TOOLTIP TEMPLATE IN HTML
    $scope.pFormat = d3.format(".1%");  // PERCENT FORMAT
    $scope.qFormat = d3.format(",.0f"); // COMMAS FOR LARGE NUMBERS

    $scope.updateTooltip = function (data) {
      $scope.tooltip = data;
      $scope.$apply();
    }

    $scope.addFilter = function (name) {
      $scope.hasFilters = true;
      $scope.filters[name] = {
        name: name,
        hide: true
      };
      $scope.$apply();
    };

    $scope.update = function () {
      var data = $scope.master[$scope.selected_year];

      if (data && $scope.hasFilters) {
        $scope.drawChords(data.filter(function (d) {
          var fl = $scope.filters;
          var v1 = d.importer1, v2 = d.importer2;

          if ((fl[v1] && fl[v1].hide) || (fl[v2] && fl[v2].hide)) {
            return false;
          }
          return true;
        }));
      } else if (data) {
        $scope.drawChords(data);
      }
    };

    // IMPORT THE CSV DATA
    d3.csv('../data/trade.csv', function (err, data) {

      data.forEach(function (d) {
        d.year  = +d.year;
        d.flow1 = +d.flow1;
        d.flow2 = +d.flow2;

        if (!$scope.master[d.year]) {
          $scope.master[d.year] = []; // STORED BY YEAR
        }
        $scope.master[d.year].push(d);
      })
      $scope.update();
    });

    $scope.$watch('selected_year', $scope.update);
    $scope.$watch('filters', $scope.update, true);
  }
]);