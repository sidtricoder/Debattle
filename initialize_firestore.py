#!/usr/bin/env python3
"""
Firestore Database Initialization Script for Debattle
This script sets up the complete database structure with collections and sample data.
"""

import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import uuid
from typing import Dict, List, Any
import json

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        print("✓ Firebase already initialized")
    except ValueError:
        # Initialize Firebase
        cred_path = "sid-debattle-firebase-adminsdk-fbsvc-b12bed7830.json"
        if not os.path.exists(cred_path):
            print(f"❌ Error: Firebase credentials file not found: {cred_path}")
            print("Please make sure the Firebase service account JSON file is in the project directory.")
            sys.exit(1)
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✓ Firebase initialized successfully")

def create_sample_users() -> List[Dict[str, Any]]:
    """Create sample users for testing"""
    users = [
        {
            "uid": "user1",
            "email": "alice@example.com",
            "displayName": "Alice Johnson",
            "username": "alice_debates",
            "photoURL": "",
            "rating": 1200,
            "provisionalRating": False,
            "gamesPlayed": 15,
            "wins": 9,
            "losses": 4,
            "draws": 2,
            "winStreak": 3,
            "bestWinStreak": 5,
            "win_rate": 60.0,
            "achievements": ["first_win", "debate_veteran"],
            "xp": 1250,
            "level": 8,
            "tier": "silver",
            "created_at": datetime.utcnow() - timedelta(days=30),
            "last_active": datetime.utcnow() - timedelta(hours=2),
            "preferred_topics": ["politics", "technology", "environment"],
            "debate_style": "analytical",
            "bio": "Passionate debater with a focus on evidence-based arguments.",
            "preferences": {
                "theme": "auto",
                "notifications": {
                    "email": True,
                    "push": True,
                    "debate_invites": True,
                    "achievements": True
                },
                "privacy": {
                    "profile_visible": True,
                    "show_rating": True,
                    "show_stats": True
                }
            },
            "stats": {
                "totalArgumentsPosted": 45,
                "averageResponseTime": 120,
                "favoriteTopics": ["technology", "politics"],
                "strongestCategories": ["technology", "science"]
            }
        },
        {
            "uid": "user2", 
            "email": "bob@example.com",
            "displayName": "Bob Smith",
            "username": "bob_argues",
            "photoURL": "",
            "rating": 1150,
            "provisionalRating": False,
            "gamesPlayed": 12,
            "wins": 6,
            "losses": 5,
            "draws": 1,
            "winStreak": 1,
            "bestWinStreak": 3,
            "win_rate": 50.0,
            "achievements": ["first_win"],
            "xp": 850,
            "level": 5,
            "tier": "bronze",
            "created_at": datetime.utcnow() - timedelta(days=25),
            "last_active": datetime.utcnow() - timedelta(hours=1),
            "preferred_topics": ["sports", "technology", "education"],
            "debate_style": "persuasive",
            "bio": "Love a good debate and learning new perspectives.",
            "preferences": {
                "theme": "dark",
                "notifications": {
                    "email": False,
                    "push": True,
                    "debate_invites": True,
                    "achievements": True
                },
                "privacy": {
                    "profile_visible": True,
                    "show_rating": True,
                    "show_stats": False
                }
            },
            "stats": {
                "totalArgumentsPosted": 32,
                "averageResponseTime": 180,
                "favoriteTopics": ["sports", "technology"],
                "strongestCategories": ["sports", "education"]
            }
        },
        {
            "uid": "user3",
            "email": "charlie@example.com", 
            "displayName": "Charlie Brown",
            "username": "charlie_logic",
            "photoURL": "",
            "rating": 1300,
            "provisionalRating": False,
            "gamesPlayed": 20,
            "wins": 14,
            "losses": 4,
            "draws": 2,
            "winStreak": 4,
            "bestWinStreak": 7,
            "win_rate": 70.0,
            "achievements": ["first_win", "debate_veteran", "logic_master"],
            "xp": 2100,
            "level": 12,
            "tier": "gold",
            "created_at": datetime.utcnow() - timedelta(days=45),
            "last_active": datetime.utcnow() - timedelta(minutes=30),
            "preferred_topics": ["philosophy", "science", "ethics"],
            "debate_style": "logical",
            "bio": "Philosophy student who enjoys rigorous logical discussions.",
            "preferences": {
                "theme": "light",
                "notifications": {
                    "email": True,
                    "push": False,
                    "debate_invites": True,
                    "achievements": True
                },
                "privacy": {
                    "profile_visible": True,
                    "show_rating": True,
                    "show_stats": True
                }
            },
            "stats": {
                "totalArgumentsPosted": 68,
                "averageResponseTime": 90,
                "favoriteTopics": ["philosophy", "science"],
                "strongestCategories": ["philosophy", "ethics"]
            }
        }
    ]
    return users

def create_sample_topics() -> List[Dict[str, Any]]:
    """Create sample debate topics"""
    topics = [
        {
            "id": "topic1",
            "title": "Should artificial intelligence replace human judges in courts?",
            "description": "Debate whether AI systems should be used to make judicial decisions in legal proceedings.",
            "category": "technology",
            "difficulty": 8,
            "tags": ["AI", "justice", "ethics", "law"],
            "trending": True,
            "usageCount": 8,
            "averageRating": 4.2,
            "isOfficial": True,
            "created_at": datetime.utcnow() - timedelta(days=10)
        },
        {
            "id": "topic2",
            "title": "Is remote work better than office work?",
            "description": "Discuss the benefits and drawbacks of remote work versus traditional office environments.",
            "category": "business",
            "difficulty": 6,
            "tags": ["work", "productivity", "lifestyle", "business"],
            "trending": True,
            "usageCount": 12,
            "averageRating": 4.0,
            "isOfficial": True,
            "created_at": datetime.utcnow() - timedelta(days=15)
        },
        {
            "id": "topic3",
            "title": "Should universities be free for everyone?",
            "description": "Debate whether higher education should be publicly funded and accessible to all.",
            "category": "education",
            "difficulty": 7,
            "tags": ["education", "economics", "society", "policy"],
            "trending": False,
            "usageCount": 15,
            "averageRating": 4.5,
            "isOfficial": True,
            "created_at": datetime.utcnow() - timedelta(days=20)
        },
        {
            "id": "topic4",
            "title": "Is social media doing more harm than good?",
            "description": "Examine the impact of social media platforms on society, mental health, and communication.",
            "category": "society",
            "difficulty": 5,
            "tags": ["social media", "mental health", "society", "technology"],
            "trending": True,
            "usageCount": 20,
            "averageRating": 4.3,
            "isOfficial": True,
            "created_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "id": "topic5",
            "title": "Should genetic engineering in humans be allowed?",
            "description": "Debate the ethical and practical implications of genetic modification in human beings.",
            "category": "science",
            "difficulty": 9,
            "tags": ["genetics", "ethics", "science", "medicine"],
            "trending": False,
            "usageCount": 6,
            "averageRating": 4.7,
            "isOfficial": True,
            "created_at": datetime.utcnow() - timedelta(days=12)
        }
    ]
    return topics

def create_sample_achievements() -> List[Dict[str, Any]]:
    """Create sample achievements"""
    achievements = [
        {
            "id": "first_win",
            "title": "First Victory",
            "description": "Win your first debate",
            "icon": "🏆",
            "category": "milestone",
            "difficulty": "common",
            "xpReward": 50,
            "condition": {"type": "wins", "value": 1},
            "isActive": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "debate_veteran",
            "title": "Debate Veteran",
            "description": "Participate in 10 debates",
            "icon": "🎖️",
            "category": "milestone",
            "difficulty": "uncommon",
            "xpReward": 100,
            "condition": {"type": "debates", "value": 10},
            "isActive": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "logic_master",
            "title": "Logic Master",
            "description": "Maintain 70% win rate with 15+ debates",
            "icon": "🧠",
            "category": "skill",
            "difficulty": "rare",
            "xpReward": 200,
            "condition": {"type": "win_rate", "value": 70, "min_debates": 15},
            "isActive": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "persuasion_expert",
            "title": "Persuasion Expert",
            "description": "Win 5 debates in a row",
            "icon": "💬",
            "category": "streak",
            "difficulty": "uncommon",
            "xpReward": 150,
            "condition": {"type": "streak", "value": 5},
            "isActive": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "topic_specialist",
            "title": "Topic Specialist", 
            "description": "Win 10 debates in the same category",
            "icon": "📚",
            "category": "specialization",
            "difficulty": "uncommon",
            "xpReward": 120,
            "condition": {"type": "category_wins", "value": 10},
            "isActive": True,
            "created_at": datetime.utcnow()
        }
    ]
    return achievements

def create_sample_debates() -> List[Dict[str, Any]]:
    """Create sample debates"""
    debates = [
        {
            "id": "debate1",
            "topic": "Should artificial intelligence replace human judges in courts?",
            "topicId": "topic1",
            "format": "oxford",
            "participants": [
                {
                    "userId": "user1",
                    "displayName": "Alice Johnson",
                    "rating": 1200,
                    "stance": "pro"
                },
                {
                    "userId": "user2",
                    "displayName": "Bob Smith",
                    "rating": 1150,
                    "stance": "con"
                }
            ],
            "status": "completed",
            "created_at": datetime.utcnow() - timedelta(days=3),
            "started_at": datetime.utcnow() - timedelta(days=3),
            "ended_at": datetime.utcnow() - timedelta(days=3, hours=1),
            "winner": "user1",
            "arguments": [
                {
                    "id": "arg1",
                    "userId": "user1",
                    "type": "opening",
                    "side": "pro",
                    "content": "AI judges would eliminate human bias and provide consistent, data-driven decisions based purely on legal precedent and evidence.",
                    "timestamp": datetime.utcnow() - timedelta(days=3, minutes=5),
                    "round": 1,
                    "wordCount": 25,
                    "ai_feedback": {
                        "strength_score": 8.5,
                        "clarity_score": 9.0,
                        "evidence_score": 7.5,
                        "feedback": "Strong opening with clear reasoning about bias elimination."
                    }
                },
                {
                    "id": "arg2", 
                    "userId": "user2",
                    "type": "opening",
                    "side": "con",
                    "content": "Human judgment involves empathy, context understanding, and moral reasoning that AI cannot replicate, making it unsuitable for complex legal decisions.",
                    "timestamp": datetime.utcnow() - timedelta(days=3, minutes=10),
                    "round": 1,
                    "wordCount": 28,
                    "ai_feedback": {
                        "strength_score": 8.0,
                        "clarity_score": 8.5,
                        "evidence_score": 7.0,
                        "feedback": "Good counter-argument highlighting unique human capabilities."
                    }
                }
            ],
            "judgment": {
                "winner": "user1",
                "confidence": 0.75,
                "reasoning": "Pro side presented more concrete benefits with specific examples of bias reduction.",
                "scores": {
                    "user1": {
                        "logic": 85,
                        "evidence": 80,
                        "clarity": 90,
                        "rebuttal": 85,
                        "engagement": 80,
                        "total": 84
                    },
                    "user2": {
                        "logic": 80,
                        "evidence": 75,
                        "clarity": 85,
                        "rebuttal": 80,
                        "engagement": 75,
                        "total": 79
                    }
                },
                "feedback": {
                    "user1": {
                        "strengths": ["Clear reasoning", "Good evidence"],
                        "weaknesses": ["Could use more examples"],
                        "improvement_suggestions": ["Add more specific case studies"]
                    },
                    "user2": {
                        "strengths": ["Good counter-argument"],
                        "weaknesses": ["Limited evidence"],
                        "improvement_suggestions": ["Provide more concrete examples"]
                    }
                },
                "fallacies": [],
                "highlights": [
                    {
                        "userId": "user1",
                        "argument": "AI judges would eliminate human bias",
                        "reason": "Strong point about bias elimination"
                    }
                ],
                "overall_analysis": "A well-structured debate with good arguments from both sides.",
                "debate_quality": 8.5,
                "entertainment_value": 7.5
            },
            "ratingChanges": {
                "user1": 15,
                "user2": -15
            },
            "metadata": {
                "total_arguments": 8,
                "debate_duration": 3600,
                "audience_votes": {"user1": 3, "user2": 2}
            }
        }
    ]
    return debates

def create_sample_leaderboard() -> List[Dict[str, Any]]:
    """Create sample leaderboard data"""
    leaderboard = [
        {
            "userId": "user3",
            "displayName": "Charlie Brown",
            "rating": 1300,
            "rank": 1,
            "change": 0,
            "gamesPlayed": 20,
            "tier": "gold",
            "wins": 14,
            "losses": 4,
            "winRate": 70.0
        },
        {
            "userId": "user1",
            "displayName": "Alice Johnson",
            "rating": 1200,
            "rank": 2,
            "change": 1,
            "gamesPlayed": 15,
            "tier": "silver",
            "wins": 9,
            "losses": 4,
            "winRate": 60.0
        },
        {
            "userId": "user2",
            "displayName": "Bob Smith",
            "rating": 1150,
            "rank": 3,
            "change": -1,
            "gamesPlayed": 12,
            "tier": "bronze",
            "wins": 6,
            "losses": 5,
            "winRate": 50.0
        }
    ]
    return leaderboard

def setup_collections(db):
    """Set up all collections with sample data"""
    
    print("🔧 Setting up collections...")
    
    # 1. Users Collection
    print("  📝 Creating users collection...")
    users = create_sample_users()
    for user in users:
        db.collection('users').document(user['uid']).set(user)
    print(f"    ✓ Added {len(users)} sample users")
    
    # 2. Topics Collection
    print("  📝 Creating topics collection...")
    topics = create_sample_topics()
    for topic in topics:
        db.collection('topics').document(topic['id']).set(topic)
    print(f"    ✓ Added {len(topics)} sample topics")
    
    # 3. Achievements Collection
    print("  📝 Creating achievements collection...")
    achievements = create_sample_achievements()
    for achievement in achievements:
        db.collection('achievements').document(achievement['id']).set(achievement)
    print(f"    ✓ Added {len(achievements)} sample achievements")
    
    # 4. Debates Collection
    print("  📝 Creating debates collection...")
    debates = create_sample_debates()
    for debate in debates:
        db.collection('debates').document(debate['id']).set(debate)
    print(f"    ✓ Added {len(debates)} sample debates")
    
    # 5. Leaderboard Collection
    print("  📝 Creating leaderboard collection...")
    leaderboard = create_sample_leaderboard()
    for entry in leaderboard:
        db.collection('leaderboard').document(entry['userId']).set(entry)
    print(f"    ✓ Added {len(leaderboard)} leaderboard entries")
    
    # 6. System Settings Collection
    print("  📝 Creating system settings...")
    settings = {
        "elo_settings": {
            "starting_rating": 1200,
            "k_factor": 32,
            "min_rating": 100,
            "max_rating": 3000,
            "provisional_games": 10
        },
        "debate_settings": {
            "max_argument_length": 1000,
            "max_arguments_per_side": 5,
            "debate_time_limit": 3600,
            "auto_judge_enabled": True,
            "max_spectators": 50
        },
        "gamification": {
            "xp_per_win": 100,
            "xp_per_loss": 25,
            "xp_per_draw": 50,
            "level_multiplier": 1.5,
            "streak_bonus": 0.1
        },
        "app_info": {
            "version": "1.0.0",
            "initialized_at": datetime.utcnow(),
            "total_users": len(users),
            "total_topics": len(topics)
        }
    }
    db.collection('system').document('settings').set(settings)
    print("    ✓ Added system settings")

def create_indexes(db):
    """Create necessary indexes for efficient queries"""
    print("🔍 Setting up database indexes...")
    
    # Note: Firestore indexes are typically created automatically or through the console
    # But we can document the needed indexes here
    
    indexes_needed = [
        "users: rating (descending) - for leaderboards",
        "users: last_active (descending) - for active users",
        "debates: status, created_at (descending) - for debate queries",
        "debates: participants (array) - for user debate history",
        "topics: category, difficulty - for topic filtering",
        "topics: usageCount (descending) - for popular topics",
        "leaderboard: rating (descending) - for global rankings",
        "achievements: category, difficulty - for achievement filtering"
    ]
    
    print("  📋 Indexes that should be created in Firestore console:")
    for index in indexes_needed:
        print(f"    • {index}")
    
    print("  ℹ️  These will be created automatically as you use the app")

def verify_setup(db):
    """Verify the database setup"""
    print("✅ Verifying database setup...")
    
    # Check collections
    collections = ['users', 'topics', 'achievements', 'debates', 'leaderboard', 'system']
    for collection_name in collections:
        docs = list(db.collection(collection_name).limit(1).stream())
        if docs:
            print(f"    ✓ {collection_name} collection created")
        else:
            print(f"    ❌ {collection_name} collection not found")
    
    # Check sample data
    user_count = len(list(db.collection('users').stream()))
    topic_count = len(list(db.collection('topics').stream()))
    debate_count = len(list(db.collection('debates').stream()))
    
    print(f"    ✓ {user_count} users created")
    print(f"    ✓ {topic_count} topics created")
    print(f"    ✓ {debate_count} debates created")

def main():
    """Main initialization function"""
    print("🚀 Initializing Firestore Database for Debattle")
    print("=" * 50)
    
    try:
        # Initialize Firebase
        initialize_firebase()
        
        # Get Firestore client
        db = firestore.client()
        print("✓ Connected to Firestore")
        
        # Setup collections and data
        setup_collections(db)
        
        # Create indexes (documentation)
        create_indexes(db)
        
        # Verify setup
        verify_setup(db)
        
        print("\n" + "=" * 50)
        print("🎉 Database initialization completed successfully!")
        print("\n📊 What was created:")
        print("  • Users collection with sample users")
        print("  • Topics collection with debate topics")
        print("  • Achievements collection with badges")
        print("  • Debates collection with sample debates")
        print("  • Leaderboard collection with rankings")
        print("  • System settings collection")
        print("\n🔗 Next steps:")
        print("  1. Your Firestore database is ready")
        print("  2. Run 'npm run dev' to start the application")
        print("  3. Visit the Firestore console to view your data:")
        print("     https://console.firebase.google.com/project/sid-debattle/firestore")
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("  1. Make sure Firebase credentials file exists")
        print("  2. Ensure Firestore API is enabled in Google Cloud Console")
        print("  3. Check your internet connection")
        sys.exit(1)

if __name__ == "__main__":
    main()
