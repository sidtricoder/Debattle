const admin = require('firebase-admin');

// Replace with the path to your service account key
const serviceAccount = require('./sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateUserStatsFromDebates() {
  const debatesRef = db.collection('debates');
  const usersRef = db.collection('users');
  const debatesSnapshot = await debatesRef.get();

  // Map: userId -> stats
  const userStats = {};

  debatesSnapshot.forEach(debateDoc => {
    const debate = debateDoc.data();
    if (!debate.participants || !Array.isArray(debate.participants)) return;
    if (debate.status !== 'completed') return;

    // Determine winner
    let winnerId = null;
    if (debate.judgment && debate.judgment.winner && debate.judgment.winner !== 'Draw') {
      winnerId = debate.judgment.winner;
    }

    // For each participant
    debate.participants.forEach(participant => {
      const userId = participant.userId;
      if (!userStats[userId]) {
        userStats[userId] = {
          wins: 0,
          losses: 0,
          draws: 0,
          gamesPlayed: 0,
          rating: participant.rating || 1200,
        };
      }
      userStats[userId].gamesPlayed += 1;

      // Determine result
      let result = 'draw';
      if (winnerId === null || winnerId === 'Draw') {
        userStats[userId].draws += 1;
        result = 'draw';
      } else if (userId === winnerId) {
        userStats[userId].wins += 1;
        result = 'win';
      } else {
        userStats[userId].losses += 1;
        result = 'loss';
      }

      // Rating (if debate.ratings exists)
      if (debate.ratings && debate.ratings[userId] !== undefined) {
        userStats[userId].rating = debate.ratings[userId];
      }
    });
  });

  // Update users in Firestore
  for (const [userId, stats] of Object.entries(userStats)) {
    if (userId === 'ai_opponent') continue; // Skip AI
    const win_rate = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;
    await usersRef.doc(userId).update({
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      gamesPlayed: stats.gamesPlayed,
      win_rate,
      rating: stats.rating,
      updated_at: new Date(),
      last_active: new Date()
    });
    console.log(`Updated stats for user ${userId}:`, stats);
  }

  console.log('User stats update complete.');
}

updateUserStatsFromDebates().catch(console.error); 