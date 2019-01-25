import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// Please provide your own firebase setup here
import {config as firebaseConfig} from "./config/firebase.config"

const config = {
    apiKey: "Insert your API Key here",
    authDomain: "$YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://$YOUR_PROJECT.firebaseio.com",
    projectId: "$YOUR_PROJECT",
    storageBucket: "$YOUR_PROJECT.appspot.com",
    messagingSenderId: "Insert your messaging sender id",
    ...firebaseConfig
  };
  firebase.initializeApp(config);

  export default firebase;
