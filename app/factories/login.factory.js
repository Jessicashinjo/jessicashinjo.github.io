'use strict';

grimm.factory('AuthFactory', function(firebaseURL, $location, $timeout) {
  let userId = null;
  let token = null;

  firebase.auth().onAuthStateChanged((user) => {
    if (user){
      userId = user.uid;
      user.getToken()
        .then(t => token = t)
        // .then($location.path('/menu'))
        .then($timeout);
    }
  });

  return {
    register(email, password){
      firebase.auth().createUserWithEmailAndPassword(email, password);
      // .then( (response) => {
      //   // console.log(response);
      // })
      // .catch(function(error) {
        // var errorCode = error.code;
        // var errorMessage = error.message;
      // });
    },

    logIn(email, password) {
      // if (email && password != undefined ){
        firebase.auth().signInWithEmailAndPassword(email, password);
        // .then( (response) => {console.log(response)})
        // .catch(function(error) {
        //   var errorCode = error.code;
        //   var errorMessage = error.message;
        // });
      // } else {
        // alert('Please login or register');
      // }
    },
    logout () {
      firebase.auth().signOut();
    },
    currentUser() {
      return {user: userId, user_token: token};
    }
  };



  // let ref = firebaseURL;  // this is a Firebase setup (allows us to use Firebase methods)
  // let currentUserData = null;  // Set to null so no initial info can be there at start
  //
  // return {
  //   isAuthenticated () {
  //     let authData = ref.getAuth();
  //     return (authData) ? true : false;
  //   },
  //
  //   getUser () {
  //     return currentUserData;
  //   },
  //
  //   authenticate (credentials) {
  //     return new Promise((resolve, reject) => {
  //       ref.authWithPassword({
  //         "email": credentials.email,
  //         "password": credentials.password
  //       }, (error, authData) => {
  //         if (error) {
  //           reject(error);
  //           console.log("Login did not work");
  //         } else {
  //           console.log("authWithPassword method completed successfully");
  //           currentUserData = authData;
  //           resolve(authData);
  //         }
  //       });
  //     });
  //   },
  //
  //   storeUser (authData) {
  //     let stringifiedUser = JSON.stringify({ uid: authData.uid });
  //
  //     return new Promise((resolve, reject) => {
  //       $http
  //         .post(`${firebaseURL}/users.json`, stringifiedUser)
  //         .then(
  //           res => resolve(res),
  //           err => reject(err)
  //         );
  //     });
  //   }
  //
  // };
});
