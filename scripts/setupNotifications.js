#!/usr/bin/env node

// Script to set up notifications collection and security rules
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('../sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sid-debattle'
});

const db = admin.firestore();

async function setupNotifications() {
  console.log('Setting up notifications collection...');
  
  try {
    // Create a placeholder document to establish the collection
    // This one will NOT be deleted so the collection remains visible
    const placeholderNotification = {
      userId: '_system_placeholder',
      type: 'system_info',
      title: 'Notifications System Ready',
      message: 'This is a placeholder document to keep the notifications collection visible. Do not delete.',
      data: {
        isPlaceholder: true,
        createdBy: 'setup_script'
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: null
    };
    
    // Check if placeholder already exists
    const existingPlaceholder = await db.collection('notifications')
      .where('userId', '==', '_system_placeholder')
      .limit(1)
      .get();
    
    if (existingPlaceholder.empty) {
      await db.collection('notifications').add(placeholderNotification);
      console.log('✅ Notifications collection created with placeholder document');
    } else {
      console.log('✅ Notifications collection already exists with placeholder');
    }
    
    // Create challenge-related collections with placeholder
    const placeholderChallenge = {
      id: '_system_placeholder',
      fromUserId: '_system_placeholder',
      toUserIds: ['_system_placeholder'],
      topic: 'System Placeholder - Do Not Delete',
      settings: {
        aiModel: 'gemini',
        timePerUser: 180,
        rounds: 5,
        userStance: 'pro'
      },
      status: 'placeholder',
      expiresAt: null, // No expiration for placeholder
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedBy: [],
      declinedBy: [],
      isPlaceholder: true
    };
    
    // Check if challenge placeholder already exists
    const existingChallengeHelperById = await db.collection('challenges')
      .where('id', '==', '_system_placeholder')
      .limit(1)
      .get();
    
    if (existingChallengeHelperById.empty) {
      await db.collection('challenges').add(placeholderChallenge);
      console.log('✅ Challenges collection created with placeholder document');
    } else {
      console.log('✅ Challenges collection already exists with placeholder');
    }
    
    console.log('');
    console.log('📋 IMPORTANT NOTES:');
    console.log('• Placeholder documents have been created to keep collections visible');
    console.log('• These have userId/id "_system_placeholder" - do NOT delete them');
    console.log('• Your security rules will prevent regular users from seeing these placeholders');
    console.log('• Real notifications and challenges will be created by your application');
    
  } catch (error) {
    console.error('❌ Error setting up collections:', error);
  }
}

// Security rules for notifications and challenges
const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing rules...
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications (excludes system placeholders)
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        resource.data.userId != '_system_placeholder';
      
      // Only the system can create notifications (via server-side code)
      allow create: if false;
      
      // Users can update/delete their own notifications (not placeholders)
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid &&
        resource.data.userId != '_system_placeholder';
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      // Allow read if user is involved (excludes system placeholders)
      allow read: if request.auth != null && 
        resource.data.id != '_system_placeholder' &&
        (resource.data.fromUserId == request.auth.uid || 
         request.auth.uid in resource.data.toUserIds);
      
      // Only authenticated users can create challenges where they are the fromUser
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.fromUserId &&
        resource.data.fromUserId != '_system_placeholder';
      
      // Users can update challenges they're involved in (not placeholders)
      allow update: if request.auth != null && 
        resource.data.id != '_system_placeholder' &&
        (resource.data.fromUserId == request.auth.uid || 
         request.auth.uid in resource.data.toUserIds);
      
      // Only the challenger can delete their challenges (not placeholders)
      allow delete: if request.auth != null && 
        resource.data.id != '_system_placeholder' &&
        resource.data.fromUserId == request.auth.uid;
    }
  }
}
`;

console.log('📋 Add these security rules to your Firestore Security Rules:');
console.log(securityRules);

// Create a rules file
fs.writeFileSync('./firestore-notifications-rules.txt', securityRules);
console.log('✅ Security rules written to firestore-notifications-rules.txt');

// Run the setup
setupNotifications().then(() => {
  console.log('🎉 Setup complete!');
  console.log('🔍 Check your Firebase console - the collections should now be visible!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});