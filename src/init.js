import * as firebase from "firebase";
import 'firebase/auth'
import 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyCjc9HQrmJs2JSLfK1YhrwofwRQMc8bBNY",
    authDomain: "betterbudget-244ff.firebaseapp.com",
    databaseURL: "https://betterbudget-244ff.firebaseio.com",
    projectId: "betterbudget-244ff",
    storageBucket: "betterbudget-244ff.appspot.com",
    messagingSenderId: "1037568934459"
});

const settings = {timestampsInSnapshots: true};
firebase.firestore().settings(settings);