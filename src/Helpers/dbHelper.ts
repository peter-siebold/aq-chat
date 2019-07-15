import Firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// Please provide your own firebase setup here
import {config as firebaseConfig} from "../config/firebase.config"

const config = {
    apiKey: "Insert your API Key here",
    authDomain: "$YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://$YOUR_PROJECT.firebaseio.com",
    projectId: "$YOUR_PROJECT",
    storageBucket: "$YOUR_PROJECT.appspot.com",
    messagingSenderId: "Insert your messaging sender id",
    ...firebaseConfig
  };
  Firebase.initializeApp(config);

  

// import Firebase from "../firebase";
export const firebase =  Firebase;

export const getUsersReference = () => firebase.database().ref("users");
export const getStorageReference = () => firebase.storage().ref();
export const getTypingReference = () => firebase.database().ref("typing");
export const getConnectedReference = () => firebase.database().ref(".info/connected");
export const getMessagesReference = () => firebase.database().ref("messages");
export const getPrivateMessagesReference = () => firebase.database().ref("privateMessages");
export const getChannelsReference = () => firebase.database().ref("channels");
export const getPresenceReference = () => firebase.database().ref("presence");
export const getAuthCurrentUser = () => firebase.auth().currentUser;
export const getDbTimeStamp = () => firebase.database.ServerValue.TIMESTAMP;

export default firebase;