import { DebateMessage } from '../../types/debate';

interface DebateRound {
  proMessage?: string;
  conMessage?: string;
  judgeFeedback?: {
    proScore: number;
    conScore: number;
    feedback: string;
  };
}

interface DebateScores {
  pro: number;
  con: number;
  rounds: DebateRound[];
  winner?: 'pro' | 'con' | 'draw';
  feedback: string[];
}

/**
 * Judge a single debate round
 * @param proMessage The pro debater's argument
 * @param conMessage The con debater's argument
 * @returns Scores and feedback for the round
 */
const judgeRound = async (proMessage: string, conMessage: string): Promise<{
  proScore: number;
  conScore: number;
  feedback: string;
}> => {
  // In a real implementation, this would call an AI judge (like Llama 70B)
  // For now, we'll use a simple word count heuristic as a placeholder
  const proWordCount = proMessage.split(/\s+/).length;
  const conWordCount = conMessage.split(/\s+/).length;
  
  // Base score on word count (0-10 scale)
  const proScore = Math.min(10, Math.max(1, Math.floor(proWordCount / 5)));
  const conScore = Math.min(10, Math.max(1, Math.floor(conWordCount / 5)));
  
  // Add some randomness to make it interesting
  const randomFactor = 0.5 + Math.random();
  
  return {
    proScore: Math.min(10, Math.round(proScore * randomFactor)),
    conScore: Math.min(10, Math.round(conScore * randomFactor)),
    feedback: `Pro: ${proWordCount} words. Con: ${conWordCount} words.`
  };
};

/**
 * Score an entire debate
 * @param messages Array of debate messages
 * @returns Final scores and round-by-round feedback
 */
export const scoreDebate = async (messages: DebateMessage[]): Promise<DebateScores> => {
  const scores: DebateScores = {
    pro: 0,
    con: 0,
    rounds: [],
    feedback: []
  };

  // Group messages by round
  const rounds: Record<string, DebateRound> = {};
  
  for (const message of messages) {
    const roundKey = message.round.toString();
    if (!rounds[roundKey]) {
      rounds[roundKey] = {} as DebateRound;
    }
    
    if (message.role === 'pro') {
      rounds[roundKey].proMessage = message.content;
    } else if (message.role === 'con') {
      rounds[roundKey].conMessage = message.content;
    }
  }

  // Judge each round
  for (const [roundNum, round] of Object.entries(rounds)) {
    if (round.proMessage && round.conMessage) {
      const roundJudgment = await judgeRound(round.proMessage, round.conMessage);
      scores.pro += roundJudgment.proScore;
      scores.con += roundJudgment.conScore;
      
      rounds[roundNum].judgeFeedback = roundJudgment;
      scores.feedback.push(`Round ${roundNum}: ${roundJudgment.feedback}`);
    }
  }

  // Determine winner
  if (scores.pro > scores.con) {
    scores.winner = 'pro';
  } else if (scores.con > scores.pro) {
    scores.winner = 'con';
  } else {
    scores.winner = 'draw';
  }

  scores.rounds = Object.values(rounds);
  return scores;
};

/**
 * Get a summary of the debate results
 * @param scores The debate scores
 * @returns A human-readable summary of the results
 */
export const getDebateSummary = (scores: DebateScores): string => {
  let summary = `Debate Results:\n`;
  summary += `Pro: ${scores.pro} points\n`;
  summary += `Con: ${scores.con} points\n\n`;
  
  if (scores.winner === 'draw') {
    summary += "It's a draw! Both debaters performed equally well.";
  } else {
    const winner = scores.winner === 'pro' ? 'Pro' : 'Con';
    const winnerScore = scores.winner === 'pro' ? scores.pro : scores.con;
    const loserScore = scores.winner === 'pro' ? scores.con : scores.pro;
    const pointDiff = winnerScore - loserScore;
    
    summary += `${winner} wins by ${pointDiff} point${pointDiff !== 1 ? 's' : ''}!\n`;
    
    if (pointDiff <= 5) {
      summary += "It was a close match!";
    } else if (pointDiff <= 15) {
      summary += "A solid performance by the winner!";
    } else {
      summary += "A decisive victory!";
    }
  }
  
  return summary;
};