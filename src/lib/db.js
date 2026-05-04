import {
  collection, doc, getDocs, setDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

// Firestore structure:
//   /users/{uid}/tasks/{taskId}
//   /users/{uid}/subscriptions/{subId}
//   /pushSubs/{uid}           ← one doc per user (flat, easy for cron to read)

function tasksRef(uid) {
  return collection(db, 'users', uid, 'tasks')
}

function subsRef(uid) {
  return collection(db, 'users', uid, 'subscriptions')
}

// --- Tasks ---

export async function fetchTasks(uid) {
  const snap = await getDocs(query(tasksRef(uid), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}

export async function saveTask(uid, task) {
  const { id, ...data } = task
  await setDoc(doc(tasksRef(uid), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function removeTask(uid, taskId) {
  await deleteDoc(doc(tasksRef(uid), taskId))
}

// --- Subscriptions ---

export async function fetchSubs(uid) {
  const snap = await getDocs(subsRef(uid))
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}

export async function saveSub(uid, sub) {
  const { id, ...data } = sub
  await setDoc(doc(subsRef(uid), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function removeSub(uid, subId) {
  await deleteDoc(doc(subsRef(uid), subId))
}

// --- Push subscriptions (flat /pushSubs/{uid} — one doc per user) ---

export async function savePushSub(uid, { endpoint, p256dh, auth }) {
  await setDoc(doc(db, 'pushSubs', uid), {
    uid, endpoint, p256dh, auth,
    updatedAt: serverTimestamp(),
  })
}

export async function removePushSub(uid) {
  await deleteDoc(doc(db, 'pushSubs', uid))
}
