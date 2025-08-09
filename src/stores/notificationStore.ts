import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { NotificationData, Achievement, ToastMessage } from '../types/global';
import { UserNotification } from '../types/user';

interface NotificationState {
  notifications: UserNotification[];
  toasts: ToastMessage[];
  achievements: Achievement[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface NotificationActions {
  // Notifications
  loadNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
  
  // Toasts
  showToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  hideToast: (toastId: string) => void;
  clearAllToasts: () => void;
  
  // Achievements
  unlockAchievement: (userId: string, achievementId: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
  
  // System notifications
  sendDebateInvite: (fromUserId: string, toUserId: string, debateId: string, topic: string) => Promise<void>;
  sendMatchFound: (userId: string, debateId: string, opponent: string) => Promise<void>;
  sendDebateResult: (userId: string, debateId: string, result: 'win' | 'loss' | 'draw', ratingChange: number) => Promise<void>;
  sendAchievementUnlocked: (userId: string, achievement: Achievement) => Promise<void>;
  
  // Challenge notifications
  sendChallengeReceived: (fromUserId: string, fromUserName: string, toUserIds: string[], challengeId: string, topic: string, settings: any, expiresAt: number) => Promise<void>;
  sendChallengeAccepted: (challengerId: string, acceptedBy: string, acceptedByName: string, topic: string, debateId: string) => Promise<void>;
  sendChallengeDeclined: (challengerId: string, declinedBy: string, declinedByName: string, topic: string) => Promise<void>;
  sendChallengeExpired: (challengerId: string, topic: string, expiredUsers: string[]) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationStore>()(subscribeWithSelector(
  (set, get) => ({
    notifications: [],
    toasts: [],
    achievements: [],
    unreadCount: 0,
    loading: false,
    error: null,

    loadNotifications: async (userId: string) => {
      set({ loading: true, error: null });
      console.log('Loading notifications for user:', userId);
      
      try {
        const notificationsQuery = query(
          collection(firestore, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const notificationsSnapshot = await getDocs(notificationsQuery);
        console.log('Loaded notifications snapshot:', {
          size: notificationsSnapshot.size,
          empty: notificationsSnapshot.empty
        });
        
        const notifications = notificationsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing notification doc:', { id: doc.id, data });
          
          // Handle different timestamp formats that might exist in Firestore
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (typeof data.createdAt === 'number') {
              createdAt = new Date(data.createdAt);
            }
          }
          
          let expiresAt;
          if (data.expiresAt) {
            if (typeof data.expiresAt.toDate === 'function') {
              expiresAt = data.expiresAt.toDate();
            } else if (data.expiresAt instanceof Date) {
              expiresAt = data.expiresAt;
            } else if (typeof data.expiresAt === 'number') {
              expiresAt = new Date(data.expiresAt);
            }
          }
          
          return {
            id: doc.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            read: data.read || false,
            createdAt,
            expiresAt,
            actionUrl: data.actionUrl
          } as UserNotification;
        });
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        console.log('Processed loaded notifications:', {
          total: notifications.length,
          unreadCount,
          firstFew: notifications.slice(0, 3).map(n => ({ id: n.id, type: n.type, title: n.title }))
        });
        
        set({ notifications, unreadCount, loading: false });
      } catch (error: any) {
        console.error('Error loading notifications:', error);
        set({ error: error.message, loading: false });
      }
    },

    markAsRead: async (notificationId: string) => {
      try {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        set({ notifications: updatedNotifications, unreadCount });
        
        // Update in Firestore
        await updateDoc(doc(firestore, 'notifications', notificationId), {
          read: true
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    markAllAsRead: async (userId: string) => {
      try {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        set({ notifications: updatedNotifications, unreadCount: 0 });
        
        // Update all in Firestore (batch operation would be better)
        const promises = notifications
          .filter(n => !n.read)
          .map(n => updateDoc(doc(firestore, 'notifications', n.id), {
            read: true
          }));
        
        await Promise.all(promises);
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    deleteNotification: async (notificationId: string) => {
      try {
        const { notifications } = get();
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        set({ notifications: updatedNotifications, unreadCount });
        
        await deleteDoc(doc(firestore, 'notifications', notificationId));
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    subscribeToNotifications: (userId: string) => {
      console.log('Setting up notification subscription for user:', userId);
      
      const notificationsQuery = query(
        collection(firestore, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        console.log('Notification snapshot received:', {
          size: snapshot.size,
          empty: snapshot.empty,
          docChanges: snapshot.docChanges().length
        });
        
        const notifications = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing notification doc:', { id: doc.id, data });
          
          // Handle different timestamp formats that might exist in Firestore
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (typeof data.createdAt === 'number') {
              createdAt = new Date(data.createdAt);
            }
          }
          
          let expiresAt;
          if (data.expiresAt) {
            if (typeof data.expiresAt.toDate === 'function') {
              expiresAt = data.expiresAt.toDate();
            } else if (data.expiresAt instanceof Date) {
              expiresAt = data.expiresAt;
            } else if (typeof data.expiresAt === 'number') {
              expiresAt = new Date(data.expiresAt);
            }
          }
          
          return {
            id: doc.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            read: data.read || false,
            createdAt,
            expiresAt,
            actionUrl: data.actionUrl
          } as UserNotification;
        });
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        console.log('Processed notifications:', {
          total: notifications.length,
          unreadCount,
          firstFew: notifications.slice(0, 3).map(n => ({ id: n.id, type: n.type, title: n.title }))
        });
        
        set({ notifications, unreadCount });
      }, (error) => {
        console.error('Notification subscription error:', error);
        set({ error: error.message });
      });
      
      return unsubscribe;
    },

    showToast: (toast: Omit<ToastMessage, 'id'>) => {
      const newToast: ToastMessage = {
        ...toast,
        id: generateId()
      };
      
      set(state => ({ toasts: [...state.toasts, newToast] }));
      
      // Auto-hide toast after duration
      const duration = toast.duration || 5000;
      if (duration > 0) {
        setTimeout(() => {
          get().hideToast(newToast.id);
        }, duration);
      }
    },

    hideToast: (toastId: string) => {
      set(state => ({
        toasts: state.toasts.filter(toast => toast.id !== toastId)
      }));
    },

    clearAllToasts: () => {
      set({ toasts: [] });
    },

    unlockAchievement: async (userId: string, achievementId: string) => {
      try {
        const { achievements } = get();
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.unlockedBy.includes(userId)) return;
        
        const updatedAchievement = {
          ...achievement,
          unlockedBy: [...achievement.unlockedBy, userId]
        };
        
        const updatedAchievements = achievements.map(a =>
          a.id === achievementId ? updatedAchievement : a
        );
        
        set({ achievements: updatedAchievements });
        
        // Show achievement toast
        get().showToast({
          type: 'success',
          title: 'Achievement Unlocked!',
          message: `${achievement.name}: ${achievement.description}`,
          duration: 8000
        });
        
        // Save to user's achievements in Firestore
        await addDoc(collection(firestore, 'user_achievements'), {
          userId,
          achievementId,
          unlockedAt: Timestamp.now(),
          xpAwarded: achievement.reward.xp
        });
        
        // Send notification
        await get().sendAchievementUnlocked(userId, updatedAchievement);
        
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    loadAchievements: async () => {
      set({ loading: true, error: null });
      try {
        const achievementsQuery = query(collection(firestore, 'achievements'));
        const achievementsSnapshot = await getDocs(achievementsQuery);
        const achievements = achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Achievement[];
        
        set({ achievements, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    sendDebateInvite: async (fromUserId: string, toUserId: string, debateId: string, topic: string) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId: toUserId,
          type: 'debate_invite',
          title: 'Debate Invitation',
          message: `You've been invited to debate: ${topic}`,
          data: {
            debateId,
            fromUserId,
            topic
          },
          read: false,
          createdAt: new Date()
        };
        
        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendMatchFound: async (userId: string, debateId: string, opponent: string) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId,
          type: 'debate_start',
          title: 'Match Found!',
          message: `You've been matched with ${opponent} for a debate`,
          data: {
            debateId,
            opponent
          },
          read: false,
          createdAt: new Date()
        };
        
        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendDebateResult: async (userId: string, debateId: string, result: 'win' | 'loss' | 'draw', ratingChange: number) => {
      try {
        const resultMessages = {
          win: `Congratulations! You won the debate and gained ${ratingChange} rating points.`,
          loss: `You lost the debate and lost ${Math.abs(ratingChange)} rating points. Better luck next time!`,
          draw: 'The debate ended in a draw. No rating change.'
        };
        
        const notification: Omit<UserNotification, 'id'> = {
          userId,
          type: 'debate_end',
          title: `Debate ${result.charAt(0).toUpperCase() + result.slice(1)}`,
          message: resultMessages[result],
          data: {
            debateId,
            result,
            ratingChange
          },
          read: false,
          createdAt: new Date()
        };
        
        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendAchievementUnlocked: async (userId: string, achievement: Achievement) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId,
          type: 'achievement_unlocked',
          title: 'Achievement Unlocked!',
          message: `${achievement.name}: ${achievement.description}`,
          data: {
            achievementId: achievement.id,
            xpReward: achievement.reward.xp
          },
          read: false,
          createdAt: new Date()
        };
        
        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendChallengeReceived: async (fromUserId: string, fromUserName: string, toUserIds: string[], challengeId: string, topic: string, settings: any, expiresAt: number) => {
      try {
        for (const userId of toUserIds) {
          const notification: Omit<UserNotification, 'id'> = {
            userId,
            type: 'challenge_received',
            title: 'New Debate Challenge!',
            message: `${fromUserName} has challenged you to debate: "${topic}"`,
            data: {
              challengeId,
              fromUserId,
              fromUserName,
              topic,
              ...settings,
              expiresAt
            },
            read: false,
            createdAt: new Date(),
            expiresAt: new Date(expiresAt)
          };

          await addDoc(collection(firestore, 'notifications'), {
            ...notification,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(expiresAt))
          });
        }
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendChallengeAccepted: async (challengerId: string, acceptedBy: string, acceptedByName: string, topic: string, debateId: string) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId: challengerId,
          type: 'challenge_accepted',
          title: 'Challenge Accepted!',
          message: `${acceptedByName} accepted your debate challenge on "${topic}"`,
          data: {
            debateId,
            acceptedBy,
            acceptedByName,
            topic
          },
          read: false,
          createdAt: new Date(),
          actionUrl: `/custom-debate/${debateId}`
        };

        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendChallengeDeclined: async (challengerId: string, declinedBy: string, declinedByName: string, topic: string) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId: challengerId,
          type: 'challenge_declined',
          title: 'Challenge Declined',
          message: `${declinedByName} declined your debate challenge on "${topic}"`,
          data: {
            declinedBy,
            declinedByName,
            topic
          },
          read: false,
          createdAt: new Date()
        };

        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    sendChallengeExpired: async (challengerId: string, topic: string, expiredUsers: string[]) => {
      try {
        const notification: Omit<UserNotification, 'id'> = {
          userId: challengerId,
          type: 'challenge_expired',
          title: 'Challenge Expired',
          message: `Your debate challenge on "${topic}" has expired without being accepted`,
          data: {
            topic,
            expiredUsers
          },
          read: false,
          createdAt: new Date()
        };

        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          createdAt: Timestamp.now()
        });
      } catch (error: any) {
        set({ error: error.message });
      }
    },

    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null })
  })
));

// Utility hooks
export const useToast = () => {
  const { showToast } = useNotificationStore();
  
  return {
    success: (message: string, title?: string) => showToast({
      type: 'success',
      title: title || 'Success',
      message
    }),
    error: (message: string, title?: string) => showToast({
      type: 'error',
      title: title || 'Error',
      message
    }),
    warning: (message: string, title?: string) => showToast({
      type: 'warning',
      title: title || 'Warning',
      message
    }),
    info: (message: string, title?: string) => showToast({
      type: 'info',
      title: title || 'Info',
      message
    })
  };
};

// Achievement checker utility
export const checkAchievements = (userId: string, stats: any) => {
  const { unlockAchievement, achievements } = useNotificationStore.getState();
  
  // Check various achievement conditions
  if (stats.totalDebates === 1) {
    unlockAchievement(userId, 'first_debate');
  }
  
  if (stats.totalDebates === 10) {
    unlockAchievement(userId, 'debates_10');
  }
  
  if (stats.totalDebates === 50) {
    unlockAchievement(userId, 'debates_50');
  }
  
  if (stats.totalDebates === 100) {
    unlockAchievement(userId, 'debates_100');
  }
  
  if (stats.streak === 3) {
    unlockAchievement(userId, 'win_streak_3');
  }
  
  if (stats.streak === 5) {
    unlockAchievement(userId, 'win_streak_5');
  }
  
  if (stats.rating >= 1500) {
    unlockAchievement(userId, 'rating_1500');
  }
  
  if (stats.rating >= 1800) {
    unlockAchievement(userId, 'rating_1800');
  }
  
  if (stats.rating >= 2000) {
    unlockAchievement(userId, 'rating_2000');
  }
};