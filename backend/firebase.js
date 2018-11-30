var admin = require('firebase-admin');

var serviceAccount = require("./serviceAccountKey.json");

//Initialize Firebase
var config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tactiled.firebaseio.com",
  storageBucket: "tactiled-model.appspot.com"

};

module.exports = admin.initializeApp(config);