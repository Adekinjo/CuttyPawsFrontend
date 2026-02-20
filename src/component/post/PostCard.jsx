import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Image,
  Button,
  Modal,
  Carousel,
  Form,
  Alert,
  Collapse,
  Spinner
} from "react-bootstrap";
import {
  FaComment,
  FaShare,
  FaEllipsisH,
  FaTrash,
  FaEdit,
  FaPaperPlane,
  FaSignInAlt,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CommentService from "../../service/CommentsService";
import PostLikeService from "../../service/LikesService";
import CommentLikeService from "../../service/CommentLikeService";
import ReactionsPicker from "./ReactionsPicker";
import "./PostCard.css";

const formatDate = (dateString) => {
  if (!dateString) return "Unknown time";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleDateString();
  } catch {
    return "Unknown time";
  }
};

const PostCard = ({ post, onDelete, onEdit, isOwner = false, currentUser }) => {
  const navigate = useNavigate();

  // State
  const [showOptions, setShowOptions] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Post Reactions State
  const [userReaction, setUserReaction] = useState(null);
  const [reactionsCount, setReactionsCount] = useState({});
  const [totalReactions, setTotalReactions] = useState(0);
  const [reactionLoading, setReactionLoading] = useState(false);

  // Comments State
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [totalComments, setTotalComments] = useState(post?.commentCount ?? 0);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [showMoreCaption, setShowMoreCaption] = useState(false);

  // Comment Reactions State
  const [commentReactionsLoading, setCommentReactionsLoading] = useState({});

  // Initialize reactions from post data
  useEffect(() => {
    if (post) {
      // For backward compatibility, check if post has old like data
      if (post.likedByCurrentUser) {
        setUserReaction('LIKE');
      }
      setTotalReactions(post.likeCount || 0);
      
      // If post has reaction data, use it
      if (post.userReaction) {
        setUserReaction(post.userReaction);
      }
      if (post.reactionsCount) {
        setReactionsCount(post.reactionsCount);
      }
      if (post.totalReactions) {
        setTotalReactions(post.totalReactions);
      }
    }
  }, [post]);

  useEffect(() => {
    if (post) {
      console.log("Post media debug:", {
        postId: post.id,
        media: post.media,
        imageUrls: post.imageUrls
      });
    }
  }, [post]);

  // Fetch user reaction on component mount
  useEffect(() => {
    const fetchUserReaction = async () => {
      if (currentUser && post?.id) {
        try {
          const response = await PostLikeService.getUserReaction(post.id);
          if (response.status === 200 && response.data) {
            if (response.data.hasReacted) {
              setUserReaction(response.data.reactionType);
            }
          }
        } catch (error) {
          console.error("Error fetching user reaction:", error);
        }
      }
    };

    fetchUserReaction();
  }, [currentUser, post?.id]);

  // Post Reaction Handlers
  const handleReaction = async (reactionType) => {
    if (!currentUser) return navigate("/login");
    if (reactionLoading) return;

    setReactionLoading(true);
    setError("");

    try {
      const response = await PostLikeService.reactToPost(post.id, reactionType);
      
      if (response.status === 200) {
        setUserReaction(reactionType);
        
        // Update reaction counts from response
        if (response.data?.reactions?.counts) {
          setReactionsCount(response.data.reactions.counts);
          setTotalReactions(response.data.reactions.total);
        } else {
          // Fallback: increment total count if no detailed data
          setTotalReactions(prev => prev + 1);
        }
      }
    } catch (err) {
      setError("Failed to react to post");
      console.error("Reaction error:", err);
    } finally {
      setReactionLoading(false);
    }
  };

  const handleRemoveReaction = async () => {
    if (!currentUser || !userReaction) return;
    if (reactionLoading) return;

    setReactionLoading(true);
    setError("");

    try {
      const response = await PostLikeService.removeReaction(post.id);
      
      if (response.status === 200) {
        setUserReaction(null);
        
        // Update reaction counts from response
        if (response.data?.reactions?.counts) {
          setReactionsCount(response.data.reactions.counts);
          setTotalReactions(response.data.reactions.total);
        } else {
          // Fallback: decrement total count if no detailed data
          setTotalReactions(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      setError("Failed to remove reaction");
      console.error("Remove reaction error:", err);
    } finally {
      setReactionLoading(false);
    }
  };

  // Comment Reaction Handlers
  const handleCommentReaction = async (commentId, reactionType) => {
    if (!currentUser) return navigate("/login");
    
    setCommentReactionsLoading(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const response = await CommentLikeService.reactToComment(commentId, reactionType);
      
      if (response.status === 200) {
        // Update the specific comment's reactions
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                reactions: response.data?.counts || comment.reactions,
                likeCount: response.data?.total || comment.likeCount,
                isLikedByCurrentUser: true,
                userReaction: reactionType
              };
            }
            // Also update replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId ? {
                    ...reply,
                    reactions: response.data?.counts || reply.reactions,
                    likeCount: response.data?.total || reply.likeCount,
                    isLikedByCurrentUser: true,
                    userReaction: reactionType
                  } : reply
                )
              };
            }
            return comment;
          })
        );
      }
    } catch (err) {
      console.error("Comment reaction error:", err);
      setError(err.message || "Failed to react to comment");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCommentReactionsLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleRemoveCommentReaction = async (commentId) => {
    if (!currentUser) return;
    
    setCommentReactionsLoading(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const response = await CommentLikeService.removeReaction(commentId);
      
      if (response.status === 200) {
        // Update the specific comment's reactions
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                reactions: response.data?.counts || comment.reactions,
                likeCount: response.data?.total || comment.likeCount,
                isLikedByCurrentUser: false,
                userReaction: null
              };
            }
            // Also update replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId ? {
                    ...reply,
                    reactions: response.data?.counts || reply.reactions,
                    likeCount: response.data?.total || reply.likeCount,
                    isLikedByCurrentUser: false,
                    userReaction: null
                  } : reply
                )
              };
            }
            return comment;
          })
        );
      }
    } catch (err) {
      console.error("Remove comment reaction error:", err);
      setError(err.message || "Failed to remove reaction");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCommentReactionsLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

    // Keep comment count in sync when post changes (or when feed refreshes)
  useEffect(() => {
    if (!post) return;

    // Prefer backend "commentCount"
    if (post.commentCount !== undefined && post.commentCount !== null) {
      setTotalComments(post.commentCount);
      return;
    }

    // Backward compatibility if your API uses totalComments
    if (post.totalComments !== undefined && post.totalComments !== null) {
      setTotalComments(post.totalComments);
    }
  }, [post?.id, post?.commentCount, post?.totalComments]);


  // Comment Handlers
  const fetchComments = async () => {
    setCommentsLoading(true);
    setError("");
    try {
      const res = await CommentService.getCommentsByPostId(post.id, 0, 50);
      // if (res.status === 200) {
      //   setComments(res.commentList || []);
      //   setTotalComments(res.totalComments || 0);
      //}
      if (res.status === 200) {
        const list = res.commentList || [];
        setComments(list);

        setTotalComments(
          res.totalComments ??   // if API sends total count
          post?.commentCount ??  // fallback to post count
          list.length            // fallback to loaded list length
        );
      }

    } catch {
      setError("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setError("");

    try {
      const res = await CommentService.createComment({
        postId: post.id,
        content: newComment.trim()
      });

      if (res.status === 200) {
        if (res.comment) {
          setComments(prev => [res.comment, ...prev]);
        }
        setNewComment("");
        setTotalComments(prev => prev + 1);
        
        if (!showComments) {
          setShowComments(true);
        }
      } else {
        setError(res.message || "Failed to add comment.");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(err.message || "Failed to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const submitReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    try {
      const res = await CommentService.createComment({
        postId: post.id,
        content: replyText.trim(),
        parentCommentId: commentId
      });

      if (res.status === 200) {
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      } else {
        setError(res.message || "Failed to reply.");
      }
    } catch (err) {
      console.error("Error creating reply:", err);
      setError(err.message || "Failed to reply.");
    }
  };

  const removeComment = async (commentId) => {
    if (!window.confirm("Delete comment?")) return;
    try {
      await CommentService.deleteComment(commentId);
      setComments(c => c.filter(x => x.id !== commentId));
      setTotalComments(c => c - 1);
    } catch {
      setError("Failed to delete comment.");
    }
  };

  // Reaction Display Helpers for Post
  const getReactionIcon = (reactionType) => {
    const emojis = {
      LIKE: '👍',
      LOVE: '❤️',
      HAHA: '😄',
      WOW: '😲',
      SAD: '😢',
      ANGRY: '😠'
    };
    return emojis[reactionType] || emojis.LIKE;
  };

  // Simple comment like button component
  const CommentLikeButton = ({ comment }) => {
    const isLoading = commentReactionsLoading[comment.id];
    
    return (
      <Button
        variant="link"
        size="sm"
        className="p-0 like-comment-btn d-flex align-items-center gap-1"
        disabled={isLoading}
        onClick={() => 
          comment.isLikedByCurrentUser 
            ? handleRemoveCommentReaction(comment.id)
            : handleCommentReaction(comment.id, 'LIKE')
        }
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : comment.isLikedByCurrentUser ? (
          <FaHeart className="text-danger" />
        ) : (
          <FaRegHeart />
        )}
        {comment.likeCount > 0 && (
          <span className="small text-muted">{comment.likeCount}</span>
        )}
      </Button>
    );
  };

  const mediaItems = useMemo(() => {
    if (Array.isArray(post?.media) && post.media.length > 0) {
      return post.media
        .map((item) => ({
          url: item?.url || item?.mediaUrl,
          type: item?.type || item?.mediaType,
          thumbnailUrl: item?.thumbnailUrl || null
        }))
        .filter((item) => item.url);
    }
    if (Array.isArray(post?.imageUrls) && post.imageUrls.length > 0) {
      return post.imageUrls
        .filter(Boolean)
        .map((url) => ({ url, type: "IMAGE", thumbnailUrl: null }));
    }
    return [];
  }, [post]);

  const renderMedia = (item, idx, isModal = false) => {
    const isVideo = (item.type || "").toUpperCase() === "VIDEO";
    if (isVideo) {
      return (
        <video
          key={idx}
          controls
          className={isModal ? "modal-image" : "post-image"}
          poster={item.thumbnailUrl || undefined}
          style={!isModal ? { width: "100%" } : undefined}
        >
          <source src={item.url} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <Image
        key={idx}
        src={item.url}
        fluid
        className={isModal ? "modal-image" : "post-image"}
        onClick={
          !isModal
            ? () => {
                setSelectedImage(idx);
                setShowImageModal(true);
              }
            : undefined
        }
      />
    );
  };

  return (
    <Card className="post-card">
      {/* Header */}
      <Card.Header className="post-header d-flex justify-content-between align-items-center">
        <Link to={`/customer-profile/${post.ownerId}`} className="d-flex text-decoration-none align-items-center">
          <Image
            src={post.ownerProfileImage || "/default-avatar.png"}
            roundedCircle
            className="post-avatar me-3"
          />
          <div>
            <strong className="post-owner-name">{post.ownerName}</strong>
            <div className="post-time text-muted small">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </Link>

        {isOwner && (
          <div className="position-relative">
            <Button 
              variant="link" 
              className="p-0 post-options-btn"
              onClick={() => setShowOptions(!showOptions)}
            >
              <FaEllipsisH size={18} />
            </Button>

            {showOptions && (
              <div className="post-options-menu">
                <Button variant="link" onClick={() => navigate(`/edit-post/${post.id}`)}>
                  <FaEdit className="me-1" /> Edit
                </Button>
                <Button variant="link" className="text-danger" onClick={() => onDelete(post.id)}>
                  <FaTrash className="me-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Header>

      {/* Images */}
      {mediaItems.length > 0 && (
        <Carousel controls={false} indicators interval={null} className="post-images">
          {mediaItems.map((item, idx) => (
            <Carousel.Item key={idx}>
              {renderMedia(item, idx)}
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      {/* Body */}
      <Card.Body className="post-body">
        {/* Action Buttons with Counts */}
        <div className="post-actions-container d-flex justify-content-around align-items-center mb-3 py-2">
          {/* Reactions Button with Count */}
          <div className="action-item d-flex align-items-center">
            <div className="action-icon-wrapper">
              <ReactionsPicker
                onReactionSelect={handleReaction}
                onRemoveReaction={handleRemoveReaction}
                currentReaction={userReaction}
                size={24}
                className="reaction-picker-trigger"
              />
            </div>
            {totalReactions > 0 && (
              <span className="action-count ms-2 small fw-medium">
                {totalReactions}
              </span>
            )}
          </div>

          {/* Comments Button with Count */}
          <div className="action-item d-flex align-items-center">
            <Button 
              variant="link" 
              className="action-btn p-2 d-flex align-items-center text-decoration-none"
              onClick={toggleComments}
            >
              <div className="action-icon-wrapper">
                <FaComment size={22} className="action-icon" />
              </div>
            </Button>
            {totalComments > 0 && (
              <span className="action-count ms-2 small fw-medium">
                {totalComments} comment{totalComments > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Share Button (Placeholder) */}
          <div className="action-item d-flex align-items-center">
            <Button 
              variant="link" 
              className="action-btn p-2 d-flex align-items-center text-decoration-none"
            >
              <div className="action-icon-wrapper">
                <FaShare size={22} className="action-icon" />
              </div>
            </Button>
            {/* {post.shareCount > 0 && (
              <span className="action-count ms-2 small fw-medium">
                {post.shareCount || 0}c
              </span>
            )} */}
          </div>
        </div>

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="d-flex gap-1">
              {Object.entries(reactionsCount)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .slice(0, 3)
                .map(([type]) => (
                  <span key={type} style={{ fontSize: '0.9rem' }}>
                    {getReactionIcon(type)}
                  </span>
                ))}
            </div>
            <span className="text-muted small">
              {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
            </span>
          </div>
        )}
        {/* Caption (Username + Caption with Profile Link) */}
        {post.caption && (
          <div className="post-caption mb-3">
            <Link
              to={`/customer-profile/${post.ownerId}`}
              className="post-caption-username text-decoration-none"
            >
              {post.ownerName || "Unknown"}
            </Link>

            <span className="post-caption-text">
              {post.caption.length > 150 && !showMoreCaption
                ? post.caption.substring(0, 150) + "..."
                : post.caption}
            </span>

            {post.caption.length > 150 && (
              <Button
                variant="link"
                className="ms-1 p-0 caption-toggle"
                onClick={() => setShowMoreCaption(!showMoreCaption)}
              >
                {showMoreCaption ? "less" : "more"}
              </Button>
            )}
          </div>
        )}


        {/* Add Comment Form */}
        {currentUser ? (
          <Form onSubmit={submitComment} className="d-flex gap-2 mb-3 comment-form">
            <Form.Control
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
              disabled={commentLoading}
            />
            <Button
              className="comment-submit-btn"
              disabled={!newComment.trim() || commentLoading}
              type="submit"
            >
              {commentLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
            </Button>
          </Form>
        ) : (
          <Button
            className="login-to-comment-btn w-100"
            onClick={() => navigate("/login")}
          >
            <FaSignInAlt className="me-1" /> Login to comment
          </Button>
        )}

        {/* Error */}
        {error && (
          <Alert variant="danger" className="mt-2">
            {error}
          </Alert>
        )}

        {/* Comments */}
        <Collapse in={showComments}>
          <div className="mt-3">
            {commentsLoading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            )}

            {!commentsLoading && comments.length === 0 && (
              <div className="text-center py-3 text-muted">
                No comments yet. Be the first to comment!
              </div>
            )}

            {!commentsLoading && comments.map((comment) => (
              <div key={comment.id} className="mb-3 comment-item">
                <div className="d-flex">
                  <Link
                    to={`/customer-profile/${comment.userId}`}
                    className="text-decoration-none"
                  >
                    <Image
                      src={comment.userProfileImage || "/default-avatar.png"}
                      roundedCircle
                      className="comment-avatar me-2"
                    />
                  </Link>
                  <div className="comment-content flex-grow-1">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="flex-grow-1">
                        <Link
                          to={`/customer-profile/${comment.userId}`}
                          className="text-decoration-none"
                        >
                          <strong className="comment-author">{comment.userName}</strong>
                        </Link>
                        <p className="comment-text mb-1">{comment.content}</p>
                        
                        <div className="d-flex gap-3 comment-meta align-items-center">
                          <small className="text-muted">
                            {formatDate(comment.createdAt)}
                          </small>
                          
                          <CommentLikeButton comment={comment} />
                          
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 reply-btn"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            Reply
                          </Button>
                          
                          {(currentUser?.id === comment.userId || isOwner) && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-danger delete-comment-btn"
                              onClick={() => removeComment(comment.id)}
                            >
                              <FaTrash size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="d-flex ms-5 mt-2 reply-form">
                    <Form.Control
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="reply-input"
                      size="sm"
                    />
                    <Button
                      className="ms-2 reply-submit-btn"
                      disabled={!replyText.trim()}
                      onClick={() => submitReply(comment.id)}
                      size="sm"
                    >
                      <FaPaperPlane />
                    </Button>
                  </div>
                )}

                {/* Child Replies */}
                {comment.replies?.length > 0 && (
                  <div className="ms-5 mt-2 replies-container">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="d-flex mb-2 reply-item">
                        <Link
                          to={`/customer-profile/${reply.userId}`}
                          className="text-decoration-none"
                        >
                          <Image
                            src={reply.userProfileImage || "/default-avatar.png"}
                            roundedCircle
                            className="reply-avatar me-2"
                          />
                        </Link>
                        <div className="reply-content flex-grow-1">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <Link
                                to={`/customer-profile/${reply.userId}`}
                                className="text-decoration-none"
                              >
                                <strong>{reply.userName}</strong>
                              </Link>
                              <p className="small mb-1">{reply.content}</p>
                              
                              <div className="d-flex gap-3 align-items-center">
                                <small className="text-muted">
                                  {formatDate(reply.createdAt)}
                                </small>
                                
                                <CommentLikeButton comment={reply} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Collapse>
      </Card.Body>

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered className="image-modal">
        <Modal.Body className="p-0">
          {mediaItems[selectedImage]
            ? renderMedia(mediaItems[selectedImage], selectedImage, true)
            : null}
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default PostCard;
