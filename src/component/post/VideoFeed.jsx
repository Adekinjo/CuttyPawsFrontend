import { useCallback, useEffect, useState } from "react";
import FeedService from "../../service/FeedService";
import VideoFeedItem from "./VideoFeedItem";

const VideoFeed = () => {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FeedService.getVideoFeed({ limit: 5 });
      const initialItems = Array.isArray(response?.items) ? response.items : [];

      console.debug("[VideoFeed] Initial load result", {
        itemCount: initialItems.length,
        nextCursor: response?.nextCursor || null,
        hasMore: Boolean(response?.hasMore),
        firstItem: initialItems[0] || null,
        rawResponse: response,
      });

      setItems(initialItems);
      setNextCursor(response?.nextCursor || null);
      setHasMore(Boolean(response?.hasMore));
    } catch (error) {
      console.error("Failed to load video feed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);

      const response = await FeedService.getVideoFeed({
        cursorCreatedAt: nextCursor?.cursorCreatedAt,
        cursorId: nextCursor?.cursorId,
        limit: 5,
      });

      const newItems = Array.isArray(response?.items) ? response.items : [];

      console.debug("[VideoFeed] Load more result", {
        requestedCursor: nextCursor,
        newItemCount: newItems.length,
        nextCursor: response?.nextCursor || null,
        hasMore: Boolean(response?.hasMore),
        firstNewItem: newItems[0] || null,
        rawResponse: response,
      });

      setItems((prev) => [...prev, ...newItems]);
      setNextCursor(response?.nextCursor || null);
      setHasMore(Boolean(response?.hasMore));
    } catch (error) {
      console.error("Failed to load more videos", error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    console.debug("[VideoFeed] State changed", {
      itemCount: items.length,
      activeIndex,
      hasMore,
      loading,
      loadingMore,
      nextCursor,
      itemsPreview: items.slice(0, 3).map((item, index) => ({
        index,
        id: item?.id,
        mediaCount: Array.isArray(item?.media) ? item.media.length : 0,
        mediaTypes: Array.isArray(item?.media) ? item.media.map((media) => media?.type) : [],
      })),
    });
  }, [activeIndex, hasMore, items, loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (items.length - activeIndex <= 2) {
      console.debug("[VideoFeed] Triggering loadMore", {
        itemCount: items.length,
        activeIndex,
        remainingItems: items.length - activeIndex,
        hasMore,
        loadingMore,
        nextCursor,
      });
      loadMore();
    }
  }, [activeIndex, items.length, loadMore]);

  if (!loading && items.length === 0) {
    console.warn("[VideoFeed] No video items available after initial load", {
      hasMore,
      nextCursor,
    });
  }

  if (loading) {
    return <div style={{ padding: "24px", color: "#fff" }}>Loading videos...</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        background: "#000",
        scrollSnapType: "y mandatory",
        marginBottom: "30px"
      }}
    >
      {items.map((post, index) => (
        <VideoFeedItem
          key={`video-post-${post.id}-${index}`}
          post={post}
          isActive={activeIndex === index}
          onVisible={() => setActiveIndex(index)}
        />
      ))}

      {loadingMore && (
        <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
          Loading more videos...
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
