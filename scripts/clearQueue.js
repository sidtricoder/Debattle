const admin = require('firebase-admin');

// TODO: Replace with the path to your service account key JSON file
const serviceAccount = require('../sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Change this to your actual queue collection name
const QUEUE_COLLECTION = 'matchmakingQueue';

async function clearQueue() {
  const queueRef = db.collection(QUEUE_COLLECTION);
  const snapshot = await queueRef.get();

  if (snapshot.empty) {
    console.log('Queue is already empty.');
    return;
  }

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
    console.log(`Deleted ${deleted} queue entries so far...`);
  }

  console.log(`Cleared ${deleted} queue entries in total.`);
}

clearQueue().then(() => process.exit(0)).catch(err => {
  console.error('Error clearing queue:', err);
  process.exit(1);
});