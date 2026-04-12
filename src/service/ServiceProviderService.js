import axios from "axios";
import ApiService from "./ApiService";

const SERVICE_DASHBOARD_KEY = "serviceDashboard";
const PUBLIC_PROFILE_CACHE_PREFIX = "servicePublicProfile:";
const PUBLIC_PROFILE_MEMORY_CACHE = new Map();

export default class ServiceProviderService extends ApiService {
  static normalizeServiceMediaItem(item, index = 0) {
    if (!item) return null;

    const url =
      item.url ||
      item.mediaUrl ||
      item.fileUrl ||
      item.secureUrl ||
      item.coverUrl ||
      null;

    if (!url) return null;

    const rawType = String(
      item.type ||
      item.mediaType ||
      item.fileType ||
      item.resourceType ||
      (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? "VIDEO" : "IMAGE")
    ).toUpperCase();

    return {
      id: item.id || item.mediaId || item.uuid || `${url}-${index}`,
      url,
      type: rawType.includes("VIDEO") ? "VIDEO" : "IMAGE",
      isCover: Boolean(item.isCover || item.cover || item.featured || item.primary),
      thumbnailUrl: item.thumbnailUrl || item.previewUrl || url,
      alt: item.alt || item.caption || item.title || "Service media",
    };
  }

  static normalizeServiceMediaCollection(payload) {
    const derivedCoverItem =
      payload?.coverMediaUrl || payload?.coverImageUrl
        ? [{
            id: payload?.coverMediaId || payload?.coverImageId || "cover-media",
            mediaUrl: payload?.coverMediaUrl || payload?.coverImageUrl,
            mediaType: payload?.coverMediaType || payload?.coverImageType || "IMAGE",
            isCover: true,
          }]
        : [];

    const collection = [
      ...(Array.isArray(payload) ? payload : []),
      ...derivedCoverItem,
      ...(Array.isArray(payload?.serviceMedia) ? payload.serviceMedia : []),
      ...(Array.isArray(payload?.serviceMediaList) ? payload.serviceMediaList : []),
      ...(Array.isArray(payload?.serviceMedias) ? payload.serviceMedias : []),
      ...(Array.isArray(payload?.media) ? payload.media : []),
      ...(Array.isArray(payload?.mediaItems) ? payload.mediaItems : []),
      ...(Array.isArray(payload?.gallery) ? payload.gallery : []),
      ...(Array.isArray(payload?.galleryMedia) ? payload.galleryMedia : []),
      ...(Array.isArray(payload?.items) ? payload.items : []),
      ...(Array.isArray(payload?.data) ? payload.data : []),
    ];

    const seen = new Set();

    return collection
      .map((item, index) => this.normalizeServiceMediaItem(item, index))
      .filter((item) => {
        if (!item?.url) return false;
        const key = `${item.id}-${item.url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  static normalizeServiceProfile(profile) {
    if (!profile) return profile;
    const serviceMedia = this.normalizeServiceMediaCollection(profile);
    const coverMedia = serviceMedia.find((item) => item.isCover) || serviceMedia[0] || null;

    return {
      ...profile,
      serviceMedia,
      coverMedia,
    };
  }

  static isServiceProviderAccount() {
    const user = this.getStoredUser();
    const role = localStorage.getItem("role");

    return Boolean(
      user?.isServiceProvider ||
      user?.role === "ROLE_SERVICE" ||
      user?.role === "ROLE_SERVICE_PROVIDER" ||
      user?.userRole === "ROLE_SERVICE" ||
      user?.userRole === "ROLE_SERVICE_PROVIDER" ||
      role === "ROLE_SERVICE" ||
      role === "ROLE_SERVICE_PROVIDER"
    );
  }

  static async registerServiceProvider(payload) {
    const response = await axios.post(`${this.BASE_URL}/auth/register-service-provider`, payload);
    return response.data;
  }

  static async getMyServiceProfile() {
    const response = await axios.get(`${this.BASE_URL}/services/my-profile`, {
      headers: this.getHeader(),
    });
    if (response.data && typeof response.data === "object") {
      response.data.serviceProfile = this.normalizeServiceProfile(response.data?.serviceProfile);
    }
    return response.data;
  }

  static async updateMyServiceProfile(payload) {
    const response = await axios.put(`${this.BASE_URL}/services/my-profile`, payload, {
      headers: this.getHeader(),
    });
    if (response.data && typeof response.data === "object") {
      response.data.serviceProfile = this.normalizeServiceProfile(response.data?.serviceProfile);
    }
    return response.data;
  }

  static async getMyServiceDashboard() {
    const response = await axios.get(`${this.BASE_URL}/services/my-dashboard`, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async getPublicServiceProfile(userId) {
    if (PUBLIC_PROFILE_MEMORY_CACHE.has(userId)) {
      return PUBLIC_PROFILE_MEMORY_CACHE.get(userId);
    }

    const request = axios.get(`${this.BASE_URL}/services/public/${userId}`, {
      headers: this.getHeader(),
      validateStatus: () => true,
    }).then((response) => {
      if (response.data && typeof response.data === "object") {
        response.data.serviceProfile = this.normalizeServiceProfile(response.data?.serviceProfile);
        console.debug("[ServiceProviderService] getPublicServiceProfile", {
          userId,
          response: response.data,
        });
      }
      return response.data;
    }).finally(() => {
      PUBLIC_PROFILE_MEMORY_CACHE.delete(userId);
    });

    PUBLIC_PROFILE_MEMORY_CACHE.set(userId, request);
    return request;
  }

  static async uploadMyServiceMedia(files) {
    const formData = new FormData();
    (files || []).forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${this.BASE_URL}/services/my-profile/media`, formData, {
      headers,
      validateStatus: () => true,
    });
    console.debug("[ServiceProviderService] uploadMyServiceMedia", {
      fileCount: files?.length || 0,
      response: response.data,
    });
    return response.data;
  }

  static async getMyServiceMedia() {
    const response = await axios.get(`${this.BASE_URL}/services/my-profile/media`, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });

    const normalized = this.normalizeServiceMediaCollection(response.data);

    console.debug("[ServiceProviderService] getMyServiceMedia", {
      response: response.data,
      normalized,
    });

    return {
      ...response.data,
      serviceMedia: normalized,
    };
  }

  static async deleteMyServiceMedia(mediaId) {
    const response = await axios.delete(`${this.BASE_URL}/services/my-profile/media/${mediaId}`, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async setMyServiceMediaCover(mediaId) {
    const response = await axios.post(`${this.BASE_URL}/services/my-profile/media/${mediaId}/cover`, {}, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async getPendingServiceRegistrations() {
    const response = await axios.get(`${this.BASE_URL}/services/admin/pending`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async approveServiceRegistration(userId) {
    const response = await axios.post(`${this.BASE_URL}/services/admin/${userId}/approve`, {}, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async rejectServiceRegistration(userId, reason) {
    const response = await axios.post(`${this.BASE_URL}/services/admin/${userId}/reject`, {}, {
      headers: this.getHeader(),
      params: { reason },
    });
    return response.data;
  }

  static async getServiceReviews(serviceUserId) {
    const response = await axios.get(`${this.BASE_URL}/service-reviews/${serviceUserId}`, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async createOrUpdateReview(serviceUserId, payload) {
    const response = await axios.post(`${this.BASE_URL}/service-reviews/${serviceUserId}`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async createAdSubscription(payload) {
    const response = await axios.post(`${this.BASE_URL}/service-ads/my-subscriptions`, payload, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async confirmAdPayment(payload) {
    const response = await axios.post(`${this.BASE_URL}/service-ads/my-subscriptions/confirm-payment`, payload, {
      headers: this.getHeader(),
      validateStatus: () => true,
    });
    return response.data;
  }

  static async getAdSubscriptions() {
    const response = await axios.get(`${this.BASE_URL}/service-ads/my-subscriptions`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getActiveAdSubscription() {
    const response = await axios.get(`${this.BASE_URL}/service-ads/my-subscriptions/active`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static getStoredDashboard() {
    try {
      const raw = localStorage.getItem(SERVICE_DASHBOARD_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static setStoredDashboard(value) {
    if (!value) {
      localStorage.removeItem(SERVICE_DASHBOARD_KEY);
      return;
    }
    localStorage.setItem(SERVICE_DASHBOARD_KEY, JSON.stringify(value));
  }

  static clearStoredDashboard() {
    localStorage.removeItem(SERVICE_DASHBOARD_KEY);
  }

  static async refreshDashboard() {
    if (!this.isServiceProviderAccount()) {
      this.clearStoredDashboard();
      return null;
    }

    const response = await this.getMyServiceDashboard();
    const dashboard = response?.serviceDashboard || null;
    this.setStoredDashboard(dashboard);
    return dashboard;
  }

  static getStoredUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static getCachedPublicServiceProfile(userId) {
    try {
      const raw = localStorage.getItem(`${PUBLIC_PROFILE_CACHE_PREFIX}${userId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        parsed.serviceProfile = this.normalizeServiceProfile(parsed?.serviceProfile);
      }

      return parsed;
    } catch {
      return null;
    }
  }

  static setCachedPublicServiceProfile(userId, payload) {
    const normalizedPayload = payload && typeof payload === "object"
      ? {
          ...payload,
          serviceProfile: this.normalizeServiceProfile(payload?.serviceProfile),
        }
      : payload;

    localStorage.setItem(`${PUBLIC_PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify(normalizedPayload));
  }
}
