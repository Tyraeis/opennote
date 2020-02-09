import firebase from 'firebase';
import 'firebase/functions';
import 'firebase/auth';
import 'firebase/database';

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
const db = firebase.firestore();

type MessageHandler = (msg: { document: string, content: string }) => void;

var currentUser: firebase.User | null
var subscriptions: Record<string, { fn: MessageHandler, unsubscribe: () => void }> = {}

const API = {
    signIn: () =>
        auth.signInWithPopup(provider)
            .then(resp => {
                currentUser = resp.user
                return resp
            }),
    signOut: () =>
        auth.signOut(),
    createDocument: (doc: string) =>
        functions.httpsCallable('createDocument')({ doc }),
    updateDocument: (doc: string, content: string) =>
        functions.httpsCallable('updateDocument')({ doc, content }),
    getDocuments: () =>
        functions.httpsCallable('getDocuments')()
            .then((result) =>
                result.data.collections as string[]
            ),
    getDocument: (doc: string) =>
        functions.httpsCallable('getDocument')({ doc })
            .then((result) =>
                result.data as { dateModified: number, content: string }
            ),
    removeDocument: (doc: string) =>
        functions.httpsCallable('removeDocument')({ doc }),
    subscribe: async (doc: string, fn: (msg: { document: string, content: string }) => void) => {
        console.log("sub", doc)

        if (currentUser == null) {
            return;
        }

        console.log(`docs/${currentUser.uid}/${doc}/data`)

        var unsubscribe = db.collection('docs').doc(`${currentUser.uid}/${doc}/data`)
            .onSnapshot((snapshot) => {
                console.log(snapshot);
                fn({ document: doc, content: snapshot.data().content })
            })

        subscriptions[doc] = {
            fn, unsubscribe
        }
    },
    unsubscribe: (doc: string) => {
        subscriptions[doc].unsubscribe();
        delete subscriptions[doc];
    },
    unsubscribeAll: () => {
        for (let sub in subscriptions) {
            API.unsubscribe(sub);
        }
    }
};

export default API;