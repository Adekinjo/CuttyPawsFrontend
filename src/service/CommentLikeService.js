import axios from "axios";
import ApiService from "./ApiService";

export default class CommentLikeService extends ApiService {
    static ReactionType = {
        LIKE: 'LIKE',
        LOVE: 'LOVE', 
        HAHA: 'HAHA',
        WOW: 'WOW',
        SAD: 'SAD',
        ANGRY: 'ANGRY'
    };

    static async reactToComment(commentId, reactionType) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/comments/${commentId}/react?reaction=${reactionType}`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error reacting to comment:", error);
            throw this.handleError(error);
        }
    }

    static async removeReaction(commentId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/comments/${commentId}/remove-reaction`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error removing reaction from comment:", error);
            throw this.handleError(error);
        }
    }

    static async getCommentReactions(commentId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/comments/${commentId}/reactions`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching comment reactions:", error);
            throw this.handleError(error);
        }
    }

    static async getUserReaction(commentId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/comments/${commentId}/user-reaction`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking user reaction to comment:", error);
            throw this.handleError(error);
        }
    }

    // Simple like/unlike methods
    static async likeComment(commentId) {
        return this.reactToComment(commentId, this.ReactionType.LIKE);
    }

    static async unlikeComment(commentId) {
        return this.removeReaction(commentId);
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