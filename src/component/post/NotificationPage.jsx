import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Dropdown } from "react-bootstrap";
import { FaBell, FaCheck, FaCheckDouble, FaFilter, FaExclamationTriangle, FaWifi } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../service/NotificationService";
import ApiService from "../../service/AuthService";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
      }

      const response = await NotificationService.getMyNotifications(pageNum, 20);
      
      if (response && response.status === 200) {
        const newNotifications = response.notificationList || [];
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setHasMore(newNotifications.length === 20);
        setPage(pageNum);
      } else {
        throw new Error(response?.message || "Failed to fetch notifications");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to load notifications";
      
      if (err.message && err.message.includes('JDBC') && err.message.includes('SQL')) {
        setError("Server error: Please try again later");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response && response.status === 200) {
        const count = response.totalComments || 0;
        setUnreadCount(count);
        //console.log(`📊 Unread count: ${count}`);
      }
    } catch (err) {
      //console.error("Error fetching unread count:", err);
    }
  }, []);

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId, event = null) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await NotificationService.markRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      setSuccess("Notification marked as read");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to mark notification as read");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllRead();
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadCount(0);
      setSuccess("All notifications marked as read");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to mark all notifications as read");
    }
  };
  // In your NotificationPage.jsx - Update the handleNotificationClick function
const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
        await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
        case "NEW_POST":
        case "POST_LIKE":
        case "COMMENT":
            if (notification.postId) {
                navigate(`/post/${notification.postId}`);
            } else {
                setError("Post information not available");
            }
            break;
        case "REPLY":
            if (notification.postId && notification.commentId) {
                navigate(`/post/${notification.postId}?comment=${notification.commentId}`);
            } else {
                setError("Post or comment information not available");
            }
            break;
        case "FOLLOW": // Add this case
            if (notification.senderId) {
                navigate(`/customer-profile/${notification.senderId}`);
            } else {
                setError("User information not available");
            }
            break;
        default:
            //console.log("Unknown notification type:", notification.type);
            break;
    }
  };


  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "read":
        return notification.read;
      default:
        return true;
    }
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown time";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown time";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_POST":
        return "📝";
      case "POST_LIKE":
        return "❤️";
      case "COMMENT":
        return "💬";
      case "REPLY":
        return "↩️";
      case "FOLLOW": 
          return "👥";
      default:
        return "🔔";
    }
  };

  // Handle new WebSocket notifications
  const handleNewNotification = useCallback((newNotification) => {
    //console.log("📨 Processing new WebSocket notification:", newNotification);
    
    // Add new notification to the top
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show desktop notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("New Notification", {
          body: newNotification.message,
          icon: newNotification.senderProfileImage || "/default-avatar.png"
        });
      } catch (notifError) {
        //console.warn("Desktop notification failed:", notifError);
      }
    }
  }, []);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected) => {
    //console.log(`🌐 WebSocket connection status: ${connected ? 'Connected' : 'Disconnected'}`);
    setIsConnected(connected);
    setConnectionChecked(true);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    let unsubscribeConnection = null;

    const setupWebSocket = () => {
      try {
        
        // Subscribe to connection status changes
        unsubscribeConnection = NotificationService.onConnectionChange(handleConnectionChange);
        
        // Connect to WebSocket
        NotificationService.connect(handleNewNotification);
        
      } catch (err) {
        if (isSubscribed) {
          setIsConnected(false);
          setConnectionChecked(true);
        }
      }
    };

    // Delay WebSocket connection to ensure REST calls complete first
    const websocketTimeout = setTimeout(setupWebSocket, 500);

    return () => {
      isSubscribed = false;
      clearTimeout(websocketTimeout);
      
      if (unsubscribeConnection) {
        unsubscribeConnection();
      }
      
      // Use setTimeout to ensure cleanup happens after component unmounts
      setTimeout(() => {
        NotificationService.disconnect();
      }, 100);
    };
  }, [handleNewNotification, handleConnectionChange]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchNotifications(0);
      fetchUnreadCount();
    } else {
      setLoading(false);
      setError("Please log in to view notifications");
    }
  }, [fetchNotifications, fetchUnreadCount]);

  if (loading && notifications.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading notifications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Notifications</h2>
              <p className="text-muted mb-0">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                {connectionChecked && (
                  <Badge 
                    bg={isConnected ? "success" : "warning"} 
                    className="ms-2" 
                    text={isConnected ? "white" : "dark"}
                  >
                    {isConnected ? (
                      <>
                        <FaWifi className="me-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="me-1" />
                        Offline
                      </>
                    )}
                  </Badge>
                )}
              </p>
            </div>
            
            <div className="d-flex gap-2">
              {/* Filter Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <FaFilter className="me-2" />
                  {filter === "all" ? "All" : filter === "unread" ? "Unread" : "Read"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilter("all")}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilter("unread")}>Unread</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilter("read")}>Read</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
                  <FaCheckDouble className="me-2" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mb-4">
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Connection Status */}
          {connectionChecked && !isConnected && (
            <Alert variant="warning" className="mb-4">
              <FaExclamationTriangle className="me-2" />
              Real-time notifications are currently offline. Notifications will update when you refresh the page.
            </Alert>
          )}

          {/* Notifications List */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <FaBell className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No notifications</h5>
                  <p className="text-muted">
                    {filter === "all" 
                      ? "You're all caught up!" 
                      : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`list-group-item list-group-item-action border-0 p-3 ${
                        !notification.read ? 'bg-light' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        {/* Notification Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <span style={{ fontSize: '1.2rem' }}>
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* Notification Content */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <p className="mb-1 fw-medium">{notification.message || "New notification"}</p>
                            {!notification.read && (
                              <Badge bg="primary" className="flex-shrink-0">
                                New
                              </Badge>
                            )}
                          </div>

                          {/* Sender Info */}
                          {notification.senderName && (
                            <div className="d-flex align-items-center gap-2 mb-2">
                              {notification.senderProfileImage && (
                                <img
                                  src={notification.senderProfileImage}
                                  alt={notification.senderName}
                                  className="rounded-circle"
                                  style={{ width: '20px', height: '20px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <small className="text-muted">{notification.senderName}</small>
                            </div>
                          )}

                          {/* Timestamp and Actions */}
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {formatDate(notification.createdAt)}
                            </small>
                            
                            {!notification.read && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="ms-2"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                              >
                                <FaCheck size={12} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Load More Button */}
          {hasMore && filteredNotifications.length > 0 && (
            <div className="text-center mt-4">
              <Button
                variant="outline-primary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {/* Empty state for no more notifications */}
          {!hasMore && filteredNotifications.length > 0 && (
            <div className="text-center mt-4">
              <p className="text-muted">No more notifications to load</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationPage;