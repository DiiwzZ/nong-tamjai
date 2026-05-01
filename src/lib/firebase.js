import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBp6YCXD0DlxPz059YwFgfIciX2Jh2sFs0",
  authDomain: "nong-tamjai.firebaseapp.com",
  projectId: "nong-tamjai",
  storageBucket: "nong-tamjai.firebasestorage.app",
  messagingSenderId: "978799361914",
  appId: "1:978799361914:web:2686dd0566d3286b52e0c3",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export function signInAnon() {
  return signInAnonymously(auth)
}

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback)
}
