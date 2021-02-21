import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
	apiKey: 'AIzaSyD80qFF5E62Ys8afgwRLAms5dOkU7S9kT8',
	authDomain: 'instagram-clone-2e3ca.firebaseapp.com',
	databaseURL: 'https://instagram-clone-2e3ca.firebaseio.com',
	projectId: 'instagram-clone-2e3ca',
	storageBucket: 'instagram-clone-2e3ca.appspot.com',
	messagingSenderId: '892084410799',
	appId: '1:892084410799:web:99c4559f8a4c0cb9a4775a',
	measurementId: 'G-XNHXDNEE2K',
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
