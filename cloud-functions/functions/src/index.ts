import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

export const createUserCollection = functions.auth.user().onCreate((user) => {
	return db.collection('users').doc(user.uid).set({
		email: user.email,
		uid: user.uid
	})
})

export const deleteUserCollection = functions.auth.user().onDelete((user) => {
	return db.collection('users').doc(user.uid).delete();
})