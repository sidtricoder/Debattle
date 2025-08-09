import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Users, Trophy, Award, Clock, Trash2, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { firestore } from '../../lib/firebase';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead, deleteNotification, subscribeToNotifications, loadNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const [processingChallenge, setProcessingChallenge] = useState<string | null>(null);

  // Debug: Log current state when component mounts or updates
  useEffect(() => {
    if (isOpen && user?.uid) {
      console.log('NotificationMenu opened:', {
        user: user?.uid,
        notificationsCount: notifications.length,
        unreadCount,
        notifications: notifications.slice(0, 3) // Log first 3 notifications for debugging
      });
      
      // Note: Don't manually load here since Header component already subscribes to notifications
      // The subscription in Header should handle loading notifications automatically
    }
  }, [user, isOpen, notifications, unreadCount]);

  const handleAcceptChallenge = async (notification: any) => {
    if (!user || !notification.data?.challengeId) return;
    
    setProcessingChallenge(notification.id);
    
    try {
      const challengeId = notification.data.challengeId;
      
      // Create debate room
      const debateId = uuidv4();
      const debateDoc = doc(firestore, 'debates', debateId);
      
      await setDoc(debateDoc, {
        id: debateId,
        topic: notification.data.topic,
        aiModel: notification.data.aiModel,
        timePerUser: notification.data.timePerUser,
        rounds: notification.data.rounds,
        userStance: notification.data.stance, // Their stance (opposite of challenger's)
        customSettings: {
          aiModel: notification.data.aiModel,
          timePerUser: notification.data.timePerUser,
          rounds: notification.data.rounds,
          userStance: notification.data.stance
        },
        status: 'waiting',
        participants: [
          {
            userId: notification.data.fromUserId,
            displayName: notification.data.fromUserName,
            stance: notification.data.stance === 'pro' ? 'con' : 'pro' // Challenger gets opposite stance
          },
          {
            userId: user.uid,
            displayName: user.displayName || user.username || 'User',
            stance: notification.data.stance
          }
        ],
        participantIds: [notification.data.fromUserId, user.uid],
        createdAt: Date.now(),
        currentRound: 1,
        currentTurn: null,
        arguments: [],
        isCustom: true,
        fromChallenge: true,
        challengeId
      });

      // Update challenge status
      const challengeDoc = doc(firestore, 'challenges', challengeId);
      await updateDoc(challengeDoc, {
        status: 'accepted',
        acceptedBy: user.uid,
        debateId
      });

      // Notify the challenger that their challenge was accepted
      await addDoc(collection(firestore, 'notifications'), {
        userId: notification.data.fromUserId,
        type: 'challenge_accepted',
        title: 'Challenge Accepted!',
        message: `${user.displayName || user.username} accepted your debate challenge on "${notification.data.topic}"`,
        data: {
          debateId,
          acceptedBy: user.uid,
          acceptedByName: user.displayName || user.username,
          topic: notification.data.topic
        },
        actionUrl: `/custom-debate/${debateId}`, // Set explicit actionUrl for challenge-based debates
        read: false,
        createdAt: Date.now()
      });

      // Mark the notification as read and delete it
      await markAsRead(notification.id);
      await deleteNotification(notification.id);

      // Navigate to the debate room
      navigate(`/custom-debate/${debateId}`);
      onClose();
      
    } catch (error) {
      console.error('Error accepting challenge:', error);
    } finally {
      setProcessingChallenge(null);
    }
  };

  const handleDeclineChallenge = async (notification: any) => {
    if (!user || !notification.data?.challengeId) return;
    
    setProcessingChallenge(notification.id);
    
    try {
      const challengeId = notification.data.challengeId;
      
      // Update challenge to add this user to declined list
      const challengeDoc = doc(firestore, 'challenges', challengeId);
      await updateDoc(challengeDoc, {
        declinedBy: [...(notification.data.declinedBy || []), user.uid]
      });

      // Notify the challenger that their challenge was declined
      await addDoc(collection(firestore, 'notifications'), {
        userId: notification.data.fromUserId,
        type: 'challenge_declined',
        title: 'Challenge Declined',
        message: `${user.displayName || user.username} declined your debate challenge on "${notification.data.topic}"`,
        data: {
          declinedBy: user.uid,
          declinedByName: user.displayName || user.username,
          topic: notification.data.topic
        },
        read: false,
        createdAt: Date.now()
      });

      // Delete the notification
      await deleteNotification(notification.id);
      
    } catch (error) {
      console.error('Error declining challenge:', error);
    } finally {
      setProcessingChallenge(null);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    } else if (notification.data?.debateId) {
      // Always redirect to /custom-debate/ for consistency
      navigate(`/custom-debate/${notification.data.debateId}`);
      onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_received':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'challenge_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'challenge_declined':
        return <X className="w-5 h-5 text-red-500" />;
      case 'debate_start':
        return <Trophy className="w-5 h-5 text-purple-500" />;
      case 'achievement_unlocked':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date | number) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatTimeRemaining = (timestamp: Date | number) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = time.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'in less than a minute';
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${diffDays}d`;
  };

  const isExpired = (notification: any) => {
    if (!notification.expiresAt) return false;
    return new Date(notification.expiresAt).getTime() < Date.now();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
              {/* Manual refresh button for testing */}
              <button
                onClick={() => user && loadNotifications(user.uid)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Refresh notifications"
              >
                <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const expired = isExpired(notification);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      !notification.read 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } ${expired ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                              {expired && <span className="text-red-500 ml-1">(Expired)</span>}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.expiresAt && !expired && (
                                <span className="text-xs text-orange-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expires {formatTimeRemaining(notification.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        {/* Challenge Actions */}
                        {notification.type === 'challenge_received' && !expired && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptChallenge(notification)}
                              disabled={processingChallenge === notification.id}
                              className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              {processingChallenge === notification.id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleDeclineChallenge(notification)}
                              disabled={processingChallenge === notification.id}
                              className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              {processingChallenge === notification.id ? 'Declining...' : 'Decline'}
                            </button>
                          </div>
                        )}

                        {/* Clickable notifications */}
                        {(notification.actionUrl || notification.data?.debateId) && 
                         notification.type !== 'challenge_received' && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="text-blue-500 hover:text-blue-600 text-sm mt-2 font-medium"
                          >
                            View →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationMenu;
