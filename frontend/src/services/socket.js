import { io } from 'socket.io-client';
import { store } from '../redux/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');

      // Authenticate socket connection
      const state = store.getState();
      if (state.auth.isAuthenticated && state.auth.user) {
        this.socket.emit('authenticate', state.auth.user._id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Handle notifications
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      this.handleNotification(notification);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  authenticate(userId) {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', userId);
    }
  }

  handleNotification(notification) {
    // Dispatch notification to Redux store or show toast
    // This will be handled by the notification system
    const event = new CustomEvent('socket-notification', {
      detail: notification,
    });
    window.dispatchEvent(event);
  }

  // Add event listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
        if (this.socket) {
          this.socket.off(event, callback);
        }
      }
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;