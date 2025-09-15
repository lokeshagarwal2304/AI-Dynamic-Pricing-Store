import React from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface ChatbotToggleProps {
  isOpen: boolean;
  onClick: () => void;
  hasNewMessage?: boolean;
}

const ChatbotToggle: React.FC<ChatbotToggleProps> = ({ 
  isOpen, 
  onClick, 
  hasNewMessage = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:focus:ring-night-accent/30 ${
        isOpen
          ? 'bg-gray-500 dark:bg-night-header hover:bg-gray-600 dark:hover:bg-night-border rotate-90'
          : 'bg-gradient-to-br from-blue-500 to-purple-600 dark:from-night-accent dark:to-purple-500 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-400 dark:hover:to-purple-400 animate-pulse'
      }`}
      title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <>
            <div className="flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
              <Sparkles className="w-3 h-3 text-white absolute -top-0.5 -right-0.5 animate-ping" />
            </div>
            
            {/* Notification badge */}
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
            
            {/* Floating particles animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ top: '20%', left: '25%', animationDelay: '0s' }}></div>
              <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ top: '70%', left: '80%', animationDelay: '1s' }}></div>
              <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ top: '40%', right: '20%', animationDelay: '2s' }}></div>
            </div>
          </>
        )}
      </div>
      
      {/* Ripple effect */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
      )}
    </button>
  );
};

export default ChatbotToggle;