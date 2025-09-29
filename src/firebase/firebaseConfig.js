import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Provider with proper settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Function to link email/password to existing Google account
export const linkEmailPassword = async (email, password) => {
  const user = auth.currentUser;
  if (user) {
    const credential = EmailAuthProvider.credential(email, password);
    try {
      await linkWithCredential(user, credential);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  return { success: false, error: "No user logged in" };
};

export { app, auth, db, storage, googleProvider };