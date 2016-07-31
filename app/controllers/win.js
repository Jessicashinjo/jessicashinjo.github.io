grimm
  .controller('WinCtrl', function ($scope, $location) {
    $scope.go = function ( path ) {
      $location.path( path );
    };
  });
