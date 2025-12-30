import ApiService from "./ApiService";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axios from "axios";

export default class NotificationService extends ApiService {
  static stompClient = null;
  static reconnectAttempts = 0;
  static maxReconnectAttempts = 5;
  static isConnected = false;
  static connectionCallbacks = new Set();

  // Add callback for connection status changes
  static onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  // Notify all connection callbacks
  static notifyConnectionChange(connected) {
    this.isConnected = connected;
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  // Connect to WebSocket
  static connect(onNotificationReceived) {
    try {
      // Clean up existing connection
      if (this.stompClient && this.isConnected) {
        this.disconnect();
      }

      const socket = new SockJS(`${this.BASE_URL}/ws`);
      this.stompClient = Stomp.over(socket);

      // Disable StompJS debug logs
      this.stompClient.debug = () => {};

      const token = localStorage.getItem("token");

      this.stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("🔗 WebSocket connected!");
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);

          // Subscribe to personal notification channel
          try {
            this.stompClient.subscribe(
              "/user/queue/notifications",
              (msg) => {
                try {
                  const body = JSON.parse(msg.body);
                  //console.log("📨 Received WebSocket notification:", body);
                  onNotificationReceived(body);
                } catch (error) {
                  //console.error("❌ Error parsing notification:", error);
                }
              }
            );
          //console.log("✅ Subscribed to /user/queue/notifications");
          } catch (subscribeError) {
            //console.error("❌ Error subscribing to notifications:", subscribeError);
          }
        },
        (err) => {
          //console.error("❌ WebSocket error:", err);
          this.notifyConnectionChange(false);
          this.handleReconnection(onNotificationReceived);
        }
      );

      // Add heartbeat to detect connection issues
      this.stompClient.heartbeat.outgoing = 10000; // Send every 10 seconds
      this.stompClient.heartbeat.incoming = 10000; // Expect every 10 seconds

    } catch (error) {
      //console.error("❌ WebSocket connection failed:", error);
      this.notifyConnectionChange(false);
      this.handleReconnection(onNotificationReceived);
    }
  }

  // Handle reconnection with exponential backoff
  static handleReconnection(onNotificationReceived) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      //console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(onNotificationReceived);
      }, delay);
    } else {
      //console.error("❌ Max reconnection attempts reached");
    }
  }

  // Safe disconnect
  static disconnect() {
    if (this.stompClient) {
      try {
        this.stompClient.disconnect(() => {
          //console.log("🔌 WebSocket disconnected safely");
          this.notifyConnectionChange(false);
        });
      } catch (error) {
        //console.warn("⚠️ Error during WebSocket disconnect:", error);
      } finally {
        this.stompClient = null;
        this.notifyConnectionChange(false);
      }
    }
    this.reconnectAttempts = 0;
  }

  // Check connection status
  static getConnectionStatus() {
    return this.isConnected;
  }

  // ... rest of your methods remain the same
  // ==========================
  // REST NOTIFICATION APIs
  // ==========================

  static async getMyNotifications(page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/notifications`,
        {
          params: { page, size },
          headers: this.getHeader(),
        }
      );
      //console.log("📋 REST API - Notifications response:", response.data);
      return response.data;
    } catch (error) {
      //console.error("❌ REST API - Error fetching notifications:", error);
      throw this.fallbackErrorHandler(error);
    }
  }

  static async getUnreadCount() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/notifications/unread-count`,
        { headers: this.getHeader() }
      );
      //console.log("📊 REST API - Unread count:", response.data);
      return response.data;
    } catch (error) {
      //console.error("❌ REST API - Error fetching unread count:", error);
      throw this.fallbackErrorHandler(error);
    }
  }

  static async markRead(notificationId) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.fallbackErrorHandler(error);
    }
  }

  static async markAllRead() {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/notifications/read-all`,
        {},
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.fallbackErrorHandler(error);
    }
  }

  // Fallback error handler
  static fallbackErrorHandler(error) {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      return { message: "Network error: Unable to connect to server" };
    } else {
      return { message: error.message || "An unexpected error occurred" };
    }
  }

  // Get header with authentication
  static getHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Get base URL from parent class or fallback
  static get BASE_URL() {
    return super.BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";
  }
  
  /** NEWSLETTER API */
  static async subscribeToNewsletter(email) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/newsletter/subscribe`,
        null,
        {
          params: { email },
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.fallbackErrorHandler(error);
    }
  }

  static async unsubscribeFromNewsletter(email) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/newsletter/unsubscribe`,
        null,
        {
          params: { email },
          headers: this.getHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.fallbackErrorHandler(error);
    }
  }
}