import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => n.isRead === false).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    let intervalId;

    if (user) {
      // First fetch immediately when user is authenticated
      fetchNotifications();
      
      // Setup polling every 30 seconds
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 30000);
    } else {
      // Clear notifications if not authenticated
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  // Method to manually update state after reading
  const markAsReadLocally = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsReadLocally }}>
      {children}
    </NotificationContext.Provider>
  );
};
