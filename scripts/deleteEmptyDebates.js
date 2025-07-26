const admin = require('firebase-admin');

// Replace with the path to your service account key
const serviceAccount = require('./sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteDebatesWithNoArguments() {
  const debatesRef = db.collection('debates');
  const snapshot = await debatesRef.where('arguments', '==', []).get();

  if (snapshot.empty) {
    console.log('No debates with 0 arguments found.');
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted ${snapshot.size} debates with 0 arguments.`);
}

deleteDebatesWithNoArguments().catch(console.error);