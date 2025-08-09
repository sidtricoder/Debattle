import React, { useState, useEffect } from 'react';
import { Play, Users, Clock, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { firestore } from '../../lib/firebase';
import { doc, setDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import practiceTopics from '../../data/practiceTopics.json';

interface ChallengeModalProps {
  open: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  displayName: string;
  username: string;
  photoURL: string;
  rating: number;
}

const AI_MODELS = [
  { value: 'llama', label: 'Llama' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'gemma', label: 'Gemma' }
];

const STANCES = [
  { value: 'pro', label: 'Pro' },
  { value: 'con', label: 'Con' }
];

const ChallengeModal: React.FC<ChallengeModalProps> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Form state - exactly like customDebateRoom.tsx
  const [selectedTopic, setSelectedTopic] = useState('');
  const [aiModel, setAiModel] = useState('gemini');
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [rounds, setRounds] = useState(5);
  const [myStance, setMyStance] = useState('pro');
  const [timeoutHours, setTimeoutHours] = useState(24); // New field for challenge timeout
  
  // New fields for challenge feature
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load available users to challenge
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        const usersQuery = query(
          collection(firestore, 'users'),
          where('__name__', '!=', user.uid) // Exclude current user
        );
        const snapshot = await getDocs(usersQuery);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (open) {
      fetchUsers();
    }
  }, [open, user]);

  // Calculate total time in seconds (same as customDebateRoom)
  const timePerUser = minutes * 60 + seconds;

  // Ensure time is within 1-600 seconds (same as customDebateRoom)
  useEffect(() => {
    let total = minutes * 60 + seconds;
    if (total > 600) {
      setMinutes(10);
      setSeconds(0);
    } else if (total < 1) {
      setMinutes(0);
      setSeconds(1);
    }
  }, [minutes, seconds]);

  const yourStance = myStance === 'pro' ? 'con' : 'pro';

  // Filter users based on search
  const filteredUsers = availableUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChallenge = async () => {
    if (!user) {
      setError('Please sign in to create a challenge.');
      return;
    }

    if (!selectedTopic) {
      setError('Please select a topic.');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one user to challenge.');
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      const challengeId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + timeoutHours);
      
      // Create challenge document
      const challengeDoc = doc(firestore, 'challenges', challengeId);
      await setDoc(challengeDoc, {
        id: challengeId,
        fromUserId: user.uid,
        fromUserName: user.displayName || user.username || 'User',
        toUserIds: selectedUsers,
        topic: selectedTopic,
        settings: {
          aiModel,
          timePerUser,
          rounds,
          userStance: myStance
        },
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: expiresAt.getTime(),
        acceptedBy: [],
        declinedBy: []
      });

      // Create notifications for each challenged user
      for (const userId of selectedUsers) {
        await addDoc(collection(firestore, 'notifications'), {
          userId,
          type: 'challenge_received',
          title: 'New Debate Challenge!',
          message: `${user.displayName || user.username} has challenged you to debate: "${selectedTopic}"`,
          data: {
            challengeId,
            fromUserId: user.uid,
            fromUserName: user.displayName || user.username,
            topic: selectedTopic,
            timePerUser,
            rounds,
            aiModel,
            stance: yourStance, // Their stance would be opposite of challenger's
            expiresAt: expiresAt.getTime()
          },
          read: false,
          createdAt: Date.now(),
          expiresAt: expiresAt.getTime()
        });
      }

      const selectedUserNames = selectedUsers.map(id => 
        availableUsers.find(u => u.id === id)?.displayName || 'Unknown'
      ).join(', ');

      setSuccessMsg(`Challenge sent to ${selectedUserNames}! You'll be notified when someone accepts.`);
      
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        // Reset form
        setSelectedTopic('');
        setSelectedUsers([]);
        setSearchTerm('');
        setAiModel('gemini');
        setMinutes(1);
        setSeconds(0);
        setRounds(5);
        setMyStance('pro');
        setTimeoutHours(24);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-8 max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Challenge Users
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Topic Selection */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Debate Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a topic...</option>
              {practiceTopics.map((topic) => (
                <option key={topic.id} value={topic.title}>
                  {topic.title} ({topic.category})
                </option>
              ))}
            </select>
          </div>

          {/* User Selection */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Challenge Users (Select multiple)
            </label>
            
            {/* Search users */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            
            {/* Selected users display */}
            {selectedUsers.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Selected users ({selectedUsers.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = availableUsers.find(u => u.id === userId);
                    return (
                      <span
                        key={userId}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                      >
                        {user?.displayName || 'Unknown'}
                        <button
                          onClick={() => toggleUserSelection(userId)}
                          className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* User list */}
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`flex items-center p-3 cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <img
                    src={user.photoURL || '/me.png'}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username} • {user.rating} ELO
                    </p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          </div>

          {/* Challenge Timeout */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Challenge Expires In (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={timeoutHours}
              onChange={(e) => setTimeoutHours(Math.max(1, Math.min(168, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="24"
            />
            <div className="text-xs text-gray-500 mt-1">Challenge will expire after this time (1-168 hours)</div>
          </div>

          {/* AI Model - same as customDebateRoom */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">AI Model</label>
            <div className="flex gap-2">
              {AI_MODELS.map((model, idx) => (
                <button
                  key={model.value}
                  type="button"
                  onClick={() => setAiModel(model.value)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200
                    ${aiModel === model.value
                      ? idx === 0 ? 'bg-blue-500 text-white' : idx === 1 ? 'bg-purple-500 text-white' : 'bg-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}
                  `}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time per user - same as customDebateRoom */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Time per User</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={10}
                value={minutes}
                onChange={e => {
                  let v = Math.max(0, Math.min(10, Number(e.target.value)));
                  setMinutes(v);
                }}
                className="w-20 px-3 py-2 rounded-lg dark:bg-gray-800 dark:text-white text-center"
                placeholder="min"
              />
              <span className="text-gray-700 dark:text-gray-200">min</span>
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={e => {
                  let v = Math.max(0, Math.min(59, Number(e.target.value)));
                  setSeconds(v);
                }}
                className="w-20 px-3 py-2 rounded-lg dark:bg-gray-800 dark:text-white text-center"
                placeholder="sec"
              />
              <span className="text-gray-700 dark:text-gray-200">sec</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Allowed range: 1 second to 10 minutes (600 seconds)</div>
          </div>

          {/* Number of rounds - same as customDebateRoom */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Number of Rounds</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={rounds}
                onChange={e => setRounds(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400 w-8 text-center">{rounds}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Allowed range: 1 to 10 rounds</div>
          </div>

          {/* Stance - same as customDebateRoom */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Your Stance</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMyStance('pro')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200
                  ${myStance === 'pro' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Pro
              </button>
              <button
                type="button"
                onClick={() => setMyStance('con')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200
                  ${myStance === 'con' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Con
              </button>
            </div>
          </div>
        </div>

        {/* Create Challenge Button */}
        <button
          onClick={handleCreateChallenge}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 mt-8 shadow-lg text-lg"
          disabled={isCreating || timePerUser < 1 || timePerUser > 600 || !selectedTopic || selectedUsers.length === 0}
        >
          <Users className="w-5 h-5" />
          {isCreating ? 'Creating Challenge...' : 'Send Challenge'}
        </button>

        {successMsg && (
          <div className="text-green-600 dark:text-green-400 text-center mt-4 font-semibold">{successMsg}</div>
        )}
        {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
      </div>
    </Modal>
  );
};

export default ChallengeModal;
