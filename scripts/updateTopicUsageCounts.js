const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const DEBATES_COLLECTION = 'debates';
const TOPICS_COLLECTION = 'topics';
const BATCH_SIZE = 100; // Process debates in batches to avoid memory issues

function normalizeText(text) {
  if (!text) return '';
  
  // Convert to lowercase and trim
  let normalized = text.toLowerCase().trim();
  
  // Replace different types of quotes and apostrophes
  normalized = normalized
    .replace(/[“”"']/g, '') // Remove all types of quotes
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .trim();
    
  return normalized;
}

async function updateTopicUsageCounts() {
  try {
    console.log('Starting to update topic usage counts...');
    
    // First, get all topics to initialize the counts
    const topicsSnapshot = await db.collection(TOPICS_COLLECTION).get();
    const topicCounts = {};
    const topicTitles = new Map();
    
    // Initialize all topic counts and create title-to-id mapping
    topicsSnapshot.forEach(doc => {
      const topicData = doc.data();
      const topicId = doc.id;
      const title = topicData.title;
      
      // Initialize count for this topic
      topicCounts[topicId] = 0;
      
      // Map the normalized title to the topic ID
      if (title) {
        const normalizedTitle = normalizeText(title);
        topicTitles.set(normalizedTitle, topicId);
        console.log(`Mapped topic: "${title}" -> ${topicId}`);
      }
    });
    
    // Get all debates and count topic usages
    let lastDoc = null;
    let hasMore = true;
    let totalDebatesProcessed = 0;
    
    while (hasMore) {
      let query = db.collection(DEBATES_COLLECTION)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(BATCH_SIZE);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        hasMore = false;
        continue;
      }
      
      snapshot.forEach(doc => {
        const debate = doc.data();
        let topicId = debate.topicId;
        
        // If no topicId, try to find matching topic by title
        if (!topicId && debate.topic) {
          const normalizedTitle = normalizeText(debate.topic);
          topicId = topicTitles.get(normalizedTitle);
          
          if (topicId) {
            console.log(`Matched topic: "${debate.topic}" -> ${topicId}`);
          } else {
            console.warn(`Could not find matching topic for: "${debate.topic}"`);
            console.log(`  Normalized: "${normalizedTitle}"`);
            console.log('  Available topics:');
            topicTitles.forEach((id, title) => {
              console.log(`  - "${title}" -> ${id}`);
            });
          }
        }
        
        // If we have a valid topicId that exists in our counts, increment
        if (topicId && topicCounts[topicId] !== undefined) {
          topicCounts[topicId]++;
        } else if (topicId) {
          console.warn(`Topic ID ${topicId} found in debate but not in topics collection`);
        } else if (debate.topic) {
          console.warn(`Could not find matching topic for: "${debate.topic}"`);
        }
      });
      
      totalDebatesProcessed += snapshot.size;
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      console.log(`Processed ${totalDebatesProcessed} debates so far...`);
      
      if (snapshot.size < BATCH_SIZE) {
        hasMore = false;
      }
    }
    
    // Now update all topics with their usage counts
    const batch = db.batch();
    let batchCount = 0;
    
    for (const [topicId, count] of Object.entries(topicCounts)) {
      const topicRef = db.collection(TOPICS_COLLECTION).doc(topicId);
      batch.update(topicRef, { usageCount: count });
      batchCount++;
      
      // Firestore batches are limited to 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates`);
    }
    
    console.log('Successfully updated all topic usage counts!');
    console.log('Summary:');
    console.log(`- Total topics processed: ${Object.keys(topicCounts).length}`);
    console.log(`- Total debates processed: ${totalDebatesProcessed}`);
    
  } catch (error) {
    console.error('Error updating topic usage counts:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the function
updateTopicUsageCounts();
