import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import { firestore } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

interface CustomDebateRoomProps {
  open: boolean;
  onClose: () => void;
  topic?: string;
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

const DEFAULT_TOPIC = 'Custom Debate Topic';

const CustomDebateRoom: React.FC<CustomDebateRoomProps> = ({ open, onClose, topic }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [debateTopic, setDebateTopic] = useState(topic || DEFAULT_TOPIC);
  const [aiModel, setAiModel] = useState('gemini');
  // Replace timePerUser with minutes and seconds
  const [minutes, setMinutes] = useState(1); // default 1 min
  const [seconds, setSeconds] = useState(0); // default 0 sec
  const [rounds, setRounds] = useState(5);
  const [myStance, setMyStance] = useState('pro');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (topic) setDebateTopic(topic);
  }, [topic]);

  // Calculate total time in seconds
  const timePerUser = minutes * 60 + seconds;

  // Ensure time is within 1-600 seconds
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

  const handleStart = async () => {
    if (!user) {
      setError('Please sign in to start a debate.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const id = uuidv4();
      const debateDoc = doc(firestore, 'debates', id);
      await setDoc(debateDoc, {
        id,
        topic: debateTopic,
        aiModel,
        timePerUser,
        rounds,
        userStance: myStance,
        customSettings: {
          aiModel,
          timePerUser,
          rounds,
          userStance: myStance
        },
        status: 'waiting',
        participants: [
          {
            userId: user.uid,
            displayName: user.displayName || user.username || 'User',
            stance: myStance
          }
        ],
        participantIds: [user.uid],
        createdAt: Date.now(),
        currentRound: 1,
        currentTurn: null, // Will be set when both join
        arguments: [],
        isCustom: true
      });
      // Prepare invite message
      const link = `${window.location.origin}/custom-debate/${id}`;
      const message = `Hey there, I would like to invite you to my custom debate:\n\nTopic: ${debateTopic}\nTime per user: ${timePerUser}s\nJudging AI: ${aiModel}\nMy stance: ${myStance}\nYour stance: ${yourStance}\nClick on the below link to join: ${link}`;
      await navigator.clipboard.writeText(message);
      setSuccessMsg('Invite copied! Redirecting to debate room...');
      setTimeout(() => {
        onClose();
        navigate(`/custom-debate/${id}`);
      }, 1200);
    } catch (e: any) {
      setError('Failed to create debate. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-8 max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white tracking-tight">Create Custom Debate</h2>
        <div className="space-y-6">
          {/* Topic (uneditable) */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Debate Topic</label>
            <input
              type="text"
              value={debateTopic}
              readOnly
              disabled
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-800 dark:text-white bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          {/* AI Model segmented button */}
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
          {/* Time per user (minutes/seconds) */}
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
          {/* Number of rounds slider */}
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
          {/* Stance segmented button */}
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
        <button
          onClick={handleStart}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 mt-8 shadow-lg text-lg"
          disabled={isCreating || timePerUser < 1 || timePerUser > 600}
        >
          <Play className="w-5 h-5" />
          {isCreating ? 'Starting...' : 'Start'}
        </button>
        {successMsg && (
          <div className="text-green-600 dark:text-green-400 text-center mt-4 font-semibold">{successMsg}</div>
        )}
        {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
      </div>
    </Modal>
  );
};

export default CustomDebateRoom; 