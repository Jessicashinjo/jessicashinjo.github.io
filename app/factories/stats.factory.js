grimm
  .factory('statsFactory', ($http, firebaseURL) => {
    // let stats = [];

    return {
      getLeaderboard() {
        let stats = [];
        let leaderboard = null;
        return $http
          .get(`${firebaseURL}/leaderboard.json`)
      },
      setNewStat (userStat){
        $http
          .post(`${firebaseURL}/leaderboard/${userStat}`);
      },
      logOut() {
        firebase.auth().signOut().then(function() {
          // Sign-out successful.
        }, function(error) {
          // An error happened.
        });
      }
    };

  });
