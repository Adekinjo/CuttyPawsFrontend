import axios from "axios";
import ApiService from "./ApiService";

export default class FeedService extends ApiService {
  static async clearMixedFeedCache() {
    const response = await axios.post(`${this.BASE_URL}/admin/cache/clear-mixed-feed`, {}, {
      headers: this.getHeader(),
      timeout: 15000,
      validateStatus: () => true,
    });

    return response.data;
  }

  static normalizeMixedFeedItems(items) {
    if (!Array.isArray(items)) return [];

    return items.map((item) => ({
      type: item?.type,
      score: item?.score ?? null,
      sponsored: Boolean(item?.sponsored),
      post: item?.post ?? null,
      product: item?.product ?? null,
      serviceAd: item?.serviceAd ?? null,
    }));
  }

  static async getMixedFeed({
    cursorCreatedAt = null,
    cursorId = null,
    limit = 12,
  } = {}) {
    const response = await axios.get(`${this.BASE_URL}/feed/mixed`, {
      params: {
        cursorCreatedAt,
        cursorId,
        limit,
      },
      headers: this.getHeader(),
      timeout: 15000,
      validateStatus: () => true,
    });

    return {
      items: this.normalizeMixedFeedItems(response.data?.items),
      count: response.data?.count ?? 0,
      generatedAt: response.data?.generatedAt ?? null,
      nextCursorCreatedAt: response.data?.nextCursorCreatedAt ?? null,
      nextCursorId: response.data?.nextCursorId ?? null,
      hasMore: Boolean(response.data?.hasMore),
    };
  }

  static async getVideoFeed({
    cursorCreatedAt = null,
    cursorId = null,
    limit = 5,
  } = {}) {
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

    return {
      items: Array.isArray(response.data?.items) ? response.data.items : [],
      nextCursor: response.data?.nextCursor ?? null,
      hasMore: Boolean(response.data?.hasMore),
    };
  }
}
