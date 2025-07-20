import { firestore } from '../../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const QUEUE_COLLECTION = 'matchmakingQueue';
const DEBATE_ROOMS_COLLECTION = 'debateRooms';
const USER_DEBATE_STATS = 'userDebateStats';

export interface QueueEntry {
  userId: string;
  username: string; // Add username field
  topicId: string;
  rating: number;
  joinedAt: Date;
  matchFound: boolean; // Add matchFound field
}

export interface DebateRoom {
  id: string;
  topicId: string;
  userIds: string[];
  stances: Record<string, 'pro' | 'con'>;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  currentRound: number;
  maxRounds: number;
  timePerTurn: number;
  createdAt: Date;
  judgeModel: string;
  ratings: Record<string, number>; // User ratings at the time of match
  abandonedBy?: string; // User ID who abandoned the debate
}

// Add user to matchmaking queue
export const joinQueue = async (userId: string, topicId: string, rating: number): Promise<string> => {
  const queueId = uuidv4();
  
  // Fetch user's display name from Firestore
  let username = `User ${userId.slice(-4)}`;
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      username = userData.displayName || userData.username || `User ${userId.slice(-4)}`;
    }
  } catch (error) {
    console.warn('Failed to fetch username for queue entry:', error);
  }
  
  const queueEntry: QueueEntry = {
    userId,
    username,
    topicId,
    rating,
    joinedAt: new Date(),
    matchFound: false
  };

  await setDoc(doc(firestore, QUEUE_COLLECTION, queueId), queueEntry);
  return queueId;
};

// Remove user from matchmaking queue
export const leaveQueue = async (queueId: string) => {
  await deleteDoc(doc(firestore, QUEUE_COLLECTION, queueId));
};

// Clean up old queue entries (for migration)
export const cleanupOldQueueEntries = async () => {
  try {
    const q = query(collection(firestore, QUEUE_COLLECTION));
    const snapshot = await getDocs(q);
    
    const cleanupPromises: Promise<void>[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // If entry doesn't have username or matchFound fields, delete it
      if (!data.username || data.matchFound === undefined) {
        cleanupPromises.push(deleteDoc(doc.ref));
      }
    });
    
    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
      console.log('[DEBUG] Cleaned up', cleanupPromises.length, 'old queue entries');
    }
  } catch (error) {
    console.error('Failed to cleanup old queue entries:', error);
  }
};

// Find a match for a user
export const findMatch = async (userId: string, topicId: string, rating: number) => {
  // Look for potential matches within ±100 rating points
  const minRating = Math.max(0, rating - 100);
  const maxRating = rating + 100;
  
  const q = query(
    collection(firestore, QUEUE_COLLECTION),
    where('userId', '!=', userId),
    where('topicId', '==', topicId),
    where('rating', '>=', minRating),
    where('rating', '<=', maxRating),
    where('matchFound', '==', false) // Only match with users who haven't been matched yet
  );

  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Get the best match (closest rating)
    const matches = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as QueueEntry
    }));

    // Sort by rating difference and get the best match
    const bestMatch = matches.sort(
      (a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)
    )[0];

    return bestMatch;
  }
  
  return null;
};

// Mark users as matched in the queue
export const markUsersAsMatched = async (user1Id: string, user2Id: string) => {
  try {
    // Find and update both users' queue entries
    const q1 = query(
      collection(firestore, QUEUE_COLLECTION),
      where('userId', '==', user1Id),
      where('matchFound', '==', false)
    );
    const q2 = query(
      collection(firestore, QUEUE_COLLECTION),
      where('userId', '==', user2Id),
      where('matchFound', '==', false)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    // Update both users' matchFound status
    const updatePromises: Promise<void>[] = [];
    
    snapshot1.forEach(doc => {
      updatePromises.push(updateDoc(doc.ref, { matchFound: true }));
    });
    
    snapshot2.forEach(doc => {
      updatePromises.push(updateDoc(doc.ref, { matchFound: true }));
    });
    
    await Promise.all(updatePromises);
    console.log('[DEBUG] Marked users as matched:', user1Id, user2Id);
  } catch (error) {
    console.error('Failed to mark users as matched:', error);
  }
};

// Create a new debate room
export const createDebateRoom = async (topic: string, user1: string, user2: string, user1Rating: number, user2Rating: number, user1Username?: string, user2Username?: string): Promise<string> => {
  // Create a new document reference with auto-generated ID
  const newDebateRef = doc(collection(firestore, 'debates'));
  
  // Use provided usernames or fetch from Firestore
  let user1DisplayName = user1Username || `User ${user1.slice(-4)}`;
  let user2DisplayName = user2Username || `User ${user2.slice(-4)}`;
  
  if (!user1Username) {
    try {
      const user1Doc = await getDoc(doc(firestore, 'users', user1));
      if (user1Doc.exists()) {
        const user1Data = user1Doc.data();
        user1DisplayName = user1Data.displayName || user1Data.username || `User ${user1.slice(-4)}`;
      }
    } catch (error) {
      console.warn('Failed to fetch user1 display name:', error);
    }
  }
  
  if (!user2Username) {
    try {
      const user2Doc = await getDoc(doc(firestore, 'users', user2));
      if (user2Doc.exists()) {
        const user2Data = user2Doc.data();
        user2DisplayName = user2Data.displayName || user2Data.username || `User ${user2.slice(-4)}`;
      }
    } catch (error) {
      console.warn('Failed to fetch user2 display name:', error);
    }
  }
  
  // Randomly assign stances
  const isUser1Pro = Math.random() > 0.5;
  const participants = [
    {
      userId: user1,
      displayName: user1DisplayName,
      stance: isUser1Pro ? 'pro' as const : 'con' as const
    },
    {
      userId: user2,
      displayName: user2DisplayName,
      stance: isUser1Pro ? 'con' as const : 'pro' as const
    }
  ];

  const newDebate = {
    topic: topic,
    participants,
    arguments: [],
    status: 'waiting' as const,
    currentTurn: user1, // First user starts
    currentRound: 1,
    ratings: {
      [user1]: user1Rating,
      [user2]: user2Rating
    },
    createdAt: Date.now() // Use consistent timestamp format
  };

  await setDoc(newDebateRef, newDebate);
  console.log('[DEBUG] Created debate with Firestore ID:', newDebateRef.id);
  return newDebateRef.id;
};

// Get debate room by ID
export const getDebateRoom = async (roomId: string): Promise<DebateRoom | null> => {
  const docRef = doc(firestore, 'debates', roomId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as DebateRoom;
  }
  
  return null;
};

// Subscribe to debate room updates
export const subscribeToDebateRoom = (roomId: string, callback: (room: DebateRoom | null) => void) => {
  const docRef = doc(firestore, 'debates', roomId);
  
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as DebateRoom) : null);
  });
};

// Update debate room status
export const updateDebateRoomStatus = async (roomId: string, status: 'waiting' | 'active' | 'completed' | 'abandoned', abandonedBy?: string) => {
  const updateData: any = { status };
  if (status === 'abandoned' && abandonedBy) {
    updateData.abandonedBy = abandonedBy;
  }
  await updateDoc(doc(firestore, DEBATE_ROOMS_COLLECTION, roomId), updateData);
};

// Update current round
export const updateCurrentRound = async (roomId: string, round: number) => {
  const docRef = doc(firestore, DEBATE_ROOMS_COLLECTION, roomId);
  await updateDoc(docRef, { currentRound: round });
};

// Add a message to the debate
export const addMessageToDebate = async (roomId: string, message: any) => {
  const roomRef = doc(firestore, DEBATE_ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, {
    messages: arrayUnion({
      ...message,
      timestamp: new Date()
    })
  });
};

// Update user ratings after debate
export const updateUserRatings = async (winnerId: string | null, userIds: string[], ratings: Record<string, number>) => {
  const batch = [];
  const ratingChange = 10;
  
  for (const userId of userIds) {
    const userRef = doc(firestore, USER_DEBATE_STATS, userId);
    const userDoc = await getDoc(userRef);
    
    let newRating = ratings[userId];
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      wins = userData.wins || 0;
      losses = userData.losses || 0;
      draws = userData.draws || 0;
    }
    
    if (winnerId === userId) {
      // Winner
      newRating += ratingChange;
      wins += 1;
    } else if (winnerId === null) {
      // Draw
      newRating += 5;
      draws += 1;
    } else {
      // Loser
      newRating = Math.max(0, newRating - ratingChange);
      losses += 1;
    }
    
    batch.push(
      setDoc(userRef, {
        rating: newRating,
        wins,
        losses,
        draws,
        lastUpdated: new Date()
      }, { merge: true })
    );
  }
  
  await Promise.all(batch);
};