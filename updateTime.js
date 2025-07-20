const admin = require('firebase-admin');

// Replace with the path to your service account key
const serviceAccount = require('./sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to safely parse timestamp
function safeParseTimestamp(timestamp) {
  try {
    // If it's a Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().getTime();
    }
    // If it's already a number
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    // If it's a string that can be converted to a number
    const num = Number(timestamp);
    if (!isNaN(num)) {
      return num;
    }
    return null;
  } catch (e) {
    console.error('Error parsing timestamp:', timestamp, e);
    return null;
  }
}

async function updateDebateDurations() {
  try {
    const debatesRef = db.collection('debates');
    console.log('Fetching all debates...');
    
    // Get all debates
    const snapshot = await debatesRef.get();
    
    if (snapshot.empty) {
      console.log('No debates found.');
      return;
    }

    const batch = db.batch();
    let batchCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const total = snapshot.size;

    console.log(`Found ${total} debates to process...`);

    // Process each document
    for (const doc of snapshot.docs) {
      const debate = doc.data();
      
      // Safely parse timestamps
      const createdAt = safeParseTimestamp(debate.createdAt);
      const endedAt = safeParseTimestamp(debate.endedAt);
      
      // Skip if either timestamp is invalid
      if (createdAt === null || endedAt === null) {
        console.log(`Skipping debate ${doc.id} - invalid timestamps`, {
          createdAt: debate.createdAt,
          endedAt: debate.endedAt
        });
        skippedCount++;
        continue;
      }

      // Calculate duration in milliseconds
      const duration = endedAt - createdAt;
      
      if (duration < 0) {
        console.log(`Warning: Negative duration for debate ${doc.id} - created: ${new Date(createdAt).toISOString()}, ended: ${new Date(endedAt).toISOString()}`);
      }

      console.log(`Updating debate ${doc.id}:`);
      console.log(`- Created at: ${new Date(createdAt).toISOString()}`);
      console.log(`- Ended at: ${new Date(endedAt).toISOString()}`);
      console.log(`- Duration: ${Math.round(duration/1000)} seconds`);

      // Update the debate with the calculated duration
      const debateRef = debatesRef.doc(doc.id);
      
      batch.update(debateRef, {
        'metadata.debateDuration': duration
      });

      batchCount++;
      updatedCount++;

      // Commit in batches of 500 (Firestore limit)
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates. Total updated: ${updatedCount}/${total}`);
        batchCount = 0;
      }
    }

    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates.`);
    }

    console.log(`\nUpdate Summary:`);
    console.log(`- Total debates processed: ${total}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount} (missing/invalid timestamps)`);
    console.log(`- Failed: ${total - updatedCount - skippedCount}`);

  } catch (error) {
    console.error('Error updating debate durations:', error);
  } finally {
    process.exit();
  }
}

// Run the function
updateDebateDurations();