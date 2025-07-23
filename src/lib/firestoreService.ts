import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  DocumentReference,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from './firebase';

// --- Types (simplified, expand as needed) ---
export interface User {
  uid: string;
  email: string;
  name: string;
  username: string;
  elo_rating: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  achievements: string[];
  created_at: any;
  last_active: any;
  preferred_topics: string[];
  debate_style: string;
  profile_image: string;
  bio: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  created_at: any;
  usage_count: number;
  average_rating: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
  rarity: string;
}

export interface Debate {
  id: string;
  topic: string;
  format: string;
  participants: string[];
  status: string;
  created_at: any;
  started_at: any;
  ended_at: any;
  winner: string;
  arguments: any[];
  ai_judgment: any;
  elo_changes: Record<string, number>;
  metadata: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
}

// --- USERS ---
export const getUser = async (uid: string) => {
  const ref = doc(firestore, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as User) : null;
};

export const setUser = async (user: User) => {
  const ref = doc(firestore, 'users', user.uid);
  await setDoc(ref, user, { merge: true });
};

export const listenToUser = (uid: string, cb: (user: User | null) => void): Unsubscribe => {
  const ref = doc(firestore, 'users', uid);
  return onSnapshot(ref, (snap) => cb(snap.exists() ? (snap.data() as User) : null));
};

// --- TOPICS ---
export const getTopics = async () => {
  const ref = collection(firestore, 'topics');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => d.data() as Topic);
};

export const getTopic = async (id: string) => {
  const ref = doc(firestore, 'topics', id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Topic) : null;
};

export const setTopic = async (topic: Topic) => {
  const ref = doc(firestore, 'topics', topic.id);
  await setDoc(ref, topic, { merge: true });
};

export const listenToTopics = (cb: (topics: Topic[]) => void): Unsubscribe => {
  const ref = collection(firestore, 'topics');
  return onSnapshot(ref, (snap) => cb(snap.docs.map((d) => d.data() as Topic)));
};

// --- ACHIEVEMENTS ---
export const getAchievements = async () => {
  const ref = collection(firestore, 'achievements');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => d.data() as Achievement);
};

export const getAchievement = async (id: string) => {
  const ref = doc(firestore, 'achievements', id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Achievement) : null;
};

// --- DEBATES ---
export const getDebate = async (id: string) => {
  const ref = doc(firestore, 'debates', id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Debate) : null;
};

export const setDebate = async (debate: Debate) => {
  const ref = doc(firestore, 'debates', debate.id);
  await setDoc(ref, debate, { merge: true });
};

export const createDebate = async (debate: Omit<Debate, 'id'>) => {
  const ref = collection(firestore, 'debates');
  const docRef = await addDoc(ref, { ...debate, created_at: serverTimestamp() });
  return docRef.id;
};

export const listenToDebate = (id: string, cb: (debate: Debate | null) => void): Unsubscribe => {
  const ref = doc(firestore, 'debates', id);
  return onSnapshot(ref, (snap) => cb(snap.exists() ? (snap.data() as Debate) : null));
};

export const getUserDebates = async (uid: string) => {
  const ref = collection(firestore, 'debates');
  const q = query(ref, where('participants', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Debate);
};

// --- NOTIFICATIONS ---
export const getNotifications = async (userId: string) => {
  const ref = collection(firestore, 'notifications');
  const q = query(ref, where('userId', '==', userId), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Notification);
};

export const setNotification = async (notif: Notification) => {
  const ref = doc(firestore, 'notifications', notif.id);
  await setDoc(ref, notif, { merge: true });
};

export const listenToNotifications = (userId: string, cb: (notifs: Notification[]) => void): Unsubscribe => {
  const ref = collection(firestore, 'notifications');
  const q = query(ref, where('userId', '==', userId), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as Notification)));
};

// --- SYSTEM SETTINGS ---
export const getSystemSettings = async () => {
  const ref = doc(firestore, 'system', 'settings');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}; 