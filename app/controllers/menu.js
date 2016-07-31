grimm
  .controller('MenuCtrl', function ($scope, $location, AuthFactory) {

  $scope.go = function ( path ) {
    $location.path( path );
  };

  $scope.logout_user = () => {
    AuthFactory.logout();
    $location.path('/login');
  };

})
