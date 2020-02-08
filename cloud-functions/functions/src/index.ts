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

export const createDocument = functions.https.onCall((data, context) => {
	if(!context.auth)
	{
		throw new functions.https.HttpsError('unauthenticated', 'Unable to verify user credentials');
	}
	const uid = context.auth.uid;
	const docName = data.doc;
	return db.collection('docs').doc(`${ uid }/${ docName }`).set({
		owner: uid,
		dateModified: Date.now() / 1000
	}).then(() => {
		console.log('New document created');
	})
})