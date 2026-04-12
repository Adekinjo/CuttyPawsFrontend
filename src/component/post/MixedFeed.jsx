import { useEffect, useRef, useState, useCallback } from "react";
import FeedService from "../../service/FeedService";
import PostCard from "./PostCard";
import ServiceAdCard from "../service-provider/ServiceAdsCard";
import ProductRecommendationCard from "./ProductRecommendationCard";

const DEBUG_MIXED_FEED = true;

const MixedFeed = ({ currentUser }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursorCreatedAt, setNextCursorCreatedAt] = useState(null);
  const [nextCursorId, setNextCursorId] = useState(null);
  const [error, setError] = useState("");

  const requestCountRef = useRef(0);

  const debugLog = (...args) => {
    if (DEBUG_MIXED_FEED) {
      console.log("[MixedFeed]", ...args);
    }
  };

  const getItemKey = (item) => {
    if (item?.type === "POST" && item?.post?.id) {
      return `POST-${item.post.id}`;
    }
    if (item?.type === "SERVICE_AD" && item?.serviceAd?.id) {
      return `SERVICE_AD-${item.serviceAd.id}`;
    }
    if (item?.type === "PRODUCT_RECOMMENDATION" && item?.product?.id) {
      return `PRODUCT-${item.product.id}`;
    }
    return null;
  };

  const summarizeItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item, index) => ({
      index,
      type: item?.type || null,
      key: getItemKey(item),
      postId: item?.post?.id || null,
      serviceAdId: item?.serviceAd?.id || null,
      productId: item?.product?.id || null,
    }));
  };

  const mergeUniqueItems = useCallback((oldItems, newItems) => {
    const seen = new Set();
    const duplicates = [];

    const combined = [...oldItems, ...newItems].filter((item) => {
      const key = getItemKey(item);

      if (!key) {
        duplicates.push({
          reason: "missing-key",
          type: item?.type || null,
        });
        return false;
      }

      if (seen.has(key)) {
        duplicates.push({
          reason: "duplicate-key",
          key,
        });
        return false;
      }

      seen.add(key);
      return true;
    });

    debugLog("mergeUniqueItems result", {
      oldCount: oldItems.length,
      newCount: newItems.length,
      finalCount: combined.length,
      duplicates,
      finalItems: summarizeItems(combined),
    });

    return combined;
  }, []);

  const loadFeed = useCallback(
    async ({ cursorCreatedAt = null, cursorId = null, append = false } = {}) => {
      const requestNumber = ++requestCountRef.current;

      debugLog(`loadFeed request #${requestNumber} started`, {
        cursorCreatedAt,
        cursorId,
        append,
      });

      try {
        setError("");

        const response = await FeedService.getMixedFeed({
          cursorCreatedAt,
          cursorId,
          limit: 12,
        });

        const items = Array.isArray(response?.items) ? response.items : [];

        debugLog(`loadFeed request #${requestNumber} response`, {
          count: response?.count,
          hasMore: response?.hasMore,
          nextCursorCreatedAt: response?.nextCursorCreatedAt,
          nextCursorId: response?.nextCursorId,
          receivedItemsLength: items.length,
          receivedItems: summarizeItems(items),
          rawResponse: response,
        });

        setFeedItems((prev) => {
          const nextItems = append ? mergeUniqueItems(prev, items) : items;

          debugLog(`setFeedItems from request #${requestNumber}`, {
            append,
            previousLength: prev.length,
            nextLength: nextItems.length,
            nextItems: summarizeItems(nextItems),
          });

          return nextItems;
        });

        setHasMore(Boolean(response?.hasMore));
        setNextCursorCreatedAt(response?.nextCursorCreatedAt || null);
        setNextCursorId(response?.nextCursorId || null);
      } catch (err) {
        console.error("[MixedFeed] Failed to load mixed feed", err);
        setError(err?.message || "Failed to load mixed feed");
      }
    },
    [mergeUniqueItems]
  );

  useEffect(() => {
    const init = async () => {
      debugLog("initial load started");
      setLoading(true);
      await loadFeed();
      setLoading(false);
      debugLog("initial load completed");
    };

    init();
  }, [loadFeed]);

  useEffect(() => {
    debugLog("state changed", {
      loading,
      loadingMore,
      hasMore,
      nextCursorCreatedAt,
      nextCursorId,
      feedItemsLength: feedItems.length,
      feedItems: summarizeItems(feedItems),
    });
  }, [loading, loadingMore, hasMore, nextCursorCreatedAt, nextCursorId, feedItems]);

  const handleLoadMore = async () => {
    debugLog("handleLoadMore clicked", {
      hasMore,
      loadingMore,
      nextCursorCreatedAt,
      nextCursorId,
    });

    if (!hasMore) {
      debugLog("handleLoadMore aborted: hasMore is false");
      return;
    }

    if (loadingMore) {
      debugLog("handleLoadMore aborted: already loadingMore");
      return;
    }

    if (!nextCursorCreatedAt || !nextCursorId) {
      debugLog("handleLoadMore aborted: missing cursor", {
        nextCursorCreatedAt,
        nextCursorId,
      });
      return;
    }

    setLoadingMore(true);

    await loadFeed({
      cursorCreatedAt: nextCursorCreatedAt,
      cursorId: nextCursorId,
      append: true,
    });

    setLoadingMore(false);
  };

  const renderFeedItem = (item, index) => {
    const itemKey = getItemKey(item) || `fallback-${index}`;

    debugLog("renderFeedItem", {
      index,
      itemKey,
      type: item?.type,
      postId: item?.post?.id || null,
      serviceAdId: item?.serviceAd?.id || null,
      productId: item?.product?.id || null,
    });

    switch (item?.type) {
      case "POST":
        if (!item?.post?.id) {
          debugLog("POST skipped because post.id is missing", { item, index });
          return null;
        }

        return (
          <div data-feed-debug={`POST-${item.post.id}`} key={itemKey}>
            <PostCard post={item.post} currentUser={currentUser} />
          </div>
        );

      case "SERVICE_AD":
        if (!item?.serviceAd?.id) {
          debugLog("SERVICE_AD skipped because serviceAd.id is missing", {
            item,
            index,
          });
          return null;
        }

        return (
          <div data-feed-debug={`SERVICE_AD-${item.serviceAd.id}`} key={itemKey}>
            <ServiceAdCard serviceAd={item.serviceAd} />
          </div>
        );

      case "PRODUCT_RECOMMENDATION":
        if (!item?.product?.id) {
          debugLog("PRODUCT_RECOMMENDATION skipped because product.id is missing", {
            item,
            index,
          });
          return null;
        }

        return (
          <div data-feed-debug={`PRODUCT-${item.product.id}`} key={itemKey}>
            <ProductRecommendationCard product={item.product} />
          </div>
        );

      default:
        debugLog("Unknown item type skipped", { item, index });
        return null;
    }
  };

  if (loading) {
    return (
      <div>
        <p>Loading feed...</p>
        {DEBUG_MIXED_FEED ? (
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(
              {
                loading,
                loadingMore,
                hasMore,
                nextCursorCreatedAt,
                nextCursorId,
                feedItemsLength: feedItems.length,
              },
              null,
              2
            )}
          </pre>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="alert alert-danger mb-3">
          <strong>Mixed feed error:</strong> {error}
        </div>
      ) : null}

      {DEBUG_MIXED_FEED ? (
        <div
          className="mb-3 p-2 border rounded bg-light"
          style={{ fontSize: "12px" }}
        >
          <div><strong>Mixed Feed Debug</strong></div>
          <div>feedItems.length: {feedItems.length}</div>
          <div>hasMore: {String(hasMore)}</div>
          <div>loadingMore: {String(loadingMore)}</div>
          <div>nextCursorCreatedAt: {String(nextCursorCreatedAt)}</div>
          <div>nextCursorId: {String(nextCursorId)}</div>
          <details className="mt-2">
            <summary>Items summary</summary>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
              {JSON.stringify(summarizeItems(feedItems), null, 2)}
            </pre>
          </details>
        </div>
      ) : null}

      {feedItems.map((item, index) => renderFeedItem(item, index))}

      {hasMore ? (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : (
        <div className="text-center mt-3 text-muted">
          No more feed items
        </div>
      )}
    </div>
  );
};

export default MixedFeed;