import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { joinQueue, leaveQueue, findMatch, createDebateRoom, getDebateRoom, markUsersAsMatched } from '../../services/debate/matchmaking';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

// Constants
const MAX_ROUNDS = 2;
const TURN_TIME_SECONDS = 60;
const JUDGE_MODEL = 'llama-70b';

interface MatchmakingModalProps {
  open: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  userId: string;
  userRating: number;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ open, onClose, topicId, topicTitle, userId, userRating }) => {
  const [queueId, setQueueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(true);
  const navigate = useNavigate();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Join queue on mount
  useEffect(() => {
    let isMounted = true;
    if (!open) return;
    setError(null);
    setSearching(true);
    console.log('[DEBUG] Starting matchmaking for:', { userId, topicId, userRating });
    (async () => {
      try {
        console.log('[DEBUG] Attempting to join queue...');
        const id = await joinQueue(userId, topicId, userRating);
        console.log('[DEBUG] Successfully joined queue with ID:', id);
        console.log('[DEBUG] Queue entry created with username and matchFound=false');
        if (!isMounted) return;
        setQueueId(id);
        pollForMatch();
      } catch (e: any) {
        console.error('[DEBUG] Failed to join queue:', e);
        setError(`Failed to join queue: ${e.message || 'Unknown error'}`);
        setSearching(false);
      }
    })();
    return () => {
      isMounted = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
    // eslint-disable-next-line
  }, [open, topicId, userId, userRating]);

  // Find existing debate room for matched users
  const findExistingRoom = async (user1: string, user2: string, topicText: string) => {
    try {
      console.log('[DEBUG] findExistingRoom called with:', { user1, user2, topicText });
      
      // Query for existing debates with the topic and waiting status
      const debatesQuery = query(
        collection(firestore, 'debates'),
        where('topic', '==', topicText),
        where('status', '==', 'waiting')
      );
      
      console.log('[DEBUG] Executing Firestore query for existing debates');
      const debatesSnapshot = await getDocs(debatesQuery);
      console.log('[DEBUG] Query returned', debatesSnapshot.docs.length, 'debates');
      
      for (const doc of debatesSnapshot.docs) {
        const debate = doc.data();
        console.log('[DEBUG] Checking debate:', { id: doc.id, participants: debate.participants, topic: debate.topic, status: debate.status });
        
        // Check if both users are participants
        const hasUser1 = debate.participants?.some((p: any) => p.userId === user1);
        const hasUser2 = debate.participants?.some((p: any) => p.userId === user2);
        
        if (hasUser1 && hasUser2) {
          console.log('[DEBUG] Found matching debate with Firestore ID:', doc.id);
          return doc.id; // Return the Firestore document ID
        }
      }
      
      console.log('[DEBUG] No matching debate found');
      return null;
    } catch (error) {
      console.error('[DEBUG] Error finding existing debate:', error);
      return null;
    }
  };

  // Poll for a match
  const pollForMatch = async () => {
    try {
      console.log('[DEBUG] Polling for match...');
      const match = await findMatch(userId, topicId, userRating);
      console.log('[DEBUG] Match result:', match);
      if (match) {
        console.log('[DEBUG] Found match, handling debate room...');
        console.log('[DEBUG] Match details:', {
          matchUserId: match.userId,
          matchUsername: match.username,
          matchRating: match.rating,
          currentUserId: userId,
          currentRating: userRating,
          topicId: topicId
        });
        
        // Check if a room already exists for these users
        const existingRoomId = await findExistingRoom(userId, match.userId, topicTitle);
        console.log('[DEBUG] Existing room check result:', existingRoomId);
        
        let roomId = existingRoomId;
        
        if (!roomId) {
          // No existing room, create one
          if (userId < match.userId) {
            // This user creates the room
            console.log('[DEBUG] Creating debate room as user with lower ID');
            roomId = await createDebateRoom(
              topicTitle,
              topicId,
              userId,
              match.userId,
              userRating,
              match.rating,
              undefined, // user1Username - will be fetched from Firestore
              match.username // user2Username - from queue entry
            );
            console.log('[DEBUG] Created debate room:', roomId);
            
            // Mark both users as matched in the queue
            await markUsersAsMatched(userId, match.userId);
          } else {
            // Wait for the other user to create the room
            console.log('[DEBUG] Waiting for other user to create room');
            let attempts = 0;
            while (attempts < 15 && !roomId) { // Increased attempts
              console.log('[DEBUG] Waiting for other user to create room, attempt:', attempts + 1);
              await new Promise(res => setTimeout(res, 1000));
              roomId = await findExistingRoom(userId, match.userId, topicTitle);
              attempts++;
            }
            console.log('[DEBUG] Finished waiting for room, result:', roomId);
          }
        } else {
          console.log('[DEBUG] Found existing room:', roomId);
        }
        
        if (roomId) {
          // Verify the room exists before navigating
          console.log('[DEBUG] Verifying room exists:', roomId);
          const room = await getDebateRoom(roomId);
          if (room) {
            console.log('[DEBUG] Room verified, navigating to:', roomId);
            console.log('[DEBUG] Room data:', room);
            setSearching(false);
            onClose();
            navigate(`/users-debate/${roomId}`);
            return;
          } else {
            console.error('[DEBUG] Room not found after creation:', roomId);
          }
        }
        
        // Fallback if room creation/joining failed
        console.error('[DEBUG] Failed to create or join room');
        setError('Failed to create debate room. Please try again.');
        setSearching(false);
        return;
      }
      // No match yet, poll again
      console.log('[DEBUG] No match found, polling again in 2 seconds...');
      pollingRef.current = setTimeout(pollForMatch, 2000);
    } catch (e: any) {
      console.error('[DEBUG] Error while polling for match:', e);
      setError(`Error while searching for a match: ${e.message || 'Unknown error'}`);
      setSearching(false);
    }
  };

  // Leave queue on cancel/close
  const handleCancel = async () => {
    setSearching(false);
    if (queueId) {
      await leaveQueue(queueId);
    }
    onClose();
  };

  // Temporary debug function to get index link
  const forceIndexError = async () => {
    try {
      console.log('[DEBUG] Forcing index error to get creation link...');
      const q = query(
        collection(firestore, 'matchmakingQueue'),
        where('userId', '!=', 'test'),
        where('topicId', '==', 'test-topic'),
        where('rating', '>=', 1000),
        where('rating', '<=', 1100)
      );
      await getDocs(q);
    } catch (error: any) {
      console.error('[DEBUG] Index error:', error);
      if (error.message && error.message.includes('You can create it here:')) {
        const linkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        if (linkMatch) {
          console.log('[DEBUG] Index creation link:', linkMatch[0]);
          alert(`Index creation link: ${linkMatch[0]}`);
        }
      }
    }
  };

  // Call this function when modal opens (temporary)
  useEffect(() => {
    if (open) {
      // Uncomment the next line to force the index error
      // forceIndexError();
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Finding Your Opponent...
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Topic: <span className="font-semibold">{topicTitle}</span>
            </p>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                disabled={!searching && !error}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchmakingModal;

