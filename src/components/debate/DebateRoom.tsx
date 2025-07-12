import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDebateStore } from '../../stores/debateStore';
import { useAuthStore } from '../../stores/authStore';
import { geminiService } from '../../services/ai/gemini';
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
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

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
  
  const argumentInputRef = useRef<HTMLTextAreaElement>(null);
  const debateContainerRef = useRef<HTMLDivElement>(null);

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
      console.log('[DEBUG] handleSubmitArgument called');
      await submitArgument(debateId, currentUser.uid, argument.trim());
      setArgument('');
      
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
        // Only respond if last argument is from user and not already handled
        setLastAIGeneratedArgumentId(lastArg.id);
        // Prepare the full transcript for Gemini
        const transcript = currentDebate.arguments.map(arg => {
          const participant = currentDebate.participants.find(p => p.userId === arg.userId);
          return `${participant?.displayName || arg.userId} (${participant?.stance?.toUpperCase() || ''}): ${arg.content}`;
        }).join('\n');
        console.log('[DEBUG] AI transcript for Gemini:', transcript);
        generateAIResponseWithTranscript(transcript);
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

  // Handle debate end
  const handleEndDebate = async () => {
    if (!currentDebate || !debateId) return;

    try {
      const judgment = await geminiService.judgeDebate(
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

      await endDebate(debateId, judgment);
      setShowJudgment(true);
    } catch (error) {
      console.error('Failed to end debate:', error);
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

  if (!debateId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Debate Not Found</h2>
          <Button onClick={() => navigate('/find-debate')}>
            Find a Debate
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentDebate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Debate...</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const myParticipant = currentDebate.participants.find(p => p.userId === currentUser?.uid);
  const opponent = currentDebate.participants.find(p => p.userId !== currentUser?.uid);
  const canSubmit = isMyTurn && argument.trim().length > 0 && !isSubmitting;
  const isDebateActive = currentDebate.status === 'active';
  const isDebateCompleted = currentDebate.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentDebate.topic}
                {isPracticeMode && (
                  <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Practice Mode
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant={currentDebate.status === 'active' ? 'success' : 'default'}>
                  {currentDebate.status.toUpperCase()}
                </Badge>
                <Badge variant="primary">
                  Round {currentDebate.currentRound}/{currentDebate.maxRounds}
                </Badge>
                <Badge variant="primary">
                  {currentDebate.category}
                </Badge>
                {isPracticeMode && (
                  <Badge variant="accent">
                    AI Opponent
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              {isDebateActive && (
                <div className="mb-2">
                  <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
              
              {isMyTurn && isDebateActive && (
                <Badge variant="success" className="animate-pulse">
                  YOUR TURN
                </Badge>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            {currentDebate.participants.map((participant) => (
              <div
                key={participant.userId}
                className={`p-4 rounded-lg border-2 ${
                  participant.userId === currentUser?.uid
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {participant.displayName}
                    {participant.userId === currentUser?.uid && ' (You)'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={participant.stance === 'pro' ? 'success' : 'error'}>
                      {participant.stance.toUpperCase()}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${
                      participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Rating: {participant.rating}
                </div>
                
                {participant.isTyping && (
                  <TypingIndicator />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Debate Arguments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-96">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Debate Arguments</h3>
              </div>
              
              <div 
                ref={debateContainerRef}
                className="p-4 h-80 overflow-y-auto space-y-4"
              >
                {currentDebate.arguments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No arguments yet. Be the first to speak!</p>
                  </div>
                ) : (
                  currentDebate.arguments.map((arg) => {
                    const participant = currentDebate.participants.find(p => p.userId === arg.userId);
                    const isMyArgument = arg.userId === currentUser?.uid;
                    
                    return (
                      <div
                        key={arg.id}
                        className={`p-4 rounded-lg ${
                          isMyArgument
                            ? 'bg-blue-100 border-l-4 border-blue-500'
                            : 'bg-gray-100 border-l-4 border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {participant?.displayName}
                            </span>
                            <Badge variant={participant?.stance === 'pro' ? 'success' : 'error'}>
                              {participant?.stance.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Round {arg.round}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(arg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{arg.content}</p>
                        
                        <div className="text-sm text-gray-500">
                          {arg.wordCount} words
                        </div>
                        
                        {arg.aiFeedback && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border">
                            <div className="text-sm font-semibold text-yellow-800 mb-1">
                              AI Feedback
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>Strength: {arg.aiFeedback.strengthScore}/10</div>
                              <div>Clarity: {arg.aiFeedback.clarityScore}/10</div>
                              <div>Evidence: {arg.aiFeedback.evidenceScore}/10</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Argument Input */}
            <Card className="mt-4">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {isMyTurn ? 'Your Turn - Submit Your Argument' : 'Waiting for opponent...'}
                  </h3>
                  {isMyTurn && (
                    <Button
                      variant="outline"
                      onClick={getCoachingTip}
                      disabled={!currentDebate.arguments.length}
                    >
                      Get Coaching Tip
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <textarea
                    ref={argumentInputRef}
                    value={argument}
                    onChange={(e) => {
                      setArgument(e.target.value);
                      handleTyping(e.target.value.length > 0);
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder={
                      isMyTurn
                        ? "Type your argument here... (Minimum 50 words)"
                        : "Waiting for your turn..."
                    }
                    disabled={!isMyTurn || isSubmitting}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {argument.length} characters, {argument.split(' ').length} words
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setArgument('')}
                        disabled={!argument.trim() || !isMyTurn}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleSubmitArgument}
                        disabled={!canSubmit}
                        loading={isSubmitting}
                      >
                        Submit Argument
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Exit Debate Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="secondary"
                    onClick={handleExitDebate}
                  >
                    Exit Debate
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Practice Tips */}
            {isPracticeMode && currentDebate.practiceTips && (
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Practice Tips</h3>
                  <div className="space-y-2">
                    {currentDebate.practiceTips.map((tip, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* AI Personality */}
            {isPracticeMode && currentDebate.aiPersonality && (
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">AI Opponent</h3>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Personality:</div>
                    <div>{currentDebate.aiPersonality}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Debate Info */}
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Debate Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Topic:</span>
                    <p className="text-gray-600">{currentDebate.topic}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="text-gray-600 ml-1">{currentDebate.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span>
                    <span className="text-gray-600 ml-1">{currentDebate.difficulty}/10</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Arguments:</span>
                    <span className="text-gray-600 ml-1">{currentDebate.arguments.length}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Progress */}
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Rounds</span>
                      <span>{currentDebate.currentRound}/{currentDebate.maxRounds}</span>
                    </div>
                    <Progress 
                      value={(currentDebate.currentRound / currentDebate.maxRounds) * 100} 
                    />
                  </div>
                  
                  {isDebateActive && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Time</span>
                        <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <Progress 
                        value={(timeRemaining / 3600) * 100} 
                        variant="warning"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
                <div className="space-y-2">
                  {isDebateActive && currentDebate.arguments.length >= 6 && (
                    <Button
                      variant="secondary"
                      onClick={handleEndDebate}
                      className="w-full"
                    >
                      End Debate
                    </Button>
                  )}
                  
                  {isPracticeMode ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/practice')}
                        className="w-full"
                      >
                        New Practice Session
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate('/find-debate')}
                        className="w-full"
                      >
                        Try Real Debate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/find-debate')}
                        className="w-full"
                      >
                        Find New Debate
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate('/practice')}
                        className="w-full"
                      >
                        Practice Mode
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/history')}
                    className="w-full"
                  >
                    View History
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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
        <div className="p-6">
          {currentDebate.judgment && (
            <div className="space-y-6">
              {/* Winner */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  🏆 Winner: {currentDebate.participants.find(p => p.userId === currentDebate.judgment?.winner)?.displayName}
                </h3>
                <p className="text-gray-600">{currentDebate.judgment.reasoning}</p>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                {currentDebate.participants.map((participant) => (
                  <div key={participant.userId} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{participant.displayName}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {currentDebate.judgment?.scores[participant.userId]}/10
                    </div>
                    <div className="space-y-1">
                      {currentDebate.judgment?.feedback[participant.userId]?.map((feedback, index) => (
                        <p key={index} className="text-sm text-gray-600">• {feedback}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-semibold mb-2">Debate Highlights</h4>
                <ul className="space-y-1">
                  {currentDebate.judgment?.highlights?.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-600">• {highlight}</li>
                  ))}
                </ul>
              </div>

              {/* Learning Points */}
              <div>
                <h4 className="font-semibold mb-2">Learning Points</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-600">• Continue practicing debate skills</li>
                  <li className="text-sm text-gray-600">• Focus on evidence and logical structure</li>
                  <li className="text-sm text-gray-600">• Improve rebuttal techniques</li>
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
          )}
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
          <div className="p-6" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
    </div>
  );
};
