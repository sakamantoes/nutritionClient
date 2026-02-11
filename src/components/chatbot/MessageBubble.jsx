// src/components/chatbot/MessageBubble.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  // Format timestamp
  const formattedTime = message.timestamp 
    ? format(new Date(message.timestamp), 'h:mm a')
    : format(new Date(), 'h:mm a');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
            isBot 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' 
              : 'bg-gradient-to-r from-secondary-500 to-secondary-600'
          }`}>
            {isBot ? (
              <Bot className="h-4 w-4 text-green-400" />
            ) : (
              <User className="h-4 w-4 text-green-400" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isBot
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none shadow-sm'
            }`}
          >
            <p className="text-sm md:text-base whitespace-pre-wrap break-words">
              {message.text}
            </p>
            
            {/* Timestamp */}
            <div className={`flex items-center justify-end mt-1 space-x-1 ${
              isBot ? 'text-gray-400 dark:text-gray-500' : 'text-indigo-100'
            }`}>
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Feedback for bot messages */}
          {isBot && (
            <div className="flex items-center space-x-2 mt-1 ml-1">
              <button 
                className="p-1 text-gray-400 hover:text-success hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button 
                className="p-1 text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;