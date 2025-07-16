import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateStore } from '../../stores/debateStore';
import type { DebateArgument } from '../../stores/debateStore';
import { useAuthStore } from '../../stores/authStore';
import { geminiService } from '../../services/ai/gemini';
import { judgeWithGroq } from '../../services/ai/deepseek';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Toast } from '../ui/Toast';
import { LoadingSpinner } from '../animations/LoadingSpinner';
import { TypingIndicator } from '../animations/TypingIndicator';
import { ConfettiAnimation } from '../animations/ConfettiAnimation';
import { onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import { 
  Zap, 
  Clock, 
  Target, 
  Trophy, 
  Brain, 
  MessageSquare, 
  Send as SendIcon, 
  X, 
  Crown,
  Flame,
  Star,
  Award,
  TrendingUp,
  Mic,
  Flag,
  Sun,
  Moon
} from 'lucide-react';
// Remove: import { Client } from "@gradio/client";

interface DebateRoomProps {
  debateId?: string;
}

export const DebateRoom: React.FC<DebateRoomProps> = ({ debateId: propDebateId }) => {
  const { debateId: urlDebateId } = useParams<{ debateId: string }>();
  const debateId = propDebateId || urlDebateId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPracticeMode = searchParams.get('mode') === 'practice';
  
  const { user: currentUser } = useAuthStore();
  const {
    currentDebate,
    isLoading,
    error,
    getDebateById,
    submitArgument,
    updateParticipantStatus,
    endDebate,
    simulateTyping,
    simulatePresence
  } = useDebateStore();

  const [argument, setArgument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showJudgment, setShowJudgment] = useState(false);
  const [coachingTip, setCoachingTip] = useState('');
  const [showCoaching, setShowCoaching] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [lastAIGeneratedArgumentId, setLastAIGeneratedArgumentId] = useState<string | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [optimisticArguments, setOptimisticArguments] = useState<DebateArgument[]>([]);
  const [pendingArguments, setPendingArguments] = useState<DebateArgument[]>([]);
  // Add local state for submitted arguments
  const [localSubmittedArguments, setLocalSubmittedArguments] = useState<DebateArgument[]>([]);
  const [isJudging, setIsJudging] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<'gemini' | 'llama' | 'gemma'>('gemini');
  const [showJudgeSelect, setShowJudgeSelect] = useState(false);
  const [hasChosenJudge, setHasChosenJudge] = useState(false);
  
  const argumentInputRef = useRef<HTMLTextAreaElement>(null);
  const debateContainerRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(64); // px, default height for textarea
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);

  // Add state for voice input (Hugging Face Whisper 2-step fetch)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // Kept for UI compatibility
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Add browser detection for Brave and Firefox
  const [isBraveOrFirefox, setIsBraveOrFirefox] = useState(false);

  // Helper: Convert Blob to base64 (if needed)
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]); // Remove data:...;base64,
        } else {
          reject('Failed to convert blob to base64');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Debug logging
  useEffect(() => {
    console.log('DebateRoom: debateId param:', debateId);
    console.log('DebateRoom: currentDebate:', currentDebate);
  }, [debateId, currentDebate]);

  // Real-time debate listener
  useEffect(() => {
    if (!debateId) return;

    const unsubscribe = onSnapshot(
      doc(firestore, 'debates', debateId),
      (docSnap) => {
        if (docSnap.exists()) {
          const debateData = { id: docSnap.id, ...docSnap.data() } as any;
          // Update local state with real-time data
          console.log('[DEBUG] Firestore onSnapshot: new arguments:', debateData.arguments, 'status:', debateData.status, 'currentTurn:', debateData.currentTurn);
          // Update the Zustand store's currentDebate
          useDebateStore.setState({ currentDebate: debateData });
          if (debateData.status === 'completed' && debateData.judgment) {
            setShowJudgment(true);
            setShowWinner(true);
          }
        }
      },
      (error) => {
        console.error('Debate listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [debateId]);

  // Load debate data
  useEffect(() => {
    if (debateId) {
      getDebateById(debateId);
    }
  }, [debateId, getDebateById]);

  // Update presence
  useEffect(() => {
    if (debateId && currentUser) {
      simulatePresence(debateId, currentUser.uid, true);
      
      return () => {
        simulatePresence(debateId, currentUser.uid, false);
      };
    }
  }, [debateId, currentUser, simulatePresence]);

  // Check if it's user's turn
  useEffect(() => {
    if (currentDebate && currentUser) {
      const isTurn = currentDebate.currentTurn === currentUser.uid;
      setIsMyTurn(isTurn);
      
      if (isTurn && argumentInputRef.current) {
        argumentInputRef.current.focus();
      }
    }
  }, [currentDebate, currentUser]);

  // Timer countdown
  useEffect(() => {
    if (!currentDebate || currentDebate.status !== 'active') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          // Time's up - auto-submit or end turn
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDebate]);

  // Auto-scroll to latest argument
  useEffect(() => {
    if (debateContainerRef.current) {
      debateContainerRef.current.scrollTop = debateContainerRef.current.scrollHeight;
    }
  }, [currentDebate?.arguments]);

  // Drag logic for input box resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - lastYRef.current;
      setInputHeight(prev => Math.max(48, Math.min(240, prev + delta * -1)));
      lastYRef.current = e.clientY;
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = '';
    };
    if (draggingRef.current) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'ns-resize';
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };
  }, [draggingRef.current]);

  // Get coaching tip
  const getCoachingTip = async () => {
    if (!currentDebate || !currentUser) return;

    const myStance = currentDebate.participants.find(p => p.userId === currentUser.uid)?.stance;
    const opponentArguments = currentDebate.arguments
      .filter(arg => arg.userId !== currentUser.uid)
      .slice(-3)
      .map(arg => arg.content);

    try {
      const tip = await geminiService.getCoachingTip(
        currentDebate.topic,
        myStance || 'pro',
        currentDebate.currentRound,
        opponentArguments
      );
      setCoachingTip(tip);
      setShowCoaching(true);
    } catch (error) {
      console.error('Failed to get coaching tip:', error);
    }
  };

  // Handle argument submission
  const handleSubmitArgument = async () => {
    if (!debateId || !currentUser || !argument.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Local instant UI: add the argument to pendingArguments
      const localArg: DebateArgument = {
        id: `local_${Date.now()}`,
        userId: currentUser.uid,
        content: argument.trim(),
        timestamp: Date.now(),
        round: currentDebate?.currentRound || 1,
        wordCount: argument.trim().split(' ').length
      };
      setPendingArguments(prev => [...prev, localArg]);
      setArgument('');
      // Add to localSubmittedArguments immediately
      setLocalSubmittedArguments(prev => [...prev, localArg]);
      // Update Firebase in background
      await submitArgument(debateId, currentUser.uid, argument.trim());
      // Get AI feedback for the argument
      const myStance = currentDebate?.participants.find(p => p.userId === currentUser.uid)?.stance;
      if (myStance) {
        const analysis = await geminiService.analyzeArgument(
          argument.trim(),
          currentDebate?.topic || '',
          myStance,
          currentDebate?.currentRound || 1
        );
        // Store AI feedback (you might want to save this to Firebase)
        console.log('[DEBUG] AI Analysis:', analysis);
      }
    } catch (error) {
      console.error('[DEBUG] Failed to submit argument:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // useEffect to trigger AI response in practice mode when it's AI's turn
  useEffect(() => {
    if (
      isPracticeMode &&
      currentDebate?.isPractice &&
      currentDebate.currentTurn === 'ai_opponent' &&
      currentDebate.status === 'active'
    ) {
      const lastArg = currentDebate.arguments[currentDebate.arguments.length - 1];
      if (
        lastArg &&
        lastArg.userId !== 'ai_opponent' &&
        lastAIGeneratedArgumentId !== lastArg.id
      ) {
        setLastAIGeneratedArgumentId(lastArg.id);
        setIsAITyping(true); // AI is about to respond
        // Prepare the full transcript for Gemini
        const transcript = currentDebate.arguments.map(arg => {
          const participant = currentDebate.participants.find(p => p.userId === arg.userId);
          return `${participant?.displayName || arg.userId} (${participant?.stance?.toUpperCase() || ''}): ${arg.content}`;
        }).join('\n');
        console.log('[DEBUG] AI transcript for Gemini:', transcript);
        generateAIResponseWithTranscript(transcript).finally(() => setIsAITyping(false));
      }
    }
  }, [currentDebate?.arguments, isPracticeMode, currentDebate?.currentTurn, currentDebate?.status, lastAIGeneratedArgumentId]);

  // New AI response function that takes the transcript
  const generateAIResponseWithTranscript = async (transcript: string) => {
    if (!currentDebate || !debateId) {
      console.log('[DEBUG] generateAIResponseWithTranscript: missing currentDebate or debateId');
      return;
    }
    try {
      console.log('[DEBUG] generateAIResponseWithTranscript called');
      const aiPersonality = currentDebate.aiPersonality || 'Balanced and analytical';
      const aiStance = currentDebate.participants.find(p => p.userId === 'ai_opponent')?.stance || 'con';
      const aiResponse = await geminiService.generateAIResponse(
        currentDebate.topic,
        aiStance,
        aiPersonality,
        transcript,
        currentDebate.currentRound
      );
      console.log('[DEBUG] AI generated response (with transcript):', aiResponse);
      await submitArgument(debateId, 'ai_opponent', aiResponse);
      console.log('[DEBUG] AI argument submitted to Firestore (with transcript)');
    } catch (error) {
      console.error('[DEBUG] Failed to generate AI response (with transcript):', error);
    }
  };

  // Show judge selection modal only once at the start of practice mode
  useEffect(() => {
    if (isPracticeMode && currentDebate && currentDebate.arguments.length === 0 && !hasChosenJudge) {
      setShowJudgeSelect(true);
    }
  }, [isPracticeMode, currentDebate, hasChosenJudge]);

  const buildJudgmentPrompt = () => {
    // Build the same JSON-format prompt as for Gemini, but explicit for Deepseek
    const topic = currentDebate?.topic || '';
    const participants = currentDebate?.participants || [];
    const debateArguments = currentDebate?.arguments || [];
    return `You are an expert debate judge. Given the following debate, return ONLY a valid JSON object with these fields:\n{\n  "winner": "<userId of winner>",\n  "scores": {\n    "<userId1>": <score, float, 1 decimal>,\n    "<userId2>": <score, float, 1 decimal>\n  },\n  "feedback": {\n    "<userId1>": ["<feedback1>", ...],\n    "<userId2>": ["<feedback1>", ...]\n  },\n  "reasoning": "<reasoning>",\n  "highlights": ["<highlight1>", ...],\n  "learningPoints": ["<point1>", ...]\n}\nDo NOT include any explanation or text outside the JSON. All scores must be floats with one decimal. Always pick a winner.\nDebate data:\nTOPIC: ${topic}\nPARTICIPANTS: ${participants.map(p => `- ${p.displayName} (${p.stance.toUpperCase()})`).join(' ')}\nARGUMENTS: ${debateArguments.map(arg => `ROUND ${arg.round} - ${participants.find(p => p.userId === arg.userId)?.displayName}: \"${arg.content}\"`).join(' ')}\n`;
  };

  // Handle debate end
  const handleEndDebate = async () => {
    if (!currentDebate || !debateId) return;
    setIsJudging(true);
    try {
      let judgment;
      if (selectedJudge === 'gemini') {
        judgment = await geminiService.judgeDebate(
          currentDebate.topic,
          currentDebate.arguments.map(arg => ({
            id: arg.id,
            userId: arg.userId,
            content: arg.content,
            stance: currentDebate.participants.find(p => p.userId === arg.userId)?.stance || 'pro',
            round: arg.round
          })),
          currentDebate.participants.map(p => ({
            userId: p.userId,
            displayName: p.displayName,
            stance: p.stance
          }))
        );
      } else if (selectedJudge === 'llama' || selectedJudge === 'gemma') {
        const prompt = buildJudgmentPrompt();
        const model = selectedJudge === 'llama' ? 'llama-3.3-70b-versatile' : 'gemma-2b-it';
        const response = await judgeWithGroq(prompt, model);
        if (!response) throw new Error('No response from Groq');
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid response from Groq');
        judgment = JSON.parse(jsonMatch[0]);
      }
      console.log('[DEBUG] Submitting judgment to Firestore:', judgment);
      await endDebate(debateId, judgment); // Only Firestore update triggers UI
      // Do NOT setShowJudgment(true) here
    } catch (error) {
      console.error('Failed to end debate:', error);
    } finally {
      setIsJudging(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (debateId && currentUser) {
      simulateTyping(debateId, currentUser.uid, isTyping);
    }
  };

  // Exit Debate and Judge with Gemini
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [judgmentResult, setJudgmentResult] = useState<any>(null);
  const handleExitDebate = async () => {
    if (!currentDebate || !debateId) return;
    try {
      console.log('[DEBUG] Exiting debate and requesting AI judgment:', debateId);
      // Prepare transcript for judging
      const transcript = currentDebate.arguments.map(arg => {
        const participant = currentDebate.participants.find(p => p.userId === arg.userId);
        return {
          id: arg.id,
          userId: arg.userId,
          content: arg.content,
          stance: participant?.stance || 'pro',
          round: arg.round
        };
      });
      const participants = currentDebate.participants.map(p => ({
        userId: p.userId,
        displayName: p.displayName,
        stance: p.stance
      }));
      // Call Gemini judgeDebate
      const aiJudgment = await geminiService.judgeDebate(
        currentDebate.topic,
        transcript,
        participants
      );
      setJudgmentResult(aiJudgment);
      setShowJudgmentModal(true);
      // Save result to Firestore
      await endDebate(debateId, aiJudgment);
      await updateDoc(doc(firestore, 'debates', debateId), {
        mode: isPracticeMode ? 'practice' : 'live',
        endedBy: currentUser?.uid || ''
      });
      console.log('[DEBUG] AI judgment saved to Firestore:', aiJudgment);
    } catch (error) {
      console.error('[DEBUG] Failed to exit and judge debate:', error);
    }
  };

  // Remove pending argument when backend version appears (but do NOT remove from localSubmittedArguments)
  useEffect(() => {
    if (!currentDebate) return;
    setPendingArguments(prev => prev.filter(localArg => {
      return !currentDebate.arguments.some(realArg =>
        realArg.userId === localArg.userId &&
        realArg.content === localArg.content &&
        realArg.round === localArg.round
      );
    }));
  }, [currentDebate?.arguments]);

  // Start recording (MediaRecorder)
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isFirefox = ua.includes('firefox');
    // Brave detection: navigator.brave is defined, or check for Brave-specific properties
    const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
    setIsBraveOrFirefox(isFirefox || isBrave);
  }, []);

  // Web Speech API: Start recording
  const handleStartRecording = () => {
    setVoiceError(null);
    setIsTranscribing(false);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Web Speech API is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Web Speech API is not available.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setArgument((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };
    recognition.onerror = (event: any) => {
      setVoiceError('Speech recognition error: ' + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    try {
      recognition.start();
    } catch (err: any) {
      setVoiceError('Could not start speech recognition: ' + (err.message || err));
      setIsRecording(false);
    }
  };

  // Web Speech API: Stop recording
  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      setIsRecording(false);
    }
  };

  // After currentDebate is loaded, check if it has zero arguments and delete if so
  const [deleted, setDeleted] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState<number | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown if debate has zero arguments
  useEffect(() => {
    if (
      currentDebate &&
      Array.isArray(currentDebate.arguments) &&
      currentDebate.arguments.length === 0 &&
      currentDebate.id
    ) {
      setDeleteCountdown(60); // 60 seconds countdown
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      // Start interval to update countdown
      const interval = setInterval(() => {
        setDeleteCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      // Set timeout to delete debate after 60 seconds
      deleteTimeoutRef.current = setTimeout(() => {
        const debateRef = doc(firestore, 'debates', currentDebate.id);
        deleteDoc(debateRef).then(() => {
          setDeleted(true);
          navigate('/find-debate');
        });
      }, 60000);
      return () => {
        clearInterval(interval);
        if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      };
    } else {
      setDeleteCountdown(null);
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    }
  }, [currentDebate, navigate]);

  // Cancel timer if an argument is submitted
  useEffect(() => {
    if (
      currentDebate &&
      Array.isArray(currentDebate.arguments) &&
      currentDebate.arguments.length > 0
    ) {
      setDeleteCountdown(null);
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    }
  }, [currentDebate]);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  if (deleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">This debate has been deleted.</div>
        </div>
      </div>
    );
  }

  // --- NEW LAYOUT START ---
  // Force black background
  if (!debateId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">No Debate ID Provided</div>
          <div className="mb-2">Please check the URL or start a new debate.</div>
          </div>
      </div>
    );
  }
  if (isLoading && !currentDebate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Debate...</div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  if (!currentDebate) {
    // Get debate title from store if available
    const debateTitle = useDebateStore.getState().currentDebate?.topic || 'Loading...';
    const toggleTheme = () => {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      document.documentElement.classList.toggle('dark');
    };
    return (
      <>
        <div className="flex flex-col items-center justify-center flex-1 w-full min-h-screen bg-black text-white">
          <div className="mb-6 mt-24">
            {/* Animated SVG Chat Bubble Loader */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
              <defs>
                <clipPath id="bubbleClip">
                  <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"/>
                </clipPath>
              </defs>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#d1d5db" 
                strokeWidth="4.5"/>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#00d4ff" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="10 20"
                opacity="0.8">
                <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-30;0" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#0099cc" 
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="5 25"
                opacity="0.6">
                <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-30;0" repeatCount="indefinite" begin="0.3s"/>
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
              </path>
              <g clipPath="url(#bubbleClip)">
                <path fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="200 250" 
                  strokeDashoffset="0"
                  d="M235 80c0 20-18 32-32 32-38 0-60-65-98-65-18 0-32 14-32 32s15 32 32 32c38 0 60-65 98-65 16 0 32 12 32 32Z">
                  <animate attributeName="stroke-dashoffset" calcMode="spline" dur="2s" values="450;-450" keySplines="0 0 1 1" repeatCount="indefinite"/>
                </path>
              </g>
            </svg>
          </div>
          <div className="text-2xl font-bold mt-2">Loading Debate...</div>
        </div>
        {/* Always show header at the top */}
        <div className="w-full flex items-center justify-between px-6 py-4 bg-black/80 border-b border-gray-800" style={{position: 'sticky', top: 0, left: 0, zIndex: 50}}>
          <div className="text-xl font-bold truncate max-w-[70vw]" title={debateTitle}>{debateTitle}</div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:bg-gray-100 dark:hover:bg-gray-700`}
            title="Toggle light/dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </>
    );
  }

  const myParticipant = currentDebate.participants.find(p => p.userId === currentUser?.uid);
  const opponent = currentDebate.participants.find(p => p.userId !== currentUser?.uid);
  const canSubmit = isMyTurn && argument.trim().length > 0 && !isSubmitting;
  const isDebateActive = currentDebate.status === 'active';
  const isDebateCompleted = currentDebate.status === 'completed';

  // Find the latest message from the current user in local state
  const latestLocalArg = [...pendingArguments, ...localSubmittedArguments]
    .filter(arg => arg.userId === currentUser?.uid)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  // All previous messages from Firebase, excluding the latest from the current user
  const firebaseMessages = currentDebate.arguments
    .filter(arg => !(arg.userId === currentUser?.uid && latestLocalArg && arg.content === latestLocalArg.content && arg.round === latestLocalArg.round))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Compose chat arguments: merge firebaseMessages and latestLocalArg, then sort by timestamp so the latest local user message appears in correct order
  const chatArguments = latestLocalArg
    ? [...firebaseMessages, latestLocalArg].sort((a, b) => a.timestamp - b.timestamp)
    : firebaseMessages;

  // After all error/deleted/404 checks, but before rendering results:
  if (isDebateCompleted && !currentDebate.judgment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <div className="text-2xl font-bold mt-6">Evaluating your debate...</div>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER LOGIC ---
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black text-white" style={{background: '#000'}}>
      {/* Always show header at the top */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-black/80 border-b border-gray-800" style={{position: 'sticky', top: 0, left: 0, zIndex: 50}}>
        <div className="text-xl font-bold truncate max-w-[70vw]" title={currentDebate?.topic || 'Loading...'}>{currentDebate?.topic || 'Loading...'}</div>
        <button
          onClick={() => {
            const newDarkMode = !isDarkMode;
            setIsDarkMode(newDarkMode);
            document.documentElement.classList.toggle('dark');
          }}
          className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          title="Toggle light/dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      {/* Content below header: loading or main debate UI */}
      {!currentDebate ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full min-h-screen bg-black text-white">
          <div className="mb-6 mt-24">
            {/* Animated SVG Chat Bubble Loader */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
              <defs>
                <clipPath id="bubbleClip">
                  <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"/>
                </clipPath>
              </defs>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#d1d5db" 
                strokeWidth="4.5"/>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#00d4ff" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="10 20"
                opacity="0.8">
                <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-30;0" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
                fill="none" 
                stroke="#0099cc" 
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="5 25"
                opacity="0.6">
                <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-30;0" repeatCount="indefinite" begin="0.3s"/>
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
              </path>
              <g clipPath="url(#bubbleClip)">
                <path fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="200 250" 
                  strokeDashoffset="0"
                  d="M235 80c0 20-18 32-32 32-38 0-60-65-98-65-18 0-32 14-32 32s15 32 32 32c38 0 60-65 98-65 16 0 32 12 32 32Z">
                  <animate attributeName="stroke-dashoffset" calcMode="spline" dur="2s" values="450;-450" keySplines="0 0 1 1" repeatCount="indefinite"/>
                </path>
              </g>
            </svg>
          </div>
          <div className="text-2xl font-bold mt-2">Loading Debate...</div>
        </div>
      ) : (
        // ... main debate UI ...
        <>
          {/* Main chat area with WhatsApp-like layout */}
          <div className="flex-1 flex flex-col justify-end px-2 md:px-8 py-6 overflow-y-auto" ref={debateContainerRef} style={{height: 'calc(100vh - 120px)'}}>
            {isJudging && (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <div className="text-white text-lg font-semibold">Your debate is being evaluated...</div>
              </div>
            )}
            {currentDebate.arguments.length === 0 && pendingArguments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="w-12 h-12 mb-4 text-gray-600" />
                <p className="text-lg font-medium">No arguments yet. Be the first to strike! ⚔️</p>
                <p className="text-sm text-gray-500 mt-2">Start the debate with a powerful opening argument</p>
                {deleteCountdown !== null && (
                  <div className="mt-4 text-red-400 text-base font-semibold">
                    This debate will be deleted in {deleteCountdown} second{deleteCountdown !== 1 ? 's' : ''} if no argument is made.
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Merge backend and pending arguments, filter out duplicates */}
                {chatArguments.map((arg, idx, arr) => {
                  const participant = currentDebate.participants.find(p => p.userId === arg.userId) || myParticipant;
                  const isPro = participant?.stance === 'pro';
                  const isCon = participant?.stance === 'con';
                  const isMine = arg.userId === currentUser?.uid;
                  // Avatar image and alignment by stance (con: left, pro: right)
                  const avatarSrc = isPro ? '/pro-right.png' : '/con-left.png';
                  const alignment = isCon ? 'justify-start' : 'justify-end'; // con: left, pro: right
                  const bubbleAlign = isCon ? 'flex-row' : 'flex-row-reverse';
                  return (
                    <div
                      key={arg.id}
                      className={`w-full flex ${alignment} mb-2`}
                    >
                      <div className={`flex ${bubbleAlign} items-end gap-3`} style={{maxWidth: '80%'}}>
                        {/* Even Larger Avatar */}
                        <img
                          src={avatarSrc}
                          alt={isPro ? 'Pro' : 'Con'}
                          className="w-40 h-52 object-contain rounded-3xl border-2 border-gray-700 bg-black shadow-md"
                          style={{minWidth: 160, minHeight: 208}}
                        />
                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-5 py-3 shadow-lg text-base whitespace-pre-line break-words
                            ${isPro ? 'bg-[#1a1a1a] text-green-200 border-r-4 border-green-500' : 'bg-[#181a22] text-red-200 border-l-4 border-red-500'}
                          `}
                          style={{minWidth: '0', flex: 1}}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">
                              {participant?.displayName}
                              {isMine && ' (You)'}
                            </span>
                            <Badge variant={isPro ? 'success' : 'error'} className="text-xs">
                              {participant?.stance?.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">Round {arg.round}</span>
                          </div>
                          <div className="mb-1 text-white/90">{arg.content}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>📝 {arg.wordCount} words</span>
                            <span>{new Date(arg.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* AI Typing Indicator: only when it's AI's turn and after user's pending argument */}
                {isAITyping && !isDebateCompleted && currentDebate.currentTurn === 'ai_opponent' && (
                  <div className="w-full flex justify-end mb-2">
                    <div className="flex flex-row-reverse items-end gap-3 max-w-[80%]">
                      <img
                        src="/pro-right.png"
                        alt="AI Opponent"
                        className="w-32 h-40 object-cover rounded-3xl border-2 border-gray-700 bg-black shadow-md"
                        style={{minWidth: 128, minHeight: 160}}
                      />
                      <div className="rounded-2xl px-5 py-3 shadow-lg text-base bg-[#1a1a1a] border-r-4 border-green-500 flex items-center">
                        <TypingIndicator />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Fixed input at the bottom */}
          <div className="w-full bg-[#101010] border-t border-gray-800 px-2 md:px-8 py-4 flex flex-col gap-0 sticky bottom-0 z-20" style={{boxShadow: '0 -2px 16px 0 #0008'}}>
            {/* Drag handle */}
            <div
              ref={dragHandleRef}
              className="w-full h-3 flex items-center justify-center cursor-ns-resize select-none"
              style={{marginBottom: '2px'}}
              onMouseDown={e => {
                draggingRef.current = true;
                lastYRef.current = e.clientY;
              }}
            >
              <div className="w-16 h-1.5 rounded bg-gray-700" />
            </div>
            <div className="flex items-center gap-3">
              {/* End Debate button on the left */}
              <Button
                onClick={handleEndDebate}
                disabled={!currentDebate || isSubmitting || isDebateCompleted}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl mr-2 ${isDebateCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                title="End Debate"
              >
                <Flag className="w-5 h-5" />
              </Button>
              {/* Voice input button: hide on Brave/Firefox */}
              {!isBraveOrFirefox && (
                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isTranscribing || isSubmitting || isDebateCompleted}
                  className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-2 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-700 text-white'} ${isTranscribing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
              {/* Argument input */}
              <textarea
                ref={argumentInputRef}
                value={argument}
                onChange={e => {
                  setArgument(e.target.value);
                  handleTyping(e.target.value.length > 0);
                }}
                onBlur={() => handleTyping(false)}
                placeholder={isDebateCompleted ? 'Debate has ended.' : isMyTurn ? 'Type your argument...' : 'Waiting for your turn...'}
                disabled={!isMyTurn || isSubmitting || isDebateCompleted || isTranscribing}
                className={`flex-1 rounded-xl px-4 py-3 text-base border-2 focus:ring-2 transition-all duration-200
                  ${isMyTurn && !isDebateCompleted ? 'border-green-500 focus:ring-green-600' : 'border-gray-700'}
                  bg-black text-white placeholder-gray-500
                  ${!isMyTurn || isSubmitting || isDebateCompleted || isTranscribing ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{height: inputHeight, minHeight: 48, maxHeight: 240, resize: 'none'}}
                rows={2}
              />
              {/* Send button */}
              <Button
                onClick={handleSubmitArgument}
                disabled={!isMyTurn || !argument.trim() || isSubmitting || isDebateCompleted || isTranscribing}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2
                  ${isMyTurn && argument.trim() && !isSubmitting && !isDebateCompleted && !isTranscribing ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                `}
                title="Send Argument"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SendIcon className="w-5 h-5" />
                )}
              </Button>
            </div>
            {/* Transcribing/recording status and errors */}
            {isRecording && (
              <div className="text-sm text-blue-400 mt-2 flex items-center gap-2 animate-pulse">
                <span>Recording... Speak now.</span>
              </div>
            )}
            {isTranscribing && (
              <div className="text-sm text-blue-400 mt-2 flex items-center gap-2 animate-pulse">
                <span>Transcribing voice input...</span>
              </div>
            )}
            {voiceError && (
              <div className="text-sm text-red-400 mt-2 flex items-center gap-2">
                <span>{voiceError}</span>
              </div>
            )}
          </div>
          {/* After the chat area, but before the modals, add a new section for winner and scores if debate is completed and judgment is present */}
          {isDebateCompleted && currentDebate.judgment && (() => {
            const judgment = currentDebate.judgment;
            // Winner: try userId, then displayName
            let winnerId = judgment.winner;
            let winnerParticipant = currentDebate.participants.find(
              p => p.userId === winnerId || p.displayName === winnerId
            );
            let winnerName = winnerParticipant?.displayName || winnerId || "No winner";
            // Scores: robust mapping
            const getScore = (uid: string) => {
              if (judgment.scores?.[uid] !== undefined) return judgment.scores[uid];
              // Try to find by displayName if not found by userId
              const participant = currentDebate.participants.find(p => p.displayName === uid);
              if (participant && judgment.scores?.[participant.userId] !== undefined) {
                return judgment.scores[participant.userId];
              }
              return null;
            };
            return (
              <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-[#181a22] rounded-2xl border border-gray-700 text-white">
                <div className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span>🏆 Winner:</span>
                  <span className="text-green-400">{winnerName}</span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                  {currentDebate.participants.map((participant) => {
                    const score = getScore(participant.userId) ?? getScore(participant.displayName);
                    return (
                      <div key={participant.userId} className="flex-1 bg-[#101014] rounded-xl p-4 border border-gray-800">
                        <div className="font-semibold text-lg mb-1">{participant.displayName}</div>
                        <div className="text-2xl font-bold text-blue-400 mb-2">
                          {typeof score === 'number' ? score.toFixed(1) + '/10' : 'No score returned by judge'}
                        </div>
                        <ul className="text-sm text-gray-300 list-disc pl-5">
                          {(judgment.feedback?.[participant.userId] || judgment.feedback?.[participant.displayName] || []).map((fb, i) => (
                            <li key={i}>{fb}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {/* Modals, overlays, and toasts remain unchanged below */}

          {/* Coaching Tip Modal */}
          <Modal
            open={showCoaching}
            onClose={() => setShowCoaching(false)}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Coaching Tip</h3>
              <p className="text-gray-700 mb-4">{coachingTip}</p>
              <Button onClick={() => setShowCoaching(false)}>
                Got it!
              </Button>
            </div>
          </Modal>

          {/* Judgment Modal */}
          <Modal
            open={showJudgment}
            onClose={() => setShowJudgment(false)}
          >
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {currentDebate.judgment && (() => {
                const judgment = currentDebate.judgment as typeof currentDebate.judgment & { learningPoints?: string[] };
                // Winner: try userId, then displayName
                let winnerId = judgment.winner;
                let winnerParticipant = currentDebate.participants.find(
                  p => p.userId === winnerId || p.displayName === winnerId
                );
                let winnerName = winnerParticipant?.displayName || winnerId || "No winner";
                // Scores: robust mapping
                const getScore = (uid: string) => {
                  if (judgment.scores?.[uid] !== undefined) return judgment.scores[uid];
                  // Try to find by displayName if not found by userId
                  const participant = currentDebate.participants.find(p => p.displayName === uid);
                  if (participant && judgment.scores?.[participant.userId] !== undefined) {
                    return judgment.scores[participant.userId];
                  }
                  return null;
                };
                // Feedback: robust mapping
                const getFeedback = (uid: string) => {
                  return (
                    judgment.feedback?.[uid] ||
                    judgment.feedback?.[currentDebate.participants.find(p => p.userId === uid)?.displayName || ''] ||
                    []
                  );
                };
                return (
                  <div className="space-y-6">
                    {/* Winner */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        🏆 Winner: {winnerName}
                      </h3>
                      <p className="text-gray-600">{judgment.reasoning}</p>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentDebate.participants.map((participant) => {
                        const score = getScore(participant.userId) ?? getScore(participant.displayName);
                        const feedbackArr = getFeedback(participant.userId);
                        return (
                          <div key={participant.userId} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">{participant.displayName}</h4>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {typeof score === 'number' ? `${score.toFixed(1)}/10` : 'No score returned by judge'}
                            </div>
                            <div className="space-y-1">
                              {feedbackArr.length > 0 ? feedbackArr.map((feedback, index) => (
                                <p key={index} className="text-sm text-gray-600">• {feedback}</p>
                              )) : <p className="text-sm text-gray-400">No feedback</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Highlights */}
                    <div>
                      <h4 className="font-semibold mb-2">Debate Highlights</h4>
                      <ul className="space-y-1">
                        {judgment.highlights?.map((highlight, index) => (
                          <li key={index} className="text-sm text-gray-600">• {highlight}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Learning Points */}
                    <div>
                      <h4 className="font-semibold mb-2">Learning Points</h4>
                      <ul className="space-y-1">
                        {Array.isArray((judgment as any).learningPoints) && (judgment as any).learningPoints.length > 0 ? (judgment as any).learningPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">• {point}</li>
                        )) : (
                          <>
                            <li className="text-sm text-gray-600">• Continue practicing debate skills</li>
                            <li className="text-sm text-gray-600">• Focus on evidence and logical structure</li>
                            <li className="text-sm text-gray-600">• Improve rebuttal techniques</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/find-debate')}
                        className="flex-1"
                      >
                        Find New Debate
                      </Button>
                      <Button
                        onClick={() => setShowJudgment(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Modal>

          {/* Winner Animation */}
          {showWinner && currentDebate.judgment && (
            <ConfettiAnimation />
          )}

          {/* Error Toast */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => {}} className="ml-4 text-white hover:text-gray-200">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Judgment Result Modal */}
          {showJudgmentModal && judgmentResult && (
            <Modal open={showJudgmentModal} onClose={() => setShowJudgmentModal(false)}>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">AI Debate Result</h3>
                <div className="mb-2"><strong>Winner:</strong> {currentDebate?.participants.find(p => p.userId === judgmentResult.winner)?.displayName || 'N/A'}</div>
                <div className="mb-2"><strong>Reasoning:</strong> {judgmentResult.reasoning}</div>
                <div className="mb-2"><strong>Scores:</strong></div>
                <ul className="mb-2">
                  {judgmentResult.scores && typeof judgmentResult.scores === 'object' &&
                    (Object.entries(judgmentResult.scores) as [string, number][]).map(([uid, score], idx) => (
                      <li key={uid || idx}>
                        {currentDebate?.participants.find(p => p.userId === uid)?.displayName || uid}: {typeof score === 'number' && !isNaN(score) && score !== undefined ? `${score}/10` : 'N/A'}
                      </li>
                    ))}
                </ul>
                <div className="mb-2"><strong>Areas to Improve:</strong></div>
                <ul>
                  {judgmentResult.learningPoints?.map((point: string, idx: number) => (
                    <li key={idx}>• {point}</li>
                  ))}
                </ul>
                {judgmentResult.highlights && judgmentResult.highlights.length > 0 && (
                  <>
                    <div className="mt-4 mb-2 font-semibold">Debate Highlights</div>
                    <ul>
                      {judgmentResult.highlights.map((highlight: string, idx: number) => (
                        <li key={idx}>• {highlight}</li>
                      ))}
                    </ul>
                  </>
                )}
                <Button onClick={() => setShowJudgmentModal(false)} className="mt-4">Close</Button>
              </div>
            </Modal>
          )}

          {/* Judge Selection Modal */}
          {showJudgeSelect && (
            <Modal open={showJudgeSelect} onClose={() => {}}>
              <div className="p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">Choose your Judge</h3>
                <select
                  className="w-full p-2 rounded border border-gray-400 mb-4 text-black"
                  value={selectedJudge}
                  onChange={e => setSelectedJudge(e.target.value as 'gemini' | 'llama' | 'gemma')}
                >
                  <option value="gemini">Gemini (Google)</option>
                  <option value="llama">Llama-70b (Groq)</option>
                  <option value="gemma">Gemma2-9b (Groq)</option>
                </select>
                <Button onClick={() => { setShowJudgeSelect(false); setHasChosenJudge(true); }} className="w-full">Start Debate</Button>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};
