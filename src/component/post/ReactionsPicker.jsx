import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { PawPrint, Cookie, Bone, Heart } from "lucide-react";
import "./ReactionPicker.css";

const ReactionsPicker = ({ 
  onReactionSelect, 
  currentReaction, 
  onRemoveReaction,
  size = 24 
}) => {
  const [show, setShow] = useState(false);
  const [isPickerHovered, setIsPickerHovered] = useState(false);
  const [animatedReaction, setAnimatedReaction] = useState(null);
  const containerRef = useRef(null);
  const pickerRef = useRef(null);
  const timeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  const reactions = [
    { type: "PAWPRINT", label: "Pawprint", icon: PawPrint, color: "#f97316", bg: "rgba(249, 115, 22, 0.14)" },
    { type: "COOKIE", label: "Cookie", icon: Cookie, color: "#d97706", bg: "rgba(217, 119, 6, 0.14)" },
    { type: "BONE", label: "Bone", icon: Bone, color: "#0f766e", bg: "rgba(15, 118, 110, 0.14)" },
    { type: "HEART", label: "Heart", icon: Heart, color: "#e11d48", bg: "rgba(225, 29, 72, 0.14)" },
  ];

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target) &&
        containerRef.current && 
        !containerRef.current.contains(event.target)
      ) {
        setShow(false);
        setIsPickerHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionClick = (reactionType) => {
    setAnimatedReaction(reactionType);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatedReaction(null);
    }, 420);

    if (currentReaction === reactionType) {
      onRemoveReaction?.();
    } else {
      onReactionSelect(reactionType);
    }
    setShow(false);
    setIsPickerHovered(false);
  };

  const handleContainerMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(true);
  };

  const handleContainerMouseLeave = () => {
    // Don't close immediately if picker is hovered
    if (!isPickerHovered) {
      timeoutRef.current = setTimeout(() => {
        setShow(false);
      }, 300);
    }
  };

  const handlePickerMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPickerHovered(true);
  };

  const handlePickerMouseLeave = () => {
    setIsPickerHovered(false);
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 300);
  };

  const handleButtonClick = () => {
    if (currentReaction) {
      onRemoveReaction?.();
    } else {
      setShow(!show);
    }
  };

  const currentReactionData = reactions.find(r => r.type === currentReaction);

  return (
    <div 
      ref={containerRef}
      className="reaction-picker-wrapper"
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <Button
        variant="link"
        className="reaction-trigger"
        onClick={handleButtonClick}
        style={{ 
          color: currentReactionData?.color || "var(--text-secondary)",
          fontSize: `${size}px`,
          backgroundColor: currentReactionData?.bg || undefined,
        }}
      >
        <span className={`reaction-icon ${animatedReaction && currentReactionData?.type === animatedReaction ? "is-shaking" : ""}`}>
          {currentReactionData ? (
            <currentReactionData.icon size={size - 1} strokeWidth={2.3} />
          ) : (
            <PawPrint size={size - 1} strokeWidth={2.3} />
          )}
        </span>
      </Button>

      {/* Reactions Picker - POSITIONED BELOW */}
      {show && (
        <div 
          ref={pickerRef}
          className="reactions-picker-popup"
          onMouseEnter={handlePickerMouseEnter}
          onMouseLeave={handlePickerMouseLeave}
        >
          <div className="picker-arrow"></div>
          <div className="reactions-list">
            {reactions.map((reaction) => {
              const isActive = currentReaction === reaction.type;
              
              return (
                <button
                  key={reaction.type}
                  className={`reaction-emoji ${isActive ? 'active' : ''} ${animatedReaction === reaction.type ? "is-shaking" : ""}`}
                  onClick={() => handleReactionClick(reaction.type)}
                  title={reaction.label}
                  style={{ 
                    color: reaction.color,
                    '--reaction-color': reaction.color,
                    '--reaction-bg': reaction.bg
                  }}
                >
                  <reaction.icon size={20} strokeWidth={2.3} />
                  <span className="reaction-tooltip">{reaction.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionsPicker;
