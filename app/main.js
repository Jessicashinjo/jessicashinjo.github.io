var grimm = angular.module('grimm', ['ngRoute'])
  .constant('firebaseURL', 'https://grimm-6edf6.firebaseio.com');

firebase.initializeApp({
  apiKey: 'AIzaSyCI5fY2pyhcTSQKAOFwv7XEz7kMhmV8x8U',
  authDomain: 'grimm-6edf6.firebaseapp.com',
  databaseURL: 'https://grimm-6edf6.firebaseio.com',
  storageBucket: 'grimm-6edf6.appspot.com'
});
