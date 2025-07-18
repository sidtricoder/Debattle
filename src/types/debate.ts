export interface Debate {
  id: string;
  topic: DebateTopic;
  participants: DebateParticipant[];
  status: DebateStatus;
  currentTurn: number;
  timePerTurn: number;
  totalTurns: number;
  arguments: DebateArgument[];
  judgments: DebateJudgment[];
  winner?: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  settings: DebateSettings;
  spectators: string[];
  chatMessages: ChatMessage[];
  // Practice mode fields
  isPractice?: boolean;
  practiceSettings?: {
    aiProvider: 'gemini' | 'llama' | 'gemma';
    timeoutSeconds: number;
    numberOfRounds: number;
    userStance: 'pro' | 'con';
  };
  aiPersonality?: string;
  practiceTips?: string[];
  currentRound?: number;
  judgment?: any;
}

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: TopicCategory;
  difficulty: TopicDifficulty;
  tags: string[];
  isCustom: boolean;
  createdBy?: string;
  usageCount: number;
  rating: number;
}

export interface DebateParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  tier: string;
  position: DebatePosition;
  isReady: boolean;
  isOnline: boolean;
  lastSeen: Date;
}

export interface DebateArgument {
  id: string;
  debateId: string;
  userId: string;
  content: string;
  turn: number;
  timestamp: Date;
  wordCount: number;
  timeUsed: number;
  scores?: ArgumentScores;
}

export interface ArgumentScores {
  logic: number;
  evidence: number;
  clarity: number;
  rebuttal: number;
  overall: number;
}

export interface DebateJudgment {
  id: string;
  debateId: string;
  judgeType: 'ai' | 'human';
  judgeId: string;
  scores: {
    [userId: string]: ArgumentScores;
  };
  feedback: {
    [userId: string]: string;
  };
  winner: string;
  reasoning: string;
  timestamp: Date;
}

export interface DebateSettings {
  timePerTurn: number;
  totalTurns: number;
  isRated: boolean;
  isPublic: boolean;
  allowSpectators: boolean;
  judgeType: 'ai' | 'community' | 'expert';
  difficulty: TopicDifficulty;
}

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'reaction';
}

export type DebateStatus = 
  | 'waiting'
  | 'starting'
  | 'in_progress'
  | 'paused'
  | 'judging'
  | 'completed'
  | 'cancelled'
  | 'abandoned';

export type DebatePosition = 'for' | 'against';

export type TopicCategory = 
  | 'politics'
  | 'technology'
  | 'science'
  | 'philosophy'
  | 'ethics'
  | 'economics'
  | 'social'
  | 'environment'
  | 'education'
  | 'health'
  | 'entertainment'
  | 'sports'
  | 'custom';

export type TopicDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface DebateRoom {
  id: string;
  debate: Debate;
  isActive: boolean;
  connectedUsers: string[];
  lastActivity: Date;
}

export interface MatchmakingRequest {
  userId: string;
  preferredTopics: string[];
  ratingRange: [number, number];
  timePerTurn: number;
  totalTurns: number;
  isRated: boolean;
  timestamp: Date;
}

export interface DebateInvite {
  id: string;
  fromUserId: string;
  toUserId: string;
  topicId: string;
  settings: DebateSettings;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface DebateStats {
  totalDebates: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  favoriteTopics: TopicCategory[];
  recentPerformance: number[];
}

export interface TournamentBracket {
  id: string;
  name: string;
  participants: string[];
  rounds: TournamentRound[];
  status: 'upcoming' | 'active' | 'completed';
  prize: string;
  entryFee: number;
  startDate: Date;
  endDate: Date;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentMatch {
  id: string;
  participant1: string;
  participant2: string;
  winner?: string;
  debateId?: string;
  scheduledTime: Date;
}