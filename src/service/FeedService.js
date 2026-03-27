import axios from "axios";
import ApiService from "./ApiService";

export default class FeedService extends ApiService {
  static normalizeMixedFeedItems(data) {
    if (!data) return [];

    const directItems = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.feedItems)
        ? data.feedItems
        : Array.isArray(data)
          ? data
          : null;

    if (directItems) {
      return directItems.map((item, index) => {
        if (item?.type) return item;
        if (item?.post || item?.caption || item?.ownerId) {
          return { type: "POST", post: item.post || item, _debugIndex: index };
        }
        if (item?.serviceAd || item?.serviceType || item?.businessName) {
          return { type: "SERVICE_AD", serviceAd: item.serviceAd || item, _debugIndex: index };
        }
        if (item?.product || item?.productName || item?.price != null) {
          return { type: "PRODUCT_RECOMMENDATION", product: item.product || item, _debugIndex: index };
        }
        return { ...item, _debugIndex: index };
      });
    }

    const normalized = [
      ...(Array.isArray(data?.posts) ? data.posts.map((post, index) => ({ type: "POST", post, _debugIndex: index })) : []),
      ...(Array.isArray(data?.postList) ? data.postList.map((post, index) => ({ type: "POST", post, _debugIndex: index })) : []),
      ...(Array.isArray(data?.serviceAds)
        ? data.serviceAds.map((serviceAd, index) => ({ type: "SERVICE_AD", serviceAd, _debugIndex: index }))
        : []),
      ...(Array.isArray(data?.products)
        ? data.products.map((product, index) => ({ type: "PRODUCT_RECOMMENDATION", product, _debugIndex: index }))
        : []),
      ...(Array.isArray(data?.productRecommendations)
        ? data.productRecommendations.map((product, index) => ({
            type: "PRODUCT_RECOMMENDATION",
            product,
            _debugIndex: index,
          }))
        : []),
    ];

    return normalized;
  }

  static async getMixedFeed(limit = 20) {
    console.debug("[FeedService.getMixedFeed] Request", {
      url: `${this.BASE_URL}/feed/mixed`,
      limit,
    });

    const response = await axios.get(`${this.BASE_URL}/feed/mixed`, {
      params: { limit },
      headers: this.getHeader(),
      timeout: 12000,
      validateStatus: () => true,
    });

    const normalizedItems = this.normalizeMixedFeedItems(response.data);

    const productRecommendationDebug = normalizedItems
      .filter((item) => item?.type === "PRODUCT_RECOMMENDATION")
      .map((item, index) => ({
        index,
        keys: Object.keys(item?.product || {}),
        product: item?.product,
      }));

    console.debug("[FeedService.getMixedFeed] Response", {
      httpStatus: response.status,
      apiStatus: response.data?.status,
      itemCount: normalizedItems.length,
      data: response.data,
      normalizedItems,
      productRecommendationDebug,
    });

    return {
      ...response.data,
      items: normalizedItems,
    };
  }

  static async getVideoFeed({ cursorCreatedAt = null, cursorId = null, limit = 5 } = {}) {
    console.debug("[FeedService.getVideoFeed] Request", {
      url: `${this.BASE_URL}/feed/videos`,
      cursorCreatedAt,
      cursorId,
      limit,
    });

    const response = await axios.get(`${this.BASE_URL}/feed/videos`, {
      params: {
        cursorCreatedAt,
        cursorId,
        limit,
      },
      headers: this.getHeader(),
      timeout: 15000,
      validateStatus: () => true,
    });

    const responseItems = Array.isArray(response.data?.items)
      ? response.data.items
      : Array.isArray(response.data?.posts)
        ? response.data.posts
        : [];

    console.debug("[FeedService.getVideoFeed] Response", {
      httpStatus: response.status,
      apiStatus: response.data?.status,
      hasMore: response.data?.hasMore,
      nextCursor: response.data?.nextCursor || null,
      itemCount: responseItems.length,
      firstItem: responseItems[0] || null,
      data: response.data,
    });

    return response.data;
  }
}
