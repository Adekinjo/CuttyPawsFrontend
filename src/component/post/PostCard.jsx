import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  FaEllipsisH,
  FaTrash,
  FaEdit,
  FaPaperPlane,
  FaSignInAlt,
  FaHeart,
  FaRegHeart,
  FaPause,
  FaPlay
} from "react-icons/fa";
import { PawPrint, MessageCircle, Share2, Bookmark, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react";
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
  const videoPreviewRefs = useRef(new Map());
  const interactiveVideoRefs = useRef(new Map());
  const controlsHideTimeoutRef = useRef(null);

  // State
  const [showOptions, setShowOptions] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeVideoControls, setActiveVideoControls] = useState(null);
  const [playingStates, setPlayingStates] = useState({});

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [feedVideosMuted, setFeedVideosMuted] = useState(false);

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
  }, [post]);


  // Comment Handlers
  const fetchComments = async () => {
    setCommentsLoading(true);
    setError("");
    try {
      const res = await CommentService.getCommentsByPostId(post.id, 0, 50);
     
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

  const formatCount = (value) => {
    const numericValue = Number(value) || 0;
    return new Intl.NumberFormat().format(numericValue);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const sharePayload = {
      title: `${post.ownerName || "CuttyPaws"}'s post`,
      text: post.caption || "Check out this pet post on CuttyPaws",
      url: shareUrl
    };

    setError("");
    setShareMessage("");

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        setShareMessage("Post shared");
        return;
      } catch (shareError) {
        if (shareError?.name !== "AbortError") {
          setError("Could not share right now. Link copied instead.");
        } else {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt("Copy this post link:", shareUrl);
      }
      setShareMessage("Link copied");
    } catch {
      setError("Failed to share post.");
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
    const icons = {
      LIKE: <PawPrint size={14} strokeWidth={2.3} />,
      LOVE: "❤️",
      HAHA: "😄",
      WOW: "😲",
      SAD: "😢",
      ANGRY: "😠",
    };
    return icons[reactionType] || icons.LIKE;
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
    const normalizedFromMedia = Array.isArray(post?.media)
      ? post.media
          .map((item) => ({
            url: item?.url || item?.mediaUrl,
            type: (item?.type || item?.mediaType || "IMAGE").toUpperCase(),
            thumbnailUrl: item?.thumbnailUrl || null,
          }))
          .filter((item) => item.url)
      : [];

    const normalizedFromImageUrls = Array.isArray(post?.imageUrls)
      ? post.imageUrls
          .filter(Boolean)
          .map((url) => ({ url, type: "IMAGE", thumbnailUrl: null }))
      : [];

    // Merge and de-duplicate so one real file does not create fake "multiple media"
    const unique = new Map();
    [...normalizedFromMedia, ...normalizedFromImageUrls].forEach((item) => {
      const key = `${item.type}|${item.url}`;
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values());
  }, [post]);

  const registerFeedVideo = useCallback((mediaKey) => {
    return (node) => {
      if (node) {
        videoPreviewRefs.current.set(mediaKey, node);
      } else {
        videoPreviewRefs.current.delete(mediaKey);
      }
    };
  }, []);

  const clearControlsHideTimeout = useCallback(() => {
    if (controlsHideTimeoutRef.current) {
      clearTimeout(controlsHideTimeoutRef.current);
      controlsHideTimeoutRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearControlsHideTimeout();
    controlsHideTimeoutRef.current = setTimeout(() => {
      setActiveVideoControls(null);
    }, 5000);
  }, [clearControlsHideTimeout]);

  const registerInteractiveVideo = useCallback((videoKey) => {
    return (node) => {
      if (node) {
        interactiveVideoRefs.current.set(videoKey, node);
      } else {
        interactiveVideoRefs.current.delete(videoKey);
      }
    };
  }, []);

  const setVideoPlayingState = useCallback((videoKey, isPlaying) => {
    setPlayingStates((prev) => {
      if (prev[videoKey] === isPlaying) {
        return prev;
      }
      return {
        ...prev,
        [videoKey]: isPlaying,
      };
    });
  }, []);

  const showVideoControls = useCallback((videoKey) => {
    setActiveVideoControls(videoKey);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const hideVideoControls = useCallback(() => {
    clearControlsHideTimeout();
    setActiveVideoControls(null);
  }, [clearControlsHideTimeout]);

  const seekVideoBy = useCallback((videoKey, seconds) => {
    const video = interactiveVideoRefs.current.get(videoKey);
    if (!video) return;

    const duration = Number.isFinite(video.duration) ? video.duration : null;
    const nextTime = Math.max(
      0,
      duration === null ? video.currentTime + seconds : Math.min(video.currentTime + seconds, duration)
    );

    video.currentTime = nextTime;
    showVideoControls(videoKey);
  }, [showVideoControls]);

  const toggleVideoPlayback = useCallback((videoKey) => {
    const video = interactiveVideoRefs.current.get(videoKey);
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise?.then) {
        playPromise
          .then(() => {
            setVideoPlayingState(videoKey, true);
            showVideoControls(videoKey);
          })
          .catch(() => {});
        return;
      }
      setVideoPlayingState(videoKey, true);
    } else {
      video.pause();
      setVideoPlayingState(videoKey, false);
    }

    showVideoControls(videoKey);
  }, [setVideoPlayingState, showVideoControls]);

  useEffect(() => {
    return () => {
      clearControlsHideTimeout();
    };
  }, [clearControlsHideTimeout]);

  useEffect(() => {
    videoPreviewRefs.current.forEach((video) => {
      video.muted = feedVideosMuted;
    });
  }, [feedVideosMuted]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const mediaKey = video.dataset.mediaKey;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            window.dispatchEvent(
              new CustomEvent("cuttypaws-feed-video-active", {
                detail: { mediaKey },
              })
            );

            const playPromise = video.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
            setVideoPlayingState(mediaKey, true);
          } else {
            video.pause();
            setVideoPlayingState(mediaKey, false);
          }
        });
      },
      { threshold: [0.25, 0.7] }
    );

    const handleActiveVideo = (event) => {
      const activeMediaKey = event.detail?.mediaKey;
      videoPreviewRefs.current.forEach((video, mediaKey) => {
        if (mediaKey !== activeMediaKey) {
          video.pause();
          setVideoPlayingState(mediaKey, false);
        }
      });
    };

    window.addEventListener("cuttypaws-feed-video-active", handleActiveVideo);

    videoPreviewRefs.current.forEach((video) => {
      video.pause();
      setVideoPlayingState(video.dataset.mediaKey, false);
      observer.observe(video);
    });

    return () => {
      window.removeEventListener("cuttypaws-feed-video-active", handleActiveVideo);
      observer.disconnect();
    };
  }, [mediaItems, setVideoPlayingState]);

  useEffect(() => {
    if (!showImageModal) {
      hideVideoControls();
    }
  }, [showImageModal, hideVideoControls]);

  const renderInteractiveVideo = (item, idx, isModal = false) => {
    const videoKey = `${post?.id || "post"}-${isModal ? "modal" : "feed"}-${idx}`;
    const mediaKey = videoKey;
    const isMuted = !isModal ? feedVideosMuted : false;
    const controlsVisible = activeVideoControls === videoKey;

    const handleVideoPreviewReady = (event) => {
      const video = event.currentTarget;
      if (isModal) return;

      // iOS Safari often shows a black frame unless playback/seek is nudged.
      if (video.readyState >= 2 && !video.dataset.previewReady) {
        video.dataset.previewReady = "true";
        try {
          video.currentTime = 0.1;
        } catch {
          // Ignore seek failures on browsers that restrict it.
        }
      }
    };

    return (
      <div
        key={idx}
        className={`post-video-wrapper ${controlsVisible ? "controls-visible" : ""} ${isModal ? "post-video-wrapper-modal" : ""}`}
        onClick={() => {
          if (controlsVisible) {
            hideVideoControls();
            return;
          }
          showVideoControls(videoKey);
        }}
      >
        <video
          muted={isMuted}
          loop={!isModal}
          playsInline
          preload={isModal ? "metadata" : "auto"}
          className={isModal ? "modal-image post-interactive-video" : "post-image post-video-preview post-interactive-video"}
          poster={item.thumbnailUrl || undefined}
          ref={(node) => {
            registerInteractiveVideo(videoKey)(node);
            if (!isModal) {
              registerFeedVideo(mediaKey)(node);
            }
          }}
          data-media-key={!isModal ? mediaKey : undefined}
          onLoadedData={handleVideoPreviewReady}
          onLoadedMetadata={handleVideoPreviewReady}
          onPlay={() => setVideoPlayingState(videoKey, true)}
          onPause={() => setVideoPlayingState(videoKey, false)}
        >
          <source src={item.url} />
          Your browser does not support the video tag.
        </video>

        <div
          className={`post-video-center-controls ${controlsVisible ? "visible" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="post-video-center-btn"
            aria-label="Go back 10 seconds"
            onClick={() => seekVideoBy(videoKey, -10)}
          >
            <RotateCcw size={18} />
            <span>10</span>
          </button>
          <button
            type="button"
            className="post-video-center-btn post-video-center-btn-main"
            aria-label={playingStates[videoKey] ? "Pause video" : "Play video"}
            onClick={() => toggleVideoPlayback(videoKey)}
          >
            {playingStates[videoKey] ? <FaPause size={18} /> : <FaPlay size={18} />}
          </button>
          <button
            type="button"
            className="post-video-center-btn"
            aria-label="Go forward 10 seconds"
            onClick={() => seekVideoBy(videoKey, 10)}
          >
            <RotateCw size={18} />
            <span>10</span>
          </button>
        </div>

        {!isModal && (
          <>
            <button
              type="button"
              className="post-video-volume-btn"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              onClick={(event) => {
                event.stopPropagation();
                setFeedVideosMuted((prev) => !prev);
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </>
        )}
      </div>
    );
  };

  const renderMedia = (item, idx, isModal = false) => {
    const isVideo = (item.type || "").toUpperCase() === "VIDEO";
    if (isVideo) {
      return renderInteractiveVideo(item, idx, isModal);
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

  const renderAvatar = (imageUrl, alt, className, iconSize = 16) => {
    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          roundedCircle
          className={className}
          alt={alt}
        />
      );
    }

    return (
      <div className={`${className} avatar-paw-fallback`} aria-label="Default profile picture">
        <PawPrint size={iconSize} strokeWidth={2.2} />
      </div>
    );
  };

  return (
    <Card className="post-card">
      {/* Header */}
      <Card.Header className="post-header d-flex justify-content-between align-items-center">
        <Link to={`/customer-profile/${post.ownerId}`} className="d-flex text-decoration-none align-items-center">
          {renderAvatar(post.ownerProfileImage, "Avatar", "post-avatar me-3", 22)}
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
                <Button variant="link" onClick={() => (onEdit ? onEdit(post.id) : navigate(`/edit-post/${post.id}`))}>
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
      {mediaItems.length === 1 && (
        <div className="post-images">
          {renderMedia(mediaItems[0], 0)}
        </div>
      )}

      {mediaItems.length > 1 && (
        <Carousel
          controls={false}
          indicators={true}
          interval={null}
          className="post-images"
        >
          {mediaItems.map((item, idx) => (
            <Carousel.Item key={idx}>
              {renderMedia(item, idx)}
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      {/* Body */}
      <Card.Body className="post-body">
        <div className="post-actions-row">
          <div className="post-actions-left">
            <div className="action-item">
              <ReactionsPicker
                onReactionSelect={handleReaction}
                onRemoveReaction={handleRemoveReaction}
                currentReaction={userReaction}
                size={22}
                className="reaction-picker-trigger"
              />
            </div>

            <Button
              variant="link"
              className="action-btn text-decoration-none"
              onClick={toggleComments}
              aria-label="Open comments"
            >
              <MessageCircle size={24} className="action-icon" />
            </Button>

            <Button
              variant="link"
              className="action-btn text-decoration-none"
              onClick={handleShare}
              aria-label="Share post"
            >
              <Share2 size={24} className="action-icon" />
            </Button>
          </div>

          <Button
            variant="link"
            className={`action-btn bookmark-btn text-decoration-none ${isBookmarked ? "active" : ""}`}
            onClick={() => setIsBookmarked((prev) => !prev)}
            aria-label={isBookmarked ? "Remove bookmark" : "Save post"}
          >
            <Bookmark size={24} className="action-icon" fill={isBookmarked ? "currentColor" : "none"} />
          </Button>
        </div>

        <div className="post-stats-row">
          <span className="post-stat">{formatCount(totalReactions)} likes</span>
          <button type="button" className="post-stat post-stat-button" onClick={toggleComments}>
            {formatCount(totalComments)} comments
          </button>
        </div>

        {shareMessage && <div className="share-feedback">{shareMessage}</div>}

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="d-flex gap-1">
              {Object.entries(reactionsCount)
                .filter((entry) => entry[1] > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type]) => (
                  <span key={type} style={{ fontSize: "0.9rem" }}>
                    {type === "LIKE" ? <PawPrint size={14} strokeWidth={2.3} /> : getReactionIcon(type)}
                  </span>
                ))}
            </div>
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
                    {renderAvatar(comment.userProfileImage, comment.userName || "Comment user", "comment-avatar me-2", 14)}
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
                          {renderAvatar(reply.userProfileImage, reply.userName || "Reply user", "reply-avatar me-2", 12)}
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
