import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA18hRvaTurrih6l4VEdBVYVmqf9h6iSgQ",
  authDomain: "debattlesid.firebaseapp.com",
  projectId: "debattlesid",
  storageBucket: "debattlesid.firebasestorage.app",
  messagingSenderId: "287467434991",
  appId: "1:287467434991:web:47d52e01dc4e7def4dfc1a",
  measurementId: "G-8LRNPPWM9E",
  databaseURL: "https://debattlesid-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    if (!db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!rtdb._delegate._repoInternal.repoInfo_.host.includes('localhost')) {
      connectDatabaseEmulator(rtdb, 'localhost', 9000);
    }
    if (!storage._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    console.warn('Firebase emulators already connected or not available:', error);
  }
}

export default app;
