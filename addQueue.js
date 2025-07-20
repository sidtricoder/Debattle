// initialize-matchmaking.js
// Run this script to create the new collections for user vs user matchmaking

const admin = require('firebase-admin');
const serviceAccount = require('./sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sid-debattle.firebaseio.com'
});

const db = admin.firestore();

async function initializeMatchmakingCollections() {
  console.log('🚀 Initializing new collections for user vs user matchmaking...');

  try {
    // 1. Create matchmakingQueue collection
    console.log('📋 Creating matchmakingQueue collection...');
    const queueRef = db.collection('matchmakingQueue');
    await queueRef.doc('sample-entry').set({
      userId: 'sample-user-id',
      topicId: 'topic1',
      rating: 1200,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'waiting'
    });
    console.log('    ✓ Added sample queue entry');

    // 2. Create debateRooms collection
    console.log('🏠 Creating debateRooms collection...');
    const roomsRef = db.collection('debateRooms');
    await roomsRef.doc('sample-room').set({
      id: 'sample-room',
      topicId: 'topic1',
      userIds: ['user1', 'user2'],
      stances: {
        'user1': 'pro',
        'user2': 'con'
      },
      status: 'waiting',
      currentRound: 1,
      maxRounds: 5,
      timePerTurn: 60,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      judgeModel: 'llama-3.3-70b-versatile',
      ratings: {
        'user1': 1200,
        'user2': 1150
      },
      messages: [],
      participantIds: ['user1', 'user2']
    });
    console.log('    ✓ Added sample debate room');

    // 3. Create userDebateStats collection
    console.log('📊 Creating userDebateStats collection...');
    const statsRef = db.collection('userDebateStats');
    await statsRef.doc('user1').set({
      userId: 'user1',
      rating: 1200,
      wins: 9,
      losses: 4,
      draws: 2,
      totalDebates: 15,
      averageScore: 84.0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      debateHistory: ['debate1']
    });
    await statsRef.doc('user2').set({
      userId: 'user2',
      rating: 1150,
      wins: 6,
      losses: 5,
      draws: 1,
      totalDebates: 12,
      averageScore: 79.0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      debateHistory: ['debate1']
    });
    console.log('    ✓ Added sample user debate stats');

    console.log('\n✅ New matchmaking collections initialized successfully!');
    console.log('\n📋 New collections created:');
    console.log('  - matchmakingQueue (for user matchmaking)');
    console.log('  - debateRooms (for real-time user vs user debates)');
    console.log('  - userDebateStats (for ELO ratings)');
    console.log('\n🔗 These work with your existing collections:');
    console.log('  - users (already exists)');
    console.log('  - topics (already exists)');
    console.log('  - debates (already exists)');

  } catch (error) {
    console.error('❌ Error initializing matchmaking collections:', error);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializeMatchmakingCollections();