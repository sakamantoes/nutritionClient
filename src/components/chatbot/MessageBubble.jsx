// src/components/chatbot/MessageBubble.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            isBot 
              ? 'bg-primary-100 dark:bg-primary-900/30' 
              : 'bg-secondary-100 dark:bg-secondary-900/30'
          }`}>
            {isBot ? (
              <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            ) : (
              <User className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div>
          <div className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
              : 'bg-primary-500 text-white rounded-tr-none'
          }`}>
            <p className="text-sm md:text-base">{message.text}</p>
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isBot ? 'text-gray-500 dark:text-gray-400' : 'text-primary-100'
            }`}>
              {format(new Date(message.timestamp), 'h:mm a')}
            </div>
          </div>

          {/* Feedback for bot messages */}
          {isBot && (
            <div className="flex items-center space-x-2 mt-2">
              <button className="p-1 text-gray-400 hover:text-success transition-colors">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-danger transition-colors">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;