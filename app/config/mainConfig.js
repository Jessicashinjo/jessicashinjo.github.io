grimm
  .config(($routeProvider) => {
    $routeProvider
    .when('/login', {
      templateUrl: 'app/partials/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'login'
    })
    .when('/menu', {
      templateUrl: 'app/partials/menu.html',
      controller: 'MenuCtrl',
      controllerAs: 'menu'
    })
    .when('/grimm', {
      templateUrl: 'app/partials/grimm.html',
      controller: 'GameCtrl',
      controllerAs: 'game'
    })
    .when('/stats', {
      templateUrl: 'app/partials/stats.html',
      controller: 'StatsCtrl',
      controllerAs: 'stats'
    })
    .when('/win', {
      templateUrl: 'app/partials/win.html',
      controller: 'WinCtrl',
      controllerAs: 'win'
    })
    .otherwise('/login');
  });
