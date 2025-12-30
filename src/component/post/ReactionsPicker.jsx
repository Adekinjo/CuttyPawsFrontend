import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import "./ReactionPicker.css";

const ReactionsPicker = ({ 
  onReactionSelect, 
  currentReaction, 
  onRemoveReaction,
  size = 24 
}) => {
  const [show, setShow] = useState(false);
  const [isPickerHovered, setIsPickerHovered] = useState(false);
  const containerRef = useRef(null);
  const pickerRef = useRef(null);
  const timeoutRef = useRef(null);

  const reactions = [
    { type: 'LIKE', label: 'Like', emoji: '👍', color: '#1877F2' },
    { type: 'LOVE', label: 'Love', emoji: '❤️', color: '#F02849' },
    { type: 'HAHA', label: 'Haha', emoji: '😄', color: '#F7B928' },
    { type: 'WOW', label: 'Wow', emoji: '😲', color: '#F7B928' },
    { type: 'SAD', label: 'Sad', emoji: '😢', color: '#F7B928' },
    { type: 'ANGRY', label: 'Angry', emoji: '😠', color: '#E46C47' }
  ];

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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

  const getCurrentReactionEmoji = () => {
    const current = reactions.find(r => r.type === currentReaction);
    return current ? current.emoji : '👍';
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
        }}
      >
        <span className="reaction-icon">
          {getCurrentReactionEmoji()}
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
                  className={`reaction-emoji ${isActive ? 'active' : ''}`}
                  onClick={() => handleReactionClick(reaction.type)}
                  title={reaction.label}
                  style={{ 
                    color: reaction.color,
                    '--reaction-color': reaction.color
                  }}
                >
                  {reaction.emoji}
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