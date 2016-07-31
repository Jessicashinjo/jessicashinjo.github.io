angular.module('grimm')
  .controller('StatsCtrl', function (statsFactory, AuthFactory) {
    let user;
    const stats = this;
    stats.leaderboardData = null;
    statsFactory.getLeaderboard()
      .then( (response) => {
        stats.leaderboardData = response.data;
        console.log('controller data', stats.leaderboardData);
      });

    user = AuthFactory.currentUser();
    console.log("current user", user);
  });

  // .then( (response) => {
  //   leaderboard = response.data;
  //   for(var user in leaderboard){
  //     stats[stats.length] = leaderboard[user];
  //   }
  //   console.log('response', stats);
  // });
