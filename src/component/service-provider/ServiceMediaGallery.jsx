import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import "../../style/ServiceMediaGallery.css";

function renderMedia(item, title, className) {
  if (!item) return null;

  if (item.type === "VIDEO") {
    return (
      <video className={className} src={item.url} controls playsInline preload="metadata" />
    );
  }

  return <img className={className} src={item.url} alt={item.alt || title} loading="lazy" />;
}

export default function ServiceMediaGallery({
  media = [],
  title = "Service media",
  compact = false,
  emptyLabel = "No service media uploaded yet.",
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!media.length) {
    return (
      <div className={`service-media-gallery service-media-gallery-empty${compact ? " is-compact" : ""}`}>
        <span>{emptyLabel}</span>
      </div>
    );
  }

  const activeIndex = media[selectedIndex] ? selectedIndex : 0;
  const selectedItem = media[activeIndex];

  return (
    <div className={`service-media-gallery${compact ? " is-compact" : ""}`}>
      <div className="service-media-stage">
        {renderMedia(selectedItem, title, "service-media-stage-item")}
        {selectedItem?.isCover ? <span className="service-media-cover-badge">Cover</span> : null}
      </div>

      {media.length > 1 ? (
        <div className="service-media-thumb-row">
          {media.map((item, index) => (
            <button
              key={item.id || `${item.url}-${index}`}
              type="button"
              className={`service-media-thumb${index === activeIndex ? " is-active" : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View ${item.type === "VIDEO" ? "video" : "image"} ${index + 1}`}
            >
              {item.type === "VIDEO" ? (
                <>
                  <video className="service-media-thumb-item" src={item.thumbnailUrl || item.url} muted playsInline preload="metadata" />
                  <span className="service-media-thumb-play">
                    <FaPlay />
                  </span>
                </>
              ) : (
                <img className="service-media-thumb-item" src={item.thumbnailUrl || item.url} alt={item.alt || title} loading="lazy" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
