import ApiService from "./ApiService";

export default class UserProfileService extends ApiService {

    static async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.BASE_URL}/users/${userId}/profile`, {
                headers: this.getHeader(),
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    static async getUserPosts(userId) {
        try {
            const response = await fetch(`${this.BASE_URL}/users/${userId}/posts`, {
                headers: this.getHeader(),
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching user posts:", error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const response = await fetch(`${this.BASE_URL}/users/${userId}/stats`, {
                headers: this.getHeader(),
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching user stats:", error);
            throw error;
        }
    }

    static async blockUser(userId, reason) {
        try {
            const response = await fetch(`${this.BASE_URL}/users/${userId}/block?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: this.getHeader(),
            });
            return await response.json();
        } catch (error) {
            console.error("Error blocking user:", error);
            throw error;
        }
    }

    static async unblockUser(userId) {
        try {
            const response = await fetch(`${this.BASE_URL}/users/${userId}/unblock`, {
                method: 'POST',
                headers: this.getHeader(),
            });
            return await response.json();
        } catch (error) {
            console.error("Error unblocking user:", error);
            throw error;
        }
    }
    // New method to get user's followers and following
    static async getUserFollowData(userId) {
        try {
            const [followersResponse, followingResponse, statsResponse] = await Promise.all([
                this.getFollowers(userId),
                this.getFollowing(userId),
                this.getFollowStats(userId)
            ]);
            
            return {
                followers: followersResponse.followersList || [],
                following: followingResponse.followingList || [],
                stats: statsResponse.followStats || {}
            };
        } catch (error) {
            console.error("Error fetching user follow data:", error);
            throw error;
        }
    }

    // Helper methods that use FollowService
    static async getFollowers(userId, page = 0, size = 20) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/followers`,
                {
                    params: { page, size },
                    headers: this.getHeader(),
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching followers:", error);
            throw error;
        }
    }

    static async getFollowing(userId, page = 0, size = 20) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/following`,
                {
                    params: { page, size },
                    headers: this.getHeader(),
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching following:", error);
            throw error;
        }
    }

    static async getFollowStats(userId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/follow/${userId}/stats`,
                {
                    headers: this.getHeader(),
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching follow stats:", error);
            throw error;
        }
    }
}