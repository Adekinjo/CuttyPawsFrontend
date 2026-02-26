
import axios from "axios";
import ApiService from "./ApiService";

export default class PostService extends ApiService {

  static async createPost(postData) {
    try {
      const formData = new FormData();
      formData.append("caption", postData.caption || "");

      // backend expects: request.getMedia()
      (postData.media || []).forEach((file) => {
        formData.append("media", file);
      });

      const response = await axios.post(
        `${this.BASE_URL}/post/create`,
        formData,
        {
          headers: {
            ...this.getHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updatePost(postId, postData) {
    try {
      const formData = new FormData();

      if (postData.caption !== undefined && postData.caption !== null) {
        formData.append("caption", postData.caption);
      }

      // backend expects: request.getMedia()
      (postData.media || []).forEach((file) => {
        formData.append("media", file);
      });

      // backend expects: request.getMediaToDelete()
      (postData.mediaToDelete || []).forEach((id) => {
        formData.append("mediaToDelete", id);
      });

      const response = await axios.put(
        `${this.BASE_URL}/post/${postId}`,
        formData,
        {
          headers: {
            ...this.getHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getAllPosts() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/post/get-all`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getPostById(postId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/post/${postId}`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

    static async getMyPosts() {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/post/my-posts`,
                { headers: this.getHeader() }
            );

            return response.data;

        } catch (error) {
            console.error("Error fetching user's posts:", error);
            throw this.handleError(error);
        }
    }


    static async getUserPosts(userId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/post/user/${userId}`,
                { headers: this.getHeader() }
            );

            return response.data;

        } catch (error) {
            console.error("Error fetching user posts:", error);
            throw this.handleError(error);
        }
    }

  static async deletePost(postId) {
    try {
      const response = await axios.delete(
        `${this.BASE_URL}/post/${postId}`,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "An error occurred";

      const e = new Error(message);
      e.status = error.response.status;
      e.data = error.response.data;
      return e;
    }

    if (error.request) {
      const e = new Error("Network error. Please check your connection.");
      e.status = 0;
      return e;
    }

    const e = new Error(error.message || "An unexpected error occurred");
    e.status = 500;
    return e;
  }
}


