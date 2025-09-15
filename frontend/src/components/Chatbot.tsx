import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import ChatbotEngine from '../services/chatbotKnowledge';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatbotEngine = useRef(new ChatbotEngine());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chatbot is first opened
      const welcomeMessage: Message = {
        id: generateId(),
        content: chatbotEngine.current.getWelcomeMessage(),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content) return;

    // Clear input
    setInputValue('');

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot typing and generate response
    simulateTyping(() => {
      const botResponse = chatbotEngine.current.generateResponse(content);
      const botMessage: Message = {
        id: generateId(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    });
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleClearChat = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      id: generateId(),
      content: chatbotEngine.current.getWelcomeMessage(),
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const formatMessageContent = (content: string) => {
    // Simple formatting for better readability
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  const quickReplies = chatbotEngine.current.getQuickReplies();

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[32rem]'
      } max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]`}
    >
      <div className="bg-white dark:bg-night-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-night-border flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-night-accent dark:to-purple-500 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                <p className="text-white/80 text-xs">
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white p-1 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleClearChat}
                className="text-white/80 hover:text-white p-1 rounded transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onToggle}
                className="text-white/80 hover:text-white p-1 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-night-bg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex max-w-xs lg:max-w-sm space-x-2 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 dark:bg-night-accent'
                          : 'bg-gradient-to-br from-purple-500 to-blue-500 dark:from-night-accent dark:to-purple-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-500 dark:bg-night-accent text-white'
                          : 'bg-white dark:bg-night-surface border border-gray-200 dark:border-night-border text-gray-800 dark:text-night-text-primary'
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content)
                        }}
                      />
                      <div
                        className={`text-xs mt-1 opacity-70 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-night-text-muted'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-xs lg:max-w-sm space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 dark:from-night-accent dark:to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-night-surface border border-gray-200 dark:border-night-border px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-night-text-muted rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-night-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-night-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-night-bg border-t border-gray-200 dark:border-night-border">
                <div className="text-xs text-gray-500 dark:text-night-text-muted mb-2">Quick questions:</div>
                <div className="flex flex-wrap gap-1">
                  {quickReplies.slice(0, 3).map((reply: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs px-2 py-1 bg-white dark:bg-night-surface border border-gray-200 dark:border-night-border text-gray-600 dark:text-night-text-secondary rounded-lg hover:bg-gray-100 dark:hover:bg-night-header transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-night-surface border-t border-gray-200 dark:border-night-border rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about AI Dynamic Pricing..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-night-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-night-accent focus:border-transparent bg-white dark:bg-night-bg text-gray-900 dark:text-night-text-primary placeholder-gray-500 dark:placeholder-night-text-muted transition-colors"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-night-accent dark:to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-400 dark:hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[2.5rem]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;