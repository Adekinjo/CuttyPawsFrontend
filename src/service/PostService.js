import axios from "axios";
import ApiService from "./ApiService";

export default class PostService extends ApiService {

    static async createPost(postData) {
        try {
            const formData = new FormData();

            // Append caption
            formData.append("caption", postData.caption);

            // Append images (multiple)
            postData.images.forEach((image, index) => {
                formData.append("images", image);
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

            // Append caption
            if (postData.caption) {
                formData.append("caption", postData.caption);
            }

            // Append images if provided
            if (postData.images && postData.images.length > 0) {
                postData.images.forEach((image, index) => {
                    formData.append("images", image);
                });
            }

            // Append images to delete if any
            if (postData.imagesToDelete && postData.imagesToDelete.length > 0) {
                postData.imagesToDelete.forEach((imageId, index) => {
                    formData.append("imagesToDelete", imageId);
                });
            }

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

            console.log("📦 Update response:", response.data);
            return response.data;

        } catch (error) {
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
            console.error("Error deleting post:", error);
            throw this.handleError(error);
        }
    }

    static async getPostById(postId) {
        try {
            console.log(`🔍 [PostService] Fetching post with ID: ${postId}`);
            console.log(`🌐 [PostService] Making request to: ${this.BASE_URL}/post/${postId}`);
            
            const headers = this.getHeader();
            console.log(`🔑 [PostService] Request headers:`, headers);

            const response = await axios.get(
                `${this.BASE_URL}/post/${postId}`,
                { 
                    headers: headers,
                    timeout: 10000 // 10 second timeout
                }
            );

            console.log(`✅ [PostService] Response received:`, {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            return response.data;

        } catch (error) {
            console.error(`❌ [PostService] Error fetching post ${postId}:`, {
                error: error,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });
            throw this.handleError(error);
        }
    }

    static async getPost(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/post/${postId}`,
                { headers: this.getHeader() }
            );

            return response.data;

        } catch (error) {
            console.error("Error fetching post:", error);
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

    static async getAllPosts() {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/post/get-all`,
                { headers: this.getHeader() }
            );

            return response.data;

        } catch (error) {
            console.error("Error fetching all posts:", error);
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

    static handleError(error) {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || error.response.data?.error || "An error occurred";
            const status = error.response.status;
            
            const customError = new Error(message);
            customError.status = status;
            customError.data = error.response.data;
            return customError;
            
        } else if (error.request) {
            // Request was made but no response received
            const customError = new Error("Network error. Please check your connection.");
            customError.status = 0;
            return customError;
            
        } else {
            // Something else happened
            const customError = new Error(error.message || "An unexpected error occurred");
            customError.status = 500;
            return customError;
        }
    }
}