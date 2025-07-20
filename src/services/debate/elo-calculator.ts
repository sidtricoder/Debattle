// K-factor determines how much ratings change after each game
// Higher K-factor means more volatile ratings
const K_FACTOR = 32;

/**
 * Calculate the expected score for a player against an opponent
 * @param playerRating Player's current rating
 * @param opponentRating Opponent's current rating
 * @returns Expected score between 0 and 1
 */
export const calculateExpectedScore = (playerRating: number, opponentRating: number): number => {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
};

/**
 * Calculate new ratings after a game
 * @param playerRating Player's current rating
 * @param opponentRating Opponent's current rating
 * @param playerScore 1 for win, 0.5 for draw, 0 for loss
 * @returns [newPlayerRating, newOpponentRating]
 */
export const calculateNewRatings = (
  playerRating: number,
  opponentRating: number,
  playerScore: 0 | 0.5 | 1
): [number, number] => {
  // Calculate expected scores
  const expectedPlayerScore = calculateExpectedScore(playerRating, opponentRating);
  const expectedOpponentScore = 1 - expectedPlayerScore;

  // Calculate new ratings
  const newPlayerRating = Math.round(playerRating + K_FACTOR * (playerScore - expectedPlayerScore));
  const newOpponentRating = Math.round(
    opponentRating + K_FACTOR * ((1 - playerScore) - expectedOpponentScore)
  );

  // Ensure ratings don't go below 0
  return [
    Math.max(0, newPlayerRating),
    Math.max(0, newOpponentRating)
  ];
};

/**
 * Calculate rating changes for a debate with multiple participants
 * @param ratings Record of user IDs to their current ratings
 * @param winnerId ID of the winner (null for draw)
 * @returns Object mapping user IDs to their new ratings
 */
export const calculateDebateRatings = (
  ratings: Record<string, number>,
  winnerId: string | null
): Record<string, number> => {
  const userIds = Object.keys(ratings);
  if (userIds.length !== 2) {
    throw new Error('ELO calculation currently only supports 1v1 debates');
  }

  const [user1, user2] = userIds;
  const user1Rating = ratings[user1];
  const user2Rating = ratings[user2];

  // Determine scores based on winner
  let user1Score: 0 | 0.5 | 1 = 0.5; // Default to draw
  if (winnerId === user1) {
    user1Score = 1;
  } else if (winnerId === user2) {
    user1Score = 0;
  }

  // Calculate new ratings
  const [newUser1Rating, newUser2Rating] = calculateNewRatings(
    user1Rating,
    user2Rating,
    user1Score
  );

  return {
    [user1]: newUser1Rating,
    [user2]: newUser2Rating
  };
};

/**
 * Calculate the minimum and maximum possible rating changes
 * @param playerRating Player's current rating
 * @param opponentRating Opponent's current rating
 * @returns [minChange, maxChange] - minimum and maximum possible rating changes
 */
export const getRatingChangeRange = (
  playerRating: number,
  opponentRating: number
): [number, number] => {
  // Worst case: player loses when expected to win
  const [minRating] = calculateNewRatings(playerRating, opponentRating, 0);
  // Best case: player wins when expected to lose
  const [maxRating] = calculateNewRatings(playerRating, opponentRating, 1);
  
  return [
    minRating - playerRating,
    maxRating - playerRating
  ];
};