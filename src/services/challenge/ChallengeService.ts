import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

interface ExpiredChallenge {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserIds: string[];
  topic: string;
  expiresAt: number;
  status: string;
}

export class ChallengeService {
  // Clean up expired challenges
  static async cleanupExpiredChallenges(): Promise<void> {
    try {
      const now = Date.now();
      
      // Find all pending challenges that have expired
      const challengesQuery = query(
        collection(firestore, 'challenges'),
        where('status', '==', 'pending'),
        where('expiresAt', '<=', now)
      );
      
      const snapshot = await getDocs(challengesQuery);
      const expiredChallenges: ExpiredChallenge[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExpiredChallenge[];
      
      // Update each expired challenge and notify the challenger
      for (const challenge of expiredChallenges) {
        // Update challenge status to expired
        await updateDoc(doc(firestore, 'challenges', challenge.id), {
          status: 'expired'
        });
        
        // Notify the challenger
        await addDoc(collection(firestore, 'notifications'), {
          userId: challenge.fromUserId,
          type: 'challenge_expired',
          title: 'Challenge Expired',
          message: `Your debate challenge on "${challenge.topic}" has expired without being accepted`,
          data: {
            challengeId: challenge.id,
            topic: challenge.topic,
            expiredUsers: challenge.toUserIds
          },
          read: false,
          createdAt: Date.now()
        });
        
        console.log(`Cleaned up expired challenge: ${challenge.id}`);
      }
      
      console.log(`Cleaned up ${expiredChallenges.length} expired challenges`);
    } catch (error) {
      console.error('Error cleaning up expired challenges:', error);
    }
  }
  
  // Start the cleanup service (call this on app initialization)
  static startCleanupService(): () => void {
    // Run cleanup every 5 minutes
    const interval = setInterval(() => {
      this.cleanupExpiredChallenges();
    }, 5 * 60 * 1000);
    
    // Run cleanup immediately
    this.cleanupExpiredChallenges();
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }
}

export default ChallengeService;
