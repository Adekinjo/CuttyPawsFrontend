import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { FaBell, FaCheck, FaCheckDouble, FaExclamationTriangle, FaWifi } from "react-icons/fa";
import { MessageCircle, UserPlus, PawPrint, Reply, Heart, Bookmark, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../service/NotificationService";
import ApiService from "../../service/AuthService";
import "./NotificationPage.css";

const NotificationAvatar = ({ imageUrl, alt }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(imageUrl) && !imageFailed;

  if (hasImage) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="notification-avatar"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="notification-avatar notification-avatar-fallback" aria-label={alt}>
      <PawPrint size={24} strokeWidth={2.2} />
    </div>
  );
};

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
          setNotifications((prev) => [...prev, ...newNotifications]);
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

      if (err.message && err.message.includes("JDBC") && err.message.includes("SQL")) {
        setError("Server error: Please try again later");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response && response.status === 200) {
        const count = response.totalComments || 0;
        setUnreadCount(count);
      }
    } catch {
      // no-op
    }
  }, []);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNotifications(page + 1, true);
    }
  };

  const handleMarkAsRead = async (notificationId, event = null) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      await NotificationService.markRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
      setSuccess("Notification marked as read");

      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllRead();

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

      setUnreadCount(0);
      setSuccess("All notifications marked as read");

      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to mark all notifications as read");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

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
      case "FOLLOW":
        if (notification.senderId) {
          navigate(`/customer-profile/${notification.senderId}`);
        } else {
          setError("User information not available");
        }
        break;
      default:
        break;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "read":
        return notification.read;
      default:
        return true;
    }
  });

  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;
  const readNotificationsCount = notifications.length - unreadNotificationsCount;

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
    } catch {
      return "Unknown time";
    }
  };

  const getSenderName = (notification) =>
    notification.senderName || notification.userName || "Someone";

  const extractCommentText = (notification) => {
    if (notification.commentContent) return notification.commentContent;
    if (notification.commentText) return notification.commentText;
    if (notification.content) return notification.content;
    if (!notification.message) return "";

    const quoted = notification.message.match(/["']([^"']+)["']/);
    if (quoted?.[1]) return quoted[1];

    return notification.message;
  };

  const extractReactionType = (notification) => {
    const source = (
      notification.reactionType ||
      notification.reaction ||
      notification.typeDetail ||
      notification.message ||
      ""
    )
      .toString()
      .toUpperCase();

    if (source.includes("LOVE")) return "LOVE";
    if (source.includes("HAHA")) return "HAHA";
    if (source.includes("WOW")) return "WOW";
    if (source.includes("SAD")) return "SAD";
    if (source.includes("ANGRY")) return "ANGRY";
    return "LIKE";
  };

  const getReactionBadge = (reactionType) => {
    const type = reactionType?.toUpperCase() || "LIKE";
    switch (type) {
      case "LOVE":
        return { label: "Loved", emoji: "❤️" };
      case "HAHA":
        return { label: "Found it funny", emoji: "😂" };
      case "WOW":
        return { label: "Reacted wow", emoji: "😮" };
      case "SAD":
        return { label: "Reacted sad", emoji: "😢" };
      case "ANGRY":
        return { label: "Reacted angry", emoji: "😠" };
      default:
        return { label: "Liked", emoji: "🐾" };
    }
  };

  const getPostPreviewImage = (notification) =>
    notification.postImage ||
    notification.postImageUrl ||
    notification.mediaUrl ||
    notification.imageUrl ||
    notification.thumbnailUrl ||
    "";

  const getNotificationPresentation = (notification) => {
    const type = notification.type;
    const sender = getSenderName(notification);
    const time = formatDate(notification.createdAt);

    if (type === "COMMENT" || type === "REPLY") {
      const commentText = extractCommentText(notification);
      return {
        icon: type === "REPLY" ? <Reply size={15} /> : <MessageCircle size={15} />,
        iconClass: "notif-badge-comment",
        title: (
          <>
            <strong>{sender}</strong> {type === "REPLY" ? "replied to your comment" : "commented on your post"}
          </>
        ),
        detail: commentText,
        time,
        previewImage: getPostPreviewImage(notification),
      };
    }

    if (type === "FOLLOW") {
      return {
        icon: <UserPlus size={15} />,
        iconClass: "notif-badge-follow",
        title: (
          <>
            <strong>{sender}</strong> started following you
          </>
        ),
        detail: "",
        time,
        previewImage: "",
      };
    }

    if (type === "POST_LIKE") {
      const reaction = getReactionBadge(extractReactionType(notification));
      return {
        icon: reaction.emoji === "❤️" ? <Heart size={15} /> : <PawPrint size={15} />,
        iconClass: "notif-badge-reaction",
        title: (
          <>
            <strong>{sender}</strong> {reaction.label.toLowerCase()} your post
          </>
        ),
        detail: `Reaction: ${reaction.emoji} ${reaction.label}`,
        time,
        previewImage: getPostPreviewImage(notification),
      };
    }

    if (type === "NEW_POST") {
      return {
        icon: <Bookmark size={15} />,
        iconClass: "notif-badge-post",
        title: (
          <>
            <strong>{sender}</strong> created a new post
          </>
        ),
        detail: notification.message || "",
        time,
        previewImage: getPostPreviewImage(notification),
      };
    }

    return {
      icon: <Bell size={15} />,
      iconClass: "notif-badge-default",
      title: notification.message || "New notification",
      detail: "",
      time,
      previewImage: getPostPreviewImage(notification),
    };
  };

  const handleNewNotification = useCallback((newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("New Notification", {
          body: newNotification.message,
          icon: newNotification.senderProfileImage || "/default-avatar.png",
        });
      } catch {
        // no-op
      }
    }
  }, []);

  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
    setConnectionChecked(true);
  }, []);

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    let unsubscribeConnection = null;

    const setupWebSocket = () => {
      try {
        unsubscribeConnection = NotificationService.onConnectionChange(handleConnectionChange);
        NotificationService.connect(handleNewNotification);
      } catch {
        if (isSubscribed) {
          setIsConnected(false);
          setConnectionChecked(true);
        }
      }
    };

    const websocketTimeout = setTimeout(setupWebSocket, 500);

    return () => {
      isSubscribed = false;
      clearTimeout(websocketTimeout);

      if (unsubscribeConnection) {
        unsubscribeConnection();
      }

      setTimeout(() => {
        NotificationService.disconnect();
      }, 100);
    };
  }, [handleNewNotification, handleConnectionChange]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

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
    <Container className="py-4 notifications-page-wrap">
      <Row className="justify-content-center">
        <Col lg={9} xl={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1 notification-title">Notifications</h2>
              <p className="text-muted mb-0 notification-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                {connectionChecked && (
                  <Badge bg={isConnected ? "success" : "warning"} className="ms-2" text={isConnected ? "white" : "dark"}>
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

            {unreadCount > 0 && (
              <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead} className="mark-all-btn">
                <FaCheckDouble className="me-2" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="notification-filter-bar mb-4">
            <button
              type="button"
              className={`notification-filter-pill ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notification-filter-pill ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadNotificationsCount})
            </button>
            <button
              type="button"
              className={`notification-filter-pill ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Read ({readNotificationsCount})
            </button>
          </div>

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

          {connectionChecked && !isConnected && (
            <Alert variant="warning" className="mb-4">
              <FaExclamationTriangle className="me-2" />
              Real-time notifications are currently offline. Notifications will update when you refresh the page.
            </Alert>
          )}

          <Card className="border-0 shadow-sm notification-list-card">
            <Card.Body className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <FaBell className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No notifications</h5>
                  <p className="text-muted">
                    {filter === "all" ? "You're all caught up!" : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredNotifications.map((notification) => {
                    const presentation = getNotificationPresentation(notification);
                    const senderName = getSenderName(notification);

                    return (
                      <div
                        key={notification.id}
                        className={`list-group-item list-group-item-action border-0 p-0 notification-item-row ${
                          !notification.read ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-item-card">
                          <div className="notification-avatar-wrap">
                            <NotificationAvatar
                              key={`${notification.id}-${notification.senderProfileImage || "fallback"}`}
                              imageUrl={notification.senderProfileImage}
                              alt={senderName}
                            />
                            <div className={`notification-type-badge ${presentation.iconClass}`}>{presentation.icon}</div>
                          </div>

                          <div className="notification-content">
                            <p className="notification-main-text">{presentation.title}</p>
                            {presentation.detail && <p className="notification-detail-text">"{presentation.detail}"</p>}
                            <div className="notification-meta-row">
                              <small className="notification-time">{presentation.time}</small>
                              {!notification.read && <span className="notification-unread-dot" />}
                            </div>
                          </div>

                          <div className="notification-right">
                            {presentation.previewImage ? (
                              <img
                                src={presentation.previewImage}
                                alt="Post preview"
                                className="notification-preview-image"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="notification-preview-fallback">
                                <FaBell />
                              </div>
                            )}

                            {!notification.read && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="notification-read-btn"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                title="Mark as read"
                              >
                                <FaCheck size={12} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

          {hasMore && filteredNotifications.length > 0 && (
            <div className="text-center mt-4">
              <Button variant="outline-primary" onClick={loadMore} disabled={loadingMore}>
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
