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
const fieldValue = admin.firestore.FieldValue

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

	
	return db.collection('docs').doc(`${ uid }/${ docName }/data`).set({
		owner: uid,
		dateModified: Date.now() / 1000,
		content: new Uint8Array(1)
	}).then(() => {
		return db.collection('users').doc(uid).update({
			docs: fieldValue.arrayUnion(docName)
		}).then(() => {
			console.log("Document created!");
		})
	})
})

export const updateDocument = functions.https.onCall((data, context) => {
	if(!context.auth)
	{
		throw new functions.https.HttpsError('unauthenticated', 'Unable to verify user credentials');
	}
	const uid = context.auth.uid;
	const docName = data.doc;
	const content: Uint8Array = data.content;
	return db.collection('docs').doc(`${ uid }/${ docName }/data`).update({
		dateModified: Date.now() / 1000,
		content: content
	}).then(() => {
		console.log('Document updated successfully!')
	})
})

export const getDocuments = functions.https.onCall((data, context) => {
	if(!context.auth)
	{
		throw new functions.https.HttpsError('unauthenticated', 'Unable to verify user credentials');
	}
	const uid = context.auth.uid;
	return db.collection('docs').doc(uid).listCollections()
		.then(collections => {
			const ids = collections.map(col => col.id);
			return { collections: ids};
		})
})

export const getDocument = functions.https.onCall((data, context) => {
	if(!context.auth)
	{
		throw new functions.https.HttpsError('unauthenticated', 'Unable to verify user credentials');
	}
	const uid = context.auth.uid;
	const docName = data.doc;
	return db.collection('docs').doc(`${ uid }/${ docName }/data`).get()
		.then(doc => {
			if(!doc.exists)
			{
				console.log('Document not found!');
				throw new functions.https.HttpsError('not-found', "That document does not exist");
			}
			const docData = doc.data()!
			return {
				dateModified: docData.dateModified,
				content: docData.content
			}
		})
})

export const removeDocument = functions.https.onCall((data, context) => {
	if(!context.auth)
	{
		throw new functions.https.HttpsError('unauthenticated', 'Unable to verify user credentials');
	}
	const uid = context.auth.uid;
	const docName = data.doc;
	return db.collection('docs').doc(`${ uid }/${ docName }/data`).delete()
		.then(() => {
			return db.collection('users').doc(uid).update({
				docs: fieldValue.arrayRemove(docName)
			}).then(() => {
				console.log('Document deleted!')
			})
		})
})