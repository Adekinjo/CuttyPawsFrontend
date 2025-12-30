import ApiService from "./ApiService";
import axios from "axios";

export default class FollowService extends ApiService {
    
    // Follow a user
    static async followUser(userId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/follow/${userId}`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error following user:", error);
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || "Failed to follow user",
                success: false
            };
        }
    }

    // Unfollow a user
    static async unfollowUser(userId) {
        try {
            const response = await axios.delete(
                `${this.BASE_URL}/follow/${userId}`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error unfollowing user:", error);
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || "Failed to unfollow user",
                success: false
            };
        }
    }

    // Get follow stats for a user
    static async getFollowStats(userId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/stats`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching follow stats:", error);
            return {
                status: 200,
                success: true,
                followStats: {
                    userId: userId,
                    followersCount: 0,
                    followingCount: 0,
                    isFollowing: false,
                    isFollowedBy: false
                }
            };
        }
    }

        // In FollowService.js - getFollowers method
    static async getFollowers(userId, page = 0, size = 20) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/followers`,
                {
                    params: { page, size },
                    headers: this.getHeader(),
                }
            );
            
            // Debug: Log the response to see the actual data structure
            console.log('Followers response:', response.data);
            
            // Transform the response - handle different data structures
            if (response.data && response.data.followersList) {
                const transformedData = {
                    ...response.data,
                    followersList: response.data.followersList.map(follow => {
                        // Extract user from different possible structures
                        const user = follow.follower || follow.user || follow;
                        return {
                            ...user,
                            followId: follow.id,
                            createdAt: follow.createdAt,
                            isMuted: follow.isMuted
                        };
                    })
                };
                return transformedData;
            }
            
            return response.data;
        } catch (error) {
            console.error("Error fetching followers:", error);
            return {
                status: 200,
                success: true,
                followersList: []
            };
        }
    }

    // In FollowService.js - getFollowing method
    static async getFollowing(userId, page = 0, size = 20) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/following`,
                {
                    params: { page, size },
                    headers: this.getHeader(),
                }
            );
            
            // Debug: Log the response to see the actual data structure
            console.log('Following response:', response.data);
            
            // Transform the response - handle different data structures
            if (response.data && response.data.followingList) {
                const transformedData = {
                    ...response.data,
                    followingList: response.data.followingList.map(follow => {
                        // Extract user from different possible structures
                        const user = follow.following || follow.user || follow;
                        return {
                            ...user,
                            followId: follow.id,
                            createdAt: follow.createdAt,
                            isMuted: follow.isMuted
                        };
                    })
                };
                return transformedData;
            }
            
            return response.data;
        } catch (error) {
            console.error("Error fetching following:", error);
            return {
                status: 200,
                success: true,
                followingList: []
            };
        }
    }

    // Check follow status between current user and target user
    static async checkFollowStatus(targetUserId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${targetUserId}/status`,
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking follow status:", error);
            return {
                status: 200,
                success: true,
                followStats: {
                    isFollowing: false,
                    isFollowedBy: false
                }
            };
        }
    }

    // Mute a user
    static async muteUser(userId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/follow/${userId}/mute`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error muting user:", error);
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || "Failed to mute user",
                success: false
            };
        }
    }

    // Unmute a user
    static async unmuteUser(userId) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/follow/${userId}/unmute`,
                {},
                { headers: this.getHeader() }
            );
            return response.data;
        } catch (error) {
            console.error("Error unmuting user:", error);
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || "Failed to unmute user",
                success: false
            };
        }
    }

    // Get mutual followers
    static async getMutualFollowers(userId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/mutual`,
                { headers: this.getHeader() }
            );
            
            // Transform if needed (similar to getFollowers/getFollowing)
            if (response.data && response.data.followingList) {
                const transformedData = {
                    ...response.data,
                    followingList: response.data.followingList.map(follow => ({
                        ...follow.following,
                        followId: follow.id,
                        createdAt: follow.createdAt
                    }))
                };
                return transformedData;
            }
            
            return response.data;
        } catch (error) {
            console.error("Error fetching mutual followers:", error);
            return {
                status: 200,
                success: true,
                followingList: []
            };
        }
    }

    // Optional: Helper method to check if current user can follow another user
    static async canFollow(targetUserId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (!currentUser.id) {
                return { canFollow: false, reason: "Not authenticated" };
            }
            
            if (currentUser.id === targetUserId) {
                return { canFollow: false, reason: "Cannot follow yourself" };
            }
            
            const status = await this.checkFollowStatus(targetUserId);
            return { 
                canFollow: !status.followStats?.isFollowing,
                isFollowing: status.followStats?.isFollowing 
            };
        } catch (error) {
            console.error("Error checking if can follow:", error);
            return { canFollow: true }; // Default to allowing follow on error
        }
    }
}