import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  Image as ImageIcon,
  X,
  Zap,
  Brain,
  MessageSquare
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import MessageBubble from '../components/chatbot/MessageBubble';
import QuickQuestions from '../components/chatbot/QuickQuestions';

const Chatbot = () => {
  const { user } = useAuth();
  const {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    handleQuickQuestion,
    quickQuestions,
    messagesEndRef,
    isLoading,
  } = useChatbot(user?.id);

  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => {
          sendMessage(transcript);
        }, 500);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Nutrition Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized nutrition advice 24/7
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Zap className="h-4 w-4 mr-1 text-warning" />
              Powered by AI
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Brain className="h-4 w-4 mr-1 text-primary-500" />
              Machine Learning
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Container */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      NutriAI Assistant
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isTyping ? 'Typing...' : 'Online • Ready to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickQuestions(!showQuickQuestions)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showQuickQuestions ? 'Hide' : 'Show'} Questions
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <AnimatePresence>
              {showQuickQuestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <QuickQuestions onSelect={handleQuickQuestion} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about nutrition, exercise, or health..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[60px] max-h-[120px]"
                    rows="1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleVoiceInput}
                    className="p-3 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    title="Voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    className="p-3 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    title="Upload image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading || isTyping}
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Capabilities Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                What I Can Do
              </h3>
              <div className="space-y-4">
                {[
                  { icon: '🍎', title: 'Nutrition Analysis', desc: 'Analyze food nutrients and health impact' },
                  { icon: '📋', title: 'Meal Planning', desc: 'Create personalized meal plans' },
                  { icon: '💪', title: 'Exercise Advice', desc: 'Recommend workouts based on goals' },
                  { icon: '🎯', title: 'Goal Setting', desc: 'Help set and track health goals' },
                  { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your health journey' },
                  { icon: '🧠', title: 'Education', desc: 'Explain nutrition concepts' },
                ].map((capability, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-2xl">{capability.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {capability.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {capability.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Tips Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
              <h3 className="text-xl font-bold mb-4">
                Pro Tips
              </h3>
              <div className="space-y-3">
                {[
                  'Ask specific questions for better answers',
                  'Share your goals for personalized advice',
                  'Upload food photos for instant analysis',
                  'Ask about meal timing and frequency',
                  'Inquire about supplements and vitamins',
                ].map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="h-2 w-2 rounded-full bg-white/50 mt-1.5"></div>
                    <p className="text-sm opacity-90">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Conversations */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Topics
              </h3>
              <div className="space-y-3">
                {[
                  'Protein intake for muscle gain',
                  'Healthy breakfast ideas',
                  'Weight loss plateau',
                  'Meal prep strategies',
                  'Hydration guidelines',
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(topic + '?')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {topic}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to continue conversation
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;