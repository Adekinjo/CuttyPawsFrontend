import { useEffect, useState } from "react";
import FeedService from "../../service/FeedService";
import PostCard from "./PostCard";
import ServiceAdCard from "../service-provider/ServiceAdsCard";
import ProductRecommendationCard from "./ProductRecommendationCard";

const MixedFeed = ({ currentUser }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await FeedService.getMixedFeed(20);
        console.debug("[MixedFeed] mixed feed response", response);
        setFeedItems(Array.isArray(response?.items) ? response.items : []);
      } catch (error) {
        console.error("[MixedFeed] Failed to load mixed feed", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          error,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) return <p>Loading feed...</p>;

  return (
    <div>
      {feedItems.map((item, index) => {
        switch (item.type) {
          case "POST":
            return (
              <PostCard
                key={`post-${item.post.id}-${index}`}
                post={item.post}
                currentUser={currentUser}
              />
            );

          case "SERVICE_AD":
            return (
              <ServiceAdCard
                key={`service-${index}`}
                serviceAd={item.serviceAd}
              />
            );

          case "PRODUCT_RECOMMENDATION":
            return (
              <ProductRecommendationCard
                key={`product-${item.product.id}-${index}`}
                product={item.product}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default MixedFeed;
