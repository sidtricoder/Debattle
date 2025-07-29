import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface DebateAnalysis {
  strengthScore: number;
  clarityScore: number;
  evidenceScore: number;
  feedback: string;
  fallaciesDetected: string[];
  suggestions: string[];
}

export interface DebateJudgment {
  winner: string;
  scores: Record<string, number>;
  feedback: Record<string, string[]>;
  reasoning: string;
  fallaciesDetected: string[];
  highlights: string[];
  overallQuality: number;
  learningPoints: string[];
}

export interface ArgumentEvaluation {
  argumentId: string;
  analysis: DebateAnalysis;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  // Analyze a single argument
  async analyzeArgument(
    argument: string,
    topic: string,
    stance: 'pro' | 'con',
    round: number
  ): Promise<DebateAnalysis> {
    const prompt = `You are an expert debate judge analyzing an argument in a competitive debate.

TOPIC: ${topic}
STANCE: ${stance.toUpperCase()}
ROUND: ${round}
ARGUMENT: "${argument}"

Please analyze this argument and provide scores (1-10) and detailed feedback in the following JSON format:

{
  "strengthScore": <score>,
  "clarityScore": <score>, 
  "evidenceScore": <score>,
  "feedback": "<detailed feedback>",
  "fallaciesDetected": ["<fallacy1>", "<fallacy2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}

Scoring criteria:
- Strength Score: Logical coherence, persuasiveness, argumentative power
- Clarity Score: Clear expression, structure, understandability  
- Evidence Score: Use of facts, examples, citations, supporting evidence

Fallacies to watch for: ad hominem, straw man, false dilemma, appeal to authority, hasty generalization, slippery slope, circular reasoning, red herring, appeal to emotion, bandwagon fallacy.

Provide constructive, specific feedback that would help improve the argument.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }
      
      const analysis = JSON.parse(jsonMatch[0]) as DebateAnalysis;
      
      // Validate scores
      analysis.strengthScore = Math.max(1, Math.min(10, analysis.strengthScore));
      analysis.clarityScore = Math.max(1, Math.min(10, analysis.clarityScore));
      analysis.evidenceScore = Math.max(1, Math.min(10, analysis.evidenceScore));
      
      return analysis;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      // Return default analysis on error
      return {
        strengthScore: 5,
        clarityScore: 5,
        evidenceScore: 5,
        feedback: 'Unable to analyze argument due to technical issues.',
        fallaciesDetected: [],
        suggestions: ['Please ensure your argument is clear and well-structured.']
      };
    }
  }

  // Judge the entire debate
  async judgeDebate(
    topic: string,
    debateArguments: Array<{
      id: string;
      userId: string;
      content: string;
      stance: 'pro' | 'con';
      round: number;
    }>,
    participants: Array<{
      userId: string;
      displayName: string;
      stance: 'pro' | 'con';
    }>
  ): Promise<DebateJudgment> {
    const prompt = `You are an expert debate judge evaluating a complete competitive debate.

TOPIC: ${topic}

PARTICIPANTS:
${participants.map(p => `- ${p.displayName} (${p.stance.toUpperCase()})`).join('\n')}

DEBATE ARGUMENTS:
${debateArguments.map(arg => `
ROUND ${arg.round} - ${arg.stance.toUpperCase()} (${participants.find(p => p.userId === arg.userId)?.displayName}):
"${arg.content}"
`).join('\n')}

Please provide a comprehensive judgment in the following JSON format:

{
  "winner": "<userId of winner>",
  "scores": {
    "<userId1>": <overall_score_1-10, float, one decimal>,
    "<userId2>": <overall_score_1-10, float, one decimal>
  },
  "feedback": {
    "<userId1>": ["<strength1>", "<weakness1>", "<improvement1>"],
    "<userId2>": ["<strength1>", "<weakness1>", "<improvement1>"]
  },
  "reasoning": "<detailed explanation of winner decision>",
  "fallaciesDetected": ["<fallacy1>", "<fallacy2>"],
  "highlights": ["<highlight1>", "<highlight2>"],
  "overallQuality": <1-10>,
  "learningPoints": ["<learning_point1>", "<learning_point2>"]
}

IMPORTANT:
- If no arguments were provided by any debater, declare a draw by setting the winner to null and providing equal scores.
- Otherwise, always provide a clear winner (the userId of the winning participant).
- Always provide a score for each participant as a float with one decimal place (e.g., 8.7).
- Do not omit any fields from the JSON.
- If you cannot determine a winner (and there are arguments), choose the participant with the most persuasive arguments and evidence.
- The JSON must be valid and parseable.

Evaluation criteria:
1. Argument strength and logical coherence
2. Evidence and support for claims
3. Rebuttal effectiveness
4. Clarity and communication
5. Respect for debate format and opponent
6. Overall persuasiveness

Consider the flow of the debate, how well each participant built on previous arguments, and the quality of rebuttals.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }
      
      const judgment = JSON.parse(jsonMatch[0]) as DebateJudgment;
      
      // Validate scores
      Object.keys(judgment.scores).forEach(userId => {
        judgment.scores[userId] = Math.max(1, Math.min(10, judgment.scores[userId]));
      });
      judgment.overallQuality = Math.max(1, Math.min(10, judgment.overallQuality));
      
      return judgment;
    } catch (error) {
      console.error('Gemini judgment error:', error);
      // Return default judgment on error
      const defaultWinner = participants[0]?.userId || '';
      return {
        winner: defaultWinner,
        scores: Object.fromEntries(participants.map(p => [p.userId, 5])),
        feedback: Object.fromEntries(participants.map(p => [p.userId, ['Good effort in the debate.']])),
        reasoning: 'Unable to provide detailed judgment due to technical issues.',
        fallaciesDetected: [],
        highlights: ['Both participants engaged in the debate format.'],
        overallQuality: 5,
        learningPoints: ['Continue practicing debate skills and argument construction.']
      };
    }
  }

  // Generate debate topics
  async generateTopics(category: string, difficulty: number, count: number = 5): Promise<string[]> {
    const prompt = `Generate ${count} engaging debate topics for a competitive debate platform.

CATEGORY: ${category}
DIFFICULTY LEVEL: ${difficulty}/10 (1=easy, 10=expert)

Requirements:
- Topics should be balanced (no obvious right/wrong answer)
- Appropriate complexity for difficulty level
- Engaging and thought-provoking
- Suitable for structured debate format
- Current and relevant

Return only the topics as a JSON array:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }
      
      return JSON.parse(jsonMatch[0]) as string[];
    } catch (error) {
      console.error('Gemini topic generation error:', error);
      // Return default topics
      return [
        'Should social media platforms be regulated more strictly?',
        'Is remote work more beneficial than office work?',
        'Should college education be free for all students?',
        'Are video games beneficial for cognitive development?',
        'Should artificial intelligence be regulated by governments?'
      ];
    }
  }

  // Generate AI opponent response
  async generateAIResponse(
    topic: string,
    stance: 'pro' | 'con',
    personality: string,
    opponentArgument: string,
    currentRound: number
  ): Promise<string> {
    const prompt = `You are an AI debate opponent with the following personality: ${personality}

TOPIC: ${topic}
YOUR STANCE: ${stance.toUpperCase()}
CURRENT ROUND: ${currentRound}
OPPONENT'S ARGUMENT: "${opponentArgument}"

Generate a compelling counter-argument that:
1. Directly addresses the opponent's points
2. Presents strong evidence and reasoning
3. Maintains your ${stance} position
4. Matches your personality: ${personality}
5. Is between 100-200 words
6. Uses a respectful but challenging tone

Your response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini AI response error:', error);
      return 'I understand your point, but I must respectfully disagree. The evidence suggests a different conclusion that supports my position.';
    }
  }

  // Provide real-time debate coaching
  async getCoachingTip(
    topic: string,
    stance: 'pro' | 'con',
    currentRound: number,
    opponentArguments: string[]
  ): Promise<string> {
    const prompt = `You are a debate coach providing real-time advice to a debater.

TOPIC: ${topic}
STANCE: ${stance.toUpperCase()}
CURRENT ROUND: ${currentRound}
OPPONENT'S RECENT ARGUMENTS:
${opponentArguments.map(arg => `- "${arg}"`).join('\n')}

Provide ONE specific, actionable coaching tip (max 2 sentences) that would help the debater strengthen their position or counter their opponent effectively. Focus on strategy, not content.

Tip:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini coaching error:', error);
      return 'Focus on building strong evidence and addressing your opponent\'s key points directly.';
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService; 