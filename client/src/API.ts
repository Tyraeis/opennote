import firebase from 'firebase';
import 'firebase/functions';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCh_auw2PFMm8lqUYFu2JfurSBWzC4PELo",
    authDomain: "hacklahoma2020-opennote.firebaseapp.com",
    databaseURL: "https://hacklahoma2020-opennote.firebaseio.com",
    projectId: "hacklahoma2020-opennote",
    storageBucket: "hacklahoma2020-opennote.appspot.com",
    messagingSenderId: "340008598624",
    appId: "1:340008598624:web:6aea9623daeb5a47c01705",
    measurementId: "G-R6TDTLQYQV"
};

firebase.initializeApp(firebaseConfig);

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const functions = firebase.functions();

export default {
    signIn: auth.signInWithPopup(provider),
    createUserCollection: functions.httpsCallable('createUserCollection'),
    deleteUserCollection: functions.httpsCallable('deleteUserCollection'),
    createDocument: functions.httpsCallable('createDocument'),
    updateDocument: functions.httpsCallable('updateDocument'),
    getDocuments: functions.httpsCallable('getDocuments'),
    getDocument: functions.httpsCallable('getDocument')
};