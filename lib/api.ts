import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArgumentScores, DebateArgument, DebateJudgment } from '../src/types/debate';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC5oudbBRIiKiq2fHtt72LxWL747Gl_AzE';

if (!API_KEY) {
  throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface JudgingRequest {
  topic: string;
  arguments: DebateArgument[];
  participants: {
    userId: string;
    displayName: string;
    position: 'for' | 'against';
  }[];
}

export interface JudgingResponse {
  winner: string;
  scores: { [userId: string]: ArgumentScores };
  feedback: { [userId: string]: string };
  reasoning: string;
  confidence: number;
}

export class GeminiJudgeService {
  private static instance: GeminiJudgeService;

  public static getInstance(): GeminiJudgeService {
    if (!GeminiJudgeService.instance) {
      GeminiJudgeService.instance = new GeminiJudgeService();
    }
    return GeminiJudgeService.instance;
  }

  async judgeDebate(request: JudgingRequest): Promise<JudgingResponse> {
    try {
      const prompt = this.buildJudgingPrompt(request);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseJudgingResponse(text, request.participants);
    } catch (error) {
      console.error('Error judging debate:', error);
      throw new Error('Failed to judge debate. Please try again.');
    }
  }

  async generateTopicSuggestions(category: string, difficulty: string): Promise<string[]> {
    try {
      const prompt = `Generate 10 engaging debate topics for the category "${category}" at ${difficulty} difficulty level. 
      Topics should be:
      - Controversial enough to have strong arguments on both sides
      - Relevant to current events or timeless issues
      - Clear and specific
      - Appropriate for the difficulty level
      
      Return only the topic titles, one per line, without numbering or additional text.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split('\n').filter(topic => topic.trim().length > 0).slice(0, 10);
    } catch (error) {
      console.error('Error generating topics:', error);
      return [];
    }
  }

  async analyzeArgument(argument: string, topic: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score: number;
  }> {
    try {
      const prompt = `Analyze this debate argument for the topic "${topic}":

"${argument}"

Provide analysis in this exact JSON format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 85
}

Score should be 0-100 based on logic, evidence, clarity, and persuasiveness.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing argument:', error);
      return {
        strengths: ['Unable to analyze'],
        weaknesses: ['Analysis failed'],
        suggestions: ['Please try again'],
        score: 50
      };
    }
  }

  private buildJudgingPrompt(request: JudgingRequest): string {
    const { topic, arguments: args, participants } = request;
    
    let prompt = `You are an expert debate judge. Analyze this debate and provide a comprehensive judgment.

TOPIC: "${topic}"

PARTICIPANTS:
`;
    
    participants.forEach(p => {
      prompt += `- ${p.displayName} (arguing ${p.position.toUpperCase()})
`;
    });
    
    prompt += `\nARGUMENTS (in chronological order):
`;
    
    args.forEach((arg, index) => {
      const participant = participants.find(p => p.userId === arg.userId);
      prompt += `\n${index + 1}. ${participant?.displayName} (${participant?.position}):
"${arg.content}"
`;
    });
    
    prompt += `\nPlease provide your judgment in this exact JSON format:
{
  "winner": "userId_of_winner",
  "scores": {
    "${participants[0].userId}": {
      "logic": 85,
      "evidence": 78,
      "clarity": 92,
      "rebuttal": 80,
      "overall": 84
    },
    "${participants[1].userId}": {
      "logic": 75,
      "evidence": 82,
      "clarity": 88,
      "rebuttal": 85,
      "overall": 82
    }
  },
  "feedback": {
    "${participants[0].userId}": "Detailed feedback for participant 1",
    "${participants[1].userId}": "Detailed feedback for participant 2"
  },
  "reasoning": "Detailed explanation of the decision",
  "confidence": 85
}

Scoring criteria (0-100 each):
- Logic: Reasoning quality and argument structure
- Evidence: Use of facts, examples, and supporting data
- Clarity: Communication effectiveness and organization
- Rebuttal: Response to opponent's arguments
- Overall: Weighted average considering debate flow

Confidence: How certain you are about the judgment (0-100)`;
    
    return prompt;
  }

  private parseJudgingResponse(text: string, participants: JudgingRequest['participants']): JudgingResponse {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.winner || !parsed.scores || !parsed.feedback || !parsed.reasoning) {
        throw new Error('Missing required fields in response');
      }
      
      // Ensure all participants have scores
      participants.forEach(p => {
        if (!parsed.scores[p.userId]) {
          parsed.scores[p.userId] = {
            logic: 50,
            evidence: 50,
            clarity: 50,
            rebuttal: 50,
            overall: 50
          };
        }
        if (!parsed.feedback[p.userId]) {
          parsed.feedback[p.userId] = 'No feedback available.';
        }
      });
      
      return {
        winner: parsed.winner,
        scores: parsed.scores,
        feedback: parsed.feedback,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence || 75
      };
    } catch (error) {
      console.error('Error parsing judgment response:', error);
      
      // Return fallback response
      const fallbackScores: ArgumentScores = {
        logic: 50,
        evidence: 50,
        clarity: 50,
        rebuttal: 50,
        overall: 50
      };
      
      const scores: { [userId: string]: ArgumentScores } = {};
      const feedback: { [userId: string]: string } = {};
      
      participants.forEach(p => {
        scores[p.userId] = { ...fallbackScores };
        feedback[p.userId] = 'Unable to provide detailed feedback due to analysis error.';
      });
      
      return {
        winner: participants[0].userId, // Default to first participant
        scores,
        feedback,
        reasoning: 'Unable to provide detailed reasoning due to analysis error.',
        confidence: 25
      };
    }
  }
}

export const geminiJudge = GeminiJudgeService.getInstance();
