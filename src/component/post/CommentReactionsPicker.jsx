import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";

const CommentReactionsPicker = ({ 
  onReactionSelect, 
  currentReactions = [],
  commentId,
  size = 20 
}) => {
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

  // Common comment reactions (emojis)
  const reactions = [
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😠', label: 'Angry' },
    { emoji: '👍', label: 'Like' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Clap' }
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  const handleReactionClick = async (emoji) => {
    onReactionSelect(emoji);
    setShow(false);
  };

  const handleButtonClick = () => {
    setShow(!show);
  };

  // Check if user has reacted with any emoji
  const hasUserReacted = currentReactions.length > 0;

  return (
    <div 
      ref={containerRef}
      className="comment-reaction-container position-relative"
      style={{ display: 'inline-block' }}
    >
      <Button
        variant="link"
        className="p-0 comment-reaction-button"
        onClick={handleButtonClick}
        style={{ 
          color: hasUserReacted ? "#F02849" : "#888",
          transition: 'all 0.2s ease',
          fontSize: `${size}px`,
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span>❤️</span>
      </Button>

      {/* Custom Picker */}
      {show && (
        <div 
          className="comment-reaction-picker position-absolute d-flex gap-1 p-2 rounded shadow-lg"
          style={{
            bottom: '100%',
            left: '0',
            marginBottom: '5px',
            zIndex: 1060,
            background: '#1e1e1e',
            border: '2px solid #444',
            animation: 'popIn 0.2s ease-out'
          }}
        >
          {reactions.map((reaction) => {
            const isActive = currentReactions.includes(reaction.emoji);
            
            return (
              <Button
                key={reaction.emoji}
                variant="link"
                className="p-1 comment-reaction-option"
                onClick={() => handleReactionClick(reaction.emoji)}
                title={reaction.label}
                style={{ 
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  color: isActive ? '#F02849' : '#ffffff',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s ease',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {reaction.emoji}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentReactionsPicker;