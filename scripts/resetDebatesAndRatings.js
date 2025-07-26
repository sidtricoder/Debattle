// resetDebatesAndRatings.js

const admin = require('firebase-admin');

// TODO: Replace with the path to your service account key JSON file
const serviceAccount = require('../sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllDebates() {
  const debatesRef = db.collection('debates');
  const snapshot = await debatesRef.get();

  const batchSize = 500;
  let deleted = 0;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    deleted += Math.min(batchSize, docs.length - i);
    console.log(`Deleted ${deleted} debates so far...`);
  }

  console.log(`Deleted ${deleted} debates in total.`);
}

async function resetAllUserRatings() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  const batchSize = 500;
  let updated = 0;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach(doc => {
      batch.update(doc.ref, { rating: 1200 });
    });
    await batch.commit();
    updated += Math.min(batchSize, docs.length - i);
    console.log(`Reset rating for ${updated} users so far...`);
  }

  console.log(`Reset rating for ${updated} users in total.`);
}

async function resetAllUserStats() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  const batchSize = 500;
  let updated = 0;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach(doc => {
      batch.update(doc.ref, {
        rating: 1200,
        wins: 0,
        losses: 0,
        draws: 0,
        gamesPlayed: 0,
        win_rate: 0,
        practiceAvgScore: 0,
        practiceRatingGain: 0,
        practiceSessions: 0,
        practiceTime: 0
        // Add more fields as needed if your user schema has them
      });
    });
    await batch.commit();
    updated += Math.min(batchSize, docs.length - i);
    console.log(`Reset stats for ${updated} users so far...`);
  }

  console.log(`Reset stats for ${updated} users in total.`);
}

async function main() {
  try {
    await deleteAllDebates();
    await resetAllUserStats();
    console.log('Operation completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 