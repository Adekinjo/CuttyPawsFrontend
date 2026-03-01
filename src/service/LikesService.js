import axios from "axios";
import ApiService from "./ApiService";

export default class PostLikeService extends ApiService {
    static ReactionType = {
        PAWPRINT: 'PAWPRINT',
        COOKIE: 'COOKIE',
        BONE: 'BONE',
        HEART: 'HEART'
    };

    static async reactToPost(postId, reactionType) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/likes/${postId}/react?reaction=${reactionType}`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error reacting to post:", error);
            throw this.handleError(error);
        }
    }

    static async removeReaction(postId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/likes/${postId}/remove-reaction`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error removing reaction:", error);
            throw this.handleError(error);
        }
    }

    static async getPostReactions(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/likes/${postId}/reactions`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching post reactions:", error);
            throw this.handleError(error);
        }
    }

    static async getUserReaction(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/likes/${postId}/user-reaction`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking user reaction:", error);
            throw this.handleError(error);
        }
    }

    // Keep existing methods for backward compatibility
    static async likePost(postId) {
        return this.reactToPost(postId, this.ReactionType.PAWPRINT);
    }

    static async unlikePost(postId) {
        return this.removeReaction(postId);
    }

    static async getPostLikes(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/likes/${postId}/likes`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching post likes:", error);
            throw this.handleError(error);
        }
    }

    static async getUserLikedPosts(userId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/likes/user/${userId}/liked-posts`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching user liked posts:", error);
            throw this.handleError(error);
        }
    }

    static async checkIfUserLikedPost(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/likes/${postId}/liked`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking like status:", error);
            throw this.handleError(error);
        }
    }

    static handleError(error) {
        if (error.response) {
            const backendMessage = error.response.data?.message || 
                                 error.response.data?.error || 
                                 "An error occurred";
            
            if (backendMessage.includes('JWT expired') || backendMessage.includes('JWT signature does not match')) {
                const customError = new Error("Your session has expired. Please log in again.");
                customError.status = 401;
                customError.code = "JWT_EXPIRED";
                return customError;
            }
            
            if (error.response.status === 400 && backendMessage.includes("already liked")) {
                const customError = new Error("You have already liked this post");
                customError.status = 400;
                customError.code = "ALREADY_LIKED";
                return customError;
            }
            
            if (error.response.status === 400 && backendMessage.includes("not liked")) {
                const customError = new Error("You have not liked this post");
                customError.status = 400;
                customError.code = "NOT_LIKED";
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
