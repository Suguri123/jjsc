import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import type { Student } from '../types';

// Load Firebase configuration from environment variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0035505654",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:209804329788:web:8570ad981a067424bfd439",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBnCo9vUvk0ehioBe44lMTwbsFl5FGcm44",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0035505654.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-4f6d9840-3470-47aa-ae41-842f7fe51254",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0035505654.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "209804329788"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Realtime listener for students collection
export function subscribeStudents(
  onUpdate: (students: Student[]) => void, 
  onError?: (err: Error) => void
) {
  const studentsCol = collection(db, 'students');
  const q = query(studentsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: Student[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || '',
        nickname: data.nickname || '',
        gender: data.gender || '남학생',
        glasses: data.glasses || '안경 안 씀',
        clothingColor: data.clothingColor || '무채색(검정·흰·회색)',
        mbtiStyle: data.mbtiStyle || 'E (활발·사교적)',
        socksColor: data.socksColor || '흰색',
        interest: data.interest || '게임·e스포츠',
        subject: data.subject || '체육·음악·미술',
        submittedAt: data.submittedAt || new Date().toISOString()
      });
    });
    onUpdate(list);
  }, (err) => {
    console.error("Firebase student subscription error:", err);
    if (onError) onError(err);
  });
}

// Add or save student
export async function saveStudentToFirebase(student: Student): Promise<void> {
  const docRef = doc(db, 'students', student.id);
  await setDoc(docRef, {
    ...student,
    createdAt: serverTimestamp()
  });
}

// Delete student
export async function deleteStudentFromFirebase(studentId: string): Promise<void> {
  const docRef = doc(db, 'students', studentId);
  await deleteDoc(docRef);
}

// Clear all students (Teacher reset)
export async function deleteMultipleStudentsFromFirebase(studentIds: string[]): Promise<void> {
  const promises = studentIds.map(id => deleteDoc(doc(db, 'students', id)));
  await Promise.all(promises);
}

// Realtime listener for Teacher PIN
export function subscribeTeacherPin(
  onUpdate: (pin: string) => void
) {
  const pinDoc = doc(db, 'settings', 'teacherConfig');
  return onSnapshot(pinDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.pin) {
        onUpdate(String(data.pin).trim());
      }
    }
  }, (err) => {
    console.warn("PIN sync warning:", err);
  });
}

// Get current Teacher PIN from Firebase
export async function getTeacherPinFromFirebase(fallbackPin: string = '1234'): Promise<string> {
  try {
    const pinDoc = doc(db, 'settings', 'teacherConfig');
    const snap = await getDoc(pinDoc);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.pin) {
        return String(data.pin).trim();
      }
    }
  } catch (err) {
    console.warn("Error fetching PIN from Firebase:", err);
  }
  return fallbackPin.trim() || '1234';
}

// Update Teacher PIN
export async function updateTeacherPinInFirebase(newPin: string): Promise<void> {
  const pinDoc = doc(db, 'settings', 'teacherConfig');
  await setDoc(pinDoc, { pin: newPin.trim(), updatedAt: serverTimestamp() }, { merge: true });
}

// Verify Teacher PIN against Firebase
export async function verifyTeacherPinInFirebase(inputPin: string, fallbackPin: string = '1234'): Promise<boolean> {
  try {
    const pinDoc = doc(db, 'settings', 'teacherConfig');
    const snap = await getDoc(pinDoc);
    if (snap.exists()) {
      const serverPin = snap.data()?.pin || '1234';
      return String(serverPin).trim() === inputPin.trim();
    }
    return inputPin.trim() === fallbackPin.trim() || inputPin.trim() === '1234';
  } catch (err) {
    console.warn("PIN check fallback to local:", err);
    return inputPin.trim() === fallbackPin.trim() || inputPin.trim() === '1234';
  }
}

