var admin = require('firebase-admin');

var serviceAccount = require("./serviceAccountKeyStorage.json");

//Initialize Firebase
var config = {
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "tactiled-model.appspot.com"
};

module.exports = admin.initializeApp(config);