// API service for Gemini integration and other external services
import { firestore } from './firebase';
import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

export interface AIJudgment {
  winner: string;
  scores: Record<string, number>;
  feedback: Record<string, string[]>;
  reasoning: string;
  fallaciesDetected: string[];
  highlights: string[];
  overallScore: number;
}

export interface AIArgument {
  content: string;
  strengthScore: number;
  clarityScore: number;
  evidenceScore: number;
  feedback: string;
}

export interface DebateContext {
  topic: string;
  arguments: Array<{
    userId: string;
    content: string;
    stance: 'pro' | 'con';
    timestamp: number;
  }>;
  participants: Array<{
    userId: string;
    displayName: string;
    stance: 'pro' | 'con';
  }>;
}

class GeminiJudgeService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  }

  async judgeDebate(context: DebateContext): Promise<AIJudgment> {
    if (!this.apiKey) {
      return this.mockJudgment(context);
    }

    try {
      const prompt = this.buildJudgmentPrompt(context);
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      return this.parseJudgmentResponse(result);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.mockJudgment(context);
    }
  }

  async generateAIArgument(context: DebateContext, stance: 'pro' | 'con'): Promise<AIArgument> {
    if (!this.apiKey) {
      return this.mockAIArgument(context, stance);
    }

    try {
      const prompt = this.buildArgumentPrompt(context, stance);
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      return this.parseArgumentResponse(result);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.mockAIArgument(context, stance);
    }
  }

  private buildJudgmentPrompt(context: DebateContext): string {
    return `You are an expert debate judge. Analyze the following debate and provide a comprehensive judgment.

Topic: ${context.topic}

Arguments:
${context.arguments.map(arg => 
  `${arg.stance.toUpperCase()}: ${arg.content}`
).join('\n\n')}

Participants:
${context.participants.map(p => 
  `${p.displayName} (${p.stance})`
).join('\n')}

Please provide your judgment in the following JSON format:
{
  "winner": "userId of the winner",
  "scores": {
    "userId1": 85,
    "userId2": 78
  },
  "feedback": {
    "userId1": ["Strengths: ...", "Areas for improvement: ..."],
    "userId2": ["Strengths: ...", "Areas for improvement: ..."]
  },
  "reasoning": "Detailed explanation of the decision",
  "fallaciesDetected": ["list of logical fallacies found"],
  "highlights": ["key moments or arguments"],
  "overallScore": 82
}`;
  }

  private buildArgumentPrompt(context: DebateContext, stance: 'pro' | 'con'): string {
    return `You are an AI debate opponent arguing the ${stance} position on the topic: "${context.topic}"

Previous arguments in the debate:
${context.arguments.map(arg => 
  `${arg.stance.toUpperCase()}: ${arg.content}`
).join('\n\n')}

Generate a compelling ${stance.toUpperCase()} argument that:
1. Addresses the topic directly
2. Responds to previous arguments
3. Uses logical reasoning and evidence
4. Is clear and persuasive
5. Is 150-300 words

Provide your response in JSON format:
{
  "content": "Your argument text here",
  "strengthScore": 85,
  "clarityScore": 90,
  "evidenceScore": 80,
  "feedback": "Self-assessment of the argument"
}`;
  }

  private parseJudgmentResponse(response: string): AIJudgment {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse judgment response:', error);
      return this.mockJudgment({ topic: '', arguments: [], participants: [] });
    }
  }

  private parseArgumentResponse(response: string): AIArgument {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse argument response:', error);
      return this.mockAIArgument({ topic: '', arguments: [], participants: [] }, 'pro');
    }
  }

  private mockJudgment(context: DebateContext): AIJudgment {
    const participants = context.participants;
    const winner = participants[Math.floor(Math.random() * participants.length)];
    
    return {
      winner: winner.userId,
      scores: participants.reduce((acc, p) => {
        acc[p.userId] = Math.floor(Math.random() * 30) + 70; // 70-100
        return acc;
      }, {} as Record<string, number>),
      feedback: participants.reduce((acc, p) => {
        acc[p.userId] = [
          `Strong logical reasoning and clear argument structure.`,
          `Could improve evidence presentation and counter-arguments.`
        ];
        return acc;
      }, {} as Record<string, string[]>),
      reasoning: `The debate was well-structured with both participants presenting compelling arguments. ${winner.displayName} demonstrated superior logical consistency and evidence usage, making them the clear winner.`,
      fallaciesDetected: ['Straw man fallacy', 'Appeal to authority'],
      highlights: [
        'Strong opening arguments from both sides',
        'Effective use of evidence and examples',
        'Clear logical progression throughout the debate'
      ],
      overallScore: Math.floor(Math.random() * 20) + 80
    };
  }

  private mockAIArgument(context: DebateContext, stance: 'pro' | 'con'): AIArgument {
    const mockArguments = {
      pro: {
        content: `I strongly support the ${stance} position on this topic. The evidence clearly shows that this approach leads to better outcomes for all parties involved. Recent studies have demonstrated significant benefits, and the logical reasoning behind this stance is sound and well-supported by empirical data.`,
        strengthScore: 85,
        clarityScore: 90,
        evidenceScore: 80,
        feedback: 'Strong argument with good evidence and clear reasoning.'
      },
      con: {
        content: `I must respectfully disagree with the opposing position. The ${stance} stance has several fundamental flaws that undermine its effectiveness. Historical data and current research indicate that alternative approaches would be more beneficial and sustainable in the long term.`,
        strengthScore: 82,
        clarityScore: 88,
        evidenceScore: 85,
        feedback: 'Well-structured counter-argument with solid evidence.'
      }
    };

    return mockArguments[stance];
  }
}

// Export the service instance
export const geminiJudgeService = new GeminiJudgeService();

// Additional API utilities
export const api = {
  // Get user stats from Firestore
  async getUserStats(userId: string) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const wins = userData.wins || 0;
      const losses = userData.losses || 0;
      const draws = userData.draws || 0;
      const totalDebates = wins + losses + draws;
      const winRate = totalDebates > 0 ? wins / totalDebates : 0;
      
      return {
        userId,
        totalDebates,
        wins,
        losses,
        draws,
        winRate,
        averageRating: userData.rating || 1000,
        currentStreak: userData.winStreak || 0,
        bestStreak: userData.bestStreak || 0,
        totalArguments: userData.totalArguments || 0,
        averageArgumentScore: userData.averageArgumentScore || 0
      };
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get user achievements from Firestore
  async getUserAchievements(userId: string) {
    try {
      const userAchievementsQuery = query(
        collection(firestore, 'user_achievements'),
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      );
      
      const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
      const userAchievementIds = userAchievementsSnapshot.docs.map(doc => doc.data().achievementId);
      
      // Get achievement details
      const achievements = [];
      for (const achievementId of userAchievementIds) {
        const achievementDoc = await getDoc(doc(firestore, 'achievements', achievementId));
        if (achievementDoc.exists()) {
          const achievementData = achievementDoc.data();
          const userAchievementDoc = userAchievementsSnapshot.docs.find(
            doc => doc.data().achievementId === achievementId
          );
          
          achievements.push({
            id: achievementId,
            name: achievementData.name,
            description: achievementData.description,
            earned: true,
            earnedAt: userAchievementDoc?.data().unlockedAt?.toDate() || new Date()
          });
        }
      }
      
      return achievements;
    } catch (error: any) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },

  // Get notifications from Firestore
  async getNotifications(userId: string) {
    try {
      const notificationsQuery = query(
        collection(firestore, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      return notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          timestamp: data.createdAt?.toDate() || new Date(),
          read: data.read || false
        };
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
}; 