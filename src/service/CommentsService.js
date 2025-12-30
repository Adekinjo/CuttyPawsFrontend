import axios from "axios";
import ApiService from "./ApiService";

export default class CommentService extends ApiService {

    // ---------------------------------------------------------
    // CREATE COMMENT / REPLY
    // POST /comments/create
    // ---------------------------------------------------------
    static async createComment(data) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/comments/create`,
                data,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating comment:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // UPDATE COMMENT
    // PUT /comments/{id}
    // ---------------------------------------------------------
    static async updateComment(commentId, data) {
        try {
            const response = await axios.put(
                `${this.BASE_URL}/comments/${commentId}`,
                data,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating comment:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // DELETE COMMENT
    // DELETE /comments/{id}
    // ---------------------------------------------------------
    static async deleteComment(commentId) {
        try {
            const response = await axios.delete(
                `${this.BASE_URL}/comments/${commentId}`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // GET PAGINATED COMMENTS FOR POST
    // GET /comments/post/{postId}?page=&size=
    // ---------------------------------------------------------
    static async getCommentsByPostId(postId, page = 0, size = 20) {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? this.getHeader() : {};

            const response = await axios.get(
                `${this.BASE_URL}/comments/post/${postId}?page=${page}&size=${size}`,
                { headers }
            );
            return response.data;

        } catch (error) {
            console.error("Error fetching comments:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // GET SINGLE COMMENT
    // GET /comments/{id}
    // ---------------------------------------------------------
    static async getCommentById(commentId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/comments/${commentId}`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching comment:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // LIKE COMMENT
    // POST /comments/{id}/like
    // ---------------------------------------------------------
    static async likeComment(commentId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/comments/${commentId}/like`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error liking comment:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // UNLIKE COMMENT
    // POST /comments/{id}/unlike
    // ---------------------------------------------------------
    static async unlikeComment(commentId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/comments/${commentId}/unlike`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error unliking comment:", error);
            throw this.handleError(error);
        }
    }


    // In CommentService.js - update the reactToComment method
    static async reactToComment(commentId, emoji) {
        try {
            // Ensure emoji is properly encoded for URL
            const encodedEmoji = encodeURIComponent(emoji);
            
            const response = await axios.post(
                `${this.BASE_URL}/comments/${commentId}/react?emoji=${encodedEmoji}`,
                {},
                { 
                    headers: this.getHeader(),
                    // Add charset to ensure proper encoding
                    transformRequest: [(data, headers) => {
                        if (headers) {
                            headers['Content-Type'] = 'application/json; charset=utf-8';
                        }
                        return data;
                    }]
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error reacting to comment:", error);
            
            // Handle specific errors
            if (error.response?.status === 400) {
                const customError = new Error("Invalid emoji format");
                customError.status = 400;
                customError.code = "INVALID_EMOJI";
                throw customError;
            }
            
            if (error.response?.status === 409) {
                const customError = new Error("Reaction already exists");
                customError.status = 409;
                customError.code = "DUPLICATE_REACTION";
                throw customError;
            }
            
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // REMOVE EMOJI REACTION
    // DELETE /comments/{id}/react?emoji=
    // ---------------------------------------------------------
    static async removeReaction(commentId, emoji) {
        try {
            const response = await axios.delete(
                `${this.BASE_URL}/comments/${commentId}/react?emoji=${encodeURIComponent(emoji)}`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error removing reaction:", error);
            throw this.handleError(error);
        }
    }

    // In CommentService.js - add this method
    static async getUserReaction(commentId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/comments/${commentId}/user-reaction`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching user reaction:", error);
            throw this.handleError(error);
        }
    }

    // ---------------------------------------------------------
    // ERROR HANDLER
    // ---------------------------------------------------------
    static handleError(error) {
        if (error.response) {
            const backendMessage = error.response.data?.message || 
                                 error.response.data?.error || 
                                 "An error occurred";
            
            // Handle JWT expiration errors
            if (backendMessage.includes('JWT expired') || backendMessage.includes('JWT signature does not match')) {
                const customError = new Error("Your session has expired. Please log in again.");
                customError.status = 401;
                customError.code = "JWT_EXPIRED";
                return customError;
            }
            
            const customError = new Error(backendMessage);
            customError.status = error.response.status;
            customError.data = error.response.data;
            return customError;
            
        } else if (error.request) {
            const customError = new Error("Network error. Please check your connection.");
            customError.status = 0;
            customError.code = "NETWORK_ERROR";
            return customError;
            
        } else {
            const customError = new Error(error.message || "An unexpected error occurred");
            customError.status = 500;
            customError.code = "UNKNOWN_ERROR";
            return customError;
        }
    }
}