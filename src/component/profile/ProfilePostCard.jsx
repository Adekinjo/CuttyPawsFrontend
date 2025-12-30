import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Button, 
  Image, 
  Form, 
  Alert, 
  Spinner, 
  Badge, 
  Collapse 
} from "react-bootstrap";
import { 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaPaperPlane, 
  FaTrash,
  FaChevronDown, 
  FaChevronUp 
} from "react-icons/fa";
import PostLikeService from "../../service/LikesService";
import CommentService from "../../service/CommentsService";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInWeeks < 5) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

const ProfilePostCard = ({ post, currentUser, onDelete, onLikeUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isCaptionTruncated, setIsCaptionTruncated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (post.caption && post.caption.length > 150) {
      setIsCaptionTruncated(true);
    }
  }, [post.caption]);

  const toggleCaption = () => {
    setIsCaptionExpanded(!isCaptionExpanded);
  };

  const getDisplayCaption = () => {
    if (!post.caption) return "";
    
    if (!isCaptionTruncated || isCaptionExpanded) {
      return post.caption;
    }
    
    return post.caption.length > 150 
      ? post.caption.substring(0, 150) + "..."
      : post.caption;
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (likeLoading) return;

    setLikeLoading(true);
    setError("");

    try {
      let response;
      
      if (isLiked) {
        response = await PostLikeService.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        response = await PostLikeService.likePost(post.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      if (onLikeUpdate) {
        onLikeUpdate(post.id, !isLiked, likeCount + (isLiked ? -1 : 1));
      }

    } catch (err) {
      console.error("Error with like action:", err);
      setError(err.message || "Failed to update like");
      setIsLiked(!isLiked);
      setLikeCount(prev => prev + (isLiked ? 1 : -1));
    } finally {
      setLikeLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await CommentService.getCommentsByPostId(post.id);
      if (response.status === 200) {
        setComments(response.commentList || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleShowComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    setCommentLoading(true);
    setError("");

    try {
      const response = await CommentService.createComment({
        content: newComment,
        postId: post.id
      });

      if (response.status === 200) {
        setNewComment("");
        setComments(prev => [response.comment, ...prev]);
        post.totalComments = (post.totalComments || 0) + 1;
      } else {
        setError(response.message || "Failed to post comment");
      }
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await CommentService.deleteComment(commentId);
      if (response.status === 200) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        post.totalComments = Math.max(0, (post.totalComments || 0) - 1);
      } else {
        setError(response.message || "Failed to delete comment");
      }
    } catch (err) {
      setError(err.message || "Failed to delete comment");
    }
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Image
              src={post.ownerProfileImage || "/default-avatar.png"}
              alt={post.ownerName}
              roundedCircle
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
              className="me-3"
            />
            <div>
              <h6 className="mb-0 fw-bold text-dark">{post.ownerName}</h6>
              <small className="text-muted">{formatDate(post.createdAt)}</small>
            </div>
          </div>
          
          <Button
            variant="link"
            className="text-muted p-0"
            onClick={() => onDelete(post.id)}
          >
            <FaTrash />
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="post-images">
            {post.imageUrls.length === 1 ? (
              <Image
                src={post.imageUrls[0]}
                alt="Post image"
                fluid
                style={{ 
                  width: "100%", 
                  maxHeight: "500px", 
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={{ position: 'relative' }}>
                <Image
                  src={post.imageUrls[0]}
                  alt="Post image"
                  fluid
                  style={{ 
                    width: "100%", 
                    maxHeight: "500px", 
                    objectFit: "cover" 
                  }}
                />
                <Badge 
                  bg="dark" 
                  className="position-absolute top-0 end-0 m-2"
                >
                  +{post.imageUrls.length - 1} more
                </Badge>
              </div>
            )}
          </div>
        )}
      </Card.Body>

      <Card.Body className="pt-3">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex gap-3">
            <Button 
              variant="link" 
              className={`p-0 ${isLiked ? 'text-danger' : 'text-dark'}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              {likeLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaHeart size={20} fill={isLiked ? "currentColor" : "none"} />
              )}
            </Button>
            <Button 
              variant="link" 
              className={`text-dark p-0 ${showComments ? 'text-primary' : ''}`}
              onClick={handleShowComments}
            >
              <FaComment size={20} />
            </Button>
            <Button variant="link" className="text-dark p-0">
              <FaShare size={20} />
            </Button>
          </div>
        </div>

        {likeCount > 0 && (
          <div className="mb-2">
            <small className="fw-bold">
              {likeCount} like{likeCount !== 1 ? 's' : ''}
            </small>
          </div>
        )}

        <div className="mb-2">
          <div className="d-flex align-items-start">
            <div className="flex-grow-1">
              <p 
                className="mb-0" 
                style={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: '1.4',
                  cursor: isCaptionTruncated ? 'pointer' : 'default'
                }}
                onClick={isCaptionTruncated ? toggleCaption : undefined}
              >
                {getDisplayCaption()}
              </p>
              {isCaptionTruncated && (
                <Button
                  variant="link"
                  className="p-0 text-muted text-decoration-none mt-1"
                  size="sm"
                  onClick={toggleCaption}
                >
                  <small>
                    {isCaptionExpanded ? (
                      <>
                        Show less <FaChevronUp size={10} className="ms-1" />
                      </>
                    ) : (
                      <>
                        Show more <FaChevronDown size={10} className="ms-1" />
                      </>
                    )}
                  </small>
                </Button>
              )}
            </div>
          </div>
        </div>

        {post.totalComments > 0 && (
          <div>
            <Button 
              variant="link" 
              className="text-muted p-0 text-decoration-none"
              onClick={handleShowComments}
            >
              <small>
                {showComments ? "Hide" : "View"} all {post.totalComments} comment{post.totalComments !== 1 ? 's' : ''}
              </small>
            </Button>
          </div>
        )}

        <div className="mt-2">
          <Form onSubmit={handleSubmitComment}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Add a comment..."
                size="sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentLoading}
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="sm"
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FaPaperPlane />
                )}
              </Button>
            </div>
          </Form>
        </div>

        {error && (
          <Alert variant="danger" className="mt-2 py-2" onClose={() => setError("")} dismissible>
            <small>{error}</small>
          </Alert>
        )}

        <Collapse in={showComments}>
          <div className="mt-3">
            {commentsLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <small>No comments yet. Be the first to comment!</small>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item mb-2">
                    <div className="d-flex align-items-start">
                      <Image
                        src={comment.userProfileImage || "/default-avatar.png"}
                        alt={comment.userName}
                        roundedCircle
                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                        className="me-2"
                      />
                      <div className="flex-grow-1">
                        <div className="bg-light rounded p-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <small className="fw-bold">{comment.userName}</small>
                              <p className="mb-1 small">{comment.content}</p>
                            </div>
                            <Button
                              variant="link"
                              className="text-danger p-0 ms-2"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                          <div className="d-flex align-items-center gap-3 mt-1">
                            <small className="text-muted">
                              {formatDate(comment.createdAt)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default ProfilePostCard;