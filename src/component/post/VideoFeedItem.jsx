import { useEffect, useState, useRef } from "react";
import { FaComment, FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import PostLikeService from "../../service/LikesService";
import "./VideoFeed.css";

const VideoFeedItem = ({ post, isActive, onVisible }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [likeCount, setLikeCount] = useState(
    post?.totalReactions ?? post?.likeCount ?? 0
  );
  const [commentCount, setCommentCount] = useState(post?.commentCount ?? 0);
  const [userReaction, setUserReaction] = useState(
    post?.userReaction || (post?.likedByCurrentUser ? "HEART" : null)
  );
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const videoMedia = Array.isArray(post?.media)
    ? post.media.find((m) => m?.type === "VIDEO")
    : null;

  useEffect(() => {
    setLikeCount(post?.totalReactions ?? post?.likeCount ?? 0);
    setCommentCount(post?.commentCount ?? 0);
    setUserReaction(post?.userReaction || (post?.likedByCurrentUser ? "HEART" : null));
  }, [post]);

  useEffect(() => {
    console.debug("[VideoFeedItem] Media inspection", {
      postId: post?.id,
      ownerName: post?.ownerName,
      isActive,
      mediaCount: Array.isArray(post?.media) ? post.media.length : 0,
      mediaTypes: Array.isArray(post?.media) ? post.media.map((media) => media?.type) : [],
      videoMedia,
    });
  }, [isActive, post, videoMedia]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((error) => {
          console.warn("[VideoFeedItem] Video play failed", {
            postId: post?.id,
            error,
          });
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, post?.id]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          onVisible?.();
        }
      },
      { threshold: [0.25, 0.5, 0.75, 1] }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [onVisible]);

  const isLiked = Boolean(userReaction);

  const handleLike = async () => {
    if (!post?.id || isLikeLoading) return;

    if (!ApiService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const previousReaction = userReaction;
    const previousCount = likeCount;

    try {
      setIsLikeLoading(true);

      if (isLiked) {
        setUserReaction(null);
        setLikeCount((prev) => Math.max(0, prev - 1));
        await PostLikeService.removeReaction(post.id);
      } else {
        setUserReaction(PostLikeService.ReactionType.HEART);
        setLikeCount((prev) => prev + 1);
        await PostLikeService.reactToPost(post.id, PostLikeService.ReactionType.HEART);
      }
    } catch (error) {
      console.error("[VideoFeedItem] Failed to update reaction", {
        postId: post?.id,
        error,
      });
      setUserReaction(previousReaction);
      setLikeCount(previousCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleOpenComments = () => {
    if (!post?.id) return;
    navigate(`/post/${post.id}`);
  };

  const handleShare = async () => {
    if (!post?.id) return;

    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const sharePayload = {
      title: post?.caption || "CuttyPaws video",
      text: post?.caption || "Check out this video on CuttyPaws",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error("[VideoFeedItem] Failed to share post", {
        postId: post?.id,
        error,
      });
      window.prompt("Copy this video link:", shareUrl);
    }
  };

  if (!videoMedia) {
    console.warn("[VideoFeedItem] Skipping post without VIDEO media", {
      postId: post?.id,
      media: post?.media,
      post,
    });
    return null;
  }

  return (
    <div className="video-feed-item">
      <div className="video-feed-item__frame">
        <video
          ref={videoRef}
          src={videoMedia.streamUrl || videoMedia.url}
          poster={videoMedia.thumbnailUrl || ""}
          controls
          muted
          playsInline
          preload={isActive ? "auto" : "metadata"}
          className="video-feed-item__video"
        />

        <div className="video-feed-item__scrim" />

        <div className="video-feed-item__actions">
          <button
            type="button"
            className={`video-feed-item__action-btn${isLiked ? " is-active" : ""}`}
            onClick={handleLike}
            disabled={isLikeLoading}
            aria-label={isLiked ? "Unlike video" : "Like video"}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            className="video-feed-item__action-btn"
            onClick={handleOpenComments}
            aria-label="Open comments"
          >
            <FaComment />
            <span>{commentCount}</span>
          </button>

          <button
            type="button"
            className="video-feed-item__action-btn"
            onClick={handleShare}
            aria-label="Share video"
          >
            <FaShareAlt />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoFeedItem;
