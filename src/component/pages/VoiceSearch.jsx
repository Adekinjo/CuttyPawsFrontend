import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const VoiceSearch = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(false);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
  };

  const startListening = () => {
    if (!isSupported) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      
      // Set timeout to stop listening after 5 seconds if no speech detected
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening();
          alert("No speech detected. Please try again.");
        }
      }, 5000);
    };

    recognition.onresult = (event) => {
      // Clear the timeout since speech was detected
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const transcript = event.results[0][0].transcript;
      stopListening();
      
      if (transcript && transcript.trim() !== "") {
        onSearch(transcript);
      } else {
        alert("No speech detected. Please try again.");
      }
    };

    recognition.onerror = (event) => {
      // Clear the timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      stopListening();
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access to use voice search.");
      } else if (event.error === "no-speech") {
        alert("No speech detected. Please try again.");
      } else if (event.error !== "aborted") {
        alert("Voice recognition error. Please try again.");
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.onspeechstart = () => {
      // Clear timeout when speech starts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "not-allowed",
          opacity: 0.5,
        }}
        title="Voice search not supported"
        disabled
      >
        <FaMicrophoneSlash size={20} color="gray" />
      </button>
    );
  }

  return (
    <button
      onClick={startListening}
      style={{
        background: "none",
        margin: 0,
        padding: 0,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isListening ? "red" : "darkblue",
      }}
      disabled={isListening}
      title={isListening ? "Listening..." : "Voice Search"}
    >
      {isListening ? (
        <div style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "red",
          animation: "pulse 1.5s infinite"
        }} />
      ) : (
        <FaMicrophone size={20} />
      )}
      
      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </button>
  );
};

export default VoiceSearch;